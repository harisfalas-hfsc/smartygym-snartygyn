import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { workout_id } = await req.json();
    
    if (!workout_id) {
      throw new Error("workout_id is required");
    }

    console.log(`[auto-generate-workout-image] Starting for workout: ${workout_id}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch the workout details
    const { data: workout, error: fetchError } = await supabase
      .from("admin_workouts")
      .select("id, name, category, format, difficulty_stars, image_url, stripe_product_id")
      .eq("id", workout_id)
      .single();

    if (fetchError) {
      console.error(`[auto-generate-workout-image] Failed to fetch workout:`, fetchError);
      throw fetchError;
    }

    if (!workout) {
      throw new Error(`Workout not found: ${workout_id}`);
    }

    // Skip if image already exists
    if (workout.image_url) {
      console.log(`[auto-generate-workout-image] Workout ${workout_id} already has an image, skipping`);
      return new Response(
        JSON.stringify({ success: true, skipped: true, message: "Image already exists" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[auto-generate-workout-image] Generating image for: ${workout.name}`);

    // Call the generate-workout-image function
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Determine difficulty label
    let difficultyLabel = "beginner";
    if (workout.difficulty_stars > 4) difficultyLabel = "advanced";
    else if (workout.difficulty_stars > 2) difficultyLabel = "intermediate";

    // Check if this is a Pilates workout for specialized imagery
    const isPilates = workout.category?.toUpperCase() === "PILATES";
    const isRecovery = workout.category?.toUpperCase() === "RECOVERY";

    // Create category-specific visual direction
    let visualDirection: string;
    
    if (isPilates) {
      visualDirection = `
- Show a ${difficultyLabel}-level Pilates scene that captures the essence of "${workout.name}"
- Pilates-specific imagery: controlled stretching, flexibility exercises, graceful movements
- Include appropriate Pilates elements: reformer machine, Pilates mat, resistance bands, Pilates ball, or ring
- Emphasize: balance, core engagement, breathing focus, mindful movement, body alignment
- Light, airy Pilates studio setting with natural light, wooden floors, mirrors, or peaceful outdoor setting
- Peaceful, calming, mindful atmosphere - NOT intense gym energy
- Clean, soft, neutral colors (white, beige, light grey, soft pastels)
- NO heavy weights, NO cardio machines, NO intense gym equipment, NO sweaty high-intensity scenes
- Show elegant, controlled Pilates poses: planks, leg lifts, spine stretches, reformer exercises`;
    } else if (isRecovery) {
      // NOTE: Recovery workouts have NO difficulty level - suitable for everyone
      visualDirection = `
- Show a gentle recovery/regeneration scene that captures the essence of "${workout.name}"
- PRIMARY FOCUS: Stretching and flexibility - this should be the dominant visual element
- Recovery-specific imagery: deep stretching poses, breathing exercises, gentle mobility work, foam rolling
- Light aerobic elements (when shown): easy cycling, light swimming, gentle elliptical, walking outdoors, treadmill walking
- Include appropriate recovery elements: yoga mat, foam roller, stretching bands, fit ball, peaceful outdoor setting
- Emphasize: relaxation, mindful stretching, hip mobility, spinal decompression, breathing focus, regeneration
- Calm, peaceful setting: soft natural light, outdoor nature scene (park, beach, forest), or serene studio
- Show regenerative activities: static stretching (primary), CARs, cat-cow, hip openers, light movement
- Soft, calming colors (blues, greens, earth tones, soft neutrals)
- NO difficulty indicators (Recovery is for everyone, no beginner/intermediate/advanced)
- NO intense exercises, NO heavy weights, NO high-intensity scenes, NO sweaty or strenuous imagery
- Show controlled, mindful recovery poses: deep stretches, breathing, gentle mobility`;
    } else {
      visualDirection = `
- Show a dynamic ${difficultyLabel}-level fitness scene that captures the energy of "${workout.name}"
- The exercise style should visually reflect ${(workout.category || "fitness").toLowerCase()} training with ${(workout.format || "workout").toLowerCase()} workout energy
- High-energy, professional fitness photography in a gym, outdoor, or home workout setting
- Clean, vibrant colors with excellent lighting`;
    }

    const imagePrompt = `Create a professional fitness workout cover image.

CRITICAL REQUIREMENT: Generate ONLY a photograph with NO TEXT whatsoever. Absolutely NO words, NO labels, NO titles, NO overlays, NO watermarks, NO captions of any kind. Pure photography only.

Visual Direction:
${visualDirection}
- 16:9 landscape aspect ratio suitable for a cover image

Remember: ZERO text or writing of any kind on the image. Only show people exercising or fitness equipment/environments.`;

    console.log(`[auto-generate-workout-image] Calling AI gateway for image generation`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: imagePrompt,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[auto-generate-workout-image] AI gateway error:`, response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const imageBase64 = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageBase64) {
      throw new Error("No image generated from AI");
    }

    console.log(`[auto-generate-workout-image] Image generated, uploading to storage`);

    // Upload to Supabase Storage
    const fileName = `workout-${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(`workout-covers/${fileName}`, buffer, {
        contentType: "image/png",
        upsert: false,
      });

    if (uploadError) {
      console.error(`[auto-generate-workout-image] Upload error:`, uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(`workout-covers/${fileName}`);

    const imageUrl = urlData.publicUrl;
    console.log(`[auto-generate-workout-image] Image uploaded: ${imageUrl}`);

    // Update the workout with the new image URL
    const { error: updateError } = await supabase
      .from("admin_workouts")
      .update({ image_url: imageUrl })
      .eq("id", workout_id);

    if (updateError) {
      console.error(`[auto-generate-workout-image] Failed to update workout:`, updateError);
      throw updateError;
    }

    console.log(`[auto-generate-workout-image] Workout ${workout_id} updated with image`);

    // If workout has a Stripe product, sync the image
    if (workout.stripe_product_id) {
      console.log(`[auto-generate-workout-image] Syncing image to Stripe product: ${workout.stripe_product_id}`);
      
      const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
      if (stripeSecretKey) {
        try {
          const stripeResponse = await fetch(
            `https://api.stripe.com/v1/products/${workout.stripe_product_id}`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${stripeSecretKey}`,
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: `images[0]=${encodeURIComponent(imageUrl)}`,
            }
          );

          if (stripeResponse.ok) {
            console.log(`[auto-generate-workout-image] Stripe product image updated`);
          } else {
            const stripeError = await stripeResponse.text();
            console.error(`[auto-generate-workout-image] Stripe update failed:`, stripeError);
          }
        } catch (stripeErr) {
          console.error(`[auto-generate-workout-image] Stripe sync error:`, stripeErr);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        workout_id, 
        image_url: imageUrl 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[auto-generate-workout-image] Error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
