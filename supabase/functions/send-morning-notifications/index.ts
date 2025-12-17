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
  console.log(`[SEND-MORNING-NOTIFICATIONS] ${step}${detailsStr}`);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting combined morning notification delivery (7:00 AM Cyprus time)");

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

    logStep("Looking for today's content", { todayStr });

    // ============================================
    // FETCH TODAY'S WODs
    // ============================================
    let todaysWods: any[] = [];
    const { data: wodsData, error: wodError } = await supabase
      .from("admin_workouts")
      .select("*")
      .eq("is_workout_of_day", true)
      .eq("generated_for_date", todayStr);

    if (!wodError && wodsData && wodsData.length > 0) {
      todaysWods = wodsData;
    } else {
      // Fallback: check for any active WODs
      const { data: activeWods } = await supabase
        .from("admin_workouts")
        .select("*")
        .eq("is_workout_of_day", true)
        .limit(2);
      
      if (activeWods && activeWods.length > 0) {
        todaysWods = activeWods;
      }
    }

    const bodyweightWod = todaysWods.find(w => w.equipment === "BODYWEIGHT");
    const equipmentWod = todaysWods.find(w => w.equipment === "EQUIPMENT");
    const category = todaysWods[0]?.category || "Fitness";
    const format = todaysWods[0]?.format || "CIRCUIT";
    const difficulty = todaysWods[0]?.difficulty || "Intermediate";
    const difficultyStars = todaysWods[0]?.difficulty_stars || 3;
    const hasWods = todaysWods.length > 0;

    logStep("WODs found", { 
      hasWods,
      bodyweight: bodyweightWod?.name, 
      equipment: equipmentWod?.name,
      category
    });

    // ============================================
    // FETCH TODAY'S RITUAL
    // ============================================
    let todaysRitual: any = null;
    const { data: ritualData, error: ritualError } = await supabase
      .from("daily_smarty_rituals")
      .select("*")
      .eq("ritual_date", todayStr)
      .single();

    if (!ritualError && ritualData) {
      todaysRitual = ritualData;
    }

    const hasRitual = !!todaysRitual;
    logStep("Ritual found", { hasRitual, dayNumber: todaysRitual?.day_number });

    // If neither WOD nor Ritual exists, skip
    if (!hasWods && !hasRitual) {
      logStep("No WODs or Ritual found for today - skipping notifications");
      return new Response(
        JSON.stringify({ success: true, sent: false, reason: "No content for today" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // ============================================
    // CHECK FOR DUPLICATE NOTIFICATIONS
    // ============================================
    const todayStart = new Date(cyprusTime.getFullYear(), cyprusTime.getMonth(), cyprusTime.getDate()).toISOString();
    const { data: existingNotification } = await supabase
      .from("notification_audit_log")
      .select("id")
      .eq("notification_type", MESSAGE_TYPES.MORNING_NOTIFICATION)
      .gte("sent_at", todayStart)
      .limit(1);

    if (existingNotification && existingNotification.length > 0) {
      logStep("Morning notification already sent today, skipping");
      return new Response(
        JSON.stringify({ success: true, sent: false, reason: "Already sent today" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // ============================================
    // GET ALL USERS
    // ============================================
    const { data: allUsers } = await supabase.from('profiles').select('user_id');
    const userIds = allUsers?.map(u => u.user_id) || [];

    if (userIds.length === 0) {
      logStep("No users to notify");
      return new Response(
        JSON.stringify({ success: true, sent: false, reason: "No users" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    logStep(`Sending morning notifications to ${userIds.length} users`);

    // ============================================
    // BUILD NOTIFICATION CONTENT
    // ============================================
    const notificationTitle = `🌅 Good Morning, Smarty! Today's Workouts & Ritual Are Ready`;
    
    // Build dashboard notification content
    let dashboardContent = `<p class="tiptap-paragraph"><strong>🌅 Good Morning, Smarty!</strong></p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph">Your daily fitness content is ready!</p>
<p class="tiptap-paragraph"></p>`;

    if (hasWods) {
      dashboardContent += `<p class="tiptap-paragraph"><strong>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</strong></p>
<p class="tiptap-paragraph"><strong>🏆 TODAY'S WORKOUTS OF THE DAY</strong></p>
<p class="tiptap-paragraph"><strong>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</strong></p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph">Today is <strong>${category}</strong> day with TWO workout options:</p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph"><strong>🏠 No Equipment:</strong> ${bodyweightWod?.name || "Bodyweight Workout"}</p>
<p class="tiptap-paragraph"><strong>🏋️ With Equipment:</strong> ${equipmentWod?.name || "Equipment Workout"}</p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph">${format} | ${difficulty} (${difficultyStars}⭐)</p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph"><a href="https://smartygym.com/workout/wod">View Today's Workouts →</a></p>
<p class="tiptap-paragraph"></p>`;
    }

    if (hasRitual) {
      dashboardContent += `<p class="tiptap-paragraph"><strong>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</strong></p>
<p class="tiptap-paragraph"><strong>🌅 YOUR DAILY SMARTY RITUAL</strong></p>
<p class="tiptap-paragraph"><strong>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</strong></p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph">Your <strong>Day ${todaysRitual.day_number}</strong> Smarty Ritual is ready!</p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph">Start your day with intention through our three wellness rituals:</p>
<p class="tiptap-paragraph">☀️ <strong>Morning</strong> - Energize your start</p>
<p class="tiptap-paragraph">🌤️ <strong>Midday</strong> - Recharge and refocus</p>
<p class="tiptap-paragraph">🌙 <strong>Evening</strong> - Wind down peacefully</p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph"><a href="https://smartygym.com/daily-ritual">View Today's Ritual →</a></p>`;
    }

    // ============================================
    // INSERT DASHBOARD NOTIFICATIONS
    // ============================================
    await supabase.from('user_system_messages').insert(userIds.map(userId => ({
      user_id: userId,
      message_type: MESSAGE_TYPES.MORNING_NOTIFICATION,
      subject: notificationTitle,
      content: dashboardContent,
      is_read: false,
    })));

    logStep("Dashboard notifications inserted");

    // ============================================
    // SEND EMAILS
    // ============================================
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

      // Check if user has opted out of both WOD and Ritual emails
      const wantsWodEmail = prefs.email_wod !== false && hasWods;
      const wantsRitualEmail = prefs.email_ritual !== false && hasRitual;
      
      if (prefs.opt_out_all === true || (!wantsWodEmail && !wantsRitualEmail)) {
        logStep(`Skipping morning email for ${authUser.email} (opted out or no relevant content)`);
        emailsSkipped++;
        continue;
      }

      try {
        // Build email HTML based on user preferences
        let wodSection = '';
        let ritualSection = '';

        if (wantsWodEmail) {
          wodSection = `
<div style="margin: 30px 0; padding: 25px; background: #f8f9fa; border-radius: 12px; border-left: 4px solid #29B6D2;">
  <h2 style="color: #29B6D2; margin: 0 0 15px 0; font-size: 20px;">🏆 TODAY'S WORKOUTS OF THE DAY</h2>
  <p style="margin: 10px 0; color: #333;">Today is <strong>${category}</strong> day with TWO workout options:</p>
  <div style="margin: 15px 0;">
    <p style="margin: 8px 0; color: #333;"><strong>🏠 No Equipment:</strong> ${bodyweightWod?.name || "Bodyweight Workout"}</p>
    <p style="margin: 8px 0; color: #333;"><strong>🏋️ With Equipment:</strong> ${equipmentWod?.name || "Equipment Workout"}</p>
  </div>
  <p style="margin: 10px 0; color: #666;"><strong>Format:</strong> ${format} | <strong>Difficulty:</strong> ${difficulty} (${difficultyStars}⭐)</p>
  <p style="margin: 15px 0 0 0;"><a href="https://smartygym.com/workout/wod" style="background: #29B6D2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Today's Workouts →</a></p>
</div>`;
        }

        if (wantsRitualEmail) {
          ritualSection = `
<div style="margin: 30px 0; padding: 25px; background: #f8f9fa; border-radius: 12px; border-left: 4px solid #29B6D2;">
  <h2 style="color: #29B6D2; margin: 0 0 15px 0; font-size: 20px;">🌅 YOUR DAILY SMARTY RITUAL</h2>
  <p style="margin: 10px 0; color: #333;">Your <strong>Day ${todaysRitual?.day_number}</strong> Smarty Ritual is ready!</p>
  <p style="margin: 10px 0; color: #666;">Start your day with intention through our three wellness rituals:</p>
  <div style="margin: 15px 0;">
    <p style="margin: 8px 0; color: #333;">☀️ <strong>Morning</strong> - Energize your start</p>
    <p style="margin: 8px 0; color: #333;">🌤️ <strong>Midday</strong> - Recharge and refocus</p>
    <p style="margin: 8px 0; color: #333;">🌙 <strong>Evening</strong> - Wind down peacefully</p>
  </div>
  <p style="margin: 15px 0 0 0;"><a href="https://smartygym.com/daily-ritual" style="background: #29B6D2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Today's Ritual →</a></p>
</div>`;
        }

        const emailHtml = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
<h1 style="color: #29B6D2; margin-bottom: 10px;">🌅 Good Morning, Smarty!</h1>
<p style="font-size: 16px; color: #333; margin-bottom: 25px;">Your daily fitness content is ready and waiting for you!</p>
${wodSection}
${ritualSection}
<p style="margin-top: 30px; color: #666; font-size: 14px;">Choose based on your situation: at home, traveling, or at the gym!</p>
${getEmailFooter(authUser.email, 'wod')}
</div>`;

        const emailResult = await resendClient.emails.send({
          from: 'SmartyGym <notifications@smartygym.com>',
          to: [authUser.email],
          subject: notificationTitle,
          headers: getEmailHeaders(authUser.email, 'wod'),
          html: emailHtml,
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

    // ============================================
    // AUDIT LOG
    // ============================================
    await supabase.from('notification_audit_log').insert({
      notification_type: MESSAGE_TYPES.MORNING_NOTIFICATION,
      message_type: MESSAGE_TYPES.MORNING_NOTIFICATION,
      recipient_count: userIds.length,
      success_count: emailsSent,
      failed_count: emailsSkipped,
      subject: notificationTitle,
      content: `Morning notification sent - ${emailsSent} emails, ${userIds.length} dashboard messages. WODs: ${hasWods}, Ritual: ${hasRitual}`,
      sent_at: new Date().toISOString(),
      metadata: {
        hasWods,
        hasRitual,
        wodCategory: category,
        ritualDay: todaysRitual?.day_number
      }
    });

    logStep(`✅ Morning notifications complete: ${userIds.length} dashboard, ${emailsSent} emails sent, ${emailsSkipped} skipped`);

    return new Response(
      JSON.stringify({
        success: true,
        dashboardNotifications: userIds.length,
        emailsSent,
        emailsSkipped,
        content: {
          hasWods,
          hasRitual,
          wodCategory: category,
          ritualDay: todaysRitual?.day_number
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
