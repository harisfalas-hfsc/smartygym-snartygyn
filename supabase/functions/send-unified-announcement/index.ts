import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { wrapInEmailTemplate, getEmailHeaders, getEmailFooter } from "../_shared/email-utils.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[SEND-UNIFIED-ANNOUNCEMENT] ${step}${detailsStr}`);
};

interface AnnouncementRequest {
  userIds: string[];
  messageType: string;
  subject: string;
  content: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { userIds, messageType, subject, content }: AnnouncementRequest = await req.json();

    if (!userIds || userIds.length === 0) {
      throw new Error("No recipients specified");
    }

    if (!subject || !content) {
      throw new Error("Subject and content are required");
    }

    logStep("Processing announcement", { 
      recipientCount: userIds.length, 
      messageType,
      subject 
    });

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    let sentCount = 0;
    let failedCount = 0;

    // Prepare email HTML once (same for all recipients)
    const emailHtml = wrapInEmailTemplate(subject, content);

    for (const userId of userIds) {
      try {
        // Send dashboard message
        try {
          await supabaseAdmin
            .from("user_system_messages")
            .insert({
              user_id: userId,
              message_type: messageType,
              subject: subject,
              content: content,
              is_read: false,
            });
        } catch (msgError) {
          logStep("ERROR sending dashboard message", { userId, error: msgError });
        }

        // Get user email
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
        const userEmail = userData?.user?.email;

        if (!userEmail) {
          logStep("User email not found, skipping email", { userId });
          sentCount++; // Still count as sent (dashboard message was sent)
          continue;
        }

        // Admin messages ALWAYS get delivered - no preference checking
        // This is a high-priority system message from admin

        // Send email with properly formatted HTML, headers, and footer
        try {
          const emailResult = await resend.emails.send({
            from: "SmartyGym <notifications@smartygym.com>",
            to: [userEmail],
            subject: subject,
            headers: getEmailHeaders(userEmail),
            html: `${emailHtml}${getEmailFooter(userEmail)}`,
          });
          
          if (emailResult.error) {
            logStep("ERROR sending email", { userId, error: emailResult.error });
          } else {
            // Rate limiting: 600ms delay to respect Resend's 2 requests/second limit
            await new Promise(resolve => setTimeout(resolve, 600));
          }
        } catch (emailError) {
          logStep("ERROR sending email", { userId, error: emailError });
        }

        // Trigger push notification for admin message (bypasses preferences)
        try {
          await supabaseAdmin.functions.invoke('send-push-notification', {
            body: {
              user_id: userId,
              title: subject,
              body: content.substring(0, 200),
              is_admin_message: true, // High priority - bypasses all preferences
            }
          });
        } catch (pushError) {
          logStep("Push notification error (non-blocking)", { userId, error: pushError });
        }

        sentCount++;
        logStep("Announcement sent (dashboard + email + push)", { userId });
      } catch (error) {
        failedCount++;
        logStep("Error sending to user", { userId, error: error instanceof Error ? error.message : String(error) });
      }
    }

    // Log to audit table
    try {
      await supabaseAdmin
        .from("notification_audit_log")
        .insert({
          notification_type: "unified_announcement",
          message_type: messageType,
          subject: subject,
          content: content,
          recipient_count: userIds.length,
          success_count: sentCount,
          failed_count: failedCount,
          sent_at: new Date().toISOString(),
        });
    } catch (auditError) {
      logStep("ERROR logging to audit", { error: auditError });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: sentCount, 
        failed: failedCount, 
        total: userIds.length 
      }),
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
