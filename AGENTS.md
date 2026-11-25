<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project architecture

Read [docs/architecture.md](docs/architecture.md) before adding or reorganizing
application features. Keep new functionality inside a feature module under
`modules/<feature>/`; keep `app/` files thin and use them to compose feature
modules into Next.js routes.

Keep browser code in `client/` or `components/` files marked with `"use client"`.
Keep credentials, database access, and session operations in
`server/` files marked with `import "server-only"`. Do not import server modules
from client components. Keep the shared Drizzle connection and schemas in
`db/`, and commit schema changes with generated migrations under `drizzle/`.

Before changing Next.js code, read the matching version-specific guide under
`node_modules/next/dist/docs/`.
