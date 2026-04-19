import { Link } from "react-router-dom";
import { Mail, ExternalLink, Github, Heart, Shield, BookOpen, Users } from "lucide-react";
import { PublicShell } from "@/components/PublicShell";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { usePageMeta } from "@/hooks/usePageMeta";
import { FOUNDATION, PROJECT } from "@/lib/config";

const About = () => {
  usePageMeta({
    title: "About · AiGovOps Foundation",
    description:
      "The AiGovOps Review Framework is stewarded by the AiGovOps Foundation, a vendor-neutral nonprofit co-founded by Bob Rapp and Ken Johnston. Open source under Apache-2.0.",
    canonical: "/about",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "NGO",
      name: FOUNDATION.name,
      url: FOUNDATION.url,
      sameAs: [FOUNDATION.githubOrgUrl, FOUNDATION.githubSponsorsUrl],
      email: FOUNDATION.contactEmail,
      founder: FOUNDATION.cofounders.map((c) => ({
        "@type": "Person",
        name: c.name,
        jobTitle: c.role,
        email: c.email,
      })),
    },
  });

  return (
    <PublicShell eyebrow="About">
      <main className="container max-w-5xl mx-auto pt-12 pb-20">
        <PageHeader
          eyebrow="Open source · Apache-2.0 · Vendor-neutral"
          title="Stewarded by the AiGovOps Foundation."
          description={
            <>
              The <strong>{PROJECT.name}</strong> is the reference implementation of the{" "}
              <strong>AiGovOps Open Standard (AOS)</strong>. It is published, governed, and
              operated by the <a href={FOUNDATION.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">{FOUNDATION.name}</a> —
              a vendor-neutral nonprofit dedicated to keeping AI governance evidence
              independently verifiable.
            </>
          }
        />

        {/* Co-founders */}
        <section className="mt-10">
          <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-4">
            Co-founders
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {FOUNDATION.cofounders.map((c) => (
              <div
                key={c.email}
                className="rounded-xl border border-border bg-card-grad p-6 shadow-elev"
              >
                <div className="flex items-start justify-between">
                  <Users className="h-6 w-6 text-primary" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-primary">
                    Co-founder
                  </span>
                </div>
                <div className="mt-4 text-lg font-semibold">{c.name}</div>
                <div className="text-sm text-muted-foreground mt-0.5">{c.role}</div>
                <a
                  href={`mailto:${c.email}`}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-mono text-primary hover:underline"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {c.email}
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* What we steward */}
        <section className="mt-12">
          <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-4">
            What the Foundation stewards
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {stewards.map((s) => (
              <div key={s.title} className="rounded-lg border border-border bg-card p-5">
                <s.icon className="h-5 w-5 text-primary" />
                <div className="mt-3 font-semibold">{s.title}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.body}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Open source */}
        <section className="mt-12 rounded-xl border border-border bg-card-grad p-6">
          <div className="grid md:grid-cols-[1fr_auto] gap-4 items-center">
            <div>
              <div className="text-sm font-semibold">Open source community</div>
              <p className="text-sm text-muted-foreground mt-1">
                Code is licensed under <strong>Apache-2.0</strong>; the AOS spec under{" "}
                <strong>CC-BY-4.0</strong>. Contributions follow the{" "}
                <a href={`${PROJECT.repoUrl}/blob/main/CONTRIBUTING.md`} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                  DCO contribution process
                </a>{" "}
                and the{" "}
                <a href={`${PROJECT.repoUrl}/blob/main/GOVERNANCE.md`} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                  governance charter
                </a>
                . Security disclosures go to{" "}
                <a href={`mailto:${FOUNDATION.securityEmail}`} className="text-primary hover:underline">
                  {FOUNDATION.securityEmail}
                </a>
                .
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href={FOUNDATION.githubOrgUrl} target="_blank" rel="noreferrer">
                <Button variant="secondary">
                  <Github className="h-4 w-4 mr-1.5" /> GitHub org
                </Button>
              </a>
              <Link to="/donate">
                <Button>
                  <Heart className="h-4 w-4 mr-1.5" /> Donate
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="mt-10 text-xs text-muted-foreground font-mono">
          General contact:{" "}
          <a href={`mailto:${FOUNDATION.contactEmail}`} className="text-primary hover:underline">
            {FOUNDATION.contactEmail}
          </a>{" "}
          · Foundation site:{" "}
          <a href={FOUNDATION.url} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">
            {FOUNDATION.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
            <ExternalLink className="h-3 w-3" />
          </a>
        </section>
      </main>
    </PublicShell>
  );
};

const stewards = [
  {
    icon: BookOpen,
    title: "AOS standard",
    body: "The versioned, machine-readable AiGovOps Open Standard mapped to EU AI Act, NIST AI RMF, ISO 42001, SOC 2, HIPAA, and GDPR.",
  },
  {
    icon: Shield,
    title: "Audit-chain infra",
    body: "The public verifier, signing-key rotation, canary monitoring, and the chartered QAGA/QAGAC registry.",
  },
  {
    icon: Users,
    title: "QAGA program",
    body: "Training, exam, and chartering of Qualified AiGovOps Assessors who issue Attestations of Conformance.",
  },
];

export default About;
