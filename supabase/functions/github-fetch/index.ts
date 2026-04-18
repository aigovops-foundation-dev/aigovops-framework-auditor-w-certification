// Fetch policy-as-code files from a public GitHub repo URL.
// Supports: https://github.com/owner/repo OR https://github.com/owner/repo/tree/branch/path
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const POLICY_EXTS = [".rego", ".yaml", ".yml", ".json", ".cedar", ".md"];
const MAX_FILES = 25;
const MAX_BYTES = 200_000;

interface GhEntry { path: string; type: string; sha: string; }

function parseRepo(url: string) {
  const m = url.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/tree\/([^/]+)(?:\/(.*))?)?\/?$/);
  if (!m) return null;
  return { owner: m[1], repo: m[2], branch: m[3] ?? "main", subpath: m[4] ?? "" };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { url } = await req.json();
    const parsed = parseRepo(url ?? "");
    if (!parsed) {
      return new Response(JSON.stringify({ error: "Invalid GitHub URL" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { owner, repo, branch, subpath } = parsed;

    // Try requested branch then main/master
    const branches = Array.from(new Set([branch, "main", "master"]));
    let tree: GhEntry[] | null = null;
    let usedBranch = branch;
    for (const b of branches) {
      const r = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${b}?recursive=1`, {
        headers: { "User-Agent": "aigovops" },
      });
      if (r.ok) {
        const j = await r.json();
        tree = j.tree as GhEntry[];
        usedBranch = b;
        break;
      }
    }
    if (!tree) {
      return new Response(JSON.stringify({ error: "Could not read repo tree" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const candidates = tree.filter((e) =>
      e.type === "blob" &&
      (!subpath || e.path.startsWith(subpath)) &&
      POLICY_EXTS.some((ext) => e.path.toLowerCase().endsWith(ext))
    ).slice(0, MAX_FILES);

    const files: Array<{ path: string; language: string; content: string }> = [];
    for (const c of candidates) {
      const raw = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${usedBranch}/${c.path}`);
      if (!raw.ok) continue;
      const text = (await raw.text()).slice(0, MAX_BYTES);
      const ext = c.path.split(".").pop()?.toLowerCase() ?? "";
      const language = { rego: "rego", yaml: "yaml", yml: "yaml", json: "json", cedar: "cedar", md: "markdown" }[ext] ?? "text";
      files.push({ path: c.path, language, content: text });
    }

    return new Response(JSON.stringify({ owner, repo, branch: usedBranch, files }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
