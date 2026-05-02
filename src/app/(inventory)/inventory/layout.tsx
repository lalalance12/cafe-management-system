import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { AppShell, type NavItem } from "@/components/layout/app-shell";

const NAV: ReadonlyArray<NavItem> = [
  { href: "/inventory", label: "Stock levels" },
  { href: "/inventory/alerts", label: "Low stock alerts" },
  { href: "/inventory/suppliers", label: "Suppliers" },
  { href: "/inventory/purchase-orders", label: "Purchase orders" },
];

export default async function InventoryLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data) {
    redirect("/login");
  }

  return (
    <AppShell eyebrow="Back of house" title="Inventory" nav={NAV}>
      {children}
    </AppShell>
  );
}
