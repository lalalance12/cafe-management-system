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
};

export const MOCK_STOCK: StockRow[] = [
  {
    id: "mock-1",
    name: "Espresso Roast - Arabica",
    unit: "kg",
    on_hand: 4.2,
    low_stock_threshold: 5.0,
  },
  {
    id: "mock-2",
    name: "Whole Milk - Organic",
    unit: "L",
    on_hand: 18.0,
    low_stock_threshold: 4.0,
  },
  {
    id: "mock-3",
    name: "Oat Milk - Barista Ed.",
    unit: "L",
    on_hand: 0.0,
    low_stock_threshold: 3.0,
  },
  {
    id: "mock-4",
    name: "Pastry Flour - Organic",
    unit: "kg",
    on_hand: 45.0,
    low_stock_threshold: 10.0,
  },
];
