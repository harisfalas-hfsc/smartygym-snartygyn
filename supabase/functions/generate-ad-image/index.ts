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

    // CRITICAL: Structure prompt so restrictions come AFTER user requirements
    const enhancedPrompt = `You are generating a background image for a professional ONLINE FITNESS PLATFORM advertisement.

BRAND CONTEXT:
Smarty Gym is an ONLINE FITNESS PLATFORM (NOT a physical gym). Users work out AT HOME, in PARKS, or ANYWHERE using PHONES, LAPTOPS, TABLETS, or TVs. This is DIGITAL FITNESS delivered through SCREENS.

VISUAL REQUIREMENTS:
${prompt}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ CRITICAL RESTRICTIONS - OVERRIDE ALL ABOVE IF CONFLICTS EXIST ⚠️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

YOU MUST GENERATE **ONLY** A CLEAN BACKGROUND PHOTOGRAPH OR GRAPHIC.

THIS IS ONLY THE BACKGROUND LAYER. CORE BRANDING (logo, gold border, website) WILL BE ADDED LATER BY A SEPARATE SYSTEM.

ABSOLUTELY FORBIDDEN IN YOUR OUTPUT (unless explicitly requested above):
❌ NO LOGOS - never add Smarty Gym logo, brand marks, or company names
❌ NO BORDERS - never add frames, edges, or decorative borders around the image
❌ NO BRANDING ELEMENTS - never add website URLs, taglines, or brand identity elements

CONDITIONAL RULES (follow user requirements above):
⚠️ TEXT: Only add text/words if EXPLICITLY requested in the requirements section above
⚠️ GRAPHICS: Only add graphic overlays/icons if EXPLICITLY specified in requirements above

WHAT YOU MUST GENERATE:
✅ A clean, professional photograph or gradient background ONLY
✅ If people: show them training at HOME or OUTDOORS (never gyms)
✅ If devices mentioned: MUST be clearly visible (laptop, phone, tablet, TV)
✅ Bright, professional lighting with vibrant colors
✅ Commercial advertisement photography quality
✅ Sharp focus and excellent composition

REMEMBER: This is the background layer only. Our system will add:
- The Smarty Gym logo (you don't add it)
- Gold borders (you don't add them)
- All text and taglines (you don't add any text)
- Brand name and website (you don't add these)

YOUR JOB: Create ONLY a beautiful, clean background image showing the ONLINE FITNESS lifestyle.`;


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
