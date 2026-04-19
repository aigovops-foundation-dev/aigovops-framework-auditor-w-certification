// attestation-feed — public, machine-readable feed of issued Review Attestations
// for insurer / underwriter ingestion. Stable JSON schema (versioned). No JWT.
//
// Schema is FROZEN at v1 — additive changes only. Insurers will pin against
// `feed.version`. Output is shaped to be ingestible alongside SLSA provenance
// attestations and Sigstore Rekor entries.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const FEED_VERSION = "1.0";
const FEED_SPEC_URL = "https://aigovops-framework-auditor-w-certification.lovable.app/docs/aos-spec";

interface FeedEntry {
  /** Stable cert id; insurer's primary key for this attestation. */
  id: string;
  review_id: string;
  organization: string;
  scope: string;
  /** "pass" | "pass_with_compensations" | "fail" — fail certs are not emitted. */
  determination: string;
  aos_version: string;
  scenarios: string[];
  risk_tier: {
    /** What the insured self-classified at intake (EU AI Act-style). */
    declared: string | null;
    /** What the agent pipeline derived from findings + scenarios. */
    derived: string | null;
    /** True when the two disagree — an underwriting signal. */
    disagreement: boolean;
  };
  issued_at: string;
  expires_at: string;
  /** Whether this attestation is currently in force. */
  status: "active" | "expired" | "revoked";
  revoked_at: string | null;
  signatures: {
    kind: string;
    ken: string | null;
    bob: string | null;
  };
  integrity: {
    pdf_sha256: string | null;
    audit_entry_hash: string | null;
    audit_prev_hash: string | null;
  };
  pdf_url: string | null;
  verify_url: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const url = new URL(req.url);
    const sinceParam = url.searchParams.get("since"); // ISO timestamp filter
    const tierFilter = url.searchParams.get("risk_tier"); // medium|high|critical
    const orgFilter = url.searchParams.get("organization");
    const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "200", 10) || 200, 1000);
    const includeExpired = url.searchParams.get("include_expired") === "true";

    let q = admin.from("certifications")
      .select(`
        id, review_id, organization, scope_statement, aos_version,
        determination, scenarios, signature_kind, ken_signature, bob_signature,
        risk_tier_declared, risk_tier_derived, expires_at, revoked_at,
        pdf_path, pdf_sha256, audit_entry_hash, audit_prev_hash, issued_at
      `)
      .neq("determination", "fail")
      .order("issued_at", { ascending: false })
      .limit(limit);

    if (sinceParam) q = q.gte("issued_at", sinceParam);
    if (tierFilter && ["medium","high","critical"].includes(tierFilter)) {
      q = q.eq("risk_tier_derived", tierFilter);
    }
    if (orgFilter) q = q.ilike("organization", `%${orgFilter}%`);

    const { data: certs, error } = await q;
    if (error) throw error;

    const now = Date.now();
    const origin = url.origin.replace(/\/functions\/v1$/, "");

    const entries: FeedEntry[] = (certs ?? [])
      .map((c) => {
        const expired = new Date(c.expires_at).getTime() < now;
        const status: FeedEntry["status"] = c.revoked_at ? "revoked" : expired ? "expired" : "active";
        return {
          id: c.id,
          review_id: c.review_id,
          organization: c.organization,
          scope: c.scope_statement,
          determination: c.determination,
          aos_version: c.aos_version,
          scenarios: c.scenarios ?? [],
          risk_tier: {
            declared: c.risk_tier_declared,
            derived: c.risk_tier_derived,
            disagreement: !!c.risk_tier_declared
              && !!c.risk_tier_derived
              && c.risk_tier_declared !== c.risk_tier_derived,
          },
          issued_at: c.issued_at,
          expires_at: c.expires_at,
          status,
          revoked_at: c.revoked_at,
          signatures: {
            kind: c.signature_kind,
            ken: c.ken_signature,
            bob: c.bob_signature,
          },
          integrity: {
            pdf_sha256: c.pdf_sha256,
            audit_entry_hash: c.audit_entry_hash,
            audit_prev_hash: c.audit_prev_hash,
          },
          pdf_url: c.pdf_path
            ? `${SUPABASE_URL}/storage/v1/object/public/attestations/${c.pdf_path}`
            : null,
          verify_url: `${origin}/verify/${c.review_id}`,
        };
      })
      .filter((e) => includeExpired || e.status === "active");

    const body = {
      feed: {
        version: FEED_VERSION,
        spec_url: FEED_SPEC_URL,
        generated_at: new Date().toISOString(),
        publisher: "AiGovOps Foundation reference implementation",
        standard: "AiGovOps Open Standard (AOS) v0.1",
        signature_kind_in_use: "hmac-sha256-demo",
        notes: "Additive changes only. Insurers should pin against feed.version. " +
               "Filter params: since (ISO timestamp), risk_tier (medium|high|critical), " +
               "organization (substring), limit (default 200, max 1000), include_expired (true|false).",
      },
      stats: {
        total_returned: entries.length,
        by_tier: {
          medium: entries.filter((e) => e.risk_tier.derived === "medium").length,
          high: entries.filter((e) => e.risk_tier.derived === "high").length,
          critical: entries.filter((e) => e.risk_tier.derived === "critical").length,
          unclassified: entries.filter((e) => !e.risk_tier.derived).length,
        },
        by_status: {
          active: entries.filter((e) => e.status === "active").length,
          expired: entries.filter((e) => e.status === "expired").length,
          revoked: entries.filter((e) => e.status === "revoked").length,
        },
        disagreements: entries.filter((e) => e.risk_tier.disagreement).length,
      },
      attestations: entries,
    };

    return new Response(JSON.stringify(body, null, 2), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        // Lightly cache for insurer fleets — feed updates on cert issuance.
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    console.error("attestation-feed error", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
