import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { wrapInEmailTemplate } from "../_shared/email-utils.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[SEND-WEEKLY-MOTIVATION] Starting Monday motivational messages");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get automation rule configuration
    const { data: automationRule } = await supabaseAdmin
      .from("automation_rules")
      .select("*")
      .eq("automation_key", "monday_motivation")
      .eq("is_active", true)
      .single();

    if (!automationRule) {
      console.log("[SEND-WEEKLY-MOTIVATION] Automation is disabled");
      return new Response(
        JSON.stringify({ success: false, reason: "Automation disabled" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    // Get the motivational template
    const { data: template } = await supabaseAdmin
      .from("automated_message_templates")
      .select("subject, content")
      .eq("message_type", "motivational_weekly")
      .eq("is_active", true)
      .single();

    if (!template) {
      console.log("[SEND-WEEKLY-MOTIVATION] No active template found");
      return new Response(
        JSON.stringify({ success: false, reason: "No template configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get ALL users (visitors with accounts, subscribers, premium)
    const { data: users, error: usersError } = await supabaseAdmin
      .from("profiles")
      .select("user_id");

    if (usersError) throw usersError;

    console.log(`[SEND-WEEKLY-MOTIVATION] Found ${users?.length || 0} users`);

    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({ message: "No users to send messages to" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let dashboardSent = 0;
    let emailsSent = 0;
    let failed = 0;

    // Check for duplicates - don't send if already sent today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: existingMessages } = await supabaseAdmin
      .from('user_system_messages')
      .select('user_id')
      .eq('message_type', 'motivational_weekly')
      .gte('created_at', today.toISOString());

    const alreadySentUserIds = new Set(existingMessages?.map(m => m.user_id) || []);

    for (const user of users) {
      // Skip if already sent today
      if (alreadySentUserIds.has(user.user_id)) {
        console.log(`[SEND-WEEKLY-MOTIVATION] Skipping user ${user.user_id} - already sent today`);
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

          if (!msgError) dashboardSent++;
        }

        // Send email
        if (automationRule.sends_email) {
          const { data: userData } = await supabaseAdmin.auth.admin.getUserById(user.user_id);
          const userEmail = userData?.user?.email;

          if (userEmail) {
            try {
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
            } catch (emailError) {
              console.error(`[SEND-WEEKLY-MOTIVATION] Email error for ${userEmail}:`, emailError);
            }
          }
        }
      } catch (error) {
        failed++;
        console.error(`[SEND-WEEKLY-MOTIVATION] Error for user ${user.user_id}:`, error);
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
      notification_type: 'monday_motivation',
      message_type: 'motivational_weekly',
      recipient_count: users.length,
      success_count: dashboardSent,
      failed_count: failed,
      subject: template.subject,
      content: template.content,
    });

    console.log(`[SEND-WEEKLY-MOTIVATION] ✅ Completed: ${dashboardSent} dashboard, ${emailsSent} emails, ${failed} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        dashboardSent, 
        emailsSent,
        failed
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[SEND-WEEKLY-MOTIVATION] ERROR:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
