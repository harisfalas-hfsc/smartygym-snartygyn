import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CheckinScoreByDate {
  [dateStr: string]: {
    score: number | null;
    category: 'red' | 'orange' | 'yellow' | 'green' | null;
    morningCompleted: boolean;
    nightCompleted: boolean;
  };
}

export function useCheckinScoresByDate(userId: string) {
  const [scoresByDate, setScoresByDate] = useState<CheckinScoreByDate>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('smarty_checkins')
          .select('checkin_date, daily_smarty_score, score_category, morning_completed, night_completed')
          .eq('user_id', userId)
          .order('checkin_date', { ascending: false });

        if (error) throw error;

        const scores: CheckinScoreByDate = {};
        (data || []).forEach((checkin) => {
          scores[checkin.checkin_date] = {
            score: checkin.daily_smarty_score,
            category: checkin.score_category as 'red' | 'orange' | 'yellow' | 'green' | null,
            morningCompleted: checkin.morning_completed || false,
            nightCompleted: checkin.night_completed || false,
          };
        });

        setScoresByDate(scores);
      } catch (error) {
        console.error('Error fetching check-in scores:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScores();
  }, [userId]);

  return { scoresByDate, isLoading };
}
