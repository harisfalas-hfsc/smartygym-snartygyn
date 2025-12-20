import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { getEmailHeaders, getEmailFooter, wrapInEmailTemplate } from "../_shared/email-utils.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MassNotificationRequest {
  messageType: string;
  recipientFilter: string;
  subject: string;
  content: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messageType, recipientFilter, subject, content } = await req.json() as MassNotificationRequest;

    console.log('[MASS-NOTIFICATION] Request:', { messageType, recipientFilter, subject, content });

    if (!messageType || !recipientFilter || !subject || !content) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    // Verify the requester is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Authentication failed");

    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userData.user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      throw new Error("Unauthorized: Admin access required");
    }

    console.log('[MASS-NOTIFICATION] Admin verified:', userData.user.id);

    // Use the provided subject and content directly
    const finalSubject = subject;
    const finalContent = content;

    // Get recipients based on filter
    let recipients: { user_id: string }[] = [];
    let recipientError = null;

    if (recipientFilter === 'purchasers') {
      // Query user_purchases table for users with purchases
      const { data: purchaseData, error: purchaseErr } = await supabaseAdmin
        .from('user_purchases')
        .select('user_id');
      
      recipientError = purchaseErr;
      
      if (purchaseData) {
        const uniqueUserIds = [...new Set(purchaseData.map(p => p.user_id))];
        recipients = uniqueUserIds.map(user_id => ({ user_id }));
      }
    } else if (recipientFilter === 'corporate_admins') {
      // Query corporate_subscriptions for admins
      const { data: corpData, error: corpErr } = await supabaseAdmin
        .from('corporate_subscriptions')
        .select('admin_user_id');
      
      recipientError = corpErr;
      if (corpData) {
        recipients = corpData.map(c => ({ user_id: c.admin_user_id }));
      }
    } else if (recipientFilter === 'corporate_members') {
      // Query corporate_members
      const { data: membersData, error: membersErr } = await supabaseAdmin
        .from('corporate_members')
        .select('user_id');
      
      recipientError = membersErr;
      if (membersData) {
        recipients = membersData.map(m => ({ user_id: m.user_id }));
      }
    } else if (recipientFilter === 'corporate_all') {
      // Query both corporate admins and members
      const { data: corpData, error: corpErr } = await supabaseAdmin
        .from('corporate_subscriptions')
        .select('admin_user_id');
      
      const { data: membersData, error: membersErr } = await supabaseAdmin
        .from('corporate_members')
        .select('user_id');
      
      recipientError = corpErr || membersErr;
      
      const adminIds = (corpData || []).map(c => c.admin_user_id);
      const memberIds = (membersData || []).map(m => m.user_id);
      const allIds = [...new Set([...adminIds, ...memberIds])];
      recipients = allIds.map(user_id => ({ user_id }));
    } else {
      // Query user_subscriptions table
      let recipientQuery = supabaseAdmin
        .from('user_subscriptions')
        .select('user_id');

      switch (recipientFilter) {
        case 'subscribers':
          recipientQuery = recipientQuery.in('plan_type', ['gold', 'platinum']);
          break;
        case 'gold':
          recipientQuery = recipientQuery.eq('plan_type', 'gold');
          break;
        case 'platinum':
          recipientQuery = recipientQuery.eq('plan_type', 'platinum');
          break;
        case 'free':
          recipientQuery = recipientQuery.eq('plan_type', 'free');
          break;
        case 'all':
          // No filter, get all users
          break;
        default:
          throw new Error(`Invalid recipient filter: ${recipientFilter}`);
      }

      const result = await recipientQuery;
      recipients = result.data || [];
      recipientError = result.error;
    }

    if (recipientError) {
      console.error('[MASS-NOTIFICATION] Error fetching recipients:', recipientError);
      throw recipientError;
    }

    if (!recipients || recipients.length === 0) {
      console.log('[MASS-NOTIFICATION] No recipients found');
      return new Response(
        JSON.stringify({ success: true, recipientCount: 0, message: "No recipients found for the selected filter" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    console.log('[MASS-NOTIFICATION] Found recipients:', recipients.length);

    // Insert messages for all recipients
    const messages = recipients.map(recipient => ({
      user_id: recipient.user_id,
      message_type: messageType,
      subject: finalSubject,
      content: finalContent,
      is_read: false
    }));

    const { error: insertError } = await supabaseAdmin
      .from('user_system_messages')
      .insert(messages);

    if (insertError) {
      console.error('[MASS-NOTIFICATION] Insert error:', insertError);
      throw insertError;
    }

    console.log('[MASS-NOTIFICATION] Dashboard messages sent to', recipients.length, 'users');

    // Send emails to all recipients
    let emailsSent = 0;
    let emailsFailed = 0;

    // Prepare email HTML once
    const emailHtml = wrapInEmailTemplate(finalSubject, finalContent);

    for (const recipient of recipients) {
      try {
        // Get user email
        const { data: userInfo } = await supabaseAdmin.auth.admin.getUserById(recipient.user_id);
        const userEmail = userInfo?.user?.email;

        if (!userEmail) {
          console.log('[MASS-NOTIFICATION] No email for user:', recipient.user_id);
          continue;
        }

        // Admin messages ALWAYS get delivered - no preference checking
        // This is a high-priority system message from admin

        // Send email with headers and footer
        const emailResult = await resend.emails.send({
          from: "SmartyGym <notifications@smartygym.com>",
          to: [userEmail],
          subject: finalSubject,
          headers: getEmailHeaders(userEmail),
          html: `${emailHtml}${getEmailFooter(userEmail)}`,
        });

        if (emailResult.error) {
          console.error('[MASS-NOTIFICATION] Email error for', userEmail, emailResult.error);
          emailsFailed++;
        } else {
          emailsSent++;
          // Rate limiting: 600ms delay to respect Resend's 2 requests/second limit
          await new Promise(resolve => setTimeout(resolve, 600));
        }

      } catch (emailError) {
        console.error('[MASS-NOTIFICATION] Email send error:', emailError);
        emailsFailed++;
      }
    }

    console.log('[MASS-NOTIFICATION] Emails sent:', emailsSent, 'failed:', emailsFailed);

    // Log to notification audit
    try {
      await supabaseAdmin
        .from('notification_audit_log')
        .insert({
          notification_type: 'manual',
          message_type: messageType,
          sent_by: userData.user.id,
          recipient_filter: recipientFilter,
          recipient_count: recipients.length,
          success_count: recipients.length,
          failed_count: emailsFailed,
          subject: finalSubject,
          content: finalContent,
          metadata: { emails_sent: emailsSent, emails_failed: emailsFailed }
        });
    } catch (auditError) {
      console.error('[MASS-NOTIFICATION] Failed to log audit:', auditError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        recipientCount: recipients.length,
        emailsSent,
        emailsFailed,
        message: `Notification sent to ${recipients.length} users (${emailsSent} emails sent)` 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("[MASS-NOTIFICATION] Error:", error);
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
