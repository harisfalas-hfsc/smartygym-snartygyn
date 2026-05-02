import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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