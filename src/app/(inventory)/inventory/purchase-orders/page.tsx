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
import {
  formatPhpAmount,
  PURCHASE_ORDER_STATUS_CLASSES,
  PURCHASE_ORDER_STATUS_LABEL,
  purchaseOrderLabel,
  resolvePurchaseOrderStatus,
} from "../helpers";
import { PurchaseOrderActions } from "./purchase-order-actions";
import { Button } from "@/components/ui/button";
import { FilterIcon, PlusIcon } from "lucide-react";

export const metadata: Metadata = { title: "Purchase orders" };

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
        <SummaryCard label="Total value" value={formatPhpAmount(totalValue)} />
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
              const status = resolvePurchaseOrderStatus(row);
              const label = purchaseOrderLabel(row.id);
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
                    {formatPhpAmount(Number(row.total_amount ?? 0))}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={PURCHASE_ORDER_STATUS_CLASSES[status]}
                    >
                      {PURCHASE_ORDER_STATUS_LABEL[status]}
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
