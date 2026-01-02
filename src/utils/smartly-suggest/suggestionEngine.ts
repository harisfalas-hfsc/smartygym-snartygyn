import { SmartyContext } from "@/hooks/useSmartyContext";

export interface QuestionAnswers {
  mood?: number;      // 1-5
  energy?: number;    // 0-10
  goal?: string;
  time?: number;      // minutes
  equipment?: string; // 'bodyweight' | 'equipment'
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
  type?: string;
}

export interface ScoredContent {
  item: ContentItem;
  score: number;
  reasons: string[];
}

// Map goals to recommended categories
const GOAL_CATEGORY_MAP: Record<string, string[]> = {
  fat_loss: ['CALORIE BURNING', 'METABOLIC', 'CARDIO', 'HIIT', 'TABATA'],
  muscle_gain: ['STRENGTH', 'MUSCLE HYPERTROPHY', 'RESISTANCE'],
  strength: ['STRENGTH', 'FUNCTIONAL STRENGTH', 'POWER'],
  endurance: ['CARDIO', 'CARDIO ENDURANCE', 'METABOLIC'],
  flexibility: ['MOBILITY & STABILITY', 'PILATES', 'RECOVERY', 'STRETCHING'],
  general_fitness: ['FUNCTIONAL STRENGTH', 'CARDIO', 'METABOLIC'],
  recovery: ['RECOVERY', 'PILATES', 'MOBILITY & STABILITY', 'STRETCHING'],
};

// Categories good for low energy
const LOW_ENERGY_CATEGORIES = ['RECOVERY', 'MOBILITY & STABILITY', 'PILATES', 'STRETCHING'];

// Categories good for high energy and good mood
const HIGH_ENERGY_CATEGORIES = ['CHALLENGE', 'HIIT', 'METABOLIC', 'TABATA', 'STRENGTH'];

// Categories that can help improve mood
const MOOD_BOOST_CATEGORIES = ['CARDIO', 'METABOLIC', 'CALORIE BURNING'];

// Parse duration string to minutes
const parseDuration = (duration: string | null): number | null => {
  if (!duration) return null;
  const match = duration.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
};

// Calculate score for a content item
export const calculateScore = (
  item: ContentItem,
  answers: QuestionAnswers,
  context: SmartyContext
): ScoredContent => {
  let score = 0;
  const reasons: string[] = [];

  const { mood, energy, goal, time, equipment } = answers;
  const categoryUpper = item.category?.toUpperCase() || '';
  const difficultyLower = item.difficulty?.toLowerCase() || 'beginner';
  const itemDuration = parseDuration(item.duration);
  const itemEquipment = item.equipment?.toLowerCase() || '';

  // === EQUIPMENT FILTER (hard constraint) ===
  if (equipment === 'bodyweight') {
    const isBodyweight = itemEquipment.includes('bodyweight') || 
                         itemEquipment.includes('no equipment') || 
                         itemEquipment === '' ||
                         !item.equipment;
    if (!isBodyweight) {
      return { item, score: -1000, reasons: ['Requires equipment'] };
    }
    reasons.push('No equipment needed');
    score += 10;
  }

  // === TIME FILTER (soft constraint) ===
  if (time && itemDuration) {
    const timeDiff = Math.abs(itemDuration - time);
    if (timeDiff <= 5) {
      score += 30;
      reasons.push(`Fits your ${time} min time perfectly`);
    } else if (timeDiff <= 15) {
      score += 15;
      reasons.push(`Close to your ${time} min availability`);
    } else if (itemDuration > time + 15) {
      score -= 20; // Penalize if too long
    }
  }

  // === GOAL ALIGNMENT ===
  if (goal) {
    const goalCategories = GOAL_CATEGORY_MAP[goal] || [];
    const matchesGoal = goalCategories.some(cat => categoryUpper.includes(cat));
    
    if (matchesGoal) {
      score += 40;
      const goalLabels: Record<string, string> = {
        fat_loss: 'fat loss',
        muscle_gain: 'building muscle',
        strength: 'getting stronger',
        endurance: 'endurance',
        flexibility: 'mobility & flexibility',
        general_fitness: 'general fitness',
        recovery: 'recovery',
      };
      reasons.push(`Your goal is ${goalLabels[goal]} — this ${item.category} workout is ideal for that`);
    }
  }

  // === ENERGY-BASED SCORING ===
  if (typeof energy === 'number') {
    // Low energy (0-3): favor recovery/light workouts
    if (energy <= 3) {
      const isLowEnergy = LOW_ENERGY_CATEGORIES.some(cat => categoryUpper.includes(cat));
      if (isLowEnergy) {
        score += 35;
        reasons.push(`Energy is low (${energy}/10) — this ${item.category} workout won't drain you`);
      }
      
      // Also favor beginner difficulty when tired
      if (difficultyLower === 'beginner') {
        score += 20;
        reasons.push('Beginner level protects your energy');
      } else if (difficultyLower === 'advanced') {
        score -= 30; // Penalize advanced when tired
      }
    }
    // Moderate energy (4-6): balanced workouts
    else if (energy <= 6) {
      if (difficultyLower === 'intermediate') {
        score += 15;
        reasons.push(`Energy is moderate (${energy}/10) — Intermediate difficulty is a good match`);
      } else if (difficultyLower === 'beginner') {
        score += 10;
      }
    }
    // High energy (7-10): can handle challenges
    else {
      const isHighEnergy = HIGH_ENERGY_CATEGORIES.some(cat => categoryUpper.includes(cat));
      if (isHighEnergy) {
        score += 30;
        reasons.push(`Energy is high (${energy}/10) — time to challenge yourself!`);
      }
      
      if (difficultyLower === 'advanced') {
        score += 20;
        reasons.push('Advanced level matches your energy');
      } else if (difficultyLower === 'intermediate') {
        score += 10;
      }
    }
  }

  // === MOOD-BASED SCORING ===
  if (typeof mood === 'number') {
    // Low mood (1-2): suggest mood-boosting or calming workouts
    if (mood <= 2) {
      const isMoodBoost = MOOD_BOOST_CATEGORIES.some(cat => categoryUpper.includes(cat));
      const isCalming = LOW_ENERGY_CATEGORIES.some(cat => categoryUpper.includes(cat));
      
      if (isMoodBoost) {
        score += 25;
        reasons.push('Movement can boost your mood — this workout will help');
      } else if (isCalming) {
        score += 20;
        reasons.push('A calming session might be what you need today');
      }
    }
    // Good mood (4-5): can take on more intensity
    else if (mood >= 4) {
      const isChallenge = HIGH_ENERGY_CATEGORIES.some(cat => categoryUpper.includes(cat));
      if (isChallenge && (typeof energy === 'number' && energy >= 6)) {
        score += 15;
        reasons.push('Your positive mood is perfect for this workout');
      }
    }
  }

  // === VARIETY BONUS ===
  const recentCategories = context.recentCategories || [];
  const categoryDone = recentCategories.filter(c => 
    c?.toUpperCase().includes(categoryUpper) || categoryUpper.includes(c?.toUpperCase() || '')
  ).length;
  
  if (categoryDone === 0 && recentCategories.length > 0) {
    score += 15;
    reasons.push(`You haven't done ${item.category} recently — adds variety`);
  }

  // === COMEBACK BONUS ===
  if (context.daysSinceLastWorkout >= 4) {
    if (difficultyLower === 'beginner') {
      score += 10;
      reasons.push(`It's been ${context.daysSinceLastWorkout} days — ease back in`);
    }
  }

  // === NOT COMPLETED BONUS ===
  if (!context.completedWorkoutIds.includes(item.id)) {
    score += 5;
    reasons.push("You haven't tried this one yet");
  }

  return { item, score, reasons };
};

// Generate a single suggestion - returns ScoredContent directly (not wrapped in { main: })
export const generateSuggestions = (
  allContent: ContentItem[],
  context: SmartyContext,
  answers: QuestionAnswers
): ScoredContent | null => {
  if (allContent.length === 0) return null;

  // Score all items
  const scored = allContent.map(item => calculateScore(item, answers, context));

  // Filter out items with very negative scores (hard constraints failed)
  const validItems = scored.filter(s => s.score > -500);

  if (validItems.length === 0) {
    // Fallback: return first item with basic reasons
    return {
      item: allContent[0],
      score: 0,
      reasons: ['Suggested workout for you'],
    };
  }

  // Sort by score descending
  validItems.sort((a, b) => b.score - a.score);

  // Return the top suggestion
  const top = validItems[0];
  
  // Ensure we have at least one reason
  if (top.reasons.length === 0) {
    top.reasons.push('Suggested based on your preferences');
  }

  return top;
};
