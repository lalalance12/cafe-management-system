import type { ReactNode } from "react";

import { AppShell, type NavItem } from "@/components/layout/app-shell";

const NAV: ReadonlyArray<NavItem> = [
  { href: "/admin", label: "Global overview" },
  { href: "/admin/branches", label: "Branches" },
  { href: "/admin/menu", label: "Menu & pricing" },
  { href: "/admin/users", label: "Users & roles" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell eyebrow="Executive" title="Global admin" nav={NAV}>
      {children}
    </AppShell>
  );
}
