import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import { MOCK_PURCHASE_ORDERS } from "@/lib/mock/inventory";

import { PurchaseOrdersClient } from "./purchase-orders-client";
import type { PORow } from "./types";

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

  const rows: PORow[] =
    data && data.length > 0 ? (data as unknown as PORow[]) : MOCK_PURCHASE_ORDERS;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Purchase orders
        </h1>
        <p className="text-foreground-muted text-sm">
          Procure inventory from your artisan suppliers.
        </p>
      </header>

      <PurchaseOrdersClient initialRows={rows} />
    </div>
  );
}
