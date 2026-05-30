import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Quick Health Audit - Returns fast results for the Admin UI
 * Only performs essential checks that complete in <10 seconds
 * Full audit runs in background via run-system-health-audit
 */
serve(async (req: Request): Promise<Response> => {
  console.log("⚡ Quick Health Audit starting...");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    interface QuickCheck {
      name: string;
      status: 'pass' | 'warning' | 'fail';
      details?: string;
    }
    
    const checks: QuickCheck[] = [];
    
    // Get Cyprus date
    const now = new Date();
    const cyprusDate = new Intl.DateTimeFormat('en-CA', { 
      timeZone: 'Europe/Nicosia', 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    }).format(now);
    
    // 1. Check today's WODs exist
    const { data: todayWods, error: wodError } = await supabase
      .from('admin_workouts')
      .select('id, equipment')
      .eq('is_workout_of_day', true)
      .eq('generated_for_date', cyprusDate);
    
    if (wodError) {
      checks.push({ name: "Today's WOD", status: 'fail', details: wodError.message });
    } else if (!todayWods || todayWods.length === 0) {
      checks.push({ name: "Today's WOD", status: 'fail', details: `No WOD found for ${cyprusDate}` });
    } else {
      const hasBothTypes = todayWods.some(w => w.equipment === 'BODYWEIGHT') && 
                          todayWods.some(w => w.equipment === 'EQUIPMENT');
      const hasVarious = todayWods.some(w => w.equipment === 'VARIOUS');
      
      if (hasBothTypes || hasVarious) {
        checks.push({ name: "Today's WOD", status: 'pass', details: `${todayWods.length} WOD(s) ready` });
      } else {
        checks.push({ name: "Today's WOD", status: 'warning', details: `Missing equipment variant` });
      }
    }
    
    // 2. Check today's ritual ASSIGNMENT (library rotation model — no AI generation)
    // Rituals are no longer generated daily; assign-daily-ritual picks one from the
    // existing library and writes a row to daily_ritual_assignments for today.
    const { data: todayAssignment, error: ritualError } = await supabase
      .from('daily_ritual_assignments')
      .select('ritual_id, daily_smarty_rituals!inner(id, is_visible)')
      .eq('ritual_date', cyprusDate)
      .maybeSingle();

    if (ritualError) {
      checks.push({ name: "Today's Ritual", status: 'fail', details: ritualError.message });
    } else if (!todayAssignment) {
      checks.push({ name: "Today's Ritual", status: 'warning', details: `No ritual assigned for ${cyprusDate} (library rotation pending)` });
    } else {
      checks.push({ name: "Today's Ritual", status: 'pass', details: 'Ritual assigned from library' });
    }
    
    // 3. Check active subscriptions exist
    const { count: activeSubsCount, error: subsError } = await supabase
      .from('user_subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');
    
    if (subsError) {
      checks.push({ name: 'Active Subscriptions', status: 'fail', details: subsError.message });
    } else {
      checks.push({ 
        name: 'Active Subscriptions', 
        status: 'pass', 
        details: `${activeSubsCount || 0} active subscriptions` 
      });
    }
    
    // 4. Check unread contact messages
    const { count: unreadCount, error: contactError } = await supabase
      .from('contact_messages')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'new');
    
    if (contactError) {
      checks.push({ name: 'Contact Messages', status: 'fail', details: contactError.message });
    } else if ((unreadCount || 0) > 5) {
      checks.push({ 
        name: 'Contact Messages', 
        status: 'warning', 
        details: `${unreadCount} unread messages pending` 
      });
    } else {
      checks.push({ 
        name: 'Contact Messages', 
        status: 'pass', 
        details: `${unreadCount || 0} pending` 
      });
    }
    
    // 5. Check pg_cron is enabled
    const { data: cronEnabled } = await supabase.rpc('pg_cron_enabled');
    if (cronEnabled) {
      checks.push({ name: 'Cron Engine', status: 'pass', details: 'pg_cron active' });
    } else {
      checks.push({ name: 'Cron Engine', status: 'fail', details: 'pg_cron not enabled' });
    }
    
    // 6. Check last successful health audit
    const { data: lastAudit, error: auditError } = await supabase
      .from('system_health_audits')
      .select('audit_date, passed_checks, failed_checks')
      .order('audit_date', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (auditError || !lastAudit) {
      checks.push({ name: 'Last Full Audit', status: 'warning', details: 'No audit history found' });
    } else {
      const auditAge = (Date.now() - new Date(lastAudit.audit_date).getTime()) / (1000 * 60 * 60);
      if (auditAge > 48) {
        checks.push({ 
          name: 'Last Full Audit', 
          status: 'warning', 
          details: `Last ran ${Math.round(auditAge / 24)} days ago` 
        });
      } else {
        checks.push({ 
          name: 'Last Full Audit', 
          status: lastAudit.failed_checks > 0 ? 'warning' : 'pass', 
          details: `${lastAudit.passed_checks} passed, ${lastAudit.failed_checks} failed` 
        });
      }
    }
    
    // 7. Check email delivery in last 24h
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: emailStats } = await supabase
      .from('email_delivery_log')
      .select('status')
      .gte('sent_at', yesterday);
    
    const sentCount = emailStats?.filter(e => e.status === 'sent').length || 0;
    const failedCount = emailStats?.filter(e => e.status === 'failed').length || 0;
    
    if (failedCount > 0 && failedCount > sentCount * 0.1) {
      checks.push({ 
        name: 'Email Delivery (24h)', 
        status: 'warning', 
        details: `${failedCount} failed, ${sentCount} sent` 
      });
    } else {
      checks.push({ 
        name: 'Email Delivery (24h)', 
        status: 'pass', 
        details: `${sentCount} emails sent` 
      });
    }

    // 8. Watchdog self-healing status (last 24h)
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: watchdogEvents } = await supabase
      .from('system_health_events')
      .select('check_type, status, autofix_status, severity, scheduled_for_date, equipment_slot, issue_message, candidate_rejection_reasons, created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(50);
    const openIssues = (watchdogEvents || []).filter(e => e.status === 'open');
    const fixedIssues = (watchdogEvents || []).filter(e => e.status === 'resolved');
    if (openIssues.length > 0) {
      checks.push({
        name: 'WOD Watchdog (24h)',
        status: 'fail',
        details: `${openIssues.length} unresolved issue(s); ${fixedIssues.length} auto-fixed. Most recent: ${openIssues[0].issue_message?.substring(0, 140)}`,
      });
    } else if (fixedIssues.length > 0) {
      checks.push({
        name: 'WOD Watchdog (24h)',
        status: 'pass',
        details: `${fixedIssues.length} issue(s) detected and auto-fixed by the watchdog.`,
      });
    } else {
      checks.push({
        name: 'WOD Watchdog (24h)',
        status: 'pass',
        details: 'No issues detected in last 24h.',
      });
    }

    const duration = Date.now() - startTime;
    const passed = checks.filter(c => c.status === 'pass').length;
    const warnings = checks.filter(c => c.status === 'warning').length;
    const failed = checks.filter(c => c.status === 'fail').length;
    
    console.log(`⚡ Quick audit complete: ${passed} pass, ${warnings} warning, ${failed} fail in ${duration}ms`);
    
    return new Response(JSON.stringify({
      timestamp: new Date().toISOString(),
      duration_ms: duration,
      cyprus_date: cyprusDate,
      total_checks: checks.length,
      passed,
      warnings,
      failed,
      checks,
      watchdog_recent_events: (watchdogEvents || []).slice(0, 20),
      overall_status: failed > 0 ? 'critical' : warnings > 0 ? 'warning' : 'healthy'
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("❌ Quick audit failed:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
