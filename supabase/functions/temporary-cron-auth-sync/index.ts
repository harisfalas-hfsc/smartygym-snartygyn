import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-setup-token",
};

const SETUP_TOKEN = "tmp-cron-sync-2026-06-08-6d8f8d9a";

const escapeSqlString = (value: string) => value.replace(/'/g, "''");

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  if (req.headers.get("x-setup-token") !== SETUP_TOKEN) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const serviceClient = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const protectedFunctions = [
    "expire-subscriptions",
    "send-morning-notifications",
    "send-renewal-reminders",
    "send-reengagement-emails",
    "select-wod-from-library",
  ];

  const { data: jobs, error } = await serviceClient
    .from("cron_job_metadata")
    .select("job_name, schedule, edge_function_name, request_body")
    .in("edge_function_name", protectedFunctions)
    .eq("is_active", true);

  if (error) throw error;

  const results = [];
  for (const job of jobs || []) {
    const bodyJson = escapeSqlString(JSON.stringify(job.request_body || {}));
    await serviceClient.rpc("exec_sql", { sql: `SELECT cron.unschedule('${job.job_name}');` });

    const functionUrl = `${supabaseUrl}/functions/v1/${job.edge_function_name}`;
    const scheduleSql = `
      SELECT cron.schedule(
        '${job.job_name}',
        '${job.schedule}',
        $$
        SELECT net.http_post(
          url:='${functionUrl}',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer ${serviceKey}"}'::jsonb,
          body:='${bodyJson}'::jsonb
        ) as request_id;
        $$
      );
    `;

    const { error: scheduleError } = await serviceClient.rpc("exec_sql", { sql: scheduleSql });
    results.push({ job_name: job.job_name, success: !scheduleError, error: scheduleError?.message || null });
  }

  return new Response(JSON.stringify({ success: true, synced: results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});