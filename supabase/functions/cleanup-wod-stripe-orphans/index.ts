import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function hasAiStyleName(name: string): boolean {
  return /\b(axial|matrix|meridian|protocol|helix|arcus|synergy|conduit|integration|current|vector|quantum|algorithm|neural|system|module|phase|sequence)\b/i.test(name.trim());
}

async function verifyAdminRole(req: Request): Promise<{ isAdmin: boolean; userId: string | null; error?: string }> {
  const internalSecret = req.headers.get("X-Internal-Secret");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (internalSecret && serviceKey && internalSecret === serviceKey) {
    return { isAdmin: true, userId: "internal-maintenance" };
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return { isAdmin: false, userId: null, error: "No authorization header" };

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return { isAdmin: false, userId: null, error: "Invalid token" };

  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .single();

  if (!roleData) return { isAdmin: false, userId: user.id, error: "User is not an admin" };
  return { isAdmin: true, userId: user.id };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { isAdmin, error: authError } = await verifyAdminRole(req);
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: authError || "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403,
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json().catch(() => ({}));
    const dryRun = body.dryRun !== false; // Default to dry run for safety
    const scope = body.scope === "all-paid-content" ? "all-paid-content" : "wod";

    // 1. Get all Stripe product IDs currently linked from trusted paid content tables
    const { data: linkedWorkouts, error: workoutError } = await supabase
      .from("admin_workouts")
      .select("id, name, stripe_product_id")
      .not("stripe_product_id", "is", null);

    if (workoutError) throw new Error(`Workout DB query failed: ${workoutError.message}`);

    const { data: linkedPrograms, error: programError } = await supabase
      .from("admin_training_programs")
      .select("id, name, stripe_product_id")
      .not("stripe_product_id", "is", null);

    if (programError) throw new Error(`Program DB query failed: ${programError.message}`);

    const linkedProductIds = new Set(
      [...(linkedWorkouts || []), ...(linkedPrograms || [])]
        .map((item: any) => item.stripe_product_id)
        .filter(Boolean)
    );

    console.log(`[CLEANUP] Found ${linkedProductIds.size} linked Stripe product IDs across paid content`);

    // 2. Search only for active SmartyGym products with trusted project metadata
    const productQuery = scope === "all-paid-content"
      ? 'active:"true" AND metadata["project"]:"SMARTYGYM"'
      : 'active:"true" AND metadata["project"]:"SMARTYGYM" AND metadata["type"]:"wod"';
    const searchResult = await stripe.products.search({
      query: productQuery,
      limit: 100,
    });

    const activeProducts = searchResult.data.filter((product: Stripe.Product) => product.metadata?.project === "SMARTYGYM");
    console.log(`[CLEANUP] Found ${activeProducts.length} active Stripe products for scope ${scope}`);

    // 3. Find orphans: active trusted products NOT linked from any DB row
    const orphans = activeProducts.filter((p: Stripe.Product) => !linkedProductIds.has(p.id) || hasAiStyleName(p.name || ""));
    const kept = activeProducts
      .filter((p: Stripe.Product) => linkedProductIds.has(p.id))
      .map((p: Stripe.Product) => `${p.id} - ${p.name}`);
    console.log(`[CLEANUP] Found ${orphans.length} orphaned Stripe products to archive`);

    const archived: string[] = [];
    const errors: string[] = [];

    // 4. Archive orphans (set active=false, preserve purchase history)
    for (const orphan of orphans) {
      if (dryRun) {
        archived.push(`[DRY RUN] ${orphan.id} - ${orphan.name} (date: ${orphan.metadata?.generated_for_date || 'unknown'})`);
      } else {
        try {
          await stripe.products.update(orphan.id, {
            active: false,
            metadata: {
              ...orphan.metadata,
              cleanup_reason: "active_product_not_linked_in_database",
              cleanup_scope: scope,
              archived_by: "cleanup-wod-stripe-orphans",
              archived_at: new Date().toISOString(),
            },
          });
          archived.push(`${orphan.id} - ${orphan.name}`);
        } catch (err: any) {
          errors.push(`${orphan.id}: ${err.message}`);
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      dryRun,
      scope,
      totalActiveProducts: activeProducts.length,
      linkedInDatabase: linkedProductIds.size,
      orphansFound: orphans.length,
      kept,
      archived,
      errors,
      message: dryRun
        ? `Found ${orphans.length} orphans. Send { "dryRun": false } to archive them.`
        : `Archived ${archived.length} orphaned WOD Stripe products.`,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
    });
  } catch (error) {
    console.error("[CLEANUP] Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
    });
  }
});
