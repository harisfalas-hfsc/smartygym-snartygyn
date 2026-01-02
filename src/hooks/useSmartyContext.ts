import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAccessControl } from "@/contexts/AccessControlContext";
import { CheckinRecord } from "@/hooks/useCheckins";

export interface UserFitnessGoal {
  id: string;
  user_id: string;
  primary_goal: 'fat_loss' | 'muscle_gain' | 'strength' | 'endurance' | 'flexibility' | 'general_fitness' | 'recovery';
  secondary_goal: string | null;
  time_availability_default: number;
  equipment_available: 'bodyweight' | 'equipment' | 'various';
  experience_level: 'beginner' | 'intermediate' | 'advanced';
  created_at: string;
  updated_at: string;
}

export interface SmartyContext {
  // Check-in data
  todayCheckin: CheckinRecord | null;
  recentCheckins: CheckinRecord[];
  
  // Activity data
  recentActivities: any[];
  completedWorkoutIds: string[];
  completedProgramIds: string[];
  viewedWorkoutIds: string[];
  viewedProgramIds: string[];
  
  // Goals
  userGoal: UserFitnessGoal | null;
  
  // Scheduled content
  scheduledWorkouts: any[];
  
  // Interactions
  workoutInteractions: any[];
  programInteractions: any[];
  
  // Recent patterns
  recentCategories: string[];
  recentFormats: string[];
  daysSinceLastWorkout: number;
  
  // Preferences inferred from behavior
  preferredDifficulty: string | null;
  preferredEquipment: string | null;
  
  // Loading state
  isLoading: boolean;
}

export const useSmartyContext = (): SmartyContext => {
  const { user, userTier } = useAccessControl();
  const userId = user?.id;
  const isPremium = userTier === 'premium';

  // Fetch today's check-in
  const { data: todayCheckin, isLoading: checkinLoading } = useQuery({
    queryKey: ['smarty-today-checkin', userId],
    queryFn: async () => {
      if (!userId) return null;
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('smarty_checkins')
        .select('*')
        .eq('user_id', userId)
        .eq('checkin_date', today)
        .maybeSingle();
      return data as CheckinRecord | null;
    },
    enabled: !!userId && isPremium,
  });

  // Fetch recent check-ins (last 7 days)
  const { data: recentCheckins = [], isLoading: recentCheckinsLoading } = useQuery({
    queryKey: ['smarty-recent-checkins', userId],
    queryFn: async () => {
      if (!userId) return [];
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { data } = await supabase
        .from('smarty_checkins')
        .select('*')
        .eq('user_id', userId)
        .gte('checkin_date', sevenDaysAgo.toISOString().split('T')[0])
        .order('checkin_date', { ascending: false });
      return (data || []) as CheckinRecord[];
    },
    enabled: !!userId && isPremium,
  });

  // Fetch recent activities (last 30 days)
  const { data: recentActivities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ['smarty-recent-activities', userId],
    queryFn: async () => {
      if (!userId) return [];
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { data } = await supabase
        .from('user_activity_log')
        .select('*')
        .eq('user_id', userId)
        .gte('activity_date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('activity_date', { ascending: false });
      return data || [];
    },
    enabled: !!userId && isPremium,
  });

  // Fetch user fitness goals
  const { data: userGoal, isLoading: goalLoading } = useQuery({
    queryKey: ['smarty-user-goal', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await supabase
        .from('user_fitness_goals')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      return data as UserFitnessGoal | null;
    },
    enabled: !!userId && isPremium,
  });

  // Fetch scheduled workouts for today
  const { data: scheduledWorkouts = [], isLoading: scheduledLoading } = useQuery({
    queryKey: ['smarty-scheduled-workouts', userId],
    queryFn: async () => {
      if (!userId) return [];
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('scheduled_workouts')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'scheduled')
        .gte('scheduled_date', today)
        .order('scheduled_date', { ascending: true })
        .limit(10);
      return data || [];
    },
    enabled: !!userId && isPremium,
  });

  // Fetch workout interactions
  const { data: workoutInteractions = [], isLoading: workoutInteractionsLoading } = useQuery({
    queryKey: ['smarty-workout-interactions', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data } = await supabase
        .from('workout_interactions')
        .select('*')
        .eq('user_id', userId);
      return data || [];
    },
    enabled: !!userId && isPremium,
  });

  // Fetch program interactions
  const { data: programInteractions = [], isLoading: programInteractionsLoading } = useQuery({
    queryKey: ['smarty-program-interactions', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data } = await supabase
        .from('program_interactions')
        .select('*')
        .eq('user_id', userId);
      return data || [];
    },
    enabled: !!userId && isPremium,
  });

  // Derive completed and viewed content from activities
  const completedWorkoutIds = recentActivities
    .filter(a => a.content_type === 'workout' && a.action_type === 'completed')
    .map(a => a.item_id);

  const completedProgramIds = recentActivities
    .filter(a => a.content_type === 'program' && a.action_type === 'program_day_completed')
    .map(a => a.item_id);

  const viewedWorkoutIds = recentActivities
    .filter(a => a.content_type === 'workout' && a.action_type === 'viewed')
    .map(a => a.item_id);

  const viewedProgramIds = recentActivities
    .filter(a => a.content_type === 'program' && a.action_type === 'viewed')
    .map(a => a.item_id);

  // Calculate recent categories and formats from completed workouts
  const recentCategories: string[] = [];
  const recentFormats: string[] = [];
  
  // We'll populate these from workout interactions that have been completed
  workoutInteractions
    .filter(wi => wi.is_completed)
    .slice(0, 5)
    .forEach(wi => {
      if (wi.workout_type) recentCategories.push(wi.workout_type);
    });

  // Calculate days since last workout
  const lastWorkoutActivity = recentActivities.find(
    a => a.content_type === 'workout' && a.action_type === 'completed'
  );
  
  let daysSinceLastWorkout = 999;
  if (lastWorkoutActivity) {
    const lastDate = new Date(lastWorkoutActivity.activity_date);
    const today = new Date();
    daysSinceLastWorkout = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  // Infer preferred difficulty from completed workouts
  const difficultyCount: Record<string, number> = {};
  workoutInteractions
    .filter(wi => wi.is_completed)
    .forEach(wi => {
      // We'd need to join with workout data for difficulty, simplified here
    });

  const isLoading = checkinLoading || recentCheckinsLoading || activitiesLoading || 
                    goalLoading || scheduledLoading || workoutInteractionsLoading || 
                    programInteractionsLoading;

  return {
    todayCheckin: todayCheckin || null,
    recentCheckins,
    recentActivities,
    completedWorkoutIds,
    completedProgramIds,
    viewedWorkoutIds,
    viewedProgramIds,
    userGoal: userGoal || null,
    scheduledWorkouts,
    workoutInteractions,
    programInteractions,
    recentCategories,
    recentFormats,
    daysSinceLastWorkout,
    preferredDifficulty: null, // Will be derived from actual workout data
    preferredEquipment: userGoal?.equipment_available || null,
    isLoading,
  };
};
