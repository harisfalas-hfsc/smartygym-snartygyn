import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[AUTO-FINALIZE-DRAFTS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    log("Searching for draft subscription renewal invoices");

    // Find draft invoices created by subscription cycles (renewals).
    // Stripe leaves these in 'draft' if account-level auto-advance is off
    // OR if the original checkout didn't enforce payment_method_collection: 'always'.
    const drafts = await stripe.invoices.list({
      status: "draft",
      limit: 100,
    });

    const renewalDrafts = drafts.data.filter(
      (inv) => inv.billing_reason === "subscription_cycle" || inv.billing_reason === "subscription_update"
    );

    log("Found draft renewal invoices", { count: renewalDrafts.length });

    const results: Array<{ id: string; status: string; error?: string }> = [];

    for (const invoice of renewalDrafts) {
      try {
        // Finalize → Stripe will then auto-attempt payment via the customer's default payment method
        const finalized = await stripe.invoices.finalizeInvoice(invoice.id, {
          auto_advance: true,
        });
        log("Finalized invoice", { id: invoice.id, status: finalized.status, customer: invoice.customer });
        results.push({ id: invoice.id, status: finalized.status ?? "unknown" });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        log("Failed to finalize", { id: invoice.id, error: msg });
        results.push({ id: invoice.id, status: "error", error: msg });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: renewalDrafts.length,
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
