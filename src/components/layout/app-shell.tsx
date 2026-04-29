import Link from "next/link";
import type { ReactNode } from "react";

export type NavItem = {
  href: string;
  label: string;
};

type AppShellProps = {
  /** Short label shown above the section title. */
  eyebrow: string;
  /** Section title (e.g. "POS", "Inventory"). */
  title: string;
  /** Sidebar navigation items for this section. */
  nav: ReadonlyArray<NavItem>;
  /** Optional slot rendered in the top-right of the header. */
  actions?: ReactNode;
  children: ReactNode;
};

/**
 * Generic shell shared by every authenticated section.
 *
 * Each role-specific layout wraps its pages in this component so the chrome
 * (sidebar, header, etc.) stays consistent without coupling roles together.
 */
export function AppShell({
  eyebrow,
  title,
  nav,
  actions,
  children,
}: AppShellProps) {
  return (
    <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-[16rem_1fr]">
      <aside className="hidden border-r border-border bg-surface lg:flex lg:flex-col">
        <div className="flex flex-col gap-1 px-6 py-6">
          <Link
            href="/"
            className="text-xs font-medium uppercase tracking-[0.2em] text-wood-500 hover:text-wood-600"
          >
            {eyebrow}
          </Link>
          <span className="text-xl font-semibold tracking-tight">{title}</span>
        </div>
        <nav className="flex flex-col gap-1 px-3 pb-6">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto px-6 py-6 text-xs text-foreground-muted">
          <Link href="/" className="hover:text-foreground">
            &larr; Back to roles
          </Link>
        </div>
      </aside>

      <div className="flex min-h-dvh flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-border bg-surface px-6 py-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-wood-500 lg:hidden">
              {eyebrow}
            </span>
            <span className="text-sm font-semibold tracking-tight lg:hidden">
              {title}
            </span>
          </div>
          <div className="flex items-center gap-3">{actions}</div>
        </header>
        <main className="flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
