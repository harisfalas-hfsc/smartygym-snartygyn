/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * WOD INTEGRITY CONTRACT
 * Single source of truth for "is this WOD safe to publish?"
 *
 * Every path that can publish or accept a WOD (orchestrator, generator,
 * backup, watchdog, library fallback, manual admin) MUST run the candidate
 * through `validateWodPublishContract` and refuse to publish on failure.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { validateWodSections } from "./section-validator.ts";
import { getDayIn84Cycle, getPeriodizationForDay } from "./periodization-84day.ts";
import { WOD_PRICE_EUR as RULES_WOD_PRICE_EUR } from "./wod/rules.ts";

/** Re-exported so existing callers keep working. Single source: ./wod/rules.ts */
export const WOD_PRICE_EUR = RULES_WOD_PRICE_EUR;

export type WodEquipment = "BODYWEIGHT" | "EQUIPMENT" | "VARIOUS";

export interface WodCandidate {
  id?: string | null;
  name?: string | null;
  category?: string | null;
  equipment?: string | null;
  format?: string | null;
  description?: string | null;
  main_workout?: string | null;
  instructions?: string | null;
  tips?: string | null;
  image_url?: string | null;
  is_standalone_purchase?: boolean | null;
  is_visible?: boolean | null;
  is_premium?: boolean | null;
  price?: number | null;
  stripe_product_id?: string | null;
  stripe_price_id?: string | null;
  generated_for_date?: string | null;
  is_workout_of_day?: boolean | null;
  type?: string | null;
  wod_source?: string | null;
}

export interface WodValidationResult {
  ok: boolean;
  failures: string[];
  warnings: string[];
}

export type WodContractMode = "structural" | "full";

export interface WodContractOptions {
  /**
   * "structural" (default for orchestrator success path):
   *   Validate everything EXCEPT image_url and Stripe IDs. Used while those
   *   assets are still being created in the background by `auto-generate-
   *   workout-image` and `wod-stripe-link` (PLAN A+B+E).
   * "full":
   *   Strict validation including image_url and Stripe IDs. Used by the
   *   watchdog and any final-state checks.
   */
  mode?: WodContractMode;
}

/**
 * Returns the expected publish slots for a given Cyprus date based on the
 * 84-day periodization cycle. Recovery days require one VARIOUS WOD; all
 * other days require both BODYWEIGHT and EQUIPMENT.
 */
export function getExpectedSlotsForDate(dateStr: string): {
  isRecoveryDay: boolean;
  category: string;
  expected: WodEquipment[];
} {
  const dayIn84 = getDayIn84Cycle(dateStr);
  const periodization = getPeriodizationForDay(dayIn84);
  const isRecoveryDay = periodization.category === "RECOVERY";
  return {
    isRecoveryDay,
    category: periodization.category,
    expected: isRecoveryDay ? ["VARIOUS"] : ["BODYWEIGHT", "EQUIPMENT"],
  };
}

const FORBIDDEN_PUBLIC_NAME_PATTERNS: RegExp[] = [
  /\d/,
  /\b\d{4}(BW|EQ|V)\b$/i,
  /\b\d{6,}\b$/,
  /\b(v\d+|#\d+)\b$/i,
  /\b(II|III|IV|V|VI|VII|VIII|IX|X)\b$/,
  /\b(axial|matrix|meridian|protocol|helix|arcus|synergy|conduit|integration|current|vector|quantum|algorithm|neural|system|module|phase|sequence)\b/i,
];

function hasForbiddenPublicName(name: string): boolean {
  const trimmed = name.trim();
  return FORBIDDEN_PUBLIC_NAME_PATTERNS.some((re) => re.test(trimmed));
}

const RAW_PLACEHOLDER_RE = /\{\{exercise:[^}]+\}\}/i;
const STRIPE_PRODUCT_RE = /^prod_[A-Za-z0-9]+$/;
const STRIPE_PRICE_RE = /^price_[A-Za-z0-9]+$/;
const HTTPS_URL_RE = /^https:\/\//;

/**
 * Apply the WOD publish contract. Returns ok=true only when every required
 * field, structural rule, image, payment link, and metadata association is
 * present and consistent. Used by every WOD path.
 */
export function validateWodPublishContract(
  wod: WodCandidate,
  expectedDate: string,
  options: WodContractOptions = {},
): WodValidationResult {
  const mode: WodContractMode = options.mode ?? "full";
  const failures: string[] = [];
  const warnings: string[] = [];

  if (!wod.id) failures.push("missing id");
  if (!wod.name || hasForbiddenPublicName(wod.name)) {
    failures.push(`invalid public name: ${wod.name ?? "<null>"}`);
  }

  // Slot consistency
  const slots = getExpectedSlotsForDate(expectedDate);
  const equipment = (wod.equipment || "").toUpperCase() as WodEquipment;
  if (!slots.expected.includes(equipment)) {
    failures.push(
      `equipment ${equipment || "<empty>"} does not match expected slots [${slots.expected.join(", ")}] for ${expectedDate}`,
    );
  }

  if (slots.isRecoveryDay) {
    if ((wod.category || "").toUpperCase() !== "RECOVERY") {
      warnings.push(`category ${wod.category} on a recovery day (expected RECOVERY)`);
    }
  } else {
    if ((wod.category || "").toUpperCase() === "RECOVERY") {
      failures.push("RECOVERY workout published on a non-recovery day");
    }
  }

  // Required user-facing fields
  const description = (wod.description || "").trim();
  const mainWorkout = (wod.main_workout || "").trim();
  const instructions = (wod.instructions || "").trim();
  const tips = (wod.tips || "").trim();

  if (description.length < 80) failures.push("description too short or missing (min 80 chars)");
  if (mainWorkout.length < 200) failures.push("main_workout too short or missing");
  if (instructions.length < 80) failures.push("instructions too short or missing (min 80 chars)");
  if (tips.length < 80) failures.push("tips too short or missing (min 80 chars)");

  // Sections + density on main_workout
  const sectionResult = validateWodSections(mainWorkout, slots.isRecoveryDay);
  if (!sectionResult.isComplete) {
    if (sectionResult.missingSections.length > 0) {
      failures.push(`main_workout missing sections: ${sectionResult.missingSections.join(", ")}`);
    }
    if (sectionResult.exerciseContentIssues.length > 0) {
      failures.push(`main_workout exercise density: ${sectionResult.exerciseContentIssues.join("; ")}`);
    }
  }

  // Instructions and tips MUST NOT contain raw exercise placeholders.
  // Library exercise tags belong only inside main_workout.
  if (RAW_PLACEHOLDER_RE.test(instructions)) {
    failures.push("instructions contain raw {{exercise:...}} placeholders");
  }
  if (RAW_PLACEHOLDER_RE.test(tips)) {
    failures.push("tips contain raw {{exercise:...}} placeholders");
  }

  // Image (asset — only enforced in full mode)
  if (mode === "full") {
    if (!wod.image_url || !HTTPS_URL_RE.test(wod.image_url)) {
      failures.push("missing or invalid image_url");
    }
  }

  // Visibility / publishing flags
  if (wod.is_workout_of_day !== true) failures.push("is_workout_of_day must be true");
  if (wod.is_visible !== true) failures.push("is_visible must be true");
  if (wod.generated_for_date !== expectedDate) {
    failures.push(`generated_for_date ${wod.generated_for_date} does not match expected ${expectedDate}`);
  }

  // Payment contract
  if (wod.is_standalone_purchase !== true) failures.push("is_standalone_purchase must be true");
  if (!wod.price || Number(wod.price) <= 0) failures.push("price must be > 0");
  // Stripe IDs (asset — only enforced in full mode)
  if (mode === "full") {
    if (!wod.stripe_product_id || !STRIPE_PRODUCT_RE.test(wod.stripe_product_id)) {
      failures.push("missing or invalid stripe_product_id");
    }
    if (!wod.stripe_price_id || !STRIPE_PRICE_RE.test(wod.stripe_price_id)) {
      failures.push("missing or invalid stripe_price_id");
    }
  } else {
    // Structural mode: do NOT fail on missing assets, but DO fail on partial
    // Stripe state (one ID set but not the other) since that means corruption.
    if ((wod.stripe_product_id == null) !== (wod.stripe_price_id == null)) {
      failures.push("partial stripe link state (one id set, the other null)");
    }
  }

  return { ok: failures.length === 0, failures, warnings };
}

/**
 * Validate that the day's full set of WODs (one or two, depending on day type)
 * is publish-safe. All-or-none: if ANY slot fails, the whole day fails.
 */
export function validateDayPublishContract(
  wods: WodCandidate[],
  expectedDate: string,
  options: WodContractOptions = {},
): WodValidationResult & { perWod: Array<{ id?: string | null; equipment?: string | null; result: WodValidationResult }> } {
  const failures: string[] = [];
  const warnings: string[] = [];
  const perWod: Array<{ id?: string | null; equipment?: string | null; result: WodValidationResult }> = [];

  const slots = getExpectedSlotsForDate(expectedDate);

  for (const slot of slots.expected) {
    const match = wods.find((w) => (w.equipment || "").toUpperCase() === slot);
    if (!match) {
      failures.push(`missing ${slot} WOD for ${expectedDate}`);
    }
  }

  for (const wod of wods) {
    const result = validateWodPublishContract(wod, expectedDate, options);
    perWod.push({ id: wod.id, equipment: wod.equipment, result });
    if (!result.ok) {
      failures.push(`${wod.equipment || "?"}/${wod.id || "?"}: ${result.failures.join("; ")}`);
    }
    warnings.push(...result.warnings);
  }

  return {
    ok: failures.length === 0,
    failures,
    warnings,
    perWod,
  };
}