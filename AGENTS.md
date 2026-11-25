<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project architecture

Before feature work, read
[the Baiki POS requirements](docs/requirements/baiki-pos-requirements.md) and
[the architecture guide](docs/architecture.md). The requirements document is
the source of truth for product scope, behavior, security, data model, and the
target stack. The architecture guide describes the existing scaffold; where
it conflicts with the requirements, follow the requirements and reconcile the
affected architecture documentation as part of the relevant implementation.
Do not silently introduce or preserve competing ORM or authentication designs.

Keep application routes thin and business logic inside the server-side DAL
described by the requirements. Enforce server/client boundaries: keep
credentials, database access, and session operations on the server, and never
import server modules into client components. Follow the required PostgreSQL
schema and Prisma data-access approach; every stock mutation must use the
transactional ledger helper and write its corresponding immutable movement.

The counter application uses a collapsible sidebar for route navigation. Keep
the header for active branch/staff context and counter actions such as locking
or switching staff; do not put primary route navigation in the header. Keep
public login, pairing, and customer tracking routes separate from the
authenticated counter shell, and enforce owner-only access on the server.

Before changing Next.js code, read the matching version-specific guide under
`node_modules/next/dist/docs/`.
