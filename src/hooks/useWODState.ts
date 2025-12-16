import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useWODState = () => {
  return useQuery({
    queryKey: ["wod-state"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workout_of_day_state")
        .select("day_count, week_number")
        .limit(1)
        .single();

      if (error) {
        console.error("Error fetching WOD state:", error);
        return { day_count: 1, week_number: 1 };
      }

      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
