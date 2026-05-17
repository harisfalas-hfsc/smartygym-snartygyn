import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { getDayIn84Cycle, getPeriodizationForDay } from "../_shared/periodization-84day.ts";
import { validateWodPublishContract } from "../_shared/wod-integrity.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const WOD_PRICE_EUR = 3.99;

/**
 * Ensure a library workout has a valid Stripe product + default price linked
 * before being promoted to WOD. If anything is missing, create it now.
 * Returns { stripeProductId, stripePriceId } or throws.
 */
async function ensureWodStripeAssociation(
  supabase: any,
  stripe: Stripe,
  workout: any,
  effectiveDate: string,
) {
  let productId: string | null = workout.stripe_product_id || null;
  let priceId: string | null = workout.stripe_price_id || null;
  const productImage = workout.image_url && workout.image_url.startsWith("https://") ? workout.image_url : null;

  if (!productImage) {
    throw new Error(`Library WOD ${workout.id} has no valid image_url; refusing to create a product without a picture`);
  }

  // 1. Validate or create product
  if (productId) {
    try {
      const product = await stripe.products.retrieve(productId);
      if (!product.active || !product.images?.includes(productImage)) {
        await stripe.products.update(productId, {
          active: true,
          images: [productImage],
          metadata: {
            ...product.metadata,
            project: "SMARTYGYM",
            content_type: "Workout",
            type: "wod",
            workout_id: workout.id,
            content_id: workout.id,
            equipment: workout.equipment || "",
            generated_for_date: effectiveDate,
            source: "select-wod-from-library",
          },
        });
      }
    } catch (e) {
      logStep("Existing stripe_product_id invalid - will recreate", { id: workout.id, error: (e as Error).message });
      productId = null;
      priceId = null;
    }
  }

  if (!productId) {
    const product = await stripe.products.create({
      name: workout.name,
      description: `SMARTYGYM Workout of the Day — ${workout.equipment || ""} ${workout.category || ""} ${workout.format || ""}`.trim(),
      images: [productImage],
      metadata: {
        project: "SMARTYGYM",
        content_type: "Workout",
        type: "wod",
        workout_id: workout.id,
        content_id: workout.id,
        equipment: workout.equipment || "",
        generated_for_date: effectiveDate,
        source: "select-wod-from-library",
      },
    }, {
      idempotencyKey: `SMARTYGYM:wod:${workout.id}:product`,
    });
    productId = product.id;
  }

  // 2. Validate or create price
  if (priceId) {
    try {
      const price = await stripe.prices.retrieve(priceId);
      if (!price.active || price.product !== productId) {
        priceId = null;
      }
    } catch (e) {
      logStep("Existing stripe_price_id invalid - will recreate", { id: workout.id, error: (e as Error).message });
      priceId = null;
    }
  }

  if (!priceId) {
    const price = await stripe.prices.create({
      product: productId,
      unit_amount: Math.round(WOD_PRICE_EUR * 100),
      currency: "eur",
      metadata: {
        project: "SMARTYGYM",
        content_type: "Workout",
        type: "wod",
        workout_id: workout.id,
        content_id: workout.id,
        equipment: workout.equipment || "",
        generated_for_date: effectiveDate,
        source: "select-wod-from-library",
      },
    }, {
      idempotencyKey: `SMARTYGYM:wod:${workout.id}:price:${Math.round(WOD_PRICE_EUR * 100)}:eur`,
    });
    priceId = price.id;

    await stripe.products.update(productId, { default_price: priceId });
  }

  const finalProduct = await stripe.products.retrieve(productId);
  const defaultPriceId = typeof finalProduct.default_price === "string"
    ? finalProduct.default_price
    : finalProduct.default_price?.id;
  if (defaultPriceId !== priceId || !finalProduct.images?.includes(productImage)) {
    await stripe.products.update(productId, {
      default_price: priceId,
      images: [productImage],
    });
  }

  return { stripeProductId: productId, stripePriceId: priceId };
}

function logStep(step: string, details?: any) {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SELECT-WOD-FROM-LIBRARY] ${step}${detailsStr}`);
}

function getCyprusDateStr(): string {
  const now = new Date();
  const cyprusFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Athens",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return cyprusFormatter.format(now);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" as any });

    // Determine today's date in Cyprus timezone
    let targetDate: string;
    let parsedBody: any = {};
    try {
      parsedBody = await req.json();
      targetDate = parsedBody?.targetDate || getCyprusDateStr();
    } catch {
      targetDate = getCyprusDateStr();
    }

    logStep("Starting library selection", { targetDate });

    // Get periodization for today
    const dayIn84 = getDayIn84Cycle(targetDate);
    const periodization = getPeriodizationForDay(dayIn84);
    const isRecoveryDay = periodization.category === "RECOVERY";

    logStep("Periodization", {
      dayIn84,
      category: periodization.category,
      difficulty: periodization.difficulty,
      difficultyStars: periodization.difficultyStars,
      strengthFocus: periodization.strengthFocus,
      isRecoveryDay,
    });

    // Check if WODs already exist for today
    const { data: existingWods } = await supabase
      .from("admin_workouts")
      .select("id, name, equipment")
      .eq("is_workout_of_day", true)
      .eq("generated_for_date", targetDate);

    if (existingWods && existingWods.length > 0) {
      logStep("WODs already exist for today, skipping", { count: existingWods.length });
      return new Response(
        JSON.stringify({
          success: true,
          skipped: true,
          message: `WODs already exist for ${targetDate}`,
          existing: existingWods.map(w => w.name),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // EXHAUSTION-FIRST ROTATION:
    // `wod_selection_cooldown` is treated as a permanent "ever-used" ledger.
    // A workout is only re-picked once every other eligible workout in the
    // same {category,equipment} slot has been used at least once. When the
    // slot is fully exhausted we restart from the least-recently-used.
    // New workouts the admin adds appear immediately because the candidate
    // pool is queried LIVE every invocation (no cache, no snapshot).
    const { data: cooldownWorkouts } = await supabase
      .from("wod_selection_cooldown")
      .select("source_workout_id, selected_for_date")
      .order("selected_for_date", { ascending: true });

    const cooldownIds = new Set((cooldownWorkouts || []).map(c => c.source_workout_id));
    const lastUsedAt = new Map<string, string>();
    for (const row of (cooldownWorkouts || [])) {
      lastUsedAt.set(row.source_workout_id, row.selected_for_date);
    }
    logStep("Ever-used ledger loaded", { uniqueIds: cooldownIds.size });

    const selectedWorkouts: any[] = [];

    if (isRecoveryDay) {
      // Recovery day: pick 1 workout from RECOVERY category
      const selected = await selectWorkoutCandidates(supabase, {
        category: "RECOVERY",
        difficulty: null,
        difficultyStars: null,
        equipment: null, // Any equipment for recovery
        cooldownIds,
        strengthFocus: null,
      });

      if (selected && selected.length > 0) {
        selectedWorkouts.push({ slot: "RECOVERY", candidates: selected });
      } else {
        logStep("WARNING: No recovery workout found in library");
      }
    } else {
      // Normal day: pick 1 BODYWEIGHT + 1 EQUIPMENT
      const bwSelected = await selectWorkoutCandidates(supabase, {
        category: periodization.category,
        difficulty: periodization.difficulty,
        difficultyStars: periodization.difficultyStars,
        equipment: "BODYWEIGHT",
        cooldownIds,
        strengthFocus: periodization.strengthFocus || null,
      });

      if (bwSelected && bwSelected.length > 0) {
        selectedWorkouts.push({ slot: "BODYWEIGHT", candidates: bwSelected });
      } else {
        logStep("WARNING: No BODYWEIGHT workout found for", { category: periodization.category, difficulty: periodization.difficulty });
      }

      const eqSelected = await selectWorkoutCandidates(supabase, {
        category: periodization.category,
        difficulty: periodization.difficulty,
        difficultyStars: periodization.difficultyStars,
        equipment: "EQUIPMENT",
        cooldownIds,
        strengthFocus: periodization.strengthFocus || null,
      });

      if (eqSelected && eqSelected.length > 0) {
        selectedWorkouts.push({ slot: "EQUIPMENT", candidates: eqSelected });
      } else {
        logStep("WARNING: No EQUIPMENT workout found for", { category: periodization.category, difficulty: periodization.difficulty });
      }
    }

    if (selectedWorkouts.length === 0) {
      logStep("ERROR: No workouts found in library matching criteria");
      return new Response(
        JSON.stringify({
          success: false,
          error: "No matching workouts found in library",
          criteria: {
            category: periodization.category,
            difficulty: periodization.difficulty,
            isRecoveryDay,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    let promotedCount = 0;
    const finallyPromoted: any[] = [];

    // Iterate slots; for each slot try candidates in order until one passes
    // the publish contract. This protects against pre-existing data quality
    // issues in older library workouts (missing density, raw placeholders, etc.)
    for (const slotEntry of selectedWorkouts) {
      const { slot, candidates } = slotEntry as { slot: string; candidates: any[] };
      logStep(`Trying slot ${slot} with ${candidates.length} candidate(s)`);
      let slotPromoted = false;

      for (const workout of candidates) {
        if (slotPromoted) break;
      // Guarantee a valid Stripe product + price BEFORE promoting to WOD
      let stripeProductId: string;
      let stripePriceId: string;
      try {
        const association = await ensureWodStripeAssociation(supabase, stripe, workout, targetDate);
        stripeProductId = association.stripeProductId;
        stripePriceId = association.stripePriceId;
      } catch (assocError) {
        logStep("ERROR ensuring Stripe association - skipping promotion", {
          id: workout.id,
          error: (assocError as Error).message,
        });
        continue;
      }

      const { error: updateError } = await supabase
        .from("admin_workouts")
        .update({
          is_workout_of_day: true,
          generated_for_date: targetDate,
          wod_source: "library",
          is_free: false,
          is_premium: true,
          is_standalone_purchase: true,
          price: WOD_PRICE_EUR,
          stripe_product_id: stripeProductId,
          stripe_price_id: stripePriceId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", workout.id);

      if (updateError) {
        logStep("ERROR flagging workout as WOD", { id: workout.id, error: updateError.message });
        continue;
      }

      // Re-fetch the row and apply the shared WOD publish contract.
      // Library fallback is NOT allowed to publish anything that would
      // not pass the same gate as a freshly generated WOD.
      const { data: postRow } = await supabase
        .from("admin_workouts")
        .select("id, name, equipment, category, is_workout_of_day, is_visible, main_workout, description, instructions, tips, image_url, is_standalone_purchase, price, stripe_product_id, stripe_price_id, generated_for_date")
        .eq("id", workout.id)
        .single();
      const contract = validateWodPublishContract(postRow || {}, targetDate);
      if (!contract.ok) {
        logStep("REJECT: library candidate failed publish contract - rolling back", {
          id: workout.id,
          failures: contract.failures,
        });
        await supabase
          .from("admin_workouts")
          .update({
            is_workout_of_day: false,
            generated_for_date: null,
            wod_source: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", workout.id);
        continue;
      }

      logStep("Flagged workout as WOD with payment links", {
        id: workout.id,
        name: workout.name,
        equipment: workout.equipment,
        stripeProductId,
        stripePriceId,
      });
      promotedCount++;
      slotPromoted = true;
      finallyPromoted.push(postRow);

      // Insert cooldown record for the workout we just promoted
      await supabase.from("wod_selection_cooldown").insert({
        source_workout_id: workout.id,
        selected_for_date: targetDate,
        category: workout.category || periodization.category,
        difficulty: workout.difficulty,
        equipment: workout.equipment,
      });
      } // end candidate loop

      if (!slotPromoted) {
        logStep(`SLOT FAILED: no usable candidate for ${slot} after trying ${candidates.length}`);
      }
    } // end slot loop

    const expectedCount = isRecoveryDay ? 1 : 2;
    if (promotedCount < expectedCount) {
      throw new Error(`Library fallback promoted ${promotedCount}/${expectedCount} WODs; refusing to report success without image + Stripe associations`);
    }

    // Log to wod_generation_runs
    await supabase.from("wod_generation_runs").insert({
      cyprus_date: targetDate,
      status: "success",
      expected_count: isRecoveryDay ? 1 : 2,
      found_count: promotedCount,
      is_recovery_day: isRecoveryDay,
      expected_category: periodization.category,
      trigger_source: "library-selection",
      completed_at: new Date().toISOString(),
      wods_created: finallyPromoted.map(w => ({
        id: w.id,
        name: w.name,
        equipment: w.equipment,
        source: "library",
      })),
    });

    // NOTE: Do NOT trigger any WOD-only notification here.
    // User-facing daily notifications are sent EXCLUSIVELY by the combined
    // `send-morning-notifications` job (07:00 Cyprus / 05:00 UTC), which
    // delivers the Workout of the Day and the Daily Smarty Ritual together
    // in a single email + dashboard message.

    logStep("Library selection complete", {
      selectedCount: finallyPromoted.length,
      workouts: finallyPromoted.map(w => `${w.name} (${w.equipment})`),
    });

    return new Response(
      JSON.stringify({
        success: true,
        mode: "library-selection",
        date: targetDate,
        periodization: {
          dayIn84,
          category: periodization.category,
          difficulty: periodization.difficulty,
          strengthFocus: periodization.strengthFocus,
        },
        selected: finallyPromoted.map(w => ({
          id: w.id,
          name: w.name,
          equipment: w.equipment,
          category: w.category,
        })),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

/**
 * Select a workout from the library matching the given criteria.
 * First tries exact match (category + difficulty + equipment).
 * If strengthFocus is provided, tries to match focus first then falls back.
 * If all candidates are in cooldown, picks the one used longest ago.
 */
async function selectWorkout(
  supabase: any,
  params: {
    category: string;
    difficulty: string | null;
    difficultyStars: [number, number] | null;
    equipment: string | null;
    cooldownIds: Set<string>;
    strengthFocus: string | null;
  }
): Promise<any | null> {
  const list = await selectWorkoutCandidates(supabase, params);
  return list && list.length > 0 ? list[0] : null;
}

/**
 * Like selectWorkout but returns a *prioritised list* of all valid candidates,
 * highest-priority first. The caller can then iterate and skip any that fail
 * the publish contract — so a single broken library workout never fails the slot.
 */
async function selectWorkoutCandidates(
  supabase: any,
  params: {
    category: string;
    difficulty: string | null;
    difficultyStars: [number, number] | null;
    equipment: string | null;
    cooldownIds: Set<string>;
    strengthFocus: string | null;
  }
): Promise<any[]> {
  const { category, difficulty, difficultyStars, equipment, cooldownIds, strengthFocus } = params;

  logStep("Selecting candidate list", { category, difficulty, equipment, strengthFocus, cooldownSize: cooldownIds.size });

  // Build base query
  let query = supabase
    .from("admin_workouts")
    .select("*")
    .eq("category", category)
    .eq("is_workout_of_day", false)
    .eq("is_visible", true);

  // Filter by equipment if specified
  if (equipment) {
    query = query.eq("equipment", equipment);
  }

  // Filter by difficulty range using stars
  if (difficultyStars) {
    query = query.gte("difficulty_stars", difficultyStars[0]).lte("difficulty_stars", difficultyStars[1]);
  }

  const { data: candidates, error } = await query;

  if (error) {
    logStep("Error querying candidates", { error: error.message });
    return [];
  }

  let pool: any[] = candidates || [];

  if (pool.length === 0) {
    logStep("No candidates found, trying without difficulty filter");
    let fallbackQuery = supabase
      .from("admin_workouts")
      .select("*")
      .eq("category", category)
      .eq("is_workout_of_day", false)
      .eq("is_visible", true);
    if (equipment) fallbackQuery = fallbackQuery.eq("equipment", equipment);
    const { data: fallbackCandidates } = await fallbackQuery;
    pool = fallbackCandidates || [];
    if (pool.length === 0) {
      logStep("No candidates even without difficulty filter");
      return [];
    }
  }

  // Split: outside cooldown first, then in cooldown (so we still try them
  // before giving up on the slot if all fresh candidates are broken).
  const outOfCooldown = pool.filter(c => !cooldownIds.has(c.id));
  const inCooldown = pool.filter(c => cooldownIds.has(c.id));

  // Optional focus prioritisation within out-of-cooldown
  let prioritised = outOfCooldown;
  if (strengthFocus && outOfCooldown.length > 1) {
    const focusMatch = outOfCooldown.filter(c =>
      c.focus && c.focus.toUpperCase().includes(strengthFocus.toUpperCase())
    );
    if (focusMatch.length > 0) {
      const others = outOfCooldown.filter(c => !focusMatch.includes(c));
      prioritised = [...focusMatch, ...others];
    }
  }

  // Shuffle within priority bucket so we don't always pick the same one
  const shuffle = (arr: any[]) => arr.map(v => [Math.random(), v] as const).sort((a,b) => a[0]-b[0]).map(([,v]) => v);
  const ordered = [...shuffle(prioritised), ...shuffle(inCooldown)];

  logStep("Candidate list built", { total: ordered.length, outOfCooldown: outOfCooldown.length, inCooldown: inCooldown.length });
  return ordered;
}

/**
 * Pick best candidate from a list, preferring those not in cooldown.
 * If strengthFocus is provided, prefer workouts matching that focus.
 */
async function pickFromCandidates(
  supabase: any,
  candidates: any[],
  cooldownIds: Set<string>,
  strengthFocus: string | null
): Promise<any | null> {
  // Split candidates: those outside cooldown vs inside
  const available = candidates.filter(c => !cooldownIds.has(c.id));
  const inCooldown = candidates.filter(c => cooldownIds.has(c.id));

  logStep("Candidate split", { available: available.length, inCooldown: inCooldown.length });

  let pool = available.length > 0 ? available : candidates;

  // If strengthFocus, try to match focus first
  if (strengthFocus && pool.length > 1) {
    const focusMatch = pool.filter(c => 
      c.focus && c.focus.toUpperCase().includes(strengthFocus.toUpperCase())
    );
    if (focusMatch.length > 0) {
      pool = focusMatch;
      logStep("Narrowed by strength focus", { focus: strengthFocus, count: pool.length });
    }
  }

  // If all candidates are in cooldown, pick the one used longest ago
  if (available.length === 0 && inCooldown.length > 0) {
    logStep("All candidates in cooldown, picking oldest-used");
    
    // Get cooldown records with dates to find the oldest
    const { data: cooldownRecords } = await supabase
      .from("wod_selection_cooldown")
      .select("source_workout_id, selected_for_date")
      .in("source_workout_id", candidates.map(c => c.id))
      .order("selected_for_date", { ascending: true });

    if (cooldownRecords && cooldownRecords.length > 0) {
      // Pick the candidate whose most recent cooldown entry is oldest
      const oldestId = cooldownRecords[0].source_workout_id;
      const oldest = candidates.find(c => c.id === oldestId);
      if (oldest) return oldest;
    }
  }

  // Random selection from available pool
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}
