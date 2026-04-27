import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const KNOWN_ORPHAN_PRODUCT_ID = "prod_UPQ1TkEbRELiWr";
const CONFIRMATION = `archive-${KNOWN_ORPHAN_PRODUCT_ID}`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    if (body.confirm !== CONFIRMATION) {
      return new Response(JSON.stringify({ error: "Invalid confirmation" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const product = await stripe.products.retrieve(KNOWN_ORPHAN_PRODUCT_ID);
    if (product.metadata?.project !== "SMARTYGYM" || product.metadata?.type !== "wod") {
      return new Response(JSON.stringify({ error: "Product metadata is not trusted WOD metadata" }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const updated = await stripe.products.update(KNOWN_ORPHAN_PRODUCT_ID, {
      active: false,
      metadata: {
        ...product.metadata,
        cleanup_reason: "known_orphan_from_failed_april_27_wod_generation_attempt",
        cleanup_source: "archive-known-wod-orphan",
        archived_at: new Date().toISOString(),
      },
    });

    return new Response(JSON.stringify({ success: true, id: updated.id, active: updated.active, name: updated.name }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
