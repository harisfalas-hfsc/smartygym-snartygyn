import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

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
    logStep("Function started - Monday motivational messages");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get automation rule configuration
    const { data: automationRule } = await supabaseAdmin
      .from("automation_rules")
      .select("*")
      .eq("automation_key", "weekly_motivation")
      .eq("is_active", true)
      .single();

    if (!automationRule) {
      logStep("Weekly motivation automation is disabled");
      return new Response(
        JSON.stringify({ success: false, reason: "Weekly motivation automation disabled" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    // Get a random active motivational template
    const { data: templates } = await supabaseAdmin
      .from("automated_message_templates")
      .select("subject, content")
      .eq("message_type", "motivational_weekly")
      .eq("is_active", true);

    if (!templates || templates.length === 0) {
      logStep("No active motivational templates found");
      return new Response(
        JSON.stringify({ success: false, reason: "No motivational templates configured" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Select a random template for variety
    const template = templates[Math.floor(Math.random() * templates.length)];
    logStep("Selected template", { subject: template.subject });

    // Get all active users
    const { data: users, error: usersError } = await supabaseAdmin
      .from("profiles")
      .select("user_id");

    if (usersError) throw usersError;

    logStep("Found active users", { count: users?.length || 0 });

    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({ message: "No users to send motivational messages to" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let messagesSent = 0;
    let messagesFailed = 0;

    for (const user of users) {
      try {
        // Check user notification preferences
        const { data: preferences } = await supabaseAdmin
          .from("notification_preferences")
          .select("newsletter")
          .eq("user_id", user.user_id)
          .single();

        // Skip if user has disabled newsletter emails
        if (preferences && !preferences.newsletter) {
          logStep("User has disabled newsletter emails, skipping", { userId: user.user_id });
          continue;
        }

        // Get user email and name
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(user.user_id);
        const userEmail = userData?.user?.email;

        if (!userEmail) {
          logStep("User email not found, skipping", { userId: user.user_id });
          continue;
        }

        // Send dashboard message if enabled
        if (automationRule.sends_dashboard_message) {
          try {
            await supabaseAdmin
              .from("user_system_messages")
              .insert({
                user_id: user.user_id,
                message_type: "motivational_weekly",
                subject: template.subject,
                content: template.content,
                is_read: false,
              });
          } catch (msgError) {
            logStep("ERROR sending dashboard message", { userId: user.user_id, error: msgError });
          }
        }

        // Send email if enabled
        if (automationRule.sends_email) {
          try {
            await resend.emails.send({
              from: "SmartyGym <onboarding@resend.dev>",
              to: [userEmail],
              subject: template.subject,
              html: template.content.replace(/\n/g, '<br>'),
            });
          } catch (emailError) {
            logStep("ERROR sending email", { userId: user.user_id, error: emailError });
          }
        }

        messagesSent++;
        logStep("Motivational message sent", { userId: user.user_id });
      } catch (error) {
        messagesFailed++;
        logStep("Error sending to user", { userId: user.user_id, error: error instanceof Error ? error.message : String(error) });
      }
    }

    // Update automation rule execution count
    await supabaseAdmin
      .from("automation_rules")
      .update({
        last_triggered_at: new Date().toISOString(),
        total_executions: (automationRule.total_executions || 0) + messagesSent,
      })
      .eq("id", automationRule.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        messagesSent, 
        messagesFailed,
        templateUsed: template.subject 
      }),
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
