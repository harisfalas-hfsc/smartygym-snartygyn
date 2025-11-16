import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Checking for scheduled notifications...");

    // Get all pending notifications that are due
    const { data: dueNotifications, error: fetchError } = await supabase
      .from("scheduled_notifications")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_time", new Date().toISOString());

    if (fetchError) {
      throw new Error(`Error fetching notifications: ${fetchError.message}`);
    }

    if (!dueNotifications || dueNotifications.length === 0) {
      console.log("No notifications due at this time");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No notifications to send",
          processed: 0 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    console.log(`Found ${dueNotifications.length} notifications to send`);

    // Process each notification
    const results = await Promise.allSettled(
      dueNotifications.map(async (notification) => {
        try {
          // Determine target user IDs based on audience
          let targetUserIds: string[] = [];

          if (notification.target_audience === "all") {
            // Get all users with active push subscriptions
            const { data: users } = await supabase
              .from("push_subscriptions")
              .select("user_id")
              .eq("is_active", true);
            
            targetUserIds = users?.map((u) => u.user_id) || [];
          } else if (notification.target_audience === "purchasers") {
            // Get users with purchases
            const { data: purchases } = await supabase
              .from("user_purchases")
              .select("user_id");
            
            targetUserIds = [...new Set(purchases?.map((p) => p.user_id) || [])];
          } else if (notification.target_audience === "subscribers") {
            // Get all subscribers (users with active subscriptions)
            const { data: users } = await supabase
              .from("user_subscriptions")
              .select("user_id")
              .in("plan_type", ["gold", "platinum"])
              .eq("status", "active");
            
            targetUserIds = users?.map((u) => u.user_id) || [];
          } else if (notification.target_audience === "gold" || notification.target_audience === "platinum") {
            // Get users with specific plan
            const { data: users } = await supabase
              .from("user_subscriptions")
              .select("user_id")
              .eq("status", "active")
              .eq("plan_type", notification.target_audience);
            
            targetUserIds = users?.map((u) => u.user_id) || [];
          }

          if (targetUserIds.length === 0) {
            throw new Error("No recipients found for this notification");
          }

          // Send the notification via push notification function
          const { data: pushResult, error: pushError } = await supabase.functions.invoke(
            "send-push-notification",
            {
              body: {
                userIds: targetUserIds,
                title: notification.title,
                body: notification.body,
                url: notification.url,
                icon: notification.icon,
                requireInteraction: false,
              },
            }
          );

          if (pushError) {
            throw pushError;
          }

          // Update notification status
          await supabase
            .from("scheduled_notifications")
            .update({
              status: "sent",
              sent_at: new Date().toISOString(),
              recipient_count: targetUserIds.length,
            })
            .eq("id", notification.id);

          console.log(`Successfully sent notification ${notification.id} to ${targetUserIds.length} users`);

          return {
            id: notification.id,
            success: true,
            recipients: targetUserIds.length,
          };
        } catch (error: any) {
          console.error(`Failed to send notification ${notification.id}:`, error);

          // Mark notification as failed
          await supabase
            .from("scheduled_notifications")
            .update({
              status: "failed",
              error_message: error.message,
            })
            .eq("id", notification.id);

          throw error;
        }
      })
    );

    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    console.log(`Processed ${successful} notifications successfully, ${failed} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: dueNotifications.length,
        successful,
        failed,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error processing scheduled notifications:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
