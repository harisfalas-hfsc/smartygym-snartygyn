import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
    apiVersion: "2025-08-27.basil" as any,
  });

  const { data: rows, error } = await supabase
    .from("admin_workouts")
    .select("id,name,image_url,stripe_product_id")
    .eq("category", "MICRO-WORKOUTS")
    .order("id");

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const results: any[] = [];
  let mismatches = 0;
  let fixed = 0;

  for (const w of rows ?? []) {
    if (!w.stripe_product_id) {
      results.push({ id: w.id, name: w.name, status: "no_stripe_product" });
      continue;
    }
    let product = await stripe.products.retrieve(w.stripe_product_id);
    let stripe_image = product.images?.[0] ?? null;
    let match = stripe_image === w.image_url;

    if (!match && w.image_url) {
      await stripe.products.update(w.stripe_product_id, { images: [w.image_url] });
      product = await stripe.products.retrieve(w.stripe_product_id);
      stripe_image = product.images?.[0] ?? null;
      match = stripe_image === w.image_url;
      if (match) fixed++;
    }

    if (!match) mismatches++;
    results.push({
      id: w.id,
      name: w.name,
      match,
      db_image: w.image_url,
      stripe_image,
    });
  }

  return new Response(
    JSON.stringify({ total: results.length, mismatches, fixed, results }, null, 2),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});