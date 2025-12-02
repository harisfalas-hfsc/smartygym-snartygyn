import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

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
    logStep("Function started");

    const { record } = await req.json();
    logStep("Processing new user", { userId: record.user_id });

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get user email
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(record.user_id);
    if (userError) throw userError;
    
    const userEmail = userData.user.email;
    if (!userEmail) throw new Error("User email not found");
    
    const userName = record.full_name || "there";
    
    logStep("User details fetched", { email: userEmail, name: userName });

    // Get automation rule configuration
    const { data: automationRule } = await supabaseAdmin
      .from("automation_rules")
      .select("*")
      .eq("automation_key", "welcome_message")
      .eq("is_active", true)
      .single();

    if (!automationRule) {
      logStep("Welcome automation is disabled or not configured");
      return new Response(
        JSON.stringify({ success: false, reason: "Welcome automation disabled" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get welcome message template
    const { data: template } = await supabaseAdmin
      .from("automated_message_templates")
      .select("subject, content")
      .eq("message_type", "welcome")
      .eq("is_active", true)
      .eq("is_default", true)
      .single();

    if (!template) {
      logStep("No active welcome template found");
      return new Response(
        JSON.stringify({ success: false, reason: "No welcome template configured" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if user already received welcome message
    const { data: existing } = await supabaseAdmin
      .from('user_system_messages')
      .select('id')
      .eq('user_id', record.user_id)
      .eq('message_type', 'welcome')
      .limit(1);

    if (existing && existing.length > 0) {
      logStep("User already received welcome message, skipping");
      return new Response(
        JSON.stringify({ success: false, reason: "Welcome message already sent" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send dashboard message immediately
    if (automationRule.sends_dashboard_message) {
      const { error: msgError } = await supabaseAdmin
        .from("user_system_messages")
        .insert({
          user_id: record.user_id,
          message_type: "welcome",
          subject: template.subject,
          content: template.content,
          is_read: false,
        });

      if (msgError) {
        logStep("ERROR inserting dashboard message", { error: msgError });
      } else {
        logStep("✅ Dashboard message sent");
      }
    }

    // Send email immediately
    if (automationRule.sends_email) {
      const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
      
      try {
        await resend.emails.send({
          from: "SmartyGym <onboarding@resend.dev>",
          to: [userEmail],
          subject: template.subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #d4af37; margin-bottom: 20px;">Welcome to SmartyGym! 🎉</h1>
              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">Hi ${userName},</p>
              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">We're thrilled to have you join our community of fitness enthusiasts.</p>
              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 12px;"><strong>Here's what you can do right now:</strong></p>
              <ul style="font-size: 16px; line-height: 1.8; margin-bottom: 24px; padding-left: 20px;">
                <li><strong>Browse 500+ Expert Workouts</strong> – From strength to cardio, we have everything</li>
                <li><strong>Follow Structured Training Programs</strong> – Achieve your goals with proven plans</li>
                <li><strong>Track Your Progress</strong> – Save favorites, mark completed workouts</li>
                <li><strong>Get Daily Workout of the Day</strong> – Fresh workout every morning at 7:00 AM</li>
              </ul>
              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">Ready to start your fitness journey?</p>
              <p style="margin-top: 24px;">
                <a href="https://smartygym.com/dashboard" style="display: inline-block; background: #d4af37; color: white; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">Go to Your Dashboard →</a>
              </p>
              <p style="font-size: 16px; line-height: 1.6; margin-top: 24px;">Let's make every workout count!</p>
              <p style="font-size: 16px; font-weight: bold; margin-top: 20px;">– The SmartyGym Team</p>
              <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;">
              <p style="font-size: 12px; color: #999;">This email was sent from SmartyGym.</p>
            </div>
          `,
        });
        logStep("✅ Email sent");
      } catch (emailError) {
        logStep("ERROR sending email", { error: emailError });
      }
    }

    // Update automation rule execution count
    await supabaseAdmin
      .from("automation_rules")
      .update({
        last_triggered_at: new Date().toISOString(),
        total_executions: (automationRule.total_executions || 0) + 1,
      })
      .eq("id", automationRule.id);

    logStep("Welcome message sent successfully");

    return new Response(
      JSON.stringify({ success: true, message: "Welcome message sent immediately" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});