import type { Metadata } from "next";

export const metadata: Metadata = { title: "Inventory" };

export default function InventoryPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Stock levels</h1>
        <p className="text-sm text-foreground-muted">
          Monitor on-hand quantities in real time and react before anything runs
          out.
        </p>
      </header>
    </div>
  );
}
