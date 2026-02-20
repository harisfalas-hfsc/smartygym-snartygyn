import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { getEmailHeaders, getEmailFooter } from "../_shared/email-utils.ts";
import { MESSAGE_TYPES } from "../_shared/notification-types.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function logStep(step: string, details?: any) {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-WOD-NOTIFICATIONS] ${step}${detailsStr}`);
}

// Default fallback content (used if no template exists)
const DEFAULT_DASHBOARD_SUBJECT = "🏆 Today's Workouts: Choose Your Style!";
const DEFAULT_EMAIL_SUBJECT = "🏆 Today's Workouts";

function buildDefaultDashboardContent(category: string, format: string, difficulty: string, difficultyStars: number, bodyweightName: string, equipmentName: string): string {
  return `<p class="tiptap-paragraph">Today is <strong>${category}</strong> day with <strong>TWO</strong> workout options:</p>
<p class="tiptap-paragraph"><strong>🏠 No Equipment:</strong> ${bodyweightName}</p>
<p class="tiptap-paragraph"><strong>🏋️ With Equipment:</strong> ${equipmentName}</p>
<p class="tiptap-paragraph">${format} | ${difficulty} (${difficultyStars}⭐) | Available for €3.99 each or included with Premium.</p>
<p class="tiptap-paragraph"><a href="https://smartygym.com/workout/wod">View Today's Workouts →</a></p>`;
}

function buildDefaultEmailHtml(category: string, format: string, difficulty: string, difficultyStars: number, bodyweightName: string, equipmentName: string, email: string): string {
  return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
<h1 style="color: #29B6D2;">🏆 Today's Workouts</h1>
<p style="font-size: 16px;">Today we have <strong>TWO</strong> workout options for ${category} day:</p>
<div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
  <p style="margin: 10px 0;"><strong>🏠 No Equipment:</strong> ${bodyweightName}</p>
  <p style="margin: 10px 0;"><strong>🏋️ With Equipment:</strong> ${equipmentName}</p>
</div>
<p><strong>Format:</strong> ${format} | <strong>Difficulty:</strong> ${difficulty} (${difficultyStars}⭐)</p>
<p style="color: #666;">Choose based on your situation: at home, traveling, or at the gym!</p>
<p style="margin-top: 20px;">Available for €3.99 each or included with Premium.</p>
<p style="margin-top: 20px;"><a href="https://smartygym.com/workout/wod" style="background: #29B6D2; color: white; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">View Workouts →</a></p>
${getEmailFooter(email, 'wod')}
</div>`;
}

function replacePlaceholders(content: string, replacements: Record<string, string>): string {
  let result = content;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  return result;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting WOD notification delivery (7AM Cyprus time)");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resendClient = new Resend(resendApiKey);

    // Get today's date in Cyprus timezone with dynamic DST handling
    const now = new Date();
    const month = now.getUTCMonth() + 1;
    const cyprusOffset = (month >= 4 && month <= 10) ? 3 : 2;
    const cyprusTime = new Date(now.getTime() + cyprusOffset * 60 * 60 * 1000);
    const todayStr = cyprusTime.toISOString().split('T')[0];

    logStep("Looking for today's WODs", { todayStr });

    // Find today's active WODs
    const { data: todaysWods, error: wodError } = await supabase
      .from("admin_workouts")
      .select("*")
      .eq("is_workout_of_day", true)
      .eq("generated_for_date", todayStr);

    if (wodError) {
      throw new Error(`Failed to fetch WODs: ${wodError.message}`);
    }

    if (!todaysWods || todaysWods.length === 0) {
      logStep("No WODs found for today - checking for any active WODs");
      
      const { data: activeWods } = await supabase
        .from("admin_workouts")
        .select("*")
        .eq("is_workout_of_day", true)
        .limit(2);
      
      if (!activeWods || activeWods.length === 0) {
        logStep("No active WODs found at all");
        return new Response(
          JSON.stringify({ success: true, sent: false, reason: "No WODs to notify about" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }
      
      todaysWods.push(...activeWods);
    }

    const bodyweightWod = todaysWods.find(w => w.equipment === "BODYWEIGHT");
    const equipmentWod = todaysWods.find(w => w.equipment === "EQUIPMENT");
    const category = todaysWods[0]?.category || "Fitness";
    const format = todaysWods[0]?.format || "CIRCUIT";
    const difficulty = todaysWods[0]?.difficulty || "Intermediate";
    const difficultyStars = todaysWods[0]?.difficulty_stars || 3;
    const bodyweightName = bodyweightWod?.name || "Bodyweight Workout";
    const equipmentName = equipmentWod?.name || "Equipment Workout";

    logStep("WODs found", { bodyweight: bodyweightName, equipment: equipmentName, category, format, difficulty });

    // Check if notification was already sent today
    const todayStart = new Date(cyprusTime.getFullYear(), cyprusTime.getMonth(), cyprusTime.getDate()).toISOString();
    const { data: existingNotification } = await supabase
      .from("notification_audit_log")
      .select("id")
      .eq("notification_type", MESSAGE_TYPES.WOD_NOTIFICATION)
      .gte("sent_at", todayStart)
      .limit(1);

    if (existingNotification && existingNotification.length > 0) {
      logStep("WOD notification already sent today, skipping");
      return new Response(
        JSON.stringify({ success: true, sent: false, reason: "Already sent today" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // FETCH EDITABLE TEMPLATE from automated_message_templates
    // Priority: automation_key match + is_default, then automation_key match, then any default
    const { data: templates } = await supabase
      .from("automated_message_templates")
      .select("*")
      .eq("message_type", "announcement_update")
      .eq("is_active", true)
      .order("is_default", { ascending: false })
      .order("updated_at", { ascending: false });

    let template = null;
    if (templates && templates.length > 0) {
      // First try to find template with automation_key = 'workout_of_day'
      const wodTemplates = templates.filter(t => t.automation_key === 'workout_of_day');
      if (wodTemplates.length > 0) {
        template = wodTemplates.find(t => t.is_default) || wodTemplates[0];
      } else {
        // Fallback to any default
        template = templates.find(t => t.is_default) || templates[0];
      }
    }

    logStep("Template selection", { 
      found: !!template, 
      templateName: template?.template_name,
      templateId: template?.id
    });

    // Prepare placeholder replacements
    const placeholders = {
      category,
      format,
      difficulty,
      difficulty_stars: String(difficultyStars),
      bodyweight_workout: bodyweightName,
      equipment_workout: equipmentName,
      workout_count: String(todaysWods.length),
      workout_list: todaysWods.map(w => w.name).join(", "),
      difficulty_line: `${difficulty} (${difficultyStars}⭐)`
    };

    // Build notification content - USE TEMPLATE if available, otherwise fallback
    let dashboardSubject: string;
    let dashboardContent: string;
    let emailSubject: string;

    if (template) {
      // Use template content with placeholder replacement
      dashboardSubject = replacePlaceholders(template.dashboard_subject || template.subject || DEFAULT_DASHBOARD_SUBJECT, placeholders);
      dashboardContent = replacePlaceholders(template.dashboard_content || template.content || buildDefaultDashboardContent(category, format, difficulty, difficultyStars, bodyweightName, equipmentName), placeholders);
      emailSubject = replacePlaceholders(template.email_subject || template.subject || DEFAULT_EMAIL_SUBJECT, placeholders);
      logStep("Using template content", { subject: dashboardSubject });
    } else {
      // Use hardcoded defaults
      dashboardSubject = DEFAULT_DASHBOARD_SUBJECT;
      dashboardContent = buildDefaultDashboardContent(category, format, difficulty, difficultyStars, bodyweightName, equipmentName);
      emailSubject = DEFAULT_EMAIL_SUBJECT;
      logStep("Using default hardcoded content (no template found)");
    }

    // Get all users with their preferences
    const { data: allProfiles } = await supabase
      .from('profiles')
      .select('user_id, notification_preferences');

    const profilesMap = new Map(allProfiles?.map(p => [p.user_id, p.notification_preferences as Record<string, any>]) || []);

    // Filter users who have dashboard_wod enabled (default true)
    const usersForDashboard = allProfiles?.filter(p => {
      const prefs = p.notification_preferences as Record<string, any> || {};
      return prefs.opt_out_all !== true && prefs.dashboard_wod !== false;
    }).map(p => p.user_id) || [];

    if (usersForDashboard.length === 0) {
      logStep("No users subscribed to WOD dashboard notifications");
    } else {
      logStep(`Sending WOD dashboard notifications to ${usersForDashboard.length} users`);
    }

    // Insert dashboard notifications
    if (usersForDashboard.length > 0) {
      await supabase.from('user_system_messages').insert(usersForDashboard.map(userId => ({
        user_id: userId,
        message_type: MESSAGE_TYPES.WOD_NOTIFICATION,
        subject: dashboardSubject,
        content: dashboardContent,
        is_read: false,
      })));

      logStep("Dashboard notifications inserted", { count: usersForDashboard.length });
    }

    // Get user emails for email notifications
    const { data: usersData } = await supabase.auth.admin.listUsers();

    let emailsSent = 0;
    let emailsSkipped = 0;

    for (const authUser of usersData?.users || []) {
      if (!authUser.email) continue;

      const prefs = profilesMap.get(authUser.id) || {};

      if (prefs.opt_out_all === true || prefs.email_wod === false) {
        logStep(`Skipping WOD email for ${authUser.email} (opted out)`);
        emailsSkipped++;
        continue;
      }

      try {
        // Build email HTML - use template if available
        let emailHtml: string;
        if (template && template.email_content) {
          emailHtml = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
${replacePlaceholders(template.email_content, placeholders)}
${getEmailFooter(authUser.email, 'wod')}
</div>`;
        } else {
          emailHtml = buildDefaultEmailHtml(category, format, difficulty, difficultyStars, bodyweightName, equipmentName, authUser.email);
        }

        const emailResult = await resendClient.emails.send({
          from: 'SmartyGym <notifications@smartygym.com>',
          to: [authUser.email],
          subject: emailSubject,
          headers: getEmailHeaders(authUser.email, 'wod'),
          html: emailHtml,
        });

        if (emailResult.error) {
          logStep("Email API error", { email: authUser.email, error: emailResult.error });
        } else {
          emailsSent++;
          await new Promise(resolve => setTimeout(resolve, 600));
        }
      } catch (e) {
        logStep("Email send error", { email: authUser.email, error: e });
      }
    }

    // Add audit log entry with automation_key for proper history tracking
    // Use 'wod' which matches the database constraint (not 'wod_notification')
    const { error: auditError } = await supabase.from('notification_audit_log').insert({
      notification_type: 'wod',
      message_type: MESSAGE_TYPES.WOD_NOTIFICATION,
      recipient_count: usersForDashboard.length,
      success_count: emailsSent,
      failed_count: emailsSkipped,
      subject: dashboardSubject,
      content: `WOD notification sent - ${emailsSent} emails, ${usersForDashboard.length} dashboard messages. Template: ${template?.template_name || 'default'}`,
      sent_at: new Date().toISOString(),
      metadata: {
        automation_key: 'morning_wod_notification',
        template_id: template?.id || null,
        template_name: template?.template_name || 'default',
        wods: { bodyweight: bodyweightName, equipment: equipmentName, category, format }
      }
    });

    if (auditError) {
      logStep("WARNING: Failed to insert audit log", { error: auditError.message });
    }

    logStep(`✅ Notifications complete: ${usersForDashboard.length} dashboard, ${emailsSent} emails sent, ${emailsSkipped} skipped`);

    return new Response(
      JSON.stringify({
        success: true,
        dashboardNotifications: usersForDashboard.length,
        emailsSent,
        emailsSkipped,
        templateUsed: template?.template_name || 'default',
        wods: { bodyweight: bodyweightName, equipment: equipmentName, category, format }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logStep("ERROR", { message: errorMessage });

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
