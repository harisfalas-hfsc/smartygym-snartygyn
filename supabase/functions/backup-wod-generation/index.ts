import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Backup WOD Generation — thin wrapper.
 *
 * Runs at 03:00 Cyprus time (cron: 0 1 * * * UTC) as a safety net hours after
 * the primary 00:30 generation. Delegates ALL retry / verification / library
 * fallback / email / run-log logic to `wod-generation-orchestrator`, which
 * short-circuits when today's WODs already exist.
 *
 * Why keep this wrapper instead of relying only on the 00:30 orchestrator run?
 * If the AI provider, network, or edge runtime was unhealthy at 00:30, this
 * gives the system a second chance hours later. DB history shows this has
 * actually rescued WODs multiple times. We keep the safety net but no longer
 * duplicate the recovery code.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("[BACKUP-WOD] Delegating to wod-generation-orchestrator (triggerSource=backup)");

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/wod-generation-orchestrator`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ triggerSource: "backup" }),
    });

    const text = await response.text();
    console.log(`[BACKUP-WOD] Orchestrator response ${response.status}: ${text.substring(0, 300)}`);

    return new Response(text, {
      status: response.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[BACKUP-WOD] Failed to invoke orchestrator:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});