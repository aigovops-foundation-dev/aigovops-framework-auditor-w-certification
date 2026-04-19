import { DOCS } from "@/lib/docs-manifest";
import { DocCard } from "@/components/DocCard";
import { PublicShell } from "@/components/PublicShell";
import { PageHeader } from "@/components/ui/page-header";
import { usePageMeta } from "@/hooks/usePageMeta";

const Docs = () => {
  usePageMeta({
    title: "Documentation · AiGovOps Review Framework",
    description:
      "PRD, FAQ, executive summary, pitch deck, AOS v0.1 spec, risk scenarios, and the canary manifest — every artifact published for open review.",
    canonical: "/docs",
  });

  return (
    <PublicShell eyebrow="Documentation">
      <main className="container max-w-6xl mx-auto pt-12 pb-20">
        <PageHeader
          eyebrow="Documentation index"
          title="All documents"
          description="The PRD, FAQ, executive summary, pitch deck, AOS spec, and visual artifacts. Everything the AiGovOps Foundation publishes to support open review of this framework."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DOCS.map((doc) => (
            <DocCard key={doc.id} doc={doc} />
          ))}
        </div>
      </main>
    </PublicShell>
  );
};

export default Docs;
