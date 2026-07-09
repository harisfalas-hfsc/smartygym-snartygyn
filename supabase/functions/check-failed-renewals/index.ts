import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { getEmailHeaders, getEmailFooter } from "../_shared/email-utils.ts";
import { MESSAGE_TYPES } from "../_shared/notification-types.ts";

/**
 * Cron fallback for failed subscription renewals.
 *
 * Runs every 6h. Lists Stripe subscriptions in past_due / unpaid status,
 * loads the latest open invoice, and sends the payment_failed_attempt /
 * payment_failed_final template if not already sent for that invoice.
 * Idempotent via `notification_audit_log.notification_type = payment_failed:<invoice_id>`.
 *
 * This covers cases where the Stripe webhook is not delivering
 * `invoice.payment_failed` events.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (step: string, details?: any) => {
  const d = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-FAILED-RENEWALS] ${step}${d}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const started = Date.now();

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );
    const resend = new Resend(Deno.env.get("RESEND_API_KEY") ?? "");

    let processed = 0;
    let notified = 0;

    for (const status of ["past_due", "unpaid"] as const) {
      let starting_after: string | undefined;
      while (true) {
        const page = await stripe.subscriptions.list({
          status,
          limit: 100,
          starting_after,
          expand: ["data.latest_invoice", "data.customer"],
        });
        for (const sub of page.data) {
          processed++;
          const invoice = sub.latest_invoice as Stripe.Invoice | null;
          if (!invoice || invoice.status === "paid") continue;

          const idemKey = `payment_failed:${invoice.id}`;
          const { data: already } = await supabase
            .from("notification_audit_log")
            .select("id")
            .eq("notification_type", idemKey)
            .limit(1)
            .maybeSingle();
          if (already) continue;

          const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
          const email = (typeof sub.customer !== "string" && !sub.customer.deleted)
            ? (sub.customer as Stripe.Customer).email
            : null;

          // Map to our user_id via user_subscriptions
          const { data: userSub } = await supabase
            .from("user_subscriptions")
            .select("user_id")
            .eq("stripe_customer_id", customerId)
            .maybeSingle();
          if (!userSub) {
            log("No user row for customer", { customerId });
            continue;
          }

          const isFinal = !invoice.next_payment_attempt;
          const automationKey = isFinal ? "payment_failed_final" : "payment_failed_attempt";

          // Reflect Stripe status in our DB
          await supabase
            .from("user_subscriptions")
            .update({ status: isFinal ? "canceled" : "past_due" })
            .eq("user_id", userSub.user_id);

          const { data: tpl } = await supabase
            .from("automated_message_templates")
            .select("dashboard_subject, dashboard_content, email_subject, email_content, subject, content")
            .eq("automation_key", automationKey)
            .eq("is_active", true)
            .maybeSingle();
          if (!tpl) {
            log("Template missing", { automationKey });
            continue;
          }

          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("user_id", userSub.user_id)
            .maybeSingle();
          const name = (profile?.full_name || "").split(" ")[0] || "there";
          const attempt = invoice.attempt_count ?? 1;
          const nextRetry = invoice.next_payment_attempt
            ? new Date(invoice.next_payment_attempt * 1000).toLocaleDateString()
            : "";
          const render = (s: string) =>
            (s || "")
              .replaceAll("{{name}}", name)
              .replaceAll("{{attempt}}", String(attempt))
              .replaceAll("{{next_retry}}", nextRetry);

          const dashSubject = render(tpl.dashboard_subject || tpl.subject || "Payment failed");
          const dashContent = render(tpl.dashboard_content || tpl.content || "");
          const mailSubject = render(tpl.email_subject || tpl.subject || "Payment failed");
          const mailContent = render(tpl.email_content || tpl.content || "");

          await supabase.from("user_system_messages").insert({
            user_id: userSub.user_id,
            subject: dashSubject,
            content: dashContent,
            message_type: MESSAGE_TYPES.PAYMENT_FAILED,
            is_read: false,
          });

          let emailOk = false;
          if (email) {
            try {
              await resend.emails.send({
                from: "SmartyGym <notifications@smartygym.com>",
                to: [email],
                subject: mailSubject,
                headers: getEmailHeaders(email),
                html: mailContent + getEmailFooter(email),
              });
              emailOk = true;
            } catch (e) {
              log("Email send failed", { email, error: (e as Error).message });
            }
          }

          await supabase.from("notification_audit_log").insert({
            notification_type: idemKey,
            message_type: MESSAGE_TYPES.PAYMENT_FAILED,
            recipient_count: 1,
            success_count: emailOk ? 1 : 0,
            failed_count: emailOk ? 0 : 1,
            subject: mailSubject,
            content: mailContent,
            metadata: {
              invoice_id: invoice.id,
              attempt_count: attempt,
              is_final: isFinal,
              user_id: userSub.user_id,
              source: "check-failed-renewals-cron",
            },
          });

          notified++;
          log("Notified user of failed renewal", { user_id: userSub.user_id, automationKey, invoice: invoice.id });
        }
        if (!page.has_more) break;
        starting_after = page.data[page.data.length - 1]?.id;
      }
    }

    const duration = Date.now() - started;
    log("Done", { processed, notified, duration });
    return new Response(
      JSON.stringify({ ok: true, processed, notified, duration_ms: duration }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (err) {
    const message = (err as Error).message;
    log("ERROR", { message });
    return new Response(JSON.stringify({ ok: false, error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});