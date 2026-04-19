// Reusable, lightweight agent visual primitives.
// Pulls from the bundled PERSONAS list — zero round-trips, instant render.
// Used across Landing, Verify, Developers, Feed, Donate, Console, etc.

import { Link } from "react-router-dom";
import { PERSONAS, personaBySlug, type PersonaMeta } from "@/data/agent-personas";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvatarProps {
  slug: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  ring?: boolean;
  className?: string;
}

const sizeMap: Record<NonNullable<AvatarProps["size"]>, string> = {
  xs: "h-6 w-6",
  sm: "h-9 w-9",
  md: "h-12 w-12",
  lg: "h-16 w-16",
  xl: "h-24 w-24",
};

/** Round portrait avatar with optional aurora ring. */
export function PersonaAvatar({ slug, size = "md", ring = true, className }: AvatarProps) {
  const p = personaBySlug(slug);
  if (!p) return null;
  const ringClass = ring
    ? p.is_chief
      ? "ring-2 ring-accent/60 shadow-gold"
      : "ring-2 ring-secondary/40"
    : "";
  return (
    <img
      src={p.portrait}
      alt={`${p.display_name} — ${p.role_title}`}
      loading="lazy"
      className={cn(
        "rounded-full object-cover object-top bg-card",
        sizeMap[size],
        ringClass,
        className,
      )}
    />
  );
}

interface NamedCameoProps {
  slug: string;
  /** Optional verb / action — e.g. "qualified scope", "signed at 14:02". */
  action?: string;
  size?: AvatarProps["size"];
  showRole?: boolean;
  className?: string;
}

/**
 * Inline named cameo: "[avatar] Ken Newton · qualified scope".
 * Use anywhere we want to attribute work to a specific agent.
 */
export function NamedCameo({ slug, action, size = "sm", showRole = false, className }: NamedCameoProps) {
  const p = personaBySlug(slug);
  if (!p) return null;
  // Trim to first/last token of the display name for inline density.
  const short = p.display_name.replace(/"[^"]+"/g, "").trim();
  return (
    <span className={cn("inline-flex items-center gap-2 align-middle", className)}>
      <PersonaAvatar slug={slug} size={size} />
      <span className="text-sm leading-tight">
        <span className="font-semibold">{short}</span>
        {showRole && (
          <span className="text-muted-foreground font-mono text-[10px] uppercase tracking-wider ml-1.5">
            {p.role_title}
          </span>
        )}
        {action && (
          <span className="text-muted-foreground"> · {action}</span>
        )}
      </span>
    </span>
  );
}

interface PersonaStripProps {
  /** Filter to a specific subset of slugs; default = all 10 in rank order. */
  slugs?: string[];
  /** Show name + role under each portrait. */
  labeled?: boolean;
  /** Marquee scroll the strip (use when `slugs` is omitted). */
  marquee?: boolean;
  className?: string;
}

/**
 * Horizontal strip of agent portraits. The "house" of AiGovOps in one row.
 * Default behaviour: all ten, in rank order, linked to /agents.
 */
export function PersonaStrip({ slugs, labeled = false, marquee = false, className }: PersonaStripProps) {
  const list = slugs
    ? (slugs.map((s) => personaBySlug(s)).filter(Boolean) as PersonaMeta[])
    : PERSONAS;

  const items = (
    <>
      {list.map((p) => (
        <Link
          key={p.slug}
          to="/agents"
          className="group flex flex-col items-center gap-2 shrink-0 w-24"
          title={`${p.display_name} — ${p.role_title}`}
        >
          <div className="relative">
            <img
              src={p.portrait}
              alt={p.display_name}
              loading="lazy"
              className={cn(
                "h-16 w-16 rounded-full object-cover object-top transition-transform duration-300 group-hover:scale-105",
                p.is_chief
                  ? "ring-2 ring-accent/70 shadow-gold"
                  : "ring-2 ring-secondary/40 group-hover:ring-primary/60",
              )}
            />
            {p.is_chief && (
              <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent grid place-items-center shadow-gold">
                <Crown className="h-3 w-3 text-accent-foreground" />
              </div>
            )}
          </div>
          {labeled && (
            <div className="text-center">
              <div className="text-[11px] font-semibold leading-tight">
                {p.display_name.replace(/"[^"]+"\s?/g, "").split(" ").slice(0, 2).join(" ")}
              </div>
              <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground leading-tight mt-0.5">
                {p.role_title.split(" ")[0]}
              </div>
            </div>
          )}
        </Link>
      ))}
    </>
  );

  if (marquee) {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        <div className="flex gap-6 animate-marquee w-max">
          {items}
          {items}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent" />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap gap-6 justify-center", className)}>
      {items}
    </div>
  );
}

/**
 * Signature-block style cameo for legal-document feel:
 * gold-ringed portrait with name + role + an attribution line.
 * Used on /verify, certification panels, attestation-feed cards.
 */
export function PersonaSignature({
  slug,
  action,
  timestamp,
  className,
}: {
  slug: string;
  action: string;
  timestamp?: string;
  className?: string;
}) {
  const p = personaBySlug(slug);
  if (!p) return null;
  return (
    <div className={cn("flex items-start gap-3 rounded-xl border border-border bg-card-grad p-4", className)}>
      <PersonaAvatar slug={slug} size="md" />
      <div className="min-w-0">
        <div className="font-semibold text-sm tracking-tight truncate">{p.display_name.replace(/"[^"]+"\s?/g, "").trim()}</div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          {p.role_title}
        </div>
        <div className="mt-2 text-xs text-foreground/90">{action}</div>
        {timestamp && (
          <div className="mt-1 text-[10px] font-mono text-muted-foreground">{timestamp}</div>
        )}
      </div>
    </div>
  );
}
