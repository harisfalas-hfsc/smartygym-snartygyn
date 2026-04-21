/**
 * Centralized route helpers for Smarty Coach suggestions.
 * Ensures all navigation targets resolve to valid app routes.
 */

const PROGRAM_CATEGORY_SLUG_MAP: Record<string, string> = {
  'CARDIO ENDURANCE': 'cardio-endurance',
  'CARDIO': 'cardio-endurance',
  'FUNCTIONAL STRENGTH': 'functional-strength',
  'MUSCLE HYPERTROPHY': 'muscle-hypertrophy',
  'HYPERTROPHY': 'muscle-hypertrophy',
  'WEIGHT LOSS': 'weight-loss',
  'LOW BACK PAIN': 'low-back-pain',
  'MOBILITY & STABILITY': 'mobility-stability',
  'MOBILITY AND STABILITY': 'mobility-stability',
  'MOBILITY': 'mobility-stability',
};

const WORKOUT_CATEGORY_SLUG_MAP: Record<string, string> = {
  'STRENGTH': 'strength',
  'CALORIE BURNING': 'calorie-burning',
  'METABOLIC': 'metabolic',
  'CARDIO': 'cardio',
  'MOBILITY & STABILITY': 'mobility',
  'MOBILITY AND STABILITY': 'mobility',
  'CHALLENGE': 'challenge',
  'PILATES': 'pilates',
  'RECOVERY': 'recovery',
  'MICRO-WORKOUTS': 'micro-workouts',
};

export const getProgramUrl = (category: string, id: string): string => {
  const upper = category?.toUpperCase().trim() || '';
  const slug = PROGRAM_CATEGORY_SLUG_MAP[upper]
    || category?.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '-').replace(/--+/g, '-') || 'general';
  return `/trainingprogram/${slug}/${id}`;
};

export const getWorkoutUrl = (category: string, id: string): string => {
  const upper = category?.toUpperCase().trim() || '';
  const slug = WORKOUT_CATEGORY_SLUG_MAP[upper]
    || category?.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and') || 'strength';
  return `/workout/${slug}/${id}`;
};

export const getArticleUrl = (slug: string): string => {
  return `/blog/${slug}`;
};