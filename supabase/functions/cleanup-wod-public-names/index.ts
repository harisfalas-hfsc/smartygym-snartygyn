import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RENAMES = [
  { id: "WOD-CH-B-1777242603037", oldName: "Velocity Core Cadence 0427BW", newName: "Core Tempo Circuit" },
  { id: "WOD-CA-E-1776983402663", oldName: "Kinetic Cascade 0424EQ", newName: "Cardio Tempo Circuit" },
  { id: "WOD-S-B-1776465002347", oldName: "Apex Current Pull 0418BW", newName: "Bodyweight Strength Builder" },
  { id: "WOD-CH-B-1776378603210", oldName: "Apex Current 0417BW", newName: "Bodyweight Challenge Session" },
];

async function isAdmin(req: Request, supabaseUrl: string, serviceKey: string) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return false;

  const supabase = createClient(supabaseUrl, serviceKey);
  const token = authHeader.replace("Bearer ", "");
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return false;

  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  return data?.role === "admin";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY")!;

    if (!(await isAdmin(req, supabaseUrl, serviceKey))) {
      return new Response(JSON.stringify({ error: "Admin access required" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const results = [];

    for (const item of RENAMES) {
      const { data: workout, error: fetchError } = await supabase
        .from("admin_workouts")
        .select("id, name, stripe_product_id")
        .eq("id", item.id)
        .maybeSingle();

      if (fetchError || !workout) {
        results.push({ id: item.id, status: "missing", error: fetchError?.message });
        continue;
      }

      const { error: updateError } = await supabase
        .from("admin_workouts")
        .update({ name: item.newName, updated_at: new Date().toISOString() })
        .eq("id", item.id);

      if (updateError) {
        results.push({ id: item.id, status: "db_failed", error: updateError.message });
        continue;
      }

      let stripeStatus = "no_product";
      if (workout.stripe_product_id) {
        await stripe.products.update(workout.stripe_product_id, {
          name: item.newName,
          metadata: {
            cleaned_public_name: "true",
            previous_name: item.oldName,
          },
        });
        stripeStatus = "updated";
      }

      results.push({ id: item.id, oldName: workout.name, newName: item.newName, stripeProductId: workout.stripe_product_id, stripeStatus });
    }

    const { data: remaining } = await supabase
      .from("admin_workouts")
      .select("id, name")
      .filter("name", "match", "\\s[0-9]{4}(BW|EQ|V)$");

    return new Response(JSON.stringify({ success: true, results, remaining }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
