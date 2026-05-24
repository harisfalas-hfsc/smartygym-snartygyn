// Orchestrator: Generates premium Strength workouts per (focus × equipment × difficulty).
// Mirrors generate-free-category-workouts pipeline: library-first {{exercise:ID:Name}} markup,
// 5-section format, density validation, HTML normalization, AI image, Stripe product+price.
// All workouts: category=STRENGTH, format=REPS & SETS, duration=30 min, is_premium=true,
// is_standalone_purchase=true, is_visible=true, is_workout_of_day=false.

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
  console.log(`[STR-FOCUS-GEN] ${step}${d}`);
}

type FocusKey =
  | "LOWER BODY"
  | "UPPER BODY"
  | "FULL BODY"
  | "LOW PUSH & UPPER PULL"
  | "LOW PULL & UPPER PUSH"
  | "CORE & GLUTES";
type EquipmentKey = "BODYWEIGHT" | "EQUIPMENT";
type DifficultyKey = "Advanced" | "Intermediate";

interface Job {
  focus: FocusKey;
  equipment: EquipmentKey;
  difficulty: DifficultyKey;
}

const ALL_FOCUSES: FocusKey[] = [
  "LOWER BODY",
  "UPPER BODY",
  "FULL BODY",
  "LOW PUSH & UPPER PULL",
  "LOW PULL & UPPER PUSH",
  "CORE & GLUTES",
];

function starsFor(difficulty: DifficultyKey, equipment: EquipmentKey): number {
  if (difficulty === "Advanced") return equipment === "BODYWEIGHT" ? 5 : 6;
  return equipment === "BODYWEIGHT" ? 3 : 4;
}

function focusGuidance(focus: FocusKey, equipment: EquipmentKey): string {
  const eq = equipment === "BODYWEIGHT";
  switch (focus) {
    case "LOWER BODY":
      return eq
        ? "Lower body emphasis: squat/lunge/hinge patterns (pistol progressions, Bulgarian split squat, single-leg RDL, glute bridges, step-ups)."
        : "Lower body emphasis: barbell back/front squat, RDL, deadlift variations, walking lunges, leg press, DB/KB step-ups.";
    case "UPPER BODY":
      return eq
        ? "Upper body emphasis: push (push-ups, dips, archer, pike), pull (pull-ups, inverted rows, scapular pulls)."
        : "Upper body emphasis: bench press, OHP, rows (barbell/DB/cable), pull-ups (loaded if possible), DB shoulder work.";
    case "FULL BODY":
      return eq
        ? "Full body: alternate compound push, pull, squat, hinge across the main block."
        : "Full body: pair a heavy compound lift with complementary accessories across push/pull/squat/hinge.";
    case "LOW PUSH & UPPER PULL":
      return eq
        ? "Lower-body PUSH (squat/lunge dominant) + Upper-body PULL (rows, pull-ups). NO hinge-dominant lower or pressing-dominant upper."
        : "Lower-body PUSH (back/front squat, leg press, split squat) + Upper-body PULL (rows, pull-ups, lat pulldown). NO deadlifts/bench/OHP.";
    case "LOW PULL & UPPER PUSH":
      return eq
        ? "Lower-body PULL (hinge: glute bridges, single-leg hip thrust, good mornings BW) + Upper-body PUSH (push-ups, dips, pike push-ups). NO squats or rows."
        : "Lower-body PULL (deadlift, RDL, hip thrust, good mornings) + Upper-body PUSH (bench, OHP, DB press, dips). NO squats or rows.";
    case "CORE & GLUTES":
      return eq
        ? "Core & glutes: planks, dead bugs, hollow holds, hip thrusts BW, single-leg glute bridges, side planks, bird dogs."
        : "Core & glutes: barbell/DB hip thrusts, cable woodchops, weighted plank, kettlebell swings, banded glute work, Pallof press.";
  }
}

function buildPrompt(args: {
  focus: FocusKey;
  equipment: EquipmentKey;
  difficulty: DifficultyKey;
  difficultyStars: number;
  referenceList: string;
  bannedNames: string[];
}): string {
  const { focus, equipment, difficulty, difficultyStars, referenceList, bannedNames } = args;
  const bannedBlock = bannedNames.length
    ? `\n⛔ BANNED NAMES — already exist in the library; DO NOT reuse or minor variations:\n${bannedNames.slice(0, 200).map(n => `   ❌ "${n}"`).join("\n")}\n`
    : "";

  return `You are Haris Falas, Sports Scientist (CSCS), creating a PREMIUM ${difficulty.toUpperCase()} Strength workout for SmartyGym.

WORKOUT SPEC:
- Category: STRENGTH
- Focus: ${focus}
- Equipment: ${equipment === "BODYWEIGHT" ? "BODYWEIGHT ONLY (no equipment, home-friendly)" : "GYM EQUIPMENT (barbell, dumbbells, kettlebells, cables, machines, bands)"}
- Difficulty: ${difficulty} (${difficultyStars} stars out of 6)
- Format: REPS & SETS
- Target Main+Finisher Duration: 30 min

FOCUS COACHING RULES:
${focusGuidance(focus, equipment)}

═══════════════════════════════════════════════════════════════════════════════
NAMING RULES (CRITICAL):
═══════════════════════════════════════════════════════════════════════════════
1. UNIQUE 2–4 word creative name. Premium signature feel.
2. AVOID overused words: Inferno, Blaze, Fire, Burn, Fury, Storm, Thunder, Power, Beast, Warrior, Elite, Ultimate, Extreme, Foundation, Torch, Melt, Engine, Drive, Catalyst, Flow, Restore, Gauntlet, Summit, Crucible, Endurance.
3. Draw from athletics, martial arts, nature, engineering, architecture, mythology, music.
4. Must hint at the focus (${focus}).${bannedBlock}

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

MAIN WORKOUT TITLE: "Main Workout (REPS & SETS 30')"
FINISHER TITLE: "Finisher (For Time)" or "Finisher (8-minute AMRAP)"

REPS & SETS MANDATORY RULE (${difficulty}):
Every exercise line MUST include sets x reps with tempo and rest.
Example: "{{exercise:0123:Back Squat}} - 4 sets x 6-8 reps (3-1-1-0 tempo, rest 90-120s)"
${difficulty === "Advanced"
    ? `Advanced volume: 4-5 sets x 4-8 heavy reps on primary lift, 3-4 sets x 6-10 on accessories. Rest 90-180s on heavy compounds.`
    : `Intermediate volume: 3-4 sets x 8-12 reps, controlled tempo (3-1-2-0), rest 60-90s.`}
NEVER list an exercise without sets x reps prescription.

${equipment === "BODYWEIGHT"
    ? `BODYWEIGHT STRENGTH: use progressions (archer push-ups, pistol progressions, pull-up variants, single-leg work). NO machines/barbells/dumbbells.`
    : `EQUIPMENT STRENGTH: lead with a heavy compound lift (barbell/DB/KB), follow with accessories. Use appropriate loading cues.`}

═══════════════════════════════════════════════════════════════════════════════
RESPONSE FORMAT (JSON ONLY — NO MARKDOWN):
═══════════════════════════════════════════════════════════════════════════════
{
  "name": "2-4 word creative name (unique)",
  "description": "<p class=\\"tiptap-paragraph\\">2-3 sentence description tied to ${focus}.</p>",
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
  const { focus, equipment, difficulty } = job;
  const difficultyStars = starsFor(difficulty, equipment);
  const referenceList = equipment === "BODYWEIGHT" ? bodyweightRefList : fullRefList;
  const library = equipment === "BODYWEIGHT" ? bodyweightExercises : fullExercises;

  const MAX_ATTEMPTS = 2;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      log("Generating", { focus, equipment, difficulty, difficultyStars, attempt });
      const prompt = buildPrompt({ focus, equipment, difficulty, difficultyStars, referenceList, bannedNames });
      const content = await callAI(apiKey, prompt);
      if (!content) throw new Error("All AI models failed");

      const nameLc = content.name.trim().toLowerCase();
      if (bannedNames.some(n => n.trim().toLowerCase() === nameLc)) {
        const suffix = `${focus.split(" ")[0].slice(0, 3).toUpperCase()}-${equipment.charAt(0)}-${difficulty.charAt(0)}`;
        content.name = `${content.name.trim()} ${suffix}`;
        log("Name collision, suffixed", { newName: content.name });
      }

      // Library-first enforcement
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

      const matched = processContentSectionAware(content.main_workout, library, `[STR-MATCH][${equipment}]`);
      content.main_workout = matched.processedContent;
      const sweep = guaranteeAllExercisesLinked(content.main_workout, library, `[STR-SWEEP][${equipment}]`);
      content.main_workout = sweep.processedContent;
      const reject = rejectNonLibraryExercises(content.main_workout, library, `[STR-REJECT][${equipment}]`);
      content.main_workout = reject.processedContent;

      const trulyUnmatched = [...new Set(matched.unmatched)].filter(n =>
        !sweep.forcedMatches.some(f => f.original.toLowerCase() === n.toLowerCase()) &&
        !reject.substituted.some(s => s.original.toLowerCase() === n.toLowerCase())
      );
      if (trulyUnmatched.length > 0) {
        await logUnmatchedExercises(supabase as any, trulyUnmatched, "workout", `STR-${focus}-${equipment}-${difficulty}`, content.name, `[STR-MISMATCH]`);
      }

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

      const ts = Date.now();
      const focusSlug = focus.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const diffSlug = difficulty.toLowerCase().slice(0, 3);
      const workoutId = `PREM-STR-${focusSlug}-${equipment.charAt(0)}-${diffSlug}-${ts}`;

      // Image
      let imageUrl: string | null = null;
      try {
        const { data: imgData, error: imgErr } = await supabase.functions.invoke("generate-workout-image", {
          body: { name: content.name, category: "STRENGTH", format: "REPS & SETS", difficulty_stars: difficultyStars },
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
            source: "generate-strength-focus-batch",
            focus,
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
        category: "STRENGTH",
        focus,
        format: "REPS & SETS",
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
      log("✅ Created", { id: workoutId, name: content.name, focus, equipment, difficulty });
      return { ok: true, id: workoutId, name: content.name };
    } catch (e: any) {
      log(`Attempt ${attempt} failed`, { focus, equipment, difficulty, err: e.message });
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
    let focuses: FocusKey[] = ALL_FOCUSES;
    let equipments: EquipmentKey[] = ["BODYWEIGHT", "EQUIPMENT"];
    let price = 3.99;
    let tierRequired = "gold";

    try {
      const body = await req.json();
      if (body?.difficulty === "Advanced" || body?.difficulty === "Intermediate") difficulty = body.difficulty;
      if (Array.isArray(body?.focuses) && body.focuses.length) focuses = body.focuses;
      if (Array.isArray(body?.equipment) && body.equipment.length) equipments = body.equipment;
      if (typeof body?.price === "number") price = body.price;
      if (typeof body?.tier_required === "string") tierRequired = body.tier_required;
    } catch { /* no body */ }

    const jobs: Job[] = [];
    for (const focus of focuses) {
      for (const equipment of equipments) {
        jobs.push({ focus, equipment, difficulty });
      }
    }

    log("Run config", { difficulty, focuses, equipments, price, tierRequired, jobCount: jobs.length });

    // Global banned names (all workouts)
    const existingNamesAll = new Set<string>();
    const { data: allNames } = await supabase.from("admin_workouts").select("name");
    for (const w of allNames || []) existingNamesAll.add(w.name);

    // Build exercise libraries — pass difficulty to bias picks
    const libDifficulty = difficulty.toLowerCase();
    const { exercises: bodyweightExercises, referenceList: bodyweightRefList } =
      await fetchAndBuildExerciseReference(supabase, "[STR-FOCUS-BW]", "body weight", libDifficulty);
    const { exercises: fullExercises, referenceList: fullRefList } =
      await fetchAndBuildExerciseReference(supabase, "[STR-FOCUS-FULL]", undefined, libDifficulty);

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