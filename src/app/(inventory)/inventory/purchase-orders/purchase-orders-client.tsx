"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { FilterIcon, PlusIcon } from "lucide-react";

import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  selectPOForm,
  selectPOStatusDialog,
  useInventoryUI,
} from "@/stores/inventory-ui";

import SummaryCard from "../../components/SummaryCard";
import { formatPhpAmount } from "../helpers";
import { getPurchaseOrders } from "./actions";
import { PODetailDialog } from "./po-detail-dialog";
import { POFormModal } from "./po-form-modal";
import { POStatusDialog } from "./po-status-dialog";
import { purchaseOrderColumns } from "./purchase-orders-columns";
import { purchaseOrdersQueryKey } from "./query-keys";
import type { PORow, PurchaseOrderStatus } from "./types";

type PurchaseOrdersClientProps = {
  initialRows: PORow[];
};

type StatusFilter = "all" | PurchaseOrderStatus | "overdue";

const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "submitted", label: "Submitted" },
  { value: "partial", label: "Partial" },
  { value: "received", label: "Received" },
  { value: "cancelled", label: "Cancelled" },
  { value: "overdue", label: "Overdue" },
];

export function PurchaseOrdersClient({
  initialRows,
}: PurchaseOrdersClientProps) {
  const openPOForm = useInventoryUI((s) => s.openPOForm);
  const poForm = useInventoryUI(selectPOForm);
  const poStatusDialog = useInventoryUI(selectPOStatusDialog);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const {
    data: rows = [],
    isFetching,
    error,
  } = useQuery({
    queryKey: purchaseOrdersQueryKey,
    queryFn: async () => {
      const result = await getPurchaseOrders();
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
    initialData: initialRows,
  });

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

  const columnFilters = useMemo<ColumnFiltersState>(
    () => [{ id: "status", value: statusFilter }],
    [statusFilter],
  );

  const table = useReactTable({
    data: rows,
    columns: purchaseOrderColumns,
    state: { columnFilters },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
      sorting: [{ id: "created_at", desc: true }],
    },
  });

  const filteredCount = table.getFilteredRowModel().rows.length;

  return (
    <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Active POs" value={activePOs.toString()} />
        <SummaryCard label="Total value" value={formatPhpAmount(totalValue)} />
        <SummaryCard
          label="Pending delivery"
          value={pendingDelivery.toString()}
          tone={pendingDelivery > 0 ? "warning" : "neutral"}
        />
      </section>

      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="rounded-sm">
              <FilterIcon />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {STATUS_FILTER_OPTIONS.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={statusFilter === option.value}
                onCheckedChange={() => setStatusFilter(option.value)}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="wood"
          className="rounded-sm"
          onClick={() => openPOForm()}
        >
          <PlusIcon />
          Add Purchase Order
        </Button>
      </div>

      <section className="bg-card flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-accent-foreground/5 p-4">
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 pb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold tracking-tight">
              All purchase orders
            </h2>
            <span className="text-foreground-muted text-xs">
              {filteredCount} total
              {isFetching ? " · Updating…" : ""}
            </span>
          </div>
        </div>

        {error ? (
          <p role="alert" className="text-destructive py-8 text-center text-sm">
            {error.message}
          </p>
        ) : filteredCount === 0 ? (
          <p className="text-foreground-muted flex-1 py-8 text-center text-sm">
            No purchase orders match your filters.
          </p>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-0">
            <div className="min-h-0 flex-1 overflow-auto">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className={cn(
                            header.column.id === "actions" && "w-12",
                          )}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <DataTablePagination table={table} entityLabel="purchase orders" />
          </div>
        )}
      </section>

      <POFormModal key={poForm.open ? "open" : "closed"} />
      <PODetailDialog />
      <POStatusDialog
        key={`${poStatusDialog.poId ?? "none"}-${poStatusDialog.action ?? "none"}`}
      />
    </>
  );
}
