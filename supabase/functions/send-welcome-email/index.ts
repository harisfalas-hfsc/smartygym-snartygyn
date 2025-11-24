import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[SEND-WELCOME-EMAIL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { record } = await req.json();
    logStep("Processing new user", { userId: record.user_id });

    // Create Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get user email
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(record.user_id);
    if (userError) throw userError;
    
    const userEmail = userData.user.email;
    if (!userEmail) throw new Error("User email not found");
    
    const userName = record.full_name || "there";
    
    logStep("User details fetched", { email: userEmail, name: userName });

    // Check user notification preferences
    const { data: preferences } = await supabaseAdmin
      .from("notification_preferences")
      .select("newsletter")
      .eq("user_id", record.user_id)
      .single();

    // Skip if user has disabled newsletter emails
    if (preferences && !preferences.newsletter) {
      logStep("User has disabled newsletter emails, skipping");
      return new Response(
        JSON.stringify({ success: false, reason: "User preferences: newsletter disabled" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Schedule sending for 5 minutes from now
    const sendAt = new Date();
    sendAt.setMinutes(sendAt.getMinutes() + 5);

    // Get welcome message template
    const { data: template } = await supabaseAdmin
      .from("automated_message_templates")
      .select("subject, content")
      .eq("message_type", "welcome")
      .eq("is_active", true)
      .eq("is_default", true)
      .single();

    if (!template) {
      logStep("No active welcome template found");
      return new Response(
        JSON.stringify({ success: false, reason: "No welcome template configured" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Schedule dashboard message for 5 minutes
    await supabaseAdmin
      .from("scheduled_notifications")
      .insert({
        title: template.subject,
        body: template.content,
        target_audience: `user:${record.user_id}`,
        scheduled_time: sendAt.toISOString(),
        status: "pending",
        recurrence_pattern: "once",
      });

    // Schedule email for 5 minutes
    await supabaseAdmin
      .from("scheduled_emails")
      .insert({
        subject: template.subject,
        body: template.content,
        target_audience: `user:${record.user_id}`,
        recipient_emails: [userEmail],
        scheduled_time: sendAt.toISOString(),
        status: "pending",
        recurrence_pattern: "once",
      });

    logStep("Welcome messages scheduled for 5 minutes", { sendAt: sendAt.toISOString() });

    return new Response(
      JSON.stringify({ success: true, message: "Welcome messages scheduled for 5 minutes" }),
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
