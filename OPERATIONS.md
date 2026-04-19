# AiGovOps Operations Runbook

> The web version lives at [`/docs/operations`](https://aigovops-framework-auditor-w-certification.lovable.app/docs/operations).
> This file is the source of truth — update it and the in-app page renders the
> same sections (they share content, not the same parser, so keep them in sync).

## 1. Claim the first admin
1. Sign up at `/auth`.
2. Go to `/admin` → **Claim first admin**. The DB function refuses if any admin already exists.
3. Grant additional admins from `/admin`. A one-admin minimum is enforced by `revoke_role`.

## 2. Rotate `AUDIT_SIGNING_KEY`
The HMAC secret that chains `audit_log`. Rotate **annually** or after suspected exposure.
```bash
openssl rand -hex 32
```
Update in Lovable Cloud → Edge Functions → Secrets. Document the rotation date in
`CHANGELOG.md` so the `/verify` page can flag pre/post-rotation entries.

## 3. Seed / unseed demo data (admin only)
```bash
curl -X POST $EDGE/functions/v1/seed-demo -H "Authorization: Bearer $JWT"
curl -X POST $EDGE/functions/v1/unseed-demo -H "Authorization: Bearer $JWT"
```
Idempotent. Demo accounts use `*.aigovops.demo` — do **not** email-verify them.

## 4. Verify a chain
Public, no auth:
```bash
curl -s $EDGE/functions/v1/verify-chain -d '{"reviewId":"<uuid>"}'
```
or visit `/verify/<reviewId>`. Per-entry result shape:
```
{ ok: boolean, results: [{ ok, reason? }] }
```
On `ok: false`, freeze the review (`status='failed'`), open a security issue, do not
re-issue the AOC until investigated.

## 5. Respond to canary drift
The weekly **Canary Verify** workflow opens a `[canary]` security issue on drift.
- Intentional change → `node scripts/verify-canary.mjs --update`, commit.
- Unintentional → revert and investigate as a supply-chain compromise.

Visitors can re-verify against the live deployment at `/docs/canary`.

## 6. Health smoke-test
```bash
node scripts/health.mjs
node scripts/health.mjs https://your-deployment.lovable.app
```
Used by CI; checks landing, docs, donate, and the canary manifest.

## 7. Security incident
1. Pause all attestations: revoke `reviewer` from non-admins via `/admin`.
2. Snapshot `audit_log` + `attestations` to cold storage.
3. Rotate `AUDIT_SIGNING_KEY` and any service-role-derived secrets.
4. Email `security@aigovopsfoundation.org` with timeline.

See `SECURITY.md` for the full disclosure playbook.
