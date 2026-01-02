import { SmartyContext } from "@/hooks/useSmartyContext";

export interface QuestionAnswers {
  time?: number;
  energy?: number;
  goal?: string;
  soreness?: number;
  equipment?: string;
  program_check?: string;
}

export interface ContentItem {
  id: string;
  name: string;
  category: string;
  difficulty: string | null;
  duration: string | null;
  equipment: string | null;
  format?: string | null;
  image_url?: string | null;
  description?: string | null;
  is_premium?: boolean;
  type?: string; // For workouts: the type field
}

export interface ScoredContent {
  item: ContentItem;
  score: number;
  reasons: string[];
}

// Map user goals to relevant categories
const GOAL_CATEGORY_MAP: Record<string, string[]> = {
  fat_loss: ['CALORIE BURNING', 'METABOLIC', 'CARDIO', 'WEIGHT LOSS', 'HIIT'],
  muscle_gain: ['STRENGTH', 'MUSCLE HYPERTROPHY', 'FUNCTIONAL STRENGTH', 'RESISTANCE'],
  strength: ['STRENGTH', 'FUNCTIONAL STRENGTH', 'POWERLIFTING'],
  endurance: ['CARDIO', 'CARDIO ENDURANCE', 'METABOLIC', 'RUNNING'],
  flexibility: ['MOBILITY & STABILITY', 'PILATES', 'RECOVERY', 'STRETCHING', 'YOGA'],
  recovery: ['RECOVERY', 'MOBILITY & STABILITY', 'PILATES', 'STRETCHING'],
  general_fitness: [], // All categories acceptable
};

// Categories that are calming/recovery focused
const RECOVERY_CATEGORIES = ['RECOVERY', 'MOBILITY & STABILITY', 'PILATES', 'STRETCHING', 'YOGA'];

// Categories that are challenging
const CHALLENGE_CATEGORIES = ['CHALLENGE', 'METABOLIC', 'STRENGTH', 'HIIT', 'ADVANCED'];

export const calculateScore = (
  item: ContentItem,
  context: SmartyContext,
  answers: QuestionAnswers
): ScoredContent => {
  let score = 0;
  const reasons: string[] = [];

  // 1. GOAL ALIGNMENT (+30 max)
  const userGoal = answers.goal || context.userGoal?.primary_goal || 'general_fitness';
  const targetCategories = GOAL_CATEGORY_MAP[userGoal] || [];
  const goalLabel = userGoal.replace(/_/g, ' ');
  
  if (targetCategories.length === 0) {
    score += 15;
    reasons.push('A solid choice for overall fitness');
  } else if (targetCategories.some(cat => item.category?.toUpperCase().includes(cat))) {
    score += 30;
    reasons.push(`Your goal is ${goalLabel} — this ${item.category} workout is designed for exactly that`);
  }

  // 2. ENERGY/READINESS ALIGNMENT (+25 max)
  const readiness = context.todayCheckin?.readiness_score || answers.energy || 3;
  const energyLabel = readiness <= 2 ? 'low' : readiness >= 4 ? 'high' : 'moderate';
  
  if (readiness <= 2) {
    if (item.difficulty === 'Beginner') {
      score += 25;
      reasons.push(`Your energy is ${energyLabel} today — this Beginner workout won't drain you`);
    }
    if (RECOVERY_CATEGORIES.some(cat => item.category?.toUpperCase().includes(cat))) {
      score += 20;
      reasons.push('A recovery-focused session to match your energy');
    }
    if (item.difficulty === 'Advanced') {
      score -= 15;
    }
  } else if (readiness >= 4) {
    if (item.difficulty === 'Advanced') {
      score += 20;
      reasons.push(`Energy is ${energyLabel} — you can handle this Advanced workout`);
    }
    if (CHALLENGE_CATEGORIES.some(cat => item.category?.toUpperCase().includes(cat))) {
      score += 15;
      reasons.push('A challenging workout to match your energy level');
    }
  } else {
    if (item.difficulty === 'Intermediate') {
      score += 15;
      reasons.push(`Energy is ${energyLabel} — Intermediate difficulty is just right`);
    }
  }

  // 3. MOOD CONSIDERATION (+15 max)
  const mood = context.todayCheckin?.mood_rating;
  if (mood && mood <= 2) {
    if (RECOVERY_CATEGORIES.some(cat => item.category?.toUpperCase().includes(cat))) {
      score += 15;
      reasons.push('A calming session to ease your mind');
    }
    if (CHALLENGE_CATEGORIES.some(cat => item.category?.toUpperCase().includes(cat)) && readiness >= 3) {
      score += 10;
      reasons.push('A challenge can boost your mood');
    }
  }

  // 4. VARIETY BONUS (+15 max)
  const recentCategories = context.recentCategories || [];
  const categoryCount = recentCategories.filter(c => 
    c?.toUpperCase() === item.category?.toUpperCase()
  ).length;
  
  if (categoryCount === 0) {
    score += 15;
    const daysSinceCategory = 7; // Approximate
    reasons.push(`You haven't done ${item.category} recently — adds variety`);
  } else if (categoryCount <= 1) {
    score += 10;
  } else if (categoryCount >= 3) {
    score -= 10;
  }

  // 5. FRESHNESS - Not done this workout before (+10)
  if (!context.completedWorkoutIds.includes(item.id)) {
    score += 10;
    reasons.push("You haven't tried this one yet");
  }

  // 6. TIME FIT (+20 max)
  const availableTime = answers.time || context.userGoal?.time_availability_default || 30;
  if (item.duration) {
    const durationMatch = item.duration.match(/(\d+)/);
    const itemDuration = durationMatch ? parseInt(durationMatch[1]) : 30;
    
    if (itemDuration <= availableTime) {
      score += 20;
      reasons.push(`Fits your ${availableTime} min window perfectly`);
    } else if (itemDuration <= availableTime + 10) {
      score += 10;
    } else {
      score -= 20;
    }
  }

  // 7. EQUIPMENT MATCH (+15)
  const userEquipment = answers.equipment || context.userGoal?.equipment_available || 'various';
  if (item.equipment) {
    const itemEquip = item.equipment.toUpperCase();
    if (userEquipment === 'bodyweight' && itemEquip === 'BODYWEIGHT') {
      score += 15;
      reasons.push('No equipment needed — bodyweight only');
    } else if (userEquipment === 'equipment' && itemEquip !== 'BODYWEIGHT') {
      score += 15;
      reasons.push('Uses the equipment you have');
    } else if (userEquipment === 'various') {
      score += 10;
    } else if (userEquipment === 'bodyweight' && itemEquip !== 'BODYWEIGHT') {
      score -= 20;
    }
  }

  // 8. SORENESS CONSIDERATION (+15)
  const soreness = answers.soreness || context.todayCheckin?.soreness_rating;
  if (soreness && soreness >= 4) {
    if (RECOVERY_CATEGORIES.some(cat => item.category?.toUpperCase().includes(cat))) {
      score += 15;
      reasons.push('Gentle on your sore muscles');
    }
    if (item.difficulty === 'Beginner') {
      score += 10;
    }
    if (item.difficulty === 'Advanced') {
      score -= 15;
    }
  }

  // 9. SLEEP CONSIDERATION (+10)
  const sleepHours = context.todayCheckin?.sleep_hours;
  if (sleepHours && sleepHours < 6) {
    if (item.difficulty === 'Beginner') {
      score += 10;
      reasons.push(`Only ${sleepHours}h sleep — a lighter workout is smarter`);
    }
    if (RECOVERY_CATEGORIES.some(cat => item.category?.toUpperCase().includes(cat))) {
      score += 10;
    }
    if (item.difficulty === 'Advanced') {
      score -= 10;
    }
  }

  // 10. COMING BACK BONUS (+10)
  if (context.daysSinceLastWorkout >= 3 && context.daysSinceLastWorkout < 999) {
    if (item.difficulty === 'Beginner' || item.difficulty === 'Intermediate') {
      score += 10;
      reasons.push(`${context.daysSinceLastWorkout} days since your last workout — this eases you back in`);
    }
  }

  return { item, score, reasons };
};

export const generateSuggestions = (
  allContent: ContentItem[],
  context: SmartyContext,
  answers: QuestionAnswers,
  contentType: 'workout' | 'program' = 'workout'
): { main: ScoredContent } => {
  let pool = [...allContent];

  // Apply hard filter: equipment if bodyweight only
  const userEquipment = answers.equipment || context.userGoal?.equipment_available;
  if (userEquipment === 'bodyweight') {
    pool = pool.filter(item => 
      !item.equipment || item.equipment.toUpperCase() === 'BODYWEIGHT'
    );
  }

  // Apply hard filter: time constraint
  const availableTime = answers.time || context.userGoal?.time_availability_default;
  if (availableTime) {
    pool = pool.filter(item => {
      if (!item.duration) return true;
      const durationMatch = item.duration.match(/(\d+)/);
      const itemDuration = durationMatch ? parseInt(durationMatch[1]) : 30;
      return itemDuration <= availableTime + 15;
    });
  }

  // Score all remaining content
  const scored = pool.map(item => calculateScore(item, context, answers));
  
  // Sort by score descending
  const sorted = scored.sort((a, b) => b.score - a.score);

  // Return only the top suggestion
  const main = sorted[0] || { item: pool[0], score: 0, reasons: [] };

  return { main };
};
