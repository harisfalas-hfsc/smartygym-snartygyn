import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[REVOKE-CORPORATE-ADMIN] ${step}${detailsStr}`);
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
    const { user_id } = await req.json();
    
    if (!user_id) {
      throw new Error("Missing required field: user_id");
    }

    // Prevent revoking super admin corporate status
    const superAdminEmail = 'harisfalas@gmail.com';
    const { data: targetUser } = await supabaseAdmin.auth.admin.getUserById(user_id);
    if (targetUser?.user?.email === superAdminEmail) {
      throw new Error('Cannot revoke super admin corporate status');
    }

    logStep("Revoking corporate admin", { user_id });

    // Get the corporate subscription
    const { data: corpSub, error: corpFetchError } = await supabaseAdmin
      .from('corporate_subscriptions')
      .select('id')
      .eq('admin_user_id', user_id)
      .single();

    if (corpFetchError || !corpSub) {
      throw new Error("User is not a corporate admin");
    }

    // Get all member user_ids before deleting
    const { data: members } = await supabaseAdmin
      .from('corporate_members')
      .select('user_id')
      .eq('corporate_subscription_id', corpSub.id);

    const memberUserIds = members?.map(m => m.user_id) || [];
    logStep("Found team members to revoke", { count: memberUserIds.length });

    // Revoke all team members' platinum access BEFORE deleting from corporate_members
    if (memberUserIds.length > 0) {
      const { error: memberSubError } = await supabaseAdmin
        .from('user_subscriptions')
        .update({
          plan_type: 'free',
          status: 'canceled',
          current_period_end: new Date().toISOString(),
        })
        .in('user_id', memberUserIds);

      if (memberSubError) {
        logStep("Warning: Error revoking member subscriptions", { error: memberSubError.message });
      } else {
        logStep("Revoked subscriptions for team members", { count: memberUserIds.length });
      }
    }

    // Delete all corporate members
    const { error: membersError } = await supabaseAdmin
      .from('corporate_members')
      .delete()
      .eq('corporate_subscription_id', corpSub.id);

    if (membersError) {
      logStep("Warning: Error deleting members", { error: membersError.message });
    }

    // Delete the corporate subscription
    const { error: deleteError } = await supabaseAdmin
      .from('corporate_subscriptions')
      .delete()
      .eq('id', corpSub.id);

    if (deleteError) {
      throw new Error(`Failed to delete corporate subscription: ${deleteError.message}`);
    }
    logStep("Corporate subscription deleted");

    // Revoke user's platinum access (set to free)
    const { error: subError } = await supabaseAdmin
      .from('user_subscriptions')
      .update({
        plan_type: 'free',
        status: 'canceled',
        current_period_end: new Date().toISOString(),
      })
      .eq('user_id', user_id);

    if (subError) {
      logStep("Warning: Error revoking subscription", { error: subError.message });
    }
    logStep("Subscription revoked");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Corporate admin status revoked successfully"
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
