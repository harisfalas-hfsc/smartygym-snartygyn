import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { wrapInEmailTemplate } from "../_shared/email-utils.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[SEND-WEEKLY-MOTIVATION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("🚀 Function invoked - starting Monday motivational messages");
    logStep("📅 Current time", { now: new Date().toISOString(), dayOfWeek: new Date().getDay() });

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get automation rule configuration
    logStep("🔍 Fetching automation rule for monday_motivation");
    const { data: automationRule, error: ruleError } = await supabaseAdmin
      .from("automation_rules")
      .select("*")
      .eq("automation_key", "monday_motivation")
      .eq("is_active", true)
      .single();

    if (ruleError) {
      logStep("❌ Error fetching automation rule", { error: ruleError.message });
    }

    if (!automationRule) {
      logStep("⚠️ Monday motivation automation is disabled or not found");
      return new Response(
        JSON.stringify({ success: false, reason: "Automation disabled" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("✅ Automation rule found", { 
      id: automationRule.id,
      sendsDashboard: automationRule.sends_dashboard_message, 
      sendsEmail: automationRule.sends_email,
      lastTriggered: automationRule.last_triggered_at,
      totalExecutions: automationRule.total_executions
    });

    // Get the motivational template
    logStep("🔍 Fetching motivational_weekly template");
    const { data: template, error: templateError } = await supabaseAdmin
      .from("automated_message_templates")
      .select("subject, content")
      .eq("message_type", "motivational_weekly")
      .eq("is_active", true)
      .single();

    if (templateError) {
      logStep("❌ Error fetching template", { error: templateError.message });
    }

    if (!template) {
      logStep("⚠️ No active motivational template found");
      return new Response(
        JSON.stringify({ success: false, reason: "No template configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("✅ Template found", { subject: template.subject });

    // Get ALL users
    logStep("🔍 Fetching all users");
    const { data: users, error: usersError } = await supabaseAdmin
      .from("profiles")
      .select("user_id, full_name");

    if (usersError) {
      logStep("❌ Error fetching users", { error: usersError.message });
      throw usersError;
    }

    logStep("👥 Found users", { count: users?.length || 0 });

    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({ message: "No users to send messages to" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let dashboardSent = 0;
    let emailsSent = 0;
    let skipped = 0;
    let failed = 0;
    const emailErrors: string[] = [];

    // Check for duplicates - don't send if already sent today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    logStep("🔍 Checking for messages already sent today", { todayStart: today.toISOString() });
    
    const { data: existingMessages, error: existingError } = await supabaseAdmin
      .from('user_system_messages')
      .select('user_id')
      .eq('message_type', 'motivational_weekly')
      .gte('created_at', today.toISOString());

    if (existingError) {
      logStep("⚠️ Error checking existing messages", { error: existingError.message });
    }

    const alreadySentUserIds = new Set(existingMessages?.map(m => m.user_id) || []);
    logStep("📊 Already sent today", { count: alreadySentUserIds.size });

    // Initialize Resend if sending emails
    let resend: Resend | null = null;
    if (automationRule.sends_email) {
      const resendApiKey = Deno.env.get("RESEND_API_KEY");
      if (!resendApiKey) {
        logStep("❌ RESEND_API_KEY not configured - emails will not be sent");
      } else {
        resend = new Resend(resendApiKey);
      }
    }

    for (const user of users) {
      // Skip if already sent today
      if (alreadySentUserIds.has(user.user_id)) {
        skipped++;
        continue;
      }

      try {
        // Send dashboard message
        if (automationRule.sends_dashboard_message) {
          const { error: msgError } = await supabaseAdmin
            .from("user_system_messages")
            .insert({
              user_id: user.user_id,
              message_type: "motivational_weekly",
              subject: template.subject,
              content: template.content,
              is_read: false,
            });

          if (msgError) {
            logStep("❌ Dashboard message error", { userId: user.user_id, error: msgError.message });
            failed++;
          } else {
            dashboardSent++;
          }
        }

        // Send email
        if (automationRule.sends_email && resend) {
          const { data: userData, error: userDataError } = await supabaseAdmin.auth.admin.getUserById(user.user_id);
          
          if (userDataError) {
            logStep("⚠️ Error fetching user email", { userId: user.user_id, error: userDataError.message });
            continue;
          }
          
          const userEmail = userData?.user?.email;

          if (userEmail) {
            try {
              // Check notification preferences
              const { data: profile } = await supabaseAdmin
                .from("profiles")
                .select("notification_preferences")
                .eq("user_id", user.user_id)
                .single();

              const prefs = profile?.notification_preferences as any;
              const emailEnabled = prefs?.email_notifications !== false && prefs?.newsletter !== false;

              if (!emailEnabled) {
                logStep("⏭️ Email disabled for user", { userId: user.user_id });
                continue;
              }

              // Use the email utility to convert tiptap HTML to email-compatible HTML
              const emailHtml = wrapInEmailTemplate(
                template.subject,
                template.content,
                "https://smartygym.com/workout",
                "Browse Workouts →"
              );

              await resend.emails.send({
                from: "SmartyGym <notifications@smartygym.com>",
                to: [userEmail],
                subject: template.subject,
                html: emailHtml,
              });
              emailsSent++;
            } catch (emailError: any) {
              const errorMsg = emailError.message || String(emailError);
              logStep("❌ Email send error", { userId: user.user_id, email: userEmail, error: errorMsg });
              emailErrors.push(`${userEmail}: ${errorMsg}`);
            }
          }
        }
      } catch (error: any) {
        failed++;
        logStep("❌ Error processing user", { userId: user.user_id, error: error.message });
      }
    }

    // Update automation rule execution count
    logStep("📊 Updating automation rule stats");
    const { error: updateError } = await supabaseAdmin
      .from("automation_rules")
      .update({
        last_triggered_at: new Date().toISOString(),
        total_executions: (automationRule.total_executions || 0) + dashboardSent,
      })
      .eq("id", automationRule.id);

    if (updateError) {
      logStep("⚠️ Error updating automation rule", { error: updateError.message });
    }

    // Log to audit
    logStep("📝 Logging to audit");
    await supabaseAdmin.from('notification_audit_log').insert({
      notification_type: 'monday_motivation',
      message_type: 'motivational_weekly',
      recipient_count: users.length,
      success_count: dashboardSent,
      failed_count: failed,
      subject: template.subject,
      content: template.content,
      metadata: {
        emails_sent: emailsSent,
        skipped_already_sent: skipped,
        email_errors: emailErrors.length > 0 ? emailErrors : undefined
      }
    });

    logStep("🎉 Processing completed", { 
      totalUsers: users.length,
      dashboardSent, 
      emailsSent, 
      skipped,
      failed,
      emailErrors: emailErrors.length
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        totalUsers: users.length,
        dashboardSent, 
        emailsSent,
        skipped,
        failed,
        emailErrors: emailErrors.length > 0 ? emailErrors : undefined
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("💥 FATAL ERROR", { message: errorMessage, stack: error instanceof Error ? error.stack : undefined });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
