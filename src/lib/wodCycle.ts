/**
 * WOD Cycle Utilities - Date-based calculation for WOD categories
 * 
 * CRITICAL: This file is the SINGLE SOURCE OF TRUTH for WOD cycle calculations.
 * Both frontend and backend use identical logic anchored to CYCLE_START_DATE.
 * 
 * The cycle is CALENDAR-ANCHORED, meaning:
 * - December 14, 2025 is always Day 1 (CHALLENGE)
 * - December 15, 2025 is always Day 2 (STRENGTH)
 * - ...and so on, regardless of any counter state
 */

// Reference date: December 14, 2025 = Day 1 (CHALLENGE)
// This anchors the 8-day cycle to the calendar
export const CYCLE_START_DATE = '2025-12-14';

// 8-DAY CATEGORY CYCLE (with PILATES as Day 8)
export const CATEGORY_CYCLE_8DAY = [
  "CHALLENGE",            // Day 1
  "STRENGTH",             // Day 2
  "CARDIO",               // Day 3
  "MOBILITY & STABILITY", // Day 4
  "STRENGTH",             // Day 5
  "METABOLIC",            // Day 6
  "CALORIE BURNING",      // Day 7
  "PILATES"               // Day 8
] as const;

// DIFFICULTY PATTERN BASE (8-day pattern that shifts weekly)
export const DIFFICULTY_PATTERN_BASE = [
  { level: "Intermediate", range: [3, 4] as [number, number] },
  { level: "Advanced", range: [5, 6] as [number, number] },
  { level: "Beginner", range: [1, 2] as [number, number] },
  { level: "Advanced", range: [5, 6] as [number, number] },
  { level: "Intermediate", range: [3, 4] as [number, number] },
  { level: "Beginner", range: [1, 2] as [number, number] },
  { level: "Advanced", range: [5, 6] as [number, number] },
  { level: "Intermediate", range: [3, 4] as [number, number] }  // Day 8
] as const;

// FORMAT RULES BY CATEGORY
export const FORMATS_BY_CATEGORY: Record<string, string[]> = {
  "STRENGTH": ["REPS & SETS"],
  "MOBILITY & STABILITY": ["REPS & SETS"],
  "PILATES": ["REPS & SETS"],
  "CARDIO": ["CIRCUIT", "EMOM", "FOR TIME", "AMRAP", "TABATA"],
  "METABOLIC": ["CIRCUIT", "AMRAP", "EMOM", "FOR TIME", "TABATA"],
  "CALORIE BURNING": ["CIRCUIT", "TABATA", "AMRAP", "FOR TIME", "EMOM"],
  "CHALLENGE": ["CIRCUIT", "TABATA", "AMRAP", "EMOM", "FOR TIME", "MIX"]
};

/**
 * Get day in cycle (1-8) from a date string
 * Uses calendar-anchored calculation - always correct regardless of counter state
 */
export const getDayInCycleFromDate = (dateStr: string): number => {
  const startDate = new Date(CYCLE_START_DATE + 'T00:00:00Z');
  const targetDate = new Date(dateStr + 'T00:00:00Z');
  const daysDiff = Math.floor((targetDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
  const normalizedDays = ((daysDiff % 8) + 8) % 8; // Handle negative numbers
  return normalizedDays + 1; // 1-8
};

/**
 * Get week number from a date string
 * Week 1 starts on CYCLE_START_DATE, increments every 8 days
 */
export const getWeekNumberFromDate = (dateStr: string): number => {
  const startDate = new Date(CYCLE_START_DATE + 'T00:00:00Z');
  const targetDate = new Date(dateStr + 'T00:00:00Z');
  const daysDiff = Math.floor((targetDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
  return Math.floor(daysDiff / 8) + 1;
};

/**
 * Get category for a specific day in cycle (1-8)
 */
export const getCategoryForDay = (dayInCycle: number): string => {
  return CATEGORY_CYCLE_8DAY[dayInCycle - 1];
};

/**
 * Get category directly from a date string
 */
export const getCategoryForDate = (dateStr: string): string => {
  const dayInCycle = getDayInCycleFromDate(dateStr);
  return getCategoryForDay(dayInCycle);
};

/**
 * Get difficulty info for a specific day in cycle with weekly shift
 */
export const getDifficultyForDay = (
  dayInCycle: number, 
  weekNumber: number
): { level: string; range: [number, number] } => {
  const shiftAmount = (weekNumber - 1) % 8;
  const shiftedIndex = ((dayInCycle - 1) + shiftAmount) % 8;
  return {
    level: DIFFICULTY_PATTERN_BASE[shiftedIndex].level,
    range: [...DIFFICULTY_PATTERN_BASE[shiftedIndex].range] as [number, number]
  };
};

/**
 * Get difficulty info directly from a date string
 */
export const getDifficultyForDate = (dateStr: string): { level: string; range: [number, number] } => {
  const dayInCycle = getDayInCycleFromDate(dateStr);
  const weekNumber = getWeekNumberFromDate(dateStr);
  return getDifficultyForDay(dayInCycle, weekNumber);
};

/**
 * Get full WOD info for a date
 */
export const getWODInfoForDate = (dateStr: string): {
  dayInCycle: number;
  weekNumber: number;
  category: string;
  difficulty: { level: string; range: [number, number] };
  formats: string[];
} => {
  const dayInCycle = getDayInCycleFromDate(dateStr);
  const weekNumber = getWeekNumberFromDate(dateStr);
  const category = getCategoryForDay(dayInCycle);
  const difficulty = getDifficultyForDay(dayInCycle, weekNumber);
  const formats = FORMATS_BY_CATEGORY[category] || ["CIRCUIT"];
  
  return {
    dayInCycle,
    weekNumber,
    category,
    difficulty,
    formats
  };
};

/**
 * Get difficulty badge class based on level
 */
export const getDifficultyBadgeClass = (level: string): string => {
  if (level === "Beginner") return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30";
  if (level === "Intermediate") return "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30";
  return "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30";
};

/**
 * Get difficulty border class based on level
 */
export const getDifficultyBorderClass = (level: string): string => {
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
