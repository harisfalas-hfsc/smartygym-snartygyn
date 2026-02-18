import { supabase } from "@/integrations/supabase/client";

interface AchievedGoal {
  type: "weight" | "body_fat" | "muscle_mass" | "workouts_completed" | "programs_completed";
  target: number;
  current: number;
}

const ACHIEVED_AT_FIELDS: Record<string, string> = {
  workouts_completed: "workouts_goal_achieved_at",
  programs_completed: "programs_goal_achieved_at",
  weight: "weight_goal_achieved_at",
  body_fat: "body_fat_goal_achieved_at",
  muscle_mass: "muscle_mass_goal_achieved_at",
};

export const checkCompletionGoalAchievement = async (
  userId: string,
  goalType: "workouts_completed" | "programs_completed"
): Promise<AchievedGoal | null> => {
  try {
    const achievedAtField = ACHIEVED_AT_FIELDS[goalType];

    const { data: goalData, error: goalError } = await supabase
      .from('user_measurement_goals')
      .select(`target_workouts_completed, target_programs_completed, ${achievedAtField}`)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (goalError || !goalData) return null;

    // Fire-once: skip if already achieved
    if ((goalData as any)[achievedAtField]) return null;

    const targetField = goalType === "workouts_completed" 
      ? "target_workouts_completed" 
      : "target_programs_completed";
    
    const target = goalData[targetField];
    if (!target) return null;

    const table = goalType === "workouts_completed" ? "workout_interactions" : "program_interactions";
    const { count, error: countError } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_completed', true);

    if (countError || count === null) return null;

    if (count >= target) {
      // Mark as achieved
      const { data: goalRow } = await supabase
        .from('user_measurement_goals')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (goalRow) {
        await supabase
          .from('user_measurement_goals')
          .update({ [achievedAtField]: new Date().toISOString() } as any)
          .eq('id', goalRow.id);
      }

      return { type: goalType, target, current: count };
    }

    return null;
  } catch (error) {
    console.error('Error checking completion goal:', error);
    return null;
  }
};

export const markMeasurementGoalAchieved = async (
  userId: string,
  goalType: "weight" | "body_fat" | "muscle_mass"
) => {
  const achievedAtField = ACHIEVED_AT_FIELDS[goalType];
  
  const { data: goalRow } = await supabase
    .from('user_measurement_goals')
    .select('id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (goalRow) {
    await supabase
      .from('user_measurement_goals')
      .update({ [achievedAtField]: new Date().toISOString() } as any)
      .eq('id', goalRow.id);
  }
};

export const sendGoalAchievementNotification = async (
  userId: string,
  achieved: AchievedGoal
) => {
  const label = achieved.type === "workouts_completed" ? "workouts" : "programs";
  try {
    await supabase.functions.invoke('send-system-message', {
      body: {
        userId,
        messageType: 'goal_achievement',
        customData: {
          subject: '🎉 Goal Achieved! You did it!',
          content: `Congratulations! You've completed ${achieved.current} ${label}, reaching your target of ${achieved.target}! Your dedication and hard work have paid off. Ready for your next challenge? Set new goals and keep upgrading your life!`
        }
      }
    });
  } catch (error) {
    console.error('Failed to send goal achievement notification:', error);
  }
};
