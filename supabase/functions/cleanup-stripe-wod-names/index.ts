import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CLEANUP-STRIPE-WOD-NAMES] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("🚀 Starting Stripe WOD name cleanup");

    // Verify admin role
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("Authentication failed");
    }

    // Check admin role
    const { data: roleData, error: roleError } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roleData) {
      throw new Error("Admin access required");
    }

    logStep("✅ Admin verified", { userId: userData.user.id });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Fetch all products from Stripe
    const updatedProducts: { id: string; oldName: string; newName: string }[] = [];
    const skippedProducts: { id: string; name: string; reason: string }[] = [];
    let hasMore = true;
    let startingAfter: string | undefined = undefined;

    while (hasMore) {
      const listParams: Stripe.ProductListParams = {
        limit: 100,
      };
      if (startingAfter) {
        listParams.starting_after = startingAfter;
      }
      const products = await stripe.products.list(listParams);

      logStep(`Fetched ${products.data.length} products`, { hasMore: products.has_more });

      for (const product of products.data) {
        // Check if name starts with "WOD: "
        if (product.name.startsWith("WOD: ")) {
          const newName = product.name.replace("WOD: ", "");
          
          // Update description if it matches the old pattern
          let newDescription = product.description;
          if (product.description?.startsWith("Workout of the Day - ")) {
            // Extract category and equipment from "Workout of the Day - Category (Equipment)"
            const match = product.description.match(/Workout of the Day - (.+?) \((.+?)\)/);
            if (match) {
              newDescription = `${match[1]} Workout (${match[2]})`;
            }
          }

          try {
            await stripe.products.update(product.id, {
              name: newName,
              description: newDescription || undefined,
            });

            updatedProducts.push({
              id: product.id,
              oldName: product.name,
              newName: newName,
            });

            logStep(`✅ Updated product`, { 
              id: product.id, 
              oldName: product.name, 
              newName,
              oldDesc: product.description?.substring(0, 50),
              newDesc: newDescription?.substring(0, 50)
            });
          } catch (updateError) {
            logStep(`❌ Failed to update product`, { 
              id: product.id, 
              name: product.name,
              error: updateError instanceof Error ? updateError.message : String(updateError)
            });
            skippedProducts.push({
              id: product.id,
              name: product.name,
              reason: updateError instanceof Error ? updateError.message : "Unknown error",
            });
          }
        } else {
          skippedProducts.push({
            id: product.id,
            name: product.name,
            reason: "Does not start with 'WOD: '",
          });
        }
      }

      hasMore = products.has_more;
      if (hasMore && products.data.length > 0) {
        startingAfter = products.data[products.data.length - 1].id;
      }
    }

    logStep("🎉 Cleanup complete", {
      updated: updatedProducts.length,
      skipped: skippedProducts.length,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Cleaned up ${updatedProducts.length} Stripe products`,
        updated: updatedProducts,
        skippedCount: skippedProducts.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("❌ Error", { message: errorMessage });

    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
