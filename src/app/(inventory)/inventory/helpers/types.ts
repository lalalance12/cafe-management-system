/**
 * Inventory route — data shapes for pages under `/inventory` (stock joins,
 * purchase order display status). Not shared app-wide API types.
 */

export type StockStatus = "out_of_stock" | "low_stock" | "in_stock";

/**
 * Joined row shape from Supabase. PostgREST returns the embedded relation as
 * an object when the FK side is non-nullable, but its generated type can be
 * unioned with arrays — narrow it here for row mapping on the page.
 */
export type JoinedStockRow = {
  on_hand: number | string;
  updated_at: string | null;
  inventory_items: {
    id: string;
    name: string;
    unit: string;
    low_stock_threshold: number | string;
  };
};

/** Purchase order row status plus derived `overdue` (display-only, not stored). */
export type PurchaseOrderResolvedStatus =
  | "draft"
  | "submitted"
  | "partial"
  | "received"
  | "cancelled"
  | "overdue";
