import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[TAG-SMARTYGYM-PRODUCTS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Verify admin authentication
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

    // Check if user is admin
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

    // Parse request body for dry-run option
    let dryRun = false;
    try {
      const body = await req.json();
      dryRun = body?.dryRun === true;
    } catch {
      // No body or invalid JSON - use defaults
    }
    logStep("Mode", { dryRun });

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");
    
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    logStep("Stripe initialized");

    // Fetch ALL products (with pagination)
    let allProducts: Stripe.Product[] = [];
    let hasMore = true;
    let startingAfter: string | undefined = undefined;

    while (hasMore) {
      const params: Stripe.ProductListParams = { limit: 100 };
      if (startingAfter) {
        params.starting_after = startingAfter;
      }
      
      const products = await stripe.products.list(params);
      allProducts = allProducts.concat(products.data);
      hasMore = products.has_more;
      
      if (products.data.length > 0) {
        startingAfter = products.data[products.data.length - 1].id;
      }
      
      logStep("Fetched products batch", { 
        batchSize: products.data.length, 
        totalSoFar: allProducts.length,
        hasMore 
      });
    }

    logStep("Total products fetched", { count: allProducts.length });

    // Process each product
    let taggedCount = 0;
    let skippedHFSC = 0;
    let alreadyTagged = 0;
    let errors: string[] = [];
    const taggedProducts: { id: string; name: string }[] = [];
    const skippedHFSCProducts: { id: string; name: string }[] = [];

    for (const product of allProducts) {
      const metadata = product.metadata || {};
      const projectTag = metadata.project;

      // Skip if already tagged with HFSC (other project)
      if (projectTag === "HFSC") {
        skippedHFSC++;
        skippedHFSCProducts.push({ id: product.id, name: product.name });
        logStep("Skipped HFSC product", { id: product.id, name: product.name });
        continue;
      }

      // Skip if already tagged with SMARTYGYM
      if (projectTag === "SMARTYGYM") {
        alreadyTagged++;
        logStep("Already tagged SMARTYGYM", { id: product.id, name: product.name });
        continue;
      }

      // Tag this product with SMARTYGYM
      if (!dryRun) {
        try {
          await stripe.products.update(product.id, {
            metadata: {
              ...metadata,
              project: "SMARTYGYM"
            }
          });
          taggedCount++;
          taggedProducts.push({ id: product.id, name: product.name });
          logStep("Tagged product", { id: product.id, name: product.name });
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          errors.push(`Failed to tag ${product.id}: ${errorMsg}`);
          logStep("ERROR tagging product", { id: product.id, error: errorMsg });
        }
      } else {
        // Dry run - just count
        taggedCount++;
        taggedProducts.push({ id: product.id, name: product.name });
        logStep("Would tag product (dry run)", { id: product.id, name: product.name });
      }
    }

    const summary = {
      dryRun,
      totalProducts: allProducts.length,
      tagged: taggedCount,
      skippedHFSC,
      alreadyTagged,
      errors: errors.length > 0 ? errors : undefined,
      taggedProducts: taggedProducts.slice(0, 20), // First 20 for preview
      skippedHFSCProducts: skippedHFSCProducts.slice(0, 10), // First 10 HFSC for preview
    };

    logStep("Tagging complete", summary);

    return new Response(
      JSON.stringify(summary),
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
