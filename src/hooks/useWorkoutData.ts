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
  focus: string | null;
  is_workout_of_day: boolean | null;
  generated_for_date: string | null;
  created_at: string | null;
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
        .neq("is_visible", false)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        const { data: metadata, error: metadataError } = await (supabase as any)
          .rpc("get_visible_workout_metadata", { _workout_id: workoutId });

        if (metadataError) throw metadataError;
        const fallback = Array.isArray(metadata) ? metadata[0] : metadata;
        if (!fallback) throw new Error("Workout not found");

        return fallback as WorkoutData;
      }

      return data as WorkoutData;
    },
    enabled: !!workoutId,
    // Ensure detail pages always reflect latest backend content updates
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
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
      if (import.meta.env.DEV) {
        console.log("🔍 Fetching ALL workouts...");
      }
      const { data, error } = await supabase
        .rpc("get_visible_workout_metadata" as never, { _workout_id: null } as never);

      if (import.meta.env.DEV) {
        console.log("📦 Workouts data:", data);
        console.log("❌ Workouts error:", error);
      }

      if (error) {
        if (import.meta.env.DEV) {
          console.error("Error fetching workouts:", error);
        }
        return [];
      }

      return (data || []) as WorkoutData[];
    },
  });
};
