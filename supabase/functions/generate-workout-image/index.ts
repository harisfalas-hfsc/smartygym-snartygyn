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

    // Create category-specific visual direction based on workout type
    const categoryUpper = category?.toUpperCase() || "";
    let visualDirection: string;
    
    if (categoryUpper === "PILATES") {
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
    } else if (categoryUpper === "STRENGTH") {
      visualDirection = `
- Show a ${difficultyLabel}-level strength training scene that captures the power of "${name}"
- Strength-specific imagery: weightlifting, dumbbells, barbells, weight plates, resistance machines
- Muscle building exercises: squats, deadlifts, bench press, rows, curls, overhead press
- Professional gym setting with weight racks, mirrors, lifting platforms, iron weights
- Strong, powerful poses showing muscle engagement and proper lifting form
- Bold, intense atmosphere with focused determination
- NO running, NO cardio machines, NO jumping exercises, NO treadmills, NO cycling`;
    } else if (categoryUpper === "CARDIO") {
      visualDirection = `
- Show a ${difficultyLabel}-level cardio scene that captures the energy of "${name}"
- Cardio-specific imagery: running, jumping, cycling, rowing, high-intensity movement
- Cardio equipment: treadmill, elliptical, rowing machine, jump rope, stationary bike, stair climber
- Outdoor running trails, track, or bright modern cardio studio setting
- Dynamic movement showing elevated heart rate activities, motion blur effect
- Energetic, fast-paced, heart-pumping atmosphere
- NO heavy weights, NO barbells, NO static poses, NO slow controlled movements`;
    } else if (categoryUpper === "CALORIE BURNING") {
      visualDirection = `
- Show a ${difficultyLabel}-level calorie burning scene that captures the intensity of "${name}"
- High-intensity activities: burpees, jumping jacks, mountain climbers, box jumps, kettlebell swings
- Sweating, fat-burning exercises, explosive full-body movements
- Mix of bodyweight exercises and light functional equipment
- Energetic, fast-paced workout atmosphere with visible effort and sweat
- Bright, motivating gym or outdoor bootcamp setting
- NO rest poses, NO static stretching, NO slow movements, NO meditation`;
    } else if (categoryUpper === "METABOLIC") {
      visualDirection = `
- Show a ${difficultyLabel}-level metabolic conditioning scene that captures the intensity of "${name}"
- Circuit training imagery: kettlebells, battle ropes, medicine balls, compound movements
- Functional fitness equipment: kettlebells, sandbags, TRX suspension, sleds, tires
- CrossFit-style gym or functional training area with raw industrial aesthetic
- Multi-joint exercises, metabolic conditioning, functional fitness
- Mix of strength and cardio elements in the same scene
- Intense, gritty, athletic atmosphere
- NO isolated exercises, NO machines, NO calm relaxed poses`;
    } else if (categoryUpper === "MOBILITY & STABILITY" || categoryUpper === "MOBILITY" || categoryUpper === "STABILITY") {
      visualDirection = `
- Show a ${difficultyLabel}-level mobility and stability scene that captures the focus of "${name}"
- Stretching, flexibility work, foam rolling, balance exercises, joint mobility
- Equipment: yoga mats, foam rollers, stability balls, resistance bands, balance boards
- Calm, focused atmosphere with soft natural lighting
- Joint mobility work, muscle lengthening, balance poses, controlled movements
- Peaceful yoga studio or wellness center setting
- NO heavy weights, NO intense cardio, NO high-impact jumping, NO sweating`;
    } else if (categoryUpper === "CHALLENGE") {
      visualDirection = `
- Show a ${difficultyLabel}-level challenge workout scene that captures the extreme intensity of "${name}"
- Intense, demanding athletic exercises at peak performance
- Advanced movements: muscle-ups, handstand walks, heavy Olympic lifts, athletic feats
- Competition-style or elite athletic training environment
- Impressive feats of strength, endurance, speed, or skill
- High difficulty, elite fitness imagery with dramatic lighting
- Gritty, powerful, champion athlete atmosphere
- NO beginner exercises, NO simple movements, NO relaxed poses`;
    } else {
      // Default fallback for any other categories
      visualDirection = `
- Show a dynamic ${difficultyLabel}-level fitness scene that captures the energy of "${name}"
- The exercise style should visually reflect ${category?.toLowerCase() || 'general fitness'} training with ${format?.toLowerCase() || 'structured'} workout energy
- High-energy, professional fitness photography in a gym, outdoor, or home workout setting
- Clean, vibrant colors with excellent lighting
- Athletic, motivating atmosphere appropriate for the workout type`;
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
