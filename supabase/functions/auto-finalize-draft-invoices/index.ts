import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[AUTO-FIX-INVOICES] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const results: {
      finalized: Array<{ id: string; status: string; error?: string }>;
      paid: Array<{ id: string; status: string; error?: string }>;
    } = { finalized: [], paid: [] };

    // ============================================================
    // LAYER A: Finalize stuck DRAFT subscription renewal invoices
    // ============================================================
    log("Scanning for draft subscription renewal invoices");
    const drafts = await stripe.invoices.list({ status: "draft", limit: 100 });
    const renewalDrafts = drafts.data.filter(
      (inv) =>
        inv.billing_reason === "subscription_cycle" ||
        inv.billing_reason === "subscription_update"
    );
    log("Draft renewal invoices found", { count: renewalDrafts.length });

    for (const invoice of renewalDrafts) {
      try {
        const finalized = await stripe.invoices.finalizeInvoice(invoice.id, {
          auto_advance: true,
        });
        log("Finalized draft", { id: invoice.id, status: finalized.status });
        results.finalized.push({ id: invoice.id, status: finalized.status ?? "unknown" });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        log("Failed to finalize", { id: invoice.id, error: msg });
        results.finalized.push({ id: invoice.id, status: "error", error: msg });
      }
    }

    // ============================================================
    // LAYER B: Force-pay any OPEN (finalized but unpaid) renewal
    // invoices using the customer's default saved payment method.
    // This catches the case where Stripe finalized but didn't
    // auto-attempt the charge.
    // ============================================================
    log("Scanning for open unpaid subscription renewal invoices");
    const opens = await stripe.invoices.list({ status: "open", limit: 100 });
    const renewalOpens = opens.data.filter(
      (inv) =>
        (inv.billing_reason === "subscription_cycle" ||
          inv.billing_reason === "subscription_update") &&
        inv.amount_remaining > 0
    );
    log("Open renewal invoices found", { count: renewalOpens.length });

    for (const invoice of renewalOpens) {
      try {
        // stripe.invoices.pay() forces Stripe to attempt the charge
        // immediately against the customer's default payment method.
        const paid = await stripe.invoices.pay(invoice.id);
        log("Paid invoice", {
          id: invoice.id,
          status: paid.status,
          customer: invoice.customer,
        });
        results.paid.push({ id: invoice.id, status: paid.status ?? "unknown" });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        log("Failed to pay", { id: invoice.id, error: msg });
        results.paid.push({ id: invoice.id, status: "error", error: msg });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        finalized_count: results.finalized.length,
        paid_count: results.paid.length,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
