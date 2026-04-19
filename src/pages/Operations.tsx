import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PublicShell } from "@/components/PublicShell";
import { PageHeader } from "@/components/ui/page-header";
import { usePageMeta } from "@/hooks/usePageMeta";
import { ArrowLeft, KeyRound, Database, ShieldCheck, UserCog, Activity, AlertTriangle } from "lucide-react";

const Operations = () => {
  usePageMeta({
    title: "Operations Runbook · AiGovOps",
    description:
      "How to operate the AiGovOps Review Framework: rotate signing keys, seed and unseed demo data, verify the audit chain, claim first admin, and respond to canary drift.",
    canonical: "/docs/operations",
  });

  return (
    <PublicShell eyebrow="Operations">
      <main className="container max-w-4xl mx-auto pt-10 pb-20">
        <Link to="/docs" className="inline-block">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to docs
          </Button>
        </Link>

        <PageHeader
          eyebrow="Runbook · v1"
          title="Operations runbook"
          description="One-page reference for the people who keep the AiGovOps Review Framework running. Each section is a ~5-minute task."
        />

        <div className="space-y-6">
          {sections.map((s) => (
            <section
              key={s.title}
              className="rounded-xl border border-border bg-card-grad p-6"
              id={s.id}
            >
              <div className="flex items-center gap-3">
                <s.icon className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold tracking-tight">{s.title}</h2>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{s.intro}</p>
              <ol className="mt-4 space-y-2 text-sm list-decimal list-inside marker:text-muted-foreground">
                {s.steps.map((step, i) => (
                  <li key={i} className="leading-relaxed">
                    {step}
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      </main>
    </PublicShell>
  );
};

const sections = [
  {
    id: "first-admin",
    icon: UserCog,
    title: "Claim the first admin",
    intro:
      "The first signed-in user can self-elevate exactly once. After that, only existing admins can grant the role.",
    steps: [
      "Sign up at /auth.",
      "Go to /admin → click 'Claim first admin'. The DB function refuses if any admin already exists.",
      "Grant additional admins from /admin → user search → 'Grant admin'. The system enforces a one-admin minimum.",
    ],
  },
  {
    id: "signing-key",
    icon: KeyRound,
    title: "Rotate the audit signing key",
    intro:
      "AUDIT_SIGNING_KEY is the HMAC secret used to chain audit_log entries. Rotate annually or after suspected exposure.",
    steps: [
      "Generate 32 random bytes hex-encoded: openssl rand -hex 32.",
      "Update the AUDIT_SIGNING_KEY secret in Lovable Cloud → Edge Functions → Secrets.",
      "Existing entries remain verifiable only with the old key. Document the rotation date in CHANGELOG.md so /verify can show a banner pre/post rotation.",
      "Re-deploy any functions that import the secret (audit-verify, sign-decision, issue-attestation) — Lovable redeploys automatically when secrets change.",
    ],
  },
  {
    id: "seed",
    icon: Database,
    title: "Seed (or unseed) demo data",
    intro:
      "Two admin-only edge functions ship a deterministic demo dataset for screenshots, talks, and onboarding.",
    steps: [
      "POST /functions/v1/seed-demo with admin auth → creates 1 firm, 2 QAGAs, 3 reviews, findings, and 1 attestation. Idempotent.",
      "POST /functions/v1/unseed-demo to remove everything tagged demo:seed-v1.",
      "Demo accounts use the *.aigovops.demo email domain — never email-verify them.",
    ],
  },
  {
    id: "verify",
    icon: ShieldCheck,
    title: "Verify a chain in production",
    intro: "Anyone — even unauthenticated visitors — can verify a public review's audit chain.",
    steps: [
      "Open /verify/<reviewId> or call /functions/v1/verify-chain with { reviewId }.",
      "The endpoint returns ok: true|false plus per-entry results: prev_hash mismatch, signature mismatch, or missing fields.",
      "On a mismatch, treat as a potential incident: freeze the review (set status='failed'), open a security issue, and do not re-issue the AOC until investigated.",
    ],
  },
  {
    id: "canary",
    icon: Activity,
    title: "Respond to canary drift",
    intro:
      "The weekly Canary Verify GitHub Action SHA-256-checks every governance-critical file and opens a security issue on drift.",
    steps: [
      "If the drift was intentional and reviewed: regenerate the manifest with `node scripts/verify-canary.mjs --update`, commit it.",
      "If unintentional: revert the change and treat it as a possible supply-chain compromise.",
      "Visitors can re-verify in the browser at /docs/canary — the page recomputes hashes against the live deployment, not just the repo.",
    ],
  },
  {
    id: "incident",
    icon: AlertTriangle,
    title: "Security incident response",
    intro: "Rough triage order. Detailed playbook lives in SECURITY.md.",
    steps: [
      "Stop new attestations: temporarily revoke 'reviewer' from all non-admins via /admin.",
      "Snapshot audit_log + attestations to cold storage.",
      "Rotate AUDIT_SIGNING_KEY and all Supabase service-role-derived secrets.",
      "Email security@aigovopsfoundation.org with the incident timeline; the Foundation will coordinate disclosure.",
    ],
  },
];

export default Operations;
