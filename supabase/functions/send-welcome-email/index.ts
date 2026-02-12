import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { getEmailHeaders, getEmailFooter } from "../_shared/email-utils.ts";
import { MESSAGE_TYPES } from "../_shared/notification-types.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[SEND-WELCOME-EMAIL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function invoked - starting welcome email process");

    let record: any;
    try {
      const body = await req.json();
      record = body.record;
      logStep("Request body parsed", { hasRecord: !!record });
    } catch (parseError) {
      logStep("Failed to parse request body", { error: String(parseError) });
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!record || !record.user_id) {
      logStep("No user_id in record", { record });
      return new Response(
        JSON.stringify({ error: "No user_id provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Processing new user", { userId: record.user_id, fullName: record.full_name });

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get user email and check confirmation status
    logStep("Fetching user email from auth");
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(record.user_id);
    if (userError) {
      logStep("Error fetching user", { error: userError.message });
      throw userError;
    }
    
    const userEmail = userData.user.email;
    if (!userEmail) {
      logStep("User email not found");
      throw new Error("User email not found");
    }

    // Safety net: skip if user email is not confirmed
    if (!userData.user.email_confirmed_at) {
      logStep("User email not confirmed yet, skipping welcome email", { email: userEmail });
      return new Response(
        JSON.stringify({ success: false, reason: "Email not confirmed" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const userName = record.full_name || "there";
    logStep("User details fetched", { email: userEmail, name: userName });

    // Get automation rule configuration
    logStep("Fetching automation rule");
    const { data: automationRule, error: ruleError } = await supabaseAdmin
      .from("automation_rules")
      .select("*")
      .eq("automation_key", "welcome_message")
      .eq("is_active", true)
      .single();

    if (ruleError) {
      logStep("Error fetching automation rule", { error: ruleError.message });
    }

    if (!automationRule) {
      logStep("Welcome automation is disabled or not configured");
      return new Response(
        JSON.stringify({ success: false, reason: "Welcome automation disabled" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Automation rule found", { 
      sendsDashboard: automationRule.sends_dashboard_message, 
      sendsEmail: automationRule.sends_email 
    });

    // Get welcome message template
    logStep("Fetching welcome template");
    const { data: template, error: templateError } = await supabaseAdmin
      .from("automated_message_templates")
      .select("subject, content")
      .eq("message_type", MESSAGE_TYPES.WELCOME)
      .eq("is_active", true)
      .eq("is_default", true)
      .single();

    if (templateError) {
      logStep("Error fetching template", { error: templateError.message });
    }

    if (!template) {
      logStep("No active welcome template found");
      return new Response(
        JSON.stringify({ success: false, reason: "No welcome template configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Template found", { subject: template.subject });

    // Check if user already received welcome message
    logStep("Checking for existing welcome message");
    const { data: existing, error: existingError } = await supabaseAdmin
      .from('user_system_messages')
      .select('id')
      .eq('user_id', record.user_id)
      .eq('message_type', MESSAGE_TYPES.WELCOME)
      .limit(1);

    if (existingError) {
      logStep("Error checking existing messages", { error: existingError.message });
    }

    if (existing && existing.length > 0) {
      logStep("User already received welcome message, skipping");
      return new Response(
        JSON.stringify({ success: false, reason: "Welcome message already sent" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let dashboardSent = false;
    let emailSent = false;

    // Send dashboard message immediately using upsert to prevent duplicates
    // The database has a unique index on (user_id, message_type) WHERE message_type = 'welcome'
    if (automationRule.sends_dashboard_message) {
      logStep("Sending dashboard message (with conflict handling)");
      const { data: insertData, error: msgError } = await supabaseAdmin
        .from("user_system_messages")
        .insert({
          user_id: record.user_id,
          message_type: MESSAGE_TYPES.WELCOME,
          subject: template.subject,
          content: template.content,
          is_read: false,
        })
        .select('id')
        .maybeSingle();

      if (msgError) {
        // Check if it's a duplicate key error (race condition - another instance won)
        if (msgError.code === '23505') {
          logStep("Welcome message already exists (race condition prevented)", { userId: record.user_id });
          return new Response(
            JSON.stringify({ success: false, reason: "Welcome message already sent (concurrent request)" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        logStep("Error inserting dashboard message", { error: msgError.message });
      } else if (insertData) {
        dashboardSent = true;
        logStep("Dashboard message sent successfully");
      } else {
        logStep("No insert occurred (duplicate prevented)");
        return new Response(
          JSON.stringify({ success: false, reason: "Welcome message already sent" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Send email immediately
    if (automationRule.sends_email) {
      logStep("Sending welcome email");
      const resendApiKey = Deno.env.get("RESEND_API_KEY");
      
      if (!resendApiKey) {
        logStep("RESEND_API_KEY not configured");
      } else {
        const resend = new Resend(resendApiKey);
        const footer = getEmailFooter(userEmail);
        
        try {
          const emailResult = await resend.emails.send({
            from: "SmartyGym <notifications@smartygym.com>",
            reply_to: "support@smartygym.com",
            to: [userEmail],
            subject: template.subject,
            headers: getEmailHeaders(userEmail),
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
                  <tr>
                    <td style="padding: 20px;">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px;">
                        <tr>
                          <td style="padding: 32px;">
                            <h1 style="color: #29B6D2; margin-bottom: 20px;">Welcome to SmartyGym! 🎉</h1>
                            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">Hi ${userName},</p>
                            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">We're thrilled to have you join our community of fitness enthusiasts!</p>
                            
                            <div style="background-color: #FEE2E2; border: 2px solid #EF4444; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                              <p style="font-size: 16px; font-weight: bold; color: #DC2626; margin: 0 0 8px 0;">⚠️ IMPORTANT: Complete Your Health Assessment</p>
                              <p style="font-size: 14px; color: #7F1D1D; margin: 0 0 12px 0;">Before starting any workout, please complete the <strong>PAR-Q (Physical Activity Readiness Questionnaire)</strong> to ensure you can exercise safely. This is a <strong>mandatory</strong> health assessment that takes only 2 minutes.</p>
                              <p style="margin: 0;">
                                <a href="https://smartygym.com/disclaimer#parq" style="display: inline-block; background: #DC2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px;">👉 Complete Your PAR-Q Test Now</a>
                              </p>
                            </div>
                            
                            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 12px;"><strong>Here's what you can explore:</strong></p>
                            <ul style="font-size: 16px; line-height: 1.8; margin-bottom: 24px; padding-left: 20px;">
                              <li><strong>Browse 500+ Expert Workouts</strong> – From strength to cardio, we have everything</li>
                              <li><strong>Follow Structured Training Programs</strong> – Achieve your goals with proven plans</li>
                              <li><strong>Track Your Progress</strong> – Save favorites, mark completed workouts</li>
                              <li><strong>Get Daily Workout of the Day</strong> – Fresh workout every morning at 7:00 AM</li>
                            </ul>
                            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">Ready to start your fitness journey safely?</p>
                            <p style="margin-top: 24px;">
                              <a href="https://smartygym.com/userdashboard" style="display: inline-block; background: #29B6D2; color: white; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">Go to Your Dashboard</a>
                            </p>
                            <p style="font-size: 16px; line-height: 1.6; margin-top: 24px;">Let's make every workout count! 💪</p>
                            <p style="font-size: 16px; font-weight: bold; margin-top: 20px;">– The SmartyGym Team</p>
                            ${footer}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </body>
              </html>
            `,
          });
          emailSent = true;
          logStep("Email sent successfully", { emailId: emailResult?.data?.id });
        } catch (emailError: any) {
          logStep("Error sending email", { error: emailError.message || String(emailError) });
        }
      }
    }

    // Update automation rule execution count
    logStep("Updating automation rule stats");
    const { error: updateError } = await supabaseAdmin
      .from("automation_rules")
      .update({
        last_triggered_at: new Date().toISOString(),
        total_executions: (automationRule.total_executions || 0) + 1,
      })
      .eq("id", automationRule.id);

    if (updateError) {
      logStep("Error updating automation rule", { error: updateError.message });
    }

    // Log to audit
    logStep("Logging to audit");
    await supabaseAdmin.from('notification_audit_log').insert({
      notification_type: 'welcome_email',
      message_type: MESSAGE_TYPES.WELCOME,
      subject: template.subject,
      content: template.content,
      recipient_count: 1,
      success_count: (dashboardSent ? 1 : 0) + (emailSent ? 1 : 0),
      failed_count: (!dashboardSent && automationRule.sends_dashboard_message ? 1 : 0) + (!emailSent && automationRule.sends_email ? 1 : 0),
      metadata: {
        user_id: record.user_id,
        user_email: userEmail,
        dashboard_sent: dashboardSent,
        email_sent: emailSent
      }
    });

    logStep("Welcome message process completed", { dashboardSent, emailSent });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Welcome message sent", 
        dashboardSent, 
        emailSent 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("FATAL ERROR", { message: errorMessage, stack: error instanceof Error ? error.stack : undefined });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
