/**
 * Centralized project configuration. Single source of truth for external links,
 * branding strings, and contact info. Import from here instead of hardcoding.
 */

export const FOUNDATION = {
  name: "AIGovOps Foundation",
  shortName: "AiGovOps",
  url: "https://www.aigovopsfoundation.org/",
  donateUrl: "https://www.aigovopsfoundation.org/donate",
  githubSponsorsUrl: "https://github.com/sponsors/aigovopsfoundation",
  githubOrgUrl: "https://github.com/aigovopsfoundation",
  contactEmail: "hello@aigovopsfoundation.org",
  securityEmail: "security@aigovopsfoundation.org",
  donationsEmail: "donations@aigovopsfoundation.org",
} as const;

export const PROJECT = {
  name: "AiGovOps Review Framework",
  tagline: "Policy-as-code, reviewed by agents, attested by humans, sealed by a chain.",
  publishedUrl: "https://aigovops-framework-auditor-w-certification.lovable.app",
  repoUrl: "https://github.com/aigovopsfoundation/aigovops-review-framework",
} as const;

/** Edge function base URL — derived from Supabase project id. */
export const EDGE_BASE = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1`;
