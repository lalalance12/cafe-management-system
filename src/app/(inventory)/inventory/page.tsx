import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import { MOCK_STOCK, type StockRow } from "@/lib/mock/inventory";

import SummaryCard from "../components/SummaryCard";
import type { JoinedStockRow } from "./helpers";
import { StockTableClient } from "./stock-table-client";

export const metadata: Metadata = { title: "Inventory" };

export default async function InventoryPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("branch_inventory")
    .select("on_hand, inventory_items(id, name, unit, low_stock_threshold)");

  if (error) {
    console.error("inventory fetch failed", error);
  }

  const joined = (data ?? []) as unknown as JoinedStockRow[];

  const rows: StockRow[] = joined.length
    ? joined.map((r) => ({
        id: r.inventory_items.id,
        name: r.inventory_items.name,
        unit: r.inventory_items.unit,
        on_hand: Number(r.on_hand),
        low_stock_threshold: Number(r.inventory_items.low_stock_threshold),
      }))
    : MOCK_STOCK;

  const totalItems = rows.length;
  const lowStockCount = rows.filter(
    (r) => r.on_hand > 0 && r.on_hand <= r.low_stock_threshold,
  ).length;
  const outOfStockCount = rows.filter((r) => r.on_hand === 0).length;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Stock levels</h1>
        <p className="text-foreground-muted text-sm">
          Monitor on-hand quantities in real time and react before anything runs
          out.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Items tracked" value={totalItems.toString()} />
        <SummaryCard
          label="Low stock alerts"
          value={`${lowStockCount} item${lowStockCount === 1 ? "" : "s"}`}
          tone={lowStockCount > 0 ? "warning" : "neutral"}
        />
        <SummaryCard
          label="Out of stock"
          value={`${outOfStockCount} item${outOfStockCount === 1 ? "" : "s"}`}
          tone={outOfStockCount > 0 ? "danger" : "neutral"}
        />
        <SummaryCard label="Open purchase orders" value="—" />
      </section>

      <StockTableClient rows={rows} />
    </div>
  );
}
