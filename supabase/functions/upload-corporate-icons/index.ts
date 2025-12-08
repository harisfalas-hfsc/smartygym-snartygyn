import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[UPLOAD-CORPORATE-ICONS] ${step}${detailsStr}`);
};

// Corporate plan Stripe product IDs
const CORPORATE_PRODUCTS = {
  dynamic: {
    productId: "prod_TZATAcAlqgc1P7",
    name: "Smarty Dynamic",
    description: "Corporate fitness plan for teams up to 10 members. Full Platinum access for 1 year.",
  },
  power: {
    productId: "prod_TZATDsKcDvMtHc",
    name: "Smarty Power",
    description: "Corporate fitness plan for teams up to 20 members. Full Platinum access for 1 year.",
  },
  elite: {
    productId: "prod_TZATGTAsKalmCn",
    name: "Smarty Elite",
    description: "Corporate fitness plan for teams up to 30 members. Full Platinum access for 1 year.",
  },
  enterprise: {
    productId: "prod_TZATUtaS2jhgtK",
    name: "Smarty Enterprise",
    description: "Corporate fitness plan for unlimited team members. Full Platinum access for 1 year.",
  },
};

// Icon prompts used for generation - now we'll generate and upload
const ICON_PROMPTS = {
  dynamic: "Minimalist business icon, square format, gold amber border, building with 10 team people icons, corporate fitness style, clean vector",
  power: "Minimalist business icon, square format, gold amber border, building with lightning bolt and team, corporate power style, clean vector",
  elite: "Minimalist business icon, square format, gold amber border, building with crown star and many team members, elite premium style, clean vector",
  enterprise: "Minimalist business icon, square format, gold amber border, corporate skyscraper tower with globe and infinity symbol, enterprise premium style, clean vector",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Initialize clients
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) throw new Error("LOVABLE_API_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const results: Record<string, { success: boolean; imageUrl?: string; error?: string }> = {};

    // Generate and upload each icon
    for (const [planKey, plan] of Object.entries(CORPORATE_PRODUCTS)) {
      try {
        logStep(`Processing ${planKey}`);

        // Generate icon using Lovable AI
        const prompt = ICON_PROMPTS[planKey as keyof typeof ICON_PROMPTS];
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lovableKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image-preview",
            messages: [{ role: "user", content: prompt }],
            modalities: ["image", "text"],
          }),
        });

        if (!aiResponse.ok) {
          throw new Error(`AI generation failed: ${aiResponse.statusText}`);
        }

        const aiData = await aiResponse.json();
        const base64Image = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

        if (!base64Image) {
          throw new Error("No image generated");
        }

        logStep(`Image generated for ${planKey}`);

        // Convert base64 to blob
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
        const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

        // Upload to storage
        const fileName = `corporate-${planKey}-icon.png`;
        const { error: uploadError } = await supabaseClient.storage
          .from("blog-images")
          .upload(fileName, imageBytes, {
            contentType: "image/png",
            upsert: true,
          });

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        // Get public URL
        const { data: urlData } = supabaseClient.storage
          .from("blog-images")
          .getPublicUrl(fileName);

        const publicUrl = urlData.publicUrl;
        logStep(`Uploaded ${planKey}`, { url: publicUrl });

        // Update Stripe product
        await stripe.products.update(plan.productId, {
          images: [publicUrl],
          description: plan.description,
        });

        logStep(`Updated Stripe product for ${planKey}`);
        results[planKey] = { success: true, imageUrl: publicUrl };

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logStep(`Failed ${planKey}`, { error: errorMessage });
        results[planKey] = { success: false, error: errorMessage };
      }

      // Rate limit delay
      await new Promise(r => setTimeout(r, 1000));
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
