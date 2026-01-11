import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting Daily Smarty Ritual generation");

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
      logStep("Ritual already exists for today", { date: today, dayNumber: existingRitual.day_number });
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Ritual already exists",
        dayNumber: existingRitual.day_number,
        date: today
      }), {
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
    const prompt = `Generate a Daily Smarty Ritual with theme focus: "${theme.focus}"

Morning Theme: "${theme.morning}"
Midday Theme: "${theme.midday}"  
Evening Theme: "${theme.evening}"

CRITICAL RULE: DO NOT mention any day numbers anywhere in the content. Never say "Day X" or reference which day it is.

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
1. 🌅 MUST start with: "Good morning, Smarty!" followed by a warm, motivational greeting (1 sentence) - DO NOT mention day numbers
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
    logStep("Notifications will be sent separately at 7AM Cyprus time by send-morning-notifications");

    return new Response(JSON.stringify({ 
      success: true, 
      dayNumber,
      date: today,
      message: "Ritual generated successfully. Notifications will be sent at 7AM."
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
