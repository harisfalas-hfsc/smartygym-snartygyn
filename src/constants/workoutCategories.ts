// Centralized workout categories - single source of truth for admin and public
export const WORKOUT_CATEGORIES = [
  "STRENGTH",
  "CALORIE BURNING",
  "METABOLIC",
  "CARDIO",
  "MOBILITY & STABILITY",
  "CHALLENGE",
  "PILATES",
  "RECOVERY",
  "MICRO-WORKOUTS"
] as const;

export type WorkoutCategory = typeof WORKOUT_CATEGORIES[number];

// Difficulty levels including "All Levels"
export const DIFFICULTY_OPTIONS = [
  { value: 0, label: "All Levels", stars: 0 },
  { value: 1, label: "Beginner (1★)", stars: 1 },
  { value: 2, label: "Beginner (2★)", stars: 2 },
  { value: 3, label: "Intermediate (3★)", stars: 3 },
  { value: 4, label: "Intermediate (4★)", stars: 4 },
  { value: 5, label: "Advanced (5★)", stars: 5 },
  { value: 6, label: "Advanced (6★)", stars: 6 },
] as const;

// Helper to get difficulty text from stars
export const getDifficultyFromStars = (stars: number | null | undefined): string => {
  if (stars === null || stars === undefined || stars === 0) return "All Levels";
  if (stars <= 2) return "Beginner";
  if (stars <= 4) return "Intermediate";
  return "Advanced";
};

// Category label mapping for display
export const CATEGORY_LABELS: Record<string, string> = {
  'STRENGTH': 'Strength',
  'CALORIE BURNING': 'Calorie Burning',
  'METABOLIC': 'Metabolic',
  'CARDIO': 'Cardio',
  'CARDIO ENDURANCE': 'Cardio Endurance',
  'MOBILITY & STABILITY': 'Mobility & Stability',
  'CHALLENGE': 'Challenge',
  'PILATES': 'Pilates',
  'RECOVERY': 'Recovery',
  'MICRO-WORKOUTS': 'Micro-Workouts',
  // Lowercase versions for focus field
  'strength': 'Strength',
  'calorie-burning': 'Calorie Burning',
  'metabolic': 'Metabolic',
  'cardio': 'Cardio',
  'cardio-endurance': 'Cardio Endurance',
  'mobility-stability': 'Mobility & Stability',
  'challenge': 'Challenge',
  'pilates': 'Pilates',
  'recovery': 'Recovery',
  'micro-workouts': 'Micro-Workouts',
};

export const getCategoryLabel = (category: string | undefined | null): string => {
  if (!category) return '';
  return CATEGORY_LABELS[category] || category;
};
