import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[GRANT-CORPORATE-ADMIN] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verify admin authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const adminUser = userData.user;
    if (!adminUser) throw new Error("User not authenticated");

    // Check if caller is admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', adminUser.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !roleData) {
      throw new Error("Unauthorized: Admin access required");
    }
    logStep("Admin verified", { adminId: adminUser.id });

    // Parse request body
    const { user_id, plan_type } = await req.json();
    
    if (!user_id || !plan_type) {
      throw new Error("Missing required fields: user_id and plan_type");
    }

    const validPlanTypes = ['dynamic', 'power', 'elite', 'enterprise'];
    if (!validPlanTypes.includes(plan_type)) {
      throw new Error(`Invalid plan type: ${plan_type}. Must be one of: ${validPlanTypes.join(', ')}`);
    }

    logStep("Granting corporate admin", { user_id, plan_type });

    // Check if user already has a corporate subscription as admin
    const { data: existingCorp } = await supabaseAdmin
      .from('corporate_subscriptions')
      .select('id')
      .eq('admin_user_id', user_id)
      .eq('status', 'active')
      .single();

    if (existingCorp) {
      throw new Error("User already has an active corporate subscription");
    }

    // Get max users based on plan type
    const maxUsersMap: Record<string, number> = {
      dynamic: 10,
      power: 20,
      elite: 30,
      enterprise: 9999, // Unlimited
    };
    const maxUsers = maxUsersMap[plan_type];

    // Calculate subscription period (1 year from now)
    const now = new Date();
    const periodStart = now.toISOString();
    const periodEnd = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()).toISOString();

    // Get user's email for organization name placeholder
    const { data: authData } = await supabaseAdmin.auth.admin.getUserById(user_id);
    const userEmail = authData?.user?.email || 'Unknown';
    const organizationName = `${userEmail.split('@')[0]}'s Organization`;

    // Create corporate subscription
    const { data: corpSub, error: corpError } = await supabaseAdmin
      .from('corporate_subscriptions')
      .insert({
        admin_user_id: user_id,
        organization_name: organizationName,
        plan_type: plan_type,
        max_users: maxUsers,
        current_users_count: 0,
        current_period_start: periodStart,
        current_period_end: periodEnd,
        status: 'active',
      })
      .select()
      .single();

    if (corpError) {
      logStep("Error creating corporate subscription", { error: corpError.message });
      throw new Error(`Failed to create corporate subscription: ${corpError.message}`);
    }
    logStep("Corporate subscription created", { id: corpSub.id });

    // NOTE: We no longer update user_subscriptions here.
    // Corporate admin access is now derived solely from corporate_subscriptions table.
    // This allows users to have BOTH a personal subscription AND corporate admin status independently.
    logStep("Corporate admin status granted - access derived from corporate_subscriptions table");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully granted ${plan_type.charAt(0).toUpperCase() + plan_type.slice(1)} corporate admin access`,
        subscription_id: corpSub.id
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
