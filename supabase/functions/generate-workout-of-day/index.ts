import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Category rotation cycle (6 days)
const CATEGORY_CYCLE = [
  "STRENGTH",
  "CALORIE BURNING", 
  "METABOLIC",
  "CARDIO",
  "MOBILITY & STABILITY",
  "CHALLENGE"
];

// Valid formats per category
const FORMATS_BY_CATEGORY: Record<string, string[]> = {
  "STRENGTH": ["REPS & SETS"],
  "CALORIE BURNING": ["CIRCUIT", "TABATA", "AMRAP", "EMOM", "FOR TIME"],
  "METABOLIC": ["CIRCUIT", "TABATA", "AMRAP", "EMOM", "FOR TIME"],
  "CARDIO": ["CIRCUIT", "EMOM", "FOR TIME"],
  "MOBILITY & STABILITY": ["MIX", "CIRCUIT"],
  "CHALLENGE": ["CIRCUIT", "TABATA", "AMRAP", "EMOM", "FOR TIME", "REPS & SETS", "MIX"]
};

// Difficulty levels with stars
const DIFFICULTIES = [
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting Workout of the Day generation");

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
      difficulty_advanced_count: 0
    };

    logStep("Current state", state);

    // Move previous WOD to its category (if exists)
    const { data: previousWOD } = await supabase
      .from("admin_workouts")
      .select("*")
      .eq("is_workout_of_day", true)
      .single();

    if (previousWOD) {
      logStep("Moving previous WOD to category", { id: previousWOD.id, category: previousWOD.category });
      
      // Get next serial number for the category
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

      logStep("Previous WOD moved", { serialNumber: nextSerialNumber });
    }

    // Determine today's category
    const categoryIndex = state.day_count % CATEGORY_CYCLE.length;
    const category = CATEGORY_CYCLE[categoryIndex];
    logStep("Today's category", { category, dayCount: state.day_count });

    // Determine equipment (aim for 50/50 balance)
    const shouldBeBodyweight = state.equipment_bodyweight_count <= state.equipment_with_count;
    const equipment = shouldBeBodyweight ? "BODYWEIGHT" : "EQUIPMENT";
    logStep("Selected equipment", { equipment, shouldBeBodyweight });

    // Determine difficulty (aim for even distribution)
    const difficultyIndex = Math.floor(Math.random() * DIFFICULTIES.length);
    const selectedDifficulty = DIFFICULTIES[difficultyIndex];
    logStep("Selected difficulty", selectedDifficulty);

    // Determine format
    const validFormats = FORMATS_BY_CATEGORY[category] || ["CIRCUIT"];
    const format = validFormats[Math.floor(Math.random() * validFormats.length)];
    logStep("Selected format", { format });

    // Generate workout content using Lovable AI
    const workoutPrompt = `You are a professional fitness trainer creating a premium Workout of the Day.

Generate a complete workout with these specifications:
- Category: ${category}
- Equipment: ${equipment}
- Difficulty: ${selectedDifficulty.name} (${selectedDifficulty.stars} stars out of 6)
- Format: ${format}

Create the workout with these EXACT sections (use HTML formatting):

1. WORKOUT NAME: Create a catchy, motivating name (e.g., "Iron Core Ignite", "Metabolic Fury", "Beast Mode Builder")

2. DESCRIPTION: A compelling 2-3 sentence overview of what this workout targets and achieves.

3. WORKOUT CONTENT: The complete workout including:
   - Warm-up (5-8 minutes)
   - Main workout with specific exercises, sets, reps, rest periods
   - Cool-down (3-5 minutes)
   Use proper formatting with exercise names, sets x reps, tempo if applicable.

4. INSTRUCTIONS: Step-by-step guidance on how to perform the workout correctly.

5. TIPS: Professional coaching tips for safety and maximizing results.

Respond in this EXACT JSON format:
{
  "name": "Workout Name Here",
  "description": "<p>Description here...</p>",
  "main_workout": "<p><strong>Warm-Up (5 min)</strong></p><p>...</p><p><strong>Main Workout</strong></p><p>...</p><p><strong>Cool-Down (3 min)</strong></p><p>...</p>",
  "instructions": "<p>Instructions here...</p>",
  "tips": "<p>Tips here...</p>"
}`;

    logStep("Calling Lovable AI for workout content");
    
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
      // Remove markdown code blocks if present
      const cleanContent = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      workoutContent = JSON.parse(cleanContent);
    } catch (e) {
      logStep("Failed to parse AI response", { error: e, raw: aiData.choices[0].message.content });
      throw new Error("Failed to parse AI workout content");
    }

    logStep("Workout content generated", { name: workoutContent.name });

    // Generate unique ID
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
    const workoutId = `WOD-${prefix}-${timestamp}`;

    // Generate image using the existing edge function
    logStep("Generating workout image");
    
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
        difficulty_stars: selectedDifficulty.stars
      }),
    });

    let imageUrl = null;
    if (imageResponse.ok) {
      const imageData = await imageResponse.json();
      imageUrl = imageData.imageUrl || imageData.image_url;
      logStep("Image generated", { imageUrl });
    } else {
      logStep("Image generation failed, continuing without image", { status: imageResponse.status });
    }

    // Create Stripe product
    logStep("Creating Stripe product");
    
    const stripeResponse = await fetch(`${supabaseUrl}/functions/v1/create-stripe-product`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${supabaseServiceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: workoutContent.name,
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
      logStep("Stripe product created", { stripeProductId, stripePriceId });
    } else {
      logStep("Stripe product creation failed", { status: stripeResponse.status });
    }

    // Determine duration based on format
    const durationMap: Record<string, string> = {
      "REPS & SETS": "45-60 min",
      "CIRCUIT": "30-40 min",
      "TABATA": "20-30 min",
      "AMRAP": "25-35 min",
      "EMOM": "20-30 min",
      "FOR TIME": "25-35 min",
      "MIX": "35-45 min"
    };
    const duration = durationMap[format] || "30-45 min";

    // Insert new WOD
    const { error: insertError } = await supabase
      .from("admin_workouts")
      .insert({
        id: workoutId,
        name: workoutContent.name,
        category: category,
        type: category.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-"),
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
        serial_number: null // WOD doesn't have a serial number until moved
      });

    if (insertError) {
      throw new Error(`Failed to insert WOD: ${insertError.message}`);
    }

    logStep("New WOD inserted", { id: workoutId, name: workoutContent.name });

    // Update state
    const newState = {
      day_count: state.day_count + 1,
      current_category: CATEGORY_CYCLE[(state.day_count + 1) % CATEGORY_CYCLE.length],
      last_equipment: equipment,
      last_difficulty: selectedDifficulty.name,
      equipment_bodyweight_count: equipment === "BODYWEIGHT" 
        ? (state.equipment_bodyweight_count || 0) + 1 
        : (state.equipment_bodyweight_count || 0),
      equipment_with_count: equipment === "EQUIPMENT" 
        ? (state.equipment_with_count || 0) + 1 
        : (state.equipment_with_count || 0),
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
        workout: {
          id: workoutId,
          name: workoutContent.name,
          category: category,
          equipment: equipment,
          difficulty: selectedDifficulty.name,
          difficulty_stars: selectedDifficulty.stars,
          format: format,
          image_url: imageUrl
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
