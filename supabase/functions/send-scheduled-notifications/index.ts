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

    console.log("[SEND-SCHEDULED-NOTIFICATIONS] Checking for scheduled notifications...");

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
      console.log("[SEND-SCHEDULED-NOTIFICATIONS] No notifications due at this time");
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

    console.log(`[SEND-SCHEDULED-NOTIFICATIONS] Found ${dueNotifications.length} notifications to send`);

    // Process each notification
    const results = await Promise.allSettled(
      dueNotifications.map(async (notification) => {
        try {
          // Determine target user IDs based on audience
          let targetUserIds: string[] = [];

          // Handle individual user targeting (format: "user:USER_ID")
          if (notification.target_audience?.startsWith("user:")) {
            const userId = notification.target_audience.split(":")[1];
            targetUserIds = [userId];
          } else if (notification.target_audience === "all") {
            // Get all registered users
            const { data: users } = await supabase
              .from("profiles")
              .select("user_id");
            
            targetUserIds = users?.map((u) => u.user_id) || [];
          } else if (notification.target_audience === "subscribers") {
            // Get all subscribers (users with active subscriptions)
            const { data: users } = await supabase
              .from("user_subscriptions")
              .select("user_id")
              .in("plan_type", ["gold", "platinum"])
              .eq("status", "active");
            
            targetUserIds = users?.map((u) => u.user_id) || [];
          }

          if (targetUserIds.length === 0) {
            console.log(`[SEND-SCHEDULED-NOTIFICATIONS] No recipients found for notification ${notification.id}`);
            // Mark as sent anyway to prevent reprocessing
            await supabase
              .from("scheduled_notifications")
              .update({ status: "sent", sent_at: new Date().toISOString(), recipient_count: 0 })
              .eq("id", notification.id);
            return { id: notification.id, success: true, recipients: 0 };
          }

          // Check for duplicate prevention - don't send to users who already got this notification
          const { data: existingMessages } = await supabase
            .from('user_system_messages')
            .select('user_id')
            .eq('subject', notification.title)
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

          const existingUserIds = new Set(existingMessages?.map(m => m.user_id) || []);
          const newTargetUserIds = targetUserIds.filter(id => !existingUserIds.has(id));

          if (newTargetUserIds.length === 0) {
            console.log(`[SEND-SCHEDULED-NOTIFICATIONS] All users already received notification ${notification.id}`);
            await supabase
              .from("scheduled_notifications")
              .update({ status: "sent", sent_at: new Date().toISOString() })
              .eq("id", notification.id);
            return { id: notification.id, success: true, recipients: 0, skipped: "duplicates" };
          }

          // Insert dashboard messages for all target users
          const messagesToInsert = newTargetUserIds.map(userId => ({
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

          console.log(`[SEND-SCHEDULED-NOTIFICATIONS] ✅ Inserted ${newTargetUserIds.length} dashboard messages`);

          // Send emails to all target users
          const { data: usersWithEmails } = await supabase.auth.admin.listUsers();
          const targetEmails = usersWithEmails?.users
            ?.filter(u => newTargetUserIds.includes(u.id) && u.email)
            .map(u => u.email) as string[] || [];

          if (targetEmails.length > 0) {
            try {
              // Send emails in batches to avoid rate limits
              for (const email of targetEmails) {
                await resend.emails.send({
                  from: "SmartyGym <onboarding@resend.dev>",
                  to: [email],
                  subject: notification.title,
                  html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                      <h1 style="color: #d4af37;">${notification.title}</h1>
                      <div style="font-size: 16px; line-height: 1.6;">${notification.body}</div>
                      ${notification.url ? `<p style="margin-top: 24px;"><a href="https://smartygym.com${notification.url}" style="display: inline-block; background: #d4af37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">View Now</a></p>` : ''}
                      <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;">
                      <p style="font-size: 12px; color: #666;">This email was sent from SmartyGym.</p>
                    </div>
                  `,
                });
              }
              console.log(`[SEND-SCHEDULED-NOTIFICATIONS] ✅ Sent ${targetEmails.length} emails`);
            } catch (emailError) {
              console.error(`[SEND-SCHEDULED-NOTIFICATIONS] ⚠️ Email sending error:`, emailError);
            }
          }

          // Update notification status - FIXED: removed .single()
          const now = new Date();
          const updateData: any = {
            status: "sent",
            sent_at: now.toISOString(),
            recipient_count: newTargetUserIds.length,
            last_sent_at: now.toISOString(),
          };

          const { error: updateError } = await supabase
            .from("scheduled_notifications")
            .update(updateData)
            .eq("id", notification.id);

          if (updateError) {
            console.error(`[SEND-SCHEDULED-NOTIFICATIONS] ❌ Failed to update status:`, updateError);
          }

          // Log to audit
          await supabase
            .from('notification_audit_log')
            .insert({
              notification_type: 'scheduled',
              message_type: 'announcement_update',
              sent_by: notification.created_by,
              recipient_filter: notification.target_audience,
              recipient_count: newTargetUserIds.length,
              success_count: newTargetUserIds.length,
              failed_count: 0,
              subject: notification.title,
              content: notification.body,
            });

          console.log(`[SEND-SCHEDULED-NOTIFICATIONS] ✅ Notification ${notification.id} sent to ${newTargetUserIds.length} users`);

          return {
            id: notification.id,
            success: true,
            recipients: newTargetUserIds.length,
          };
        } catch (error: any) {
          console.error(`[SEND-SCHEDULED-NOTIFICATIONS] ❌ Failed notification ${notification.id}:`, error);

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

    console.log(`[SEND-SCHEDULED-NOTIFICATIONS] Completed: ${successful} successful, ${failed} failed`);

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
    console.error("[SEND-SCHEDULED-NOTIFICATIONS] ERROR:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});