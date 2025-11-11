import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

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

        // Send dashboard message
        await supabaseAdmin.functions.invoke('send-system-message', {
          body: {
            userId: subscription.user_id,
            messageType: 'renewal_reminder',
            customData: {
              planName: subscription.plan_type,
              date: renewalDate
            }
          }
        });

        messagesSent.push({ userId: subscription.user_id });
        logStep("Renewal reminder sent", { userId: subscription.user_id, renewalDate });
      } catch (error) {
        logStep("Error sending to user", { userId: subscription.user_id, error: error instanceof Error ? error.message : String(error) });
      }
    }

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
