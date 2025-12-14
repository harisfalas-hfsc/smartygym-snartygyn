import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { getEmailHeaders, getEmailFooter } from "../_shared/email-utils.ts";

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
    logStep("Starting Dual Workout of the Day generation (BODYWEIGHT + EQUIPMENT) - 7-DAY CYCLE");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");

    if (!lovableApiKey) throw new Error("LOVABLE_API_KEY is not configured");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not configured");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // SAME-DAY GENERATION GUARD: Check if today's WOD already exists
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();
    
    const { data: existingTodayWODs } = await supabase
      .from("admin_workouts")
      .select("id, name, category")
      .eq("is_workout_of_day", true)
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

    // Move ALL previous WODs to their categories
    const { data: previousWODs } = await supabase
      .from("admin_workouts")
      .select("*")
      .eq("is_workout_of_day", true);

    if (previousWODs && previousWODs.length > 0) {
      for (const previousWOD of previousWODs) {
        logStep("Moving previous WOD to category", { id: previousWOD.id, category: previousWOD.category });
        
        const { data: existingWorkouts } = await supabase
          .from("admin_workouts")
          .select("serial_number")
          .eq("category", previousWOD.category)
          .eq("is_workout_of_day", false)
          .order("serial_number", { ascending: false })
          .limit(1);

        const nextSerialNumber = (existingWorkouts?.[0]?.serial_number || 0) + 1;

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
    const override = checkManualOverride(todayStr, manualOverrides);
    
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
{
  "name": "Creative, motivating workout name (3-5 words, unique)",
  "description": "2-3 sentence HTML description with <p class='tiptap-paragraph'> tags",
  "main_workout": "Complete workout with exercises, sets, reps, rest in HTML format",
  "instructions": "Step-by-step guidance for the workout in HTML format",
  "tips": "2-3 coaching tips for optimal performance in HTML format"
}`;

      const aiResponse = await fetch("https://api.lovable.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${lovableApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: "You are an expert fitness coach. Return ONLY valid JSON, no markdown." },
            { role: "user", content: workoutPrompt }
          ],
          temperature: 0.8,
        }),
      });

      if (!aiResponse.ok) {
        throw new Error(`AI API error: ${aiResponse.status}`);
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

      // Generate image
      const imagePrompt = `Professional fitness photography: Athletic person performing ${category.toLowerCase()} ${equipment.toLowerCase() === "bodyweight" ? "bodyweight" : "with gym equipment"} workout, ${selectedDifficulty.name.toLowerCase()} difficulty, dynamic action shot, modern gym or outdoor setting, dramatic lighting, motivational atmosphere, no text`;

      const { data: imageData } = await supabase.functions.invoke("generate-image", {
        body: { prompt: imagePrompt, width: 1024, height: 576 }
      });

      const imageUrl = imageData?.imageUrl || null;
      logStep(`${equipment} image generated`, { hasImage: !!imageUrl });

      // Create Stripe product
      const workoutId = `WOD-${prefix}-${equipment.charAt(0)}-${timestamp}`;
      
      const stripeProduct = await stripe.products.create({
        name: `WOD: ${workoutContent.name}`,
        description: `Workout of the Day - ${category} (${equipment})`,
        images: imageUrl ? [imageUrl] : [],
        metadata: { workout_id: workoutId, type: "wod", category: category, equipment: equipment }
      });

      const stripePrice = await stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: 399,
        currency: "eur",
      });

      const stripeProductId = stripeProduct.id;
      const stripePriceId = stripePrice.id;
      logStep(`${equipment} Stripe product created`, { productId: stripeProductId });

      // Insert workout
      const { error: insertError } = await supabase
        .from("admin_workouts")
        .insert({
          id: workoutId,
          name: workoutContent.name,
          type: "wod",
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
          serial_number: null
        });

      if (insertError) {
        throw new Error(`Failed to insert ${equipment} WOD: ${insertError.message}`);
      }

      logStep(`${equipment} WOD inserted`, { id: workoutId, name: workoutContent.name });

      generatedWorkouts.push({
        id: workoutId,
        name: workoutContent.name,
        equipment: equipment,
        image_url: imageUrl
      });
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // UPDATE STATE - Track used stars, remove override if used
    // ═══════════════════════════════════════════════════════════════════════════════
    
    // Update used stars tracking
    const newUsedStarsInWeek = { ...usedStarsInWeek, [String(selectedDifficulty.stars)]: true };
    
    // Remove used override if any
    const newManualOverrides = { ...manualOverrides };
    if (newManualOverrides[todayStr]) {
      delete newManualOverrides[todayStr];
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
      last_difficulty_stars: selectedDifficulty.stars,
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

    // Send notification
    try {
      const { data: allUsers } = await supabase.from('profiles').select('user_id');
      const userIds = allUsers?.map(u => u.user_id) || [];
      logStep(`Sending dual WOD notification to ${userIds.length} users`);
      
      if (userIds.length > 0) {
        const resendClient = new Resend(Deno.env.get('RESEND_API_KEY'));
        const bodyweightWod = generatedWorkouts.find(w => w.equipment === "BODYWEIGHT");
        const equipmentWod = generatedWorkouts.find(w => w.equipment === "EQUIPMENT");
        
        const notificationTitle = `🏆 Today's Workouts: Choose Your Style!`;
        const notificationContent = `<p class="tiptap-paragraph"><strong>🏆 Today's Workouts of the Day</strong></p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph">Today we have <strong>TWO</strong> workout options following our ${category} day:</p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph"><strong>🏠 No Equipment:</strong> ${bodyweightWod?.name || "Bodyweight Workout"}</p>
<p class="tiptap-paragraph"><strong>🏋️ With Equipment:</strong> ${equipmentWod?.name || "Equipment Workout"}</p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph">${category} | ${format} | ${selectedDifficulty.name} (${selectedDifficulty.stars}⭐)</p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph">Choose based on your situation: at home, traveling, or at the gym!</p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph">Available for €3.99 each or included with Premium.</p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph"><a href="https://smartygym.com/workout/wod">View Today's Workouts →</a></p>`;
        
        await supabase.from('user_system_messages').insert(userIds.map(userId => ({
          user_id: userId,
          message_type: 'announcement_new_workout',
          subject: notificationTitle,
          content: notificationContent,
          is_read: false,
        })));
        
        const { data: usersData } = await supabase.auth.admin.listUsers();
        
        const { data: allProfiles } = await supabase
          .from('profiles')
          .select('user_id, notification_preferences');
        
        const profilesMap = new Map(allProfiles?.map(p => [p.user_id, p.notification_preferences]) || []);
        
        for (const authUser of usersData?.users || []) {
          if (!authUser.email || !userIds.includes(authUser.id)) continue;
          
          const prefs = (profilesMap.get(authUser.id) as Record<string, any>) || {};
          
          if (prefs.opt_out_all === true || prefs.email_wod === false) {
            logStep(`Skipping WOD email for ${authUser.email} (opted out)`);
            continue;
          }
          
          try {
            const emailResult = await resendClient.emails.send({
              from: 'SmartyGym <notifications@smartygym.com>',
              to: [authUser.email],
              subject: notificationTitle,
              headers: getEmailHeaders(authUser.email, 'wod'),
              html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
<h1 style="color: #29B6D2;">🏆 Today's Workouts</h1>
<p style="font-size: 16px;">Today we have <strong>TWO</strong> workout options for ${category} day:</p>
<div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
  <p style="margin: 10px 0;"><strong>🏠 No Equipment:</strong> ${bodyweightWod?.name || "Bodyweight Workout"}</p>
  <p style="margin: 10px 0;"><strong>🏋️ With Equipment:</strong> ${equipmentWod?.name || "Equipment Workout"}</p>
</div>
<p><strong>Format:</strong> ${format} | <strong>Difficulty:</strong> ${selectedDifficulty.name} (${selectedDifficulty.stars}⭐)</p>
<p style="color: #666;">Choose based on your situation: at home, traveling, or at the gym!</p>
<p style="margin-top: 20px;">Available for €3.99 each or included with Premium.</p>
<p style="margin-top: 20px;"><a href="https://smartygym.com/workout/wod" style="background: #29B6D2; color: white; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">View Workouts →</a></p>
${getEmailFooter(authUser.email, 'wod')}
</div>`,
            });
            
            if (emailResult.error) {
              logStep("Email API error", { email: authUser.email, error: emailResult.error });
            } else {
              await new Promise(resolve => setTimeout(resolve, 600));
            }
          } catch (e) {
            logStep("Email send error", { email: authUser.email, error: e });
          }
        }
        logStep(`✅ Sent to ${userIds.length} users`);
      }
    } catch (e) {
      logStep("Error sending WOD notification", { error: e });
    }

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
