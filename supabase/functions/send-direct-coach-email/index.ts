import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const COACH_EMAIL = "harisfalas@gmail.com";

interface DirectCoachEmailRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
  attachments?: { name: string; url: string; size: number; type: string }[];
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-direct-coach-email function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message, attachments }: DirectCoachEmailRequest = await req.json();

    console.log(`Processing direct coach email from: ${name} (${email})`);
    console.log(`Subject: ${subject}`);

    // Build attachments HTML if any
    let attachmentsHtml = "";
    if (attachments && attachments.length > 0) {
      attachmentsHtml = `
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
          <h3 style="color: #333; margin-bottom: 10px;">Attachments:</h3>
          <ul style="list-style: none; padding: 0;">
            ${attachments.map(att => `
              <li style="margin-bottom: 8px;">
                <a href="${att.url}" style="color: #2563eb; text-decoration: none;">
                  📎 ${att.name}
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

    // Send direct email to coach
    const emailResponse = await resend.emails.send({
      from: "SmartyGym <noreply@smartygym.com>",
      to: [COACH_EMAIL],
      reply_to: email,
      subject: `[Direct from Premium] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">💬 Direct Message from Premium Member</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; width: 80px;"><strong>From:</strong></td>
                <td style="padding: 8px 0; color: #111827;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;"><strong>Email:</strong></td>
                <td style="padding: 8px 0; color: #111827;">
                  <a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;"><strong>Subject:</strong></td>
                <td style="padding: 8px 0; color: #111827;">${subject}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
            <h3 style="color: #374151; margin-top: 0;">Message:</h3>
            <div style="color: #4b5563; line-height: 1.6; white-space: pre-wrap;">${message}</div>
            ${attachmentsHtml}
          </div>
          
          <div style="background: #f3f4f6; padding: 15px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
            <p style="margin: 0; color: #6b7280; font-size: 12px; text-align: center;">
              This is a direct message from a Premium member via SmartyGym. 
              Reply directly to this email to respond to ${name}.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Direct coach email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-direct-coach-email function:", error);
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
