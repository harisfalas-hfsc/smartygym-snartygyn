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
// NEW 7-DAY CATEGORY CYCLE (User's exact specification)
// ═══════════════════════════════════════════════════════════════════════════════
const CATEGORY_CYCLE_7DAY = [
  "CHALLENGE",            // Day 1
  "STRENGTH",             // Day 2 (REPS & SETS only)
  "CARDIO",               // Day 3
  "MOBILITY & STABILITY", // Day 4 (REPS & SETS only)
  "STRENGTH",             // Day 5 (REPS & SETS only)
  "METABOLIC",            // Day 6
  "CALORIE BURNING"       // Day 7
];

// ═══════════════════════════════════════════════════════════════════════════════
// DIFFICULTY PATTERN - Rotates weekly to prevent category-difficulty pairing
// ═══════════════════════════════════════════════════════════════════════════════
// Week 1: [3-4, 5-6, 1-2, 5-6, 3-4, 1-2, 5-6] -> Day 1 Intermediate, Day 2 Advanced...
// Week 2: [5-6, 3-4, 5-6, 1-2, 5-6, 3-4, 1-2] -> Shifts by 1
// Week 3: [1-2, 5-6, 3-4, 5-6, 1-2, 5-6, 3-4] -> Shifts by 1 again...
const DIFFICULTY_PATTERN_BASE = [
  { level: "Intermediate", range: [3, 4] }, // Day 1
  { level: "Advanced", range: [5, 6] },     // Day 2
  { level: "Beginner", range: [1, 2] },     // Day 3
  { level: "Advanced", range: [5, 6] },     // Day 4
  { level: "Intermediate", range: [3, 4] }, // Day 5
  { level: "Beginner", range: [1, 2] },     // Day 6
  { level: "Advanced", range: [5, 6] }      // Day 7
];

// ═══════════════════════════════════════════════════════════════════════════════
// FORMAT RULES BY CATEGORY (STRICT)
// ═══════════════════════════════════════════════════════════════════════════════
const FORMATS_BY_CATEGORY: Record<string, string[]> = {
  "STRENGTH": ["REPS & SETS"], // ONLY Reps & Sets
  "MOBILITY & STABILITY": ["REPS & SETS"], // ONLY Reps & Sets
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
// NEW ROTATION LOGIC FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

// Get day 1-7 in current 7-day cycle
function getDayInCycle(dayCount: number): number {
  return (dayCount % 7) + 1;
}

// Get week number (for difficulty rotation shift)
function getWeekNumber(dayCount: number): number {
  return Math.floor(dayCount / 7) + 1;
}

// Get category for a specific day in cycle (1-7)
function getCategoryForDay(dayInCycle: number): string {
  return CATEGORY_CYCLE_7DAY[dayInCycle - 1];
}

// Get difficulty for day with weekly rotation shift and star alternation
function getDifficultyForDay(
  dayInCycle: number, 
  weekNumber: number, 
  usedStarsInWeek: Record<string, boolean>
): { name: string; stars: number } {
  // Shift the difficulty pattern by (weekNumber - 1) positions
  const shiftAmount = (weekNumber - 1) % 7;
  const shiftedIndex = ((dayInCycle - 1) + shiftAmount) % 7;
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
  daysAhead: number = 3
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
    // Parse request body for targetDate parameter (for pre-generation)
    let targetDate: string | null = null;
    let skipNotifications = false;
    
    try {
      const body = await req.json();
      targetDate = body?.targetDate || null;
      skipNotifications = body?.skipNotifications || false;
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

    // Check if WODs already exist for the effective date
    // For pre-generated WODs, check generated_for_date column
    // For same-day generation, check created_at date range
    
    if (isPreGeneration) {
      // Check for pre-generated WODs for this future date
      const { data: existingPreGenWODs } = await supabase
        .from("admin_workouts")
        .select("id, name, category")
        .eq("generated_for_date", effectiveDate)
        .eq("is_workout_of_day", true);
      
      if (existingPreGenWODs && existingPreGenWODs.length >= 2) {
        logStep("SKIPPING: WODs already pre-generated for this date", { 
          date: effectiveDate, 
          count: existingPreGenWODs.length, 
          wods: existingPreGenWODs 
        });
        return new Response(
          JSON.stringify({ 
            success: true, 
            skipped: true, 
            message: `WODs already pre-generated for ${effectiveDate}`,
            existingWODs: existingPreGenWODs 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }
    } else {
      // SAME-DAY GENERATION GUARD: Check if today's WOD already exists
      // First check for pre-generated WODs for today
      const { data: preGenForToday } = await supabase
        .from("admin_workouts")
        .select("id, name, category")
        .eq("generated_for_date", cyprusDateStr)
        .eq("is_workout_of_day", true);
      
      if (preGenForToday && preGenForToday.length >= 2) {
        logStep("SKIPPING: WODs were pre-generated for today", { 
          count: preGenForToday.length, 
          wods: preGenForToday 
        });
        
        // Still increment day_count to maintain periodization!
        const { data: stateData } = await supabase
          .from("workout_of_day_state")
          .select("*")
          .limit(1)
          .single();
        
        if (stateData) {
          const newDayCount = (stateData.day_count || 0) + 1;
          const newDayInCycle = (newDayCount % 7) + 1;
          const newWeekNumber = newDayInCycle === 1 ? (stateData.week_number || 1) + 1 : stateData.week_number;
          
          await supabase
            .from("workout_of_day_state")
            .update({ 
              day_count: newDayCount,
              week_number: newWeekNumber,
              used_stars_in_week: newDayInCycle === 1 ? {} : stateData.used_stars_in_week,
              last_generated_at: new Date().toISOString(),
              current_category: CATEGORY_CYCLE_7DAY[newDayInCycle - 1]
            })
            .eq("id", stateData.id);
          
          logStep("Day count incremented despite skip (pre-gen)", { 
            oldDayCount: stateData.day_count, 
            newDayCount 
          });
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            skipped: true, 
            message: "WODs were pre-generated for today, day_count incremented",
            existingWODs: preGenForToday 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }
      
      // Then check for same-day created WODs (using Cyprus date boundaries)
      const cyprusDateObj = new Date(cyprusDateStr + 'T00:00:00Z');
      const todayStart = cyprusDateObj.toISOString();
      const todayEnd = new Date(cyprusDateObj.getTime() + 24 * 60 * 60 * 1000).toISOString();
      
      const { data: existingTodayWODs } = await supabase
        .from("admin_workouts")
        .select("id, name, category")
        .eq("is_workout_of_day", true)
        .is("generated_for_date", null) // Only check non-pre-generated WODs
        .gte("created_at", todayStart)
        .lt("created_at", todayEnd);
      
      if (existingTodayWODs && existingTodayWODs.length >= 2) {
        logStep("SKIPPING: Today's WODs already exist", { count: existingTodayWODs.length, wods: existingTodayWODs });
        return new Response(
          JSON.stringify({ 
            success: true, 
            skipped: true, 
            message: "Today's WODs already generated",
            existingWODs: existingTodayWODs 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }
    }

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
    // CALCULATE TODAY'S WOD PARAMETERS (7-DAY CYCLE)
    // ═══════════════════════════════════════════════════════════════════════════════
    
    const dayInCycle = getDayInCycle(state.day_count);
    const weekNumber = state.week_number || getWeekNumber(state.day_count);
    let usedStarsInWeek = state.used_stars_in_week || {};
    const manualOverrides = state.manual_overrides || {};
    
    // Check if we're starting a new week (day 1) - reset used stars
    if (dayInCycle === 1) {
      usedStarsInWeek = {};
      logStep("New 7-day cycle started, resetting used stars");
    }
    
    logStep("7-Day Cycle Parameters", { 
      dayCount: state.day_count, 
      dayInCycle, 
      weekNumber,
      usedStarsInWeek 
    });

    // Check for manual override for today
    const override = checkManualOverride(effectiveDate, manualOverrides);
    
    let category: string;
    let selectedDifficulty: { name: string; stars: number };
    let format: string;
    let updatedUsage: Record<string, string[]>;
    
    if (override) {
      logStep("USING MANUAL OVERRIDE", override);
      category = override.category || getCategoryForDay(dayInCycle);
      selectedDifficulty = override.difficulty 
        ? { 
            name: override.difficulty <= 2 ? "Beginner" : override.difficulty <= 4 ? "Intermediate" : "Advanced",
            stars: override.difficulty 
          }
        : getDifficultyForDay(dayInCycle, weekNumber, usedStarsInWeek);
      format = override.format || getFormatForCategory(category, state.format_usage || {}).format;
      updatedUsage = state.format_usage || {};
    } else {
      // Normal calculation
      category = getCategoryForDay(dayInCycle);
      selectedDifficulty = getDifficultyForDay(dayInCycle, weekNumber, usedStarsInWeek);
      const formatResult = getFormatForCategory(category, state.format_usage || {});
      format = formatResult.format;
      updatedUsage = formatResult.updatedUsage;
    }
    
    logStep("Today's WOD specs", { 
      category, 
      difficulty: selectedDifficulty, 
      format,
      isOverride: !!override
    });

    // Duration based on format and difficulty
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
    
    const duration = getDuration(format, selectedDifficulty.stars);

    // Category prefixes for IDs
    const categoryPrefixes: Record<string, string> = {
      "STRENGTH": "S",
      "CALORIE BURNING": "CB",
      "METABOLIC": "M",
      "CARDIO": "CA",
      "MOBILITY & STABILITY": "MS",
      "CHALLENGE": "CH"
    };
    const prefix = categoryPrefixes[category] || "W";
    const timestamp = Date.now();

    // Generate TWO workouts - one BODYWEIGHT, one EQUIPMENT
    const equipmentTypes = ["BODYWEIGHT", "EQUIPMENT"];
    const generatedWorkouts: any[] = [];
    let firstWorkoutName = "";

    for (const equipment of equipmentTypes) {
      logStep(`Generating ${equipment} workout`);

      const bannedNameInstruction = firstWorkoutName 
        ? `\n\nCRITICAL - AVOID DUPLICATE NAME: The bodyweight workout for today is named "${firstWorkoutName}". You MUST create a COMPLETELY DIFFERENT name. DO NOT use "${firstWorkoutName}" or any variation of it.`
        : "";

      // Generate workout content using Lovable AI
      const workoutPrompt = `You are Haris Falas, a Sports Scientist with 20+ years of coaching experience (CSCS Certified), creating a premium Workout of the Day for SmartyGym members worldwide.${bannedNameInstruction}

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
CATEGORY-SPECIFIC TRAINING PHILOSOPHY (CRITICAL - MUST FOLLOW EXACTLY):
═══════════════════════════════════════════════════════════════════════════════

${category === "STRENGTH" ? `
╔══════════════════════════════════════════════════════════════════════════════╗
║ CATEGORY: STRENGTH - BUILD MUSCLE, INCREASE FORCE, IMPROVE FUNCTIONAL STRENGTH ║
╚══════════════════════════════════════════════════════════════════════════════╝

GOAL: Build muscle, increase force production, improve functional strength.
INTENSITY: Controlled tempo, structured sets, progressive overload.
FORMAT: MUST BE REPS & SETS - Classic strength format with defined rest (60-120 seconds).

${equipment === "EQUIPMENT" ? `
✅ EQUIPMENT WORKOUTS - ALLOWED EXERCISES (PICK FROM THESE):
• Goblet squats, Kettlebell deadlifts, Romanian deadlifts, Front squats
• Bench press variations, Dumbbell row, Bent-over row
• Push press, Landmine press, Split squats, Hip hinges, Weighted carries` : `
✅ BODYWEIGHT ONLY - ALLOWED EXERCISES (PICK FROM THESE):
• Push-up variations (diamond, archer, decline, incline)
• Slow tempo squats (3-4 second eccentric)
• Pistol squat regressions (assisted, box pistols)
• Glute bridges and hip thrusts (single-leg progressions)
• Plank variations (RKC plank, side plank with rotation)
• Pull-ups, Dips, Isometrics, Slow tempo lunges, Handstand progressions`}

❌ FORBIDDEN: Burpees, Mountain climbers, Jumping jacks, Sprints, any cardio exercise.
FOCUS: Muscle hypertrophy, maximal strength, progressive overload with adequate rest.` : ""}

${category === "CARDIO" ? `
╔══════════════════════════════════════════════════════════════════════════════╗
║ CATEGORY: CARDIO - IMPROVE HEART RATE CAPACITY, AEROBIC & ANAEROBIC          ║
╚══════════════════════════════════════════════════════════════════════════════╝

GOAL: Improve heart rate capacity, aerobic and anaerobic conditioning.
FORMAT: ${format} (NOT Reps & Sets)
INTENSITY: Fast pace, minimal load, sustained heart rate elevation.

✅ ALLOWED EXERCISES: Jogging, Jump rope, High knees, Butt kicks, Jumping jacks, Burpees, Mountain climbers, Box jumps, Skaters, Bear crawls.

❌ FORBIDDEN: Heavy lifting, slow strength exercises, Reps & Sets format.` : ""}

${category === "MOBILITY & STABILITY" ? `
╔══════════════════════════════════════════════════════════════════════════════╗
║ CATEGORY: MOBILITY & STABILITY - FLEXIBILITY, CONTROL, INJURY PREVENTION     ║
╚══════════════════════════════════════════════════════════════════════════════╝

GOAL: Improve flexibility, joint mobility, core stability, injury prevention.
FORMAT: MUST BE REPS & SETS - Controlled movements with focus on form and range.
INTENSITY: Slow, controlled, deliberate movement patterns.

✅ ALLOWED EXERCISES: World's greatest stretch, Cat-cow, Thread the needle, Hip circles, Shoulder CARs, Deep squats, Yoga flows, Core stability holds, Balance work.

❌ FORBIDDEN: High-intensity intervals, explosive movements, speed work.` : ""}

${category === "METABOLIC" ? `
╔══════════════════════════════════════════════════════════════════════════════╗
║ CATEGORY: METABOLIC - BURN CALORIES, BOOST METABOLISM, HIIT CONDITIONING     ║
╚══════════════════════════════════════════════════════════════════════════════╝

GOAL: Maximize calorie burn, boost metabolism, improve work capacity.
FORMAT: ${format} (High-intensity intervals)
INTENSITY: High effort, minimal rest, full-body movements.

✅ ALLOWED EXERCISES: Burpees, Thrusters, Kettlebell swings, Box jumps, Battle ropes, Sled work, Rowing sprints, Assault bike intervals.

❌ FORBIDDEN: Reps & Sets format, long rest periods, isolation exercises.` : ""}

${category === "CALORIE BURNING" ? `
╔══════════════════════════════════════════════════════════════════════════════╗
║ CATEGORY: CALORIE BURNING - MAXIMUM CALORIE EXPENDITURE, FAT LOSS FOCUS      ║
╚══════════════════════════════════════════════════════════════════════════════╝

GOAL: Maximize calorie expenditure through sustained high-output work.
FORMAT: ${format}
INTENSITY: Sustained effort, compound movements, elevated heart rate throughout.

✅ ALLOWED EXERCISES: Mountain climbers, Burpees, Jump squats, High knees, Jumping lunges, Speed skaters, Tuck jumps, Plank jacks.

❌ FORBIDDEN: Reps & Sets format, long rest periods, isolated strength work.` : ""}

${category === "CHALLENGE" ? `
╔══════════════════════════════════════════════════════════════════════════════╗
║ CATEGORY: CHALLENGE - TEST YOUR LIMITS, MENTAL TOUGHNESS, FULL-BODY EFFORT   ║
╚══════════════════════════════════════════════════════════════════════════════╝

GOAL: Push physical and mental limits with demanding full-body challenges.
FORMAT: ${format}
INTENSITY: Maximum effort, minimal rest, benchmark-style workout.

✅ ALLOWED: Any exercise that challenges the athlete - compound movements, high-rep work, time-based challenges, chipper-style workouts.

FOCUS: Mental fortitude, work capacity, competitive spirit.` : ""}

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

6. THREE SECTIONS REQUIRED in main_workout: Warm Up, Main Workout, Cool Down

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
  "name": "Creative, motivating workout name (3-5 words, unique)",
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
        name: `WOD: ${workoutContent.name}`,
        description: `Workout of the Day - ${category} (${equipment})`,
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
          format: format
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
