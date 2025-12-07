import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, fileName, stripeProductId } = await req.json();
    
    if (!imageBase64 || !fileName) {
      throw new Error("imageBase64 and fileName are required");
    }

    console.log("[UPLOAD-RITUAL-IMAGE] Starting upload for:", fileName);

    // Decode base64 to binary
    const imageData = Uint8Array.from(atob(imageBase64), c => c.charCodeAt(0));
    
    // Create Supabase client with service role key for storage access
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("ritual-images")
      .upload(fileName, imageData, {
        contentType: "image/jpeg",
        upsert: true
      });

    if (uploadError) {
      console.error("[UPLOAD-RITUAL-IMAGE] Upload error:", uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    console.log("[UPLOAD-RITUAL-IMAGE] Upload successful:", uploadData.path);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("ritual-images")
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;
    console.log("[UPLOAD-RITUAL-IMAGE] Public URL:", publicUrl);

    // Update Stripe product if ID provided
    if (stripeProductId) {
      const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
        apiVersion: "2025-08-27.basil",
      });

      await stripe.products.update(stripeProductId, {
        images: [publicUrl]
      });
      console.log("[UPLOAD-RITUAL-IMAGE] Stripe product updated:", stripeProductId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        publicUrl,
        path: uploadData.path
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("[UPLOAD-RITUAL-IMAGE] Error:", error);
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
