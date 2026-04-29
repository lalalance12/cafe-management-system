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

```text
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

## Naming conventions

Consistency over cleverness. When in doubt, match what the file next to
yours is already doing.

### Files and folders

| What                                       | Convention                                  | Example                                     |
| ------------------------------------------ | ------------------------------------------- | ------------------------------------------- |
| Folders                                    | `kebab-case`                                | `purchase-orders/`, `staff-schedule/`       |
| Component files                            | `kebab-case.tsx`                            | `app-shell.tsx`, `placeholder-card.tsx`     |
| Hook files                                 | `use-<name>.ts`                             | `use-cart.ts`, `use-current-user.ts`        |
| Plain TypeScript modules                   | `kebab-case.ts`                             | `format-currency.ts`, `cart-totals.ts`      |
| Type-only modules                          | `kebab-case.ts` (or `.types.ts` if helpful) | `order.types.ts`                            |
| Test files                                 | `<name>.test.ts(x)` next to the source      | `cart-totals.test.ts`                       |
| Next.js special files                      | Lowercase, exact spelling                   | `page.tsx`, `layout.tsx`, `route.ts`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `template.tsx`, `default.tsx`, `proxy.ts`, `instrumentation.ts` |
| Route groups                               | `(kebab-case)`                              | `(pos)/`, `(inventory)/`                    |
| Dynamic route segments                     | `[param]`, `[...slug]`, `[[...slug]]`        | `app/orders/[orderId]/page.tsx`             |
| Private (non-routable) folders             | `_kebab-case/`                              | `app/pos/_components/`, `app/pos/_lib/`     |
| Parallel slots                             | `@kebab-case/`                              | `@modal/`, `@sidebar/`                      |
| Static assets in `public/`                 | `kebab-case`                                | `public/logos/wordmark-light.svg`           |

### Code identifiers

| What                                       | Convention                                  | Example                                     |
| ------------------------------------------ | ------------------------------------------- | ------------------------------------------- |
| React components                           | `PascalCase`                                | `AppShell`, `OrderCart`, `InventoryTable`   |
| Hooks                                      | `camelCase` starting with `use`             | `useCart`, `useCurrentBranch`               |
| Variables / functions                      | `camelCase`                                 | `applyDiscount`, `currentUser`              |
| TypeScript types / interfaces / enums      | `PascalCase`                                | `OrderItem`, `PaymentMethod`, `UserRole`    |
| Generic type parameters                    | Single uppercase letter or `T`-prefixed     | `T`, `TItem`, `TResult`                     |
| Module-level constants                     | `UPPER_SNAKE_CASE`                          | `DEFAULT_PAGE_SIZE`, `LOW_STOCK_THRESHOLD`  |
| Booleans (vars and props)                  | `is*` / `has*` / `can*` / `should*`         | `isOpen`, `hasUnpaidOrders`, `canRefund`    |
| Event handler **functions**                | `handle<Event>`                             | `handleSubmit`, `handleAddToCart`           |
| Event handler **props**                    | `on<Event>`                                 | `onSubmit`, `onAddToCart`                   |
| Component prop types                       | `<Component>Props`                          | `AppShellProps`, `OrderRowProps`            |
| Discriminated union tags                   | lowercase string literals                   | `type Result = { kind: "ok" } \| { kind: "error" }` |
| Index files                                | Avoid except for true public barrels        | `lib/supabase/index.ts` only if it re-exports a stable public surface |

### URLs and routes

- Lowercase, `kebab-case`, plural for collections, singular plus id for
  detail.
  - Good: `/purchase-orders`, `/branches/[branchId]/staff`
  - Bad: `/purchaseOrders`, `/Branch/staff`
- Query parameters are `camelCase`: `?branchId=...&from=2026-01-01`.
- API routes mirror the resource: `app/api/purchase-orders/route.ts`,
  `app/api/purchase-orders/[id]/route.ts`.

### Environment variable names

- `UPPER_SNAKE_CASE` always.
- Prefix with `NEXT_PUBLIC_` **only** when the value is safe for the
  browser bundle. Everything else stays server-side.
- Group related vars by prefix: `SUPABASE_*`, `STRIPE_*`, etc.
- Document every variable in [`.env.example`](./.env.example) and read it
  through [`src/lib/env.ts`](./src/lib/env.ts) — never `process.env`
  directly.

### Database (Postgres / Supabase)

Postgres is case-sensitive once you quote identifiers, and Supabase tools
assume the standard SQL convention. Stick with it.

| What                                       | Convention                                  | Example                                     |
| ------------------------------------------ | ------------------------------------------- | ------------------------------------------- |
| Tables                                     | `snake_case`, plural                        | `branches`, `purchase_orders`, `order_items`|
| Columns                                    | `snake_case`, singular                      | `id`, `branch_id`, `unit_price`             |
| Primary keys                               | `id` (uuid preferred)                       | `id uuid primary key default gen_random_uuid()` |
| Foreign keys                               | `<referenced_table_singular>_id`            | `branch_id`, `user_id`, `product_id`        |
| Booleans                                   | `is_*` / `has_*`                            | `is_active`, `has_paid`                     |
| Timestamps                                 | `created_at`, `updated_at`, `deleted_at`    | `timestamptz` everywhere                    |
| Enums                                      | `snake_case` type name + values             | `create type order_status as enum ('open','paid','void')` |
| Indexes                                    | `<table>_<columns>_idx`                     | `orders_branch_id_created_at_idx`           |
| RLS policies                               | Sentence-style, lowercase                   | `"branch staff can read their own orders"`  |
| Functions / RPCs                           | `snake_case`                                | `current_user_branch_id()`                  |

When mapping rows into TypeScript, let the generated types in
`src/lib/supabase/types.ts` keep `snake_case` and convert at the
boundary if a feature needs `camelCase` shapes. Don't sprinkle ad-hoc
conversions throughout the codebase.

### Imports

- Prefer the `@/*` alias over long relative paths
  (`@/lib/supabase/server` &gt; `../../../lib/supabase/server`).
- Use named exports. Default exports are reserved for files where Next.js
  requires them (`page.tsx`, `layout.tsx`, `route.ts`, etc.).

## Commits and branches

We use [Conventional Commits](https://www.conventionalcommits.org/) so
the history reads cleanly and we can automate changelogs later.

```text
<type>(<optional-scope>): <subject>

<optional body>

<optional footer(s)>
```

### Allowed types

| Type       | Use it for                                                                 |
| ---------- | -------------------------------------------------------------------------- |
| `feat`     | A new user-visible feature.                                                |
| `fix`      | A bug fix.                                                                 |
| `refactor` | Code change that neither fixes a bug nor adds a feature.                   |
| `perf`     | Performance improvement.                                                   |
| `docs`     | Documentation only (READMEs, comments, AGENTS.md, etc.).                   |
| `test`     | Adding or fixing tests.                                                    |
| `build`    | Build system, dependencies, package config (`package.json`, lockfile).     |
| `ci`       | CI configuration (workflows, hooks).                                       |
| `chore`    | Routine maintenance that doesn't fit elsewhere (renames, gitignore, etc.). |
| `style`    | Formatting / whitespace only — never logic changes.                        |
| `revert`   | Reverts a previous commit (auto-generated by `git revert`).                |

### Scopes

Use the area of the codebase being touched. Keep it short and stable so
the same scope is reusable:

`pos`, `inventory`, `branch`, `admin`, `auth`, `db`, `supabase`, `ui`,
`config`, `deps`, `infra`.

### Subject line

- Imperative, present tense: "add purchase order form", not "added" or
  "adds".
- Lowercase first letter. No trailing period.
- Soft cap at 72 characters.

### Body and footers (optional)

- Wrap body lines at ~100 chars; explain **why**, not what.
- Reference issues in the footer: `Refs: #123` or `Closes: #123`.
- Mark breaking changes with `!` after the type/scope **and** a footer:

  ```text
  feat(api)!: drop /v1 endpoints

  BREAKING CHANGE: callers must migrate to /v2 before this lands.
  ```

### Examples

```text
feat(pos): add cart line modifier UI
fix(inventory): clamp negative on-hand counts to zero
refactor(supabase): extract session refresh helper
docs(readme): document naming conventions
chore(deps): bump @supabase/ssr to 0.x
build(config): enable strict TypeScript noUncheckedIndexedAccess
ci: run lint and typecheck on PRs
```

### Branch naming

`<type>/<short-kebab-description>` — same `type` vocabulary as commits.

```text
feat/pos-cart-modifiers
fix/inventory-negative-counts
docs/naming-conventions
chore/upgrade-next-16
```

Long-lived branches (`main`, `develop`) and release branches
(`release/2026.05`) are the exceptions.

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
