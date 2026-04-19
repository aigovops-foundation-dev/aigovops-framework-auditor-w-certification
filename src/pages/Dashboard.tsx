import { Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FilePlus2, FileText, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useReviews } from "@/hooks/queries/useReviews";

const statusColor: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  ingesting: "bg-accent/20 text-accent",
  analyzing: "bg-accent/20 text-accent",
  pending_human: "bg-warning/20 text-warning",
  approved: "bg-primary/20 text-primary",
  rejected: "bg-destructive/20 text-destructive",
  failed: "bg-destructive/20 text-destructive",
};

const Dashboard = () => {
  usePageMeta({ title: "Reviews · AiGovOps Console", canonical: "/dashboard" });
  const { data: reviews = [], isLoading } = useReviews();

  return (
    <AppShell>
      <div className="p-8 max-w-6xl mx-auto">
        <PageHeader
          title="Reviews"
          description="Policy-as-code submissions and their agent review state."
          actions={
            <Link to="/submit">
              <Button>
                <FilePlus2 className="h-4 w-4 mr-2" /> New review
              </Button>
            </Link>
          }
        />

        {isLoading ? (
          <div className="text-muted-foreground font-mono text-sm flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> loading…
          </div>
        ) : reviews.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No reviews yet"
            description="Submit your first policy-as-code bundle to begin."
            action={
              <Link to="/submit">
                <Button>
                  <FilePlus2 className="h-4 w-4 mr-2" /> Start a review
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-2">
            {reviews.map((r) => (
              <Link
                key={r.id}
                to={`/review/${r.id}`}
                className="block rounded-lg border border-border bg-card-grad p-4 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{r.title}</div>
                    <div className="text-xs text-muted-foreground font-mono mt-0.5">
                      {r.source_type} · {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {(r.scenarios ?? []).slice(0, 3).map((s: string) => (
                      <span key={s} className="text-[10px] font-mono text-muted-foreground uppercase">
                        {s}
                      </span>
                    ))}
                    {r.overall_score !== null && (
                      <span className="font-mono text-sm tabular-nums">
                        {r.overall_score}
                        <span className="text-muted-foreground text-xs">/100</span>
                      </span>
                    )}
                    <Badge className={statusColor[r.status] ?? ""}>{r.status}</Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default Dashboard;
