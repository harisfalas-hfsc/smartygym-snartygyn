import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Watchdog WOD Check — LIBRARY MODE.
 *
 * AI generation has been removed entirely. This watchdog now:
 *  1. Verifies today's WOD slots exist (bodyweight + equipment, or recovery).
 *  2. If any slot is missing, calls `select-wod-from-library` to pick one
 *     from the existing library according to the periodization plan.
 *  3. Re-kicks the Stripe linker / image generator for any active WOD
 *     missing those assets.
 *  4. Emails the admin if a slot still cannot be filled (empty library bucket).
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const cyprusToday = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Athens",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const found: string[] = [];
  const missing: string[] = [];
  const filled: string[] = [];
  const stillMissing: string[] = [];

  try {
    const { data: todayWods } = await supabase
      .from("admin_workouts")
      .select("id, name, equipment, image_url, stripe_product_id, stripe_price_id")
      .eq("is_workout_of_day", true)
      .eq("generated_for_date", cyprusToday);

    const equipments = new Set((todayWods || []).map((w: any) => (w.equipment || "").toUpperCase()));
    for (const slot of ["BODYWEIGHT", "EQUIPMENT"]) {
      if (equipments.has(slot) || equipments.has("VARIOUS")) {
        found.push(slot);
      } else {
        missing.push(slot);
      }
    }

    // Asset re-kick for any active WOD missing image/Stripe
    for (const w of todayWods || []) {
      if (!w.stripe_product_id || !w.stripe_price_id) {
        fetch(`${supabaseUrl}/functions/v1/wod-stripe-link`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${serviceKey}` },
          body: JSON.stringify({ workout_id: w.id }),
        }).catch((e) => console.error("[WATCHDOG] linker re-kick failed", e));
      }
      if (!w.image_url) {
        fetch(`${supabaseUrl}/functions/v1/auto-generate-workout-image`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${serviceKey}` },
          body: JSON.stringify({ workout_id: w.id }),
        }).catch((e) => console.error("[WATCHDOG] image re-kick failed", e));
      }
    }

    // Fill any missing slot from the library
    if (missing.length > 0) {
      console.log(`[WATCHDOG] Missing slots for ${cyprusToday}:`, missing);
      try {
        const resp = await fetch(`${supabaseUrl}/functions/v1/select-wod-from-library`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${anonKey}` },
          body: JSON.stringify({ targetDate: cyprusToday, triggerSource: "watchdog" }),
        });
        const text = await resp.text();
        console.log(`[WATCHDOG] select-wod-from-library response ${resp.status}:`, text.substring(0, 300));

        // Re-check
        const { data: after } = await supabase
          .from("admin_workouts")
          .select("equipment")
          .eq("is_workout_of_day", true)
          .eq("generated_for_date", cyprusToday);
        const afterEq = new Set((after || []).map((w: any) => (w.equipment || "").toUpperCase()));
        for (const slot of missing) {
          if (afterEq.has(slot) || afterEq.has("VARIOUS")) filled.push(slot);
          else stillMissing.push(slot);
        }
      } catch (e) {
        console.error("[WATCHDOG] library picker call failed:", e);
        stillMissing.push(...missing);
      }
    }

    // If anything still missing, email admin
    if (stillMissing.length > 0) {
      fetch(`${supabaseUrl}/functions/v1/run-system-health-audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${serviceKey}` },
        body: JSON.stringify({
          sendEmail: true,
          triggerSource: "watchdog-still-missing",
          extraContext: {
            cyprus_date: cyprusToday,
            still_missing: stillMissing,
            note: "Watchdog tried to fill missing WOD slot(s) from the library but the library has no eligible workout for today's periodization. Publish a matching workout in the admin panel.",
          },
        }),
      }).catch((e) => console.error("[WATCHDOG] alert email failed:", e));
    }

    return new Response(
      JSON.stringify({
        success: stillMissing.length === 0,
        cyprus_date: cyprusToday,
        found,
        missing,
        filled,
        still_missing: stillMissing,
        mode: "library",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[WATCHDOG] failure:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});