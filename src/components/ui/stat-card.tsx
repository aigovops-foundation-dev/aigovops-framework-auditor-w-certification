import type { LucideIcon } from "lucide-react";

type Tone = "neutral" | "warning" | "destructive" | "success";

interface Props {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  hint?: string;
  tone?: Tone;
}

const toneRing: Record<Tone, string> = {
  neutral: "border-border",
  warning: "border-warning/40 shadow-[0_0_0_1px_hsl(var(--warning)/0.15)]",
  destructive: "border-destructive/40 shadow-[0_0_0_1px_hsl(var(--destructive)/0.15)]",
  success: "border-primary/40 shadow-[0_0_0_1px_hsl(var(--primary)/0.15)]",
};

const toneIcon: Record<Tone, string> = {
  neutral: "text-muted-foreground",
  warning: "text-warning",
  destructive: "text-destructive",
  success: "text-primary",
};

/** Compact metric tile. */
export function StatCard({ label, value, icon: Icon, hint, tone = "neutral" }: Props) {
  return (
    <div className={`rounded-lg border bg-card-grad p-4 ${toneRing[tone]}`}>
      <div className="flex items-center justify-between">
        <div className="text-xs font-mono uppercase text-muted-foreground tracking-wider">{label}</div>
        {Icon && <Icon className={`h-4 w-4 ${toneIcon[tone]}`} />}
      </div>
      <div className="mt-2 text-2xl font-semibold tabular-nums">{value}</div>
      {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
    </div>
  );
}
