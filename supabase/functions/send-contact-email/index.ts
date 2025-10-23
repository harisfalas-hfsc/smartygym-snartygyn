import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
  recipientEmail: string;
  userStatus?: string;
}

// Simple HTML sanitizer to prevent XSS
function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Rate limiting: 3 requests per hour per IP
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 3;

async function checkRateLimit(identifier: string): Promise<boolean> {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
  
  const { data } = await supabaseClient
    .from('rate_limits')
    .select('request_count')
    .eq('identifier', identifier)
    .eq('endpoint', 'contact-email')
    .gte('window_start', windowStart.toISOString())
    .maybeSingle();

  if (!data) {
    await supabaseClient.from('rate_limits').insert({
      identifier,
      endpoint: 'contact-email',
      request_count: 1,
      window_start: new Date().toISOString()
    });
    return true;
  }

  if (data.request_count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  await supabaseClient
    .from('rate_limits')
    .update({ request_count: data.request_count + 1 })
    .eq('identifier', identifier)
    .eq('endpoint', 'contact-email')
    .gte('window_start', windowStart.toISOString());

  return true;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message, recipientEmail, userStatus }: ContactEmailRequest = await req.json();

    // Input validation
    if (!name || !email || !subject || !message || !recipientEmail) {
      return new Response(
        JSON.stringify({ error: 'All fields are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate lengths
    if (name.length > 100 || email.length > 255 || subject.length > 200 || message.length > 2000) {
      return new Response(
        JSON.stringify({ error: 'Input exceeds maximum length' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const canProceed = await checkRateLimit(ipAddress);
    
    if (!canProceed) {
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize all inputs
    const safeName = sanitizeHtml(name.trim());
    const safeEmail = sanitizeHtml(email.trim());
    const safeSubject = sanitizeHtml(subject.trim());
    const safeMessage = sanitizeHtml(message.trim()).replace(/\n/g, '<br>');
    const safeUserStatus = userStatus ? sanitizeHtml(userStatus) : '';

    console.log(`Sending email from ${email} to ${recipientEmail}`);

    const emailResponse = await resend.emails.send({
      from: "Smarty Gym Contact <onboarding@resend.dev>",
      to: [recipientEmail],
      replyTo: email,
      subject: `[Smarty Gym Contact] ${safeSubject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #000; padding-bottom: 10px;">New Contact Message</h2>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>From:</strong> ${safeName}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${safeEmail}</p>
            <p style="margin: 5px 0;"><strong>Subject:</strong> ${safeSubject}</p>
            ${safeUserStatus ? `<p style="margin: 5px 0;"><strong>User Status:</strong> <span style="color: #d4af37; font-weight: bold;">${safeUserStatus}</span></p>` : ''}
          </div>
          
          <div style="margin: 20px 0;">
            <p style="margin-bottom: 10px;"><strong>Message:</strong></p>
            <div style="background-color: #fff; padding: 15px; border-left: 3px solid #000;">
              ${safeMessage}
            </div>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
            <p>This message was sent via the Smarty Gym contact form at smartygym.com</p>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: 'Failed to send message. Please try again.' }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
