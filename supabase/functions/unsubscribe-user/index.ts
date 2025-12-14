import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Email type mapping for preference keys
const EMAIL_TYPE_TO_PREF_KEY: Record<string, string> = {
  wod: "email_wod",
  ritual: "email_ritual",
  monday_motivation: "email_monday_motivation",
  new_workout: "email_new_workout",
  new_program: "email_new_program",
  new_article: "email_new_article",
  weekly_activity: "email_weekly_activity",
  checkin_reminders: "email_checkin_reminders",
};

// Friendly names for email types
const EMAIL_TYPE_NAMES: Record<string, string> = {
  wod: "Workout of the Day",
  ritual: "Smarty Ritual",
  monday_motivation: "Monday Motivation",
  new_workout: "New Workout Notifications",
  new_program: "New Training Program Notifications",
  new_article: "New Blog Article Notifications",
  weekly_activity: "Weekly Activity Report",
  checkin_reminders: "Check-in Reminders",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, type } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailType = type as string | undefined;
    const isTypeSpecific = emailType && EMAIL_TYPE_TO_PREF_KEY[emailType];

    console.log(`[UNSUBSCRIBE] Processing ${isTypeSpecific ? `type-specific (${emailType})` : 'global'} unsubscribe for: ${email}`);

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
    
    // Handle type-specific unsubscribe
    if (isTypeSpecific) {
      const prefKey = EMAIL_TYPE_TO_PREF_KEY[emailType];
      
      // Check if already unsubscribed from this type
      if (currentPrefs[prefKey] === false) {
        console.log(`[UNSUBSCRIBE] User already unsubscribed from ${emailType}: ${email}`);
        return new Response(
          JSON.stringify({ 
            success: true, 
            already_unsubscribed: true,
            type: emailType,
            type_name: EMAIL_TYPE_NAMES[emailType]
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Update only the specific preference
      const updatedPrefs = {
        ...currentPrefs,
        [prefKey]: false,
        [`${prefKey}_unsubscribed_at`]: new Date().toISOString(),
      };

      // Also update legacy field for checkin_reminders
      if (emailType === 'checkin_reminders') {
        updatedPrefs.checkin_reminders = false;
      }

      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({ notification_preferences: updatedPrefs })
        .eq("user_id", user.id);

      if (updateError) {
        console.error("[UNSUBSCRIBE] Error updating preferences:", updateError);
        throw updateError;
      }

      console.log(`[UNSUBSCRIBE] User unsubscribed from ${emailType}: ${email}`);

      return new Response(
        JSON.stringify({ 
          success: true,
          type: emailType,
          type_name: EMAIL_TYPE_NAMES[emailType]
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle global unsubscribe (no type specified)
    // Check if already unsubscribed from all
    if (currentPrefs.opt_out_all === true) {
      console.log(`[UNSUBSCRIBE] User already unsubscribed from all: ${email}`);
      return new Response(
        JSON.stringify({ success: true, already_unsubscribed: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update preferences to opt out of all
    const updatedPrefs = {
      ...currentPrefs,
      opt_out_all: true,
      email_notifications: false,
      newsletter: false,
      promotional_emails: false,
      email_wod: false,
      email_ritual: false,
      email_monday_motivation: false,
      email_new_workout: false,
      email_new_program: false,
      email_new_article: false,
      email_weekly_activity: false,
      email_checkin_reminders: false,
      checkin_reminders: false,
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

    console.log(`[UNSUBSCRIBE] User unsubscribed from all: ${email}`);

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
