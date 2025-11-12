import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    // Note: In a production environment, you would use web-push library to send actual push notifications
    // For now, we're simulating the notification send
    // You'll need to:
    // 1. Generate VAPID keys
    // 2. Install web-push library
    // 3. Send notifications using the subscription data

    // Simulate notification sending
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        // In production, you would send actual push notification here
        // using web-push library with subscription.subscription_data
        console.log(`Simulating push to user ${subscription.user_id}`);
        return {
          userId: subscription.user_id,
          success: true,
        };
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
