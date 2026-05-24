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

function log(step: string, details?: any) {
  const s = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[PREVIEW-TOMORROW-WOD] ${step}${s}`);
}

function getCyprusDateStr(offsetDays = 0): string {
  const now = new Date();
  now.setUTCDate(now.getUTCDate() + offsetDays);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Athens",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

async function selectCandidates(
  supabase: any,
  params: {
    category: string;
    difficultyStars: [number, number] | null;
    equipment: string | null;
    cooldownIds: Set<string>;
    lastUsedAt: Map<string, string>;
    strengthFocus: string | null;
  }
): Promise<any[]> {
  const { category, difficultyStars, equipment, cooldownIds, lastUsedAt, strengthFocus } = params;

  let query = supabase
    .from("admin_workouts")
    .select("*")
    .eq("category", category)
    .eq("is_workout_of_day", false)
    .eq("is_visible", true)
    .eq("is_premium", true)
    .eq("is_free", false)
    .not("main_workout", "is", null)
    .ilike("image_url", "https://%");
  if (equipment) query = query.eq("equipment", equipment);
  if (difficultyStars) {
    query = query
      .gte("difficulty_stars", difficultyStars[0])
      .lte("difficulty_stars", difficultyStars[1]);
  }
  const { data: candidates } = await query;
  const pool: any[] = candidates || [];

  if (pool.length === 0) {
    log("No preview candidates found with exact periodization filters; refusing difficulty fallback", {
      category,
      difficultyStars,
      equipment,
    });
    return [];
  }

  const neverUsed = pool.filter((c) => !cooldownIds.has(c.id));
  const alreadyUsed = pool.filter((c) => cooldownIds.has(c.id));

  let prioritised = neverUsed;
  if (strengthFocus && neverUsed.length > 1) {
    const fm = neverUsed.filter(
      (c) => c.focus && c.focus.toUpperCase().includes(strengthFocus.toUpperCase())
    );
    if (fm.length > 0) prioritised = [...fm, ...neverUsed.filter((c) => !fm.includes(c))];
  }

  const shuffle = (a: any[]) =>
    a
      .map((v) => [Math.random(), v] as const)
      .sort((x, y) => x[0] - y[0])
      .map(([, v]) => v);

  const recycled = [...alreadyUsed].sort((a, b) => {
    const da = lastUsedAt.get(a.id) || "0000-00-00";
    const db = lastUsedAt.get(b.id) || "0000-00-00";
    return da.localeCompare(db);
  });

  return [...shuffle(prioritised), ...recycled];
}

async function loadCooldown(supabase: any) {
  const { data } = await supabase
    .from("wod_selection_cooldown")
    .select("source_workout_id, selected_for_date")
    .order("selected_for_date", { ascending: true });
  const ids = new Set<string>((data || []).map((c: any) => c.source_workout_id));
  const last = new Map<string, string>();
  for (const row of data || []) last.set(row.source_workout_id, row.selected_for_date);
  return { ids, last };
}

async function buildPreviewForDate(supabase: any, targetDate: string) {
  const dayIn84 = getDayIn84Cycle(targetDate);
  const p = getPeriodizationForDay(dayIn84);
  const isRecovery = p.category === "RECOVERY";
  const { ids: cooldownIds, last: lastUsedAt } = await loadCooldown(supabase);

  let bodyweightId: string | null = null;
  let equipmentId: string | null = null;
  let recoveryId: string | null = null;

  if (isRecovery) {
    const cands = await selectCandidates(supabase, {
      category: "RECOVERY",
      difficultyStars: null,
      equipment: null,
      cooldownIds,
      lastUsedAt,
      strengthFocus: null,
    });
    recoveryId = cands[0]?.id || null;
  } else {
    const bw = await selectCandidates(supabase, {
      category: p.category,
      difficultyStars: p.difficultyStars as [number, number] | null,
      equipment: "BODYWEIGHT",
      cooldownIds,
      lastUsedAt,
      strengthFocus: p.strengthFocus || null,
    });
    const eq = await selectCandidates(supabase, {
      category: p.category,
      difficultyStars: p.difficultyStars as [number, number] | null,
      equipment: "EQUIPMENT",
      cooldownIds,
      lastUsedAt,
      strengthFocus: p.strengthFocus || null,
    });
    bodyweightId = bw[0]?.id || null;
    equipmentId = eq[0]?.id || null;
  }

  return {
    date: targetDate,
    bodyweight_workout_id: bodyweightId,
    equipment_workout_id: equipmentId,
    recovery_workout_id: recoveryId,
    is_recovery_day: isRecovery,
    category: p.category,
    difficulty: p.difficulty,
    difficulty_stars_min: p.difficultyStars?.[0] ?? null,
    difficulty_stars_max: p.difficultyStars?.[1] ?? null,
    picked_at: new Date().toISOString(),
    picked_by: "cron",
    status: "pending" as const,
    approved_by: null,
    approved_at: null,
  };
}

async function ensureWodStripe(supabase: any, stripe: Stripe, workout: any, effectiveDate: string) {
  let productId: string | null = workout.stripe_product_id || null;
  let priceId: string | null = workout.stripe_price_id || null;
  const productImage = workout.image_url && workout.image_url.startsWith("https://") ? workout.image_url : null;
  if (!productImage) throw new Error(`Library WOD ${workout.id} has no valid image_url`);

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
            source: "preview-tomorrow-wod",
          },
        });
      }
    } catch {
      productId = null;
      priceId = null;
    }
  }

  if (!productId) {
    const product = await stripe.products.create(
      {
        name: workout.name,
        description:
          `SMARTYGYM Workout of the Day — ${workout.equipment || ""} ${workout.category || ""} ${workout.format || ""}`.trim(),
        images: [productImage],
        metadata: {
          project: "SMARTYGYM",
          content_type: "Workout",
          type: "wod",
          workout_id: workout.id,
          content_id: workout.id,
          equipment: workout.equipment || "",
          generated_for_date: effectiveDate,
          source: "preview-tomorrow-wod",
        },
      },
      { idempotencyKey: `SMARTYGYM:wod:${workout.id}:product` }
    );
    productId = product.id;
  }

  if (priceId) {
    try {
      const price = await stripe.prices.retrieve(priceId);
      if (!price.active || price.product !== productId) priceId = null;
    } catch {
      priceId = null;
    }
  }
  if (!priceId) {
    const price = await stripe.prices.create(
      {
        product: productId!,
        unit_amount: Math.round(WOD_PRICE_EUR * 100),
        currency: "eur",
        metadata: {
          project: "SMARTYGYM",
          content_type: "Workout",
          type: "wod",
          workout_id: workout.id,
        },
      },
      { idempotencyKey: `SMARTYGYM:wod:${workout.id}:price:${Math.round(WOD_PRICE_EUR * 100)}:eur` }
    );
    priceId = price.id;
    await stripe.products.update(productId!, { default_price: priceId });
  }
  return { stripeProductId: productId!, stripePriceId: priceId! };
}

async function promoteToWod(supabase: any, stripe: Stripe, workoutId: string, targetDate: string) {
  const { data: workout } = await supabase
    .from("admin_workouts")
    .select("*")
    .eq("id", workoutId)
    .single();
  if (!workout) throw new Error(`Workout ${workoutId} not found`);

  const assoc = await ensureWodStripe(supabase, stripe, workout, targetDate);

  await supabase
    .from("admin_workouts")
    .update({
      is_workout_of_day: true,
      generated_for_date: targetDate,
      wod_source: "library",
      is_free: false,
      is_premium: true,
      is_standalone_purchase: true,
      price: WOD_PRICE_EUR,
      stripe_product_id: assoc.stripeProductId,
      stripe_price_id: assoc.stripePriceId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", workoutId);

  const { data: postRow } = await supabase
    .from("admin_workouts")
    .select(
      "id, name, equipment, category, is_workout_of_day, is_visible, main_workout, description, instructions, tips, image_url, is_standalone_purchase, price, stripe_product_id, stripe_price_id, generated_for_date"
    )
    .eq("id", workoutId)
    .single();
  const contract = validateWodPublishContract(postRow || {}, targetDate);
  if (!contract.ok) {
    await supabase
      .from("admin_workouts")
      .update({
        is_workout_of_day: false,
        generated_for_date: null,
        wod_source: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", workoutId);
    throw new Error(`Publish contract failed: ${contract.failures.join("; ")}`);
  }

  await supabase.from("wod_selection_cooldown").insert({
    source_workout_id: workoutId,
    selected_for_date: targetDate,
    category: workout.category,
    difficulty: workout.difficulty,
    equipment: workout.equipment,
  });

  return postRow;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil" as any,
    });

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const action = (body.action || "preview") as
      | "preview"
      | "repick"
      | "set"
      | "approve"
      | "reject"
      | "list";
    const targetDate: string = body.date || getCyprusDateStr(1);

    log("Invocation", { action, targetDate });

    if (action === "preview" || action === "repick") {
      const preview = await buildPreviewForDate(supabase, targetDate);
      if (action === "repick") preview.picked_by = "admin";
      const { error } = await supabase
        .from("wod_tomorrow_preview")
        .upsert(preview, { onConflict: "date" });
      if (error) throw error;
      return new Response(JSON.stringify({ success: true, preview }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "set") {
      const slot = body.slot as "bodyweight" | "equipment" | "recovery";
      const workoutId = body.workoutId as string;
      if (!slot || !workoutId) throw new Error("slot and workoutId required");
      const col =
        slot === "bodyweight"
          ? "bodyweight_workout_id"
          : slot === "equipment"
            ? "equipment_workout_id"
            : "recovery_workout_id";
      const { data: existing } = await supabase
        .from("wod_tomorrow_preview")
        .select("*")
        .eq("date", targetDate)
        .maybeSingle();
      if (!existing) {
        const preview = await buildPreviewForDate(supabase, targetDate);
        (preview as any)[col] = workoutId;
        preview.picked_by = "admin";
        await supabase
          .from("wod_tomorrow_preview")
          .upsert(preview, { onConflict: "date" });
      } else {
        await supabase
          .from("wod_tomorrow_preview")
          .update({ [col]: workoutId, picked_by: "admin", status: "pending" })
          .eq("date", targetDate);
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "reject") {
      await supabase.from("wod_tomorrow_preview").delete().eq("date", targetDate);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "approve") {
      const { data: preview } = await supabase
        .from("wod_tomorrow_preview")
        .select("*")
        .eq("date", targetDate)
        .maybeSingle();
      if (!preview) throw new Error(`No preview row for ${targetDate}`);

      const { data: active } = await supabase
        .from("admin_workouts")
        .select("id, name, equipment")
        .eq("is_workout_of_day", true)
        .eq("generated_for_date", targetDate);
      if (active && active.length > 0) {
        return new Response(
          JSON.stringify({
            success: false,
            error: `WODs already published for ${targetDate}: ${active
              .map((w: any) => w.name)
              .join(", ")}`,
          }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const promoted: any[] = [];
      const failures: string[] = [];
      const ids: { slot: string; id: string | null }[] = preview.is_recovery_day
        ? [{ slot: "recovery", id: preview.recovery_workout_id }]
        : [
            { slot: "bodyweight", id: preview.bodyweight_workout_id },
            { slot: "equipment", id: preview.equipment_workout_id },
          ];
      for (const { slot, id } of ids) {
        if (!id) {
          failures.push(`${slot} slot empty`);
          continue;
        }
        try {
          const row = await promoteToWod(supabase, stripe, id, targetDate);
          promoted.push({ slot, id, name: row?.name });
        } catch (e) {
          failures.push(`${slot}: ${(e as Error).message}`);
        }
      }

      const allOk = failures.length === 0 && promoted.length === ids.length;
      await supabase
        .from("wod_tomorrow_preview")
        .update({
          status: allOk ? "approved" : "pending",
          approved_at: allOk ? new Date().toISOString() : null,
          approved_by: body.approvedBy || null,
          notes: failures.length ? failures.join(" | ") : null,
        })
        .eq("date", targetDate);

      if (!allOk) {
        return new Response(JSON.stringify({ success: false, promoted, failures }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, promoted }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "list") {
      const { data } = await supabase
        .from("wod_tomorrow_preview")
        .select("*")
        .gte("date", getCyprusDateStr(0))
        .order("date", { ascending: true });
      return new Response(JSON.stringify({ success: true, rows: data || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log("ERROR", { msg });
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});