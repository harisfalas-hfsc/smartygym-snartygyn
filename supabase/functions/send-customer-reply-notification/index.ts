import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { getAdminNotificationEmail } from "../_shared/admin-settings.ts";
import { logEmailDelivery } from "../_shared/email-log.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") || "";
    const supabaseUserClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userErr } = await supabaseUserClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messageId, replyContent } = await req.json();
    if (!messageId || !replyContent || typeof replyContent !== "string") {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (replyContent.length > 5000) {
      return new Response(JSON.stringify({ error: "Reply too long" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Load the original thread and verify ownership
    const { data: thread, error: threadErr } = await admin
      .from("contact_messages")
      .select("id, user_id, name, email, subject, message")
      .eq("id", messageId)
      .maybeSingle();

    if (threadErr || !thread) {
      return new Response(JSON.stringify({ error: "Thread not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (thread.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert customer reply into history (RLS allows this for the owner)
    const { error: histErr } = await admin
      .from("contact_message_history")
      .insert({
        contact_message_id: messageId,
        message_type: "customer_reply",
        content: replyContent.trim(),
        sender: "customer",
      });
    if (histErr) {
      console.error("History insert error:", histErr);
      return new Response(JSON.stringify({ error: "Failed to save reply" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Re-open the thread so admin sees it as actionable; clear admin read state
    await admin
      .from("contact_messages")
      .update({
        status: "new",
        response_read_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", messageId);

    const adminEmail = await getAdminNotificationEmail(admin);
    const safeName = escapeHtml(thread.name || "Customer");
    const safeEmail = escapeHtml(thread.email || user.email || "");
    const safeSubject = escapeHtml(thread.subject || "Contact thread");
    const safeReply = escapeHtml(replyContent.trim()).replace(/\n/g, "<br>");
    const safeOriginal = escapeHtml(thread.message || "").replace(/\n/g, "<br>");

    let resendId: string | null = null;
    try {
      const result = await resend.emails.send({
        from: "SmartyGym Contact <notifications@smartygym.com>",
        to: [adminEmail],
        replyTo: thread.email || user.email || undefined,
        subject: `[SmartyGym Reply] ${safeSubject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #29B6D2; color: white; padding: 15px; border-radius: 5px 5px 0 0;">
              <h2 style="margin: 0;">Customer Replied to Their Thread</h2>
            </div>
            <div style="background-color: #f5f5f5; padding: 20px;">
              <p><strong>From:</strong> ${safeName} &lt;${safeEmail}&gt;</p>
              <p><strong>Subject:</strong> ${safeSubject}</p>
            </div>
            <div style="margin: 20px 0;">
              <p style="font-weight: bold;">New reply from customer:</p>
              <div style="background-color: #fff; padding: 15px; border-left: 4px solid #29B6D2; border-radius: 0 5px 5px 0;">
                ${safeReply}
              </div>
            </div>
            <div style="margin: 20px 0;">
              <p style="font-weight: bold; color: #666;">Original message:</p>
              <div style="background-color: #fafafa; padding: 12px; border-left: 3px solid #ccc; color: #555; font-size: 13px;">
                ${safeOriginal}
              </div>
            </div>
            <p style="font-size: 12px; color: #999;">Reply directly to this email or respond via the admin dashboard to continue the conversation.</p>
          </div>
        `,
      });
      resendId = result?.data?.id ?? null;
      await logEmailDelivery({
        toEmail: adminEmail,
        messageType: "contact-customer-reply",
        status: "sent",
        resendId,
        metadata: { from_email: thread.email, subject: thread.subject, messageId },
      });
    } catch (sendErr: any) {
      console.error("Failed to send admin notification email:", sendErr);
      await logEmailDelivery({
        toEmail: adminEmail,
        messageType: "contact-customer-reply",
        status: "failed",
        errorMessage: sendErr?.message || String(sendErr),
      });
      // Continue: reply was saved even if email failed
    }

    return new Response(JSON.stringify({ success: true, resendId }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in send-customer-reply-notification:", error);
    return new Response(JSON.stringify({ error: error?.message || "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});