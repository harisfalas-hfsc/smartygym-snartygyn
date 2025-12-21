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
    const { name, category, format, difficulty_stars } = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all existing images to ensure uniqueness
    const { data: existingWorkouts } = await supabase
      .from("admin_workouts")
      .select("image_url, name")
      .not("image_url", "is", null);

    const { data: existingPrograms } = await supabase
      .from("admin_training_programs")
      .select("image_url, name")
      .not("image_url", "is", null);

    const existingImagePrompts = [
      ...(existingWorkouts || []).map(w => w.name),
      ...(existingPrograms || []).map(p => p.name),
    ];

    // Build difficulty label
    let difficultyLabel = "beginner";
    if (difficulty_stars > 4) difficultyLabel = "advanced";
    else if (difficulty_stars > 2) difficultyLabel = "intermediate";

    // Check if this is a Pilates workout for specialized imagery
    const isPilates = category?.toUpperCase() === "PILATES";

    // Create category-specific visual direction
    let visualDirection: string;
    
    if (isPilates) {
      // Pilates-specific imagery: stretching, flexibility, reformer, mat, balance, breathing
      visualDirection = `
- Show a ${difficultyLabel}-level Pilates scene that captures the essence of "${name}"
- Pilates-specific imagery: controlled stretching, flexibility exercises, graceful movements
- Include appropriate Pilates elements: reformer machine, Pilates mat, resistance bands, Pilates ball, or ring
- Emphasize: balance, core engagement, breathing focus, mindful movement, body alignment
- Light, airy Pilates studio setting with natural light, wooden floors, mirrors, or peaceful outdoor setting
- Peaceful, calming, mindful atmosphere - NOT intense gym energy
- Clean, soft, neutral colors (white, beige, light grey, soft pastels)
- NO heavy weights, NO cardio machines, NO intense gym equipment, NO sweaty high-intensity scenes
- Show elegant, controlled Pilates poses: planks, leg lifts, spine stretches, reformer exercises`;
    } else {
      // Standard fitness imagery for other categories
      visualDirection = `
- Show a dynamic ${difficultyLabel}-level fitness scene that captures the energy of "${name}"
- The exercise style should visually reflect ${category.toLowerCase()} training with ${format.toLowerCase()} workout energy
- High-energy, professional fitness photography in a gym, outdoor, or home workout setting
- Clean, vibrant colors with excellent lighting`;
    }

    // Create a prompt that prevents text overlays - NO metadata as key:value pairs
    const imagePrompt = `Create a professional fitness workout cover image.

CRITICAL REQUIREMENT: Generate ONLY a photograph with NO TEXT whatsoever. Absolutely NO words, NO labels, NO titles, NO overlays, NO watermarks, NO captions of any kind. Pure photography only.

Visual Direction:
${visualDirection}
- 16:9 landscape aspect ratio suitable for a cover image
- Completely unique composition, different from: ${existingImagePrompts.slice(0, 10).join(", ")}

Remember: ZERO text or writing of any kind on the image. Only show people exercising or fitness equipment/environments.`;

    console.log("Generating image with prompt:", imagePrompt);

    // Generate image using Lovable AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

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
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const imageBase64 = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageBase64) {
      throw new Error("No image generated");
    }

    // Upload to Supabase Storage
    const fileName = `workout-${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(`workout-covers/${fileName}`, buffer, {
        contentType: "image/png",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(`workout-covers/${fileName}`);

    console.log("Image generated and uploaded successfully:", urlData.publicUrl);

    return new Response(
      JSON.stringify({ image_url: urlData.publicUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating workout image:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
