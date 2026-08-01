---
name: architecture
description: Policad monorepo code architecture rules - monorepo tooling, shared packages, per-app folder structure, and DB access rules. Load before implementing any code changes in platform/.
---

This skill is the canonical, up-to-date reference for how code in this
repo's `platform/` monorepo is organized. It governs CODE structure only -
for product behavior and DB schema, product-idea.txt and table-structure.txt
at the repo root are the source of truth.

If a decision here ever conflicts with what's already in the codebase,
treat the codebase as reality and flag the conflict - this file describes
intent, not a guarantee of current state.

## Monorepo tooling

- Package manager: **pnpm** (pnpm workspaces). Do not use npm or yarn.
- No task orchestrator (no Turborepo/Nx) for now - plain `pnpm -r run <script>`
  from the root. Revisit only if build/dev-loop pain shows up.
- Workspace layout:
  ```
  platform/
    apps/
      frontend/                      (FT)  - React + Vite + TS + Capacitor
      platform-backend/              (PB)  - Express + TS
      live-attendance-gateway/       (LAG) - Express + TS
      live-attendance-lambda-worker/ (LALW)- Express + TS locally, AWS Lambda in prod
    packages/
  ```
- Workspace package import scope: **`@platform/<package-name>`**
  (e.g. `@platform/db`, `@platform/dal`, `@platform/http`, `@platform/logger`,
  `@platform/types`, `@platform/permissions`, `@platform/uai`,
  `@platform/crypto`, `@platform/tsconfig`, `@platform/eslint-config`).

## Shared packages (`platform/packages/`)

| Package | Contents | Used by |
|---|---|---|
| `db` | Drizzle schema, Drizzle client, drizzle-kit migrations. **Infra layer only.** | Only `dal` may import this. |
| `dal` | Repository functions, organized by resource (e.g. `users.repository.ts`, `attendance.repository.ts`). **The only package allowed to import `db` and run queries.** | PB, LALW, and LAG if it ever needs DB access. |
| `http` | `ApiSuccessResponse`/`ApiErrorResponse`, error classes, `asyncHandler`, Zod validation middleware, generic error-handling middleware. | PB, LAG, LALW's local health-check shell. |
| `logger` | Winston logger instance factory (`createLogger({ service })`). | All apps, via a thin per-app wrapper. |
| `types` | Cross-service contracts: PB<->LAG, LAG<->LALW SQS payload shape, LALW<->PB webhook payload, FT<->PB API shapes. | All apps. |
| `permissions` | Permission-identifier constants + `P_O`/`P_B`/`P_C` types. | PB (RBAC checks), FT (conditional UI). |
| `uai` | UAI-generation logic (ua-parser-js based: `browser.name + os.name + device.vendor + device.model + device.type + cpu.architecture`). **Must produce identical output on FT (client) and PB/LAG (server verification)** - any drift silently breaks login. | FT, PB, LAG. |
| `crypto` | Asymmetric sign/verify helpers. PB signs, LAG verifies - sharing the implementation keeps algorithm/padding choices in sync. | PB, LAG. |
| `tsconfig`, `eslint-config` | Shared compiler/lint config. | All apps. |

### Hard rule: no app talks to the database directly

Only `@platform/dal` may import `@platform/db`. No app - including
platform-backend - may import `@platform/db` directly or run a raw
Drizzle query outside `packages/dal`. Services call `@platform/dal`
functions, full stop.

### ORM

Drizzle + drizzle-kit for migrations (not Prisma - this was reconsidered
partway through the architecture discussion). Schema/client/migrations
live entirely in `packages/db`.

## Platform-backend (PB) folder structure

PB is the largest app by far (organizations, users, batches, courses,
sessions, tags, permissions, attendance, webhooks, ...), so it uses a
**feature/module-based** structure, not a flat layered one:

```
platform/apps/platform-backend/
  src/
    app/
      <module-name>/
        <module-name>.routes.ts
        dto/<method>-<module-name>.dto.ts   (zod schema, TS type inferred from it)
        controllers/<module-name>.<controller-name>.controller.ts
        services/<module-name>.<service-name>.service.ts
            -> calls @platform/dal, never @platform/db directly
    constants/
    middlewares/     - PB-specific only (e.g. RBAC/permission-check middleware
                        against @platform/permissions). Generic error/validation
                        middleware comes from @platform/http instead.
    utils/             - PB-specific helpers only
    config/
      env.config.ts
    types/               - types local to PB only (cross-service ones go in
                            @platform/types)
    logger/                - thin wrapper: createLogger({ service: 'platform-backend' })
    app.ts                  - register middlewares + routers, no listen()
    server.ts                 - load env, init DB connection (via @platform/dal),
                                 create express app, start server
```

Routes stay pure path + middleware wiring. Controllers handle req/res
shaping. Services stay framework-agnostic (no Express `req`/`res` leaking
into them) so they're easy to unit test later even though there's no test
suite requirement right now.

The full detailed rule-set for PB (numbered, prescriptive) lives in
`platform/apps/platform-backend/backend-folder-structure-prompt.txt` -
treat that as the authoritative PB-specific spec; this skill is the
cross-app summary.

## LAG (Live Attendance Gateway)

Thin app. Per the product idea, LAG never touches the DB directly - it
only fetches public keys from PB and pushes validated attendance events to
SQS. If it ever needs DB access in the future, it must go through
`@platform/dal` like everything else, never `@platform/db` directly.

## LALW (Live Attendance Lambda Worker)

Hybrid deployment model:
- **Local dev**: a regular Express app with an SQS long-poll consumer loop,
  running against **LocalStack** (Docker) for SQS emulation. Express here
  exists only to host a health-check endpoint for the local dev shell -
  it is not a production dependency.
- **Production**: a real AWS Lambda, triggered by an SQS event source
  mapping. **Purely event-driven, no HTTP surface in prod.**

Business logic must be decoupled from the runtime shell so both
entrypoints call the same code:

```
platform/apps/live-attendance-lambda-worker/
  src/
    services/            - business logic (hash verification, attendance
                            insert, webhook dispatch) -> calls @platform/dal
    validators/            - Zod schemas for the SQS message shape
    utils/
    errors/
    consumer/
      process-message.ts     - takes one parsed SQS message, calls services/
                                in order. The single shared entrypoint both
                                below call into.
    local/
      server.ts                 - Express health-check + SQS long-poll loop
                                   (LocalStack), calls consumer/process-message.ts
    lambda/
      handler.ts                  - real AWS entrypoint:
                                     exports.handler = async (event: SQSEvent) => {...}
                                     loops event.Records, calls
                                     consumer/process-message.ts per record
```

No local `repositories/` folder here either - LALW calls `@platform/dal`
directly, same as PB.

## Cross-cutting conventions (all HTTP-serving apps)

- Validation library: **Zod** everywhere. DTOs infer their TS type from the
  zod schema (no separate hand-written type + validator).
- Functional programming style by default. Classes are fine for specific
  cases (error classes, the logger class, etc.) but not the default shape
  for business logic.
- API response convention:
  ```
  success: { success: true, message: "...", data: {...} }
  error:   { success: false, message: "...", errors?: [...] }
  ```
  via `@platform/http`'s `ApiSuccessResponse`/`ApiErrorResponse`.
- Standard middleware stack: `cors`, `helmet`, `express.json`,
  `cookie-parser`, `morgan`.
- Health check endpoint: `/health` on every HTTP-serving app.
- Logging: Winston via `@platform/logger`, never `console.log` directly.
  Log entry/exit of controllers, services, and DAL calls, plus all
  exceptions/errors.
- `.env`: one file shared across dev/prod, distinguished via an identifier
  inside it - not separate `.env.development`/`.env.production` files.
- No mandatory test suite requirement yet, but code must stay structured so
  tests can be added later without a rewrite (keep services framework-
  agnostic, avoid coupling logic to Express `req`/`res`).
- DB: Postgres via Supabase now, AWS RDS planned for later. Connection
  config lives inside `packages/db` only.

## Still open (not yet decided - check with the user before assuming)

- FT's internal folder structure.
- Testing strategy (beyond "keep it testable").
- CI setup.
- Local dev docker-compose (Postgres, LocalStack, etc.) - not yet built.
- PB's `constants/` contents and `middlewares/` specifics beyond the RBAC
  permission check.
