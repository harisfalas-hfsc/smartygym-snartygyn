import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
}

async function sendWebPush(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<boolean> {
  try {
    // Import web-push compatible library
    const webPush = await import("https://esm.sh/web-push@3.6.6");
    
    webPush.setVapidDetails(
      "mailto:smartygym@example.com",
      vapidPublicKey,
      vapidPrivateKey
    );

    await webPush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      JSON.stringify(payload)
    );

    return true;
  } catch (error: any) {
    console.error("Error sending push notification:", error);
    
    // If subscription is expired or invalid, return false to mark for cleanup
    if (error.statusCode === 404 || error.statusCode === 410) {
      return false;
    }
    
    return false;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error("VAPID keys not configured");
      return new Response(
        JSON.stringify({ error: "VAPID keys not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { user_id, title, body, url, tag, is_admin_message } = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: "user_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Admin messages ALWAYS get delivered - bypass all preference checking
    if (!is_admin_message) {
      // Check user's notification preferences - only for non-admin messages
      const { data: profile } = await supabaseClient
        .from("profiles")
        .select("notification_preferences")
        .eq("user_id", user_id)
        .single();

      const prefs = profile?.notification_preferences as Record<string, any> || {};
      
      // Check if user has opted out of push notifications
      if (prefs.push === false || prefs.opt_out_all === true) {
        console.log(`[PUSH] User ${user_id} has disabled push notifications`);
        return new Response(
          JSON.stringify({ message: "User has disabled push notifications", sent: 0 }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      console.log(`[PUSH] Admin message - bypassing preference checks for user ${user_id}`);
    }

    // Get user's active push subscriptions
    const { data: subscriptions, error: subError } = await supabaseClient
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", user_id)
      .eq("is_active", true);

    if (subError) {
      console.error("Error fetching subscriptions:", subError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch subscriptions" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: "No active subscriptions for user", sent: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload: PushPayload = {
      title: title || "Smarty Gym",
      body: body || "You have a new notification",
      icon: "/smarty-gym-logo.png",
      badge: "/smarty-gym-logo.png",
      url: url || "/userdashboard?tab=messages",
      tag: tag || "smarty-gym-notification",
    };

    let successCount = 0;
    let failedCount = 0;
    const expiredSubscriptionIds: string[] = [];

    for (const sub of subscriptions) {
      const success = await sendWebPush(
        { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
        payload,
        vapidPublicKey,
        vapidPrivateKey
      );

      if (success) {
        successCount++;
      } else {
        failedCount++;
        expiredSubscriptionIds.push(sub.id);
      }
    }

    // Mark expired subscriptions as inactive
    if (expiredSubscriptionIds.length > 0) {
      await supabaseClient
        .from("push_subscriptions")
        .update({ is_active: false })
        .in("id", expiredSubscriptionIds);
    }

    return new Response(
      JSON.stringify({
        message: "Push notifications processed",
        sent: successCount,
        failed: failedCount,
        expired: expiredSubscriptionIds.length,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-push-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
