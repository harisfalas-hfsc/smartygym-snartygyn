import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

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
    const resendApiKey = Deno.env.get("RESEND_API_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

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
            // Get all registered users
            const { data: users } = await supabase
              .from("profiles")
              .select("user_id");
            
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

          // Insert dashboard messages for all target users
          const messagesToInsert = targetUserIds.map(userId => ({
            user_id: userId,
            message_type: 'announcement_update',
            subject: notification.title,
            content: notification.body,
            is_read: false,
          }));

          const { error: insertError } = await supabase
            .from('user_system_messages')
            .insert(messagesToInsert);

          if (insertError) {
            throw new Error(`Failed to insert messages: ${insertError.message}`);
          }

          // Send emails to all target users
          const { data: usersWithEmails } = await supabase.auth.admin.listUsers();
          const targetEmails = usersWithEmails?.users
            ?.filter(u => targetUserIds.includes(u.id) && u.email)
            .map(u => u.email) as string[] || [];

          if (targetEmails.length > 0) {
            try {
              await resend.emails.send({
                from: "SmartyGym <onboarding@resend.dev>",
                to: targetEmails,
                subject: notification.title,
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #d4af37;">${notification.title}</h1>
                    <p style="font-size: 16px; line-height: 1.6;">${notification.body}</p>
                    ${notification.url ? `<p><a href="${supabaseUrl.replace('/functions/v1', '')}${notification.url}" style="display: inline-block; background: #d4af37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 16px;">View Now</a></p>` : ''}
                    <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;">
                    <p style="font-size: 12px; color: #666;">This email was sent from SmartyGym. You're receiving this because you subscribed to our updates.</p>
                  </div>
                `,
              });
              console.log(`✅ Sent ${targetEmails.length} emails for notification ${notification.id}`);
            } catch (emailError) {
              console.error(`⚠️ Failed to send emails for notification ${notification.id}:`, emailError);
              // Don't fail the whole operation if email fails
            }
          }

          // Update notification status and handle recurrence
          const now = new Date();
          const updateData: any = {
            status: notification.recurrence_pattern === "once" ? "sent" : "pending",
            sent_at: now.toISOString(),
            recipient_count: targetUserIds.length,
            last_sent_at: now.toISOString(),
          };

          // Calculate next scheduled time for recurring notifications
          if (notification.recurrence_pattern !== "once") {
            let nextTime = new Date(now);
            
            switch (notification.recurrence_pattern) {
              case "daily":
                nextTime.setDate(nextTime.getDate() + 1);
                break;
              case "weekly":
                nextTime.setDate(nextTime.getDate() + 7);
                break;
              case "twice_weekly":
                nextTime.setDate(nextTime.getDate() + 3); // Every ~3.5 days
                break;
              case "three_times_weekly":
                nextTime.setDate(nextTime.getDate() + 2); // Every ~2.3 days
                break;
              case "custom":
                if (notification.recurrence_interval) {
                  nextTime.setDate(nextTime.getDate() + parseInt(notification.recurrence_interval));
                }
                break;
            }
            
            updateData.next_scheduled_time = nextTime.toISOString();
            updateData.scheduled_time = nextTime.toISOString(); // Update main scheduled_time too
          }

          const { error: updateError } = await supabase
            .from("scheduled_notifications")
            .update(updateData)
            .eq("id", notification.id)
            .single();

          if (updateError) {
            console.error(`❌ Failed to update notification ${notification.id} status:`, updateError);
            throw new Error(`Status update failed: ${updateError.message}`);
          }

          console.log(`✅ Updated notification ${notification.id} status to: ${updateData.status}`);

          // Log to notification audit
          try {
            await supabase
              .from('notification_audit_log')
              .insert({
                notification_type: 'scheduled',
                message_type: 'announcement_update',
                sent_by: notification.created_by,
                recipient_filter: notification.target_audience,
                recipient_count: targetUserIds.length,
                success_count: targetUserIds.length,
                failed_count: 0,
                subject: notification.title,
                content: notification.body,
                metadata: { notification_id: notification.id, scheduled_time: notification.scheduled_time }
              });
          } catch (auditError) {
            console.error('Failed to log audit:', auditError);
          }

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
