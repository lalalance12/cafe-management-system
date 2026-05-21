"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";

import { SupplierActions } from "./supplier-actions";
import type { SupplierRow } from "./types";

export const supplierColumns: ColumnDef<SupplierRow>[] = [
  {
    accessorKey: "name",
    header: "Supplier name",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.name}</span>
    ),
  },
  {
    accessorKey: "contact_person",
    header: "Primary contact",
    cell: ({ row }) => row.original.contact_person ?? "—",
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => row.original.phone ?? "—",
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => row.original.email ?? "—",
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) =>
      row.original.is_active ? (
        <Badge
          variant="outline"
          className="border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
        >
          Active
        </Badge>
      ) : (
        <Badge variant="secondary">Inactive</Badge>
      ),
    filterFn: (row, _columnId, value) => {
      if (value === "all") return true;
      if (value === "active") return row.original.is_active;
      return !row.original.is_active;
    },
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <SupplierActions supplier={row.original} />,
    enableSorting: false,
    enableGlobalFilter: false,
  },
];
