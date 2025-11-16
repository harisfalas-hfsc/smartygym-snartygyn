import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ActivityLog {
  id: string;
  user_id: string;
  content_type: 'workout' | 'program' | 'personal_training' | 'tool';
  item_id: string;
  item_name: string;
  action_type: 'viewed' | 'completed' | 'calculated' | 'program_day_completed' | 'pt_day_completed' | 'program_day_viewed' | 'pt_day_viewed' | 'missed';
  program_week?: number;
  program_day?: number;
  total_weeks?: number;
  total_days_per_week?: number;
  tool_input?: any;
  tool_result?: any;
  created_at: string;
  activity_date: string;
}

export interface LogActivityParams {
  content_type: ActivityLog['content_type'];
  item_id: string;
  item_name: string;
  action_type: ActivityLog['action_type'];
  program_week?: number;
  program_day?: number;
  total_weeks?: number;
  total_days_per_week?: number;
  tool_input?: any;
  tool_result?: any;
}

export const useActivityLog = (userId: string | undefined, filterType?: string, startDate?: Date, endDate?: Date) => {
  const queryClient = useQueryClient();

  // Fetch activities
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activity-log', userId, filterType, startDate, endDate],
    queryFn: async () => {
      if (!userId) return [];

      let query = supabase
        .from('user_activity_log')
        .select('*')
        .eq('user_id', userId)
        .order('activity_date', { ascending: false })
        .order('created_at', { ascending: false });

      // Apply content type filter
      if (filterType && filterType !== 'all') {
        query = query.eq('content_type', filterType);
      }

      // Apply date range filter
      if (startDate) {
        query = query.gte('activity_date', startDate.toISOString().split('T')[0]);
      }
      if (endDate) {
        query = query.lte('activity_date', endDate.toISOString().split('T')[0]);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching activity log:', error);
        throw error;
      }

      return data as ActivityLog[];
    },
    enabled: !!userId,
  });

  // Log activity mutation
  const logActivity = useMutation({
    mutationFn: async (params: LogActivityParams) => {
      if (!userId) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_activity_log')
        .insert({
          user_id: userId,
          ...params,
          activity_date: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-log'] });
    },
    onError: (error) => {
      console.error('Error logging activity:', error);
      toast.error('Failed to log activity');
    },
  });

  return {
    activities,
    isLoading,
    logActivity: logActivity.mutate,
  };
};

// Helper function to get activities by date
export const useActivitiesByDate = (userId: string | undefined, filterType?: string) => {
  const { activities, isLoading } = useActivityLog(userId, filterType);

  const activitiesByDate = activities.reduce((acc, activity) => {
    const date = activity.activity_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(activity);
    return acc;
  }, {} as Record<string, ActivityLog[]>);

  return { activitiesByDate, isLoading };
};

// Helper function to get activity statistics
export const useActivityStats = (userId: string | undefined) => {
  const { activities, isLoading } = useActivityLog(userId);

  const stats = {
    workoutsThisMonth: 0,
    programDaysThisMonth: 0,
    ptDaysThisMonth: 0,
    toolCalculationsThisMonth: 0,
    totalActivities: activities.length,
    currentStreak: 0,
  };

  if (activities.length === 0) return { stats, isLoading };

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  activities.forEach(activity => {
    const activityDate = new Date(activity.activity_date);
    if (activityDate >= startOfMonth) {
      if (activity.content_type === 'workout' && activity.action_type === 'completed') {
        stats.workoutsThisMonth++;
      }
      if (activity.content_type === 'program' && activity.action_type === 'program_day_completed') {
        stats.programDaysThisMonth++;
      }
      if (activity.content_type === 'personal_training' && activity.action_type === 'pt_day_completed') {
        stats.ptDaysThisMonth++;
      }
      if (activity.content_type === 'tool' && activity.action_type === 'calculated') {
        stats.toolCalculationsThisMonth++;
      }
    }
  });

  // Calculate current streak
  const uniqueDates = [...new Set(activities.map(a => a.activity_date))].sort().reverse();
  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  
  for (let i = 0; i < uniqueDates.length; i++) {
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() - i);
    const expectedDateStr = expectedDate.toISOString().split('T')[0];
    
    if (uniqueDates[i] === expectedDateStr) {
      streak++;
    } else {
      break;
    }
  }
  
  stats.currentStreak = streak;

  return { stats, isLoading };
};
