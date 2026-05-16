# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Summary

BloodCrown is a full-stack character sheet manager for a homebrew tabletop RPG system. The backend is a Spring Boot 3 (Java 21) REST API with JWT-based stateless auth and JPA/MySQL persistence. The frontend is a single-page React 19 app (Vite + TypeScript) talking to that API. The whole stack is orchestrated by `docker-compose.yml`. Production frontend is hosted on Netlify (`bloodcrown.netlify.app`); production API is on Render.

User-facing strings, comments, and commit messages are in Portuguese (BR). Match that style when editing.

A radical UI/UX refactor was completed in May 2026 (Fases 1-7). Migrou do front vanilla JS multi-page pra React 19 + Vite + TS SPA com design "grimório gótico-ritual" (filigrana, escudo SVG, medalhões esculpidos, dice toast animado com confetti dourado em crítico). Código legado preservado em [docs/legacy-frontend/](docs/legacy-frontend/); design system de referência (JSX gerado pelo Claude Design) em [docs/design-reference/](docs/design-reference/). Plano completo e decisões em `~/.claude/projects/.../memory/project_ui_refactor_2026.md`.

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

### Backend layering (`br.com.henrique.bloodcrown_cs`)

Conventional Spring layered architecture:

- **[Controller/](backend/src/main/java/br/com/henrique/bloodcrown_cs/Controller/)** — thin `@RestController`s under `/auth`, `/characters`, `/attacks`, `/abilities`, `/items`. Receive `Authentication` from Spring Security (the principal is the `UserModel` itself, set by `SecurityFilter`).
- **[Services/](backend/src/main/java/br/com/henrique/bloodcrown_cs/Services/)** — interface + `Impl/` split. Business logic, ownership checks (a user can only touch their own characters), and Model↔DTO mapping live here. `AuthorizationService` implements `UserDetailsService` for Spring Security's lookup.
- **[Repositories/](backend/src/main/java/br/com/henrique/bloodcrown_cs/Repositories/)** — Spring Data JPA interfaces.
- **[Models/](backend/src/main/java/br/com/henrique/bloodcrown_cs/Models/)** — JPA entities. `CharacterModel` is the aggregate root; its attributes/status/expertise are `@Embedded` value objects in [Models/Embeddables/](backend/src/main/java/br/com/henrique/bloodcrown_cs/Models/Embeddables/), and it owns `attacks`, `abilities`, and `inventory` via `@OneToMany(cascade = ALL, orphanRemoval = true)` — so deleting a character cascades to all of them, and editing the list via the parent DTO is the intended write path.
- **[DTOs/](backend/src/main/java/br/com/henrique/bloodcrown_cs/DTOs/)** — Java records used at the API boundary. `DTOs/Responses/` holds response-shape variants.
- **[Security/](backend/src/main/java/br/com/henrique/bloodcrown_cs/Security/)** — `WebSecurityConfig` (filter chain, CORS, public-vs-authenticated route matrix), `SecurityFilter` (per-request JWT extraction → loads user via `AuthorizationService` → populates `SecurityContext`), `TokenService` (auth0 `java-jwt`, HS256, issuer `bloodcrown-cs`, 5h expiry computed in UTC-3).

### Auth model

Stateless JWT. Frontend stores the token in `localStorage` after `POST /auth/login` and sends `Authorization: Bearer <token>` on every protected call. The filter chain in [WebSecurityConfig.java:68-74](backend/src/main/java/br/com/henrique/bloodcrown_cs/Security/WebSecurityConfig.java#L68-L74) is `permitAll` only for `POST /auth/register`, `POST /auth/login`, and `OPTIONS /**` (CORS preflight); everything else requires authentication.

CORS is whitelisted to `localhost` (default nginx), `localhost:5173` (Vite dev), `localhost:5500` (legacy Live Server), `localhost:8080` (backend self-call), the `127.0.0.1` equivalents, and `https://bloodcrown.netlify.app` — when adding a new origin, edit [WebSecurityConfig.java:86-95](backend/src/main/java/br/com/henrique/bloodcrown_cs/Security/WebSecurityConfig.java#L86-L95).

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
- `spring.jpa.hibernate.ddl-auto=update` está ligado em ambos os profiles; schema migra automaticamente das mudanças de entidade. Sem Flyway/Liquibase.
