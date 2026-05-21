import type { LucideIcon } from "lucide-react";

export type SummaryCardColor =
  | "neutral"
  | "green"
  | "amber"
  | "red"
  | "sky"
  | "wood";

type ColorConfig = {
  card: string;
  icon: string;
  value: string;
};

const COLOR_CONFIG: Record<SummaryCardColor, ColorConfig> = {
  neutral: {
    card: "bg-card",
    icon: "opacity-[0.08]",
    value: "text-foreground",
  },
  green: {
    card: "bg-emerald-50/70 dark:bg-emerald-950/20",
    icon: "text-emerald-600 dark:text-emerald-400 opacity-[0.22]",
    value: "text-foreground",
  },
  amber: {
    card: "bg-amber-50/70 dark:bg-amber-950/20",
    icon: "text-amber-500 dark:text-amber-400 opacity-[0.28]",
    value: "text-amber-700 dark:text-amber-400",
  },
  red: {
    card: "bg-red-50/70 dark:bg-red-950/20",
    icon: "text-red-500 dark:text-red-400 opacity-[0.28]",
    value: "text-red-700 dark:text-red-400",
  },
  sky: {
    card: "bg-sky-50/70 dark:bg-sky-950/20",
    icon: "text-sky-500 dark:text-sky-400 opacity-[0.22]",
    value: "text-foreground",
  },
  wood: {
    card: "bg-wood-50 dark:bg-wood-700/15",
    icon: "text-wood-500 dark:text-wood-300 opacity-[0.22]",
    value: "text-foreground",
  },
};

export default function SummaryCard({
  label,
  value,
  color = "neutral",
  icon: Icon,
}: {
  label: string;
  value: string;
  color?: SummaryCardColor;
  icon?: LucideIcon;
}) {
  const cfg = COLOR_CONFIG[color];

  return (
    <div
      className={`${cfg.card} relative flex flex-col gap-1 overflow-hidden rounded-lg border border-accent-foreground/5 p-4`}
    >
      <span className="text-foreground-muted text-xs font-medium uppercase tracking-wide">
        {label}
      </span>
      <span className={`text-2xl font-semibold tracking-tight ${cfg.value}`}>
        {value}
      </span>
      {Icon && (
        <Icon
          className={`pointer-events-none absolute -right-4 -bottom-3 size-24 rotate-12 ${cfg.icon}`}
          aria-hidden
        />
      )}
    </div>
  );
}
