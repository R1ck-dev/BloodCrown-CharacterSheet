# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Summary

BloodCrown is a full-stack character sheet manager for a homebrew tabletop RPG system. The backend is a Spring Boot 4 (Java 21) REST API with JWT-based stateless auth and JPA/MySQL persistence, organized in hexagonal / clean architecture (ports & adapters). The frontend is a single-page React 19 app (Vite + TypeScript) talking to that API. The whole stack is orchestrated by `docker-compose.yml`. Production frontend is hosted on Netlify (`bloodcrown.netlify.app`); production API is on Render.

User-facing strings, comments, and commit messages are in Portuguese (BR). Match that style when editing.

A radical UI/UX refactor was completed in May 2026 (Fases 1-7). Migrou do front vanilla JS multi-page pra React 19 + Vite + TS SPA com design "grimório gótico-ritual" (filigrana, escudo SVG, medalhões esculpidos, dice toast animado com confetti dourado em crítico). O código legado (front vanilla em `docs/legacy-frontend/`) e o design system de referência (JSX do Claude Design em `docs/design-reference/`) foram **arquivados na branch `archive/legacy-docs`** (removidos do main pra enxugar o repo; recupere com `git checkout archive/legacy-docs -- docs/` ou `git show archive/legacy-docs:docs/...`). Plano completo e decisões em `~/.claude/projects/.../memory/project_ui_refactor_2026.md`.

O backend foi migrado de MVC em camadas para **arquitetura hexagonal + clean** (ports & adapters) em junho 2026, espelhando o padrão do projeto IFConecta — domínio isolado de framework, uma use case por operação, adapters de persistência/web na infraestrutura. O contrato HTTP/JSON e o schema do banco foram preservados na migração.

## Common Commands

All commands assume the repo root unless noted.

**Full stack (recommended):**
```bash
docker-compose up --build      # builds backend image, starts MySQL + API (8080) + nginx frontend (80)
docker-compose down            # stop; add -v to also drop the mysql_data volume
```

**Backend only (from [backend/](backend/)):**
```bash
./mvnw spring-boot:run         # run dev server on :8080 (uses application.properties)
./mvnw clean package           # produces target/*.jar
./mvnw test                    # run JUnit tests
./mvnw test -Dtest=ClassName#methodName   # run a single test
```

Use `mvnw.cmd` on Windows PowerShell. The current test suite has only the Spring Boot context-load smoke test in [BloodcrownCsApplicationTests.java](backend/src/test/java/br/com/henrique/bloodcrown_cs/BloodcrownCsApplicationTests.java).

**Frontend only (from [frontend/](frontend/)):**
```bash
npm install              # first time only
npm run dev              # Vite dev server on :5173 with HMR
npm run build            # tsc -b && vite build → dist/
npm run preview          # serve dist/ on :5173 to sanity-check the prod build
npm run typecheck        # tsc --noEmit
npm run lint             # ESLint
```

Production build goes to `frontend/dist/` and is served by nginx in the container ([Dockerfile](frontend/Dockerfile), [nginx.conf](frontend/nginx.conf) — nginx has `try_files $uri /index.html` SPA fallback for React Router).

## Architecture

### Backend — arquitetura hexagonal / clean (`br.com.henrique.bloodcrown_cs`)

Ports & adapters em três camadas, organizadas por agregado (`usuario`, `character`, `folder`):

- **[domain/](backend/src/main/java/br/com/henrique/bloodcrown_cs/domain/)** — núcleo sem dependência de framework. `model/` traz POJOs puros (sem JPA/Spring; Lombok só `@Getter/@Setter` em value objects e sub-entidades); `port/` define as interfaces de saída (repositórios + portas de capacidade como `PasswordEncoderPort`/`TokenServicePort`/`AuthenticationPort`); `enums/`; e `shared/exception/` (`NotFoundException`→404, `ForbiddenException`→403, `BadRequestException`→400). **[Character](backend/src/main/java/br/com/henrique/bloodcrown_cs/domain/character/model/Character.java) é um agregado rico**: dono de `attacks`/`abilities`/`items`/`customSkills` e dos value objects (`Attributes`/`Status`/`Expertise`/`ActionPool`), com toda regra de jogo como método de domínio (`rest()`, `advanceTurn()`, `toggleAbility()`, `recoverAbilityUse()`, `applyPatch()`, …). IDs são gerados no domínio (UUID), então as entidades JPA **não** usam `@GeneratedValue`.
- **[application/](backend/src/main/java/br/com/henrique/bloodcrown_cs/application/)** — **uma use case por operação** (`@Service` + método `execute(...)`), dependendo só de portas do domínio. Layout `<agg>/usecase/` + `<agg>/dto/` (inputs). Ex.: `CriarPersonagemUseCase`, `AlternarHabilidadeUseCase`, `DeletarPastaUseCase`. Validação de posse e transações (`@Transactional`) ficam aqui; a regra de negócio mora no domínio.
- **[infrastructure/](backend/src/main/java/br/com/henrique/bloodcrown_cs/infrastructure/)**:
  - `config/{security,exception,cache}` — `SecurityConfig`, `JwtAuthenticationFilter` e os adapters de segurança; `GlobalExceptionHandler` (`@RestControllerAdvice` → body `{ "message": ... }`); `CacheConfig` (Caffeine).
  - `persistence/<agg>/{entity,repository,mapper,adapter}` — entidades JPA `*JpaEntity` **separadas** do domínio (preservam tabelas/colunas do schema legado, embeddables em `entity/embeddable/`), `SpringData*Repository`, **mappers manuais** (`toEntity`/`toDomain`, sem MapStruct, `EntityManager.getReference` nas FKs) e `*RepositoryAdapter` implementando a porta. Salvar o agregado = `springRepo.save(mapper.toEntity(domain))`: o merge reconstrói o grafo e o `orphanRemoval` apaga filhos ausentes. `CharacterRepository` tem finders por id de filho (`buscarPorHabilidadeIdEUsuario`, …) pra carregar a raiz a partir do id de um ataque/habilidade/item/perícia.
  - `web/<agg>/{controller,dto}` — `@RestController`s nas rotas `/auth`, `/characters`, `/attacks`, `/abilities`, `/items`, `/custom-skills`, `/folders`. Pegam o `userId` via `@AuthenticationPrincipal String userId` e mapeiam DTO web ↔ domínio (`CharacterWebMapper`). Os `*Dto`/`*Response` mantêm os mesmos shapes JSON do front — **contrato congelado na migração** (ver `frontend/src/types/`).

### Auth model

Stateless JWT. O front guarda o token no `localStorage` após `POST /auth/login` e manda `Authorization: Bearer <token>` em toda chamada protegida. O **principal é o `userId` (String)**, setado pelo [JwtAuthenticationFilter](backend/src/main/java/br/com/henrique/bloodcrown_cs/infrastructure/config/security/JwtAuthenticationFilter.java) a partir do claim `id` do token — **não** existe `AuthenticationManager`/`UserDetailsService`, e o domínio `User` não implementa `UserDetails`. O login passa por `AutenticarUsuarioUseCase` → `AuthenticationPort` (carrega o usuário pela porta de repositório e compara a senha via BCrypt; credencial inválida → **400** com `{ "message": ... }`) → `TokenServicePort`/[JwtTokenAdapter](backend/src/main/java/br/com/henrique/bloodcrown_cs/infrastructure/config/security/JwtTokenAdapter.java) (auth0 `java-jwt`, HS256, issuer `bloodcrown-cs`, expiry 5h em UTC-3, claims `id`/`role`).

Rotas públicas (`permitAll`) em [SecurityConfig](backend/src/main/java/br/com/henrique/bloodcrown_cs/infrastructure/config/security/SecurityConfig.java): `POST /auth/register`, `POST /auth/login`, `OPTIONS /**` (preflight CORS) e `GET /actuator/health`; o resto exige autenticação.

CORS liberado para `localhost` (nginx default), `localhost:5173` (Vite), `localhost:5500` (Live Server legado), `localhost:8080` (self-call), os equivalentes `127.0.0.1` e `https://bloodcrown.netlify.app` — a lista vem da property `app.cors.allowed-origins` (CSV em [application.properties](backend/src/main/resources/application.properties), sobrescrevível em prod via env `APP_CORS_ALLOWED_ORIGINS`), lida por `corsConfigurationSource()` em [SecurityConfig](backend/src/main/java/br/com/henrique/bloodcrown_cs/infrastructure/config/security/SecurityConfig.java). Pra adicionar origem, edite a property (não o código). PATCH continua explícito em `allowedMethods` no `SecurityConfig`.

### Frontend (React SPA — pós-Fase 1)

Single-page React 19 app under [frontend/src/](frontend/src/):

- **[src/api/](frontend/src/api/)** — HTTP client + TanStack Query hooks, co-localizados (`characters.ts` exporta `useCharacters`, `useCreateCharacter`, etc.). [client.ts](frontend/src/api/client.ts) faz auto-detect de ambiente (`localhost` → `http://localhost:8080`, demais → Render), gerencia o token JWT (`tokenStorage`) e trata 401 via handler injetável.
- **[src/types/](frontend/src/types/)** — interfaces TS mirroring os DTOs Java do backend. Manter sincronizado quando DTOs mudarem.
- **[src/pages/](frontend/src/pages/)** — uma página por rota (`LoginPage`, `RegisterPage`, `DashboardPage`, `SheetPage`). Atualmente stubs após Fase 1; UI real entra nas Fases 3-7.
- **[src/components/](frontend/src/components/)** — `ErrorBoundary`, `auth/ProtectedRoute`. Fase 2 popula `ornaments/`, `ui/`, `sheet/`.
- **[src/hooks/](frontend/src/hooks/)** — hooks de UI/domínio (`useAutoSave`, `useDiceRoll`, `useActiveEffects` — entram nas Fases 5-7). API state mora em `src/api/`, não aqui.
- **[src/lib/](frontend/src/lib/)** — utilitários puros (`queryClient.ts` já; `dice.ts` na Fase 7).
- **[src/styles/](frontend/src/styles/)** — globals + tokens + componentes `.bc-*` (Fase 2 mescla o design system de [_design-preview/stylesheeets/styles.css](frontend/_design-preview/stylesheeets/styles.css)).
- **[src/router.tsx](frontend/src/router.tsx)** — `createBrowserRouter` com `ProtectedRoute` em `/dashboard` e `/sheet/:id`.
- **[src/App.tsx](frontend/src/App.tsx)** — `QueryClientProvider` + `RouterProvider` + Sonner Toaster + ErrorBoundary; registra o handler de 401 que redireciona pra `/`.

**Stack libs:** React 19, React Router 7, TanStack Query 5, React Hook Form 7 + Zod, Framer Motion 11, Lucide React (ícones), Sonner (toasts), canvas-confetti (crítico/level up), SweetAlert2 (confirmações pesadas: deletar ficha, descanso longo). Sem Bootstrap, sem CSS-in-JS — CSS puro com classes `.bc-*`.

**Auto-save (a partir da Fase 5):** `useAutoSave` hook = React Hook Form `watch()` + debounce 1s. Substitui o `debounce` manual + `dispatchEvent` hacks do código legado.

**[frontend/_legacy/](frontend/_legacy/)** — código vanilla anterior preservado pra referência até Fase 7. Não importar daqui. `git log -- frontend/_legacy/` recupera contexto se precisar.

## Configuration & environment

- [application.properties](backend/src/main/resources/application.properties) é o profile default (MySQL local, `${DB_USER}`/`${DB_PASS}` via env, ativa profile `local`).
- [application-local.properties](backend/src/main/resources/application-local.properties) sobrescreve credenciais e fornece `jwt.secret`.
- Quando rodando via Docker Compose, o bloco `env` em [docker-compose.yml](docker-compose.yml) injeta `SPRING_DATASOURCE_*` direto, bypassando as properties pra config de DB. `jwt.secret` **não** é passado nesse env — defina antes de deploy.
- O schema é versionado por **Flyway** (migrations em [backend/src/main/resources/db/migration/](backend/src/main/resources/db/migration/): `V1__baseline_schema.sql` + `V2__...`). `spring.jpa.hibernate.ddl-auto=validate` em todos os profiles — o Hibernate só **confere** que as entidades batem com o banco no boot, nunca altera. Em prod (Aiven, já populado) o Flyway roda com `baseline-on-migrate=true` + `baseline-version=1`: no 1º boot cria a `flyway_schema_history` e marca a v1 como baseline **sem executar** o `V1__baseline_schema.sql`; o V1 só roda em banco vazio (local/CI). Toda mudança de schema agora vira uma migration nova (`V2__...`) — fim dos `ALTER TABLE` manuais. **Gotchas:** (1) o `.gitignore` ignora `*.sql`, mas tem regra de negação pra `db/migration/*.sql` — não remova; (2) o baseline foi derivado das entidades JPA, então valide o boot com `validate` contra uma cópia do schema real de prod antes de cada deploy que mexa em schema (drift de `ALTER` manuais antigos — enum `PASSIVE`, `TEXT` — quebra o boot); (3) Flyway no Spring Boot 4 exige o starter `spring-boot-starter-flyway` (só `flyway-core` não ativa a auto-config).
