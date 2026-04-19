import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/ui/page-header";
import { PersonaCard } from "@/components/agents/PersonaCard";
import { PERSONAS } from "@/data/agent-personas";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";

const Agents = () => {
  usePageMeta({
    title: "Agent Roster — AIgovops",
    description:
      "Meet the AIgovops auditor agents. Each persona is modeled on a historical figure from math, science, audit, engineering, or security — with explicit skills and guardrails.",
  });

  const chief = PERSONAS.find((p) => p.is_chief)!;
  const team = PERSONAS.filter((p) => !p.is_chief);

  return (
    <AppShell>
      <div className="p-8 max-w-7xl mx-auto">
        <PageHeader
          title="Agent Roster"
          eyebrow="The AIgovops Council"
          description="Each auditor agent is modeled on a historical figure whose life's work makes them historically fit for the role. Every agent operates under explicit skills and hard guardrails — and answers to the Chief."
          actions={
            <Button asChild variant="secondary">
              <Link to="/agents/dashboard">
                <Activity className="h-4 w-4 mr-2" />
                Activity Dashboard
              </Link>
            </Button>
          }
        />

        {/* Chief — featured */}
        <section className="mt-8">
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-400/80 mb-2">
            Chief Auditor
          </div>
          <div className="grid lg:grid-cols-3 gap-5">
            <div className="lg:col-span-1">
              <PersonaCard persona={chief} />
            </div>
            <div className="lg:col-span-2 rounded-xl border border-amber-400/20 bg-card-grad p-6">
              <h2 className="text-xl font-semibold tracking-tight">
                {chief.display_name}, {chief.role_title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                The Chief is the only agent authorized to issue a final
                determination. Findings flow up from each specialist; the Chief
                weighs evidence, applies independence rules, and either signs
                an Attestation, escalates to a human reviewer, or rejects the
                package outright. Every signature is recorded in the
                tamper-evident audit chain.
              </p>
              <div className="mt-5 grid sm:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <div className="text-muted-foreground uppercase tracking-wider mb-1">Authority</div>
                  <ul className="space-y-1 text-foreground/80">
                    <li>· Sign Attestation of AOS Conformance</li>
                    <li>· Route to human review</li>
                    <li>· Block release on independence conflict</li>
                  </ul>
                </div>
                <div>
                  <div className="text-muted-foreground uppercase tracking-wider mb-1">Hard Guardrails</div>
                  <ul className="space-y-1 text-foreground/80">
                    {chief.guardrails.map((g) => (
                      <li key={g}>· {g}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Specialists */}
        <section className="mt-12">
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary/80 mb-2">
            Specialist Agents
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {team.map((p) => (
              <PersonaCard key={p.slug} persona={p} />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
};

export default Agents;
