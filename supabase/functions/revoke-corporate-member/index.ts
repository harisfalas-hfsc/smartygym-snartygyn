import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function logStep(step: string, details?: any) {
  const detailStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[REVOKE-CORP-MEMBER] ${step}${detailStr}`);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Verify the caller is a platform admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if caller is admin
    const { data: adminRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!adminRole) {
      throw new Error("Only platform admins can revoke corporate members");
    }

    const { member_user_id, corporate_subscription_id } = await req.json();
    logStep("Processing revoke request", { member_user_id, corporate_subscription_id });

    if (!member_user_id || !corporate_subscription_id) {
      throw new Error("Missing required fields: member_user_id and corporate_subscription_id");
    }

    // Verify the member exists in corporate_members
    const { data: member, error: memberError } = await supabaseAdmin
      .from('corporate_members')
      .select('id, user_id, corporate_subscription_id')
      .eq('user_id', member_user_id)
      .eq('corporate_subscription_id', corporate_subscription_id)
      .single();

    if (memberError || !member) {
      logStep("Member not found", { error: memberError?.message });
      throw new Error("Corporate member not found");
    }

    logStep("Found member to revoke", { memberId: member.id });

    // Update the member's subscription to free
    const { error: subError } = await supabaseAdmin
      .from('user_subscriptions')
      .update({
        plan_type: 'free',
        status: 'canceled',
        current_period_end: new Date().toISOString(),
      })
      .eq('user_id', member_user_id);

    if (subError) {
      logStep("Error updating subscription", { error: subError.message });
    } else {
      logStep("Updated member subscription to free");
    }

    // Delete the member from corporate_members
    const { error: deleteError } = await supabaseAdmin
      .from('corporate_members')
      .delete()
      .eq('id', member.id);

    if (deleteError) {
      logStep("Error deleting member", { error: deleteError.message });
      throw new Error("Failed to remove member from corporate subscription");
    }

    logStep("Deleted member from corporate_members");

    // Decrement the current_users_count in corporate_subscriptions
    const { data: corpSub } = await supabaseAdmin
      .from('corporate_subscriptions')
      .select('current_users_count')
      .eq('id', corporate_subscription_id)
      .single();

    if (corpSub) {
      const newCount = Math.max(0, (corpSub.current_users_count || 1) - 1);
      await supabaseAdmin
        .from('corporate_subscriptions')
        .update({ current_users_count: newCount })
        .eq('id', corporate_subscription_id);
      
      logStep("Decremented user count", { oldCount: corpSub.current_users_count, newCount });
    }

    logStep("Successfully revoked corporate member");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Corporate member access revoked successfully" 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logStep("Error", { message: errorMessage });
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
