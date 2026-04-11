import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function verifyAdminRole(req: Request): Promise<{ isAdmin: boolean; userId: string | null; error?: string }> {
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

    // 1. Get all stripe_product_ids currently linked in admin_workouts
    const { data: linkedWorkouts, error: dbError } = await supabase
      .from("admin_workouts")
      .select("stripe_product_id")
      .not("stripe_product_id", "is", null);

    if (dbError) throw new Error(`DB query failed: ${dbError.message}`);

    const linkedProductIds = new Set(
      (linkedWorkouts || []).map((w: any) => w.stripe_product_id).filter(Boolean)
    );

    console.log(`[CLEANUP] Found ${linkedProductIds.size} linked Stripe product IDs in admin_workouts`);

    // 2. Search for active WOD Stripe products
    const searchResult = await stripe.products.search({
      query: 'active:"true" AND metadata["type"]:"wod" AND metadata["project"]:"SMARTYGYM"',
      limit: 100,
    });

    const activeWodProducts = searchResult.data;
    console.log(`[CLEANUP] Found ${activeWodProducts.length} active WOD Stripe products`);

    // 3. Find orphans: active WOD products NOT linked from any DB row
    const orphans = activeWodProducts.filter(p => !linkedProductIds.has(p.id));
    console.log(`[CLEANUP] Found ${orphans.length} orphaned WOD Stripe products to archive`);

    const archived: string[] = [];
    const errors: string[] = [];

    // 4. Archive orphans (set active=false, preserve purchase history)
    const body = await req.json().catch(() => ({}));
    const dryRun = body.dryRun !== false; // Default to dry run for safety

    for (const orphan of orphans) {
      if (dryRun) {
        archived.push(`[DRY RUN] ${orphan.id} - ${orphan.name} (date: ${orphan.metadata?.generated_for_date || 'unknown'})`);
      } else {
        try {
          await stripe.products.update(orphan.id, { active: false });
          archived.push(`${orphan.id} - ${orphan.name}`);
        } catch (err: any) {
          errors.push(`${orphan.id}: ${err.message}`);
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      dryRun,
      totalActiveWodProducts: activeWodProducts.length,
      linkedInDatabase: linkedProductIds.size,
      orphansFound: orphans.length,
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
