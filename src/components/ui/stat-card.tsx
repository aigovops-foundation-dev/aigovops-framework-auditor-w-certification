import type { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  hint?: string;
}

/** Compact metric tile. */
export function StatCard({ label, value, icon: Icon, hint }: Props) {
  return (
    <div className="rounded-lg border border-border bg-card-grad p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs font-mono uppercase text-muted-foreground tracking-wider">{label}</div>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </div>
      <div className="mt-2 text-2xl font-semibold tabular-nums">{value}</div>
      {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
    </div>
  );
}
