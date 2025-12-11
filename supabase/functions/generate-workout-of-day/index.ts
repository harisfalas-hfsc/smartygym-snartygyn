import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { getEmailHeaders, getEmailFooter } from "../_shared/email-utils.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Category rotation cycle (6 days) - Each category appears once per week
const CATEGORY_CYCLE = [
  "STRENGTH",
  "CALORIE BURNING", 
  "METABOLIC",
  "CARDIO",
  "MOBILITY & STABILITY",
  "CHALLENGE"
];

// Training philosophy: Format rules per category (STRICT)
const FORMATS_BY_CATEGORY: Record<string, string[]> = {
  "STRENGTH": ["REPS & SETS"], // Strength MUST be Reps & Sets only
  "CALORIE BURNING": ["CIRCUIT", "TABATA", "AMRAP"], // High intensity intervals
  "METABOLIC": ["CIRCUIT", "AMRAP", "EMOM", "FOR TIME"], // Metabolic conditioning
  "CARDIO": ["CIRCUIT", "EMOM", "FOR TIME"], // Sustained cardio work
  "MOBILITY & STABILITY": ["MIX", "CIRCUIT"], // Flexibility and control
  "CHALLENGE": ["CIRCUIT", "TABATA", "AMRAP", "EMOM", "FOR TIME", "REPS & SETS", "MIX"] // Any format
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

// Duration options based on format and difficulty
const DURATION_OPTIONS = ["30 min", "45 min", "60 min"];

function logStep(step: string, details?: any) {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GENERATE-WOD] ${step}${detailsStr}`);
}

// Helper to get next difficulty with rotation logic (prevents consecutive same-difficulty)
function getNextDifficulty(
  lastDifficultyStars: number | null, 
  usedDifficulties: number[]
): { name: string; stars: number } {
  // Get available difficulties (not used in current cycle)
  let availableDifficulties = DIFFICULTY_LEVELS.filter(d => !usedDifficulties.includes(d.stars));
  
  // If all used, reset cycle
  if (availableDifficulties.length === 0) {
    availableDifficulties = [...DIFFICULTY_LEVELS];
  }
  
  // RULE 1: Prevent consecutive same-difficulty (if last was X stars, next cannot be X stars)
  if (lastDifficultyStars !== null) {
    const differentOptions = availableDifficulties.filter(d => d.stars !== lastDifficultyStars);
    if (differentOptions.length > 0) {
      availableDifficulties = differentOptions;
    }
  }
  
  // RULE 2: Prevent consecutive high-intensity (5-6 stars) - recovery after advanced
  if (lastDifficultyStars && lastDifficultyStars >= 5) {
    // Last was advanced (5-6), next MUST be 1-4 for recovery
    const recoveryOptions = availableDifficulties.filter(d => d.stars <= 4);
    if (recoveryOptions.length > 0) {
      availableDifficulties = recoveryOptions;
    }
  }
  
  // RULE 3: Prevent consecutive low-intensity (1-2 stars) - progression after beginner
  if (lastDifficultyStars && lastDifficultyStars <= 2) {
    // Last was beginner (1-2), prefer 3+ for progression
    const progressionOptions = availableDifficulties.filter(d => d.stars >= 3);
    if (progressionOptions.length > 0) {
      availableDifficulties = progressionOptions;
    }
  }
  
  // Random selection from available options
  const selected = availableDifficulties[Math.floor(Math.random() * availableDifficulties.length)];
  
  let reason = "Normal rotation";
  if (lastDifficultyStars && lastDifficultyStars >= 5) {
    reason = "Recovery after advanced (5-6 stars)";
  } else if (lastDifficultyStars && lastDifficultyStars <= 2) {
    reason = "Progression after beginner (1-2 stars)";
  } else if (lastDifficultyStars !== null) {
    reason = "Variation from previous difficulty";
  }
  
  logStep("Difficulty rotation applied", { 
    lastStars: lastDifficultyStars, 
    usedInCycle: usedDifficulties,
    selectedStars: selected.stars,
    reason: reason
  });
  
  return selected;
}

// Helper to get next format for a category with tracking
function getNextFormat(category: string, formatUsage: Record<string, string[]>): { format: string; updatedUsage: Record<string, string[]> } {
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
    // All formats used, reset and pick first one
    selectedFormat = validFormats[Math.floor(Math.random() * validFormats.length)];
    newUsedFormats = [selectedFormat];
  }
  
  return {
    format: selectedFormat,
    updatedUsage: {
      ...formatUsage,
      [category]: newUsedFormats
    }
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting Dual Workout of the Day generation (BODYWEIGHT + EQUIPMENT)");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");

    if (!lovableApiKey) throw new Error("LOVABLE_API_KEY is not configured");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not configured");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

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
      equipment_bodyweight_count: 0,
      equipment_with_count: 0,
      difficulty_beginner_count: 0,
      difficulty_intermediate_count: 0,
      difficulty_advanced_count: 0,
      format_usage: {}
    };

    logStep("Current state", state);

    // Move ALL previous WODs to their categories (there should be 2)
    const { data: previousWODs } = await supabase
      .from("admin_workouts")
      .select("*")
      .eq("is_workout_of_day", true);

    if (previousWODs && previousWODs.length > 0) {
      for (const previousWOD of previousWODs) {
        logStep("Moving previous WOD to category", { id: previousWOD.id, category: previousWOD.category });
        
        const categoryPrefix = previousWOD.category?.charAt(0).toUpperCase() || "W";
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

    // Determine today's category (same for both workouts)
    const categoryIndex = state.day_count % CATEGORY_CYCLE.length;
    const category = CATEGORY_CYCLE[categoryIndex];
    logStep("Today's category (shared)", { category, dayCount: state.day_count });

    // Determine difficulty with rotation logic (prevents consecutive high-intensity)
    const usedDifficultiesInCycle = state.used_difficulties_in_cycle || [];
    const lastDifficultyStars = state.last_difficulty_stars || null;
    const selectedDifficulty = getNextDifficulty(lastDifficultyStars, usedDifficultiesInCycle);
    
    // Update used difficulties tracking (reset if all 6 used)
    let newUsedDifficulties = [...usedDifficultiesInCycle, selectedDifficulty.stars];
    if (newUsedDifficulties.length >= 6) {
      newUsedDifficulties = [selectedDifficulty.stars]; // Reset cycle
    }
    logStep("Selected difficulty (shared)", { 
      ...selectedDifficulty, 
      dayCount: state.day_count,
      usedInCycle: newUsedDifficulties
    });

    // Determine format with tracking (same for both workouts)
    const formatUsage = state.format_usage || {};
    const { format, updatedUsage } = getNextFormat(category, formatUsage);
    logStep("Selected format (shared)", { format, category, usedFormats: formatUsage[category] });

    // Duration based on format and difficulty - EXPANDED RANGE (15, 20, 30, 45, 60 min, Various)
    const getDuration = (format: string, stars: number): string => {
      // Base duration ranges by format [min, mid, max]
      const baseDurations: Record<string, number[]> = {
        "REPS & SETS": [45, 50, 60],   // Strength needs more time
        "CIRCUIT": [20, 30, 45],       // Flexible circuit length
        "TABATA": [15, 20, 30],        // Quick intense sessions
        "AMRAP": [15, 25, 45],         // Flexible based on complexity
        "EMOM": [15, 20, 30],          // Every minute format
        "FOR TIME": [0, 0, 0],         // Special: "Various" for race-against-clock
        "MIX": [30, 40, 60]            // Combo formats need more time
      };
      
      // FOR TIME format uses "Various" (complete as fast as possible)
      if (format === "FOR TIME") {
        return "Various";
      }
      
      const [minDuration, midDuration, maxDuration] = baseDurations[format] || [20, 30, 45];
      
      // Adjust by difficulty: lower difficulty = shorter duration, higher = longer
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
    let firstWorkoutName = ""; // Track first workout's name to prevent duplicates

    for (const equipment of equipmentTypes) {
      logStep(`Generating ${equipment} workout`);

      // Build the banned name instruction for the second workout
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
║ CATEGORY 1: STRENGTH - BUILD MUSCLE, INCREASE FORCE, IMPROVE FUNCTIONAL STRENGTH ║
╚══════════════════════════════════════════════════════════════════════════════╝

GOAL: Build muscle, increase force production, improve functional strength.
INTENSITY: Controlled tempo, structured sets, progressive overload.
FORMAT: Reps & Sets, supersets, EMOM strength, pyramids, upper-lower split, push-pull-legs, compound lifts.

${equipment === "EQUIPMENT" ? `
✅ EQUIPMENT WORKOUTS - ALLOWED EXERCISES (PICK FROM THESE):
• Goblet squats
• Kettlebell deadlifts
• Romanian deadlifts
• Front squats
• Bench press variations
• Dumbbell row
• Bent-over row
• Push press
• Landmine press
• Split squats
• Hip hinges
• Weighted carries` : `
✅ BODYWEIGHT ONLY - ALLOWED EXERCISES (PICK FROM THESE):
• Push-up variations (diamond, archer, decline, incline)
• Slow tempo squats (3-4 second eccentric)
• Pistol squat regressions (assisted, box pistols)
• Glute bridges and hip thrusts (single-leg progressions)
• Plank variations (RKC plank, side plank with rotation)
• Pull-ups (wide grip, close grip, chin-ups)
• Dips (parallel bar, bench dips, Korean dips)
• Isometrics (wall sits, dead hangs, L-sits)
• Slow tempo lunges (walking, reverse, Bulgarian split squat)
• Handstand progressions (wall holds, pike push-ups)`}

❌ ABSOLUTE RULES - FORBIDDEN EXERCISES (NEVER INCLUDE):
• High knees
• Skipping
• Burpees
• Mountain climbers
• Jumping jacks
• Sprints
• Any cardio-based exercise
• EMOM, Tabata, AMRAP, or time-based formats
• Running, jumping, or locomotion exercises
• Minimal rest or circuit-style training

FOCUS: Muscle hypertrophy, maximal strength, progressive overload, proper form with adequate rest (60-120 seconds).
STRENGTH WORKOUTS MUST STAY STRENGTH.` : ""}

${category === "CARDIO" ? `
╔══════════════════════════════════════════════════════════════════════════════╗
║ CATEGORY 2: CARDIO - IMPROVE HEART RATE CAPACITY, AEROBIC & ANAEROBIC       ║
╚══════════════════════════════════════════════════════════════════════════════╝

GOAL: Improve heart rate capacity, aerobic and anaerobic conditioning.
FORMAT: Circuits, AMRAP, EMOM, Tabata, For Time.
INTENSITY: Mostly bodyweight but can include cardio machines or light tools. Minimal load, fast pace.

✅ ALLOWED EXERCISES (PICK FROM THESE):
• Jogging / Running
• Jump rope
• Treadmill runs
• Rowing machine
• Assault bike
• High knees
• Skipping
• Jumping jacks
• Burpees
• Mountain climbers
• Butt kicks
• Lateral shuffles
• Step-ups (fast tempo)
• Shadow boxing
• Bear crawls / Crab walks
• Star jumps / Broad jumps

❌ DO NOT INCLUDE (FORBIDDEN):
• Heavy lifting
• Slow tempo strength movements
• Long rest periods between sets
• Low-rep, high-weight training
• Static holds or isometric exercises

FOCUS: Cardiovascular endurance, stamina building, sustained heart rate elevation, aerobic and anaerobic conditioning.` : ""}

${category === "METABOLIC" ? `
╔══════════════════════════════════════════════════════════════════════════════╗
║ CATEGORY 3: METABOLIC - HIGH-INTENSITY FULL-BODY CONDITIONING               ║
╚══════════════════════════════════════════════════════════════════════════════╝

GOAL: High-intensity, full-body conditioning using strength tools and bodyweight.
Similar to cardio but MORE POWER, MORE MUSCULAR DEMAND, MORE TOOLS.
FORMAT: Circuits, AMRAP, EMOM, Tabata, For Time.

${equipment === "EQUIPMENT" ? `
✅ EQUIPMENT WORKOUTS - ALLOWED EXERCISES:
• Kettlebell swings
• Battle ropes
• Sandbags
• Medicine ball slams
• Box jumps
• Kettlebell clean and press
• Sled push (if available)
• Thrusters (kettlebell or dumbbell)
• Rowing machine intervals
• Dumbbell complexes` : `
✅ BODYWEIGHT ONLY - ALLOWED EXERCISES:
• Burpees (all variations)
• Squat thrusts
• Fast lunges (jump lunges, walking lunges)
• Skater jumps
• Mountain climbers
• Jump squats
• Push-up complexes
• Plank jacks
• Bodyweight thrusters`}

❌ DON'T INCLUDE (FORBIDDEN):
• Slow strength tempo
• Isometrics
• Static planks (unless part of active recovery)
• Pure cardio only (running laps without resistance)
• Pure strength only (heavy singles, doubles, or triples)
• Long rest periods (over 60 seconds)
• Isolated single-joint exercises

CRITICAL: Keep equipment CONSISTENT throughout (all bodyweight OR all equipment - never mixed).
FOCUS: Metabolic stress, work capacity, combination of strength and cardio, post-workout calorie burn (EPOC).` : ""}

${category === "CALORIE BURNING" ? `
╔══════════════════════════════════════════════════════════════════════════════╗
║ CATEGORY 4: CALORIE BURNING - HIGH-EFFORT, SIMPLE, NON-TECHNICAL            ║
╚══════════════════════════════════════════════════════════════════════════════╝

GOAL: High-effort, simple, non-technical exercises that maintain high output.
FORMAT: Circuit, AMRAP, Tabata, For Time.
INTENSITY: Flexible but ALWAYS keep the heart rate HIGH.

${equipment === "EQUIPMENT" ? `
✅ EQUIPMENT WORKOUTS - ALLOWED EXERCISES:
• Kettlebell swings
• Battle ropes (simple patterns)
• Rower
• Bike (assault bike, spin)
• Slam ball
• Light dumbbells for full-body complexes` : `
✅ BODYWEIGHT ONLY - ALLOWED EXERCISES:
• Squat jumps
• Burpees
• High knees
• Lunges (all variations)
• Mountain climbers
• Step-ups
• Frog hops
• Jumping jacks
• Tuck jumps`}

❌ DON'T INCLUDE (FORBIDDEN):
• Technical Olympic lifts
• Slow strength sets
• Heavy loading
• Complicated sequences
• Long rest periods (over 45 seconds)
• Mobility, stretching, or flexibility exercises

FOCUS: Maximize calorie expenditure, elevate heart rate, minimal rest, fat burning, conditioning.` : ""}

${category === "MOBILITY & STABILITY" ? `
╔══════════════════════════════════════════════════════════════════════════════╗
║ CATEGORY 5: MOBILITY & STABILITY - JOINT MOBILITY, CORE STABILITY, FLEXIBILITY ║
╚══════════════════════════════════════════════════════════════════════════════╝

GOAL: Increase joint mobility, core stability, flexibility, controlled movement.
FORMAT: Circuits, Reps & Sets, Flow, or Time-based mobility.
INTENSITY: Low to moderate - focus on QUALITY over speed.

✅ ALLOWED EXERCISES (PICK FROM THESE):
• Cat-cow
• Thoracic rotations
• World's greatest stretch
• 90/90 hip rotation
• Dead bug
• Bird dog
• Glute bridges (controlled)
• Pallof press (if equipment)
• Side planks (holds, not dynamic)
• Copenhagen holds
• Ankle mobility drills
• Shoulder CARs (Controlled Articular Rotations)
• Hip CARs
• Breathing protocols
• Pigeon pose
• Hip flexor stretches
• Thread the needle
• Foam rolling (if equipment)
${equipment === "EQUIPMENT" ? `• Resistance band stretches
• Stability ball exercises
• Yoga blocks for supported stretches
• Light dumbbells for mobility work` : `• Yoga-inspired sequences
• Active stretching
• Controlled holds (30-60 seconds)`}

❌ NEVER INCLUDE (FORBIDDEN):
• Burpees
• Jumps (any type)
• Running
• Skipping
• Anything explosive
• Anything heavy
• High-intensity exercises that elevate heart rate significantly
• Time pressure, racing, or competitive elements

FOCUS: Joint health, flexibility, injury prevention, controlled breathing, active recovery, movement quality over speed.` : ""}

${category === "CHALLENGE" ? `
╔══════════════════════════════════════════════════════════════════════════════╗
║ CATEGORY 6: CHALLENGE - TOUGH SESSION TESTING ENDURANCE, STRENGTH, MENTAL TOUGHNESS ║
╚══════════════════════════════════════════════════════════════════════════════╝

GOAL: Tough session that tests endurance, strength, or mental toughness.
FORMAT: EVERY FORMAT ALLOWED - be creative!
INTENSITY: VERY HIGH - this is meant to push limits.

${equipment === "EQUIPMENT" ? `
✅ EQUIPMENT CHALLENGE EXAMPLES:
• Kettlebell complex challenge (5 exercises, 5 reps each, 10 rounds)
• Dumbbell chipper (long list of exercises, high reps)
• Rowing machine distance challenge (5000m for time)
• Weighted vest bodyweight challenge
• Barbell complex (clean + front squat + push press + back squat + lunges)
• Heavy carry challenges (farmer's walks, suitcase carries)` : `
✅ BODYWEIGHT CHALLENGE EXAMPLES:
• 100 burpees challenge (for time)
• 10-minute AMRAP (max rounds of 10 push-ups, 15 squats, 20 sit-ups)
• Descending ladders (10-9-8-7-6-5-4-3-2-1 of 2 exercises)
• Bodyweight chippers (100 squats, 80 lunges, 60 sit-ups, 40 push-ups, 20 burpees)
• EMOM increasing reps (minute 1: 1 burpee, minute 2: 2 burpees, continue until failure)
• Advanced calisthenics (muscle-up attempts, pistol squat ladder, handstand holds)`}

CHALLENGE FORMAT IDEAS (USE THESE):
• "Death by..." - Minute 1: 1 rep, Minute 2: 2 reps, continue until failure
• "100 Rep Challenge" - Complete 100 reps of X exercise as fast as possible
• "Descending Ladder" - 10-9-8-7-6-5-4-3-2-1 of two exercises alternating
• "EMOM + Tabata Combo" - 10-minute EMOM followed by 8 rounds Tabata
• "For Time with Cap" - Complete workout under time cap (e.g., 20 minutes)
• "Pyramid" - 1-2-3-4-5-4-3-2-1 rep scheme
• "Chipper" - Long list of exercises, complete all reps before moving on

❌ AVOID (FORBIDDEN):
• Mobility exercises
• Slow technical lifts
• Low-intensity movements
• Basic beginner-level exercises without challenge element
• Long rest periods (over 30 seconds unless strategically placed)
• Easy modifications or scaled options

FOCUS: Mental toughness, personal records, benchmark performance, competition against the clock, pushing limits.` : ""}

═══════════════════════════════════════════════════════════════════════════════
EXERCISE VARIETY RULE (CRITICAL - READ CAREFULLY):
═══════════════════════════════════════════════════════════════════════════════
The exercise banks listed above are EXAMPLES and GUIDELINES, NOT strict limitations.

✅ YOU MAY:
• Use SIMILAR exercises that serve the same purpose as listed exercises
• Create VARIATIONS of listed exercises (e.g., close-grip push-ups, sumo deadlifts, archer push-ups)
• Find alternatives that match the category's GOAL and INTENSITY
• Introduce variety to keep workouts fresh, engaging, and unpredictable
• Adapt exercises for the specified equipment type (bodyweight variations or equipment variations)

❌ YOU MAY NOT:
• Use exercises from a DIFFERENT category's allowed list (e.g., burpees in Strength, isometrics in Challenge)
• Violate the FORBIDDEN exercises list for each category
• Mix equipment types when consistency is required (especially Metabolic category)
• Deviate from the category's training philosophy, intensity, or movement patterns

GOAL: Create VARIETY while respecting each category's PURPOSE, INTENSITY, and MOVEMENT PATTERNS.
Every workout should feel unique while staying true to its category identity.

═══════════════════════════════════════════════════════════════════════════════
DURATION OPTIONS (EXPANDED RANGE):
═══════════════════════════════════════════════════════════════════════════════
Available durations: 15 min, 20 min, 30 min, 45 min, 60 min, or Various

DURATION SELECTION GUIDELINES:
• 15-20 min: Express sessions - Tabata, short AMRAP, quick EMOM, mobility flows
• 30 min: Standard balanced workout - most categories, moderate intensity
• 45 min: Extended session - more exercises, additional warm-up/cool-down, strength with full rest
• 60 min: Comprehensive workout - full programming with extended main section
• Various: Flexible timing - "Complete as fast as possible", "At your own pace", challenge-style, For Time workouts

Match duration to FORMAT and CATEGORY:
- Tabata → 15-30 min (quick, intense bursts)
- Circuit/AMRAP → 20-45 min (scalable rounds)
- Reps & Sets (Strength) → 45-60 min (rest periods matter)
- Mobility & Stability → 20-45 min (quality over speed)
- Challenge → Various or 30-45 min (race against clock or time cap)
- For Time → Various (complete workout, record time)
- EMOM → 15-30 min (structured minute-by-minute)

YOUR DURATION TODAY: ${duration}

═══════════════════════════════════════════════════════════════════════════════
DIFFICULTY LEVEL ${selectedDifficulty.stars}/6 (${selectedDifficulty.name}):
═══════════════════════════════════════════════════════════════════════════════
${selectedDifficulty.stars <= 2 ? `• Suitable for beginners or those returning to fitness
• Focus on foundational movements with proper form
• Moderate intensity with adequate rest periods
• Use regression options when available (knee push-ups, assisted squats)
• Duration: ${duration}` : ""}
${selectedDifficulty.stars >= 3 && selectedDifficulty.stars <= 4 ? `• For regular exercisers with good fitness base
• Increased complexity and intensity
• Challenging but achievable for consistent trainers
• Standard exercise progressions
• Duration: ${duration}` : ""}
${selectedDifficulty.stars >= 5 ? `• Advanced level for experienced athletes
• High intensity, complex movements, minimal rest
• Requires excellent form and fitness foundation
• Use advanced progressions (pistol squats, muscle-up preps, handstand push-ups)
• Duration: ${duration}` : ""}

CRITICAL FORMATTING RULES (MANDATORY - FOLLOW EXACTLY FOR COMPACT, READABLE CONTENT):

1. NO WORKOUT TITLE - Users already know which workout they're viewing. Start directly with content.

2. SECTION TITLES (Warm-Up, Main Workout, Cool-Down, Notes):
   <p class="tiptap-paragraph"><strong><u>Section Title (X minutes)</u></strong></p>
   <p class="tiptap-paragraph"></p>
   [Content starts immediately after ONE empty line]

3. SUB-HEADERS (Block 1, Block 2, Circuit, Round, etc.):
   <p class="tiptap-paragraph"></p>
   <p class="tiptap-paragraph"><strong>Sub-header Name</strong></p>
   [Exercises start immediately - NO empty line after sub-header]

4. EXERCISES (Numbered list with NO gaps between items):
   <ul class="tiptap-bullet-list">
   <li class="tiptap-list-item"><p class="tiptap-paragraph"><strong>1. Exercise Name</strong> – description – time/reps</p></li>
   <li class="tiptap-list-item"><p class="tiptap-paragraph"><strong>2. Exercise Name</strong> – description – time/reps</p></li>
   <li class="tiptap-list-item"><p class="tiptap-paragraph"><strong>3. Exercise Name</strong> – description – time/reps</p></li>
   </ul>

5. REST INSTRUCTIONS (inline paragraph after exercises):
   <p class="tiptap-paragraph">Rest: 60-90 seconds between sets.</p>

SPACING RULES (CRITICAL - KEEP CONTENT COMPACT):
- ONE empty paragraph after section title ONLY
- ONE empty paragraph BEFORE next section or sub-header ONLY
- NEVER put empty paragraphs between exercises in a list
- NEVER put empty paragraphs after bullet/numbered lists
- NEVER end content with empty paragraphs
- NEVER start content with empty paragraphs
- Goal: User sees workout overview in 2-3 seconds WITHOUT scrolling

WORKOUT NAME RULES (CRITICAL):
- Create a COMPLETELY UNIQUE name every time - never repeat past names
- BANNED WORDS (never use): "Inferno", "Beast", "Blaze", "Fire", "Burn", "Warrior", "Titan", "Crusher", "Destroyer"
- The name should reflect ${equipment === "BODYWEIGHT" ? "bodyweight/no equipment training" : "equipment-based training"}
- Use creative combinations that reflect the category:
  * STRENGTH: "Iron Protocol", "Steel Foundation", "Power Complex", "Barbell Symphony"
  * CALORIE BURNING: "Sweat Storm", "Torch Session", "Meltdown Express", "Caloric Chaos"
  * METABOLIC: "Metabolic Mayhem", "Conditioning Crucible", "Engine Builder", "Capacity Test"
  * CARDIO: "Heart Racer", "Endurance Edge", "Pulse Pounder", "Cardio Quest"
  * MOBILITY: "Flow State", "Flexibility Fusion", "Joint Liberation", "Balance Blueprint"
  * CHALLENGE: "Ultimate Test", "Apex Trial", "Gauntlet Series", "Peak Performance"
- Maximum 2-3 words

DESCRIPTION REQUIREMENTS:
- Write 2-3 compelling sentences that:
  * Mention this is a ${equipment === "BODYWEIGHT" ? "NO EQUIPMENT needed" : "equipment-based"} workout
  * Explain WHO this workout is for (fitness level, goals)
  * Describe WHAT they'll experience (intensity, focus areas)
  * Mention the BENEFIT they'll gain (strength, fat loss, mobility, etc.)
- Sound professional and motivating, like expert coaching

CONTENT STRUCTURE:
1. DESCRIPTION: 2-3 professional sentences (see above)
2. WORKOUT: Complete with Warm-up (5-8 min), Main workout, Cool-down (3-5 min)
3. INSTRUCTIONS: Clear step-by-step guidance
4. TIPS: Expert coaching tips for form and performance

Respond in this EXACT JSON format:
{
  "name": "Workout Name Here",
  "description": "<p class=\\"tiptap-paragraph\\">Description here...</p>",
  "main_workout": "[formatted HTML following rules above]",
  "instructions": "<p class=\\"tiptap-paragraph\\">Instructions here...</p>",
  "tips": "<p class=\\"tiptap-paragraph\\">Tips here...</p>"
}`;

      logStep(`Calling Lovable AI for ${equipment} workout content`);
      
      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${lovableApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "You are a professional fitness trainer. Always respond with valid JSON only, no markdown." },
            { role: "user", content: workoutPrompt }
          ],
        }),
      });

      if (!aiResponse.ok) {
        throw new Error(`AI request failed: ${aiResponse.status}`);
      }

      const aiData = await aiResponse.json();
      let workoutContent;
      
      try {
        const rawContent = aiData.choices[0].message.content;
        const cleanContent = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        workoutContent = JSON.parse(cleanContent);
      } catch (e) {
        logStep("Failed to parse AI response", { error: e, raw: aiData.choices[0].message.content });
        throw new Error(`Failed to parse AI workout content for ${equipment}`);
      }

      logStep(`${equipment} workout content generated`, { name: workoutContent.name });

      // Store the first workout's name to prevent duplicates
      if (equipment === "BODYWEIGHT") {
        firstWorkoutName = workoutContent.name;
        logStep("Stored first workout name for duplicate prevention", { firstWorkoutName });
      }

      // Generate unique ID with equipment indicator
      const equipSuffix = equipment === "BODYWEIGHT" ? "BW" : "EQ";
      const workoutId = `WOD-${prefix}-${equipSuffix}-${timestamp}`;

      // Generate image with retry logic
      logStep(`Generating image for ${equipment} workout`);
      
      let imageUrl = null;
      const maxRetries = 2;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const imageResponse = await fetch(`${supabaseUrl}/functions/v1/generate-workout-image`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${supabaseServiceKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: workoutContent.name,
              category: category,
              format: format,
              difficulty_stars: selectedDifficulty.stars,
              equipment: equipment
            }),
          });

          if (imageResponse.ok) {
            const imageData = await imageResponse.json();
            imageUrl = imageData.imageUrl || imageData.image_url;
            
            if (imageUrl) {
              logStep(`Image generated for ${equipment} (attempt ${attempt})`, { imageUrl: imageUrl.substring(0, 80) + "..." });
              break; // Success, exit retry loop
            } else {
              logStep(`Image response OK but no URL returned for ${equipment} (attempt ${attempt})`, { imageData });
            }
          } else {
            const errorText = await imageResponse.text();
            logStep(`Image generation HTTP error for ${equipment} (attempt ${attempt})`, { 
              status: imageResponse.status, 
              error: errorText.substring(0, 200) 
            });
          }
        } catch (imgError: any) {
          logStep(`Image generation exception for ${equipment} (attempt ${attempt})`, { error: imgError.message });
        }
        
        // Wait before retry
        if (attempt < maxRetries) {
          logStep(`Retrying image generation for ${equipment}...`);
          await new Promise(r => setTimeout(r, 2000));
        }
      }
      
      if (!imageUrl) {
        logStep(`WARNING: All image generation attempts failed for ${equipment} - Stripe product will have no image`);
      }

      // Create Stripe product
      logStep(`Creating Stripe product for ${equipment} workout`);
      
      const stripeResponse = await fetch(`${supabaseUrl}/functions/v1/create-stripe-product`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${supabaseServiceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `${workoutContent.name} (${equipment === "BODYWEIGHT" ? "No Equipment" : "With Equipment"})`,
          price: "3.99",
          contentType: "Workout",
          imageUrl: imageUrl
        }),
      });

      let stripeProductId = null;
      let stripePriceId = null;
      
      if (stripeResponse.ok) {
        const stripeData = await stripeResponse.json();
        stripeProductId = stripeData.product_id;
        stripePriceId = stripeData.price_id;
        logStep(`Stripe product created for ${equipment}`, { stripeProductId, stripePriceId });
        
        // POST-CREATION VERIFICATION: Verify Stripe product has image
        if (stripeProductId && imageUrl) {
          try {
            const product = await stripe.products.retrieve(stripeProductId);
            if (!product.images || product.images.length === 0) {
              logStep(`CRITICAL WARNING: Stripe product ${stripeProductId} created WITHOUT image despite imageUrl being provided`);
              // Attempt to fix by updating with image
              await stripe.products.update(stripeProductId, { images: [imageUrl] });
              logStep(`Image fix attempted for ${stripeProductId}`);
            } else {
              logStep(`✅ Verified: Stripe product ${stripeProductId} has image: ${product.images[0].substring(0, 50)}...`);
            }
          } catch (verifyError: any) {
            logStep(`Failed to verify/fix Stripe product image for ${equipment}`, { error: verifyError.message });
          }
        }
      } else {
        logStep(`Stripe product creation failed for ${equipment}`, { status: stripeResponse.status });
      }

      // Insert workout - focus MUST match one of 6 categories
      const focusValue = category.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-");
      const { error: insertError } = await supabase
        .from("admin_workouts")
        .insert({
          id: workoutId,
          name: workoutContent.name,
          category: category,
          type: focusValue,
          focus: focusValue, // CRITICAL: Set focus to match category
          format: format,
          difficulty: selectedDifficulty.name,
          difficulty_stars: selectedDifficulty.stars,
          equipment: equipment,
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

    // Send single notification for both workouts
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
        const userEmails = usersData?.users?.filter(u => userIds.includes(u.id) && u.email).map(u => u.email) as string[] || [];
        
        for (const email of userEmails) {
          try {
            const emailResult = await resendClient.emails.send({
              from: 'SmartyGym <notifications@smartygym.com>',
              to: [email],
              subject: notificationTitle,
              headers: getEmailHeaders(email),
              html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
<h1 style="color: #d4af37;">🏆 Today's Workouts</h1>
<p style="font-size: 16px;">Today we have <strong>TWO</strong> workout options for ${category} day:</p>
<div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
  <p style="margin: 10px 0;"><strong>🏠 No Equipment:</strong> ${bodyweightWod?.name || "Bodyweight Workout"}</p>
  <p style="margin: 10px 0;"><strong>🏋️ With Equipment:</strong> ${equipmentWod?.name || "Equipment Workout"}</p>
</div>
<p><strong>Format:</strong> ${format} | <strong>Difficulty:</strong> ${selectedDifficulty.name} (${selectedDifficulty.stars}⭐)</p>
<p style="color: #666;">Choose based on your situation: at home, traveling, or at the gym!</p>
<p style="margin-top: 20px;">Available for €3.99 each or included with Premium.</p>
<p style="margin-top: 20px;"><a href="https://smartygym.com/workout/wod" style="background: #d4af37; color: white; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">View Workouts →</a></p>
${getEmailFooter(email)}
</div>`,
            });
            
            if (emailResult.error) {
              logStep("Email API error", { email, error: emailResult.error });
            } else {
              // Rate limiting: 600ms delay to respect Resend's 2 requests/second limit
              await new Promise(resolve => setTimeout(resolve, 600));
            }
          } catch (e) {
            logStep("Email send error", { email, error: e });
          }
        }
        logStep(`✅ Sent to ${userIds.length} users`);
      }
    } catch (e) {
      logStep("Error sending WOD notification", { error: e });
    }

    // Update state with difficulty rotation tracking
    const newState = {
      day_count: state.day_count + 1,
      current_category: CATEGORY_CYCLE[(state.day_count + 1) % CATEGORY_CYCLE.length],
      last_equipment: "BOTH",
      last_difficulty: selectedDifficulty.name,
      last_difficulty_stars: selectedDifficulty.stars, // Track for rotation logic
      used_difficulties_in_cycle: newUsedDifficulties, // Track which difficulties used in current cycle
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

    if (stateData) {
      await supabase
        .from("workout_of_day_state")
        .update(newState)
        .eq("id", stateData.id);
    } else {
      await supabase
        .from("workout_of_day_state")
        .insert(newState);
    }

    logStep("State updated", newState);

    return new Response(
      JSON.stringify({
        success: true,
        workouts: generatedWorkouts,
        shared: {
          category: category,
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
