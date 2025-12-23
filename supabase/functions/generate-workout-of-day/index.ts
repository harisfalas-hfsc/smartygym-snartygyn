import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { getEmailHeaders, getEmailFooter } from "../_shared/email-utils.ts";
import { MESSAGE_TYPES } from "../_shared/notification-types.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ═══════════════════════════════════════════════════════════════════════════════
// NEW 8-DAY CATEGORY CYCLE (with PILATES as Day 8)
// ═══════════════════════════════════════════════════════════════════════════════
const CATEGORY_CYCLE_8DAY = [
  "CHALLENGE",            // Day 1
  "STRENGTH",             // Day 2 (REPS & SETS only)
  "CARDIO",               // Day 3
  "MOBILITY & STABILITY", // Day 4 (REPS & SETS only)
  "STRENGTH",             // Day 5 (REPS & SETS only)
  "METABOLIC",            // Day 6
  "CALORIE BURNING",      // Day 7
  "PILATES"               // Day 8 (REPS & SETS only - Reformer or Mat)
];

// ═══════════════════════════════════════════════════════════════════════════════
// DIFFICULTY PATTERN - Rotates weekly to prevent category-difficulty pairing
// ═══════════════════════════════════════════════════════════════════════════════
// Week 1: [3-4, 5-6, 1-2, 5-6, 3-4, 1-2, 5-6, 3-4] -> Day 1 Intermediate, Day 2 Advanced...
// Week 2: [5-6, 3-4, 5-6, 1-2, 5-6, 3-4, 1-2, 5-6] -> Shifts by 1
// Week 3: Continues shifting...
const DIFFICULTY_PATTERN_BASE = [
  { level: "Intermediate", range: [3, 4] }, // Day 1
  { level: "Advanced", range: [5, 6] },     // Day 2
  { level: "Beginner", range: [1, 2] },     // Day 3
  { level: "Advanced", range: [5, 6] },     // Day 4
  { level: "Intermediate", range: [3, 4] }, // Day 5
  { level: "Beginner", range: [1, 2] },     // Day 6
  { level: "Advanced", range: [5, 6] },     // Day 7
  { level: "Intermediate", range: [3, 4] }  // Day 8
];

// ═══════════════════════════════════════════════════════════════════════════════
// FORMAT RULES BY CATEGORY (STRICT)
// ═══════════════════════════════════════════════════════════════════════════════
const FORMATS_BY_CATEGORY: Record<string, string[]> = {
  "STRENGTH": ["REPS & SETS"], // ONLY Reps & Sets
  "MOBILITY & STABILITY": ["REPS & SETS"], // ONLY Reps & Sets
  "PILATES": ["REPS & SETS"], // ONLY Reps & Sets - controlled Pilates movements
  "CARDIO": ["CIRCUIT", "EMOM", "FOR TIME", "AMRAP", "TABATA"], // NO Reps & Sets
  "METABOLIC": ["CIRCUIT", "AMRAP", "EMOM", "FOR TIME", "TABATA"], // NO Reps & Sets
  "CALORIE BURNING": ["CIRCUIT", "TABATA", "AMRAP", "FOR TIME", "EMOM"], // NO Reps & Sets
  "CHALLENGE": ["CIRCUIT", "TABATA", "AMRAP", "EMOM", "FOR TIME", "MIX"] // Any except Reps & Sets
};

// All difficulty levels available (6 levels)
const DIFFICULTY_LEVELS = [
  { name: "Beginner", stars: 1 },
  { name: "Beginner", stars: 2 },
  { name: "Intermediate", stars: 3 },
  { name: "Intermediate", stars: 4 },
  { name: "Advanced", stars: 5 },
  { name: "Advanced", stars: 6 }
];

function logStep(step: string, details?: any) {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GENERATE-WOD] ${step}${detailsStr}`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// DATE-BASED ROTATION LOGIC (8-DAY CYCLE)
// CRITICAL FIX: Categories now calculated from calendar date, not a counter
// This prevents desync when cron jobs are missed or manual generation occurs
// ═══════════════════════════════════════════════════════════════════════════════

// Reference date: December 14, 2025 = Day 1 (CHALLENGE)
// This anchors the 8-day cycle to the calendar
const CYCLE_START_DATE = '2025-12-14';

// Get day 1-8 in cycle based on calendar date (NOT a counter)
function getDayInCycleFromDate(dateStr: string): number {
  const startDate = new Date(CYCLE_START_DATE + 'T00:00:00Z');
  const targetDate = new Date(dateStr + 'T00:00:00Z');
  const daysDiff = Math.floor((targetDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
  // Handle negative days (dates before reference) properly with modulo
  const normalizedDays = ((daysDiff % 8) + 8) % 8;
  return normalizedDays + 1; // 1-8
}

// Get week number based on calendar date (for difficulty rotation shift)
function getWeekNumberFromDate(dateStr: string): number {
  const startDate = new Date(CYCLE_START_DATE + 'T00:00:00Z');
  const targetDate = new Date(dateStr + 'T00:00:00Z');
  const daysDiff = Math.floor((targetDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
  return Math.floor(daysDiff / 8) + 1;
}

// Legacy functions kept for backward compatibility with preview calculations
function getDayInCycle(dayCount: number): number {
  return (dayCount % 8) + 1;
}

function getWeekNumber(dayCount: number): number {
  return Math.floor(dayCount / 8) + 1;
}

// Get category for a specific day in cycle (1-8)
function getCategoryForDay(dayInCycle: number): string {
  return CATEGORY_CYCLE_8DAY[dayInCycle - 1];
}

// Get difficulty for day with weekly rotation shift and star alternation
function getDifficultyForDay(
  dayInCycle: number, 
  weekNumber: number, 
  usedStarsInWeek: Record<string, boolean>
): { name: string; stars: number } {
  // Shift the difficulty pattern by (weekNumber - 1) positions
  const shiftAmount = (weekNumber - 1) % 8;
  const shiftedIndex = ((dayInCycle - 1) + shiftAmount) % 8;
  const pattern = DIFFICULTY_PATTERN_BASE[shiftedIndex];
  
  const [star1, star2] = pattern.range;
  
  // Alternate stars: if star1 used this week, use star2
  // This prevents duplicate stars in the 7-day period
  let selectedStars: number;
  if (usedStarsInWeek[String(star1)]) {
    selectedStars = star2;
  } else if (usedStarsInWeek[String(star2)]) {
    selectedStars = star1;
  } else {
    // Neither used, pick star1 first
    selectedStars = star1;
  }
  
  logStep("Difficulty calculation", {
    dayInCycle,
    weekNumber,
    shiftAmount,
    shiftedIndex,
    pattern: pattern.level,
    range: pattern.range,
    usedStars: Object.keys(usedStarsInWeek),
    selectedStars
  });
  
  return { name: pattern.level, stars: selectedStars };
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

// Calculate future WOD schedule for admin preview
export function calculateFutureWODSchedule(
  currentDayCount: number,
  currentWeekNumber: number,
  usedStarsInWeek: Record<string, boolean>,
  formatUsage: Record<string, string[]>,
  daysAhead: number = 8
): Array<{ date: string; dayInCycle: number; category: string; difficulty: { name: string; stars: number }; formats: string[] }> {
  const schedule = [];
  
  for (let i = 1; i <= daysAhead; i++) {
    const futureDayCount = currentDayCount + i;
    const futureDayInCycle = getDayInCycle(futureDayCount);
    const futureWeekNumber = getWeekNumber(futureDayCount);
    
    // Reset used stars if entering new week
    const futureUsedStars = futureDayInCycle === 1 ? {} : usedStarsInWeek;
    
    const category = getCategoryForDay(futureDayInCycle);
    const difficulty = getDifficultyForDay(futureDayInCycle, futureWeekNumber, futureUsedStars);
    const formats = FORMATS_BY_CATEGORY[category] || ["CIRCUIT"];
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + i);
    
    schedule.push({
      date: futureDate.toISOString().split('T')[0],
      dayInCycle: futureDayInCycle,
      category,
      difficulty,
      formats
    });
  }
  
  return schedule;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

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
    // The cron runs at 22:00 UTC which is midnight in Cyprus - we need the NEW day's date
    // ═══════════════════════════════════════════════════════════════════════════════
    const now = new Date();
    
    // Calculate Cyprus time (UTC+2 in winter, UTC+3 in summer)
    // Cyprus is in EET/EEST timezone
    const cyprusOffset = 2; // Base offset (winter). In summer it's +3
    const cyprusTime = new Date(now.getTime() + cyprusOffset * 60 * 60 * 1000);
    
    // Check if daylight saving time applies (rough check for EET/EEST)
    const month = cyprusTime.getUTCMonth();
    const isDST = month >= 2 && month <= 9; // March-October roughly
    const actualOffset = isDST ? 3 : 2;
    
    const cyprusDate = new Date(now.getTime() + actualOffset * 60 * 60 * 1000);
    const cyprusDateStr = cyprusDate.toISOString().split('T')[0];
    
    logStep("Timezone calculation", {
      utcNow: now.toISOString(),
      cyprusOffset: actualOffset,
      cyprusDateStr,
      isDST
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

    // Check what already exists for this date (idempotent + supports retryMissing)
    // CRITICAL: Fetch FULL workout details so we can match parameters when retrying
    const { data: existingWODsForDate, error: existingWODsError } = await supabase
      .from("admin_workouts")
      .select("id, name, equipment, generated_for_date, category, difficulty, difficulty_stars, format")
      .eq("generated_for_date", effectiveDate)
      .eq("is_workout_of_day", true);

    if (existingWODsError) {
      logStep("ERROR checking existing WODs", { error: existingWODsError.message, effectiveDate });
    }

    const bodyweightAlreadyExists = existingWODsForDate?.some((w) => w.equipment === "BODYWEIGHT") ?? false;
    const equipmentAlreadyExists = existingWODsForDate?.some((w) => w.equipment === "EQUIPMENT") ?? false;

    const allEquipmentTypes = ["BODYWEIGHT", "EQUIPMENT"] as const;
    const equipmentTypesToGenerate = allEquipmentTypes.filter((e) =>
      e === "BODYWEIGHT" ? !bodyweightAlreadyExists : !equipmentAlreadyExists
    );

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

    // Move ONLY previous WODs to their categories (exclude today's WODs)
    // This prevents race condition where today's WODs get moved before new generation
    const { data: previousWODs } = await supabase
      .from("admin_workouts")
      .select("*")
      .eq("is_workout_of_day", true)
      .neq("generated_for_date", effectiveDate); // Exclude WODs for today/target date

    if (previousWODs && previousWODs.length > 0) {
      for (const previousWOD of previousWODs) {
        logStep("Moving previous WOD to category", { id: previousWOD.id, category: previousWOD.category, generated_for_date: previousWOD.generated_for_date });
        
        // Use persistent counter from system_settings
        const { data: counterSettings, error: counterError } = await supabase
          .from("system_settings")
          .select("setting_value")
          .eq("setting_key", "serial_number_counters")
          .single();
        
        let nextSerialNumber = 1;
        
        if (!counterError && counterSettings) {
          const counters = counterSettings.setting_value as { workouts?: Record<string, number>, programs?: Record<string, number> } || { workouts: {} };
          nextSerialNumber = counters.workouts?.[previousWOD.category] || 1;
          
          // Increment counter for next use
          counters.workouts = counters.workouts || {};
          counters.workouts[previousWOD.category] = nextSerialNumber + 1;
          
          await supabase
            .from("system_settings")
            .update({ setting_value: counters, updated_at: new Date().toISOString() })
            .eq("setting_key", "serial_number_counters");
          
          logStep("Counter incremented for category", { 
            category: previousWOD.category, 
            nextSerial: nextSerialNumber + 1 
          });
        } else {
          // Fallback to old logic if counter not found
          const { data: existingWorkouts } = await supabase
            .from("admin_workouts")
            .select("serial_number")
            .eq("category", previousWOD.category)
            .eq("is_workout_of_day", false)
            .order("serial_number", { ascending: false })
            .limit(1);

          nextSerialNumber = (existingWorkouts?.[0]?.serial_number || 0) + 1;
        }

        await supabase
          .from("admin_workouts")
          .update({ 
            is_workout_of_day: false,
            serial_number: nextSerialNumber
          })
          .eq("id", previousWOD.id);

        logStep("Previous WOD moved", { id: previousWOD.id, serialNumber: nextSerialNumber });
      }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // CALCULATE TODAY'S WOD PARAMETERS (8-DAY CYCLE - DATE-BASED)
    // CRITICAL: Now uses calendar date instead of counter to prevent desync
    // ═══════════════════════════════════════════════════════════════════════════════
    
    // Use DATE-BASED calculation - this always gives correct category for the calendar day
    const dayInCycle = getDayInCycleFromDate(effectiveDate);
    const weekNumber = getWeekNumberFromDate(effectiveDate);
    let usedStarsInWeek = state.used_stars_in_week || {};
    const manualOverrides = state.manual_overrides || {};
    
    // Check if we're starting a new 8-day cycle (day 1) - reset used stars
    if (dayInCycle === 1) {
      usedStarsInWeek = {};
      logStep("New 8-day cycle started (Day 1), resetting used stars");
    }
    
    logStep("8-Day Cycle Parameters (DATE-BASED)", { 
      effectiveDate,
      dayInCycle,
      weekNumber,
      expectedCategory: getCategoryForDay(dayInCycle),
      usedStarsInWeek,
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
      category = override.category || getCategoryForDay(dayInCycle);
      selectedDifficulty = override.difficulty 
        ? { 
            name: override.difficulty <= 2 ? "Beginner" : override.difficulty <= 4 ? "Intermediate" : "Advanced",
            stars: override.difficulty 
          }
        : getDifficultyForDay(dayInCycle, weekNumber, usedStarsInWeek);
    } else {
      // Normal calculation
      category = getCategoryForDay(dayInCycle);
      selectedDifficulty = getDifficultyForDay(dayInCycle, weekNumber, usedStarsInWeek);
    }
    
    logStep("Today's WOD specs (shared)", { 
      category, 
      difficulty: selectedDifficulty,
      isOverride: !!override,
      hasForcedParameters: !!forcedParameters
    });

    // Duration calculation function (called per-workout now)
    const getDuration = (fmt: string, stars: number): string => {
      const baseDurations: Record<string, number[]> = {
        "REPS & SETS": [45, 50, 60],
        "CIRCUIT": [20, 30, 45],
        "TABATA": [15, 20, 30],
        "AMRAP": [15, 25, 45],
        "EMOM": [15, 20, 30],
        "FOR TIME": [0, 0, 0],
        "MIX": [30, 40, 60]
      };
      
      if (fmt === "FOR TIME") return "Various";
      
      const [minDuration, midDuration, maxDuration] = baseDurations[fmt] || [20, 30, 45];
      
      if (stars <= 2) return `${minDuration} min`;
      if (stars <= 4) return `${midDuration} min`;
      return `${maxDuration} min`;
    };
    
    // ═══════════════════════════════════════════════════════════════════════════════
    // FORMAT SELECTION: STRENGTH, MOBILITY & STABILITY, and PILATES = always REPS & SETS
    // Other categories can have different formats per equipment type
    // ═══════════════════════════════════════════════════════════════════════════════
    const getFormatForWorkout = (cat: string, equipType: string): { format: string; duration: string } => {
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
      "PILATES": "PIL"
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
    
    // Calculate tomorrow's expected specs
    const tomorrowDayCount = state.day_count + 1;
    const tomorrowDayInCycle = getDayInCycle(tomorrowDayCount);
    const tomorrowWeekNumber = tomorrowDayInCycle === 1 ? weekNumber + 1 : weekNumber;
    const tomorrowCategory = getCategoryForDay(tomorrowDayInCycle);
    const tomorrowUsedStars = tomorrowDayInCycle === 1 ? {} : { ...usedStarsInWeek, [String(selectedDifficulty.stars)]: true };
    const tomorrowDifficulty = getDifficultyForDay(tomorrowDayInCycle, tomorrowWeekNumber, tomorrowUsedStars);
    
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

    // Generate workouts - only what is missing for this date
    const equipmentTypes = equipmentTypesToGenerate;
    const generatedWorkouts: any[] = [];
    let firstWorkoutName = "";

    for (const equipment of equipmentTypes) {
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
      // NAMING VARIETY INSTRUCTIONS - Avoid repetitive and mismatched names
      // ═══════════════════════════════════════════════════════════════════════════════
      const namingInstructions = `
═══════════════════════════════════════════════════════════════════════════════
NAMING RULES (CRITICAL - MUST FOLLOW):
═══════════════════════════════════════════════════════════════════════════════

1. AVOID OVERUSED WORDS - DO NOT START with these words (they're overused):
   ❌ Inferno, Blaze, Fire, Burn, Fury, Storm, Thunder, Power, Beast, Warrior, Elite, Ultimate, Extreme

2. MATCH THE NAME TO THE CATEGORY:
   - STRENGTH: Use words like "Iron", "Foundation", "Forge", "Builder", "Anchor", "Pillar"
   - CARDIO: Use words like "Pulse", "Rush", "Flow", "Motion", "Surge", "Stride"
   - METABOLIC: Use words like "Engine", "Drive", "Catalyst", "Ignite", "Reactor"
   - CALORIE BURNING: Use words like "Torch", "Melt", "Shred", "Scorch", "Heat"
   - MOBILITY & STABILITY: Use words like "Balance", "Flow", "Restore", "Align", "Ground"
   - CHALLENGE: Use words like "Gauntlet", "Test", "Summit", "Peak", "Crucible", "Forge", "Trial", "Proving Ground", "Benchmark", "The [Number]", "Death By", "Grind", "Endure"

3. BE CREATIVE: Each workout should have a unique, memorable name that reflects its purpose
4. KEEP IT SHORT: 2-4 words maximum
`;

      // Generate workout content using Lovable AI
      const workoutPrompt = `You are Haris Falas, a Sports Scientist with 20+ years of coaching experience (CSCS Certified), creating a premium Workout of the Day for SmartyGym members worldwide.${bannedNameInstruction}
${namingInstructions}

Generate a complete workout with these specifications:
- Category: ${category}
- Equipment: ${equipment}
- Difficulty: ${selectedDifficulty.name} (${selectedDifficulty.stars} stars out of 6)
- Format: ${format}

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
WORKOUT STRUCTURE WITH FINISHER (MANDATORY):
═══════════════════════════════════════════════════════════════════════════════

Every workout MUST include four sequential parts inside the workout content:

1. WARM-UP
   Standard preparation phase

2. MAIN WORKOUT
   The core training block that defines the workout's FORMAT label

3. FINISHER
   A complementary workout block that completes the session

4. COOL DOWN
   Recovery and stretching phase

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

${category === "STRENGTH" ? `
STRENGTH CATEGORY - ALLOWED EXERCISES:
${equipment === "EQUIPMENT" ? `
• Goblet squats, Kettlebell deadlifts, Romanian deadlifts, Front squats
• Bench press variations, Dumbbell row, Bent-over row
• Push press, Landmine press, Split squats, Hip hinges, Weighted carries` : `
• Push-up variations (diamond, archer, decline, incline)
• Slow tempo squats (3-4 second eccentric)
• Pistol squat regressions (assisted, box pistols)
• Glute bridges and hip thrusts (single-leg progressions)
• Plank variations, Pull-ups, Dips, Isometrics, Handstand progressions`}
❌ FORBIDDEN: Burpees, Mountain climbers, Jumping jacks, Sprints, any cardio exercise.
` : ""}

${category === "CARDIO" ? `
CARDIO CATEGORY - ALLOWED EXERCISES:
${equipment === "EQUIPMENT" ? `
• Treadmill running/sprints/incline walks
• Assault bike / Air bike intervals
• Spin bike / Stationary bike intervals
• Elliptical, Ski erg sprints, Rowing machine sprints/intervals
• Stair climber / Stepper, Jump rope
• Wall balls, Med ball slams, Kettlebell swings, Battle ropes, Sled pushes/pulls` : `
• Jogging in place, High knees, Butt kicks, Jumping jacks
• Burpees, Mountain climbers, Box jumps
• Skaters, Bear crawls, Lateral shuffles, Star jumps
• Tuck jumps, Broad jumps, Squat jumps, Frog jumps`}
❌ FORBIDDEN: Heavy lifting, slow strength exercises, Reps & Sets format.
` : ""}

${category === "MOBILITY & STABILITY" ? `
MOBILITY & STABILITY CATEGORY - ALLOWED EXERCISES:
• World's greatest stretch, Cat-cow, Thread the needle, Hip circles
• Shoulder CARs, Deep squats, Yoga flows, Core stability holds, Balance work
❌ FORBIDDEN: High-intensity intervals, explosive movements, speed work.
` : ""}

${category === "METABOLIC" ? `
METABOLIC CATEGORY - ALLOWED EXERCISES:
• Burpees, Thrusters, Kettlebell swings, Box jumps
• Battle ropes, Sled work, Rowing sprints, Assault bike intervals
❌ FORBIDDEN: Reps & Sets format, long rest periods, isolation exercises.
` : ""}

${category === "CALORIE BURNING" ? `
CALORIE BURNING CATEGORY - ALLOWED EXERCISES:
${equipment === "EQUIPMENT" ? `
• Treadmill sprints/incline walks, Assault bike calories, Rowing machine intervals
• Ski erg sprints, Spin bike sprints, Elliptical HIIT, Stair climber intervals
• Wall balls, Med ball slams, Kettlebell swings/snatches, Dumbbell thrusters
• Weight vest exercises, Battle ropes, Sled pushes/pulls, Box jumps, Farmer carries` : `
• Mountain climbers, Burpees, Jump squats, High knees
• Jumping lunges, Speed skaters, Tuck jumps, Plank jacks
• Bear crawls, Lateral shuffles, Squat jumps, Star jumps`}
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

STRUCTURE (MANDATORY - 4 SECTIONS):
1. WARM-UP: Standard preparation (2-5 min movement + activation circuit)
2. MAIN WORKOUT: The core challenge that defines the workout's FORMAT label
3. FINISHER: Additional work tied to main workout performance OR separate challenge
4. COOL DOWN: Recovery + optional final challenge element (like a run for time)

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
REFORMER PILATES (EQUIPMENT VERSION):
Your workout must use Pilates reformer-style movements with gym equipment alternatives.

ALLOWED EQUIPMENT & EXERCISES:
• Resistance bands/cables: Footwork variations, Leg presses, Arm circles, Rowing preps
• Stability ball: Spine articulation, Bridging, Hamstring curls, Pike rolls
• Foam roller: Rolling like a ball adaptations, Spine stretches, Mermaid stretches
• Light dumbbells (2-5kg): Arm series, Chest expansion, Hug a tree
• Gliders/towels: Lunges, Pikes, Mountain climbers (slow & controlled)
• TRX/Suspension: Teaser variations, Plank to pike, Pull-through
• Box/bench: Long box series, Short box series, Swan on box

REFORMER-INSPIRED SEQUENCES:
• Footwork Series: Parallel, V-position, Wide V (using cables/resistance bands)
• Long Stretch Series: Plank, Up stretch, Elephant (using gliders)
• Short Spine & Overhead: Spinal articulation with stability ball
• Rowing Series: Rowing front, Rowing back (with light resistance)
• Arm Work: Biceps, Triceps, Circles (with bands or light weights)
• Side Splits/Standing: Balance work with resistance

KEY PRINCIPLES:
• Smooth, flowing transitions between exercises
• Constant engagement of the powerhouse (core)
• Controlled eccentric and concentric phases (3-4 second tempo)
• Breath coordination: Exhale on exertion
` : `
MAT PILATES (BODYWEIGHT VERSION):
Classical mat Pilates with optional props (fit ball, ring, mini bands allowed).

ALLOWED EXERCISES & PROPS:
• Classical Mat Sequence: The Hundred, Roll Up, Roll Over, Single Leg Circles
• Pilates Ring exercises: Inner thigh squeezes, Chest presses, Arm circles
• Fit Ball (Swiss Ball): Spine articulation, Bridging, Teaser variations
• Mini Bands: Clamshells, Leg circles, Side-lying series
• Resistance Loop: Monster walks, Glute activation

CLASSICAL PILATES ORDER (Can adapt but respect the flow):
1. The Hundred (warm-up)
2. Roll Up / Roll Down
3. Single Leg Circles
4. Rolling Like a Ball
5. Single Leg Stretch
6. Double Leg Stretch
7. Spine Stretch Forward
8. Open Leg Rocker
9. Corkscrew
10. Saw
11. Swan
12. Single Leg Kicks
13. Double Leg Kicks
14. Neck Pull
15. Shoulder Bridge
16. Side Kicks Series
17. Teaser
18. Swimming
19. Leg Pull Front/Back
20. Seal / Crab

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

YOUR FORMAT TODAY: ${format}
You MUST structure the workout using the ${format} format rules defined above.

═══════════════════════════════════════════════════════════════════════════════
RESPONSE FORMAT (JSON ONLY - NO MARKDOWN):
═══════════════════════════════════════════════════════════════════════════════

CRITICAL HTML FORMATTING RULES (FOLLOW EXACTLY - THIS IS NON-NEGOTIABLE):

1. SECTION TITLES: Bold + Underlined with duration in title
   Format: <p class="tiptap-paragraph"><strong><u>Warm Up 15'</u></strong></p>
   
2. EXERCISE LISTS: MUST use bullet lists, NOT numbered lists or <br> separators
   Format:
   <ul class="tiptap-bullet-list">
   <li class="tiptap-list-item"><p class="tiptap-paragraph">Run 5 minutes</p></li>
   <li class="tiptap-list-item"><p class="tiptap-paragraph">Jumping Rope 5 Minutes</p></li>
   </ul>

3. CIRCUIT/ROUND HEADERS: Bullet point with bold only (no underline)
   Format: <li class="tiptap-list-item"><p class="tiptap-paragraph"><strong>8 Rounds of:</strong></p></li>

4. CIRCUIT EXERCISE SETS: Plain paragraph with dash separators after round header
   Format: <p class="tiptap-paragraph">12 Goblet Squats - 12 Upright Row - 24 Jump Squats</p>

5. SECTION SEPARATORS: Empty paragraph between sections
   Format: <p class="tiptap-paragraph"></p>

6. FOUR SECTIONS REQUIRED in main_workout: Warm Up, Main Workout, Finisher, Cool Down

GOLD STANDARD TEMPLATE (FOLLOW THIS EXACTLY):
<p class="tiptap-paragraph"><strong><u>Warm Up 15'</u></strong></p>
<ul class="tiptap-bullet-list">
<li class="tiptap-list-item"><p class="tiptap-paragraph">Run 5 minutes</p></li>
<li class="tiptap-list-item"><p class="tiptap-paragraph">Jumping Rope 5 Minutes</p></li>
<li class="tiptap-list-item"><p class="tiptap-paragraph">Hip Circles - Arm Circles 5 minutes</p></li>
</ul>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph"><strong><u>Main Workout</u></strong></p>
<p class="tiptap-paragraph"></p>
<ul class="tiptap-bullet-list">
<li class="tiptap-list-item"><p class="tiptap-paragraph"><strong>8 Rounds of:</strong></p></li>
</ul>
<p class="tiptap-paragraph">12 Goblet Squats - 12 Upright Row - 24 Jump Squats</p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph"><strong><u>Finisher</u></strong></p>
<p class="tiptap-paragraph"></p>
<ul class="tiptap-bullet-list">
<li class="tiptap-list-item"><p class="tiptap-paragraph"><strong>Tabata:</strong></p></li>
</ul>
<p class="tiptap-paragraph">Burpees - 20 sec work / 10 sec rest x 8 rounds</p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph"><strong><u>Cool Down:</u></strong></p>
<ul class="tiptap-bullet-list">
<li class="tiptap-list-item"><p class="tiptap-paragraph">Foam Rolling & Stretching</p></li>
</ul>

TIPS FORMAT: Separate paragraphs OR single paragraph with <br> line breaks
<p class="tiptap-paragraph">Pace yourself early. Five minutes is longer than it sounds.</p>
<p class="tiptap-paragraph">Prioritize perfect form over speed.</p>

INSTRUCTIONS FORMAT: Plain paragraphs with clear guidance
<p class="tiptap-paragraph">Complete each exercise for the prescribed time. Rest as needed between exercises.</p>

{
  "name": "Creative, motivating workout name (2-4 words, unique)",
  "description": "2-3 sentence HTML description with <p class='tiptap-paragraph'> tags",
  "main_workout": "MUST follow the gold standard template above with Warm Up, Main Workout, Cool Down sections using bullet lists",
  "instructions": "Step-by-step guidance in <p class='tiptap-paragraph'> tags",
  "tips": "2-4 coaching tips as separate paragraphs or with <br> line breaks"
}`;

      // Retry mechanism: 3 attempts with 2-second delays
      let aiResponse: Response | null = null;
      let lastError: Error | null = null;
      const maxRetries = 3;
      const retryDelayMs = 2000;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          logStep(`AI API call attempt ${attempt}/${maxRetries}`, { equipment });
          
          aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${lovableApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                { role: "system", content: "You are an expert fitness coach. Return ONLY valid JSON, no markdown." },
                { role: "user", content: workoutPrompt }
              ],
            }),
          });

          if (aiResponse.ok) {
            logStep(`AI API call succeeded on attempt ${attempt}`, { equipment });
            break;
          } else {
            const errorText = await aiResponse.text();
            lastError = new Error(`AI API error: ${aiResponse.status} - ${errorText}`);
            logStep(`AI API call failed on attempt ${attempt}`, { 
              status: aiResponse.status, 
              error: errorText,
              willRetry: attempt < maxRetries 
            });
          }
        } catch (fetchError: any) {
          lastError = fetchError;
          logStep(`AI API network error on attempt ${attempt}`, { 
            error: fetchError.message,
            willRetry: attempt < maxRetries 
          });
        }

        // Wait before retry (except on last attempt)
        if (attempt < maxRetries) {
          logStep(`Waiting ${retryDelayMs}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, retryDelayMs));
        }
      }

      if (!aiResponse || !aiResponse.ok) {
        logStep("AI API failed after all retries", { 
          maxRetries, 
          lastError: lastError?.message,
          equipment,
          category 
        });
        throw lastError || new Error("AI API failed after all retries");
      }

      const aiData = await aiResponse.json();
      let workoutContent;
      
      try {
        let content = aiData.choices[0].message.content;
        content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        workoutContent = JSON.parse(content);
      } catch (parseError) {
        logStep("Error parsing AI response", { error: parseError, raw: aiData.choices[0].message.content });
        throw new Error("Failed to parse workout content");
      }

      if (equipment === "BODYWEIGHT") {
        firstWorkoutName = workoutContent.name;
      }

      logStep(`${equipment} workout generated`, { name: workoutContent.name });

      // Generate image using the correct generate-workout-image function
      logStep(`Generating image for ${equipment} workout`, { name: workoutContent.name, category, format });
      
      let imageUrl: string | null = null;
      try {
        const { data: imageData, error: imageError } = await supabase.functions.invoke("generate-workout-image", {
          body: { 
            name: workoutContent.name, 
            category: category, 
            format: format, 
            difficulty_stars: selectedDifficulty.stars 
          }
        });

        if (imageError) {
          logStep(`Image generation error for ${equipment}`, { error: imageError.message });
        } else {
          imageUrl = imageData?.image_url || null;
        }
      } catch (imgErr: any) {
        logStep(`Image generation failed for ${equipment}`, { error: imgErr.message });
      }
      
      logStep(`${equipment} image generated`, { hasImage: !!imageUrl, imageUrl });

      // CRITICAL: Validate image before Stripe product creation
      if (!imageUrl) {
        console.error(`[WOD-GENERATION] ⚠️ CRITICAL WARNING: No image URL for ${equipment} workout "${workoutContent.name}". Stripe product will be created WITHOUT an image!`);
        logStep(`⚠️ WARNING: Creating Stripe product WITHOUT image`, { workout: workoutContent.name, equipment });
      } else {
        logStep(`✅ Image validated for Stripe`, { imageUrl: imageUrl.substring(0, 80) });
      }

      // Create Stripe product
      const workoutId = `WOD-${prefix}-${equipment.charAt(0)}-${timestamp}`;
      
      logStep(`Creating Stripe product`, { 
        name: workoutContent.name, 
        hasImage: !!imageUrl, 
        imageUrl: imageUrl ? imageUrl.substring(0, 80) : 'NONE' 
      });
      
      const stripeProduct = await stripe.products.create({
        name: workoutContent.name,
        description: `${category} Workout (${equipment})`,
        images: imageUrl ? [imageUrl] : [],
        metadata: { workout_id: workoutId, type: "wod", category: category, equipment: equipment }
      });

      // ═══════════════════════════════════════════════════════════════════════════════
      // STRIPE PRODUCT IMAGE VERIFICATION (Critical for WOD integrity)
      // ═══════════════════════════════════════════════════════════════════════════════
      if (!stripeProduct.images || stripeProduct.images.length === 0) {
        console.error(`[WOD-GENERATION] ❌ CRITICAL: Stripe product ${stripeProduct.id} created WITHOUT images!`);
        console.error(`[WOD-GENERATION] Workout: ${workoutContent.name}, Equipment: ${equipment}`);
        console.error(`[WOD-GENERATION] Original imageUrl was: ${imageUrl || 'NULL/EMPTY'}`);
        logStep(`❌ STRIPE PRODUCT MISSING IMAGE`, { 
          productId: stripeProduct.id, 
          workoutName: workoutContent.name,
          equipment,
          imageUrlProvided: !!imageUrl 
        });
      } else {
        logStep(`✅ Stripe product image verified`, { 
          productId: stripeProduct.id, 
          imageCount: stripeProduct.images.length,
          imageUrl: stripeProduct.images[0]?.substring(0, 80)
        });
      }

      const stripePrice = await stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: 399,
        currency: "eur",
      });

      const stripeProductId = stripeProduct.id;
      const stripePriceId = stripePrice.id;
      logStep(`${equipment} Stripe product created`, { 
        productId: stripeProductId, 
        priceId: stripePriceId,
        hasImage: stripeProduct.images && stripeProduct.images.length > 0,
        imageVerified: 'YES'
      });

      // Insert workout with generated_for_date for pre-generation tracking
      const { error: insertError } = await supabase
        .from("admin_workouts")
        .insert({
          id: workoutId,
          name: workoutContent.name,
          type: format,
          category: category,
          format: format,
          equipment: equipment,
          difficulty: selectedDifficulty.name,
          difficulty_stars: selectedDifficulty.stars,
          duration: duration,
          description: workoutContent.description,
          main_workout: workoutContent.main_workout,
          instructions: workoutContent.instructions,
          tips: workoutContent.tips,
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
        throw new Error(`Failed to insert ${equipment} WOD: ${insertError.message}`);
      }

      // ═══════════════════════════════════════════════════════════════════════════════
      // CRITICAL SAFETY CHECK: Verify workout was actually inserted into database
      // ═══════════════════════════════════════════════════════════════════════════════
      const { data: verifyWorkout, error: verifyError } = await supabase
        .from("admin_workouts")
        .select("id, name, equipment, generated_for_date")
        .eq("id", workoutId)
        .single();
      
      if (verifyError || !verifyWorkout) {
        logStep(`CRITICAL: ${equipment} WOD verification failed`, { 
          workoutId, 
          verifyError: verifyError?.message,
          verifyWorkout 
        });
        throw new Error(`${equipment} WOD verification failed - workout not found in database after insert`);
      }
      
      logStep(`✅ ${equipment} WOD verified in database`, { 
        id: verifyWorkout.id, 
        name: verifyWorkout.name,
        equipment: verifyWorkout.equipment,
        generated_for_date: verifyWorkout.generated_for_date
      });

      generatedWorkouts.push({
        id: workoutId,
        name: workoutContent.name,
        equipment: equipment,
        image_url: imageUrl
      });
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // CRITICAL FINAL VERIFICATION: Ensure BOTH workouts exist before updating state
    // This prevents state corruption if one workout fails
    // ═══════════════════════════════════════════════════════════════════════════════
    const { data: finalVerification, error: finalVerifyError } = await supabase
      .from("admin_workouts")
      .select("id, name, equipment, generated_for_date")
      .eq("generated_for_date", effectiveDate)
      .eq("is_workout_of_day", true);
    
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

    // Update used stars tracking
    const newUsedStarsInWeek = { ...usedStarsInWeek, [String(selectedDifficulty.stars)]: true };
    
    // Remove used override if any (for the effective date, not just today)
    const newManualOverrides = { ...manualOverrides };
    if (newManualOverrides[effectiveDate]) {
      delete newManualOverrides[effectiveDate];
    }
    
    // Calculate new week number (increment if completing day 7)
    const newWeekNumber = dayInCycle === 7 ? weekNumber + 1 : weekNumber;
    
    const newState = {
      day_count: state.day_count + 1,
      week_number: newWeekNumber,
      used_stars_in_week: dayInCycle === 7 ? {} : newUsedStarsInWeek,
      manual_overrides: newManualOverrides,
      current_category: getCategoryForDay(getDayInCycle(state.day_count + 1)),
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
            newDayCount: newState.day_count,
            nextDayInCycle: getDayInCycle(newState.day_count),
            nextCategory: newState.current_category,
            weekNumber: newState.week_number
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

    return new Response(
      JSON.stringify({
        success: true,
        workouts: generatedWorkouts,
        shared: {
          category: category,
          dayInCycle: dayInCycle,
          weekNumber: weekNumber,
          difficulty: selectedDifficulty.name,
          difficulty_stars: selectedDifficulty.stars,
          note: "Format and duration now vary per equipment type (except STRENGTH and MOBILITY & STABILITY which are always REPS & SETS)"
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
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
