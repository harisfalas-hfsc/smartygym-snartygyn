import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { MESSAGE_TYPES } from "../_shared/notification-types.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Determine if this is morning or night reminder based on current Cyprus time
    const now = new Date();
    const cyprusTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Nicosia" }));
    const hour = cyprusTime.getHours();
    
    // Morning reminder: 8:00 AM Cyprus (called at 06:00 UTC)
    // Night reminder: 8:00 PM Cyprus (called at 18:00 UTC)
    const isMorning = hour >= 7 && hour < 12;
    const reminderType = isMorning ? 'morning' : 'night';
    const reminderIcon = isMorning ? '🌅' : '🌙';
    const windowTime = isMorning ? '9:00 AM' : '9:00 PM';
    
    console.log(`Sending ${reminderType} check-in reminders at Cyprus hour ${hour}`);

    // Get all users with their preferences
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, full_name, notification_preferences');

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }

    // Filter users with checkin_reminders enabled for email (opt-out model like all other emails)
    const usersForEmail = profiles?.filter(p => {
      const prefs = p.notification_preferences as Record<string, any> || {};
      return prefs.opt_out_all !== true && prefs.email_checkin_reminders !== false;
    }) || [];

    const usersForDashboard = profiles?.filter(p => {
      const prefs = p.notification_preferences as Record<string, any> || {};
      return prefs.opt_out_all !== true && prefs.dashboard_checkin_reminders !== false;
    }) || [];

    console.log(`Found ${usersForEmail.length} users for email, ${usersForDashboard.length} for dashboard`);

    if (usersForDashboard.length === 0 && usersForEmail.length === 0) {
      return new Response(JSON.stringify({ success: true, message: 'No subscribers' }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user emails from auth.users
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw usersError;
    }

    const userMap = new Map(users?.map(u => [u.id, u.email]) || []);
    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

    let sentCount = 0;
    let dashboardCount = 0;
    let failedCount = 0;

    // Send dashboard notifications
    for (const profile of usersForDashboard) {
      const userName = profile.full_name || 'Smarty';
      
      const dashboardMessage = {
        user_id: profile.user_id,
        message_type: MESSAGE_TYPES.CHECKIN_REMINDER,
        subject: `${reminderIcon} ${reminderType === 'morning' ? 'Morning' : 'Night'} Check-in Reminder`,
        content: `
          <p>Hey ${userName}!</p>
          <p>Your ${reminderType} check-in window opens soon at <strong>${windowTime}</strong>.</p>
          <p>Take a moment to track your wellness and keep your streak going!</p>
          <p><a href="https://smartygym.com/userdashboard" style="color: #29B6D2;">Go to Dashboard →</a></p>
        `,
        is_read: false
      };

      const { error: msgError } = await supabase
        .from('user_system_messages')
        .insert(dashboardMessage);

      if (msgError) {
        console.error(`Failed to create dashboard message for ${profile.user_id}:`, msgError);
      } else {
        dashboardCount++;
      }
    }

    // Send emails only to users who have email enabled
    for (const profile of usersForEmail) {
      const email = userMap.get(profile.user_id);
      if (!email) continue;

      const userName = profile.full_name || 'Smarty';

      try {
        await resend.emails.send({
          from: "SmartyGym <notifications@smartygym.com>",
          to: [email],
          subject: `${reminderIcon} ${reminderType === 'morning' ? 'Morning' : 'Night'} Check-in Reminder`,
          reply_to: "smartygym@outlook.com",
          headers: {
            "List-Unsubscribe": "<https://smartygym.com/unsubscribe-help>",
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click"
          },
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <meta name="x-apple-disable-message-reformatting">
              <style>
                @media only screen and (max-width: 600px) {
                  .email-container { width: 100% !important; padding: 16px !important; }
                  .email-content { padding: 24px 16px !important; }
                }
                img { max-width: 100%; height: auto; }
              </style>
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
                <tr>
                  <td style="padding: 20px;" class="email-container">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px;">
                      <tr>
                        <td style="padding: 40px; text-align: center;" class="email-content">
                          <img src="https://smartygym.com/smarty-gym-logo.png" alt="SmartyGym" style="height: 60px; margin-bottom: 20px; max-width: 100%;" />
                          <p style="color: #29B6D2; font-size: 14px; margin: 0 0 30px 0;">Your Gym Re-imagined. Anywhere, Anytime.</p>
                          
                          <h1 style="color: #ffffff; font-size: 24px; margin: 0 0 20px 0;">
                            ${reminderIcon} ${reminderType === 'morning' ? 'Morning' : 'Night'} Check-in Time!
                          </h1>
                          
                          <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 24px; margin: 20px 0; text-align: left;">
                            <p style="color: #ffffff; font-size: 16px; margin: 0 0 16px 0;">Hey ${userName}!</p>
                            <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
                              Your ${reminderType} check-in window opens soon at <strong style="color: #29B6D2;">${windowTime}</strong>.
                            </p>
                            <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 0;">
                              Take a moment to track your wellness and keep your streak going!
                            </p>
                          </div>
                          
                          <a href="https://smartygym.com/userdashboard" style="display: inline-block; background: linear-gradient(135deg, #29B6D2 0%, #1E9CB8 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 20px 0;">
                            Go to Dashboard
                          </a>
                          
                          <p style="color: #888888; font-size: 12px; margin: 30px 0 0 0;">
                            You're receiving this because you subscribed to check-in reminders.<br/>
                            <a href="https://smartygym.com/unsubscribe-help" style="color: #29B6D2;">Unsubscribe</a>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `
        });
        
        sentCount++;
        console.log(`Sent ${reminderType} reminder to ${email}`);
        
        // Rate limiting: 600ms delay
        await new Promise(resolve => setTimeout(resolve, 600));
      } catch (emailError) {
        console.error(`Failed to send email to ${email}:`, emailError);
        failedCount++;
      }
    }

    console.log(`Check-in reminders complete: ${dashboardCount} dashboard, ${sentCount} emails sent, ${failedCount} failed`);

    // Log to notification_audit_log for health audit tracking
    await supabase.from('notification_audit_log').insert({
      notification_type: MESSAGE_TYPES.CHECKIN_REMINDER,
      message_type: MESSAGE_TYPES.CHECKIN_REMINDER,
      recipient_count: usersForDashboard.length + usersForEmail.length,
      success_count: dashboardCount + sentCount,
      failed_count: failedCount,
      subject: `${reminderIcon} ${reminderType === 'morning' ? 'Morning' : 'Night'} Check-in Reminder`,
      content: `Check-in reminders sent - ${sentCount} emails, ${dashboardCount} dashboard messages`,
      sent_at: new Date().toISOString(),
      metadata: {
        reminderType,
        dashboardCount,
        sentCount,
        failedCount,
      }
    });

    return new Response(JSON.stringify({ 
      success: true, 
      reminderType,
      dashboardCount,
      sentCount,
      failedCount 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Error in send-checkin-reminders:", error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
