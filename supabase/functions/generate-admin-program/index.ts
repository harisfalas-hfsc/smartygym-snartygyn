// Generate ONE custom admin training program from wizard metadata.
// Mirrors the workout generator: produces a draft (name, description,
// program_structure, weekly_schedule, nutrition_tips) using library-first
// markup and the M-3 Gold Standard format. NOTHING is written to the DB —
// the editor's Save button still owns serial/image/Stripe/insert.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import {
  processContentWithExerciseMatching,
  fetchAndBuildExerciseReference,
  guaranteeAllExercisesLinked,
  rejectNonLibraryExercises,
  type ExerciseBasic,
} from "../_shared/exercise-matching.ts";
import { normalizeWorkoutHtml } from "../_shared/html-normalizer.ts";
import { requireAdminOrServiceRole } from "../_shared/admin-or-service-auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOG = "[WIZ-PROG]";
function log(step: string, details?: any) {
  const d = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`${LOG} ${step}${d}`);
}

interface WizardBody {
  category: string;
  equipment: string;            // "Bodyweight" | "Equipment"
  difficulty_stars: number;     // 0..6
  weeks: number;                // 4 / 6 / 8
  days_per_week: number;        // 3..6
  access?: "free" | "premium" | "standalone";
  price?: string | number;
  tier_required?: string;
}

const CATEGORY_PHILOSOPHY: Record<string, string> = {
  "LOW BACK PAIN":
    "Therapeutic progression. Foundation (pain-free ROM, basic core activation), Build (gentle strengthening, stability), Progress (functional movement). McKenzie work, pelvic tilts, bird-dogs, bridges, dead bugs, cat-cow. No heavy loading. No explosive movement.",
  "CARDIO ENDURANCE":
    "Zone-based endurance: Zone 2 base (70-80% HR), threshold (85-90%), VO2 intervals (90-95%). Mix modalities and include complementary indoor circuits and metabolic work. Periodized base → intensity → peak → recovery.",
  "FUNCTIONAL STRENGTH":
    "Real-world strength: free-weight bias (deadlifts, squats, presses, pulls), carries, climbs, swings. Combine complementary lifts. Include mobility. Not bodybuilding.",
  "MUSCLE HYPERTROPHY":
    "Periodized hypertrophy with proper splits (UL / PPL / FB). Progressive overload, planned deloads (40-50%). Compound + isolation. 60-120s rest. Track sets/reps/tempo. Consistency over novelty.",
  "WEIGHT LOSS":
    "Strategic blend: cardio endurance + metabolic conditioning + calorie-burning + strength retention. Wave intensity. Address metabolic adaptation. Avoid daily HIIT.",
  "MOBILITY & STABILITY":
    "Joint-by-joint: ankles mobility, knees stability, hips mobility, lumbar stability, thoracic mobility, shoulders mobility. Pallof, planks, cat-cows, hanging, single-leg stands, breathing. Controlled, 30-60s holds. No explosive movement.",
};

function philosophyFor(category: string): string {
  const u = category.toUpperCase();
  for (const [k, v] of Object.entries(CATEGORY_PHILOSOPHY)) if (u.includes(k)) return v;
  return "Follow professional coaching standards for this category.";
}

function difficultyLabel(stars: number) {
  if (stars >= 5) return "Advanced";
  if (stars >= 3) return "Intermediate";
  return "Beginner";
}

function buildCondensedReference(exercises: ExerciseBasic[]): string {
  const grouped: Record<string, Array<{ id: string; name: string }>> = {};
  for (const ex of exercises) {
    const key = `${ex.target || "GENERAL"} / ${ex.body_part || "GENERAL"}`.toUpperCase();
    (grouped[key] ||= []).push({ id: ex.id, name: ex.name });
  }
  const lines: string[] = [
    "EXERCISE LIBRARY (use ONLY these — format {{exercise:ID:Exact Name}}):",
    "═══════════════════════════════════════════════════════════════════════",
  ];
  for (const key of Object.keys(grouped).sort()) {
    lines.push(`[${key}]`);
    for (const ex of grouped[key].sort((a, b) => a.name.localeCompare(b.name))) {
      lines.push(`  ${ex.id} | ${ex.name}`);
    }
  }
  lines.push("", "Write EVERY exercise as {{exercise:ID:Exact Name}}. No plain names.");
  return lines.join("\n");
}

// Admin wizard uses Pro for stronger instruction-following on long prompts
// (library-first rules, sets×reps math, M-3 format). Flash kept as fallback
// only if Pro rate-limits/errors. All prompts/rules unchanged.
const AI_MODELS = ["google/gemini-2.5-pro", "google/gemini-2.5-flash"];

async function callAI(apiKey: string, system: string, user: string, maxTokens = 16000): Promise<string | null> {
  for (const model of AI_MODELS) {
    try {
      const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          temperature: 0.6,
          max_tokens: maxTokens,
        }),
      });
      if (r.ok) {
        const d = await r.json();
        const c = d.choices?.[0]?.message?.content;
        if (c) return c;
      } else {
        log("AI non-OK", { model, status: r.status });
        if (r.status === 429) await new Promise((s) => setTimeout(s, 8000));
      }
    } catch (e: any) {
      log("AI error", { model, err: e.message });
    }
  }
  return null;
}

function buildScheduleSystemPrompt(exerciseRef: string, philosophy: string): string {
  return `You are an expert fitness coach building a training program in the M-3 GOLD STANDARD format.

${exerciseRef}

${philosophy}

=== OUTPUT FORMAT (NON-NEGOTIABLE) ===
WEEK HEADERS: <p class="tiptap-paragraph"><strong><u>Week 1-2 (Phase – Intensity):</u></strong></p>
DAY HEADERS:  <p class="tiptap-paragraph"><strong><u>Day 1 - Focus:</u></strong></p>
EXERCISES inside ONE <p> per day, numbered, separated by <br>:
<p class="tiptap-paragraph"><br>1. {{exercise:ID:Name}}– 4 sets × 10 reps @ 70% 1RM (<a href="/1rmcalculator">calculate</a>)<br>2. {{exercise:ID:Name}}– 4 sets × 12 reps</p>
SEPARATORS: one empty <p class="tiptap-paragraph"></p> between days.
REST DAYS: include explicit "Day X - Rest & Recovery" entries to fill the week.

RULES:
- NEVER use <ul>, <li>, or bullet lists. Use <p> with <br> only.
- EVERY exercise MUST use {{exercise:ID:Name}} from the library — no plain names, no invented exercises.
- Use the × multiplication sign for sets/reps, not "x".
- Vary exercises week-to-week for proper periodization.
- Include 1RM Calculator links where percentage-based loading is used.`;
}

function buildScheduleUserPrompt(args: {
  name: string;
  category: string;
  totalWeeks: number;
  daysPerWeek: number;
  difficulty: number;
  equipment: string;
  startWeek: number;
  endWeek: number;
}): string {
  const { name, category, totalWeeks, daysPerWeek, difficulty, equipment, startWeek, endWeek } = args;
  const phase = startWeek <= 2 ? "Foundation/Adaptation"
    : startWeek <= Math.ceil(totalWeeks * 0.6) ? "Building/Progressive Overload"
    : startWeek <= Math.ceil(totalWeeks * 0.85) ? "Peak/Intensification" : "Peak/Taper";

  return `Generate COMPLETE content for Week ${startWeek}–${endWeek} of this program.
PROGRAM: "${name}"
CATEGORY: ${category}
TOTAL DURATION: ${totalWeeks} weeks
DAYS PER WEEK: ${daysPerWeek} training days (fill the other days as rest)
DIFFICULTY: ${difficulty}/6 stars
EQUIPMENT: ${equipment}
CURRENT PHASE (Weeks ${startWeek}-${endWeek} of ${totalWeeks}): ${phase}

Each training day MUST list 4-8 library exercises with sets × reps and rest.
Difficulty ${difficulty}/6: ${difficulty <= 2 ? "Beginner — simple movements, longer rest." : difficulty <= 4 ? "Intermediate — moderate complexity, balanced rest." : "Advanced — complex movements, shorter rest, higher volume."}

OUTPUT — start exactly with the Week header and end after the last day's <p></p>:
<p class="tiptap-paragraph"><strong><u>Week ${startWeek}${startWeek !== endWeek ? `-${endWeek}` : ""} (${phase}):</u></strong></p>
<p class="tiptap-paragraph"></p>
...`;
}

async function generateProse(
  apiKey: string,
  field: "name" | "description" | "program_structure" | "nutrition_tips",
  category: string,
  weeks: number,
  daysPerWeek: number,
  difficulty: number,
  equipment: string,
  philosophy: string,
): Promise<string | null> {
  const ctx = `Category: ${category}\nDuration: ${weeks} weeks, ${daysPerWeek} days/week\nDifficulty: ${difficulty}/6\nEquipment: ${equipment}\n${philosophy}`;
  if (field === "name") {
    const r = await callAI(
      apiKey,
      "You name training programs. Output ONLY the 2-4 word name — no quotes, no punctuation.",
      `Invent a unique, premium 2-4 word program name for:\n${ctx}\nAvoid overused words: Inferno, Blaze, Storm, Beast, Warrior, Elite, Ultimate, Foundation, Engine, Catalyst, Flow, Restore, Gauntlet, Summit, Crucible.`,
      80,
    );
    return r?.trim().replace(/^["'\s]+|["'\s]+$/g, "").slice(0, 60) || null;
  }
  const titles = {
    description: "2-3 paragraph program overview — what it delivers, who it's for, expected outcomes. No exercise names. No {{exercise:}} markup.",
    program_structure: "1-2 paragraph explanation of how the program is structured (split, phases, progression). No exercise names. No {{exercise:}} markup.",
    nutrition_tips: "3-5 sentence nutrition and recovery guidance tied to the program category. No exercise names. No {{exercise:}} markup.",
  } as const;
  const r = await callAI(
    apiKey,
    "You are an expert fitness coach writing program copy. Output HTML using <p class=\"tiptap-paragraph\"> tags only.",
    `Write a ${titles[field]}\n${ctx}`,
    1500,
  );
  return r ? r.trim() : null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const unauthorized = await requireAdminOrServiceRole(req, corsHeaders);
  if (unauthorized) return unauthorized;

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(supabaseUrl, supabaseKey);
    const body = (await req.json()) as WizardBody;
    if (!body?.category) throw new Error("category is required");

    const equipment = body.equipment || "Equipment";
    const weeks = Math.min(Math.max(body.weeks || 4, 4), 8);
    const daysPerWeek = Math.min(Math.max(body.days_per_week || 4, 3), 6);
    const difficulty = body.difficulty_stars ?? 3;
    const access = body.access || "free";
    const difficultyText = difficultyLabel(difficulty);
    const philosophy = philosophyFor(body.category);

    log("Wizard request", { category: body.category, equipment, weeks, daysPerWeek, difficulty, access });

    // Library — filter to bodyweight when requested
    const equipFilter = equipment.toLowerCase().includes("bodyweight") ? "body weight" : undefined;
    const { exercises: library } =
      await fetchAndBuildExerciseReference(supabase, "[WIZ-PROG]", equipFilter, difficultyText.toLowerCase());
    if (!library || library.length === 0) throw new Error("No exercises available for this equipment/difficulty.");
    const exerciseRef = buildCondensedReference(library);

    // ── 1. Name (cheap) ────────────────────────────────────────────────────
    const name = (await generateProse(lovableApiKey, "name", body.category, weeks, daysPerWeek, difficulty, equipment, philosophy))
      || `${body.category.split(" ")[0]} Protocol`;

    // ── 2. Prose (description, structure, nutrition_tips) — parallel ───────
    const [descriptionRaw, structureRaw, nutritionRaw] = await Promise.all([
      generateProse(lovableApiKey, "description", body.category, weeks, daysPerWeek, difficulty, equipment, philosophy),
      generateProse(lovableApiKey, "program_structure", body.category, weeks, daysPerWeek, difficulty, equipment, philosophy),
      generateProse(lovableApiKey, "nutrition_tips", body.category, weeks, daysPerWeek, difficulty, equipment, philosophy),
    ]);

    // ── 3. Weekly schedule in 2-week chunks (sequential to respect rate-limits) ──
    const chunks: string[] = [];
    const systemPrompt = buildScheduleSystemPrompt(exerciseRef, philosophy);
    for (let start = 1; start <= weeks; start += 2) {
      const end = Math.min(start + 1, weeks);
      const userPrompt = buildScheduleUserPrompt({
        name, category: body.category, totalWeeks: weeks, daysPerWeek, difficulty, equipment,
        startWeek: start, endWeek: end,
      });
      const c = await callAI(lovableApiKey, systemPrompt, userPrompt, 12000);
      if (!c) throw new Error(`AI returned empty content for weeks ${start}-${end}`);
      chunks.push(c);
    }
    let fullSchedule = chunks.join('\n<p class="tiptap-paragraph"></p>\n');

    // ── 4. Library-first matching pipeline ─────────────────────────────────
    const matched = processContentWithExerciseMatching(fullSchedule, library, `${LOG}[MATCH]`);
    fullSchedule = matched.processedContent;
    const sweep = guaranteeAllExercisesLinked(fullSchedule, library, `${LOG}[SWEEP]`);
    fullSchedule = sweep.processedContent;
    const reject = rejectNonLibraryExercises(fullSchedule, library, `${LOG}[REJECT]`);
    fullSchedule = reject.processedContent;

    // ── 5. Normalize all HTML fields ───────────────────────────────────────
    fullSchedule = normalizeWorkoutHtml(fullSchedule);
    const description = descriptionRaw ? normalizeWorkoutHtml(descriptionRaw) : "";
    const construction = structureRaw ? normalizeWorkoutHtml(structureRaw) : "";
    const finalTips = nutritionRaw ? normalizeWorkoutHtml(nutritionRaw) : "";

    const draft = {
      // id/serial intentionally omitted — editor allocates them on Save.
      name,
      category: body.category,
      equipment,
      difficulty: difficultyText,
      difficulty_stars: difficulty,
      weeks,
      days_per_week: daysPerWeek,
      // ProgramEditDialog field names:
      training_program: fullSchedule,
      program_description: description,
      construction,
      final_tips: finalTips,
      image_url: "",
      generate_unique_image: true,
      is_free: access === "free",
      is_premium: access === "premium" || access === "standalone",
      is_standalone_purchase: access === "standalone",
      tier_required: access === "premium" ? (body.tier_required || "gold") : "",
      price: access === "standalone" ? String(body.price ?? "") : "",
      stripe_product_id: "",
      stripe_price_id: "",
    };

    log("✅ Drafted (not saved)", { name, scheduleChars: fullSchedule.length });
    return new Response(JSON.stringify({ ok: true, draft }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    log("Fatal", { err: e.message });
    return new Response(JSON.stringify({ ok: false, error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});