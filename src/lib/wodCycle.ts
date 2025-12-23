/**
 * WOD Cycle Utilities - 28-Day Fixed Periodization System
 * 
 * CRITICAL: This file is the SINGLE SOURCE OF TRUTH for WOD cycle calculations.
 * Both frontend and backend use identical logic anchored to CYCLE_START_DATE.
 * 
 * The cycle is CALENDAR-ANCHORED and FIXED:
 * - 28-day cycle with predefined category + difficulty for each day
 * - NO shifts, NO weekly rotations - just repeat after 28 days
 * - Recovery days (10 and 28) have no difficulty level
 */

// Reference date: December 24, 2024 = Day 1 (CARDIO/BEGINNER)
// This anchors the 28-day cycle to the calendar
export const CYCLE_START_DATE = '2024-12-24';

// 28-DAY FIXED PERIODIZATION (from WOD_PERIODIZATION.docx)
// Each entry: { category, difficulty: "Beginner" | "Intermediate" | "Advanced" | null }
export const PERIODIZATION_28DAY: Array<{
  day: number;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | null;
  difficultyStars: [number, number] | null; // Star range for this difficulty
}> = [
  { day: 1,  category: "CARDIO",              difficulty: "Beginner",     difficultyStars: [1, 2] },
  { day: 2,  category: "STRENGTH",            difficulty: "Advanced",     difficultyStars: [5, 6] },
  { day: 3,  category: "MOBILITY & STABILITY", difficulty: "Intermediate", difficultyStars: [3, 4] },
  { day: 4,  category: "CHALLENGE",           difficulty: "Advanced",     difficultyStars: [5, 6] },
  { day: 5,  category: "STRENGTH",            difficulty: "Intermediate", difficultyStars: [3, 4] },
  { day: 6,  category: "PILATES",             difficulty: "Advanced",     difficultyStars: [5, 6] },
  { day: 7,  category: "CALORIE BURNING",     difficulty: "Intermediate", difficultyStars: [3, 4] },
  { day: 8,  category: "METABOLIC",           difficulty: "Beginner",     difficultyStars: [1, 2] },
  { day: 9,  category: "CHALLENGE",           difficulty: "Advanced",     difficultyStars: [5, 6] },
  { day: 10, category: "RECOVERY",            difficulty: null,           difficultyStars: null },
  { day: 11, category: "CARDIO",              difficulty: "Intermediate", difficultyStars: [3, 4] },
  { day: 12, category: "STRENGTH",            difficulty: "Intermediate", difficultyStars: [3, 4] },
  { day: 13, category: "MOBILITY & STABILITY", difficulty: "Advanced",     difficultyStars: [5, 6] },
  { day: 14, category: "CHALLENGE",           difficulty: "Intermediate", difficultyStars: [3, 4] },
  { day: 15, category: "STRENGTH",            difficulty: "Intermediate", difficultyStars: [3, 4] },
  { day: 16, category: "PILATES",             difficulty: "Beginner",     difficultyStars: [1, 2] },
  { day: 17, category: "CALORIE BURNING",     difficulty: "Advanced",     difficultyStars: [5, 6] },
  { day: 18, category: "METABOLIC",           difficulty: "Intermediate", difficultyStars: [3, 4] },
  { day: 19, category: "CARDIO",              difficulty: "Advanced",     difficultyStars: [5, 6] },
  { day: 20, category: "STRENGTH",            difficulty: "Beginner",     difficultyStars: [1, 2] },
  { day: 21, category: "MOBILITY & STABILITY", difficulty: "Beginner",     difficultyStars: [1, 2] },
  { day: 22, category: "CHALLENGE",           difficulty: "Intermediate", difficultyStars: [3, 4] },
  { day: 23, category: "STRENGTH",            difficulty: "Advanced",     difficultyStars: [5, 6] },
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
 * Get difficulty info for a specific day in cycle (fixed, no shifting)
 */
export const getDifficultyForDay = (dayInCycle: number): { 
  level: string | null; 
  range: [number, number] | null;
} => {
  const periodization = getPeriodizationForDay(dayInCycle);
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
  const dayInCycle = getDayInCycleFromDate(dateStr);
  return getDifficultyForDay(dayInCycle);
};

/**
 * Get full WOD info for a date
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
  const difficulty = {
    level: periodization.difficulty,
    range: periodization.difficultyStars
  };
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
  if (!level) return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  if (level === "Beginner") return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30";
  if (level === "Intermediate") return "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30";
  return "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30";
};

/**
 * Get difficulty border class based on level
 */
export const getDifficultyBorderClass = (level: string | null): string => {
  if (!level) return "border-gray-500";
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
