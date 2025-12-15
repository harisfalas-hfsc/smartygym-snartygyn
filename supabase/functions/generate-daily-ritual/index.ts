import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { getEmailHeaders, getEmailFooter } from "../_shared/email-utils.ts";
import { MESSAGE_TYPES } from "../_shared/notification-types.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 11-day cycle themes for variety
const DAILY_THEMES = [
  { morning: "Start Strong", midday: "Reset & Reload", evening: "Unwind", focus: "joint mobility + activation" },
  { morning: "Hip Focus", midday: "Shoulder Reset", evening: "Spine Decompression", focus: "hip mobility" },
  { morning: "Breathing + Ankle", midday: "Glutes + Thoracic", evening: "Hamstring Release", focus: "breathing patterns" },
  { morning: "Posture Correction", midday: "Knee-Friendly Mobility", evening: "Lower Back Comfort", focus: "posture" },
  { morning: "Shoulder Stability", midday: "Balance Reset", evening: "Hip Capsule Release", focus: "shoulder stability" },
  { morning: "Fast Spine Mobility", midday: "Anti-Sitting Protocol", evening: "Chest + Upper Back", focus: "spine mobility" },
  { morning: "Energy Boost", midday: "Posture Recovery", evening: "Calming Breathwork", focus: "energy" },
  { morning: "Core Stability", midday: "Wrist/Elbow Reset", evening: "Hips + Lower Back", focus: "core stability" },
  { morning: "Knee Confidence", midday: "Neck Relief", evening: "Gentle Full-Body Stretch", focus: "knee health" },
  { morning: "Breathing + Mobility Flow", midday: "Light Activation", evening: "Full-Body Decompression", focus: "flow state" },
  { morning: "Ankle + Foot Activation", midday: "Spine Mobility Desk-Friendly", evening: "Stress Release Routine", focus: "ankle/foot" }
];

function logStep(step: string, details?: any) {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GENERATE-RITUAL] ${step}${detailsStr}`);
}

// Generate ICS content for email
function generateICSForEmail(dayNumber: number, ritualDate: string): string {
  const formatICSDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const date = new Date(ritualDate);
  
  // Morning: 08:00
  const morning = new Date(date);
  morning.setHours(8, 0, 0, 0);
  
  // Midday: 13:00
  const midday = new Date(date);
  midday.setHours(13, 0, 0, 0);
  
  // Evening: 17:00
  const evening = new Date(date);
  evening.setHours(17, 0, 0, 0);

  const events = [
    {
      title: `☀️ Morning Smarty Ritual`,
      start: morning,
      duration: 15,
      description: "Start your day with joint unlock, light activation, and morning prep. View full ritual at https://smartygym.com/daily-ritual",
    },
    {
      title: `🌤️ Midday Smarty Ritual`,
      start: midday,
      duration: 10,
      description: "Reset with desk mobility, anti-stiffness movements, and breathing. View full ritual at https://smartygym.com/daily-ritual",
    },
    {
      title: `🌙 Evening Smarty Ritual`,
      start: evening,
      duration: 15,
      description: "Unwind with decompression, stress release, and pre-bed guidance. View full ritual at https://smartygym.com/daily-ritual",
    },
  ];

  let ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SmartyGym//Daily Ritual//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:SmartyGym Daily Ritual
`;

  events.forEach((event, index) => {
    const endTime = new Date(event.start.getTime() + event.duration * 60000);
    ics += `BEGIN:VEVENT
UID:ritual-${ritualDate}-${index}@smartygym.com
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(event.start)}
DTEND:${formatICSDate(endTime)}
SUMMARY:${event.title}
DESCRIPTION:${event.description.replace(/\n/g, '\\n')}
URL:https://smartygym.com/daily-ritual
BEGIN:VALARM
TRIGGER:-PT10M
ACTION:DISPLAY
DESCRIPTION:${event.title} starts in 10 minutes
END:VALARM
END:VEVENT
`;
  });

  ics += 'END:VCALENDAR';
  return ics;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting Daily Smarty Ritual generation");

    // Parse request body for resend_notifications flag
    let resendNotifications = false;
    try {
      const body = await req.json();
      resendNotifications = body?.resend_notifications === true;
      if (resendNotifications) {
        logStep("Resend notifications mode enabled");
      }
    } catch (e) {
      // No body or invalid JSON, continue normally
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get today's date in Cyprus timezone (UTC+2/+3)
    const now = new Date();
    const cyprusTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Nicosia" }));
    const today = cyprusTime.toISOString().split('T')[0];

    // Check if ritual already exists for today
    const { data: existingRitual } = await supabase
      .from("daily_smarty_rituals")
      .select("id, day_number")
      .eq("ritual_date", today)
      .single();

    if (existingRitual) {
      // If resend_notifications is true, send notifications for existing ritual
      if (resendNotifications) {
        logStep("Resending notifications for existing ritual", { date: today, dayNumber: existingRitual.day_number });
        await sendRitualNotifications(supabase, existingRitual.day_number, today);
        return new Response(JSON.stringify({ 
          success: true, 
          message: "Notifications resent for existing ritual",
          dayNumber: existingRitual.day_number,
          date: today
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      logStep("Ritual already exists for today", { date: today });
      return new Response(JSON.stringify({ success: true, message: "Ritual already exists" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get count of existing rituals to determine day number
    const { count } = await supabase
      .from("daily_smarty_rituals")
      .select("*", { count: 'exact', head: true });

    const dayNumber = (count || 0) + 1;
    const themeIndex = (dayNumber - 1) % DAILY_THEMES.length;
    const theme = DAILY_THEMES[themeIndex];

    logStep("Generating ritual", { dayNumber, theme: theme.focus });

    // Generate content using AI
    const prompt = `Generate a Daily Smarty Ritual for Day ${dayNumber} with theme focus: "${theme.focus}"

Morning Theme: "${theme.morning}"
Midday Theme: "${theme.midday}"  
Evening Theme: "${theme.evening}"

STRICT FORMATTING RULES:
- Use emojis for visual appeal
- Keep each phase SHORT (2 mobile screens max)
- Use bullet points with clear exercise names
- Include time/rep counts (e.g., 20s, 10 reps)
- Always link WOD: <a href="/workout/wod">Workout of the Day</a>

NUTRITION PHILOSOPHY (mention in Smarty Tips):
"Follow a balanced nutrition approach: 55–60% protein, 20–25% carbs (mostly unprocessed), and the rest healthy fats; hydrate well throughout the day and choose whole, natural foods for each meal."

STRUCTURE FOR EACH PHASE:

MORNING RITUAL:
1. 🌅 MUST start with: "Good morning, Smarty!" followed by a warm greeting (1 sentence)
2. 🏋️ Joint Unlock (4 movements, 20-30s each)
3. 🔑 Light Activation (3 exercises)
4. 💡 Smarty Tip (nutrition/hydration for morning)
5. 🏃 WOD Note (if training morning, add prep suggestion with link)
6. ✅ Check-in Note: Add this styled paragraph at the end - "Don't forget to complete your <a href="https://smartygym.com/userdashboard?tab=checkins" style="color: #29B6D2; font-weight: bold;">Morning Check-in</a> to track your progress and build your streak!"

MIDDAY RITUAL:
1. 🪑 Desk/Midday Reset (3-4 movements)
2. 🚶 Anti-Stiffness Movement (1-2 min activity)
3. 🧘 Breathing Reset (brief instruction)
4. 💡 Smarty Tip (lunch/hydration reminder)
5. 🏃 WOD Note (if training midday, add prep suggestion with link)

EVENING RITUAL:
1. 🌙 Decompression (3-4 stretches)
2. 🧘 Stress Release (breathing/gentle mobility)
3. 🌿 Pre-Bed Guidance (sleep hygiene tip)
4. 💡 Smarty Tip (dinner/recovery/gratitude)
5. 🏃 WOD Note (if training evening, keep intensity moderate with link)
6. ✅ Check-in Note: Add this styled paragraph at the end - "Don't forget to complete your <a href="https://smartygym.com/userdashboard?tab=checkins" style="color: #29B6D2; font-weight: bold;">Night Check-in</a> before bed to reflect on your day!"

Return ONLY valid JSON with this exact structure:
{
  "morning_content": "<HTML content for morning>",
  "midday_content": "<HTML content for midday>",
  "evening_content": "<HTML content for evening>"
}

Use <p class="tiptap-paragraph"> for paragraphs and proper HTML formatting.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a fitness content generator for SmartyGym. Generate ritual content following the exact structure provided. Return ONLY valid JSON." },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiData = await response.json();
    let content = aiData.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content generated from AI");
    }

    // Clean up JSON response
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    let ritualContent;
    try {
      ritualContent = JSON.parse(content);
    } catch (e) {
      logStep("ERROR parsing AI response", { content: content.substring(0, 500) });
      throw new Error("Failed to parse AI response as JSON");
    }

    logStep("AI content generated successfully");

    // Insert ritual into database
    const { error: insertError } = await supabase
      .from("daily_smarty_rituals")
      .insert({
        ritual_date: today,
        day_number: dayNumber,
        morning_content: ritualContent.morning_content,
        midday_content: ritualContent.midday_content,
        evening_content: ritualContent.evening_content,
        is_visible: true,
      });

    if (insertError) {
      throw new Error(`Failed to insert ritual: ${insertError.message}`);
    }

    logStep("Ritual saved to database", { dayNumber, date: today });

    // Send notifications to all users
    await sendRitualNotifications(supabase, dayNumber, today);

    return new Response(JSON.stringify({ 
      success: true, 
      dayNumber,
      date: today 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    const err = error as Error;
    logStep("ERROR", { message: err.message });
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function sendRitualNotifications(supabase: any, dayNumber: number, date: string) {
  logStep("Starting sendRitualNotifications", { dayNumber, date });
  
  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      logStep("ERROR: RESEND_API_KEY not configured");
      return;
    }
    
    const resend = new Resend(resendApiKey);
    logStep("Resend client initialized");
    
    // Get all users
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      logStep("ERROR fetching users", { error: usersError.message || usersError });
      return;
    }

    if (!users || !users.users || users.users.length === 0) {
      logStep("No users found to notify");
      return;
    }

    logStep("Users fetched successfully", { count: users.users.length });

const subject = "☀️ Your all day game – plan is ready";
    
    // Generate calendar download URL (using edge function instead of data URI for email compatibility)
    const calendarDownloadUrl = `https://cvccrvyimyzrxcwzmxwk.supabase.co/functions/v1/download-ritual-calendar?date=${date}`;
    
    const content = `<p class="tiptap-paragraph"><strong>Your Smarty Ritual is here!</strong></p>
<p class="tiptap-paragraph">Your personalized daily ritual is ready. Start with the Morning Ritual to energize your day, reset at Midday, and unwind in the Evening.</p>
<p class="tiptap-paragraph">Three simple phases. Maximum impact. Your daily game plan for movement, recovery, and performance.</p>
<p class="tiptap-paragraph"><a href="https://smartygym.com/daily-ritual" style="color: #29B6D2; font-weight: bold;">View Your Smarty Ritual →</a></p>
<p class="tiptap-paragraph">💡 <strong>Don't forget to track your progress!</strong> Complete your <a href="https://smartygym.com/userdashboard?tab=checkins" style="color: #29B6D2; font-weight: bold;">Smarty Check-ins</a> (morning & evening) to monitor your sleep, mood, recovery, and build your consistency streak.</p>`;

    let sentCount = 0;
    let failedCount = 0;

    for (const user of users.users) {
      const userId = user.id;
      const userEmail = user.email;

      // Send dashboard notification
      try {
        const { error: insertError } = await supabase.from('user_system_messages').insert({
          user_id: userId,
          message_type: MESSAGE_TYPES.DAILY_RITUAL,
          subject: subject,
          content: content,
          is_read: false,
        });
        
        if (insertError) {
          logStep("ERROR inserting dashboard notification", { userId, error: insertError.message });
          failedCount++;
          continue;
        }
      } catch (err: any) {
        logStep("ERROR sending dashboard notification", { userId, error: err.message || err });
        failedCount++;
        continue;
      }

      // Check email preferences
      const { data: profile } = await supabase
        .from('profiles')
        .select('notification_preferences')
        .eq('user_id', userId)
        .single();

      const prefs = (profile?.notification_preferences as Record<string, any>) || {};
      
      // Check if user has opted out of ritual emails
      if (prefs.opt_out_all === true || prefs.email_ritual === false || prefs.opt_out_newsletter === true) {
        sentCount++;
        continue;
      }

      if (userEmail) {
        try {
const emailResult = await resend.emails.send({
            from: 'SmartyGym <notifications@smartygym.com>',
            to: [userEmail],
            subject: subject,
            headers: getEmailHeaders(userEmail, 'ritual'),
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #29B6D2; margin-bottom: 20px;">☀️ Your Smarty Ritual is Ready!</h1>
                <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">Your <strong>Smarty Ritual</strong> is here!</p>
                <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">Your personalized daily ritual is ready. Start with the Morning Ritual to energize your day, reset at Midday, and unwind in the Evening.</p>
                <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">Three simple phases. Maximum impact. Your daily game plan for movement, recovery, and performance.</p>
                <div style="margin: 24px 0; text-align: center;">
                  <a href="https://smartygym.com/daily-ritual" style="display: inline-block; background: #29B6D2; color: white; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px; margin-right: 12px;">View Your Smarty Ritual →</a>
                </div>
                <div style="margin: 24px 0; padding: 16px; background: #f8f8f8; border-radius: 8px; text-align: center;">
                  <p style="font-size: 14px; color: #666; margin-bottom: 12px;">📅 Add all 3 phases to your calendar with reminders:</p>
                  <a href="${calendarDownloadUrl}" style="display: inline-block; background: #333; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-size: 14px;">📥 Download Calendar File (.ics)</a>
                </div>
                <div style="margin: 24px 0; padding: 16px; background: #e6f7fa; border-radius: 8px; border-left: 4px solid #29B6D2;">
                  <p style="font-size: 14px; color: #333; margin: 0;">💡 <strong>Track Your Progress!</strong></p>
                  <p style="font-size: 14px; color: #666; margin: 8px 0 0 0;">Complete your <a href="https://smartygym.com/userdashboard?tab=checkins" style="color: #29B6D2; font-weight: bold;">Smarty Check-ins</a> (morning & evening) to monitor your sleep, mood, recovery, and build your consistency streak.</p>
                </div>
                <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;">
                <p style="font-size: 12px; color: #999; text-align: center;">Designed by Haris Falas</p>
                ${getEmailFooter(userEmail, 'ritual')}
              </div>
            `,
          });
          
          if (emailResult.error) {
            logStep("ERROR sending email", { email: userEmail, error: emailResult.error });
            failedCount++;
          } else {
            logStep("Email sent successfully", { email: userEmail, emailId: emailResult.data?.id });
            sentCount++;
          }
          
          // Rate limiting: wait 600ms between emails to stay under Resend's 2 req/sec limit
          await new Promise(resolve => setTimeout(resolve, 600));
        } catch (emailErr: any) {
          logStep("ERROR sending email", { email: userEmail, error: emailErr.message || emailErr, fullError: JSON.stringify(emailErr) });
          failedCount++;
        }
      } else {
        sentCount++;
      }
    }

    // Log to audit
    try {
      const { error: auditError } = await supabase.from('notification_audit_log').insert({
        notification_type: 'daily_ritual',
        message_type: 'announcement_update',
        subject: subject,
        content: content,
        recipient_filter: 'all',
        recipient_count: users.users.length,
        success_count: sentCount,
        failed_count: failedCount,
      });
      
      if (auditError) {
        logStep("ERROR inserting audit log", { error: auditError.message });
      }
    } catch (auditErr: any) {
      logStep("ERROR in audit logging", { error: auditErr.message || auditErr });
    }

    logStep("Notifications completed", { sent: sentCount, failed: failedCount, total: users.users.length });
  } catch (error: any) {
    logStep("CRITICAL ERROR in sendRitualNotifications", { error: error.message || error, stack: error.stack });
  }
}
