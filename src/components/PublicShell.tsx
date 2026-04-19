import { Link } from "react-router-dom";
import { ReactNode } from "react";
import { Shield, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FOUNDATION } from "@/lib/config";

interface Props {
  children: ReactNode;
  /** Subtitle under the AiGovOps logo (e.g. "Documentation", "Public Registry"). */
  eyebrow?: string;
  /** Right-side action override. Defaults to "Open console". */
  rightSlot?: ReactNode;
  /** Apply the hero gradient + grid pattern background. Default: true. */
  hero?: boolean;
}

/**
 * Shared chrome (header + footer) for all public-facing pages: Landing, Docs,
 * Registry, Verify, Donate. Centralizes branding so every public page stays
 * consistent.
 */
export function PublicShell({ children, eyebrow = "Review Framework", rightSlot, hero = true }: Props) {
  return (
    <div className={`min-h-screen text-foreground relative overflow-hidden ${hero ? "bg-hero" : "bg-background"}`}>
      {hero && <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />}
      <div className="relative flex flex-col min-h-screen">
        <header className="container max-w-6xl mx-auto flex items-center justify-between py-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary to-accent grid place-items-center">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <div className="font-semibold tracking-tight">AiGovOps</div>
              <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">{eyebrow}</div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/donate" className="hidden sm:inline-flex">
              <Button variant="ghost" size="sm">
                <Heart className="h-4 w-4 mr-1" /> Donate
              </Button>
            </Link>
            {rightSlot ?? (
              <Link to="/auth">
                <Button variant="secondary" size="sm">Open console</Button>
              </Link>
            )}
          </div>
        </header>

        <div className="flex-1">{children}</div>

        <footer className="border-t border-border py-6">
          <div className="container max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground font-mono">
            <div>Stewarded by the {FOUNDATION.name} · Apache-2.0 · CC-BY-4.0 spec</div>
            <div className="flex items-center gap-4">
              <Link to="/docs" className="hover:text-foreground">Docs</Link>
              <Link to="/developers" className="hover:text-foreground">Developers</Link>
              <Link to="/feed" className="hover:text-foreground">Feed</Link>
              <Link to="/registry" className="hover:text-foreground">Registry</Link>
              <Link to="/donate" className="hover:text-foreground">Donate</Link>
              <a href={FOUNDATION.githubOrgUrl} target="_blank" rel="noreferrer" className="hover:text-foreground">GitHub</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
