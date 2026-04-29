import type { Metadata } from "next";

import { PlaceholderCard } from "@/components/layout/placeholder-card";

export const metadata: Metadata = { title: "Branch" };

export default function BranchPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Branch overview
        </h1>
        <p className="text-sm text-foreground-muted">
          A daily pulse on this location: revenue, traffic, and what needs the
          manager&rsquo;s attention.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <PlaceholderCard
          title="Today's sales"
          description="Revenue, transaction count, and average ticket compared to yesterday."
        />
        <PlaceholderCard
          title="Shift coverage"
          description="Who&rsquo;s on now, who&rsquo;s next, and any open shifts to fill."
        />
        <PlaceholderCard
          title="Waste log"
          description="Recent waste entries and the categories driving the most loss."
        />
      </div>
    </div>
  );
}
