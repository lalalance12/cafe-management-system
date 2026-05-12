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

export const metadata: Metadata = { title: "Inventory" };

type StockStatus = "out_of_stock" | "low_stock" | "in_stock";

/**
 * Joined row shape from Supabase. PostgREST returns the embedded relation as
 * an object when the FK side is non-nullable, but its generated type can be
 * unioned with arrays — narrow it here for the .map() below.
 */
type JoinedStockRow = {
  on_hand: number | string;
  inventory_items: {
    id: string;
    name: string;
    unit: string;
    low_stock_threshold: number | string;
  };
};

function getStatus(row: StockRow): StockStatus {
  if (row.on_hand === 0) return "out_of_stock";
  if (row.on_hand <= row.low_stock_threshold) return "low_stock";
  return "in_stock";
}

const STATUS_LABEL: Record<StockStatus, string> = {
  out_of_stock: "OUT OF STOCK",
  low_stock: "LOW STOCK",
  in_stock: "IN STOCK",
};

const STATUS_TONE: Record<StockStatus, string> = {
  out_of_stock: "bg-red-100 text-red-700",
  low_stock: "bg-amber-100 text-amber-700",
  in_stock: "bg-emerald-100 text-emerald-700",
};

const PROGRESS_TONE: Record<StockStatus, string> = {
  out_of_stock: "bg-red-500",
  low_stock: "bg-amber-500",
  in_stock: "bg-emerald-500",
};

export default async function InventoryPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("branch_inventory")
    .select(
      "on_hand, inventory_items(id, name, unit, low_stock_threshold)",
    );

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
          Monitor on-hand quantities in real time and react before anything
          runs out.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Items tracked" value={totalItems.toString()} />
        <StatCard
          label="Low stock alerts"
          value={`${lowStockCount} item${lowStockCount === 1 ? "" : "s"}`}
          tone={lowStockCount > 0 ? "warning" : "neutral"}
        />
        <StatCard
          label="Out of stock"
          value={`${outOfStockCount} item${outOfStockCount === 1 ? "" : "s"}`}
          tone={outOfStockCount > 0 ? "danger" : "neutral"}
        />
        <StatCard label="Open purchase orders" value="—" />
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

type StatCardTone = "neutral" | "warning" | "danger";

function StatCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: StatCardTone;
}) {
  const valueTone =
    tone === "danger"
      ? "text-red-600"
      : tone === "warning"
        ? "text-amber-600"
        : "text-foreground";

  return (
    <div className="bg-surface flex flex-col gap-1 rounded-lg border border-border p-4">
      <span className="text-foreground-muted text-xs font-medium uppercase tracking-wide">
        {label}
      </span>
      <span className={`text-2xl font-semibold tracking-tight ${valueTone}`}>
        {value}
      </span>
    </div>
  );
}
