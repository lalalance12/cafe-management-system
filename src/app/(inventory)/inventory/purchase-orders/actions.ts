"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import {
  poFormSchema,
  receivePOSchema,
  submitPOSchema,
  computePOTotal,
  type BranchInventoryItemRow,
  type PODetailRow,
  type POFormValues,
  type PORow,
  type ReceivePOValues,
  type SubmitPOValues,
} from "./types";

const PURCHASE_ORDERS_PATH = "/inventory/purchase-orders";

type ActionResult = { error: string | null };
type CreatePOResult = ActionResult & { id: string | null };

async function requireUserWithBranch() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      supabase,
      user: null,
      branchId: null,
      error: "You must be signed in.",
    };
  }

  const { data: staff, error: staffError } = await supabase
    .from("branch_staff")
    .select("branch_id")
    .eq("profile_id", user.id)
    .single();

  if (staffError || !staff) {
    return {
      supabase,
      user,
      branchId: null,
      error: "No branch assignment found for your account.",
    };
  }

  return {
    supabase,
    user,
    branchId: (staff as { branch_id: string }).branch_id,
    error: null,
  };
}

export async function getPurchaseOrders(): Promise<{
  error: string | null;
  data: PORow[];
}> {
  const auth = await requireUserWithBranch();
  if (auth.error) return { error: auth.error, data: [] };

  const { data, error } = await auth.supabase
    .from("purchase_orders")
    .select(
      "id, status, expected_delivery_date, total_amount, created_at, suppliers(name)",
    )
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message, data: [] };
  }

  return { error: null, data: (data ?? []) as PORow[] };
}

export async function getPurchaseOrderDetail(
  id: string,
): Promise<{ error: string | null; data: PODetailRow | null }> {
  const auth = await requireUserWithBranch();
  if (auth.error) return { error: auth.error, data: null };

  const { data, error } = await auth.supabase
    .from("purchase_orders")
    .select(
      `
      id,
      status,
      expected_delivery_date,
      total_amount,
      created_at,
      notes,
      supplier_id,
      branch_id,
      suppliers(name),
      purchase_order_items(
        id,
        purchase_order_id,
        inventory_item_id,
        quantity_ordered,
        unit_cost,
        quantity_received,
        inventory_items(name, unit)
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  return { error: null, data: data as unknown as PODetailRow };
}

export async function getBranchInventoryItems(): Promise<{
  error: string | null;
  data: BranchInventoryItemRow[];
}> {
  const auth = await requireUserWithBranch();
  if (auth.error) return { error: auth.error, data: [] };

  const { data, error } = await auth.supabase
    .from("branch_inventory")
    .select(
      "on_hand, inventory_items(id, name, unit, low_stock_threshold, is_active)",
    );

  if (error) {
    return { error: error.message, data: [] };
  }

  type JoinedRow = {
    on_hand: number | string;
    inventory_items: {
      id: string;
      name: string;
      unit: string;
      low_stock_threshold: number | string;
      is_active: boolean;
    };
  };

  const rows = ((data ?? []) as unknown as JoinedRow[])
    .filter((row) => row.inventory_items?.is_active !== false)
    .map((row) => ({
      inventory_item_id: row.inventory_items.id,
      name: row.inventory_items.name,
      unit: row.inventory_items.unit,
      on_hand: Number(row.on_hand),
      low_stock_threshold: Number(row.inventory_items.low_stock_threshold),
    }));

  return { error: null, data: rows };
}

export async function createPurchaseOrder(
  values: POFormValues,
): Promise<CreatePOResult> {
  const auth = await requireUserWithBranch();
  if (auth.error) return { error: auth.error, id: null };

  const parsed = poFormSchema.safeParse(values);
  if (!parsed.success) {
    const message =
      parsed.error.issues[0]?.message ?? "Invalid purchase order details.";
    return { error: message, id: null };
  }

  const totalAmount = computePOTotal(parsed.data.items);

  const { data: po, error: poError } = await auth.supabase
    .from("purchase_orders")
    .insert({
      branch_id: auth.branchId,
      supplier_id: parsed.data.supplier_id,
      created_by_profile_id: auth.user!.id,
      status: "draft",
      total_amount: totalAmount,
      notes: parsed.data.notes?.trim() || null,
    } as never)
    .select("id")
    .single();

  if (poError || !po) {
    return { error: poError?.message ?? "Failed to create purchase order.", id: null };
  }

  const poId = (po as { id: string }).id;

  const lineItems = parsed.data.items.map((item) => ({
    purchase_order_id: poId,
    inventory_item_id: item.inventory_item_id,
    quantity_ordered: item.quantity_ordered,
    unit_cost: item.unit_cost,
  }));

  const { error: itemsError } = await auth.supabase
    .from("purchase_order_items")
    .insert(lineItems as never);

  if (itemsError) {
    await auth.supabase.from("purchase_orders").delete().eq("id", poId);
    return { error: itemsError.message, id: null };
  }

  revalidatePath(PURCHASE_ORDERS_PATH);
  return { error: null, id: poId };
}

export async function submitPurchaseOrder(
  id: string,
  values?: SubmitPOValues,
): Promise<ActionResult> {
  const auth = await requireUserWithBranch();
  if (auth.error) return { error: auth.error };

  const parsed = submitPOSchema.safeParse(values ?? {});
  if (!parsed.success) {
    const message =
      parsed.error.issues[0]?.message ?? "Invalid submission details.";
    return { error: message };
  }

  const { data: existing, error: fetchError } = await auth.supabase
    .from("purchase_orders")
    .select("status")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return { error: fetchError?.message ?? "Purchase order not found." };
  }

  if ((existing as { status: string }).status !== "draft") {
    return { error: "Only draft purchase orders can be submitted." };
  }

  const { error } = await auth.supabase
    .from("purchase_orders")
    .update({
      status: "submitted",
      expected_delivery_date:
        parsed.data.expected_delivery_date?.trim() || null,
    } as never)
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(PURCHASE_ORDERS_PATH);
  return { error: null };
}

export async function receivePurchaseOrder(
  id: string,
  values: ReceivePOValues,
): Promise<ActionResult> {
  const auth = await requireUserWithBranch();
  if (auth.error) return { error: auth.error };

  const parsed = receivePOSchema.safeParse(values);
  if (!parsed.success) {
    const message =
      parsed.error.issues[0]?.message ?? "Invalid receipt details.";
    return { error: message };
  }

  const { data: po, error: poError } = await auth.supabase
    .from("purchase_orders")
    .select(
      `
      id,
      status,
      branch_id,
      purchase_order_items(
        id,
        inventory_item_id,
        quantity_ordered
      )
    `,
    )
    .eq("id", id)
    .single();

  if (poError || !po) {
    return { error: poError?.message ?? "Purchase order not found." };
  }

  const poRecord = po as {
    id: string;
    status: string;
    branch_id: string;
    purchase_order_items: {
      id: string;
      inventory_item_id: string;
      quantity_ordered: number | string;
    }[];
  };

  if (
    poRecord.status !== "submitted" &&
    poRecord.status !== "partial"
  ) {
    return {
      error: "Only submitted or partially received orders can be marked received.",
    };
  }

  const receivedByLineId = new Map(
    parsed.data.items.map((item) => [item.id, item.quantity_received]),
  );

  for (const line of poRecord.purchase_order_items) {
    const qtyReceived = receivedByLineId.get(line.id);
    if (qtyReceived === undefined) {
      return { error: "Receipt quantities required for all line items." };
    }

    const { error: lineError } = await auth.supabase
      .from("purchase_order_items")
      .update({ quantity_received: qtyReceived } as never)
      .eq("id", line.id);

    if (lineError) {
      return { error: lineError.message };
    }

    if (qtyReceived > 0) {
      const { error: adjustmentError } = await auth.supabase
        .from("stock_adjustments")
        .insert({
          branch_id: poRecord.branch_id,
          inventory_item_id: line.inventory_item_id,
          adjustment_type: "purchase_receipt",
          quantity_delta: qtyReceived,
          reference_id: poRecord.id,
          notes: `PO receipt`,
          created_by_profile_id: auth.user!.id,
        } as never);

      if (adjustmentError) {
        return { error: adjustmentError.message };
      }

      const { data: inventoryRow, error: inventoryFetchError } =
        await auth.supabase
          .from("branch_inventory")
          .select("id, on_hand")
          .eq("branch_id", poRecord.branch_id)
          .eq("inventory_item_id", line.inventory_item_id)
          .maybeSingle();

      if (inventoryFetchError) {
        return { error: inventoryFetchError.message };
      }

      if (inventoryRow) {
        const currentOnHand = Number(
          (inventoryRow as { on_hand: number | string }).on_hand,
        );
        const { error: updateError } = await auth.supabase
          .from("branch_inventory")
          .update({ on_hand: currentOnHand + qtyReceived } as never)
          .eq("id", (inventoryRow as { id: string }).id);

        if (updateError) {
          return { error: updateError.message };
        }
      }
    }
  }

  const { error: statusError } = await auth.supabase
    .from("purchase_orders")
    .update({ status: "received" } as never)
    .eq("id", id);

  if (statusError) {
    return { error: statusError.message };
  }

  revalidatePath(PURCHASE_ORDERS_PATH);
  return { error: null };
}

export async function cancelPurchaseOrder(id: string): Promise<ActionResult> {
  const auth = await requireUserWithBranch();
  if (auth.error) return { error: auth.error };

  const { data: existing, error: fetchError } = await auth.supabase
    .from("purchase_orders")
    .select("status")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return { error: fetchError?.message ?? "Purchase order not found." };
  }

  const status = (existing as { status: string }).status;
  if (status !== "draft" && status !== "submitted") {
    return { error: "This purchase order can no longer be cancelled." };
  }

  const { error } = await auth.supabase
    .from("purchase_orders")
    .update({ status: "cancelled" } as never)
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(PURCHASE_ORDERS_PATH);
  return { error: null };
}
