import { Link } from "react-router-dom";
import {
  Shield,
  Lock,
  KeyRound,
  Mail,
  FileSearch,
  Database,
  Radio,
  Github,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { PublicShell } from "@/components/PublicShell";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePageMeta } from "@/hooks/usePageMeta";
import { FOUNDATION, PROJECT } from "@/lib/config";

const Security = () => {
  usePageMeta({
    title: "Security · AiGovOps Review Framework",
    description:
      "Row-level security posture, audit-chain signing, key rotation, and responsible disclosure for the AiGovOps Review Framework.",
    canonical: "/security",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Security policy & disclosure",
      url: `${PROJECT.publishedUrl}/security`,
      publisher: {
        "@type": "NGO",
        name: FOUNDATION.name,
        url: FOUNDATION.url,
        email: FOUNDATION.securityEmail,
      },
    },
  });

  return (
    <PublicShell eyebrow="Security">
      <main className="container max-w-5xl mx-auto pt-12 pb-20">
        <PageHeader
          eyebrow="Open source · Independently verifiable"
          title="Security model & responsible disclosure."
          description={
            <>
              The {PROJECT.name} is designed so that <strong>nothing important is taken on
              trust</strong>. Every Attestation of Conformance is reproducible from the
              signed audit chain, every database row is gated by Postgres row-level
              security, and the verification library runs offline. This page documents
              what we enforce, how to audit it, and where to report a vulnerability.
            </>
          }
        />

        {/* Disclosure CTA */}
        <section className="mt-10 rounded-xl border border-primary/40 bg-card-grad p-6 shadow-glow">
          <div className="grid md:grid-cols-[1fr_auto] gap-4 items-center">
            <div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                <div className="font-semibold">Found a vulnerability?</div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Email{" "}
                <a
                  href={`mailto:${FOUNDATION.securityEmail}`}
                  className="text-primary font-mono hover:underline"
                >
                  {FOUNDATION.securityEmail}
                </a>{" "}
                with reproduction steps. Please do <strong>not</strong> open a public
                GitHub issue for security-sensitive reports. We acknowledge within
                <strong> 72 hours</strong> and aim to triage within{" "}
                <strong>7 days</strong>. Coordinated disclosure is welcome — see{" "}
                <a
                  href={`${PROJECT.repoUrl}/blob/main/SECURITY.md`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  SECURITY.md
                </a>{" "}
                for the full policy.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href={`mailto:${FOUNDATION.securityEmail}`}>
                <Button>
                  <Mail className="h-4 w-4 mr-1.5" /> Report privately
                </Button>
              </a>
              <a
                href={`${PROJECT.repoUrl}/blob/main/SECURITY.md`}
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="secondary">
                  <Github className="h-4 w-4 mr-1.5" /> SECURITY.md
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Pillars */}
        <section className="mt-12 grid md:grid-cols-3 gap-4">
          {pillars.map((p) => (
            <div key={p.title} className="rounded-lg border border-border bg-card p-5">
              <p.icon className="h-5 w-5 text-primary" />
              <div className="mt-3 font-semibold">{p.title}</div>
              <div className="text-sm text-muted-foreground mt-1">{p.body}</div>
            </div>
          ))}
        </section>

        {/* RLS posture */}
        <section className="mt-12">
          <SectionHeading
            icon={Database}
            title="Row-Level Security (RLS) posture"
            kicker="Postgres-enforced authorization"
          />
          <p className="text-sm text-muted-foreground mt-2">
            Every public table has RLS enabled. Authorization is expressed as Postgres
            policies — not application code — so the same rules apply to the web app,
            edge functions, direct REST calls, and Realtime subscriptions.
          </p>
          <div className="mt-5 rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr className="text-left text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Table / surface</th>
                  <th className="px-4 py-3">Who can read</th>
                  <th className="px-4 py-3">Who can write</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rlsRows.map((r) => (
                  <tr key={r.surface}>
                    <td className="px-4 py-3 font-mono text-xs">{r.surface}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.read}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.write}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3 font-mono">
            Service-role keys live only in deployed edge functions and are never shipped
            to the client. The published anon key has no privileges beyond what the RLS
            policies above allow.
          </p>
        </section>

        {/* Audit chain */}
        <section className="mt-12">
          <SectionHeading
            icon={KeyRound}
            title="Audit chain & signing"
            kicker="HMAC-SHA-256 hash chain · independently verifiable"
          />
          <div className="mt-4 grid md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="font-semibold">How entries are sealed</div>
              <ul className="mt-3 text-sm text-muted-foreground space-y-2 list-disc pl-5">
                <li>
                  Every audit event is canonicalized (sorted-key JSON) and hashed with
                  the previous entry's hash → tamper-evident chain.
                </li>
                <li>
                  Each entry is then signed with{" "}
                  <span className="font-mono text-foreground/80">HMAC-SHA-256</span>{" "}
                  using a secret held only by the edge function.
                </li>
                <li>
                  Attestation PDFs embed the chain manifest + entry hash, so the
                  document itself proves which audit prefix produced it.
                </li>
                <li>
                  The standalone verifier{" "}
                  <a
                    href={`https://www.npmjs.com/package/${PROJECT.verifierPackage}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-primary hover:underline"
                  >
                    {PROJECT.verifierPackage}
                  </a>{" "}
                  re-validates the chain offline, against a public key — no server
                  call required.
                </li>
              </ul>
            </div>
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="font-semibold">Operator controls</div>
              <ul className="mt-3 text-sm text-muted-foreground space-y-2 list-disc pl-5">
                <li>
                  Signing key (<span className="font-mono">AUDIT_SIGNING_KEY</span>) is
                  stored as an encrypted secret. Rotation procedure is documented in{" "}
                  <Link to="/docs/operations" className="text-primary hover:underline">
                    OPERATIONS
                  </Link>
                  .
                </li>
                <li>
                  A daily canary entry is published; mismatches break the public{" "}
                  <Link to="/docs/canary" className="text-primary hover:underline">
                    canary
                  </Link>{" "}
                  badge.
                </li>
                <li>
                  Audit rows are insert-only at the database level — no UPDATE / DELETE
                  policies exist on{" "}
                  <span className="font-mono">audit_log</span>.
                </li>
                <li>
                  Authenticated inserts must reference a review the actor owns or
                  moderates; null-review writes are service-role only.
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/audit">
              <Button variant="secondary" size="sm">
                <FileSearch className="h-4 w-4 mr-1.5" /> Browse the audit log
              </Button>
            </Link>
            <a
              href={`${PROJECT.repoUrl}/tree/main/packages/verify`}
              target="_blank"
              rel="noreferrer"
            >
              <Button variant="ghost" size="sm">
                <Github className="h-4 w-4 mr-1.5" /> Verifier source
              </Button>
            </a>
          </div>
        </section>

        {/* Realtime */}
        <section className="mt-12">
          <SectionHeading
            icon={Radio}
            title="Realtime channel authorization"
            kicker="Topic-scoped subscriptions"
          />
          <p className="text-sm text-muted-foreground mt-2">
            Realtime channels are gated by RLS on{" "}
            <span className="font-mono text-foreground/80">realtime.messages</span>.
            Subscriptions are scoped by topic prefix:
          </p>
          <ul className="mt-3 text-sm text-muted-foreground space-y-1.5 list-disc pl-5">
            <li>
              <span className="font-mono text-foreground/80">agent_threads:&lt;id&gt;</span>{" "}
              and{" "}
              <span className="font-mono text-foreground/80">agent_messages:&lt;id&gt;</span>{" "}
              — the thread owner only.
            </li>
            <li>
              <span className="font-mono text-foreground/80">reviews:&lt;id&gt;</span>,{" "}
              <span className="font-mono text-foreground/80">hitl_reviews:&lt;id&gt;</span>,{" "}
              <span className="font-mono text-foreground/80">agent_decisions:&lt;id&gt;</span>,{" "}
              <span className="font-mono text-foreground/80">agent_findings:&lt;id&gt;</span>{" "}
              — the review submitter, plus reviewer/admin roles.
            </li>
            <li>Admins can subscribe to any channel.</li>
          </ul>
        </section>

        {/* Auth */}
        <section className="mt-12">
          <SectionHeading
            icon={Lock}
            title="Authentication & roles"
            kicker="Email/password · roles in a separate table"
          />
          <ul className="mt-3 text-sm text-muted-foreground space-y-2 list-disc pl-5">
            <li>
              Roles (<span className="font-mono">admin · reviewer · submitter · curator</span>
              ) live in <span className="font-mono">user_roles</span>, never on{" "}
              <span className="font-mono">profiles</span> — preventing client-side
              privilege escalation.
            </li>
            <li>
              Role checks go through the <span className="font-mono">has_role()</span>{" "}
              security-definer function so RLS policies cannot recurse on themselves.
            </li>
            <li>
              First-admin claim is one-shot:{" "}
              <span className="font-mono">claim_first_admin()</span> succeeds only when
              zero admins exist.
            </li>
            <li>
              Anonymous Supabase sign-ins are <strong>disabled</strong>. Anon traffic
              can read only public registries (assessor / firm directory, AOS catalog,
              published attestations).
            </li>
          </ul>
        </section>

        {/* What we don't do */}
        <section className="mt-12 rounded-xl border border-border bg-card-grad p-6">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <div className="font-semibold">Things we explicitly avoid</div>
          </div>
          <div className="mt-3 grid md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {antipatterns.map((a) => (
              <div key={a} className="flex gap-2">
                <span className="text-primary mt-0.5">·</span>
                <span>{a}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Continuous review */}
        <section className="mt-12">
          <SectionHeading
            icon={Shield}
            title="Continuous security review"
            kicker="Linter · scanners · dependency audits"
          />
          <ul className="mt-3 text-sm text-muted-foreground space-y-2 list-disc pl-5">
            <li>
              The Supabase database linter runs on every migration; findings are
              triaged before merge.
            </li>
            <li>
              <span className="font-mono">npm audit</span> on each release; high /
              critical vulnerabilities block the cut.
            </li>
            <li>
              All edge functions validate JWT claims server-side and re-check ownership
              via RLS-scoped clients before performing privileged work.
            </li>
            <li>
              Issue templates and{" "}
              <a
                href={`${PROJECT.repoUrl}/blob/main/.github/ISSUE_TEMPLATE/security.yml`}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                a dedicated security report form
              </a>{" "}
              are published for community contributors.
            </li>
          </ul>
        </section>

        {/* Disclosure footer */}
        <section className="mt-12 rounded-xl border border-border bg-card p-6">
          <div className="grid md:grid-cols-[1fr_auto] gap-4 items-center">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Coordinated disclosure
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                We commit to crediting reporters (unless anonymity is requested) in the
                changelog and on the project's security advisory feed. Full policy:{" "}
                <a
                  href={`${PROJECT.repoUrl}/blob/main/SECURITY.md`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  SECURITY.md
                </a>
                .
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="secondary" className="font-mono text-[10px]">
                  Apache-2.0
                </Badge>
                <Badge variant="secondary" className="font-mono text-[10px]">
                  AOS-aligned
                </Badge>
                <Badge variant="secondary" className="font-mono text-[10px]">
                  HMAC-SHA-256 chain
                </Badge>
                <Badge variant="secondary" className="font-mono text-[10px]">
                  RLS enforced
                </Badge>
              </div>
            </div>
            <div className="flex flex-col gap-2 text-xs font-mono text-muted-foreground">
              <a
                href={`mailto:${FOUNDATION.securityEmail}`}
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                <Mail className="h-3.5 w-3.5" />
                {FOUNDATION.securityEmail}
              </a>
              <a
                href={FOUNDATION.url}
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground inline-flex items-center gap-1"
              >
                {FOUNDATION.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
};

const SectionHeading = ({
  icon: Icon,
  title,
  kicker,
}: {
  icon: typeof Shield;
  title: string;
  kicker: string;
}) => (
  <div>
    <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
      {kicker}
    </div>
    <div className="mt-1 flex items-center gap-2">
      <Icon className="h-5 w-5 text-primary" />
      <h2 className="text-xl font-semibold">{title}</h2>
    </div>
  </div>
);

const pillars = [
  {
    icon: Database,
    title: "RLS by default",
    body: "Every public table has row-level security enabled. Authorization lives in Postgres policies, not in app code.",
  },
  {
    icon: KeyRound,
    title: "Tamper-evident audit",
    body: "HMAC-signed hash chain. Reproduce any attestation offline with the @aigovops/verify CLI.",
  },
  {
    icon: Lock,
    title: "Least-privilege secrets",
    body: "Service-role and signing keys live only in edge function secrets. The shipped anon key carries only public-read privileges.",
  },
];

const rlsRows = [
  {
    surface: "profiles",
    read: "Self only · admin sees all",
    write: "Self updates own row",
  },
  {
    surface: "reviews / review_artifacts / agent_findings",
    read: "Submitter · reviewer · admin",
    write: "Submitter (drafts) · reviewer / admin (any state)",
  },
  {
    surface: "agent_threads / agent_messages",
    read: "Thread owner · admin",
    write: "Thread owner inserts own messages",
  },
  {
    surface: "audit_log",
    read: "Submitter (own review) · admin",
    write: "Insert-only · must reference an owned/moderated review",
  },
  {
    surface: "attestations / certifications",
    read: "Public (designed for verification)",
    write: "Issued by chartered QAGA only · admin override",
  },
  {
    surface: "user_roles",
    read: "Self · admin",
    write: "Admin only (via assign_role / revoke_role)",
  },
  {
    surface: "qaga_assessors / qagac_firms (public view)",
    read: "Public registry of active, listed assessors and firms",
    write: "Admin-managed; assessors update only safe self fields",
  },
  {
    surface: "Realtime channels",
    read: "Topic-scoped — owner of thread or review only · admin override",
    write: "n/a (broadcast only)",
  },
];

const antipatterns = [
  "No service-role key in client code or in the browser bundle.",
  "No roles stored on the profiles or users table — strictly user_roles.",
  "No ALTER on auth, storage, realtime, supabase_functions, or vault schemas.",
  "No raw-SQL execution from the client (no rpc('execute_sql', …)).",
  "No CHECK constraints on time-based predicates — validation triggers instead.",
  "No anonymous Supabase auth sign-ins enabled.",
];

export default Security;
