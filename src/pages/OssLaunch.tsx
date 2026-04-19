import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Scale,
  FileText,
  ShieldAlert,
  Landmark,
  Users,
  HeartHandshake,
  History,
  Info,
  Lock,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicShell } from "@/components/PublicShell";
import { PageHeader } from "@/components/ui/page-header";
import { usePageMeta } from "@/hooks/usePageMeta";
import { FOUNDATION } from "@/lib/config";
import type { LucideIcon } from "lucide-react";

interface ChecklistItem {
  id: string;
  title: string;
  purpose: string;
  icon: LucideIcon;
  /** Path within this app (e.g. /about, /security) */
  appRoute?: string;
  /** File at the repo root, served via raw GitHub */
  repoFile?: string;
  /** Static file under /public */
  publicFile?: string;
  status: "shipped" | "draft";
}

const REPO_RAW_BASE = `${FOUNDATION.githubOrgUrl}/aigovops-review-framework/blob/main`;

const ITEMS: ChecklistItem[] = [
  {
    id: "license",
    title: "LICENSE",
    purpose:
      "Apache-2.0 — the framework code, edge functions, schemas, and verification CLI are all licensed under Apache-2.0. The AOS spec under /public/specs is dual-licensed CC-BY-4.0.",
    icon: Scale,
    repoFile: "LICENSE",
    status: "shipped",
  },
  {
    id: "notice",
    title: "NOTICE",
    purpose:
      "Attribution notice required by Apache-2.0 §4(d). Lists the AiGovOps Foundation as the steward and credits co-founders Bob Rapp and Ken Johnston.",
    icon: FileText,
    repoFile: "NOTICE",
    status: "shipped",
  },
  {
    id: "security",
    title: "SECURITY.md",
    purpose:
      "Responsible-disclosure policy. Email security@aigovopsfoundation.org with reproduction steps. We acknowledge in 72 hours and aim to triage in 7 days. CC both co-founders for high-severity reports.",
    icon: ShieldAlert,
    repoFile: "SECURITY.md",
    status: "shipped",
  },
  {
    id: "governance",
    title: "GOVERNANCE.md",
    purpose:
      "How decisions get made. Co-founder stewardship model, roles (Technical Steward, Governance Steward), RFC process, and how the AOS spec is versioned.",
    icon: Landmark,
    repoFile: "GOVERNANCE.md",
    status: "shipped",
  },
  {
    id: "contributing",
    title: "CONTRIBUTING.md",
    purpose:
      "How to file issues, submit PRs, and propose new AOS controls. Includes the DCO sign-off requirement and the AOS-control proposal issue template.",
    icon: HeartHandshake,
    repoFile: "CONTRIBUTING.md",
    status: "shipped",
  },
  {
    id: "code-of-conduct",
    title: "CODE_OF_CONDUCT.md",
    purpose:
      "Contributor Covenant v2.1. Reports go to conduct@aigovopsfoundation.org. Enforced by the steward team — see GOVERNANCE.md for the escalation chain.",
    icon: Users,
    repoFile: "CODE_OF_CONDUCT.md",
    status: "shipped",
  },
  {
    id: "changelog",
    title: "CHANGELOG.md",
    purpose:
      "Keep-a-Changelog format. Tagged releases, security advisories, and breaking changes to the AOS spec are recorded here before they ship.",
    icon: History,
    repoFile: "CHANGELOG.md",
    status: "shipped",
  },
  {
    id: "operations",
    title: "OPERATIONS.md",
    purpose:
      "Runbook for the people who keep the framework running: rotate the audit signing key, seed/unseed demo data, verify chains, claim first admin, respond to canary drift.",
    icon: FileText,
    repoFile: "OPERATIONS.md",
    appRoute: "/docs/operations",
    status: "shipped",
  },
  {
    id: "about",
    title: "About page",
    purpose:
      "Public /about page — the foundation, the co-founders, mailto links, and the JSON-LD founder array so machines can also see who stewards the project.",
    icon: Info,
    appRoute: "/about",
    status: "shipped",
  },
  {
    id: "security-page",
    title: "Security page",
    purpose:
      "Public /security page — the project's RLS posture (8-row table), HMAC-SHA-256 audit-chain explanation, Realtime topic-auth model, and the responsible-disclosure CTA.",
    icon: Lock,
    appRoute: "/security",
    status: "shipped",
  },
  {
    id: "canary",
    title: "Canary manifest",
    purpose:
      "Tamper-evident SHA-256 hashes for every governance-critical file. Verified weekly by GitHub Actions; drift opens a security issue automatically.",
    icon: ShieldAlert,
    appRoute: "/docs/canary",
    publicFile: "/canary-manifest.json",
    status: "shipped",
  },
];

const OssLaunch = () => {
  usePageMeta({
    title: "OSS Launch Checklist · AiGovOps",
    description:
      "Every governance file the AiGovOps Review Framework ships with — LICENSE, NOTICE, SECURITY, GOVERNANCE, CONTRIBUTING, CODE_OF_CONDUCT, CHANGELOG, About, Security. One page. One link per file.",
    canonical: "/docs/oss-launch",
  });

  const shippedCount = ITEMS.filter((i) => i.status === "shipped").length;

  return (
    <PublicShell eyebrow="OSS Launch">
      <main className="container max-w-4xl mx-auto pt-10 pb-20">
        <Link to="/docs" className="inline-block">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to docs
          </Button>
        </Link>

        <PageHeader
          eyebrow={`Checklist · ${shippedCount}/${ITEMS.length} shipped`}
          title="OSS launch checklist"
          description="Every governance file the AiGovOps Review Framework ships with. One row per artifact, one link per file — so contributors, auditors, and downstream forks know exactly where to look."
        />

        <section className="rounded-xl border border-primary/30 bg-primary/5 p-5 mb-8">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div className="text-sm leading-relaxed">
              <div className="font-semibold mb-1">Why this page exists.</div>
              <p className="text-muted-foreground">
                Open-source governance is only credible if it's discoverable. This page is the
                one-stop index — every required artifact is linked here, with a one-line purpose,
                a link to the file in the GitHub repo, and (where applicable) a link to the
                rendered version inside this app.
              </p>
            </div>
          </div>
        </section>

        <div className="space-y-3">
          {ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.id}
                id={item.id}
                className="rounded-xl border border-border bg-card-grad p-5 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 grid place-items-center shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base font-semibold tracking-tight">{item.title}</h2>
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {item.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                      {item.purpose}
                    </p>
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      {item.appRoute && (
                        <Link to={item.appRoute}>
                          <Button variant="outline" size="sm">
                            View in app
                          </Button>
                        </Link>
                      )}
                      {item.repoFile && (
                        <a
                          href={`${REPO_RAW_BASE}/${item.repoFile}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-3.5 w-3.5 mr-1" />
                            {item.repoFile}
                          </Button>
                        </a>
                      )}
                      {item.publicFile && (
                        <a href={item.publicFile} target="_blank" rel="noreferrer">
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-3.5 w-3.5 mr-1" />
                            {item.publicFile}
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <section className="mt-10 rounded-xl border border-border bg-background/40 p-6">
          <h2 className="text-lg font-semibold tracking-tight">For downstream forks</h2>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            If you fork this framework: keep <code className="font-mono text-xs px-1 py-0.5 rounded bg-muted">LICENSE</code>,{" "}
            <code className="font-mono text-xs px-1 py-0.5 rounded bg-muted">NOTICE</code>, and the canary manifest
            intact. Replace <code className="font-mono text-xs px-1 py-0.5 rounded bg-muted">SECURITY.md</code> with
            your own disclosure address. Update <code className="font-mono text-xs px-1 py-0.5 rounded bg-muted">GOVERNANCE.md</code>{" "}
            to reflect your own steward team.
          </p>
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <a href={FOUNDATION.githubOrgUrl} target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm">
                <ExternalLink className="h-3.5 w-3.5 mr-1" /> GitHub org
              </Button>
            </a>
            <Link to="/security">
              <Button variant="ghost" size="sm">Security model</Button>
            </Link>
            <Link to="/about">
              <Button variant="ghost" size="sm">About the foundation</Button>
            </Link>
          </div>
        </section>
      </main>
    </PublicShell>
  );
};

export default OssLaunch;
