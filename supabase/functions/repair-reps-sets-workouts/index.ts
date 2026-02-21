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
  const mainMatch = html.match(/💪[\s\S]*?(?=⚡|🧘|$)/);
  if (!mainMatch) return true; // no main workout section found
  
  const mainSection = mainMatch[0];
  
  // Check for prescription patterns anywhere in the main workout section
  // This covers: "4 sets x 10", "3 x 12 reps", "12 reps", "Sets of 10", "30 seconds", etc.
  const prescriptionPattern = /\d+\s*sets?\s*x|\d+\s*x\s*\d+|\d+\s*reps|sets?\s*of\s*\d+|\d+\s*seconds?|\d+\s*sec\b|\d+\s*each\s+side|\d+\s*per\s+side|\d+\s*per\s+arm|\d+\s*per\s+leg|hold\s+\d+|AMRAP/i;
  
  // If the main section text has ANY prescription pattern, consider it valid
  const textContent = mainSection.replace(/<[^>]+>/g, " ");
  return prescriptionPattern.test(textContent);
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

      // Extract only Main Workout and Finisher sections to repair (keep rest untouched)
      const mainMatch = workout.main_workout!.match(/(💪[\s\S]*?)(?=🧘|$)/);
      const mainSection = mainMatch ? mainMatch[1] : "";
      
      if (!mainSection) {
        console.log(`${LOG} No main workout section found for "${workout.name}"`);
        results.push({ id: workout.id, name: workout.name, status: "skipped", details: "No main workout section found" });
        continue;
      }

      const prompt = `You are a professional fitness coach. Below is ONLY the Main Workout (💪) and Finisher (⚡) section HTML from a workout.

The problem: Exercise lines are missing sets, reps, and tempo prescriptions.

Your task: Add prescriptions to EVERY exercise line that is missing them. If an exercise already has prescriptions, keep it as-is.

Rules:
1. ${difficultyScheme}
2. Keep ALL existing HTML tags EXACTLY as they are. Do not change ANY tag, class name, or structure.
3. Keep ALL exercise markup (like {{exercise:0662:push-up}}) EXACTLY as they are.
4. Format: "ExerciseName - X sets x Y reps (tempo)" for strength exercises
5. Format: "ExerciseName - X sets x Y seconds" for isometric holds (planks, holds)
6. Add rest period info after exercise lists if missing.
7. Do NOT add, remove, or reorder exercises.
8. Do NOT add explanations or markdown — return ONLY the corrected HTML fragment.
9. Tempo notation: eccentric-pause-concentric-pause (e.g., 3-1-1-0)
10. If a line already says "Rest" or contains timing like "60 seconds", "90 seconds", leave it as-is.
11. CRITICAL: Your output must contain EVERY SINGLE <li> element from the input. Count them before and after.

INPUT HTML (Main Workout + Finisher only):
${mainSection}

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
            max_tokens: 8000,
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

        // Basic validation: check that the output contains exercise-like content and has some numbers (prescriptions)
        const hasExerciseContent = fixedHtml.includes("<li") && fixedHtml.includes("💪");
        const hasNumbers = /\d+/.test(fixedHtml);
        if (!hasExerciseContent || !hasNumbers) {
          console.error(`${LOG} AI output missing basic structure for "${workout.name}"`);
          results.push({ id: workout.id, name: workout.name, status: "validation_failed", details: "AI output missing basic structure" });
          continue;
        }

        // Validate it still has list items (structure preserved) - compare against the extracted section only
        const origLiCount = (mainSection.match(/<li/gi) || []).length;
        const fixedLiCount = (fixedHtml.match(/<li/gi) || []).length;
        if (fixedLiCount < origLiCount - 2) {
          console.error(`${LOG} AI removed exercises for "${workout.name}": ${origLiCount} -> ${fixedLiCount}`);
          results.push({ id: workout.id, name: workout.name, status: "validation_failed", details: `Exercise count dropped: ${origLiCount} -> ${fixedLiCount}` });
          continue;
        }

        // Reconstruct: replace only the main workout + finisher section, keep everything else
        const fullHtml = workout.main_workout!;
        const mainStartIdx = fullHtml.indexOf("💪");
        const coolDownIdx = fullHtml.indexOf("🧘");
        
        let reconstructed: string;
        if (mainStartIdx >= 0 && coolDownIdx > mainStartIdx) {
          // Keep prefix (soft tissue + activation) + fixed main/finisher + cool down
          reconstructed = fullHtml.substring(0, mainStartIdx) + fixedHtml + fullHtml.substring(coolDownIdx);
        } else if (mainStartIdx >= 0) {
          // No cool down found, just replace from main workout onwards
          reconstructed = fullHtml.substring(0, mainStartIdx) + fixedHtml;
        } else {
          reconstructed = fixedHtml;
        }

        // Update the database
        const { error: updateError } = await supabase
          .from("admin_workouts")
          .update({ main_workout: reconstructed })
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
