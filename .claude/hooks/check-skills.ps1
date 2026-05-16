#!/usr/bin/env pwsh
# Hook PreToolUse: lista as skills do projeto e injeta como additionalContext
# para forçar o Claude a considerá-las antes de qualquer Edit/Write/NotebookEdit.

$ErrorActionPreference = 'Stop'

$skillsDir = Join-Path (Join-Path $PSScriptRoot '..') 'skills'
$skills = @()

if (Test-Path $skillsDir) {
    Get-ChildItem -Path $skillsDir -Directory | Sort-Object Name | ForEach-Object {
        $skillMd = Join-Path $_.FullName 'SKILL.md'
        $name = $_.Name
        $desc = ''
        if (Test-Path $skillMd) {
            $content = Get-Content -Raw -LiteralPath $skillMd
            if ($content -match '(?ms)^description:\s*"?(.+?)"?\s*\r?\n') {
                $desc = $Matches[1].Trim().TrimEnd('"').TrimStart('"')
            }
        }
        if ($desc) { $skills += "- ${name}: ${desc}" } else { $skills += "- ${name}" }
    }
}

if ($skills.Count -eq 0) {
    # Sem skills cadastradas: não injeta nada, deixa o tool prosseguir.
    Write-Output '{}'
    exit 0
}

$intro = @'
ANTES de aplicar esta alteração de código, analise as skills do projeto abaixo e invoque (via a tool Skill) qualquer uma que se aplique ao tipo de mudança em curso. Não pule esta análise — escolher a skill certa é obrigatório antes de editar.

Skills disponíveis:
'@

$outro = @'

Critérios rápidos:
- Mudança em backend (Spring/JPA/segurança/APIs) -> senior-backend, senior-architect
- Mudança em frontend (HTML/CSS/JS, layout, componentes) -> ui-ux-pro-max, theme-factory
- Otimização de carregamento/runtime no front -> web-performance-optimization
- Revisão/refator de código existente -> code-reviewer
- Decisão estrutural que afeta múltiplos arquivos -> senior-architect

Se nenhuma skill se aplicar de forma honesta, prossiga normalmente. Não invoque skills só para cumprir o ritual.
'@

$ctx = $intro + "`n" + ($skills -join "`n") + "`n" + $outro

$payload = @{
    hookSpecificOutput = @{
        hookEventName     = 'PreToolUse'
        additionalContext = $ctx
    }
} | ConvertTo-Json -Depth 5 -Compress

Write-Output $payload
