import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[UNSUBSCRIBE] Processing unsubscribe for: ${email}`);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Find user by email
    const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (userError) {
      console.error("[UNSUBSCRIBE] Error listing users:", userError);
      throw userError;
    }

    const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      // Check newsletter_subscribers
      const { data: subscriber } = await supabaseAdmin
        .from("newsletter_subscribers")
        .select("*")
        .eq("email", email.toLowerCase())
        .maybeSingle();

      if (subscriber) {
        await supabaseAdmin
          .from("newsletter_subscribers")
          .update({ active: false })
          .eq("email", email.toLowerCase());

        console.log(`[UNSUBSCRIBE] Newsletter subscriber unsubscribed: ${email}`);
        return new Response(
          JSON.stringify({ success: true, type: "newsletter" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`[UNSUBSCRIBE] User not found: ${email}`);
      // Return success anyway to prevent enumeration attacks
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get current notification preferences
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("notification_preferences")
      .eq("user_id", user.id)
      .single();

    const currentPrefs = (profile?.notification_preferences as Record<string, any>) || {};
    
    // Check if already unsubscribed
    if (currentPrefs.opt_out_all === true) {
      console.log(`[UNSUBSCRIBE] User already unsubscribed: ${email}`);
      return new Response(
        JSON.stringify({ success: true, already_unsubscribed: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update preferences to opt out
    const updatedPrefs = {
      ...currentPrefs,
      opt_out_all: true,
      email_notifications: false,
      newsletter: false,
      promotional_emails: false,
      unsubscribed_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ notification_preferences: updatedPrefs })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("[UNSUBSCRIBE] Error updating preferences:", updateError);
      throw updateError;
    }

    // Also update notification_preferences table if it exists
    await supabaseAdmin
      .from("notification_preferences")
      .upsert({
        user_id: user.id,
        promotional_emails: false,
        renewal_reminders: false,
      }, { onConflict: "user_id" });

    console.log(`[UNSUBSCRIBE] User unsubscribed successfully: ${email}`);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[UNSUBSCRIBE] ERROR:", errorMessage);
    
    // Return success anyway to prevent spam reports
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
