// Orchestrator: Generates premium workouts per (category × equipment × difficulty)
// for CALORIE BURNING / METABOLIC / CARDIO. Mirrors generate-strength-focus-batch.
// All workouts: duration=30 min, is_premium, is_standalone_purchase, is_visible,
// is_workout_of_day=false. Library-first markup, 5-section format, AI image, Stripe.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";
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
  console.log(`[CAT-DIFF-GEN] ${step}${d}`);
}

type CategoryKey = "CALORIE BURNING" | "METABOLIC" | "CARDIO";
type EquipmentKey = "BODYWEIGHT" | "EQUIPMENT";
type DifficultyKey = "Advanced" | "Intermediate" | "Beginner";

interface Job {
  category: CategoryKey;
  equipment: EquipmentKey;
  difficulty: DifficultyKey;
}

const ALL_CATEGORIES: CategoryKey[] = ["CALORIE BURNING", "METABOLIC", "CARDIO"];

const CATEGORY_FORMAT: Record<CategoryKey, string> = {
  "CALORIE BURNING": "AMRAP",
  "METABOLIC": "CIRCUIT",
  "CARDIO": "EMOM",
};

function starsFor(difficulty: DifficultyKey, equipment: EquipmentKey): number {
  if (difficulty === "Advanced") return equipment === "BODYWEIGHT" ? 5 : 6;
  if (difficulty === "Intermediate") return equipment === "BODYWEIGHT" ? 3 : 4;
  return equipment === "BODYWEIGHT" ? 1 : 2;
}

function categoryGuidance(category: CategoryKey, equipment: EquipmentKey): string {
  const eq = equipment === "BODYWEIGHT";
  switch (category) {
    case "CALORIE BURNING":
      return eq
        ? "High-output bodyweight conditioning for max caloric expenditure: burpees, jump squats, mountain climbers, high knees, plyometric push-ups, plank variations, jumping lunges."
        : "High-output conditioning with equipment for caloric expenditure: kettlebell swings, dumbbell thrusters, KB clean & press, rowing/assault bike intervals, sled push, battle ropes, DB snatch.";
    case "METABOLIC":
      return eq
        ? "Full-body metabolic conditioning circuits — alternating push/pull/squat/hinge bodyweight movements with minimal rest. Burpees, push-ups, squat jumps, inverted rows variations, lunges."
        : "Full-body metabolic circuits combining strength + conditioning: DB complexes, KB complexes (swing/clean/press), barbell complexes, thrusters, renegade rows, devil press.";
    case "CARDIO":
      return eq
        ? "Cardiovascular conditioning emphasizing sustained heart rate: jumping jacks, skater jumps, high knees, mountain climbers, burpees, jump rope simulation, shuttle steps, plyo lunges."
        : "Cardiovascular conditioning with implements: rower, assault bike, jump rope, KB swings, light DB intervals, ski erg, sled work, box jumps, battle ropes.";
  }
}

function buildPrompt(args: {
  category: CategoryKey;
  equipment: EquipmentKey;
  difficulty: DifficultyKey;
  difficultyStars: number;
  format: string;
  referenceList: string;
  bannedNames: string[];
}): string {
  const { category, equipment, difficulty, difficultyStars, format, referenceList, bannedNames } = args;
  const bannedBlock = bannedNames.length
    ? `\n⛔ BANNED NAMES — already exist in the library; DO NOT reuse or minor variations:\n${bannedNames.slice(0, 200).map(n => `   ❌ "${n}"`).join("\n")}\n`
    : "";

  const formatGuidance =
    format === "AMRAP" ? `AMRAP block: "Main Workout (20-minute AMRAP)" — list 4-6 exercises, each with rep target. e.g. "{{exercise:0123:Burpee}} - 10 reps".`
    : format === "EMOM" ? `EMOM block: "Main Workout (20-minute EMOM)" — alternate 2-4 exercises by minute with rep targets. e.g. "Min 1: {{exercise:0123:KB Swing}} - 15 reps".`
    : format === "CIRCUIT" ? `CIRCUIT block: "Main Workout (5 rounds CIRCUIT)" — list 5-7 stations with reps/time and rest. e.g. "{{exercise:0123:Thruster}} - 12 reps".`
    : `Block format: list exercises with prescription (reps/time).`;

  return `You are Haris Falas, Sports Scientist (CSCS), creating a PREMIUM ${difficulty.toUpperCase()} ${category} workout for SmartyGym.

WORKOUT SPEC:
- Category: ${category}
- Equipment: ${equipment === "BODYWEIGHT" ? "BODYWEIGHT ONLY (no equipment, home-friendly)" : "GYM EQUIPMENT (barbell, dumbbells, kettlebells, cables, machines, bands, ropes, bike/rower if appropriate)"}
- Difficulty: ${difficulty} (${difficultyStars} stars out of 6)
- Format: ${format}
- Target Main+Finisher Duration: 30 min

CATEGORY COACHING RULES:
${categoryGuidance(category, equipment)}

═══════════════════════════════════════════════════════════════════════════════
NAMING RULES (CRITICAL):
═══════════════════════════════════════════════════════════════════════════════
1. UNIQUE 2–4 word creative name. Premium signature feel.
2. AVOID overused words: Inferno, Blaze, Fire, Burn, Fury, Storm, Thunder, Power, Beast, Warrior, Elite, Ultimate, Extreme, Foundation, Torch, Melt, Engine, Drive, Catalyst, Flow, Restore, Gauntlet, Summit, Crucible, Endurance.
3. Draw from athletics, martial arts, nature, engineering, architecture, mythology, music.
4. Must hint at the category (${category}).${bannedBlock}

═══════════════════════════════════════════════════════════════════════════════
EXERCISE LIBRARY (USE EXCLUSIVELY — library-first):
═══════════════════════════════════════════════════════════════════════════════
${referenceList}

Every exercise reference in main_workout MUST use the markup:
{{exercise:ID:Exercise Name}}
Never use plain exercise names. Never invent exercises not present above.

═══════════════════════════════════════════════════════════════════════════════
MANDATORY 5-SECTION STRUCTURE (icons in this exact order):
═══════════════════════════════════════════════════════════════════════════════
1. 🧽 Soft Tissue Preparation — FOAM ROLLING ONLY. Each line MUST start with one of:
   "Foam roll", "Foam-roll", "Lacrosse ball", "Tennis ball", "Trigger point", "Self-massage", "Myofascial release".
   NEVER use {{exercise:...}} markup here. NEVER list stretches, mobility drills, circles, swings, lunges,
   poses, bridges, raises, hydrants, cobra, cat-cow, sun salutations, or any library movement.
   Stretches go in 🔥 Activation (dynamic) or 🧘 Cool Down (static). This section is exclusively
   foam-rolling/ball-release work targeting the muscles the workout trains.
2. 🔥 Activation — library exercises with markup
3. 💪 Main Workout — library exercises with markup (minimum 4 exercises)
4. ⚡ Finisher — library exercises with markup (MINIMUM 3 exercises — required)
5. 🧘 Cool Down — library exercises with markup (stretches & breathing)

SECTION TITLE FORMAT: <p class="tiptap-paragraph">🧽 <strong><u>Soft Tissue Preparation 5'</u></strong></p>
ONLY ONE icon per section.

EXERCISE LINES — bullet lists ONLY:
<ul class="tiptap-bullet-list"><li class="tiptap-list-item"><p class="tiptap-paragraph">{{exercise:ID:Name}} (prescription)</p></li></ul>

SECTION SEPARATORS: ONE empty paragraph between sections only: <p class="tiptap-paragraph"></p>
NO empty paragraphs at start. NO empty paragraphs between exercises within a section.
BULLETS ARE EXCLUSIVELY for exercises.

MAIN WORKOUT TITLE: "Main Workout (${format} 20')"
FINISHER TITLE: "Finisher (For Time)" or "Finisher (5-minute AMRAP)"

FORMAT GUIDANCE:
${formatGuidance}

PRESCRIPTION RULE (${difficulty}):
Every exercise line MUST include a clear prescription — reps, time, or distance.
${difficulty === "Advanced"
    ? `Advanced volume: high density, longer work intervals (40-60s work / 15-20s rest), heavier loads on equipment work, complex movements.`
    : difficulty === "Intermediate"
    ? `Intermediate volume: moderate density (30-40s work / 20-30s rest), moderate loads, fundamental movement patterns.`
    : `Beginner volume: low density, shorter work intervals (20-30s work / 30-40s rest), light loads, simple fundamental patterns, avoid advanced plyometrics or complex compounds. Emphasize technique cues and longer recovery.`}
NEVER list an exercise without a prescription.

${category === "MOBILITY & STABILITY"
    ? `MOBILITY & STABILITY: prioritize controlled tempo, isometric holds, single-leg/single-arm stability work, joint mobility, banded mobility (if equipment) or PNF/CARs (if bodyweight). HARD BAN: no jump squats, jumps, burpees, mountain climbers, high knees, running/sprints, kettlebell swings/snatches, slams, tire flips, heavy squats/deadlifts/lunges, presses/rows/curls/dips, push-ups, crunches, sit-ups, or dynamic leg-raise core work.`
    : equipment === "BODYWEIGHT"
    ? `BODYWEIGHT CONDITIONING: rely on plyometrics, calisthenics, and high-density bodyweight work. NO machines/barbells/dumbbells/kettlebells.`
    : `EQUIPMENT CONDITIONING: use kettlebells, dumbbells, barbells, ropes, rower/bike, sled, box. Combine implements for complexes.`}

═══════════════════════════════════════════════════════════════════════════════
RESPONSE FORMAT (JSON ONLY — NO MARKDOWN):
═══════════════════════════════════════════════════════════════════════════════
{
  "name": "2-4 word creative name (unique)",
  "description": "<p class=\\"tiptap-paragraph\\">2-3 sentence description tied to ${category}.</p>",
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
  price: number,
  tierRequired: string,
): Promise<{ ok: boolean; id?: string; name?: string; error?: string }> {
  const { category, equipment, difficulty } = job;
  const difficultyStars = starsFor(difficulty, equipment);
  const format = CATEGORY_FORMAT[category];
  const referenceList = equipment === "BODYWEIGHT" ? bodyweightRefList : fullRefList;
  const library = equipment === "BODYWEIGHT" ? bodyweightExercises : fullExercises;

  const MAX_ATTEMPTS = 2;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      log("Generating", { category, equipment, difficulty, difficultyStars, format, attempt });
      const prompt = buildPrompt({ category, equipment, difficulty, difficultyStars, format, referenceList, bannedNames });
      const content = await callAI(apiKey, prompt);
      if (!content) throw new Error("All AI models failed");

      const nameLc = content.name.trim().toLowerCase();
      if (bannedNames.some(n => n.trim().toLowerCase() === nameLc)) {
        const suffix = `${category.split(" ")[0].slice(0, 3).toUpperCase()}-${equipment.charAt(0)}-${difficulty.charAt(0)}`;
        content.name = `${content.name.trim()} ${suffix}`;
        log("Name collision, suffixed", { newName: content.name });
      }

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

      const matched = processContentSectionAware(content.main_workout, library, `[CAT-MATCH][${equipment}]`);
      content.main_workout = matched.processedContent;
      const sweep = guaranteeAllExercisesLinked(content.main_workout, library, `[CAT-SWEEP][${equipment}]`);
      content.main_workout = sweep.processedContent;
      const reject = rejectNonLibraryExercises(content.main_workout, library, `[CAT-REJECT][${equipment}]`);
      content.main_workout = reject.processedContent;

      const trulyUnmatched = [...new Set(matched.unmatched)].filter(n =>
        !sweep.forcedMatches.some(f => f.original.toLowerCase() === n.toLowerCase()) &&
        !reject.substituted.some(s => s.original.toLowerCase() === n.toLowerCase())
      );
      if (trulyUnmatched.length > 0) {
        await logUnmatchedExercises(supabase as any, trulyUnmatched, "workout", `CAT-${category}-${equipment}-${difficulty}`, content.name, `[CAT-MISMATCH]`);
      }

      const mainNorm = normalizeWorkoutHtml(content.main_workout);
      const descNorm = normalizeWorkoutHtml(content.description || "");
      const insNorm = normalizeWorkoutHtml(content.instructions || "");
      const tipsNorm = normalizeWorkoutHtml(content.tips || "");

      const htmlValid = validateWorkoutHtml(mainNorm);
      if (!htmlValid.isValid) log("HTML validation issues (continuing)", { issues: htmlValid.issues });

      const sectionCheck = validateWodSections(mainNorm, false, category);
      if (!sectionCheck.isComplete) {
        throw new Error(`Section/density validation failed: missing=[${sectionCheck.missingSections.join(", ")}], issues=[${[...sectionCheck.exerciseContentIssues, ...sectionCheck.softTissueIssues, ...sectionCheck.mobilityCompatibilityIssues].join("; ")}]`);
      }

      const ts = Date.now();
      const catSlug = category.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const diffSlug = difficulty.toLowerCase().slice(0, 3);
      const workoutId = `PREM-${catSlug}-${equipment.charAt(0)}-${diffSlug}-${ts}`;

      // Image
      let imageUrl: string | null = null;
      try {
        const { data: imgData, error: imgErr } = await supabase.functions.invoke("generate-workout-image", {
          body: { name: content.name, category, format, difficulty_stars: difficultyStars },
        });
        if (!imgErr && imgData?.image_url) imageUrl = imgData.image_url;
      } catch (e: any) { log("Image gen exception", { err: e.message }); }

      if (!imageUrl || !imageUrl.startsWith("https://")) {
        throw new Error("Image generation failed — workout insertion blocked");
      }

      // Stripe
      let stripeProductId: string | null = null;
      let stripePriceId: string | null = null;
      try {
        const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
        if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");
        const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
        const product = await stripe.products.create({
          name: content.name,
          description: `Workout: ${content.name}`,
          images: [imageUrl],
          metadata: {
            project: "SMARTYGYM",
            content_type: "Workout",
            source: "generate-category-difficulty-batch",
            category,
            equipment,
            difficulty,
            difficulty_stars: String(difficultyStars),
          },
        }, { idempotencyKey: `prod-${workoutId}` });
        const priceObj = await stripe.prices.create({
          product: product.id,
          unit_amount: Math.round(price * 100),
          currency: "eur",
          metadata: { project: "SMARTYGYM", content_type: "Workout" },
        }, { idempotencyKey: `price-${workoutId}` });
        await stripe.products.update(product.id, { default_price: priceObj.id });
        stripeProductId = product.id;
        stripePriceId = priceObj.id;
        log("Stripe product+price created", { id: stripeProductId, price: stripePriceId });
      } catch (e: any) {
        log("Stripe product creation failed", { err: e.message });
        throw new Error(`Stripe failed: ${e.message}`);
      }

      const { error: insErr } = await (supabase as any).from("admin_workouts").insert({
        id: workoutId,
        name: content.name,
        type: "workout",
        category,
        format,
        equipment,
        difficulty,
        difficulty_stars: difficultyStars,
        duration: "30 min",
        description: descNorm,
        main_workout: mainNorm,
        instructions: insNorm,
        tips: tipsNorm,
        image_url: imageUrl,
        is_premium: true,
        is_free: false,
        tier_required: tierRequired,
        is_standalone_purchase: true,
        price,
        stripe_product_id: stripeProductId,
        stripe_price_id: stripePriceId,
        is_workout_of_day: false,
        is_ai_generated: true,
        is_visible: true,
        serial_number: null,
        generated_for_date: null,
      });
      if (insErr) throw new Error(`DB insert failed: ${insErr.message}`);

      bannedNames.push(content.name);
      log("✅ Created", { id: workoutId, name: content.name, category, equipment, difficulty });
      return { ok: true, id: workoutId, name: content.name };
    } catch (e: any) {
      log(`Attempt ${attempt} failed`, { category, equipment, difficulty, err: e.message });
      if (attempt === MAX_ATTEMPTS) return { ok: false, error: e.message };
      await new Promise(r => setTimeout(r, 6000));
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

    let difficulty: DifficultyKey = "Advanced";
    let categories: CategoryKey[] = ALL_CATEGORIES;
    let equipments: EquipmentKey[] = ["BODYWEIGHT", "EQUIPMENT"];
    let price = 3.99;
    let tierRequired = "gold";

    try {
      const body = await req.json();
      if (body?.difficulty === "Advanced" || body?.difficulty === "Intermediate" || body?.difficulty === "Beginner") difficulty = body.difficulty;
      if (Array.isArray(body?.categories) && body.categories.length) categories = body.categories;
      if (Array.isArray(body?.equipment) && body.equipment.length) equipments = body.equipment;
      if (typeof body?.price === "number") price = body.price;
      if (typeof body?.tier_required === "string") tierRequired = body.tier_required;
    } catch { /* no body */ }

    const jobs: Job[] = [];
    for (const category of categories) {
      for (const equipment of equipments) {
        jobs.push({ category, equipment, difficulty });
      }
    }

    log("Run config", { difficulty, categories, equipments, price, tierRequired, jobCount: jobs.length });

    const existingNamesAll = new Set<string>();
    const { data: allNames } = await supabase.from("admin_workouts").select("name");
    for (const w of allNames || []) existingNamesAll.add(w.name);

    const libDifficulty = difficulty.toLowerCase();
    const { exercises: bodyweightExercises, referenceList: bodyweightRefList } =
      await fetchAndBuildExerciseReference(supabase, "[CAT-BW]", "body weight", libDifficulty);
    const { exercises: fullExercises, referenceList: fullRefList } =
      await fetchAndBuildExerciseReference(supabase, "[CAT-FULL]", undefined, libDifficulty);

    log("Libraries loaded", { bw: bodyweightExercises.length, full: fullExercises.length });

    const results: any[] = [];
    for (const job of jobs) {
      const banned = Array.from(existingNamesAll);
      const r = await generateOne(
        supabase as any, lovableApiKey, job,
        bodyweightExercises, bodyweightRefList,
        fullExercises, fullRefList,
        banned, price, tierRequired,
      );
      if (r.ok && r.name) existingNamesAll.add(r.name);
      results.push({ ...job, ...r });
      await new Promise(res => setTimeout(res, 1500));
    }

    const summary = {
      total: jobs.length,
      created: results.filter(r => r.ok).length,
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
