import { cookies } from "next/headers";
import type { ReactNode } from "react";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import type { NavItem } from "@/components/layout/app-sidebar";
import { AppNavbar } from "@/components/layout/app-navbar";

export type { NavItem };

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
 * Wraps content in the shadcn SidebarProvider so the sidebar state is
 * persisted via cookie across server renders. Client boundaries are
 * isolated inside AppSidebar and AppNavbar.
 */
export async function AppShell({
  eyebrow,
  title,
  nav,
  actions,
  children,
}: AppShellProps) {
  const cookieStore = await cookies();
  const defaultOpen =
    cookieStore.get("sidebar_state")?.value === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar eyebrow={eyebrow} title={title} nav={nav} />
      <main className="flex w-full min-h-dvh flex-col">
        <AppNavbar actions={actions} />
        <div className="flex-1 px-6 py-8">{children}</div>
      </main>
    </SidebarProvider>
  );
}
