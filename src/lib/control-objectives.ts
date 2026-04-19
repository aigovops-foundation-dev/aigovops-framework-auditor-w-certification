/**
 * AOS v0.1 — the SIX Control Objectives.
 *
 * Per the AiGovOps Foundation alignment note (April 2026), AOS v0.1 = these six
 * objectives, full stop. The 18 individual controls in `aos_controls` / the spec
 * YAML are *expanded testing procedures* underneath these objectives.
 *
 * This module provides the canonical 6-objective rollup so the platform and
 * the position paper agree on what v0.1 contains externally without rewriting
 * the seed data.
 *
 * Architecture, three axes:
 *   - HORIZONTAL standard:    these six Control Objectives apply to every review.
 *   - ORTHOGONAL risk tier:   medium / high / critical drives rigor.
 *   - VERTICAL scenario pack: contextual stress tests loaded at review time.
 *
 * The standard is horizontal. Industry-specific behaviour lives in scenario
 * packs, NOT in separate standards. This is what makes insurance pricing
 * possible across an underwriter's whole portfolio (PCI-DSS / SLSA pattern).
 */

export interface ControlObjective {
  /** Stable id, embedded in attestations. */
  id: "CO-1" | "CO-2" | "CO-3" | "CO-4" | "CO-5" | "CO-6";
  number: number;
  title: string;
  /** One-paragraph plain-English description. */
  description: string;
  /** What an assessor or insurer should *see* to consider this objective met. */
  evidence: string;
  /** Domain ids in the existing aos_controls table that roll up here. */
  domains: ReadonlyArray<"pipeline" | "evidence" | "decisioning" | "safety" | "data" | "model" | "ops">;
  /** Live precedents in adjacent standards / regulation. */
  refs: ReadonlyArray<string>;
}

export const CONTROL_OBJECTIVES: ReadonlyArray<ControlObjective> = [
  {
    id: "CO-1",
    number: 1,
    title: "Policy-as-Code Governance",
    description:
      "Every AI deployment is governed by a versioned, signed policy bundle that lives in source control, with metadata, ownership, and no unsafe default-allow rules.",
    evidence: "Policy repo URL, commit SHA, signed tag, lint report, scanner output for default-allow.",
    domains: ["pipeline"],
    refs: ["NIST AI RMF GOVERN-1.4", "ISO 42001 6.2", "EU AI Act Art. 9 (risk-management system)"],
  },
  {
    id: "CO-2",
    number: 2,
    title: "Tamper-Evident Evidence Chain",
    description:
      "Every agent action and decision produces an evidence artifact, cryptographically chained (HMAC today, Ed25519 tomorrow) and verifiable by any third party without cooperation from the insured.",
    evidence:
      "Audit log entries with prev_hash + entry_hash, public verifier output, key custody statement, retention policy.",
    domains: ["evidence"],
    refs: [
      "SLSA v1.0 (build provenance attestations)",
      "Sigstore / Rekor (transparency log pattern)",
      "in-toto (attestation framework)",
      "NIST SSDF PO.5 / EO 14028",
      "ISO 27001 A.12.4",
    ],
  },
  {
    id: "CO-3",
    number: 3,
    title: "Human-in-the-Loop Decisioning",
    description:
      "Consequential AI decisions log model id + policy version, support a documented human override path exercised at least quarterly, and separate reviewer authority from developer authority.",
    evidence: "Decision logs, override UI + drill record, RBAC export showing role separation.",
    domains: ["decisioning"],
    refs: ["EU AI Act Art. 14 (human oversight)", "NIST AI RMF MANAGE-1.3", "SOC 2 CC6.3", "ISO 27001 A.5.3"],
  },
  {
    id: "CO-4",
    number: 4,
    title: "Adversarial & Scenario Safety",
    description:
      "Red-team and adversarial tests run in CI and block release on regression. High-risk scenarios (healthcare, IP, HR, generative content) load scenario packs that extend coverage without forking the standard.",
    evidence: "Red-team CI logs, scenario-pack manifest, enforcement test, regression policy.",
    domains: ["safety"],
    refs: ["NIST AI RMF MEASURE-2.6", "EU AI Act Annex III (high-risk use cases)", "OWASP LLM Top 10"],
  },
  {
    id: "CO-5",
    number: 5,
    title: "Data Lineage & Minimization",
    description:
      "Training and inference data lineage is recorded and queryable; personally identifiable and regulated data is classified, minimized at collection, and retained only as long as necessary.",
    evidence: "Lineage graph, dataset checksums, classification report, minimization config, retention proof.",
    domains: ["data"],
    refs: ["EU AI Act Art. 10", "ISO 42001 8.3", "GDPR Art. 5(1)(c)", "HIPAA §164.502(b)"],
  },
  {
    id: "CO-6",
    number: 6,
    title: "Model & Supply-Chain Provenance",
    description:
      "Each released model has a machine-readable model card, generated content carries C2PA provenance where IP claims attach, and open-source AI dependencies ship with SBOM + SLSA attestations + a documented incident-response procedure.",
    evidence: "Model card JSON, C2PA manifests, CycloneDX SBOM, SLSA L2+ attestations, IR runbook & drill report.",
    domains: ["model", "ops"],
    refs: [
      "NIST AI RMF MAP-3 / MANAGE-4",
      "ISO 42001 8.4 / 10.1",
      "EU AI Act Art. 50 (transparency obligations)",
      "C2PA 1.x",
      "NIST SSDF PO.5",
      "EO 14028",
      "DMCA",
    ],
  },
] as const;

/**
 * Risk tiers — the ORTHOGONAL axis. This is what insurers price against.
 *
 * Aligned with EU AI Act risk classification + NAIC AI Bulletin practice.
 * "critical" maps to EU AI Act "high-risk" (Annex III) systems; "high" maps
 * to systems with material consumer or financial impact; "medium" is the
 * baseline for any AI system in production with non-trivial blast radius.
 */
export type RiskTier = "medium" | "high" | "critical";

export const RISK_TIERS: ReadonlyArray<{
  id: RiskTier;
  label: string;
  description: string;
  euAiActMapping: string;
  insuranceImplication: string;
}> = [
  {
    id: "medium",
    label: "Medium",
    description:
      "AI system in production with limited-blast-radius decisions. Reversible, not safety-critical, not consumer-facing in a regulated category.",
    euAiActMapping: "Limited-risk systems (transparency obligations only).",
    insuranceImplication: "Eligible for standard governance discount on a passing AOC.",
  },
  {
    id: "high",
    label: "High",
    description:
      "Material consumer, financial, or operational impact. HR/credit/insurance decisioning, content moderation at scale, code generation in regulated environments.",
    euAiActMapping: "Subset of EU AI Act Annex III where harm is reversible but material.",
    insuranceImplication:
      "Requires documented human-override drill within 6 months for premium-discount eligibility.",
  },
  {
    id: "critical",
    label: "Critical",
    description:
      "Healthcare, life-safety, infrastructure, autonomous decisioning with non-reversible harm potential. Board-level oversight required regardless of vertical.",
    euAiActMapping: "EU AI Act Annex III high-risk systems; FDA SaMD class II/III equivalents.",
    insuranceImplication:
      "Requires QAGAC-firm review (no self-attestation) and 12-month re-attestation cycle for any rider.",
  },
] as const;
