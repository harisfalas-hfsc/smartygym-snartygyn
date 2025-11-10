import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useWorkoutData = (workoutId: string | undefined) => {
  return useQuery({
    queryKey: ["workout", workoutId],
    queryFn: async () => {
      if (!workoutId) return null;
      
      const { data, error } = await supabase
        .from("admin_workouts")
        .select("*")
        .eq("id", workoutId)
        .single();

      if (error) {
        console.error("Error fetching workout:", error);
        return null;
      }

      return data;
    },
    enabled: !!workoutId,
  });
};

export const useAllWorkouts = () => {
  return useQuery({
    queryKey: ["all-workouts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_workouts")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching workouts:", error);
        return [];
      }

      return data || [];
    },
  });
};
