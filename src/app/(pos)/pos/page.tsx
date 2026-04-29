import type { Metadata } from "next";

import { PlaceholderCard } from "@/components/layout/placeholder-card";

export const metadata: Metadata = { title: "POS" };

export default function PosPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Order entry</h1>
        <p className="text-sm text-foreground-muted">
          Build orders fast with a touch-friendly product grid and a live cart.
        </p>
      </header>
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <PlaceholderCard
          title="Product grid"
          description="Categorized buttons for quick item selection. Wire this up to the menu service once it exists."
        />
        <PlaceholderCard
          title="Current order"
          description="Cart summary, modifiers, totals, and payment trigger live here."
        />
      </div>
    </div>
  );
}
