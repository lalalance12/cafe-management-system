import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { MOCK_STOCK, type StockRow } from "@/lib/mock/inventory";
import { JoinedStockRow } from "../helpers";
import dayjs from "dayjs";

export const metadata: Metadata = { title: "Alerts" };

export default async function AlertsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("branch_inventory")
    .select(
      "on_hand, updated_at, inventory_items(id, name, unit, low_stock_threshold)",
    );
  if (error) {
    console.error("Alerts fetch failed", error);
  }

  const joined = (data ?? []) as unknown as JoinedStockRow[];

  const rows: StockRow[] = joined.length
    ? joined.map((r) => ({
        id: r.inventory_items.id,
        name: r.inventory_items.name,
        unit: r.inventory_items.unit,
        on_hand: Number(r.on_hand),
        low_stock_threshold: Number(r.inventory_items.low_stock_threshold),
        updated_at: r.updated_at,
      }))
    : MOCK_STOCK;

  const alertRows = rows.filter(
    (row) => row.on_hand <= row.low_stock_threshold,
  );
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Alerts</h1>
          <p className="text-foreground-muted text-sm">
            Get notified when stock levels are low.
          </p>
        </header>
      </div>

      <section className="bg-card flex flex-col gap-4 rounded-lg border border-accent-foreground/5 p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Current stock</TableHead>
              <TableHead>Reorder at</TableHead>
              <TableHead>Shortage</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Last updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alertRows.map((row) => {
              const isOutOfStock = row.on_hand === 0;
              return (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>
                    {row.on_hand} {row.unit}
                  </TableCell>
                  <TableCell>{row.low_stock_threshold}</TableCell>
                  <TableCell>
                    {(row.low_stock_threshold - row.on_hand).toFixed(1)}{" "}
                    {row.unit}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        isOutOfStock
                          ? "border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950 dark:text-red-400"
                          : "border-yellow-300 bg-yellow-50 text-yellow-700 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
                      )}
                    >
                      {isOutOfStock ? "OUT OF STOCK" : "LOW STOCK"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {row.updated_at
                      ? dayjs(row.updated_at).format("MMM D")
                      : "—"}
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
