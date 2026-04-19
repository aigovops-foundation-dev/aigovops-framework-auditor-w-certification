import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** Reviews list — RLS-scoped to the caller. */
export function useReviews() {
  return useQuery({
    queryKey: ["reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 30_000,
  });
}

/** Single review by id with findings + artifacts. */
export function useReview(id: string | undefined) {
  return useQuery({
    queryKey: ["review", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*, agent_findings(*), review_artifacts(*)")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}
