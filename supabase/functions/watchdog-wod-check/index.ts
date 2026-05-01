import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Watchdog WOD Check — thin wrapper.
 *
 * Runs at 03:05 Cyprus time (cron: 5 1 * * * UTC), 5 minutes after backup,
 * as the FINAL safety net. Delegates ALL verification / retry / library
 * fallback / email / run-log logic to `wod-generation-orchestrator`, which
 * short-circuits when today's WODs already exist (the common case).
 *
 * Why keep this wrapper instead of relying only on the backup run?
 * If the orchestrator process itself crashed mid-run (timeout, edge restart)
 * and never wrote a "failed" status, this independent verification 5 minutes
 * later catches it. Single source of truth lives in the orchestrator.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("[WATCHDOG] Delegating to wod-generation-orchestrator (triggerSource=watchdog)");

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/wod-generation-orchestrator`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ triggerSource: "watchdog" }),
    });

    const text = await response.text();
    console.log(`[WATCHDOG] Orchestrator response ${response.status}: ${text.substring(0, 300)}`);

    return new Response(text, {
      status: response.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[WATCHDOG] Failed to invoke orchestrator:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});