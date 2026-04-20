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
    await client.from("email_delivery_log").insert({
      user_id: params.userId ?? null,
      to_email: params.toEmail,
      message_type: params.messageType,
      status: params.status,
      resend_id: params.resendId ?? null,
      error_message: params.errorMessage ?? null,
      metadata: params.metadata ?? null,
    });
  } catch (err) {
    console.error("[email-log] Failed to write delivery log:", err);
  }
}
