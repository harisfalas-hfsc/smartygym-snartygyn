import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { getEmailHeaders, getEmailFooter } from "../_shared/email-utils.ts";
import { MESSAGE_TYPES } from "../_shared/notification-types.ts";
import { 
  processContentSectionAware, 
  logUnmatchedExercises,
  fetchAndBuildExerciseReference,
  buildExerciseReferenceList,
  guaranteeAllExercisesLinked,
  rejectNonLibraryExercises,
  type ExerciseBasic 
} from "../_shared/exercise-matching.ts";
import { normalizeWorkoutHtml, validateWorkoutHtml } from "../_shared/html-normalizer.ts";
import { validateWodSections } from "../_shared/section-validator.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ═══════════════════════════════════════════════════════════════════════════════
// SIMPLIFIED 84-DAY PERIODIZATION CYCLE
// Single cycle from Day 1 to Day 84, then restarts. Each day has fixed category & difficulty.
// ═══════════════════════════════════════════════════════════════════════════════

import { 
  PERIODIZATION_84DAY, 
  getDayIn84Cycle, 
  getPeriodizationForDay, 
  getCategoryForDay,
  CYCLE_START_DATE,
  FORMATS_BY_CATEGORY,
  STRENGTH_DAY_FOCUS
} from "../_shared/periodization-84day.ts";

function logStep(step: string, details?: any) {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GENERATE-WOD] ${step}${detailsStr}`);
}

function hasInternalNameCode(name: string): boolean {
  const trimmed = name.trim();
  return /\d/.test(trimmed)
    || /\b\d{4}(BW|EQ|V)\b$/i.test(trimmed)
    || /\b\d{6,}\b$/.test(trimmed)
    || /\b(v\d+|#\d+)\b$/i.test(trimmed)
    || /\b(II|III|IV|V|VI|VII|VIII|IX|X)\b$/.test(trimmed);
}

function hasAiStyleName(name: string): boolean {
  return /\b(axial|matrix|meridian|protocol|helix|arcus|synergy|conduit|integration|current|vector|quantum|algorithm|neural|system|module|phase|sequence)\b/i.test(name.trim());
}

async function archiveStripeProductSafely(stripe: Stripe, productId: string | null, reason: string) {
  if (!productId) return;
  try {
    logStep("Archiving unsafe/unlinked Stripe product", { productId, reason });
    await stripe.products.update(productId, {
      active: false,
      metadata: {
        cleanup_reason: reason,
        archived_by: "wod_generation_guard",
        archived_at: new Date().toISOString(),
      },
    });
  } catch (archiveErr: any) {
    logStep("Failed to archive unsafe/unlinked Stripe product", { productId, error: archiveErr?.message || String(archiveErr) });
  }
}

async function runWodStripeCleanup(reason: string, dryRun = false) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) return;

  try {
    logStep("Running WOD Stripe cleanup", { reason, dryRun });
    const response = await fetch(`${supabaseUrl}/functions/v1/cleanup-wod-stripe-orphans`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Secret": serviceKey,
      },
      body: JSON.stringify({ dryRun, scope: "wod", reason }),
    });
    const resultText = await response.text();
    logStep("WOD Stripe cleanup finished", { ok: response.ok, status: response.status, result: resultText.slice(0, 500) });
  } catch (cleanupError: any) {
    logStep("WOD Stripe cleanup failed", { reason, error: cleanupError?.message || String(cleanupError) });
  }
}

function cleanPublicWorkoutName(
  rawName: string,
  category: string,
  equipment: string,
  existingNames: string[],
): { name: string; changed: boolean; reason: string } {
  const normalizedExisting = new Set(existingNames.map((name) => name.trim().toLowerCase()));
  const baseName = rawName
    .replace(/\s+\d{4}(BW|EQ|V)\b$/i, "")
    .replace(/\s+\b(v\d+|#\d+|II|III|IV|V|VI|VII|VIII|IX|X)\b$/i, "")
    .replace(/\s+/g, " ")
    .trim();

  const candidateIsClean = baseName.length >= 5
    && baseName.split(/\s+/).length <= 4
    && !hasInternalNameCode(baseName)
    && !hasAiStyleName(baseName)
    && !normalizedExisting.has(baseName.toLowerCase());

  if (candidateIsClean) {
    return { name: baseName, changed: baseName !== rawName.trim(), reason: baseName !== rawName.trim() ? "removed internal suffix" : "clean" };
  }

  const categoryWord = category === "STRENGTH" ? "Strength"
    : category === "CALORIE BURNING" ? "Conditioning"
    : category === "METABOLIC" ? "Engine"
    : category === "CARDIO" ? "Cardio"
    : category === "MOBILITY & STABILITY" ? "Control"
    : category === "PILATES" ? "Pilates"
    : category === "RECOVERY" ? "Recovery"
    : category === "CHALLENGE" ? "Challenge"
    : "Training";
  const equipmentWord = equipment === "BODYWEIGHT" ? "Bodyweight" : equipment === "EQUIPMENT" ? "Loaded" : "Athletic";
  const fallbackNames = [
    `${equipmentWord} ${categoryWord} Session`,
    `${categoryWord} Tempo Circuit`,
    `Athletic ${categoryWord} Builder`,
    `${equipmentWord} Movement Flow`,
    `${categoryWord} Control Session`,
    `Precision ${categoryWord} Circuit`,
    `${equipmentWord} Performance Block`,
    `Focused ${categoryWord} Practice`,
  ];

  const fallback = fallbackNames.find((name) => !normalizedExisting.has(name.toLowerCase()))
    || `${equipmentWord} ${categoryWord} Practice`;

  return { name: fallback, changed: true, reason: "duplicate, internal-code, or AI-style name" };
}

async function rollbackActiveWodsForDate(
  supabase: any,
  effectiveDate: string,
  reason: string,
) {
  logStep("ROLLBACK: Clearing partial WOD publish", { effectiveDate, reason });

  const { data: activeWods, error: fetchError } = await supabase
    .from("admin_workouts")
    .select("id, name, equipment")
    .eq("generated_for_date", effectiveDate)
    .eq("is_workout_of_day", true);

  if (fetchError) {
    logStep("ROLLBACK: Failed to inspect active WODs", { effectiveDate, error: fetchError.message });
    return;
  }

  if (!activeWods || activeWods.length === 0) {
    logStep("ROLLBACK: No active WODs to clear", { effectiveDate });
    return;
  }

  const { error: rollbackError } = await supabase
    .from("admin_workouts")
    .update({
      is_workout_of_day: false,
      generated_for_date: null,
      is_visible: false,
      updated_at: new Date().toISOString(),
    })
    .eq("generated_for_date", effectiveDate)
    .eq("is_workout_of_day", true);

  if (rollbackError) {
    logStep("ROLLBACK: Failed to clear partial WOD publish", { effectiveDate, error: rollbackError.message });
    return;
  }

  logStep("ROLLBACK: Cleared partial WOD publish", {
    effectiveDate,
    cleared: activeWods.map((w: any) => ({ id: w.id, name: w.name, equipment: w.equipment })),
  });
}

async function createDeterministicIdempotencyKey(prefix: string, payload: Record<string, unknown>) {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(JSON.stringify(payload));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const hash = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return `${prefix}:${hash.slice(0, 32)}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIMPLIFIED 84-DAY PERIODIZATION - Direct lookup, no compatibility layers
// ═══════════════════════════════════════════════════════════════════════════════

// Get difficulty info directly from 84-day periodization (now uses ranges)
function getDifficultyForDay(dayIn84: number): { name: string | null; stars: number | null; range: [number, number] | null } {
  const periodization = getPeriodizationForDay(dayIn84);
  
  if (!periodization.difficulty || !periodization.difficultyStars) {
    return { name: null, stars: null, range: null };
  }
  
  // difficultyStars is now [min, max] range - pick a random star from range
  const range = periodization.difficultyStars;
  const selectedStar = Math.random() < 0.5 ? range[0] : range[1];
  
  logStep("Difficulty lookup (84-day)", {
    dayIn84,
    category: periodization.category,
    difficulty: periodization.difficulty,
    range,
    selectedStar
  });
  
  return { 
    name: periodization.difficulty, 
    stars: selectedStar,
    range
  };
}

// Get format for category with rotation and validation
function getFormatForCategory(
  category: string, 
  formatUsage: Record<string, string[]>
): { format: string; updatedUsage: Record<string, string[]> } {
  const validFormats = FORMATS_BY_CATEGORY[category] || ["CIRCUIT"];
  const usedFormats = formatUsage[category] || [];
  
  // Find formats that haven't been used yet
  const availableFormats = validFormats.filter(f => !usedFormats.includes(f));
  
  let selectedFormat: string;
  let newUsedFormats: string[];
  
  if (availableFormats.length > 0) {
    // Pick a random available format
    selectedFormat = availableFormats[Math.floor(Math.random() * availableFormats.length)];
    newUsedFormats = [...usedFormats, selectedFormat];
  } else {
    // All formats used, reset and pick one
    selectedFormat = validFormats[Math.floor(Math.random() * validFormats.length)];
    newUsedFormats = [selectedFormat];
  }
  
  logStep("Format selection", {
    category,
    validFormats,
    usedFormats,
    selectedFormat
  });
  
  return {
    format: selectedFormat,
    updatedUsage: {
      ...formatUsage,
      [category]: newUsedFormats
    }
  };
}

// Check for manual override for a specific date
function checkManualOverride(
  dateStr: string, 
  overrides: Record<string, any>
): { category?: string; format?: string; difficulty?: number } | null {
  if (overrides && overrides[dateStr]) {
    return overrides[dateStr];
  }
  return null;
}

// Calculate future WOD schedule for admin preview (28-day fixed cycle)
// Calculate future WOD schedule using 84-day cycle
export function calculateFutureWODSchedule(
  daysAhead: number = 84
): Array<{ date: string; dayIn84: number; category: string; difficulty: { name: string | null; stars: number | null }; formats: string[]; isRecoveryDay: boolean }> {
  const schedule = [];
  
  for (let i = 1; i <= daysAhead; i++) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + i);
    const futureDateStr = futureDate.toISOString().split('T')[0];
    
    const dayIn84 = getDayIn84Cycle(futureDateStr);
    const periodization = getPeriodizationForDay(dayIn84);
    const category = periodization.category;
    const isRecoveryDay = category === "RECOVERY";
    
    // Get difficulty directly from 84-day periodization
    const difficulty = getDifficultyForDay(dayIn84);
    const formats = FORMATS_BY_CATEGORY[category] || ["CIRCUIT"];
    
    schedule.push({
      date: futureDateStr,
      dayIn84,
      category,
      difficulty: { name: difficulty.name, stars: difficulty.stars },
      formats,
      isRecoveryDay
    });
  }
  
  return schedule;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let cleanupSupabase: any = null;
  let effectiveDateForCleanup: string | null = null;

  try {
    // Parse request body
    let targetDate: string | null = null;
    let skipNotifications = false;
    let retryMissing = false;
    
    try {
      const body = await req.json();
      targetDate = body?.targetDate || null;
      skipNotifications = body?.skipNotifications || false;
      retryMissing = body?.retryMissing || false;
    } catch {
      // No body or invalid JSON - use defaults
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // CRITICAL: Use Cyprus timezone (Europe/Athens, UTC+2/+3) for date calculation
    // The cron runs at 00:30 UTC - we use Intl.DateTimeFormat for proper DST handling
    // ═══════════════════════════════════════════════════════════════════════════════
    const now = new Date();
    
    // Use Intl.DateTimeFormat to get the correct date in Europe/Athens timezone
    // This automatically handles DST transitions correctly
    const cyprusFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Athens',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const cyprusDateStr = cyprusFormatter.format(now); // Returns YYYY-MM-DD format
    
    logStep("Timezone calculation", {
      utcNow: now.toISOString(),
      cyprusDateStr,
      timezone: 'Europe/Athens'
    });
    
    // Determine the effective date for generation
    const effectiveDate = targetDate || cyprusDateStr;
    const isPreGeneration = targetDate && targetDate !== cyprusDateStr;
    
    logStep("Starting WOD generation", { 
      effectiveDate, 
      isPreGeneration,
      targetDate,
      cyprusDateStr
    });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");

    if (!lovableApiKey) throw new Error("LOVABLE_API_KEY is not configured");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not configured");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    cleanupSupabase = supabase;
    effectiveDateForCleanup = effectiveDate;

    // ═══════════════════════════════════════════════════════════════════════════════
    // EARLY RECOVERY DAY CHECK: Using simplified 84-day cycle
    // ═══════════════════════════════════════════════════════════════════════════════
    const dayIn84 = getDayIn84Cycle(effectiveDate);
    const earlyPeriodization = getPeriodizationForDay(dayIn84);
    const isRecoveryDayEarly = earlyPeriodization.category === "RECOVERY";
    
    // Check what already exists for this date (idempotent + supports retryMissing)
    // CRITICAL: Fetch FULL workout details including main_workout for section validation
    const { data: existingWODsForDate, error: existingWODsError } = await supabase
      .from("admin_workouts")
      .select("id, name, equipment, generated_for_date, category, difficulty, difficulty_stars, format, main_workout")
      .eq("generated_for_date", effectiveDate)
      .eq("is_workout_of_day", true);

    if (existingWODsError) {
      logStep("ERROR checking existing WODs", { error: existingWODsError.message, effectiveDate });
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // RECOVERY: Only ONE MIXED workout / Other categories: BODYWEIGHT + EQUIPMENT
    // ═══════════════════════════════════════════════════════════════════════════════
    const bodyweightAlreadyExists = existingWODsForDate?.some((w) => w.equipment === "BODYWEIGHT") ?? false;
    const equipmentAlreadyExists = existingWODsForDate?.some((w) => w.equipment === "EQUIPMENT") ?? false;
    // CRITICAL FIX: Recovery uses VARIOUS (not MIXED) to match database constraint valid_equipment
    const variousAlreadyExists = existingWODsForDate?.some((w) => w.equipment === "VARIOUS") ?? false;

    // ═══════════════════════════════════════════════════════════════════════════════
    // SECTION COMPLETENESS CHECK: An existing WOD only counts if it has all sections
    // If retryMissing=true, archive malformed WODs so they get regenerated
    // ═══════════════════════════════════════════════════════════════════════════════
    let bodyweightComplete = bodyweightAlreadyExists;
    let equipmentComplete = equipmentAlreadyExists;
    let variousComplete = variousAlreadyExists;
    
    if (existingWODsForDate && existingWODsForDate.length > 0) {
      for (const existingWod of existingWODsForDate) {
        const sectionCheck = validateWodSections(existingWod.main_workout, isRecoveryDayEarly);
        if (!sectionCheck.isComplete) {
          logStep(`⚠️ Existing WOD ${existingWod.id} (${existingWod.equipment}) is INCOMPLETE`, {
            missing: sectionCheck.missingSections,
            name: existingWod.name
          });
          
          if (existingWod.equipment === "BODYWEIGHT") bodyweightComplete = false;
          else if (existingWod.equipment === "EQUIPMENT") equipmentComplete = false;
          else if (existingWod.equipment === "VARIOUS") variousComplete = false;
          
          // Archive the malformed WOD if retryMissing (so it doesn't block regeneration)
          if (retryMissing) {
            logStep(`Archiving malformed WOD ${existingWod.id} and hiding from gallery`, { equipment: existingWod.equipment });
            await supabase
              .from("admin_workouts")
              .update({ is_workout_of_day: false, generated_for_date: null, is_visible: false })
              .eq("id", existingWod.id);
          }
        }
      }
    }

    // For non-recovery days, determine what needs to be generated (using completeness check)
    const allEquipmentTypes = ["BODYWEIGHT", "EQUIPMENT"] as const;
    const equipmentTypesToGenerate = allEquipmentTypes.filter((e) =>
      e === "BODYWEIGHT" ? !bodyweightComplete : !equipmentComplete
    );
    
    logStep("Equipment check", {
      isRecoveryDayEarly,
      bodyweightAlreadyExists,
      equipmentAlreadyExists,
      variousAlreadyExists,
      bodyweightComplete,
      equipmentComplete,
      variousComplete,
      equipmentTypesToGenerate
    });

    // ═══════════════════════════════════════════════════════════════════════════════
    // CRITICAL FIX: When retryMissing and one workout exists, use ITS category/difficulty
    // Format is ONLY forced for STRENGTH and MOBILITY & STABILITY (both must be REPS & SETS)
    // Other categories can have different formats between BODYWEIGHT and EQUIPMENT
    // ═══════════════════════════════════════════════════════════════════════════════
    let forcedParameters: { category: string; difficulty: { name: string; stars: number }; format: string | null } | null = null;
    
    if (retryMissing && existingWODsForDate && existingWODsForDate.length === 1) {
      const existingWOD = existingWODsForDate[0];
      if (existingWOD.category && existingWOD.difficulty_stars) {
        // Only force format for STRENGTH and MOBILITY & STABILITY (must be REPS & SETS)
        const forceFormat = existingWOD.category === "STRENGTH" || existingWOD.category === "MOBILITY & STABILITY";
        
        forcedParameters = {
          category: existingWOD.category,
          difficulty: {
            name: existingWOD.difficulty || (existingWOD.difficulty_stars <= 2 ? "Beginner" : existingWOD.difficulty_stars <= 4 ? "Intermediate" : "Advanced"),
            stars: existingWOD.difficulty_stars
          },
          format: forceFormat ? existingWOD.format : null // Only force format for STRENGTH/MOBILITY
        };
        logStep("FORCING PARAMETERS FROM EXISTING WORKOUT", {
          existingWorkoutId: existingWOD.id,
          existingWorkoutName: existingWOD.name,
          existingEquipment: existingWOD.equipment,
          forcedCategory: forcedParameters.category,
          forcedDifficulty: forcedParameters.difficulty,
          forcedFormat: forcedParameters.format,
          formatForced: forceFormat
        });
      }
    }

    logStep("Existing WOD check", {
      effectiveDate,
      existingCount: existingWODsForDate?.length || 0,
      bodyweightAlreadyExists,
      equipmentAlreadyExists,
      retryMissing,
      equipmentTypesToGenerate,
      hasForcedParameters: !!forcedParameters,
    });

    // Get current state
    const { data: stateData, error: stateError } = await supabase
      .from("workout_of_day_state")
      .select("*")
      .limit(1)
      .single();

    if (stateError && stateError.code !== "PGRST116") {
      throw new Error(`Failed to get state: ${stateError.message}`);
    }

    let state = stateData || {
      day_count: 0,
      week_number: 1,
      used_stars_in_week: {},
      manual_overrides: {},
      equipment_bodyweight_count: 0,
      equipment_with_count: 0,
      difficulty_beginner_count: 0,
      difficulty_intermediate_count: 0,
      difficulty_advanced_count: 0,
      format_usage: {}
    };

    logStep("Current state", state);

    // ═══════════════════════════════════════════════════════════════════════════════
    // NOTE: Archiving now happens in separate archive-old-wods function at 00:00 UTC
    // This generator runs at 00:30 UTC and only creates new WODs
    // ═══════════════════════════════════════════════════════════════════════════════

    // ═══════════════════════════════════════════════════════════════════════════════
    // CALCULATE TODAY'S WOD PARAMETERS (28-DAY FIXED CYCLE - DATE-BASED)
    // CRITICAL: Categories and difficulties are FIXED per day in 84-day cycle
    // ═══════════════════════════════════════════════════════════════════════════════
    
    // Use DATE-BASED calculation - dayIn84 was calculated earlier for early recovery check
    const periodization = earlyPeriodization;
    const manualOverrides = state.manual_overrides || {};
    
    // Check if this is a RECOVERY day (days 10, 28, 38, 56, 66, 84) - reuse early check
    const isRecoveryDay = isRecoveryDayEarly;
    
    logStep("84-Day Cycle Parameters", { 
      effectiveDate,
      dayIn84,
      expectedCategory: periodization.category,
      expectedDifficulty: periodization.difficulty,
      isRecoveryDay,
      legacyDayCount: state.day_count // Keep for debugging comparison
    });

    // Check for manual override for today
    const override = checkManualOverride(effectiveDate, manualOverrides);
    
    // ═══════════════════════════════════════════════════════════════════════════════
    // CATEGORY AND DIFFICULTY: Must be the SAME for both workouts
    // FORMAT AND DURATION: Can be DIFFERENT for each workout (except STRENGTH/MOBILITY)
    // ═══════════════════════════════════════════════════════════════════════════════
    let category: string;
    let selectedDifficulty: { name: string; stars: number };
    let updatedUsage: Record<string, string[]> = state.format_usage || {};
    
    // Category and difficulty are determined ONCE for both workouts
    if (forcedParameters) {
      // When retrying, ALWAYS match the existing workout's category and difficulty
      logStep("USING FORCED PARAMETERS FROM EXISTING WORKOUT", forcedParameters);
      category = forcedParameters.category;
      selectedDifficulty = forcedParameters.difficulty;
    } else if (override) {
      logStep("USING MANUAL OVERRIDE", override);
      category = override.category || getCategoryForDay(dayIn84);
      if (override.difficulty) {
        selectedDifficulty = { 
          name: override.difficulty <= 2 ? "Beginner" : override.difficulty <= 4 ? "Intermediate" : "Advanced",
          stars: override.difficulty 
        };
      } else {
        const diffResult = getDifficultyForDay(dayIn84);
        selectedDifficulty = {
          name: diffResult.name || "Beginner",
          stars: diffResult.stars || 1
        };
      }
    } else {
      // Normal calculation from 84-day periodization
      category = getCategoryForDay(dayIn84);
      const diffResult = getDifficultyForDay(dayIn84);
      // Handle RECOVERY days (null difficulty)
      if (isRecoveryDay || !diffResult.name || !diffResult.stars) {
        selectedDifficulty = { name: "Recovery", stars: 0 };
      } else {
        selectedDifficulty = { name: diffResult.name, stars: diffResult.stars };
      }
    }
    
    logStep("Today's WOD specs (84-day cycle)", { 
      dayIn84,
      category, 
      difficulty: selectedDifficulty,
      isOverride: !!override,
      hasForcedParameters: !!forcedParameters
    });

    // Duration calculation function - returns MAIN WORKOUT + FINISHER time ONLY
    // Warm-up (Soft Tissue 5' + Activation 10-15') and Cool Down (10') are constant overhead
    // and NOT included in the advertised duration. Customers care about "how long is the work?"
    const getDuration = (fmt: string, stars: number): string => {
      const baseDurations: Record<string, number[]> = {
        "REPS & SETS": [25, 35, 50],
        "CIRCUIT": [20, 30, 45],
        "TABATA": [15, 25, 35],
        "AMRAP": [15, 25, 40],
        "EMOM": [15, 25, 35],
        "FOR TIME": [0, 0, 0],
        "MIX": [20, 30, 45]
      };
      
      if (fmt === "FOR TIME") return "Various";
      
      const [minDuration, midDuration, maxDuration] = baseDurations[fmt] || [20, 30, 45];
      
      if (stars <= 2) return `${minDuration} min`;
      if (stars <= 4) return `${midDuration} min`;
      return `${maxDuration} min`;
    };
    
    // ═══════════════════════════════════════════════════════════════════════════════
    // FORMAT SELECTION: STRENGTH, MOBILITY & STABILITY, and PILATES = always REPS & SETS
    // RECOVERY = always MIX format (one mixed workout, no difficulty)
    // Other categories can have different formats per equipment type
    // ═══════════════════════════════════════════════════════════════════════════════
    const getFormatForWorkout = (cat: string, equipType: string): { format: string; duration: string } => {
      // RECOVERY: Always MIX format, 30-45 min duration (no difficulty stars)
      if (cat === "RECOVERY") {
        return { format: "MIX", duration: "30-45 min" };
      }
      
      // STRENGTH, MOBILITY & STABILITY, and PILATES: MUST be REPS & SETS for both workouts
      if (cat === "STRENGTH" || cat === "MOBILITY & STABILITY" || cat === "PILATES") {
        const fmt = "REPS & SETS";
        return { format: fmt, duration: getDuration(fmt, selectedDifficulty.stars) };
      }
      
      // For retry with forced parameters and format is specified (should only happen for STRENGTH/MOBILITY)
      if (forcedParameters?.format) {
        return { format: forcedParameters.format, duration: getDuration(forcedParameters.format, selectedDifficulty.stars) };
      }
      
      // For manual override format
      if (override?.format) {
        return { format: override.format, duration: getDuration(override.format, selectedDifficulty.stars) };
      }
      
      // Normal calculation - each workout gets its own format from valid options
      const formatResult = getFormatForCategory(cat, updatedUsage);
      updatedUsage = formatResult.updatedUsage; // Update for next workout
      
      logStep(`Format selected for ${equipType}`, { 
        category: cat, 
        format: formatResult.format,
        equipType 
      });
      
      return { 
        format: formatResult.format, 
        duration: getDuration(formatResult.format, selectedDifficulty.stars) 
      };
    };

    // Category prefixes for IDs
    const categoryPrefixes: Record<string, string> = {
      "STRENGTH": "S",
      "CALORIE BURNING": "CB",
      "METABOLIC": "M",
      "CARDIO": "CA",
      "MOBILITY & STABILITY": "MS",
      "CHALLENGE": "CH",
      "PILATES": "PIL",
      "RECOVERY": "REC"
    };
    const prefix = categoryPrefixes[category] || "W";
    const timestamp = Date.now();

    // ═══════════════════════════════════════════════════════════════════════════════
    // PERIODIZATION CONTEXT: Fetch yesterday's WOD and calculate tomorrow's specs
    // ═══════════════════════════════════════════════════════════════════════════════
    const yesterdayDate = new Date(new Date(effectiveDate).getTime() - 86400000).toISOString().split('T')[0];
    
    const { data: yesterdayWods } = await supabase
      .from("admin_workouts")
      .select("name, category, difficulty_stars, equipment, format")
      .eq("is_workout_of_day", true)
      .eq("generated_for_date", yesterdayDate)
      .limit(2);
    
    const yesterdayWod = yesterdayWods?.[0];
    const yesterdayCategory = yesterdayWod?.category || "Unknown";
    const yesterdayDifficulty = yesterdayWod?.difficulty_stars || 0;
    const yesterdayEquipment = yesterdayWod?.equipment || "Unknown";
    const yesterdayFormat = yesterdayWod?.format || "Unknown";
    
    // Calculate tomorrow's expected specs (84-day cycle)
    const tomorrow = new Date(effectiveDate + 'T00:00:00Z');
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDateStr = tomorrow.toISOString().split('T')[0];
    const tomorrowDayIn84 = getDayIn84Cycle(tomorrowDateStr);
    const tomorrowCategory = getCategoryForDay(tomorrowDayIn84);
    const tomorrowDiffResult = getDifficultyForDay(tomorrowDayIn84);
    const tomorrowDifficulty = { 
      name: tomorrowDiffResult.name || "Recovery", 
      stars: tomorrowDiffResult.stars || 0 
    };
    
    // Generate scaling advice based on yesterday vs today
    let scalingAdvice = "";
    if (yesterdayDifficulty >= 5 && selectedDifficulty.stars >= 5) {
      scalingAdvice = "Two advanced days in a row - emphasize DIFFERENT muscle groups and movement patterns. Ensure today's workout hits fresh muscles.";
    } else if (yesterdayDifficulty >= 5 && selectedDifficulty.stars <= 2) {
      scalingAdvice = "Recovery day after intense work - focus on movement quality, controlled tempo, active recovery principles.";
    } else if (yesterdayDifficulty <= 2 && selectedDifficulty.stars >= 5) {
      scalingAdvice = "Fresh after recovery - athletes are ready to push intensity and volume hard today.";
    } else if (yesterdayDifficulty >= 3 && selectedDifficulty.stars >= 3) {
      scalingAdvice = "Moderate-to-moderate progression - balance work and recovery, vary movement patterns from yesterday.";
    } else {
      scalingAdvice = "Standard progression - maintain training consistency with appropriate loading.";
    }
    
    logStep("Periodization context", {
      yesterdayDate,
      yesterdayCategory,
      yesterdayDifficulty,
      yesterdayFormat,
      tomorrowCategory,
      tomorrowDifficulty: tomorrowDifficulty.stars,
      scalingAdvice
    });

    // ═══════════════════════════════════════════════════════════════════════════════
    // DURATION DISTRIBUTION AWARENESS: Query current workout library for this category
    // Used to nudge the AI toward underrepresented duration brackets
    // ═══════════════════════════════════════════════════════════════════════════════
    let durationDistributionPrompt = "";
    try {
      const { data: durationCounts } = await supabase
        .from("admin_workouts")
        .select("duration")
        .eq("category", category)
        .eq("is_workout_of_day", true);
      
      if (durationCounts && durationCounts.length > 0) {
        // Count durations by bucket (extract number from "X min" strings)
        const buckets: Record<number, number> = { 15: 0, 20: 0, 25: 0, 30: 0, 35: 0, 40: 0, 45: 0, 50: 0 };
        let variousCount = 0;
        
        for (const row of durationCounts) {
          const dur = row.duration || "";
          if (/various/i.test(dur)) {
            variousCount++;
            continue;
          }
          const numMatch = dur.match(/(\d+)/);
          if (numMatch) {
            const mins = parseInt(numMatch[1]);
            // Find nearest bucket
            const bucketKeys = Object.keys(buckets).map(Number).sort((a, b) => a - b);
            let nearestBucket = bucketKeys[0];
            let minDiff = Math.abs(mins - nearestBucket);
            for (const bk of bucketKeys) {
              const diff = Math.abs(mins - bk);
              if (diff < minDiff) { minDiff = diff; nearestBucket = bk; }
            }
            buckets[nearestBucket]++;
          }
        }
        
        // Build distribution text
        const totalWods = durationCounts.length;
        const avgPerBucket = totalWods / Object.keys(buckets).length;
        const lines: string[] = [];
        
        for (const [bucket, count] of Object.entries(buckets)) {
          let label = `  ${bucket} min: ${count} workouts`;
          if (count === 0) {
            label += " (EMPTY - strongly consider targeting this duration)";
          } else if (count < avgPerBucket * 0.5) {
            label += " (UNDERREPRESENTED - consider targeting this duration)";
          } else if (count > avgPerBucket * 1.5) {
            label += " (well represented)";
          }
          lines.push(label);
        }
        if (variousCount > 0) {
          lines.push(`  Various: ${variousCount} workouts`);
        }
        
        durationDistributionPrompt = `
DURATION DISTRIBUTION AWARENESS:
Current ${category} WOD library (${totalWods} total workouts):
${lines.join("\n")}

The platform needs VARIETY across all duration brackets. If a duration bracket 
has fewer workouts, you are ENCOURAGED (not forced) to target it -- but ONLY 
if it makes sense for the current difficulty level and category.

Remember: Short duration + Advanced = maximum intensity (RPE ceiling).
Long duration + Beginner = gentle but complete.
Never sacrifice workout quality just to fill a gap.
This is a NUDGE, not a mandate.
`;
        
        logStep("Duration distribution", { category, buckets, variousCount, totalWods });
      }
    } catch (distError) {
      logStep("Duration distribution query failed (non-critical)", { error: String(distError) });
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // RECOVERY DAYS: Generate only ONE MIXED workout (not BODYWEIGHT + EQUIPMENT)
    // Other categories: Generate both BODYWEIGHT and EQUIPMENT versions
    // ═══════════════════════════════════════════════════════════════════════════════
    let equipmentTypes: string[];
    
    if (isRecoveryDay) {
      // RECOVERY: Only generate ONE VARIOUS workout (use early check from line ~312)
      // CRITICAL: Use VARIOUS (not MIXED) to match database constraint valid_equipment
      equipmentTypes = variousComplete ? [] : ["VARIOUS"];
      logStep("RECOVERY day - generating single VARIOUS workout", { variousAlreadyExists, equipmentTypes });
    } else {
      // Normal days: Generate BODYWEIGHT and EQUIPMENT versions
      equipmentTypes = equipmentTypesToGenerate;
    }
    
    const generatedWorkouts: any[] = [];
    const failedEquipmentTypes: string[] = [];
    let firstWorkoutName = "";

    // ═══════════════════════════════════════════════════════════════════════════════
    // FETCH EXISTING WORKOUT NAMES for uniqueness enforcement
    // Query all names in this category to prevent the AI from reusing them
    // ═══════════════════════════════════════════════════════════════════════════════
    let existingNamesForCategory: string[] = [];
    try {
      const { data: existingNames } = await supabase
        .from("admin_workouts")
        .select("name")
        .order("created_at", { ascending: false })
        .limit(2000);
      
      if (existingNames) {
        existingNamesForCategory = existingNames.map((w: any) => w.name);
        logStep("Loaded existing workout names for uniqueness check (library-wide)", { 
          category, 
          count: existingNamesForCategory.length,
          sample: existingNamesForCategory.slice(0, 5)
        });
      }
    } catch (nameErr) {
      logStep("Failed to fetch existing names (non-critical)", { error: String(nameErr) });
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // EXERCISE LIBRARY: Fetch and build reference list for AI prompt
    // BODYWEIGHT workouts → only bodyweight exercises visible to AI
    // EQUIPMENT workouts → full library (bodyweight + all equipment)
    // PILATES EQUIPMENT → strict Pilates-studio props only (bands, balls, roller, bosu, rope, bodyweight)
    // ═══════════════════════════════════════════════════════════════════════════════
    // We fetch BOTH versions so each equipment type gets the right library
    // Determine difficulty level name for exercise filtering
    const difficultyLevelName = selectedDifficulty.name?.toLowerCase() || undefined;
    
    const { exercises: bodyweightExercises, referenceList: bodyweightReferenceList } = 
      await fetchAndBuildExerciseReference(supabase, "[GENERATE-WOD-BW]", "body weight", difficultyLevelName);
    const { exercises: fullExercises, referenceList: fullReferenceList } = 
      await fetchAndBuildExerciseReference(supabase, "[GENERATE-WOD-FULL]", undefined, difficultyLevelName);
    
    // ═══════════════════════════════════════════════════════════════════════════════
    // PILATES EQUIPMENT ALLOWLIST: Only studio-style props allowed
    // ═══════════════════════════════════════════════════════════════════════════════
    const PILATES_ALLOWED_EQUIPMENT = [
      'body weight', 'band', 'resistance band', 'stability ball', 'medicine ball',
      'roller', 'bosu ball', 'rope', 'assisted'
    ];
    
    let pilatesEquipmentExercises: ExerciseBasic[] = [];
    let pilatesEquipmentReferenceList = '';
    
    if (category === "PILATES") {
      // Filter full exercise library to only Pilates-studio equipment
      pilatesEquipmentExercises = fullExercises.filter(ex => {
        const equip = (ex.equipment || '').toLowerCase().trim();
        return PILATES_ALLOWED_EQUIPMENT.some(allowed => equip.includes(allowed));
      });
      
      // Also include all bodyweight exercises
      const bodyweightIds = new Set(bodyweightExercises.map(e => e.id));
      for (const ex of pilatesEquipmentExercises) {
        bodyweightIds.add(ex.id);
      }
      // Deduplicate
      const allPilatesExercises = [...bodyweightExercises];
      for (const ex of pilatesEquipmentExercises) {
        if (!bodyweightExercises.some(bw => bw.id === ex.id)) {
          allPilatesExercises.push(ex);
        }
      }
      pilatesEquipmentExercises = allPilatesExercises;
      
      // Build reference list for Pilates equipment workouts
      pilatesEquipmentReferenceList = buildExerciseReferenceList(pilatesEquipmentExercises, undefined, difficultyLevelName);
      
      logStep("Pilates equipment library built", {
        totalPilatesExercises: pilatesEquipmentExercises.length,
        allowedEquipment: PILATES_ALLOWED_EQUIPMENT,
        bodyweightCount: bodyweightExercises.length
      });
    }
    
    logStep("Exercise libraries loaded", { 
      bodyweightCount: bodyweightExercises.length,
      fullCount: fullExercises.length,
      pilatesEquipmentCount: pilatesEquipmentExercises.length
    });

    for (const equipment of equipmentTypes) {
      // ═══════════════════════════════════════════════════════════════════════════════
      // PER-EQUIPMENT ERROR ISOLATION: Each equipment type generates independently
      // If BODYWEIGHT fails, we still try EQUIPMENT (and vice versa)
      // This prevents one AI failure from destroying the entire run
      // ═══════════════════════════════════════════════════════════════════════════════
      
      // ═══════════════════════════════════════════════════════════════════════════════
      // PER-VARIANT RETRY: 2 attempts with 15s delay per equipment type
      // A single transient AI error no longer kills the variant for the entire run
      // ═══════════════════════════════════════════════════════════════════════════════
      const PER_VARIANT_MAX_ATTEMPTS = 2;
      const PER_VARIANT_RETRY_DELAY_MS = 15000;
      let variantAttempt = 0;
      let variantSucceeded = false;
      
      while (variantAttempt < PER_VARIANT_MAX_ATTEMPTS && !variantSucceeded) {
        variantAttempt++;
        if (variantAttempt > 1) {
          logStep(`🔄 Retrying ${equipment} variant (attempt ${variantAttempt}/${PER_VARIANT_MAX_ATTEMPTS}) after ${PER_VARIANT_RETRY_DELAY_MS / 1000}s delay`);
          await new Promise(r => setTimeout(r, PER_VARIANT_RETRY_DELAY_MS));
        }
      try {
      // ═══════════════════════════════════════════════════════════════════════════════
      // GET FORMAT AND DURATION FOR THIS SPECIFIC WORKOUT
      // STRENGTH, MOBILITY & STABILITY, and PILATES = always REPS & SETS (both workouts same)
      // Other categories = each workout can have its own format and duration
      // ═══════════════════════════════════════════════════════════════════════════════
      const { format, duration } = getFormatForWorkout(category, equipment);
      
      logStep(`Generating ${equipment} workout`, { 
        format, 
        duration,
        categoryRequiresMatchingFormat: category === "STRENGTH" || category === "MOBILITY & STABILITY" || category === "PILATES"
      });

      const bannedNameInstruction = firstWorkoutName 
        ? `\n\nCRITICAL - AVOID DUPLICATE NAME: The bodyweight workout for today is named "${firstWorkoutName}". You MUST create a COMPLETELY DIFFERENT name. DO NOT use "${firstWorkoutName}" or any variation of it.`
        : "";

      // ═══════════════════════════════════════════════════════════════════════════════
      // NAMING VARIETY INSTRUCTIONS - Creative, unique names only
      // ═══════════════════════════════════════════════════════════════════════════════
      // Build a "DO NOT USE" list from existing names in this category
      const bannedNamesList = existingNamesForCategory.length > 0
        ? `\n\n⛔ BANNED NAMES — These names already exist in the ${category} library. You MUST NOT use any of these names or minor variations:\n${existingNamesForCategory.map(n => `   ❌ "${n}"`).join('\n')}\n`
        : "";

      const namingInstructions = `
═══════════════════════════════════════════════════════════════════════════════
NAMING RULES (CRITICAL - MUST FOLLOW):
═══════════════════════════════════════════════════════════════════════════════

1. THE NAME MUST BE 100% UNIQUE — Never reuse an existing workout name from the banned list below.

2. AVOID OVERUSED WORDS — DO NOT START with these words (they're overused):
   ❌ Inferno, Blaze, Fire, Burn, Fury, Storm, Thunder, Power, Beast, Warrior, Elite, Ultimate, Extreme
   ❌ Foundation (massively overused in Strength)
   ❌ Torch, Melt (massively overused in Calorie Burning)
   ❌ Engine, Drive, Catalyst (massively overused in Metabolic)
   ❌ Flow, Restore (massively overused in Recovery/Mobility)
   ❌ Gauntlet, Summit, Crucible, Endurance (massively overused in Challenge)

3. NAMING PRINCIPLES (instead of word banks):
   - Draw from athletics, martial arts, nature, engineering, architecture, mythology, music terminology
   - The name should hint at the workout's focus (upper body, legs, full body, etc.)
   - Be creative and memorable — imagine a premium fitness brand naming their signature workouts
   - Mix unexpected words: "Granite Press", "Velocity Chain", "Steel Meridian", "Apex Protocol"

4. KEEP IT SHORT: 2-4 words maximum
5. NEVER copy or slightly modify a name from the banned list (e.g., adding "II", changing one word)
6. CUSTOMER-FACING ONLY: Never add dates, serial numbers, random letters, equipment codes, version numbers, or internal IDs.
   ❌ Forbidden examples: "Core Cadence 0427BW", "Iron Circuit 0427EQ", "Mobility Flow V2", "Strength Block #1"
   ✅ Correct style: "Core Tempo Circuit", "Midline Control Session", "Athletic Strength Builder"

7. DO NOT USE AI-SOUNDING / ABSTRACT TECHNICAL TERMS in public workout names.
   ❌ Forbidden words: Axial, Matrix, Meridian, Protocol, Helix, Arcus, Synergy, Conduit, Integration, Current, Vector, Quantum, Algorithm, Neural, System, Module, Phase, Sequence
   ✅ Use simple athletic/customer language instead: Core, Tempo, Circuit, Builder, Sprint, Grip, Press, Climb, Flow, Control
${bannedNamesList}`;

      // Generate workout content using Lovable AI
      const workoutPrompt = `You are Haris Falas, a Sports Scientist with 20+ years of coaching experience (CSCS Certified), creating a premium Workout of the Day for SmartyGym members worldwide.${bannedNameInstruction}
${namingInstructions}

Generate a complete workout with these specifications:
- Category: ${category}
- Equipment: ${equipment}
- Difficulty: ${selectedDifficulty.name} (${selectedDifficulty.stars} stars out of 6)
- Format: ${format}

${(() => {
  // For Pilates EQUIPMENT workouts, use the Pilates-filtered library
  if (category === "PILATES" && equipment === "EQUIPMENT") {
    return pilatesEquipmentReferenceList || '';
  }
  return equipment === "BODYWEIGHT" ? (bodyweightReferenceList || '') : (fullReferenceList || '');
})()}


═══════════════════════════════════════════════════════════════════════════════
FORMAT DEFINITIONS (MUST FOLLOW EXACTLY):
═══════════════════════════════════════════════════════════════════════════════
- Tabata: 20 seconds work, 10 seconds rest, 8 rounds per exercise
- Circuit: 4-6 exercises repeated 3-5 rounds with minimal rest between exercises
- AMRAP: As Many Rounds As Possible in a given time (e.g., 15 min AMRAP)
- For Time: Complete all exercises as fast as possible (record time)
- EMOM: Every Minute On the Minute - perform set at start of each minute, rest remainder
- Reps & Sets: Classic strength format (e.g., 4 sets x 8 reps) with defined rest
- Mix: Combination of two or more formats (e.g., EMOM warm-up + Tabata finisher)

TABATA EQUIPMENT CONSTRAINT (CRITICAL):
When format is TABATA (or any section uses Tabata timing, including Tabata finishers in MIX format):
• ALLOWED: Dumbbells, kettlebells, barbells (pre-loaded), medicine balls, battle ropes, resistance bands, jump ropes, plyo boxes, bodyweight exercises — anything you can grab instantly with ZERO setup time
• FORBIDDEN: ANY machine-based exercise (cable machines, leg press, smith machine, seated/standing calf raise machine, lat pulldown machine, chest press machine, leg extension, leg curl, hack squat, any pin-loaded or plate-loaded machine)
• REASON: Tabata demands instant transitions (10 seconds rest). Machines require setup, adjustment, and travel time that breaks the protocol entirely.
• This applies to ALL Tabata sections including Tabata finishers in MIX format workouts.

YOUR FORMAT TODAY: ${format}
- You MUST structure the workout using the ${format} format rules defined above

═══════════════════════════════════════════════════════════════════════════════
WOD (WORKOUT OF THE DAY) GENERATION PHILOSOPHY
Science based operational rules for daily workout generation.
═══════════════════════════════════════════════════════════════════════════════

CORE PRINCIPLE:
The Workout of the Day system is designed to balance performance, recovery, variety, and adherence over long-term use.
Each workout must respect physiology, training principles, and accumulated fatigue from previous days.

The system prioritizes:
• Progressive overload over weeks
• Neuromuscular recovery
• Metabolic and cardiovascular balance
• Joint health and injury prevention
• User engagement without randomness

═══════════════════════════════════════════════════════════════════════════════
DAILY WORKOUT OUTPUT REQUIREMENTS:
═══════════════════════════════════════════════════════════════════════════════

For every Workout of the Day, the system must generate:
• One Bodyweight version
• One Equipment based version

Both versions must:
• Follow the same category, difficulty, and format logic
• Deliver equivalent physiological stress
• Differ only in tools, not in intent

═══════════════════════════════════════════════════════════════════════════════
DIFFICULTY SYSTEM (6-STAR MODEL):
═══════════════════════════════════════════════════════════════════════════════

Difficulty reflects: Volume, Intensity, Density, Coordination demand, Cognitive load

Star classification:
• 1–2 Stars: Beginner
• 3–4 Stars: Intermediate
• 5–6 Stars: Advanced

BASE WEEKLY DIFFICULTY PATTERN:
Intermediate → Advanced → Beginner → Advanced → Intermediate → Beginner → Advanced

This pattern ensures:
• No accumulation of high fatigue days
• Advanced days are buffered by lower stress sessions

WEEKLY ROTATION RULE:
Each new week, the difficulty pattern shifts forward by one position.
No category is always Beginner or always Advanced.
The same star rating must not appear on the same category in consecutive weeks.

═══════════════════════════════════════════════════════════════════════════════
FORMAT RULES BY CATEGORY (STRICT BUT INTELLIGENT):
═══════════════════════════════════════════════════════════════════════════════

STRENGTH:
• Format: REPS & SETS ONLY
• Rest between sets is mandatory
• Focus on load, tempo, and technical quality

MOBILITY & STABILITY:
• Format: REPS & SETS ONLY
• Slow tempo
• Controlled ranges of motion
• No time pressure

CARDIO, METABOLIC, CALORIE BURNING:
• Primary formats: Circuit, EMOM, For Time, AMRAP, Tabata
• Reps & Sets may appear ONLY as: Low load, Submaximal, Part of a larger continuous structure
• Never as classic strength loading

CHALLENGE:
• Any format except classic Reps & Sets
• Mix formats are encouraged

IMPORTANT: Reps & Sets is a pacing and control tool. It is exclusive as a main structure only in Strength and Mobility.
Other categories may include reps based blocks ONLY if they preserve continuous activity.

═══════════════════════════════════════════════════════════════════════════════
FORMAT MIXING LOGIC (ADVANCED RULE):
═══════════════════════════════════════════════════════════════════════════════

In non-strength categories, workouts may combine formats.

Examples:
• Tabata followed by AMRAP
• Circuit finishing with For Time
• EMOM transitioning into Tabata

Rules:
• Only one dominant stimulus per workout
• Mixing must increase engagement, not confusion
• Never mix maximal strength loading with metabolic density

═══════════════════════════════════════════════════════════════════════════════
5-SECTION WORKOUT STRUCTURE (MANDATORY)
═══════════════════════════════════════════════════════════════════════════════

APPLIES TO: STRENGTH, CALORIE BURNING, METABOLIC, CARDIO, MOBILITY & STABILITY, CHALLENGE
DOES NOT APPLY TO: PILATES, RECOVERY, MICRO-WORKOUTS (keep their existing structures)

Every workout in the above categories MUST include 5 sections in this order:

1. 🧽 SOFT TISSUE PREPARATION (5 min)
   Purpose: Foam rolling, trigger point release, tissue prep
   Examples (vary these, not limited to):
   • Foam roll quads, hamstrings, calves, glutes, lats, upper back (30-45 sec per area)
   • Lacrosse ball or spiky ball work for feet and hips
   • Focus on areas relevant to the workout category
   AI Guidance: Vary exercises to keep fresh, adjust focus based on category
   
2. 🔥 ACTIVATION (10-15 min)
   Purpose: Mobility drills, stability work, glute activation, dynamic warm-up, movement prep
   Examples (vary these, not limited to):
   • Mobility: Cat-Cow, Thoracic Rotations, Ankle Circles, Hip Circles
   • Stability: Bird-Dog, Glute Bridge, Clamshells, Dead Bug
   • Dynamic: Jumping Jacks, High Knees, Butt Kicks, Walking Lunges, A-Skips, Light Jog
   • Inchworms, Lateral Shuffles, Leg Swings, World's Greatest Stretch
   AI Guidance: Select exercises that progressively increase heart rate and prepare body for the specific category's demands

3. 💪 MAIN WORKOUT (category-specific duration)
   Purpose: Core training block - MUST FOLLOW EXISTING CATEGORY LOGIC
   • STRENGTH: Strength exercises, controlled tempo, progressive overload
   • CARDIO: Cardiovascular work, heart rate training, endurance
   • METABOLIC: High-intensity, full-body conditioning
   • CALORIE BURNING: High-effort, simple, maintain high output
   • MOBILITY & STABILITY: Joint mobility, core stability, controlled movement
   • CHALLENGE: Tough sessions, test limits
   
   *** CRITICAL: Use all existing category reasoning - this is NOT changing ***

4. ⚡ FINISHER (10-25 min)
   Purpose: Complement the main workout with a DIFFERENT format/structure
   • Must be RELATED to the category theme
   • Must have DIFFERENT format than main workout
   • Intensity is governed by the RPE BALANCING RULE below
   Examples:
   • STRENGTH main (heavy compounds) → Finisher (lighter volume, higher reps)
   • CARDIO main (intervals) → Finisher (AMRAP or EMOM)
   • METABOLIC main (EMOM) → Finisher (Tabata or For Time)

   FINISHER DURATION RULES (CRITICAL - NON-NEGOTIABLE):
   • "For Time" finishers: Do NOT prescribe a fixed duration in the section title.
     "For Time" means the athlete completes the work as fast as possible and records their time.
     Writing "Finisher (8')" with "For Time" is CONTRADICTORY and UNPROFESSIONAL.
     CORRECT: "Finisher (For Time)" — no minutes in title, no sub-name.
   • AMRAP finishers: DO prescribe a time cap (e.g., "Finisher (8-minute AMRAP)")
   • Circuit/Tabata finishers: Prescribe rounds, not arbitrary minute totals
   • The finisher duration must EMERGE from the work prescribed, not be artificially set to fill remaining workout time. Think like a coach, not a calculator.

   FINISHER MINIMUM VOLUME (MANDATORY):
   • Every finisher must include at least 3-5 distinct exercises or exercise rounds
   • A finisher with only 2 exercises (e.g., "500m row + 20 thrusters") is UNACCEPTABLE — it lacks training substance and looks unprofessional
   • For Time finishers: 3-5 exercises, potentially repeated in rounds
   • AMRAP finishers: 3-4 exercises per round
   • Tabata finishers: 4 exercises minimum (each gets 8 rounds of 20/10)
    • The finisher must deliver REAL training value, not filler

RPE INTENSITY BALANCING RULE (MANDATORY):

The main workout and finisher form ONE training session. Their combined intensity 
must be balanced and humanly achievable, with a recovery break between them.

Use the RPE (Rate of Perceived Exertion) scale to govern this balance:

  RPE 1-3: Very light (walking, gentle movement)
  RPE 4-5: Light to moderate (can hold a full conversation)
  RPE 6-7: Moderate to hard (short sentences only)
  RPE 8-9: Very hard (few words between breaths)
  RPE 10:  Maximum effort (cannot speak)

COMBINED RPE TARGETS BY DIFFICULTY:
  Beginner (1-2 stars):       Combined Main + Finisher RPE = 8 to 11
  Intermediate (3-4 stars):   Combined Main + Finisher RPE = 11 to 14
  Advanced (5-6 stars):       Combined Main + Finisher RPE = 13 to 17

KEY PRINCIPLE: There is a rest period between the main workout and finisher.
The athlete recovers some energy. This means the finisher RPE does NOT need 
to be the simple remainder (10 minus main). The athlete has more capacity 
after resting.

EXAMPLES:
  Main RPE 7 (hard) --> Finisher RPE 5-7 (NOT 3 — rest gives recovery)
  Main RPE 5 (moderate) --> Finisher RPE 7-8 (finisher can push harder)
  Main RPE 9 (very hard) --> Finisher RPE 5-6 (NOT 1 — still meaningful work)
  Main RPE 6 (moderate) --> Finisher RPE 6-7 (balanced session)

WHAT THIS MEANS IN PRACTICE:
  - If the main workout destroys the athlete (RPE 8-9), the finisher should 
    allow quality movement at RPE 4-6, not push them to failure again
  - If the main workout is moderate (RPE 5-6), the finisher can be the 
    intense part of the session at RPE 7-8
  - Never make both main workout AND finisher RPE 9+ (that is overtraining)
  - Never make both main workout AND finisher RPE 3-4 (that wastes the session)
  - The session should feel COMPLETE — the athlete finishes feeling worked 
    but not destroyed

FINISHER IS MANDATORY FOR ALL NON-RECOVERY WODS:
Every non-recovery workout MUST include a ⚡ Finisher section. This is NOT optional.
The finisher complements the main workout and is part of the 5-section structure.
Do NOT skip the finisher. If the main workout is intense, make the finisher lighter.
If the main workout is moderate, the finisher can push harder. But it MUST exist.

5. 🧘 COOL DOWN (10 min)
   Purpose: Static stretching + diaphragmatic breathing
   Static Stretching (8 min) - Examples (vary these):
   • Quad stretch, Hamstring stretch, Calf stretch
   • Glute stretch, Hip flexor stretch, Chest/shoulder stretch
   • Child's Pose, Spinal twist, Pigeon pose
   Diaphragmatic Breathing (2 min) - ALWAYS INCLUDE:
   • Supine position, one hand on chest, one on belly
   • Slow inhale through nose (belly rises), slow exhale through mouth
   • Focus on calming nervous system, slowing heart rate

FINISHER RULES BY CATEGORY:

STRENGTH and MOBILITY & STABILITY:
• Format: REPS & SETS ONLY (respecting category format rule)
• Load: Reduced compared to main workout
• Reps: Increased compared to main workout
• Purpose: Volume completion without heavy loading
• Example: If main workout uses 4x6 at heavy load, finisher uses 3x12 at lighter load

CARDIO, METABOLIC, CALORIE BURNING, CHALLENGE:
• Format: Any allowed format (Circuit, Tabata, EMOM, AMRAP, For Time, single exercise)
• Can differ from main workout format
• Purpose: Metabolic completion or targeted burn
• Example: Main workout is AMRAP, finisher can be Tabata or "100 burpees for time"

FORMAT DETERMINATION RULE (CRITICAL):
The FORMAT label of the entire workout is determined ONLY by the Main Workout.
The Finisher format does NOT affect the workout's FORMAT classification.
Example: Main Workout = AMRAP, Finisher = Tabata → Workout FORMAT = AMRAP

═══════════════════════════════════════════════════════════════════════════════
LOAD AND INTENSITY GOVERNANCE:
═══════════════════════════════════════════════════════════════════════════════

STRENGTH:
• 60–90 percent of estimated 1RM depending on stars
• Longer rest
• Low movement count

METABOLIC and CARDIO:
• 30–50 percent of strength capacity
• Never above moderate load
• Continuous movement priority

CALORIE BURNING:
• Light to moderate loads
• High repetition
• Sustainable pacing

ABSOLUTE RULE: No metabolic or calorie workout may prescribe heavy percentages of 1RM.

═══════════════════════════════════════════════════════════════════════════════
EQUIPMENT GOVERNANCE:
═══════════════════════════════════════════════════════════════════════════════

All workouts must use gym based equipment only.

Allowed cardio machines:
• Treadmill, Assault bike, Spin bike, Elliptical, Ski erg, Rowing machine, Stair climber, Jump rope

Allowed gym tools:
• Wall balls, Medicine balls, Kettlebells, Dumbbells, Battle ropes, Weight vest, Sled pushes/pulls, Box jumps, Sandbags, Farmer carries

PROHIBITED: Swimming, Outdoor only activities, Terrain dependent movements

Equipment selection must:
• Match category intent
• Scale correctly with difficulty
• Never dominate technique at the expense of movement quality

═══════════════════════════════════════════════════════════════════════════════
VOLUME AND VALUE-FOR-MONEY STANDARDS:
═══════════════════════════════════════════════════════════════════════════════

Beginner (1-2 stars): 100–150 total movements
Intermediate (3-4 stars): 150–250 total movements
Advanced (5-6 stars): 200–350 or more movements

Movement count reflects: Total reps, Total steps, Total calories, Total strokes
The goal is perceived value without unnecessary fatigue.

❌ WEAK EXAMPLE: "10 burpees, 20 squats, 10 push-ups x3 rounds" = 120 total reps = UNACCEPTABLE
✅ STRONG EXAMPLE: "5 rounds of: 15 burpees, 20 squats, 15 push-ups, 20 lunges, 15 mountain climbers" = 425 total = EXCELLENT

═══════════════════════════════════════════════════════════════════════════════
CHALLENGE CATEGORY SPECIAL RULES (EXPANDED):
═══════════════════════════════════════════════════════════════════════════════

Challenge workouts test: Mental resilience, Coordination, Work capacity, Decision making under fatigue

CORE IDENTITY: "The Gamification King"
• Make users question: "Can I accomplish this?"
• Create workouts people will talk about and share
• Use performance-based calculations (e.g., time → reps conversion)

They may:
• Combine multiple formats in creative ways
• Use non-linear structures and progressive reveals
• Include gamification elements (time-to-reps, ladder formats, death-by structures)
• Link performance in one section to work in another section
• Run the clock continuously across all sections

They must still:
• Respect safety (no heavy loads under fatigue)
• Avoid maximal strength loading
• Remain scalable for all fitness levels
• Include clear beginner modifications

FORMAT NOTE: CHALLENGE workouts are labeled by their MAIN WORKOUT format.
Even if finisher has reps, the main workout's format determines the classification.

═══════════════════════════════════════════════════════════════════════════════
RECOVERY AND FATIGUE AWARENESS:
═══════════════════════════════════════════════════════════════════════════════

The AI must always evaluate:
• Previous day category
• Previous day difficulty
• Cumulative stress

Advanced days following advanced days must:
• Reduce volume
• Reduce impact
• Or shift stimulus focus

═══════════════════════════════════════════════════════════════════════════════
CONSISTENCY OVER NOVELTY:
═══════════════════════════════════════════════════════════════════════════════

The system favors: Smart variation, Rotating structures, Predictable logic
Over: Random exercise selection, Extreme fatigue chasing, Unstructured creativity

═══════════════════════════════════════════════════════════════════════════════
PERIODIZATION CONTEXT FOR TODAY'S WORKOUT:
═══════════════════════════════════════════════════════════════════════════════

📅 YESTERDAY'S WORKOUT:
• Category: ${yesterdayCategory}
• Difficulty: ${yesterdayDifficulty} stars
• Equipment: ${yesterdayEquipment}
• Format: ${yesterdayFormat}

📅 TOMORROW'S PREVIEW:
• Category: ${tomorrowCategory}
• Expected Difficulty: ${tomorrowDifficulty.stars} stars (${tomorrowDifficulty.name})

📊 SCIENTIFIC SCALING & RECOVERY:
${scalingAdvice}

═══════════════════════════════════════════════════════════════════════════════
GENERAL SYSTEM RULES - NON NEGOTIABLE:
═══════════════════════════════════════════════════════════════════════════════

1. FORMATTING, DESIGN & STRUCTURE ARE UNTOUCHABLE
   The system must NEVER change the existing formatting, layout, or visual logic.

2. CATEGORIES, SUBCATEGORIES & LOGIC ARE FIXED
   The six categories, difficulty system, weekly sequence, and format rules are FINAL.

3. EVERY WORKOUT MUST HAVE CLEAR PURPOSE
   Each workout must clearly express what it trains and why it exists in the weekly sequence.

4. DESCRIPTION, INSTRUCTIONS & TIPS ARE MANDATORY
   Every workout must include: Clear description, Step by step instructions, Practical tips

5. VALUE FOR MONEY IS A CORE FILTER
   These workouts are sold products. Every WOD must deliver substantial training value.

6. INTELLIGENT VARIATION, NOT REPETITION
   Rotate exercises, movement patterns, equipment usage, format combinations where allowed.

7. EXAMPLES DO NOT LIMIT CREATIVITY
   The system is encouraged to explore new but logical progressions within rules.

8. LOAD, SPEED & FATIGUE MUST MATCH THE CATEGORY
   No heavy 1RM percentages in metabolic work. No rushed balance work in mobility sessions.

9. PROFESSIONAL TONE, NEVER CIRCUS
   Workout names and structures must remain serious, professional, and coach driven.

10. LONG TERM USAGE MENTALITY
    Every workout must respect recovery, joint health, nervous system fatigue, motivation sustainability.

═══════════════════════════════════════════════════════════════════════════════
YOUR WORKOUT SPECIFICATIONS FOR THIS GENERATION:
═══════════════════════════════════════════════════════════════════════════════

• Category: ${category}
• Equipment: ${equipment}
• Difficulty: ${selectedDifficulty.name} (${selectedDifficulty.stars} stars out of 6)
• Format: ${format}

${category === "STRENGTH" ? (() => {
  // Map dayIn84 to dayIn28 position for strength focus lookup (pattern repeats every 28 days)
  const dayIn28 = ((dayIn84 - 1) % 28) + 1;
  const strengthFocus = STRENGTH_DAY_FOCUS[dayIn28];
  if (strengthFocus) {
    const focusNamingExamples: Record<string, string[]> = {
      "LOWER BODY": ["Lower Body Iron Foundation", "Leg Day Power Builder", "Lower Body Forge", "Quad & Ham Strength"],
      "UPPER BODY": ["Upper Body Forge", "Press & Pull Power", "Upper Iron Builder", "Chest & Back Strength"],
      "FULL BODY": ["Total Body Foundation", "Full Body Strength Flow", "Complete Power Builder", "Total Iron Session"],
      "LOW PUSH & UPPER PULL": ["Push Pull Hybrid Power", "Low Push Upper Pull Builder", "Squat & Row Strength"],
      "LOW PULL & UPPER PUSH": ["Hinge & Press Builder", "Pull Push Strength Flow", "Deadlift & Press Power"],
      "CORE & GLUTES": ["Core & Glute Stabilizer", "Glutes & Core Power", "Hip & Core Foundation", "Stability Strength"]
    };
    const namingExamples = focusNamingExamples[strengthFocus.focus] || ["Strength Builder", "Power Session"];
    
    return `
═══════════════════════════════════════════════════════════════════════════════
STRENGTH DAY FOCUS: ${strengthFocus.focus} (Day ${dayIn84}/84)
═══════════════════════════════════════════════════════════════════════════════

🎯 TARGET MUSCLE GROUPS: ${strengthFocus.muscleGroups.join(", ")}
📝 DESCRIPTION: ${strengthFocus.description}
✅ MOVEMENT PATTERNS TO INCLUDE: ${strengthFocus.movementPatterns.join(", ")}
${strengthFocus.forbiddenPatterns.length > 0 ? `❌ FORBIDDEN ON THIS DAY: ${strengthFocus.forbiddenPatterns.join(", ")}` : ""}

═══════════════════════════════════════════════════════════════════════════════
WORKOUT NAMING RULE (MANDATORY)
═══════════════════════════════════════════════════════════════════════════════
The workout name MUST clearly reflect the "${strengthFocus.focus}" focus.
Good naming examples for ${strengthFocus.focus}: ${namingExamples.join(", ")}
The name should be professional, motivating, and immediately indicate the body area being trained.

═══════════════════════════════════════════════════════════════════════════════
STRENGTH TRAINING PROTOCOLS FOR ${strengthFocus.focus}
═══════════════════════════════════════════════════════════════════════════════

LOAD GUIDELINES (Based on Estimated 1RM):
• Beginner (1-2 stars): 50-65% of 1RM - Focus on form and muscle connection
• Intermediate (3-4 stars): 65-80% of 1RM - Progressive challenge with solid technique
• Advanced (5-6 stars): 75-90% of 1RM - Heavy loads, strength-focused intensity

REST PERIODS:
• Compound movements (squats, deadlifts, presses): 90-180 seconds between sets
• Isolation movements (curls, extensions, raises): 60-90 seconds between sets
• Include rest period guidance in the workout instructions (e.g., "Rest 90 seconds between sets")

TEMPO GUIDELINES:
• Eccentric (lowering): 3-4 seconds - Control the weight down
• Pause at bottom: 1 second - Eliminate momentum
• Concentric (lifting): 1-2 seconds - Explosive but controlled
• Example tempo notation: "3-1-1-0" (3 sec down, 1 sec pause, 1 sec up, no pause at top)

SET & REP SCHEMES BY DIFFICULTY:
• Beginner: 3 sets × 10-12 reps (technique focus, moderate loads)
• Intermediate: 4 sets × 8-10 reps (progressive overload, challenging loads)
• Advanced: 4-5 sets × 5-8 reps (heavy loads, strength maximization)

PROGRESSIVE OVERLOAD PRINCIPLES:
• Include guidance on adding weight each week or session when reps are completed with good form
• Suggest tracking weights used to progressively increase load
• For bodyweight: progress by adding reps, slowing tempo, or advancing to harder variations

WORKOUT INSTRUCTIONS MUST INCLUDE:
1. Specific load recommendations (e.g., "Use a challenging weight for 8-10 reps")
2. Rest periods for each section (e.g., "Rest 90 seconds between sets")
3. Tempo cues where applicable (e.g., "Lower for 3 seconds, pause, then drive up")
4. Form tips for key exercises (e.g., "Keep core braced, chest up throughout")

CRITICAL STRENGTH FOCUS RULES:
1. Use ANY and ALL exercises that fit this focus - gym equipment, free weights, cables, bands, machines, bodyweight
2. The movement patterns listed are EXAMPLES - use intelligent pattern recognition for variety
3. FORBIDDEN: Do NOT include exercises from other focus areas on this day
4. Both BODYWEIGHT and EQUIPMENT workouts must follow the same "${strengthFocus.focus}" focus
5. Maintain Smarty Gym's strength training philosophy: proper rest periods, progressive overload, appropriate tempo

${equipment === "EQUIPMENT" ? `
EQUIPMENT EXERCISES FOR ${strengthFocus.focus}:
Use all available gym equipment, free weights, cables, bands, and machines that target: ${strengthFocus.muscleGroups.join(", ")}` : `
BODYWEIGHT EXERCISES FOR ${strengthFocus.focus}:
Use all bodyweight exercises and progressions that target: ${strengthFocus.muscleGroups.join(", ")}`}

❌ ABSOLUTELY FORBIDDEN: Burpees, Mountain climbers, Jumping jacks, Sprints, any cardio exercise, EMOM/Tabata/AMRAP formats.
`;
  } else {
    return `
STRENGTH CATEGORY - GENERAL:
${equipment === "EQUIPMENT" ? `
• Use all available strength equipment: barbells, dumbbells, kettlebells, cables, machines` : `
• Use bodyweight strength exercises: push-ups, pull-ups, dips, squats, lunges, planks`}
❌ FORBIDDEN: Burpees, Mountain climbers, Jumping jacks, Sprints, any cardio exercise.
`;
  }
})() : ""}

${category === "CARDIO" ? `
═══════════════════════════════════════════════════════════════════════════════
CARDIO CATEGORY - ENHANCED EXERCISE OPTIONS
═══════════════════════════════════════════════════════════════════════════════

CARDIO PHILOSOPHY:
Heart rate and cardiovascular development. Think like a coach for runners, swimmers, track athletes.
Focus on aerobic/anaerobic threshold work, pacing strategies, and breathing.

${equipment === "EQUIPMENT" ? `
EQUIPMENT CARDIO - CARDIO MACHINES AS PRIMARY:
• Treadmill: Running, sprints (200m-400m), incline walks/runs
• Rowing machine: Intervals (500m repeats), distance work, sprint rows
• Stationary/Spin bike: Intervals, sustained tempo, hill climbs
• Elliptical: Low-impact cardio intervals, steady state
• Air bike / Assault bike: High-intensity intervals, calorie targets
• Ski Erg: Sprint intervals, sustained efforts
• Stair Climber: Intervals, steady state

EQUIPMENT CARDIO - ENHANCEMENT EXERCISES:
• Box jumps, Wall balls, Med ball slams
• Kettlebell swings, Battle ropes, Jump rope
• Sled pushes/pulls, Weight vest exercises

COMBINATIONS ALLOWED:
Equipment cardio workouts CAN combine machines with floor exercises.
Example: 500m Row + 20 KB Swings + 400m Bike + 15 Box Jumps + 200m Run
` : `
BODYWEIGHT CARDIO - RUNNING-BASED FOCUS:
• Sprints: 50m, 100m, 200m distances (full effort)
• Interval Running: Alternating sprint/jog patterns
• Shuttle Runs: 10m-20m-10m agility patterns, touch lines
• Tempo Runs: 200m-400m sustained pace efforts
• Hill sprints (if available), Stair runs

BODYWEIGHT CARDIO - ADDITIONAL EXERCISES:
• Jogging in place, High knees, Butt kicks, Jumping jacks
• Burpees, Mountain climbers, Box jumps
• Skaters, Bear crawls, Lateral shuffles, Star jumps
• Tuck jumps, Broad jumps, Squat jumps, Frog jumps
• A-Skips, B-Skips, Carioca, Bounding

BODYWEIGHT CARDIO MAIN WORKOUT EXAMPLE (Interval Running ~35 min):
Perform 4-5 rounds:
• Sprint 50m (full effort) → 60 sec active rest (walk back)
• Shuttle Run: 10m-20m-10m pattern → 90 sec complete rest
• Tempo Run 200m (sustained pace) → 120 sec active rest
`}
❌ FORBIDDEN: Heavy lifting, slow strength exercises, Reps & Sets format.
` : ""}

${category === "MOBILITY & STABILITY" ? `
MOBILITY & STABILITY CATEGORY:
EXERCISE SELECTION: Browse the EXERCISE LIBRARY by TARGET: spine stabilizers, hip flexors, rotator cuff, abductors, adductors. Select controlled mobility and stability exercises FROM THE LIBRARY ONLY.
❌ FORBIDDEN: High-intensity intervals, explosive movements, speed work.
` : ""}

${category === "METABOLIC" ? `
METABOLIC CATEGORY:
EXERCISE SELECTION: Browse the EXERCISE LIBRARY by TARGET: full body, cardiovascular system. Select explosive, power, and compound exercises FROM THE LIBRARY ONLY.
❌ FORBIDDEN: Reps & Sets format, long rest periods, isolation exercises.
` : ""}

${category === "CALORIE BURNING" ? `
CALORIE BURNING CATEGORY:
EXERCISE SELECTION: Browse the EXERCISE LIBRARY for high-rep, high-output exercises. ${equipment === "EQUIPMENT" ? `Filter for cardio machines, kettlebells, battle ropes, plyometric exercises.` : `Filter equipment='body weight' for bodyweight plyometric and locomotion exercises.`} Select exercises FROM THE LIBRARY ONLY.
❌ FORBIDDEN: Reps & Sets format, long rest periods, isolated strength work.
` : ""}

${category === "CHALLENGE" ? `
═══════════════════════════════════════════════════════════════════════════════
CHALLENGE CATEGORY - "THE GAMIFICATION KING"
═══════════════════════════════════════════════════════════════════════════════

PHILOSOPHY: 
Make people question themselves: "Can I accomplish this?"
This is NOT a normal workout. It's a TEST of mental and physical fortitude.
Challenge workouts should inspire users to talk about them, share them, and come back to beat their times.

STRUCTURE (MANDATORY - 5 SECTIONS, same as all non-recovery categories):
1. 🧽 SOFT TISSUE PREPARATION: Tissue prep (5 min)
2. 🔥 ACTIVATION: Dynamic warm-up + movement prep (10-15 min)
3. 💪 MAIN WORKOUT: The core challenge that defines the workout's FORMAT label
4. ⚡ FINISHER: Additional work tied to main workout performance OR separate challenge
5. 🧘 COOL DOWN: Recovery + optional final challenge element (like a run for time)

GAMIFICATION CONCEPTS (USE THESE CREATIVE IDEAS):
• "Take your burpee time in minutes, multiply by 3 = your reps for next exercises"
• "150 burpees for time - clock never stops"
• "Run 2km, 10 burpees, run 1km, 5 burpees, repeat 2x"
• "Descending ladder: 100 squats, 90 sit-ups, 80 push-ups, 70 rows..."
• "Death by burpees: Minute 1 = 1 burpee, Minute 2 = 2 burpees... until failure"
• "Complete 100 [exercise], but every time you break, run 200m"
• Age-based calculations: "Your age × 2 = burpees, your age = push-ups"
• Time-to-reps conversion: Use performance on one exercise to calculate work for the next
• "The clock runs from start to finish - including all transitions"

FORMAT DETERMINATION (CRITICAL):
• The FORMAT label is determined by the MAIN WORKOUT only
• Example: Main = "100 Burpees for time" → FORMAT = FOR TIME
• Even if finisher has classic reps (squats, push-ups), the main workout's format wins
• MIX format is for when the main workout truly combines multiple formats (e.g., EMOM + Tabata)
• Never label as REPS & SETS even if finisher uses rep counts

ALLOWED FORMATS: FOR TIME, AMRAP, EMOM, CIRCUIT, TABATA, MIX
FORBIDDEN: Classic REPS & SETS (this is not a strength session)

EQUIPMENT RULES:
• BODYWEIGHT: Use burpees, squats, push-ups, sit-ups, running in place, jumping, lunges
• EQUIPMENT: Can add kettlebells, dumbbells, wall balls, but at safe weights for fatigue
• NO heavy deadlifts or Olympic lifts - safety under fatigue is paramount
• Cardio machines allowed: treadmill, assault bike, rower (for distance/calorie challenges)
• TABATA CONSTRAINT: When using Tabata format, NO machine-based exercises allowed (no cable machines, leg press, smith machine, calf raise machine, lat pulldown, chest press, leg extension, leg curl, hack squat). Only free weights, bodyweight, and quick-grab equipment.

DESCRIPTION TONE:
• Challenge the reader: "This is not a 'pretty' workout"
• Set expectations: "The goal is simple: finish as fast as possible"
• Professional but intense: "There is no pacing comfort zone here"
• Create intrigue: Describe what makes this challenge unique

TIPS MUST INCLUDE:
• Pacing strategy for the main challenge
• Breathing guidance for high-rep work
• When and how to break reps strategically
• Movement quality reminders under fatigue
• Beginner scaling options (e.g., "Reduce burpees to 50-70")
• Mental cues for pushing through

GOLD STANDARD EXAMPLE - "Challenge me UP!" (CH-008):
• Warm-Up: 5 min run, 5 min jump rope, 5 min hip/arm circles
• Main Workout: 100 Burpees for time
• GAMIFICATION: Burpee time (in minutes) × 3 = reps for squats, push-ups, AND sit-ups
• Finisher: Complete the calculated reps for all three exercises
• Cool Down: 1K run as fast as possible (still timed!)
• Total: Clock runs from first burpee to end of final run
• This creates urgency: faster burpees = fewer finisher reps, but you're more fatigued

KEY INSIGHT: The FORMAT is "FOR TIME" because the main workout is 100 burpees for time.
The finisher's reps don't change this classification - they are a consequence of the main workout.
` : ""}

${category === "PILATES" ? `
═══════════════════════════════════════════════════════════════════════════════
PILATES CATEGORY - CONTROLLED MOVEMENT EXCELLENCE
═══════════════════════════════════════════════════════════════════════════════

PHILOSOPHY:
Pilates is about controlled, precise movements that build core strength, flexibility, 
and body awareness. Every exercise should emphasize quality over quantity, breath control,
and mind-body connection.

FORMAT: REPS & SETS ONLY (controlled movements require this structure)
DURATION: 30-45 minutes depending on difficulty

${equipment === "EQUIPMENT" ? `
PILATES STUDIO EQUIPMENT VERSION:
Your workout must use ONLY Pilates studio-style equipment and props.

═══════════════════════════════════════════════════════════════════════════════
STRICTLY ALLOWED EQUIPMENT (NOTHING ELSE):
═══════════════════════════════════════════════════════════════════════════════
• Resistance bands / mini bands
• Stability ball (Swiss ball)
• Medicine ball / soft ball
• Foam roller
• Bosu ball
• Rope / jump rope
• Bodyweight exercises (always allowed)

❌ ABSOLUTELY FORBIDDEN EQUIPMENT IN PILATES:
• Barbell, dumbbell, kettlebell (NO free weights except bands)
• Leverage machine, smith machine, cable machine (NO gym machines)
• Sled, battle ropes, weighted vest (NO heavy gym tools)
• Any equipment you would NOT find in a Pilates studio

PILATES STUDIO EXERCISE PRINCIPLES:
• Controlled, flowing movements with precise form
• Core engagement (powerhouse) throughout
• 3-4 second tempo for all movements
• Breath coordination: Exhale on exertion
• Focus on alignment, symmetry, and body awareness
• Low impact, no explosive movements

EXERCISE SELECTION:
You MUST select exercises ONLY from the exercise library provided.
Filter the library for exercises using: body weight, band, resistance band, 
stability ball, medicine ball, roller, bosu ball, rope.
Do NOT select any exercise that uses barbells, dumbbells, kettlebells, 
leverage machines, cable machines, or any gym-specific equipment.
` : `
MAT PILATES (BODYWEIGHT VERSION):
Classical mat Pilates with optional props (fit ball, ring, mini bands allowed).

CRITICAL: Select ALL Pilates exercises ONLY from the exercise library provided below.
Do NOT use exercise names not found in the library. Do NOT invent classical Pilates names.
Search the library for Pilates-appropriate exercises by filtering for:
- Body Part: waist, upper legs, lower legs
- Target: abs, glutes, hip flexors, adductors
- Equipment: body weight

Every exercise MUST use {{exercise:ID:Name}} format from the library.

MODIFICATION LEVELS:
• Beginner (1-2★): Basic versions, more rest, fewer reps
• Intermediate (3-4★): Full classical movements, moderate reps
• Advanced (5-6★): Advanced variations, longer holds, flowing sequences
`}

FINISHER FOR PILATES:
• Keep REPS & SETS format (category rule)
• Focus on stretching and core endurance
• Examples: 3x30 sec Side Plank each side, 3x20 Swimming pulses, Deep stretching series

❌ FORBIDDEN IN PILATES:
• Explosive movements (no jumping, no burpees)
• Heavy weights (maximum 5kg dumbbells)
• High-intensity intervals
• Speed-based exercises
• Any cardiovascular spikes

NAMING SUGGESTIONS FOR PILATES:
• Flow, Balance, Core, Align, Center, Lengthen, Stabilize, Ground, Breathe
• Examples: "Core Flow", "Balance Point", "Center Alignment", "Lengthen & Strengthen"
` : ""}

${category === "RECOVERY" ? `
═══════════════════════════════════════════════════════════════════════════════
RECOVERY CATEGORY - RESTORE, REGENERATE, RECOVER
═══════════════════════════════════════════════════════════════════════════════

PHILOSOPHY:
Recovery days are about active recovery, regeneration, and restoring the body.
The focus is on stretching, mobilization, decompression, and light activity.
Recovery is NOT about intensity - it's about healing and preparing for future workouts.

FORMAT: FLOW (combination of modalities, not classic CIRCUIT or REPS & SETS)
DURATION: 30-45 minutes
EQUIPMENT: VARIOUS (may use bicycle, treadmill, fit ball, foam roller - these are TOOLS, not "gym equipment")

═══════════════════════════════════════════════════════════════════════════════
CRITICAL - NO DIFFICULTY LEVEL:
═══════════════════════════════════════════════════════════════════════════════
Recovery does NOT have a difficulty level. There are no stars (1-6).
Recovery is ONE workout suitable for EVERYONE - beginners to advanced.
The intensity is ALWAYS LOW - suitable for anyone.

═══════════════════════════════════════════════════════════════════════════════
CRITICAL - ONE VARIOUS WORKOUT:
═══════════════════════════════════════════════════════════════════════════════
Recovery does NOT follow the "Equipment/No Equipment" distinction.
We generate ONE VARIOUS workout that may include:
• Bicycle (indoor or outdoor), elliptical, treadmill (walking)
• Fit ball, foam roller, yoga mat
• No equipment at all (just body movement)
These are TOOLS for recovery, not "gym equipment" in the traditional sense.

═══════════════════════════════════════════════════════════════════════════════
PRIMARY FOCUS (ALWAYS FIRST AND PRIMARY):
═══════════════════════════════════════════════════════════════════════════════
• STRETCHING - Always included, always the first and primary focus
  - Static stretches (hold 30-60 seconds)
  - PNF stretching
  - Passive stretches
  - Full body stretching covering all major muscle groups
  
• MOBILIZATION - Second priority
  - Cat-cow, scorpions, hip circles
  - Shoulder CARs (Controlled Articular Rotations)
  - Worlds greatest stretch
  - Hip openers, thoracic rotations

• DECOMPRESSION - Third priority
  - Spine decompression (hanging, childs pose, extensions)
  - Hip decompression (figure 4, piriformis stretches)
  - Shoulders and neck release

═══════════════════════════════════════════════════════════════════════════════
ALLOWED EXERCISES:
CRITICAL: ALL exercises in Recovery MUST come from the exercise library below.
Use {{exercise:ID:Name}} format for EVERY exercise. Do NOT invent exercise names.
Search the library for recovery-appropriate exercises (stretches, mobility, light movements).
The ONLY exception is foam rolling / lacrosse ball work in the Soft Tissue section — those are TOOLS, not exercises.

LIGHT AEROBIC (warm-up only, low intensity):
• Walking, light jogging, cycling — these are ACTIVITIES described in plain text, not library exercises

STRETCHING & MOBILITY & STABILITY:
• Search the exercise library for stretches and mobility exercises
• Use {{exercise:ID:Name}} format for every exercise found in the library
• If a specific stretch is not in the library, find the closest equivalent that IS

BREATHING:
• Diaphragmatic breathing, box breathing — these are TECHNIQUES described in plain text

═══════════════════════════════════════════════════════════════════════════════
❌ FORBIDDEN IN RECOVERY (ABSOLUTE NO):
═══════════════════════════════════════════════════════════════════════════════
• Burpees - NEVER
• Jumping of any kind (no jump squats, no box jumps, no tuck jumps)
• Sprints or fast running
• Heavy weights or any weighted exercises
• High-intensity anything
• Time pressure or competition elements
• Circuits with minimal rest
• Any exercise that elevates heart rate significantly
• Strength training movements
• Explosive movements
• AMRAP, EMOM, FOR TIME, TABATA formats

═══════════════════════════════════════════════════════════════════════════════
STRUCTURE FOR RECOVERY WORKOUT:
═══════════════════════════════════════════════════════════════════════════════
1. WARM-UP (5-10 min):
   • Very light aerobic activity (walking, light cycling)
   • Gentle joint mobilization
   
2. MAIN WORKOUT (15-25 min):
   • Focus on STRETCHING as the primary component
   • Include mobilization work for major joints
   • Include decompression exercises for spine and hips
   • Flow from one stretch to the next
   
3. COOL DOWN (5-10 min):
   • Deep breathing exercises
   • Final relaxation stretches
   • Mindfulness or meditation moment (optional)

═══════════════════════════════════════════════════════════════════════════════
NAMING SUGGESTIONS FOR RECOVERY:
═══════════════════════════════════════════════════════════════════════════════
• Restore, Recover, Renew, Reset, Refresh
• Unwind, Ease, Release, Breathe, Flow
• Decompress, Realign, Rebalance, Rejuvenate
• Examples: "Deep Restore", "Body Reset", "Breathe & Release", "Full Flow Recovery"
` : ""}

═══════════════════════════════════════════════════════════════════════════════
FORMAT DEFINITIONS (MUST FOLLOW EXACTLY):
═══════════════════════════════════════════════════════════════════════════════
• Tabata: 20 seconds work, 10 seconds rest, 8 rounds per exercise
• Circuit: 4-6 exercises repeated 3-5 rounds with minimal rest between exercises
• AMRAP: As Many Rounds As Possible in a given time (e.g., 15 min AMRAP)
• For Time: Complete all exercises as fast as possible (record time)
• EMOM: Every Minute On the Minute - perform set at start of each minute, rest remainder
• Reps & Sets: Classic strength format (e.g., 4 sets x 8 reps) with defined rest
• Mix: Combination of two or more formats (e.g., EMOM warm-up + Tabata finisher)
• Flow: Gentle, continuous movement from one exercise to the next (for RECOVERY only)

YOUR FORMAT TODAY: ${format}
You MUST structure the workout using the ${format} format rules defined above.

═══════════════════════════════════════════════════════════════════════════════
RESPONSE FORMAT (JSON ONLY - NO MARKDOWN):
═══════════════════════════════════════════════════════════════════════════════

CRITICAL HTML FORMATTING RULES (FOLLOW EXACTLY - THIS IS NON-NEGOTIABLE):

1. SECTION TITLES: Icon + Bold + Underlined with duration
   Format: <p class="tiptap-paragraph">🧽 <strong><u>Soft Tissue Preparation 5'</u></strong></p>
   Icons: 🧽 Soft Tissue Preparation, 🔥 Activation, 💪 Main Workout, ⚡ Finisher, 🧘 Cool Down
   ONLY ONE ICON PER SECTION - Never duplicate icons!
   
2. EXERCISE LINES: Use BULLET LISTS for exercises
   Format: <ul class="tiptap-bullet-list"><li class="tiptap-list-item"><p class="tiptap-paragraph">Exercise name</p></li></ul>
   
3. TIMING LABELS: Bold for minute/round indicators within list items
   Format: <li class="tiptap-list-item"><p class="tiptap-paragraph"><strong>Minute 1:</strong> 15 Kettlebell Swings</p></li>

4. SECTION SEPARATORS: ONE empty paragraph between major sections ONLY
   Format: <p class="tiptap-paragraph"></p>
   NO empty paragraphs between exercise lines within a section!

5. FIVE SECTIONS REQUIRED (for Strength, Calorie Burning, Metabolic, Cardio, Mobility & Stability, Challenge):
   Soft Tissue Preparation, Activation, Main Workout, Finisher, Cool Down

BULLET POINT RULE (ABSOLUTE - NON-NEGOTIABLE):
- Bullet points (<li>) are EXCLUSIVELY for exercises and exercise sets
- NEVER use bullets for: format labels ("For Time:", "AMRAP 10 min:"), instructions ("Focus on form"), rest periods as standalone items, coaching cues, or any non-exercise text
- If it's not something a person physically DOES, it does NOT get a bullet
- Format labels go in the SECTION TITLE (e.g., "⚡ Finisher: Power Burn (For Time)")
- Instructions and coaching cues go in the "instructions" field, NOT inside main_workout content

EXERCISE DESCRIPTION CLARITY (MANDATORY):
- Every exercise must specify the EQUIPMENT explicitly:
  WRONG: "500m Row sprint" (row what? rowing machine? sprint where?)
  CORRECT: "500m Rowing Machine" or "500m on Rower"
- Unilateral exercises MUST specify "each side/arm/leg" or "total":
  WRONG: "20 Thrusters (light dumbbell)"
  CORRECT: "20 Dumbbell Thrusters (10 each arm, moderate weight)" or "20 Barbell Thrusters (light load)"
- Weight guidance must be specific:
  WRONG: "light dumbbell/kettlebell"
  CORRECT: "moderate dumbbell (8-12kg)" or "light kettlebell (8-12kg)"
- Machine exercises: Always name the specific machine (Rowing Machine, Ski Erg, Assault Bike)
- Free weight exercises: Always name the specific implement (barbell, dumbbell, kettlebell)
- "Sprint" is ONLY for running. On a rowing machine, it's "max effort" or "fast pace"

CONTENT SEPARATION RULE (CRITICAL):
- The "main_workout" field contains ONLY: section titles + exercise lists
- Coaching cues like "Focus on completing as fast as possible with good form" belong in the "instructions" field, NOT as bullet points inside main_workout
- Rest period guidance (e.g., "Rest 60 seconds between rounds") can appear as a plain text line between exercise blocks, but NEVER as a bullet point

GOLD STANDARD 5-SECTION TEMPLATE (FOLLOW EXACTLY):
IMPORTANT: The exercises shown below are EXAMPLES using {{exercise:ID:Name}} markup. 
YOU MUST replace them with exercises from YOUR exercise library above — using the SAME {{exercise:ID:Name}} format.
NEVER use plain exercise names. EVERY exercise MUST use {{exercise:ID:Name}} format.

🧽 Soft Tissue Preparation: This section is NON-EXERCISE instructional text (foam rolling, lacrosse ball work).
These are TOOLS and TECHNIQUES, not exercises from the library. Write them as plain text descriptions.
Example:
<p class="tiptap-paragraph">🧽 <strong><u>Soft Tissue Preparation 5'</u></strong></p>
<ul class="tiptap-bullet-list">
<li class="tiptap-list-item"><p class="tiptap-paragraph">Foam roll quads, hamstrings, calves (30-45 sec per area)</p></li>
<li class="tiptap-list-item"><p class="tiptap-paragraph">Foam roll glutes, lats, upper back (30-45 sec per area)</p></li>
<li class="tiptap-list-item"><p class="tiptap-paragraph">Lacrosse ball work for feet and hips (focus on tension spots)</p></li>
</ul>
<p class="tiptap-paragraph"></p>

🔥 Activation & 💪 Main Workout & ⚡ Finisher & 🧘 Cool Down: ALL exercises MUST come from the library.
Example (using real library exercises):
<p class="tiptap-paragraph">🔥 <strong><u>Activation 15'</u></strong></p>
<ul class="tiptap-bullet-list">
<li class="tiptap-list-item"><p class="tiptap-paragraph"><strong>Mobility (2 min):</strong> {{exercise:1311:Spine Stretch}} (10 reps), {{exercise:0571:Ankle Circles}} (10 per direction)</p></li>
<li class="tiptap-list-item"><p class="tiptap-paragraph"><strong>Stability (5 min):</strong> {{exercise:3212:Bird Dog}} (8 per side), {{exercise:0578:Glute Bridge March}} (12 reps)</p></li>
<li class="tiptap-list-item"><p class="tiptap-paragraph"><strong>Dynamic Warm-up (8 min):</strong> {{exercise:0630:Jumping Jack}} (30 sec), {{exercise:1160:High Knee Skips}} (30 sec)</p></li>
</ul>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph">💪 <strong><u>Main Workout (20-minute EMOM)</u></strong></p>
<ul class="tiptap-bullet-list">
<li class="tiptap-list-item"><p class="tiptap-paragraph"><strong>Minute 1:</strong> 15 {{exercise:0548:Kettlebell Sumo High Pull}} (moderate weight)</p></li>
<li class="tiptap-list-item"><p class="tiptap-paragraph"><strong>Minute 2:</strong> 12 {{exercise:1636:Jump Squat}} (explosive)</p></li>
<li class="tiptap-list-item"><p class="tiptap-paragraph"><strong>Minute 3:</strong> 10 {{exercise:0291:Dumbbell Goblet Squat}} (moderate weight)</p></li>
<li class="tiptap-list-item"><p class="tiptap-paragraph"><strong>Minute 4:</strong> 10 {{exercise:1160:Burpee}} (full range)</p></li>
</ul>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph">⚡ <strong><u>Finisher (For Time)</u></strong></p>
<ul class="tiptap-bullet-list">
<li class="tiptap-list-item"><p class="tiptap-paragraph">20 {{exercise:0291:Dumbbell Goblet Squat}} (moderate weight)</p></li>
<li class="tiptap-list-item"><p class="tiptap-paragraph">30 {{exercise:1636:Jump Squat}}</p></li>
<li class="tiptap-list-item"><p class="tiptap-paragraph">20 {{exercise:0548:Kettlebell Sumo High Pull}} (16-20kg)</p></li>
</ul>

BAD EXAMPLE (NEVER DO THIS — plain text exercise names without {{exercise:ID:Name}} markup):
  * Kettlebell Swings ← WRONG: must be {{exercise:ID:Kettlebell Swings}}
  * Child's Pose ← WRONG: not in library AND no markup
  * Focus on completing as fast as possible ← WRONG: instruction with a bullet
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph">🧘 <strong><u>Cool Down 10'</u></strong></p>
<ul class="tiptap-bullet-list">
<li class="tiptap-list-item"><p class="tiptap-paragraph"><strong>Static Stretching (8 min):</strong> {{exercise:1473:Standing Gastrocnemius Calf Stretch}} (each leg), {{exercise:1502:Standing Hamstring and Calf Stretch}} (30 sec each)</p></li>
<li class="tiptap-list-item"><p class="tiptap-paragraph">{{exercise:1424:Seated Glute Stretch}} (60 sec per side), {{exercise:0850:Overhead Triceps Stretch}} (30 sec each arm)</p></li>
<li class="tiptap-list-item"><p class="tiptap-paragraph"><strong>Diaphragmatic Breathing (2 min):</strong> Lie supine, one hand on chest, one on belly</p></li>
<li class="tiptap-list-item"><p class="tiptap-paragraph">Slow inhale through nose (belly rises), slow exhale through mouth. Focus on calming nervous system.</p></li>
</ul>

SECTION ICON RULES (MANDATORY):
- 🧽 for Soft Tissue Preparation (ONLY ONE - never duplicate)
- 🔥 for Activation (ONLY ONE - never duplicate)
- 💪 for Main Workout (ONLY ONE - never duplicate)
- ⚡ for Finisher (ONLY ONE - never duplicate)
- 🧘 for Cool Down (ONLY ONE - never duplicate)
Icons go BEFORE <strong><u>Section Title</u></strong> with a space after the emoji.

SECTION NAMING RULE (MANDATORY):
- Soft Tissue Preparation, Activation, Cool Down: Keep simple names with duration
    Example: "Soft Tissue Preparation 5'", "Activation 15'", "Cool Down 10'"
- Main Workout: Label as "Main Workout (FORMAT DURATION')" — NO creative sub-name
    CORRECT: "Main Workout (TABATA 24')" or "Main Workout (CIRCUIT 30')"
    WRONG: "Main Workout: Iron Forge (TABATA 24')" — no sub-names allowed
- Finisher: Label as "Finisher (FORMAT DURATION')" or "Finisher (For Time)" — NO creative sub-name
    CORRECT: "Finisher (8-minute AMRAP)" or "Finisher (For Time)"
    WRONG: "Finisher: Burn Out (8-minute AMRAP)" — no sub-names allowed
- The creative workout name belongs ONLY in the "name" field of the JSON response
- The ENTIRE workout shares ONE name. Sections do not get their own names.

GOLD STANDARD REPS & SETS TEMPLATE (FOR STRENGTH / MOBILITY & STABILITY / PILATES):
The EMOM template above shows timed formats. For REPS & SETS workouts, use THIS template instead:

<p class="tiptap-paragraph">💪 <strong><u>Main Workout (REPS & SETS 20')</u></strong></p>
<ul class="tiptap-bullet-list">
<li class="tiptap-list-item"><p class="tiptap-paragraph">Push-up - 4 sets x 10 reps (3-1-1-0 tempo)</p></li>
<li class="tiptap-list-item"><p class="tiptap-paragraph">Inverted Row - 4 sets x 8-10 reps (controlled tempo)</p></li>
<li class="tiptap-list-item"><p class="tiptap-paragraph">Pike Push-up - 3 sets x 8 reps (2-1-1-0 tempo)</p></li>
<li class="tiptap-list-item"><p class="tiptap-paragraph">Bench Dip - 3 sets x 12 reps</p></li>
<li class="tiptap-list-item"><p class="tiptap-paragraph">Plank Shoulder Tap - 3 sets x 10 reps per side</p></li>
</ul>
<p class="tiptap-paragraph">Rest 90-120 seconds between sets for compound movements, 60-90 seconds for isolation.</p>

REPS & SETS FORMAT MANDATORY RULE:
Every exercise line in a REPS & SETS workout MUST include sets x reps prescription.
Examples of CORRECT formatting:
  "Push-up - 4 sets x 10 reps (3-1-1-0 tempo)"
  "Barbell Bench Press - 4 sets x 8-10 reps (3-1-1-0 tempo)"
  "Plank - 3 sets x 30-45 seconds"
  "Glute Bridge - 3 sets x 12 reps per side"
Examples of INVALID formatting (NEVER DO THIS):
  "Push-up" ← INVALID: no sets, no reps, completely unusable
  "Bench Press" ← INVALID: the user has no idea what to do
  "Squat (bodyweight)" ← INVALID: still missing prescription
An exercise listed without sets x reps prescription is INVALID and UNPROFESSIONAL.
This rule applies to EVERY exercise in the Main Workout AND Finisher sections.

Difficulty-based prescription guidelines for REPS & SETS:
- 1-2 stars (Beginner): 3 sets x 10-12 reps, moderate tempo, longer rest (90-120s)
- 3-4 stars (Intermediate): 4 sets x 8-10 reps, controlled tempo (3-1-1-0), moderate rest (60-90s)
- 5-6 stars (Advanced): 4-5 sets x 5-8 reps, strict tempo (4-1-1-0), shorter rest (60-90s)

COMPACT SPACING RULES:
- NO empty paragraphs between exercises within a section
- ONE empty paragraph between sections only
- NO leading empty paragraphs at the start

DURATION RULE (CRITICAL - NEW DEFINITION):

The "duration" of a workout refers to the MAIN WORKOUT + FINISHER time ONLY.
Soft Tissue (5'), Activation (10-15'), and Cool Down (10') are CONSTANT overhead 
that every routine includes -- they are NOT part of the advertised duration.

When you see "Target Duration: 30 min", that means:
  Main Workout + Finisher = 30 minutes
  The full routine will be ~55 minutes (25' overhead + 30' work)

This is like a restaurant menu showing "cooking time" not "total visit time."
Customers want to know how long the ACTUAL TRAINING is.

YOUR TARGET MAIN+FINISHER DURATION: ${duration}

DURATION-RPE-DIFFICULTY RELATIONSHIP (THINK LIKE AN EXPERT COACH):

Short duration + Advanced difficulty = MAXIMUM intensity (RPE ceiling)
  A 15-minute advanced workout must be absolutely brutal. Every second counts.

Long duration + Advanced difficulty = High but NOT maximum intensity (RPE 1-2 below ceiling)
  A 50-minute advanced session sustains high effort but allows pacing.

Short duration + Beginner difficulty = Still meaningful stimulus
  A 15-minute beginner workout must still deliver real training value. 
  Not filler. Not "just stretching." Real work at appropriate intensity.

Long duration + Beginner difficulty = Gentle but complete programming
  More exercises, more rest, more technique focus. Low RPE but full session.

VARIETY IS ESSENTIAL:
  Your platform serves thousands of customers with different schedules.
  Some want 15-minute sessions. Some want 50-minute sessions.
  Generate VARIETY in duration across days. Not every workout should be 30 minutes.
  Short workouts are just as valuable as long ones when designed properly.

INTERNAL TOTAL ROUTINE AWARENESS:
  While the advertised duration is Main + Finisher only, you must still ensure
  the TOTAL routine (all 5 sections) does not exceed 90 minutes.
  A typical total routine: 25' overhead + Main + Finisher = total.

${durationDistributionPrompt}

{
  "name": "Creative, motivating workout name (2-4 words, unique)",
  "description": "2-3 sentence HTML description with <p class='tiptap-paragraph'> tags",
  "main_workout": "MUST follow the gold standard template - bullet lists for exercises, single icons, compact spacing",
  "instructions": "Step-by-step guidance in <p class='tiptap-paragraph'> tags",
  "tips": "2-4 coaching tips as separate paragraphs"
}`;

      // ═══════════════════════════════════════════════════════════════════════════════
      // ROBUST AI CALL WITH TOOL CALLING FOR GUARANTEED STRUCTURED OUTPUT
      // Phase 1: Tool calling for reliable JSON structure
      // Phase 2: Fallback to text parsing if tool calling unavailable
      // Phase 3: Single retry with minimal prompt if both fail
      // ═══════════════════════════════════════════════════════════════════════════════
      
      // Define the tool for structured workout output
      const wodTool = {
        type: "function",
        function: {
          name: "generate_workout",
          description: "Generate a structured workout with all required fields",
          parameters: {
            type: "object",
            properties: {
              name: { type: "string", description: "Creative 2-4 word workout name" },
              description: { type: "string", description: "2-3 sentence HTML description with <p class='tiptap-paragraph'> tags" },
              main_workout: { type: "string", description: "HTML workout content with Warm Up, Main Workout, Finisher, Cool Down sections" },
              instructions: { type: "string", description: "Step-by-step guidance in HTML paragraph tags" },
              tips: { type: "string", description: "2-4 coaching tips as HTML paragraphs" }
            },
            required: ["name", "description", "main_workout", "instructions", "tips"],
            additionalProperties: false
          }
        }
      };
      
      let workoutContent: { name: string; description: string; main_workout: string; instructions: string; tips: string } | null = null;
      let parseMethod = "unknown";
      
      // AI Model failover: try primary model first, then fallbacks
      const AI_MODELS = [
        "google/gemini-2.5-flash",
        "google/gemini-2.5-flash-lite",
        "openai/gpt-5-mini",
      ];
      
      for (const aiModel of AI_MODELS) {
        if (workoutContent) break;
        logStep(`Trying AI model: ${aiModel}`, { equipment });
      
      // Attempt 1: Tool calling (most reliable)
      try {
        logStep(`AI API call with tool calling`, { equipment, model: aiModel });
        
        const toolResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: aiModel,
            messages: [
              { role: "system", content: "You are an expert fitness coach. Generate workouts using the provided tool." },
              { role: "user", content: workoutPrompt }
            ],
            tools: [wodTool],
            tool_choice: { type: "function", function: { name: "generate_workout" } }
          }),
        });

        if (toolResponse.ok) {
          const toolData = await toolResponse.json();
          const toolCall = toolData.choices?.[0]?.message?.tool_calls?.[0];
          
          if (toolCall?.function?.arguments) {
            try {
              workoutContent = JSON.parse(toolCall.function.arguments);
              parseMethod = "tool_calling";
              logStep(`✅ Tool calling succeeded`, { equipment, name: workoutContent?.name });
            } catch (toolParseError) {
              logStep(`Tool calling returned invalid JSON`, { 
                error: toolParseError instanceof Error ? toolParseError.message : String(toolParseError),
                argsPreview: toolCall.function.arguments?.substring(0, 200)
              });
            }
          } else {
            logStep(`Tool calling response missing tool_calls`, { 
              hasChoices: !!toolData.choices?.length,
              hasMessage: !!toolData.choices?.[0]?.message
            });
          }
        } else {
          const errorText = await toolResponse.text();
          logStep(`Tool calling API error`, { status: toolResponse.status, errorPreview: errorText.substring(0, 200) });
        }
      } catch (toolError: any) {
        logStep(`Tool calling network error`, { error: toolError.message });
      }
      
      // Attempt 2: Regular text parsing with explicit JSON instruction (fallback)
      if (!workoutContent) {
        logStep(`Falling back to text-based JSON parsing`, { equipment });
        
        try {
          const textResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${lovableApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: aiModel,
              messages: [
                { role: "system", content: "You are an expert fitness coach. Return ONLY valid JSON with no markdown, no code blocks, no explanation. Start with { and end with }." },
                { role: "user", content: workoutPrompt }
              ],
            }),
          });

          if (textResponse.ok) {
            const textData = await textResponse.json();
            let content = textData.choices?.[0]?.message?.content || '';
            
            // Robust markdown stripping
            content = content.replace(/^```(?:json|JSON)?\s*\n?/gm, '');
            content = content.replace(/\n?```\s*$/gm, '');
            
            const firstBrace = content.indexOf('{');
            const lastBrace = content.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
              content = content.substring(firstBrace, lastBrace + 1);
            }
            content = content.trim();
            
            workoutContent = JSON.parse(content);
            parseMethod = "text_fallback";
            logStep(`✅ Text parsing succeeded`, { equipment, name: workoutContent?.name });
          } else {
            const errorText = await textResponse.text();
            logStep(`Text-based API error`, { status: textResponse.status, errorPreview: errorText.substring(0, 200) });
          }
        } catch (textError: any) {
          logStep(`Text parsing failed`, { error: textError.message });
        }
      }
      
      // Attempt 3: Minimal prompt retry (saves credits by using shorter prompt)
      if (!workoutContent) {
        logStep(`Final retry with minimal prompt`, { equipment });
        
        const minimalPrompt = `Generate a ${category} workout for ${equipment === "BODYWEIGHT" ? "bodyweight only" : "gym equipment"}.
Difficulty: ${selectedDifficulty.name} (${selectedDifficulty.stars}/6 stars)
Format: ${format}

MANDATORY: The main_workout MUST contain exactly 5 sections with these emoji icons in order:
🧽 Soft Tissue Preparation, 🔥 Activation, 💪 Main Workout, ⚡ Finisher, 🧘 Cool Down

Return JSON with these exact fields:
{
  "name": "2-4 word creative name",
  "description": "<p class='tiptap-paragraph'>Brief description</p>",
  "main_workout": "<p class='tiptap-paragraph'>🧽 <strong><u>Soft Tissue Preparation 5'</u></strong></p><ul class='tiptap-bullet-list'><li class='tiptap-list-item'><p class='tiptap-paragraph'>Exercise</p></li></ul><p class='tiptap-paragraph'></p><p class='tiptap-paragraph'>🔥 <strong><u>Activation 10'</u></strong></p>...<p class='tiptap-paragraph'>💪 <strong><u>Main Workout (${format})</u></strong></p>...<p class='tiptap-paragraph'>⚡ <strong><u>Finisher</u></strong></p>...<p class='tiptap-paragraph'>🧘 <strong><u>Cool Down 10'</u></strong></p>...",
  "instructions": "<p class='tiptap-paragraph'>How to perform</p>",
  "tips": "<p class='tiptap-paragraph'>Coaching tips</p>"
}`;
        
        try {
          const retryResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${lovableApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: aiModel,
              messages: [
                { role: "system", content: "Return ONLY valid JSON. No markdown. No explanation." },
                { role: "user", content: minimalPrompt }
              ],
            }),
          });

          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            let content = retryData.choices?.[0]?.message?.content || '';
            
            content = content.replace(/^```(?:json|JSON)?\s*\n?/gm, '');
            content = content.replace(/\n?```\s*$/gm, '');
            
            const firstBrace = content.indexOf('{');
            const lastBrace = content.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
              content = content.substring(firstBrace, lastBrace + 1);
            }
            content = content.trim();
            
            workoutContent = JSON.parse(content);
            parseMethod = "minimal_retry";
            logStep(`✅ Minimal retry succeeded`, { equipment, name: workoutContent?.name });
          }
        } catch (retryError: any) {
          logStep(`Minimal retry failed`, { error: retryError.message });
        }
      }
      
      } // end of AI_MODELS failover loop
      
      // If all models and attempts failed, throw to trigger per-equipment error handling
      if (!workoutContent) {
        throw new Error(`All AI parsing attempts failed for ${equipment} workout (tried models: ${AI_MODELS.join(', ')})`);
      }
      
      logStep(`Workout content acquired via ${parseMethod}`, { equipment, name: workoutContent.name });

      // ═══════════════════════════════════════════════════════════════════════════════
      // POST-GENERATION NAME UNIQUENESS CHECK
      // If the AI generated a name that already exists, auto-differentiate it
      // ═══════════════════════════════════════════════════════════════════════════════
      if (workoutContent.name) {
        const nameToCheck = workoutContent.name.trim();
        const nameExistsInDb = existingNamesForCategory.some(
          (n: string) => n.trim().toLowerCase() === nameToCheck.toLowerCase()
        );
        const nameMatchesFirstWorkout = firstWorkoutName && 
          firstWorkoutName.trim().toLowerCase() === nameToCheck.toLowerCase();
        
        if (nameExistsInDb || nameMatchesFirstWorkout || hasInternalNameCode(nameToCheck) || hasAiStyleName(nameToCheck)) {
          const cleaned = cleanPublicWorkoutName(nameToCheck, category, equipment, existingNamesForCategory);
          logStep(`⚠️ Name collision/internal code detected, applying public-safe rename`, {
            original: nameToCheck,
            newName: cleaned.name,
            reason: cleaned.reason,
            collidedWith: nameExistsInDb ? 'database' : nameMatchesFirstWorkout ? 'first workout today' : hasAiStyleName(nameToCheck) ? 'AI-style wording' : 'internal code'
          });
          workoutContent.name = cleaned.name;
        }
        
        // Add the new name to our tracking list to prevent same-session collisions
        existingNamesForCategory.push(workoutContent.name);
      }

      // ═══════════════════════════════════════════════════════════════════════════════
      // LIBRARY-FIRST VALIDATION + SAFETY NET
      // Step 1: Check if the AI used {{exercise:ID:Name}} markup correctly
      // Step 2: Validate that every ID exists in the library
      // Step 3: Run section-aware matching as SAFETY NET for any exercises
      //         the AI failed to mark up (post-processing catches stragglers)
      // ═══════════════════════════════════════════════════════════════════════════════
      // For Pilates EQUIPMENT: use the strict Pilates-filtered library for post-processing
      const currentExerciseLibrary = (category === "PILATES" && equipment === "EQUIPMENT") 
        ? pilatesEquipmentExercises 
        : (equipment === "BODYWEIGHT" ? bodyweightExercises : fullExercises);
      
      if (currentExerciseLibrary.length > 0 && workoutContent.main_workout) {
        // Build ID lookup map
        const libraryById = new Map(currentExerciseLibrary.map(ex => [ex.id, ex]));
        
        // Step 1: Validate all {{exercise:ID:Name}} markup IDs
        const markupValidationPattern = /\{\{(?:exercise|exrcise|excersize|excercise):([^:]+):([^}]+)\}\}/gi;
        let markupMatch;
        let validMarkupCount = 0;
        let invalidMarkupCount = 0;
        const invalidIds: string[] = [];
        
        const mainContent = workoutContent.main_workout;
        while ((markupMatch = markupValidationPattern.exec(mainContent)) !== null) {
          const id = markupMatch[1];
          if (libraryById.has(id)) {
            validMarkupCount++;
          } else {
            invalidMarkupCount++;
            invalidIds.push(`${id}:${markupMatch[2]}`);
          }
        }
        
        logStep(`Library-first validation`, {
          equipment,
          validMarkup: validMarkupCount,
          invalidMarkup: invalidMarkupCount,
          invalidIds: invalidIds.slice(0, 5)
        });
        
        // Step 2: Strip invalid markup (wrong IDs) so safety net can re-match
        if (invalidIds.length > 0) {
          let cleaned = workoutContent.main_workout;
          for (const invalidId of invalidIds) {
            const [id, name] = invalidId.split(':');
            cleaned = cleaned.replace(
              new RegExp(`\\{\\{(?:exercise|exrcise|excersize|excercise):${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:[^}]+\\}\\}`, 'gi'),
              name
            );
          }
          workoutContent.main_workout = cleaned;
        }
        
        // Step 3: Section-aware matching as SAFETY NET
        // This catches any exercises the AI wrote as plain text (without markup)
        logStep(`Running section-aware safety net for ${equipment} workout (${currentExerciseLibrary.length} exercises)...`);
        
        const result = processContentSectionAware(
          workoutContent.main_workout,
          currentExerciseLibrary,
          `[WOD-MATCH][${equipment}]`
        );
        
        workoutContent.main_workout = result.processedContent;
        
        logStep(`Exercise matching complete for ${equipment}`, { 
          preExistingMarkup: validMarkupCount,
          safetyNetMatched: result.matched.length, 
          unmatched: result.unmatched.length 
        });
        
        // ═══════════════════════════════════════════════════════════════════════════════
        // BULLETPROOF FINAL SWEEP: Catch ANY remaining unlinked exercises in <li> items
        // This guarantees EVERY exercise gets a View button — no exceptions
        // ═══════════════════════════════════════════════════════════════════════════════
        const finalSweep = guaranteeAllExercisesLinked(
          workoutContent.main_workout,
          currentExerciseLibrary,
          `[WOD-FINAL-SWEEP][${equipment}]`
        );
        workoutContent.main_workout = finalSweep.processedContent;
        
        if (finalSweep.forcedMatches.length > 0) {
          logStep(`Final sweep linked ${finalSweep.forcedMatches.length} additional exercises`, {
            equipment,
            matches: finalSweep.forcedMatches.map(m => `"${m.original}" → "${m.matched}" (${(m.confidence * 100).toFixed(0)}%)`)
          });
        }
        
        // ═══════════════════════════════════════════════════════════════════════════════
        // STRICT REJECTION: Remove any exercise NOT in the library
        // This is the FINAL gate — no non-library exercise passes through
        // ═══════════════════════════════════════════════════════════════════════════════
        const rejection = rejectNonLibraryExercises(
          workoutContent.main_workout,
          currentExerciseLibrary,
          `[WOD-REJECT][${equipment}]`
        );
        workoutContent.main_workout = rejection.processedContent;
        
        if (rejection.rejected.length > 0) {
          logStep(`Rejected/removed ${rejection.rejected.length} non-library exercises`, {
            equipment,
            rejected: rejection.rejected
          });
        }
        
        // Log unmatched exercises (only those that even the final sweep couldn't match)
        const uniqueUnmatched = [...new Set(result.unmatched)];
        // Filter out any that the final sweep DID match
        const finalSweepMatchedNames = new Set(finalSweep.forcedMatches.map(m => m.original.toLowerCase()));
        const rejectionSubstitutedNames = new Set(rejection.substituted.map(s => s.original.toLowerCase()));
        const trulyUnmatched = uniqueUnmatched.filter(name => 
          !finalSweepMatchedNames.has(name.toLowerCase()) && 
          !rejectionSubstitutedNames.has(name.toLowerCase())
        );
        
        if (trulyUnmatched.length > 0) {
          await logUnmatchedExercises(
            supabase,
            trulyUnmatched,
            'wod',
            `WOD-${prefix}-${equipment.charAt(0)}-${timestamp}`,
            workoutContent.name,
            `[WOD-MISMATCH][${equipment}]`
          );
        }
      }

      // ═══════════════════════════════════════════════════════════════════════════════
      // IMAGE GENERATION WITH RETRY LOGIC - CRITICAL FOR WOD INTEGRITY
      // Try up to 3 times with delays to ensure every WOD gets an image
      // ═══════════════════════════════════════════════════════════════════════════════
      logStep(`Generating image for ${equipment} workout`, { name: workoutContent.name, category, format });
      
      let imageUrl: string | null = null;
      const imageMaxRetries = 3;
      const imageRetryDelayMs = 3000;

      for (let imageAttempt = 1; imageAttempt <= imageMaxRetries; imageAttempt++) {
        try {
          logStep(`Image generation attempt ${imageAttempt}/${imageMaxRetries}`, { equipment, workout: workoutContent.name });
          
          const { data: imageData, error: imageError } = await supabase.functions.invoke("generate-workout-image", {
            body: { 
              name: workoutContent.name, 
              category: category, 
              format: format, 
              difficulty_stars: selectedDifficulty.stars 
            }
          });

          if (imageError) {
            logStep(`Image generation error on attempt ${imageAttempt}`, { error: imageError.message, equipment });
          } else if (imageData?.image_url) {
            imageUrl = imageData.image_url;
            logStep(`✅ Image generated successfully on attempt ${imageAttempt}`, { equipment, imageUrl: imageUrl!.substring(0, 80) });
            break; // Success, exit retry loop
          } else {
            logStep(`Image generation returned no URL on attempt ${imageAttempt}`, { equipment, imageData });
          }
        } catch (imgErr: any) {
          logStep(`Image generation exception on attempt ${imageAttempt}`, { error: imgErr.message, equipment });
        }

        // Wait before retry (except on last attempt)
        if (imageAttempt < imageMaxRetries && !imageUrl) {
          logStep(`Waiting ${imageRetryDelayMs}ms before image retry...`);
          await new Promise(resolve => setTimeout(resolve, imageRetryDelayMs));
        }
      }
      
      logStep(`${equipment} image generation complete`, { hasImage: !!imageUrl, attempts: imageMaxRetries });

      // CRITICAL: Validate image before Stripe product creation
      if (!imageUrl) {
        console.error(`[WOD-GENERATION] ❌ CRITICAL ERROR: No image URL for ${equipment} workout "${workoutContent.name}" after ${imageMaxRetries} attempts!`);
        logStep(`❌ CRITICAL: All image generation attempts failed`, { workout: workoutContent.name, equipment, attempts: imageMaxRetries });
        // Continue but log prominently - the workout will be created without image
      } else {
        logStep(`✅ Image validated for Stripe`, { imageUrl: imageUrl.substring(0, 80) });
      }

      const workoutId = `WOD-${prefix}-${equipment.charAt(0)}-${timestamp}`;
      let stripeProductId: string | null = null;
      let stripePriceId: string | null = null;

      // ═══════════════════════════════════════════════════════════════════════════════
      // POST-GENERATION DURATION CALCULATION - Parse actual section durations from HTML
      // Overrides the getDuration() estimate with the real sum from generated content
      // ═══════════════════════════════════════════════════════════════════════════════
      const calculateActualDuration = (html: string): string | null => {
        if (!html) return null;
        
        let mainMinutes = 0;
        let finisherMinutes = 0;
        let foundMainOrFinisher = false;
        let hasForTimeFinisher = false;
        
        // Get all section header lines (paragraphs with emoji headers)
        const headerRegex = /<p[^>]*>(?:🧽|🔥|💪|⚡|🧘)[^<]*?(?:<[^>]*>)*[^<]*?<\/p>/gi;
        const headers = html.match(headerRegex) || [];
        
        for (const header of headers) {
          const isMainWorkout = header.includes('💪');
          const isFinisher = header.includes('⚡');
          
          // Only sum Main Workout and Finisher sections
          if (!isMainWorkout && !isFinisher) continue;
          
          // Look for minute markers: 5', 10', (24'), (8-minute AMRAP), etc.
          let minutes = 0;
          
          const minuteMatch = header.match(/(\d+)'/);
          if (minuteMatch) {
            minutes = parseInt(minuteMatch[1]);
          }
          
          if (!minutes) {
            const parenMinuteMatch = header.match(/\((\d+)(?:'|-minute)/i);
            if (parenMinuteMatch) {
              minutes = parseInt(parenMinuteMatch[1]);
            }
          }
          
          if (!minutes) {
            // Check for range like "20-30'" 
            const rangeMatch = header.match(/(\d+)-(\d+)\s*(?:min|')/i);
            if (rangeMatch) {
              minutes = Math.round((parseInt(rangeMatch[1]) + parseInt(rangeMatch[2])) / 2);
            }
          }
          
          // Check for "For Time" without duration
          if (!minutes && /for\s*time/i.test(header) && !/\d+/.test(header)) {
            if (isFinisher) {
              hasForTimeFinisher = true;
              minutes = 12; // Internal estimate for calculation
            }
          }
          
          if (isMainWorkout) {
            mainMinutes = minutes;
            foundMainOrFinisher = true;
          } else if (isFinisher) {
            finisherMinutes = minutes;
            foundMainOrFinisher = true;
          }
        }
        
        if (!foundMainOrFinisher || mainMinutes === 0) {
          // Could not parse main workout duration
          return null;
        }
        
        // If finisher is "For Time" with no explicit duration, use "Various"
        if (hasForTimeFinisher) {
          return "Various";
        }
        
        const totalWorkMinutes = mainMinutes + finisherMinutes;
        
        if (totalWorkMinutes < 10 || totalWorkMinutes > 60) {
          // Sanity check - Main+Finisher should be 10-60 min
          return null;
        }
        
        // Round to nearest 5 for cleaner display
        const rounded = Math.round(totalWorkMinutes / 5) * 5;
        return `${rounded} min`;
      };
      
      const actualDuration = calculateActualDuration(workoutContent.main_workout || '');
      const finalDuration = actualDuration || duration;
      
      if (actualDuration) {
        logStep(`Duration override: ${duration} → ${actualDuration}`, { 
          equipment, 
          originalDuration: duration, 
          calculatedDuration: actualDuration 
        });
      } else {
        logStep(`Using estimated duration (parsing found insufficient data)`, { 
          equipment, 
          duration 
        });
      }

      // ═══════════════════════════════════════════════════════════════════════════════
      // GOLD STANDARD V3 NORMALIZATION - Critical for consistent spacing
      // Normalize main_workout HTML before insert to prevent spacing issues
      // ═══════════════════════════════════════════════════════════════════════════════
      const normalizedMainWorkout = normalizeWorkoutHtml(workoutContent.main_workout || '');
      const normalizedDescription = normalizeWorkoutHtml(workoutContent.description || '');
      const normalizedInstructions = normalizeWorkoutHtml(workoutContent.instructions || '');
      const normalizedTips = normalizeWorkoutHtml(workoutContent.tips || '');
      const validation = validateWorkoutHtml(normalizedMainWorkout);
      
      if (!validation.isValid) {
        console.error(`[WOD-GENERATION] ⚠️ HTML validation issues after normalization:`, validation.issues);
        logStep(`⚠️ HTML validation issues`, { issues: validation.issues, equipment });
        // Log but don't reject - normalization should have fixed it
      } else {
        logStep(`✅ HTML normalized and validated`, { equipment, originalLength: workoutContent.main_workout?.length, normalizedLength: normalizedMainWorkout.length });
      }

      // ═══════════════════════════════════════════════════════════════════════════════
      // SECTION COMPLETENESS GATE: Reject WODs missing required sections BEFORE insert
      // This prevents malformed content from ever reaching the database as active WOD
      // ═══════════════════════════════════════════════════════════════════════════════
      const sectionValidation = validateWodSections(normalizedMainWorkout, isRecoveryDay);
      if (!sectionValidation.isComplete) {
        const errorMsg = `${equipment} WOD rejected: missing sections [${sectionValidation.missingSections.join(", ")}]`;
        logStep(`❌ SECTION VALIDATION FAILED`, {
          equipment,
          missingSections: sectionValidation.missingSections,
          missingIcons: sectionValidation.missingIcons,
          foundIcons: sectionValidation.foundIcons,
          workoutName: workoutContent.name
        });
        throw new Error(errorMsg);
      }

      // ═══════════════════════════════════════════════════════════════════════════════
      // EXERCISE CONTENT GATE: Reject WODs where Main Workout or Finisher lack exercises
      // This prevents rest-only or empty sections from passing the icon check
      // ═══════════════════════════════════════════════════════════════════════════════
      if (!sectionValidation.hasMinimumExercises) {
        const errorMsg = `${equipment} WOD rejected: insufficient exercises [${sectionValidation.exerciseContentIssues.join("; ")}]`;
        logStep(`❌ EXERCISE CONTENT VALIDATION FAILED`, {
          equipment,
          mainWorkoutExercises: sectionValidation.mainWorkoutExerciseCount,
          finisherExercises: sectionValidation.finisherExerciseCount,
          issues: sectionValidation.exerciseContentIssues,
          workoutName: workoutContent.name
        });
        throw new Error(errorMsg);
      }
      logStep(`✅ Section & exercise validation passed`, { 
        equipment, 
        foundIcons: sectionValidation.foundIcons,
        mainWorkoutExercises: sectionValidation.mainWorkoutExerciseCount,
        finisherExercises: sectionValidation.finisherExerciseCount
      });

      // ═══════════════════════════════════════════════════════════════════════════════
      // FINAL PRE-INSERT PUBLIC NAME GUARD (library-wide, race-condition safe)
      // Re-check the database immediately before INSERT in case another row was added
      // between the initial banlist fetch and now. If a collision or internal-looking
      // code is found, use a clean customer-facing replacement name.
      // ═══════════════════════════════════════════════════════════════════════════════
      try {
        const { data: collisionRows } = await supabase
          .from("admin_workouts")
          .select("id")
          .ilike("name", workoutContent.name)
          .limit(1);
        if ((collisionRows && collisionRows.length > 0) || hasInternalNameCode(workoutContent.name)) {
          const cleaned = cleanPublicWorkoutName(workoutContent.name, category, equipment, existingNamesForCategory);
          logStep(`⚠️ Pre-insert bad/colliding name detected, applying public-safe rename`, {
            original: workoutContent.name,
            newName: cleaned.name,
            reason: cleaned.reason,
          });
          workoutContent.name = cleaned.name;
        }
      } catch (guardErr) {
        logStep("Pre-insert uniqueness guard failed (non-critical)", { error: String(guardErr) });
      }

      if (hasInternalNameCode(workoutContent.name)) {
        const cleaned = cleanPublicWorkoutName(workoutContent.name, category, equipment, existingNamesForCategory);
        workoutContent.name = cleaned.name;
      }

      if (hasInternalNameCode(workoutContent.name)) {
        throw new Error(`${equipment} WOD rejected: unsafe public name after cleanup (${workoutContent.name})`);
      }

      const stripeProductPayload = {
        name: workoutContent.name,
        description: `${category} Workout (${equipment})`,
        images: imageUrl ? [imageUrl] : [],
        metadata: {
          project: "SMARTYGYM",
          content_type: "Workout",
          content_id: workoutId,
          workout_id: workoutId,
          type: "wod",
          category,
          equipment,
          generated_for_date: effectiveDate,
        },
      };

      const stripeProductIdempotencyKey = `SMARTYGYM:wod:${effectiveDate}:${equipment}:product`;
      const stripePriceIdempotencyKey = `SMARTYGYM:wod:${effectiveDate}:${equipment}:price`;

      const stripeProduct = await stripe.products.create(stripeProductPayload, {
        idempotencyKey: stripeProductIdempotencyKey,
      });
      stripeProductId = stripeProduct.id;

      const stripePrice = await stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: 399,
        currency: "eur",
        metadata: {
          project: "SMARTYGYM",
          content_id: workoutId,
          generated_for_date: effectiveDate,
          equipment,
        },
      }, {
        idempotencyKey: stripePriceIdempotencyKey,
      });
      stripePriceId = stripePrice.id;

      logStep(`${equipment} Stripe product/price created`, {
        productId: stripeProductId,
        priceId: stripePriceId,
        productIdempotencyKey: stripeProductIdempotencyKey,
        priceIdempotencyKey: stripePriceIdempotencyKey,
      });

      const { error: insertError } = await supabase
        .from("admin_workouts")
        .insert({
          id: workoutId,
          name: workoutContent.name,
          type: isRecoveryDay ? "recovery" : "WOD",
          category: category,
          format: format,
          equipment: equipment,
          difficulty: selectedDifficulty.name,
          difficulty_stars: selectedDifficulty.stars,
          duration: finalDuration,
          description: normalizedDescription,
          main_workout: normalizedMainWorkout,
          instructions: normalizedInstructions,
          tips: normalizedTips,
          image_url: imageUrl,
          is_premium: true,
          is_standalone_purchase: true,
          price: 3.99,
          stripe_product_id: stripeProductId,
          stripe_price_id: stripePriceId,
          is_workout_of_day: true,
          is_ai_generated: true,
          is_visible: true,
          serial_number: null,
          generated_for_date: effectiveDate
        });

      if (insertError) {
        // ORPHAN GUARD: Archive Stripe product immediately if DB insert fails
        // This prevents orphaned active Stripe products from accumulating
        await archiveStripeProductSafely(stripe, stripeProductId, `db_insert_failed:${insertError.message}`);
        throw new Error(`Failed to insert ${equipment} WOD: ${insertError.message}`);
      }

      // ═══════════════════════════════════════════════════════════════════════════════
      // CRITICAL SAFETY CHECK: Verify workout was actually inserted with correct data
      // ═══════════════════════════════════════════════════════════════════════════════
      const { data: verifyWorkout, error: verifyError } = await supabase
        .from("admin_workouts")
        .select("id, name, equipment, generated_for_date, category, difficulty, difficulty_stars, stripe_product_id, stripe_price_id")
        .eq("id", workoutId)
        .single();
      
      if (verifyError || !verifyWorkout) {
        logStep(`CRITICAL: ${equipment} WOD verification failed`, { 
          workoutId, 
          verifyError: verifyError?.message,
          verifyWorkout 
        });
        await archiveStripeProductSafely(stripe, stripeProductId, "post_insert_verification_failed");
        throw new Error(`${equipment} WOD verification failed - workout not found in database after insert`);
      }

      if (verifyWorkout.stripe_product_id !== stripeProductId || verifyWorkout.stripe_price_id !== stripePriceId) {
        await archiveStripeProductSafely(stripe, stripeProductId, "stripe_database_association_mismatch");
        throw new Error(`${equipment} WOD payment association mismatch after insert`);
      }
      
      // Verify category matches expected
      if (verifyWorkout.category !== category) {
        logStep(`WARNING: Category mismatch after insert`, {
          expected: category,
          actual: verifyWorkout.category,
          workoutId
        });
      }
      
      // Verify difficulty is within expected range
      const expectedPeriodization = getPeriodizationForDay(dayIn84);
      const expectedRange = expectedPeriodization.difficultyStars;
      const actualStars = verifyWorkout.difficulty_stars;
      
      if (expectedRange && actualStars) {
        const isWithinRange = actualStars >= expectedRange[0] && actualStars <= expectedRange[1];
        if (!isWithinRange) {
          logStep(`WARNING: Difficulty stars outside expected range`, {
            expected: expectedRange,
            actual: actualStars,
            workoutId,
            dayIn84
          });
        }
      }
      
      logStep(`✅ ${equipment} WOD verified in database`, { 
        id: verifyWorkout.id, 
        name: verifyWorkout.name,
        equipment: verifyWorkout.equipment,
        generated_for_date: verifyWorkout.generated_for_date,
        category: verifyWorkout.category,
        difficulty: verifyWorkout.difficulty,
        difficulty_stars: verifyWorkout.difficulty_stars
      });

      generatedWorkouts.push({
        id: workoutId,
        name: workoutContent.name,
        equipment: equipment,
        image_url: imageUrl
      });

      // Track first workout name to prevent duplicate names on the second workout
      if (!firstWorkoutName && workoutContent.name) {
        firstWorkoutName = workoutContent.name;
        logStep(`Tracked first workout name for dedup`, { firstWorkoutName });
      }
      
      variantSucceeded = true;
      
      } catch (equipmentError: any) {
        // ═══════════════════════════════════════════════════════════════════════════════
        // PER-EQUIPMENT ERROR HANDLING: Retry once, then log failure and continue
        // ═══════════════════════════════════════════════════════════════════════════════
        logStep(`❌ ${equipment} variant attempt ${variantAttempt}/${PER_VARIANT_MAX_ATTEMPTS} failed`, { 
          error: equipmentError.message,
          equipment,
          category,
          willRetry: variantAttempt < PER_VARIANT_MAX_ATTEMPTS
        });
        
        // Only mark as failed after all per-variant attempts exhausted
        if (variantAttempt >= PER_VARIANT_MAX_ATTEMPTS) {
          failedEquipmentTypes.push(equipment);
          logStep(`❌ ALL ${PER_VARIANT_MAX_ATTEMPTS} attempts FAILED for ${equipment} workout`, { equipment, category });
          
          // Log the failure to notification_audit_log for visibility
          try {
            await supabase.from('notification_audit_log').insert({
              notification_type: 'wod_equipment_failure',
              message_type: 'wod_equipment_failure',
              subject: `${equipment} WOD Generation Failed (${PER_VARIANT_MAX_ATTEMPTS} attempts) - ${effectiveDate}`,
              content: equipmentError.message,
              sent_at: new Date().toISOString(),
              metadata: {
                effectiveDate,
                equipment,
                category,
                error: equipmentError.message,
                variantAttempts: variantAttempt,
                timestamp: new Date().toISOString()
              }
            });
            logStep(`${equipment} failure logged to audit`, { equipment });
          } catch (logErr) {
            logStep(`Failed to log ${equipment} failure`, { error: logErr });
          }
        }
        
        // Continue retry loop or move to next equipment type
        continue;
      }
      } // end while (per-variant retry loop)
    } // end for (equipment types)
    
    // ═══════════════════════════════════════════════════════════════════════════════
    // POST-LOOP NAME COLLISION GUARD: If both workouts share the same name, rename
    // ═══════════════════════════════════════════════════════════════════════════════
    if (generatedWorkouts.length === 2 && generatedWorkouts[0].name.trim().toLowerCase() === generatedWorkouts[1].name.trim().toLowerCase()) {
      // Rename BOTH workouts to include their equipment type for clarity
      for (let i = 0; i < 2; i++) {
        const w = generatedWorkouts[i];
        const cleaned = cleanPublicWorkoutName(w.name, category, w.equipment, [
          ...existingNamesForCategory,
          ...generatedWorkouts.filter((other: any) => other.id !== w.id).map((other: any) => other.name),
        ]);
        const newName = cleaned.name;
        logStep(`⚠️ Name collision detected! Renaming workout ${i + 1}`, {
          original: w.name,
          newName,
          equipment: w.equipment,
          reason: cleaned.reason,
        });
        await supabase.from("admin_workouts").update({ name: newName }).eq("id", w.id);
        w.name = newName;
        
        // Also sync Stripe product name
        const { data: stripeRecord } = await supabase.from("admin_workouts")
          .select("stripe_product_id").eq("id", w.id).single();
        if (stripeRecord?.stripe_product_id) {
          try {
            await stripe.products.update(stripeRecord.stripe_product_id, { name: newName });
            logStep(`✅ Stripe product renamed`, { productId: stripeRecord.stripe_product_id, newName });
          } catch (stripeErr) {
            logStep(`⚠️ Failed to rename Stripe product`, { error: stripeErr });
          }
        }
      }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // POST-LOOP SUMMARY: Report what was generated and what failed
    // ═══════════════════════════════════════════════════════════════════════════════
    if (failedEquipmentTypes.length > 0) {
      logStep(`⚠️ Generation completed with failures`, {
        generated: generatedWorkouts.map(w => w.equipment),
        failed: failedEquipmentTypes,
        effectiveDate
      });
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // CRITICAL FINAL VERIFICATION: Ensure all required workouts exist before updating state
    // RECOVERY: Requires ONE MIXED workout
    // Other categories: Require BOTH BODYWEIGHT and EQUIPMENT workouts
    // ═══════════════════════════════════════════════════════════════════════════════
    const { data: finalVerification, error: finalVerifyError } = await supabase
      .from("admin_workouts")
      .select("id, name, equipment, generated_for_date")
      .eq("generated_for_date", effectiveDate)
      .eq("is_workout_of_day", true);
    
    if (isRecoveryDay) {
      // RECOVERY: Check for single VARIOUS workout (not MIXED)
      const variousExists = finalVerification?.some(w => w.equipment === "VARIOUS");
      
      logStep("Final verification before state update (RECOVERY)", {
        effectiveDate,
        totalFound: finalVerification?.length || 0,
        variousExists,
        workouts: finalVerification?.map(w => ({ id: w.id, name: w.name, equipment: w.equipment }))
      });
      
      if (!variousExists) {
        await rollbackActiveWodsForDate(supabase, effectiveDate, "Recovery day final verification failed");
        await runWodStripeCleanup("recovery-final-verification-failed", false);
        logStep("CRITICAL ERROR: RECOVERY VARIOUS workout not generated", { 
          generated: generatedWorkouts.map(w => w.equipment)
        });
        
        return new Response(
          JSON.stringify({
            success: false,
            error: `Failed to generate RECOVERY WOD. Missing: VARIOUS`,
            generated: generatedWorkouts.map(w => ({ name: w.name, equipment: w.equipment }))
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
      
      logStep("✅ RECOVERY VARIOUS workout verified - proceeding with state update");
    } else {
      // Normal days: Check for BOTH BODYWEIGHT and EQUIPMENT
      const bodyweightExists = finalVerification?.some(w => w.equipment === "BODYWEIGHT");
      const equipmentExists = finalVerification?.some(w => w.equipment === "EQUIPMENT");
      
      logStep("Final verification before state update", {
        effectiveDate,
        totalFound: finalVerification?.length || 0,
        bodyweightExists,
        equipmentExists,
        workouts: finalVerification?.map(w => ({ id: w.id, name: w.name, equipment: w.equipment }))
      });
      
      if (!bodyweightExists || !equipmentExists) {
        const missing = [];
        if (!bodyweightExists) missing.push("BODYWEIGHT");
        if (!equipmentExists) missing.push("EQUIPMENT");

        await rollbackActiveWodsForDate(supabase, effectiveDate, `Final verification failed. Missing: ${missing.join(", ")}`);
        await runWodStripeCleanup("normal-final-verification-failed", false);
        
        logStep("CRITICAL ERROR: Not all workouts generated", { 
          missing, 
          generated: generatedWorkouts.map(w => w.equipment)
        });
        
        return new Response(
          JSON.stringify({
            success: false,
            error: `Failed to generate all WODs. Missing: ${missing.join(", ")}`,
            generated: generatedWorkouts.map(w => ({ name: w.name, equipment: w.equipment }))
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
      
      logStep("✅ BOTH workouts verified - proceeding with state update");
    }

    const toCyprusDateStr = (dateUtc: Date): string => {
      const m = dateUtc.getUTCMonth();
      const dst = m >= 2 && m <= 9;
      const offset = dst ? 3 : 2;
      return new Date(dateUtc.getTime() + offset * 60 * 60 * 1000).toISOString().split("T")[0];
    };

    const lastGeneratedAt = stateData?.last_generated_at ? new Date(stateData.last_generated_at) : null;
    const lastGeneratedForDate = lastGeneratedAt ? toCyprusDateStr(lastGeneratedAt) : null;
    const stateAlreadyUpdatedForDate = lastGeneratedForDate === effectiveDate;

    if (stateAlreadyUpdatedForDate) {
      logStep("State already updated for this date - skipping state increment", {
        effectiveDate,
        last_generated_at: stateData?.last_generated_at,
      });

      await runWodStripeCleanup("generate-workout-of-day-state-already-updated", false);

      return new Response(
        JSON.stringify({
          success: true,
          skipped: true,
          message: `WODs already generated and state already updated for ${effectiveDate}`,
          workouts: finalVerification?.map((w) => ({ id: w.id, name: w.name, equipment: w.equipment })) || [],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // UPDATE STATE - Track used stars, remove override if used
    // ═══════════════════════════════════════════════════════════════════════════════

    // Remove used override if any (for the effective date, not just today)
    const newManualOverrides = { ...manualOverrides };
    if (newManualOverrides[effectiveDate]) {
      delete newManualOverrides[effectiveDate];
    }
    
    // Calculate next day's info for state (84-day cycle)
    const nextDayDate = new Date(effectiveDate + 'T00:00:00Z');
    nextDayDate.setDate(nextDayDate.getDate() + 1);
    const nextDayDateStr = nextDayDate.toISOString().split('T')[0];
    const nextDayIn84 = getDayIn84Cycle(nextDayDateStr);
    
    const newState = {
      // Note: day_count, week_number, used_stars_in_week, current_category were removed
      // The 84-day cycle is now calculated purely from date in wodCycle.ts
      manual_overrides: newManualOverrides,
      last_equipment: "BOTH",
      last_difficulty: selectedDifficulty.name,
      format_usage: updatedUsage,
      equipment_bodyweight_count: (state.equipment_bodyweight_count || 0) + 1,
      equipment_with_count: (state.equipment_with_count || 0) + 1,
      difficulty_beginner_count: selectedDifficulty.name === "Beginner"
        ? (state.difficulty_beginner_count || 0) + 1
        : (state.difficulty_beginner_count || 0),
      difficulty_intermediate_count: selectedDifficulty.name === "Intermediate"
        ? (state.difficulty_intermediate_count || 0) + 1
        : (state.difficulty_intermediate_count || 0),
      difficulty_advanced_count: selectedDifficulty.name === "Advanced"
        ? (state.difficulty_advanced_count || 0) + 1
        : (state.difficulty_advanced_count || 0),
      last_generated_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      if (stateData) {
        const { error: updateError } = await supabase
          .from("workout_of_day_state")
          .update(newState)
          .eq("id", stateData.id);
        if (updateError) {
          logStep("ERROR updating state", { error: updateError.message });
        } else {
          logStep("State updated BEFORE notifications", { 
            dayIn84,
            nextDayIn84,
            category
          });
        }
      } else {
        const { error: insertError } = await supabase
          .from("workout_of_day_state")
          .insert(newState);
        if (insertError) {
          logStep("ERROR inserting state", { error: insertError.message });
        } else {
          logStep("State inserted BEFORE notifications", newState);
        }
      }
    } catch (stateUpdateError) {
      logStep("CRITICAL: State update failed", { error: stateUpdateError });
    }

    // Notifications are handled separately by send-morning-notifications at 7:00 AM Cyprus time
    logStep("WOD generation complete - notifications will be sent at 7:00 AM by send-morning-notifications");

    // ═══════════════════════════════════════════════════════════════════════════════
    // RECOVERY EMAIL: If a failed orchestrator run exists for today, send recovery notification
    // ═══════════════════════════════════════════════════════════════════════════════
    try {
      const { data: failedRun } = await supabase
        .from("wod_generation_runs")
        .select("id, cyprus_date")
        .eq("cyprus_date", effectiveDate)
        .eq("status", "failed")
        .limit(1)
        .maybeSingle();

      if (failedRun) {
        logStep("Found failed orchestrator run - sending recovery email", { runId: failedRun.id });
        
        const resendApiKey = Deno.env.get("RESEND_API_KEY");
        if (resendApiKey) {
          const { getAdminNotificationEmail } = await import("../_shared/admin-settings.ts");
          const adminEmail = await getAdminNotificationEmail(supabase);
          const { Resend } = await import("https://esm.sh/resend@2.0.0");
          const resend = new Resend(resendApiKey);
          
          const workoutNames = generatedWorkouts.map((w: any) => w.name).join(", ");
          
          await resend.emails.send({
            from: "SmartyGym Alerts <notifications@smartygym.com>",
            to: [adminEmail],
            subject: `✅ RECOVERY: WODs Generated Successfully - ${effectiveDate}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #059669; border-bottom: 2px solid #059669; padding-bottom: 10px;">
                  ✅ WOD Recovery Successful
                </h1>
                <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 16px; margin: 20px 0;">
                  <p style="margin: 0; font-weight: bold; color: #065f46;">
                    The backup system successfully generated today's workouts after the primary run failed.
                  </p>
                </div>
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                  <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Date:</td>
                    <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${effectiveDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Workouts Created:</td>
                    <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #059669; font-weight: bold;">${workoutNames}</td>
                  </tr>
                </table>
                <p style="color: #065f46;">No manual action needed. Everything is on track! 💪</p>
                <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">
                  Automated recovery notification from SmartyGym.<br>
                  Timestamp: ${new Date().toISOString()}
                </p>
              </div>
            `,
          });
          
          // Update the failed run to mark recovery
          await supabase
            .from("wod_generation_runs")
            .update({ status: "recovered", completed_at: new Date().toISOString() })
            .eq("id", failedRun.id);
          
          logStep("✅ Recovery email sent and run status updated");
        }
      }
    } catch (recoveryEmailError) {
      logStep("Recovery email check failed (non-critical)", { error: recoveryEmailError });
    }

    await runWodStripeCleanup("generate-workout-of-day-success", false);

    return new Response(
      JSON.stringify({
        success: true,
        workouts: generatedWorkouts,
        shared: {
          category: category,
          dayIn84: dayIn84,
          phase: Math.floor((dayIn84 - 1) / 28) + 1, // 1, 2, or 3
          difficulty: selectedDifficulty.name,
          difficulty_stars: selectedDifficulty.stars,
          isRecoveryDay,
          note: "84-day periodization cycle - Format and duration vary per equipment type (except STRENGTH, MOBILITY & STABILITY, and PILATES which are always REPS & SETS)"
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logStep("ERROR", { message: errorMessage });

    if (cleanupSupabase && effectiveDateForCleanup) {
      await rollbackActiveWodsForDate(cleanupSupabase, effectiveDateForCleanup, `Unhandled error: ${errorMessage}`);
    }
    await runWodStripeCleanup("generate-workout-of-day-error", false);
    
    // Log failure to notification_audit_log for visibility
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // Get today's date in Cyprus timezone
      const now = new Date();
      const cyprusFormatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Europe/Athens',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      const cyprusDateStr = cyprusFormatter.format(now);
      
      await supabase.from('notification_audit_log').insert({
        notification_type: 'wod_generation_failure',
        message_type: 'wod_generation_failure',
        subject: `WOD Generation Failed - ${cyprusDateStr}`,
        content: errorMessage,
        sent_at: new Date().toISOString(),
        metadata: {
          effectiveDate: cyprusDateStr,
          error: errorMessage,
          timestamp: new Date().toISOString()
        }
      });
      
      logStep("Failure logged to notification_audit_log");
    } catch (logError) {
      logStep("Failed to log failure to audit log", { error: logError });
    }
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
