import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { cyprusToday, getDayIn84Cycle, getPeriodizationForDay } from "../_shared/wod/schedule.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Watchdog WOD Check — slot-aware safety net (PLAN 2).
 *
 * Detects which of today's WOD slots are missing for the Cyprus day and
 * triggers `generate-workout-of-day` ONCE per missing slot in background mode.
 * Never silently switches to library mode. Each missing slot is regenerated
 * fresh by AI; if generation legitimately fails, the failure surfaces in
 * `wod_generation_runs` and the existing alert system handles it.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const today = cyprusToday();
  const dayIn84 = getDayIn84Cycle(today);
  const periodization = getPeriodizationForDay(dayIn84);
  const isRecoveryDay = periodization.category === "RECOVERY";
  const expectedSlots = isRecoveryDay
    ? ["VARIOUS"]
    : ["BODYWEIGHT", "EQUIPMENT"];

  console.log(`[WATCHDOG] Cyprus today=${today}, recovery=${isRecoveryDay}, expected slots=${expectedSlots.join(",")}`);

  try {
    const { data: existing, error } = await supabase
      .from("admin_workouts")
      .select("id, equipment, main_workout")
      .eq("generated_for_date", today)
      .eq("is_workout_of_day", true);

    if (error) {
      console.error("[WATCHDOG] DB query failed:", error);
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const presentSlots = new Set((existing || []).map((w: any) => w.equipment));
    const missingSlots = expectedSlots.filter((s) => !presentSlots.has(s));

    if (missingSlots.length === 0) {
      console.log("[WATCHDOG] ✅ All expected slots present, nothing to do");
      return new Response(
        JSON.stringify({ success: true, message: "all slots present", today, present: [...presentSlots] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[WATCHDOG] Missing slots: ${missingSlots.join(",")} — triggering targeted regeneration`);

    const results: any[] = [];
    for (const slot of missingSlots) {
      try {
        const resp = await fetch(`${supabaseUrl}/functions/v1/generate-workout-of-day`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${anonKey}` },
          body: JSON.stringify({
            slot,
            triggerSource: "watchdog",
            retryMissing: true,
            background: true,
          }),
        });
        const text = await resp.text();
        console.log(`[WATCHDOG] slot=${slot} response ${resp.status}: ${text.substring(0, 200)}`);
        results.push({ slot, status: resp.status, ok: resp.ok });
      } catch (e: any) {
        console.error(`[WATCHDOG] slot=${slot} invocation failed:`, e);
        results.push({ slot, ok: false, error: e?.message || String(e) });
      }
    }

    return new Response(
      JSON.stringify({ success: true, today, missingSlots, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[WATCHDOG] Unexpected error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});