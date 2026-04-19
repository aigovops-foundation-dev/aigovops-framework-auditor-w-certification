#!/usr/bin/env node
/**
 * health.mjs — Smoke-test a deployed AiGovOps instance.
 *
 * Usage:
 *   node scripts/health.mjs                     # default: published URL
 *   node scripts/health.mjs https://custom.url
 *
 * Checks:
 *   1. Landing page returns 200 and contains expected branding.
 *   2. /docs returns 200.
 *   3. /donate returns 200.
 *   4. /canary-manifest.json is reachable and is valid JSON with a `files` map.
 *
 * Exits non-zero on any failure. Designed for CI smoke jobs.
 */

const DEFAULT_URL = "https://aigovops-framework-auditor-w-certification.lovable.app";
const base = (process.argv[2] ?? DEFAULT_URL).replace(/\/$/, "");

const checks = [
  {
    name: "landing",
    path: "/",
    assert: (status, body) =>
      status === 200 && body.includes("AiGovOps") ? null : "missing AiGovOps branding",
  },
  {
    name: "docs",
    path: "/docs",
    assert: (status) => (status === 200 ? null : `status ${status}`),
  },
  {
    name: "donate",
    path: "/donate",
    assert: (status) => (status === 200 ? null : `status ${status}`),
  },
  {
    name: "canary-manifest",
    path: "/canary-manifest.json",
    assert: (status, body) => {
      if (status !== 200) return `status ${status}`;
      try {
        const j = JSON.parse(body);
        if (!j.files || typeof j.files !== "object") return "missing files map";
        return null;
      } catch {
        return "invalid JSON";
      }
    },
  },
];

let failed = 0;
for (const c of checks) {
  const url = base + c.path;
  try {
    const res = await fetch(url, { headers: { "user-agent": "aigovops-health/1" } });
    const body = await res.text();
    const err = c.assert(res.status, body);
    if (err) {
      console.error(`✗ ${c.name.padEnd(20)} ${url} — ${err}`);
      failed++;
    } else {
      console.log(`✓ ${c.name.padEnd(20)} ${url}`);
    }
  } catch (e) {
    console.error(`✗ ${c.name.padEnd(20)} ${url} — ${e.message}`);
    failed++;
  }
}

if (failed > 0) {
  console.error(`\n${failed}/${checks.length} checks failed`);
  process.exit(1);
}
console.log(`\n${checks.length}/${checks.length} checks passed`);
