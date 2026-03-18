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
 * Backup WOD Generation Function
 * 
 * Runs at 01:00 UTC (03:00 Cyprus) as a safety net.
 * Checks if today's WODs exist and are complete.
 * If missing, triggers generation and sends recovery/failure emails.
 */

function getCyprusDateStr(): string {
  const now = new Date();
  const cyprusFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Athens",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return cyprusFormatter.format(now);
}

function isRecoveryDay(dateStr: string): boolean {
  const dayIn84 = getDayIn84Cycle(dateStr);
  const periodization = getPeriodizationForDay(dayIn84);
  return periodization.category === "RECOVERY";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("[BACKUP-WOD] ========== BACKUP WOD GENERATION CHECK STARTED ==========");

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const effectiveDate = getCyprusDateStr();
  const recoveryDay = isRecoveryDay(effectiveDate);
  const expectedCount = recoveryDay ? 1 : 2;

  console.log(`[BACKUP-WOD] Date: ${effectiveDate}, Recovery: ${recoveryDay}, Expected: ${expectedCount}`);

  // Check existing WODs
  const { data: wods, error: wodsError } = await supabase
    .from("admin_workouts")
    .select("id, name, equipment, is_workout_of_day, main_workout")
    .eq("generated_for_date", effectiveDate)
    .eq("is_workout_of_day", true);

  if (wodsError) {
    console.error("[BACKUP-WOD] Error querying WODs:", wodsError);
    return new Response(JSON.stringify({ error: wodsError.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Validate each WOD
  const validWods: string[] = [];
  const missing: string[] = [];

  if (recoveryDay) {
    const variousWod = wods?.find((w: any) => w.equipment === "VARIOUS");
    if (variousWod) {
      const check = validateWodSections(variousWod.main_workout, true);
      if (check.isComplete) validWods.push("VARIOUS");
      else missing.push("VARIOUS (incomplete)");
    } else {
      missing.push("VARIOUS");
    }
  } else {
    const bwWod = wods?.find((w: any) => w.equipment === "BODYWEIGHT");
    if (bwWod) {
      const check = validateWodSections(bwWod.main_workout, false);
      if (check.isComplete) validWods.push("BODYWEIGHT");
      else missing.push("BODYWEIGHT (incomplete)");
    } else {
      missing.push("BODYWEIGHT");
    }

    const eqWod = wods?.find((w: any) => w.equipment === "EQUIPMENT");
    if (eqWod) {
      const check = validateWodSections(eqWod.main_workout, false);
      if (check.isComplete) validWods.push("EQUIPMENT");
      else missing.push("EQUIPMENT (incomplete)");
    } else {
      missing.push("EQUIPMENT");
    }
  }

  // If all WODs present and valid, nothing to do
  if (missing.length === 0) {
    console.log(`[BACKUP-WOD] ✅ All ${validWods.length} WODs present and valid. No action needed.`);
    return new Response(
      JSON.stringify({
        success: true,
        message: "All WODs present - no backup needed",
        date: effectiveDate,
        found: validWods,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Missing WODs detected - attempt backup generation
  console.log(`[BACKUP-WOD] ⚠️ Missing WODs: ${missing.join(", ")}. Triggering backup generation...`);

  // Create run log
  const dayIn84 = getDayIn84Cycle(effectiveDate);
  const periodization = getPeriodizationForDay(dayIn84);

  const { data: runLog } = await supabase
    .from("wod_generation_runs")
    .insert({
      cyprus_date: effectiveDate,
      status: "running",
      expected_count: expectedCount,
      is_recovery_day: recoveryDay,
      expected_category: periodization.category,
      trigger_source: "backup",
    })
    .select()
    .single();

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/generate-workout-of-day`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ retryMissing: true }),
    });

    const responseText = await response.text();

    if (!response.ok) {
      throw new Error(`Generation failed: HTTP ${response.status}: ${responseText.substring(0, 200)}`);
    }

    // Wait for DB to settle then re-verify
    await new Promise(r => setTimeout(r, 3000));

    const { data: recheck } = await supabase
      .from("admin_workouts")
      .select("id, equipment, main_workout")
      .eq("generated_for_date", effectiveDate)
      .eq("is_workout_of_day", true);

    const recheckValid: string[] = [];
    if (recoveryDay) {
      const v = recheck?.find((w: any) => w.equipment === "VARIOUS");
      if (v && validateWodSections(v.main_workout, true).isComplete) recheckValid.push("VARIOUS");
    } else {
      const bw = recheck?.find((w: any) => w.equipment === "BODYWEIGHT");
      if (bw && validateWodSections(bw.main_workout, false).isComplete) recheckValid.push("BODYWEIGHT");
      const eq = recheck?.find((w: any) => w.equipment === "EQUIPMENT");
      if (eq && validateWodSections(eq.main_workout, false).isComplete) recheckValid.push("EQUIPMENT");
    }

    const backupSucceeded = recheckValid.length === expectedCount;

    // Update run log
    if (runLog?.id) {
      await supabase
        .from("wod_generation_runs")
        .update({
          status: backupSucceeded ? "success" : "failed",
          completed_at: new Date().toISOString(),
          found_count: recheckValid.length,
          wods_created: recheckValid,
          error_message: backupSucceeded ? null : `Backup recovery incomplete. Found: ${recheckValid.join(", ")}`,
        })
        .eq("id", runLog.id);
    }

    // Send recovery or final failure email
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (resendApiKey) {
      const adminEmail = await getAdminNotificationEmail(supabase);
      const resend = new Resend(resendApiKey);

      if (backupSucceeded) {
        console.log("[BACKUP-WOD] ✅ Backup generation SUCCEEDED - sending recovery email");
        await resend.emails.send({
          from: "SmartyGym Alerts <notifications@smartygym.com>",
          to: [adminEmail],
          subject: `✅ WOD Recovery Success - ${effectiveDate}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #16a34a;">✅ WOD Backup Recovery Successful</h1>
              <p>The backup generation system successfully created the missing WOD(s) for <strong>${effectiveDate}</strong>.</p>
              <p><strong>Previously missing:</strong> ${missing.join(", ")}</p>
              <p><strong>Now available:</strong> ${recheckValid.join(", ")}</p>
              <p style="color: #6b7280; font-size: 12px;">Timestamp: ${new Date().toISOString()}</p>
            </div>
          `,
        });

        await supabase.from('email_delivery_log').insert({
          message_type: 'wod_backup_recovery',
          to_email: adminEmail,
          status: 'sent',
          metadata: { date: effectiveDate, recovered: recheckValid }
        });
      } else {
        console.log("[BACKUP-WOD] ❌ Backup generation FAILED - sending final failure email");
        await resend.emails.send({
          from: "SmartyGym Alerts <notifications@smartygym.com>",
          to: [adminEmail],
          subject: `🚨 CRITICAL: WOD Backup Also Failed - ${effectiveDate}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #dc2626;">🚨 WOD Backup Generation Failed</h1>
              <p>Both primary and backup WOD generation have failed for <strong>${effectiveDate}</strong>.</p>
              <p><strong>Still missing:</strong> ${missing.join(", ")}</p>
              <p><strong>Manual action required:</strong> Go to Admin → WOD Manager → Generate New WOD → "Regenerate Today"</p>
              <p style="color: #6b7280; font-size: 12px;">Timestamp: ${new Date().toISOString()}</p>
            </div>
          `,
        });

        await supabase.from('email_delivery_log').insert({
          message_type: 'wod_backup_failure',
          to_email: adminEmail,
          status: 'sent',
          metadata: { date: effectiveDate, missing }
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: backupSucceeded,
        message: backupSucceeded ? "Backup recovery succeeded" : "Backup recovery failed",
        date: effectiveDate,
        found: recheckValid,
        previouslyMissing: missing,
      }),
      {
        status: backupSucceeded ? 200 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[BACKUP-WOD] Backup generation error:", error);

    // Ensure run log is closed
    if (runLog?.id) {
      await supabase
        .from("wod_generation_runs")
        .update({
          status: "failed",
          completed_at: new Date().toISOString(),
          error_message: `Backup error: ${error instanceof Error ? error.message : String(error)}`,
        })
        .eq("id", runLog.id);
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
