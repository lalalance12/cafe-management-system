/**
 * Suppliers table shell: TanStack Query (list cache), TanStack Table (pagination/filter),
 */
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
import { FilterIcon, Search, UserPlus } from "lucide-react";

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
import { cn } from "@/lib/utils";
import { selectSupplierForm, useInventoryUI } from "@/stores/inventory-ui";

import { getSuppliers } from "./actions";
import { suppliersQueryKey } from "./query-keys";
import { SupplierDeactivateDialog } from "./supplier-deactivate-dialog";
import { SupplierFormModal } from "./supplier-form-modal";
import { supplierColumns } from "./suppliers-columns";
import type { SupplierRow } from "./types";

type SuppliersClientProps = {
  initialRows: SupplierRow[];
};

type StatusFilter = "all" | "active" | "inactive";

const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export function SuppliersClient({ initialRows }: SuppliersClientProps) {
  const openSupplierForm = useInventoryUI((s) => s.openSupplierForm);
  const supplierForm = useInventoryUI(selectSupplierForm);

  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const {
    data: rows = [],
    isFetching,
    error,
  } = useQuery({
    queryKey: suppliersQueryKey,
    queryFn: async () => {
      const result = await getSuppliers();
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
    initialData: initialRows,
  });

  const columnFilters = useMemo<ColumnFiltersState>(
    () => [{ id: "is_active", value: statusFilter }],
    [statusFilter],
  );

  const table = useReactTable({
    data: rows,
    columns: supplierColumns,
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
    },
  });

  const filteredCount = table.getFilteredRowModel().rows.length;
  const activeLabel =
    STATUS_FILTER_OPTIONS.find((o) => o.value === statusFilter)?.label ?? "All";

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <div className="relative min-w-48 flex-1 sm:max-w-xs">
          <Search className="text-foreground-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search suppliers…"
            className="rounded-sm ps-9"
            aria-label="Search suppliers"
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
        <Button
          variant="wood"
          className="ml-auto rounded-sm"
          onClick={() => openSupplierForm()}
        >
          <UserPlus />
          Add Supplier
        </Button>
      </div>

      <section className="bg-card flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-accent-foreground/5 p-4">
        <div className="flex shrink-0 items-center gap-2 pb-4">
          <h2 className="text-base font-semibold tracking-tight">
            All suppliers
          </h2>
          <span className="text-foreground-muted text-xs">
            {filteredCount} total
            {isFetching ? " · Updating…" : ""}
          </span>
        </div>

        {error ? (
          <p role="alert" className="text-destructive py-8 text-center text-sm">
            {error.message}
          </p>
        ) : filteredCount === 0 ? (
          <p className="text-foreground-muted flex-1 py-8 text-center text-sm">
            No suppliers match your filters.
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
            <DataTablePagination table={table} entityLabel="suppliers" />
          </div>
        )}
      </section>

      <SupplierFormModal
        key={
          supplierForm.open ? (supplierForm.supplier?.id ?? "add") : "closed"
        }
      />

      <SupplierDeactivateDialog />
    </div>
  );
}
