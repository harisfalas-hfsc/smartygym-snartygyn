import { SmartyContext } from "@/hooks/useSmartyContext";
import { ContentItem } from "./suggestionEngine";

export interface SmartNote {
  message: string;
  type: 'info' | 'caution' | 'encouragement';
}

const RECOVERY_CATEGORIES = ['RECOVERY', 'MOBILITY & STABILITY', 'PILATES', 'STRETCHING', 'YOGA'];

export const generateSmartNote = (
  context: SmartyContext, 
  suggestion: ContentItem
): SmartNote | null => {
  const category = suggestion.category?.toUpperCase() || '';
  
  if (context.todayCheckin?.sleep_hours && context.todayCheckin.sleep_hours < 6) {
    return {
      message: "Sleep was short. A lighter difficulty or recovery session may serve you better.",
      type: 'caution'
    };
  }

  if (context.todayCheckin?.soreness_rating && context.todayCheckin.soreness_rating >= 4) {
    return {
      message: "Soreness is elevated. Consider a recovery or mobility session today.",
      type: 'caution'
    };
  }

  if (context.todayCheckin?.readiness_score && context.todayCheckin.readiness_score <= 2) {
    return {
      message: "Energy is low. A beginner difficulty could help without overloading.",
      type: 'caution'
    };
  }

  if (context.todayCheckin?.mood_rating && context.todayCheckin.mood_rating <= 2) {
    if (RECOVERY_CATEGORIES.some(cat => category.includes(cat))) {
      return {
        message: "A calming session like this may help reset your mood.",
        type: 'encouragement'
      };
    } else {
      return {
        message: "Movement often lifts mood. This could help energize you.",
        type: 'encouragement'
      };
    }
  }

  if (context.daysSinceLastWorkout >= 3 && context.daysSinceLastWorkout < 999) {
    return {
      message: "Welcome back. Starting with lighter intensity is a smart choice.",
      type: 'info'
    };
  }

  const recentCategories = context.recentCategories || [];
  const categoryCount = recentCategories.filter(c => 
    c?.toUpperCase() === category
  ).length;
  
  if (categoryCount >= 3) {
    const allCategories = ['STRENGTH', 'CARDIO', 'RECOVERY', 'MOBILITY & STABILITY', 'METABOLIC', 'PILATES'];
    const differentCategories = allCategories.filter(cat => 
      !recentCategories.some(rc => rc?.toUpperCase().includes(cat))
    );
    
    if (differentCategories.length > 0) {
      return {
        message: `You've done ${suggestion.category} often. Consider ${differentCategories[0]} for variety.`,
        type: 'info'
      };
    }
  }

  if (context.completedWorkoutIds.length === 0) {
    return {
      message: "Great choice for your first workout. You've got this.",
      type: 'encouragement'
    };
  }

  if (context.scheduledWorkouts.length > 0) {
    const today = new Date().toISOString().split('T')[0];
    const todayScheduled = context.scheduledWorkouts.find(sw => sw.scheduled_date === today);
    if (todayScheduled && todayScheduled.content_id !== suggestion.id) {
      return {
        message: `You also have "${todayScheduled.content_name}" scheduled for today.`,
        type: 'info'
      };
    }
  }

  return null;
};