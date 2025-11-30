import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[SEND-RENEWAL-REMINDERS] Starting subscription expiration check");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get automation rule configuration
    const { data: automationRule } = await supabaseAdmin
      .from("automation_rules")
      .select("*")
      .eq("automation_key", "subscription_expiration")
      .eq("is_active", true)
      .single();

    if (!automationRule) {
      console.log("[SEND-RENEWAL-REMINDERS] Automation is disabled");
      return new Response(
        JSON.stringify({ success: false, reason: "Automation disabled" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    // Get subscriptions expiring in exactly 3 days
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const startOfDay = new Date(threeDaysFromNow);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(threeDaysFromNow);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: expiringSubscriptions, error: subsError } = await supabaseAdmin
      .from("user_subscriptions")
      .select("user_id, plan_type, current_period_end")
      .eq("status", "active")
      .neq("plan_type", "free")
      .gte("current_period_end", startOfDay.toISOString())
      .lte("current_period_end", endOfDay.toISOString());

    if (subsError) throw subsError;

    console.log(`[SEND-RENEWAL-REMINDERS] Found ${expiringSubscriptions?.length || 0} expiring subscriptions`);

    if (!expiringSubscriptions || expiringSubscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: "No subscriptions expiring in 3 days" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get renewal reminder template
    const { data: template } = await supabaseAdmin
      .from("automated_message_templates")
      .select("subject, content")
      .eq("message_type", "renewal_reminder")
      .eq("is_active", true)
      .single();

    if (!template) {
      console.log("[SEND-RENEWAL-REMINDERS] No active template found");
      return new Response(
        JSON.stringify({ success: false, reason: "No template configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let dashboardSent = 0;
    let emailsSent = 0;

    for (const subscription of expiringSubscriptions) {
      try {
        const renewalDate = new Date(subscription.current_period_end).toLocaleDateString();
        const planName = subscription.plan_type.charAt(0).toUpperCase() + subscription.plan_type.slice(1);

        // Replace placeholders
        const subject = template.subject;
        const content = template.content
          .replace(/{planName}/g, planName)
          .replace(/{date}/g, renewalDate);

        // Check if already sent today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { data: existing } = await supabaseAdmin
          .from('user_system_messages')
          .select('id')
          .eq('user_id', subscription.user_id)
          .eq('message_type', 'renewal_reminder')
          .gte('created_at', today.toISOString())
          .limit(1);

        if (existing && existing.length > 0) {
          console.log(`[SEND-RENEWAL-REMINDERS] Skipping user ${subscription.user_id} - already notified today`);
          continue;
        }

        // Send dashboard message
        if (automationRule.sends_dashboard_message) {
          const { error: msgError } = await supabaseAdmin
            .from("user_system_messages")
            .insert({
              user_id: subscription.user_id,
              message_type: "renewal_reminder",
              subject: subject,
              content: content,
              is_read: false,
            });

          if (!msgError) dashboardSent++;
        }

        // Send email
        if (automationRule.sends_email) {
          const { data: userData } = await supabaseAdmin.auth.admin.getUserById(subscription.user_id);
          const userEmail = userData?.user?.email;

          if (userEmail) {
            try {
              await resend.emails.send({
                from: "SmartyGym <onboarding@resend.dev>",
                to: [userEmail],
                subject: subject,
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #d4af37;">${subject}</h1>
                    <div style="font-size: 16px; line-height: 1.6;">${content}</div>
                    <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;">
                    <p style="font-size: 12px; color: #666;">This email was sent from SmartyGym.</p>
                  </div>
                `,
              });
              emailsSent++;
            } catch (emailError) {
              console.error(`[SEND-RENEWAL-REMINDERS] Email error for ${userEmail}:`, emailError);
            }
          }
        }

        console.log(`[SEND-RENEWAL-REMINDERS] ✅ Notified user ${subscription.user_id}`);
      } catch (error) {
        console.error(`[SEND-RENEWAL-REMINDERS] Error for user ${subscription.user_id}:`, error);
      }
    }

    // Update automation rule execution count
    await supabaseAdmin
      .from("automation_rules")
      .update({
        last_triggered_at: new Date().toISOString(),
        total_executions: (automationRule.total_executions || 0) + dashboardSent,
      })
      .eq("id", automationRule.id);

    // Log to audit
    await supabaseAdmin.from('notification_audit_log').insert({
      notification_type: 'subscription_expiration',
      message_type: 'renewal_reminder',
      recipient_count: expiringSubscriptions.length,
      success_count: dashboardSent,
      failed_count: 0,
      subject: template.subject,
      content: template.content,
    });

    console.log(`[SEND-RENEWAL-REMINDERS] ✅ Completed: ${dashboardSent} dashboard, ${emailsSent} emails`);

    return new Response(
      JSON.stringify({ success: true, dashboardSent, emailsSent }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[SEND-RENEWAL-REMINDERS] ERROR:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});