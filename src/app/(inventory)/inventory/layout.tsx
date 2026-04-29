import type { ReactNode } from "react";

import { AppShell, type NavItem } from "@/components/layout/app-shell";

const NAV: ReadonlyArray<NavItem> = [
  { href: "/inventory", label: "Stock levels" },
  { href: "/inventory/alerts", label: "Low stock alerts" },
  { href: "/inventory/suppliers", label: "Suppliers" },
  { href: "/inventory/purchase-orders", label: "Purchase orders" },
];

export default function InventoryLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AppShell eyebrow="Back of house" title="Inventory" nav={NAV}>
      {children}
    </AppShell>
  );
}
