import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { getDayIn84Cycle, getPeriodizationForDay } from "../_shared/periodization-84day.ts";
import { getAdminNotificationEmail } from "../_shared/admin-settings.ts";
import { validateWodSections } from "../_shared/section-validator.ts";
import { validateWodPublishContract, type WodContractMode } from "../_shared/wod-integrity.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// MAX_ATTEMPTS × (callGenerateWod ~60s + 2s settle + RETRY_DELAY_MS) must stay
// under the Edge Function wall-time (~150s), otherwise the FINALLY block never
// fires and `wod_generation_runs` rows are left as zombie "running" entries.
// 2 attempts × (60 + 2 + 30) = ~184s is the worst case — still risky but
// retries also fire from separate cron passes, so a single attempt per call
// is what keeps us inside the wall-time budget.
const MAX_ATTEMPTS = 2;
const RETRY_DELAY_MS = 30000;

interface WodVerificationResult {
  success: boolean;
  missing: string[];
  found: string[];
  isRecoveryDay: boolean;
}

function passesPublishContract(
  wod: any,
  dateStr: string,
  mode: WodContractMode = "structural",
): { ok: boolean; reason?: string } {
  const result = validateWodPublishContract(wod, dateStr, { mode });
  return result.ok ? { ok: true } : { ok: false, reason: result.failures.join("; ") };
}

/**
 * Determines if a date is a recovery day using the shared periodization data.
 * Recovery days are Days 10, 28, 38, 56, 66, 84 in the 84-day cycle.
 */
function isRecoveryDay(dateStr: string): boolean {
  const dayIn84 = getDayIn84Cycle(dateStr);
  const periodization = getPeriodizationForDay(dayIn84);
  console.log(`[ORCHESTRATOR] Date ${dateStr} = Day ${dayIn84} in cycle, category: ${periodization.category}`);
  return periodization.category === "RECOVERY";
}

// Get Cyprus date string
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

async function verifyWodsExist(
  supabase: any,
  dateStr: string,
  contractMode: WodContractMode = "structural",
  requestedSlot: string | null = null,
): Promise<WodVerificationResult> {
  const recoveryDay = isRecoveryDay(dateStr);

  console.log(`[ORCHESTRATOR] Verifying WODs for ${dateStr}, isRecoveryDay: ${recoveryDay}, slot: ${requestedSlot ?? "ALL"}`);
  
  const { data: wods, error } = await supabase
    .from("admin_workouts")
    .select("id, name, equipment, category, is_workout_of_day, is_visible, main_workout, description, instructions, tips, image_url, is_standalone_purchase, price, stripe_product_id, stripe_price_id, generated_for_date")
    .eq("generated_for_date", dateStr)
    .eq("is_workout_of_day", true);
  
  if (error) {
    console.error(`[ORCHESTRATOR] Error querying WODs:`, error);
    return { success: false, missing: ["QUERY_ERROR"], found: [], isRecoveryDay: recoveryDay };
  }
  
  const found: string[] = [];
  const missing: string[] = [];
  
  if (recoveryDay) {
    // Recovery day: expect 1 VARIOUS workout (not MIXED - matches DB constraint)
    const variousWod = wods?.find((w: any) => w.equipment === "VARIOUS");
    if (variousWod) {
      const contract = passesPublishContract(variousWod, dateStr, contractMode);
      if (contract.ok) {
        found.push("VARIOUS");
      } else {
        missing.push(`VARIOUS (${contract.reason})`);
        console.log(`[ORCHESTRATOR] VARIOUS WOD ${variousWod.id} failed publish contract:`, contract.reason);
      }
    } else {
      missing.push("VARIOUS");
    }
  } else {
    // Normal day: by default expect BODYWEIGHT + EQUIPMENT.
    // PLAN 2 — slot scoping: when this orchestrator run is responsible for
    // a single slot only, verify ONLY that slot. The sibling slot is owned
    // by its own cron and may not exist yet.
    const slotsToCheck =
      requestedSlot === "BODYWEIGHT" || requestedSlot === "EQUIPMENT"
        ? [requestedSlot]
        : ["BODYWEIGHT", "EQUIPMENT"];

    if (slotsToCheck.includes("BODYWEIGHT")) {
      const bwWod = wods?.find((w: any) => w.equipment === "BODYWEIGHT");
      if (bwWod) {
      const contract = passesPublishContract(bwWod, dateStr, contractMode);
      if (contract.ok) {
        found.push("BODYWEIGHT");
      } else {
        missing.push(`BODYWEIGHT (${contract.reason})`);
        console.log(`[ORCHESTRATOR] BODYWEIGHT WOD ${bwWod.id} failed publish contract:`, contract.reason);
      }
      } else {
        missing.push("BODYWEIGHT");
      }
    }

    if (slotsToCheck.includes("EQUIPMENT")) {
      const eqWod = wods?.find((w: any) => w.equipment === "EQUIPMENT");
      if (eqWod) {
      const contract = passesPublishContract(eqWod, dateStr, contractMode);
      if (contract.ok) {
        found.push("EQUIPMENT");
      } else {
        missing.push(`EQUIPMENT (${contract.reason})`);
        console.log(`[ORCHESTRATOR] EQUIPMENT WOD ${eqWod.id} failed publish contract:`, contract.reason);
      }
      } else {
        missing.push("EQUIPMENT");
      }
    }
  }
  
  console.log(`[ORCHESTRATOR] Verification result - found: [${found.join(", ")}], missing: [${missing.join(", ")}]`);
  
  return {
    success: missing.length === 0,
    missing,
    found,
    isRecoveryDay: recoveryDay,
  };
}

async function callGenerateWod(
  supabaseUrl: string,
  anonKey: string,
  opts: { slot?: string | null; retryMissing?: boolean; triggerSource?: string; targetDate?: string | null } = {}
): Promise<{ success: boolean; error?: string }> {
  try {
    const body: any = {
      // CHAIN FIX: orchestrator MUST run the generator synchronously so
      // it can verify the real outcome. Never fire-and-forget from here.
      background: false,
      triggerSource: opts.triggerSource || "orchestrator",
    };
    if (opts.slot) body.slot = opts.slot;
    if (opts.retryMissing) body.retryMissing = true;
    if (opts.targetDate) body.targetDate = opts.targetDate;

    console.log(`[ORCHESTRATOR] Calling generate-workout-of-day (sync)`, body);

    const response = await fetch(`${supabaseUrl}/functions/v1/generate-workout-of-day`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${anonKey}`,
      },
      body: JSON.stringify(body),
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error(`[ORCHESTRATOR] generate-workout-of-day failed status ${response.status}:`, responseText.substring(0, 300));
      return { success: false, error: `HTTP ${response.status}: ${responseText.substring(0, 200)}` };
    }

    console.log(`[ORCHESTRATOR] generate-workout-of-day returned OK`);
    return { success: true };
  } catch (error) {
    console.error(`[ORCHESTRATOR] Error calling generate-workout-of-day:`, error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

async function runWodStripeCleanup(supabaseUrl: string, serviceKey: string, reason: string, dryRun = false): Promise<void> {
  try {
    console.log(`[ORCHESTRATOR] Running WOD Stripe cleanup: ${reason}`);
    const response = await fetch(`${supabaseUrl}/functions/v1/cleanup-wod-stripe-orphans`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Secret": serviceKey,
      },
      body: JSON.stringify({ dryRun, scope: "wod", reason }),
    });

    const resultText = await response.text();
    console.log(`[ORCHESTRATOR] Cleanup result ${response.status}: ${resultText.substring(0, 500)}`);
  } catch (cleanupError) {
    console.error(`[ORCHESTRATOR] Cleanup failed:`, cleanupError);
  }
}

async function sendAdminAlert(
  supabase: any,
  dateStr: string,
  missing: string[],
  attempts: { attempt: number; error?: string }[],
  isRecoveryDay: boolean
): Promise<void> {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    console.error("[ORCHESTRATOR] RESEND_API_KEY not configured, cannot send admin alert");
    return;
  }
  
  // Get admin email from database settings
  const adminEmail = await getAdminNotificationEmail(supabase);
  console.log(`[ORCHESTRATOR] Sending admin alert to: ${adminEmail}`);
  
  const resend = new Resend(resendApiKey);
  
  const attemptDetails = attempts
    .map((a) => `<li>Attempt ${a.attempt}: ${a.error || "No specific error"}</li>`)
    .join("");
  
  // Recovery = 1 VARIOUS workout, Normal = BODYWEIGHT + EQUIPMENT
  const expectedWorkouts = isRecoveryDay ? "VARIOUS" : "BODYWEIGHT + EQUIPMENT";
  
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #e67e22; border-bottom: 2px solid #e67e22; padding-bottom: 10px;">
        ⚠️ WOD Primary Generation Failed
      </h1>
      
      <div style="background: #fef9f0; border: 1px solid #fcd9a0; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 0; font-weight: bold; color: #b45309;">
          All ${MAX_ATTEMPTS} attempts have failed in this run. The system will <strong>automatically retry</strong> at the next scheduled slot.
        </p>
        <p style="margin: 8px 0 0 0; color: #92400e;">
          Auto-retry chain (Cyprus): <strong>04:00 backup → 04:15 watchdog → 08:30 / 08:50 primary → 09:20 / 09:50 / 10:20 / 10:50 retries</strong>. You will receive a ✅ success or ❌ final-failure summary in the <strong>09:30 Cyprus post-generation audit email</strong>. Only take manual action if the 09:30 audit email is ❌ — or if you receive no email by 11:00 Cyprus.
        </p>
      </div>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Date Affected:</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${dateStr}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Day Type:</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${isRecoveryDay ? "Recovery Day" : "Normal Day"}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Expected:</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${expectedWorkouts}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Missing:</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #dc2626; font-weight: bold;">${missing.join(", ")}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Total Attempts:</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${attempts.length}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Auto-Retry Chain:</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #059669; font-weight: bold;">✅ 04:00 / 04:15 / 08:30 / 08:50 / 09:20 / 09:50 / 10:20 / 10:50 Cyprus</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Final Verdict:</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #059669; font-weight: bold;">📧 09:30 Cyprus audit email (✅ or ❌)</td>
        </tr>
      </table>
      
      <h3 style="margin-top: 24px;">Attempt Details:</h3>
      <ul style="background: #f9fafb; padding: 16px 16px 16px 32px; border-radius: 8px;">
        ${attemptDetails}
      </ul>
      
      <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 0; font-weight: bold; color: #065f46;">
          🔄 Auto-Retry Chain Active
        </p>
        <p style="margin: 8px 0 0 0; color: #065f46;">
          Two verify-only safety nets (<strong>04:00</strong> backup + <strong>04:15</strong> watchdog) plus the primary generation crons (<strong>08:30 / 08:50</strong>) and four retry passes (<strong>09:20 / 09:50 / 10:20 / 10:50</strong> Cyprus) will attempt to fill any missing slot. The <strong>09:30 Cyprus post-generation audit</strong> sends a single ✅ or ❌ summary email — that is your authoritative status.
        </p>
      </div>
      
      <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 0; font-weight: bold; color: #92400e;">
          🔧 Manual Fallback (only if 09:30 audit email is ❌):
        </p>
        <p style="margin: 8px 0 0 0; color: #92400e;">
          Go to <strong>Admin → Content → WOD → WOD Watchdog</strong> to verify, or click <strong>Generate New WOD</strong> to manually create the missing slot.
        </p>
      </div>
      
      <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">
        This is an automated alert from SmartyGym WOD Orchestrator.
        <br>
        Timestamp: ${new Date().toISOString()}
      </p>
    </div>
  `;
  
  try {
    const emailResult = await resend.emails.send({
      from: "SmartyGym Alerts <notifications@smartygym.com>",
      to: [adminEmail],
      subject: `🚨 URGENT: WOD Generation Failed After ${MAX_ATTEMPTS} Attempts - ${dateStr}`,
      html: emailHtml,
    });
    
    // Log email delivery success
    await supabase.from('email_delivery_log').insert({
      message_type: 'wod_generation_failure',
      to_email: adminEmail,
      status: 'sent',
      resend_id: emailResult?.data?.id || null,
      metadata: { source: 'orchestrator', date: dateStr, missing, attempts: attempts.length }
    });
    
    console.log(`[ORCHESTRATOR] Admin alert email sent successfully:`, emailResult);
  } catch (error) {
    console.error(`[ORCHESTRATOR] Failed to send admin alert email:`, error);
    
    // Log email delivery failure
    await supabase.from('email_delivery_log').insert({
      message_type: 'wod_generation_failure',
      to_email: adminEmail,
      status: 'failed',
      error_message: error instanceof Error ? error.message : String(error),
      metadata: { source: 'orchestrator', date: dateStr }
    });
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Send a one-shot admin notification for a (target_date, slot, status) tuple.
 * Uses the wod_generation_notifications table as a dedupe ledger so multiple
 * retry passes never re-notify for the same outcome.
 */
async function notifyAdminOnce(
  supabase: any,
  params: {
    targetDate: string;
    slot: string;
    status: "success" | "failure";
    triggerSource: string;
    foundSlots: string[];
    missingSlots: string[];
  },
): Promise<void> {
  const { targetDate, slot, status, triggerSource, foundSlots, missingSlots } = params;
  // Dedupe: insert and skip if (target_date, slot, status) already exists
  const { data: inserted, error: dedupeErr } = await supabase
    .from("wod_generation_notifications")
    .insert({
      target_date: targetDate,
      slot,
      status,
      attempt_source: triggerSource,
    })
    .select("id")
    .maybeSingle();

  if (dedupeErr) {
    // Unique-violation = already notified → silent skip
    if ((dedupeErr as any).code === "23505") {
      console.log(`[ORCHESTRATOR/notify] Already notified for ${targetDate}/${slot}/${status} — skipping`);
      return;
    }
    console.error("[ORCHESTRATOR/notify] dedupe insert failed:", dedupeErr);
    return;
  }
  if (!inserted) {
    console.log(`[ORCHESTRATOR/notify] Already notified (no row returned) — skipping`);
    return;
  }

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    console.error("[ORCHESTRATOR/notify] RESEND_API_KEY missing — cannot email admin");
    return;
  }
  const adminEmail = await getAdminNotificationEmail(supabase);
  const resend = new Resend(resendApiKey);

  const isSuccess = status === "success";
  const subject = isSuccess
    ? `✅ WODs ready for ${targetDate} (${foundSlots.join(" + ")})`
    : `❌ WOD generation FAILED for ${targetDate} — action may be needed`;

  // Fetch the actual generated workout names for this target date so the
  // admin email shows WHICH workouts were generated (not just slot labels).
  let generatedWorkouts: Array<{ slot: string; name: string; id: string }> = [];
  try {
    const { data: wodRows } = await supabase
      .from("admin_workouts")
      .select("id, name, equipment, category")
      .eq("generated_for_date", targetDate)
      .eq("is_workout_of_day", true);
    if (Array.isArray(wodRows)) {
      generatedWorkouts = wodRows.map((w: any) => ({
        id: w.id,
        name: w.name || "(unnamed)",
        slot: w.equipment === "VARIOUS"
          ? "VARIOUS"
          : (w.equipment === "BODYWEIGHT" ? "BODYWEIGHT" : "EQUIPMENT"),
      }));
    }
  } catch (e) {
    console.error("[ORCHESTRATOR/notify] failed to fetch workout names:", e);
  }

  const workoutsListHtml = generatedWorkouts.length
    ? `<ul style="margin:8px 0 16px 20px;padding:0">
         ${generatedWorkouts.map((w) =>
           `<li><strong>${w.slot}:</strong> ${w.name} <span style="color:#9ca3af;font-size:11px">(${w.id})</span></li>`
         ).join("")}
       </ul>`
    : `<p style="color:#9ca3af;font-style:italic">Workout names unavailable.</p>`;

  const html = isSuccess
    ? `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
         <h2 style="color:#059669">✅ WODs Successfully Generated</h2>
         <p><strong>Target date:</strong> ${targetDate}</p>
         <p><strong>Slots ready:</strong> ${foundSlots.join(", ")}</p>
         <p><strong>Triggered by:</strong> ${triggerSource}</p>
         <p><strong>Generated workouts:</strong></p>
         ${workoutsListHtml}
         <p>Tomorrow's WODs are pre-built and waiting. They become "today" silently at 00:00 Cyprus.</p>
         <p style="color:#6b7280;font-size:12px;margin-top:24px">Automated success confirmation — sent once per slot per day.</p>
       </div>`
    : `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
         <h2 style="color:#dc2626">❌ WOD Generation Failed</h2>
         <p><strong>Target date:</strong> ${targetDate}</p>
         <p><strong>Missing slots:</strong> ${missingSlots.join(", ") || "UNKNOWN"}</p>
         <p><strong>Found slots:</strong> ${foundSlots.join(", ") || "none"}</p>
         <p><strong>Trigger:</strong> ${triggerSource}</p>
         <p><strong>Workouts generated so far:</strong></p>
         ${workoutsListHtml}
         <p>Up to 4 retry passes will run between 09:20 and 10:50 Cyprus. If they all fail, manually generate from <strong>Admin → WOD Manager → Generate New WOD</strong>.</p>
         <p style="color:#6b7280;font-size:12px;margin-top:24px">Automated failure alert — sent once per slot per day.</p>
       </div>`;

  try {
    await resend.emails.send({
      from: "SmartyGym Alerts <notifications@smartygym.com>",
      to: [adminEmail],
      subject,
      html,
    });
    console.log(`[ORCHESTRATOR/notify] ${status} email sent to ${adminEmail} for ${targetDate}/${slot}`);
  } catch (e) {
    console.error("[ORCHESTRATOR/notify] resend send failed:", e);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("[ORCHESTRATOR] ========== WOD GENERATION ORCHESTRATOR STARTED ==========");

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Parse optional body. CHAIN FIX additions:
  //   - `slot`: limit work to a single slot (BODYWEIGHT|EQUIPMENT|VARIOUS)
  //   - `mode`: "verify" → only verify and alert if missing (used by
  //     backup-wod-generation and watchdog-wod-check). Never regenerates,
  //     never pulls from library.
  //   - `targetDate`: explicit YYYY-MM-DD to build for. Used by the new
  //     06:30/06:50 UTC morning crons to pre-build TOMORROW's WODs while the
  //     gateway is calm. When omitted, falls back to today (Cyprus).
  let triggerSource = "orchestrator";
  let requestedSlot: string | null = null;
  let mode: "generate" | "verify" = "generate";
  let bodyTargetDate: string | null = null;
  try {
    if (req.method === "POST") {
      const bodyText = await req.text();
      if (bodyText && bodyText.trim().length > 0) {
        const body = JSON.parse(bodyText);
        if (typeof body?.triggerSource === "string" && body.triggerSource.length > 0) {
          triggerSource = body.triggerSource;
        }
        if (typeof body?.slot === "string") {
          const s = body.slot.toUpperCase();
          if (s === "BODYWEIGHT" || s === "EQUIPMENT" || s === "VARIOUS") {
            requestedSlot = s;
          }
        }
        if (body?.mode === "verify") mode = "verify";
        if (typeof body?.targetDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.targetDate)) {
          bodyTargetDate = body.targetDate;
        }
      }
    }
  } catch (parseError) {
    console.log(`[ORCHESTRATOR] No JSON body or invalid body. (${parseError instanceof Error ? parseError.message : String(parseError)})`);
  }
  const effectiveDate = bodyTargetDate ?? getCyprusDateStr();
  console.log(`[ORCHESTRATOR] Effective date: ${effectiveDate}${bodyTargetDate ? " (from body.targetDate)" : " (today Cyprus)"}`);
  console.log(`[ORCHESTRATOR] Trigger=${triggerSource} mode=${mode} slot=${requestedSlot ?? "ALL"}`);

  // ───────────────────────────────────────────────────────────────────────────
  // EARLY EXIT: If today's WODs already exist and pass the publish contract,
  // do nothing. This prevents backup (04:00 Cyprus) and watchdog (04:15 Cyprus)
  // wrappers from re-generating WODs unnecessarily and burning AI credits.
  // ───────────────────────────────────────────────────────────────────────────
  // Watchdog/backup verify-only mode runs the FULL contract (image + Stripe
  // must be present). Generator success path uses STRUCTURAL contract because
  // image + Stripe are populated asynchronously after the WOD row is saved.
  const preCheckMode: WodContractMode = mode === "verify" ? "full" : "structural";
  // Verify-only (backup/watchdog) always checks the FULL day; generation
  // pre-checks may be slot-scoped to match the cron that triggered them.
  const preCheck = await verifyWodsExist(
    supabase,
    effectiveDate,
    preCheckMode,
    mode === "verify" ? null : requestedSlot,
  );

  // VERIFY-ONLY MODE (used by backup + watchdog wrappers): never generate,
  // never pull from library. Just check, and alert if anything is missing.
  if (mode === "verify") {
    if (preCheck.missing.length === 0) {
      console.log(`[ORCHESTRATOR/verify] ✅ All slots present for ${effectiveDate}`);
      return new Response(
        JSON.stringify({ success: true, mode: "verify", date: effectiveDate, found: preCheck.found }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    console.log(`[ORCHESTRATOR/verify] ⚠️ Missing slots: ${preCheck.missing.join(", ")} — sending admin alert`);
    await sendAdminAlert(
      supabase,
      effectiveDate,
      preCheck.missing,
      [{ attempt: 0, error: `verify-only check via ${triggerSource} found missing slots` }],
      preCheck.isRecoveryDay
    );
    return new Response(
      JSON.stringify({ success: false, mode: "verify", date: effectiveDate, missing: preCheck.missing, found: preCheck.found, adminAlerted: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (preCheck.missing.length === 0 && preCheck.found.length > 0) {
    console.log(`[ORCHESTRATOR] ✅ WODs already exist for ${effectiveDate}: ${preCheck.found.join(", ")}. Trigger="${triggerSource}". Nothing to do.`);
    return new Response(
      JSON.stringify({
        success: true,
        mode: "noop",
        message: "WODs already present and valid",
        date: effectiveDate,
        found: preCheck.found,
        triggerSource,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Check WOD mode from config. Library Mode is ADMIN-ONLY and may only be
  // triggered manually (e.g. from the admin panel passing a special
  // `triggerSource: "admin-library"`). Never let cron/backup/watchdog
  // silently switch to library mode.
  const { data: wodConfig } = await supabase
    .from("wod_auto_generation_config")
    .select("wod_mode")
    .limit(1)
    .single();

  const wodMode = wodConfig?.wod_mode || "generate";
  console.log(`[ORCHESTRATOR] WOD mode in config: ${wodMode}, trigger=${triggerSource}`);

  const isAdminTrigger = triggerSource === "admin" || triggerSource === "admin-library" || triggerSource.startsWith("admin-");

  if (wodMode === "select" && isAdminTrigger) {
    console.log("[ORCHESTRATOR] Library Mode active - calling select-wod-from-library");
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/select-wod-from-library`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${anonKey}`,
        },
        body: JSON.stringify({ targetDate: effectiveDate }),
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        console.log("[ORCHESTRATOR] Library selection successful", responseData);
        return new Response(
          JSON.stringify({
            success: true,
            mode: "library-selection",
            message: "WOD selected from library",
            date: effectiveDate,
            selected: responseData.selected,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        console.error("[ORCHESTRATOR] Library selection failed:", responseData);
        return new Response(
          JSON.stringify({
            success: false,
            mode: "library-selection",
            message: "Library selection failed",
            error: responseData.error || "Unknown error",
            date: effectiveDate,
          }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (libError) {
      console.error("[ORCHESTRATOR] Library selection error:", libError);
      return new Response(
        JSON.stringify({
          success: false,
          mode: "library-selection",
          error: libError instanceof Error ? libError.message : String(libError),
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }

  if (wodMode === "select" && !isAdminTrigger) {
    console.log(`[ORCHESTRATOR] Library Mode is set in config but trigger=${triggerSource} is not admin. Ignoring library mode for automated runs (admin-only).`);
  }

  // Generate Mode (default) - existing logic unchanged
  // Determine expected count based on day type
  const recoveryDay = isRecoveryDay(effectiveDate);
  const expectedCount = recoveryDay ? 1 : 2;
  const dayIn84 = getDayIn84Cycle(effectiveDate);
  const periodization = getPeriodizationForDay(dayIn84);

  // ─────────────────────────────────────────────────────────────────────
  // ZOMBIE CLEANUP: close any prior "running" rows for the same date that
  // are older than 10 minutes BEFORE we create a new one. This prevents
  // the run-history view from filling up with rows that the FINALLY block
  // never finalised (Edge wall-time hit).
  // ─────────────────────────────────────────────────────────────────────
  try {
    const tenMinAgoIso = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data: zombies } = await supabase
      .from("wod_generation_runs")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        error_message: "Auto-closed by orchestrator: prior run exceeded edge wall-time before finalize ran",
      })
      .eq("status", "running")
      .eq("cyprus_date", effectiveDate)
      .lt("started_at", tenMinAgoIso)
      .select("id");
    if (zombies && zombies.length > 0) {
      console.log(`[ORCHESTRATOR] Closed ${zombies.length} zombie running row(s) for ${effectiveDate}`);
    }
  } catch (zErr) {
    console.error("[ORCHESTRATOR] Zombie cleanup failed (non-fatal):", zErr);
  }

  // Create run log entry at start
  const { data: runLog, error: runLogError } = await supabase
    .from("wod_generation_runs")
    .insert({
      cyprus_date: effectiveDate,
      status: "running",
      expected_count: expectedCount,
      is_recovery_day: recoveryDay,
      expected_category: periodization.category,
      trigger_source: triggerSource,
    })
    .select()
    .single();

  if (runLogError) {
    console.error("[ORCHESTRATOR] Failed to create run log:", runLogError);
  } else {
    console.log(`[ORCHESTRATOR] Created run log: ${runLog.id}`);
  }

  const attempts: { attempt: number; error?: string }[] = [];
  let finalResult: WodVerificationResult | null = null;
  let succeeded = false;

  try {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      console.log(`[ORCHESTRATOR] ===== ATTEMPT ${attempt}/${MAX_ATTEMPTS} =====`);

      // Call generate-workout-of-day SYNCHRONOUSLY for the requested slot
      // (or for all slots when no slot was specified).
      const isRetry = attempt > 1;
      const generateResult = await callGenerateWod(supabaseUrl, anonKey, {
        slot: requestedSlot,
        retryMissing: isRetry,
        triggerSource,
        targetDate: effectiveDate,
      });

      if (!generateResult.success) {
        attempts.push({ attempt, error: generateResult.error });
      } else {
        attempts.push({ attempt });
      }

      // Wait a moment for database to settle
      await delay(2000);

      // Verify WODs exist (structural — assets land asynchronously)
      const verification = await verifyWodsExist(
        supabase,
        effectiveDate,
        "structural",
        requestedSlot,
      );
      finalResult = verification;

      if (verification.success) {
        console.log(`[ORCHESTRATOR] ✅ SUCCESS on attempt ${attempt} - All required WODs exist`);
        console.log(`[ORCHESTRATOR] Found: ${verification.found.join(", ")}`);
        succeeded = true;
        // PLAN E: cleanup is no longer in the critical path. Daily cron
        // `stripe-orphan-cleanup` at 04:00 UTC handles it.

        // Update run log with success
        if (runLog?.id) {
          await supabase
            .from("wod_generation_runs")
            .update({
              status: "success",
              completed_at: new Date().toISOString(),
              found_count: verification.found.length,
              wods_created: verification.found,
            })
            .eq("id", runLog.id);
        }

        // Notify admin once per slot/day on success (dedupe via wod_generation_notifications)
        try {
          await notifyAdminOnce(supabase, {
            targetDate: effectiveDate,
            slot: requestedSlot || "ALL",
            status: "success",
            triggerSource,
            foundSlots: verification.found,
            missingSlots: [],
          });
        } catch (notifyErr) {
          console.error("[ORCHESTRATOR] success notify failed:", notifyErr);
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: `WOD generation successful on attempt ${attempt}`,
            date: effectiveDate,
            found: verification.found,
            attempts: attempt,
            runLogId: runLog?.id,
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      console.log(`[ORCHESTRATOR] ❌ Attempt ${attempt} - Missing: ${verification.missing.join(", ")}`);

      // If not the last attempt, wait before retrying
      if (attempt < MAX_ATTEMPTS) {
        console.log(`[ORCHESTRATOR] Waiting ${RETRY_DELAY_MS / 1000}s before retry...`);
        await delay(RETRY_DELAY_MS);
      }
    }

    // All attempts failed - determine if partial or complete failure
    const isPartialFailure = (finalResult?.found?.length || 0) > 0;
    const failureType = isPartialFailure ? "PARTIAL" : "COMPLETE";
    console.log(`[ORCHESTRATOR] 🚨 ${failureType} FAILURE after ${MAX_ATTEMPTS} attempts - Sending admin alert`);
    // PLAN E: cleanup deferred to daily cron — not run inline anymore.

    // CHAIN FIX: NO automatic library fallback. Per the locked-in rules,
    // the only outcomes are (a) verified success, or (b) admin alert.
    // Library mode is admin-only and is triggered manually from the panel.
    await sendAdminAlert(
      supabase,
      effectiveDate,
      finalResult?.missing || ["UNKNOWN"],
      attempts,
      finalResult?.isRecoveryDay || false
    );

    // Also send the deduped one-shot failure email so retry passes don't spam.
    try {
      await notifyAdminOnce(supabase, {
        targetDate: effectiveDate,
        slot: requestedSlot || "ALL",
        status: "failure",
        triggerSource,
        foundSlots: finalResult?.found || [],
        missingSlots: finalResult?.missing || ["UNKNOWN"],
      });
    } catch (notifyErr) {
      console.error("[ORCHESTRATOR] failure notify failed:", notifyErr);
    }

    // Update run log with failure
    if (runLog?.id) {
      await supabase
        .from("wod_generation_runs")
        .update({
          status: "failed",
          completed_at: new Date().toISOString(),
          found_count: finalResult?.found?.length || 0,
          wods_created: finalResult?.found || [],
          error_message: `${failureType} failure after ${MAX_ATTEMPTS} attempts. Missing: ${finalResult?.missing?.join(", ")}. Found: ${finalResult?.found?.join(", ") || "none"}.`,
        })
        .eq("id", runLog.id);
    }

    // Log to notification_audit_log
    await supabase.from("notification_audit_log").insert({
      notification_type: isPartialFailure ? "wod_partial_generation_failure" : "wod_generation_failure",
      message_type: "email",
      subject: `WOD ${failureType} Failure - ${effectiveDate}`,
      content: `${failureType} failure after ${MAX_ATTEMPTS} attempts. Missing: ${finalResult?.missing.join(", ")}. Found: ${finalResult?.found?.join(", ") || "none"}.`,
      recipient_count: 1,
      success_count: 0,
      failed_count: 1,
      metadata: {
        date: effectiveDate,
        missing: finalResult?.missing,
        found: finalResult?.found,
        attempts: attempts,
        isRecoveryDay: finalResult?.isRecoveryDay,
        runLogId: runLog?.id,
        failureType,
      },
    });

    return new Response(
      JSON.stringify({
        success: false,
        message: `WOD generation failed after ${MAX_ATTEMPTS} attempts`,
        date: effectiveDate,
        missing: finalResult?.missing,
        found: finalResult?.found,
        attempts: attempts,
        adminAlerted: true,
        runLogId: runLog?.id,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } finally {
    // CRITICAL: Always finalize the run log status - prevents zombie "running" records
    if (runLog?.id && !succeeded) {
      console.log(`[ORCHESTRATOR] FINALLY block: Ensuring run log ${runLog.id} is not left as 'running'`);
      try {
        // Check if still "running" (might have been updated to "failed" already)
        const { data: currentRun } = await supabase
          .from("wod_generation_runs")
          .select("status")
          .eq("id", runLog.id)
          .single();

        if (currentRun?.status === "running") {
          await supabase
            .from("wod_generation_runs")
            .update({
              status: "failed",
              completed_at: new Date().toISOString(),
              found_count: finalResult?.found?.length || 0,
              error_message: `Orchestrator terminated unexpectedly. Missing: ${finalResult?.missing?.join(", ") || "UNKNOWN"}. Attempts: ${attempts.length}`,
            })
            .eq("id", runLog.id);
          console.log(`[ORCHESTRATOR] FINALLY: Marked run ${runLog.id} as failed (was still running)`);
        }
      } catch (finallyError) {
        console.error(`[ORCHESTRATOR] FINALLY: Error updating run log:`, finallyError);
      }
    }
  }
});
