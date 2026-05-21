import { z } from "zod";

export type PurchaseOrderStatus =
  | "draft"
  | "submitted"
  | "partial"
  | "received"
  | "cancelled";

export type PORow = {
  id: string;
  status: PurchaseOrderStatus;
  expected_delivery_date: string | null;
  total_amount: string | number;
  created_at: string;
  suppliers: { name: string } | null;
};

export type POItemRow = {
  id: string;
  purchase_order_id: string;
  inventory_item_id: string;
  quantity_ordered: string | number;
  unit_cost: string | number;
  quantity_received: string | number | null;
  inventory_items: { name: string; unit: string } | null;
};

export type PODetailRow = PORow & {
  notes: string | null;
  supplier_id: string;
  branch_id: string;
  purchase_order_items: POItemRow[];
};

export type BranchInventoryItemRow = {
  inventory_item_id: string;
  name: string;
  unit: string;
  on_hand: number;
  low_stock_threshold: number;
};

export const poItemFormSchema = z.object({
  inventory_item_id: z.string().uuid(),
  quantity_ordered: z
    .number()
    .positive("Quantity must be greater than 0"),
  unit_cost: z.number().min(0, "Unit cost cannot be negative"),
});

export const poFormSchema = z.object({
  supplier_id: z.string().uuid("Select a supplier"),
  notes: z.string().trim().optional(),
  items: z.array(poItemFormSchema).min(1, "Add at least one line item"),
});

export type POFormValues = z.infer<typeof poFormSchema>;
export type POItemFormValues = z.infer<typeof poItemFormSchema>;

export const submitPOSchema = z.object({
  expected_delivery_date: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || !Number.isNaN(Date.parse(value)),
      "Invalid delivery date",
    ),
});

export type SubmitPOValues = z.infer<typeof submitPOSchema>;

export const receivePOItemSchema = z.object({
  id: z.string().uuid(),
  quantity_received: z.number().min(0, "Quantity cannot be negative"),
});

export const receivePOSchema = z.object({
  items: z.array(receivePOItemSchema).min(1),
});

export type ReceivePOValues = z.infer<typeof receivePOSchema>;

export function emptyPOFormValues(): POFormValues {
  return {
    supplier_id: "",
    notes: "",
    items: [],
  };
}

export function computeLineTotal(
  quantity: number,
  unitCost: number,
): number {
  return quantity * unitCost;
}

export function computePOTotal(items: POItemFormValues[]): number {
  return items.reduce(
    (sum, item) =>
      sum + computeLineTotal(item.quantity_ordered, item.unit_cost),
    0,
  );
}
