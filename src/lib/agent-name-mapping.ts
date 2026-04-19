// Maps the persisted `agent_findings.agent_name` (functional role label produced
// by run-agent-pipeline) to the historical persona slug used by the UI cameo
// system. Keep this in sync with run-agent-pipeline/index.ts.

export const agentNameToSlug = (agentName: string): string => {
  const n = agentName.trim().toLowerCase();
  if (n.includes("policy") || n.includes("linter") || n.includes("code")) return "lovelace";
  if (n.includes("compliance") || n.includes("audit") || n.includes("control")) return "pacioli";
  if (n.includes("risk") || n.includes("ethic")) return "arendt";
  if (n.includes("scenario")) return "nightingale";
  if (n.includes("crypt") || n.includes("integrity") || n.includes("hash")) return "turing";
  if (n.includes("security") || n.includes("threat")) return "kerckhoffs";
  if (n.includes("system") || n.includes("reliab") || n.includes("pipeline")) return "hopper";
  if (n.includes("sre") || n.includes("operations") || n.includes("runbook")) return "hamilton";
  // Fallback to chief if nothing matches
  return "ken-newton";
};
