import { SmartyContext } from "@/hooks/useSmartyContext";
import { ContentItem } from "./suggestionEngine";

export interface SmartNote {
  message: string;
  type: 'info' | 'caution' | 'encouragement';
}

// Categories that are calming/recovery focused
const RECOVERY_CATEGORIES = ['RECOVERY', 'MOBILITY & STABILITY', 'PILATES', 'STRETCHING', 'YOGA'];

export const generateSmartNote = (
  context: SmartyContext, 
  suggestion: ContentItem
): SmartNote | null => {
  const category = suggestion.category?.toUpperCase() || '';
  
  // 1. Low sleep warning
  if (context.todayCheckin?.sleep_hours && context.todayCheckin.sleep_hours < 6) {
    return {
      message: "Sleep was short. A lighter difficulty or recovery session may serve you better.",
      type: 'caution'
    };
  }

  // 2. High soreness
  if (context.todayCheckin?.soreness_rating && context.todayCheckin.soreness_rating >= 4) {
    return {
      message: "Soreness is elevated. Consider a recovery or mobility session today.",
      type: 'caution'
    };
  }

  // 3. Low energy/readiness
  if (context.todayCheckin?.readiness_score && context.todayCheckin.readiness_score <= 2) {
    return {
      message: "Energy is low. A beginner difficulty could help without overloading.",
      type: 'caution'
    };
  }

  // 4. Low mood - provide context based on suggestion
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

  // 5. Coming back after break
  if (context.daysSinceLastWorkout >= 3 && context.daysSinceLastWorkout < 999) {
    return {
      message: "Welcome back. Starting with lighter intensity is a smart choice.",
      type: 'info'
    };
  }

  // 6. Category variety suggestion
  const recentCategories = context.recentCategories || [];
  const categoryCount = recentCategories.filter(c => 
    c?.toUpperCase() === category
  ).length;
  
  if (categoryCount >= 3) {
    // Find a category not recently done
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

  // 7. Active program reminder
  const ongoingProgram = context.programInteractions.find(p => p.is_ongoing);
  if (ongoingProgram && suggestion.type !== 'program') {
    return {
      message: `${ongoingProgram.program_name} is ready when you want to continue.`,
      type: 'info'
    };
  }

  // 8. First workout encouragement
  if (context.completedWorkoutIds.length === 0) {
    return {
      message: "Great choice for your first workout. You've got this.",
      type: 'encouragement'
    };
  }

  // 9. Scheduled workout reminder
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

  return null; // No note needed
};
