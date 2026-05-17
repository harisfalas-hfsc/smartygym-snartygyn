import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Row {
  id: string;
  name: string;
  price: number | null;
  is_standalone_purchase: boolean | null;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
}

interface Issue {
  id: string;
  name: string;
  problems: string[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const fix = url.searchParams.get("fix") === "1";
    const dryRun = url.searchParams.get("dryRun") === "1";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Admin gate: either valid admin JWT OR service-role internal call (used by
    // Lovable agent / scheduled audits). No public surface — function is not
    // wired into UI.
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    let authorized = token && token === serviceKey;
    if (!authorized && token) {
      const { data: userData } = await supabase.auth.getUser(token);
      const uid = userData?.user?.id;
      if (uid) {
        const { data: roleRow } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", uid)
          .eq("role", "admin")
          .maybeSingle();
        if (roleRow) authorized = true;
      }
    }
    if (!authorized) return json({ error: "Unauthorized" }, 401);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2025-08-27.basil",
    });

    // Fetch all visible premium workouts
    const { data: rows, error } = await supabase
      .from("admin_workouts")
      .select("id,name,price,is_standalone_purchase,stripe_product_id,stripe_price_id")
      .eq("is_premium", true)
      .eq("is_visible", true);
    if (error) throw error;

    const workouts = (rows ?? []) as Row[];
    const issues: Issue[] = [];
    let ok = 0;
    let fixed = 0;

    for (const w of workouts) {
      const problems: string[] = [];

      if (!w.price || w.price <= 0) problems.push("missing_price_value");
      if (w.is_standalone_purchase !== true) problems.push("not_standalone");
      if (!w.stripe_product_id) problems.push("missing_stripe_product_id");
      if (!w.stripe_price_id) problems.push("missing_stripe_price_id");

      // Stripe checks only if both ids present
      if (w.stripe_product_id && w.stripe_price_id) {
        try {
          const product = await stripe.products.retrieve(w.stripe_product_id);
          if (!product.active) problems.push("stripe_product_inactive");
          if (product.metadata?.project !== "SMARTYGYM") problems.push("stripe_product_bad_project_metadata");
          if (product.metadata?.content_type !== "Workout") problems.push("stripe_product_bad_content_type_metadata");
        } catch (e) {
          problems.push("stripe_product_not_found");
        }

        try {
          const price = await stripe.prices.retrieve(w.stripe_price_id);
          if (!price.active) problems.push("stripe_price_inactive");
          if (price.currency !== "eur") problems.push(`stripe_price_wrong_currency:${price.currency}`);
          if (price.product !== w.stripe_product_id) problems.push("stripe_price_product_mismatch");
          if (w.price && price.unit_amount !== Math.round(w.price * 100)) {
            problems.push(`stripe_price_amount_mismatch:db=${w.price}€,stripe=${(price.unit_amount ?? 0) / 100}€`);
          }
          if (price.type !== "one_time") problems.push(`stripe_price_wrong_type:${price.type}`);
        } catch (e) {
          problems.push("stripe_price_not_found");
        }
      }

      if (problems.length === 0) {
        ok++;
      } else {
        issues.push({ id: w.id, name: w.name, problems });

        // --- Auto-fix mode ---
        if (fix && !dryRun) {
          try {
            // Determine target price (default 3.99 if missing)
            const targetPriceEur = w.price && w.price > 0 ? w.price : 3.99;
            const unitAmount = Math.round(targetPriceEur * 100);

            // Need to (re)create product if missing/broken metadata/not found
            const needNewProduct =
              problems.includes("missing_stripe_product_id") ||
              problems.includes("stripe_product_not_found");

            let productId = w.stripe_product_id ?? "";
            if (needNewProduct) {
              const prod = await stripe.products.create({
                name: w.name,
                metadata: {
                  project: "SMARTYGYM",
                  content_type: "Workout",
                  workout_id: w.id,
                },
              });
              productId = prod.id;
            } else if (
              problems.includes("stripe_product_bad_project_metadata") ||
              problems.includes("stripe_product_bad_content_type_metadata")
            ) {
              await stripe.products.update(productId, {
                metadata: {
                  project: "SMARTYGYM",
                  content_type: "Workout",
                  workout_id: w.id,
                },
              });
            }

            // Need new price if missing, not found, wrong amount, wrong currency, wrong type, or product changed
            const needNewPrice =
              problems.includes("missing_stripe_price_id") ||
              problems.includes("stripe_price_not_found") ||
              problems.some((p) => p.startsWith("stripe_price_amount_mismatch")) ||
              problems.some((p) => p.startsWith("stripe_price_wrong_currency")) ||
              problems.some((p) => p.startsWith("stripe_price_wrong_type")) ||
              problems.includes("stripe_price_product_mismatch") ||
              needNewProduct;

            let priceId = w.stripe_price_id ?? "";
            if (needNewPrice) {
              // Deactivate old price if present
              if (w.stripe_price_id) {
                try { await stripe.prices.update(w.stripe_price_id, { active: false }); } catch (_) {}
              }
              const newPrice = await stripe.prices.create({
                product: productId,
                currency: "eur",
                unit_amount: unitAmount,
                metadata: {
                  project: "SMARTYGYM",
                  content_type: "Workout",
                  workout_id: w.id,
                },
              });
              priceId = newPrice.id;
            }

            // Persist DB
            await supabase
              .from("admin_workouts")
              .update({
                price: targetPriceEur,
                is_standalone_purchase: true,
                stripe_product_id: productId,
                stripe_price_id: priceId,
              })
              .eq("id", w.id);

            fixed++;
            (issues[issues.length - 1] as Issue).problems.push("AUTO_FIXED");
          } catch (e) {
            (issues[issues.length - 1] as Issue).problems.push(
              `AUTO_FIX_FAILED:${(e as Error).message}`,
            );
          }
        }
      }
    }

    const summary = {
      total: workouts.length,
      ok,
      broken: issues.length,
      fixed,
      mode: fix ? (dryRun ? "fix-dry-run" : "fix") : "audit",
    };

    await supabase.from("stripe_sync_audit").insert({
      scope: "premium-workouts",
      total: workouts.length,
      ok_count: ok,
      broken_count: issues.length,
      summary,
      issues,
    });

    return json({ summary, issues }, 200);
  } catch (e) {
    console.error("[verify-workout-stripe-sync]", e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}