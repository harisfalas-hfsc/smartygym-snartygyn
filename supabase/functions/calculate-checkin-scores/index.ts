import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Scoring functions based on exact specifications
function calculateSleepHoursScore(hours: number): number {
  if (hours < 5.0) return 2;
  if (hours < 6.0) return 4;
  if (hours < 7.0) return 7;
  if (hours <= 9.0) return 10;
  return 7; // > 9 hours
}

function calculateSleepQualityScore(quality: number): number {
  const mapping: Record<number, number> = { 1: 2, 2: 4, 3: 6, 4: 8, 5: 10 };
  return mapping[quality] || 6;
}

function calculateSleepScore(hours: number, quality: number): number {
  const hoursScore = calculateSleepHoursScore(hours);
  const qualityScore = calculateSleepQualityScore(quality);
  return Math.round((hoursScore + qualityScore) / 2);
}

function calculateSorenessScore(rating: number): number {
  return Math.max(0, Math.min(10, 10 - rating));
}

function calculateMoodScore(rating: number): number {
  const mapping: Record<number, number> = { 1: 2, 2: 4, 3: 6, 4: 8, 5: 10 };
  return mapping[rating] || 6;
}

function calculateMovementScore(steps: number): number {
  if (steps < 2000) return 2;
  if (steps < 5000) return 4;
  if (steps < 8000) return 7;
  if (steps < 10000) return 9;
  return 10;
}

function calculateHydrationScore(liters: number): number {
  if (liters < 1.0) return 2;
  if (liters < 1.5) return 4;
  if (liters < 2.0) return 7;
  if (liters < 2.5) return 9;
  return 10;
}

function calculateProteinScore(level: number): number {
  const mapping: Record<number, number> = { 0: 2, 1: 4, 2: 6, 3: 8, 4: 10 };
  return mapping[level] || 6;
}

function calculateDayStrainScore(strain: number): number {
  if (strain <= 2) return 5;
  if (strain <= 4) return 8;
  if (strain <= 7) return 10;
  return 7; // 8-10
}

function getStepsFromBucket(bucket: number): number {
  const midpoints: Record<number, number> = {
    1: 1000,
    2: 3500,
    3: 6500,
    4: 9000,
    5: 11000
  };
  return midpoints[bucket] || 5000;
}

function calculateDailyScore(scores: {
  sleep: number;
  readiness: number;
  movement: number;
  hydration: number;
  protein: number;
  mood: number;
  dayStrain: number;
}): number {
  return Math.round(
    0.15 * scores.sleep +
    0.15 * scores.readiness +
    0.20 * scores.movement +
    0.15 * scores.hydration +
    0.15 * scores.protein +
    0.10 * scores.mood +
    0.10 * scores.dayStrain
  );
}

function getScoreCategory(score: number): string {
  if (score < 40) return 'red';
  if (score < 60) return 'orange';
  if (score < 80) return 'yellow';
  return 'green';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { checkin_id, check_badges = true } = await req.json();

    if (!checkin_id) {
      throw new Error('checkin_id is required');
    }

    // Fetch the check-in record
    const { data: checkin, error: fetchError } = await supabase
      .from('smarty_checkins')
      .select('*')
      .eq('id', checkin_id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !checkin) {
      throw new Error('Check-in not found');
    }

    const updates: Record<string, any> = {};

    // Calculate morning scores if morning is completed
    if (checkin.morning_completed && checkin.sleep_hours != null && checkin.sleep_quality != null) {
      updates.sleep_score = calculateSleepScore(checkin.sleep_hours, checkin.sleep_quality);
      updates.readiness_score_norm = checkin.readiness_score;
      updates.soreness_score = calculateSorenessScore(checkin.soreness_rating);
      updates.mood_score = calculateMoodScore(checkin.mood_rating);
    }

    // Calculate night scores if night is completed
    if (checkin.night_completed) {
      const steps = checkin.steps_value || getStepsFromBucket(checkin.steps_bucket || 3);
      updates.movement_score = calculateMovementScore(steps);
      updates.hydration_score = calculateHydrationScore(checkin.hydration_liters || 0);
      updates.protein_score_norm = calculateProteinScore(checkin.protein_level || 0);
      updates.day_strain_score = calculateDayStrainScore(checkin.day_strain || 5);
    }

    // Determine status
    if (checkin.morning_completed && checkin.night_completed) {
      updates.status = 'complete';
    } else if (checkin.morning_completed) {
      updates.status = 'incomplete_morning_only';
    } else if (checkin.night_completed) {
      updates.status = 'incomplete_night_only';
    }

    // Calculate daily score only if both check-ins are complete
    if (checkin.morning_completed && checkin.night_completed) {
      const sleepScore = updates.sleep_score ?? checkin.sleep_score;
      const readinessScore = updates.readiness_score_norm ?? checkin.readiness_score_norm;
      const movementScore = updates.movement_score ?? checkin.movement_score;
      const hydrationScore = updates.hydration_score ?? checkin.hydration_score;
      const proteinScore = updates.protein_score_norm ?? checkin.protein_score_norm;
      const moodScore = updates.mood_score ?? checkin.mood_score;
      const dayStrainScore = updates.day_strain_score ?? checkin.day_strain_score;

      if (sleepScore != null && readinessScore != null && movementScore != null && 
          hydrationScore != null && proteinScore != null && moodScore != null && dayStrainScore != null) {
        const dailyScore = calculateDailyScore({
          sleep: sleepScore,
          readiness: readinessScore,
          movement: movementScore,
          hydration: hydrationScore,
          protein: proteinScore,
          mood: moodScore,
          dayStrain: dayStrainScore
        });
        updates.daily_smarty_score = dailyScore;
        updates.score_category = getScoreCategory(dailyScore);
      }
    }

    // Update the check-in record
    const { error: updateError } = await supabase
      .from('smarty_checkins')
      .update(updates)
      .eq('id', checkin_id);

    if (updateError) {
      throw updateError;
    }

    // Check and award badges if requested
    let newBadges: string[] = [];
    if (check_badges) {
      newBadges = await checkAndAwardBadges(supabase, user.id);
    }

    console.log(`Calculated scores for checkin ${checkin_id}:`, updates);

    return new Response(
      JSON.stringify({ 
        success: true, 
        scores: updates,
        new_badges: newBadges
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error calculating check-in scores:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function checkAndAwardBadges(supabase: any, userId: string): Promise<string[]> {
  const newBadges: string[] = [];
  const now = new Date();

  // Get check-in history for badge calculations
  const { data: checkins } = await supabase
    .from('smarty_checkins')
    .select('*')
    .eq('user_id', userId)
    .order('checkin_date', { ascending: false })
    .limit(90);

  if (!checkins || checkins.length === 0) return newBadges;

  // Get existing badges
  const { data: existingBadges } = await supabase
    .from('user_badges')
    .select('badge_type, badge_level')
    .eq('user_id', userId);

  const hasBadge = (type: string, level: string) => 
    existingBadges?.some((b: any) => b.badge_type === type && b.badge_level === level);

  // Helper to count consecutive complete days
  const countConsecutiveCompleteDays = (): number => {
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    
    for (const checkin of checkins) {
      if (checkin.status === 'complete') {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  // Helper to count days with score >= threshold in last N days
  const countDaysWithScore = (field: string, threshold: number, days: number): number => {
    const recentCheckins = checkins.slice(0, days);
    return recentCheckins.filter((c: any) => c[field] >= threshold).length;
  };

  // Consistency Champion badges
  const consecutiveDays = countConsecutiveCompleteDays();
  
  if (consecutiveDays >= 7 && !hasBadge('consistency_champion', 'bronze')) {
    await awardBadge(supabase, userId, 'consistency_champion', 'bronze', { streak: 7 });
    newBadges.push('Consistency Champion (Bronze)');
  }
  if (consecutiveDays >= 30 && !hasBadge('consistency_champion', 'silver')) {
    await awardBadge(supabase, userId, 'consistency_champion', 'silver', { streak: 30 });
    newBadges.push('Consistency Champion (Silver)');
  }
  if (consecutiveDays >= 90 && !hasBadge('consistency_champion', 'gold')) {
    await awardBadge(supabase, userId, 'consistency_champion', 'gold', { streak: 90 });
    newBadges.push('Consistency Champion (Gold)');
  }

  // Hydration Hero badges
  const hydrationDays7 = countDaysWithScore('hydration_score', 8, 7);
  const hydrationDays30 = countDaysWithScore('hydration_score', 8, 30);
  
  if (hydrationDays7 >= 5 && !hasBadge('hydration_hero', 'bronze')) {
    await awardBadge(supabase, userId, 'hydration_hero', 'bronze', { days: hydrationDays7 });
    newBadges.push('Hydration Hero (Bronze)');
  }
  if (hydrationDays30 >= 20 && !hasBadge('hydration_hero', 'silver')) {
    await awardBadge(supabase, userId, 'hydration_hero', 'silver', { days: hydrationDays30 });
    newBadges.push('Hydration Hero (Silver)');
  }

  // Step Machine badges
  const movementDays14 = countDaysWithScore('movement_score', 8, 14);
  const movementDays30 = countDaysWithScore('movement_score', 8, 30);
  
  if (movementDays14 >= 10 && !hasBadge('step_machine', 'bronze')) {
    await awardBadge(supabase, userId, 'step_machine', 'bronze', { days: movementDays14 });
    newBadges.push('Step Machine (Bronze)');
  }
  if (movementDays30 >= 22 && !hasBadge('step_machine', 'silver')) {
    await awardBadge(supabase, userId, 'step_machine', 'silver', { days: movementDays30 });
    newBadges.push('Step Machine (Silver)');
  }

  // Protein Pro badges
  const proteinDays14 = countDaysWithScore('protein_score_norm', 8, 14);
  const proteinDays30 = countDaysWithScore('protein_score_norm', 8, 30);
  
  if (proteinDays14 >= 10 && !hasBadge('protein_pro', 'bronze')) {
    await awardBadge(supabase, userId, 'protein_pro', 'bronze', { days: proteinDays14 });
    newBadges.push('Protein Pro (Bronze)');
  }
  if (proteinDays30 >= 22 && !hasBadge('protein_pro', 'silver')) {
    await awardBadge(supabase, userId, 'protein_pro', 'silver', { days: proteinDays30 });
    newBadges.push('Protein Pro (Silver)');
  }

  // Recovery Master badge
  const recoveryDays = checkins.slice(0, 7).filter((c: any) => 
    c.sleep_score >= 8 && c.readiness_score_norm >= 7 && c.soreness_rating <= 4
  ).length;
  
  if (recoveryDays >= 5 && !hasBadge('recovery_master', 'special')) {
    await awardBadge(supabase, userId, 'recovery_master', 'special', { days: recoveryDays });
    newBadges.push('Recovery Master');
  }

  // Comeback Award - compare last 7 days vs previous 7 days
  if (checkins.length >= 14) {
    const currentWeek = checkins.slice(0, 7).filter((c: any) => c.daily_smarty_score != null);
    const previousWeek = checkins.slice(7, 14).filter((c: any) => c.daily_smarty_score != null);
    
    if (currentWeek.length > 0 && previousWeek.length > 0) {
      const currentAvg = currentWeek.reduce((sum: number, c: any) => sum + c.daily_smarty_score, 0) / currentWeek.length;
      const previousAvg = previousWeek.reduce((sum: number, c: any) => sum + c.daily_smarty_score, 0) / previousWeek.length;
      
      if (currentAvg - previousAvg >= 15 && !hasBadge('comeback_award', 'special')) {
        await awardBadge(supabase, userId, 'comeback_award', 'special', { 
          improvement: Math.round(currentAvg - previousAvg),
          currentAvg: Math.round(currentAvg),
          previousAvg: Math.round(previousAvg)
        });
        newBadges.push('Comeback Award');
      }
    }
  }

  return newBadges;
}

async function awardBadge(supabase: any, userId: string, type: string, level: string, data: any) {
  await supabase.from('user_badges').insert({
    user_id: userId,
    badge_type: type,
    badge_level: level,
    badge_data: data
  });
}