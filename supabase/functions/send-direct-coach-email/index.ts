import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { logEmailDelivery } from "../_shared/email-log.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Coach personal inbox for Premium direct messages.
// Keep this separate from admin Outlook inbox used by the general contact form.
const COACH_PERSONAL_EMAIL = "harisfalas@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface DirectCoachEmailRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
  attachments?: { name: string; url: string; size: number; type: string }[];
}

function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Require an authenticated user (feature is intended for logged-in Premium members).
  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  try {
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data, error } = await sb.auth.getUser(token);
    if (error || !data?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (_e) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { name, email, subject, message, attachments }: DirectCoachEmailRequest = await req.json();

    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const safeName = sanitizeHtml(name.trim());
    const safeEmail = sanitizeHtml(email.trim());
    const safeSubject = sanitizeHtml(subject.trim());
    const safeMessage = sanitizeHtml(message.trim()).replace(/\n/g, "<br>");

    console.log(`[send-direct-coach-email] From ${name} <${email}> → ${COACH_PERSONAL_EMAIL}`);

    // Attachments HTML
    let attachmentsHtml = "";
    if (attachments && attachments.length > 0) {
      attachmentsHtml = `
        <div style="margin: 20px 0;">
          <p style="font-weight: bold; color: #333; margin-bottom: 10px;">📎 Attachments:</p>
          <ul style="list-style: none; padding: 0; margin: 0;">
            ${attachments.map(att => `
              <li style="margin-bottom: 8px; background-color: #f5f5f5; padding: 10px; border-radius: 4px;">
                <a href="${att.url}" style="color: #29B6D2; text-decoration: none; font-weight: 500;">
                  ${sanitizeHtml(att.name)}
                </a>
                <span style="color: #666; font-size: 12px; margin-left: 8px;">
                  (${(att.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    }

    // 1) Send to coach personal email (matches working contact-form admin layout)
    let coachResponse: any;
    try {
      coachResponse = await resend.emails.send({
        from: "SmartyGym Premium <notifications@smartygym.com>",
        to: [COACH_PERSONAL_EMAIL],
        replyTo: email,
        subject: `[SmartyGym Premium Direct] ${safeSubject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #29B6D2; color: white; padding: 15px; border-radius: 5px 5px 0 0;">
              <h2 style="margin: 0;">💬 Direct Message from Premium Member</h2>
              <p style="margin: 5px 0 0 0; opacity: 0.9;">Channel: <strong>Direct Access to Your Coach</strong></p>
            </div>

            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 0 0 5px 5px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #333; width: 100px;">From:</td>
                  <td style="padding: 8px 0; color: #333;">${safeName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #333;">Email:</td>
                  <td style="padding: 8px 0;"><a href="mailto:${safeEmail}" style="color: #29B6D2;">${safeEmail}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #333;">Subject:</td>
                  <td style="padding: 8px 0; color: #333;">${safeSubject}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #333;">Status:</td>
                  <td style="padding: 8px 0;"><span style="background-color: #d4af37; color: white; padding: 2px 8px; border-radius: 3px; font-size: 12px;">Premium</span></td>
                </tr>
              </table>
            </div>

            <div style="margin: 20px 0;">
              <p style="font-weight: bold; color: #333; margin-bottom: 10px;">📥 Original Message:</p>
              <div style="background-color: #fff; padding: 15px; border-left: 4px solid #29B6D2; border-radius: 0 5px 5px 0;">
                ${safeMessage}
              </div>
            </div>

            ${attachmentsHtml}

            <div style="margin-top: 20px; padding: 15px; background-color: #f0f0f0; border-radius: 5px;">
              <p style="margin: 0; font-size: 14px; color: #666;">
                <strong>Quick Action:</strong> Reply directly to this email to respond to ${safeName}.
              </p>
            </div>

            <div style="margin-top: 20px; color: #999; font-size: 11px;">
              <p>SmartyGym Premium Direct Coach Channel • ${new Date().toLocaleString('en-CY', { timeZone: 'Europe/Nicosia' })} Cyprus Time</p>
            </div>
          </div>
        `,
      });
      console.log("[send-direct-coach-email] Coach email sent:", coachResponse?.data?.id);
      await logEmailDelivery({
        toEmail: COACH_PERSONAL_EMAIL,
        messageType: "direct-coach-email",
        status: "sent",
        resendId: coachResponse?.data?.id ?? null,
        metadata: { from_name: name, from_email: email, subject },
      });
    } catch (sendErr: any) {
      await logEmailDelivery({
        toEmail: COACH_PERSONAL_EMAIL,
        messageType: "direct-coach-email",
        status: "failed",
        errorMessage: sendErr?.message || String(sendErr),
        metadata: { from_name: name, from_email: email, subject },
      });
      throw sendErr;
    }

    // 2) Send confirmation to the Premium sender
    try {
      const confirmResult = await resend.emails.send({
        from: "SmartyGym <notifications@smartygym.com>",
        to: [email],
        subject: "Your message to Haris was received",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #29B6D2; color: white; padding: 15px; border-radius: 5px 5px 0 0;">
              <h2 style="margin: 0;">Message Delivered to Your Coach</h2>
            </div>

            <div style="padding: 20px; background-color: #f9f9f9;">
              <p style="font-size: 16px; color: #333; margin-top: 0;">Hi ${safeName},</p>
              <p style="color: #333; line-height: 1.6;">
                Your message has reached <strong>Haris Falas</strong> directly.
                As a Premium member, you'll get a personal reply from your coach — no automated answers, no AI, just real human support.
              </p>

              <div style="margin: 20px 0; background-color: #fff; padding: 15px; border-left: 4px solid #29B6D2; border-radius: 0 5px 5px 0;">
                <p style="margin: 0 0 8px 0; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">Your message — Subject: ${safeSubject}</p>
                <div style="color: #333; line-height: 1.6;">${safeMessage}</div>
              </div>

              <p style="color: #333;">Haris typically replies within 24–48 hours.</p>
            </div>

            <div style="padding: 15px; background-color: #f0f0f0; border-radius: 0 0 5px 5px; font-size: 12px; color: #666;">
              <p style="margin: 0;">Best regards,<br><strong>The SmartyGym Team</strong></p>
              <p style="margin: 10px 0 0 0;">This is an automated delivery confirmation. Haris's personal reply will follow.</p>
            </div>
          </div>
        `,
      });
      console.log("[send-direct-coach-email] Confirmation sent to:", email);
      await logEmailDelivery({
        toEmail: email,
        messageType: "direct-coach-confirmation",
        status: "sent",
        resendId: confirmResult?.data?.id ?? null,
        metadata: { from_name: name, subject },
      });
    } catch (confirmErr: any) {
      // Don't fail the request if confirmation send fails
      console.error("[send-direct-coach-email] Confirmation failed:", confirmErr);
      await logEmailDelivery({
        toEmail: email,
        messageType: "direct-coach-confirmation",
        status: "failed",
        errorMessage: confirmErr?.message || String(confirmErr),
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("[send-direct-coach-email] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
