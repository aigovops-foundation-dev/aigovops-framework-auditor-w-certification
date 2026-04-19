// Shared HTTP helpers for AiGovOps edge functions.
// Standardizes CORS, JSON responses, and error handling so each function
// stays small and focused on its actual logic.

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

export function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { ...corsHeaders, "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
}

export function errorResponse(message: string, status = 500): Response {
  return jsonResponse({ error: message }, { status });
}

export function preflight(req: Request): Response | null {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  return null;
}

/** Wrap a handler with preflight + try/catch + JSON error coercion. */
export function withHttp(handler: (req: Request) => Promise<Response>) {
  return async (req: Request): Promise<Response> => {
    const pre = preflight(req);
    if (pre) return pre;
    try {
      return await handler(req);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "unknown error";
      console.error("[edge-fn]", msg);
      return errorResponse(msg, 500);
    }
  };
}

/** Required env var, throws a clear message if missing. */
export function requireEnv(name: string): string {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`${name} not configured`);
  return v;
}
