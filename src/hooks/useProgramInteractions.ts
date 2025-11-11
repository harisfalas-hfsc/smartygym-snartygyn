import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProgramInteractions = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["program-interactions", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("program_interactions")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching program interactions:", error);
        return [];
      }

      return data || [];
    },
    enabled: !!userId,
  });
};
