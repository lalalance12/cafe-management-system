import Link from "next/link";

const ROLES = [
  {
    href: "/pos",
    eyebrow: "Front of house",
    title: "POS",
    description:
      "Take orders, process payments, and keep the line moving with a touch-first interface.",
  },
  {
    href: "/inventory",
    eyebrow: "Back of house",
    title: "Inventory",
    description:
      "Track stock, manage suppliers, and create purchase orders before you run out.",
  },
  {
    href: "/branch",
    eyebrow: "Local management",
    title: "Branch dashboard",
    description:
      "Monitor daily performance, schedule shifts, and adjust the menu for your location.",
  },
  {
    href: "/admin",
    eyebrow: "Executive",
    title: "Global admin",
    description:
      "See chain-wide revenue, manage branches, and control menu, pricing, and roles.",
  },
] as const;

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-6 py-16 sm:px-10">
      <header className="flex flex-col gap-4 border-b border-border pb-10">
        <span className="text-sm font-medium uppercase tracking-[0.2em] text-wood-500">
          Cafe Management System
        </span>
        <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          One platform for the counter, the stockroom, the branch, and the
          boardroom.
        </h1>
        <p className="max-w-2xl text-base text-foreground-muted sm:text-lg">
          Pick the role you want to explore. Each surface ships with the data
          and controls that role actually needs &mdash; nothing more, nothing
          less.
        </p>
      </header>

      <section className="grid gap-4 py-12 sm:grid-cols-2">
        {ROLES.map((role) => (
          <Link
            key={role.href}
            href={role.href}
            className="group flex flex-col gap-3 rounded-lg border border-border bg-surface p-6 transition-colors hover:border-accent hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-wood-500">
              {role.eyebrow}
            </span>
            <h2 className="text-2xl font-semibold tracking-tight">
              {role.title}
            </h2>
            <p className="text-sm text-foreground-muted">{role.description}</p>
            <span className="mt-auto text-sm font-medium text-accent group-hover:text-accent-hover">
              Open &rarr;
            </span>
          </Link>
        ))}
      </section>

      <footer className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 text-xs text-foreground-muted">
        <span>Next.js 16 &middot; Tailwind v4 &middot; Supabase</span>
        <Link
          href="/api/health"
          className="font-medium text-accent hover:text-accent-hover"
        >
          /api/health
        </Link>
      </footer>
    </main>
  );
}
