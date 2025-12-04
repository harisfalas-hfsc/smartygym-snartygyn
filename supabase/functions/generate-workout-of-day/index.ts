import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

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

// Simplified 6-day difficulty cycle - each star level appears exactly once
const DIFFICULTY_CYCLE = [
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

    // Determine difficulty (6-day cycle ensures all 6 levels covered)
    const difficultyIndex = state.day_count % DIFFICULTY_CYCLE.length;
    const selectedDifficulty = DIFFICULTY_CYCLE[difficultyIndex];
    logStep("Selected difficulty (shared)", { ...selectedDifficulty, dayCount: state.day_count });

    // Determine format with tracking (same for both workouts)
    const formatUsage = state.format_usage || {};
    const { format, updatedUsage } = getNextFormat(category, formatUsage);
    logStep("Selected format (shared)", { format, category, usedFormats: formatUsage[category] });

    // Duration based on format
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

    for (const equipment of equipmentTypes) {
      logStep(`Generating ${equipment} workout`);

      // Generate workout content using Lovable AI
      const workoutPrompt = `You are Haris Falas, a Sports Scientist with 20+ years of coaching experience (CSCS Certified), creating a premium Workout of the Day for SmartyGym members worldwide.

Generate a complete workout with these specifications:
- Category: ${category}
- Equipment: ${equipment}
- Difficulty: ${selectedDifficulty.name} (${selectedDifficulty.stars} stars out of 6)
- Format: ${format}

TRAINING PHILOSOPHY (CRITICAL - MUST FOLLOW):
${category === "STRENGTH" ? `
STRENGTH WORKOUTS:
- Focus on compound movements and progressive overload
- Use Reps & Sets format with clear rest periods
- ${equipment === "EQUIPMENT" ? "Include barbell, dumbbell, or kettlebell exercises" : "Use advanced calisthenics and bodyweight strength moves like pull-ups, dips, pistol squats, muscle-ups progressions"}
- Target muscle hypertrophy and strength gains
- Appropriate for gym-goers wanting to build muscle and power` : ""}
${category === "CALORIE BURNING" ? `
CALORIE BURNING WORKOUTS:
- High-intensity interval training to maximize calorie expenditure
- Fast-paced circuits with minimal rest
- Full-body movements that elevate heart rate
- ${equipment === "EQUIPMENT" ? "Use kettlebells, dumbbells, jump rope, or battle ropes" : "Bodyweight moves like burpees, mountain climbers, jumping jacks, high knees"}
- Perfect for fat loss and conditioning` : ""}
${category === "METABOLIC" ? `
METABOLIC CONDITIONING WORKOUTS:
- Combination of strength and cardio for metabolic stress
- Work-to-rest ratios that challenge energy systems
- ${equipment === "EQUIPMENT" ? "Compound movements with lighter weights at higher volume (kettlebells, dumbbells, barbells)" : "Bodyweight compound movements at high volume"}
- Builds work capacity and burns calories post-workout
- Great for athletes and fitness enthusiasts` : ""}
${category === "CARDIO" ? `
CARDIO WORKOUTS:
- Sustained elevated heart rate for cardiovascular health
- Mix of locomotion, plyometrics, and conditioning
- ${equipment === "EQUIPMENT" ? "Use rowing, battle ropes, bike, or weighted carries" : "Running, jumping, crawling, and plyometric bodyweight exercises"}
- Focus on endurance and stamina building
- Scalable intensity for all fitness levels` : ""}
${category === "MOBILITY & STABILITY" ? `
MOBILITY & STABILITY WORKOUTS:
- Focus on joint health, flexibility, and core stability
- Controlled movements with proper breathing
- ${equipment === "EQUIPMENT" ? "Use resistance bands, foam rollers, stability balls, or light weights" : "Bodyweight mobility flows, yoga-inspired movements, and controlled holds"}
- Active recovery and injury prevention
- Essential for long-term fitness and performance` : ""}
${category === "CHALLENGE" ? `
CHALLENGE WORKOUTS:
- Push your limits with advanced programming
- Test mental and physical toughness
- ${equipment === "EQUIPMENT" ? "Complex movements combining multiple tools (barbells, kettlebells, dumbbells)" : "Advanced bodyweight skills and high-rep challenges"}
- Complex movements and demanding protocols
- For experienced athletes seeking new challenges` : ""}

DIFFICULTY LEVEL ${selectedDifficulty.stars}/6 (${selectedDifficulty.name}):
${selectedDifficulty.stars <= 2 ? "- Suitable for beginners or those returning to fitness\n- Focus on foundational movements with proper form\n- Moderate intensity with adequate rest periods" : ""}
${selectedDifficulty.stars >= 3 && selectedDifficulty.stars <= 4 ? "- For regular exercisers with good fitness base\n- Increased complexity and intensity\n- Challenging but achievable for consistent trainers" : ""}
${selectedDifficulty.stars >= 5 ? "- Advanced level for experienced athletes\n- High intensity, complex movements, minimal rest\n- Requires excellent form and fitness foundation" : ""}

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

      // Generate unique ID with equipment indicator
      const equipSuffix = equipment === "BODYWEIGHT" ? "BW" : "EQ";
      const workoutId = `WOD-${prefix}-${equipSuffix}-${timestamp}`;

      // Generate image
      logStep(`Generating image for ${equipment} workout`);
      
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

      let imageUrl = null;
      if (imageResponse.ok) {
        const imageData = await imageResponse.json();
        imageUrl = imageData.imageUrl || imageData.image_url;
        logStep(`Image generated for ${equipment}`, { imageUrl });
      } else {
        logStep(`Image generation failed for ${equipment}`, { status: imageResponse.status });
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
      } else {
        logStep(`Stripe product creation failed for ${equipment}`, { status: stripeResponse.status });
      }

      // Insert workout
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
            await resendClient.emails.send({
              from: 'SmartyGym <notifications@smartygym.com>',
              to: [email],
              subject: notificationTitle,
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
</div>`,
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
