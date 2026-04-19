// Quick env probe.
import "https://deno.land/std@0.224.0/dotenv/load.ts";

Deno.test("probe env", () => {
  console.log("VITE_SUPABASE_URL:", Deno.env.get("VITE_SUPABASE_URL") ? "set" : "missing");
  console.log("SUPABASE_URL:", Deno.env.get("SUPABASE_URL") ? "set" : "missing");
  console.log("SUPABASE_SERVICE_ROLE_KEY:", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ? "set" : "missing");
  console.log("SUPABASE_ANON_KEY:", Deno.env.get("SUPABASE_ANON_KEY") ? "set" : "missing");
  console.log("VITE_SUPABASE_PUBLISHABLE_KEY:", Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY") ? "set" : "missing");
});
