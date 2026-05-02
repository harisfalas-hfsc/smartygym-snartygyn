import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Watchdog WOD Check — VERIFY-ONLY safety net (CHAIN FIX).
 *
 * Identical behaviour to backup-wod-generation: calls the orchestrator
 * in verify-only mode. Never regenerates, never pulls from library.
 * Sends an admin alert if today's expected slots are missing.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // PLAN B+E asset re-kick: if any of today's WODs are missing image_url or
  // Stripe IDs, re-fire the background linker / image generator. Skip the
  // re-kick within the first 10 minutes after creation so the initial
  // background job has a chance to finish first.
  try {
    const supabase = createClient(supabaseUrl, serviceKey);
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data: pending } = await supabase
      .from("admin_workouts")
      .select("id, image_url, stripe_product_id, stripe_price_id, created_at")
      .eq("is_workout_of_day", true)
      .eq("is_visible", true)
      .lt("created_at", tenMinAgo);

    for (const w of pending || []) {
      if (!w.stripe_product_id || !w.stripe_price_id) {
        console.log(`[WATCHDOG] re-kick wod-stripe-link for ${w.id}`);
        fetch(`${supabaseUrl}/functions/v1/wod-stripe-link`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${serviceKey}` },
          body: JSON.stringify({ workout_id: w.id }),
        }).catch((e) => console.error("[WATCHDOG] linker re-kick failed", e));
      }
      if (!w.image_url) {
        console.log(`[WATCHDOG] re-kick auto-generate-workout-image for ${w.id}`);
        fetch(`${supabaseUrl}/functions/v1/auto-generate-workout-image`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${serviceKey}` },
          body: JSON.stringify({ workout_id: w.id }),
        }).catch((e) => console.error("[WATCHDOG] image re-kick failed", e));
      }
    }
  } catch (assetErr) {
    console.error("[WATCHDOG] asset re-kick scan failed", assetErr);
  }

  console.log("[WATCHDOG] Triggering orchestrator in verify-only mode");

  try {
    const resp = await fetch(`${supabaseUrl}/functions/v1/wod-generation-orchestrator`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${anonKey}` },
      body: JSON.stringify({ mode: "verify", triggerSource: "watchdog" }),
    });
    const text = await resp.text();
    console.log(`[WATCHDOG] Orchestrator verify response ${resp.status}: ${text.substring(0, 300)}`);

    return new Response(text, {
      status: resp.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[WATCHDOG] Failed to call orchestrator:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});