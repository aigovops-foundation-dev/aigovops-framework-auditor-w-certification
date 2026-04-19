// Deno tests for sign-decision: verify role-gating for admin.claimed and other privileged events.
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const ANON = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const FN_URL = `${SUPABASE_URL}/functions/v1/sign-decision`;

async function callFn(body: unknown, authHeader?: string) {
  const res = await fetch(FN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": ANON,
      ...(authHeader ? { Authorization: authHeader } : {}),
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json: any = null;
  try { json = JSON.parse(text); } catch { /* ignore */ }
  return { status: res.status, body: json ?? text };
}

async function makeUserSession(role: "submitter" | "admin"): Promise<{ token: string; userId: string; cleanup: () => Promise<void> }> {
  const admin = createClient(SUPABASE_URL, SERVICE);
  const email = `test_${role}_${crypto.randomUUID()}@example.com`;
  const password = `Pw_${crypto.randomUUID()}!`;
  const { data: created, error: cErr } = await admin.auth.admin.createUser({
    email, password, email_confirm: true,
  });
  if (cErr || !created.user) throw new Error(`createUser failed: ${cErr?.message}`);
  const userId = created.user.id;

  if (role === "admin") {
    // Promote to admin (bypass RLS via service role).
    const { error: rErr } = await admin
      .from("user_roles")
      .insert({ user_id: userId, role: "admin" });
    if (rErr) throw new Error(`role insert failed: ${rErr.message}`);
  }

  const anon = createClient(SUPABASE_URL, ANON);
  const { data: signed, error: sErr } = await anon.auth.signInWithPassword({ email, password });
  if (sErr || !signed.session) throw new Error(`signIn failed: ${sErr?.message}`);

  return {
    token: `Bearer ${signed.session.access_token}`,
    userId,
    cleanup: async () => {
      await admin.from("audit_log").delete().eq("actor_id", userId);
      await admin.from("user_roles").delete().eq("user_id", userId);
      await admin.auth.admin.deleteUser(userId);
    },
  };
}

Deno.test("sign-decision rejects unauthenticated requests", async () => {
  const r = await callFn({ event: "admin.claimed", payload: {} });
  assertEquals(r.status, 401);
});

Deno.test("sign-decision rejects invalid event", async () => {
  const u = await makeUserSession("submitter");
  try {
    const r = await callFn({ event: "not.a.real.event", payload: {} }, u.token);
    assertEquals(r.status, 400);
  } finally {
    await u.cleanup();
  }
});

Deno.test("sign-decision: non-admin posting admin.claimed -> 403, no audit row", async () => {
  const u = await makeUserSession("submitter");
  const admin = createClient(SUPABASE_URL, SERVICE);
  try {
    const r = await callFn({ event: "admin.claimed", payload: { test: true } }, u.token);
    assertEquals(r.status, 403);

    // Verify no audit_log row was written for this actor.
    const { data, error } = await admin
      .from("audit_log")
      .select("id, event")
      .eq("actor_id", u.userId);
    if (error) throw error;
    assertEquals(data?.length ?? 0, 0);
  } finally {
    await u.cleanup();
  }
});

Deno.test("sign-decision: non-admin posting admin.role_assigned -> 403", async () => {
  const u = await makeUserSession("submitter");
  try {
    const r = await callFn({ event: "admin.role_assigned", payload: {} }, u.token);
    assertEquals(r.status, 403);
  } finally {
    await u.cleanup();
  }
});

Deno.test("sign-decision: admin posting admin.claimed -> 200 and audit row written", async () => {
  const u = await makeUserSession("admin");
  const admin = createClient(SUPABASE_URL, SERVICE);
  try {
    const r = await callFn({ event: "admin.claimed", payload: { test: true } }, u.token);
    assertEquals(r.status, 200);

    const { data, error } = await admin
      .from("audit_log")
      .select("id, event")
      .eq("actor_id", u.userId)
      .eq("event", "admin.claimed");
    if (error) throw error;
    assertEquals(data?.length ?? 0, 1);
  } finally {
    await u.cleanup();
  }
});
