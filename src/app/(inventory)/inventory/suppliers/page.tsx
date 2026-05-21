import type { Metadata } from "next";
import { Building2, UserCheck } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import SummaryCard from "../../components/SummaryCard";
import { SuppliersClient } from "./suppliers-client";
import type { SupplierRow } from "./types";

export const metadata: Metadata = { title: "Suppliers" };

export default async function SuppliersPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("suppliers")
    .select("id, name, contact_person, phone, email, address, is_active")
    .order("name");

  if (error) {
    console.error("suppliers fetch failed", error);
  }

  const rows = (data ?? []) as SupplierRow[];

  const totalVendors = rows.length;
  const activeVendors = rows.filter((r) => r.is_active).length;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Suppliers directory
        </h1>
        <p className="text-foreground-muted text-sm">
          Manage your ingredient sourcing and vendor partnerships.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total vendors"
          value={totalVendors.toString()}
          color="sky"
          icon={Building2}
        />
        <SummaryCard
          label="Active vendors"
          value={activeVendors.toString()}
          color={activeVendors === 0 ? "red" : "green"}
          icon={UserCheck}
        />
      </section>

      <div className="flex min-h-0 flex-1 flex-col">
        <SuppliersClient initialRows={rows} />
      </div>
    </div>
  );
}
