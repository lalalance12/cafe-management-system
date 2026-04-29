# Cafe Management System

A multi-role platform for running a cafe chain end-to-end:

| Role               | Surface       | URL          | Purpose                                                   |
| ------------------ | ------------- | ------------ | --------------------------------------------------------- |
| Barista / Server   | POS           | `/pos`       | Take orders, run payments, manage tables.                 |
| Inventory team     | Inventory     | `/inventory` | Track stock, alerts, suppliers, purchase orders.          |
| Branch manager     | Branch admin  | `/branch`    | Daily sales, shift schedule, local menu, waste tracking.  |
| Owner / Executive  | Global admin  | `/admin`     | Chain-wide revenue, branches, menu pricing, users/roles.  |

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Server Components, `proxy.ts`).
- [Tailwind CSS v4](https://tailwindcss.com) using the `@theme inline` token system in `globals.css`.
- [Supabase](https://supabase.com) for Postgres, Auth, Storage, and Realtime via [`@supabase/ssr`](https://www.npmjs.com/package/@supabase/ssr).
- TypeScript, ESLint (next/core-web-vitals + next/typescript).

## Getting started

```bash
npm install
cp .env.example .env.local
# fill in the Supabase values, then:
npm run dev
```

The app boots at <http://localhost:3000>. The landing page (`/`) is a hub
that links into each role-specific surface.

> The dev server uses Turbopack by default. If you hit a Turbopack-specific
> bug you can fall back with `next dev` (drop the `--turbopack` flag).

## Environment variables

All variables are documented in [`.env.example`](./.env.example). The app
reads them through `src/lib/env.ts`, which throws a readable error on
missing values rather than silently producing broken Supabase clients.

| Variable                          | Where it's used                              |
| --------------------------------- | -------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`        | Browser + server clients.                    |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`   | Browser + server clients (RLS-bound).        |
| `SUPABASE_SERVICE_ROLE_KEY`       | Trusted server-only client (`createAdminClient`). Never leave this in the browser. |

## Project layout

```
src/
  app/
    (auth)/login/                Sign-in page.
    (pos)/pos/                   POS shell + pages.
    (inventory)/inventory/       Inventory shell + pages.
    (branch)/branch/             Branch admin shell + pages.
    (admin)/admin/               Global superadmin shell + pages.
    api/health/                  Health probe.
    layout.tsx                   Root layout, fonts, metadata.
    page.tsx                     Role hub (landing page).
    globals.css                  Tailwind v4 + design tokens.
  components/
    layout/                      Cross-role UI primitives (AppShell, cards).
  lib/
    env.ts                       Validated environment variables.
    supabase/
      client.ts                  Browser client (Client Components).
      server.ts                  Server client (Server Components / Actions).
      admin.ts                   Service-role client (server only).
      session.ts                 Helper used by `proxy.ts` to refresh sessions.
      types.ts                   Placeholder for generated DB types.
  proxy.ts                       Next.js 16 proxy (was middleware).
public/                          Static assets.
```

Route groups (`(pos)`, `(inventory)`, etc.) keep each role's chrome
isolated without leaking into the URL: `(pos)/pos/page.tsx` resolves to
`/pos`.

## Supabase

A Supabase project is **not** provisioned yet. Once it is, the typical
follow-ups are:

1. Create the tables and enable Row Level Security.
2. Generate types:
   ```bash
   npx supabase gen types typescript --project-id <id> --schema public \
     > src/lib/supabase/types.ts
   ```
3. Wire `signInWithPassword` (or your preferred provider) into
   `src/app/(auth)/login/page.tsx`.
4. Add role-aware authorization to each section's `layout.tsx`
   using `createClient()` from `src/lib/supabase/server.ts` and
   `supabase.auth.getClaims()`.

## AI tooling

This repo ships with conventions for AI assistants:

- [`AGENTS.md`](./AGENTS.md) &mdash; project-wide rules (loaded by Claude
  Code, Cursor, and other agents that respect the convention).
- [`CLAUDE.md`](./CLAUDE.md) &mdash; Claude-specific entry point that
  re-exports `AGENTS.md`.
- [`.cursor/rules/`](./.cursor/rules) &mdash; Cursor rule files scoped to
  particular folders.

Keep them up to date when conventions change &mdash; agents read them on
every session.

## Scripts

```bash
npm run dev      # start the dev server (Turbopack)
npm run build    # production build
npm run start    # serve the production build
npm run lint     # ESLint
```
