import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PersonaRow {
  id: string;
  slug: string;
  display_name: string;
  role_title: string;
  role_kind: string;
  short_bio: string;
  skills: string[];
  guardrails: string[];
  portrait_path: string | null;
  historical_era: string | null;
  rank: number;
  is_chief: boolean;
  active: boolean;
}

export interface DecisionRow {
  id: string;
  persona_id: string;
  review_id: string | null;
  action: string;
  decision: string;
  rationale: string;
  evidence: Record<string, unknown>;
  severity: "info" | "low" | "medium" | "high" | "critical";
  needs_human: boolean;
  created_at: string;
}

export interface HitlRow {
  id: string;
  decision_id: string | null;
  persona_id: string;
  review_id: string | null;
  title: string;
  summary: string;
  severity: "info" | "low" | "medium" | "high" | "critical";
  status: "pending" | "approved" | "rejected" | "withdrawn";
  resolved_by: string | null;
  resolved_at: string | null;
  resolution_note: string | null;
  created_at: string;
}

export const usePersonas = () =>
  useQuery({
    queryKey: ["agent_personas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agent_personas")
        .select("*")
        .eq("active", true)
        .order("rank", { ascending: true });
      if (error) throw error;
      return (data ?? []) as PersonaRow[];
    },
  });

export const useDecisions = (limit = 50) =>
  useQuery({
    queryKey: ["agent_decisions", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agent_decisions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as DecisionRow[];
    },
  });

export const useHitlQueue = () =>
  useQuery({
    queryKey: ["hitl_reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hitl_reviews")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as HitlRow[];
    },
  });

export const useResolveHitl = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      id: string;
      status: "approved" | "rejected" | "withdrawn";
      note: string;
    }) => {
      const { error } = await supabase.rpc("resolve_hitl", {
        _hitl_id: args.id,
        _status: args.status,
        _note: args.note,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hitl_reviews"] });
    },
  });
};
