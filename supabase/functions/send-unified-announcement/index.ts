import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { wrapInEmailTemplate, getEmailHeaders, getEmailFooter } from "../_shared/email-utils.ts";
import { logEmailDelivery } from "../_shared/email-log.ts";
import { canSend, type AutomationKey } from "../_shared/notification-preferences.ts";

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

const automationKeyForAnnouncement = (messageType: string): AutomationKey => {
  if (messageType.includes("workout")) return "new_workout";
  if (messageType.includes("program")) return "new_program";
  if (messageType.includes("article")) return "new_article";
  return "general_announcement";
};

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

    // Valid message types from the database enum
    const validMessageTypes = [
      'daily_motivation', 'weekly_summary', 'subscription_welcome', 'subscription_renewal',
      'subscription_expiring', 'subscription_expired', 'subscription_canceled',
      'account_welcome', 'account_inactive', 'feature_announcement', 'new_content_available',
      'support_response', 'support_followup', 'announcement_general', 'announcement_update',
      'announcement_maintenance', 'announcement_new_service', 'trial_ending', 'trial_expired',
      'trial_started', 'new_category_announcement'
    ];

    // Use provided messageType if valid, otherwise fallback to announcement_new_service
    const safeMessageType = validMessageTypes.includes(messageType) 
      ? messageType 
      : 'announcement_new_service';
    
    logStep("Using message type", { provided: messageType, using: safeMessageType });

    const automationKey = automationKeyForAnnouncement(messageType);
    const { data: profilesForPrefs } = await supabaseAdmin
      .from("profiles")
      .select("user_id, notification_preferences")
      .in("user_id", userIds);
    const prefsByUserId = new Map(
      (profilesForPrefs || []).map((profile) => [profile.user_id, profile.notification_preferences as Record<string, any>])
    );

    for (const userId of userIds) {
      try {
        const prefs = prefsByUserId.get(userId) || {};
        // Send dashboard message
        if (canSend(prefs, automationKey, "dashboard")) {
          try {
            const { error: insertError } = await supabaseAdmin
              .from("user_system_messages")
              .insert({
                user_id: userId,
                message_type: safeMessageType,
                subject: subject,
                content: content,
                is_read: false,
              });
            
            if (insertError) {
              logStep("ERROR inserting dashboard message", { userId, error: insertError.message });
            } else {
              logStep("Dashboard message inserted", { userId });
            }
          } catch (msgError) {
            logStep("ERROR sending dashboard message", { userId, error: msgError });
          }
        } else {
          logStep("Dashboard skipped by user preference", { userId, automationKey });
        }

        // Get user email
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
        const userEmail = userData?.user?.email;

        if (!userEmail) {
          logStep("User email not found, skipping email", { userId });
          sentCount++; // Still count as sent (dashboard message was sent)
          continue;
        }

        if (!canSend(prefs, automationKey, "email")) {
          logStep("Email skipped by user preference", { userId, automationKey });
          sentCount++;
          continue;
        }

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
            await logEmailDelivery({
              userId,
              toEmail: userEmail,
              messageType: safeMessageType,
              status: "failed",
              errorMessage: typeof emailResult.error === 'string' ? emailResult.error : JSON.stringify(emailResult.error),
            });
          } else {
            await logEmailDelivery({
              userId,
              toEmail: userEmail,
              messageType: safeMessageType,
              status: "sent",
              resendId: emailResult.data?.id ?? null,
            });
            // Rate limiting: 600ms delay to respect Resend's 2 requests/second limit
            await new Promise(resolve => setTimeout(resolve, 600));
          }
        } catch (emailError) {
          logStep("ERROR sending email", { userId, error: emailError });
          await logEmailDelivery({
            userId,
            toEmail: userEmail,
            messageType: safeMessageType,
            status: "failed",
            errorMessage: emailError instanceof Error ? emailError.message : String(emailError),
          });
        }

        sentCount++;
        logStep("Announcement sent (dashboard + email)", { userId });
      } catch (error) {
        failedCount++;
        logStep("Error sending to user", { userId, error: error instanceof Error ? error.message : String(error) });
      }
    }

    // Log to audit table with proper metadata
    try {
      const { error: auditError } = await supabaseAdmin
        .from("notification_audit_log")
        .insert({
          notification_type: "unified_announcement",
          message_type: safeMessageType,
          subject: subject,
          content: content,
          recipient_count: userIds.length,
          success_count: sentCount,
          failed_count: failedCount,
          sent_at: new Date().toISOString(),
          metadata: {
            userIds: userIds,
            originalMessageType: messageType,
          },
        });
      
      if (auditError) {
        logStep("ERROR inserting audit log", { error: auditError.message });
      } else {
        logStep("Audit log inserted successfully");
      }
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
