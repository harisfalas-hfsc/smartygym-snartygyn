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
  edge_function_name?: string;
  request_body?: Record<string, unknown>;
  is_critical?: boolean;
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

    // LIST - Get all cron jobs with metadata
    if (action === 'list') {
      // Get cron jobs from cron.job table
      const { data: cronJobs, error: cronError } = await serviceClient.rpc('get_cron_jobs');
      
      // If RPC doesn't exist, query directly
      let jobs = cronJobs;
      if (cronError) {
        console.log("RPC not available, querying cron.job directly...");
        // Try direct query - this requires pg_cron extension
        const { data, error } = await serviceClient
          .from('cron_job_metadata')
          .select('*')
          .order('created_at', { ascending: true });
        
        if (error) {
          throw new Error(`Failed to fetch jobs: ${error.message}`);
        }
        jobs = data;
      }

      // Get metadata for display names and descriptions
      const { data: metadata } = await serviceClient
        .from('cron_job_metadata')
        .select('*');

      // Merge metadata with cron jobs
      const metadataMap = new Map(metadata?.map(m => [m.job_name, m]) || []);
      
      // Try to get actual cron.job data if available
      let actualCronJobs: any[] = [];
      try {
        const cronResult = await serviceClient.rpc('pg_cron_enabled');
        if (cronResult.data) {
          // Extension is enabled, try to query cron.job
          const { data: cronData } = await serviceClient
            .from('cron' as any)
            .select('*');
          if (cronData) {
            actualCronJobs = cronData;
          }
        }
      } catch (e) {
        console.log("Could not query cron.job table directly");
      }

      // Build combined response
      const enrichedJobs = (jobs || []).map((job: any) => {
        const meta = metadataMap.get(job.job_name);
        return {
          ...job,
          display_name: meta?.display_name || job.job_name,
          description: meta?.description || '',
          category: meta?.category || 'general',
          edge_function_name: meta?.edge_function_name || '',
          is_critical: meta?.is_critical || false
        };
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          jobs: enrichedJobs,
          metadata: metadata || []
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
      
      console.log("Creating cron job with SQL:", cronSql);
      
      // Execute via raw SQL (requires admin privileges)
      const { error: cronCreateError } = await serviceClient.rpc('exec_sql', { sql: cronSql });
      
      if (cronCreateError) {
        console.error("Cron creation failed:", cronCreateError);
        // Still save metadata even if cron creation fails (user can add manually)
      }

      // Save metadata
      const { error: metaError } = await serviceClient
        .from('cron_job_metadata')
        .upsert({
          job_name,
          display_name: display_name || job_name,
          description: description || '',
          category: category || 'general',
          edge_function_name,
          request_body: request_body || {},
          is_critical: is_critical || false
        }, { onConflict: 'job_name' });

      if (metaError) {
        throw new Error(`Failed to save metadata: ${metaError.message}`);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Cron job created",
          note: cronCreateError ? "Metadata saved, but cron.schedule may need manual SQL execution" : undefined
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // EDIT - Update cron job schedule
    if (action === 'edit') {
      const { job_name, display_name, description, category, schedule, edge_function_name, request_body, is_critical } = body;
      
      if (!job_name) {
        return new Response(
          JSON.stringify({ error: "Missing job_name" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // If schedule is changing, need to unschedule and reschedule
      if (schedule && edge_function_name) {
        const functionUrl = `${supabaseUrl}/functions/v1/${edge_function_name}`;
        const requestBodyJson = JSON.stringify(request_body || {});
        
        // Unschedule existing job
        const unscheduleSql = `SELECT cron.unschedule('${job_name}');`;
        try {
          await serviceClient.rpc('exec_sql', { sql: unscheduleSql });
        } catch (_) {
          // Job may not exist
        }
        
        // Reschedule with new settings
        const rescheduleSql = `
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
        
        try {
          await serviceClient.rpc('exec_sql', { sql: rescheduleSql });
        } catch (e) {
          console.error("Reschedule failed:", e);
        }
      }

      // Update metadata
      const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (display_name !== undefined) updateData.display_name = display_name;
      if (description !== undefined) updateData.description = description;
      if (category !== undefined) updateData.category = category;
      if (edge_function_name !== undefined) updateData.edge_function_name = edge_function_name;
      if (request_body !== undefined) updateData.request_body = request_body;
      if (is_critical !== undefined) updateData.is_critical = is_critical;

      const { error: updateError } = await serviceClient
        .from('cron_job_metadata')
        .update(updateData)
        .eq('job_name', job_name);

      if (updateError) {
        throw new Error(`Failed to update metadata: ${updateError.message}`);
      }

      return new Response(
        JSON.stringify({ success: true, message: "Cron job updated" }),
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
      const unscheduleSql = `SELECT cron.unschedule('${job_name}');`;
      try {
        await serviceClient.rpc('exec_sql', { sql: unscheduleSql });
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
        JSON.stringify({ success: true, message: "Cron job deleted" }),
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
        JSON.stringify({ success: true, message: "Function executed", result: data }),
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
