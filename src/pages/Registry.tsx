import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, BadgeCheck, Crown, Loader2 } from "lucide-react";
import { PublicShell } from "@/components/PublicShell";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useRegistry } from "@/hooks/queries/useRegistry";

const Registry = () => {
  usePageMeta({
    title: "QAGA & QAGAC Public Registry",
    description:
      "Verify a Qualified AiGovOps Assessor (QAGA) or their Qualified Assessor Company (QAGAC). Required for any Attestation of AOS Conformance.",
    canonical: "/registry",
  });

  const { data, isLoading } = useRegistry();
  const firms = data?.firms ?? [];
  const assessors = data?.assessors ?? [];

  return (
    <PublicShell
      eyebrow="Public Registry"
      hero={false}
      rightSlot={
        <Link to="/auth">
          <Button variant="outline" size="sm">Console</Button>
        </Link>
      }
    >
      <main className="container max-w-6xl mx-auto p-8">
        <PageHeader
          title="QAGA & QAGAC Public Registry"
          description="Use this registry to verify that an Attestation of AOS Conformance (AOC) was signed by a Qualified AiGovOps Assessor (QAGA) employed by a Qualified AiGovOps Assessor Company (QAGAC) in good standing."
        />

        <section className="mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Qualified Firms (QAGAC)</h2>
            <Badge className="bg-muted">{firms.length}</Badge>
          </div>
          {isLoading ? (
            <div className="text-muted-foreground font-mono text-sm flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> loading…
            </div>
          ) : firms.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No firms in good standing yet"
              description="Charter QAGACs will appear here as they're activated."
            />
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {firms.map((f) => (
                <div key={f.id} className="rounded-lg border border-border bg-card-grad p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">{f.name}</div>
                      <div className="text-xs text-muted-foreground font-mono mt-0.5">{f.jurisdiction ?? "—"}</div>
                    </div>
                    <Badge className={f.status === "active" ? "bg-primary/20 text-primary" : "bg-warning/20 text-warning"}>
                      {f.status}
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                    <span><BadgeCheck className="inline h-3 w-3 mr-1" />{f.active_assessor_count} active QAGAs</span>
                    {f.website && (
                      <a href={f.website} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                        website
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-10">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Qualified Assessors (QAGA)</h2>
            <Badge className="bg-muted">{assessors.length}</Badge>
          </div>
          {isLoading ? (
            <div className="text-muted-foreground font-mono text-sm flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> loading…
            </div>
          ) : assessors.length === 0 ? (
            <EmptyState icon={Crown} title="No assessors listed yet" />
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {assessors.map((a) => {
                const firm = firms.find((f) => f.id === a.firm_id);
                return (
                  <div key={a.id} className="rounded-lg border border-border bg-card-grad p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">{a.display_name}</div>
                        <div className="text-xs text-muted-foreground font-mono mt-0.5">
                          {a.qaga_credential_id ?? "—"} · {a.jurisdiction ?? "—"}
                        </div>
                      </div>
                      {firm && <span className="text-xs font-mono text-primary">{firm.name}</span>}
                    </div>
                    {a.badges?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {a.badges.map((b) => (
                          <span key={b} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            {b}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </PublicShell>
  );
};

export default Registry;
