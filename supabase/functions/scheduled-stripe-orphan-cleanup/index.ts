import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Scheduled (cron-only) wrapper around cleanup-wod-stripe-orphans logic.
 * No admin auth required — runs the SAME safe logic (compares Stripe SMARTYGYM
 * products against DB-linked stripe_product_id values, archives only the unlinked).
 * This exists so a daily cron can run cleanup without needing the service role key
 * embedded in cron SQL.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: linkedWorkouts } = await supabase
      .from("admin_workouts")
      .select("stripe_product_id")
      .not("stripe_product_id", "is", null);
    const { data: linkedPrograms } = await supabase
      .from("admin_training_programs")
      .select("stripe_product_id")
      .not("stripe_product_id", "is", null);

    const linked = new Set<string>(
      [...(linkedWorkouts || []), ...(linkedPrograms || [])]
        .map((r: any) => r.stripe_product_id)
        .filter(Boolean),
    );

    const search = await stripe.products.search({
      query: 'active:"true" AND metadata["project"]:"SMARTYGYM"',
      limit: 100,
    });

    const orphans = search.data.filter(
      (p) => p.metadata?.project === "SMARTYGYM" && !linked.has(p.id),
    );

    const archived: string[] = [];
    const errors: string[] = [];
    for (const p of orphans) {
      try {
        await stripe.products.update(p.id, {
          active: false,
          metadata: {
            ...p.metadata,
            cleanup_reason: "active_product_not_linked_in_database",
            archived_by: "scheduled-stripe-orphan-cleanup",
            archived_at: new Date().toISOString(),
          },
        });
        archived.push(`${p.id} - ${p.name}`);
      } catch (e: any) {
        errors.push(`${p.id}: ${e?.message || String(e)}`);
      }
    }

    console.log(`[scheduled-cleanup] linked=${linked.size} active=${search.data.length} archived=${archived.length} errors=${errors.length}`);

    return new Response(
      JSON.stringify({ success: true, linked: linked.size, active: search.data.length, archived, errors }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (err: any) {
    console.error("[scheduled-cleanup] error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err?.message || String(err) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});