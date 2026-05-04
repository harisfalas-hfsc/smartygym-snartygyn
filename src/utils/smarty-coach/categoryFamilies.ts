// Coaching-aware category families. Order matters: earlier = stronger fallback.
export const PROGRAM_CATEGORY_FAMILIES: Record<string, string[]> = {
  weight_loss: ['WEIGHT LOSS', 'CALORIE BURNING', 'METABOLIC', 'HIIT', 'TABATA', 'CARDIO ENDURANCE', 'CARDIO'],
  cardio_endurance: ['CARDIO ENDURANCE', 'CARDIO', 'METABOLIC'],
  functional_strength: ['FUNCTIONAL STRENGTH', 'STRENGTH', 'POWER'],
  muscle_hypertrophy: ['MUSCLE HYPERTROPHY', 'HYPERTROPHY', 'STRENGTH'],
  low_back_pain: ['LOW BACK PAIN', 'BACK PAIN', 'MOBILITY & STABILITY', 'MOBILITY'],
  mobility_stability: ['MOBILITY & STABILITY', 'MOBILITY AND STABILITY', 'MOBILITY', 'PILATES', 'RECOVERY', 'STRETCHING'],
};

export const WORKOUT_CATEGORY_FAMILIES: Record<string, string[]> = {
  fat_loss: ['CALORIE BURNING', 'METABOLIC', 'HIIT', 'TABATA', 'CARDIO', 'CARDIO ENDURANCE', 'WEIGHT LOSS'],
  muscle_gain: ['MUSCLE HYPERTROPHY', 'HYPERTROPHY', 'STRENGTH', 'RESISTANCE', 'FUNCTIONAL STRENGTH'],
  strength: ['STRENGTH', 'FUNCTIONAL STRENGTH', 'POWER', 'MUSCLE HYPERTROPHY'],
  endurance: ['CARDIO ENDURANCE', 'CARDIO', 'METABOLIC', 'HIIT'],
  flexibility: ['MOBILITY & STABILITY', 'MOBILITY', 'PILATES', 'RECOVERY', 'STRETCHING'],
  general_fitness: ['FUNCTIONAL STRENGTH', 'METABOLIC', 'CARDIO', 'STRENGTH'],
  recovery: ['RECOVERY', 'PILATES', 'MOBILITY & STABILITY', 'STRETCHING'],
};

export const GOAL_LABELS: Record<string, string> = {
  // program
  cardio_endurance: 'cardio endurance',
  functional_strength: 'functional strength',
  muscle_hypertrophy: 'muscle building',
  weight_loss: 'weight loss',
  low_back_pain: 'back care',
  mobility_stability: 'mobility & stability',
  // workout
  fat_loss: 'fat loss',
  muscle_gain: 'muscle building',
  strength: 'strength',
  endurance: 'endurance',
  flexibility: 'mobility & flexibility',
  general_fitness: 'general fitness',
  recovery: 'recovery',
};

/**
 * Returns the family rank index for a category against a goal.
 * 0 = exact match (best). Higher = weaker fallback. -1 = not in family.
 */
export const familyRank = (
  families: Record<string, string[]>,
  goal: string,
  itemCategoryUpper: string,
): number => {
  const fam = families[goal] || [];
  for (let i = 0; i < fam.length; i++) {
    if (itemCategoryUpper.includes(fam[i])) return i;
  }
  return -1;
};
