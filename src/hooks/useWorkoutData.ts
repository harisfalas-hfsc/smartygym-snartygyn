import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface WorkoutData {
  id: string;
  category: string;
  name: string;
  difficulty_stars: number | null;
  difficulty: string | null;
  equipment: string | null;
  duration: string | null;
  format: string | null;
  focus: string | null;
  image_url: string | null;
  description: string | null;
  instructions: string | null;
  tips: string | null;
  is_premium: boolean | null;
  is_standalone_purchase: boolean | null;
  price: number | null;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  type: string;
  warm_up: string | null;
  main_workout: string | null;
  cool_down: string | null;
  activation: string | null;
  finisher: string | null;
  notes: string | null;
}

export const useWorkoutData = (workoutId: string | undefined) => {
  return useQuery({
    queryKey: ["workout", workoutId],
    queryFn: async () => {
      if (!workoutId) throw new Error("Workout ID is required");
      
      const { data, error } = await supabase
        .from("admin_workouts")
        .select("*")
        .eq("id", workoutId)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Workout not found");

      return data as WorkoutData;
    },
    enabled: !!workoutId,
  });
};

export const useAllWorkouts = () => {
  return useQuery({
    queryKey: ["all-workouts"],
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    queryFn: async () => {
      console.log("🔍 Fetching ALL workouts...");
      const { data, error } = await supabase
        .from("admin_workouts")
        .select("*")
        .order("name");

      console.log("📦 Workouts data:", data);
      console.log("❌ Workouts error:", error);

      if (error) {
        console.error("Error fetching workouts:", error);
        return [];
      }

      return data || [];
    },
  });
};
