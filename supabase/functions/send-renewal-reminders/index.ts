import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[SEND-RENEWAL-REMINDERS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get automation rule configuration
    const { data: automationRule } = await supabaseAdmin
      .from("automation_rules")
      .select("*")
      .eq("automation_key", "renewal_reminder")
      .eq("is_active", true)
      .single();

    if (!automationRule) {
      logStep("Renewal reminder automation is disabled");
      return new Response(
        JSON.stringify({ success: false, reason: "Renewal reminder automation disabled" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    // Get subscriptions expiring in 3 days
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const threeDaysStart = new Date(threeDaysFromNow);
    threeDaysStart.setHours(0, 0, 0, 0);
    const threeDaysEnd = new Date(threeDaysFromNow);
    threeDaysEnd.setHours(23, 59, 59, 999);

    const { data: expiringSubscriptions, error: subsError } = await supabaseAdmin
      .from("user_subscriptions")
      .select("user_id, plan_type, current_period_end")
      .eq("status", "active")
      .neq("plan_type", "free")
      .gte("current_period_end", threeDaysStart.toISOString())
      .lte("current_period_end", threeDaysEnd.toISOString());

    if (subsError) throw subsError;

    logStep("Found expiring subscriptions", { count: expiringSubscriptions?.length || 0 });

    if (!expiringSubscriptions || expiringSubscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: "No subscriptions expiring in 3 days" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get renewal reminder template
    const { data: template } = await supabaseAdmin
      .from("automated_message_templates")
      .select("subject, content")
      .eq("message_type", "renewal_reminder")
      .eq("is_active", true)
      .eq("is_default", true)
      .single();

    if (!template) {
      logStep("No active renewal reminder template found");
      return new Response(
        JSON.stringify({ success: false, reason: "No renewal reminder template configured" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const messagesSent = [];

    for (const subscription of expiringSubscriptions) {
      try {
        // Check user notification preferences
        const { data: preferences } = await supabaseAdmin
          .from("notification_preferences")
          .select("renewal_reminders")
          .eq("user_id", subscription.user_id)
          .single();

        // Skip if user has disabled renewal reminders
        if (preferences && !preferences.renewal_reminders) {
          logStep("User has disabled renewal reminders, skipping", { userId: subscription.user_id });
          continue;
        }

        const renewalDate = new Date(subscription.current_period_end).toLocaleDateString();
        const planName = subscription.plan_type.charAt(0).toUpperCase() + subscription.plan_type.slice(1);

        // Get user email
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(subscription.user_id);
        const userEmail = userData?.user?.email;

        if (!userEmail) {
          logStep("User email not found, skipping", { userId: subscription.user_id });
          continue;
        }

        // Send dashboard message
        await supabaseAdmin.functions.invoke('send-system-message', {
          body: {
            userId: subscription.user_id,
            messageType: 'renewal_reminder',
            customData: {
              planName: planName,
              date: renewalDate
            }
          }
        });

        // Send email
        const emailContent = template.content
          .replace(/\{planName\}/g, planName)
          .replace(/\{date\}/g, renewalDate);

        await resend.emails.send({
          from: "SmartyGym <onboarding@resend.dev>",
          to: [userEmail],
          subject: template.subject,
          html: emailContent.replace(/\n/g, '<br>'),
        });

        messagesSent.push({ userId: subscription.user_id });
        logStep("Renewal reminder sent (dashboard + email)", { userId: subscription.user_id, renewalDate });
      } catch (error) {
        logStep("Error sending to user", { userId: subscription.user_id, error: error instanceof Error ? error.message : String(error) });
      }
    }

    // Update automation rule execution count
    await supabaseAdmin
      .from("automation_rules")
      .update({
        last_triggered_at: new Date().toISOString(),
        total_executions: (automationRule.total_executions || 0) + messagesSent.length,
      })
      .eq("id", automationRule.id);

    return new Response(
      JSON.stringify({ success: true, messagesSent: messagesSent.length }),
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
