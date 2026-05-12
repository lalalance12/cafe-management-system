/**
 * Inventory route presentation — labels, tones, formatters, and derived display
 * state. UI-only; not loaded from Supabase.
 */

import dayjs from "dayjs";

import type { PurchaseOrderRow, StockRow } from "@/lib/mock/inventory";

import type { PurchaseOrderResolvedStatus, StockStatus } from "./types";

export function getStatus(row: StockRow): StockStatus {
  if (row.on_hand === 0) return "out_of_stock";
  if (row.on_hand <= row.low_stock_threshold) return "low_stock";
  return "in_stock";
}

export const STATUS_LABEL: Record<StockStatus, string> = {
  out_of_stock: "OUT OF STOCK",
  low_stock: "LOW STOCK",
  in_stock: "IN STOCK",
};

export const STATUS_TONE: Record<StockStatus, string> = {
  out_of_stock: "bg-red-100 text-red-700",
  low_stock: "bg-amber-100 text-amber-700",
  in_stock: "bg-emerald-100 text-emerald-700",
};

export const PROGRESS_TONE: Record<StockStatus, string> = {
  out_of_stock: "bg-red-500",
  low_stock: "bg-amber-500",
  in_stock: "bg-emerald-500",
};

const phpCurrencyFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
});

export function formatPhpAmount(value: number): string {
  return phpCurrencyFormatter.format(value);
}

/**
 * Derive display-only `overdue` when an in-flight PO is past expected delivery.
 * Stored `status` has no `overdue` — it is time-derived.
 */
export function resolvePurchaseOrderStatus(
  row: PurchaseOrderRow,
): PurchaseOrderResolvedStatus {
  if (
    row.expected_delivery_date !== null &&
    dayjs(row.expected_delivery_date).isBefore(dayjs(), "day") &&
    (row.status === "submitted" || row.status === "partial")
  ) {
    return "overdue";
  }
  return row.status;
}

export const PURCHASE_ORDER_STATUS_LABEL: Record<
  PurchaseOrderResolvedStatus,
  string
> = {
  draft: "DRAFT",
  submitted: "SUBMITTED",
  partial: "PARTIAL",
  received: "RECEIVED",
  cancelled: "CANCELLED",
  overdue: "OVERDUE",
};

export const PURCHASE_ORDER_STATUS_CLASSES: Record<
  PurchaseOrderResolvedStatus,
  string
> = {
  draft:
    "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-400",
  submitted:
    "border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-700 dark:bg-sky-950 dark:text-sky-400",
  partial:
    "border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-700 dark:bg-violet-950 dark:text-violet-400",
  received:
    "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  cancelled: "border-muted bg-muted text-muted-foreground",
  overdue:
    "border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950 dark:text-red-400",
};

/** Human-readable PO label from the row id (UUID prefix). */
export function purchaseOrderLabel(id: string): string {
  return `${id.slice(0, 8).toUpperCase()}`;
}
