import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { requireAdminOrServiceRole } from "../_shared/admin-or-service-auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[BACKFILL-PM] ${step}${detailsStr}`);
};

/**
 * One-shot/repeatable safety job:
 * For every ACTIVE or TRIALING subscription, ensure that:
 *   1. The customer has a default_payment_method on their invoice_settings,
 *      AND
 *   2. The subscription itself has a default_payment_method set.
 *
 * Without this, Stripe sometimes creates a DRAFT renewal invoice instead of
 * auto-charging — which is exactly what happened with Manolis Christofi
 * in April 2026.
 *
 * This function is idempotent and safe to run any time.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const authError = await requireAdminOrServiceRole(req, corsHeaders);
  if (authError) return authError;

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const fixed: Array<{ sub: string; customer: string; action: string }> = [];
    const skipped: Array<{ sub: string; reason: string }> = [];
    const errors: Array<{ sub: string; error: string }> = [];

    // Iterate active + trialing subscriptions in pages of 100
    for (const status of ["active", "trialing"] as const) {
      let startingAfter: string | undefined;
      while (true) {
        const page = await stripe.subscriptions.list({
          status,
          limit: 100,
          starting_after: startingAfter,
          expand: ["data.default_payment_method", "data.customer"],
        });

        for (const sub of page.data) {
          try {
            const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;

            // Already has a default PM on the subscription → nothing to do.
            if (sub.default_payment_method) {
              skipped.push({ sub: sub.id, reason: "already has default_payment_method" });
              continue;
            }

            // Find an attached payment method to promote to default.
            // Prefer the customer's invoice_settings default; otherwise the
            // most recent successful invoice's PM; otherwise any attached card.
            const customer = await stripe.customers.retrieve(customerId);
            if (customer.deleted) {
              skipped.push({ sub: sub.id, reason: "customer deleted" });
              continue;
            }

            let pmId: string | null = null;

            const invoiceDefault = (customer as Stripe.Customer).invoice_settings
              ?.default_payment_method;
            if (invoiceDefault) {
              pmId = typeof invoiceDefault === "string" ? invoiceDefault : invoiceDefault.id;
            }

            if (!pmId) {
              const pms = await stripe.paymentMethods.list({
                customer: customerId,
                type: "card",
                limit: 1,
              });
              if (pms.data.length > 0) pmId = pms.data[0].id;
            }

            if (!pmId) {
              skipped.push({ sub: sub.id, reason: "no payment method on file" });
              continue;
            }

            // Set on customer (used as fallback) AND on subscription (primary).
            await stripe.customers.update(customerId, {
              invoice_settings: { default_payment_method: pmId },
            });
            await stripe.subscriptions.update(sub.id, {
              default_payment_method: pmId,
            });

            log("Backfilled default PM", { sub: sub.id, customer: customerId, pm: pmId });
            fixed.push({ sub: sub.id, customer: customerId, action: "set_default_pm" });
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            log("ERROR on sub", { sub: sub.id, error: msg });
            errors.push({ sub: sub.id, error: msg });
          }
        }

        if (!page.has_more) break;
        startingAfter = page.data[page.data.length - 1].id;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        fixed_count: fixed.length,
        skipped_count: skipped.length,
        error_count: errors.length,
        fixed,
        errors,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    log("FATAL", { msg });
    return new Response(JSON.stringify({ success: false, error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});