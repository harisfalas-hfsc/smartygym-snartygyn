import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Backup WOD Generation — VERIFY-ONLY safety net (CHAIN FIX).
 *
 * Per the locked-in rules:
 *   - NEVER regenerates automatically.
 *   - NEVER pulls from the library (library mode is admin-only).
 *   - Calls the orchestrator in verify-only mode. If anything is missing
 *     for today's Cyprus date, the orchestrator sends an admin alert.
 *
 * The owner manually publishes from the library via the admin panel
 * after receiving the alert.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  console.log("[BACKUP-WOD] Triggering orchestrator in verify-only mode");

  try {
    const resp = await fetch(`${supabaseUrl}/functions/v1/wod-generation-orchestrator`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${anonKey}` },
      body: JSON.stringify({ mode: "verify", triggerSource: "backup" }),
    });
    const text = await resp.text();
    console.log(`[BACKUP-WOD] Orchestrator verify response ${resp.status}: ${text.substring(0, 300)}`);

    return new Response(text, {
      status: resp.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[BACKUP-WOD] Failed to call orchestrator:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});