import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GET-STRIPE-REVENUE] ${step}${detailsStr}`);
};

const KNOWN_SMARTYGYM_PRODUCT_IDS = new Set([
  // Active + grandfathered SmartyGym subscriptions
  "prod_UqU78UzgA2ckcP", // SmartyGym Premium Monthly (€9.99/mo, old €6.99 subscribers remain grandfathered)
  "prod_UgmdX60UPJxWeS", // Legacy lifetime membership
  "prod_TFfAcybp438BH6", // Legacy Gold monthly
  "prod_TFfAPp1tq7RdUk", // Legacy Platinum yearly
  // Corporate plans
  "prod_TZATAcAlqgc1P7",
  "prod_TZATDsKcDvMtHc",
  "prod_TZATGTAsKalmCn",
  "prod_TZATUtaS2jhgtK",
]);

type RevenueCategory = "premium" | "standalone" | "personal_training" | "corporate";

const classifyRevenue = (product: any, charge: any): RevenueCategory => {
  const productId = typeof product?.id === "string" ? product.id : "";
  const contentType = String(product?.metadata?.content_type ?? charge.metadata?.content_type ?? "").toLowerCase();
  const productName = String(product?.name ?? charge.description ?? "").toLowerCase();

  if (contentType === "personal_training" || productName.includes("personal training")) return "personal_training";
  if (
    contentType === "corporate" ||
    productName.includes("smarty dynamic") ||
    productName.includes("smarty power") ||
    productName.includes("smarty elite") ||
    productName.includes("smarty enterprise") ||
    ["prod_TZATAcAlqgc1P7", "prod_TZATDsKcDvMtHc", "prod_TZATGTAsKalmCn", "prod_TZATUtaS2jhgtK"].includes(productId)
  ) return "corporate";
  if (contentType === "workout" || contentType === "program" || contentType === "training_program" || contentType === "shop_product" || contentType === "ritual") {
    return "standalone";
  }
  return "premium";
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);

    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !roleData) {
      throw new Error("Unauthorized: Admin access required");
    }
    logStep("Admin verified");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");

    // Pin to a pre-Basil API version: newer versions removed `charge.invoice`
    // and `invoice.lines[].price.product`, which made every subscription
    // charge unattributable (revenue showed 0).
    const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" as any });
    logStep("Stripe initialized");

    // ============================================================
    // ACTUAL COLLECTED REVENUE: sum every successful Stripe CHARGE
    // (net of refunds), including payments from since-canceled
    // subscriptions. This is real money, not an estimate.
    // ============================================================

    const allCharges: any[] = [];
    let hasMore = true;
    let startingAfter: string | undefined = undefined;
    while (hasMore) {
      const params: any = { limit: 100, expand: ["data.invoice"] };
      if (startingAfter) params.starting_after = startingAfter;
      const page = await stripe.charges.list(params);
      allCharges.push(...page.data);
      hasMore = page.has_more;
      if (page.data.length > 0) startingAfter = page.data[page.data.length - 1].id;
    }
    logStep("Fetched charges", { count: allCharges.length });

    const productCache = new Map<string, any>();
    const getProduct = async (productId: string) => {
      if (productCache.has(productId)) return productCache.get(productId);
      try {
        const p = await stripe.products.retrieve(productId);
        productCache.set(productId, p);
        return p;
      } catch {
        productCache.set(productId, null);
        return null;
      }
    };

    // STRICT: a product counts as SmartyGym ONLY when it carries the
    // explicit project=SMARTYGYM metadata tag. Name heuristics are gone —
    // they previously matched HFSC products that happened to mention
    // unrelated words. Every real SmartyGym product is tagged.
    // STRICT: a product counts as SmartyGym ONLY when it carries the
    // explicit project=SMARTYGYM metadata tag, AND it's not a test product.
    const isTestProduct = (product: any) => {
      if (!product) return false;
      const name = (product.name || "").toUpperCase();
      if (name.startsWith("TEST")) return true;
      const meta = product.metadata || {};
      if (meta.test === "true" || meta.is_test === "true" || meta.environment === "test") return true;
      return false;
    };
    const isSmartyGymProduct = (product: any) =>
      !!product && (product.metadata?.project === "SMARTYGYM" || KNOWN_SMARTYGYM_PRODUCT_IDS.has(product.id)) && !isTestProduct(product);

    const invoiceCache = new Map<string, string | null>();
    const resolveProductId = async (charge: any): Promise<string | null> => {
      const invoiceId = typeof charge.invoice === "string" ? charge.invoice : charge.invoice?.id;
      if (invoiceId) {
        if (invoiceCache.has(invoiceId)) return invoiceCache.get(invoiceId)!;
        try {
          const invoice: any = await stripe.invoices.retrieve(invoiceId);
          const line: any = invoice.lines?.data?.[0];
          const productId: string | null =
            (typeof line?.price?.product === "string" ? line.price.product : null) ??
            (typeof line?.pricing?.price_details?.product === "string" ? line.pricing.price_details.product : null) ??
            (typeof line?.plan?.product === "string" ? line.plan.product : null);
          invoiceCache.set(invoiceId, productId);
          return productId;
        } catch {
          invoiceCache.set(invoiceId, null);
          return null;
        }
      }
      const metaProduct = charge.metadata?.product_id || charge.metadata?.stripe_product_id;
      return typeof metaProduct === "string" ? metaProduct : null;
    };

    let totalCollected = 0;
    let totalRefunded = 0;
    const byMonth: { [month: string]: number } = {};
    const byMonthByCategory: Record<string, Record<RevenueCategory, number>> = {};
    const byCategory: Record<RevenueCategory, { amount: number; count: number }> = {
      premium: { amount: 0, count: 0 },
      standalone: { amount: 0, count: 0 },
      personal_training: { amount: 0, count: 0 },
      corporate: { amount: 0, count: 0 },
    };
    const payments: any[] = [];
    let skippedNonSmartyGym = 0;
    let unattributed = 0;
    let unattributedAmount = 0;

    for (const charge of allCharges) {
      if (charge.status !== "succeeded" || !charge.paid) continue;
      const gross = (charge.amount_captured ?? charge.amount) / 100;
      const refunded = (charge.amount_refunded ?? 0) / 100;
      const net = gross - refunded;
      if (net <= 0) continue;

      const productId = await resolveProductId(charge);
      const product = productId ? await getProduct(productId) : null;

      // STRICT REVENUE RULE:
      // A charge is counted ONLY when it resolves to a SmartyGym product
      // (project=SMARTYGYM metadata) OR the charge itself carries
      // project=SMARTYGYM metadata. Nothing else. HFSC and any other
      // business sharing this Stripe account are EXCLUDED.
      // Reject test charges/products outright (TEST PRODUCT, test metadata, etc.)
      if (isTestProduct(product) || charge.metadata?.test === "true") {
        skippedNonSmartyGym++;
        continue;
      }
      const chargeIsSmartyGym = charge.metadata?.project === "SMARTYGYM";
      const productIsSmartyGym = isSmartyGymProduct(product);
      const productIdIsKnownSmartyGym = !!productId && KNOWN_SMARTYGYM_PRODUCT_IDS.has(productId);
      if (!productIsSmartyGym && !chargeIsSmartyGym && !productIdIsKnownSmartyGym) {
        skippedNonSmartyGym++;
        if (!productId) {
          unattributed++;
          unattributedAmount += net;
        }
        continue;
      }

      totalCollected += net;
      totalRefunded += refunded;

      const month = new Date(charge.created * 1000).toISOString().slice(0, 7);
      byMonth[month] = (byMonth[month] || 0) + net;
      const category = classifyRevenue(product, charge);
      byMonthByCategory[month] = byMonthByCategory[month] || { premium: 0, standalone: 0, personal_training: 0, corporate: 0 };
      byMonthByCategory[month][category] += net;
      byCategory[category].amount += net;
      byCategory[category].count += 1;

      payments.push({
        id: charge.id,
        amount: net,
        gross,
        refunded,
        currency: (charge.currency || "eur").toUpperCase(),
        date: new Date(charge.created * 1000).toISOString(),
        customer: typeof charge.customer === "string" ? charge.customer : charge.customer?.id ?? null,
        email: charge.billing_details?.email ?? charge.receipt_email ?? null,
        description: charge.description ?? null,
        productName: product?.name ?? null,
        productId: productId ?? null,
        category,
        contentType: (product?.metadata?.content_type as string) ?? (charge.metadata?.content_type as string) ?? null,
        recurring: !!charge.invoice,
      });
    }

    logStep("Collected revenue calculated", {
      totalCollected,
      payments: payments.length,
      skippedNonSmartyGym,
      unattributed,
    });

    return new Response(
      JSON.stringify({
        totalCollected: Math.round(totalCollected * 100) / 100,
        totalRefunded: Math.round(totalRefunded * 100) / 100,
        paymentCount: payments.length,
        byMonth,
        byMonthByCategory,
        byCategory,
        payments,
        skippedNonSmartyGym,
        unattributed,
        unattributedAmount: Math.round(unattributedAmount * 100) / 100,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
