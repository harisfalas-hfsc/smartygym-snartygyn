/**
 * STRENGTH LIBRARY BATCH — 10-point verifier.
 * Runs the audit per completed item and returns a row-by-row pass/fail table.
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { hasInternalNameCode, hasAiStyleName } from "../_shared/wod/naming.ts";
import { applyWodQualityGate } from "../_shared/wod-quality-gate.ts";
import { validateWodSections } from "../_shared/section-validator.ts";
import { validateProtocolBlocks } from "../_shared/protocol-sanitizer.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2025-08-27.basil" });

    const { data: rows } = await supabase
      .from("strength_library_batch")
      .select("*")
      .order("focus, equipment, difficulty_stars");

    const results: any[] = [];
    let allPass = 0, anyFail = 0;

    for (const r of rows || []) {
      const checks: Record<string, boolean | string> = {};
      const fail = (k: string, why: string) => { checks[k] = `❌ ${why}`; };
      const pass = (k: string) => { checks[k] = "✅"; };

      checks["queue_status"] = r.status === "completed" ? "✅" : `❌ ${r.status}`;
      if (!r.workout_id) { fail("workout_row", "no workout_id"); results.push({ id: r.id, focus: r.focus, equipment: r.equipment, stars: r.difficulty_stars, name: r.workout_name, checks }); anyFail++; continue; }

      const { data: w } = await supabase.from("admin_workouts").select("*").eq("id", r.workout_id).maybeSingle();
      if (!w) { fail("workout_row", "row missing"); results.push({ id: r.id, focus: r.focus, equipment: r.equipment, stars: r.difficulty_stars, name: r.workout_name, checks }); anyFail++; continue; }
      pass("workout_row");

      w.category === "STRENGTH" && w.focus === r.focus && w.equipment === r.equipment && w.difficulty_stars === r.difficulty_stars ? pass("spec_match") : fail("spec_match", `${w.category}/${w.focus}/${w.equipment}/${w.difficulty_stars}`);
      (w.is_premium && w.is_standalone_purchase && Number(w.price) === 3.99) ? pass("premium_flags") : fail("premium_flags", `prem=${w.is_premium} stand=${w.is_standalone_purchase} price=${w.price}`);
      (w.image_url && w.image_url.startsWith("https://")) ? pass("image_url") : fail("image_url", "missing or not https");

      const nameClean = w.name && !hasInternalNameCode(w.name) && !hasAiStyleName(w.name);
      nameClean ? pass("name_clean") : fail("name_clean", `"${w.name}"`);

      (w.main_workout && w.instructions && w.tips && w.description) ? pass("content_fields") : fail("content_fields", "missing sections");

      const sv = validateWodSections(w.main_workout || "", false);
      (sv.isComplete && sv.hasMinimumExercises) ? pass("sections") : fail("sections", `missing=${sv.missingIcons.join(",")}`);

      const pv = validateProtocolBlocks(w.main_workout || "");
      pv.length === 0 ? pass("protocols") : fail("protocols", pv.slice(0,2).join("|"));

      const gate = applyWodQualityGate({ mainWorkoutHtml: w.main_workout || "", category: "STRENGTH", difficultyStars: w.difficulty_stars, format: "REPS & SETS", isRecoveryDay: false });
      gate.ok ? pass("quality_gate") : fail("quality_gate", gate.failures.slice(0,1).join("|"));

      (w.stripe_product_id && w.stripe_price_id) ? pass("stripe_ids") : fail("stripe_ids", "missing");

      if (w.stripe_product_id) {
        try {
          const prod = await stripe.products.retrieve(w.stripe_product_id);
          const price = w.stripe_price_id ? await stripe.prices.retrieve(w.stripe_price_id) : null;
          const meta = prod.metadata || {};
          const okStripe = prod.active && (prod.images?.length || 0) > 0 && meta.project === "SMARTYGYM" && meta.content_type === "Workout" && price?.unit_amount === 399 && price?.currency === "eur";
          okStripe ? pass("stripe_live") : fail("stripe_live", `active=${prod.active} imgs=${prod.images?.length} meta=${JSON.stringify(meta)} amt=${price?.unit_amount}`);
        } catch (e: any) { fail("stripe_live", e.message); }
      } else { fail("stripe_live", "no product id"); }

      const isFail = Object.values(checks).some((v) => typeof v === "string" && v.startsWith("❌"));
      if (isFail) anyFail++; else allPass++;

      results.push({ id: r.id, focus: r.focus, equipment: r.equipment, stars: r.difficulty_stars, name: w.name, workout_id: w.id, stripe_product_id: w.stripe_product_id, checks });
    }

    return new Response(JSON.stringify({
      total: rows?.length || 0,
      passed: allPass,
      failed: anyFail,
      all_green: anyFail === 0 && allPass === (rows?.length || 0),
      results,
    }, null, 2), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || String(err) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});