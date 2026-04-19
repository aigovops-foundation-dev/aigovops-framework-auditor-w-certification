/**
 * Centralized project configuration. Single source of truth for external links,
 * branding strings, and contact info. Import from here instead of hardcoding.
 */

export const FOUNDATION = {
  name: "AiGovOps Foundation",
  shortName: "AiGovOps",
  url: "https://www.aigovopsfoundation.org/",
  donateUrl: "https://www.aigovopsfoundation.org/donate",
  /** Stripe-hosted checkout links for direct donations to the Foundation. */
  stripeDonate: {
    pickYourAmount: "https://buy.stripe.com/cNi9AU8RT0884tR6Ix4Vy02",
    fifty: "https://buy.stripe.com/28E00kfgh1ccbWjgj74Vy01",
    twentyFive: "https://buy.stripe.com/eVq7sMb015ss9Obd6V4Vy00",
  },
  githubOrgUrl: "https://github.com/aigovopsfoundation",
  contactEmail: "hello@aigovopsfoundation.org",
  securityEmail: "security@aigovopsfoundation.org",
  donationsEmail: "donations@aigovopsfoundation.org",
  /** Public co-founders. Source of truth for credits across docs and UI. */
  cofounders: [
    {
      name: "Bob Rapp",
      role: "Co-founder & Technical Steward",
      email: "bob.rapp@aigovops.community",
    },
    {
      name: "Ken Johnston",
      role: "Co-founder & Governance Steward",
      email: "ken.johnston@aigovops.community",
    },
  ],
} as const;

export const PROJECT = {
  name: "AiGovOps Review Framework",
  /** Always frame the platform as a reference implementation of AOS, not as the standard itself. */
  positioning: "Reference implementation of the AiGovOps Open Standard (AOS).",
  tagline: "Agents review. Humans decide. Math proves.",
  subTagline: "Policy-as-code, reviewed by agents, attested by humans, sealed by a chain.",
  publishedUrl: "https://aigovops-framework-auditor-w-certification.lovable.app",
  repoUrl: "https://github.com/aigovopsfoundation/aigovops-review-framework",
  verifierPackage: "@aigovops/verify",
} as const;

/** The standard itself — versioned separately from this implementation. */
export const STANDARD = {
  shortName: "AOS",
  longName: "AiGovOps Open Standard",
  version: "v0.1",
  status: "draft",
  /** Live precedent we lead with externally. PCI-DSS is the older precedent. */
  livePrecedent: "SLSA + Sigstore + in-toto (OpenSSF)",
  legacyPrecedent: "PCI-DSS (the older practitioner-owned standard model)",
  intendedHome: "OpenSSF (Linux Foundation), as a sibling to SLSA / Sigstore / in-toto",
} as const;

/** Edge function base URL — derived from Supabase project id. */
export const EDGE_BASE = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1`;
