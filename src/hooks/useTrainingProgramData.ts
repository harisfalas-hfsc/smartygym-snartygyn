import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TrainingProgramData {
  id: string;
  category: string;
  name: string;
  difficulty_stars: number | null;
  weeks: number | null;
  days_per_week: number | null;
  equipment: string | null;
  image_url: string | null;
  description: string | null;
  overview: string | null;
  weekly_schedule: string | null;
  program_structure: string | null;
  progression_plan: string | null;
  expected_results: string | null;
  nutrition_tips: string | null;
  target_audience: string | null;
  is_premium: boolean | null;
  is_standalone_purchase: boolean | null;
  price: number | null;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  duration: string | null;
}

export const useTrainingProgramData = (programId: string | undefined) => {
  return useQuery({
    queryKey: ["training-program", programId],
    queryFn: async () => {
      if (!programId) throw new Error("Program ID is required");

      const { data, error } = await supabase
        .from("admin_training_programs")
        .select("*")
        .eq("id", programId)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Training program not found");

      return data as TrainingProgramData;
    },
    enabled: !!programId,
  });
};
