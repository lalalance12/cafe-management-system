import type { Metadata } from "next";

import { PlaceholderCard } from "@/components/layout/placeholder-card";

export const metadata: Metadata = { title: "Inventory" };

export default function InventoryPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Stock levels</h1>
        <p className="text-sm text-foreground-muted">
          Monitor on-hand quantities in real time and react before anything
          runs out.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <PlaceholderCard
          title="On-hand by item"
          description="Live counts grouped by category once the inventory tables are wired up."
        />
        <PlaceholderCard
          title="Low stock alerts"
          description="Threshold-based warnings surface here so they cannot be missed."
        />
        <PlaceholderCard
          title="Open purchase orders"
          description="Track POs in flight and expected delivery dates per supplier."
        />
      </div>
    </div>
  );
}
