import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-6 py-16">
      <div className="flex w-full max-w-sm flex-col gap-6 rounded-lg border border-border bg-surface p-8 shadow-sm">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-wood-500">
            Cafe Management System
          </span>
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="text-sm text-foreground-muted">
            Authentication is wired up to Supabase. Hook this form to
            <code className="mx-1 rounded bg-surface-muted px-1.5 py-0.5 font-mono text-xs">
              supabase.auth.signInWithPassword
            </code>
            once you decide on the auth flow.
          </p>
        </div>

        <form className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Email</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none"
              disabled
              placeholder="you@example.com"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Password</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none"
              disabled
              placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
            />
          </label>
          <button
            type="button"
            disabled
            className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-foreground opacity-60"
          >
            Sign in (not wired up yet)
          </button>
        </form>

        <Link
          href="/"
          className="text-center text-xs text-foreground-muted hover:text-foreground"
        >
          &larr; Back to roles
        </Link>
      </div>
    </div>
  );
}
