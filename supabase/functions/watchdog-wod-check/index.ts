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
 * Final safety net with verify-retry-verify loop:
 * 1. Check WODs → if OK, exit silently
 * 2. Trigger recovery → wait 60s → re-verify
 * 3. If still missing, trigger once more → wait 60s → final verify
 * 4. Send alert with final status
 */

const WATCHDOG_MAX_RETRIES = 2;
const WATCHDOG_VERIFY_DELAY_MS = 60000; // 60s wait after each recovery trigger

function getCyprusDateStr(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Athens",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function countValidWods(wods: any[], isRecovery: boolean): string[] {
  const valid: string[] = [];
  for (const w of wods || []) {
    const check = validateWodSections(w.main_workout, isRecovery);
    if (check.isComplete) valid.push(w.equipment || "UNKNOWN");
  }
  return valid;
}

function getMissing(validWods: string[], isRecovery: boolean): string[] {
  const missing: string[] = [];
  if (isRecovery) {
    if (!validWods.includes("VARIOUS")) missing.push("VARIOUS");
  } else {
    if (!validWods.includes("BODYWEIGHT")) missing.push("BODYWEIGHT");
    if (!validWods.includes("EQUIPMENT")) missing.push("EQUIPMENT");
  }
  return missing;
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

  // Initial check
  const { data: initialWods } = await supabase
    .from("admin_workouts")
    .select("id, name, equipment, main_workout")
    .eq("generated_for_date", today)
    .eq("is_workout_of_day", true);

  let validWods = countValidWods(initialWods || [], isRecovery);

  console.log(`[WATCHDOG] Initial check: ${validWods.length}/${expectedCount} valid WODs: ${validWods.join(", ")}`);

  // All good — silent exit
  if (validWods.length >= expectedCount) {
    console.log("[WATCHDOG] ✅ All WODs present. No action needed.");
    return new Response(
      JSON.stringify({ status: "ok", date: today, found: validWods.length, expected: expectedCount }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Missing WODs — enter verify-retry-verify loop
  let recoveryAttempt = 0;
  let missing = getMissing(validWods, isRecovery);

  while (recoveryAttempt < WATCHDOG_MAX_RETRIES && validWods.length < expectedCount) {
    recoveryAttempt++;
    console.log(`[WATCHDOG] ⚠️ Recovery attempt ${recoveryAttempt}/${WATCHDOG_MAX_RETRIES}. Missing: ${missing.join(", ")}`);

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
      await response.text(); // consume body
      console.log(`[WATCHDOG] Recovery trigger ${recoveryAttempt} response: ${response.status} ok=${responseOk}`);
    } catch (triggerError) {
      console.error(`[WATCHDOG] Recovery trigger ${recoveryAttempt} failed:`, triggerError);
    }

    // Wait for generation to complete
    console.log(`[WATCHDOG] Waiting ${WATCHDOG_VERIFY_DELAY_MS / 1000}s for generation to complete...`);
    await new Promise(r => setTimeout(r, WATCHDOG_VERIFY_DELAY_MS));

    // Re-verify
    const { data: recheckWods } = await supabase
      .from("admin_workouts")
      .select("id, name, equipment, main_workout")
      .eq("generated_for_date", today)
      .eq("is_workout_of_day", true);

    validWods = countValidWods(recheckWods || [], isRecovery);
    missing = getMissing(validWods, isRecovery);

    console.log(`[WATCHDOG] After attempt ${recoveryAttempt}: ${validWods.length}/${expectedCount} valid. Missing: ${missing.join(", ") || "none"}`);
  }

  // Final status
  const allRecovered = validWods.length >= expectedCount;

  // Send alert email
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (resendKey) {
    const adminEmail = await getAdminNotificationEmail(supabase);
    const resend = new Resend(resendKey);

    if (allRecovered) {
      console.log("[WATCHDOG] ✅ Recovery succeeded after retries");
      await resend.emails.send({
        from: "SmartyGym Alerts <notifications@smartygym.com>",
        to: [adminEmail],
        subject: `✅ WATCHDOG: WOD Recovery Succeeded - ${today}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #16a34a;">✅ Watchdog Recovery Successful</h1>
            <p>The watchdog detected missing WODs and successfully recovered them for <strong>${today}</strong>.</p>
            <p><strong>Recovery attempts:</strong> ${recoveryAttempt}</p>
            <p><strong>Now available:</strong> ${validWods.join(", ")}</p>
            <p style="color: #6b7280; font-size: 12px;">Timestamp: ${new Date().toISOString()}</p>
          </div>
        `,
      });

      await supabase.from("email_delivery_log").insert({
        message_type: "watchdog_wod_recovery",
        to_email: adminEmail,
        status: "sent",
        metadata: { date: today, recovered: validWods, attempts: recoveryAttempt },
      });
    } else {
      console.log("[WATCHDOG] ❌ Recovery FAILED after all retries");
      await resend.emails.send({
        from: "SmartyGym Alerts <notifications@smartygym.com>",
        to: [adminEmail],
        subject: `🐕 WATCHDOG CRITICAL: WOD Recovery Failed (${WATCHDOG_MAX_RETRIES} attempts) - ${today}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #dc2626;">🐕 Watchdog WOD Recovery FAILED</h1>
            <p>The watchdog tried <strong>${WATCHDOG_MAX_RETRIES} recovery attempts</strong> but WODs are still missing for <strong>${today}</strong>.</p>
            <p><strong>Expected:</strong> ${expectedCount} WODs</p>
            <p><strong>Found:</strong> ${validWods.length} (${validWods.join(", ") || "none"})</p>
            <p><strong>Still missing:</strong> ${missing.join(", ")}</p>
            <p><strong>Manual action required:</strong> Go to Admin → WOD Manager → Generate New WOD → "Regenerate Today"</p>
            <p style="color: #6b7280; font-size: 12px;">Timestamp: ${new Date().toISOString()}</p>
          </div>
        `,
      });

      await supabase.from("email_delivery_log").insert({
        message_type: "watchdog_wod_alert",
        to_email: adminEmail,
        status: "sent",
        metadata: { date: today, missing, found: validWods, attempts: recoveryAttempt },
      });
    }
  }

  return new Response(
    JSON.stringify({
      status: allRecovered ? "recovered" : "recovery_failed",
      date: today,
      found: validWods.length,
      expected: expectedCount,
      missing,
      recoveryAttempts: recoveryAttempt,
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
