// Verify the signed audit chain for a review.
// Refactored to use shared HTTP helpers for CORS / errors / preflight.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { verifyChain } from "../_shared/audit.ts";
import { withHttp, jsonResponse, errorResponse, requireEnv } from "../_shared/http.ts";

Deno.serve(withHttp(async (req) => {
  const { reviewId } = await req.json().catch(() => ({}));
  if (!reviewId) return errorResponse("reviewId required", 400);

  const secret = requireEnv("AUDIT_SIGNING_KEY");
  const SUPABASE_URL = requireEnv("SUPABASE_URL");
  const ANON = requireEnv("SUPABASE_ANON_KEY");

  const authHeader = req.headers.get("Authorization") ?? "";
  const userClient = createClient(SUPABASE_URL, ANON, {
    global: { headers: { Authorization: authHeader } },
  });

  // RLS scopes this to reviews the caller can see.
  const { data, error } = await userClient
    .from("audit_log")
    .select("event, actor_id, actor_kind, review_id, payload, prev_hash, entry_hash, signature, created_at")
    .eq("review_id", reviewId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  const result = await verifyChain(secret, data ?? []);
  return jsonResponse({ count: data?.length ?? 0, ...result });
}));
