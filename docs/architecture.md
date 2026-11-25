# Application architecture

This project uses a feature-module structure with the Next.js App Router as its
HTTP and page-routing layer. Keep feature behavior grouped by capability rather
than scattering it across generic `components/`, `lib/`, or `utils/` folders.

## Responsibilities

- `app/` owns URL structure and thin route adapters. Pages compose feature
  modules; API route handlers adapt Next.js requests to a feature's server API.
  Keep business rules and reusable UI out of route files.
- `modules/<feature>/` owns a feature's UI and behavior. Use `components/` for
  feature UI, `client/` for browser-only integrations, and `server/` for
  credentials, persistence, and server operations. Create only the directories
  a feature needs.
- `db/` owns the shared Drizzle client and schema definitions. Keep one shared
  connection rather than creating a database client per feature.
- `drizzle/` contains generated, ordered database migrations. Generate and
  apply schema changes with the package scripts; do not silently change a
  migration that has already been applied.
- `infra/` contains local infrastructure such as the PostgreSQL Compose
  service.

## Server and client boundaries

Use `"use client"` only for components that need browser APIs, React state, or
event handlers. Keep server modules marked with `import "server-only"` so
secrets and database code cannot enter a client bundle. Client components
should call a feature's client API; server components and route handlers
should call its server API. Never pass secrets or database objects to client
components.

Next.js owns transport concerns such as URL routing, request parsing, and
framework-specific headers/cookies. Feature modules own the application
behavior behind those routes. Keep route handlers thin and avoid duplicating
session or authorization checks across pages and endpoints.

## Authentication module

```text
app/
  api/auth/[...all]/route.ts       # Better Auth's Next.js adapter
  login/page.tsx                   # Placeholder for the future production sign-in UI
  example/login/page.tsx           # Route composition for the sign-in example
modules/auth/
  client/auth-client.ts            # Browser-side Better Auth client
  server/auth.ts                   # Better Auth configuration and providers
  server/session.ts                # Server-side session access
modules/example/
  components/login-form.tsx        # Demo sign-in/sign-up UI
db/
  index.ts                         # Shared Drizzle connection
  schema.ts                        # Schema entry point
  auth-schema.ts                   # Better Auth tables
```

Keep Better Auth configuration, provider credentials, and session reads inside
`modules/auth/server/`. Keep browser calls in
`modules/auth/client/auth-client.ts`. The sign-in form is an example UI under
`modules/example/`; `/login` remains a placeholder and `/example/login` composes
the example form. The catch-all route should remain a thin adapter and should
not contain authentication rules.

## Adding a feature

1. Create `modules/<feature>/` and organize its UI, browser integration, and
   server operations by responsibility.
2. Keep `app/<route>/page.tsx` or `app/api/<route>/route.ts` focused on wiring
   the route to that feature.
3. Keep module-internal imports within the module. Expose only the server or
   client interfaces needed by routes and other modules; do not create a
   shared abstraction until more than one feature needs it.
4. Put persistent schema definitions in `db/`, export them through
   `db/schema.ts`, then generate and apply a Drizzle migration.
5. Add or update tests alongside the feature when behavior is introduced.

For Better Auth schema changes, regenerate `db/auth-schema.ts` with the Better
Auth CLI, then generate and apply a Drizzle migration:

```bash
bun x auth@latest generate \
  --config modules/auth/server/auth.ts \
  --output db/auth-schema.ts \
  --adapter drizzle \
  --dialect postgresql \
  --yes
bun run db:generate
bun run db:migrate
```

The Better Auth CLI may not resolve Next.js's `server-only` marker while
loading the auth config. If it reports that issue, temporarily remove the
`import "server-only"` lines from `modules/auth/server/auth.ts` and
`db/index.ts` for schema generation, then restore them immediately. Store
local credentials in ignored `.env.local`; document required variable names
and safe setup steps in `.env.example` or the README, never commit real
secrets.

## Next.js version guidance

Next.js APIs and conventions can change between versions. Before writing or
changing Next.js code, read the relevant guide shipped with the installed
version under `node_modules/next/dist/docs/`. Preserve the generated Next.js
instruction block in the root `AGENTS.md`.
