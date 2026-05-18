/**
 * STRENGTH LIBRARY BATCH — per-item processor.
 *
 * Picks the oldest pending row from `strength_library_batch`, generates ONE
 * premium Strength workout end-to-end (AI content → sanitize → quality gate →
 * library-first exercise linking → name clean → insert → image → Stripe
 * product + price) and updates the queue row.
 *
 * Designed to run from cron once per minute so 24 specs drain in ~30 min,
 * each well inside the 150s Edge timeout.
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { Image } from "https://deno.land/x/imagescript@1.2.17/mod.ts";

import {
  fetchAndBuildExerciseReference,
  processContentSectionAware,
  rejectNonLibraryExercises,
  guaranteeAllExercisesLinked,
} from "../_shared/exercise-matching.ts";
import { sanitizeProtocolBlocks, validateProtocolBlocks } from "../_shared/protocol-sanitizer.ts";
import { validateWodSections } from "../_shared/section-validator.ts";
import { applyWodQualityGate } from "../_shared/wod-quality-gate.ts";
import { cleanPublicWorkoutName } from "../_shared/wod/naming.ts";
import { normalizeWorkoutHtml } from "../_shared/html-normalizer.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FOCUS_GUIDANCE: Record<string, { muscles: string; patterns: string; forbidden: string }> = {
  "LOWER BODY": { muscles: "quads, hamstrings, glutes, calves", patterns: "squat, lunge, hinge, step-up, calf raise", forbidden: "heavy pressing or pulling for upper body" },
  "UPPER BODY": { muscles: "chest, back, shoulders, arms", patterns: "horizontal/vertical push, horizontal/vertical pull, curl, extension", forbidden: "loaded squats, deadlifts, lunges" },
  "FULL BODY": { muscles: "all major muscle groups", patterns: "compound lifts blending push, pull, squat, hinge", forbidden: "isolation-only programming" },
  "LOW PUSH & UPPER PULL": { muscles: "quads, glutes (push) + lats, mid back, rear delts (pull)", patterns: "squat, lunge, leg press paired with row, pull-up, face pull", forbidden: "loaded hip hinge, vertical pressing" },
  "LOW PULL & UPPER PUSH": { muscles: "hamstrings, glutes, lower back (pull) + chest, shoulders, triceps (push)", patterns: "deadlift, RDL, hip thrust paired with bench, overhead press, dip", forbidden: "loaded squats, lat pulldowns/rows" },
  "CORE & GLUTES": { muscles: "rectus abdominis, obliques, transverse abdominis, gluteus max/med/min", patterns: "anti-extension, anti-rotation, hip thrust, abduction, bridge variations", forbidden: "heavy compound lifts unrelated to core/glute focus" },
};

function difficultyLabel(stars: number) {
  if (stars <= 2) return "Beginner";
  if (stars <= 4) return "Intermediate";
  return "Advanced";
}

function setRepGuidance(stars: number) {
  if (stars <= 2) return "3 sets × 10-12 reps, 60-90s rest, tempo 3-1-1-0";
  if (stars <= 4) return "4 sets × 8-10 reps, 90-120s rest, tempo 3-1-1-0";
  return "4-5 sets × 5-8 reps, 120-180s rest, tempo 4-1-1-0";
}

function buildPrompt(focus: string, equipment: string, stars: number, exerciseReference: string, existingNames: string[]) {
  const g = FOCUS_GUIDANCE[focus];
  const diff = difficultyLabel(stars);
  const equipText = equipment === "BODYWEIGHT" ? "BODYWEIGHT only (no machines, dumbbells, barbells; bands/pull-up bar allowed)" : "EQUIPMENT (dumbbells, barbells, kettlebells, machines, cables, bands all allowed)";

  return `You are a senior Strength & Conditioning coach for SmartyGym, designing ONE premium library workout.

═══════════════════════════════════════════════════════════════════════════════
SPECIFICATION (must follow EXACTLY)
═══════════════════════════════════════════════════════════════════════════════
• Category: STRENGTH
• Focus: ${focus}
• Equipment: ${equipText}
• Difficulty: ${diff} (${stars} stars out of 6)
• Format: REPS & SETS
• Target muscles: ${g.muscles}
• Movement patterns: ${g.patterns}
• Forbidden on this workout: ${g.forbidden}
• Set/rep prescription: ${setRepGuidance(stars)}

═══════════════════════════════════════════════════════════════════════════════
NAMING RULES (CRITICAL)
═══════════════════════════════════════════════════════════════════════════════
• 2-4 words, professional, motivating, clearly indicates body area.
• Examples for ${focus}: "Lower Body Iron Foundation", "Upper Body Forge", "Total Body Strength Flow", "Push Pull Hybrid Power", "Hinge & Press Builder", "Core & Glute Stabilizer".
• FORBIDDEN words: Axial, Matrix, Meridian, Protocol, Helix, Arcus, Synergy, Conduit, Integration, Current, Vector, Quantum, Algorithm, Neural, System, Module, Phase, Sequence.
• FORBIDDEN suffixes: any numbers, Roman numerals, v1/v2, internal codes like 0725BW.
• MUST be unique. Existing names to avoid: ${existingNames.slice(0, 80).join(", ")}.

═══════════════════════════════════════════════════════════════════════════════
EXERCISE LIBRARY (use ONLY these — reference by exact name; the system will link them)
═══════════════════════════════════════════════════════════════════════════════
${exerciseReference}

═══════════════════════════════════════════════════════════════════════════════
STRUCTURE — 5 SECTIONS REQUIRED, EACH PREFIXED WITH ITS ICON
═══════════════════════════════════════════════════════════════════════════════
Build "main_workout" as a single HTML string containing ALL FIVE sections in this exact order:

1. 🧽 Soft Tissue Preparation 5' — foam roll / mobility prep.
2. 🔥 Activation 5' — dynamic activation drills (bird dog, glute bridge, scap pulls, etc.).
3. 💪 Main Workout (REPS & SETS) — minimum 4 strength exercises, each with explicit sets × reps × tempo × rest. Group as "<strong>Exercise 1:</strong>" then bullet "4 sets x 8 reps {{exercise:ID:Name}} — Tempo 3-1-1-0, Rest 90s".
4. ⚡ Finisher — short structural protocol (e.g. "3 rounds for time", "AMRAP 8 min", "EMOM 6 min") with 2-4 exercises, every line with measurable prescription BEFORE the exercise token.
5. 🧘 Cool Down 5' — static stretching for trained muscles.

Formatting rules (memory: workout-structure-exact-format):
• Every <p> uses class="tiptap-paragraph"; every <ul> uses class="tiptap-bullet-list"; every <li> uses class="tiptap-list-item".
• Section headers: <p class="tiptap-paragraph">[ICON] <strong><u>Section Name [duration]</u></strong></p>
• ALL exercises wrapped in {{exercise:EXERCISE_ID:Exercise Name}} tokens — use EXACT IDs from the library above.
• Bullet lists for exercises, NEVER numbered lists, NEVER <br> separators.
• Empty <p class="tiptap-paragraph"></p> between sections.
• Reps/sets/tempo/rest BEFORE the exercise token, e.g. "4 sets x 8 reps {{exercise:0123:Back Squat}} — Tempo 3-1-1-0, Rest 120s".
• Finisher protocol headers must NOT contain durations (write "Finisher (AMRAP)" not "Finisher (AMRAP 8')"; durations live in body bullets like "AMRAP 8 minutes:" as separate paragraph).

═══════════════════════════════════════════════════════════════════════════════
OUTPUT FORMAT — STRICT JSON, NO MARKDOWN FENCES
═══════════════════════════════════════════════════════════════════════════════
{
  "name": "...",
  "description": "2-3 sentence plain-text description of what this workout trains and why.",
  "main_workout": "<full 5-section HTML as specified above>",
  "instructions": "<p class=\\"tiptap-paragraph\\">3-5 sentences in HTML explaining how to execute the session: pacing, load selection, rest discipline, form priorities.</p>",
  "tips": "<p class=\\"tiptap-paragraph\\">3-5 coaching cues as separate sentences or <br> lines covering technique, breathing, progression.</p>"
}

Return ONLY the JSON object. No prose, no markdown fences.`;
}

async function callLovableAI(prompt: string, apiKey: string): Promise<string> {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-pro",
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`AI gateway ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

function extractJson(text: string): any {
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object in AI response");
  return JSON.parse(cleaned.slice(start, end + 1));
}

async function generateImage(supabase: any, name: string, equipment: string, stars: number, apiKey: string): Promise<string> {
  const diff = difficultyLabel(stars).toLowerCase();
  const equipScene = equipment === "BODYWEIGHT"
    ? "calisthenics-style strength training in a clean gym or studio, using only bodyweight, parallel bars, or pull-up bar"
    : "loaded strength training in a professional gym with dumbbells, barbells, racks, plates, and benches";
  const prompt = `Generate a high-quality photographic image for a SmartyGym premium strength workout titled "${name}".
- Athletic ${diff}-level person performing ${equipScene}.
- Strong, focused, mid-execution lifting pose; proper form; muscle engagement visible.
- Modern gym lighting with deep navy (#0F172A) and electric blue (#29B6D2) tones blended naturally; cinematic, professional.
- No text, no writing, no watermarks, no logos anywhere on the image.
- 16:9 horizontal composition, sharp focus, premium magazine quality.`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash-image-preview",
      messages: [{ role: "user", content: prompt }],
      modalities: ["image", "text"],
    }),
  });
  if (!res.ok) throw new Error(`Image gen ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const b64 = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (!b64) throw new Error("No image returned");

  const raw = b64.replace(/^data:image\/\w+;base64,/, "");
  const buf = Uint8Array.from(atob(raw), (c) => c.charCodeAt(0));

  let upload: Uint8Array = buf, ext = "png", ct = "image/png";
  try {
    const decoded = await Image.decode(buf);
    if (decoded.width > 800) decoded.resize(800, Image.RESIZE_AUTO);
    upload = await decoded.encodeJPEG(82);
    ext = "jpg"; ct = "image/jpeg";
  } catch (_) { /* fallback to png */ }

  const fileName = `workout-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error: upErr } = await supabase.storage.from("avatars").upload(`workout-covers/${fileName}`, upload, { contentType: ct, upsert: false });
  if (upErr) throw upErr;
  const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(`workout-covers/${fileName}`);
  return urlData.publicUrl;
}

async function createStripe(name: string, imageUrl: string, focus: string, equipment: string, stars: number, workoutId: string): Promise<{ product_id: string; price_id: string }> {
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2025-08-27.basil" });
  const product = await stripe.products.create({
    name,
    description: `Workout: ${name}`,
    images: imageUrl ? [imageUrl] : undefined,
    metadata: {
      project: "SMARTYGYM",
      content_type: "Workout",
      workout_id: workoutId,
      focus,
      equipment,
      difficulty_stars: String(stars),
      category: "STRENGTH",
    },
  });
  const price = await stripe.prices.create({ product: product.id, unit_amount: 399, currency: "eur" });
  return { product_id: product.id, price_id: price.id };
}

function makeWorkoutId(focus: string, equipment: string, stars: number): string {
  const focusSlug = focus.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `str-${focusSlug}-${equipment.toLowerCase()}-${stars}s-${Date.now().toString(36)}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const log = (...a: any[]) => console.log("[STRENGTH-BATCH]", ...a);

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_KEY = Deno.env.get("LOVABLE_API_KEY")!;
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // Optional: specific spec id, otherwise pick the oldest pending
    let specId: string | null = null;
    try { specId = (await req.json())?.spec_id || null; } catch {}

    // Atomic claim: select + update one pending row to processing
    const { data: candidate } = specId
      ? await supabase.from("strength_library_batch").select("*").eq("id", specId).eq("status", "pending").maybeSingle()
      : await supabase.from("strength_library_batch").select("*").eq("status", "pending").order("created_at", { ascending: true }).limit(1).maybeSingle();

    if (!candidate) {
      return new Response(JSON.stringify({ ok: true, message: "No pending specs" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { error: claimErr } = await supabase
      .from("strength_library_batch")
      .update({ status: "processing", started_at: new Date().toISOString(), attempts: (candidate.attempts || 0) + 1 })
      .eq("id", candidate.id)
      .eq("status", "pending");
    if (claimErr) throw new Error(`Claim failed: ${claimErr.message}`);

    const spec = candidate;
    log("Claimed spec", { id: spec.id, focus: spec.focus, equipment: spec.equipment, stars: spec.difficulty_stars });

    const failSpec = async (msg: string) => {
      await supabase.from("strength_library_batch").update({ status: "failed", last_error: msg.slice(0, 1500), completed_at: new Date().toISOString() }).eq("id", spec.id);
      return new Response(JSON.stringify({ ok: false, spec_id: spec.id, error: msg }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    };

    try {
      // 1) Exercise reference filtered by equipment
      const equipFilter = spec.equipment === "BODYWEIGHT" ? "body weight" : undefined;
      const { exercises, referenceList } = await fetchAndBuildExerciseReference(supabase, "[STR-BATCH]", equipFilter, difficultyLabel(spec.difficulty_stars));
      if (!exercises.length) throw new Error("Empty exercise library");

      // 2) Existing names for uniqueness
      const { data: existingRows } = await supabase.from("admin_workouts").select("name");
      const existingNames = (existingRows || []).map((r: any) => r.name).filter(Boolean);

      // 3) AI generation
      const prompt = buildPrompt(spec.focus, spec.equipment, spec.difficulty_stars, referenceList, existingNames);
      const raw = await callLovableAI(prompt, LOVABLE_KEY);
      const ai = extractJson(raw);
      if (!ai.name || !ai.main_workout) throw new Error("AI response missing name or main_workout");

      // 4) Process exercise tokens (library-first)
      let main: string = ai.main_workout;
      const matched = processContentSectionAware(main, exercises, "[STR-BATCH][MATCH]");
      main = matched.processedContent;
      const linked = guaranteeAllExercisesLinked(main, exercises, "[STR-BATCH][LINK]");
      main = linked.processedContent;
      const rejected = rejectNonLibraryExercises(main, exercises, "[STR-BATCH][REJECT]");
      main = rejected.processedContent;

      // 5) Sanitize protocols + normalize html
      const sanitized = sanitizeProtocolBlocks(main);
      main = normalizeWorkoutHtml(sanitized.cleaned);

      // 6) Section + protocol + quality gate validation
      const secVal = validateWodSections(main, false);
      if (!secVal.isComplete || !secVal.hasMinimumExercises) {
        throw new Error(`Sections invalid: missing=${secVal.missingIcons.join(",")} issues=${secVal.exerciseContentIssues.join("|")}`);
      }
      const protoIssues = validateProtocolBlocks(main);
      if (protoIssues.length) throw new Error(`Protocol violations: ${protoIssues.join(" | ")}`);
      const gate = applyWodQualityGate({ mainWorkoutHtml: main, category: "STRENGTH", difficultyStars: spec.difficulty_stars, format: "REPS & SETS", isRecoveryDay: false });
      if (!gate.ok) throw new Error(`Quality gate failed: ${gate.failures.join(" | ")}`);

      // 7) Clean name
      const cleaned = cleanPublicWorkoutName(ai.name, "STRENGTH", spec.equipment, existingNames);
      const finalName = cleaned.name;

      // 8) Insert workout row
      const workoutId = makeWorkoutId(spec.focus, spec.equipment, spec.difficulty_stars);
      const { error: insErr } = await supabase.from("admin_workouts").insert({
        id: workoutId,
        name: finalName,
        type: "workout",
        category: "STRENGTH",
        focus: spec.focus,
        equipment: spec.equipment,
        difficulty: difficultyLabel(spec.difficulty_stars),
        difficulty_stars: spec.difficulty_stars,
        format: "REPS & SETS",
        description: ai.description || `Premium ${spec.focus.toLowerCase()} strength session.`,
        main_workout: main,
        instructions: ai.instructions || "",
        tips: ai.tips || "",
        warm_up: "",
        cool_down: "",
        is_premium: true,
        is_standalone_purchase: true,
        is_free: false,
        is_visible: true,
        is_workout_of_day: false,
        is_ai_generated: true,
        price: 3.99,
        wod_source: "strength-library-batch",
      });
      if (insErr) throw new Error(`Insert failed: ${insErr.message}`);

      // 9) Image generation + save
      const imageUrl = await generateImage(supabase, finalName, spec.equipment, spec.difficulty_stars, LOVABLE_KEY);
      await supabase.from("admin_workouts").update({ image_url: imageUrl }).eq("id", workoutId);

      // 10) Stripe product + price
      const stripe = await createStripe(finalName, imageUrl, spec.focus, spec.equipment, spec.difficulty_stars, workoutId);
      await supabase.from("admin_workouts").update({ stripe_product_id: stripe.product_id, stripe_price_id: stripe.price_id }).eq("id", workoutId);

      // 11) Mark queue complete
      await supabase.from("strength_library_batch").update({
        status: "completed",
        workout_id: workoutId,
        workout_name: finalName,
        image_url: imageUrl,
        stripe_product_id: stripe.product_id,
        stripe_price_id: stripe.price_id,
        last_error: null,
        completed_at: new Date().toISOString(),
      }).eq("id", spec.id);

      log("Completed", { workoutId, name: finalName });
      return new Response(JSON.stringify({ ok: true, workout_id: workoutId, name: finalName, focus: spec.focus, equipment: spec.equipment, stars: spec.difficulty_stars, stripe_product_id: stripe.product_id }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    } catch (err: any) {
      log("Failure", err?.message || err);
      return await failSpec(err?.message || String(err));
    }
  } catch (err: any) {
    console.error("[STRENGTH-BATCH] Top-level error", err);
    return new Response(JSON.stringify({ ok: false, error: err?.message || String(err) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});