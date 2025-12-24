// ═══════════════════════════════════════════════════════════════════════════════
// SINGLE 84-DAY PERIODIZATION CYCLE
// Simple: Day 1 to Day 84, then restart. Each day has fixed category & difficulty.
// Shared between generate-workout-of-day and run-system-health-audit
// ═══════════════════════════════════════════════════════════════════════════════

export const CYCLE_START_DATE = '2024-12-24'; // Day 1 of the 84-day cycle

// Base 28-day category pattern (repeated 3 times with different Strength difficulties)
const BASE_28_CATEGORIES = [
  'CARDIO', 'STRENGTH', 'MOBILITY & STABILITY', 'CHALLENGE', 'STRENGTH', 'PILATES', 'CALORIE BURNING',
  'METABOLIC', 'CHALLENGE', 'RECOVERY', 'CARDIO', 'STRENGTH', 'MOBILITY & STABILITY', 'CHALLENGE',
  'STRENGTH', 'PILATES', 'CALORIE BURNING', 'METABOLIC', 'CARDIO', 'STRENGTH', 'MOBILITY & STABILITY',
  'CHALLENGE', 'STRENGTH', 'PILATES', 'CALORIE BURNING', 'METABOLIC', 'CHALLENGE', 'RECOVERY'
];

// Strength focus by day position in 28-day block
const STRENGTH_FOCUS_BY_DAY: Record<number, string> = {
  2: 'LOWER BODY',
  5: 'UPPER BODY',
  12: 'FULL BODY',
  15: 'LOW PUSH & UPPER PULL',
  20: 'LOW PULL & UPPER PUSH',
  23: 'CORE & GLUTES'
};

// Difficulty rotation for Strength days across the 3 phases
const STRENGTH_DIFFICULTY_BY_PHASE: Record<number, Record<number, { difficulty: string; stars: number }>> = {
  // Day 2 - LOWER BODY: Advanced → Intermediate → Beginner
  2: { 1: { difficulty: 'Advanced', stars: 5 }, 2: { difficulty: 'Intermediate', stars: 3 }, 3: { difficulty: 'Beginner', stars: 1 } },
  // Day 5 - UPPER BODY: Intermediate → Beginner → Advanced
  5: { 1: { difficulty: 'Intermediate', stars: 3 }, 2: { difficulty: 'Beginner', stars: 1 }, 3: { difficulty: 'Advanced', stars: 5 } },
  // Day 12 - FULL BODY: Advanced → Beginner → Intermediate
  12: { 1: { difficulty: 'Advanced', stars: 5 }, 2: { difficulty: 'Beginner', stars: 1 }, 3: { difficulty: 'Intermediate', stars: 3 } },
  // Day 15 - LOW PUSH & UPPER PULL: Beginner → Advanced → Intermediate
  15: { 1: { difficulty: 'Beginner', stars: 1 }, 2: { difficulty: 'Advanced', stars: 5 }, 3: { difficulty: 'Intermediate', stars: 3 } },
  // Day 20 - LOW PULL & UPPER PUSH: Intermediate → Beginner → Advanced
  20: { 1: { difficulty: 'Intermediate', stars: 3 }, 2: { difficulty: 'Beginner', stars: 1 }, 3: { difficulty: 'Advanced', stars: 5 } },
  // Day 23 - CORE & GLUTES: Advanced → Intermediate → Beginner
  23: { 1: { difficulty: 'Advanced', stars: 5 }, 2: { difficulty: 'Intermediate', stars: 3 }, 3: { difficulty: 'Beginner', stars: 1 } }
};

// Non-strength difficulty pattern (varies by day position)
const NON_STRENGTH_DIFFICULTIES: Record<string, { difficulty: string; stars: number }[]> = {
  'CARDIO': [
    { difficulty: 'Beginner', stars: 1 },
    { difficulty: 'Intermediate', stars: 3 },
    { difficulty: 'Advanced', stars: 5 }
  ],
  'MOBILITY & STABILITY': [
    { difficulty: 'Intermediate', stars: 3 },
    { difficulty: 'Advanced', stars: 5 },
    { difficulty: 'Beginner', stars: 1 }
  ],
  'CHALLENGE': [
    { difficulty: 'Advanced', stars: 5 },
    { difficulty: 'Intermediate', stars: 3 },
    { difficulty: 'Intermediate', stars: 3 },
    { difficulty: 'Intermediate', stars: 3 }
  ],
  'PILATES': [
    { difficulty: 'Advanced', stars: 5 },
    { difficulty: 'Beginner', stars: 1 },
    { difficulty: 'Intermediate', stars: 3 }
  ],
  'CALORIE BURNING': [
    { difficulty: 'Intermediate', stars: 3 },
    { difficulty: 'Advanced', stars: 5 },
    { difficulty: 'Beginner', stars: 1 }
  ],
  'METABOLIC': [
    { difficulty: 'Beginner', stars: 1 },
    { difficulty: 'Intermediate', stars: 3 },
    { difficulty: 'Advanced', stars: 5 }
  ],
  'RECOVERY': [
    { difficulty: 'Beginner', stars: 1 }
  ]
};

export interface PeriodizationDay {
  day: number;
  category: string;
  difficulty: string | null;
  difficultyStars: number | null;
  strengthFocus?: string;
}

// Build the complete 84-day periodization array
function buildPeriodization84Day(): PeriodizationDay[] {
  const result: PeriodizationDay[] = [];
  const categoryOccurrence: Record<string, number> = {};

  for (let day = 1; day <= 84; day++) {
    const dayIn28 = ((day - 1) % 28) + 1; // 1-28
    const phase = Math.floor((day - 1) / 28) + 1; // 1, 2, or 3
    const category = BASE_28_CATEGORIES[dayIn28 - 1];

    if (category === 'STRENGTH') {
      const focus = STRENGTH_FOCUS_BY_DAY[dayIn28] || 'FULL BODY';
      const diffInfo = STRENGTH_DIFFICULTY_BY_PHASE[dayIn28]?.[phase] || { difficulty: 'Intermediate', stars: 3 };
      result.push({
        day,
        category,
        difficulty: diffInfo.difficulty,
        difficultyStars: diffInfo.stars,
        strengthFocus: focus
      });
    } else if (category === 'RECOVERY') {
      result.push({
        day,
        category,
        difficulty: null,
        difficultyStars: null
      });
    } else {
      // Track occurrence of this category to cycle through difficulties
      categoryOccurrence[category] = (categoryOccurrence[category] || 0);
      const diffOptions = NON_STRENGTH_DIFFICULTIES[category] || [{ difficulty: 'Intermediate', stars: 3 }];
      const diffInfo = diffOptions[categoryOccurrence[category] % diffOptions.length];
      categoryOccurrence[category]++;
      
      result.push({
        day,
        category,
        difficulty: diffInfo.difficulty,
        difficultyStars: diffInfo.stars
      });
    }
  }

  return result;
}

export const PERIODIZATION_84DAY = buildPeriodization84Day();

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
  const index = ((dayIn84 - 1) % 84 + 84) % 84;
  return PERIODIZATION_84DAY[index];
}

// Get category for a specific day in cycle (1-84)
export function getCategoryForDay(dayIn84: number): string {
  return getPeriodizationForDay(dayIn84).category;
}

// Calculate future WOD schedule for admin preview
export function calculateFutureWODSchedule(
  daysAhead: number = 84
): Array<{ date: string; dayIn84: number; category: string; difficulty: string | null; difficultyStars: number | null; strengthFocus?: string }> {
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

// Export format rules
export const FORMATS_BY_CATEGORY: Record<string, string[]> = {
  "STRENGTH": ["REPS & SETS"],
  "MOBILITY & STABILITY": ["REPS & SETS"],
  "PILATES": ["REPS & SETS"],
  "CARDIO": ["CIRCUIT", "EMOM", "FOR TIME", "AMRAP", "TABATA"],
  "METABOLIC": ["CIRCUIT", "AMRAP", "EMOM", "FOR TIME", "TABATA"],
  "CALORIE BURNING": ["CIRCUIT", "TABATA", "AMRAP", "FOR TIME", "EMOM"],
  "CHALLENGE": ["CIRCUIT", "TABATA", "AMRAP", "EMOM", "FOR TIME", "MIX"],
  "RECOVERY": ["FLOW"]
};

// Strength focus details
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
