import type { Metadata } from "next";

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
import SummaryCard from "../../components/SummaryCard";
import { SupplierActions } from "./supplier-actions";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

export const metadata: Metadata = { title: "Suppliers" };

type SupplierRow = {
  id: string;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean;
};

export default async function SuppliersPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("suppliers")
    .select("id, name, contact_person, phone, email, is_active")
    .order("name");

  if (error) {
    console.error("suppliers fetch failed", error);
  }

  const rows = (data ?? []) as SupplierRow[];

  const totalVendors = rows.length;
  const activeVendors = rows.filter((r) => r.is_active).length;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Suppliers directory
          </h1>
          <p className="text-foreground-muted text-sm">
            Manage your ingredient sourcing and vendor partnerships.
          </p>
        </header>
        <Button variant="wood" className="rounded-sm">
          <UserPlus />
          Add Supplier
        </Button>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total vendors" value={totalVendors.toString()} />
        <SummaryCard
          label="Active vendors"
          value={activeVendors.toString()}
          tone={activeVendors === 0 ? "danger" : "neutral"}
        />
      </section>

      <section className="bg-card flex flex-col gap-4 rounded-lg border border-accent-foreground/5 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold tracking-tight">
            All suppliers
          </h2>
          <span className="text-foreground-muted text-xs">
            {totalVendors} total
          </span>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Supplier name</TableHead>
              <TableHead>Primary contact</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>{row.contact_person ?? "—"}</TableCell>
                <TableCell>{row.phone ?? "—"}</TableCell>
                <TableCell>{row.email ?? "—"}</TableCell>
                <TableCell>
                  {row.is_active ? (
                    <Badge
                      variant="outline"
                      className="border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                    >
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <SupplierActions
                    supplierId={row.id}
                    supplierName={row.name}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
