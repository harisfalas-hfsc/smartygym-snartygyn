import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { getDayIn84Cycle, getPeriodizationForDay } from "../_shared/periodization-84day.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function getCyprusDateStr(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Athens",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function hasForbiddenPublicName(name: string): boolean {
  const trimmed = name.trim();
  return /\d/.test(trimmed)
    || /\b\d{4}(BW|EQ|V)\b$/i.test(trimmed)
    || /\b\d{6,}\b$/.test(trimmed)
    || /\b(v\d+|#\d+)\b$/i.test(trimmed)
    || /\b(II|III|IV|V|VI|VII|VIII|IX|X)\b$/.test(trimmed);
}

async function verifyAdminRole(req: Request): Promise<{ isAdmin: boolean; error?: string }> {
  const internalSecret = req.headers.get("X-Internal-Secret");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (internalSecret && serviceKey && internalSecret === serviceKey) return { isAdmin: true };

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return { isAdmin: false, error: "No authorization header" };

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return { isAdmin: false, error: "Invalid token" };

  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  return roleData ? { isAdmin: true } : { isAdmin: false, error: "User is not an admin" };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { isAdmin, error: authError } = await verifyAdminRole(req);
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: authError || "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    const body = await req.json().catch(() => ({}));
    const date = body.date || getCyprusDateStr();
    const dayIn84 = getDayIn84Cycle(date);
    const periodization = getPeriodizationForDay(dayIn84);
    const isRecoveryDay = periodization.category === "RECOVERY";
    const expectedSlots = isRecoveryDay ? ["VARIOUS"] : ["BODYWEIGHT", "EQUIPMENT"];

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2025-08-27.basil" });

    const { data: wods, error: wodError } = await supabase
      .from("admin_workouts")
      .select("id, name, equipment, is_visible, stripe_product_id, stripe_price_id, generated_for_date")
      .eq("generated_for_date", date)
      .eq("is_workout_of_day", true);

    if (wodError) throw new Error(`WOD query failed: ${wodError.message}`);

    const linkedProductIds = new Set((wods || []).map((w: any) => w.stripe_product_id).filter(Boolean));
    const activeSearch = await stripe.products.search({
      query: 'active:"true" AND metadata["project"]:"SMARTYGYM" AND metadata["type"]:"wod"',
      limit: 100,
    });
    const activeWodProducts = activeSearch.data.filter((product: Stripe.Product) => product.metadata?.project === "SMARTYGYM");
    const orphanProducts = activeWodProducts.filter((product: Stripe.Product) => !linkedProductIds.has(product.id));

    const checks: string[] = [];
    const warnings: string[] = [];
    const failures: string[] = [];

    for (const slot of expectedSlots) {
      if (!(wods || []).some((w: any) => w.equipment === slot)) failures.push(`Missing expected ${slot} WOD`);
    }

    const wodReports = await Promise.all((wods || []).map(async (wod: any) => {
      const nameForbidden = hasForbiddenPublicName(wod.name || "");
      const paymentPairOk = Boolean(wod.stripe_product_id) === Boolean(wod.stripe_price_id);
      if (nameForbidden) failures.push(`Forbidden public WOD name: ${wod.name}`);
      if (!paymentPairOk || !wod.stripe_product_id || !wod.stripe_price_id) failures.push(`Payment link issue for ${wod.name}`);

      let productStatus: any = null;
      if (wod.stripe_product_id) {
        try {
          const product = await stripe.products.retrieve(wod.stripe_product_id);
          productStatus = {
            active: product.active,
            metadataWorkoutId: product.metadata?.workout_id || product.metadata?.content_id || null,
            metadataMatches: [product.metadata?.workout_id, product.metadata?.content_id].includes(wod.id),
          };
          if (!product.active) failures.push(`Inactive Stripe product for ${wod.name}`);
          if (!productStatus.metadataMatches) warnings.push(`Stripe metadata mismatch for ${wod.name}`);
        } catch (stripeError: any) {
          failures.push(`Stripe product lookup failed for ${wod.name}: ${stripeError?.message || String(stripeError)}`);
        }
      }

      return {
        id: wod.id,
        name: wod.name,
        equipment: wod.equipment,
        visible: wod.is_visible,
        forbiddenName: nameForbidden,
        stripeProductId: wod.stripe_product_id,
        stripePriceId: wod.stripe_price_id,
        paymentPairOk,
        productStatus,
      };
    }));

    if (orphanProducts.length > 0) warnings.push(`${orphanProducts.length} active WOD Stripe product(s) are not linked in the database`);
    if ((wods || []).length !== expectedSlots.length) warnings.push(`Found ${(wods || []).length} WOD row(s), expected ${expectedSlots.length}`);
    checks.push("database WOD rows", "public names", "payment ID pairs", "Stripe product activity", "orphan WOD products");

    const status = failures.length > 0 ? "failed" : warnings.length > 0 ? "warning" : "healthy";

    return new Response(JSON.stringify({
      status,
      date,
      dayIn84,
      category: periodization.category,
      expectedSlots,
      expectedCount: expectedSlots.length,
      foundCount: (wods || []).length,
      checks,
      warnings,
      failures,
      wods: wodReports,
      activeWodStripeProductCount: activeWodProducts.length,
      orphanCount: orphanProducts.length,
      orphanProducts: orphanProducts.map((product: Stripe.Product) => ({ id: product.id, name: product.name })),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("[WOD-HEALTH] Error:", error);
    return new Response(JSON.stringify({ error: error?.message || "Unknown error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});