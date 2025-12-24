/**
 * WOD Cycle Utilities - Simple 84-Day Periodization Cycle
 * 
 * CRITICAL: This file is the SINGLE SOURCE OF TRUTH for WOD cycle calculations.
 * 
 * Simple 84-day cycle: Day 1 to Day 84, then restart.
 * Each day has a fixed category AND difficulty - no complex rotation logic.
 * Reference date: December 24, 2024 = Day 1 (CARDIO/Beginner)
 */

// Reference date: November 25, 2025 = Day 1 (so December 24, 2025 = Day 30)
export const CYCLE_START_DATE = '2025-11-25';

// FORMAT RULES BY CATEGORY (STRICT)
export const FORMATS_BY_CATEGORY: Record<string, string[]> = {
  "STRENGTH": ["REPS & SETS"],
  "MOBILITY & STABILITY": ["REPS & SETS"],
  "PILATES": ["REPS & SETS"],
  "CARDIO": ["CIRCUIT", "EMOM", "FOR TIME", "AMRAP", "TABATA"],
  "METABOLIC": ["CIRCUIT", "AMRAP", "EMOM", "FOR TIME", "TABATA"],
  "CALORIE BURNING": ["CIRCUIT", "TABATA", "AMRAP", "FOR TIME", "EMOM"],
  "CHALLENGE": ["CIRCUIT", "TABATA", "AMRAP", "EMOM", "FOR TIME", "MIX"],
  "RECOVERY": ["CIRCUIT", "REPS & SETS"]
};

// All valid categories
export const ALL_CATEGORIES = [
  "CARDIO",
  "STRENGTH", 
  "MOBILITY & STABILITY",
  "CHALLENGE",
  "PILATES",
  "CALORIE BURNING",
  "METABOLIC",
  "RECOVERY"
] as const;

/**
 * STRENGTH CATEGORY FOCUS BY CYCLE DAY (within each 28-day block)
 */
export const STRENGTH_DAY_FOCUS: Record<number, {
  focus: string;
  description: string;
  muscleGroups: string[];
  movementPatterns: string[];
}> = {
  2: {
    focus: "LOWER BODY",
    description: "Quads, hamstrings, calves, glutes, adductors, abductors",
    muscleGroups: ["quads", "hamstrings", "calves", "glutes", "adductors", "abductors"],
    movementPatterns: ["squats", "lunges", "leg press", "hip thrusts", "leg curls", "leg extensions", "calf work", "step-ups"]
  },
  5: {
    focus: "UPPER BODY",
    description: "Chest, back, shoulders, biceps, triceps",
    muscleGroups: ["chest", "back", "shoulders", "biceps", "triceps"],
    movementPatterns: ["pressing", "pulling", "curls", "extensions", "rows", "flys", "pulldowns"]
  },
  12: {
    focus: "FULL BODY",
    description: "Upper + Lower + Core combination",
    muscleGroups: ["full body", "compound movements"],
    movementPatterns: ["upper push", "upper pull", "lower push", "lower pull", "core"]
  },
  15: {
    focus: "LOW PUSH & UPPER PULL",
    description: "Lower body pushing patterns + Upper body pulling patterns",
    muscleGroups: ["quads", "glutes", "back", "biceps", "rear delts"],
    movementPatterns: ["squats", "lunges", "leg press", "step-ups", "rows", "pull-ups", "pulldowns", "curls", "face pulls"]
  },
  20: {
    focus: "LOW PULL & UPPER PUSH",
    description: "Lower body pulling patterns + Upper body pushing patterns",
    muscleGroups: ["hamstrings", "glutes", "chest", "shoulders", "triceps"],
    movementPatterns: ["deadlifts", "RDLs", "leg curls", "hip hinges", "bench press", "shoulder press", "push-ups", "tricep work", "dips"]
  },
  23: {
    focus: "CORE & GLUTES",
    description: "Core stability + Glute-focused exercises",
    muscleGroups: ["core", "glutes", "hip stabilizers"],
    movementPatterns: ["anti-rotation", "planks", "dead bugs", "pallof press", "hip thrusts", "glute bridges", "banded work", "kickbacks"]
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPLETE 84-DAY PERIODIZATION - Pre-computed, no rotation logic needed
// Days 1-28 = Cycle 1, Days 29-56 = Cycle 2, Days 57-84 = Cycle 3
// ═══════════════════════════════════════════════════════════════════════════════
export const PERIODIZATION_84DAY: Array<{
  day: number; // 1-84
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | null;
  difficultyStars: [number, number] | null;
  strengthFocus?: string;
}> = [
  // ═══ CYCLE 1 (Days 1-28) ═══
  { day: 1,  category: "CARDIO",              difficulty: "Beginner",     difficultyStars: [1, 2] },
  { day: 2,  category: "STRENGTH",            difficulty: "Advanced",     difficultyStars: [5, 6], strengthFocus: "LOWER BODY" },
  { day: 3,  category: "MOBILITY & STABILITY", difficulty: "Intermediate", difficultyStars: [3, 4] },
  { day: 4,  category: "CHALLENGE",           difficulty: "Advanced",     difficultyStars: [5, 6] },
  { day: 5,  category: "STRENGTH",            difficulty: "Intermediate", difficultyStars: [3, 4], strengthFocus: "UPPER BODY" },
  { day: 6,  category: "PILATES",             difficulty: "Advanced",     difficultyStars: [5, 6] },
  { day: 7,  category: "CALORIE BURNING",     difficulty: "Intermediate", difficultyStars: [3, 4] },
  { day: 8,  category: "METABOLIC",           difficulty: "Beginner",     difficultyStars: [1, 2] },
  { day: 9,  category: "CHALLENGE",           difficulty: "Advanced",     difficultyStars: [5, 6] },
  { day: 10, category: "RECOVERY",            difficulty: null,           difficultyStars: null },
  { day: 11, category: "CARDIO",              difficulty: "Intermediate", difficultyStars: [3, 4] },
  { day: 12, category: "STRENGTH",            difficulty: "Advanced",     difficultyStars: [5, 6], strengthFocus: "FULL BODY" },
  { day: 13, category: "MOBILITY & STABILITY", difficulty: "Advanced",     difficultyStars: [5, 6] },
  { day: 14, category: "CHALLENGE",           difficulty: "Intermediate", difficultyStars: [3, 4] },
  { day: 15, category: "STRENGTH",            difficulty: "Beginner",     difficultyStars: [1, 2], strengthFocus: "LOW PUSH & UPPER PULL" },
  { day: 16, category: "PILATES",             difficulty: "Beginner",     difficultyStars: [1, 2] },
  { day: 17, category: "CALORIE BURNING",     difficulty: "Advanced",     difficultyStars: [5, 6] },
  { day: 18, category: "METABOLIC",           difficulty: "Intermediate", difficultyStars: [3, 4] },
  { day: 19, category: "CARDIO",              difficulty: "Advanced",     difficultyStars: [5, 6] },
  { day: 20, category: "STRENGTH",            difficulty: "Intermediate", difficultyStars: [3, 4], strengthFocus: "LOW PULL & UPPER PUSH" },
  { day: 21, category: "MOBILITY & STABILITY", difficulty: "Beginner",     difficultyStars: [1, 2] },
  { day: 22, category: "CHALLENGE",           difficulty: "Intermediate", difficultyStars: [3, 4] },
  { day: 23, category: "STRENGTH",            difficulty: "Advanced",     difficultyStars: [5, 6], strengthFocus: "CORE & GLUTES" },
  { day: 24, category: "PILATES",             difficulty: "Intermediate", difficultyStars: [3, 4] },
  { day: 25, category: "CALORIE BURNING",     difficulty: "Beginner",     difficultyStars: [1, 2] },
  { day: 26, category: "METABOLIC",           difficulty: "Advanced",     difficultyStars: [5, 6] },
  { day: 27, category: "CHALLENGE",           difficulty: "Intermediate", difficultyStars: [3, 4] },
  { day: 28, category: "RECOVERY",            difficulty: null,           difficultyStars: null },

  // ═══ CYCLE 2 (Days 29-56) - Strength days rotate difficulty ═══
  { day: 29, category: "CARDIO",              difficulty: "Beginner",     difficultyStars: [1, 2] },
  { day: 30, category: "STRENGTH",            difficulty: "Intermediate", difficultyStars: [3, 4], strengthFocus: "LOWER BODY" },
  { day: 31, category: "MOBILITY & STABILITY", difficulty: "Intermediate", difficultyStars: [3, 4] },
  { day: 32, category: "CHALLENGE",           difficulty: "Advanced",     difficultyStars: [5, 6] },
  { day: 33, category: "STRENGTH",            difficulty: "Beginner",     difficultyStars: [1, 2], strengthFocus: "UPPER BODY" },
  { day: 34, category: "PILATES",             difficulty: "Advanced",     difficultyStars: [5, 6] },
  { day: 35, category: "CALORIE BURNING",     difficulty: "Intermediate", difficultyStars: [3, 4] },
  { day: 36, category: "METABOLIC",           difficulty: "Beginner",     difficultyStars: [1, 2] },
  { day: 37, category: "CHALLENGE",           difficulty: "Advanced",     difficultyStars: [5, 6] },
  { day: 38, category: "RECOVERY",            difficulty: null,           difficultyStars: null },
  { day: 39, category: "CARDIO",              difficulty: "Intermediate", difficultyStars: [3, 4] },
  { day: 40, category: "STRENGTH",            difficulty: "Beginner",     difficultyStars: [1, 2], strengthFocus: "FULL BODY" },
  { day: 41, category: "MOBILITY & STABILITY", difficulty: "Advanced",     difficultyStars: [5, 6] },
  { day: 42, category: "CHALLENGE",           difficulty: "Intermediate", difficultyStars: [3, 4] },
  { day: 43, category: "STRENGTH",            difficulty: "Advanced",     difficultyStars: [5, 6], strengthFocus: "LOW PUSH & UPPER PULL" },
  { day: 44, category: "PILATES",             difficulty: "Beginner",     difficultyStars: [1, 2] },
  { day: 45, category: "CALORIE BURNING",     difficulty: "Advanced",     difficultyStars: [5, 6] },
  { day: 46, category: "METABOLIC",           difficulty: "Intermediate", difficultyStars: [3, 4] },
  { day: 47, category: "CARDIO",              difficulty: "Advanced",     difficultyStars: [5, 6] },
  { day: 48, category: "STRENGTH",            difficulty: "Beginner",     difficultyStars: [1, 2], strengthFocus: "LOW PULL & UPPER PUSH" },
  { day: 49, category: "MOBILITY & STABILITY", difficulty: "Beginner",     difficultyStars: [1, 2] },
  { day: 50, category: "CHALLENGE",           difficulty: "Intermediate", difficultyStars: [3, 4] },
  { day: 51, category: "STRENGTH",            difficulty: "Intermediate", difficultyStars: [3, 4], strengthFocus: "CORE & GLUTES" },
  { day: 52, category: "PILATES",             difficulty: "Intermediate", difficultyStars: [3, 4] },
  { day: 53, category: "CALORIE BURNING",     difficulty: "Beginner",     difficultyStars: [1, 2] },
  { day: 54, category: "METABOLIC",           difficulty: "Advanced",     difficultyStars: [5, 6] },
  { day: 55, category: "CHALLENGE",           difficulty: "Intermediate", difficultyStars: [3, 4] },
  { day: 56, category: "RECOVERY",            difficulty: null,           difficultyStars: null },

  // ═══ CYCLE 3 (Days 57-84) - Strength days rotate difficulty again ═══
  { day: 57, category: "CARDIO",              difficulty: "Beginner",     difficultyStars: [1, 2] },
  { day: 58, category: "STRENGTH",            difficulty: "Beginner",     difficultyStars: [1, 2], strengthFocus: "LOWER BODY" },
  { day: 59, category: "MOBILITY & STABILITY", difficulty: "Intermediate", difficultyStars: [3, 4] },
  { day: 60, category: "CHALLENGE",           difficulty: "Advanced",     difficultyStars: [5, 6] },
  { day: 61, category: "STRENGTH",            difficulty: "Advanced",     difficultyStars: [5, 6], strengthFocus: "UPPER BODY" },
  { day: 62, category: "PILATES",             difficulty: "Advanced",     difficultyStars: [5, 6] },
  { day: 63, category: "CALORIE BURNING",     difficulty: "Intermediate", difficultyStars: [3, 4] },
  { day: 64, category: "METABOLIC",           difficulty: "Beginner",     difficultyStars: [1, 2] },
  { day: 65, category: "CHALLENGE",           difficulty: "Advanced",     difficultyStars: [5, 6] },
  { day: 66, category: "RECOVERY",            difficulty: null,           difficultyStars: null },
  { day: 67, category: "CARDIO",              difficulty: "Intermediate", difficultyStars: [3, 4] },
  { day: 68, category: "STRENGTH",            difficulty: "Intermediate", difficultyStars: [3, 4], strengthFocus: "FULL BODY" },
  { day: 69, category: "MOBILITY & STABILITY", difficulty: "Advanced",     difficultyStars: [5, 6] },
  { day: 70, category: "CHALLENGE",           difficulty: "Intermediate", difficultyStars: [3, 4] },
  { day: 71, category: "STRENGTH",            difficulty: "Intermediate", difficultyStars: [3, 4], strengthFocus: "LOW PUSH & UPPER PULL" },
  { day: 72, category: "PILATES",             difficulty: "Beginner",     difficultyStars: [1, 2] },
  { day: 73, category: "CALORIE BURNING",     difficulty: "Advanced",     difficultyStars: [5, 6] },
  { day: 74, category: "METABOLIC",           difficulty: "Intermediate", difficultyStars: [3, 4] },
  { day: 75, category: "CARDIO",              difficulty: "Advanced",     difficultyStars: [5, 6] },
  { day: 76, category: "STRENGTH",            difficulty: "Advanced",     difficultyStars: [5, 6], strengthFocus: "LOW PULL & UPPER PUSH" },
  { day: 77, category: "MOBILITY & STABILITY", difficulty: "Beginner",     difficultyStars: [1, 2] },
  { day: 78, category: "CHALLENGE",           difficulty: "Intermediate", difficultyStars: [3, 4] },
  { day: 79, category: "STRENGTH",            difficulty: "Beginner",     difficultyStars: [1, 2], strengthFocus: "CORE & GLUTES" },
  { day: 80, category: "PILATES",             difficulty: "Intermediate", difficultyStars: [3, 4] },
  { day: 81, category: "CALORIE BURNING",     difficulty: "Beginner",     difficultyStars: [1, 2] },
  { day: 82, category: "METABOLIC",           difficulty: "Advanced",     difficultyStars: [5, 6] },
  { day: 83, category: "CHALLENGE",           difficulty: "Intermediate", difficultyStars: [3, 4] },
  { day: 84, category: "RECOVERY",            difficulty: null,           difficultyStars: null },
];

/**
 * Get day in 84-day cycle (1-84) from a date string
 */
export const getDayIn84Cycle = (dateStr: string): number => {
  const startDate = new Date(CYCLE_START_DATE + 'T00:00:00Z');
  const targetDate = new Date(dateStr + 'T00:00:00Z');
  const daysDiff = Math.floor((targetDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
  const normalizedDays = ((daysDiff % 84) + 84) % 84;
  return normalizedDays + 1; // 1-84
};

/**
 * Get periodization info for a specific day (1-84)
 */
export const getPeriodizationForDay = (dayIn84: number): typeof PERIODIZATION_84DAY[0] => {
  const index = Math.max(0, Math.min(83, dayIn84 - 1));
  return PERIODIZATION_84DAY[index];
};

/**
 * Get category for a specific day (1-84)
 */
export const getCategoryForDay = (dayIn84: number): string => {
  return getPeriodizationForDay(dayIn84).category;
};

/**
 * Get category directly from a date string
 */
export const getCategoryForDate = (dateStr: string): string => {
  const dayIn84 = getDayIn84Cycle(dateStr);
  return getCategoryForDay(dayIn84);
};

/**
 * Get difficulty info for a specific day (1-84)
 */
export const getDifficultyForDay = (dayIn84: number): { 
  level: string | null; 
  range: [number, number] | null;
} => {
  const periodization = getPeriodizationForDay(dayIn84);
  return {
    level: periodization.difficulty,
    range: periodization.difficultyStars
  };
};

/**
 * Get difficulty info directly from a date string
 */
export const getDifficultyForDate = (dateStr: string): { 
  level: string | null; 
  range: [number, number] | null;
} => {
  const dayIn84 = getDayIn84Cycle(dateStr);
  return getDifficultyForDay(dayIn84);
};

/**
 * Get full WOD info for a date - Simple 84-day lookup
 */
export const getWODInfoForDate = (dateStr: string): {
  dayIn84: number;
  category: string;
  difficulty: { level: string | null; range: [number, number] | null };
  formats: string[];
  isRecoveryDay: boolean;
  strengthFocus?: string;
} => {
  const dayIn84 = getDayIn84Cycle(dateStr);
  const periodization = getPeriodizationForDay(dayIn84);
  const category = periodization.category;
  const difficulty = getDifficultyForDay(dayIn84);
  const formats = FORMATS_BY_CATEGORY[category] || ["CIRCUIT"];
  const isRecoveryDay = category === "RECOVERY";
  
  return {
    dayIn84,
    category,
    difficulty,
    formats,
    isRecoveryDay,
    strengthFocus: periodization.strengthFocus
  };
};

/**
 * Get difficulty badge class based on level
 */
export const getDifficultyBadgeClass = (level: string | null): string => {
  if (!level) return "bg-blue-500/20 text-blue-400 border-blue-500/30";
  if (level === "Beginner") return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30";
  if (level === "Intermediate") return "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30";
  return "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30";
};

/**
 * Get difficulty border class based on level
 */
export const getDifficultyBorderClass = (level: string | null): string => {
  if (!level) return "border-blue-500";
  if (level === "Beginner") return "border-yellow-500";
  if (level === "Intermediate") return "border-green-500";
  return "border-red-500";
};

/**
 * Convert star rating to difficulty level
 */
export const starsToLevel = (stars: number): string => {
  if (stars <= 2) return "Beginner";
  if (stars <= 4) return "Intermediate";
  return "Advanced";
};

/**
 * Get a random star from the difficulty range
 */
export const getRandomStarFromRange = (range: [number, number] | null): number => {
  if (!range) return 1;
  return Math.random() < 0.5 ? range[0] : range[1];
};

/**
 * Calculate upcoming schedule for preview (N days)
 */
export const getUpcomingSchedule = (startDate: string, daysAhead: number = 84): Array<{
  date: string;
  dayIn84: number;
  category: string;
  difficulty: { level: string | null; range: [number, number] | null };
  formats: string[];
  isRecoveryDay: boolean;
  strengthFocus?: string;
}> => {
  const schedule = [];
  const start = new Date(startDate + 'T00:00:00Z');
  
  for (let i = 0; i < daysAhead; i++) {
    const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    const info = getWODInfoForDate(dateStr);
    schedule.push({ ...info, date: dateStr });
  }
  
  return schedule;
};

// Legacy compatibility - kept for any code still using 28-day references
export const getDayInCycleFromDate = getDayIn84Cycle;
export const getCycleNumberFromDate = (dateStr: string): number => {
  const dayIn84 = getDayIn84Cycle(dateStr);
  return Math.ceil(dayIn84 / 28); // Returns 1, 2, or 3
};
