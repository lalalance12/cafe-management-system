"use client";

import type { ColumnDef } from "@tanstack/react-table";

import type { StockRow } from "@/lib/mock/inventory";

import {
  getStatus,
  PROGRESS_TONE,
  STATUS_LABEL,
  STATUS_TONE,
} from "./helpers";
import type { StockStatus } from "./helpers/types";

function stockLevelMax(row: StockRow) {
  return Math.max(row.low_stock_threshold * 5, row.on_hand);
}

export const stockColumns: ColumnDef<StockRow>[] = [
  {
    accessorKey: "name",
    header: "Item",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.name}</span>
    ),
  },
  {
    id: "stock_level",
    header: "Stock level",
    cell: ({ row }) => {
      const status = getStatus(row.original);
      const max = stockLevelMax(row.original);
      const pct =
        max > 0
          ? Math.min((row.original.on_hand / max) * 100, 100)
          : 0;

      return (
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs">
            <span>
              {row.original.on_hand.toFixed(1)} / {max.toFixed(1)}
            </span>
            <span className="text-foreground-muted">{pct.toFixed(0)}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${PROGRESS_TONE[status]}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      );
    },
    enableSorting: false,
    enableGlobalFilter: false,
  },
  {
    accessorKey: "unit",
    header: "Unit",
    enableGlobalFilter: false,
  },
  {
    accessorKey: "low_stock_threshold",
    header: "Reorder at",
    cell: ({ row }) => row.original.low_stock_threshold.toFixed(1),
    enableGlobalFilter: false,
  },
  {
    id: "status",
    header: "Status",
    accessorFn: (row) => getStatus(row),
    cell: ({ row }) => {
      const status = getStatus(row.original);
      return (
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONE[status]}`}
        >
          {STATUS_LABEL[status]}
        </span>
      );
    },
    filterFn: (row, _columnId, value: StockStatus | "all") => {
      if (value === "all") return true;
      return getStatus(row.original) === value;
    },
    enableGlobalFilter: false,
  },
];
