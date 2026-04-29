import type { ReactNode } from "react";

import { AppShell, type NavItem } from "@/components/layout/app-shell";

const NAV: ReadonlyArray<NavItem> = [
  { href: "/pos", label: "Order entry" },
  { href: "/pos/tables", label: "Tables" },
  { href: "/pos/payments", label: "Payments" },
  { href: "/pos/history", label: "Order history" },
];

export default function PosLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell eyebrow="Front of house" title="POS" nav={NAV}>
      {children}
    </AppShell>
  );
}
