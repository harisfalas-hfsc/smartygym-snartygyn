import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

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

    // Get all users with checkin_reminders enabled
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, full_name, notification_preferences')
      .not('notification_preferences', 'is', null);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }

    // Filter users with checkin_reminders enabled
    const subscribedUsers = profiles?.filter(p => {
      const prefs = p.notification_preferences as Record<string, boolean>;
      return prefs?.checkin_reminders === true;
    }) || [];

    console.log(`Found ${subscribedUsers.length} users subscribed to check-in reminders`);

    if (subscribedUsers.length === 0) {
      return new Response(JSON.stringify({ success: true, message: 'No subscribers' }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user emails from auth.users
    const userIds = subscribedUsers.map(u => u.user_id);
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw usersError;
    }

    const userMap = new Map(users?.map(u => [u.id, u.email]) || []);

    let sentCount = 0;
    let failedCount = 0;

    for (const profile of subscribedUsers) {
      const email = userMap.get(profile.user_id);
      if (!email) continue;

      const userName = profile.full_name || 'Smarty';
      
      // Create dashboard notification
      const dashboardMessage = {
        user_id: profile.user_id,
        message_type: 'motivational_weekly',
        subject: `${reminderIcon} ${reminderType === 'morning' ? 'Morning' : 'Night'} Check-in Reminder`,
        content: `
          <p>Hey ${userName}!</p>
          <p>Your ${reminderType} check-in window opens soon at <strong>${windowTime}</strong>.</p>
          <p>Take a moment to track your wellness and keep your streak going!</p>
          <p><a href="https://smartygym.com/userdashboard" style="color: #D4AF37;">Go to Dashboard →</a></p>
        `,
        is_read: false
      };

      const { error: msgError } = await supabase
        .from('user_system_messages')
        .insert(dashboardMessage);

      if (msgError) {
        console.error(`Failed to create dashboard message for ${email}:`, msgError);
      }

      // Send email
      try {
        await resend.emails.send({
          from: "SmartyGym <notifications@smartygym.com>",
          to: [email],
          subject: `${reminderIcon} ${reminderType === 'morning' ? 'Morning' : 'Night'} Check-in Reminder`,
          reply_to: "admin@smartygym.com",
          headers: {
            "List-Unsubscribe": "<https://smartygym.com/unsubscribe>",
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click"
          },
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 40px; text-align: center;">
                  <img src="https://smartygym.com/smarty-gym-logo.png" alt="SmartyGym" style="height: 60px; margin-bottom: 20px;" />
                  <p style="color: #D4AF37; font-size: 14px; margin: 0 0 30px 0;">Your Gym Re-imagined. Anywhere, Anytime.</p>
                  
                  <h1 style="color: #ffffff; font-size: 24px; margin: 0 0 20px 0;">
                    ${reminderIcon} ${reminderType === 'morning' ? 'Morning' : 'Night'} Check-in Time!
                  </h1>
                  
                  <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 24px; margin: 20px 0; text-align: left;">
                    <p style="color: #ffffff; font-size: 16px; margin: 0 0 16px 0;">Hey ${userName}!</p>
                    <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
                      Your ${reminderType} check-in window opens soon at <strong style="color: #D4AF37;">${windowTime}</strong>.
                    </p>
                    <p style="color: #cccccc; font-size: 14px; line-height: 1.6; margin: 0;">
                      Take a moment to track your wellness and keep your streak going!
                    </p>
                  </div>
                  
                  <a href="https://smartygym.com/userdashboard" style="display: inline-block; background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%); color: #000000; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 20px 0;">
                    Go to Dashboard
                  </a>
                  
                  <p style="color: #888888; font-size: 12px; margin: 30px 0 0 0;">
                    You're receiving this because you subscribed to check-in reminders.<br/>
                    <a href="https://smartygym.com/unsubscribe" style="color: #D4AF37;">Unsubscribe</a>
                  </p>
                </div>
              </div>
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

    console.log(`Check-in reminders complete: ${sentCount} sent, ${failedCount} failed`);

    return new Response(JSON.stringify({ 
      success: true, 
      reminderType,
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