import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "https://esm.sh/web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationPayload {
  userId?: string;
  userIds?: string[];
  title: string;
  body: string;
  url?: string;
  icon?: string;
  requireInteraction?: boolean;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Configure web-push with VAPID keys
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY")!;
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY")!;
    
    webpush.setVapidDetails(
      "mailto:admin@smartygym.com",
      vapidPublicKey,
      vapidPrivateKey
    );

    const {
      userId,
      userIds,
      title,
      body,
      url = "/",
      icon = "/smarty-gym-logo.png",
      requireInteraction = false,
    }: NotificationPayload = await req.json();

    console.log("Sending push notification:", { userId, userIds, title, body });

    // Determine target user IDs
    const targetUserIds = userIds || (userId ? [userId] : []);

    if (targetUserIds.length === 0) {
      throw new Error("No user IDs provided");
    }

    // Fetch active subscriptions for target users
    const { data: subscriptions, error: fetchError } = await supabase
      .from("push_subscriptions")
      .select("*")
      .in("user_id", targetUserIds)
      .eq("is_active", true);

    if (fetchError) {
      throw new Error(`Error fetching subscriptions: ${fetchError.message}`);
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log("No active subscriptions found for users");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No active subscriptions found",
          notificationsSent: 0 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    console.log(`Found ${subscriptions.length} active subscriptions`);

    // Send actual push notifications
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          const pushSubscription = subscription.subscription_data as any;
          
          const payload = JSON.stringify({
            title,
            body,
            icon,
            url,
            requireInteraction,
          });

          console.log(`Sending push notification to user ${subscription.user_id}`);
          
          await webpush.sendNotification(pushSubscription, payload);
          
          return {
            userId: subscription.user_id,
            success: true,
          };
        } catch (error: any) {
          console.error(`Failed to send push to user ${subscription.user_id}:`, error);
          
          // If subscription is invalid/expired, mark it as inactive
          if (error.statusCode === 410 || error.statusCode === 404) {
            await supabase
              .from("push_subscriptions")
              .update({ is_active: false })
              .eq("id", subscription.id);
          }
          
          throw error;
        }
      })
    );

    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    console.log(`Notifications sent: ${successful} successful, ${failed} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Notifications processed`,
        notificationsSent: successful,
        notificationsFailed: failed,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error sending push notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
