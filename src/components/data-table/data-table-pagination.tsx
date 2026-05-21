"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import type { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

type DataTablePaginationProps<TData> = {
  table: Table<TData>;
  entityLabel?: string;
};

export function DataTablePagination<TData>({
  table,
  entityLabel = "items",
}: DataTablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const pageCount = table.getPageCount();
  const filteredCount = table.getFilteredRowModel().rows.length;
  const start = filteredCount === 0 ? 0 : pageIndex * pageSize + 1;
  const end = Math.min((pageIndex + 1) * pageSize, filteredCount);

  const pageNumbers = getPageNumbers(pageIndex, pageCount);

  return (
    <div className="flex shrink-0 flex-col gap-3 border-t border-accent-foreground/5 px-1 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3 text-xs text-foreground-muted">
        <label className="flex items-center gap-2">
          <span className="uppercase tracking-wide">Rows per page</span>
          <select
            className="rounded-sm border border-input bg-background px-2 py-1 text-sm text-foreground"
            value={pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
        <span>
          Showing {start}–{end} of {filteredCount} {entityLabel}
        </span>
      </div>

      <div className="flex items-center justify-end gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="rounded-sm"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
          aria-label="First page"
        >
          <ChevronsLeft className="size-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="rounded-sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </Button>

        {pageNumbers.map((page) =>
          page === "ellipsis" ? (
            <span
              key={`ellipsis-${pageIndex}-${pageCount}`}
              className="px-2 text-sm text-foreground-muted"
            >
              …
            </span>
          ) : (
            <Button
              key={page}
              type="button"
              variant={pageIndex === page ? "wood" : "outline"}
              size="icon-sm"
              className={cn("min-w-8 rounded-sm", pageIndex !== page && "font-normal")}
              onClick={() => table.setPageIndex(page)}
              aria-label={`Page ${page + 1}`}
              aria-current={pageIndex === page ? "page" : undefined}
            >
              {page + 1}
            </Button>
          ),
        )}

        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="rounded-sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="rounded-sm"
          onClick={() => table.setPageIndex(pageCount - 1)}
          disabled={!table.getCanNextPage()}
          aria-label="Last page"
        >
          <ChevronsRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function getPageNumbers(
  current: number,
  total: number,
): Array<number | "ellipsis"> {
  if (total <= 1) return total === 1 ? [0] : [];
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i);
  }

  const pages: Array<number | "ellipsis"> = [0];

  if (current > 2) pages.push("ellipsis");

  const start = Math.max(1, current - 1);
  const end = Math.min(total - 2, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 3) pages.push("ellipsis");

  pages.push(total - 1);
  return pages;
}
