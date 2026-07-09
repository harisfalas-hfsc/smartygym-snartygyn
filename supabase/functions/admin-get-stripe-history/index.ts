import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (s: string, d?: unknown) =>
  console.log(`[ADMIN-STRIPE-HISTORY] ${s}${d ? " - " + JSON.stringify(d) : ""}`);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");

    const supa = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const { data: userData, error: userErr } = await supa.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (userErr || !userData.user) throw new Error("Not authenticated");

    // Admin check
    const { data: role } = await supa
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) throw new Error("Admin access required");

    const { target_user_id } = await req.json().catch(() => ({} as any));
    if (!target_user_id) throw new Error("target_user_id required");

    // Get target user's email + stored customer id
    const { data: target, error: tErr } = await supa.auth.admin.getUserById(target_user_id);
    if (tErr || !target?.user?.email) throw new Error("Target user not found");
    const email = target.user.email;

    const { data: sub } = await supa
      .from("user_subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", target_user_id)
      .maybeSingle();

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    let customerId: string | null = sub?.stripe_customer_id || null;
    if (!customerId) {
      const list = await stripe.customers.list({ email, limit: 1 });
      customerId = list.data[0]?.id ?? null;
    }

    if (!customerId) {
      return new Response(
        JSON.stringify({ customer_id: null, first_subscribed_at: null, invoices: [], subscriptions: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // All subscriptions (any status) — find earliest start
    const subs = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 100 });
    let firstSubscribedAt: number | null = null;
    for (const s of subs.data) {
      const t = (s as any).start_date ?? s.created;
      if (typeof t === "number" && (firstSubscribedAt === null || t < firstSubscribedAt)) {
        firstSubscribedAt = t;
      }
    }

    // Paid invoices (subscription renewals + one-off charges via Stripe)
    const invoices = await stripe.invoices.list({ customer: customerId, limit: 50 });
    const paid = invoices.data
      .filter((i) => i.status === "paid" && (i.amount_paid ?? 0) > 0)
      .map((i) => ({
        id: i.id,
        number: i.number,
        amount_paid: (i.amount_paid ?? 0) / 100,
        currency: (i.currency || "eur").toUpperCase(),
        created: i.created,
        description:
          i.lines?.data?.[0]?.description ||
          (i.billing_reason === "subscription_cycle"
            ? "Subscription renewal"
            : i.billing_reason === "subscription_create"
              ? "Subscription started"
              : i.billing_reason || "Payment"),
        hosted_invoice_url: i.hosted_invoice_url,
      }));

    log("done", { customerId, invoices: paid.length, firstSubscribedAt });

    return new Response(
      JSON.stringify({
        customer_id: customerId,
        first_subscribed_at: firstSubscribedAt ? new Date(firstSubscribedAt * 1000).toISOString() : null,
        invoices: paid,
        subscriptions: subs.data.map((s) => ({
          id: s.id,
          status: s.status,
          start_date: (s as any).start_date ?? s.created,
          current_period_end:
            (s as any).current_period_end ?? (s as any).items?.data?.[0]?.current_period_end ?? null,
        })),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    log("ERROR", { msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});