import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// The actual SmartyGym logo URL from the website
const SMARTYGYM_LOGO_URL = "https://smartygym.com/smarty-gym-logo.png";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[GENERATE-FEATURE-GRAPHIC] Starting feature graphic generation with SmartyGym branding...");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch the actual SmartyGym logo
    console.log("[GENERATE-FEATURE-GRAPHIC] Fetching actual SmartyGym logo...");
    
    const logoResponse = await fetch(SMARTYGYM_LOGO_URL);
    if (!logoResponse.ok) {
      throw new Error(`Failed to fetch logo: ${logoResponse.status}`);
    }
    
    const logoBlob = await logoResponse.blob();
    const logoArrayBuffer = await logoBlob.arrayBuffer();
    
    // Safe base64 conversion for large images (avoids stack overflow)
    function arrayBufferToBase64(buffer: ArrayBuffer): string {
      const bytes = new Uint8Array(buffer);
      let binary = '';
      const chunkSize = 8192;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
        for (let j = 0; j < chunk.length; j++) {
          binary += String.fromCharCode(chunk[j]);
        }
      }
      return btoa(binary);
    }
    
    const logoBase64 = arrayBufferToBase64(logoArrayBuffer);

    // Generate feature graphic using AI with the actual logo
    console.log("[GENERATE-FEATURE-GRAPHIC] Calling Lovable AI with actual SmartyGym logo...");
    
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: [
              {
                type: "text",
                text: `Create a Google Play Store feature graphic (promotional banner) using this SmartyGym logo.

CRITICAL REQUIREMENTS:
- Exact dimensions: 1024x500 pixels (wide banner format, 2:1 aspect ratio)
- INCLUDE this exact logo prominently in the design - place it on the left or center
- Add the text "SmartyGym" next to or below the logo if not already visible
- Tagline below the name: "Your Gym Re-Imagined Anywhere, Anytime"
- Background: Professional gradient using the brand color cyan/blue (#0ea5e9) - can fade to darker blue or black
- Professional, modern, energetic fitness brand aesthetic
- Text must be clearly readable
- Use abstract fitness elements (geometric shapes, energy lines, motion effects) - NO photos of people
- Safe zone: Keep important content in the center 50% (edges may be cropped)

Create a 1024x500 feature graphic that prominently features the SmartyGym logo and brand identity.`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/png;base64,${logoBase64}`
                }
              }
            ]
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("[GENERATE-FEATURE-GRAPHIC] AI API error:", errorText);
      
      if (aiResponse.status === 429) {
        throw new Error("Rate limit exceeded. Please try again in a few minutes.");
      }
      if (aiResponse.status === 402) {
        throw new Error("AI credits required. Please add credits to continue.");
      }
      throw new Error(`AI generation failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log("[GENERATE-FEATURE-GRAPHIC] AI response received");

    const imageUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!imageUrl) {
      throw new Error("No image generated from AI");
    }

    // Extract base64 data
    const base64Match = imageUrl.match(/^data:image\/\w+;base64,(.+)$/);
    if (!base64Match) {
      throw new Error("Invalid image format from AI");
    }
    const base64Data = base64Match[1];
    const imageData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    // Upload feature graphic with timestamp to bust cache
    const timestamp = Date.now();
    const fileName = `feature-graphic-1024x500-${timestamp}.png`;
    const filePath = `graphics/${fileName}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("app-store-assets")
      .upload(filePath, imageData, {
        contentType: "image/png",
        upsert: true
      });

    if (uploadError) {
      console.error("[GENERATE-FEATURE-GRAPHIC] Upload error:", uploadError);
      throw new Error(`Failed to upload feature graphic: ${uploadError.message}`);
    }

    console.log("[GENERATE-FEATURE-GRAPHIC] Feature graphic uploaded:", uploadData.path);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("app-store-assets")
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;
    console.log("[GENERATE-FEATURE-GRAPHIC] Feature graphic URL:", publicUrl);

    // Delete existing record first, then insert fresh
    await supabase.from("app_store_assets").delete().eq("file_path", filePath);
    
    const { error: insertError } = await supabase.from("app_store_assets").insert({
      asset_type: "feature-graphic",
      platform: "android",
      file_name: fileName,
      file_path: filePath,
      width: 1024,
      height: 500,
      storage_url: publicUrl
    });

    if (insertError) {
      console.error("[GENERATE-FEATURE-GRAPHIC] Database insert error:", insertError);
      // Try upsert as fallback
      const { error: upsertError } = await supabase.from("app_store_assets").upsert({
        asset_type: "feature-graphic",
        platform: "android",
        file_name: fileName,
        file_path: filePath,
        width: 1024,
        height: 500,
        storage_url: publicUrl
      }, { onConflict: "file_path" });
      
      if (upsertError) {
        console.error("[GENERATE-FEATURE-GRAPHIC] Upsert also failed:", upsertError);
      }
    }

    console.log("[GENERATE-FEATURE-GRAPHIC] Feature graphic saved to database");
    console.log("[GENERATE-FEATURE-GRAPHIC] Feature graphic generation complete!");

    return new Response(
      JSON.stringify({
        success: true,
        featureGraphic: publicUrl,
        fileName,
        message: "Feature graphic generated with your actual SmartyGym branding!"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("[GENERATE-FEATURE-GRAPHIC] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
