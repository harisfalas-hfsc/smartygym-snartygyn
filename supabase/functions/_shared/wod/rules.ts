/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * WOD RULES — single source of truth for WOD-eligible categories.
 *
 * Re-exports the canonical periodization data so every WOD code path imports
 * rules from one place instead of duplicating tables. Behavior unchanged.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export {
  FORMATS_BY_CATEGORY,
  STRENGTH_DAY_FOCUS,
  PERIODIZATION_84DAY,
  CYCLE_START_DATE,
} from "../periodization-84day.ts";

/** Categories that participate in the WOD periodization cycle. */
export const WOD_CATEGORIES = [
  "STRENGTH",
  "CALORIE BURNING",
  "METABOLIC",
  "CARDIO",
  "MOBILITY & STABILITY",
  "CHALLENGE",
  "PILATES",
  "RECOVERY",
] as const;
export type WodCategory = (typeof WOD_CATEGORIES)[number];

/** Categories explicitly excluded from the WOD cycle. */
export const NON_WOD_CATEGORIES = ["MICRO-WORKOUTS"] as const;

/** Categories whose format is fixed (no rotation allowed). */
export const FIXED_FORMAT_CATEGORIES: Record<string, string> = {
  STRENGTH: "REPS & SETS",
  "MOBILITY & STABILITY": "REPS & SETS",
  PILATES: "REPS & SETS",
  RECOVERY: "MIX",
};

/** Strength-only focus pool. */
export const STRENGTH_FOCUSES = [
  "LOWER BODY",
  "UPPER BODY",
  "FULL BODY",
  "LOW PUSH & UPPER PULL",
  "LOW PULL & UPPER PUSH",
  "CORE & GLUTES",
] as const;

/** Standard WOD price (EUR). */
export const WOD_PRICE_EUR = 3.99;

/** Required Stripe metadata for every WOD product. */
export const WOD_STRIPE_METADATA = {
  project: "SMARTYGYM",
  content_type: "Workout",
} as const;

/** Equipment slots required per day type. */
export function expectedSlotsForCategory(category: string): readonly ("BODYWEIGHT" | "EQUIPMENT" | "VARIOUS")[] {
  return category === "RECOVERY" ? ["VARIOUS"] : ["BODYWEIGHT", "EQUIPMENT"];
}

/** True when the category requires a fixed format. */
export function isFixedFormatCategory(category: string): boolean {
  return category in FIXED_FORMAT_CATEGORIES;
}

/** Returns the fixed format for a category, or null if rotation is allowed. */
export function fixedFormatFor(category: string): string | null {
  return FIXED_FORMAT_CATEGORIES[category] ?? null;
}