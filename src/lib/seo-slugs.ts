type ContentRecord = {
  id?: string | null;
  name?: string | null;
  title?: string | null;
  category?: string | null;
};

export const slugifyContentName = (value: string | null | undefined): string => {
  const slug = String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return slug || "content";
};

export const buildUniqueContentSlugs = <T extends ContentRecord>(records: T[]): Map<string, string> => {
  const baseCounts = new Map<string, number>();
  const seen = new Map<string, number>();
  const result = new Map<string, string>();

  for (const record of records) {
    const base = slugifyContentName(record.name || record.title || record.id);
    baseCounts.set(base, (baseCounts.get(base) || 0) + 1);
  }

  for (const record of records) {
    if (!record.id) continue;
    const base = slugifyContentName(record.name || record.title || record.id);
    const next = (seen.get(base) || 0) + 1;
    seen.set(base, next);
    result.set(String(record.id), (baseCounts.get(base) || 0) > 1 ? `${base}-${next}` : base);
  }

  return result;
};

export const getWorkoutCategorySlug = (category: string | null | undefined, fallback = "strength"): string => {
  const c = String(category || "").toUpperCase().trim();
  const map: Record<string, string> = {
    STRENGTH: "strength",
    "CALORIE BURNING": "calorie-burning",
    METABOLIC: "metabolic",
    CARDIO: "cardio",
    "MOBILITY & STABILITY": "mobility",
    MOBILITY: "mobility",
    CHALLENGE: "challenge",
    PILATES: "pilates",
    RECOVERY: "recovery",
    "MICRO-WORKOUTS": "micro-workouts",
  };

  return map[c] || fallback;
};

export const getProgramCategorySlug = (category: string | null | undefined, fallback = "functional-strength"): string => {
  const c = String(category || "").toUpperCase().trim();
  const map: Record<string, string> = {
    "CARDIO ENDURANCE": "cardio-endurance",
    "FUNCTIONAL STRENGTH": "functional-strength",
    "MUSCLE HYPERTROPHY": "muscle-hypertrophy",
    "WEIGHT LOSS": "weight-loss",
    "LOW BACK PAIN": "low-back-pain",
    "MOBILITY & STABILITY": "mobility-stability",
  };

  return map[c] || fallback;
};

export const getWorkoutPath = (workout: ContentRecord, fallbackCategory?: string): string =>
  `/workout/${getWorkoutCategorySlug(workout.category, fallbackCategory || "strength")}/${slugifyContentName(workout.name || workout.title || workout.id)}`;

export const getProgramPath = (program: ContentRecord, fallbackCategory?: string): string =>
  `/trainingprogram/${getProgramCategorySlug(program.category, fallbackCategory || "functional-strength")}/${slugifyContentName(program.name || program.title || program.id)}`;