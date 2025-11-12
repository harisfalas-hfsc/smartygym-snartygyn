import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, aspectRatio } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // CRITICAL: Add strict instructions to ensure professional, usable backgrounds
    const enhancedPrompt = `You are generating a background image for a professional fitness advertisement that will be used in a business marketing campaign.

BASE REQUIREMENTS: ${prompt}

CRITICAL TECHNICAL REQUIREMENTS - FOLLOW EXACTLY:
1. ABSOLUTELY NO TEXT of any kind - no words, letters, numbers, captions, or labels
2. ABSOLUTELY NO logos, brand names, icons, or symbols  
3. ABSOLUTELY NO borders, frames, or graphic overlays
4. Generate ONLY a clean, professional photograph or graphic background
5. If people are mentioned in requirements, they MUST be clearly visible and in action
6. Lighting must be bright, professional, and high-quality
7. Colors must be vibrant, saturated, and visually appealing
8. Composition must be dynamic and eye-catching
9. Overall image must look like professional advertisement photography
10. Image quality must be ultra-high resolution and sharp

WHAT THIS IMAGE IS FOR:
- This is ONLY the background layer for an advertisement
- Text, branding, and messaging will be added by a separate system later
- The image must be visually appealing enough for professional marketing use
- Think: "Would this background make someone want to click on an ad?"

QUALITY STANDARDS:
- Professional photography studio quality
- Commercial advertisement grade
- High contrast and visual impact
- Bright, energetic, motivating atmosphere
- Sharp focus and excellent composition`;

    console.log("Generating professional ad background with enhanced prompt");

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
            content: enhancedPrompt,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received");

    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      throw new Error("No image generated");
    }

    return new Response(
      JSON.stringify({ imageUrl }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error generating ad image:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
