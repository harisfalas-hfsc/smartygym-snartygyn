import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProgramData = (programId: string | undefined) => {
  return useQuery({
    queryKey: ["program", programId],
    queryFn: async () => {
      if (!programId) return null;
      
      const { data, error } = await supabase
        .from("admin_training_programs")
        .select("*")
        .eq("id", programId)
        .single();

      if (error) {
        console.error("Error fetching program:", error);
        return null;
      }

      return data;
    },
    enabled: !!programId,
  });
};

export const useAllPrograms = () => {
  return useQuery({
    queryKey: ["all-programs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_training_programs")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching programs:", error);
        return [];
      }

      return data || [];
    },
  });
};
