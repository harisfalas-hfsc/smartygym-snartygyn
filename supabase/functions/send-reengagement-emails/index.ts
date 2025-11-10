import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@3.5.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[SEND-REENGAGEMENT-EMAILS] ${step}${detailsStr}`);
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

    // Get users with expired subscriptions (status inactive, plan not free)
    const { data: expiredSubs, error: subsError } = await supabaseAdmin
      .from("user_subscriptions")
      .select("user_id, plan_type")
      .neq("status", "active")
      .neq("plan_type", "free");

    if (subsError) throw subsError;

    logStep("Found expired subscriptions", { count: expiredSubs?.length || 0 });

    if (!expiredSubs || expiredSubs.length === 0) {
      return new Response(
        JSON.stringify({ message: "No expired subscriptions to process" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get reactivation template
    const { data: template } = await supabaseAdmin
      .from("email_templates")
      .select("*")
      .eq("category", "reactivation")
      .eq("is_active", true)
      .single();

    const emailsSent = [];

    for (const subscription of expiredSubs) {
      try {
        // Check last workout interaction (to avoid spamming recently active users)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: recentActivity } = await supabaseAdmin
          .from("workout_interactions")
          .select("id")
          .eq("user_id", subscription.user_id)
          .gte("updated_at", thirtyDaysAgo.toISOString())
          .limit(1);

        // Skip if user was recently active
        if (recentActivity && recentActivity.length > 0) continue;

        // Get user details
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("full_name")
          .eq("user_id", subscription.user_id)
          .single();

        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(subscription.user_id);
        
        if (!userData?.user?.email) continue;

        const userName = profile?.full_name || "there";

        // Check user notification preferences
        const { data: preferences } = await supabaseAdmin
          .from("notification_preferences")
          .select("promotional_emails")
          .eq("user_id", subscription.user_id)
          .single();

        // Skip if user has disabled promotional emails
        if (preferences && !preferences.promotional_emails) {
          logStep("User has disabled promotional emails, skipping", { userId: subscription.user_id });
          continue;
        }

        // Replace placeholders
        const subject = template?.subject.replace(/{{name}}/g, userName) || "We miss you at SmartyGym!";
        const body = (template?.body || "")
          .replace(/{{name}}/g, userName);

        // Send email
        const emailResponse = await resend.emails.send({
          from: "SmartyGym <onboarding@resend.dev>",
          to: [userData.user.email],
          subject: subject,
          html: body.replace(/\n/g, "<br>"),
        });

        emailsSent.push({ userId: subscription.user_id, emailId: emailResponse.data?.id });
        logStep("Re-engagement email sent", { userId: subscription.user_id, emailId: emailResponse.data?.id });
      } catch (error) {
        logStep("Error sending to user", { userId: subscription.user_id, error: error instanceof Error ? error.message : String(error) });
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
