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
  // New category-aligned goals (one per workout category)
  strength: ['STRENGTH', 'FUNCTIONAL STRENGTH', 'POWER', 'MUSCLE HYPERTROPHY'],
  calorie_burning: ['CALORIE BURNING', 'METABOLIC', 'HIIT', 'TABATA', 'CARDIO', 'CARDIO ENDURANCE', 'WEIGHT LOSS'],
  metabolic: ['METABOLIC', 'CALORIE BURNING', 'HIIT', 'TABATA', 'CARDIO'],
  endurance: ['CARDIO', 'CARDIO ENDURANCE', 'METABOLIC', 'HIIT'],
  move_better: ['MOBILITY & STABILITY', 'MOBILITY', 'PILATES', 'STRETCHING', 'RECOVERY'],
  challenge: ['CHALLENGE', 'METABOLIC', 'STRENGTH'],
  regenerate: ['RECOVERY', 'MOBILITY & STABILITY', 'PILATES', 'STRETCHING'],
  // Legacy aliases (kept so saved user goals still resolve)
  fat_loss: ['CALORIE BURNING', 'METABOLIC', 'HIIT', 'TABATA', 'CARDIO', 'CARDIO ENDURANCE', 'WEIGHT LOSS'],
  muscle_gain: ['STRENGTH', 'MUSCLE HYPERTROPHY', 'HYPERTROPHY', 'RESISTANCE', 'FUNCTIONAL STRENGTH'],
  flexibility: ['MOBILITY & STABILITY', 'MOBILITY', 'PILATES', 'STRETCHING', 'RECOVERY'],
  general_fitness: ['FUNCTIONAL STRENGTH', 'METABOLIC', 'CARDIO', 'STRENGTH'],
  recovery: ['RECOVERY', 'MOBILITY & STABILITY', 'PILATES', 'STRETCHING'],
};

export const GOAL_LABELS: Record<string, string> = {
  // program
  cardio_endurance: 'cardio endurance',
  functional_strength: 'functional strength',
  muscle_hypertrophy: 'muscle building',
  weight_loss: 'weight loss',
  low_back_pain: 'back care',
  mobility_stability: 'mobility & stability',
  // workout (category-aligned)
  strength: 'strength',
  calorie_burning: 'calorie burning',
  metabolic: 'metabolic conditioning',
  endurance: 'cardio endurance',
  move_better: 'mobility & movement quality',
  challenge: 'challenge',
  regenerate: 'recovery & regeneration',
  // Legacy aliases
  fat_loss: 'calorie burning',
  muscle_gain: 'strength',
  flexibility: 'mobility & movement quality',
  general_fitness: 'general fitness',
  recovery: 'recovery & regeneration',
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
