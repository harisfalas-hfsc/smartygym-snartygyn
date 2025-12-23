/**
 * WOD Cycle Utilities - 28-Day Fixed Periodization System with 84-Day Strength Rotation
 * 
 * CRITICAL: This file is the SINGLE SOURCE OF TRUTH for WOD cycle calculations.
 * Both frontend and backend use identical logic anchored to CYCLE_START_DATE.
 * 
 * The cycle is CALENDAR-ANCHORED and FIXED:
 * - 28-day cycle with predefined category + difficulty for each day
 * - NO shifts, NO weekly rotations - just repeat after 28 days
 * - Recovery days (10 and 28) have no difficulty level
 * 
 * STRENGTH DAYS (2, 5, 12, 15, 20, 23) use an 84-day super-cycle:
 * - Every 28-day cycle, the difficulty rotates for Strength days only
 * - Over 3 cycles (84 days), each Strength focus experiences all difficulty levels
 * - Non-Strength categories remain fixed with their base difficulty
 */

// Reference date: December 24, 2024 = Day 1 (CARDIO/BEGINNER)
// This anchors the 28-day cycle to the calendar
export const CYCLE_START_DATE = '2024-12-24';

// ═══════════════════════════════════════════════════════════════════════════════
// 84-DAY STRENGTH DIFFICULTY ROTATION (3 x 28-day cycles)
// Only affects Strength days - all other categories use base periodization
// ═══════════════════════════════════════════════════════════════════════════════
export const STRENGTH_84DAY_ROTATION: Record<number, Array<{
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  stars: [number, number];
}>> = {
  // Day 2 - LOWER BODY: Advanced → Intermediate → Beginner
  2: [
    { difficulty: "Advanced", stars: [5, 6] },
    { difficulty: "Intermediate", stars: [3, 4] },
    { difficulty: "Beginner", stars: [1, 2] }
  ],
  // Day 5 - UPPER BODY: Intermediate → Beginner → Advanced
  5: [
    { difficulty: "Intermediate", stars: [3, 4] },
    { difficulty: "Beginner", stars: [1, 2] },
    { difficulty: "Advanced", stars: [5, 6] }
  ],
  // Day 12 - FULL BODY: Advanced → Beginner → Intermediate
  12: [
    { difficulty: "Advanced", stars: [5, 6] },
    { difficulty: "Beginner", stars: [1, 2] },
    { difficulty: "Intermediate", stars: [3, 4] }
  ],
  // Day 15 - LOW PUSH & UPPER PULL: Beginner → Advanced → Intermediate
  15: [
    { difficulty: "Beginner", stars: [1, 2] },
    { difficulty: "Advanced", stars: [5, 6] },
    { difficulty: "Intermediate", stars: [3, 4] }
  ],
  // Day 20 - LOW PULL & UPPER PUSH: Intermediate → Beginner → Advanced
  20: [
    { difficulty: "Intermediate", stars: [3, 4] },
    { difficulty: "Beginner", stars: [1, 2] },
    { difficulty: "Advanced", stars: [5, 6] }
  ],
  // Day 23 - CORE & GLUTES: Advanced → Intermediate → Beginner
  23: [
    { difficulty: "Advanced", stars: [5, 6] },
    { difficulty: "Intermediate", stars: [3, 4] },
    { difficulty: "Beginner", stars: [1, 2] }
  ]
};

// 28-DAY BASE PERIODIZATION (from WOD_PERIODIZATION.docx)
// NOTE: For Strength days, the difficulty is overridden by STRENGTH_84DAY_ROTATION
export const PERIODIZATION_28DAY: Array<{
  day: number;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | null;
  difficultyStars: [number, number] | null; // Star range for this difficulty
}> = [
  { day: 1,  category: "CARDIO",              difficulty: "Beginner",     difficultyStars: [1, 2] },
  { day: 2,  category: "STRENGTH",            difficulty: "Advanced",     difficultyStars: [5, 6] }, // Overridden by 84-day rotation
  { day: 3,  category: "MOBILITY & STABILITY", difficulty: "Intermediate", difficultyStars: [3, 4] },
  { day: 4,  category: "CHALLENGE",           difficulty: "Advanced",     difficultyStars: [5, 6] },
  { day: 5,  category: "STRENGTH",            difficulty: "Intermediate", difficultyStars: [3, 4] }, // Overridden by 84-day rotation
  { day: 6,  category: "PILATES",             difficulty: "Advanced",     difficultyStars: [5, 6] },
  { day: 7,  category: "CALORIE BURNING",     difficulty: "Intermediate", difficultyStars: [3, 4] },
  { day: 8,  category: "METABOLIC",           difficulty: "Beginner",     difficultyStars: [1, 2] },
  { day: 9,  category: "CHALLENGE",           difficulty: "Advanced",     difficultyStars: [5, 6] },
  { day: 10, category: "RECOVERY",            difficulty: null,           difficultyStars: null },
  { day: 11, category: "CARDIO",              difficulty: "Intermediate", difficultyStars: [3, 4] },
  { day: 12, category: "STRENGTH",            difficulty: "Intermediate", difficultyStars: [3, 4] }, // Overridden by 84-day rotation
  { day: 13, category: "MOBILITY & STABILITY", difficulty: "Advanced",     difficultyStars: [5, 6] },
  { day: 14, category: "CHALLENGE",           difficulty: "Intermediate", difficultyStars: [3, 4] },
  { day: 15, category: "STRENGTH",            difficulty: "Intermediate", difficultyStars: [3, 4] }, // Overridden by 84-day rotation
  { day: 16, category: "PILATES",             difficulty: "Beginner",     difficultyStars: [1, 2] },
  { day: 17, category: "CALORIE BURNING",     difficulty: "Advanced",     difficultyStars: [5, 6] },
  { day: 18, category: "METABOLIC",           difficulty: "Intermediate", difficultyStars: [3, 4] },
  { day: 19, category: "CARDIO",              difficulty: "Advanced",     difficultyStars: [5, 6] },
  { day: 20, category: "STRENGTH",            difficulty: "Beginner",     difficultyStars: [1, 2] }, // Overridden by 84-day rotation
  { day: 21, category: "MOBILITY & STABILITY", difficulty: "Beginner",     difficultyStars: [1, 2] },
  { day: 22, category: "CHALLENGE",           difficulty: "Intermediate", difficultyStars: [3, 4] },
  { day: 23, category: "STRENGTH",            difficulty: "Advanced",     difficultyStars: [5, 6] }, // Overridden by 84-day rotation
  { day: 24, category: "PILATES",             difficulty: "Intermediate", difficultyStars: [3, 4] },
  { day: 25, category: "CALORIE BURNING",     difficulty: "Beginner",     difficultyStars: [1, 2] },
  { day: 26, category: "METABOLIC",           difficulty: "Advanced",     difficultyStars: [5, 6] },
  { day: 27, category: "CHALLENGE",           difficulty: "Intermediate", difficultyStars: [3, 4] },
  { day: 28, category: "RECOVERY",            difficulty: null,           difficultyStars: null },
];

// FORMAT RULES BY CATEGORY (STRICT - unchanged from original)
export const FORMATS_BY_CATEGORY: Record<string, string[]> = {
  "STRENGTH": ["REPS & SETS"], // ONLY Reps & Sets
  "MOBILITY & STABILITY": ["REPS & SETS"], // ONLY Reps & Sets
  "PILATES": ["REPS & SETS"], // ONLY Reps & Sets
  "CARDIO": ["CIRCUIT", "EMOM", "FOR TIME", "AMRAP", "TABATA"],
  "METABOLIC": ["CIRCUIT", "AMRAP", "EMOM", "FOR TIME", "TABATA"],
  "CALORIE BURNING": ["CIRCUIT", "TABATA", "AMRAP", "FOR TIME", "EMOM"],
  "CHALLENGE": ["CIRCUIT", "TABATA", "AMRAP", "EMOM", "FOR TIME", "MIX"],
  "RECOVERY": ["CIRCUIT", "REPS & SETS"] // Light stretching and mobility
};

// All valid categories in the system
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
 * STRENGTH CATEGORY FOCUS BY CYCLE DAY
 * Each strength day has a specific muscle group/movement pattern focus
 * The AI uses intelligent pattern recognition - examples are NOT exhaustive
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

/**
 * Get day in cycle (1-28) from a date string
 * Uses calendar-anchored calculation - always correct regardless of any state
 */
export const getDayInCycleFromDate = (dateStr: string): number => {
  const startDate = new Date(CYCLE_START_DATE + 'T00:00:00Z');
  const targetDate = new Date(dateStr + 'T00:00:00Z');
  const daysDiff = Math.floor((targetDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
  // Handle negative numbers (dates before reference) properly with modulo
  const normalizedDays = ((daysDiff % 28) + 28) % 28;
  return normalizedDays + 1; // 1-28
};

/**
 * Get cycle number from a date string
 * Cycle 1 starts on CYCLE_START_DATE, increments every 28 days
 */
export const getCycleNumberFromDate = (dateStr: string): number => {
  const startDate = new Date(CYCLE_START_DATE + 'T00:00:00Z');
  const targetDate = new Date(dateStr + 'T00:00:00Z');
  const daysDiff = Math.floor((targetDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
  return Math.floor(daysDiff / 28) + 1;
};

/**
 * Get periodization info for a specific day in cycle (1-28)
 */
export const getPeriodizationForDay = (dayInCycle: number): typeof PERIODIZATION_28DAY[0] => {
  const index = Math.max(0, Math.min(27, dayInCycle - 1));
  return PERIODIZATION_28DAY[index];
};

/**
 * Get category for a specific day in cycle (1-28)
 */
export const getCategoryForDay = (dayInCycle: number): string => {
  return getPeriodizationForDay(dayInCycle).category;
};

/**
 * Get category directly from a date string
 */
export const getCategoryForDate = (dateStr: string): string => {
  const dayInCycle = getDayInCycleFromDate(dateStr);
  return getCategoryForDay(dayInCycle);
};

/**
 * Get difficulty info for a specific day in cycle
 * For STRENGTH days, uses the 84-day rotation based on cycle number
 * For all other categories, uses the fixed base periodization
 */
export const getDifficultyForDay = (dayInCycle: number, cycleNumber?: number): { 
  level: string | null; 
  range: [number, number] | null;
} => {
  const periodization = getPeriodizationForDay(dayInCycle);
  
  // Apply 84-day rotation for STRENGTH days only
  if (periodization.category === "STRENGTH" && cycleNumber !== undefined && STRENGTH_84DAY_ROTATION[dayInCycle]) {
    const rotationIndex = (cycleNumber - 1) % 3; // 0, 1, or 2
    const rotation = STRENGTH_84DAY_ROTATION[dayInCycle][rotationIndex];
    return { level: rotation.difficulty, range: rotation.stars };
  }
  
  // For non-Strength days, use the fixed base periodization
  return {
    level: periodization.difficulty,
    range: periodization.difficultyStars
  };
};

/**
 * Get difficulty info directly from a date string
 * Automatically calculates cycle number for Strength day rotation
 */
export const getDifficultyForDate = (dateStr: string): { 
  level: string | null; 
  range: [number, number] | null;
} => {
  const dayInCycle = getDayInCycleFromDate(dateStr);
  const cycleNumber = getCycleNumberFromDate(dateStr);
  return getDifficultyForDay(dayInCycle, cycleNumber);
};

/**
 * Get full WOD info for a date
 * Uses 84-day rotation for Strength day difficulties
 */
export const getWODInfoForDate = (dateStr: string): {
  dayInCycle: number;
  cycleNumber: number;
  category: string;
  difficulty: { level: string | null; range: [number, number] | null };
  formats: string[];
  isRecoveryDay: boolean;
} => {
  const dayInCycle = getDayInCycleFromDate(dateStr);
  const cycleNumber = getCycleNumberFromDate(dateStr);
  const periodization = getPeriodizationForDay(dayInCycle);
  const category = periodization.category;
  
  // Use the updated getDifficultyForDay that handles 84-day Strength rotation
  const difficulty = getDifficultyForDay(dayInCycle, cycleNumber);
  
  const formats = FORMATS_BY_CATEGORY[category] || ["CIRCUIT"];
  const isRecoveryDay = category === "RECOVERY";
  
  return {
    dayInCycle,
    cycleNumber,
    category,
    difficulty,
    formats,
    isRecoveryDay
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
export const getUpcomingSchedule = (startDate: string, daysAhead: number = 28): Array<{
  date: string;
  dayInCycle: number;
  category: string;
  difficulty: { level: string | null; range: [number, number] | null };
  formats: string[];
  isRecoveryDay: boolean;
}> => {
  const schedule = [];
  const start = new Date(startDate + 'T00:00:00Z');
  
  for (let i = 0; i < daysAhead; i++) {
    const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    schedule.push(getWODInfoForDate(dateStr));
    schedule[schedule.length - 1] = { 
      ...schedule[schedule.length - 1], 
      date: dateStr 
    } as any;
  }
  
  return schedule;
};
