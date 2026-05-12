type SummaryCardTone = "neutral" | "warning" | "danger";

export default function SummaryCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: SummaryCardTone;
}) {
  const valueTone =
    tone === "danger"
      ? "text-red-600 dark:text-red-400"
      : tone === "warning"
        ? "text-amber-600 dark:text-amber-400"
        : "text-foreground";

  return (
    <div className="bg-card flex flex-col gap-1 rounded-lg border border-accent-foreground/5 p-4">
      <span className="text-foreground-muted text-xs font-medium uppercase tracking-wide">
        {label}
      </span>
      <span className={`text-2xl font-semibold tracking-tight ${valueTone}`}>
        {value}
      </span>
    </div>
  );
}
