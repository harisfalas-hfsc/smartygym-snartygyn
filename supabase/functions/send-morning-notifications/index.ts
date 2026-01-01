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
    // FETCH TEMPLATES FROM DATABASE (DETERMINISTIC: is_active=true AND is_default=true)
    // ============================================
    const { data: templates } = await supabase
      .from("automated_message_templates")
      .select("*")
      .in("message_type", ["morning_wod", "morning_wod_recovery", "morning_ritual"])
      .eq("is_active", true)
      .eq("is_default", true);

    // Get the SINGLE default template for each type
    const wodTemplate = templates?.find(t => t.message_type === "morning_wod");
    const wodRecoveryTemplate = templates?.find(t => t.message_type === "morning_wod_recovery");
    const ritualTemplate = templates?.find(t => t.message_type === "morning_ritual");

    logStep("Templates loaded (default only)", { 
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
    // Using channel-specific fields: dashboard_content, email_content
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

    // ============================================
    // BUILD DASHBOARD CONTENT (use dashboard_content field)
    // ============================================
    let wodDashboardContent: string;
    let wodDashboardSubject: string;

    if (isRecoveryDay && wodRecoveryTemplate) {
      // Use recovery template - prefer dashboard_content if available
      wodDashboardContent = replacePlaceholders(
        wodRecoveryTemplate.dashboard_content || wodRecoveryTemplate.content, 
        wodPlaceholders
      );
      wodDashboardSubject = replacePlaceholders(
        wodRecoveryTemplate.dashboard_subject || wodRecoveryTemplate.subject, 
        wodPlaceholders
      );
      logStep("Using RECOVERY template for WOD dashboard notification");
    } else if (wodTemplate) {
      // Use regular 2-workout template
      wodDashboardContent = replacePlaceholders(
        wodTemplate.dashboard_content || wodTemplate.content, 
        wodPlaceholders
      );
      wodDashboardSubject = replacePlaceholders(
        wodTemplate.dashboard_subject || wodTemplate.subject, 
        wodPlaceholders
      );
      logStep("Using REGULAR template for WOD dashboard notification");
    } else {
      // Fallback to hardcoded content if no template exists
      logStep("No WOD template found - using fallback dashboard content");
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
        wodDashboardSubject = `🧘 Today's Recovery Workout: ${todaysWods[0]?.name || "Recovery"}`;
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
        wodDashboardSubject = `🏆 Today's Workout of the Day: ${category}`;
      }
    }

    // ============================================
    // BUILD EMAIL CONTENT (use email_content field - can be different from dashboard)
    // ============================================
    let wodEmailContent: string;
    let wodEmailSubject: string;

    if (isRecoveryDay && wodRecoveryTemplate) {
      // Check if template has specific email content, otherwise use content
      wodEmailContent = wodRecoveryTemplate.email_content || wodRecoveryTemplate.content;
      wodEmailSubject = wodRecoveryTemplate.email_subject || wodRecoveryTemplate.subject;
      wodEmailContent = replacePlaceholders(wodEmailContent, wodPlaceholders);
      wodEmailSubject = replacePlaceholders(wodEmailSubject, wodPlaceholders);
    } else if (wodTemplate) {
      wodEmailContent = wodTemplate.email_content || wodTemplate.content;
      wodEmailSubject = wodTemplate.email_subject || wodTemplate.subject;
      wodEmailContent = replacePlaceholders(wodEmailContent, wodPlaceholders);
      wodEmailSubject = replacePlaceholders(wodEmailSubject, wodPlaceholders);
    } else {
      // Fallback email content (styled for email)
      wodEmailSubject = isRecoveryDay 
        ? `🧘 Today's Recovery Workout: ${todaysWods[0]?.name || "Recovery"}`
        : `🏆 Today's Workout of the Day: ${category}`;
      wodEmailContent = ""; // Will be built inline below
    }

    // Build ritual content from template or fallback
    let ritualDashboardContent: string;
    let ritualDashboardSubject: string;
    let ritualEmailContent: string;
    let ritualEmailSubject: string;

    if (ritualTemplate) {
      ritualDashboardContent = replacePlaceholders(
        ritualTemplate.dashboard_content || ritualTemplate.content, 
        ritualPlaceholders
      );
      ritualDashboardSubject = replacePlaceholders(
        ritualTemplate.dashboard_subject || ritualTemplate.subject, 
        ritualPlaceholders
      );
      ritualEmailContent = replacePlaceholders(
        ritualTemplate.email_content || ritualTemplate.content, 
        ritualPlaceholders
      );
      ritualEmailSubject = replacePlaceholders(
        ritualTemplate.email_subject || ritualTemplate.subject, 
        ritualPlaceholders
      );
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
      ritualDashboardSubject = `🌅 Day ${todaysRitual?.day_number} Smarty Ritual`;
      ritualEmailContent = ""; // Will be built inline
      ritualEmailSubject = ritualDashboardSubject;
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
          subject: wodDashboardSubject,
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
          subject: ritualDashboardSubject,
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
    // SEND EMAILS (PREFERENCE-AWARE) - Using email_content from templates
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
        // Build email HTML - use template email_content if available
        let wodSection = '';
        let ritualSection = '';

        if (wantsWodEmail) {
          // If template provided email_content, wrap it in a styled div
          if (wodEmailContent && wodEmailContent.trim() !== '') {
            wodSection = `
<div style="margin: 30px 0; padding: 25px; background: #f8f9fa; border-radius: 12px; border-left: 4px solid #29B6D2;">
  ${wodEmailContent}
</div>`;
          } else {
            // Fallback to hardcoded email content
            if (isRecoveryDay) {
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
        }

        if (wantsRitualEmail) {
          if (ritualEmailContent && ritualEmailContent.trim() !== '') {
            ritualSection = `
<div style="margin: 30px 0; padding: 25px; background: #f8f9fa; border-radius: 12px; border-left: 4px solid #29B6D2;">
  ${ritualEmailContent}
</div>`;
          } else {
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
        }

        const emailHtml = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
<h1 style="color: #29B6D2; margin-bottom: 10px;">🌅 Good Morning, Smarty!</h1>
<p style="font-size: 16px; color: #333; margin-bottom: 25px;">Your daily fitness content is ready and waiting for you!</p>
${wodSection}
${ritualSection}
<p style="margin-top: 30px; color: #666; font-size: 14px;">Choose based on your situation: at home, traveling, or at the gym!</p>
${getEmailFooter(authUser.email, 'wod')}
</div>`;

        // Use template email subject if available
        const finalEmailSubject = (wantsWodEmail && wodEmailSubject) 
          ? wodEmailSubject 
          : (isRecoveryDay 
            ? `🌅 Good Morning! Today's Recovery Workout & Ritual Are Ready`
            : `🌅 Good Morning! Today's Workouts & Ritual Are Ready`);

        await resendClient.emails.send({
          from: "SmartyGym <notifications@smartygym.com>",
          to: authUser.email,
          subject: finalEmailSubject,
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
    // CREATE AUDIT LOG (log each message_type separately for better history tracking)
    // ============================================
    const auditEntries = [];
    
    if (hasWods) {
      auditEntries.push({
        notification_type: "morning_combined",
        message_type: isRecoveryDay ? "morning_wod_recovery" : "morning_wod",
        subject: wodDashboardSubject,
        content: `WOD: ${category}, ${todaysWods.length} workout(s)`,
        recipient_count: wodDashboardSent + emailsSent,
        success_count: wodDashboardSent + emailsSent,
        failed_count: 0,
        metadata: {
          todayStr,
          isRecoveryDay,
          workoutCount: todaysWods.length,
          wodDashboardSent,
          emailsSent,
          usedTemplate: isRecoveryDay ? !!wodRecoveryTemplate : !!wodTemplate
        }
      });
    }

    if (hasRitual) {
      auditEntries.push({
        notification_type: "morning_combined",
        message_type: "morning_ritual",
        subject: ritualDashboardSubject,
        content: `Ritual: Day ${todaysRitual?.day_number}`,
        recipient_count: ritualDashboardSent + emailsSent,
        success_count: ritualDashboardSent + emailsSent,
        failed_count: 0,
        metadata: {
          todayStr,
          dayNumber: todaysRitual?.day_number,
          ritualDashboardSent,
          emailsSent,
          usedTemplate: !!ritualTemplate
        }
      });
    }

    if (auditEntries.length > 0) {
      await supabase.from("notification_audit_log").insert(auditEntries);
    }

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
