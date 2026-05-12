import React from "react";

type StatCardTone = "neutral" | "warning" | "danger";

export default function SummaryCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: StatCardTone;
}) {
  const valueTone =
    tone === "danger"
      ? "text-red-600"
      : tone === "warning"
        ? "text-amber-600"
        : "text-foreground";

  return (
    <div className="bg-surface flex flex-col gap-1 rounded-lg border border-border p-4">
      <span className="text-foreground-muted text-xs font-medium uppercase tracking-wide">
        {label}
      </span>
      <span className={`text-2xl font-semibold tracking-tight ${valueTone}`}>
        {value}
      </span>
    </div>
  );
}
