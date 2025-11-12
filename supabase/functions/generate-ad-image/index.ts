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
    const enhancedPrompt = `You are generating a background image for a professional ONLINE FITNESS PLATFORM advertisement that will be used in a business marketing campaign.

CRITICAL BRAND CONTEXT - UNDERSTAND THIS FIRST:
- Smarty Gym is an ONLINE FITNESS PLATFORM, NOT a physical gym
- Users work out AT HOME, in PARKS, or ANYWHERE they choose
- Users access workouts through PHONES, LAPTOPS, TABLETS, or TVs
- This is DIGITAL FITNESS - workouts are delivered through SCREENS and DEVICES
- The platform brings expert training to users wherever they are
- This is about FREEDOM, FLEXIBILITY, and DIGITAL ACCESS to fitness

BASE REQUIREMENTS: ${prompt}

CRITICAL VISUAL REQUIREMENTS - FOLLOW EXACTLY:
1. ABSOLUTELY NO TEXT of any kind - no words, letters, numbers, captions, or labels
2. ABSOLUTELY NO logos, brand names, icons, or symbols  
3. ABSOLUTELY NO borders, frames, or graphic overlays
4. Generate ONLY a clean, professional photograph or graphic background
5. If people are shown, they MUST be training in HOME or OUTDOOR environments (never commercial gyms)
6. If devices are mentioned, they MUST be clearly visible (laptop, phone, tablet, TV screen)
7. Show the DIGITAL FITNESS lifestyle - people using technology to train anywhere
8. Lighting must be bright, natural, and professional
9. Colors must be vibrant, saturated, and visually appealing
10. Composition must show the convenience and accessibility of online fitness

ENVIRONMENT GUIDELINES:
- HOME settings: living rooms, home workout spaces, bedrooms with laptops/tablets/TVs visible
- OUTDOOR settings: parks, beaches, nature with mobile phones/devices
- NEVER show: commercial gym equipment, gym interiors, fitness studios
- ALWAYS emphasize: personal space, digital devices, train-anywhere freedom

WHAT THIS IMAGE IS FOR:
- Background layer for an ONLINE FITNESS PLATFORM advertisement
- Must convey digital fitness, home training, mobile accessibility
- Text, branding, and messaging will be added by a separate system later
- Must be visually appealing for professional digital marketing
- Think: "This shows people can train anywhere with online fitness"

QUALITY STANDARDS:
- Professional photography studio quality
- Commercial advertisement grade for digital fitness marketing
- High contrast and visual impact
- Bright, energetic, accessible atmosphere
- Sharp focus and excellent composition
- Clearly communicates ONLINE/DIGITAL fitness concept`;

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
