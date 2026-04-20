// Orchestrator: Generates 12 free Intermediate workouts (2 per category × 6 categories)
// One Bodyweight + one Equipment per category. Same pipeline & quality as the WOD:
// library-first {{exercise:ID:Name}} markup, 5-section format, density validation,
// HTML normalization, unique AI image, no Stripe (free), is_workout_of_day=false.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import {
  processContentSectionAware,
  fetchAndBuildExerciseReference,
  guaranteeAllExercisesLinked,
  rejectNonLibraryExercises,
  logUnmatchedExercises,
  type ExerciseBasic,
} from "../_shared/exercise-matching.ts";
import { normalizeWorkoutHtml, validateWorkoutHtml } from "../_shared/html-normalizer.ts";
import { validateWodSections } from "../_shared/section-validator.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function log(step: string, details?: any) {
  const d = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[FREE-CAT-GEN] ${step}${d}`);
}

// Categories (DB values) and the labels we want in prompts
type CategoryKey = "STRENGTH" | "CALORIE BURNING" | "METABOLIC" | "CHALLENGE" | "CARDIO" | "MOBILITY & STABILITY";
type EquipmentKey = "BODYWEIGHT" | "EQUIPMENT";

interface Job {
  category: CategoryKey;
  equipment: EquipmentKey;
}

const JOBS: Job[] = [
  { category: "STRENGTH",             equipment: "BODYWEIGHT" },
  { category: "STRENGTH",             equipment: "EQUIPMENT"  },
  { category: "CALORIE BURNING",      equipment: "BODYWEIGHT" },
  { category: "CALORIE BURNING",      equipment: "EQUIPMENT"  },
  { category: "METABOLIC",            equipment: "BODYWEIGHT" },
  { category: "METABOLIC",            equipment: "EQUIPMENT"  },
  { category: "CHALLENGE",            equipment: "BODYWEIGHT" },
  { category: "CHALLENGE",            equipment: "EQUIPMENT"  },
  { category: "CARDIO",               equipment: "BODYWEIGHT" },
  { category: "CARDIO",               equipment: "EQUIPMENT"  },
  { category: "MOBILITY & STABILITY", equipment: "BODYWEIGHT" },
  { category: "MOBILITY & STABILITY", equipment: "EQUIPMENT"  },
];

// Per-category format selection (matches WOD coaching rules)
function pickFormat(category: CategoryKey): { format: string; duration: string } {
  // STRENGTH and MOBILITY & STABILITY are always REPS & SETS
  if (category === "STRENGTH" || category === "MOBILITY & STABILITY") {
    return { format: "REPS & SETS", duration: "30 min" };
  }
  if (category === "CARDIO") {
    const opts = [
      { format: "EMOM", duration: "25 min" },
      { format: "AMRAP", duration: "20 min" },
      { format: "CIRCUIT", duration: "30 min" },
    ];
    return opts[Math.floor(Math.random() * opts.length)];
  }
  if (category === "CHALLENGE") {
    const opts = [
      { format: "FOR TIME", duration: "25 min" },
      { format: "AMRAP", duration: "25 min" },
    ];
    return opts[Math.floor(Math.random() * opts.length)];
  }
  if (category === "METABOLIC") {
    const opts = [
      { format: "TABATA", duration: "24 min" },
      { format: "EMOM", duration: "25 min" },
      { format: "CIRCUIT", duration: "30 min" },
    ];
    return opts[Math.floor(Math.random() * opts.length)];
  }
  // CALORIE BURNING
  const opts = [
    { format: "TABATA", duration: "24 min" },
    { format: "AMRAP", duration: "25 min" },
    { format: "CIRCUIT", duration: "30 min" },
  ];
  return opts[Math.floor(Math.random() * opts.length)];
}

function buildPrompt(args: {
  category: CategoryKey;
  equipment: EquipmentKey;
  format: string;
  duration: string;
  referenceList: string;
  bannedNames: string[];
  difficulty: string;
  difficultyStars: number;
}): string {
  const { category, equipment, format, duration, referenceList, bannedNames, difficulty, difficultyStars } = args;
  const difficultyLc = difficulty.toLowerCase();
  const isBeginner = difficultyLc === "beginner";

  const bannedBlock = bannedNames.length
    ? `\n⛔ BANNED NAMES — these names already exist for ${category}; DO NOT use any of them or minor variations:\n${bannedNames.map(n => `   ❌ "${n}"`).join("\n")}\n`
    : "";

  const isRepsSets = category === "STRENGTH" || category === "MOBILITY & STABILITY";

  return `You are Haris Falas, Sports Scientist (CSCS), creating a premium FREE ${difficultyLc} workout for SmartyGym.

WORKOUT SPEC:
- Category: ${category}
- Equipment: ${equipment === "BODYWEIGHT" ? "BODYWEIGHT ONLY (no equipment)" : "GYM EQUIPMENT (dumbbells, kettlebells, barbells, machines, bands, etc.)"}
- Difficulty: ${difficulty} (${difficultyStars} stars out of 6)${isBeginner ? "\n- IMPORTANT: BEGINNER level — choose foundational, low-skill exercises only. Lower volume, longer rest, simpler progressions. Avoid advanced movements (muscle-ups, pistol squats, plyometric depth jumps, heavy Olympic lifts, single-arm advanced KB work). Use regressions where appropriate." : ""}
- Format: ${format}
- Target Main+Finisher Duration: ${duration}

═══════════════════════════════════════════════════════════════════════════════
NAMING RULES (CRITICAL):
═══════════════════════════════════════════════════════════════════════════════
1. UNIQUE 2–4 word creative name. Premium signature feel.
2. AVOID overused words: Inferno, Blaze, Fire, Burn, Fury, Storm, Thunder, Power, Beast, Warrior, Elite, Ultimate, Extreme, Foundation, Torch, Melt, Engine, Drive, Catalyst, Flow, Restore, Gauntlet, Summit, Crucible, Endurance.
3. Draw from athletics, martial arts, nature, engineering, architecture, mythology, music.
4. Must hint at the workout's focus.${bannedBlock}

═══════════════════════════════════════════════════════════════════════════════
EXERCISE LIBRARY (USE EXCLUSIVELY — library-first):
═══════════════════════════════════════════════════════════════════════════════
${referenceList}

You MUST use exercises from the library above. Every exercise reference in main_workout MUST use the markup:
{{exercise:ID:Exercise Name}}
Never use plain exercise names. Never invent exercises not present above.

═══════════════════════════════════════════════════════════════════════════════
MANDATORY 5-SECTION STRUCTURE (icons in this exact order):
═══════════════════════════════════════════════════════════════════════════════
1. 🧽 Soft Tissue Preparation — plain text foam-roll/lacrosse-ball cues (NOT library exercises)
2. 🔥 Activation — library exercises with markup
3. 💪 Main Workout — library exercises with markup (minimum 3 exercises)
4. ⚡ Finisher — library exercises with markup (minimum 1 exercise)
5. 🧘 Cool Down — library exercises with markup (stretches & breathing)

SECTION TITLE FORMAT: <p class="tiptap-paragraph">🧽 <strong><u>Soft Tissue Preparation 5'</u></strong></p>
ONLY ONE icon per section. Never duplicate.

EXERCISE LINES — bullet lists ONLY:
<ul class="tiptap-bullet-list"><li class="tiptap-list-item"><p class="tiptap-paragraph">{{exercise:ID:Name}} (prescription)</p></li></ul>

SECTION SEPARATORS: ONE empty paragraph between sections only: <p class="tiptap-paragraph"></p>
NO empty paragraphs at start. NO empty paragraphs between exercises within a section.

BULLETS ARE EXCLUSIVELY for exercises. Never bullet instructions, format labels, or rest cues.

MAIN WORKOUT TITLE: "Main Workout (${format} ${duration.replace(' min', "'")})" — no creative sub-name.
FINISHER TITLE: "Finisher (For Time)" or "Finisher (8-minute AMRAP)" — no creative sub-name.

${isRepsSets ? `
REPS & SETS MANDATORY RULE (${difficulty}):
Every exercise line MUST include sets x reps with tempo and prescription.
${isBeginner ? `Beginner volume guidance: 2-3 sets x 8-12 reps with controlled tempo (3-1-2-0) and longer rest (60-120s). Use foundational lifts: goblet squat, dumbbell RDL, push-up (incline if needed), seated row, glute bridge, plank.` : `Example: "{{exercise:0123:Push-up}} - 4 sets x 8-10 reps (3-1-1-0 tempo, rest 60-90s)"`}
NEVER list an exercise without sets x reps prescription.
` : `
TIMED FORMAT RULES:
- Tabata: 20s work / 10s rest, 8 rounds per exercise.
- AMRAP: list exercises with reps; round-based.
- EMOM: prefix lines with "<strong>Minute N:</strong>".
- Circuit: rounds x exercises with reps.
- For Time: list reps to complete as fast as possible.
`}

${category === "MOBILITY & STABILITY" ? `MOBILITY & STABILITY: prioritize controlled tempo, isometric holds, single-leg/single-arm stability work, banded mobility (if equipment) or PNF/CARs (if bodyweight).` : ""}
${category === "CARDIO" ? `CARDIO: continuous activity. If BODYWEIGHT: jumping jacks, mountain climbers, burpees, high knees, shuttle drills. If EQUIPMENT: rower, ski erg, assault bike, jump rope. NO REPS & SETS.` : ""}
${category === "CHALLENGE" ? `CHALLENGE: a benchmark feel. For Time or AMRAP. High demand but completable by intermediate athletes.` : ""}
${category === "METABOLIC" ? `METABOLIC: full-body conditioning, compound movements, minimal rest. Big breath demand.` : ""}
${category === "CALORIE BURNING" ? `CALORIE BURNING: sustained high-output, large-muscle compound movements, plyometrics, conditioning bursts.` : ""}
${category === "STRENGTH" ? `STRENGTH: compound primary lift first, then accessories. ${equipment === "BODYWEIGHT" ? "Use progressions like archer push-ups, pistol squat regressions, pull-ups." : "Use barbell/dumbbell/kettlebell compounds: squat, deadlift, press, row variations."}` : ""}

═══════════════════════════════════════════════════════════════════════════════
RESPONSE FORMAT (JSON ONLY — NO MARKDOWN):
═══════════════════════════════════════════════════════════════════════════════
{
  "name": "2-4 word creative name (unique)",
  "description": "<p class=\\"tiptap-paragraph\\">2-3 sentence description</p>",
  "main_workout": "Full 5-section HTML following the rules above with library-first markup",
  "instructions": "<p class=\\"tiptap-paragraph\\">How to perform this workout</p>",
  "tips": "<p class=\\"tiptap-paragraph\\">Coaching tip 1</p><p class=\\"tiptap-paragraph\\">Coaching tip 2</p><p class=\\"tiptap-paragraph\\">Coaching tip 3</p>"
}`;
}

interface WorkoutContent {
  name: string;
  description: string;
  main_workout: string;
  instructions: string;
  tips: string;
}

const wodTool = {
  type: "function" as const,
  function: {
    name: "generate_workout",
    description: "Generate a structured workout with all required fields",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string" },
        description: { type: "string" },
        main_workout: { type: "string" },
        instructions: { type: "string" },
        tips: { type: "string" },
      },
      required: ["name", "description", "main_workout", "instructions", "tips"],
      additionalProperties: false,
    },
  },
};

const AI_MODELS = ["google/gemini-2.5-flash", "google/gemini-2.5-flash-lite", "openai/gpt-5-mini"];

async function callAI(apiKey: string, prompt: string): Promise<WorkoutContent | null> {
  for (const model of AI_MODELS) {
    // 1) Tool call
    try {
      const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: "You are an expert fitness coach. Generate workouts using the provided tool." },
            { role: "user", content: prompt },
          ],
          tools: [wodTool],
          tool_choice: { type: "function", function: { name: "generate_workout" } },
        }),
      });
      if (r.ok) {
        const d = await r.json();
        const tc = d.choices?.[0]?.message?.tool_calls?.[0];
        if (tc?.function?.arguments) {
          try { return JSON.parse(tc.function.arguments) as WorkoutContent; } catch {}
        }
      } else {
        log("AI tool-call non-OK", { model, status: r.status });
      }
    } catch (e: any) { log("AI tool-call error", { model, err: e.message }); }

    // 2) Text fallback
    try {
      const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: "Return ONLY valid JSON. No markdown. No code blocks. Start with { and end with }." },
            { role: "user", content: prompt },
          ],
        }),
      });
      if (r.ok) {
        const d = await r.json();
        let c: string = d.choices?.[0]?.message?.content || "";
        c = c.replace(/^```(?:json|JSON)?\s*\n?/gm, "").replace(/\n?```\s*$/gm, "");
        const a = c.indexOf("{"), b = c.lastIndexOf("}");
        if (a !== -1 && b > a) c = c.substring(a, b + 1);
        try { return JSON.parse(c.trim()) as WorkoutContent; } catch {}
      } else {
        log("AI text-fallback non-OK", { model, status: r.status });
      }
    } catch (e: any) { log("AI text-fallback error", { model, err: e.message }); }
  }
  return null;
}

async function generateOne(
  supabase: ReturnType<typeof createClient>,
  apiKey: string,
  job: Job,
  bodyweightExercises: ExerciseBasic[],
  bodyweightRefList: string,
  fullExercises: ExerciseBasic[],
  fullRefList: string,
  bannedNames: string[],
  difficulty: string,
  difficultyStars: number,
): Promise<{ ok: boolean; id?: string; name?: string; error?: string }> {
  const { category, equipment } = job;
  const { format, duration } = pickFormat(category);
  const referenceList = equipment === "BODYWEIGHT" ? bodyweightRefList : fullRefList;
  const library = equipment === "BODYWEIGHT" ? bodyweightExercises : fullExercises;

  const MAX_ATTEMPTS = 2;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      log(`Generating`, { category, equipment, format, duration, difficulty, attempt });
      const prompt = buildPrompt({ category, equipment, format, duration, referenceList, bannedNames, difficulty, difficultyStars });
      const content = await callAI(apiKey, prompt);
      if (!content) throw new Error("All AI models failed");

      // Name dedupe
      const nameLc = content.name.trim().toLowerCase();
      if (bannedNames.some(n => n.trim().toLowerCase() === nameLc)) {
        const suffix = `${category.split(" ")[0].slice(0, 3).toUpperCase()}-${equipment.charAt(0)}`;
        content.name = `${content.name.trim()} ${suffix}`;
        log("Name collision, suffixed", { newName: content.name });
      }

      // Library-first enforcement (same as WOD)
      const libById = new Map(library.map(ex => [ex.id, ex]));
      const markupPattern = /\{\{(?:exercise|exrcise|excersize|excercise):([^:]+):([^}]+)\}\}/gi;
      const invalidIds: string[] = [];
      let m: RegExpExecArray | null;
      while ((m = markupPattern.exec(content.main_workout)) !== null) {
        if (!libById.has(m[1])) invalidIds.push(`${m[1]}:${m[2]}`);
      }
      if (invalidIds.length > 0) {
        let cleaned = content.main_workout;
        for (const inv of invalidIds) {
          const [id, name] = inv.split(":");
          cleaned = cleaned.replace(
            new RegExp(`\\{\\{(?:exercise|exrcise|excersize|excercise):${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}:[^}]+\\}\\}`, "gi"),
            name
          );
        }
        content.main_workout = cleaned;
      }

      const matched = processContentSectionAware(content.main_workout, library, `[FREE-MATCH][${equipment}]`);
      content.main_workout = matched.processedContent;

      const sweep = guaranteeAllExercisesLinked(content.main_workout, library, `[FREE-SWEEP][${equipment}]`);
      content.main_workout = sweep.processedContent;

      const reject = rejectNonLibraryExercises(content.main_workout, library, `[FREE-REJECT][${equipment}]`);
      content.main_workout = reject.processedContent;

      const trulyUnmatched = [...new Set(matched.unmatched)].filter(n =>
        !sweep.forcedMatches.some(f => f.original.toLowerCase() === n.toLowerCase()) &&
        !reject.substituted.some(s => s.original.toLowerCase() === n.toLowerCase())
      );
      if (trulyUnmatched.length > 0) {
        await logUnmatchedExercises(supabase, trulyUnmatched, "free-cat", `FREE-${category}-${equipment}`, content.name, `[FREE-MISMATCH][${equipment}]`);
      }

      // Normalize + validate
      const mainNorm = normalizeWorkoutHtml(content.main_workout);
      const descNorm = normalizeWorkoutHtml(content.description || "");
      const insNorm = normalizeWorkoutHtml(content.instructions || "");
      const tipsNorm = normalizeWorkoutHtml(content.tips || "");

      const htmlValid = validateWorkoutHtml(mainNorm);
      if (!htmlValid.isValid) log("HTML validation issues (continuing)", { issues: htmlValid.issues });

      const sectionCheck = validateWodSections(mainNorm, false);
      if (!sectionCheck.isComplete) {
        throw new Error(`Section/density validation failed: missing=[${sectionCheck.missingSections.join(", ")}], issues=[${sectionCheck.exerciseContentIssues.join("; ")}]`);
      }

      // Build ID + insert
      const ts = Date.now();
      const catSlug = category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const workoutId = `FREE-${catSlug}-${equipment.charAt(0)}-${ts}`;

      // Generate image synchronously (so the row immediately has one — trigger is the backup)
      let imageUrl: string | null = null;
      try {
        const { data: imgData, error: imgErr } = await supabase.functions.invoke("generate-workout-image", {
          body: { name: content.name, category, format, difficulty_stars: 3 },
        });
        if (!imgErr && imgData?.image_url) imageUrl = imgData.image_url;
      } catch (e: any) { log("Image gen exception (trigger will retry)", { err: e.message }); }

      const { error: insErr } = await supabase.from("admin_workouts").insert({
        id: workoutId,
        name: content.name,
        type: "workout",
        category,
        format,
        equipment,
        difficulty: "Intermediate",
        difficulty_stars: 3,
        duration,
        description: descNorm,
        main_workout: mainNorm,
        instructions: insNorm,
        tips: tipsNorm,
        image_url: imageUrl,
        is_premium: false,
        is_free: true,
        is_standalone_purchase: false,
        price: null,
        stripe_product_id: null,
        stripe_price_id: null,
        is_workout_of_day: false,
        is_ai_generated: true,
        is_visible: true,
        serial_number: null,
        generated_for_date: null,
      });
      if (insErr) throw new Error(`DB insert failed: ${insErr.message}`);

      bannedNames.push(content.name);
      log(`✅ Created`, { id: workoutId, name: content.name, category, equipment });
      return { ok: true, id: workoutId, name: content.name };
    } catch (e: any) {
      log(`Attempt ${attempt} failed`, { category, equipment, err: e.message });
      if (attempt === MAX_ATTEMPTS) return { ok: false, error: e.message };
      await new Promise(r => setTimeout(r, 8000));
    }
  }
  return { ok: false, error: "exhausted retries" };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(supabaseUrl, supabaseKey);

    let onlyJobs: Job[] | null = null;
    try {
      const body = await req.json();
      if (Array.isArray(body?.jobs)) onlyJobs = body.jobs;
    } catch { /* no body */ }

    // Fetch existing names per category for dedup + idempotency
    const { data: existing } = await supabase
      .from("admin_workouts")
      .select("name, category, equipment, difficulty, is_free, is_workout_of_day")
      .eq("is_free", true)
      .eq("difficulty", "Intermediate")
      .eq("is_workout_of_day", false);

    const existingByKey = new Map<string, string[]>(); // key: `${category}|${equipment}` -> names
    const existingNamesAll = new Set<string>();
    for (const w of existing || []) {
      const key = `${w.category}|${w.equipment}`;
      if (!existingByKey.has(key)) existingByKey.set(key, []);
      existingByKey.get(key)!.push(w.name);
      existingNamesAll.add(w.name);
    }

    // Build exercise libraries once
    const { exercises: bodyweightExercises, referenceList: bodyweightRefList } =
      await fetchAndBuildExerciseReference(supabase, "[FREE-CAT-GEN-BW]", "body weight", "intermediate");
    const { exercises: fullExercises, referenceList: fullRefList } =
      await fetchAndBuildExerciseReference(supabase, "[FREE-CAT-GEN-FULL]", undefined, "intermediate");

    log("Libraries loaded", { bw: bodyweightExercises.length, full: fullExercises.length });

    const jobsToRun = onlyJobs ?? JOBS;
    const results: any[] = [];

    for (const job of jobsToRun) {
      const key = `${job.category}|${job.equipment}`;
      // Idempotent: skip if a free intermediate workout already exists for this combo
      if ((existingByKey.get(key)?.length ?? 0) > 0) {
        log(`Skipping (already exists)`, { ...job, existing: existingByKey.get(key) });
        results.push({ ...job, status: "skipped", reason: "already exists", existing: existingByKey.get(key) });
        continue;
      }

      const banned = Array.from(existingNamesAll); // global banned list to maximize uniqueness
      const r = await generateOne(
        supabase, lovableApiKey, job,
        bodyweightExercises, bodyweightRefList,
        fullExercises, fullRefList,
        banned
      );
      if (r.ok && r.name) existingNamesAll.add(r.name);
      results.push({ ...job, ...r });

      // small delay to be nice to AI gateway
      await new Promise(res => setTimeout(res, 1500));
    }

    const summary = {
      total: jobsToRun.length,
      created: results.filter(r => r.ok).length,
      skipped: results.filter(r => r.status === "skipped").length,
      failed: results.filter(r => r.ok === false).length,
    };
    log("Run complete", summary);

    return new Response(JSON.stringify({ summary, results }, null, 2), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e: any) {
    log("Fatal error", { err: e.message });
    return new Response(JSON.stringify({ error: e.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
