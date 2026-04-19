import { ReactNode } from "react";

interface Props {
  /** Mono-style breadcrumb above the title (e.g. "Documentation index"). */
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  /** Right-aligned actions (Buttons, Links). */
  actions?: ReactNode;
}

/** Consistent page heading used across console + public pages. */
export function PageHeader({ eyebrow, title, description, actions }: Props) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
      <div className="min-w-0">
        {eyebrow && (
          <div className="text-xs font-mono uppercase text-muted-foreground tracking-wider mb-2">{eyebrow}</div>
        )}
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-2 max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
