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
  `@platform/types`, `@platform/permissions`, `@platform/enums`, `@platform/uai`,
  `@platform/crypto`, `@platform/tsconfig`, `@platform/eslint-config`).
- `platform/.npmrc` sets `enable-pre-post-scripts=true` - required for pnpm to
  auto-run each package's `prebuild` script (see Build tooling below); pnpm
  does not do this by default. Don't remove it without replacing the build
  scripts' reliance on `prebuild`.

### Build tooling

Every buildable package/app uses **tsup** (esbuild-based) for `build`, not
`tsc` directly - much faster, but esbuild strips types without checking them.
To not lose type safety, every package's `build` script is preceded by a
`prebuild` script that runs `tsc --noEmit`:
```json
"prebuild": "pnpm run typecheck",
"build": "tsup src/index.ts --format cjs --dts --sourcemap --clean",
"typecheck": "tsc -p tsconfig.json --noEmit"
```
Packages (consumed as libraries) build with `--dts` to emit `.d.ts`; apps
(executables, e.g. platform-backend's `tsup src/instrumentation.ts ...`)
don't need `--dts`. `dev` scripts (e.g. PB's `tsx watch src/instrumentation.ts`)
are unaffected - tsup is a build-time swap only.

## Shared packages (`platform/packages/`)

| Package | Contents | Used by |
|---|---|---|
| `db` | Drizzle schema, Drizzle client, drizzle-kit migrations. **Infra layer only.** Depends on `permissions` + `enums` purely for `.$type<T>()` column annotations (see "Application-level enum columns" below) - this doesn't change who may import `db` itself. | Only `dal` may import this. |
| `dal` | Repository functions, organized by resource (e.g. `users.repository.ts`, `attendance.repository.ts`). **The only package allowed to import `db` and run queries.** | PB, LALW, and LAG if it ever needs DB access. |
| `http` | `ApiSuccessResponse`/`ApiErrorResponse`, error classes, `asyncHandler`, Zod validation middleware, generic error-handling middleware, `getUniqueViolationConstraint` + `assertNoUniqueViolation` (map a caught Postgres unique-violation error to the violated constraint name / throw `ConflictError` for it - see "Unique-constraint-name constants" below). | PB, LAG, LALW's local health-check shell. |
| `logger` | Winston logger instance factory (`createLogger({ service })`). No tracing dependency/code - trace-log correlation happens via auto-instrumentation instead, see "Distributed tracing" below. | All apps, via a thin per-app wrapper. |
| `types` | Cross-service contracts: PB<->LAG, LAG<->LALW SQS payload shape, LALW<->PB webhook payload, FT<->PB API shapes. | All apps. |
| `permissions` | RBAC-specific vocabulary only: `PERMISSION_SCOPE` (general/batch/course/org, i.e. `P_O`/`P_B`/`P_C`) and `USER_ROLE` (super_admin/admin/faculty/student). | PB (RBAC checks), FT (conditional UI), `db` (column typing). |
| `enums` | Non-permission `application_level_enum` vocabularies from table-structure.txt: `COURSE_TYPE`, `ATTENDANCE_STATUS`, `ATTENDANCE_REMARK`, `WEBHOOK_STATUS`. Kept separate from `permissions` so that package stays RBAC-only. | `db` (column typing), and any app/service that writes/reads these columns (PB, LALW). |
| `uai` | UAI-generation logic (ua-parser-js based: `browser.name + os.name + device.vendor + device.model + device.type + cpu.architecture`). **Must produce identical output on FT (client) and PB/LAG (server verification)** - any drift silently breaks login. | FT, PB, LAG. |
| `crypto` | Asymmetric sign/verify helpers. PB signs, LAG verifies - sharing the implementation keeps algorithm/padding choices in sync. | PB, LAG. |
| `tracing` | OpenTelemetry bootstrap (`initTracing`), manual span helper (`withSpan`), trace-context propagation helpers for the future SQS boundary. See "Distributed tracing" below. | `dal` (manual DB spans), every app's dedicated entrypoint. Not `logger` - that package has no tracing dependency at all. |
| `tsconfig`, `eslint-config` | Shared compiler/lint config. | All apps. |

### Application-level enum columns

table-structure.txt deliberately keeps `type`/`role`/`status`/`remark`-style
columns as plain `varchar`, not real Postgres enums (see each column's
`// application_level_enum(...)` comment) - the DB enforces nothing. To still
get compile-time safety, every such column uses Drizzle's `.$type<T>()`
against the canonical union type from `@platform/permissions` or
`@platform/enums` (whichever owns that vocabulary), e.g.:
```ts
type: varchar("type", { length: 25 }).$type<PermissionScope>().notNull(),
```
`.$type<T>()` is compile-time only - it does not change the generated SQL
(verified: regenerating the migration with vs. without it produces identical
DDL) and does not add a runtime check. Never redeclare the same string
literals locally in `packages/db` or anywhere else - always import the type
from whichever package owns that vocabulary, so there is exactly one source
of truth per enum.

### Unique-constraint-name constants

Every table's `unique()` constraint names in `packages/db/src/schema/*.ts`
are defined as an exported `<TABLE>_CONSTRAINTS` object right in that
table's own schema file, immediately above the table definition. Each entry
is a `{ key, message }` pair - `key` is the raw Postgres constraint name
(used directly inside the `unique(...)` calls via `.key`, e.g.
`ORGANIZATIONS_CONSTRAINTS.UQ_NAME.key` in `organizations.ts`), `message` is
the user-facing conflict message for that constraint. One object per table,
one source of truth - a constraint can't be added without also giving it a
message (both live in the same object literal), and never a hand-typed
constraint-name string in two places.

Re-exported from `packages/dal`'s `index.ts` (not `packages/db` directly -
`dal` is still the only sanctioned db-access boundary) so app-layer services
can import it without reaching past `dal`.

Usage pattern in a service: attempt the insert/update, catch the error, call
`assertNoUniqueViolation(err, FOO_CONSTRAINTS)` from `@platform/http`
(internally: `getUniqueViolationConstraint(err)` checks for Postgres error
code `23505` and returns the `constraint_name`; if it matches some entry's
`.key`, throws `ConflictError` with that entry's `.message`; otherwise
returns normally), then rethrow `err` unconditionally after the call - see
`app/super-admin/organizations/services/organizations.create.service.ts` and
`app/super-admin/users/services/users.create-admin.service.ts`. Deliberately
not a pre-check query (`findByX` before insert) - that's an extra round trip
and still race-prone; catching the DB's own constraint is the single source
of truth and race-free.

All 19 tables have their constants (key + message) defined and re-exported
already, even though only the two services above consume them so far -
ready for the next module that needs conflict handling without a
follow-up refactor.

### DB connection pooling - PB only

`@platform/db`'s `createDbClient(databaseUrl, options?)` and
`@platform/dal`'s `initDal(databaseUrl, options?)` take an optional
`DbClientOptions` (`{ max?, idleTimeoutSeconds?, connectTimeoutSeconds? }`).
**Default `max` is 1** (no real pooling) - this is deliberate and must stay
the default: LALW's production Lambda handler is a per-invocation runtime,
where each concurrent invocation is a separate process, so a wide pool per
invocation would multiply connections against Postgres's connection limit
instead of reusing them. Only **PB** - a genuinely long-running server that
benefits from reusing connections across concurrent requests - opts into a
real pool, via a hardcoded `DB_POOL_MAX = 10` constant in `server.ts` passed
to `initDal` - not an env var, since this is a deployment-topology constant
(tied to PB always being one long-running process), not something that
varies per environment. When LALW is built, call `initDal(databaseUrl)` with
no options (or explicit `{ max: 1 }`) - do not give it a pool.

### Soft-deleted rows (`is_deleted`) are excluded by default in `packages/dal`

Every table with `is_deleted` (organizations, users, batches, courses,
course_sessions, ...) means "deleted = doesn't exist" for normal callers.
Every `packages/dal` repository function - reads and writes alike - filters
`eq(<table>.isDeleted, false)` by default; this is enforced in the DAL
specifically so no app/service has to remember it per call. A feature that
genuinely needs to see deleted rows (an admin restore/audit view) must get
its own explicitly-named function (e.g. `findUserByIdIncludingDeleted`) -
never make that the default. `is_archived` is a different, unrelated concept
(still active/visible, just not "current") and does not get this treatment.

### Distributed tracing (`@platform/tracing`)

OpenTelemetry, wired for real (not just installed). Every HTTP-serving app
calls `initTracing({ service })` once at process start, from a **dedicated
entrypoint file, not the app's normal module graph**:

```
platform/apps/platform-backend/
  src/
    instrumentation.ts   - the real entrypoint (see package.json dev/build/start).
                            Calls initTracing() first, then a genuinely
                            deferred `void import("./server")`.
    server.ts               - unchanged otherwise: load env, init DB
                               connection, create express app, start server
```

**Why a separate entrypoint, and why a dynamic `import()` instead of a
static one:** OpenTelemetry's Node auto-instrumentation (`@opentelemetry/
auto-instrumentations-node`, covering `express`/`http` here) works by
patching `require()`/module-loading itself. If `express` (or anything else
it instruments) is already `require()`'d before `initTracing()` runs,
instrumenting it afterward is a **silent no-op** - no error, spans just
never appear. A static `import "./server"` gets hoisted by TypeScript/
bundlers above any runtime code in the same file, so it cannot be used to
sequence this correctly - only a genuinely deferred call (dynamic
`import()`, or a plain `require()` call written as a statement) guarantees
`initTracing()` really runs first. Verified empirically: a `GET /health`
request produces one full trace (top-level `GET /health` HTTP span, every
Express middleware as a child span, the route handler span) all under one
`traceId`.

**Exporter**: OTLP over HTTP, via `OTEL_EXPORTER_OTLP_ENDPOINT` (optional
env var). Unset falls back to a `ConsoleSpanExporter` (prints spans to
stdout) - this was a deliberate choice so tracing works with zero new infra
today; point the env var at any OTLP-compatible backend later (self-hosted
Jaeger/Tempo, Honeycomb, Grafana Cloud, Datadog, ...) with no code change.
No backend has been chosen yet - see "Still open".

**DB spans are manual, not auto-instrumented**: `@opentelemetry/
instrumentation-pg` exists for the `pg` driver, but we use `postgres`
(porsager) - there is no official (or found community) auto-instrumentation
package for it, and drizzle-orm 0.33 ships no OTel integration either. So
`@platform/dal` wraps every repository function in `withSpan("db.<table>.
<fnName>", ..., { "db.system": "postgresql", "db.sql.table": "<table>" })`
instead - a plain `export async function xxx() { return withSpan(...) }`
per function, hand-typed span-name string. **Tried and deliberately
rejected**: a `tracedQuery(table, fn)` higher-order wrapper that derived the
span name from the wrapped function's own `.name` (via a named function
expression) instead of a hand-typed string. It failed `.d.ts` generation
(TS2742 - a generic function call assigned to a `const` can't be named
portably) unless every export got an explicit type annotation duplicating
the function's signature a second time - net *more* repetition than the
"span name could drift from the function name" problem it solved. If the DB
driver ever changes to `pg`, revisit whether auto-instrumentation should
replace manual spans entirely instead.

`withSpan()` does not set `SpanStatusCode.OK` on success - only on error
(catch block). Per OTel convention, successful spans stay UNSET; `OK` is for
deliberately overriding what would otherwise look like an error.

**Auto-instrumentation is scoped down, not left at the default**:
`getNodeAutoInstrumentations()` loads 39 instrumentation packages by default
(mongodb, redis, graphql, grpc, kafka, mysql, oracledb, hapi, koa,
socket.io, `pg` [wrong driver for us], ...) - real cost in startup time and
bundle size, worst for LALW's future Lambda cold start. `initTracing()`
explicitly disables the ~33 we don't use; only `http`, `express`, `winston`,
`aws-sdk`, `aws-lambda` (LALW), and `undici` (future outbound fetch, e.g.
webhook dispatch) stay on. Verified: exactly 6 active instrumentations at
runtime.

**`spanProcessorMode`**: `initTracing()` takes an optional `"batch"`
(default) | `"simple"` option. Batch processors buffer spans and flush on a
timer - fine for PB (long-running). Lambda execution environments freeze
between invocations, so a timer-based flush may just never fire and spans
get silently dropped - LALW's `lambda/handler.ts` must use `"simple"`
(synchronous, flushes every span as it ends) when built.

**Log-trace correlation is NOT custom code** - `@platform/logger` does
nothing tracing-related itself. `@opentelemetry/instrumentation-winston`
(one of the 6 kept auto-instrumentations above) already patches winston to
inject `trace_id`/`span_id`/`trace_flags` into every log call made inside an
active span, with zero code on our side. Verified empirically (and verified
the *wrong* way once first - by requiring `winston` before `initTracing()`
in a throwaway test script, which silently produced no injection; the fix
was fixing the test's require order, not the implementation). This only
works because `@platform/logger` is only ever loaded transitively from an
app's dedicated `instrumentation.ts`, after `initTracing()` already ran.

**SQS trace propagation (LAG -> SQS -> LALW) - designed, not wired up yet**:
`@platform/tracing` exports `injectTraceContext(carrier)` /
`extractTraceContext(carrier)` (thin wrappers over `@opentelemetry/api`'s
`propagation.inject`/`extract`, W3C tracecontext format) specifically so
that when LAG and LALW are built, LAG can inject trace context into the SQS
message's attributes and LALW can extract it and run its processing inside
that context - so the whole LAG -> SQS -> LALW -> PB webhook flow shows up
as one trace instead of three disconnected ones. Neither app exists yet, so
this is unverified; when built, both must call `initTracing()` from their
own dedicated entrypoint the same way PB does (LALW's `lambda/handler.ts`
in particular - Lambda's execution model makes the auto-instrumentation
init-order rule just as important there).

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
      <actor>/                                (optional grouping tier - see below)
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
    instrumentation.ts           - the REAL entrypoint (dev/build/start all
                                    point here, never server.ts directly) -
                                    see "Distributed tracing" above for why
```

Routes stay pure path + middleware wiring. Controllers handle req/res
shaping. Services stay framework-agnostic (no Express `req`/`res` leaking
into them) so they're easy to unit test later even though there's no test
suite requirement right now.

**The `<actor>` grouping tier** (e.g. `app/super-admin/organizations/`,
`app/super-admin/users/`) is used when every route in a module is scoped to
a single actor tier (super_admin/admin/faculty/student) - it's optional, not
every module needs it. The URL mount prefix mirrors it 1:1
(`/api/v1/super-admin/...`). If a module's routes end up spanning multiple
actor tiers (e.g. a future `users` module needs both super_admin-only routes
and separate admin-only ones), split it into separate per-actor modules
(`app/super-admin/users/`, `app/admin/users/`, ...) rather than mixing actor
tiers inside one module folder - keeps "who can call this" discoverable from
the file path alone.

An actor-tier folder that's **entirely non-delegable** (see "Auth & RBAC
middleware (PB)" below for what that means) gets one aggregating
`<actor>.routes.ts` at its root (e.g. `app/super-admin/super-admin.routes.ts`)
that applies `authenticate` + `requireRole(...)` once and mounts each
module's router under it - individual modules' `*.routes.ts` files
(`organizations.routes.ts`, `users.routes.ts`) then carry no auth middleware
of their own, only `validate(dto)` + the controller. `app.ts` mounts just
the one aggregator (`app.use("/api/v1/super-admin", superAdminRouter)`), not
each module router separately.

The full detailed rule-set for PB (numbered, prescriptive) lives in
`platform/apps/platform-backend/backend-folder-structure-prompt.txt` -
treat that as the authoritative PB-specific spec; this skill is the
cross-app summary.

### Auth & RBAC middleware (PB)

`authenticate` (`middlewares/authenticate.middleware.ts`) - verifies the
access token's signature/expiry (via `verifyStaffToken`/`verifyStudentToken`
from `app/auth/services/auth.tokens.service.ts`, branching on the JWT's
claimed `role` the same way `auth.refresh.service.ts` does) and attaches the
payload to `req.user`. Does **not** re-check `loginCount` against the DB per
request - product-idea.txt only requires that check at `/refresh` today; a
per-request check is documented future work on LAG's side, not PB's. Doing
it here would add a DB round trip to every request for a check the spec
explicitly defers. Not applied globally - `/health` and `/api/v1/auth/*`
itself stay unauthenticated.

After `authenticate`, PB uses one of two different authorization
middlewares depending on whether the route is **delegable** - could this
access ever be granted to another role via a permission config group
(P_O/P_B/P_C)? Delegable implies resource-scoped (org/batch/course), since
that's the whole mechanism a config group grants through.

- **Non-delegable** (permanently platform-level, e.g. everything under
  `app/super-admin/` - create an organization, create an admin): use
  `requireRole(...roles)` (`middlewares/require-role.middleware.ts`), a
  blunt role gate with no notion of a specific permission identifier. For an
  entire non-delegable actor-tier folder, apply it once in that folder's
  aggregating `<actor>.routes.ts` (see the PB folder structure section
  above) rather than per-route.
- **Delegable** (resource-scoped, could be granted to an admin/faculty via a
  config group - no module is on this path yet): use
  `checkPermission(permissionId)` (`middlewares/check-permission.middleware.ts`)
  per-route. Looks up `permissionId` in `constants/permissions.constants.ts`'s
  `PERMISSIONS` map and allows the request if `req.user.role` is in that
  permission's `bypassRoles` - this is the "unique permission identifier...
  bypass mechanism based on role and action, kept in a constants file" from
  product-idea.txt. **Resource-scoped checking against
  `admin_permitted_access_identifiers` (P_O/P_B/P_C) is not implemented
  yet** - blocked on the permissions-config module (P_O/P_B/P_C CRUD) not
  existing. Until then, a role NOT in `bypassRoles` is denied outright (403)
  rather than silently allowed - the middleware's shape is already what
  resource-scoped checking will extend, so no caller-facing change is
  expected when it lands. `PERMISSIONS` is empty today (no delegable module
  exists yet) - the next module whose routes are genuinely grantable to
  admin/faculty (e.g. course/batch-scoped actions) populates it. A
  `PERMISSIONS` entry's `resourceType` is never `null` - a delegable
  permission with no specific resource dependency uses
  `PERMISSION_SCOPE.GENERAL`, not null; a permission with no resourceType at
  all isn't delegable and belongs on `requireRole` instead, not in this
  catalog.

### Permissions-config module (PB)

`app/super-admin/access-identifiers/` and
`app/super-admin/permission-config-groups/` - lets FTSA (super_admin) build
up the P_O/P_B/P_C catalog (product-idea.txt: "FTSA create P_O, P_B, P_C
(which govern RBAC)"). Both are **non-delegable** themselves (mounted under
`superAdminRouter`, `requireRole(SUPER_ADMIN)` only - same tier as
org/admin creation), even though what they create (`admin_access_identifiers`,
`admin_permissions_config_groups`, `admin_permitted_access_identifiers`) is
what the *delegable* system will eventually check against.

- `access-identifiers`: create + list rows in `admin_access_identifiers` -
  the individual permission-atom catalog. List takes an optional `type`
  filter AND an optional `permissionConfigGroupId` filter (404s if that
  group doesn't exist) - listing "which access identifiers belong to group
  X" lives here, not on `permission-config-groups`, because the response is
  fundamentally an access-identifier read, not a group action (the DAL join
  itself is still owned by `permitted-access-identifiers.repository.ts`,
  the join table - the service just calls whichever repo fn fits the given
  filter).
- `permission-config-groups`: create + list groups in
  `admin_permissions_config_groups`, plus mutating a group's membership in
  `admin_permitted_access_identifiers`: `POST /:id/access-identifiers`
  (attach - validates the group exists and every identifier's `type`
  matches the group's `type` at the service layer, not just relying on the
  DB's composite FK, so a bad request surfaces as 404/400 instead of a raw
  FK-violation error) and `DELETE /:id/access-identifiers/:accessIdentifierId`
  (detach - 404s if that pair isn't currently permitted).

No delete on `access-identifiers`/`permission-config-groups` themselves yet
(mirrors organizations/users, which also only have create+list so far) -
only the join-table membership (`admin_permitted_access_identifiers`) has a
delete, since removing a group's access identifier is a safe, expected
admin action while deleting a catalog entry or group outright risks
orphaning other groups/rows that still reference it via the composite FKs.
Scope deliberately stops short of `user_permissions` (assigning a config
group to a specific user for a specific resource) - that's the FTA "assign
faculty to batch/course with P_B/P_C" feature (product-idea.txt:26-27), a
separate later module that also needs batches/courses to exist first.

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
  exceptions/errors. Every log call gets `trace_id`/`span_id` stamped in
  automatically when inside an active span - see "Distributed tracing".
- Tracing: `@platform/tracing`'s `initTracing()` from a dedicated
  entrypoint file (never the app's normal module graph) - see "Distributed
  tracing" above, the init-order rule there is not optional.
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
  Could also host a local OTel collector/Jaeger/Tempo when tracing needs one.
- Resource-scoped RBAC (P_O/P_B/P_C via `admin_permitted_access_identifiers`)
  - `checkPermission` only supports the role-based bypass path today, see
  "Auth & RBAC middleware (PB)" above. The permissions-config module (P_O/
  P_B/P_C CRUD) now exists (see "Permissions-config module (PB)" above), but
  resource-scoped checking still needs `user_permissions` (assigning a
  config group to a user for a resource - the FTA "assign faculty to batch/
  course" feature) before `checkPermission` can be upgraded.
- Trace backend: no OTLP endpoint has been chosen/stood up yet (self-hosted
  collector vs. a SaaS vendor) - traces currently only go to stdout via the
  console exporter fallback.
- Wiring `initTracing()` + SQS trace-context propagation into LAG/LALW once
  those apps are built (see "Distributed tracing" above).
- Sampling strategy: currently always-on (SDK default), fine at current
  traffic - revisit if/when trace volume becomes a cost concern.
