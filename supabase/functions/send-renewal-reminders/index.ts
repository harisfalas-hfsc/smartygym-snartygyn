import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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

    // Get subscriptions expiring in 7 days
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const sevenDaysISO = sevenDaysFromNow.toISOString();

    const eightDaysFromNow = new Date();
    eightDaysFromNow.setDate(eightDaysFromNow.getDate() + 8);
    const eightDaysISO = eightDaysFromNow.toISOString();

    const { data: expiringSubscriptions, error: subsError } = await supabaseAdmin
      .from("user_subscriptions")
      .select("user_id, plan_type, current_period_end")
      .eq("status", "active")
      .neq("plan_type", "free")
      .gte("current_period_end", sevenDaysISO)
      .lt("current_period_end", eightDaysISO);

    if (subsError) throw subsError;

    logStep("Found expiring subscriptions", { count: expiringSubscriptions?.length || 0 });

    if (!expiringSubscriptions || expiringSubscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: "No subscriptions expiring soon" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get renewal template
    const { data: template } = await supabaseAdmin
      .from("email_templates")
      .select("*")
      .eq("category", "renewal")
      .eq("is_active", true)
      .single();

    const emailsSent = [];

    for (const subscription of expiringSubscriptions) {
      try {
        // Get user details
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("full_name")
          .eq("user_id", subscription.user_id)
          .single();

        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(subscription.user_id);
        
        if (!userData?.user?.email) continue;

        const userName = profile?.full_name || "there";
        const renewalDate = new Date(subscription.current_period_end).toLocaleDateString();

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

        // Replace placeholders
        const subject = template?.subject.replace(/{{name}}/g, userName) || "Your subscription is renewing soon";
        const body = (template?.body || "")
          .replace(/{{name}}/g, userName)
          .replace(/{{plan_type}}/g, subscription.plan_type)
          .replace(/{{renewal_date}}/g, renewalDate);

        // Send email
        const emailResponse = await resend.emails.send({
          from: "SmartyGym <onboarding@resend.dev>",
          to: [userData.user.email],
          subject: subject,
          html: body.replace(/\n/g, "<br>"),
        });

        emailsSent.push({ userId: subscription.user_id, emailId: emailResponse.id });
        logStep("Renewal reminder sent", { userId: subscription.user_id, emailId: emailResponse.id });
      } catch (error) {
        logStep("Error sending to user", { userId: subscription.user_id, error: error.message });
      }
    }

    return new Response(
      JSON.stringify({ success: true, emailsSent: emailsSent.length }),
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
