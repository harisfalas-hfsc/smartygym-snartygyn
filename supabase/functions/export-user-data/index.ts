import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[EXPORT-USER-DATA] ${step}${detailsStr}`);
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
    logStep("User authenticated", { userId, email: user.email });

    // Fetch all user data from various tables
    const exportData: Record<string, any> = {
      export_date: new Date().toISOString(),
      export_version: "1.0",
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
      },
    };

    // Helper function to safely fetch data
    const safeFetch = async (table: string, selectFields = "*") => {
      try {
        const { data, error } = await supabaseAdmin
          .from(table)
          .select(selectFields)
          .eq("user_id", userId);
        if (error) {
          logStep(`Error fetching ${table}`, { error: error.message });
          return null;
        }
        return data;
      } catch (e) {
        logStep(`Table ${table} might not exist`);
        return null;
      }
    };

    // Profile
    const profile = await safeFetch("profiles");
    exportData.profile = profile?.[0] || null;
    logStep("Fetched profile");

    // Subscription
    const subscription = await safeFetch("user_subscriptions");
    exportData.subscription = subscription?.[0] || null;
    logStep("Fetched subscription");

    // Workout data
    exportData.workouts = {
      interactions: await safeFetch("workout_interactions"),
      saved: await safeFetch("saved_workouts"),
      scheduled: await safeFetch("scheduled_workouts"),
      comments: await safeFetch("workout_comments"),
    };
    logStep("Fetched workout data");

    // Program data
    exportData.programs = {
      interactions: await safeFetch("program_interactions"),
      saved: await safeFetch("saved_training_programs"),
    };
    logStep("Fetched program data");

    // Check-ins
    exportData.checkins = await safeFetch("smarty_checkins");
    logStep("Fetched checkins");

    // Calculator history
    exportData.calculator_history = {
      one_rep_max: await safeFetch("onerm_history"),
      bmr: await safeFetch("bmr_history"),
      calories: await safeFetch("calorie_history"),
    };
    logStep("Fetched calculator history");

    // Goals
    exportData.goals = {
      fitness: await safeFetch("user_fitness_goals"),
      measurements: await safeFetch("user_measurement_goals"),
    };
    logStep("Fetched goals");

    // Activity log
    exportData.activity_log = await safeFetch("user_activity_log");
    logStep("Fetched activity log");

    // Progress logs
    exportData.progress_logs = await safeFetch("progress_logs");
    logStep("Fetched progress logs");

    // Messages
    const contactMessages = await safeFetch("contact_messages");
    const systemMessages = await safeFetch("user_system_messages");
    exportData.messages = {
      contact: contactMessages,
      system: systemMessages,
    };
    logStep("Fetched messages");

    // Purchases
    exportData.purchases = await safeFetch("user_purchases");
    exportData.ritual_purchases = await safeFetch("ritual_purchases");
    logStep("Fetched purchases");

    // Badges
    exportData.badges = await safeFetch("user_badges");
    logStep("Fetched badges");

    // Plan generation usage
    exportData.plan_generation_usage = await safeFetch("plan_generation_usage");
    logStep("Fetched plan generation usage");

    // Corporate membership (if any)
    const corpMember = await safeFetch("corporate_members");
    if (corpMember && corpMember.length > 0) {
      exportData.corporate_membership = corpMember[0];
    }
    logStep("Fetched corporate membership");

    // Check if user is corporate admin
    try {
      const { data: corpAdmin } = await supabaseAdmin
        .from("corporate_subscriptions")
        .select("*")
        .eq("admin_user_id", userId);
      if (corpAdmin && corpAdmin.length > 0) {
        exportData.corporate_admin = corpAdmin[0];
      }
    } catch (e) {
      logStep("No corporate admin data");
    }

    // Calendar connections
    exportData.calendar_connections = await safeFetch("user_calendar_connections");
    logStep("Fetched calendar connections");

    // Smartly suggest interactions
    exportData.smartly_suggestions = await safeFetch("smartly_suggest_interactions");
    logStep("Fetched smartly suggestions");

    logStep("Export completed successfully");

    return new Response(
      JSON.stringify(exportData, null, 2),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="smartygym-data-export-${new Date().toISOString().split('T')[0]}.json"`,
        }, 
        status: 200 
      }
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
