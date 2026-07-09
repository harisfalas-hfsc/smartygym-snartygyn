// One-shot admin trigger: sends premium-welcome, workout-purchase,
// and program-purchase messages (dashboard + email) to a target user.
// Invoked manually to verify the full purchase-confirmation pipeline.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@3.5.0";
import { getEmailHeaders, wrapInEmailTemplateWithFooter } from "../_shared/email-utils.ts";
import { logEmailDelivery } from "../_shared/email-log.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const targetEmail: string = body.email || "hfsc.nicosia@gmail.com";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    // Resolve user
    let userId: string | null = null;
    let page = 1;
    while (true) {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 100 });
      if (error || !data?.users?.length) break;
      const hit = data.users.find((u) => (u.email || "").toLowerCase() === targetEmail.toLowerCase());
      if (hit) { userId = hit.id; break; }
      if (data.users.length < 100) break;
      page++;
    }
    if (!userId) throw new Error(`User not found: ${targetEmail}`);

    const resend = new Resend(Deno.env.get("RESEND_API_KEY") ?? "");

    const messages = [
      {
        message_type: "purchase_subscription",
        subject: "Welcome to SmartyGym Premium 🎉",
        content: `
          <div style="font-family:Arial,sans-serif;color:#0F172A;line-height:1.6;">
            <h2 style="color:#29B6D2;margin:0 0 8px 0;">Welcome to Premium 🎉</h2>
            <p><strong>100% Human. 0% AI.</strong> Every workout, program and tool inside SmartyGym is designed by Coach Haris Falas — real coaching, decades of practice.</p>
            <p>Your <strong>Premium Membership (€9.99 / month)</strong> is now active. You have full access to:</p>
            <ul style="padding-left:20px;">
              <li>🔥 Workout of the Day</li>
              <li>🏋️ 500+ Workouts (Strength, HIIT, Mobility, Pilates, Recovery)</li>
              <li>📋 Training Programs on the 84-day periodization cycle</li>
              <li>📚 Full Exercise Library</li>
              <li>🧮 Smart Tools (macro, calorie, timer, 1RM, BMR)</li>
              <li>📊 Logbook, Goals & Community Leaderboards</li>
            </ul>
            <p>Your subscription renews automatically each month. You can manage or cancel anytime from your dashboard.</p>
            <div style="text-align:center;margin:24px 0;">
              <a href="https://smartygym.com/userdashboard" style="background:#29B6D2;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold;">Go to Your Dashboard →</a>
            </div>
            <p style="font-size:13px;color:#64748B;">Train smarter, not harder.<br/>— Coach Haris & the SmartyGym Team</p>
          </div>
        `,
      },
      {
        message_type: "purchase_workout",
        subject: "Your SmartyGym workout is ready 💪",
        content: `
          <div style="font-family:Arial,sans-serif;color:#0F172A;line-height:1.6;">
            <h2 style="color:#29B6D2;margin:0 0 8px 0;">Workout unlocked 💪</h2>
            <p>Thank you for your purchase. Your standalone workout has been added to your SmartyGym account and is ready to train.</p>
            <p>Find it any time in <strong>Dashboard → My Workouts</strong>. You keep lifetime access to every workout you buy.</p>
            <div style="text-align:center;margin:24px 0;">
              <a href="https://smartygym.com/userdashboard?tab=workouts" style="background:#29B6D2;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold;">Open My Workouts →</a>
            </div>
            <p style="font-size:13px;color:#64748B;">Train smarter, not harder.<br/>— The SmartyGym Team</p>
          </div>
        `,
      },
      {
        message_type: "purchase_program",
        subject: "Your SmartyGym training program is ready 🏋️",
        content: `
          <div style="font-family:Arial,sans-serif;color:#0F172A;line-height:1.6;">
            <h2 style="color:#29B6D2;margin:0 0 8px 0;">Program unlocked 🏋️</h2>
            <p>Thank you for your purchase. Your standalone training program has been added to your SmartyGym account and is ready to start.</p>
            <p>Find it any time in <strong>Dashboard → My Programs</strong>. You keep lifetime access to every program you buy.</p>
            <div style="text-align:center;margin:24px 0;">
              <a href="https://smartygym.com/userdashboard?tab=programs" style="background:#29B6D2;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold;">Open My Programs →</a>
            </div>
            <p style="font-size:13px;color:#64748B;">Train smarter, not harder.<br/>— The SmartyGym Team</p>
          </div>
        `,
      },
    ];

    const results: any[] = [];

    for (const m of messages) {
      // Dashboard insert
      const { error: dbErr } = await supabase.from("user_system_messages").insert({
        user_id: userId,
        message_type: m.message_type,
        subject: m.subject,
        content: m.content,
        is_read: false,
      });

      // Email
      let emailOk = false;
      let emailErr: string | null = null;
      try {
        const html = wrapInEmailTemplateWithFooter(
          m.subject,
          m.content,
          targetEmail,
          "https://smartygym.com/userdashboard",
          "Go to Dashboard",
        );
        const result = await resend.emails.send({
          from: "SmartyGym <notifications@smartygym.com>",
          reply_to: "support@smartygym.com",
          to: [targetEmail],
          subject: m.subject,
          html,
          headers: getEmailHeaders(targetEmail),
        });
        emailOk = true;
        await logEmailDelivery({
          userId,
          toEmail: targetEmail,
          messageType: m.message_type,
          status: "sent",
          resendId: result?.data?.id ?? null,
          metadata: { source: "admin-test-purchase-messages" },
        });
      } catch (e) {
        emailErr = e instanceof Error ? e.message : String(e);
        await logEmailDelivery({
          userId,
          toEmail: targetEmail,
          messageType: m.message_type,
          status: "failed",
          errorMessage: emailErr,
          metadata: { source: "admin-test-purchase-messages" },
        });
      }

      results.push({
        message_type: m.message_type,
        dashboard_ok: !dbErr,
        dashboard_error: dbErr?.message ?? null,
        email_ok: emailOk,
        email_error: emailErr,
      });

      // small delay to avoid Resend rate-limits
      await new Promise((r) => setTimeout(r, 600));
    }

    return new Response(JSON.stringify({ success: true, userId, targetEmail, results }, null, 2), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err instanceof Error ? err.message : String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});