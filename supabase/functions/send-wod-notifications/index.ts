import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { getEmailHeaders, getEmailFooter } from "../_shared/email-utils.ts";
import { MESSAGE_TYPES } from "../_shared/notification-types.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function logStep(step: string, details?: any) {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-WOD-NOTIFICATIONS] ${step}${detailsStr}`);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting WOD notification delivery (7AM Cyprus time)");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resendClient = new Resend(resendApiKey);

    // Get today's date in Cyprus timezone
    const now = new Date();
    const cyprusOffset = 2;
    const cyprusTime = new Date(now.getTime() + cyprusOffset * 60 * 60 * 1000);
    const todayStr = cyprusTime.toISOString().split('T')[0];

    logStep("Looking for today's WODs", { todayStr });

    // Find today's active WODs
    const { data: todaysWods, error: wodError } = await supabase
      .from("admin_workouts")
      .select("*")
      .eq("is_workout_of_day", true)
      .eq("generated_for_date", todayStr);

    if (wodError) {
      throw new Error(`Failed to fetch WODs: ${wodError.message}`);
    }

    if (!todaysWods || todaysWods.length === 0) {
      logStep("No WODs found for today - checking for any active WODs");
      
      // Fallback: check for any active WODs
      const { data: activeWods } = await supabase
        .from("admin_workouts")
        .select("*")
        .eq("is_workout_of_day", true)
        .limit(2);
      
      if (!activeWods || activeWods.length === 0) {
        logStep("No active WODs found at all");
        return new Response(
          JSON.stringify({ success: true, sent: false, reason: "No WODs to notify about" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }
      
      // Use active WODs instead
      todaysWods.push(...activeWods);
    }

    const bodyweightWod = todaysWods.find(w => w.equipment === "BODYWEIGHT");
    const equipmentWod = todaysWods.find(w => w.equipment === "EQUIPMENT");
    const category = todaysWods[0]?.category || "Fitness";
    const format = todaysWods[0]?.format || "CIRCUIT";
    const difficulty = todaysWods[0]?.difficulty || "Intermediate";
    const difficultyStars = todaysWods[0]?.difficulty_stars || 3;

    logStep("WODs found", { 
      bodyweight: bodyweightWod?.name, 
      equipment: equipmentWod?.name,
      category,
      format,
      difficulty
    });

    // Check if notification was already sent today (prevent duplicates)
    const todayStart = new Date(cyprusTime.getFullYear(), cyprusTime.getMonth(), cyprusTime.getDate()).toISOString();
    const { data: existingNotification } = await supabase
      .from("notification_audit_log")
      .select("id")
      .eq("notification_type", MESSAGE_TYPES.WOD_NOTIFICATION)
      .gte("sent_at", todayStart)
      .limit(1);

    if (existingNotification && existingNotification.length > 0) {
      logStep("WOD notification already sent today, skipping");
      return new Response(
        JSON.stringify({ success: true, sent: false, reason: "Already sent today" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Get all users
    const { data: allUsers } = await supabase.from('profiles').select('user_id');
    const userIds = allUsers?.map(u => u.user_id) || [];

    if (userIds.length === 0) {
      logStep("No users to notify");
      return new Response(
        JSON.stringify({ success: true, sent: false, reason: "No users" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    logStep(`Sending WOD notifications to ${userIds.length} users`);

    const notificationTitle = `🏆 Today's Workouts: Choose Your Style!`;
    const notificationContent = `<p class="tiptap-paragraph"><strong>🏆 Today's Workouts of the Day</strong></p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph">Today we have <strong>TWO</strong> workout options following our ${category} day:</p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph"><strong>🏠 No Equipment:</strong> ${bodyweightWod?.name || "Bodyweight Workout"}</p>
<p class="tiptap-paragraph"><strong>🏋️ With Equipment:</strong> ${equipmentWod?.name || "Equipment Workout"}</p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph">${category} | ${format} | ${difficulty} (${difficultyStars}⭐)</p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph">Choose based on your situation: at home, traveling, or at the gym!</p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph">Available for €3.99 each or included with Premium.</p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph"><a href="https://smartygym.com/workout/wod">View Today's Workouts →</a></p>`;

    // Insert dashboard notifications
    await supabase.from('user_system_messages').insert(userIds.map(userId => ({
      user_id: userId,
      message_type: MESSAGE_TYPES.WOD_NOTIFICATION,
      subject: notificationTitle,
      content: notificationContent,
      is_read: false,
    })));

    logStep("Dashboard notifications inserted");

    // Get user emails and preferences
    const { data: usersData } = await supabase.auth.admin.listUsers();
    const { data: allProfiles } = await supabase
      .from('profiles')
      .select('user_id, notification_preferences');

    const profilesMap = new Map(allProfiles?.map(p => [p.user_id, p.notification_preferences]) || []);

    let emailsSent = 0;
    let emailsSkipped = 0;

    for (const authUser of usersData?.users || []) {
      if (!authUser.email || !userIds.includes(authUser.id)) continue;

      const prefs = (profilesMap.get(authUser.id) as Record<string, any>) || {};

      if (prefs.opt_out_all === true || prefs.email_wod === false) {
        logStep(`Skipping WOD email for ${authUser.email} (opted out)`);
        emailsSkipped++;
        continue;
      }

      try {
        const emailResult = await resendClient.emails.send({
          from: 'SmartyGym <notifications@smartygym.com>',
          to: [authUser.email],
          subject: notificationTitle,
          headers: getEmailHeaders(authUser.email, 'wod'),
          html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
<h1 style="color: #29B6D2;">🏆 Today's Workouts</h1>
<p style="font-size: 16px;">Today we have <strong>TWO</strong> workout options for ${category} day:</p>
<div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
  <p style="margin: 10px 0;"><strong>🏠 No Equipment:</strong> ${bodyweightWod?.name || "Bodyweight Workout"}</p>
  <p style="margin: 10px 0;"><strong>🏋️ With Equipment:</strong> ${equipmentWod?.name || "Equipment Workout"}</p>
</div>
<p><strong>Format:</strong> ${format} | <strong>Difficulty:</strong> ${difficulty} (${difficultyStars}⭐)</p>
<p style="color: #666;">Choose based on your situation: at home, traveling, or at the gym!</p>
<p style="margin-top: 20px;">Available for €3.99 each or included with Premium.</p>
<p style="margin-top: 20px;"><a href="https://smartygym.com/workout/wod" style="background: #29B6D2; color: white; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">View Workouts →</a></p>
${getEmailFooter(authUser.email, 'wod')}
</div>`,
        });

        if (emailResult.error) {
          logStep("Email API error", { email: authUser.email, error: emailResult.error });
        } else {
          emailsSent++;
          // Rate limiting: 600ms delay
          await new Promise(resolve => setTimeout(resolve, 600));
        }
      } catch (e) {
        logStep("Email send error", { email: authUser.email, error: e });
      }
    }

    // Add audit log entry
    await supabase.from('notification_audit_log').insert({
      notification_type: MESSAGE_TYPES.WOD_NOTIFICATION,
      message_type: MESSAGE_TYPES.WOD_NOTIFICATION,
      recipient_count: userIds.length,
      success_count: emailsSent,
      failed_count: emailsSkipped,
      subject: notificationTitle,
      content: `WOD notification sent - ${emailsSent} emails, ${userIds.length} dashboard messages`,
      sent_at: new Date().toISOString(),
    });

    logStep(`✅ Notifications complete: ${userIds.length} dashboard, ${emailsSent} emails sent, ${emailsSkipped} skipped`);

    return new Response(
      JSON.stringify({
        success: true,
        dashboardNotifications: userIds.length,
        emailsSent,
        emailsSkipped,
        wods: {
          bodyweight: bodyweightWod?.name,
          equipment: equipmentWod?.name,
          category,
          format
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logStep("ERROR", { message: errorMessage });

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
