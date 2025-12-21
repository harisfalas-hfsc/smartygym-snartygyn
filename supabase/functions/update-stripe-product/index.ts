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

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    return { isAdmin: false, userId: null, error: "Invalid token" };
  }

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
      console.error("[UPDATE-STRIPE-PRODUCT] Authorization failed:", authError);
      return new Response(
        JSON.stringify({ error: authError || "Unauthorized" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    const { productId, name, description, imageUrl, active } = await req.json();
    
    if (!productId) {
      throw new Error("Product ID is required");
    }

    console.log("[UPDATE-STRIPE-PRODUCT] Request received:", { 
      productId, 
      name, 
      description, 
      active,
      imageUrl: imageUrl ? `${imageUrl.substring(0, 50)}...` : "NULL/MISSING" 
    });

    let validatedImageUrl = null;
    if (imageUrl) {
      if (imageUrl.startsWith('https://')) {
        validatedImageUrl = imageUrl;
      } else if (imageUrl.startsWith('http://')) {
        validatedImageUrl = imageUrl.replace('http://', 'https://');
      } else {
        console.error("[UPDATE-STRIPE-PRODUCT] REJECTED: Invalid image URL format");
        throw new Error(`Invalid image URL format: URL must start with https://`);
      }
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const updateData: any = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (validatedImageUrl) updateData.images = [validatedImageUrl];
    if (typeof active === 'boolean') updateData.active = active;

    const product = await stripe.products.update(productId, updateData);
    console.log("Product updated:", product.id, product.name);

    return new Response(
      JSON.stringify({
        product_id: product.id,
        name: product.name,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error updating Stripe product:", error);
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
