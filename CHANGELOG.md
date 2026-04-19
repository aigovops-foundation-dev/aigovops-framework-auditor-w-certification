# Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

_Nothing yet — the next entry lands here._

## [0.1.0] - 2026-04-19 — Open-source launch 🚀

First public release of the AiGovOps Review Framework — the reference
implementation of the [AiGovOps Operational Standard (AOS)](./public/specs/aos-v1.0.yaml).
Stewarded by the [AiGovOps Foundation](https://www.aigovopsfoundation.org/),
co-founded by Bob Rapp (Co-founder & Technical Steward,
`bob.rapp@aigovops.community`) and Ken Johnston (Co-founder & Governance
Steward, `ken.johnston@aigovops.community`).

### Added — Governance & community

- **Apache-2.0 LICENSE** (full text), **NOTICE** with Foundation attribution
  and co-founder credits.
- **SECURITY.md** — responsible disclosure policy, `security@aigovopsfoundation.org`,
  72-hour acknowledgement, 7-day triage, co-founder escalation.
- **GOVERNANCE.md** — Foundation board, maintainer roles, AOS RFC process,
  trademark policy.
- **CONTRIBUTING.md** with Developer Certificate of Origin (DCO 1.1)
  sign-off requirement.
- **CODE_OF_CONDUCT.md** — Contributor Covenant 2.1, enforcement chain.
- **CHANGELOG.md** in Keep-a-Changelog format with `[Unreleased]` block.
- **OPERATIONS.md** runbook — rotate signing keys, seed/unseed demo,
  verify chains, claim first admin, respond to canary drift, incident response.
- `.github/` templates: bug, feature, **AOS control proposal**, security,
  PR template, `CODEOWNERS`, `FUNDING.yml`, `dependabot.yml`.
- New public pages: `/about` (foundation + co-founder JSON-LD),
  `/security` (RLS posture, audit-chain, disclosure), `/docs/oss-launch`
  (governance index, 11/11 artifacts shipped).

### Added — Standard & verifier

- **AOS v0.1 spec** at `public/specs/aos-v1.0.yaml` —
  18 controls across 7 domains, mapped to EU AI Act, NIST AI RMF, ISO 42001,
  SOC 2, HIPAA, GDPR. SHA-256: `a7215a488e1da2990c3be97605e207606407724aaf403b9022dd5caabf4cb4de`.
- **`@aigovops/verify` CLI** — Node TypeScript package any third party can
  run offline to re-prove an attestation chain (canonical JSON, HMAC chain,
  PDF integrity, public attestation feed).
- **Canary manifest** at `public/canary-manifest.json` —
  SHA-256-pinned hashes for every governance-critical file, verified
  weekly by GitHub Actions.

### Added — Donations

- Stripe-hosted checkout flow on `/donate` with three tiers ($25, $50,
  pick-your-amount) — direct to the Foundation, no fee passthrough to
  donors. Donation row added to the public footer (`PublicShell`) and
  inline CTA on the Landing hero.

### Changed

- README rewritten for first-time visitors: 60-second quick start,
  what's-in-the-box table, badges, links to live demo and OSS launch
  checklist.
- All `githubSponsorsUrl` references removed in favor of direct Stripe
  donations to the Foundation.

### Security

- **Profile privacy** — `profiles.SELECT` policy restricted to
  `auth.uid() = id OR has_role(auth.uid(), 'admin')`.
- **Realtime topic auth** — RLS enabled on `realtime.messages`. Subscriptions
  scoped to `agent_threads:<id>` and `reviews:<id>` topics, validated against
  the corresponding `owner_id` / `submitter_id`.
- **Audit-log integrity** — `audit_log.INSERT` policy now requires non-null
  `review_id` and validates actor ownership/permissions on the referenced
  review.
- `qaga_assessors` self-update RLS policy tightened to forbid changes to
  credentialing fields.
- Authenticated registry reads moved to the `qagac_firms_public` view to
  hide contact and indemnity columns.
- Edge function ownership/role checks added to `run-agent-pipeline` and
  `sign-decision`.
- Public storage policies on `attestations` audited and locked down.

### Verify this release

```bash
# Verify the AOS spec hash
sha256sum public/specs/aos-v1.0.yaml
# expected: a7215a488e1da2990c3be97605e207606407724aaf403b9022dd5caabf4cb4de

# Verify a live attestation chain
npx @aigovops/verify chain --review <reviewId> \
  --base https://aigovops-framework-auditor-w-certification.lovable.app
```

### Contributors

- **Bob Rapp** — Co-founder & Technical Steward — architecture, audit chain, agent pipeline
- **Ken Johnston** — Co-founder & Governance Steward — AOS spec, QAGA program, governance docs
- The AiGovOps Foundation community

[Unreleased]: https://github.com/aigovopsfoundation/aigovops-review-framework/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/aigovopsfoundation/aigovops-review-framework/releases/tag/v0.1.0
