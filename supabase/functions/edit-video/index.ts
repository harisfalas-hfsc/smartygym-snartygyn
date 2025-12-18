import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoId, instructions } = await req.json();

    if (!videoId || !instructions) {
      throw new Error("videoId and instructions are required");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the current video
    const { data: currentVideo, error: fetchError } = await supabase
      .from("promotional_videos")
      .select("*")
      .eq("id", videoId)
      .single();

    if (fetchError) throw fetchError;

    // If no component_code stored, we need to fetch the default SampleVideo code
    let currentCode = currentVideo.component_code;
    
    if (!currentCode) {
      // Use a reference to the SampleVideo component structure
      currentCode = `// SampleVideo component - Reference structure
// This is a promotional video with 8 scenes:
// Scene 1: Logo intro with gradient background
// Scene 2: Tagline "Your Gym Re-imagined. Anywhere, Anytime."
// Scene 3: AI Trainer feature
// Scene 4: Weekly Smart Menu feature
// Scene 5: Quick category cards (Strength, Cardio, Mobility, HIIT)
// Scene 6: "Train Smarter" reveal animation
// Scene 7: Logo and website URL
// Scene 8: Outro

// Key customizable elements:
// - Tagline text (Scene 2)
// - Feature descriptions (Scenes 3-4)
// - Category cards (Scene 5)
// - Final message (Scene 6)
// - Website URL (Scene 7)
// - Animation timings
// - Colors and gradients`;
    }

    // Call Lovable AI to modify the video
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an AI assistant that helps modify promotional video configurations for a fitness app called SmartyGym.

The video has these customizable scenes:
1. Logo intro with animated gradient background
2. Main tagline (currently: "Your Gym Re-imagined. Anywhere, Anytime.")
3. AI Trainer feature highlight
4. Weekly Smart Menu feature highlight
5. Quick category cards: Strength, Cardio, Mobility, HIIT
6. "Train Smarter" text reveal animation
7. Logo and website URL display
8. Outro animation

When the user requests changes, respond with a JSON object containing the modifications:
{
  "changes": {
    "tagline": "new tagline text if changed",
    "categories": ["array", "of", "category", "names"] if changed,
    "finalMessage": "new final message if changed",
    "websiteUrl": "new URL if changed",
    "features": {
      "aiTrainer": { "title": "...", "description": "..." },
      "weeklyMenu": { "title": "...", "description": "..." }
    },
    "timings": {
      "logoIntro": 2000,
      "tagline": 3000,
      ...
    }
  },
  "summary": "Brief description of what was changed"
}

Only include fields that were actually changed. If a change doesn't make sense, explain why in the summary.`,
          },
          {
            role: "user",
            content: `Current video configuration:\n${currentCode}\n\nUser's edit request: ${instructions}\n\nPlease provide the modifications as a JSON object.`,
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      throw new Error("Failed to process edit request with AI");
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error("No response from AI");
    }

    // Parse the AI response to extract changes
    let changes;
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        changes = JSON.parse(jsonMatch[0]);
      } else {
        changes = { summary: aiContent };
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      changes = { summary: aiContent };
    }

    // Create new version with the modifications
    const newVersion = currentVideo.version + 1;
    const newComponentCode = JSON.stringify(changes, null, 2);

    // Mark current version as not current
    await supabase
      .from("promotional_videos")
      .update({ is_current: false })
      .eq("id", videoId);

    // Insert new version
    const { data: newVideo, error: insertError } = await supabase
      .from("promotional_videos")
      .insert({
        name: `${currentVideo.name} v${newVersion}`,
        description: changes.summary || currentVideo.description,
        duration: currentVideo.duration,
        component_name: currentVideo.component_name,
        component_code: newComponentCode,
        video_url: null, // New version needs to be re-recorded
        version: newVersion,
        parent_version_id: videoId,
        is_current: true,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    console.log("Video edited successfully:", newVideo.id);

    return new Response(
      JSON.stringify({
        success: true,
        video: newVideo,
        changes: changes,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in edit-video function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "An error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
