import { Link } from "react-router-dom";
import { Heart, Github, ExternalLink, ShieldCheck, Sparkles, BookOpen, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicShell } from "@/components/PublicShell";
import { PageHeader } from "@/components/ui/page-header";
import { usePageMeta } from "@/hooks/usePageMeta";
import { FOUNDATION } from "@/lib/config";

const Donate = () => {
  usePageMeta({
    title: "Donate · AiGovOps Foundation",
    description:
      "Support the AiGovOps Foundation. Donations fund the AOS standard, the QAGA scholarship program, the Review Framework, and the public audit-chain infrastructure.",
    canonical: "/donate",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "NGO",
      name: FOUNDATION.name,
      url: FOUNDATION.url,
      sameAs: [FOUNDATION.githubOrgUrl, FOUNDATION.githubSponsorsUrl],
      email: FOUNDATION.donationsEmail,
    },
  });

  return (
    <PublicShell eyebrow="Support the work">
      <main className="container max-w-5xl mx-auto pt-12 pb-20">
        <PageHeader
          eyebrow="AiGovOps Foundation · 501(c)(3) pending"
          title="Help keep AI governance open."
          description={
            <>
              The {FOUNDATION.name} maintains the <strong>AOS standard</strong>, the open-source{" "}
              <strong>AiGovOps Review Framework</strong>, the <strong>QAGA assessor program</strong>, and the
              public <strong>audit-chain verifier</strong>. Donations keep all of it free and vendor-neutral.
            </>
          }
        />

        <section className="grid md:grid-cols-2 gap-4 mt-8">
          <a
            href={FOUNDATION.donateUrl}
            target="_blank"
            rel="noreferrer"
            className="group rounded-xl border border-primary/30 bg-card-grad p-6 shadow-elev hover:border-primary/60 hover:shadow-glow transition-all"
          >
            <div className="flex items-start justify-between">
              <Heart className="h-7 w-7 text-primary" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-primary">Recommended</span>
            </div>
            <div className="mt-4 text-lg font-semibold">Donate to the Foundation</div>
            <p className="text-sm text-muted-foreground mt-1">
              One-time or recurring. Tax receipt issued in jurisdictions where applicable. Card, ACH, and wire
              accepted.
            </p>
            <div className="mt-4 inline-flex items-center gap-1 text-sm font-mono text-primary">
              aigovopsfoundation.org/donate
              <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </a>

          <a
            href={FOUNDATION.githubSponsorsUrl}
            target="_blank"
            rel="noreferrer"
            className="group rounded-xl border border-border bg-card-grad p-6 shadow-elev hover:border-foreground/30 transition-all"
          >
            <div className="flex items-start justify-between">
              <Github className="h-7 w-7 text-foreground" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Devs &amp; orgs
              </span>
            </div>
            <div className="mt-4 text-lg font-semibold">Sponsor on GitHub</div>
            <p className="text-sm text-muted-foreground mt-1">
              Recurring monthly tiers. Contribution shows on your GitHub profile and the Foundation's org
              page.
            </p>
            <div className="mt-4 inline-flex items-center gap-1 text-sm font-mono text-foreground/80 group-hover:text-foreground">
              github.com/sponsors/aigovopsfoundation
              <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </a>
        </section>

        <section className="mt-12">
          <div className="text-xs font-mono uppercase text-muted-foreground tracking-wider mb-4">
            What your donation funds
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {fundedWork.map((w) => (
              <div key={w.title} className="rounded-lg border border-border bg-card p-5">
                <w.icon className="h-5 w-5 text-primary" />
                <div className="mt-3 font-semibold">{w.title}</div>
                <div className="text-sm text-muted-foreground mt-1">{w.body}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-xl border border-border bg-card-grad p-6">
          <div className="grid md:grid-cols-[1fr_auto] gap-4 items-center">
            <div>
              <div className="text-sm font-semibold">Corporate sponsorship, grants, or wire transfer?</div>
              <p className="text-sm text-muted-foreground mt-1">
                Sustaining sponsors get a logo placement on the Foundation site, early access to AOS RFCs, and
                a private quarterly briefing with the steering committee.
              </p>
            </div>
            <a href={`mailto:${FOUNDATION.donationsEmail}?subject=AiGovOps%20Foundation%20—%20Sponsorship`}>
              <Button variant="secondary">
                <Mail className="h-4 w-4 mr-1" /> {FOUNDATION.donationsEmail}
              </Button>
            </a>
          </div>
        </section>

        <section className="mt-10 text-xs text-muted-foreground font-mono">
          The {FOUNDATION.name} is a vendor-neutral nonprofit stewarding the AiGovOps Operational Standard
          (AOS). Donations are not earmarked for specific commercial outcomes and do not influence AOS
          control decisions — see{" "}
          <Link to="/docs" className="text-primary hover:underline">
            Governance
          </Link>
          .
        </section>
      </main>
    </PublicShell>
  );
};

const fundedWork = [
  {
    icon: BookOpen,
    title: "AOS standard",
    body: "Editor stipends, RFC tooling, working-group facilitation, and translation of controls into other jurisdictions.",
  },
  {
    icon: ShieldCheck,
    title: "Audit-chain infra",
    body: "Operating the public verifier, signing-key rotation, canary monitoring, and the QAGA registry.",
  },
  {
    icon: Sparkles,
    title: "QAGA scholarships",
    body: "Sponsored exam seats for assessors from public-interest, academic, and underrepresented backgrounds.",
  },
];

export default Donate;
