"use client";

import dayjs from "dayjs";
import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import {
  formatPhpAmount,
  PURCHASE_ORDER_STATUS_CLASSES,
  PURCHASE_ORDER_STATUS_LABEL,
  purchaseOrderLabel,
  resolvePurchaseOrderStatus,
} from "../helpers";
import { PurchaseOrderActions } from "./purchase-order-actions";
import type { PORow } from "./types";

export const purchaseOrderColumns: ColumnDef<PORow>[] = [
  {
    accessorKey: "id",
    header: "PO ID",
    cell: ({ row }) => (
      <span className="font-medium">
        {purchaseOrderLabel(row.original.id)}
      </span>
    ),
  },
  {
    id: "supplier",
    accessorFn: (row) => row.suppliers?.name ?? "",
    header: "Supplier",
    cell: ({ row }) => row.original.suppliers?.name ?? "—",
  },
  {
    accessorKey: "created_at",
    header: "Order date",
    cell: ({ row }) => dayjs(row.original.created_at).format("MMM D, YYYY"),
  },
  {
    accessorKey: "expected_delivery_date",
    header: "Expected delivery",
    cell: ({ row }) => {
      const status = resolvePurchaseOrderStatus(row.original);
      return (
        <span
          className={cn(
            status === "overdue" && "font-medium text-red-600",
          )}
        >
          {row.original.expected_delivery_date
            ? dayjs(row.original.expected_delivery_date).format("MMM D, YYYY")
            : "Pending"}
        </span>
      );
    },
  },
  {
    accessorKey: "total_amount",
    header: "Total value",
    cell: ({ row }) =>
      formatPhpAmount(Number(row.original.total_amount ?? 0)),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = resolvePurchaseOrderStatus(row.original);
      return (
        <Badge
          variant="outline"
          className={PURCHASE_ORDER_STATUS_CLASSES[status]}
        >
          {PURCHASE_ORDER_STATUS_LABEL[status]}
        </Badge>
      );
    },
    filterFn: (row, _columnId, value) => {
      if (value === "all") return true;
      const resolved = resolvePurchaseOrderStatus(row.original);
      if (value === "overdue") return resolved === "overdue";
      return row.original.status === value;
    },
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <PurchaseOrderActions
        purchaseOrder={row.original}
        poLabel={purchaseOrderLabel(row.original.id)}
      />
    ),
    enableSorting: false,
    enableGlobalFilter: false,
  },
];
