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
    const { name, category, difficulty_stars, weeks } = await req.json();

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
    let difficultyLabel = "Beginner";
    if (difficulty_stars > 4) difficultyLabel = "Advanced";
    else if (difficulty_stars > 2) difficultyLabel = "Intermediate";

    // Create a detailed prompt for image generation
    const imagePrompt = `Create a professional fitness training program cover image for "${name}". 
Style: Modern, inspiring, and motivating fitness photography showing progression and dedication.
Category: ${category}
Duration: ${weeks} weeks
Difficulty: ${difficultyLabel}
Requirements:
- High-quality, inspirational composition showing fitness journey/transformation
- Professional fitness or gym setting
- Clean, vibrant, energetic colors
- No text or watermarks
- Focus on the type of training related to ${category}
- Should look completely unique and different from these existing programs and workouts: ${existingImagePrompts.slice(0, 10).join(", ")}
- Convey a sense of structured program and long-term commitment
Aspect ratio: 16:9 landscape format suitable for a training program cover image.`;

    console.log("Generating program image with prompt:", imagePrompt);

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
    const fileName = `program-${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(`program-covers/${fileName}`, buffer, {
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
      .getPublicUrl(`program-covers/${fileName}`);

    console.log("Program image generated and uploaded successfully:", urlData.publicUrl);

    return new Response(
      JSON.stringify({ image_url: urlData.publicUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating program image:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
