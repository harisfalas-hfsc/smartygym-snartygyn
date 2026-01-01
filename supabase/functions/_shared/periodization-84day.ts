// ═══════════════════════════════════════════════════════════════════════════════
// SINGLE 84-DAY PERIODIZATION CYCLE
// Pre-computed: Day 1 to Day 84, each with fixed category & difficulty RANGE.
// This file is the SINGLE SOURCE OF TRUTH for backend WOD generation.
// MUST MATCH: src/lib/wodCycle.ts on the frontend
// ═══════════════════════════════════════════════════════════════════════════════

export const CYCLE_START_DATE = '2025-11-25'; // Day 1 of the 84-day cycle

// FORMAT RULES BY CATEGORY (STRICT)
export const FORMATS_BY_CATEGORY: Record<string, string[]> = {
  "STRENGTH": ["REPS & SETS"],
  "MOBILITY & STABILITY": ["REPS & SETS"],
  "PILATES": ["REPS & SETS"],
  "CARDIO": ["CIRCUIT", "EMOM", "FOR TIME", "AMRAP", "TABATA"],
  "METABOLIC": ["CIRCUIT", "AMRAP", "EMOM", "FOR TIME", "TABATA"],
  "CALORIE BURNING": ["CIRCUIT", "TABATA", "AMRAP", "FOR TIME", "EMOM"],
  "CHALLENGE": ["CIRCUIT", "TABATA", "AMRAP", "EMOM", "FOR TIME", "MIX"],
  "RECOVERY": ["MIX"]
};

// Strength focus details for building prompts
export const STRENGTH_DAY_FOCUS: Record<number, {
  focus: string;
  description: string;
  muscleGroups: string[];
  movementPatterns: string[];
  forbiddenPatterns: string[];
}> = {
  2: {
    focus: "LOWER BODY",
    description: "Quads, hamstrings, calves, glutes, adductors, abductors",
    muscleGroups: ["quads", "hamstrings", "calves", "glutes", "adductors", "abductors"],
    movementPatterns: ["squats", "lunges", "leg press", "hip thrusts", "leg curls", "leg extensions", "calf raises", "step-ups", "Bulgarian splits"],
    forbiddenPatterns: ["chest press", "bench press", "shoulder press", "rows", "pull-ups", "bicep curls", "tricep extensions"]
  },
  5: {
    focus: "UPPER BODY",
    description: "Chest, back, shoulders, biceps, triceps",
    muscleGroups: ["chest", "back", "shoulders", "biceps", "triceps"],
    movementPatterns: ["pressing", "pulling", "curls", "extensions", "rows", "flys", "pulldowns", "push-ups", "dips"],
    forbiddenPatterns: ["squats", "lunges", "leg press", "deadlifts", "hip thrusts", "leg curls", "calf raises"]
  },
  12: {
    focus: "FULL BODY",
    description: "Upper + Lower + Core combination - balanced across all muscle groups",
    muscleGroups: ["full body", "compound movements"],
    movementPatterns: ["upper push", "upper pull", "lower push", "lower pull", "core stability"],
    forbiddenPatterns: []
  },
  15: {
    focus: "LOW PUSH & UPPER PULL",
    description: "Lower body pushing patterns + Upper body pulling patterns",
    muscleGroups: ["quads", "glutes", "back", "biceps", "rear delts"],
    movementPatterns: ["squats", "lunges", "leg press", "step-ups", "hip thrusts", "rows", "pull-ups", "pulldowns", "curls", "face pulls"],
    forbiddenPatterns: ["deadlifts", "RDLs", "leg curls", "bench press", "shoulder press", "push-ups", "tricep work"]
  },
  20: {
    focus: "LOW PULL & UPPER PUSH",
    description: "Lower body pulling patterns + Upper body pushing patterns",
    muscleGroups: ["hamstrings", "glutes", "chest", "shoulders", "triceps"],
    movementPatterns: ["deadlifts", "RDLs", "leg curls", "hip hinges", "glute-ham raises", "bench press", "shoulder press", "push-ups", "tricep work", "dips", "flys"],
    forbiddenPatterns: ["squats", "lunges", "leg press", "step-ups", "rows", "pull-ups", "bicep curls"]
  },
  23: {
    focus: "CORE & GLUTES",
    description: "Core stability + Glute-focused exercises",
    muscleGroups: ["core", "glutes", "hip stabilizers"],
    movementPatterns: ["anti-rotation", "planks", "dead bugs", "pallof press", "bird dogs", "hip thrusts", "glute bridges", "banded work", "kickbacks", "clamshells"],
    forbiddenPatterns: ["squats", "bench press", "rows", "shoulder press", "compound lifts", "arm isolation"]
  }
};

export interface PeriodizationDay {
  day: number; // 1-84
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | null;
  difficultyStars: [number, number] | null; // [min, max] range, null for Recovery
  strengthFocus?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPLETE 84-DAY PERIODIZATION - Pre-computed, matches frontend exactly
// Days 1-28 = Cycle 1, Days 29-56 = Cycle 2, Days 57-84 = Cycle 3
// ═══════════════════════════════════════════════════════════════════════════════
export const PERIODIZATION_84DAY: PeriodizationDay[] = [
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

// Get day 1-84 in cycle based on calendar date
export function getDayIn84Cycle(dateStr: string): number {
  const startDate = new Date(CYCLE_START_DATE + 'T00:00:00Z');
  const targetDate = new Date(dateStr + 'T00:00:00Z');
  const diffTime = targetDate.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Normalize to 1-84
  const normalized = ((diffDays % 84) + 84) % 84;
  return normalized + 1;
}

// Get periodization for a specific day (1-84)
export function getPeriodizationForDay(dayIn84: number): PeriodizationDay {
  const index = Math.max(0, Math.min(83, dayIn84 - 1));
  return PERIODIZATION_84DAY[index];
}

// Get category for a specific day in cycle (1-84)
export function getCategoryForDay(dayIn84: number): string {
  return getPeriodizationForDay(dayIn84).category;
}

// Get a random star from the difficulty range
export function getRandomStarFromRange(range: [number, number] | null): number {
  if (!range) return 0;
  return Math.random() < 0.5 ? range[0] : range[1];
}

// Convert star rating to difficulty level
export function starsToLevel(stars: number): string {
  if (stars <= 2) return "Beginner";
  if (stars <= 4) return "Intermediate";
  return "Advanced";
}

// Calculate future WOD schedule for admin preview
export function calculateFutureWODSchedule(
  daysAhead: number = 84
): Array<{ date: string; dayIn84: number; category: string; difficulty: string | null; difficultyStars: [number, number] | null; strengthFocus?: string }> {
  const schedule = [];
  
  for (let i = 1; i <= daysAhead; i++) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + i);
    const futureDateStr = futureDate.toISOString().split('T')[0];
    
    const dayIn84 = getDayIn84Cycle(futureDateStr);
    const periodization = getPeriodizationForDay(dayIn84);
    
    schedule.push({
      date: futureDateStr,
      dayIn84,
      category: periodization.category,
      difficulty: periodization.difficulty,
      difficultyStars: periodization.difficultyStars,
      strengthFocus: periodization.strengthFocus
    });
  }
  
  return schedule;
}
