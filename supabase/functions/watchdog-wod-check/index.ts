import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { getDayIn84Cycle, getPeriodizationForDay } from "../_shared/periodization-84day.ts";
import { getAdminNotificationEmail } from "../_shared/admin-settings.ts";
import { validateWodSections } from "../_shared/section-validator.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Watchdog WOD Check
 * 
 * Runs at 01:05 UTC (03:05 Cyprus) — 5 minutes after backup.
 * Final safety net: counts active WODs, triggers recovery if needed.
 */

function getCyprusDateStr(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Athens",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("[WATCHDOG] ========== WOD WATCHDOG CHECK ==========");

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const today = getCyprusDateStr();
  const dayIn84 = getDayIn84Cycle(today);
  const periodization = getPeriodizationForDay(dayIn84);
  const isRecovery = periodization.category === "RECOVERY";
  const expectedCount = isRecovery ? 1 : 2;

  console.log(`[WATCHDOG] Date: ${today}, Recovery: ${isRecovery}, Expected: ${expectedCount}`);

  // Count today's active, validated WODs
  const { data: wods } = await supabase
    .from("admin_workouts")
    .select("id, name, equipment, main_workout")
    .eq("generated_for_date", today)
    .eq("is_workout_of_day", true);

  const validWods: string[] = [];
  for (const w of wods || []) {
    const check = validateWodSections(w.main_workout, isRecovery);
    if (check.isComplete) validWods.push(w.equipment || "UNKNOWN");
  }

  console.log(`[WATCHDOG] Found ${validWods.length}/${expectedCount} valid WODs: ${validWods.join(", ")}`);

  // All good — silent exit
  if (validWods.length >= expectedCount) {
    console.log("[WATCHDOG] ✅ All WODs present. No action needed.");
    return new Response(
      JSON.stringify({ status: "ok", date: today, found: validWods.length, expected: expectedCount }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Missing WODs — trigger recovery
  const missing = [];
  if (!isRecovery) {
    if (!validWods.includes("BODYWEIGHT")) missing.push("BODYWEIGHT");
    if (!validWods.includes("EQUIPMENT")) missing.push("EQUIPMENT");
  } else {
    if (!validWods.includes("VARIOUS")) missing.push("VARIOUS");
  }

  console.log(`[WATCHDOG] ⚠️ Missing: ${missing.join(", ")}. Triggering recovery...`);

  // Trigger generation
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/generate-workout-of-day`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ retryMissing: true }),
    });

    const responseOk = response.ok;
    console.log(`[WATCHDOG] Recovery trigger response: ${response.status} ok=${responseOk}`);

    // Send critical alert email
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      const adminEmail = await getAdminNotificationEmail(supabase);
      const resend = new Resend(resendKey);

      await resend.emails.send({
        from: "SmartyGym Alerts <notifications@smartygym.com>",
        to: [adminEmail],
        subject: `🐕 WATCHDOG: WOD Recovery Triggered - ${today}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #d97706;">🐕 Watchdog WOD Recovery</h1>
            <p>The 03:05 Cyprus watchdog detected missing WODs for <strong>${today}</strong>.</p>
            <p><strong>Expected:</strong> ${expectedCount} WODs</p>
            <p><strong>Found:</strong> ${validWods.length} (${validWods.join(", ") || "none"})</p>
            <p><strong>Missing:</strong> ${missing.join(", ")}</p>
            <p><strong>Action:</strong> Recovery generation has been triggered (retryMissing=true).</p>
            <p>Check the admin panel in 5-10 minutes to confirm recovery.</p>
            <p style="color: #6b7280; font-size: 12px;">Timestamp: ${new Date().toISOString()}</p>
          </div>
        `,
      });

      await supabase.from("email_delivery_log").insert({
        message_type: "watchdog_wod_alert",
        to_email: adminEmail,
        status: "sent",
        metadata: { date: today, missing, found: validWods },
      });
    }

    return new Response(
      JSON.stringify({
        status: "recovery_triggered",
        date: today,
        found: validWods.length,
        expected: expectedCount,
        missing,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[WATCHDOG] Recovery trigger failed:", error);
    return new Response(
      JSON.stringify({ status: "error", error: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
