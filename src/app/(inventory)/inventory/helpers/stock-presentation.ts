/**
 * Stock status presentation layer for the inventory route.
 *
 * Tailwind badge/progress tones and labels — UI-only, not loaded from Supabase.
 */

import type { StockRow } from "@/lib/mock/inventory";

import type { StockStatus } from "./stock-types";

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
