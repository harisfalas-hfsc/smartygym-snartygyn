import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[MANAGE-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function invoked");

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create admin client with service role key to bypass RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get the authorization header to verify the caller
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header provided');
    }

    // Create a client with the user's token to verify identity
    const supabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get the calling user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      logStep("Auth error", { error: userError?.message });
      throw new Error('Unauthorized: Invalid token');
    }
    logStep("Caller authenticated", { userId: user.id });

    // Verify the caller is an admin
    const { data: adminRole, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !adminRole) {
      logStep("Admin check failed", { error: roleError?.message });
      throw new Error('Unauthorized: Admin access required');
    }
    logStep("Admin verified");

    // Parse request body
    const { user_id, action, plan_type } = await req.json();
    logStep("Request params", { user_id, action, plan_type });

    if (!user_id || !action) {
      throw new Error('Missing required parameters: user_id and action');
    }

    if (!['grant', 'revoke'].includes(action)) {
      throw new Error('Invalid action. Must be "grant" or "revoke"');
    }

    if (action === 'grant' && !['gold', 'platinum'].includes(plan_type)) {
      throw new Error('Invalid plan_type for grant. Must be "gold" or "platinum"');
    }

    // Prevent modifying super admin (the main admin account)
    const superAdminEmail = 'harisfalas@gmail.com';
    const { data: targetUser } = await supabaseAdmin.auth.admin.getUserById(user_id);
    if (targetUser?.user?.email === superAdminEmail && action === 'revoke') {
      throw new Error('Cannot modify super admin subscription');
    }

    const now = new Date();
    const nowISO = now.toISOString();

    if (action === 'grant') {
      logStep("Granting subscription", { user_id, plan_type });
      
      // Calculate expiration based on plan type
      // Gold = 1 month, Platinum = 12 months
      let periodEnd: Date;
      if (plan_type === 'gold') {
        periodEnd = new Date(now);
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      } else {
        // Platinum = 12 months
        periodEnd = new Date(now);
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      }
      
      logStep("Calculated expiration", { 
        plan_type, 
        duration: plan_type === 'gold' ? '1 month' : '12 months',
        expires: periodEnd.toISOString() 
      });
      
      const { error: upsertError } = await supabaseAdmin
        .from('user_subscriptions')
        .upsert({
          user_id,
          plan_type: plan_type,
          status: 'active',
          current_period_start: nowISO,
          current_period_end: periodEnd.toISOString(), // Expires based on plan duration
          cancel_at_period_end: true, // Will not auto-renew
          stripe_customer_id: null,
          stripe_subscription_id: null,
          subscription_source: 'admin_grant',
          granted_by: user.id,
          updated_at: nowISO
        }, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        });

      if (upsertError) {
        logStep("Upsert error", { error: upsertError.message });
        throw new Error(`Failed to grant subscription: ${upsertError.message}`);
      }

      const durationText = plan_type === 'gold' ? '1 month' : '12 months';
      logStep("Subscription granted successfully", { expires: periodEnd.toISOString() });
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `${plan_type.charAt(0).toUpperCase() + plan_type.slice(1)} subscription granted for ${durationText} (expires ${periodEnd.toLocaleDateString()})`,
          expires: periodEnd.toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'revoke') {
      logStep("Revoking subscription", { user_id });
      
      const { error: upsertError } = await supabaseAdmin
        .from('user_subscriptions')
        .upsert({
          user_id,
          plan_type: 'free',
          status: 'revoked',  // Use 'revoked' to distinguish from natural expiration
          current_period_end: nowISO,
          cancel_at_period_end: false,
          updated_at: nowISO
        }, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        });

      if (upsertError) {
        logStep("Upsert error", { error: upsertError.message });
        throw new Error(`Failed to revoke subscription: ${upsertError.message}`);
      }

      logStep("Subscription revoked successfully");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Premium access revoked successfully' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action');

  } catch (error: unknown) {
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
