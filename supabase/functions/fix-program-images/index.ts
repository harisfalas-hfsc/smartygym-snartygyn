import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function logStep(step: string, details?: any) {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[FIX-PROGRAM-IMAGES] ${step}${detailsStr}`);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting program image fix");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");

    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not configured");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Fetch all programs with stripe_product_id that have invalid image URLs (not starting with http)
    const { data: programs, error: programsError } = await supabase
      .from("admin_training_programs")
      .select("*")
      .not("stripe_product_id", "is", null);

    if (programsError) {
      throw new Error(`Failed to fetch programs: ${programsError.message}`);
    }

    // Filter programs with invalid image URLs
    const programsToFix = programs?.filter(p => 
      !p.image_url || !p.image_url.startsWith("http")
    ) || [];

    logStep("Programs to fix", { count: programsToFix.length });

    const results = {
      total: programsToFix.length,
      success: 0,
      failed: 0,
      details: [] as { name: string; status: string; imageUrl?: string; error?: string }[]
    };

    for (const program of programsToFix) {
      logStep(`Processing: ${program.name}`);
      
      try {
        // Generate new image
        const imageResponse = await fetch(`${supabaseUrl}/functions/v1/generate-program-image`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${supabaseServiceKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: program.name,
            category: program.category,
            difficulty_stars: program.difficulty_stars || 3,
            weeks: program.weeks || 6
          }),
        });

        if (!imageResponse.ok) {
          const errorText = await imageResponse.text();
          throw new Error(`Image generation failed: ${errorText}`);
        }

        const imageData = await imageResponse.json();
        const newImageUrl = imageData.imageUrl || imageData.image_url;

        if (!newImageUrl) {
          throw new Error("No image URL returned from generation");
        }

        logStep(`Image generated for ${program.name}`, { url: newImageUrl.substring(0, 60) + "..." });

        // Update database
        const { error: updateError } = await supabase
          .from("admin_training_programs")
          .update({ image_url: newImageUrl })
          .eq("id", program.id);

        if (updateError) {
          throw new Error(`Database update failed: ${updateError.message}`);
        }

        // Update Stripe product
        await stripe.products.update(program.stripe_product_id, {
          images: [newImageUrl]
        });

        logStep(`Stripe product updated for ${program.name}`);

        results.success++;
        results.details.push({
          name: program.name,
          status: "success",
          imageUrl: newImageUrl.substring(0, 60) + "..."
        });

        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 1000));

      } catch (error: any) {
        logStep(`Failed: ${program.name}`, { error: error.message });
        results.failed++;
        results.details.push({
          name: program.name,
          status: "failed",
          error: error.message
        });
      }
    }

    logStep("Fix complete", { success: results.success, failed: results.failed });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Fixed ${results.success}/${results.total} program images`,
        results
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
