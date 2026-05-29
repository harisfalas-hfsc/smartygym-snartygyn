import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Cron Heartbeat
 *
 * Runs hourly. Reads cron_job_metadata and verifies each active job has run
 * within a reasonable window of its schedule. Emails the admin the moment
 * any CRITICAL job is overdue. This is the watchdog that would have caught
 * the dead system-health-audit cron on day 1.
 *
 * Heuristic for "overdue":
 *   - We approximate the expected interval between runs from the cron expression.
 *   - A job is overdue if last_run_at is older than (expected_interval * 2 + 30 min grace).
 *   - Jobs that have never run yet are flagged if metadata is older than 24h.
 */

const PROJECT_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_KEY = Deno.env.get("RESEND_API_KEY");
const ADMIN_EMAIL = "harisfalas@gmail.com"; // SmartyGym admin

type CronRow = {
  job_name: string;
  display_name: string;
  schedule: string;
  edge_function_name: string | null;
  is_critical: boolean;
  is_active: boolean;
  last_run_at: string | null;
  last_run_status: string | null;
  consecutive_failures: number;
  created_at: string;
};

/** Roughly estimate the expected interval (in minutes) between runs from a cron expression. */
function estimateIntervalMinutes(cron: string): number {
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) return 24 * 60; // unknown -> 1 day
  const [minute, hour, dom, month, dow] = parts;

  // Daily at fixed time
  if (minute !== "*" && !minute.startsWith("*/") && hour !== "*" && !hour.startsWith("*/")
      && dom === "*" && month === "*" && dow === "*") {
    return 24 * 60;
  }
  // Weekly
  if (dow !== "*" && !dow.startsWith("*/")) return 7 * 24 * 60;
  // Monthly
  if (dom !== "*" && !dom.startsWith("*/")) return 30 * 24 * 60;
  // Yearly
  if (month !== "*") return 365 * 24 * 60;
  // Hourly step
  if (hour.startsWith("*/")) return parseInt(hour.slice(2), 10) * 60;
  // Minute step (every N minutes)
  if (minute.startsWith("*/")) return parseInt(minute.slice(2), 10);
  // Every minute
  if (minute === "*") return 1;
  // Hourly at fixed minute
  if (minute !== "*" && hour === "*") return 60;
  return 24 * 60;
}

function isOverdue(job: CronRow, nowMs: number): { overdue: boolean; reason: string; thresholdMinutes: number } {
  const intervalMin = estimateIntervalMinutes(job.schedule);
  // grace = 2x interval + 30 min, capped at 25h for daily jobs (so we alert ~1h after a daily missed run)
  let graceMin = intervalMin * 2 + 30;
  if (intervalMin >= 24 * 60) graceMin = 25 * 60;
  const thresholdMs = graceMin * 60 * 1000;

  if (!job.last_run_at) {
    // Never ran. Allow 24h after metadata creation before alerting.
    const createdMs = new Date(job.created_at).getTime();
    if (nowMs - createdMs > 24 * 60 * 60 * 1000) {
      return { overdue: true, reason: "never ran since registration", thresholdMinutes: graceMin };
    }
    return { overdue: false, reason: "new job, still in grace window", thresholdMinutes: graceMin };
  }

  const lastMs = new Date(job.last_run_at).getTime();
  const ageMin = Math.round((nowMs - lastMs) / 60000);
  if (nowMs - lastMs > thresholdMs) {
    return { overdue: true, reason: `last ran ${ageMin} minutes ago (threshold ${graceMin} min)`, thresholdMinutes: graceMin };
  }
  return { overdue: false, reason: `last ran ${ageMin} minutes ago`, thresholdMinutes: graceMin };
}

async function sendAlert(overdueJobs: Array<{ job: CronRow; reason: string }>) {
  if (!RESEND_KEY) {
    console.error("[cron-heartbeat] RESEND_API_KEY not set — cannot send alert");
    return;
  }
  const resend = new Resend(RESEND_KEY);
  const critical = overdueJobs.filter(j => j.job.is_critical);
  const subject = critical.length > 0
    ? `🚨 SmartyGym: ${critical.length} CRITICAL cron job(s) not running`
    : `⚠️ SmartyGym: ${overdueJobs.length} cron job(s) overdue`;

  const rows = overdueJobs.map(({ job, reason }) => `
    <tr style="background: ${job.is_critical ? '#fee2e2' : '#fef3c7'};">
      <td style="padding:10px;border:1px solid #ddd;font-weight:${job.is_critical ? 'bold' : 'normal'}">
        ${job.is_critical ? '🚨 ' : '⚠️ '}${job.display_name}
      </td>
      <td style="padding:10px;border:1px solid #ddd"><code>${job.job_name}</code></td>
      <td style="padding:10px;border:1px solid #ddd"><code>${job.schedule}</code></td>
      <td style="padding:10px;border:1px solid #ddd">${reason}</td>
      <td style="padding:10px;border:1px solid #ddd">${job.last_run_at ?? '— never —'}</td>
    </tr>
  `).join("");

  const html = `
    <h2>${subject}</h2>
    <p>The cron heartbeat detected ${overdueJobs.length} job(s) that have not run within their expected window.</p>
    <table style="border-collapse:collapse;width:100%;font-family:Arial,sans-serif;font-size:14px">
      <thead>
        <tr style="background:#f3f4f6">
          <th style="padding:10px;border:1px solid #ddd;text-align:left">Job</th>
          <th style="padding:10px;border:1px solid #ddd;text-align:left">Internal name</th>
          <th style="padding:10px;border:1px solid #ddd;text-align:left">Schedule</th>
          <th style="padding:10px;border:1px solid #ddd;text-align:left">Status</th>
          <th style="padding:10px;border:1px solid #ddd;text-align:left">Last run</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="margin-top:20px;color:#666;font-size:12px">
      Heartbeat run at ${new Date().toISOString()}. Re-register dead jobs from
      Admin → Cron Jobs Manager → Sync.
    </p>
  `;

  await resend.emails.send({
    from: "SmartyGym System <notifications@smartygym.com>",
    to: [ADMIN_EMAIL],
    subject,
    html,
  });
  console.log(`[cron-heartbeat] alert sent for ${overdueJobs.length} overdue job(s)`);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(PROJECT_URL, SERVICE_KEY);
  const nowMs = Date.now();

  const { data: jobs, error } = await supabase
    .from("cron_job_metadata")
    .select("job_name, display_name, schedule, edge_function_name, is_critical, is_active, last_run_at, last_run_status, consecutive_failures, created_at")
    .eq("is_active", true);

  if (error) {
    console.error("[cron-heartbeat] failed to load jobs", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Don't alert on the heartbeat itself — it would alert about its own absence
  const filtered = (jobs ?? []).filter((j: CronRow) => j.job_name !== "cron-heartbeat-hourly");

  const overdueJobs: Array<{ job: CronRow; reason: string }> = [];
  const report = filtered.map((job: CronRow) => {
    const r = isOverdue(job, nowMs);
    if (r.overdue) overdueJobs.push({ job, reason: r.reason });
    return { job_name: job.job_name, is_critical: job.is_critical, overdue: r.overdue, reason: r.reason };
  });

  // Record the heartbeat itself
  await supabase.from("cron_job_runs").insert({
    job_name: "cron-heartbeat-hourly",
    started_at: new Date(nowMs).toISOString(),
    finished_at: new Date().toISOString(),
    duration_ms: Date.now() - nowMs,
    status: "success",
    metadata: { overdue_count: overdueJobs.length, total_checked: filtered.length },
  });

  await supabase
    .from("cron_job_metadata")
    .update({
      last_run_at: new Date().toISOString(),
      last_run_status: "success",
      last_run_duration_ms: Date.now() - nowMs,
      consecutive_failures: 0,
    })
    .eq("job_name", "cron-heartbeat-hourly");

  if (overdueJobs.length > 0) {
    try {
      await sendAlert(overdueJobs);
    } catch (e) {
      console.error("[cron-heartbeat] alert send failed", e);
    }
  }

  return new Response(JSON.stringify({
    success: true,
    total_checked: filtered.length,
    overdue_count: overdueJobs.length,
    critical_overdue_count: overdueJobs.filter(j => j.job.is_critical).length,
    report,
  }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});