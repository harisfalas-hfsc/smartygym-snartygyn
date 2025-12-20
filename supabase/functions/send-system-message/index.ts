import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@3.5.0";
import { getEmailHeaders, getEmailFooter, wrapInEmailTemplateWithFooter } from "../_shared/email-utils.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendMessageRequest {
  userId: string;
  messageType: string;
  customData?: {
    planName?: string;
    date?: string;
    amount?: string;
    contentName?: string;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, messageType, customData = {} }: SendMessageRequest = await req.json();

    console.log('[SEND-SYSTEM-MESSAGE] Request:', { userId, messageType, customData });

    if (!userId || !messageType) {
      throw new Error("Missing required fields: userId and messageType");
    }

    // Create Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get the default active template for this message type
    const { data: template, error: templateError } = await supabaseAdmin
      .from('automated_message_templates')
      .select('*')
      .eq('message_type', messageType)
      .eq('is_active', true)
      .eq('is_default', true)
      .single();

    if (templateError || !template) {
      console.error('[SEND-SYSTEM-MESSAGE] No default template found:', templateError);
      throw new Error(`No active default template found for message type: ${messageType}`);
    }

    console.log('[SEND-SYSTEM-MESSAGE] Using template:', template.template_name);

    // Replace placeholders in subject and content
    let subject = template.subject;
    let content = template.content;

    if (customData.planName) {
      subject = subject.replace(/\[Plan\]/g, customData.planName);
      content = content.replace(/\[Plan\]/g, customData.planName);
    }
    if (customData.date) {
      subject = subject.replace(/\[Date\]/g, customData.date);
      content = content.replace(/\[Date\]/g, customData.date);
    }
    if (customData.amount) {
      subject = subject.replace(/\[Amount\]/g, customData.amount);
      content = content.replace(/\[Amount\]/g, customData.amount);
    }
    if (customData.contentName) {
      subject = subject.replace(/\[Content\]/g, customData.contentName);
      content = content.replace(/\[Content\]/g, customData.contentName);
    }

    // Insert system message for the user (dashboard)
    const { error: insertError } = await supabaseAdmin
      .from('user_system_messages')
      .insert({
        user_id: userId,
        message_type: messageType,
        subject: subject,
        content: content,
        is_read: false
      });

    if (insertError) {
      console.error('[SEND-SYSTEM-MESSAGE] Insert error:', insertError);
      throw insertError;
    }

    console.log('[SEND-SYSTEM-MESSAGE] Dashboard message sent successfully to user:', userId);

    // Send web push notification
    let pushSent = false;
    try {
      const pushResponse = await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-push-notification`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({
            user_id: userId,
            title: "Smarty Gym",
            body: "You have a new message in your dashboard",
            url: "/userdashboard?tab=messages",
            tag: "new-dashboard-message",
          }),
        }
      );
      
      if (pushResponse.ok) {
        const pushResult = await pushResponse.json();
        console.log('[SEND-SYSTEM-MESSAGE] Push notification result:', pushResult);
        pushSent = pushResult.sent > 0;
      }
    } catch (pushError) {
      console.error('[SEND-SYSTEM-MESSAGE] Push notification failed:', pushError);
    }

    // Send email as well
    let emailSent = false;
    try {
      // Get user email
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
      
      if (userError || !userData?.user?.email) {
        console.error('[SEND-SYSTEM-MESSAGE] Could not fetch user email:', userError);
      } else {
        const userEmail = userData.user.email;
        
        // Check notification preferences from profiles table
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('notification_preferences')
          .eq('user_id', userId)
          .single();
        
        const prefs = profile?.notification_preferences as Record<string, any> || {};
        
        // Check if user has opted out
        if (prefs.opt_out_all === true) {
          console.log('[SEND-SYSTEM-MESSAGE] User has opted out of all notifications, skipping email');
        } else if (prefs.email === false) {
          console.log('[SEND-SYSTEM-MESSAGE] User has disabled email notifications, skipping email');
        } else {
          // Send email with headers and footer
          const emailHtml = wrapInEmailTemplateWithFooter(
            subject,
            content,
            userEmail,
            'https://smartygym.com/userdashboard',
            'Go to Dashboard'
          );

          const emailResponse = await resend.emails.send({
            from: "SmartyGym <notifications@smartygym.com>",
            to: [userEmail],
            subject: subject,
            html: emailHtml,
            headers: getEmailHeaders(userEmail),
          });

          console.log('[SEND-SYSTEM-MESSAGE] Email sent successfully:', emailResponse.data?.id);
          emailSent = true;
        }
      }
    } catch (emailError) {
      console.error('[SEND-SYSTEM-MESSAGE] Email sending failed:', emailError);
    }

    // Log to notification audit
    try {
      await supabaseAdmin
        .from('notification_audit_log')
        .insert({
          notification_type: 'automated',
          message_type: messageType,
          sent_by: null,
          recipient_filter: 'single_user',
          recipient_count: 1,
          success_count: 1,
          failed_count: 0,
          subject: subject,
          content: content,
          metadata: { userId, template_id: template.id, email_sent: emailSent, push_sent: pushSent }
        });
    } catch (auditError) {
      console.error('[SEND-SYSTEM-MESSAGE] Failed to log audit:', auditError);
    }

    return new Response(
      JSON.stringify({ success: true, message: "System message sent successfully", emailSent, pushSent }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("[SEND-SYSTEM-MESSAGE] Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
