import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CronJobRequest {
  action: 'list' | 'add' | 'edit' | 'delete' | 'test' | 'sync';
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

// Helper to execute SQL with proper error handling
async function executeCronSql(serviceClient: any, sql: string, operation: string): Promise<{ success: boolean; error?: string }> {
  console.log(`🔧 [${operation}] Executing SQL:`, sql.substring(0, 200) + '...');
  
  try {
    const { data, error } = await serviceClient.rpc('exec_sql', { sql });
    
    if (error) {
      console.error(`❌ [${operation}] exec_sql RPC error:`, error);
      return { success: false, error: `Database error: ${error.message}` };
    }
    
    console.log(`✅ [${operation}] SQL executed successfully`);
    return { success: true };
  } catch (e: any) {
    console.error(`❌ [${operation}] Exception:`, e);
    return { success: false, error: `Exception: ${e.message || 'Unknown error'}` };
  }
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

    console.log(`🔧 Cron job management: ${action}`, JSON.stringify(body, null, 2));

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

    // SYNC - Sync all metadata jobs to pg_cron scheduler
    if (action === 'sync') {
      const { job_name } = body;
      
      console.log('🔄 Starting sync operation', job_name ? `for job: ${job_name}` : 'for all jobs');
      
      // Get metadata for jobs to sync
      let query = serviceClient.from('cron_job_metadata').select('*');
      if (job_name) {
        query = query.eq('job_name', job_name);
      }
      
      const { data: jobsToSync, error: fetchError } = await query;
      
      if (fetchError) {
        throw new Error(`Failed to fetch jobs for sync: ${fetchError.message}`);
      }
      
      if (!jobsToSync || jobsToSync.length === 0) {
        return new Response(
          JSON.stringify({ success: true, message: 'No jobs to sync', synced: 0, failed: 0 }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const results: Array<{ job_name: string; success: boolean; error?: string }> = [];
      
      for (const job of jobsToSync) {
        const funcName = job.edge_function_name;
        const schedule = job.schedule;
        
        if (!funcName || !schedule) {
          results.push({ job_name: job.job_name, success: false, error: 'Missing edge_function_name or schedule' });
          continue;
        }
        
        const functionUrl = `${supabaseUrl}/functions/v1/${funcName}`;
        const bodyJson = JSON.stringify(job.request_body || {});
        
        // First unschedule (ignore errors - job might not exist)
        await executeCronSql(serviceClient, `SELECT cron.unschedule('${job.job_name}');`, `unschedule-${job.job_name}`);
        
        // Then schedule with current metadata
        const scheduleSql = `
          SELECT cron.schedule(
            '${job.job_name}',
            '${schedule}',
            $$
            SELECT net.http_post(
              url:='${functionUrl}',
              headers:='{"Content-Type": "application/json", "Authorization": "Bearer ${supabaseAnonKey}"}'::jsonb,
              body:='${bodyJson}'::jsonb
            ) as request_id;
            $$
          );
        `;
        
        const result = await executeCronSql(serviceClient, scheduleSql, `schedule-${job.job_name}`);
        results.push({ job_name: job.job_name, success: result.success, error: result.error });
      }
      
      const synced = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      console.log(`🔄 Sync complete: ${synced} synced, ${failed} failed`);
      
      return new Response(
        JSON.stringify({ 
          success: failed === 0, 
          message: `Synced ${synced}/${results.length} jobs`,
          synced,
          failed,
          results
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
      
      // Create cron job using cron.schedule
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
      
      console.log("📝 Creating cron job:", job_name);
      
      const cronResult = await executeCronSql(serviceClient, cronSql, `add-${job_name}`);

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

      if (!cronResult.success) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Metadata saved but scheduler failed: ${cronResult.error}`,
            metadata_saved: true,
            scheduler_updated: false
          }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Cron job created and scheduled successfully",
          metadata_saved: true,
          scheduler_updated: true
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

      console.log(`📝 Editing cron job: ${job_name}`);

      // Get current job data to merge with updates
      const { data: currentJob } = await serviceClient
        .from('cron_job_metadata')
        .select('*')
        .eq('job_name', job_name)
        .single();

      // Build update object
      const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (display_name !== undefined) updateData.display_name = display_name;
      if (description !== undefined) updateData.description = description;
      if (category !== undefined) updateData.category = category;
      if (edge_function_name !== undefined) updateData.edge_function_name = edge_function_name;
      if (request_body !== undefined) updateData.request_body = request_body;
      if (is_critical !== undefined) updateData.is_critical = is_critical;
      if (is_active !== undefined) updateData.is_active = is_active;
      
      let schedulerUpdated = true;
      let schedulerError: string | undefined;
      
      // If schedule is changing, update the cron scheduler
      if (schedule) {
        updateData.schedule = schedule;
        updateData.schedule_human_readable = cronToHumanReadable(schedule);
        
        // Get the edge function name to use (new or existing)
        const funcName = edge_function_name || currentJob?.edge_function_name;
        const bodyJson = JSON.stringify(request_body ?? currentJob?.request_body ?? {});
        
        if (funcName) {
          const functionUrl = `${supabaseUrl}/functions/v1/${funcName}`;
          
          // Unschedule existing job first
          const unscheduleResult = await executeCronSql(
            serviceClient, 
            `SELECT cron.unschedule('${job_name}');`, 
            `edit-unschedule-${job_name}`
          );
          
          if (!unscheduleResult.success) {
            console.log(`⚠️ Unschedule warning (may not exist): ${unscheduleResult.error}`);
          }
          
          // Schedule with new configuration
          const scheduleSql = `
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
          `;
          
          const scheduleResult = await executeCronSql(serviceClient, scheduleSql, `edit-schedule-${job_name}`);
          
          if (!scheduleResult.success) {
            schedulerUpdated = false;
            schedulerError = scheduleResult.error;
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

      if (!schedulerUpdated) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Metadata updated but scheduler failed: ${schedulerError}`,
            metadata_saved: true,
            scheduler_updated: false
          }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Cron job updated successfully",
          metadata_saved: true,
          scheduler_updated: schedulerUpdated
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

      console.log(`🗑️ Deleting cron job: ${job_name}`);

      // Unschedule the cron job
      const unscheduleResult = await executeCronSql(
        serviceClient, 
        `SELECT cron.unschedule('${job_name}');`, 
        `delete-${job_name}`
      );

      // Delete metadata
      const { error: deleteError } = await serviceClient
        .from('cron_job_metadata')
        .delete()
        .eq('job_name', job_name);

      if (deleteError) {
        throw new Error(`Failed to delete metadata: ${deleteError.message}`);
      }

      if (!unscheduleResult.success) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Metadata deleted. Scheduler warning: ${unscheduleResult.error}`,
            metadata_deleted: true,
            scheduler_updated: false
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Cron job stopped and removed successfully",
          metadata_deleted: true,
          scheduler_updated: true
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

      console.log(`🧪 Testing edge function: ${edge_function_name}`);

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
    console.error("❌ Error in manage-cron-jobs:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
