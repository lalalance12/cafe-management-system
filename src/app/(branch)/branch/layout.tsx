import type { ReactNode } from "react";

import { AppShell, type NavItem } from "@/components/layout/app-shell";

const NAV: ReadonlyArray<NavItem> = [
  { href: "/branch", label: "Overview" },
  { href: "/branch/sales", label: "Sales reports" },
  { href: "/branch/staff", label: "Staff schedule" },
  { href: "/branch/menu", label: "Local menu" },
  { href: "/branch/waste", label: "Waste tracking" },
];

export default function BranchLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell eyebrow="Local management" title="Branch" nav={NAV}>
      {children}
    </AppShell>
  );
}
