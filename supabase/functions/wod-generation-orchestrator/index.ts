import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { getDayIn84Cycle, getPeriodizationForDay } from "../_shared/periodization-84day.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 30000; // 30 seconds between retries
const ADMIN_EMAIL = "stavrosdel@gmail.com";

interface WodVerificationResult {
  success: boolean;
  missing: string[];
  found: string[];
  isRecoveryDay: boolean;
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
  dateStr: string
): Promise<WodVerificationResult> {
  const recoveryDay = isRecoveryDay(dateStr);
  
  console.log(`[ORCHESTRATOR] Verifying WODs for ${dateStr}, isRecoveryDay: ${recoveryDay}`);
  
  const { data: wods, error } = await supabase
    .from("admin_workouts")
    .select("id, name, equipment, is_workout_of_day")
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
    const hasVarious = wods?.some((w: any) => w.equipment === "VARIOUS");
    if (hasVarious) found.push("VARIOUS");
    else missing.push("VARIOUS");
  } else {
    // Normal day: expect BODYWEIGHT + EQUIPMENT
    const hasBodyweight = wods?.some((w: any) => w.equipment === "BODYWEIGHT");
    const hasEquipment = wods?.some((w: any) => w.equipment === "EQUIPMENT");
    
    if (hasBodyweight) found.push("BODYWEIGHT");
    else missing.push("BODYWEIGHT");
    
    if (hasEquipment) found.push("EQUIPMENT");
    else missing.push("EQUIPMENT");
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
  retryMissing: boolean = false
): Promise<{ success: boolean; error?: string }> {
  try {
    const body: any = {};
    if (retryMissing) {
      body.retryMissing = true;
    }
    
    console.log(`[ORCHESTRATOR] Calling generate-workout-of-day, retryMissing: ${retryMissing}`);
    
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
      console.error(`[ORCHESTRATOR] generate-workout-of-day failed with status ${response.status}:`, responseText);
      return { success: false, error: `HTTP ${response.status}: ${responseText.substring(0, 200)}` };
    }
    
    console.log(`[ORCHESTRATOR] generate-workout-of-day succeeded`);
    return { success: true };
  } catch (error) {
    console.error(`[ORCHESTRATOR] Error calling generate-workout-of-day:`, error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

async function sendAdminAlert(
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
  
  const resend = new Resend(resendApiKey);
  
  const attemptDetails = attempts
    .map((a) => `<li>Attempt ${a.attempt}: ${a.error || "No specific error"}</li>`)
    .join("");
  
  // Recovery = 1 VARIOUS workout, Normal = BODYWEIGHT + EQUIPMENT
  const expectedWorkouts = isRecoveryDay ? "VARIOUS" : "BODYWEIGHT + EQUIPMENT";
  
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 10px;">
        ⚠️ WOD Generation Failed
      </h1>
      
      <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 0; font-weight: bold; color: #dc2626;">
          All ${MAX_ATTEMPTS} automatic retry attempts have failed.
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
      </table>
      
      <h3 style="margin-top: 24px;">Attempt Details:</h3>
      <ul style="background: #f9fafb; padding: 16px 16px 16px 32px; border-radius: 8px;">
        ${attemptDetails}
      </ul>
      
      <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 0; font-weight: bold; color: #92400e;">
          🔧 Action Required:
        </p>
        <p style="margin: 8px 0 0 0; color: #92400e;">
          Go to <strong>Admin → WOD Manager → Generate New WOD</strong> and click <strong>"Regenerate Today"</strong> to manually create the missing workouts.
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
    const result = await resend.emails.send({
      from: "SmartyGym Alerts <onboarding@resend.dev>",
      to: [ADMIN_EMAIL],
      subject: `🚨 URGENT: WOD Generation Failed After ${MAX_ATTEMPTS} Attempts - ${dateStr}`,
      html: emailHtml,
    });
    
    console.log(`[ORCHESTRATOR] Admin alert email sent successfully:`, result);
  } catch (error) {
    console.error(`[ORCHESTRATOR] Failed to send admin alert email:`, error);
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

  const effectiveDate = getCyprusDateStr();
  console.log(`[ORCHESTRATOR] Effective date: ${effectiveDate}`);

  const attempts: { attempt: number; error?: string }[] = [];
  let finalResult: WodVerificationResult | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    console.log(`[ORCHESTRATOR] ===== ATTEMPT ${attempt}/${MAX_ATTEMPTS} =====`);

    // Call generate-workout-of-day
    const isRetry = attempt > 1;
    const generateResult = await callGenerateWod(supabaseUrl, anonKey, isRetry);

    if (!generateResult.success) {
      attempts.push({ attempt, error: generateResult.error });
    } else {
      attempts.push({ attempt });
    }

    // Wait a moment for database to settle
    await delay(2000);

    // Verify WODs exist
    const verification = await verifyWodsExist(supabase, effectiveDate);
    finalResult = verification;

    if (verification.success) {
      console.log(`[ORCHESTRATOR] ✅ SUCCESS on attempt ${attempt} - All required WODs exist`);
      console.log(`[ORCHESTRATOR] Found: ${verification.found.join(", ")}`);

      return new Response(
        JSON.stringify({
          success: true,
          message: `WOD generation successful on attempt ${attempt}`,
          date: effectiveDate,
          found: verification.found,
          attempts: attempt,
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

  // All attempts failed - send admin alert
  console.log(`[ORCHESTRATOR] 🚨 ALL ${MAX_ATTEMPTS} ATTEMPTS FAILED - Sending admin alert`);

  await sendAdminAlert(
    effectiveDate,
    finalResult?.missing || ["UNKNOWN"],
    attempts,
    finalResult?.isRecoveryDay || false
  );

  // Log to notification_audit_log
  await supabase.from("notification_audit_log").insert({
    notification_type: "wod_generation_failure",
    message_type: "email",
    subject: `WOD Generation Failed - ${effectiveDate}`,
    content: `All ${MAX_ATTEMPTS} attempts failed. Missing: ${finalResult?.missing.join(", ")}`,
    recipient_count: 1,
    success_count: 0,
    failed_count: 1,
    metadata: {
      date: effectiveDate,
      missing: finalResult?.missing,
      found: finalResult?.found,
      attempts: attempts,
      isRecoveryDay: finalResult?.isRecoveryDay,
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
    }),
    {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
});
