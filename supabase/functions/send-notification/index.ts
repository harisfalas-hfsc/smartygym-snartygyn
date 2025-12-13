import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { getEmailHeaders, getEmailFooter } from "../_shared/email-utils.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: 'new_content' | 'wod' | 'subscription_expiration' | 'subscription_renewal' | 'plan_change' | 'monday_motivation';
  targetAudience?: 'all' | 'user' | 'expiring_subscribers';
  userId?: string;
  data?: {
    title?: string;
    description?: string;
    link?: string;
    contentType?: string;
    planName?: string;
    date?: string;
  };
}

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

    const body: NotificationRequest = await req.json();
    console.log(`[SEND-NOTIFICATION] Processing ${body.type} notification`);

    // Get the appropriate template
    let messageType = 'announcement_update';
    let templateName = 'New Content Notification';

    switch (body.type) {
      case 'new_content':
        messageType = 'announcement_update';
        templateName = 'New Content Notification';
        break;
      case 'wod':
        messageType = 'announcement_update';
        templateName = 'Workout of the Day';
        break;
      case 'subscription_expiration':
        messageType = 'renewal_reminder';
        templateName = 'Subscription Expiration Reminder';
        break;
      case 'subscription_renewal':
        messageType = 'renewal_thank_you';
        templateName = 'Subscription Renewal Confirmation';
        break;
      case 'plan_change':
        messageType = 'announcement_update';
        templateName = 'Plan Change Notification';
        break;
      case 'monday_motivation':
        messageType = 'motivational_weekly';
        templateName = 'Monday Motivational';
        break;
    }

    // Get template
    const { data: template } = await supabase
      .from('automated_message_templates')
      .select('subject, content')
      .eq('template_name', templateName)
      .eq('is_active', true)
      .single();

    if (!template) {
      throw new Error(`Template not found: ${templateName}`);
    }

    // Replace placeholders in template
    let subject = template.subject;
    let content = template.content;

    if (body.data) {
      subject = subject
        .replace('{title}', body.data.title || '')
        .replace('{contentType}', body.data.contentType || '')
        .replace('{planName}', body.data.planName || '');
      
      content = content
        .replace('{title}', body.data.title || '')
        .replace('{description}', body.data.description || '')
        .replace('{link}', body.data.link || '')
        .replace('{contentType}', body.data.contentType || '')
        .replace('{planName}', body.data.planName || '')
        .replace('{date}', body.data.date || '');
    }

    // Determine target users
    let targetUserIds: string[] = [];

    if (body.userId) {
      targetUserIds = [body.userId];
    } else if (body.targetAudience === 'all') {
      const { data: users } = await supabase.from('profiles').select('user_id');
      targetUserIds = users?.map(u => u.user_id) || [];
    } else if (body.targetAudience === 'expiring_subscribers') {
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      const startOfDay = new Date(threeDaysFromNow);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(threeDaysFromNow);
      endOfDay.setHours(23, 59, 59, 999);

      const { data: subscriptions } = await supabase
        .from('user_subscriptions')
        .select('user_id')
        .eq('status', 'active')
        .neq('plan_type', 'free')
        .gte('current_period_end', startOfDay.toISOString())
        .lte('current_period_end', endOfDay.toISOString());

      targetUserIds = subscriptions?.map(s => s.user_id) || [];
    }

    if (targetUserIds.length === 0) {
      console.log('[SEND-NOTIFICATION] No target users found');
      return new Response(
        JSON.stringify({ success: true, recipients: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send dashboard notifications
    const dashboardMessages = targetUserIds.map(userId => ({
      user_id: userId,
      message_type: messageType,
      subject: subject,
      content: content,
      is_read: false,
    }));

    const { error: insertError } = await supabase
      .from('user_system_messages')
      .insert(dashboardMessages);

    if (insertError) {
      console.error('[SEND-NOTIFICATION] Dashboard insert error:', insertError);
    } else {
      console.log(`[SEND-NOTIFICATION] ✅ Inserted ${targetUserIds.length} dashboard messages`);
    }

    // Send emails
    const { data: usersWithEmails } = await supabase.auth.admin.listUsers();
    const targetEmails = usersWithEmails?.users
      ?.filter(u => targetUserIds.includes(u.id) && u.email)
      .map(u => ({ id: u.id, email: u.email! })) || [];

    let emailsSent = 0;
    for (const user of targetEmails) {
      try {
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #29B6D2;">${subject}</h1>
            <div style="font-size: 16px; line-height: 1.6;">${content}</div>
            ${getEmailFooter(user.email)}
          </div>
        `;

        await resend.emails.send({
          from: "SmartyGym <notifications@smartygym.com>",
          to: [user.email],
          subject: subject,
          html: emailHtml,
          headers: getEmailHeaders(user.email),
        });
        emailsSent++;

        // Rate limiting: 600ms delay between emails
        await new Promise(resolve => setTimeout(resolve, 600));
      } catch (emailError) {
        console.error(`[SEND-NOTIFICATION] Email error for ${user.email}:`, emailError);
      }
    }

    console.log(`[SEND-NOTIFICATION] ✅ Sent ${emailsSent} emails`);

    // Log to audit
    await supabase.from('notification_audit_log').insert({
      notification_type: body.type,
      message_type: messageType,
      recipient_count: targetUserIds.length,
      success_count: targetUserIds.length,
      failed_count: 0,
      subject: subject,
      content: content,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        dashboardSent: targetUserIds.length,
        emailsSent: emailsSent 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("[SEND-NOTIFICATION] ERROR:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
