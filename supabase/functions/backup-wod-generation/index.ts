import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Backup WOD Generation — fast safety wrapper.
 *
 * Runs at 03:00 Cyprus time. It must NOT call the long AI orchestrator from
 * inside another function: that nested path can exceed the hosted function idle
 * timeout and leave WOD run logs stuck as `running`. The backup safety net uses
 * the validated library selector directly; that selector short-circuits when
 * today's WODs already exist.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("[BACKUP-WOD] Delegating to select-wod-from-library (fast fallback)");

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/select-wod-from-library`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ triggerSource: "backup" }),
    });

    const text = await response.text();
    console.log(`[BACKUP-WOD] Library fallback response ${response.status}: ${text.substring(0, 300)}`);

    return new Response(text, {
      status: response.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[BACKUP-WOD] Failed to invoke library fallback:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});