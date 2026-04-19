import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Rss, Play, Loader2, ExternalLink, Copy, Check } from "lucide-react";
import { PublicShell } from "@/components/PublicShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePageMeta } from "@/hooks/usePageMeta";
import { toast } from "sonner";

const FEED_BASE = `${import.meta.env.VITE_SUPABASE_URL ?? ""}/functions/v1/attestation-feed`;
const NPM_URL = "https://www.npmjs.com/package/@aigovops/verify";

function CodeBlock({ code, lang = "bash" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative group">
      <pre className="bg-muted/50 border border-border rounded-md p-3 text-xs overflow-x-auto font-mono">
        <code className={`language-${lang}`}>{code}</code>
      </pre>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute top-1 right-1 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition"
        onClick={() => {
          navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        aria-label="Copy"
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      </Button>
    </div>
  );
}

export default function Feed() {
  usePageMeta({
    title: "Attestation Feed — AiGovOps",
    description:
      "Public, machine-readable feed of AOS attestations for insurer ingestion. Stable JSON schema v1.0, no auth required.",
    canonical: "/feed",
  });

  const [riskTier, setRiskTier] = useState<string>("any");
  const [organization, setOrganization] = useState("");
  const [since, setSince] = useState("");
  const [includeExpired, setIncludeExpired] = useState(false);
  const [limit, setLimit] = useState("10");
  const [running, setRunning] = useState(false);
  const [response, setResponse] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  const buildUrl = () => {
    const url = new URL(FEED_BASE);
    if (riskTier !== "any") url.searchParams.set("risk_tier", riskTier);
    if (organization.trim()) url.searchParams.set("organization", organization.trim());
    if (since.trim()) url.searchParams.set("since", since.trim());
    if (includeExpired) url.searchParams.set("include_expired", "true");
    if (limit && limit !== "200") url.searchParams.set("limit", limit);
    return url.toString();
  };

  const runFeed = async () => {
    setRunning(true);
    setError(null);
    setResponse(null);
    try {
      const r = await fetch(buildUrl());
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const json = await r.json();
      setResponse(json);
      toast.success(`Feed returned ${json?.stats?.total_returned ?? 0} attestations`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      toast.error(`Feed request failed: ${msg}`);
    } finally {
      setRunning(false);
    }
  };

  // Auto-run on mount with defaults so the page shows something live.
  useEffect(() => {
    runFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const liveUrl = buildUrl();
  const stats = (response as { stats?: Record<string, unknown> } | null)?.stats;

  return (
    <PublicShell eyebrow="Attestation Feed">
      <main className="container max-w-5xl mx-auto px-4 pb-16">
        <div className="mb-6">
          <Link to="/docs" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to docs
          </Link>
        </div>

        <header className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <Rss className="h-5 w-5 text-primary" />
            <Badge variant="outline" className="font-mono text-xs">aos.attestation-feed.v1.0</Badge>
            <Badge variant="secondary" className="font-mono text-xs">No auth required</Badge>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-3">Public Attestation Feed</h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            A machine-readable JSON feed of every AOS attestation issued by this reference server.
            Designed for insurer underwriting pipelines, regulator dashboards, procurement gates,
            and continuous-conformance monitors.
          </p>
        </header>

        {/* Endpoint */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Endpoint</CardTitle>
            <CardDescription>Stable, additive-only schema. Insurers should pin against <code className="font-mono">feed.version</code>.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <CodeBlock code={`GET ${FEED_BASE}`} />
            <div className="text-xs text-muted-foreground">
              Returns <code className="font-mono">application/json</code> · cached <code className="font-mono">max-age=60</code> · CORS open · <code className="font-mono">fail</code> determinations are filtered out
            </div>
          </CardContent>
        </Card>

        {/* Query params */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Query parameters</CardTitle>
            <CardDescription>All params optional. Combine freely.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left border-b border-border">
                  <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Param</th>
                    <th className="py-2 pr-4 font-medium">Type</th>
                    <th className="py-2 font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-mono text-xs">
                  <tr><td className="py-2 pr-4">since</td><td className="py-2 pr-4">ISO timestamp</td><td className="py-2">Lower bound on <code>issued_at</code>. Example: <code>2026-01-01T00:00:00Z</code></td></tr>
                  <tr><td className="py-2 pr-4">risk_tier</td><td className="py-2 pr-4">enum</td><td className="py-2"><code>medium</code> · <code>high</code> · <code>critical</code> (filters on <code>risk_tier_derived</code>)</td></tr>
                  <tr><td className="py-2 pr-4">organization</td><td className="py-2 pr-4">substring</td><td className="py-2">Case-insensitive ILIKE match on issued org name</td></tr>
                  <tr><td className="py-2 pr-4">include_expired</td><td className="py-2 pr-4">boolean</td><td className="py-2">Default <code>false</code>. Set <code>true</code> to receive expired + revoked entries</td></tr>
                  <tr><td className="py-2 pr-4">limit</td><td className="py-2 pr-4">integer</td><td className="py-2">Default 200, max 1000</td></tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Curl examples */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">curl examples</CardTitle>
            <CardDescription>Drop-in snippets for ops runbooks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">All active attestations</div>
              <CodeBlock code={`curl -s "${FEED_BASE}" | jq '.stats'`} />
            </div>
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">High & critical risk only — underwriting queue</div>
              <CodeBlock code={`curl -s "${FEED_BASE}?risk_tier=critical" | jq '.attestations[] | {organization, scope, issued_at, expires_at}'`} />
            </div>
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Newly issued since a date</div>
              <CodeBlock code={`curl -s "${FEED_BASE}?since=2026-01-01T00:00:00Z" | jq '.attestations | length'`} />
            </div>
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Specific organization, including expired</div>
              <CodeBlock code={`curl -s "${FEED_BASE}?organization=Acme&include_expired=true" | jq`} />
            </div>
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Disagreement signal — declared vs derived risk tier</div>
              <CodeBlock code={`curl -s "${FEED_BASE}" | jq '.attestations[] | select(.risk_tier.disagreement) | {org: .organization, declared: .risk_tier.declared, derived: .risk_tier.derived}'`} />
            </div>
          </CardContent>
        </Card>

        {/* Schema */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Response schema (v1.0)</CardTitle>
            <CardDescription>Top-level shape. Per-attestation fields below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <CodeBlock
              lang="json"
              code={`{
  "feed": {
    "version": "1.0",
    "spec_url": "…/docs/aos-spec",
    "generated_at": "2026-04-19T…Z",
    "publisher": "AiGovOps Foundation reference implementation",
    "standard": "AiGovOps Open Standard (AOS) v0.1",
    "signature_kind_in_use": "hmac-sha256-demo"
  },
  "stats": {
    "total_returned": 12,
    "by_tier":   { "medium": 4, "high": 6, "critical": 2, "unclassified": 0 },
    "by_status": { "active": 12, "expired": 0, "revoked": 0 },
    "disagreements": 3
  },
  "attestations": [
    {
      "id": "uuid",
      "review_id": "uuid",
      "organization": "Acme Corp",
      "scope": "AI-assisted code review",
      "determination": "pass | pass_with_compensations",
      "aos_version": "0.1",
      "scenarios": ["healthcare_codegen"],
      "risk_tier": {
        "declared":     "medium",
        "derived":      "critical",
        "disagreement": true
      },
      "issued_at":  "2026-04-19T…Z",
      "expires_at": "2027-04-19T…Z",
      "status":     "active",
      "revoked_at": null,
      "signatures": { "kind": "hmac-sha256-demo", "ken": "hex…", "bob": "hex…" },
      "integrity":  { "pdf_sha256": "hex…", "audit_entry_hash": "hex…", "audit_prev_hash": "hex…" },
      "pdf_url":    "https://…/storage/v1/object/public/attestations/…pdf",
      "verify_url": "https://…/verify/uuid"
    }
  ]
}`}
            />
          </CardContent>
        </Card>

        {/* Try it */}
        <Card className="mb-8 border-primary/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Play className="h-4 w-4 text-primary" /> Try it live
            </CardTitle>
            <CardDescription>Hits the live endpoint from your browser. No auth, no signup.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="tier" className="text-xs">risk_tier</Label>
                <Select value={riskTier} onValueChange={setRiskTier}>
                  <SelectTrigger id="tier"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">any</SelectItem>
                    <SelectItem value="medium">medium</SelectItem>
                    <SelectItem value="high">high</SelectItem>
                    <SelectItem value="critical">critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="org" className="text-xs">organization (substring)</Label>
                <Input id="org" value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder="Acme" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="since" className="text-xs">since (ISO)</Label>
                <Input id="since" value={since} onChange={(e) => setSince(e.target.value)} placeholder="2026-01-01T00:00:00Z" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="limit" className="text-xs">limit</Label>
                <Input id="limit" type="number" min={1} max={1000} value={limit} onChange={(e) => setLimit(e.target.value)} />
              </div>
              <label className="flex items-center gap-2 text-sm sm:col-span-2 select-none">
                <input
                  type="checkbox"
                  checked={includeExpired}
                  onChange={(e) => setIncludeExpired(e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                include_expired
              </label>
            </div>

            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Request</div>
              <CodeBlock code={`curl -s "${liveUrl}"`} />
            </div>

            <Button onClick={runFeed} disabled={running} className="w-full sm:w-auto">
              {running ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
              {running ? "Fetching…" : "Run request"}
            </Button>

            {error && (
              <div className="text-sm text-destructive font-mono border border-destructive/30 bg-destructive/5 rounded-md p-3">
                {error}
              </div>
            )}

            {stats != null && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="rounded-md border border-border p-2">
                  <div className="text-xs text-muted-foreground">Returned</div>
                  <div className="text-lg font-semibold font-mono">{String((stats as Record<string, unknown>).total_returned ?? 0)}</div>
                </div>
                <div className="rounded-md border border-border p-2">
                  <div className="text-xs text-muted-foreground">Critical</div>
                  <div className="text-lg font-semibold font-mono">
                    {String(((stats as { by_tier?: Record<string, number> }).by_tier?.critical) ?? 0)}
                  </div>
                </div>
                <div className="rounded-md border border-border p-2">
                  <div className="text-xs text-muted-foreground">High</div>
                  <div className="text-lg font-semibold font-mono">
                    {String(((stats as { by_tier?: Record<string, number> }).by_tier?.high) ?? 0)}
                  </div>
                </div>
                <div className="rounded-md border border-border p-2">
                  <div className="text-xs text-muted-foreground">Disagreements</div>
                  <div className="text-lg font-semibold font-mono">{String((stats as Record<string, unknown>).disagreements ?? 0)}</div>
                </div>
              </div>
            )}

            {response != null && (
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Response (truncated)</div>
                <pre className="bg-muted/50 border border-border rounded-md p-3 text-xs overflow-x-auto max-h-96 font-mono">
                  <code>{JSON.stringify(response, null, 2).slice(0, 8000)}</code>
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Use with verify */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Ingest with @aigovops/verify</CardTitle>
            <CardDescription>The OSS verifier ships typed helpers for this feed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <CodeBlock
              lang="ts"
              code={`import { fetchFeed, activeOnly, expiringWithinDays } from "@aigovops/verify";

const feed = await fetchFeed({
  host: "${(import.meta.env.VITE_SUPABASE_URL ?? "").replace(/\\/functions\\/v1$/, "") || "https://aigovops.example.com"}",
  risk_tier: "high",
  since:     "2026-01-01",
});

for (const a of activeOnly(feed)) {
  if (a.risk_tier_disagreement) {
    console.warn(\`[\${a.organization}] declared \${a.risk_tier_declared} but derived \${a.risk_tier_derived}\`);
  }
}

const renewSoon = expiringWithinDays(feed, 30);`}
            />
            <div className="flex flex-wrap gap-2 pt-1">
              <a href={NPM_URL} target="_blank" rel="noreferrer">
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-3 w-3 mr-1" /> npm: @aigovops/verify
                </Button>
              </a>
              <Link to="/developers">
                <Button variant="outline" size="sm">Verifier docs</Button>
              </Link>
              <Link to="/docs/aos-spec">
                <Button variant="outline" size="sm">AOS spec</Button>
              </Link>
              <Link to="/registry">
                <Button variant="outline" size="sm">Public registry</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-xs text-muted-foreground font-mono">
          Schema is frozen at v1.0 — only additive changes. Breaking changes will bump <code>feed.version</code> and live at a new path.
        </div>
      </main>
    </PublicShell>
  );
}
