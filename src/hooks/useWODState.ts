import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useWODState = () => {
  return useQuery({
    queryKey: ["wod-state"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workout_of_day_state")
        .select("manual_overrides, format_usage, last_generated_at")
        .limit(1)
        .single();

      if (error) {
        console.error("Error fetching WOD state:", error);
        return { manual_overrides: {}, format_usage: {}, last_generated_at: null };
      }

      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
