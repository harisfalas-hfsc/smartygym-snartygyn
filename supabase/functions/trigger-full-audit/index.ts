import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Trigger Full Audit - Starts a background audit and returns immediately
 * The UI can poll /get-audit-status to check progress
 */
serve(async (req: Request): Promise<Response> => {
  console.log("🚀 Triggering background full audit...");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const { sendEmail = false } = await req.json().catch(() => ({}));

    // Create a pending audit record
    const runId = crypto.randomUUID();
    const { error: insertError } = await supabase
      .from('system_health_audits')
      .insert({
        id: runId,
        audit_date: new Date().toISOString(),
        total_checks: 0,
        passed_checks: 0,
        warning_checks: 0,
        failed_checks: 0,
        skipped_checks: 0,
        duration_ms: 0,
        results: { status: 'running', started_at: new Date().toISOString() },
        critical_issues: []
      });

    if (insertError) {
      console.error("Failed to create audit record:", insertError);
      throw insertError;
    }

    // Fire and forget the actual audit
    // Using fetch with no await so we return immediately
    fetch(`${supabaseUrl}/functions/v1/run-system-health-audit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ 
        sendEmail, 
        runId  // Pass runId so audit can update the existing record
      })
    }).catch(err => {
      console.error("Background audit request failed:", err);
    });

    console.log(`✅ Audit triggered with runId: ${runId}`);

    return new Response(JSON.stringify({
      success: true,
      runId,
      message: 'Full audit started in background. Poll /get-audit-status for progress.',
      estimatedDuration: '2-5 minutes'
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("❌ Failed to trigger audit:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
