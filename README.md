# AiGovOps Review Framework

> **Agents review. Humans decide. Math proves.**
> Policy-as-code, reviewed by agents, attested by humans, sealed by a chain.

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-3b82f6.svg)](./LICENSE)
[![AOS](https://img.shields.io/badge/AOS-v0.1-7c3aed)](./public/specs/aos-v1.0.yaml)
[![Stewarded by](https://img.shields.io/badge/Stewarded%20by-AiGovOps%20Foundation-0f172a)](https://www.aigovopsfoundation.org/)
[![Code of Conduct](https://img.shields.io/badge/CoC-Contributor%20Covenant%202.1-fb7185)](./CODE_OF_CONDUCT.md)
[![Canary verified](https://img.shields.io/badge/Canary-SHA--256%20pinned-10b981)](./public/canary-manifest.json)
[![Live demo](https://img.shields.io/badge/Live-Demo-10b981)](https://aigovops-framework-auditor-w-certification.lovable.app)

The **AiGovOps Review Framework** is the reference implementation of the
[AiGovOps Operational Standard (AOS)](./public/specs/aos-v1.0.yaml) — an
OpenSSF-style, vendor-neutral standard for AI governance. It runs your
policy bundle through a council of specialist agents, lets a chartered
human reviewer co-sign an Attestation of Conformance (AOC), and writes
every step into an HMAC-SHA-256 audit chain that **anyone** can verify
without your cooperation.

Stewarded by the **[AiGovOps Foundation](https://www.aigovopsfoundation.org/)**,
co-founded by **Bob Rapp** (Co-founder & Technical Steward,
`bob.rapp@aigovops.community`) and **Ken Johnston** (Co-founder & Governance
Steward, `ken.johnston@aigovops.community`).

> 🔗 **Live demo:** https://aigovops-framework-auditor-w-certification.lovable.app
> 🚀 **OSS launch checklist:** [`/docs/oss-launch`](https://aigovops-framework-auditor-w-certification.lovable.app/docs/oss-launch)
> 🔒 **Security model:** [`/security`](https://aigovops-framework-auditor-w-certification.lovable.app/security)

---

## 60-second quick start

```bash
git clone https://github.com/aigovopsfoundation/aigovops-review-framework.git
cd aigovops-review-framework
npm install
npm run dev
```

Open `http://localhost:5173`. The web app is fully usable in **anonymous
demo mode** — no signup, no DB. To exercise the full attestation flow
(audit chain, signed AOCs, QAGA registry), provision a Supabase project
using the migrations in `supabase/migrations/` and set the env vars in
`.env.example`.

```bash
npm run build       # Production build
npm run test        # Vitest suite
node scripts/health.mjs    # Smoke-test the live deployment
```

---

## What's in the box

| Component | Path | What it does |
|---|---|---|
| **Web app** | `src/` | React 18 + Vite + Tailwind + shadcn/ui. Public landing, `/docs`, `/registry`, `/verify`, `/about`, `/security`, plus the agent-driven review console. |
| **Edge functions** | `supabase/functions/` | Audit chain (HMAC + `prev_hash`), attestation issuance, agent pipeline, public chain verifier — all RLS-aware. |
| **Database schema** | `supabase/migrations/` | Postgres + row-level security. Profiles, reviews, AOS controls, QAGA assessors, attestations, audit log. |
| **AOS spec** | `public/specs/aos-v1.0.yaml` | Machine-readable standard. 18 controls, 7 domains, mapped to EU AI Act, NIST AI RMF, ISO 42001, SOC 2, HIPAA, GDPR. CC-BY-4.0. |
| **Verifier CLI** | `packages/verify/` | `@aigovops/verify` — Node CLI any third party can run offline to re-prove an attestation chain without our cooperation. |
| **Canary manifest** | `public/canary-manifest.json` | SHA-256 hashes of every governance-critical file. Verified weekly by GitHub Actions; drift opens a security issue. |
| **Operations runbook** | [`OPERATIONS.md`](./OPERATIONS.md) | Rotate the audit signing key, seed/unseed demo data, claim first admin, respond to canary drift, incident response. |

---

## Why this exists

AI governance is moving from *policies in PDFs* to *policies as code*.
There is no neutral place to anchor the audit trail. Vendors are racing to
own that anchor. The AiGovOps Foundation's bet is that — like SLSA,
Sigstore, and in-toto before it — the standard and the reference
implementation should be **vendor-neutral, practitioner-owned, and
verifiable by anyone**.

The QAGA program (Qualified AiGovOps Assessor) provides the human layer:
chartered, independence-bound reviewers who co-sign attestations. The AOS
spec provides the machine-readable contract. This framework is the open
plumbing that ties them together.

> Read the full pitch: [`/docs/oss-launch`](https://aigovops-framework-auditor-w-certification.lovable.app/docs/oss-launch)
> · [PRD](./public/docs/AiGovOps_PRD.md)
> · [PRD-FAQ](./public/docs/AiGovOps_PRD_FAQ.md)

---

## Stack

- **Frontend:** React 18 · Vite · Tailwind · shadcn/ui · TypeScript 5
- **Backend:** Lovable Cloud (Supabase) — Postgres + RLS + Storage + Edge Functions
- **AI:** Lovable AI Gateway (Gemini / GPT-5 family)
- **Audit chain:** HMAC-SHA-256 with `prev_hash` linkage in `audit_log`
- **Verifier:** Node 20+ TypeScript CLI, no runtime dependencies on the live app

---

## Verify a deployment without trusting us

Anyone can re-prove a chain offline:

```bash
npx @aigovops/verify chain --review <reviewId> \
  --base https://aigovops-framework-auditor-w-certification.lovable.app
```

Or in-browser at [`/verify/<reviewId>`](https://aigovops-framework-auditor-w-certification.lovable.app/verify).
The verifier reads the public attestation feed, re-computes the hash chain,
and refuses if any link is broken.

---

## Documentation

All artifacts are published in-app at [`/docs`](https://aigovops-framework-auditor-w-certification.lovable.app/docs):

| Document | In-repo path |
|---|---|
| Product Requirements Document | [`public/docs/AiGovOps_PRD.md`](./public/docs/AiGovOps_PRD.md) |
| PRD-FAQ (working backwards) | [`public/docs/AiGovOps_PRD_FAQ.md`](./public/docs/AiGovOps_PRD_FAQ.md) |
| AOS v0.1 Spec (YAML) | [`public/specs/aos-v1.0.yaml`](./public/specs/aos-v1.0.yaml) |
| Operations Runbook | [`OPERATIONS.md`](./OPERATIONS.md) |
| Security model | [`SECURITY.md`](./SECURITY.md) |
| Governance | [`GOVERNANCE.md`](./GOVERNANCE.md) |

---

## Contributing

We welcome contributions. Read [`CONTRIBUTING.md`](./CONTRIBUTING.md) (DCO
sign-off required) and [`GOVERNANCE.md`](./GOVERNANCE.md) (AOS RFC process).
Issue templates: bug · feature · **AOS control proposal** · security.

```bash
git commit -s -m "feat(aos): add control PIPE-04"
```

By signing off you certify the patch under [DCO 1.1](https://developercertificate.org/).

### First-time contributors

- Look for issues labeled [`good first issue`](https://github.com/aigovopsfoundation/aigovops-review-framework/labels/good%20first%20issue).
- Join the discussion on the [AiGovOps Foundation site](https://www.aigovopsfoundation.org/).
- All contributors are credited in [`CHANGELOG.md`](./CHANGELOG.md) per release.

---

## Security

Report vulnerabilities privately to **`security@aigovopsfoundation.org`**.
We acknowledge in 72 hours and aim to triage in 7 days. CC both co-founders
for high-severity reports. Full policy in [`SECURITY.md`](./SECURITY.md).

The public security model — RLS posture, audit-chain signing, Realtime
topic auth — lives at [`/security`](https://aigovops-framework-auditor-w-certification.lovable.app/security).

---

## Donate

The Foundation is a vendor-neutral nonprofit. Donations fund the AOS
standard, QAGA scholarships, audit-chain infra, and the public verifier.

[![Donate $25](https://img.shields.io/badge/Donate-%2425-10b981)](https://buy.stripe.com/eVq7sMb015ss9Obd6V4Vy00)
[![Donate $50](https://img.shields.io/badge/Donate-%2450-10b981)](https://buy.stripe.com/28E00kfgh1ccbWjgj74Vy01)
[![Donate Custom](https://img.shields.io/badge/Donate-Custom-3b82f6)](https://buy.stripe.com/cNi9AU8RT0884tR6Ix4Vy02)

---

## Sister projects

- [**openclaw-installer**](https://github.com/bobrapp/openclaw-installer) — guided installer for governance tooling on macOS / cloud.

---

## License

- **Code:** [Apache-2.0](./LICENSE)
- **AOS spec:** CC-BY-4.0 (credit "AiGovOps Foundation")
- **Trademarks:** "AiGovOps", "AOS", "QAGA", "QAGAC" — see [`GOVERNANCE.md`](./GOVERNANCE.md)

---

<sub>© 2026 AiGovOps Foundation · Co-founded by Bob Rapp & Ken Johnston · Open source so AI governance can be too.</sub>
