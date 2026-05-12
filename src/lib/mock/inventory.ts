/**
 * Dev fallback rows for the inventory Stock Levels page.
 *
 * Only rendered when the live Supabase query returns zero rows (e.g. local
 * dev pointed at an unseeded project). The DB is seeded in normal use, so
 * this array is effectively dead weight — keep it tiny.
 */

export type StockRow = {
  id: string;
  name: string;
  unit: string;
  on_hand: number;
  low_stock_threshold: number;
  updated_at?: string | null;
};

export const MOCK_STOCK: StockRow[] = [
  {
    id: "mock-1",
    name: "Espresso Roast - Arabica",
    unit: "kg",
    on_hand: 4.2,
    low_stock_threshold: 5.0,
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "mock-2",
    name: "Whole Milk - Organic",
    unit: "L",
    on_hand: 18.0,
    low_stock_threshold: 4.0,
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "mock-3",
    name: "Oat Milk - Barista Ed.",
    unit: "L",
    on_hand: 0.0,
    low_stock_threshold: 3.0,
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "mock-4",
    name: "Pastry Flour - Organic",
    unit: "kg",
    on_hand: 45.0,
    low_stock_threshold: 10.0,
    updated_at: "2026-01-01T00:00:00Z",
  },
];

/**
 * Dev fallback for the Purchase Orders page.
 *
 * Mirrors the shape of the live query:
 *   purchase_orders.* + suppliers(name) embedded relation.
 */
export type PurchaseOrderRow = {
  id: string;
  status: "draft" | "submitted" | "partial" | "received" | "cancelled";
  expected_delivery_date: string | null;
  total_amount: string | number;
  created_at: string;
  suppliers: { name: string } | null;
};

export const MOCK_PURCHASE_ORDERS: PurchaseOrderRow[] = [
  {
    id: "po-001-aaaaaaaa",
    status: "received",
    expected_delivery_date: "2026-04-25",
    total_amount: "3500.00",
    created_at: "2026-04-22T09:00:00+08:00",
    suppliers: { name: "Cafe Beans Co." },
  },
  {
    id: "po-002-bbbbbbbb",
    status: "submitted",
    expected_delivery_date: "2026-04-15",
    total_amount: "1200.00",
    created_at: "2026-04-10T10:30:00+08:00",
    suppliers: { name: "Valley Dairy Supply" },
  },
  {
    id: "po-003-cccccccc",
    status: "draft",
    expected_delivery_date: null,
    total_amount: "0.00",
    created_at: "2026-04-30T08:30:00+08:00",
    suppliers: { name: "Zen Matcha Imports" },
  },
  {
    id: "po-004-dddddddd",
    status: "partial",
    expected_delivery_date: "2026-05-02",
    total_amount: "890.00",
    created_at: "2026-04-28T11:00:00+08:00",
    suppliers: { name: "Heritage Bakery Supply" },
  },
];
