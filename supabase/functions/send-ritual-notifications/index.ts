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
  console.log(`[SEND-RITUAL-NOTIFICATIONS] ${step}${detailsStr}`);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting Ritual notification delivery (7:05 AM Cyprus time)");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resendClient = new Resend(resendApiKey);

    // Get today's date in Cyprus timezone
    const now = new Date();
    const cyprusOffset = 2;
    const cyprusTime = new Date(now.getTime() + cyprusOffset * 60 * 60 * 1000);
    const todayStr = cyprusTime.toISOString().split('T')[0];

    logStep("Looking for today's ritual", { todayStr });

    // Find today's ritual
    const { data: todaysRitual, error: ritualError } = await supabase
      .from("daily_smarty_rituals")
      .select("*")
      .eq("ritual_date", todayStr)
      .single();

    if (ritualError || !todaysRitual) {
      logStep("No ritual found for today", { error: ritualError?.message });
      return new Response(
        JSON.stringify({ success: true, sent: false, reason: "No ritual for today" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    logStep("Ritual found", { dayNumber: todaysRitual.day_number, ritualDate: todaysRitual.ritual_date });

    // Check if notification was already sent today
    const todayStart = new Date(cyprusTime.getFullYear(), cyprusTime.getMonth(), cyprusTime.getDate()).toISOString();
    const { data: existingNotification } = await supabase
      .from("notification_audit_log")
      .select("id")
      .eq("notification_type", MESSAGE_TYPES.DAILY_RITUAL)
      .gte("sent_at", todayStart)
      .limit(1);

    if (existingNotification && existingNotification.length > 0) {
      logStep("Ritual notification already sent today, skipping");
      return new Response(
        JSON.stringify({ success: true, sent: false, reason: "Already sent today" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Get all users with their preferences
    const { data: allProfiles } = await supabase
      .from('profiles')
      .select('user_id, notification_preferences');

    const profilesMap = new Map(allProfiles?.map(p => [p.user_id, p.notification_preferences as Record<string, any>]) || []);

    // Filter users who have dashboard_ritual enabled (default true)
    const usersForDashboard = allProfiles?.filter(p => {
      const prefs = p.notification_preferences as Record<string, any> || {};
      return prefs.opt_out_all !== true && prefs.dashboard_ritual !== false;
    }).map(p => p.user_id) || [];

    if (usersForDashboard.length === 0) {
      logStep("No users subscribed to Ritual dashboard notifications");
    } else {
      logStep(`Sending Ritual dashboard notifications to ${usersForDashboard.length} users`);
    }

    const notificationTitle = `🌅 Day ${todaysRitual.day_number} Smarty Ritual is Ready!`;
    const notificationContent = `<p class="tiptap-paragraph"><strong>🌅 Good Morning, Smarty!</strong></p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph">Your Day ${todaysRitual.day_number} Smarty Ritual is ready!</p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph">Start your day with intention through our three wellness rituals:</p>
<p class="tiptap-paragraph">☀️ <strong>Morning</strong> - Energize your start</p>
<p class="tiptap-paragraph">🌤️ <strong>Midday</strong> - Recharge and refocus</p>
<p class="tiptap-paragraph">🌙 <strong>Evening</strong> - Wind down peacefully</p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph"><a href="https://smartygym.com/daily-ritual">View Today's Ritual →</a></p>`;

    // Insert dashboard notifications only for subscribed users
    if (usersForDashboard.length > 0) {
      await supabase.from('user_system_messages').insert(usersForDashboard.map(userId => ({
        user_id: userId,
        message_type: MESSAGE_TYPES.DAILY_RITUAL,
        subject: notificationTitle,
        content: notificationContent,
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

      // Check if user has opted out or disabled Ritual emails
      if (prefs.opt_out_all === true || prefs.email_ritual === false) {
        logStep(`Skipping Ritual email for ${authUser.email} (opted out)`);
        emailsSkipped++;
        continue;
      }

      try {
        const emailResult = await resendClient.emails.send({
          from: 'SmartyGym <notifications@smartygym.com>',
          to: [authUser.email],
          subject: notificationTitle,
          headers: getEmailHeaders(authUser.email, 'ritual'),
          html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
<h1 style="color: #29B6D2;">🌅 Good Morning, Smarty!</h1>
<p style="font-size: 16px;">Your <strong>Day ${todaysRitual.day_number}</strong> Smarty Ritual is ready!</p>
<p style="color: #666;">Start your day with intention through our three wellness rituals:</p>
<div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
  <p style="margin: 10px 0;">☀️ <strong>Morning</strong> - Energize your start</p>
  <p style="margin: 10px 0;">🌤️ <strong>Midday</strong> - Recharge and refocus</p>
  <p style="margin: 10px 0;">🌙 <strong>Evening</strong> - Wind down peacefully</p>
</div>
<p style="margin-top: 20px;"><a href="https://smartygym.com/daily-ritual" style="background: #29B6D2; color: white; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">View Today's Ritual →</a></p>
${getEmailFooter(authUser.email, 'ritual')}
</div>`,
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

    // Add audit log entry
    await supabase.from('notification_audit_log').insert({
      notification_type: MESSAGE_TYPES.DAILY_RITUAL,
      message_type: MESSAGE_TYPES.DAILY_RITUAL,
      recipient_count: usersForDashboard.length,
      success_count: emailsSent,
      failed_count: emailsSkipped,
      subject: notificationTitle,
      content: `Ritual notification sent - ${emailsSent} emails, ${usersForDashboard.length} dashboard messages`,
      sent_at: new Date().toISOString(),
    });

    logStep(`✅ Notifications complete: ${usersForDashboard.length} dashboard, ${emailsSent} emails sent`);

    return new Response(
      JSON.stringify({
        success: true,
        dashboardNotifications: usersForDashboard.length,
        emailsSent,
        emailsSkipped,
        ritual: {
          dayNumber: todaysRitual.day_number,
          date: todaysRitual.ritual_date
        }
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
