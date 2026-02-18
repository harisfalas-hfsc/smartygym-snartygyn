import { supabase } from "@/integrations/supabase/client";

interface AchievedGoal {
  type: "weight" | "body_fat" | "muscle_mass" | "workouts_completed" | "programs_completed";
  target: number;
  current: number;
}

export const checkCompletionGoalAchievement = async (
  userId: string,
  goalType: "workouts_completed" | "programs_completed"
): Promise<AchievedGoal | null> => {
  try {
    // Fetch user's active goal
    const { data: goalData, error: goalError } = await supabase
      .from('user_measurement_goals')
      .select('target_workouts_completed, target_programs_completed')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (goalError || !goalData) return null;

    const targetField = goalType === "workouts_completed" 
      ? "target_workouts_completed" 
      : "target_programs_completed";
    
    const target = goalData[targetField];
    if (!target) return null;

    // Count completions
    const table = goalType === "workouts_completed" ? "workout_interactions" : "program_interactions";
    const { count, error: countError } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_completed', true);

    if (countError || count === null) return null;

    if (count >= target) {
      return { type: goalType, target, current: count };
    }

    return null;
  } catch (error) {
    console.error('Error checking completion goal:', error);
    return null;
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
        messageType: 'announcement_update',
        customData: {
          subject: '🎉 Goal Achieved!',
          content: `Congratulations! You've completed ${achieved.current} ${label}, reaching your target of ${achieved.target}! Keep up the amazing work!`
        }
      }
    });
  } catch (error) {
    console.error('Failed to send goal achievement notification:', error);
  }
};
