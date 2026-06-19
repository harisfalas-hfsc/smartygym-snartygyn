// ═══════════════════════════════════════════════════════════════════════════════
// PROGRAM EXERCISE PICKER
// Deterministic library-first exercise selection for training program days.
// Used by generate-admin-program and restructure-training-programs to guarantee
// every bullet uses a real {{exercise:ID:Name}} token (eye icon preserved) and
// to enforce equipment + difficulty constraints WITHOUT relying on the model.
// ═══════════════════════════════════════════════════════════════════════════════

export interface LibExercise {
  id: string;
  name: string;
  body_part?: string | null;
  equipment?: string | null;
  target?: string | null;
  difficulty?: string | null;
}

const BODYWEIGHT_EQUIPMENT = new Set(["body weight", "bodyweight"]);

const APPARATUS_DEPENDENT_BODYWEIGHT: RegExp[] = [
  /\bbench\b/i,
  /pull-?up/i,
  /chin-?up/i,
  /front\s*lever/i,
  /muscle-?up/i,
  /\bdip(s)?\b/i,
  /parallel\s*bars?/i,
  /\brings?\b/i,
  /captains?\s*chair/i,
  /vertical\s*bar/i,
  /straight\s*bar/i,
  /glute-?ham|\bghd\b/i,
  /hyperextension/i,
  /\bbox\b/i,
];

const DAY_FOCUS_KEYWORDS: Record<string, { body_part?: string[]; target?: string[]; name?: string[] }> = {
  "lower body": { body_part: ["upper legs", "lower legs", "legs", "hips"] },
  "upper body": { body_part: ["chest", "back", "upper arms", "shoulders"] },
  "chest": { body_part: ["chest"] },
  "back": { body_part: ["back"] },
  "shoulders": { body_part: ["shoulders"] },
  "arms": { body_part: ["upper arms", "lower arms"] },
  "core": { body_part: ["waist"], target: ["abs", "obliques"] },
  "full body": {},
  "conditioning": { body_part: ["cardio"], name: ["squat", "burpee", "lunge", "push", "row"] },
  "cardio": { body_part: ["cardio"] },
  "endurance": { body_part: ["cardio"] },
  "interval": { body_part: ["cardio"] },
  "tempo": { body_part: ["cardio"] },
  "hip": { body_part: ["hips", "upper legs"], target: ["glutes", "hip flexors", "adductors"] },
  "spinal": { body_part: ["waist", "back"], target: ["spine", "abs"] },
  "stability": { target: ["abs", "obliques", "spine"] },
  "mobility": { name: ["stretch", "mobility", "rotation", "circle", "swing"] },
  "movement": { name: ["squat", "lunge", "hinge", "push", "pull", "carry"] },
  "metabolic": { name: ["burpee", "thruster", "swing", "snatch", "clean", "jump"] },
  "challenge": { name: ["burpee", "thruster", "complex", "jump"] },
  "calorie": { body_part: ["cardio"], name: ["burpee", "jump", "swing"] },
  "fat loss": { name: ["burpee", "thruster", "swing", "jump"] },
  "carries": { name: ["carry", "farmer", "suitcase"] },
  "power": { name: ["jump", "clean", "snatch", "throw", "swing"] },
  "thoracic": { name: ["thoracic", "t-spine", "rotation"] },
  "posterior": { target: ["glutes", "hamstrings", "lower back"] },
  "legs": { body_part: ["upper legs", "lower legs", "legs", "hips"] },
  "glutes": { target: ["glutes"] },
  "quadriceps": { target: ["quadriceps", "quads"] },
  "quads": { target: ["quadriceps", "quads"] },
  "hamstrings": { target: ["hamstrings"] },
  "calves": { target: ["calves", "gastrocnemius", "soleus"] },
  "biceps": { target: ["biceps"] },
  "triceps": { target: ["triceps"] },
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasWholePhrase(text: string, phrase: string): boolean {
  const pattern = phrase
    .trim()
    .split(/\s+/)
    .map(escapeRegExp)
    .join("[^a-z0-9]+");
  return new RegExp(`(^|[^a-z0-9])${pattern}($|[^a-z0-9])`, "i").test(text || "");
}

function fieldMatchesAny(value: string | null | undefined, terms?: string[]): boolean {
  if (!terms?.length) return false;
  const text = (value || "").toLowerCase();
  return terms.some((term) => hasWholePhrase(text, term.toLowerCase()));
}

function matchesFocus(ex: LibExercise, focus: string): boolean {
  const focusLower = focus.toLowerCase();
  const activeKeys = Object.keys(DAY_FOCUS_KEYWORDS).filter((key) => hasWholePhrase(focusLower, key));
  if (!activeKeys.length) return true;

  for (const key of activeKeys) {
    const def = DAY_FOCUS_KEYWORDS[key];
    if (fieldMatchesAny(ex.body_part, def.body_part)) return true;
    if (fieldMatchesAny(ex.target, def.target)) return true;
    if (fieldMatchesAny(ex.name, def.name)) return true;
  }
  return false;
}

function isBodyweightExercise(ex: LibExercise): boolean {
  return BODYWEIGHT_EQUIPMENT.has((ex.equipment || "").toLowerCase().trim());
}

function isHomeBodyweightFriendly(ex: LibExercise): boolean {
  return isBodyweightExercise(ex) && !APPARATUS_DEPENDENT_BODYWEIGHT.some((pattern) => pattern.test(ex.name || ""));
}

function defaultPrescription(category: string, dayTitle: string): string {
  const cat = category.toUpperCase();
  const title = dayTitle.toLowerCase();
  if (cat.includes("HYPERTROPHY")) return "3 × 10";
  if (cat.includes("FUNCTIONAL STRENGTH")) return "4 × 8";
  if (cat.includes("CARDIO") || title.includes("interval") || title.includes("conditioning")) return "5 × 60 sec";
  if (cat.includes("WEIGHT LOSS") || title.includes("metabolic")) return "3 rounds × 45 sec";
  if (cat.includes("MOBILITY") || cat.includes("LOW BACK")) return "2 × 12 reps";
  return "3 × 10";
}

/**
 * Pick `n` exercises from `library` that best match `dayTitle`.
 * Deterministic seed: uses (week, day) indices to vary picks across weeks while
 * preserving day focus. Falls back to general selection if focus produces too few.
 */
export function pickExercisesForDay(
  library: LibExercise[],
  dayTitle: string,
  weekIndex: number,
  dayIndex: number,
  n: number,
): LibExercise[] {
  if (!library.length) return [];
  const matched = library.filter((ex) => matchesFocus(ex, dayTitle));
  const pool = matched.length >= n ? matched : library;
  // Deterministic rotation so weeks vary but stay stable for the same input
  const seed = (weekIndex * 31 + dayIndex * 7) % Math.max(pool.length, 1);
  const picks: LibExercise[] = [];
  const usedIds = new Set<string>();
  for (let i = 0; i < pool.length && picks.length < n; i++) {
    const ex = pool[(seed + i) % pool.length];
    if (usedIds.has(ex.id)) continue;
    usedIds.add(ex.id);
    picks.push(ex);
  }
  return picks;
}

/**
 * Build the bullet lines for one training day, including `{{exercise:ID:Name}}`
 * tokens (eye icon) and a default sets×reps prescription.
 */
export function buildDayBullets(
  library: LibExercise[],
  category: string,
  dayTitle: string,
  weekIndex: number,
  dayIndex: number,
  count = 5,
): string[] {
  const picks = pickExercisesForDay(library, dayTitle, weekIndex, dayIndex, count);
  if (!picks.length) {
    return Array.from({ length: count }, () => "• Exercise");
  }
  const prescription = defaultPrescription(category, dayTitle);
  return picks.map((ex) => `• {{exercise:${ex.id}:${ex.name}}} – ${prescription}`);
}

/**
 * Filter the full library down to the exercises permitted for a program.
 * - "Bodyweight" programs: only equipment === "body weight"
 * - Equipment programs: keep all (the picker still avoids irrelevant ones via focus)
 * - Difficulty: when supplied, prefer matching tier but fall back if too few.
 */
export function filterLibraryForProgram(
  library: LibExercise[],
  equipment: string,
  difficulty?: string,
): LibExercise[] {
  const equipLower = (equipment || "").toLowerCase();
  let pool = library;
  if (equipLower.includes("bodyweight") || equipLower === "body weight" || equipLower === "none - running shoes only") {
    pool = pool.filter((ex) => (ex.equipment || "").toLowerCase() === "body weight");
  }
  if (difficulty) {
    const targetDiff = difficulty.toLowerCase();
    const matched = pool.filter((ex) => (ex.difficulty || "").toLowerCase() === targetDiff);
    if (matched.length >= 40) pool = matched; // only narrow when we still have enough variety
  }
  return pool;
}