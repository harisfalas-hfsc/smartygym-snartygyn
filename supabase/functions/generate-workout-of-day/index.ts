import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

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

CRITICAL FORMATTING RULES (MANDATORY - FOLLOW EXACTLY):

1. TITLE FORMAT:
   <p class="tiptap-paragraph"><strong><u>WORKOUT TITLE</u></strong></p>
   <p class="tiptap-paragraph"></p>

2. SECTION TITLES (Warm-Up, Main Workout, Cooldown, Notes):
   <p class="tiptap-paragraph"></p>
   <p class="tiptap-paragraph"><strong><u>Section Title (X minutes)</u></strong></p>
   <p class="tiptap-paragraph"></p>

3. SUB-HEADERS (Block 1, Block 2, Circuit, Round, etc.):
   <p class="tiptap-paragraph"></p>
   <p class="tiptap-paragraph"><strong>Sub-header Name</strong></p>
   <p class="tiptap-paragraph"></p>

4. EXERCISES (Always use bullet list):
   <ul class="tiptap-bullet-list">
   <li class="tiptap-list-item"><p class="tiptap-paragraph">Exercise Name – description – time/reps</p></li>
   </ul>
   <p class="tiptap-paragraph"></p>

SPACING RULES:
- Always one empty <p class="tiptap-paragraph"></p> after title
- Always one empty paragraph BEFORE and AFTER each section title
- Always one empty paragraph BEFORE sub-headers
- Always one empty paragraph AFTER each exercise list
- Never merge sections into one paragraph

CONTENT REQUIREMENTS:
WORKOUT NAME RULES (CRITICAL):
- Create a COMPLETELY UNIQUE name every time - never repeat past names
- BANNED WORDS (never use): "Inferno", "Beast", "Blaze", "Fire", "Burn", "Warrior", "Titan"
- Use creative combinations:
  * Action + Target: "Core Crusher", "Leg Destroyer", "Power Surge", "Iron Will"
  * Intensity + Movement: "Explosive Circuits", "Velocity Rush", "Steel Resolve"
  * Unique themes: "Apex Challenge", "Momentum Builder", "Force Unleashed"
- Name must reflect category and format
- Maximum 2-3 words

CONTENT REQUIREMENTS:
1. DESCRIPTION: 2-3 compelling sentences
2. WORKOUT: Complete with Warm-up (5-8 min), Main workout, Cool-down (3-5 min)
3. INSTRUCTIONS: Step-by-step guidance
4. TIPS: Professional coaching tips

EXAMPLE main_workout structure:
<p class="tiptap-paragraph"><strong><u>Warm-Up (7 minutes)</u></strong></p>
<p class="tiptap-paragraph"></p>
<ul class="tiptap-bullet-list">
<li class="tiptap-list-item"><p class="tiptap-paragraph">Dynamic Arm Circles – forward/backward – 60 seconds</p></li>
<li class="tiptap-list-item"><p class="tiptap-paragraph">Leg Swings – front & lateral – 30 seconds each leg</p></li>
</ul>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph"><strong><u>Main Workout</u></strong></p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph"><strong>Block 1: Lower Body Power</strong></p>
<p class="tiptap-paragraph"></p>
<ul class="tiptap-bullet-list">
<li class="tiptap-list-item"><p class="tiptap-paragraph">Squat Jumps – explosive – 20 seconds work / 10 seconds rest x 8</p></li>
</ul>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph"><strong><u>Cool-Down (5 minutes)</u></strong></p>
<p class="tiptap-paragraph"></p>
<ul class="tiptap-bullet-list">
<li class="tiptap-list-item"><p class="tiptap-paragraph">Child's Pose – hold – 60 seconds</p></li>
</ul>

Respond in this EXACT JSON format:
{
  "name": "Workout Name Here",
  "description": "<p class=\\"tiptap-paragraph\\">Description here...</p>",
  "main_workout": "[formatted HTML following rules above]",
  "instructions": "<p class=\\"tiptap-paragraph\\">Instructions here...</p>",
  "tips": "<p class=\\"tiptap-paragraph\\">Tips here...</p>"
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

    // Send WOD notification DIRECTLY to all users
    try {
      const { data: allUsers } = await supabase.from('profiles').select('user_id');
      const userIds = allUsers?.map(u => u.user_id) || [];
      logStep(`Sending WOD to ${userIds.length} users`);
      
      if (userIds.length > 0) {
        const resendClient = new Resend(Deno.env.get('RESEND_API_KEY'));
        const notificationTitle = `🏆 Today's Workout: ${workoutContent.name}`;
        const notificationContent = `<p class="tiptap-paragraph"><strong>🏆 Today's Workout of the Day</strong></p><p class="tiptap-paragraph"></p><p class="tiptap-paragraph"><strong>${workoutContent.name}</strong></p><p class="tiptap-paragraph"></p><p class="tiptap-paragraph">${category} | ${format} | ${equipment} | ${selectedDifficulty.name}</p><p class="tiptap-paragraph"></p>${workoutContent.description}<p class="tiptap-paragraph"></p><p class="tiptap-paragraph">Available for €3.99 or included with Premium.</p><p class="tiptap-paragraph"></p><p class="tiptap-paragraph"><a href="https://smartygym.com/workout-of-the-day">View Today's Workout →</a></p>`;
        
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
            await resendClient.emails.send({
              from: 'SmartyGym <onboarding@resend.dev>',
              to: [email],
              subject: notificationTitle,
              html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><h1 style="color: #d4af37;">🏆 Today's Workout</h1><h2 style="color: #333;">${workoutContent.name}</h2><p>${category} | ${format} | ${equipment} | ${selectedDifficulty.name}</p><p style="line-height: 1.6;">${workoutContent.description}</p><p>Available for €3.99 or included with Premium.</p><p><a href="https://smartygym.com/workout-of-the-day" style="background: #d4af37; color: white; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Workout →</a></p></div>`,
            });
          } catch (e) {
            logStep("Email send error", { email, error: e });
          }
        }
        logStep(`✅ Sent to ${userIds.length} users`);
      }
    } catch (e) {
      logStep("Error sending WOD notification", { error: e });
    }

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
