import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOG = "[FIX-FORMATTING]";

/**
 * This function takes a workout's main_workout HTML and asks the AI to:
 * 1. Split multi-exercise lines into individual bullets
 * 2. Ensure EVERY exercise has {{exercise:id:name}} markup
 * 3. Keep the 5-section structure intact
 * 4. Preserve reps/sets/duration info
 * 
 * It returns properly formatted HTML.
 */

interface ExerciseBasic {
  id: string;
  name: string;
  body_part: string;
  equipment: string;
  target: string;
}

function buildLibraryBlock(exercises: ExerciseBasic[]): string {
  return exercises.map(e => `${e.id}|${e.name}|${e.body_part}|${e.equipment}|${e.target}`).join('\n');
}

async function fixContentWithAI(
  content: string,
  libraryBlock: string,
  apiKey: string,
  itemName: string
): Promise<string> {
  const systemPrompt = `You are an HTML formatter for fitness workouts. You receive workout HTML content and an exercise library.

YOUR TASK:
1. KEEP the exact same 5-section structure (🧽, 🔥, 💪, ⚡, 🧘 headers). Do NOT change headers.
2. In 💪 Main Workout and ⚡ Finisher sections: ensure EVERY exercise is on its OWN separate bullet point (<li>).
3. If multiple exercises are on one line (separated by dashes, commas, numbers, or just listed together), SPLIT them into individual <li> items.
4. For EVERY exercise in 💪 and ⚡ sections, wrap the exercise name with {{exercise:ID:name}} markup using the provided library.
5. Keep reps/sets/duration/weight info on the same bullet as its exercise.
6. In 🧽, 🔥, and 🧘 sections: keep content as-is, NO exercise markup needed.
7. Keep structural instructions (like "5 Rounds of:", "For Time:", "AMRAP", rest periods) as their own bullet items.

REPLACEMENT RULES - EVERY exercise in 💪 and ⚡ MUST get markup. If an exercise doesn't exactly match the library:
- Find the closest biomechanical equivalent using this hierarchy:
  a. Same body part / category (e.g. Lower Push stays Lower Push)
  b. Same equipment (bodyweight→bodyweight, dumbbell→dumbbell, barbell→barbell, kettlebell→kettlebell)
  c. Similar movement pattern (squat→squat, hinge→hinge, push→push, pull→pull)
- Examples: "Box Jumps" → use {{exercise:1374:box jump down with one leg stabilization}} or closest jump exercise
  "Wall Balls" → closest squat + press exercise
  "Battle Rope Waves" → closest conditioning/cardio exercise
- NEVER leave an exercise without markup. There must be ZERO exercises in 💪/⚡ without {{exercise:ID:name}}.

HTML FORMAT RULES:
- Section headers: <p class="tiptap-paragraph">EMOJI <strong><u>Title</u></strong></p>
- Separators between sections: <p class="tiptap-paragraph"></p>
- Exercise lists: <ul class="tiptap-bullet-list"><li class="tiptap-list-item"><p class="tiptap-paragraph">content</p></li></ul>
- Each exercise = its own <li class="tiptap-list-item"><p class="tiptap-paragraph">...</p></li>

EXERCISE MARKUP FORMAT: {{exercise:ID:name}}
Example: 12 {{exercise:0662:push-up}} → shows as "12 push-up" with a View button

CRITICAL: 
- Return ONLY the complete HTML. No markdown, no explanation.
- Every exercise in 💪 and ⚡ MUST have {{exercise:ID:name}} markup. ZERO exceptions.
- Do NOT add markup to exercises in 🧽, 🔥, 🧘 sections.
- Do NOT invent exercises. Only use IDs from the library.
- Preserve ALL content — do not delete any exercises or instructions.
- Output must be a single continuous HTML string with NO newlines or carriage returns between tags.`;

  const userPrompt = `EXERCISE LIBRARY (id|name|body_part|equipment|target):
${libraryBlock}

WORKOUT "${itemName}" - HTML TO FIX:
${content}

Return the fixed HTML only.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  let result = data.choices?.[0]?.message?.content || '';
  
  // Strip markdown code fences if present
  result = result.trim();
  if (result.startsWith('```')) {
    result = result.replace(/^```(?:html)?\s*/, '').replace(/\s*```$/, '');
  }
  
  // Strip newlines/carriage returns (Gold Standard requirement)
  result = result.replace(/[\n\r]/g, '');
  // Collapse whitespace between tags
  result = result.replace(/>\s+</g, '><');
  
  return result;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ids, type = 'workout', dryRun = false, batchSize = 3 } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Load exercise library
    console.log(`${LOG} Loading exercise library...`);
    const { data: exercises, error: exErr } = await supabase
      .from('exercises')
      .select('id, name, body_part, equipment, target')
      .limit(2000);
    if (exErr || !exercises) throw new Error(`Library load failed: ${exErr?.message}`);
    console.log(`${LOG} Loaded ${exercises.length} exercises`);
    const libraryBlock = buildLibraryBlock(exercises);

    let workoutIds: string[] = ids || [];
    
    // If no specific IDs, fetch all
    if (workoutIds.length === 0) {
      if (type === 'workout') {
        const { data } = await supabase
          .from('admin_workouts')
          .select('id')
          .not('main_workout', 'is', null);
        workoutIds = (data || []).map(w => w.id);
      } else {
        const { data } = await supabase
          .from('admin_training_programs')
          .select('id');
        workoutIds = (data || []).map(p => p.id);
      }
    }

    console.log(`${LOG} Processing ${workoutIds.length} ${type}s...`);

    const results: Array<{
      id: string;
      name: string;
      status: string;
      exerciseMarkupCount: number;
      error?: string;
    }> = [];

    for (let i = 0; i < workoutIds.length; i++) {
      const itemId = workoutIds[i];
      console.log(`${LOG} [${i + 1}/${workoutIds.length}] Processing ${itemId}`);

      try {
        if (type === 'workout') {
          const { data: workout, error } = await supabase
            .from('admin_workouts')
            .select('id, name, main_workout')
            .eq('id', itemId)
            .single();

          if (error || !workout) {
            results.push({ id: itemId, name: 'UNKNOWN', status: 'error', exerciseMarkupCount: 0, error: error?.message || 'Not found' });
            continue;
          }

          if (!workout.main_workout || workout.main_workout.trim().length < 50) {
            results.push({ id: itemId, name: workout.name, status: 'skipped_empty', exerciseMarkupCount: 0 });
            continue;
          }

          const fixed = await fixContentWithAI(workout.main_workout, libraryBlock, LOVABLE_API_KEY, workout.name);
          
          // Count exercise markup in result
          const markupCount = (fixed.match(/\{\{exercise:/g) || []).length;
          
          // Validate: must have at least some markup and must have section headers
          if (markupCount === 0 && workout.main_workout.includes('💪')) {
            console.warn(`${LOG} ⚠ AI returned 0 markup for ${workout.name}, skipping save`);
            results.push({ id: itemId, name: workout.name, status: 'ai_no_markup', exerciseMarkupCount: 0 });
            continue;
          }

          if (!dryRun) {
            const { error: updateErr } = await supabase
              .from('admin_workouts')
              .update({ main_workout: fixed })
              .eq('id', itemId);
            
            if (updateErr) {
              results.push({ id: itemId, name: workout.name, status: 'save_error', exerciseMarkupCount: markupCount, error: updateErr.message });
            } else {
              console.log(`${LOG} ✅ ${workout.name}: ${markupCount} exercises marked`);
              results.push({ id: itemId, name: workout.name, status: 'fixed', exerciseMarkupCount: markupCount });
            }
          } else {
            results.push({ id: itemId, name: workout.name, status: 'dry_run', exerciseMarkupCount: markupCount });
          }
        } else if (type === 'program') {
          const { data: program, error } = await supabase
            .from('admin_training_programs')
            .select('id, name, program_structure, weekly_schedule, progression_plan')
            .eq('id', itemId)
            .single();

          if (error || !program) {
            results.push({ id: itemId, name: 'UNKNOWN', status: 'error', exerciseMarkupCount: 0, error: error?.message });
            continue;
          }

          const updates: Record<string, string> = {};
          let totalMarkup = 0;

          for (const field of ['program_structure', 'weekly_schedule', 'progression_plan'] as const) {
            const content = program[field] as string | null;
            if (!content || content.trim().length < 50) continue;

            const fixed = await fixContentWithAI(content, libraryBlock, LOVABLE_API_KEY, `${program.name} - ${field}`);
            const mc = (fixed.match(/\{\{exercise:/g) || []).length;
            totalMarkup += mc;
            updates[field] = fixed;

            await new Promise(r => setTimeout(r, 1000));
          }

          if (!dryRun && Object.keys(updates).length > 0) {
            const { error: updateErr } = await supabase
              .from('admin_training_programs')
              .update(updates)
              .eq('id', itemId);

            if (updateErr) {
              results.push({ id: itemId, name: program.name, status: 'save_error', exerciseMarkupCount: totalMarkup, error: updateErr.message });
            } else {
              results.push({ id: itemId, name: program.name, status: 'fixed', exerciseMarkupCount: totalMarkup });
            }
          } else {
            results.push({ id: itemId, name: program.name, status: dryRun ? 'dry_run' : 'no_changes', exerciseMarkupCount: totalMarkup });
          }
        }

        // Rate limiting delay
        await new Promise(r => setTimeout(r, 1500));
      } catch (e) {
        const errMsg = e instanceof Error ? e.message : String(e);
        console.error(`${LOG} Error processing ${itemId}:`, errMsg);
        results.push({ id: itemId, name: 'ERROR', status: 'error', exerciseMarkupCount: 0, error: errMsg });
      }
    }

    const fixed = results.filter(r => r.status === 'fixed').length;
    const errors = results.filter(r => r.status === 'error').length;
    console.log(`${LOG} Complete: ${fixed} fixed, ${errors} errors out of ${results.length} total`);

    return new Response(JSON.stringify({
      totalProcessed: results.length,
      fixed,
      errors,
      results,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(`${LOG} Fatal error:`, error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
