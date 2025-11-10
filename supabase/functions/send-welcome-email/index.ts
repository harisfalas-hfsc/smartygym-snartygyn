import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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

    // Get welcome email template
    const { data: template, error: templateError } = await supabaseAdmin
      .from("email_templates")
      .select("*")
      .eq("category", "welcome")
      .eq("is_active", true)
      .single();

    if (templateError || !template) {
      logStep("No welcome template found, using default");
    }

    // Replace placeholders in template
    const subject = template?.subject.replace(/{{name}}/g, userName) || `Welcome to SmartyGym, ${userName}!`;
    const body = template?.body.replace(/{{name}}/g, userName) || 
      `Hello ${userName}!\n\nWelcome to SmartyGym! We're excited to have you join our fitness community.`;

    // Send email
    const emailResponse = await resend.emails.send({
      from: "SmartyGym <onboarding@resend.dev>",
      to: [userEmail],
      subject: subject,
      html: body.replace(/\n/g, "<br>"),
    });

    logStep("Welcome email sent", { emailId: emailResponse.id });

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse.id }),
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
