import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PublicFirm {
  id: string;
  name: string;
  status: string;
  jurisdiction: string | null;
  website: string | null;
  active_assessor_count: number;
  charter_at: string | null;
}

export interface PublicAssessor {
  id: string;
  display_name: string;
  jurisdiction: string | null;
  firm_id: string | null;
  badges: string[];
  qaga_credential_id: string | null;
  qaga_issued_at: string | null;
}

/** Public registry data — no auth required, served via the public view. */
export function useRegistry() {
  return useQuery({
    queryKey: ["registry"],
    queryFn: async () => {
      const [firmsRes, assessorsRes] = await Promise.all([
        supabase
          .from("qagac_firms_public")
          .select("id, name, status, jurisdiction, website, active_assessor_count, charter_at")
          .order("name"),
        supabase
          .from("qaga_assessors")
          .select("id, display_name, jurisdiction, firm_id, badges, qaga_credential_id, qaga_issued_at")
          .order("display_name"),
      ]);
      if (firmsRes.error) throw firmsRes.error;
      if (assessorsRes.error) throw assessorsRes.error;
      return {
        firms: (firmsRes.data ?? []) as PublicFirm[],
        assessors: (assessorsRes.data ?? []) as PublicAssessor[],
      };
    },
    staleTime: 60_000,
  });
}
