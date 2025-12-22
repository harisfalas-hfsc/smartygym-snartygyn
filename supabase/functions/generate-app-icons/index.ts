import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Icon sizes for iOS and Android
const ICON_SIZES = {
  ios: [
    { size: 1024, name: "ios-app-store-1024.png", use: "App Store" },
    { size: 180, name: "ios-iphone-3x-180.png", use: "iPhone @3x" },
    { size: 120, name: "ios-iphone-2x-120.png", use: "iPhone @2x" },
    { size: 167, name: "ios-ipad-pro-167.png", use: "iPad Pro" },
    { size: 152, name: "ios-ipad-2x-152.png", use: "iPad @2x" },
    { size: 76, name: "ios-ipad-1x-76.png", use: "iPad @1x" },
  ],
  android: [
    { size: 512, name: "android-play-store-512.png", use: "Play Store" },
    { size: 192, name: "android-xxxhdpi-192.png", use: "xxxhdpi" },
    { size: 144, name: "android-xxhdpi-144.png", use: "xxhdpi" },
    { size: 96, name: "android-xhdpi-96.png", use: "xhdpi" },
    { size: 72, name: "android-hdpi-72.png", use: "hdpi" },
    { size: 48, name: "android-mdpi-48.png", use: "mdpi" },
  ],
};

// The actual SmartyGym logo URL from the website
const SMARTYGYM_LOGO_URL = "https://smartygym.com/smarty-gym-logo.png";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[GENERATE-APP-ICONS] Starting icon generation using actual SmartyGym logo...");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch the actual SmartyGym logo
    console.log("[GENERATE-APP-ICONS] Fetching actual SmartyGym logo from:", SMARTYGYM_LOGO_URL);
    
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
    
    console.log("[GENERATE-APP-ICONS] Logo fetched, now generating app icon variant using AI...");

    // Use AI to create a proper app icon from the logo (with solid background, centered, etc.)
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
                text: `Take this SmartyGym logo and create a professional app store icon from it.

Requirements:
- KEEP the exact same logo design - DO NOT change it
- Center the logo on a solid cyan/blue background (#0ea5e9)
- Add appropriate padding around the logo (about 15% on each side)
- Make sure the background is completely solid (no transparency) - CRITICAL for app stores
- Output size: 1024x1024 pixels
- The logo should be clearly visible and recognizable at small sizes

Just reformat the logo as an app icon with proper background and padding. Do NOT redesign it.`
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
      console.error("[GENERATE-APP-ICONS] AI API error:", errorText);
      
      if (aiResponse.status === 429) {
        throw new Error("Rate limit exceeded. Please try again in a few minutes.");
      }
      if (aiResponse.status === 402) {
        throw new Error("AI credits required. Please add credits to continue.");
      }
      throw new Error(`AI generation failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log("[GENERATE-APP-ICONS] AI response received");

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
    const masterImageData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    // Upload master icon
    const masterFileName = `master-icon-1024.png`;
    const masterFilePath = `icons/${masterFileName}`;
    
    const { data: masterUpload, error: masterError } = await supabase.storage
      .from("app-store-assets")
      .upload(masterFilePath, masterImageData, {
        contentType: "image/png",
        upsert: true
      });

    if (masterError) {
      console.error("[GENERATE-APP-ICONS] Master upload error:", masterError);
      throw new Error(`Failed to upload master icon: ${masterError.message}`);
    }

    console.log("[GENERATE-APP-ICONS] Master icon uploaded:", masterUpload.path);

    // Get master icon public URL
    const { data: masterUrlData } = supabase.storage
      .from("app-store-assets")
      .getPublicUrl(masterFilePath);

    const masterUrl = masterUrlData.publicUrl;
    console.log("[GENERATE-APP-ICONS] Master icon URL:", masterUrl);

    // Delete existing master icon record first, then insert fresh
    await supabase.from("app_store_assets").delete().eq("file_path", masterFilePath);
    
    const { error: insertError } = await supabase.from("app_store_assets").insert({
      asset_type: "icon",
      platform: "both",
      file_name: masterFileName,
      file_path: masterFilePath,
      width: 1024,
      height: 1024,
      storage_url: masterUrl
    });

    if (insertError) {
      console.error("[GENERATE-APP-ICONS] Database insert error:", insertError);
      // Try upsert as fallback
      const { error: upsertError } = await supabase.from("app_store_assets").upsert({
        asset_type: "icon",
        platform: "both",
        file_name: masterFileName,
        file_path: masterFilePath,
        width: 1024,
        height: 1024,
        storage_url: masterUrl
      }, { onConflict: "file_path" });
      
      if (upsertError) {
        console.error("[GENERATE-APP-ICONS] Upsert also failed:", upsertError);
      }
    }

    console.log("[GENERATE-APP-ICONS] Master icon saved to database");

    // For resizing, we'll store the master and note that external tools can resize
    const generatedAssets = [
      {
        platform: "both",
        size: 1024,
        name: masterFileName,
        url: masterUrl,
        use: "Master Icon (use appicon.co to generate all sizes)"
      }
    ];

    console.log("[GENERATE-APP-ICONS] Icon generation complete!");

    return new Response(
      JSON.stringify({
        success: true,
        masterIcon: masterUrl,
        generatedAssets,
        message: "Master icon generated from your actual SmartyGym logo! Download it and use appicon.co to generate all required sizes.",
        requiredSizes: {
          ios: ICON_SIZES.ios,
          android: ICON_SIZES.android
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("[GENERATE-APP-ICONS] Error:", error);
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
