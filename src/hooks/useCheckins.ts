import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CheckinRecord {
  id: string;
  user_id: string;
  checkin_date: string;
  morning_completed: boolean;
  morning_completed_at: string | null;
  sleep_hours: number | null;
  sleep_quality: number | null;
  readiness_score: number | null;
  soreness_rating: number | null;
  mood_rating: number | null;
  night_completed: boolean;
  night_completed_at: string | null;
  steps_value: number | null;
  steps_bucket: number | null;
  hydration_liters: number | null;
  protein_level: number | null;
  day_strain: number | null;
  sleep_score: number | null;
  readiness_score_norm: number | null;
  soreness_score: number | null;
  mood_score: number | null;
  movement_score: number | null;
  hydration_score: number | null;
  protein_score_norm: number | null;
  day_strain_score: number | null;
  daily_smarty_score: number | null;
  score_category: 'red' | 'orange' | 'yellow' | 'green' | null;
  status: 'complete' | 'incomplete_morning_only' | 'incomplete_night_only' | 'missed';
  morning_modal_shown: boolean;
  night_modal_shown: boolean;
  created_at: string;
  updated_at: string;
}

export interface MorningCheckinData {
  sleep_hours: number;
  sleep_quality: number;
  readiness_score: number;
  soreness_rating: number;
  mood_rating: number;
}

export interface NightCheckinData {
  steps_value?: number;
  steps_bucket: number;
  hydration_liters: number;
  protein_level: number;
  day_strain: number;
}

export interface Badge {
  id: string;
  badge_type: string;
  badge_level: string;
  earned_at: string;
  badge_data: any;
}

export interface CheckinStats {
  currentStreak: number;
  bestStreak: number;
  averageScore: number;
  completionRate: number;
  totalCheckins: number;
}

export function useCheckins() {
  const [todayCheckin, setTodayCheckin] = useState<CheckinRecord | null>(null);
  const [checkins, setCheckins] = useState<CheckinRecord[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [stats, setStats] = useState<CheckinStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const getTodayDate = useCallback(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  const fetchTodayCheckin = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const today = getTodayDate();
      const { data, error } = await supabase
        .from('smarty_checkins')
        .select('*')
        .eq('user_id', user.id)
        .eq('checkin_date', today)
        .maybeSingle();

      if (error) throw error;
      setTodayCheckin(data as CheckinRecord | null);
      return data as CheckinRecord | null;
    } catch (error) {
      console.error('Error fetching today checkin:', error);
      return null;
    }
  }, [getTodayDate]);

  const fetchCheckins = useCallback(async (days: number = 30) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('smarty_checkins')
        .select('*')
        .eq('user_id', user.id)
        .gte('checkin_date', startDate.toISOString().split('T')[0])
        .order('checkin_date', { ascending: false });

      if (error) throw error;
      setCheckins((data || []) as CheckinRecord[]);
      return (data || []) as CheckinRecord[];
    } catch (error) {
      console.error('Error fetching checkins:', error);
      return [];
    }
  }, []);

  const fetchBadges = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      setBadges((data || []) as Badge[]);
      return (data || []) as Badge[];
    } catch (error) {
      console.error('Error fetching badges:', error);
      return [];
    }
  }, []);

  const calculateStats = useCallback((checkinData: CheckinRecord[]): CheckinStats => {
    if (checkinData.length === 0) {
      return {
        currentStreak: 0,
        bestStreak: 0,
        averageScore: 0,
        completionRate: 0,
        totalCheckins: 0
      };
    }

    // Calculate current streak
    let currentStreak = 0;
    for (const checkin of checkinData) {
      if (checkin.status === 'complete') {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate best streak
    let bestStreak = 0;
    let tempStreak = 0;
    for (const checkin of checkinData) {
      if (checkin.status === 'complete') {
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // Calculate average score
    const completeCheckins = checkinData.filter(c => c.daily_smarty_score != null);
    const averageScore = completeCheckins.length > 0
      ? Math.round(completeCheckins.reduce((sum, c) => sum + (c.daily_smarty_score || 0), 0) / completeCheckins.length)
      : 0;

    // Calculate completion rate
    const completionRate = Math.round((checkinData.filter(c => c.status === 'complete').length / checkinData.length) * 100);

    return {
      currentStreak,
      bestStreak,
      averageScore,
      completionRate,
      totalCheckins: checkinData.length
    };
  }, []);

  const createOrGetTodayCheckin = useCallback(async (): Promise<CheckinRecord | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const today = getTodayDate();
      
      // Check if today's checkin exists
      let { data: existing, error: fetchError } = await supabase
        .from('smarty_checkins')
        .select('*')
        .eq('user_id', user.id)
        .eq('checkin_date', today)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existing) {
        return existing as CheckinRecord;
      }

      // Create new checkin for today
      const { data: newCheckin, error: insertError } = await supabase
        .from('smarty_checkins')
        .insert({
          user_id: user.id,
          checkin_date: today
        })
        .select()
        .single();

      if (insertError) throw insertError;
      setTodayCheckin(newCheckin as CheckinRecord);
      return newCheckin as CheckinRecord;
    } catch (error) {
      console.error('Error creating today checkin:', error);
      return null;
    }
  }, [getTodayDate]);

  const submitMorningCheckin = useCallback(async (data: MorningCheckinData): Promise<boolean> => {
    try {
      const checkin = await createOrGetTodayCheckin();
      if (!checkin) throw new Error('Could not create check-in record');

      const { error: updateError } = await supabase
        .from('smarty_checkins')
        .update({
          ...data,
          morning_completed: true,
          morning_completed_at: new Date().toISOString()
        })
        .eq('id', checkin.id);

      if (updateError) throw updateError;

      // Calculate scores
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.functions.invoke('calculate-checkin-scores', {
          body: { checkin_id: checkin.id },
          headers: { Authorization: `Bearer ${session.access_token}` }
        });
      }

      // Log activity for morning check-in
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('user_activity_log').insert({
          user_id: user.id,
          content_type: 'checkin',
          item_id: checkin.id,
          item_name: 'Morning Check-in',
          action_type: 'completed',
          activity_date: getTodayDate(),
          tool_result: { type: 'morning' }
        });
      }

      await fetchTodayCheckin();
      toast({
        title: "Morning check-in completed!",
        description: "Nice job starting your day with intention."
      });
      return true;
    } catch (error) {
      console.error('Error submitting morning checkin:', error);
      toast({
        title: "Error",
        description: "Failed to save morning check-in.",
        variant: "destructive"
      });
      return false;
    }
  }, [createOrGetTodayCheckin, fetchTodayCheckin, toast, getTodayDate]);

  const submitNightCheckin = useCallback(async (data: NightCheckinData): Promise<boolean> => {
    try {
      const checkin = await createOrGetTodayCheckin();
      if (!checkin) throw new Error('Could not create check-in record');

      const { error: updateError } = await supabase
        .from('smarty_checkins')
        .update({
          ...data,
          night_completed: true,
          night_completed_at: new Date().toISOString()
        })
        .eq('id', checkin.id);

      if (updateError) throw updateError;

      // Calculate scores
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const response = await supabase.functions.invoke('calculate-checkin-scores', {
          body: { checkin_id: checkin.id },
          headers: { Authorization: `Bearer ${session.access_token}` }
        });
        
        // Get the updated checkin with scores
        const updatedCheckin = await fetchTodayCheckin();
        
        // Log activity for night check-in with score
        const { data: { user } } = await supabase.auth.getUser();
        if (user && updatedCheckin) {
          await supabase.from('user_activity_log').insert({
            user_id: user.id,
            content_type: 'checkin',
            item_id: checkin.id,
            item_name: 'Night Check-in',
            action_type: 'completed',
            activity_date: getTodayDate(),
            tool_result: { 
              type: 'night',
              score: updatedCheckin.daily_smarty_score,
              category: updatedCheckin.score_category
            }
          });
        }
      }

      await fetchTodayCheckin();
      toast({
        title: "Night check-in completed!",
        description: "Great job wrapping up your day."
      });
      return true;
    } catch (error) {
      console.error('Error submitting night checkin:', error);
      toast({
        title: "Error",
        description: "Failed to save night check-in.",
        variant: "destructive"
      });
      return false;
    }
  }, [createOrGetTodayCheckin, fetchTodayCheckin, toast, getTodayDate]);

  const markModalShown = useCallback(async (type: 'morning' | 'night') => {
    try {
      const checkin = await createOrGetTodayCheckin();
      if (!checkin) return;

      const updateField = type === 'morning' ? 'morning_modal_shown' : 'night_modal_shown';
      await supabase
        .from('smarty_checkins')
        .update({ [updateField]: true })
        .eq('id', checkin.id);

      await fetchTodayCheckin();
    } catch (error) {
      console.error('Error marking modal shown:', error);
    }
  }, [createOrGetTodayCheckin, fetchTodayCheckin]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const [checkinData] = await Promise.all([
        fetchCheckins(90),
        fetchTodayCheckin(),
        fetchBadges()
      ]);
      if (checkinData) {
        setStats(calculateStats(checkinData));
      }
      setLoading(false);
    };
    init();
  }, [fetchCheckins, fetchTodayCheckin, fetchBadges, calculateStats]);

  return {
    todayCheckin,
    checkins,
    badges,
    stats,
    loading,
    fetchTodayCheckin,
    fetchCheckins,
    fetchBadges,
    submitMorningCheckin,
    submitNightCheckin,
    markModalShown,
    createOrGetTodayCheckin,
    calculateStats
  };
}