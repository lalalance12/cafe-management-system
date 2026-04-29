import type { Metadata } from "next";

import { PlaceholderCard } from "@/components/layout/placeholder-card";

export const metadata: Metadata = { title: "Global admin" };

export default function AdminPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Global overview
        </h1>
        <p className="text-sm text-foreground-muted">
          Roll-up performance across every branch with drill-downs into the
          stores driving (or dragging) the chain.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <PlaceholderCard
          title="Chain revenue"
          description="Consolidated revenue, transactions, and average ticket across all branches."
        />
        <PlaceholderCard
          title="Branch leaderboard"
          description="Top and bottom performers for the selected period."
        />
        <PlaceholderCard
          title="Health signals"
          description="Branches with stockouts, staffing gaps, or unusual waste levels surface here."
        />
      </div>
    </div>
  );
}
