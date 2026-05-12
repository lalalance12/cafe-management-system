import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import { MOCK_STOCK, type StockRow } from "@/lib/mock/inventory";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import SummaryCard from "../components/SummaryCard";
import type { JoinedStockRow } from "./helpers";
import {
  getStatus,
  PROGRESS_TONE,
  STATUS_LABEL,
  STATUS_TONE,
} from "./helpers";

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

      <section className="bg-surface flex flex-col gap-4 rounded-lg border border-border p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold tracking-tight">
            All ingredients
          </h2>
          <span className="text-foreground-muted text-xs">
            {totalItems} total
          </span>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead className="w-[28%]">Stock level</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Reorder at</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const status = getStatus(row);
              const max = Math.max(row.low_stock_threshold * 5, row.on_hand);
              const pct =
                max > 0 ? Math.min((row.on_hand / max) * 100, 100) : 0;

              return (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs">
                        <span>
                          {row.on_hand.toFixed(1)} / {max.toFixed(1)}
                        </span>
                        <span className="text-foreground-muted">
                          {pct.toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full ${PROGRESS_TONE[status]}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{row.unit}</TableCell>
                  <TableCell>{row.low_stock_threshold.toFixed(1)}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONE[status]}`}
                    >
                      {STATUS_LABEL[status]}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
