import { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface Props {
  icon?: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}

/** Dashed-border empty state used by Dashboard, Registry, AuditLog, etc. */
export function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <div className="rounded-xl border border-dashed border-border p-10 text-center bg-card-grad">
      {Icon && <Icon className="h-8 w-8 mx-auto text-muted-foreground" />}
      <div className="mt-3 font-medium">{title}</div>
      {description && <div className="text-sm text-muted-foreground mt-1">{description}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
