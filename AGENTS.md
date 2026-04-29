<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Cafe Management System — agent rules

This file is the source of truth for AI assistants working in this repo.
`CLAUDE.md` re-exports it, so keep it up to date.

## Product

A multi-role cafe chain platform with four primary surfaces:

| Role              | URL          | Audience                   |
| ----------------- | ------------ | -------------------------- |
| POS               | `/pos`       | Barista / server           |
| Inventory         | `/inventory` | Inventory personnel        |
| Branch dashboard  | `/branch`    | Branch manager             |
| Global admin      | `/admin`     | Owner / executive          |

Each surface is its own route group under `src/app/`. They share UI
primitives in `src/components/layout/` but otherwise stay decoupled so
permissions can diverge without forcing a rewrite.

## Stack

- Next.js 16 (App Router, Server Components by default).
- Tailwind CSS v4 using the `@theme inline` block in `src/app/globals.css`
  for design tokens (`bg-surface`, `text-accent`, `border-wood-200`, ...).
- Supabase via `@supabase/ssr` for Auth + Postgres + Realtime.
- TypeScript with `strict` mode (see `tsconfig.json`).

## Conventions

### Routing
- One route group per role: `(auth)`, `(pos)`, `(inventory)`, `(branch)`,
  `(admin)`. The group is invisible in the URL.
- Layouts live alongside their pages (e.g. `(pos)/pos/layout.tsx`) and
  wrap their section in the shared `AppShell`.
- API endpoints belong under `src/app/api/<feature>/route.ts`.

### Server vs client
- Default to Server Components. Mark client islands explicitly with
  `"use client"`.
- Never hit Supabase from a Server Component using the browser client. Use
  `createClient()` from `src/lib/supabase/server.ts`.
- For trusted, RLS-bypassing operations use `createAdminClient()` from
  `src/lib/supabase/admin.ts`. That module is `server-only`; importing it
  from a client component is a build error.

### Auth
- Session refresh runs in `src/proxy.ts` (formerly middleware). Don't add
  another auth refresh layer.
- Prefer `supabase.auth.getClaims()` over `getSession()` for any
  authorization decision. `getUser()` is fine when you need fresh user
  data from the Auth server.

### Environment variables
- Read through `src/lib/env.ts`. It throws a readable error on missing
  values; do not access `process.env.*` directly elsewhere.
- New variables must be added to `.env.example` *and* `src/lib/env.ts` in
  the same change.

### Styling
- Use Tailwind utility classes. Reach for the design tokens
  (`bg-surface`, `text-foreground-muted`, `border-border`, the `wood-*`
  scale, `accent`/`accent-hover`/`accent-foreground`) before introducing
  ad-hoc colors. New tokens go in `globals.css` and only there.
- The visual brief: warm wood tones + slate gray + a single accent
  (forest-green by default). Keep contrast ratios at AA or better.
- Typography is sans-serif (Geist). Avoid serif overrides.

### Code style
- Strict TypeScript. No `any` without justification in a comment.
- Prefer named exports. Default exports are reserved for Next.js file
  conventions (`page.tsx`, `layout.tsx`, route handlers, etc.).
- No comments that just restate the code. Comments should explain
  non-obvious intent or trade-offs.
- `npm run lint` must pass before committing.

## Database
- Schema is **not yet** defined. When it is, regenerate types into
  `src/lib/supabase/types.ts` (command in the file header).
- Always add Row Level Security policies for new tables; the anon key is
  shipped to the browser.

## Anti-patterns
- Putting business logic in `src/proxy.ts` (it must stay fast and
  side-effect free beyond session refresh).
- Bypassing `src/lib/env.ts` to read env vars.
- Importing `src/lib/supabase/admin.ts` from a client component.
- Hard-coding role-specific copy or layout into `AppShell`; pass it via
  props instead.
