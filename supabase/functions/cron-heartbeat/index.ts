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
const DAILY_ALERT_JOB_NAME = "cron-heartbeat-alert";

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

type CronSnapshotRow = {
  job_name: string;
  display_name: string;
  registered_schedule: string;
  live_schedule: string | null;
  edge_function_name: string | null;
  is_critical: boolean;
  is_active: boolean;
  metadata_last_run_at: string | null;
  metadata_last_run_status: string | null;
  consecutive_failures: number;
  created_at: string;
  live_job_exists: boolean;
  live_job_active: boolean;
  scheduler_last_run_at: string | null;
  scheduler_last_status: string | null;
  scheduler_last_message: string | null;
};

function snapshotToCronRow(row: CronSnapshotRow): CronRow {
  return {
    job_name: row.job_name,
    display_name: row.display_name,
    schedule: row.live_schedule || row.registered_schedule,
    edge_function_name: row.edge_function_name,
    is_critical: row.is_critical,
    is_active: row.is_active,
    last_run_at: row.scheduler_last_run_at || row.metadata_last_run_at,
    last_run_status: row.scheduler_last_status || row.metadata_last_run_status,
    consecutive_failures: row.consecutive_failures,
    created_at: row.created_at,
  };
}

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
  // Yearly
  if (month !== "*") return 365 * 24 * 60;
  // Monthly
  if (dom !== "*" && !dom.startsWith("*/")) return 30 * 24 * 60;
  // Weekly
  if (dow !== "*" && !dow.startsWith("*/")) return 7 * 24 * 60;
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
  // grace = 2x interval + 30 min. Only cap daily jobs at 25h so weekly/yearly
  // jobs are not falsely flagged between legitimate scheduled runs.
  let graceMin = intervalMin * 2 + 30;
  if (intervalMin === 24 * 60) graceMin = 25 * 60;
  const thresholdMs = graceMin * 60 * 1000;

  if (!job.last_run_at) {
    // Never ran. Allow at least one full expected window before alerting.
    const createdMs = new Date(job.created_at).getTime();
    if (nowMs - createdMs > thresholdMs) {
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

function evaluateSnapshot(row: CronSnapshotRow, nowMs: number): { overdue: boolean; reason: string; thresholdMinutes: number; job: CronRow } {
  const job = snapshotToCronRow(row);
  if (!row.live_job_exists) {
    return { overdue: true, reason: "not registered in the live scheduler", thresholdMinutes: 0, job };
  }
  if (!row.live_job_active) {
    return { overdue: true, reason: "registered but disabled in the live scheduler", thresholdMinutes: 0, job };
  }
  if (row.scheduler_last_status && row.scheduler_last_status !== "succeeded") {
    return { overdue: true, reason: `scheduler reported ${row.scheduler_last_status}: ${row.scheduler_last_message || "no details"}`, thresholdMinutes: 0, job };
  }
  return { ...isOverdue(job, nowMs), job };
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

async function wasAlertAlreadySentToday(supabase: ReturnType<typeof createClient>, nowMs: number): Promise<boolean> {
  const startOfUtcDay = new Date(nowMs);
  startOfUtcDay.setUTCHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("cron_job_runs")
    .select("id")
    .eq("job_name", DAILY_ALERT_JOB_NAME)
    .eq("status", "success")
    .gte("started_at", startOfUtcDay.toISOString())
    .limit(1);

  if (error) {
    console.error("[cron-heartbeat] failed to check daily alert throttle", error);
    return true;
  }

  return (data ?? []).length > 0;
}

async function recordDailyAlertAttempt(
  supabase: ReturnType<typeof createClient>,
  nowMs: number,
  status: "success" | "failed",
  metadata: Record<string, unknown>,
) {
  await supabase.from("cron_job_runs").insert({
    job_name: DAILY_ALERT_JOB_NAME,
    started_at: new Date(nowMs).toISOString(),
    finished_at: new Date().toISOString(),
    duration_ms: Date.now() - nowMs,
    status,
    metadata,
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(PROJECT_URL, SERVICE_KEY);
  const nowMs = Date.now();

  await supabase.rpc("sync_cron_metadata_from_live_scheduler");

  const { data: jobs, error } = await supabase
    .rpc("get_cron_heartbeat_snapshot");

  if (error) {
    console.error("[cron-heartbeat] failed to load jobs", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Don't alert on the heartbeat itself — it would alert about its own absence
  const filtered = (jobs ?? []).filter((j: CronSnapshotRow) => j.job_name !== "cron-heartbeat-hourly");

  const overdueJobs: Array<{ job: CronRow; reason: string }> = [];
  const report = filtered.map((row: CronSnapshotRow) => {
    const r = evaluateSnapshot(row, nowMs);
    if (r.overdue) overdueJobs.push({ job: r.job, reason: r.reason });
    return {
      job_name: row.job_name,
      is_critical: row.is_critical,
      live_job_exists: row.live_job_exists,
      live_job_active: row.live_job_active,
      scheduler_last_run_at: row.scheduler_last_run_at,
      scheduler_last_status: row.scheduler_last_status,
      overdue: r.overdue,
      reason: r.reason,
    };
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

  const criticalOverdueJobs = overdueJobs.filter(j => j.job.is_critical);

  if (criticalOverdueJobs.length > 0) {
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
    critical_overdue_count: criticalOverdueJobs.length,
    report,
  }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});