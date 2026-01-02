import { SmartyContext } from "./useSmartyContext";

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface ConfidenceResult {
  level: ConfidenceLevel;
  score: number;
  factors: string[];
}

export const useConfidenceLevel = (context: SmartyContext): ConfidenceResult => {
  let score = 0;
  const factors: string[] = [];

  // Has check-in today (+30) or in last 3 days (+15)
  if (context.todayCheckin && context.todayCheckin.morning_completed) {
    score += 30;
    factors.push('Today check-in completed');
  } else if (context.recentCheckins.length > 0) {
    const hasRecentCheckin = context.recentCheckins.some(c => {
      const checkinDate = new Date(c.checkin_date);
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      return checkinDate >= threeDaysAgo && c.morning_completed;
    });
    if (hasRecentCheckin) {
      score += 15;
      factors.push('Recent check-in available');
    }
  }

  // Has completed workouts (+20 for 5+, +10 for 1-4)
  const completedCount = context.completedWorkoutIds.length;
  if (completedCount >= 5) {
    score += 20;
    factors.push('5+ workouts completed');
  } else if (completedCount >= 1) {
    score += 10;
    factors.push('Some workouts completed');
  }

  // Has set a goal (+20)
  if (context.userGoal) {
    score += 20;
    factors.push('Fitness goal set');
  }

  // Recent activity (workout in last 7 days) (+15)
  if (context.daysSinceLastWorkout <= 7) {
    score += 15;
    factors.push('Active in last 7 days');
  }

  // Has ongoing program (+15)
  const hasOngoingProgram = context.programInteractions.some(p => p.is_ongoing);
  if (hasOngoingProgram) {
    score += 15;
    factors.push('Ongoing program');
  }

  // Has scheduled workouts (+10)
  if (context.scheduledWorkouts.length > 0) {
    score += 10;
    factors.push('Scheduled workouts exist');
  }

  // Determine level based on thresholds
  let level: ConfidenceLevel;
  if (score >= 60) {
    level = 'high';
  } else if (score >= 30) {
    level = 'medium';
  } else {
    level = 'low';
  }

  return { level, score, factors };
};
