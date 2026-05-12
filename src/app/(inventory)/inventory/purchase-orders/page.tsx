import type { Metadata } from "next";
import dayjs from "dayjs";

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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  MOCK_PURCHASE_ORDERS,
  type PurchaseOrderRow,
} from "@/lib/mock/inventory";
import SummaryCard from "../../components/SummaryCard";
import { PurchaseOrderActions } from "./purchase-order-actions";
import { Button } from "@/components/ui/button";
import { FilterIcon, PlusIcon } from "lucide-react";

export const metadata: Metadata = { title: "Purchase orders" };

const CURRENCY = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
});

type ResolvedStatus =
  | "draft"
  | "submitted"
  | "partial"
  | "received"
  | "cancelled"
  | "overdue";

/**
 * Derive a display-only "overdue" status when an in-flight PO has passed
 * its expected delivery date. The base `status` enum has no `overdue` value
 * because it's a function of time, not a stored state.
 */
function resolveStatus(row: PurchaseOrderRow): ResolvedStatus {
  if (
    row.expected_delivery_date !== null &&
    dayjs(row.expected_delivery_date).isBefore(dayjs(), "day") &&
    (row.status === "submitted" || row.status === "partial")
  ) {
    return "overdue";
  }
  return row.status;
}

const STATUS_LABEL: Record<ResolvedStatus, string> = {
  draft: "DRAFT",
  submitted: "SUBMITTED",
  partial: "PARTIAL",
  received: "RECEIVED",
  cancelled: "CANCELLED",
  overdue: "OVERDUE",
};

const STATUS_CLASSES: Record<ResolvedStatus, string> = {
  draft:
    "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-400",
  submitted:
    "border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-700 dark:bg-sky-950 dark:text-sky-400",
  partial:
    "border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-700 dark:bg-violet-950 dark:text-violet-400",
  received:
    "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  cancelled: "border-muted bg-muted text-muted-foreground",
  overdue:
    "border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950 dark:text-red-400",
};

/** Human-readable PO label derived from the row's UUID prefix. */
function poLabel(id: string): string {
  return `PO-${id.slice(0, 8).toUpperCase()}`;
}

export default async function PurchaseOrdersPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("purchase_orders")
    .select(
      "id, status, expected_delivery_date, total_amount, created_at, suppliers(name)",
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("purchase orders fetch failed", error);
  }

  const rows: PurchaseOrderRow[] =
    data && data.length > 0
      ? (data as unknown as PurchaseOrderRow[])
      : MOCK_PURCHASE_ORDERS;

  const activePOs = rows.filter(
    (r) => r.status !== "received" && r.status !== "cancelled",
  ).length;
  const totalValue = rows.reduce(
    (sum, r) => sum + Number(r.total_amount ?? 0),
    0,
  );
  const pendingDelivery = rows.filter(
    (r) => r.status === "submitted" || r.status === "partial",
  ).length;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Purchase orders
          </h1>
          <p className="text-foreground-muted text-sm">
            Procure inventory from your artisan suppliers.
          </p>
        </header>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto" disabled>
                <FilterIcon />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem key="name">
                Name
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="wood" className="rounded-sm" disabled>
            <PlusIcon />
            Add Purchase Order
          </Button>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Active POs" value={activePOs.toString()} />
        <SummaryCard label="Total value" value={CURRENCY.format(totalValue)} />
        <SummaryCard
          label="Pending delivery"
          value={pendingDelivery.toString()}
          tone={pendingDelivery > 0 ? "warning" : "neutral"}
        />
      </section>

      <section className="bg-card flex flex-col gap-4 rounded-lg border border-accent-foreground/5 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold tracking-tight">
            All purchase orders
          </h2>
          <span className="text-foreground-muted text-xs">
            {rows.length} total
          </span>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PO ID</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Order date</TableHead>
              <TableHead>Expected delivery</TableHead>
              <TableHead>Total value</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const status = resolveStatus(row);
              const label = poLabel(row.id);
              return (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{label}</TableCell>
                  <TableCell>{row.suppliers?.name ?? "—"}</TableCell>
                  <TableCell>
                    {dayjs(row.created_at).format("MMM D, YYYY")}
                  </TableCell>
                  <TableCell
                    className={cn(
                      status === "overdue" && "text-red-600 font-medium",
                    )}
                  >
                    {row.expected_delivery_date
                      ? dayjs(row.expected_delivery_date).format("MMM D, YYYY")
                      : "Pending"}
                  </TableCell>
                  <TableCell>
                    {CURRENCY.format(Number(row.total_amount ?? 0))}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={STATUS_CLASSES[status]}>
                      {STATUS_LABEL[status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <PurchaseOrderActions
                      purchaseOrderId={row.id}
                      poLabel={label}
                    />
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
