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
  description?: string | null;
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
    if (!def.body_part && !def.target && !def.name) return true;
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

function isStaticHoldExercise(ex: LibExercise): boolean {
  const name = (ex.name || "").toLowerCase().trim();
  if (/^front\s+lever\s+reps$/i.test(name)) return true;
  if (/^flag$|^full\s+planche$|^handstand$/i.test(name)) return true;
  if (!name || /\breps?\b|tap|twist|row|fly|raise|press|push|pull|wiper|walk|crawl/i.test(name)) return false;

  return [
    /^back\s+lever$/i,
    /^front\s+lever$/i,
    /\bl-?sit\b/i,
    /\bwall\s+sit\b/i,
    /\bdead\s+hang\b/i,
    /\bsupport\s+hold\b/i,
    /\bhollow\s+(?:body\s+)?hold\b/i,
    /\barch\s+hold\b/i,
    /\bforearm\s+plank\b/i,
    /^bodyweight\s+incline\s+side\s+plank$/i,
    /\bisometric\s+chest\s+squeeze\b/i,
  ].some((pattern) => pattern.test(name));
}

function excludesStaticHolds(ex: LibExercise): boolean {
  return !isStaticHoldExercise(ex);
}

function defaultPrescription(category: string, dayTitle: string): string {
  const cat = category.toUpperCase();
  const title = dayTitle.toLowerCase();
  if (cat.includes("HYPERTROPHY")) return "4 × 8–12 reps, tempo 3-1-1, rest 75–90 sec";
  if (cat.includes("FUNCTIONAL STRENGTH")) return "4 × 6–10 reps, rest 90 sec";
  if (cat.includes("CARDIO") || title.includes("interval") || title.includes("conditioning")) return "3 rounds × 45 sec work / 15 sec transition, rest 90 sec after each round";
  if (cat.includes("WEIGHT LOSS") || title.includes("metabolic")) return "3 rounds × 40 sec work / 20 sec transition, rest 90 sec after each round";
  if (cat.includes("MOBILITY") || cat.includes("LOW BACK")) return "2–3 × 10–12 controlled reps, rest 45 sec";
  return "3 × 10–12 reps, rest 60 sec";
}

export function prescriptionForExercise(ex: LibExercise, category: string, dayTitle: string): string {
  if (!isStaticHoldExercise(ex)) return defaultPrescription(category, dayTitle);

  const cat = category.toUpperCase();
  const title = dayTitle.toLowerCase();
  if (cat.includes("FUNCTIONAL STRENGTH")) return "4 × 8-sec holds";
  if (cat.includes("CARDIO") || title.includes("interval") || title.includes("conditioning")) return "4 × 15-sec holds";
  if (cat.includes("WEIGHT LOSS") || title.includes("metabolic")) return "3 rounds × 20-sec holds";
  if (cat.includes("MOBILITY") || cat.includes("LOW BACK")) return "2 × 20-sec holds";
  return "3 × 10-sec holds";
}

export function buildExerciseBullet(ex: LibExercise, category: string, dayTitle: string): string {
  return `• {{exercise:${ex.id}:${ex.name}}} – ${prescriptionForExercise(ex, category, dayTitle)}`;
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
  const pool = matched.length >= n ? matched : [...matched, ...library.filter((ex) => !matched.some((m) => m.id === ex.id))];
  // Deterministic rotation so weeks vary but stay stable for the same input
  const seed = (weekIndex * 31 + dayIndex * 7) % Math.max(pool.length, 1);
  const candidates = Array.from({ length: pool.length }, (_, i) => pool[(seed + i) % pool.length]);
  const movementFamily = (ex: LibExercise): string => {
    const name = (ex.name || "").toLowerCase();
    if (/burpee|jack|jump|hop|bound/.test(name)) return "plyometric";
    if (/push|press|chest/.test(name)) return "push";
    if (/row|pull|chin/.test(name)) return "pull";
    if (/squat|lunge|leg/.test(name)) return "lower";
    if (/run|walk|step|mountain|climber/.test(name)) return "locomotion";
    if (/plank|crunch|sit|twist|core|abs/.test(name)) return "core";
    return (ex.body_part || ex.target || "general").toLowerCase();
  };
  const picks: LibExercise[] = [];
  const usedIds = new Set<string>();
  const usedFamilies = new Set<string>();
  for (const ex of candidates) {
    if (picks.length >= n) break;
    const family = movementFamily(ex);
    if (usedIds.has(ex.id)) continue;
    if (usedFamilies.has(family) && picks.length < Math.min(n, 4)) continue;
    usedIds.add(ex.id);
    usedFamilies.add(family);
    picks.push(ex);
  }
  for (const ex of candidates) {
    if (picks.length >= n) break;
    if (usedIds.has(ex.id)) continue;
    usedIds.add(ex.id);
    picks.push(ex);
  }
  return picks;
}

function sessionWarmUp(category: string, dayTitle: string): string[] {
  const cat = category.toUpperCase();
  if (cat.includes("MOBILITY") || cat.includes("LOW BACK")) {
    return ["• 3 minutes easy breathing and spinal decompression", "• 4–5 minutes gentle joint circles and pain-free range-of-motion rehearsal"];
  }
  if (cat.includes("WEIGHT LOSS") || dayTitle.toLowerCase().includes("metabolic")) {
    return ["• 3 minutes easy pulse-raiser", "• 3–5 minutes dynamic mobility for hips, shoulders, ankles, and trunk"];
  }
  return ["• 3–4 minutes easy cardio", "• 4–6 minutes dynamic mobility and ramp-up sets for the first two movements"];
}

function sessionFinisher(category: string, dayTitle: string): string {
  const cat = category.toUpperCase();
  const title = dayTitle.toLowerCase();
  if (cat.includes("MOBILITY") || cat.includes("LOW BACK")) return "• 4–6 minutes controlled breathing, unloaded carries, or gentle anti-rotation practice";
  if (cat.includes("HYPERTROPHY")) return "• 2 rounds of the final two movements with lighter load, controlled tempo, and 45 sec rest";
  if (cat.includes("FUNCTIONAL STRENGTH")) return "• 6 minutes density work using the safest loaded carry or full-body pattern from the main block";
  if (cat.includes("CARDIO") || cat.includes("WEIGHT LOSS") || title.includes("conditioning")) return "• 6–8 minutes steady finisher: repeat the final 3 movements at sustainable pace, rest only as needed";
  return "• 5 minutes easy density work using movements already listed above";
}

function sessionDuration(category: string): string {
  const cat = category.toUpperCase();
  if (cat.includes("MOBILITY") || cat.includes("LOW BACK")) return "30–40 minutes";
  if (cat.includes("HYPERTROPHY") || cat.includes("FUNCTIONAL STRENGTH")) return "45–60 minutes";
  return "35–50 minutes";
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
    return [
      `<strong>Estimated session time: ${sessionDuration(category)}</strong>`,
      "<strong>Warm-Up — 6–8 minutes</strong>",
      ...sessionWarmUp(category, dayTitle),
      "<strong>Main Block — 22–35 minutes</strong>",
      ...Array.from({ length: count }, (_, i) => `• Exercise ${i + 1} — sets × reps, rest period`),
      "<strong>Finisher — 4–8 minutes</strong>",
      sessionFinisher(category, dayTitle),
      "<strong>Cool Down — 5 minutes</strong>",
      "• Easy breathing, walking, and targeted stretching for the trained areas",
    ];
  }
  return [
    `<strong>Estimated session time: ${sessionDuration(category)}</strong>`,
    "<strong>Warm-Up — 6–8 minutes</strong>",
    ...sessionWarmUp(category, dayTitle),
    "<strong>Main Block — 22–35 minutes</strong>",
    ...picks.map((ex) => buildExerciseBullet(ex, category, dayTitle)),
    "<strong>Finisher — 4–8 minutes</strong>",
    sessionFinisher(category, dayTitle),
    "<strong>Cool Down — 5 minutes</strong>",
    "• Easy breathing, walking, and targeted stretching for the trained areas",
  ];
}

/**
 * Filter the full library down to the exercises permitted for a program.
 * Order is strict and non-negotiable:
 * 1. Equipment mode: bodyweight means bodyweight-only; equipment means equipment-only.
 * 2. Difficulty: exact difficulty only. No silent fallback to easier/harder tiers.
 * 3. Day focus is applied later in pickExercisesForDay without falling back to unrelated muscles.
 */
export function filterLibraryForProgram(
  library: LibExercise[],
  equipment: string,
  difficulty?: string,
): LibExercise[] {
  const equipLower = (equipment || "").toLowerCase();
  let pool = library;
  if (equipLower.includes("bodyweight") || equipLower === "body weight" || equipLower === "none - running shoes only") {
    pool = pool.filter(isHomeBodyweightFriendly);
  } else {
    pool = pool.filter((ex) => !isBodyweightExercise(ex));
  }
  pool = pool.filter(excludesStaticHolds);
  if (difficulty) {
    const targetDiff = difficulty.toLowerCase();
    pool = pool.filter((ex) => (ex.difficulty || "").toLowerCase() === targetDiff);
  }
  return pool;
}