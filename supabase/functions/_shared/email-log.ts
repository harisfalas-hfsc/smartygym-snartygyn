// Shared helper to log every email send attempt to email_delivery_log
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

export async function logEmailDelivery(params: {
  userId?: string | null;
  toEmail: string;
  messageType: string;
  status: "sent" | "failed";
  resendId?: string | null;
  errorMessage?: string | null;
  metadata?: Record<string, any>;
}) {
  try {
    const client = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    // Enrich the error message for the notorious Resend SDK case where the
    // provider returns an HTML error page (rate limit / quota / 5xx) and the
    // SDK throws "Unexpected token '<', '<!DOCTYPE ...'" — opaque on its own.
    let errorMessage = params.errorMessage ?? null;
    if (errorMessage && /Unexpected token '<'/.test(errorMessage)) {
      errorMessage = `Resend returned HTML (likely rate-limit / quota / 5xx). Raw: ${errorMessage.slice(0, 200)}`;
    }
    const { error: insertError } = await client.from("email_delivery_log").insert({
      user_id: params.userId ?? null,
      to_email: params.toEmail,
      message_type: params.messageType,
      status: params.status,
      resend_id: params.resendId ?? null,
      error_message: errorMessage,
      metadata: params.metadata ?? null,
    });
    if (insertError) {
      console.error("[email-log] Insert failed:", insertError.message, {
        toEmail: params.toEmail,
        messageType: params.messageType,
        status: params.status,
      });
    }
  } catch (err) {
    console.error("[email-log] Failed to write delivery log:", err);
  }
}
