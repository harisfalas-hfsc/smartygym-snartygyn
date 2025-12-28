import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CronJobRequest {
  action: 'list' | 'add' | 'edit' | 'delete' | 'test';
  job_name?: string;
  display_name?: string;
  description?: string;
  category?: string;
  schedule?: string;
  schedule_human_readable?: string;
  edge_function_name?: string;
  request_body?: Record<string, unknown>;
  is_critical?: boolean;
  is_active?: boolean;
}

// Convert cron expression to human-readable format with Cyprus time
function cronToHumanReadable(cron: string): string {
  const parts = cron.split(' ');
  if (parts.length !== 5) return cron;
  
  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
  
  // Every X minutes
  if (minute.startsWith('*/') && hour === '*') {
    const mins = minute.replace('*/', '');
    return `Every ${mins} minutes`;
  }
  
  // Every X hours
  if (minute !== '*' && hour.startsWith('*/')) {
    const hrs = hour.replace('*/', '');
    return `Every ${hrs} hours at :${minute.padStart(2, '0')}`;
  }
  
  // Daily at specific time
  if (dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    const utcHour = parseInt(hour);
    const cyprusHour = (utcHour + 3) % 24; // Cyprus is UTC+3 (simplified)
    const minStr = minute.padStart(2, '0');
    return `Daily at ${cyprusHour.toString().padStart(2, '0')}:${minStr} Cyprus (${hour}:${minStr} UTC)`;
  }
  
  // Weekly
  if (dayOfMonth === '*' && month === '*' && dayOfWeek !== '*') {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayNum = parseInt(dayOfWeek);
    const utcHour = parseInt(hour);
    const cyprusHour = (utcHour + 3) % 24;
    const minStr = minute.padStart(2, '0');
    return `Every ${days[dayNum]} at ${cyprusHour.toString().padStart(2, '0')}:${minStr} Cyprus (${hour}:${minStr} UTC)`;
  }
  
  // Monthly
  if (dayOfMonth !== '*' && month === '*' && dayOfWeek === '*') {
    const utcHour = parseInt(hour);
    const cyprusHour = (utcHour + 3) % 24;
    const minStr = minute.padStart(2, '0');
    return `Monthly on day ${dayOfMonth} at ${cyprusHour.toString().padStart(2, '0')}:${minStr} Cyprus`;
  }
  
  return cron;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    // Create client with user's auth token
    const authHeader = req.headers.get("Authorization");
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader || "" } }
    });
    
    // Create service client for cron operations
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin role
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: roleData } = await serviceClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: CronJobRequest = await req.json();
    const { action } = body;

    console.log(`🔧 Cron job management: ${action}`, body);

    // LIST - Get all cron jobs with metadata AND real scheduler jobs
    if (action === 'list') {
      // Get metadata from our table
      const { data: metadata, error: metaError } = await serviceClient
        .from('cron_job_metadata')
        .select('*')
        .order('category', { ascending: true })
        .order('display_name', { ascending: true });

      if (metaError) {
        throw new Error(`Failed to fetch jobs: ${metaError.message}`);
      }

      // Try to get real scheduler jobs from cron.job table
      let schedulerJobs: Array<{ jobname: string; schedule: string; active: boolean }> = [];
      try {
        const { data: cronJobs, error: cronError } = await serviceClient
          .rpc('get_cron_jobs');
        
        if (!cronError && cronJobs) {
          schedulerJobs = cronJobs;
        }
      } catch (e) {
        console.log("Could not fetch cron.job table (function may not exist):", e);
      }

      // Create a map of scheduler jobs by name
      const schedulerMap = new Map(schedulerJobs.map(j => [j.jobname, j]));

      // Enrich metadata with scheduler info
      const enrichedJobs = (metadata || []).map((job: any) => {
        const schedulerJob = schedulerMap.get(job.job_name);
        return {
          ...job,
          schedule_human_readable: job.schedule_human_readable || cronToHumanReadable(job.schedule || ''),
          scheduler_schedule: schedulerJob?.schedule || null,
          scheduler_active: schedulerJob?.active ?? null,
          in_scheduler: !!schedulerJob,
          schedule_mismatch: schedulerJob ? (schedulerJob.schedule !== job.schedule) : false,
        };
      });

      // Also report scheduler jobs that aren't in metadata
      const metadataNames = new Set((metadata || []).map((j: any) => j.job_name));
      const orphanSchedulerJobs = schedulerJobs
        .filter(j => !metadataNames.has(j.jobname))
        .map(j => ({
          job_name: j.jobname,
          display_name: j.jobname,
          schedule: j.schedule,
          scheduler_schedule: j.schedule,
          scheduler_active: j.active,
          in_scheduler: true,
          in_metadata: false,
          schedule_mismatch: false,
          is_orphan: true,
        }));

      return new Response(
        JSON.stringify({ 
          success: true, 
          jobs: enrichedJobs,
          orphan_scheduler_jobs: orphanSchedulerJobs,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ADD - Create new cron job
    if (action === 'add') {
      const { job_name, display_name, description, category, schedule, edge_function_name, request_body, is_critical } = body;
      
      if (!job_name || !schedule || !edge_function_name) {
        return new Response(
          JSON.stringify({ error: "Missing required fields: job_name, schedule, edge_function_name" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Build the HTTP post command for the cron job
      const functionUrl = `${supabaseUrl}/functions/v1/${edge_function_name}`;
      const requestBodyJson = JSON.stringify(request_body || {});
      const humanReadable = cronToHumanReadable(schedule);
      
      // Create cron job using cron.schedule (requires pg_cron extension)
      const cronSql = `
        SELECT cron.schedule(
          '${job_name}',
          '${schedule}',
          $$
          SELECT net.http_post(
            url:='${functionUrl}',
            headers:='{"Content-Type": "application/json", "Authorization": "Bearer ${supabaseAnonKey}"}'::jsonb,
            body:='${requestBodyJson}'::jsonb
          ) as request_id;
          $$
        );
      `;
      
      console.log("Creating cron job with SQL:", cronSql);
      
      // Try to execute via raw SQL
      let cronCreated = false;
      try {
        const { error: cronCreateError } = await serviceClient.rpc('exec_sql', { sql: cronSql });
        if (!cronCreateError) {
          cronCreated = true;
        }
      } catch (e) {
        console.log("Direct cron.schedule failed, saving metadata only");
      }

      // Save metadata
      const { error: metaError } = await serviceClient
        .from('cron_job_metadata')
        .upsert({
          job_name,
          display_name: display_name || job_name,
          description: description || '',
          category: category || 'general',
          schedule,
          schedule_human_readable: humanReadable,
          edge_function_name,
          request_body: request_body || {},
          is_critical: is_critical || false,
          is_active: true
        }, { onConflict: 'job_name' });

      if (metaError) {
        throw new Error(`Failed to save metadata: ${metaError.message}`);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: cronCreated ? "Cron job created and scheduled" : "Metadata saved - run SQL manually to schedule",
          cron_sql: cronCreated ? undefined : cronSql
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // EDIT - Update cron job schedule and metadata
    if (action === 'edit') {
      const { job_name, display_name, description, category, schedule, edge_function_name, request_body, is_critical, is_active } = body;
      
      if (!job_name) {
        return new Response(
          JSON.stringify({ error: "Missing job_name" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Build update object
      const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (display_name !== undefined) updateData.display_name = display_name;
      if (description !== undefined) updateData.description = description;
      if (category !== undefined) updateData.category = category;
      if (edge_function_name !== undefined) updateData.edge_function_name = edge_function_name;
      if (request_body !== undefined) updateData.request_body = request_body;
      if (is_critical !== undefined) updateData.is_critical = is_critical;
      if (is_active !== undefined) updateData.is_active = is_active;
      
      // If schedule is changing, update schedule and human-readable
      let cronSql: string | undefined;
      if (schedule) {
        updateData.schedule = schedule;
        updateData.schedule_human_readable = cronToHumanReadable(schedule);
        
        // Get the edge function name to use
        const funcName = edge_function_name || (await serviceClient
          .from('cron_job_metadata')
          .select('edge_function_name')
          .eq('job_name', job_name)
          .single()).data?.edge_function_name;
        
        if (funcName) {
          const functionUrl = `${supabaseUrl}/functions/v1/${funcName}`;
          const bodyJson = JSON.stringify(request_body || {});
          
          // Build SQL for manual execution if needed
          cronSql = `
-- First unschedule existing job
SELECT cron.unschedule('${job_name}');

-- Then reschedule with new schedule
SELECT cron.schedule(
  '${job_name}',
  '${schedule}',
  $$
  SELECT net.http_post(
    url:='${functionUrl}',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer ${supabaseAnonKey}"}'::jsonb,
    body:='${bodyJson}'::jsonb
  ) as request_id;
  $$
);`;
          
          // Try to execute
          try {
            await serviceClient.rpc('exec_sql', { sql: `SELECT cron.unschedule('${job_name}');` });
            await serviceClient.rpc('exec_sql', { sql: `
              SELECT cron.schedule(
                '${job_name}',
                '${schedule}',
                $$
                SELECT net.http_post(
                  url:='${functionUrl}',
                  headers:='{"Content-Type": "application/json", "Authorization": "Bearer ${supabaseAnonKey}"}'::jsonb,
                  body:='${bodyJson}'::jsonb
                ) as request_id;
                $$
              );
            ` });
            cronSql = undefined; // Successfully executed
          } catch (e) {
            console.log("Could not update cron schedule directly, SQL provided for manual execution");
          }
        }
      }

      // Update metadata
      const { error: updateError } = await serviceClient
        .from('cron_job_metadata')
        .update(updateData)
        .eq('job_name', job_name);

      if (updateError) {
        throw new Error(`Failed to update metadata: ${updateError.message}`);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: cronSql ? "Metadata updated - run SQL manually to update schedule" : "Cron job updated",
          cron_sql: cronSql
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // DELETE - Remove cron job
    if (action === 'delete') {
      const { job_name } = body;
      
      if (!job_name) {
        return new Response(
          JSON.stringify({ error: "Missing job_name" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Unschedule the cron job
      let unscheduled = false;
      try {
        await serviceClient.rpc('exec_sql', { sql: `SELECT cron.unschedule('${job_name}');` });
        unscheduled = true;
      } catch (e) {
        console.log("Unschedule may have failed (job might not exist in cron):", e);
      }

      // Delete metadata
      const { error: deleteError } = await serviceClient
        .from('cron_job_metadata')
        .delete()
        .eq('job_name', job_name);

      if (deleteError) {
        throw new Error(`Failed to delete metadata: ${deleteError.message}`);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: unscheduled ? "Cron job stopped and removed" : "Metadata removed - run SQL manually: SELECT cron.unschedule('" + job_name + "');"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // TEST - Manually trigger a cron job's function
    if (action === 'test') {
      const { edge_function_name, request_body } = body;
      
      if (!edge_function_name) {
        return new Response(
          JSON.stringify({ error: "Missing edge_function_name" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Call the edge function
      const { data, error } = await supabase.functions.invoke(edge_function_name, {
        body: request_body || {}
      });

      if (error) {
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: "Function executed successfully (one-time test)", result: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in manage-cron-jobs:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
