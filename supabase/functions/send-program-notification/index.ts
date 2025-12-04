import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@3.5.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[SEND-PROGRAM-NOTIFICATION] ${step}${detailsStr}`);
};

interface NotificationRequest {
  userId: string;
  userEmail: string;
  userName: string;
  programName: string;
  notificationType: 'program_delivered' | 'status_update';
  newStatus?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { userId, userEmail, userName, programName, notificationType, newStatus }: NotificationRequest = await req.json();
    logStep("Processing notification", { userId, notificationType });

    // Create Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Check user notification preferences
    const { data: preferences } = await supabaseAdmin
      .from("notification_preferences")
      .select("promotional_emails, renewal_reminders")
      .eq("user_id", userId)
      .single();

    // Skip if user has disabled relevant emails
    if (preferences && !preferences.promotional_emails) {
      logStep("User has disabled promotional emails, skipping");
      return new Response(
        JSON.stringify({ success: false, reason: "User preferences: promotional emails disabled" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let subject = "";
    let htmlBody = "";

    if (notificationType === 'program_delivered') {
      subject = `Your Personal Training Program is Ready! 🎉`;
      htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #D4AF37;">Your Personal Training Program is Ready!</h1>
          <p>Hi ${userName},</p>
          <p>Great news! Your custom personal training program "<strong>${programName}</strong>" has been created and is now available in your dashboard.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h2 style="color: #333; margin-top: 0;">What's Next?</h2>
            <ul style="line-height: 1.8;">
              <li>Log in to your SmartyGym account</li>
              <li>Navigate to "My Purchases" in your dashboard</li>
              <li>Start your personalized fitness journey!</li>
            </ul>
          </div>

          <p>This program has been specifically designed for you based on your goals, fitness level, and available equipment.</p>
          
          <p style="margin-top: 30px;">
            <a href="${Deno.env.get("SUPABASE_URL")?.replace('supabase.co', 'lovable.app') || '#'}" 
               style="background-color: #D4AF37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Your Program
            </a>
          </p>

          <p style="margin-top: 30px; color: #666;">
            Questions? Reply to this email or contact us through the website.
          </p>
          
          <p style="color: #666;">
            Best regards,<br>
            <strong>Coach Harris Phalas</strong><br>
            SmartyGym Personal Training
          </p>
        </div>
      `;
    } else if (notificationType === 'status_update') {
      if (newStatus === 'in_progress') {
        subject = `Your Personal Training Request - Work Started`;
        htmlBody = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #D4AF37;">We're Working On Your Program!</h1>
            <p>Hi ${userName},</p>
            <p>Good news! We've started working on your custom personal training program.</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <p style="margin: 0;">Your program is being carefully crafted to match your specific goals and requirements. We'll notify you as soon as it's ready!</p>
            </div>

            <p>Expected delivery: <strong>Within 48-72 hours</strong></p>
            
            <p style="margin-top: 30px; color: #666;">
              Best regards,<br>
              <strong>Coach Harris Phalas</strong><br>
              SmartyGym Personal Training
            </p>
          </div>
        `;
      } else if (newStatus === 'completed') {
        subject = `Your Personal Training Program is Complete!`;
        htmlBody = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #D4AF37;">Your Program is Complete!</h1>
            <p>Hi ${userName},</p>
            <p>Your custom personal training program has been completed and is now available in your dashboard.</p>
            
            <p style="margin-top: 30px;">
              <a href="${Deno.env.get("SUPABASE_URL")?.replace('supabase.co', 'lovable.app') || '#'}" 
                 style="background-color: #D4AF37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Access Your Program
              </a>
            </p>
            
            <p style="margin-top: 30px; color: #666;">
              Best regards,<br>
              <strong>Coach Harris Phalas</strong><br>
              SmartyGym Personal Training
            </p>
          </div>
        `;
      }
    }

    // Send email
    const emailResponse = await resend.emails.send({
      from: "SmartyGym <notifications@smartygym.com>",
      to: [userEmail],
      subject: subject,
      html: htmlBody,
    });

    logStep("Notification email sent", { emailId: emailResponse.data?.id });

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse.data?.id }),
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