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

// Replace placeholders in template content
function replacePlaceholders(template: string, data: Record<string, string | number>): string {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  }
  return result;
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

    // Get today's date in Cyprus timezone with dynamic DST handling
    const now = new Date();
    const month = now.getUTCMonth() + 1; // 1-12
    // Cyprus DST: April-October = UTC+3, November-March = UTC+2
    const cyprusOffset = (month >= 4 && month <= 10) ? 3 : 2;
    const cyprusTime = new Date(now.getTime() + cyprusOffset * 60 * 60 * 1000);
    const todayStr = cyprusTime.toISOString().split('T')[0];

    logStep("Looking for today's content", { todayStr });

    // ============================================
    // FETCH TEMPLATES FROM DATABASE
    // ============================================
    const { data: templates } = await supabase
      .from("automated_message_templates")
      .select("*")
      .in("message_type", ["morning_wod", "morning_wod_recovery", "morning_ritual"])
      .eq("is_active", true);

    const wodTemplate = templates?.find(t => t.message_type === "morning_wod");
    const wodRecoveryTemplate = templates?.find(t => t.message_type === "morning_wod_recovery");
    const ritualTemplate = templates?.find(t => t.message_type === "morning_ritual");

    logStep("Templates loaded", { 
      hasWodTemplate: !!wodTemplate, 
      hasWodRecoveryTemplate: !!wodRecoveryTemplate,
      hasRitualTemplate: !!ritualTemplate 
    });

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

    // Determine if this is a recovery day (only 1 workout OR category is RECOVERY)
    const isRecoveryDay = todaysWods.length === 1 || category?.toUpperCase() === "RECOVERY";

    logStep("WODs found", { 
      hasWods,
      isRecoveryDay,
      workoutCount: todaysWods.length,
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

    // ============================================
    // ALERT ADMIN IF NO WODs
    // ============================================
    if (!hasWods) {
      logStep("⚠️ No WODs found for today - alerting admin");
      
      await supabase.from("user_system_messages").insert({
        user_id: "00000000-0000-0000-0000-000000000000",
        message_type: "admin_alert",
        subject: "⚠️ No WOD Found for Today",
        content: `No Workout of the Day was found for ${todayStr}. Please check the WOD generator.`,
        is_read: false,
      });
    }

    // Skip if neither WODs nor Ritual exists
    if (!hasWods && !hasRitual) {
      logStep("No content found for today - skipping notifications");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No content found for today - no notifications sent",
          todayStr 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // ============================================
    // PREVENT DUPLICATE NOTIFICATIONS
    // ============================================
    const { data: existingAudit } = await supabase
      .from("notification_audit_log")
      .select("id")
      .eq("notification_type", "morning_combined")
      .gte("sent_at", todayStr)
      .lt("sent_at", todayStr + "T23:59:59")
      .limit(1);

    if (existingAudit && existingAudit.length > 0) {
      logStep("⚠️ Morning notifications already sent today - skipping to prevent duplicates");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Morning notifications already sent today - skipping duplicates",
          todayStr 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // ============================================
    // GET ALL USER PROFILES
    // ============================================
    const { data: allProfiles } = await supabase
      .from("profiles")
      .select("user_id, notification_preferences");

    if (!allProfiles || allProfiles.length === 0) {
      logStep("No user profiles found");
      return new Response(
        JSON.stringify({ success: true, message: "No user profiles found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    logStep(`Processing morning notifications for ${allProfiles.length} users`);

    // ============================================
    // BUILD NOTIFICATION CONTENT FROM TEMPLATES
    // ============================================
    
    // Prepare placeholder data for WOD
    const wodPlaceholders = {
      category: category,
      bodyweight_name: bodyweightWod?.name || "Bodyweight Workout",
      equipment_name: equipmentWod?.name || "Equipment Workout",
      workout_name: todaysWods[0]?.name || "Today's Workout",
      format: format,
      difficulty: difficulty,
      difficulty_stars: difficultyStars,
    };

    // Prepare placeholder data for Ritual
    const ritualPlaceholders = {
      day_number: todaysRitual?.day_number || 1,
    };

    // Choose the appropriate WOD template based on recovery day
    let wodDashboardContent: string;
    let wodSubject: string;

    if (isRecoveryDay && wodRecoveryTemplate) {
      // Use recovery template
      wodDashboardContent = replacePlaceholders(wodRecoveryTemplate.content, wodPlaceholders);
      wodSubject = replacePlaceholders(wodRecoveryTemplate.subject, wodPlaceholders);
      logStep("Using RECOVERY template for WOD notification");
    } else if (wodTemplate) {
      // Use regular 2-workout template
      wodDashboardContent = replacePlaceholders(wodTemplate.content, wodPlaceholders);
      wodSubject = replacePlaceholders(wodTemplate.subject, wodPlaceholders);
      logStep("Using REGULAR template for WOD notification");
    } else {
      // Fallback to hardcoded content if no template exists
      logStep("No template found - using fallback content");
      if (isRecoveryDay) {
        wodDashboardContent = `<p class="tiptap-paragraph"><strong>🌅 Good Morning, Smarty!</strong></p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph">Your daily recovery workout is ready!</p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph"><strong>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</strong></p>
<p class="tiptap-paragraph"><strong>🧘 TODAY'S RECOVERY WORKOUT</strong></p>
<p class="tiptap-paragraph"><strong>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</strong></p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph">Today is <strong>Recovery</strong> day with one gentle workout:</p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph"><strong>🧘 Recovery:</strong> ${todaysWods[0]?.name || "Recovery Workout"}</p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph">${format} | All Levels</p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph"><a href="https://smartygym.com/workout/wod">View Today's Workout →</a></p>`;
        wodSubject = `🧘 Today's Recovery Workout: ${todaysWods[0]?.name || "Recovery"}`;
      } else {
        wodDashboardContent = `<p class="tiptap-paragraph"><strong>🌅 Good Morning, Smarty!</strong></p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph">Your daily fitness content is ready!</p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph"><strong>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</strong></p>
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
<p class="tiptap-paragraph"><a href="https://smartygym.com/workout/wod">View Today's Workouts →</a></p>`;
        wodSubject = `🏆 Today's Workout of the Day: ${category}`;
      }
    }

    // Build ritual content from template or fallback
    let ritualDashboardContent: string;
    let ritualSubject: string;

    if (ritualTemplate) {
      ritualDashboardContent = replacePlaceholders(ritualTemplate.content, ritualPlaceholders);
      ritualSubject = replacePlaceholders(ritualTemplate.subject, ritualPlaceholders);
      logStep("Using template for Ritual notification");
    } else {
      // Fallback content
      ritualDashboardContent = `<p class="tiptap-paragraph"><strong>🌅 Good Morning, Smarty!</strong></p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph"><strong>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</strong></p>
<p class="tiptap-paragraph"><strong>🌅 YOUR DAILY SMARTY RITUAL</strong></p>
<p class="tiptap-paragraph"><strong>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</strong></p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph">Your <strong>Day ${todaysRitual?.day_number}</strong> Smarty Ritual is ready!</p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph">Start your day with intention through our three wellness rituals:</p>
<p class="tiptap-paragraph">☀️ <strong>Morning</strong> - Energize your start</p>
<p class="tiptap-paragraph">🌤️ <strong>Midday</strong> - Recharge and refocus</p>
<p class="tiptap-paragraph">🌙 <strong>Evening</strong> - Wind down peacefully</p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph"><a href="https://smartygym.com/daily-ritual">View Today's Ritual →</a></p>`;
      ritualSubject = `🌅 Day ${todaysRitual?.day_number} Smarty Ritual`;
    }

    // ============================================
    // INSERT DASHBOARD NOTIFICATIONS (PREFERENCE-AWARE)
    // ============================================
    let wodDashboardSent = 0;
    let ritualDashboardSent = 0;
    let dashboardSkipped = 0;

    const dashboardInserts: { user_id: string; message_type: string; subject: string; content: string; is_read: boolean }[] = [];

    for (const profile of allProfiles) {
      const prefs = (profile.notification_preferences as Record<string, any>) || {};
      
      // Check if user has opted out of all notifications
      if (prefs.opt_out_all === true) {
        dashboardSkipped++;
        continue;
      }

      // Check WOD dashboard preference (default: true)
      if (hasWods && prefs.dashboard_wod !== false) {
        dashboardInserts.push({
          user_id: profile.user_id,
          message_type: MESSAGE_TYPES.WOD_NOTIFICATION,
          subject: wodSubject,
          content: wodDashboardContent,
          is_read: false,
        });
        wodDashboardSent++;
      }

      // Check Ritual dashboard preference (default: true)
      if (hasRitual && prefs.dashboard_ritual !== false) {
        dashboardInserts.push({
          user_id: profile.user_id,
          message_type: MESSAGE_TYPES.DAILY_RITUAL,
          subject: ritualSubject,
          content: ritualDashboardContent,
          is_read: false,
        });
        ritualDashboardSent++;
      }
    }

    // Batch insert dashboard notifications
    if (dashboardInserts.length > 0) {
      await supabase.from('user_system_messages').insert(dashboardInserts);
    }

    logStep("Dashboard notifications inserted", { 
      wodDashboardSent, 
      ritualDashboardSent, 
      dashboardSkipped 
    });

    // ============================================
    // SEND EMAILS (PREFERENCE-AWARE)
    // ============================================
    const { data: usersData } = await supabase.auth.admin.listUsers();
    const profilesMap = new Map(allProfiles?.map(p => [p.user_id, p.notification_preferences]) || []);

    let emailsSent = 0;
    let emailsSkipped = 0;

    for (const authUser of usersData?.users || []) {
      if (!authUser.email) continue;

      const prefs = (profilesMap.get(authUser.id) as Record<string, any>) || {};

      // Check if user has opted out of all emails
      if (prefs.opt_out_all === true) {
        emailsSkipped++;
        continue;
      }

      // Check if user wants WOD or Ritual emails
      const wantsWodEmail = prefs.email_wod !== false && hasWods;
      const wantsRitualEmail = prefs.email_ritual !== false && hasRitual;
      
      if (!wantsWodEmail && !wantsRitualEmail) {
        logStep(`Skipping morning email for ${authUser.email} (preferences disabled)`);
        emailsSkipped++;
        continue;
      }

      try {
        // Build email HTML based on user preferences
        let wodSection = '';
        let ritualSection = '';

        if (wantsWodEmail) {
          if (isRecoveryDay) {
            // Recovery day email content
            wodSection = `
<div style="margin: 30px 0; padding: 25px; background: #f8f9fa; border-radius: 12px; border-left: 4px solid #29B6D2;">
  <h2 style="color: #29B6D2; margin: 0 0 15px 0; font-size: 20px;">🧘 TODAY'S RECOVERY WORKOUT</h2>
  <p style="margin: 10px 0; color: #333;">Today is <strong>Recovery</strong> day with one gentle workout:</p>
  <div style="margin: 15px 0;">
    <p style="margin: 8px 0; color: #333;"><strong>🧘 Recovery:</strong> ${todaysWods[0]?.name || "Recovery Workout"}</p>
  </div>
  <p style="margin: 10px 0; color: #666;"><strong>Format:</strong> ${format} | <strong>Difficulty:</strong> All Levels</p>
  <p style="margin: 15px 0 0 0;"><a href="https://smartygym.com/workout/wod" style="background: #29B6D2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Today's Workout →</a></p>
</div>`;
          } else {
            // Regular day with 2 workouts
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

        const emailSubject = isRecoveryDay 
          ? `🌅 Good Morning! Today's Recovery Workout & Ritual Are Ready`
          : `🌅 Good Morning! Today's Workouts & Ritual Are Ready`;

        await resendClient.emails.send({
          from: "SmartyGym <notifications@smartygym.com>",
          to: authUser.email,
          subject: emailSubject,
          html: emailHtml,
          headers: getEmailHeaders(authUser.email, 'wod'),
        });

        emailsSent++;
        logStep(`Email sent to ${authUser.email}`);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (emailError) {
        logStep(`Failed to send email to ${authUser.email}`, { error: emailError });
      }
    }

    logStep("Email sending complete", { emailsSent, emailsSkipped });

    // ============================================
    // CREATE AUDIT LOG
    // ============================================
    await supabase.from("notification_audit_log").insert({
      notification_type: "morning_combined",
      message_type: isRecoveryDay ? "morning_wod_recovery" : "morning_wod",
      subject: "Morning WOD + Ritual Notifications",
      content: `WOD: ${category}, Ritual: Day ${todaysRitual?.day_number || "N/A"}`,
      recipient_count: wodDashboardSent + ritualDashboardSent + emailsSent,
      success_count: wodDashboardSent + ritualDashboardSent + emailsSent,
      failed_count: dashboardSkipped + emailsSkipped,
      metadata: {
        todayStr,
        isRecoveryDay,
        workoutCount: todaysWods.length,
        wodDashboardSent,
        ritualDashboardSent,
        dashboardSkipped,
        emailsSent,
        emailsSkipped,
        usedTemplates: {
          wod: isRecoveryDay ? !!wodRecoveryTemplate : !!wodTemplate,
          ritual: !!ritualTemplate
        }
      }
    });

    logStep("✅ Morning notifications complete", {
      isRecoveryDay,
      wodDashboardSent,
      ritualDashboardSent,
      dashboardSkipped,
      emailsSent,
      emailsSkipped
    });

    return new Response(
      JSON.stringify({
        success: true,
        isRecoveryDay,
        wodDashboardSent,
        ritualDashboardSent,
        dashboardSkipped,
        emailsSent,
        emailsSkipped,
        todayStr
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("❌ Error in morning notifications", { error: errorMessage });
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
