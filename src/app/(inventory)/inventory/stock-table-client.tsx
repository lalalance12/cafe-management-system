"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { FilterIcon, Search } from "lucide-react";

import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { StockRow } from "@/lib/mock/inventory";

import { stockColumns } from "./stock-columns";
import type { StockStatus } from "./helpers/types";

type StockTableClientProps = {
  rows: StockRow[];
};

type StatusFilter = "all" | StockStatus;

const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "in_stock", label: "In stock" },
  { value: "low_stock", label: "Low stock" },
  { value: "out_of_stock", label: "Out of stock" },
];

export function StockTableClient({ rows }: StockTableClientProps) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const columnFilters = useMemo<ColumnFiltersState>(
    () => [{ id: "status", value: statusFilter }],
    [statusFilter],
  );

  const table = useReactTable({
    data: rows,
    columns: stockColumns,
    state: {
      globalFilter,
      columnFilters,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue) => {
      const query = String(filterValue).trim().toLowerCase();
      if (!query) return true;
      return row.original.name.toLowerCase().includes(query);
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
      sorting: [{ id: "name", desc: false }],
    },
  });

  const filteredCount = table.getFilteredRowModel().rows.length;

  const activeLabel =
    STATUS_FILTER_OPTIONS.find((o) => o.value === statusFilter)?.label ?? "All";

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {/* Toolbar above card */}
      <div className="flex shrink-0 items-center gap-2">
        <div className="relative min-w-48 flex-1 sm:max-w-xs">
          <Search className="text-foreground-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search ingredients…"
            className="rounded-sm ps-9"
            aria-label="Search ingredients"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="rounded-sm">
              <FilterIcon />
              {activeLabel}
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
      </div>

      <section className="bg-card flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-accent-foreground/5 p-4">
        <div className="flex shrink-0 items-center gap-2 pb-4">
          <h2 className="text-base font-semibold tracking-tight">
            All ingredients
          </h2>
          <span className="text-foreground-muted text-xs">
            {filteredCount} total
          </span>
        </div>

        {filteredCount === 0 ? (
          <p className="text-foreground-muted flex-1 py-8 text-center text-sm">
            No ingredients match your filters.
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
                          className={
                            header.column.id === "stock_level"
                              ? "w-[28%]"
                              : undefined
                          }
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
            <DataTablePagination table={table} entityLabel="items" />
          </div>
        )}
      </section>
    </div>
  );
}
