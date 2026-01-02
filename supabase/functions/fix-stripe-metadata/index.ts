import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[FIX-STRIPE-METADATA] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    log("Function started");

    // Verify admin role
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) {
      throw new Error("Authentication failed");
    }

    const { data: roleData } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      throw new Error("Admin access required");
    }
    log("Admin verified", { userId: userData.user.id });

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Parse request body for optional dryRun mode
    let dryRun = false;
    try {
      const body = await req.json();
      dryRun = body?.dryRun === true;
    } catch {
      // No body or invalid JSON, proceed with actual fix
    }
    log("Mode", { dryRun });

    // Get all programs and workouts with stripe_product_id
    const { data: programs, error: programsError } = await supabaseClient
      .from("admin_training_programs")
      .select("id, name, stripe_product_id, category")
      .not("stripe_product_id", "is", null);

    if (programsError) {
      throw new Error(`Failed to fetch programs: ${programsError.message}`);
    }
    log("Fetched programs", { count: programs?.length || 0 });

    const { data: workouts, error: workoutsError } = await supabaseClient
      .from("admin_workouts")
      .select("id, name, stripe_product_id, type")
      .not("stripe_product_id", "is", null);

    if (workoutsError) {
      throw new Error(`Failed to fetch workouts: ${workoutsError.message}`);
    }
    log("Fetched workouts", { count: workouts?.length || 0 });

    // Combine all items
    const allItems = [
      ...(programs || []).map(p => ({
        id: p.id,
        name: p.name,
        stripe_product_id: p.stripe_product_id,
        content_type: "Training Program",
      })),
      ...(workouts || []).map(w => ({
        id: w.id,
        name: w.name,
        stripe_product_id: w.stripe_product_id,
        content_type: w.type || "Workout",
      })),
    ];

    log("Total items to check", { count: allItems.length });

    const results = {
      total_checked: 0,
      already_tagged: 0,
      fixed: 0,
      errors: 0,
      fixed_items: [] as string[],
      error_items: [] as { name: string; error: string }[],
    };

    // Check each Stripe product
    for (const item of allItems) {
      if (!item.stripe_product_id) continue;
      
      results.total_checked++;
      
      try {
        // Fetch the Stripe product
        const product = await stripe.products.retrieve(item.stripe_product_id);
        
        // Check if it has the SMARTYGYM metadata
        if (product.metadata?.project === "SMARTYGYM") {
          results.already_tagged++;
          log("Already tagged", { name: item.name, productId: item.stripe_product_id });
          continue;
        }

        // Product missing metadata - fix it
        log("Missing metadata, fixing", { name: item.name, productId: item.stripe_product_id });

        if (!dryRun) {
          await stripe.products.update(item.stripe_product_id, {
            metadata: {
              ...product.metadata,
              project: "SMARTYGYM",
              content_type: item.content_type,
            },
          });
        }

        results.fixed++;
        results.fixed_items.push(item.name);
        log("Fixed metadata", { name: item.name, productId: item.stripe_product_id, dryRun });

      } catch (error: any) {
        results.errors++;
        results.error_items.push({
          name: item.name,
          error: error.message || "Unknown error",
        });
        log("Error processing item", { name: item.name, error: error.message });
      }
    }

    log("Completed", results);

    return new Response(JSON.stringify({
      success: true,
      dryRun,
      ...results,
      message: dryRun 
        ? `Dry run complete. Would fix ${results.fixed} products.`
        : `Fixed ${results.fixed} products. ${results.already_tagged} already tagged. ${results.errors} errors.`,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    log("ERROR", { message: error.message });
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
