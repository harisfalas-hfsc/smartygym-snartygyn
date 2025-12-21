import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper function to verify admin role
async function verifyAdminRole(req: Request): Promise<{ isAdmin: boolean; userId: string | null; error?: string }> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return { isAdmin: false, userId: null, error: "No authorization header" };
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Verify the JWT token
  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    return { isAdmin: false, userId: null, error: "Invalid token" };
  }

  // Check if user has admin role
  const { data: roleData, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .single();

  if (roleError || !roleData) {
    return { isAdmin: false, userId: user.id, error: "User is not an admin" };
  }

  return { isAdmin: true, userId: user.id };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin role before proceeding
    const { isAdmin, error: authError } = await verifyAdminRole(req);
    if (!isAdmin) {
      console.error("[CREATE-STRIPE-PRODUCT] Authorization failed:", authError);
      return new Response(
        JSON.stringify({ error: authError || "Unauthorized" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    const { name, price, contentType, imageUrl } = await req.json();
    
    if (!name || !price) {
      throw new Error("Name and price are required");
    }

    console.log("[CREATE-STRIPE-PRODUCT] Request received:", { 
      name, 
      price, 
      contentType, 
      imageUrl: imageUrl ? `${imageUrl.substring(0, 50)}...` : "NULL/MISSING" 
    });

    // URL validation
    let validatedImageUrl = null;
    if (imageUrl) {
      if (imageUrl.startsWith('https://')) {
        validatedImageUrl = imageUrl;
        console.log("[CREATE-STRIPE-PRODUCT] Image URL validated successfully");
      } else if (imageUrl.startsWith('http://')) {
        console.warn("[CREATE-STRIPE-PRODUCT] WARNING: HTTP URL provided, converting to HTTPS");
        validatedImageUrl = imageUrl.replace('http://', 'https://');
      } else {
        console.error("[CREATE-STRIPE-PRODUCT] REJECTED: Invalid image URL format:", imageUrl.substring(0, 100));
        throw new Error(`Invalid image URL format: URL must start with https://`);
      }
    } else {
      console.warn("[CREATE-STRIPE-PRODUCT] WARNING: No imageUrl provided");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const productData: any = {
      name: name,
      description: `${contentType}: ${name}`,
    };

    if (validatedImageUrl) {
      productData.images = [validatedImageUrl];
      console.log("[CREATE-STRIPE-PRODUCT] Image will be added to product");
    }

    const product = await stripe.products.create(productData);
    console.log("Product created:", product.id);

    const priceInCents = Math.round(parseFloat(price) * 100);
    const stripePrice = await stripe.prices.create({
      product: product.id,
      unit_amount: priceInCents,
      currency: "eur",
    });

    console.log("Price created:", stripePrice.id);

    return new Response(
      JSON.stringify({
        product_id: product.id,
        price_id: stripePrice.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating Stripe product:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
