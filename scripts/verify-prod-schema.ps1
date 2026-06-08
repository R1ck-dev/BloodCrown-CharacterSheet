<#
.SYNOPSIS
  Verifica, contra uma COPIA LOCAL do schema de producao, se o app sobe com Flyway
  (baseline-on-migrate) + ddl-auto=validate -- antes de promover uma mudanca de schema
  pro Aiven. Automatiza os passos 2 a 5 do roteiro de pre-deploy.

  >>> NUNCA aponta pro Aiven. Roda sempre contra uma copia local descartavel. <<<

.DESCRIPTION
  1. Voce exporta o schema de prod (so estrutura, sem dados) pelo DBeaver -> prod-schema.sql
  2. Este script: cria um database de copia, carrega o schema, builda o app, sobe ele
     contra a copia e le o log pra dar um veredito (VERDE = pode deployar / VERMELHO = drift).

.PARAMETER ProdSchemaSql
  Caminho do .sql com o schema de prod exportado do Aiven (so estrutura).

.PARAMETER MysqlPassword
  Senha do seu MySQL local. Se omitida, o script pergunta.

.EXAMPLE
  .\scripts\verify-prod-schema.ps1 -ProdSchemaSql .\prod-schema.sql -MysqlPassword 'Badeia1755!'

.EXAMPLE
  .\scripts\verify-prod-schema.ps1 -ProdSchemaSql .\prod-schema.sql -KeepCopy -SkipBuild
#>
param(
  [Parameter(Mandatory = $true)] [string]$ProdSchemaSql,
  [string]$MysqlHost = 'localhost',
  [int]$MysqlPort = 3306,
  [string]$MysqlUser = 'root',
  [string]$MysqlPassword,
  [string]$CopyDb = 'bloodcrown_prodcopy',
  [int]$AppPort = 8089,
  [switch]$SkipBuild,
  [switch]$KeepCopy
)

$ErrorActionPreference = 'Continue'  # nativos (mysql/java) escrevem em stderr; nao deixar fatal

function Fail($msg) { Write-Host "`n[ERRO] $msg" -ForegroundColor Red; exit 1 }
function Info($msg) { Write-Host $msg -ForegroundColor Cyan }
function Ok($msg)   { Write-Host $msg -ForegroundColor Green }

# ---- Paths do projeto (script vive em <repo>\scripts) ----
$repo    = Split-Path $PSScriptRoot -Parent
$backend = Join-Path $repo 'backend'
if (-not (Test-Path (Join-Path $backend 'pom.xml'))) { Fail "Nao achei o backend em $backend." }
if (-not (Test-Path $ProdSchemaSql)) { Fail "Arquivo de schema nao encontrado: $ProdSchemaSql" }
$ProdSchemaSql = (Resolve-Path $ProdSchemaSql).Path

# ---- Senha ----
if ([string]::IsNullOrEmpty($MysqlPassword)) {
  $sec = Read-Host "Senha do MySQL local ($MysqlUser@$($MysqlHost):$($MysqlPort))" -AsSecureString
  $MysqlPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec))
}

# ---- Localizar mysql.exe ----
$mysqlExe = (Get-Command mysql.exe -ErrorAction SilentlyContinue).Source
if (-not $mysqlExe) {
  $globs = @(
    "C:\Program Files\MySQL\*\bin\mysql.exe",
    "C:\Program Files (x86)\MySQL\*\bin\mysql.exe",
    "C:\xampp\mysql\bin\mysql.exe",
    "C:\wamp64\bin\mysql\*\bin\mysql.exe",
    "C:\ProgramData\MySQL\*\bin\mysql.exe"
  )
  $found = Get-ChildItem $globs -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($found) { $mysqlExe = $found.FullName }
}
if (-not $mysqlExe) {
  Fail "mysql.exe nao encontrado no PATH nem nos diretorios comuns. Adicione a pasta bin do MySQL ao PATH, ou faca os passos 2-3 no DBeaver e rode so o passo 4 manualmente."
}
Info "mysql.exe: $mysqlExe"

# ---- Localizar java ----
$java = if ($env:JAVA_HOME) { Join-Path $env:JAVA_HOME 'bin\java.exe' } else { 'java' }

# ---- Helpers MySQL (MYSQL_PWD evita o warning de senha em stderr) ----
# --protocol=TCP forca TCP: no Windows o mysql.exe com -h localhost usa named pipe e
# ignora a -P; com TCP a porta e respeitada (igual a conexao JDBC do app).
$env:MYSQL_PWD = $MysqlPassword
function Mysql-Exec($sql)   { & $mysqlExe --protocol=TCP -h $MysqlHost -P $MysqlPort -u $MysqlUser -e $sql }
function Mysql-Scalar($sql) { (& $mysqlExe --protocol=TCP -h $MysqlHost -P $MysqlPort -u $MysqlUser -N -e $sql) -join "" }

# ===== PASSO 2: criar copia vazia =====
Info "`n[2/5] Criando database de copia '$CopyDb' (drop + create)..."
Mysql-Exec "DROP DATABASE IF EXISTS $CopyDb; CREATE DATABASE $CopyDb CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;"
if ($LASTEXITCODE -ne 0) { Fail "Falha ao criar o database. Cheque host/porta/usuario/senha do MySQL local." }

# ===== PASSO 3: carregar o schema de prod =====
Info "[3/5] Carregando o schema de prod ($([IO.Path]::GetFileName($ProdSchemaSql))) na copia..."
# Saneia o dump do DBeaver/Aiven:
#  - remove CREATE/DROP DATABASE e USE (carregamos na copia, nao no 'defaultdb' do Aiven);
#  - habilita ANSI_QUOTES: o Aiven roda com esse sql_mode, entao o dump vem com "aspas duplas"
#    nos identificadores. Com ANSI_QUOTES o MySQL local aceita (backticks tambem seguem validos).
$schemaLines = Get-Content $ProdSchemaSql | Where-Object {
  $_ -notmatch '^\s*CREATE\s+DATABASE' -and $_ -notmatch '^\s*DROP\s+DATABASE' -and $_ -notmatch '^\s*USE\s'
}
# FOREIGN_KEY_CHECKS=0: tolera FKs inline em ordem alfabetica de tabela (DBeaver costuma
# emitir assim, sem ordenar por dependencia) sem falhar com "tabela ainda nao existe".
$schemaSql = "SET SESSION sql_mode='ANSI_QUOTES';`r`nSET FOREIGN_KEY_CHECKS=0;`r`n" + ($schemaLines -join "`r`n")
$schemaSql | & $mysqlExe --protocol=TCP -h $MysqlHost -P $MysqlPort -u $MysqlUser $CopyDb
if ($LASTEXITCODE -ne 0) { Fail "Falha ao carregar o schema. Veja o erro do mysql logo acima." }

$nTabs = [int](Mysql-Scalar "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$CopyDb' AND table_name<>'flyway_schema_history';")
$hasHist = [int](Mysql-Scalar "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$CopyDb' AND table_name='flyway_schema_history';")
Info "    -> $nTabs tabela(s) carregada(s); flyway_schema_history presente? $([bool]$hasHist)"
if ($nTabs -lt 1) { Fail "Nenhuma tabela carregada - o dump nao criou nada. Confira o export do DBeaver (estrutura/DDL)." }
if ($hasHist) { Write-Host "    AVISO: a copia ja tem flyway_schema_history. O ideal e exportar SO as tabelas de dominio." -ForegroundColor Yellow }

# ===== PASSO 4: build + subir o app contra a copia =====
$jar = Get-ChildItem "$backend\target\bloodcrown-cs-*.jar" -ErrorAction SilentlyContinue |
       Where-Object { $_.Name -notlike '*.original' } | Select-Object -First 1
if ($SkipBuild -and $jar) {
  Info "[4/5] Pulando build (-SkipBuild). Usando $($jar.Name)"
} else {
  Info "[4/5] Buildando o app (mvnw clean package -DskipTests)..."
  Push-Location $backend
  & .\mvnw.cmd clean package -DskipTests -q
  $bc = $LASTEXITCODE
  Pop-Location
  if ($bc -ne 0) { Fail "Build falhou." }
  $jar = Get-ChildItem "$backend\target\bloodcrown-cs-*.jar" | Where-Object { $_.Name -notlike '*.original' } | Select-Object -First 1
}
if (-not $jar) { Fail "Jar nao encontrado em $backend\target." }

$log = Join-Path $repo 'verify-prod-schema.app.log'
$errLog = Join-Path $repo 'verify-prod-schema.err.log'  # termina em .log -> coberto pelo .gitignore
$jdbc = "jdbc:mysql://$($MysqlHost):$($MysqlPort)/$($CopyDb)?" + 'allowPublicKeyRetrieval=true&useSSL=false&serverTimezone=UTC'
# Linha de argumentos com aspas explicitas: o caminho do jar e a URL podem conter
# espacos (ex.: "Area de Trabalho") -- o Start-Process -ArgumentList com array NAO
# poe aspas sozinho, entao montamos a string manualmente.
$q = '"'
$argLine = "-jar $q$($jar.FullName)$q " +
           "--spring.profiles.active=verify " +
           "$q--spring.datasource.url=$jdbc$q " +
           "$q--spring.datasource.username=$MysqlUser$q " +
           "$q--spring.datasource.password=$MysqlPassword$q " +
           "--spring.main.lazy-initialization=false " +
           "--jwt.secret=verifyprodschemaverifyprodschemaverifyprodschema12 " +
           "--server.port=$AppPort"
Info "    Subindo o app contra a copia (porta $AppPort)... aguarde o boot."
$p = Start-Process -FilePath $java -ArgumentList $argLine -RedirectStandardOutput $log -RedirectStandardError $errLog -PassThru -NoNewWindow

$status = "TIMEOUT"
for ($i = 0; $i -lt 90; $i++) {
  if ($p.HasExited) { $status = "EXITED_$($p.ExitCode)"; break }
  $c = Get-Content $log -ErrorAction SilentlyContinue
  if ($c | Select-String -SimpleMatch "Started BloodcrownCsApplication") { $status = "STARTED"; break }
  if ($c | Select-String -SimpleMatch "APPLICATION FAILED TO START")     { $status = "FAILED";  break }
  Start-Sleep -Seconds 2
}

# ===== PASSO 5: veredito =====
$allLog = (Get-Content $log -ErrorAction SilentlyContinue) + (Get-Content $errLog -ErrorAction SilentlyContinue)
$baselined = [bool]($allLog | Select-String -SimpleMatch "Successfully baselined schema with version: 1")
$validErr  = $allLog | Select-String -Pattern "Schema-validation|missing table|missing column|wrong column type"
$histType  = Mysql-Scalar "SELECT type FROM $($CopyDb).flyway_schema_history ORDER BY installed_rank LIMIT 1;"

Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue

Write-Host "`n=========================== VEREDITO ===========================" -ForegroundColor White
Write-Host "  boot do app .............. $status"
Write-Host "  flyway baseline .......... $(if($baselined){'SIM (V1 nao rodou)'}else{'NAO'})  | history type: $histType"
Write-Host "  erros de validate ........ $(if($validErr){'SIM'}else{'nenhum'})"

if ($status -eq "STARTED" -and -not $validErr) {
  Ok "`n  >>> VERDE: o app sobe com validate contra o schema de prod. Seguro deployar. <<<"
  Ok "      (o Flyway vai apenas baselizar o Aiven no 1o boot, sem tocar nos dados.)"
} else {
  Write-Host "`n  >>> VERMELHO: NAO deploye ainda - divergencia entre entidades e schema de prod. <<<" -ForegroundColor Red
  if ($validErr) {
    Write-Host "  Linhas relevantes (me manda isto pra eu escrever a V2__...sql):" -ForegroundColor Yellow
    $validErr | Select-Object -First 8 | ForEach-Object { "    " + $_.Line.Trim() }
  } else {
    Write-Host "  O app nao chegou a subir. Ultimas linhas do log:" -ForegroundColor Yellow
    ($allLog | Select-Object -Last 15) | ForEach-Object { "    $_" }
  }
  Write-Host "  Log completo em: $log" -ForegroundColor Yellow
}

# ===== limpeza =====
if ($KeepCopy) {
  Info "`n  Copia mantida (-KeepCopy): database '$CopyDb'."
} else {
  Mysql-Exec "DROP DATABASE IF EXISTS $CopyDb;" | Out-Null
  Info "`n  Copia '$CopyDb' removida. (Aiven intocado.)"
}
$env:MYSQL_PWD = $null
Write-Host "================================================================`n" -ForegroundColor White
