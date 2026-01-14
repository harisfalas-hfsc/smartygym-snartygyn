import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[DELETE-USER-ACCOUNT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    
    const userId = user.id;
    const userEmail = user.email;
    logStep("User authenticated", { userId, email: userEmail });

    // Parse confirmation from request body
    const { confirmationText } = await req.json();
    if (confirmationText !== "DELETE") {
      throw new Error("Invalid confirmation. Please type DELETE to confirm.");
    }
    logStep("Confirmation validated");

    // Step 1: Cancel Stripe subscriptions if any
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (stripeKey) {
      try {
        const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
        const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
        
        if (customers.data.length > 0) {
          const customerId = customers.data[0].id;
          logStep("Found Stripe customer", { customerId });
          
          // Cancel all active subscriptions
          const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
            status: "active",
          });
          
          for (const sub of subscriptions.data) {
            await stripe.subscriptions.cancel(sub.id);
            logStep("Cancelled subscription", { subscriptionId: sub.id });
          }
      }
    } catch (stripeError) {
      const stripeErrorMsg = stripeError instanceof Error ? stripeError.message : String(stripeError);
      logStep("Stripe error (continuing)", { error: stripeErrorMsg });
      // Continue with deletion even if Stripe fails
    }
  }

    // Step 2: Delete user data from all tables (in correct order for FK constraints)
    // Tier 1: Tables with no FK dependencies on other user tables
    const tier1Tables = [
      "email_campaign_log",
      "email_delivery_log",
      "social_media_analytics",
      "user_system_messages",
      "workout_comments",
      "testimonials",
      "banned_users",
      "smartly_suggest_interactions",
    ];

    for (const table of tier1Tables) {
      try {
        const { error } = await supabaseAdmin
          .from(table)
          .delete()
          .eq("user_id", userId);
        if (error) logStep(`Error deleting from ${table}`, { error: error.message });
        else logStep(`Deleted from ${table}`);
      } catch (e) {
        logStep(`Table ${table} might not exist, skipping`);
      }
    }

    // Tier 2: Calculator and measurement history
    const tier2Tables = [
      "onerm_history",
      "bmr_history",
      "calorie_history",
      "progress_logs",
      "smarty_checkins",
      "user_badges",
      "user_measurement_goals",
      "user_fitness_goals",
      "plan_generation_usage",
    ];

    for (const table of tier2Tables) {
      try {
        const { error } = await supabaseAdmin
          .from(table)
          .delete()
          .eq("user_id", userId);
        if (error) logStep(`Error deleting from ${table}`, { error: error.message });
        else logStep(`Deleted from ${table}`);
      } catch (e) {
        logStep(`Table ${table} might not exist, skipping`);
      }
    }

    // Tier 3: Content interactions and purchases
    const tier3Tables = [
      "workout_interactions",
      "program_interactions",
      "saved_workouts",
      "saved_training_programs",
      "scheduled_workouts",
      "ritual_purchases",
      "user_purchases",
      "user_activity_log",
      "user_calendar_connections",
    ];

    for (const table of tier3Tables) {
      try {
        const { error } = await supabaseAdmin
          .from(table)
          .delete()
          .eq("user_id", userId);
        if (error) logStep(`Error deleting from ${table}`, { error: error.message });
        else logStep(`Deleted from ${table}`);
      } catch (e) {
        logStep(`Table ${table} might not exist, skipping`);
      }
    }

    // Handle contact messages (delete history first, then messages)
    try {
      // Get contact message IDs for this user
      const { data: contactMsgs } = await supabaseAdmin
        .from("contact_messages")
        .select("id")
        .eq("user_id", userId);
      
      if (contactMsgs && contactMsgs.length > 0) {
        const msgIds = contactMsgs.map(m => m.id);
        await supabaseAdmin
          .from("contact_message_history")
          .delete()
          .in("contact_message_id", msgIds);
        logStep("Deleted contact message history");
      }
      
      await supabaseAdmin
        .from("contact_messages")
        .delete()
        .eq("user_id", userId);
      logStep("Deleted contact messages");
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      logStep("Error with contact messages", { error: errMsg });
    }

    // Tier 4: Corporate handling
    try {
      // Check if user is a corporate admin
      const { data: corpSub } = await supabaseAdmin
        .from("corporate_subscriptions")
        .select("id")
        .eq("admin_user_id", userId)
        .maybeSingle();
      
      if (corpSub) {
        // Delete corporate members first
        await supabaseAdmin
          .from("corporate_members")
          .delete()
          .eq("corporate_subscription_id", corpSub.id);
        logStep("Deleted corporate members");
        
        // Delete corporate subscription
        await supabaseAdmin
          .from("corporate_subscriptions")
          .delete()
          .eq("id", corpSub.id);
        logStep("Deleted corporate subscription");
      }
      
      // Also remove user if they're a corporate member
      await supabaseAdmin
        .from("corporate_members")
        .delete()
        .eq("user_id", userId);
      logStep("Removed from corporate memberships");
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      logStep("Error with corporate tables", { error: errMsg });
    }

    // Tier 5: User subscriptions and roles
    const tier5Tables = [
      "user_subscriptions",
      "user_roles",
    ];

    for (const table of tier5Tables) {
      try {
        const { error } = await supabaseAdmin
          .from(table)
          .delete()
          .eq("user_id", userId);
        if (error) logStep(`Error deleting from ${table}`, { error: error.message });
        else logStep(`Deleted from ${table}`);
      } catch (e) {
        logStep(`Table ${table} might not exist, skipping`);
      }
    }

    // Step 3: Delete avatar from storage
    try {
      const { data: files } = await supabaseAdmin.storage
        .from("avatars")
        .list(userId);
      
      if (files && files.length > 0) {
        const filePaths = files.map(f => `${userId}/${f.name}`);
        await supabaseAdmin.storage
          .from("avatars")
          .remove(filePaths);
        logStep("Deleted avatar files", { count: filePaths.length });
      }
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      logStep("Error deleting avatar", { error: errMsg });
    }

    // Step 4: Delete profile (should be last before auth.users)
    try {
      const { error } = await supabaseAdmin
        .from("profiles")
        .delete()
        .eq("user_id", userId);
      if (error) logStep("Error deleting profile", { error: error.message });
      else logStep("Deleted profile");
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      logStep("Error with profile deletion", { error: errMsg });
    }

    // Step 5: Delete the user from auth.users
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteAuthError) {
      throw new Error(`Failed to delete auth user: ${deleteAuthError.message}`);
    }
    logStep("Deleted auth user");

    logStep("Account deletion completed successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Your account and all associated data have been permanently deleted." 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
