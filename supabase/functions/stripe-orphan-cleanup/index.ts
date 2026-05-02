import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * PLAN E: Daily Stripe orphan cleanup.
 *
 * Wraps the existing `cleanup-wod-stripe-orphans` function so we can schedule
 * it on its own cron (04:00 UTC) and keep it OUT of the WOD generation
 * critical path. The orchestrator no longer calls cleanup inline.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  try {
    const resp = await fetch(`${supabaseUrl}/functions/v1/cleanup-wod-stripe-orphans`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Secret": serviceKey,
      },
      body: JSON.stringify({ dryRun: false, scope: "wod", reason: "daily-cron-04utc" }),
    });
    const text = await resp.text();
    console.log(`[stripe-orphan-cleanup] cleanup status=${resp.status} result=${text.substring(0, 500)}`);
    return new Response(text, {
      status: resp.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[stripe-orphan-cleanup] failed:", err);
    return new Response(
      JSON.stringify({ success: false, error: err?.message || String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});