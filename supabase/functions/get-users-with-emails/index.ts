import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[GET-USERS-WITH-EMAILS] ${step}${detailsStr}`);
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
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !roleData) {
      throw new Error("Unauthorized: Admin access required");
    }
    logStep("Admin verified");

    // Fetch all profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('user_id, full_name, avatar_url, created_at');

    if (profilesError) throw profilesError;

    // Fetch all subscriptions with all needed fields
    const { data: subscriptions, error: subsError } = await supabaseAdmin
      .from('user_subscriptions')
      .select('user_id, plan_type, status, current_period_start, current_period_end, created_at, updated_at, stripe_customer_id, stripe_subscription_id');

    if (subsError) throw subsError;

    // Fetch corporate subscriptions (for corporate admins)
    const { data: corporateSubs, error: corpSubsError } = await supabaseAdmin
      .from('corporate_subscriptions')
      .select('id, admin_user_id, organization_name, plan_type, status, current_period_end');

    if (corpSubsError) throw corpSubsError;
    logStep("Corporate subscriptions fetched", { count: corporateSubs?.length || 0 });

    // Fetch corporate members
    const { data: corporateMembers, error: corpMembersError } = await supabaseAdmin
      .from('corporate_members')
      .select('user_id, corporate_subscription_id, email');

    if (corpMembersError) throw corpMembersError;
    logStep("Corporate members fetched", { count: corporateMembers?.length || 0 });

    // Fetch all auth users to get emails
    const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) throw authError;

    // Combine data with corporate info
    const combinedData = profiles.map(profile => {
      const subscription = subscriptions?.find(sub => sub.user_id === profile.user_id);
      const authUser = authUsers.find(u => u.id === profile.user_id);
      
      // Check if user is corporate admin
      const corporateAdmin = corporateSubs?.find(cs => cs.admin_user_id === profile.user_id);
      
      // Check if user is corporate member
      const corporateMember = corporateMembers?.find(cm => cm.user_id === profile.user_id);
      const memberCorporateSub = corporateMember 
        ? corporateSubs?.find(cs => cs.id === corporateMember.corporate_subscription_id)
        : null;
      
      return {
        user_id: profile.user_id,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        email: authUser?.email || null,
        plan_type: subscription?.plan_type || 'free',
        status: subscription?.status || 'inactive',
        current_period_start: subscription?.current_period_start || null,
        current_period_end: subscription?.current_period_end || null,
        created_at: profile.created_at,
        subscription_created_at: subscription?.created_at || null,
        subscription_updated_at: subscription?.updated_at || null,
        stripe_customer_id: subscription?.stripe_customer_id || null,
        stripe_subscription_id: subscription?.stripe_subscription_id || null,
        // Corporate admin info
        is_corporate_admin: !!corporateAdmin,
        corporate_admin_org: corporateAdmin?.organization_name || null,
        corporate_admin_plan: corporateAdmin?.plan_type || null,
        corporate_admin_status: corporateAdmin?.status || null,
        corporate_admin_end: corporateAdmin?.current_period_end || null,
        // Corporate member info
        is_corporate_member: !!corporateMember,
        corporate_member_org: memberCorporateSub?.organization_name || null,
        corporate_member_plan: memberCorporateSub?.plan_type || null,
      };
    });

    logStep("Users fetched with emails", { count: combinedData.length });

    return new Response(
      JSON.stringify({ users: combinedData }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
