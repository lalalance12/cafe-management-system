import type { ReactNode } from "react";

type PlaceholderCardProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

/**
 * Lightweight card used while a section is still scaffolding.
 *
 * Keeps the dashboards visually consistent without committing to a final
 * layout for any single feature.
 */
export function PlaceholderCard({
  title,
  description,
  children,
}: PlaceholderCardProps) {
  return (
    <section className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-6">
      <h3 className="text-base font-semibold tracking-tight">{title}</h3>
      <p className="text-sm text-foreground-muted">{description}</p>
      {children ? <div className="pt-2">{children}</div> : null}
    </section>
  );
}
