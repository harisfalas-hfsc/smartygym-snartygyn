import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { normalizeWorkoutHtml, validateWorkoutHtml } from "../_shared/html-normalizer.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function logStep(step: string, details?: any) {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[WELCOME-WORKOUT] ${step}${detailsStr}`);
}

// Categories to pick from (excluding Recovery and Micro-Workouts)
const WELCOME_CATEGORIES = [
  "STRENGTH", "CARDIO", "CALORIE BURNING", "METABOLIC", 
  "MOBILITY & STABILITY", "CHALLENGE", "PILATES"
];

const FORMATS_BY_CATEGORY: Record<string, string[]> = {
  "STRENGTH": ["REPS & SETS"],
  "MOBILITY & STABILITY": ["REPS & SETS"],
  "PILATES": ["REPS & SETS"],
  "CARDIO": ["CIRCUIT", "EMOM", "FOR TIME", "AMRAP", "TABATA"],
  "METABOLIC": ["CIRCUIT", "AMRAP", "EMOM", "FOR TIME", "TABATA"],
  "CALORIE BURNING": ["CIRCUIT", "TABATA", "AMRAP", "FOR TIME", "EMOM"],
  "CHALLENGE": ["CIRCUIT", "TABATA", "AMRAP", "EMOM", "FOR TIME", "MIX"],
};

const CATEGORY_PREFIXES: Record<string, string> = {
  "STRENGTH": "S", "CALORIE BURNING": "CB", "METABOLIC": "M",
  "CARDIO": "CA", "MOBILITY & STABILITY": "MS", "CHALLENGE": "CH", "PILATES": "PIL"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id } = await req.json();
    if (!user_id) throw new Error("user_id is required");

    logStep("Starting welcome workout generation", { user_id });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");

    if (!lovableApiKey) throw new Error("LOVABLE_API_KEY is not configured");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not configured");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check if user already has a welcome workout (prevent duplicates)
    const { data: existingPurchase } = await supabase
      .from("user_purchases")
      .select("id")
      .eq("user_id", user_id)
      .ilike("content_name", "%(Welcome Gift)%")
      .limit(1);

    if (existingPurchase && existingPurchase.length > 0) {
      logStep("User already has welcome workout, skipping", { user_id });
      return new Response(
        JSON.stringify({ success: true, skipped: true, message: "Welcome workout already exists" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Pick random category
    const category = WELCOME_CATEGORIES[Math.floor(Math.random() * WELCOME_CATEGORIES.length)];
    const formats = FORMATS_BY_CATEGORY[category] || ["CIRCUIT"];
    const format = formats[Math.floor(Math.random() * formats.length)];
    const prefix = CATEGORY_PREFIXES[category] || "W";
    const equipment = Math.random() < 0.5 ? "BODYWEIGHT" : "EQUIPMENT";
    const timestamp = Date.now();
    const workoutId = `WEL-${prefix}-${equipment.charAt(0)}-${timestamp}`;

    // Always intermediate (3 stars)
    const difficulty = { name: "Intermediate", stars: 3 };

    // Duration calculation
    const getDuration = (fmt: string, stars: number): string => {
      const baseDurations: Record<string, number[]> = {
        "REPS & SETS": [25, 35, 50], "CIRCUIT": [20, 30, 45],
        "TABATA": [15, 25, 35], "AMRAP": [15, 25, 40],
        "EMOM": [15, 25, 35], "FOR TIME": [0, 0, 0], "MIX": [20, 30, 45]
      };
      if (fmt === "FOR TIME") return "Various";
      const [, mid] = baseDurations[fmt] || [20, 30, 45];
      return `${mid} min`;
    };
    const duration = getDuration(format, difficulty.stars);

    logStep("Welcome workout specs", { category, format, equipment, difficulty, duration });

    // Generate workout content using AI
    const workoutPrompt = `You are Haris Falas, a Sports Scientist with 20+ years of coaching experience (CSCS Certified), creating a Welcome Workout for a new SmartyGym member.

NAMING RULES:
- Keep it 2-4 words, creative, memorable
- Must reflect the ${category} category
- NO overused words like Inferno, Blaze, Fire, Fury, Storm, Thunder

Generate a complete workout:
- Category: ${category}
- Equipment: ${equipment}
- Difficulty: ${difficulty.name} (${difficulty.stars} stars out of 6)
- Format: ${format}

FORMAT DEFINITIONS:
- Tabata: 20 seconds work, 10 seconds rest, 8 rounds per exercise
- Circuit: 4-6 exercises repeated 3-5 rounds with minimal rest
- AMRAP: As Many Rounds As Possible in a given time
- For Time: Complete all exercises as fast as possible
- EMOM: Every Minute On the Minute
- Reps & Sets: Classic strength format (e.g., 4 sets x 8 reps)

WORKOUT STRUCTURE (5 sections):
1. 🧽 Soft Tissue Preparation 5'
2. 🔥 Activation 10-15'
3. 💪 Main Workout
4. ⚡ Finisher
5. 🧘 Cool Down 10'

HTML FORMAT (CRITICAL - follow exactly):
- Section titles: <p class="tiptap-paragraph">🧽 <strong><u>Soft Tissue Preparation 5'</u></strong></p>
- Exercise lists: <ul class="tiptap-bullet-list"><li class="tiptap-list-item"><p class="tiptap-paragraph">Exercise</p></li></ul>
- One empty <p class="tiptap-paragraph"></p> between sections
- Bullets ONLY for exercises, never for instructions

Respond with ONLY valid JSON (no markdown):
{
  "name": "2-4 word name",
  "description": "<p class=\\"tiptap-paragraph\\">Brief motivating description for a welcome workout</p>",
  "main_workout": "Full HTML with all 5 sections",
  "instructions": "<p class=\\"tiptap-paragraph\\">How to perform this workout</p>",
  "tips": "<p class=\\"tiptap-paragraph\\">Coaching tips</p>"
}`;

    logStep("Calling AI for workout generation");

    let workoutContent: any = null;

    // Attempt 1: Primary model
    try {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${lovableApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "You are a professional fitness coach. Return ONLY valid JSON. No markdown. No explanation." },
            { role: "user", content: workoutPrompt }
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        let content = data.choices?.[0]?.message?.content || '';
        content = content.replace(/^```(?:json|JSON)?\s*\n?/gm, '');
        content = content.replace(/\n?```\s*$/gm, '');
        const firstBrace = content.indexOf('{');
        const lastBrace = content.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          content = content.substring(firstBrace, lastBrace + 1);
        }
        workoutContent = JSON.parse(content.trim());
        logStep("✅ AI generation succeeded", { name: workoutContent?.name });
      }
    } catch (e: any) {
      logStep("Primary AI attempt failed", { error: e.message });
    }

    // Attempt 2: Retry with simpler prompt
    if (!workoutContent) {
      logStep("Retrying with minimal prompt");
      try {
        const retryResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: "Return ONLY valid JSON. No markdown." },
              { role: "user", content: `Generate a ${category} workout for ${equipment === "BODYWEIGHT" ? "bodyweight" : "gym equipment"}. Difficulty: Intermediate (3/6). Format: ${format}. Return JSON: {"name":"2-4 words","description":"<p class='tiptap-paragraph'>...</p>","main_workout":"<p class='tiptap-paragraph'>...</p>","instructions":"<p class='tiptap-paragraph'>...</p>","tips":"<p class='tiptap-paragraph'>...</p>"}` }
            ],
          }),
        });

        if (retryResponse.ok) {
          const data = await retryResponse.json();
          let content = data.choices?.[0]?.message?.content || '';
          content = content.replace(/^```(?:json|JSON)?\s*\n?/gm, '');
          content = content.replace(/\n?```\s*$/gm, '');
          const firstBrace = content.indexOf('{');
          const lastBrace = content.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1) {
            content = content.substring(firstBrace, lastBrace + 1);
          }
          workoutContent = JSON.parse(content.trim());
          logStep("✅ Retry succeeded", { name: workoutContent?.name });
        }
      } catch (e: any) {
        logStep("Retry also failed", { error: e.message });
      }
    }

    if (!workoutContent) {
      throw new Error("All AI generation attempts failed");
    }

    // Normalize HTML
    const normalizedMainWorkout = normalizeWorkoutHtml(workoutContent.main_workout || '');
    const validation = validateWorkoutHtml(normalizedMainWorkout);
    if (!validation.isValid) {
      logStep("⚠️ HTML validation issues", { issues: validation.issues });
    }

    // Generate image
    logStep("Generating workout image");
    let imageUrl: string | null = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const { data: imageData, error: imageError } = await supabase.functions.invoke("generate-workout-image", {
          body: { name: workoutContent.name, category, format, difficulty_stars: difficulty.stars }
        });
        if (!imageError && imageData?.image_url) {
          imageUrl = imageData.image_url;
          logStep(`✅ Image generated on attempt ${attempt}`, { imageUrl: imageUrl.substring(0, 80) });
          break;
        }
        logStep(`Image attempt ${attempt} failed`, { error: imageError?.message });
      } catch (imgErr: any) {
        logStep(`Image exception attempt ${attempt}`, { error: imgErr.message });
      }
      if (attempt < 3) await new Promise(r => setTimeout(r, 3000));
    }

    // Create Stripe product with SMARTYGYM metadata
    logStep("Creating Stripe product", { name: workoutContent.name, hasImage: !!imageUrl });

    const stripeProduct = await stripe.products.create({
      name: workoutContent.name,
      description: `${category} Workout (${equipment})`,
      images: imageUrl ? [imageUrl] : [],
      metadata: {
        project: "SMARTYGYM",
        content_type: "Workout",
        content_id: workoutId,
        workout_id: workoutId,
        type: "welcome",
        category: category,
        equipment: equipment,
      }
    });

    // Verify Stripe product image
    if (!stripeProduct.images || stripeProduct.images.length === 0) {
      logStep("❌ Stripe product created WITHOUT image", { productId: stripeProduct.id });
    } else {
      logStep("✅ Stripe product image verified", { productId: stripeProduct.id });
    }

    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: 399, // EUR 3.99
      currency: "eur",
    });

    logStep("Stripe product and price created", { productId: stripeProduct.id, priceId: stripePrice.id });

    // Save workout to database
    const { error: insertError } = await supabase.from("admin_workouts").insert({
      id: workoutId,
      name: workoutContent.name,
      type: "welcome",
      category: category,
      format: format,
      equipment: equipment,
      difficulty: difficulty.name,
      difficulty_stars: difficulty.stars,
      duration: duration,
      description: workoutContent.description,
      main_workout: normalizedMainWorkout,
      instructions: workoutContent.instructions,
      tips: workoutContent.tips,
      image_url: imageUrl,
      is_premium: true,
      is_standalone_purchase: true,
      price: 3.99,
      stripe_product_id: stripeProduct.id,
      stripe_price_id: stripePrice.id,
      is_workout_of_day: false,
      is_ai_generated: true,
      is_visible: true,
    });

    if (insertError) {
      throw new Error(`Failed to insert welcome workout: ${insertError.message}`);
    }

    logStep("✅ Workout saved to database", { workoutId });

    // Insert complimentary purchase record (price = 0)
    const { error: purchaseError } = await supabase.from("user_purchases").insert({
      user_id: user_id,
      content_id: workoutId,
      content_type: "workout",
      content_name: `${workoutContent.name} (Welcome Gift)`,
      price: 0,
    });

    if (purchaseError) {
      logStep("❌ Failed to insert complimentary purchase", { error: purchaseError.message });
      // Don't throw - workout was created successfully, purchase record is secondary
    } else {
      logStep("✅ Complimentary purchase recorded", { user_id, workoutId });
    }

    // Send dashboard notification
    try {
      await supabase.from("user_system_messages").insert({
        user_id: user_id,
        message_type: "achievement",
        subject: "🎁 Your Free Welcome Workout is Ready!",
        content: `Congratulations! Your complimentary "${workoutContent.name}" workout has been added to your dashboard. This ${category.toLowerCase()} workout is designed to get you started on your fitness journey. Check your purchases to access it now!`,
      });
      logStep("✅ Dashboard notification sent");
    } catch (notifErr) {
      logStep("Failed to send dashboard notification", { error: notifErr });
    }

    return new Response(
      JSON.stringify({
        success: true,
        workout: {
          id: workoutId,
          name: workoutContent.name,
          category,
          format,
          equipment,
          difficulty: difficulty.name,
          image_url: imageUrl,
          stripe_product_id: stripeProduct.id,
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logStep("❌ ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
