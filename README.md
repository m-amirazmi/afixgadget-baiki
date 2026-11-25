This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

The project structure and feature-module conventions are documented in
[`docs/architecture.md`](docs/architecture.md); repository-specific guidance
for coding agents is in [`AGENTS.md`](AGENTS.md).

## Database

The local PostgreSQL service is defined in `infra/docker-compose.yml` and uses
the `afixgadget` database. Set `DATABASE_URL` in `.env.local` (the default
Compose credentials are already in `.env.example`):

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/afixgadget
```

Drizzle uses `db/schema.ts` for the schema and `drizzle/` for generated SQL
migrations. After changing the schema, generate and apply migrations with:

```bash
bun run db:generate
bun run db:migrate
```

Run `bun run db:studio` to inspect the local database.

For Neon deployment, use its pooled connection string (hostname includes
`-pooler`) as `DATABASE_URL` for the app. Set `DATABASE_URL_UNPOOLED` to Neon’s
direct connection string for migrations; `drizzle.config.ts` prefers it when
running Drizzle Kit, while the app continues to use `DATABASE_URL`. Run
`bun run db:migrate` once in the release pipeline before deploying code that
needs the schema. Keep `bun run db:generate` in development and commit the
generated migrations.

For Vercel, add both Neon URLs as server-side environment variables for the
appropriate Production and Preview environments. Also configure
`BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` in Vercel; use your deployed origin
for the latter. Set Vercel's Build Command to:

```bash
bun run lint && bun run db:migrate && bun run build
```

Use a separate Neon branch for Preview deployments so their migrations cannot
change the Production database.

## Authentication

Authentication is organized as a feature module in `modules/auth/`: server
configuration and session access stay in `server/`, while browser calls use
`client/auth-client.ts`. The thin Next.js adapter is
`app/api/auth/[...all]/route.ts`. Better Auth uses the existing `users` table;
the generated schema and migration keep auth persistence in Drizzle.

Set `BETTER_AUTH_SECRET` in `.env.local` to a unique secret (generate one with
`openssl rand -base64 32`). The local value is not committed. Email/password
auth is enabled. To enable Google sign-in, create Google OAuth credentials and
set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`; the authorized redirect URI
for local development is `http://localhost:3000/api/auth/callback/google`.
Google sign-in is unavailable until both credentials are set.

Client components can import `authClient` from
`modules/auth/client/auth-client.ts` for `signUp.email`, `signIn.email`,
`signIn.social({ provider: "google" })`, and `signOut`. Server components can
use `getSession` from `modules/auth/server/session.ts`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
