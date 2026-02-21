import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOG = "[REPAIR-REPS-SETS]";

// Check if the Main Workout section has proper prescription patterns
function hasPrescription(html: string): boolean {
  if (!html) return true;
  
  // Extract only the Main Workout section (between 💪 and ⚡ or 🧘)
  const mainMatch = html.match(/💪.*?(?=⚡|🧘|$)/s);
  if (!mainMatch) return true; // no main workout section found
  
  const mainSection = mainMatch[0];
  
  // Get the text content of list items only (exercise lines)
  const liTexts = [...mainSection.matchAll(/<li[^>]*>.*?<\/li>/gi)]
    .map(m => m[0].replace(/<[^>]+>/g, " ").replace(/\{\{exercise:[^}]+\}\}/g, "").trim());
  
  if (liTexts.length === 0) return true;
  
  // Check if ANY exercise line has a prescription pattern
  const prescriptionPattern = /\d+\s*sets?\s*x|\d+\s*x\s*\d+|\d+\s*reps|sets?\s*of\s*\d+/i;
  const withPrescription = liTexts.filter(t => prescriptionPattern.test(t));
  
  // If less than half of exercise lines have prescriptions, consider it broken
  return withPrescription.length >= liTexts.length / 2;
}

function getDifficultyScheme(stars: number | null): string {
  if (!stars || stars <= 2) {
    return "Beginner level: Use 3 sets x 10-12 reps for most exercises, moderate tempo, rest 90-120 seconds between sets.";
  } else if (stars <= 4) {
    return "Intermediate level: Use 4 sets x 8-10 reps for compound exercises, 3 sets x 10-12 for isolation, controlled tempo (3-1-1-0), rest 60-90 seconds.";
  } else {
    return "Advanced level: Use 4-5 sets x 5-8 reps for compounds, 3-4 sets x 8-10 for isolation, strict tempo (4-1-1-0), rest 60-90 seconds.";
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json().catch(() => ({}));
    const dryRun = body.dry_run === true;
    const specificIds: string[] = body.workout_ids || [];

    console.log(`${LOG} Starting repair. dry_run=${dryRun}, specificIds=${specificIds.length}`);

    // Query all REPS & SETS workouts
    let query = supabase
      .from("admin_workouts")
      .select("id, name, main_workout, finisher, difficulty_stars, format, category, equipment")
      .eq("format", "REPS & SETS");

    if (specificIds.length > 0) {
      query = query.in("id", specificIds);
    }

    const { data: workouts, error } = await query;
    if (error) throw error;

    console.log(`${LOG} Found ${workouts?.length || 0} REPS & SETS workouts`);

    // Filter to only broken ones
    const broken = (workouts || []).filter(w => !hasPrescription(w.main_workout || ""));
    console.log(`${LOG} ${broken.length} workouts missing prescriptions`);

    if (broken.length === 0) {
      return new Response(JSON.stringify({
        message: "No broken workouts found",
        total_checked: workouts?.length || 0,
        broken: 0,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (dryRun) {
      return new Response(JSON.stringify({
        dry_run: true,
        total_checked: workouts?.length || 0,
        broken: broken.length,
        broken_workouts: broken.map(w => ({
          id: w.id,
          name: w.name,
          category: w.category,
          equipment: w.equipment,
          difficulty_stars: w.difficulty_stars,
        })),
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Repair each broken workout using AI
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const results: Array<{ id: string; name: string; status: string; details?: string }> = [];

    for (const workout of broken) {
      console.log(`${LOG} Repairing: "${workout.name}" (${workout.id}), stars=${workout.difficulty_stars}`);

      const difficultyScheme = getDifficultyScheme(workout.difficulty_stars);

      const prompt = `You are a professional fitness coach. Below is the FULL HTML content of a workout (all 5 sections: Soft Tissue, Activation, Main Workout, Finisher, Cool Down).

The problem: The Main Workout (💪) and Finisher (⚡) sections list exercises WITHOUT sets, reps, tempo, or rest prescriptions. The exercises just show names like "push-up" with no indication of what to do.

Your task: Add sets x reps prescriptions to EVERY exercise in the 💪 Main Workout and ⚡ Finisher sections ONLY.

Rules:
1. ${difficultyScheme}
2. DO NOT modify 🧽 Soft Tissue, 🔥 Activation, or 🧘 Cool Down sections AT ALL.
3. Keep ALL existing HTML tags, structure, and exercise markup (like {{exercise:0662:push-up}}) EXACTLY as they are.
4. Add the prescription AFTER the exercise markup: "{{exercise:0662:push-up}} - 4 sets x 10 reps (3-1-1-0 tempo)"
5. Add a rest period instruction paragraph after the exercise list in each section if not present.
6. For isometric exercises (planks, holds), use "X sets x Y seconds" instead of reps.
7. Do NOT add new exercises. Do NOT remove exercises.
8. Do NOT add any explanation — return ONLY the complete corrected HTML (all 5 sections).
9. Tempo notation: eccentric-pause at bottom-concentric-pause at top (e.g., 3-1-1-0)

Here is the current HTML to fix:
${workout.main_workout}

Return ONLY the corrected HTML. Nothing else.`;

      try {
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3,
            max_tokens: 4000,
          }),
        });

        if (!aiResponse.ok) {
          const errText = await aiResponse.text();
          console.error(`${LOG} AI error for "${workout.name}": ${errText}`);
          results.push({ id: workout.id, name: workout.name, status: "ai_error", details: errText });
          continue;
        }

        const aiData = await aiResponse.json();
        let fixedHtml = aiData.choices?.[0]?.message?.content?.trim() || "";

        // Strip markdown code fences if AI wrapped it
        fixedHtml = fixedHtml.replace(/^```html?\n?/i, "").replace(/\n?```$/i, "").trim();

        // Validate the fix actually has prescriptions now
        if (!hasPrescription(fixedHtml)) {
          console.error(`${LOG} AI output still missing prescriptions for "${workout.name}"`);
          results.push({ id: workout.id, name: workout.name, status: "validation_failed", details: "AI output still lacks prescriptions" });
          continue;
        }

        // Validate it still has list items (structure preserved)
        const origLiCount = (workout.main_workout?.match(/<li/gi) || []).length;
        const fixedLiCount = (fixedHtml.match(/<li/gi) || []).length;
        if (fixedLiCount < origLiCount - 1) {
          console.error(`${LOG} AI removed exercises for "${workout.name}": ${origLiCount} -> ${fixedLiCount}`);
          results.push({ id: workout.id, name: workout.name, status: "validation_failed", details: `Exercise count dropped: ${origLiCount} -> ${fixedLiCount}` });
          continue;
        }

        // Update the database
        const { error: updateError } = await supabase
          .from("admin_workouts")
          .update({ main_workout: fixedHtml })
          .eq("id", workout.id);

        if (updateError) {
          console.error(`${LOG} DB update error for "${workout.name}":`, updateError);
          results.push({ id: workout.id, name: workout.name, status: "db_error", details: updateError.message });
        } else {
          console.log(`${LOG} ✅ Fixed "${workout.name}"`);
          results.push({ id: workout.id, name: workout.name, status: "fixed" });
        }
      } catch (aiErr) {
        console.error(`${LOG} Error processing "${workout.name}":`, aiErr);
        results.push({ id: workout.id, name: workout.name, status: "error", details: String(aiErr) });
      }
    }

    const fixed = results.filter(r => r.status === "fixed").length;
    const failed = results.filter(r => r.status !== "fixed").length;

    console.log(`${LOG} ✅ Complete: ${fixed} fixed, ${failed} failed out of ${broken.length}`);

    return new Response(JSON.stringify({
      total_checked: workouts?.length || 0,
      broken: broken.length,
      fixed,
      failed,
      results,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    console.error(`${LOG} ❌ Fatal error:`, err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
