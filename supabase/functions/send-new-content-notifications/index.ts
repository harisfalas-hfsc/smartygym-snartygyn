import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { getEmailHeaders, getEmailFooter } from "../_shared/email-utils.ts";
import { MESSAGE_TYPES } from "../_shared/notification-types.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[NEW-CONTENT-NOTIFICATIONS] ${step}${detailsStr}`);
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

async function sendEmail(to: string, subject: string, html: string): Promise<{ success: boolean; error?: string }> {
  if (!RESEND_API_KEY) {
    return { success: false, error: "RESEND_API_KEY not configured" };
  }
  
  try {
    const resend = new Resend(RESEND_API_KEY);
    await resend.emails.send({
      from: "SmartyGym <notifications@smartygym.com>",
      to: [to],
      subject,
      headers: getEmailHeaders(to),
      html: html.replace('</body>', `${getEmailFooter(to)}</body>`),
    });
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    logStep("🚀 Starting new content notification processing");

    // Get pending notifications older than 5 minutes (buffered)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    logStep("📅 Looking for items older than", { fiveMinutesAgo });
    
    const { data: pendingItems, error: fetchError } = await supabase
      .from("pending_content_notifications")
      .select("*")
      .lt("created_at", fiveMinutesAgo);

    if (fetchError) {
      logStep("❌ Error fetching pending notifications", { error: fetchError.message });
      throw new Error(`Failed to fetch pending notifications: ${fetchError.message}`);
    }

    if (!pendingItems || pendingItems.length === 0) {
      logStep("📭 No pending content notifications to process");
      return new Response(JSON.stringify({ success: true, message: "No pending notifications" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logStep("📦 Found pending items", { count: pendingItems.length, items: pendingItems.map(i => ({ type: i.content_type, name: i.content_name })) });

    // Group by content type
    const workouts = pendingItems.filter(item => item.content_type === 'workout');
    const programs = pendingItems.filter(item => item.content_type === 'program');

    // Build notification content
    let subject = "";
    let dashboardContent = "";
    let emailHtml = "";
    let messageType: string = MESSAGE_TYPES.CONTENT_UPDATE;

    const workoutCount = workouts.length;
    const programCount = programs.length;

    logStep("📊 Content breakdown", { workoutCount, programCount });

    if (workoutCount > 0 && programCount > 0) {
      // Mixed content
      subject = `🆕 New Content Added to SmartyGym!`;
      messageType = MESSAGE_TYPES.CONTENT_UPDATE;
      
      const workoutText = workoutCount === 1 
        ? `1 new workout` 
        : `${workoutCount} new workouts`;
      const programText = programCount === 1 
        ? `1 new training program` 
        : `${programCount} new training programs`;

      dashboardContent = `
        <p class="tiptap-paragraph">Great news! We've just added ${workoutText} and ${programText} to the SmartyGym library.</p>
        <p class="tiptap-paragraph">Explore our expanded collection of expert-designed content by Sports Scientist Haris Falas and take your training to the next level.</p>
        <p class="tiptap-paragraph"><a href="/workout" style="color: #29B6D2; text-decoration: underline;">Browse Workouts →</a></p>
        <p class="tiptap-paragraph"><a href="/trainingprogram" style="color: #29B6D2; text-decoration: underline;">Browse Training Programs →</a></p>
      `;

      emailHtml = buildEmailHtml(
        "New Content Added!",
        `<p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 15px;">Great news! We've just added <strong>${workoutText}</strong> and <strong>${programText}</strong> to the SmartyGym library.</p>
        <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 20px;">Explore our expanded collection of expert-designed content by Sports Scientist Haris Falas and take your training to the next level.</p>`,
        [
          { text: "Browse Workouts", url: "https://smartygym.com/workout" },
          { text: "Browse Programs", url: "https://smartygym.com/trainingprogram" }
        ]
      );
    } else if (workoutCount > 0) {
      // Only workouts
      messageType = MESSAGE_TYPES.NEW_WORKOUT;
      
      if (workoutCount === 1) {
        const workout = workouts[0];
        subject = `🏋️ New Workout: ${workout.content_name}`;
        dashboardContent = `
          <p class="tiptap-paragraph">A new workout has been added to the SmartyGym library!</p>
          <p class="tiptap-paragraph"><strong>${workout.content_name}</strong>${workout.content_category ? ` in ${workout.content_category}` : ''}</p>
          <p class="tiptap-paragraph">Designed by Sports Scientist Haris Falas to help you achieve your fitness goals.</p>
          <p class="tiptap-paragraph"><a href="/workout" style="color: #29B6D2; text-decoration: underline;">View Workout →</a></p>
        `;
        emailHtml = buildEmailHtml(
          "New Workout Added!",
          `<p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 15px;">A new workout has been added to the SmartyGym library!</p>
          <p style="font-size: 18px; font-weight: bold; color: #29B6D2; margin-bottom: 15px;">${workout.content_name}</p>
          <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 20px;">Designed by Sports Scientist Haris Falas to help you achieve your fitness goals.</p>`,
          [{ text: "View Workout", url: "https://smartygym.com/workout" }]
        );
      } else {
        subject = `🏋️ ${workoutCount} New Workouts Added!`;
        const categories = [...new Set(workouts.map(w => w.content_category).filter(Boolean))];
        const categoryText = categories.length > 0 ? ` across ${categories.join(', ')}` : '';
        
        dashboardContent = `
          <p class="tiptap-paragraph">${workoutCount} new workouts have been added to the SmartyGym library${categoryText}!</p>
          <p class="tiptap-paragraph">Expand your training options with our latest expert-designed workouts by Sports Scientist Haris Falas.</p>
          <p class="tiptap-paragraph"><a href="/workout" style="color: #29B6D2; text-decoration: underline;">Browse All Workouts →</a></p>
        `;
        emailHtml = buildEmailHtml(
          `${workoutCount} New Workouts Added!`,
          `<p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 15px;"><strong>${workoutCount} new workouts</strong> have been added to the SmartyGym library${categoryText}!</p>
          <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 20px;">Expand your training options with our latest expert-designed workouts by Sports Scientist Haris Falas.</p>`,
          [{ text: "Browse All Workouts", url: "https://smartygym.com/workout" }]
        );
      }
    } else if (programCount > 0) {
      // Only programs
      messageType = MESSAGE_TYPES.NEW_PROGRAM;
      
      if (programCount === 1) {
        const program = programs[0];
        subject = `📚 New Training Program: ${program.content_name}`;
        dashboardContent = `
          <p class="tiptap-paragraph">A new training program has been added to the SmartyGym library!</p>
          <p class="tiptap-paragraph"><strong>${program.content_name}</strong>${program.content_category ? ` in ${program.content_category}` : ''}</p>
          <p class="tiptap-paragraph">Structured programming by Sports Scientist Haris Falas for maximum results.</p>
          <p class="tiptap-paragraph"><a href="/trainingprogram" style="color: #29B6D2; text-decoration: underline;">View Program →</a></p>
        `;
        emailHtml = buildEmailHtml(
          "New Training Program Added!",
          `<p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 15px;">A new training program has been added to the SmartyGym library!</p>
          <p style="font-size: 18px; font-weight: bold; color: #29B6D2; margin-bottom: 15px;">${program.content_name}</p>
          <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 20px;">Structured programming by Sports Scientist Haris Falas for maximum results.</p>`,
          [{ text: "View Program", url: "https://smartygym.com/trainingprogram" }]
        );
      } else {
        subject = `📚 ${programCount} New Training Programs Added!`;
        const categories = [...new Set(programs.map(p => p.content_category).filter(Boolean))];
        const categoryText = categories.length > 0 ? ` across ${categories.join(', ')}` : '';
        
        dashboardContent = `
          <p class="tiptap-paragraph">${programCount} new training programs have been added to the SmartyGym library${categoryText}!</p>
          <p class="tiptap-paragraph">Transform your fitness with our latest structured programs by Sports Scientist Haris Falas.</p>
          <p class="tiptap-paragraph"><a href="/trainingprogram" style="color: #29B6D2; text-decoration: underline;">Browse All Programs →</a></p>
        `;
        emailHtml = buildEmailHtml(
          `${programCount} New Training Programs Added!`,
          `<p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 15px;"><strong>${programCount} new training programs</strong> have been added to the SmartyGym library${categoryText}!</p>
          <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 20px;">Transform your fitness with our latest structured programs by Sports Scientist Haris Falas.</p>`,
          [{ text: "Browse All Programs", url: "https://smartygym.com/trainingprogram" }]
        );
      }
    }

    // Get all users to notify
    logStep("🔍 Fetching all users");
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      logStep("❌ Error fetching users", { error: authError.message });
      throw new Error(`Failed to fetch users: ${authError.message}`);
    }

    const users = authUsers?.users || [];
    logStep("👥 Found users to notify", { count: users.length });

    let dashboardSuccess = 0;
    let emailSuccess = 0;
    let dashboardFailed = 0;
    let emailFailed = 0;
    const emailErrors: { email: string; error: string }[] = [];

    // Send notifications to all users
    for (const user of users) {
      // Dashboard message
      const { error: msgError } = await supabase
        .from("user_system_messages")
        .insert({
          user_id: user.id,
          message_type: messageType,
          subject: subject,
          content: dashboardContent,
          is_read: false,
        });

      if (msgError) {
        logStep("❌ Dashboard message failed", { userId: user.id, error: msgError.message });
        dashboardFailed++;
      } else {
        dashboardSuccess++;
      }

      // Email
      if (user.email) {
        // Check notification preferences
        const { data: profile } = await supabase
          .from("profiles")
          .select("notification_preferences")
          .eq("user_id", user.id)
          .single();

        const prefs = profile?.notification_preferences as any;
        const emailEnabled = prefs?.email_notifications !== false && prefs?.newsletter !== false;

        if (emailEnabled) {
          const result = await sendEmail(user.email, subject, emailHtml);
          if (result.success) {
            emailSuccess++;
            // Rate limiting: 600ms delay to respect Resend's 2 requests/second limit
            await new Promise(resolve => setTimeout(resolve, 600));
          } else {
            emailFailed++;
            emailErrors.push({ email: user.email, error: result.error || "Unknown error" });
            logStep("❌ Email failed", { email: user.email, error: result.error });
          }
        } else {
          logStep("⏭️ Email disabled for user", { userId: user.id });
        }
      }
    }

    // Delete processed pending notifications
    const idsToDelete = pendingItems.map(item => item.id);
    logStep("🗑️ Deleting processed items", { count: idsToDelete.length });
    
    const { error: deleteError } = await supabase
      .from("pending_content_notifications")
      .delete()
      .in("id", idsToDelete);

    if (deleteError) {
      logStep("⚠️ Warning: Failed to delete processed items", { error: deleteError.message });
    }

    // Log to audit
    logStep("📝 Logging to audit");
    await supabase.from("notification_audit_log").insert({
      notification_type: "automated",
      message_type: messageType,
      subject: subject,
      content: dashboardContent,
      recipient_count: users.length,
      success_count: dashboardSuccess,
      failed_count: dashboardFailed,
      metadata: {
        workouts_count: workoutCount,
        programs_count: programCount,
        email_success: emailSuccess,
        email_failed: emailFailed,
        email_errors: emailErrors.length > 0 ? emailErrors : undefined,
      },
    });

    logStep("🎉 Completed notification processing", {
      totalUsers: users.length,
      dashboardSuccess,
      dashboardFailed,
      emailSuccess,
      emailFailed,
      emailErrorCount: emailErrors.length
    });

    return new Response(
      JSON.stringify({
        success: true,
        processed: pendingItems.length,
        workouts: workoutCount,
        programs: programCount,
        dashboardSent: dashboardSuccess,
        dashboardFailed,
        emailsSent: emailSuccess,
        emailsFailed: emailFailed,
        emailErrors: emailErrors.length > 0 ? emailErrors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    logStep("💥 FATAL ERROR", { error: error.message, stack: error.stack });
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildEmailHtml(
  title: string,
  bodyContent: string,
  buttons: { text: string; url: string }[]
): string {
  const buttonHtml = buttons
    .map(
      (btn) => `
      <a href="${btn.url}" style="display: inline-block; background: linear-gradient(135deg, #29B6D2, #5CD3E8); color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin-right: 10px; margin-bottom: 10px;">${btn.text}</a>
    `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
        <tr>
          <td style="padding: 40px 20px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; text-align: center;">
                  <h1 style="color: #29B6D2; margin: 0; font-size: 28px; font-weight: bold;">SmartyGym</h1>
                  <p style="color: #999; margin: 8px 0 0 0; font-size: 14px;">Expert Fitness by Haris Falas</p>
                </td>
              </tr>
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 24px;">${title}</h2>
                  ${bodyContent}
                  <div style="margin-top: 30px;">
                    ${buttonHtml}
                  </div>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9f9f9; padding: 25px 30px; border-top: 1px solid #eee;">
                  <p style="color: #666; font-size: 13px; margin: 0; line-height: 1.5;">
                    You're receiving this email because you're a SmartyGym member.<br>
                    <a href="https://smartygym.com/userdashboard" style="color: #29B6D2;">Manage your notification preferences</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
