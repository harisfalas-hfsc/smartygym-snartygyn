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
  console.log(`[SEND-CONTACT-RESPONSE-NOTIFICATION] ${step}${detailsStr}`);
};

interface NotificationRequest {
  userId: string;
  userEmail: string;
  userName: string;
  subject: string;
  responsePreview: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { userId, userEmail, userName, subject, responsePreview }: NotificationRequest = await req.json();
    logStep("Processing notification", { userId });

    // Create Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Check user notification preferences
    const { data: preferences } = await supabaseAdmin
      .from("notification_preferences")
      .select("promotional_emails")
      .eq("user_id", userId)
      .single();

    // Skip if user has disabled emails
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

    const dashboardUrl = `${Deno.env.get("SUPABASE_URL")?.replace('supabase.co', 'lovable.app') || '#'}/dashboard`;

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #D4AF37;">You Have a New Response! 💬</h1>
        <p>Hi ${userName},</p>
        <p>Great news! We've responded to your message regarding "<strong>${subject}</strong>".</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #D4AF37;">
          <p style="margin: 0; color: #666; font-style: italic;">
            "${responsePreview.substring(0, 150)}${responsePreview.length > 150 ? '...' : ''}"
          </p>
        </div>

        <p>Log in to your dashboard to read the full response and continue the conversation.</p>
        
        <p style="margin-top: 30px;">
          <a href="${dashboardUrl}" 
             style="background-color: #D4AF37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View Response in Dashboard
          </a>
        </p>

        <p style="margin-top: 30px; color: #666;">
          Best regards,<br>
          <strong>The SmartyGym Team</strong>
        </p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
        
        <p style="color: #999; font-size: 12px;">
          You're receiving this email because you contacted us through SmartyGym. 
          To manage your notification preferences, visit your dashboard settings.
        </p>
      </div>
    `;

    // Send email
    const emailResponse = await resend.emails.send({
      from: "SmartyGym <notifications@smartygym.com>",
      to: [userEmail],
      subject: `New Response to Your Message: ${subject}`,
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