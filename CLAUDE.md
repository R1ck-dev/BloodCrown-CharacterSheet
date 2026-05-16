# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Summary

BloodCrown is a full-stack character sheet manager for a homebrew tabletop RPG system. The backend is a Spring Boot 3 (Java 21) REST API with JWT-based stateless auth and JPA/MySQL persistence. The frontend is a multi-page vanilla-JS app served as static files (nginx in the container, any static server in dev). The whole stack is orchestrated by `docker-compose.yml`. Production frontend is hosted on Netlify (`bloodcrown.netlify.app`); production API is on Render.

User-facing strings, comments, and commit messages are in Portuguese (BR). Match that style when editing.

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

**Frontend only:** any static server pointed at [frontend/](frontend/) works (Live Server on port 5500 is what the CORS config + dev `API_BASE_URL` assume). No build step.

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

Stateless JWT. Frontend stores the token after `/auth/login` and sends `Authorization: Bearer <token>` on every protected call. CORS is whitelisted to `localhost:5500/8080`, `127.0.0.1:5500`, and `bloodcrown.netlify.app` — when adding a new origin, edit [WebSecurityConfig.java:90-107](backend/src/main/java/br/com/henrique/bloodcrown_cs/Security/WebSecurityConfig.java#L90-L107).

Note: several endpoints that should be authenticated (`GET/POST /characters`, `POST/DELETE /attacks/**`, `POST/DELETE /abilities/**`) are currently in the `permitAll()` block in [WebSecurityConfig.java:68-79](backend/src/main/java/br/com/henrique/bloodcrown_cs/Security/WebSecurityConfig.java#L68-L79) even though their service methods dereference `authentication.getPrincipal()`. Be aware before tightening — flipping them to `authenticated()` is likely the correct intent.

### Frontend

Plain HTML pages ([index.html](frontend/index.html), [RegisterScreen.html](frontend/RegisterScreen.html), [Dashboard.html](frontend/Dashboard.html), [Sheet.html](frontend/Sheet.html)) each pull in their own controller from [assets/js/](frontend/assets/js/). Shared HTTP layer is [ApiService.js](frontend/assets/js/ApiService.js); UI uses Bootstrap 5 + SweetAlert2. The sheet auto-saves via a `debounce` wrapper around a PUT to `/characters/{id}` — most attribute/skill changes flow through that path rather than discrete endpoints.

`API_BASE_URL` is a single top-of-file constant in [ApiService.js](frontend/assets/js/ApiService.js); it gets toggled between the localhost dev URL and the Render production URL at deploy time. Check it before pushing.

## Configuration & environment

- [application.properties](backend/src/main/resources/) is the default profile (local MySQL, `${DB_USER}`/`${DB_PASS}` from env, activates `local` profile).
- `application-local.properties` overrides credentials and supplies `jwt.secret`.
- When run under Docker Compose, the env block in [docker-compose.yml](docker-compose.yml) injects `SPRING_DATASOURCE_*` directly, bypassing the properties file for DB config. `jwt.secret` is **not** passed in that env block — set it before deploying.
- `spring.jpa.hibernate.ddl-auto=update` is on in both local and compose configs; schema migrates automatically from entity changes. There is no Flyway/Liquibase.

**Current working-tree gotcha:** the property files have been renamed to `*.properties.txt` (visible in `git status`). Spring Boot will not load them with that extension — rename back to `.properties` before running the backend locally, or the app will fall back to env vars only and likely fail on `jwt.secret`.
