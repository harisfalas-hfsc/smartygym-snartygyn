import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// The actual SmartyGym logo URL from the website
const SMARTYGYM_LOGO_URL = "https://smartygym.com/smarty-gym-logo.png";

// Icon sizes needed for iOS and Android (for reference)
const ICON_SIZES = {
  ios: [
    { size: 1024, name: "icon-1024" },
  ],
  android: [
    { size: 512, name: "icon-512" },
  ]
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[GENERATE-APP-ICONS] Starting app icon upload (using actual logo - NO AI)...");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch the actual SmartyGym logo directly - NO AI modification
    console.log("[GENERATE-APP-ICONS] Fetching actual SmartyGym logo from:", SMARTYGYM_LOGO_URL);
    
    const logoResponse = await fetch(SMARTYGYM_LOGO_URL);
    if (!logoResponse.ok) {
      throw new Error(`Failed to fetch logo: ${logoResponse.status}`);
    }
    
    const logoBlob = await logoResponse.blob();
    const logoArrayBuffer = await logoBlob.arrayBuffer();
    const logoData = new Uint8Array(logoArrayBuffer);
    
    console.log("[GENERATE-APP-ICONS] Logo fetched successfully, size:", logoData.length, "bytes");

    // Upload the actual logo directly as the master icon - NO AI, NO modifications
    const timestamp = Date.now();
    const masterFileName = `master-icon-1024-${timestamp}.png`;
    const masterFilePath = `icons/${masterFileName}`;
    
    const { data: masterUpload, error: masterError } = await supabase.storage
      .from("app-store-assets")
      .upload(masterFilePath, logoData, {
        contentType: "image/png",
        upsert: true
      });

    if (masterError) {
      console.error("[GENERATE-APP-ICONS] Upload error:", masterError);
      throw new Error(`Failed to upload master icon: ${masterError.message}`);
    }

    console.log("[GENERATE-APP-ICONS] Master icon uploaded:", masterUpload.path);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("app-store-assets")
      .getPublicUrl(masterFilePath);

    const masterIconUrl = urlData.publicUrl;
    console.log("[GENERATE-APP-ICONS] Master icon URL:", masterIconUrl);

    // Delete existing record first, then insert fresh
    await supabase.from("app_store_assets").delete().eq("file_path", masterFilePath);
    
    const { error: insertError } = await supabase.from("app_store_assets").insert({
      asset_type: "master-icon",
      platform: "all",
      file_name: masterFileName,
      file_path: masterFilePath,
      width: 1024,
      height: 1024,
      storage_url: masterIconUrl
    });

    if (insertError) {
      console.error("[GENERATE-APP-ICONS] Database insert error:", insertError);
      // Try upsert as fallback
      const { error: upsertError } = await supabase.from("app_store_assets").upsert({
        asset_type: "master-icon",
        platform: "all",
        file_name: masterFileName,
        file_path: masterFilePath,
        width: 1024,
        height: 1024,
        storage_url: masterIconUrl
      }, { onConflict: "file_path" });
      
      if (upsertError) {
        console.error("[GENERATE-APP-ICONS] Upsert also failed:", upsertError);
      }
    }

    console.log("[GENERATE-APP-ICONS] Master icon saved to database");
    console.log("[GENERATE-APP-ICONS] App icon upload complete!");

    return new Response(
      JSON.stringify({
        success: true,
        masterIcon: masterIconUrl,
        iconSizes: ICON_SIZES,
        message: "Your actual SmartyGym logo has been uploaded as the app icon. Use appicon.co to resize for different platforms."
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
