import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ScheduledWorkout {
  id: string;
  user_id: string;
  content_type: string;
  content_id: string;
  content_name: string;
  scheduled_date: string;
  scheduled_time: string | null;
  reminder_before_minutes: number;
  reminder_sent: boolean;
  google_calendar_event_id: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface ScheduledByDate {
  [date: string]: ScheduledWorkout[];
}

export const useScheduledWorkouts = (userId: string | null) => {
  const [scheduledWorkouts, setScheduledWorkouts] = useState<ScheduledWorkout[]>([]);
  const [scheduledByDate, setScheduledByDate] = useState<ScheduledByDate>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchScheduledWorkouts = async () => {
      try {
        const { data, error } = await supabase
          .from('scheduled_workouts')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'scheduled')
          .order('scheduled_date', { ascending: true });

        if (error) throw error;

        setScheduledWorkouts(data || []);

        // Group by date
        const byDate: ScheduledByDate = {};
        (data || []).forEach(workout => {
          const dateStr = workout.scheduled_date;
          if (!byDate[dateStr]) {
            byDate[dateStr] = [];
          }
          byDate[dateStr].push(workout);
        });
        setScheduledByDate(byDate);
      } catch (error) {
        console.error('Error fetching scheduled workouts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScheduledWorkouts();
  }, [userId]);

  const refetch = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('scheduled_workouts')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'scheduled')
        .order('scheduled_date', { ascending: true });

      if (error) throw error;

      setScheduledWorkouts(data || []);

      const byDate: ScheduledByDate = {};
      (data || []).forEach(workout => {
        const dateStr = workout.scheduled_date;
        if (!byDate[dateStr]) {
          byDate[dateStr] = [];
        }
        byDate[dateStr].push(workout);
      });
      setScheduledByDate(byDate);
    } catch (error) {
      console.error('Error refetching scheduled workouts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { scheduledWorkouts, scheduledByDate, isLoading, refetch };
};

export const useScheduledWorkoutForContent = (contentId: string, contentType: string) => {
  const [scheduledWorkout, setScheduledWorkout] = useState<ScheduledWorkout | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchScheduled = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('scheduled_workouts')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('content_id', contentId)
          .eq('content_type', contentType)
          .eq('status', 'scheduled')
          .order('scheduled_date', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        setScheduledWorkout(data);
      } catch (error) {
        console.error('Error fetching scheduled workout:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScheduled();
  }, [contentId, contentType]);

  const refetch = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('scheduled_workouts')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('content_id', contentId)
        .eq('content_type', contentType)
        .eq('status', 'scheduled')
        .order('scheduled_date', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      setScheduledWorkout(data);
    } catch (error) {
      console.error('Error refetching scheduled workout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { scheduledWorkout, isLoading, refetch };
};
