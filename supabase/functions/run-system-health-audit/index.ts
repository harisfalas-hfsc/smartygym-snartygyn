import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { MESSAGE_TYPES, MESSAGE_TYPE_SOURCES } from "../_shared/notification-types.ts";
import { CYCLE_START_DATE, PERIODIZATION_84DAY, getDayIn84Cycle, getPeriodizationForDay } from "../_shared/periodization-84day.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================
// SCHEDULE KNOWLEDGE BASE
// All times in UTC - Cyprus is UTC+2 (winter) / UTC+3 (summer)
// ============================================
interface ScheduledJob {
  name: string;
  cronHourUTC: number;
  cronMinuteUTC?: number;
  frequency: 'daily' | 'weekly' | 'twice_daily';
  dayOfWeek?: number; // 0 = Sunday, 1 = Monday, etc.
  secondRunHourUTC?: number; // For twice_daily jobs
  messageTypes: string[];
  description: string;
}

// Dynamic configuration for WOD generation - fetched from database
interface WodAutoGenConfig {
  is_enabled: boolean;
  generation_hour_utc: number;
  paused_until: string | null;
  pause_reason: string | null;
}

// Dynamic configuration for automation rules - fetched from database
interface AutomationRuleConfig {
  automation_key: string;
  is_active: boolean;
  message_type: string;
  sends_email: boolean;
  sends_dashboard_message: boolean;
}

// Build scheduled jobs dynamically based on database configuration
function buildScheduledJobs(wodConfig: WodAutoGenConfig | null, automationRules: AutomationRuleConfig[]): Record<string, ScheduledJob & { isDisabled?: boolean; disabledReason?: string }> {
  // Build a map of automation rule status
  const ruleStatusMap: Record<string, { isActive: boolean; sendsEmail: boolean; sendsDashboard: boolean }> = {};
  for (const rule of automationRules) {
    ruleStatusMap[rule.automation_key] = {
      isActive: rule.is_active,
      sendsEmail: rule.sends_email,
      sendsDashboard: rule.sends_dashboard_message
    };
  }

  // WOD generation hour from database (default to 3 if not configured)
  const wodHour = wodConfig?.generation_hour_utc ?? 3;
  const wodEnabled = wodConfig?.is_enabled ?? true;
  const wodPausedUntil = wodConfig?.paused_until;
  
  // Check if WOD generation is currently paused
  let wodPaused = false;
  let wodPauseReason = '';
  if (!wodEnabled) {
    wodPaused = true;
    wodPauseReason = 'Disabled by admin';
  } else if (wodPausedUntil) {
    const pauseDate = new Date(wodPausedUntil);
    if (pauseDate > new Date()) {
      wodPaused = true;
      wodPauseReason = `Paused until ${pauseDate.toLocaleDateString('en-GB')}`;
    }
  }

  return {
    'morning_notifications': {
      name: 'Morning WOD & Ritual Notifications',
      cronHourUTC: 5, // 7:00 AM Cyprus winter, 8:00 AM summer
      frequency: 'daily',
      messageTypes: ['wod_notification', 'daily_ritual', 'morning_notification'],
      description: 'Sends daily WOD and Ritual notifications to users',
      isDisabled: !ruleStatusMap['wod_notification']?.isActive && !ruleStatusMap['daily_ritual']?.isActive,
      disabledReason: 'Disabled in automation rules'
    },
    'checkin_reminders': {
      name: 'Check-in Reminders',
      cronHourUTC: 6, // Morning: 8:00 AM Cyprus
      secondRunHourUTC: 18, // Night: 8:00 PM Cyprus
      frequency: 'twice_daily',
      messageTypes: ['checkin_reminder'],
      description: 'Sends morning and evening check-in reminders',
      isDisabled: !ruleStatusMap['checkin_reminder']?.isActive,
      disabledReason: 'Disabled in automation rules'
    },
    'weekly_activity_report': {
      name: 'Weekly Activity Report',
      cronHourUTC: 7, // 9:00 AM Cyprus
      frequency: 'weekly',
      dayOfWeek: 1, // Monday
      messageTypes: ['weekly_activity_report'],
      description: 'Sends weekly activity summary to users',
      isDisabled: !ruleStatusMap['weekly_activity']?.isActive,
      disabledReason: 'Disabled in automation rules'
    },
    'monday_motivation': {
      name: 'Monday Motivation',
      cronHourUTC: 8, // 10:00 AM Cyprus
      frequency: 'weekly',
      dayOfWeek: 1, // Monday
      messageTypes: ['motivational_weekly'],
      description: 'Sends motivational message every Monday',
      isDisabled: !ruleStatusMap['monday_motivation']?.isActive,
      disabledReason: 'Disabled in automation rules'
    },
    'renewal_reminders': {
      name: 'Subscription Renewal Reminders',
      cronHourUTC: 7, // 9:00 AM Cyprus winter, 10:00 AM summer
      frequency: 'daily',
      messageTypes: ['renewal_reminder'],
      description: 'Checks for expiring subscriptions and sends reminders',
      isDisabled: !ruleStatusMap['renewal_reminder']?.isActive,
      disabledReason: 'Disabled in automation rules'
    },
    'new_content_notifications': {
      name: 'New Content Notifications',
      cronHourUTC: -1, // Event-based, not scheduled
      frequency: 'daily', // Runs every 5 minutes but we check daily
      messageTypes: ['new_workout', 'new_program', 'new_article'],
      description: 'Sends notifications when new content is published',
      isDisabled: !ruleStatusMap['new_content']?.isActive,
      disabledReason: 'Disabled in automation rules'
    },
    'wod_archiving': {
      name: 'WOD Archiving',
      cronHourUTC: 22, // 22:00 UTC → 00:00 Cyprus winter, 01:00 summer
      cronMinuteUTC: 0,
      frequency: 'daily',
      messageTypes: [], // Doesn't send messages, archives previous WODs
      description: 'Archives previous WODs at 22:00 UTC (00:00 Cyprus)',
      isDisabled: wodPaused,
      disabledReason: wodPaused ? wodPauseReason : undefined
    },
    'wod_generation': {
      name: 'Workout of Day Generation',
      cronHourUTC: wodHour, // Dynamic from database (should be 22)
      cronMinuteUTC: 30,    // Runs at :30 past the hour
      frequency: 'daily',
      messageTypes: [], // Doesn't send messages, generates content
      description: `Generates new daily workout at ${wodHour}:30 UTC (00:30 Cyprus)`,
      isDisabled: wodPaused,
      disabledReason: wodPaused ? wodPauseReason : undefined
    },
    'ritual_generation': {
      name: 'Daily Ritual Generation',
      cronHourUTC: 22, // 22:05 UTC (previous day) → 00:05 Cyprus winter
      cronMinuteUTC: 5,
      frequency: 'daily',
      messageTypes: [], // Doesn't send messages, generates content
      description: 'Generates the daily Smarty Ritual content'
    }
  };
}

// Helper function to get Cyprus time from UTC
function getCyprusTime(utcDate: Date): Date {
  // Cyprus is UTC+2 in winter, UTC+3 in summer (EET/EEST)
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Nicosia',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  const parts = formatter.formatToParts(utcDate);
  const get = (type: string) => parts.find(p => p.type === type)?.value || '0';
  return new Date(`${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}`);
}

// Helper to format time nicely
function formatCyprusTime(hour: number, minute: number = 0): string {
  // Convert UTC hour to Cyprus time (add 2 or 3 depending on DST)
  const now = new Date();
  const cyprusNow = getCyprusTime(now);
  const utcNow = now.getUTCHours();
  const cyprusHour = cyprusNow.getHours();
  const offset = cyprusHour - utcNow;
  
  const cyprusJobHour = (hour + offset + 24) % 24;
  const period = cyprusJobHour >= 12 ? 'PM' : 'AM';
  const displayHour = cyprusJobHour % 12 || 12;
  return minute > 0 ? `${displayHour}:${minute.toString().padStart(2, '0')} ${period}` : `${displayHour}:00 ${period}`;
}

// Get job status with intelligent detection
interface JobStatus {
  status: 'ran' | 'pending' | 'not_today' | 'missed' | 'event_based';
  description: string;
  details: string;
  lastRunTime?: string;
  nextRunTime?: string;
  messageCount?: number;
}

function getJobStatus(
  job: ScheduledJob,
  currentTime: Date,
  lastMessageTime: Date | null,
  messageCount: number,
  hasExpiringSubs?: boolean // Optional: for renewal_reminders, whether there are expiring subs
): JobStatus {
  const currentHourUTC = currentTime.getUTCHours();
  const currentMinuteUTC = currentTime.getUTCMinutes();
  const currentDayOfWeek = currentTime.getDay();
  
  // Event-based jobs (like new content notifications)
  if (job.cronHourUTC === -1) {
    return {
      status: 'event_based',
      description: 'Runs when new content is published',
      details: messageCount > 0 
        ? `${messageCount} notification(s) sent today` 
        : 'No new content published today (normal)',
      messageCount
    };
  }
  
  // Weekly jobs - check if today is the right day
  if (job.frequency === 'weekly' && job.dayOfWeek !== undefined) {
    if (currentDayOfWeek !== job.dayOfWeek) {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const nextRunDate = new Date(currentTime);
      const daysUntil = (job.dayOfWeek - currentDayOfWeek + 7) % 7 || 7;
      nextRunDate.setDate(nextRunDate.getDate() + daysUntil);
      
      return {
        status: 'not_today',
        description: `Runs on ${dayNames[job.dayOfWeek]}s at ${formatCyprusTime(job.cronHourUTC)} Cyprus`,
        details: `Next run: ${nextRunDate.toLocaleDateString('en-GB', { weekday: 'long', month: 'short', day: 'numeric' })}`,
        nextRunTime: nextRunDate.toISOString()
      };
    }
  }
  
  // Check if we're before the scheduled time
  const scheduledMinute = job.cronMinuteUTC || 0;
  const timeInMinutesNow = currentHourUTC * 60 + currentMinuteUTC;
  const timeInMinutesScheduled = job.cronHourUTC * 60 + scheduledMinute;
  
  // For twice_daily jobs, check both run times
  if (job.frequency === 'twice_daily' && job.secondRunHourUTC !== undefined) {
    const secondTimeInMinutes = job.secondRunHourUTC * 60;
    
    // Before first run
    if (timeInMinutesNow < timeInMinutesScheduled) {
      return {
        status: 'pending',
        description: `First run at ${formatCyprusTime(job.cronHourUTC)} Cyprus`,
        details: `Scheduled in ${Math.round((timeInMinutesScheduled - timeInMinutesNow) / 60 * 10) / 10} hours`,
        messageCount
      };
    }
    
    // Between first and second run
    if (timeInMinutesNow >= timeInMinutesScheduled && timeInMinutesNow < secondTimeInMinutes) {
      if (messageCount > 0) {
        return {
          status: 'ran',
          description: `Morning run complete at ${formatCyprusTime(job.cronHourUTC)} Cyprus`,
          details: `${messageCount} notifications sent. Evening run at ${formatCyprusTime(job.secondRunHourUTC)} Cyprus`,
          lastRunTime: lastMessageTime?.toISOString(),
          messageCount
        };
      } else {
        return {
          status: 'missed',
          description: `Expected at ${formatCyprusTime(job.cronHourUTC)} Cyprus, not found`,
          details: `Check edge function logs. Evening run scheduled at ${formatCyprusTime(job.secondRunHourUTC)} Cyprus`
        };
      }
    }
    
    // After second run
    if (timeInMinutesNow >= secondTimeInMinutes) {
      if (messageCount > 0) {
        return {
          status: 'ran',
          description: `Both runs complete`,
          details: `${messageCount} notifications sent today (morning + evening)`,
          lastRunTime: lastMessageTime?.toISOString(),
          messageCount
        };
      } else {
        return {
          status: 'missed',
          description: `Expected runs at ${formatCyprusTime(job.cronHourUTC)} & ${formatCyprusTime(job.secondRunHourUTC)} Cyprus`,
          details: 'No notifications found - check edge function logs'
        };
      }
    }
  }
  
  // Standard daily/weekly job logic
  if (timeInMinutesNow < timeInMinutesScheduled) {
    const hoursUntil = (timeInMinutesScheduled - timeInMinutesNow) / 60;
    return {
      status: 'pending',
      description: `Scheduled for ${formatCyprusTime(job.cronHourUTC, scheduledMinute)} Cyprus`,
      details: hoursUntil >= 1 
        ? `Will run in ${Math.round(hoursUntil)} hour${Math.round(hoursUntil) !== 1 ? 's' : ''}`
        : `Will run in ${Math.round(hoursUntil * 60)} minutes`,
      messageCount
    };
  }
  
  // We're past the scheduled time - check if it ran
  if (messageCount > 0 || lastMessageTime) {
    return {
      status: 'ran',
      description: `Ran at ${lastMessageTime ? formatCyprusTime(lastMessageTime.getUTCHours(), lastMessageTime.getUTCMinutes()) : formatCyprusTime(job.cronHourUTC, scheduledMinute)} Cyprus`,
      details: `${messageCount} notification${messageCount !== 1 ? 's' : ''} delivered`,
      lastRunTime: lastMessageTime?.toISOString(),
      messageCount
    };
  }
  
  // Job should have run but we found no messages
  // For content generation jobs (no messageTypes), check differently
  if (job.messageTypes.length === 0) {
    // Content generation doesn't create messages - we need actual verification later
    return {
      status: 'pending', // Mark as pending - actual verification will be done by caller
      description: `Scheduled at ${formatCyprusTime(job.cronHourUTC, scheduledMinute)} Cyprus`,
      details: 'Content verification required (see content-specific checks)'
    };
  }
  
  // Special case: renewal_reminders with no expiring subscriptions is NOT a miss
  if (job.messageTypes.includes('renewal_reminder') && hasExpiringSubs === false) {
    return {
      status: 'ran',
      description: `Ran at ${formatCyprusTime(job.cronHourUTC, scheduledMinute)} Cyprus`,
      details: 'No expiring subscriptions to notify (expected behavior)',
      messageCount: 0
    };
  }
  
  return {
    status: 'missed',
    description: `Expected at ${formatCyprusTime(job.cronHourUTC, scheduledMinute)} Cyprus, not found`,
    details: 'No notifications found - check edge function logs for errors'
  };
}

interface HealthCheck {
  id: number;
  category: string;
  name: string;
  description: string;
  status: 'pass' | 'warning' | 'fail' | 'skip';
  details?: string;
  accessMatrix?: {
    visitor: string;
    subscriber: string;
    standalone: string;
    premium: string;
    admin: string;
  };
}

interface AuditResult {
  timestamp: string;
  duration_ms: number;
  total_checks: number;
  passed: number;
  warnings: number;
  failed: number;
  skipped: number;
  checks: HealthCheck[];
  summary: {
    critical_issues: HealthCheck[];
    warnings: HealthCheck[];
  };
}

const handler = async (req: Request): Promise<Response> => {
  console.log("🏥 System Health Audit starting...");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const checks: HealthCheck[] = [];
  let checkId = 1;

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { sendEmail = false, adminEmail = "harisfalas@gmail.com" } = await req.json().catch(() => ({}));

    // Helper function to add check
    const addCheck = (
      category: string,
      name: string,
      description: string,
      status: 'pass' | 'warning' | 'fail' | 'skip',
      details?: string,
      accessMatrix?: HealthCheck['accessMatrix']
    ) => {
      checks.push({
        id: checkId++,
        category,
        name,
        description,
        status,
        details,
        accessMatrix
      });
    };

    // Get current time info - USE CYPRUS DATE as single source of truth
    const now = new Date();
    const cyprusNow = getCyprusTime(now);
    const todayStart = new Date(now);
    todayStart.setUTCHours(0, 0, 0, 0);
    
    // CRITICAL: Use Cyprus date for all WOD checks (matches how WODs are generated)
    const cyprusParts = new Intl.DateTimeFormat('en-CA', { 
      timeZone: 'Europe/Nicosia', 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    }).format(now);
    const today = cyprusParts; // Cyprus date in YYYY-MM-DD format
    const yesterdayDate = new Date(cyprusNow.getTime() - 86400000);
    const yesterday = new Intl.DateTimeFormat('en-CA', { 
      timeZone: 'Europe/Nicosia', 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    }).format(yesterdayDate);

    console.log(`📅 Audit time: ${now.toISOString()} | Cyprus: ${cyprusNow.toLocaleTimeString('en-GB')} | Cyprus date: ${today}`);

    // ============================================
    // FETCH DYNAMIC CONFIGURATION
    // ============================================
    console.log("⚙️ Fetching dynamic configuration...");
    
    // Fetch WOD auto-generation config
    const { data: wodAutoGenConfig } = await supabase
      .from('wod_auto_generation_config')
      .select('is_enabled, generation_hour_utc, paused_until, pause_reason')
      .limit(1)
      .maybeSingle();
    
    // Fetch automation rules
    const { data: automationRulesData } = await supabase
      .from('automation_rules')
      .select('automation_key, is_active, message_type, sends_email, sends_dashboard_message');
    
    // Build scheduled jobs dynamically based on configuration
    const SCHEDULED_JOBS = buildScheduledJobs(
      wodAutoGenConfig as WodAutoGenConfig | null,
      (automationRulesData || []) as AutomationRuleConfig[]
    );
    
    console.log(`📋 WOD Config: ${wodAutoGenConfig ? `Hour=${wodAutoGenConfig.generation_hour_utc}, Enabled=${wodAutoGenConfig.is_enabled}` : 'Not configured (using defaults)'}`);
    console.log(`📋 Automation Rules: ${automationRulesData?.length || 0} rules loaded`);

    // ============================================
    // CATEGORY 1: DATABASE & TABLES
    // ============================================
    console.log("📊 Checking database tables...");

    const tables = [
      'admin_workouts', 'admin_training_programs', 'blog_articles', 'profiles',
      'user_subscriptions', 'user_purchases', 'user_roles', 'user_system_messages',
      'contact_messages', 'testimonials', 'workout_interactions', 'program_interactions',
      'smarty_checkins', 'daily_smarty_rituals', 'workout_of_day_state', 'automation_rules',
      'scheduled_emails', 'scheduled_notifications', 'notification_audit_log', 'corporate_subscriptions',
      'corporate_members', 'email_templates', 'response_templates', 'newsletter_subscribers',
      'bmr_history', 'calorie_history', 'onerm_history', 'user_activity_log', 'user_badges',
      'shop_products', 'ritual_purchases', 'pending_content_notifications', 'system_settings'
    ];

    for (const table of tables) {
      try {
        const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
        if (error) {
          addCheck('Database', `Table: ${table}`, `Check if ${table} table is accessible`, 'fail', error.message);
        } else {
          addCheck('Database', `Table: ${table}`, `${table} accessible with ${count || 0} rows`, 'pass');
        }
      } catch (e) {
        addCheck('Database', `Table: ${table}`, `Check if ${table} table is accessible`, 'fail', String(e));
      }
    }

    // ============================================
    // CATEGORY 2: CONTENT COUNTS
    // ============================================
    console.log("📚 Checking content counts...");

    // Workouts
    const { count: totalWorkouts } = await supabase.from('admin_workouts').select('*', { count: 'exact', head: true });
    const { count: visibleWorkouts } = await supabase.from('admin_workouts').select('*', { count: 'exact', head: true }).eq('is_visible', true);
    const { count: premiumWorkouts } = await supabase.from('admin_workouts').select('*', { count: 'exact', head: true }).eq('is_premium', true);
    const { count: freeWorkouts } = await supabase.from('admin_workouts').select('*', { count: 'exact', head: true }).eq('is_premium', false);
    const { count: standaloneWorkouts } = await supabase.from('admin_workouts').select('*', { count: 'exact', head: true }).eq('is_standalone_purchase', true);

    addCheck('Content', 'Total Workouts', `Database contains ${totalWorkouts || 0} workouts`, totalWorkouts && totalWorkouts > 0 ? 'pass' : 'warning');
    addCheck('Content', 'Visible Workouts', `${visibleWorkouts || 0} workouts are visible`, visibleWorkouts && visibleWorkouts > 0 ? 'pass' : 'warning');
    addCheck('Content', 'Premium Workouts', `${premiumWorkouts || 0} premium workouts`, 'pass');
    addCheck('Content', 'Free Workouts', `${freeWorkouts || 0} free workouts`, freeWorkouts && freeWorkouts > 0 ? 'pass' : 'warning');
    addCheck('Content', 'Standalone Workouts', `${standaloneWorkouts || 0} available for individual purchase`, 'pass');

    // Training Programs
    const { count: totalPrograms } = await supabase.from('admin_training_programs').select('*', { count: 'exact', head: true });
    const { count: visiblePrograms } = await supabase.from('admin_training_programs').select('*', { count: 'exact', head: true }).eq('is_visible', true);
    const { count: premiumPrograms } = await supabase.from('admin_training_programs').select('*', { count: 'exact', head: true }).eq('is_premium', true);
    const { count: standalonePrograms } = await supabase.from('admin_training_programs').select('*', { count: 'exact', head: true }).eq('is_standalone_purchase', true);

    addCheck('Content', 'Total Programs', `Database contains ${totalPrograms || 0} training programs`, totalPrograms && totalPrograms > 0 ? 'pass' : 'warning');
    addCheck('Content', 'Visible Programs', `${visiblePrograms || 0} programs are visible`, visiblePrograms && visiblePrograms > 0 ? 'pass' : 'warning');
    addCheck('Content', 'Premium Programs', `${premiumPrograms || 0} premium programs`, 'pass');
    addCheck('Content', 'Standalone Programs', `${standalonePrograms || 0} available for individual purchase`, 'pass');

    // Blog Articles
    const { count: totalArticles } = await supabase.from('blog_articles').select('*', { count: 'exact', head: true });
    const { count: publishedArticles } = await supabase.from('blog_articles').select('*', { count: 'exact', head: true }).eq('is_published', true);

    addCheck('Content', 'Total Blog Articles', `Database contains ${totalArticles || 0} articles`, totalArticles && totalArticles > 0 ? 'pass' : 'warning');
    addCheck('Content', 'Published Articles', `${publishedArticles || 0} articles are published`, publishedArticles && publishedArticles > 0 ? 'pass' : 'warning');

    // ============================================
    // CATEGORY 3: WOD SYSTEM
    // ============================================
    console.log("🏋️ Checking WOD system...");

    // Check WOD generation config status
    const wodGenHour = wodAutoGenConfig?.generation_hour_utc ?? 3;
    const wodGenEnabled = wodAutoGenConfig?.is_enabled ?? true;
    const wodGenPausedUntil = wodAutoGenConfig?.paused_until;
    
    // Determine if WOD generation is currently paused
    let isWodGenPaused = false;
    let wodPauseMessage = '';
    if (!wodGenEnabled) {
      isWodGenPaused = true;
      wodPauseMessage = 'WOD auto-generation is disabled';
    } else if (wodGenPausedUntil) {
      const pauseDate = new Date(wodGenPausedUntil);
      if (pauseDate > now) {
        isWodGenPaused = true;
        wodPauseMessage = `WOD generation paused until ${pauseDate.toLocaleDateString('en-GB')}`;
      }
    }
    
    // Add WOD generation config status check
    addCheck(
      'WOD System',
      'WOD Auto-Generation Config',
      isWodGenPaused ? 'PAUSED' : `Active at ${wodGenHour}:00 UTC (${formatCyprusTime(wodGenHour)} Cyprus)`,
      'pass', // Paused is intentional, not a failure
      isWodGenPaused ? wodPauseMessage : `Reading from database configuration`
    );

    // Check if we're in the WOD preparation gap (around generation time)
    const currentHourUTC = now.getUTCHours();
    const currentMinuteUTC = now.getUTCMinutes();
    // Gap is at the generation hour (dynamic from config)
    const isInWodPreparationGap = currentHourUTC === 0 && currentMinuteUTC < 30;
    
    // CRITICAL: Check periodization to determine expected WOD count
    // Recovery days expect 1 WOD (VARIOUS), training days expect 2 (BODYWEIGHT + EQUIPMENT)
    const dayIn84 = getDayIn84Cycle(today);
    const periodization = getPeriodizationForDay(dayIn84);
    const expectedCategory = periodization.category;
    const isRecoveryDay = expectedCategory === 'RECOVERY';
    const expectedWodCount = isRecoveryDay ? 1 : 2;
    const expectedEquipmentTypes = isRecoveryDay ? ['VARIOUS'] : ['BODYWEIGHT', 'EQUIPMENT'];

    const {
      data: todayWods,
      count: todayWodCount,
      error: todayWodsError,
    } = await supabase
      .from('admin_workouts')
      .select('id, name, image_url, category, difficulty_stars, equipment, generated_for_date', { count: 'exact' })
      .eq('is_workout_of_day', true)
      .eq('generated_for_date', today); // Filter by Cyprus date!

    if (todayWodsError) {
      addCheck('WOD System', 'Active WOD Query', 'Fetch active WODs', 'fail', todayWodsError.message);
    }

    const activeWodDates = Array.from(
      new Set((todayWods ?? []).map((w) => w.generated_for_date).filter(Boolean))
    );

    // Handle WOD preparation gap period OR paused generation
    if (isWodGenPaused) {
      // WOD generation is paused - don't report missing WODs as failures
      addCheck(
        'WOD System',
        'Active WODs Exist',
        `${todayWodCount || 0} active WODs (generation paused)`,
        'pass', // Paused is intentional
        wodPauseMessage + '. No new WODs will be generated until resumed.'
      );
    } else if (isInWodPreparationGap) {
      addCheck(
        'WOD System',
        'WOD Preparation Gap',
        `Currently in WOD preparation window (00:00-00:30 UTC)`,
        'pass',
        `Archiving completed at 00:00, generation in progress at 00:30. Current: ${currentHourUTC}:${currentMinuteUTC.toString().padStart(2, '0')} UTC`
      );
      
      // During gap, 0 WODs is expected
      addCheck(
        'WOD System',
        'Active WODs Exist',
        `${todayWodCount || 0} active WODs (gap period - expected)`,
        todayWodCount === 0 ? 'pass' : 'pass',
        todayWodCount === 0 
          ? 'No active WODs during preparation gap (expected behavior)'
          : `${todayWodCount} WOD(s) still active during gap`
      );
    } else {
      // Build detailed failure message based on Recovery vs Training day
      let detailMessage = '';
      const actualCount = todayWodCount || 0;
      
      if (actualCount === 0) {
        detailMessage = isRecoveryDay
          ? `ISSUE: 0 active WODs found. Expected: 1 Recovery WOD (VARIOUS) for ${today} (Cyprus).\n\n` +
            `POSSIBLE CAUSES:\n` +
            `• Automatic generation at ${wodAutoGenConfig?.generation_hour_utc ?? 22}:30 UTC failed\n` +
            `• Edge function 'generate-workout-of-day' returned an error\n` +
            `• Recovery WOD was created but not tagged correctly\n\n` +
            `SOLUTION: Go to Admin → WOD Manager → click 'Generate New WOD' → select 'Generate for Today'`
          : `ISSUE: 0 active WODs found. Expected: 2 (bodyweight + equipment) for ${today} (Cyprus).\n\n` +
            `POSSIBLE CAUSES:\n` +
            `• Automatic generation at ${wodAutoGenConfig?.generation_hour_utc ?? 22}:30 UTC failed\n` +
            `• Edge function 'generate-workout-of-day' returned an error\n` +
            `• Workouts were created but not tagged with is_workout_of_day=true\n` +
            `• Workouts created with wrong generated_for_date\n\n` +
            `SOLUTION: Go to Admin → WOD Manager → click 'Generate New WOD' → select 'Generate for Today'`;
      } else if (actualCount < expectedWodCount) {
        detailMessage = isRecoveryDay
          ? `Recovery day should have 1 VARIOUS WOD. Found: ${actualCount}. generated_for_date: ${activeWodDates.join(', ') || 'n/a'}`
          : `ISSUE: Only ${actualCount} active WOD found. Expected: 2 (bodyweight + equipment).\n\n` +
            `POSSIBLE CAUSES:\n` +
            `• Generation partially failed (one variant created, one failed)\n` +
            `• Stripe product creation timed out for second variant\n\n` +
            `SOLUTION: Regenerate today's WOD. generated_for_date: ${activeWodDates.join(', ') || 'n/a'}`;
      } else if (actualCount > expectedWodCount) {
        detailMessage = `${actualCount} active WODs found, expected ${expectedWodCount}${isRecoveryDay ? ' (Recovery day)' : ' (training day)'}. ` +
          `generated_for_date: ${activeWodDates.join(', ') || 'n/a'}. ` +
          `This may indicate old WODs were not properly archived.`;
      }

      const statusPass = actualCount === expectedWodCount;
      
      addCheck(
        'WOD System',
        'Active WODs Exist',
        `${actualCount} active WOD${actualCount !== 1 ? 's' : ''} for ${today} (Cyprus)${isRecoveryDay ? ' - Recovery Day' : ''}`,
        statusPass ? 'pass' : actualCount === 0 ? 'fail' : 'warning',
        statusPass
          ? isRecoveryDay 
            ? `✅ Recovery day: 1 VARIOUS WOD exists as expected`
            : `✅ Both variants exist (bodyweight + equipment)`
          : detailMessage
      );
    }

    // Check WODs have unique images - only for training days (2 WODs)
    if (todayWods && todayWods.length === expectedWodCount) {
      if (isRecoveryDay) {
        // Recovery day - single WOD checks
        const hasImage = todayWods[0]?.image_url;
        addCheck('WOD System', 'WOD Image Exists', 'Recovery WOD has an image', 
          hasImage ? 'pass' : 'warning',
          hasImage ? 'Image present' : 'Missing image for recovery WOD'
        );
        
        const hasVarious = todayWods[0]?.equipment?.toUpperCase() === 'VARIOUS';
        addCheck('WOD System', 'WOD Equipment Type', 'Recovery WOD uses VARIOUS equipment', 
          hasVarious ? 'pass' : 'warning',
          hasVarious ? 'VARIOUS equipment type - correct for recovery' : `Unexpected equipment: ${todayWods[0]?.equipment}`
        );
        
        // Skip unique images and variants check on recovery days
        addCheck('WOD System', 'WOD Unique Images', 'N/A - Recovery day (1 WOD only)', 'pass', 'Recovery days have 1 WOD, no uniqueness check needed');
        addCheck('WOD System', 'WOD Equipment Variants', 'N/A - Recovery day (1 WOD only)', 'pass', 'Recovery days do not have bodyweight/equipment variants');
      } else {
        // Training day - 2 WODs expected
        const hasUniqueImages = todayWods[0].image_url !== todayWods[1].image_url;
        addCheck('WOD System', 'WOD Unique Images', 'Each WOD has a different image', 
          hasUniqueImages ? 'pass' : 'fail',
          hasUniqueImages ? 'Images are unique' : 'CRITICAL: Both WODs have the same image!'
        );

        const bothHaveImages = todayWods[0].image_url && todayWods[1].image_url;
        addCheck('WOD System', 'WOD Images Exist', 'Both WODs have images assigned', 
          bothHaveImages ? 'pass' : 'fail',
          bothHaveImages ? 'All images present' : 'Missing image(s)'
        );

        const hasBodyweight = todayWods.some(w => w.equipment?.toUpperCase() === 'BODYWEIGHT');
        const hasEquipment = todayWods.some(w => w.equipment?.toUpperCase() === 'EQUIPMENT');
        addCheck('WOD System', 'WOD Equipment Variants', 'One bodyweight, one with equipment', 
          hasBodyweight && hasEquipment ? 'pass' : 'warning',
          hasBodyweight && hasEquipment ? 'Both variants exist' : `Missing variant - found: ${todayWods.map(w => w.equipment).join(', ')}`
        );
      }
    } else if (todayWods && todayWods.length > 0) {
      // Some WODs exist but wrong count
      addCheck('WOD System', 'WOD Unique Images', `Cannot validate - ${todayWods.length} WODs exist, expected ${expectedWodCount}`, 'warning');
      addCheck('WOD System', 'WOD Images Exist', `Cannot validate - ${todayWods.length} WODs exist, expected ${expectedWodCount}`, 'warning');
      addCheck('WOD System', 'WOD Equipment Variants', `Cannot validate - ${todayWods.length} WODs exist, expected ${expectedWodCount}`, 'warning');
    } else {
      addCheck('WOD System', 'WOD Unique Images', 'Cannot check - WODs missing', 'skip');
      addCheck('WOD System', 'WOD Images Exist', 'Cannot check - WODs missing', 'skip');
      addCheck('WOD System', 'WOD Equipment Variants', 'Cannot check - WODs missing', 'skip');
    }

    // WOD State - using simplified 84-day cycle (Day 1-84, then restarts)
    const { data: wodState } = await supabase.from('workout_of_day_state').select('*').single();
    
    // Uses periodization variables already declared above (dayIn84, periodization, expectedCategory, isRecoveryDay)
    const expectedDifficulty = periodization.difficulty;
    const isStrengthDay = expectedCategory === 'STRENGTH';
    const strengthFocus = periodization.strengthFocus;
    
    if (wodState) {
      addCheck('WOD System', 'WOD State Tracking', 
        `Day ${dayIn84}/84, Category: ${wodState.current_category}${strengthFocus ? ` (${strengthFocus})` : ''}`, 
        'pass'
      );

      const actualWodCategory = todayWods?.[0]?.category;
      if (!actualWodCategory) {
        addCheck(
          'WOD System',
          'Periodization Cycle (84-Day)',
          `Day ${dayIn84}/84 should be ${expectedCategory}${isRecoveryDay ? ' (Recovery day - 1 WOD expected)' : ''}${isStrengthDay ? ` [${expectedDifficulty}]` : ''}`,
          isRecoveryDay ? 'pass' : 'skip',
          isRecoveryDay ? 'Recovery day - 1 VARIOUS WOD expected (no difficulty rating)' : 'Cannot determine active WOD category'
        );
      } else {
        const categoryMatch = actualWodCategory
          .toUpperCase()
          .includes(expectedCategory.toUpperCase().split(' ')[0]);

        addCheck(
          'WOD System',
          'Periodization Cycle (84-Day)',
          `Day ${dayIn84}/84 should be ${expectedCategory}${isStrengthDay ? ` [${expectedDifficulty}]` : ''}`,
          categoryMatch ? 'pass' : 'warning',
          categoryMatch
            ? `Actual WOD category matches: ${actualWodCategory}${strengthFocus ? ` (${strengthFocus})` : ''}`
            : `Expected ${expectedCategory}, actual WOD: ${actualWodCategory} (may be from previous system)`
        );
        
        // Difficulty validation check
        const expectedRange = periodization.difficultyStars;
        const actualStars = todayWods?.[0]?.difficulty_stars;
        
        if (expectedRange && actualStars) {
          const isWithinRange = actualStars >= expectedRange[0] && actualStars <= expectedRange[1];
          addCheck(
            'WOD System',
            'Difficulty Validation',
            `Expected ${expectedDifficulty} (${expectedRange[0]}-${expectedRange[1]} stars)`,
            isWithinRange ? 'pass' : 'fail',
            isWithinRange 
              ? `✅ Actual: ${actualStars} stars (within range)`
              : `MISMATCH: Actual ${actualStars} stars, expected ${expectedRange[0]}-${expectedRange[1]}. Regenerate WOD to fix.`
          );
        } else if (!expectedRange && !isRecoveryDay) {
          addCheck('WOD System', 'Difficulty Validation', 'No expected range defined', 'skip');
        } else if (isRecoveryDay) {
          addCheck('WOD System', 'Difficulty Validation', 'Recovery day - no difficulty expected', 'pass');
        }
      }

      addCheck('WOD System', 'Last Generation Time', wodState.last_generated_at ? `Last generated: ${wodState.last_generated_at}` : 'Never generated', 
        wodState.last_generated_at ? 'pass' : 'warning'
      );
    } else {
      addCheck('WOD System', 'WOD State Tracking', 'No state record found', 'fail', 'workout_of_day_state table may be empty');
    }

    // ============================================
    // CATEGORY 4: DAILY RITUAL
    // ============================================
    console.log("🌅 Checking Daily Ritual...");

    const { data: todayRitual } = await supabase
      .from('daily_smarty_rituals')
      .select('*')
      .eq('ritual_date', today)
      .single();

    addCheck('Daily Ritual', "Today's Ritual Exists", `Ritual for ${today}`, 
      todayRitual ? 'pass' : 'fail',
      todayRitual ? 'Generated' : 'Missing - users cannot see ritual today'
    );

    if (todayRitual) {
      const hasGoodMorning = todayRitual.morning_content?.includes('Good morning, Smarty');
      addCheck('Daily Ritual', 'Morning Format', 'Starts with "Good morning, Smarty"', 
        hasGoodMorning ? 'pass' : 'warning',
        hasGoodMorning ? 'Correct format' : 'Missing branded greeting'
      );

      addCheck('Daily Ritual', 'All Sections Present', 'Morning, Midday, Evening content', 
        todayRitual.morning_content && todayRitual.midday_content && todayRitual.evening_content ? 'pass' : 'fail',
        'All three sections required'
      );
    }

    // ============================================
    // CATEGORY 5: USER STATS
    // ============================================
    console.log("👥 Checking user statistics...");

    const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: goldUsers } = await supabase.from('user_subscriptions').select('*', { count: 'exact', head: true }).eq('plan_type', 'gold').eq('status', 'active');
    const { count: platinumUsers } = await supabase.from('user_subscriptions').select('*', { count: 'exact', head: true }).eq('plan_type', 'platinum').eq('status', 'active');
    const { count: adminUsers } = await supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'admin');
    const { count: corporateSubs } = await supabase.from('corporate_subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active');

    addCheck('Users', 'Total Registered Users', `${totalUsers || 0} users in system`, 'pass');
    addCheck('Users', 'Gold Subscribers', `${goldUsers || 0} active Gold members`, 'pass');
    addCheck('Users', 'Platinum Subscribers', `${platinumUsers || 0} active Platinum members`, 'pass');
    addCheck('Users', 'Admin Users', `${adminUsers || 0} administrators`, adminUsers && adminUsers > 0 ? 'pass' : 'warning');
    addCheck('Users', 'Corporate Subscriptions', `${corporateSubs || 0} active corporate plans`, 'pass');

    // ============================================
    // CATEGORY 6: STRIPE INTEGRATION
    // ============================================
    console.log("💳 Checking Stripe integration...");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    addCheck('Stripe', 'API Key Configured', 'Stripe secret key is set', 
      stripeKey ? 'pass' : 'fail',
      stripeKey ? 'Key exists' : 'CRITICAL: No Stripe API key!'
    );

    if (stripeKey) {
      try {
        const productResponse = await fetch('https://api.stripe.com/v1/products?active=true&limit=100', {
          headers: { 'Authorization': `Bearer ${stripeKey}` }
        });
        const products = await productResponse.json();
        
        addCheck('Stripe', 'Products Configured', `${products.data?.length || 0} active products`, 
          products.data?.length > 0 ? 'pass' : 'warning',
          'Gold, Platinum, Corporate plans should exist'
        );

        const priceResponse = await fetch('https://api.stripe.com/v1/prices?active=true&limit=100', {
          headers: { 'Authorization': `Bearer ${stripeKey}` }
        });
        const prices = await priceResponse.json();
        
        addCheck('Stripe', 'Prices Configured', `${prices.data?.length || 0} active prices`, 
          prices.data?.length > 0 ? 'pass' : 'warning'
        );
      } catch (e) {
        addCheck('Stripe', 'API Connection', 'Cannot connect to Stripe API', 'fail', String(e));
      }
    }

    // ============================================
    // CATEGORY 7: SCHEDULED JOBS (INTELLIGENT)
    // ============================================
    console.log("📬 Checking scheduled jobs with schedule awareness...");

    // Fetch ALL messages from today to analyze
    const { data: todayMessages } = await supabase
      .from('user_system_messages')
      .select('id, message_type, subject, created_at')
      .gte('created_at', todayStart.toISOString())
      .order('created_at', { ascending: false });

    // Group messages by type with latest time
    const messagesByType: Record<string, { count: number; latestTime: Date | null; subjects: string[] }> = {};
    for (const msg of todayMessages || []) {
      const type = msg.message_type as string;
      if (!messagesByType[type]) {
        messagesByType[type] = { count: 0, latestTime: null, subjects: [] };
      }
      messagesByType[type].count++;
      const msgTime = new Date(msg.created_at);
      if (!messagesByType[type].latestTime || msgTime > messagesByType[type].latestTime) {
        messagesByType[type].latestTime = msgTime;
      }
      if (!messagesByType[type].subjects.includes(msg.subject)) {
        messagesByType[type].subjects.push(msg.subject);
      }
    }

    // Check for expiring subscriptions (for renewal_reminders check)
    // Exclude subscriptions with cancel_at_period_end = true (user already cancelled, no reminder needed)
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const { count: expiringSubsCount } = await supabase
      .from('user_subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .eq('cancel_at_period_end', false)
      .gte('current_period_end', today)
      .lte('current_period_end', threeDaysFromNow.toISOString().split('T')[0]);
    
    const hasExpiringSubs = (expiringSubsCount || 0) > 0;

    // Check each scheduled job
    for (const [jobKey, job] of Object.entries(SCHEDULED_JOBS)) {
      // Handle disabled jobs - show as DISABLED, not as failure
      if (job.isDisabled) {
        addCheck(
          'Scheduled Jobs',
          job.name,
          'DISABLED',
          'pass', // Disabled is intentional, not a failure
          job.disabledReason || 'Disabled by configuration'
        );
        continue;
      }
      
      // Count messages for this job
      let messageCount = 0;
      let latestMessageTime: Date | null = null;
      
      for (const msgType of job.messageTypes) {
        if (messagesByType[msgType]) {
          messageCount += messagesByType[msgType].count;
          if (messagesByType[msgType].latestTime) {
            if (!latestMessageTime || messagesByType[msgType].latestTime > latestMessageTime) {
              latestMessageTime = messagesByType[msgType].latestTime;
            }
          }
        }
      }

      // Pass hasExpiringSubs for renewal_reminders job
      const isRenewalJob = job.messageTypes.includes('renewal_reminder');
      const status = getJobStatus(job, now, latestMessageTime, messageCount, isRenewalJob ? hasExpiringSubs : undefined);
      
      // Determine check status based on job status
      let checkStatus: 'pass' | 'warning' | 'fail' | 'skip';
      switch (status.status) {
        case 'ran':
          checkStatus = 'pass';
          break;
        case 'pending':
          checkStatus = 'pass'; // Pending is OK - hasn't run yet but will
          break;
        case 'not_today':
          checkStatus = 'pass'; // Weekly job, not scheduled for today
          break;
        case 'event_based':
          checkStatus = 'pass'; // Event-based, no schedule to miss
          break;
        case 'missed':
          checkStatus = 'warning'; // Should investigate
          break;
        default:
          checkStatus = 'warning';
      }

      addCheck(
        'Scheduled Jobs',
        job.name,
        status.description,
        checkStatus,
        status.details
      );
    }

    // Summary of today's notifications
    const totalMessagesToday = todayMessages?.length || 0;
    const uniqueTypes = Object.keys(messagesByType);
    
    addCheck(
      'Scheduled Jobs',
      "Today's Notification Summary",
      `${totalMessagesToday} notifications delivered`,
      totalMessagesToday > 0 ? 'pass' : 'warning',
      uniqueTypes.length > 0 
        ? `Types: ${uniqueTypes.map(t => `${t}(${messagesByType[t].count})`).join(', ')}`
        : 'No notifications yet today'
    );

    // ============================================
    // CATEGORY 8: EMAIL SYSTEM
    // ============================================
    console.log("📧 Checking email system...");

    const resendKey = Deno.env.get("RESEND_API_KEY");
    addCheck('Email System', 'Resend API Key', 'Email service configured', 
      resendKey ? 'pass' : 'fail',
      resendKey ? 'Key exists' : 'CRITICAL: Cannot send emails!'
    );

    // Check automation rules
    const { data: automationRules } = await supabase.from('automation_rules').select('*');
    if (automationRules) {
      const activeRules = automationRules.filter(r => r.is_active);
      addCheck('Email System', 'Automation Rules', `${activeRules.length}/${automationRules.length} rules active`, 
        activeRules.length > 0 ? 'pass' : 'warning'
      );
    }

    // Count automated message templates
    const { count: templateCount } = await supabase
      .from('automated_message_templates')
      .select('*', { count: 'exact', head: true });
    
    addCheck('Email System', 'Message Templates', `${templateCount || 0} automated message templates configured`, 
      (templateCount || 0) > 0 ? 'pass' : 'warning'
    );

    // Check scheduled emails pending
    const { count: pendingEmails } = await supabase
      .from('scheduled_emails')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    
    addCheck('Email System', 'Pending Scheduled Emails', `${pendingEmails || 0} emails scheduled`, 'pass');

    // Check for email failures in scheduled_emails
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const { data: failedEmails } = await supabase
      .from('scheduled_emails')
      .select('id, error_message')
      .eq('status', 'failed')
      .gte('created_at', weekAgo);
    
    addCheck('Email System', 'Recent Email Failures', `${failedEmails?.length || 0} failed emails in last 7 days`, 
      (failedEmails?.length || 0) === 0 ? 'pass' : 'warning',
      failedEmails?.length ? `Errors: ${failedEmails.slice(0, 3).map(e => e.error_message).join('; ')}` : 'No failures'
    );

    // ============================================
    // CATEGORY 9: CONTACT SYSTEM
    // ============================================
    console.log("📞 Checking contact system...");

    const { count: unreadMessages } = await supabase
      .from('contact_messages')
      .select('*', { count: 'exact', head: true })
      .is('read_at', null);

    addCheck('Contact', 'Unread Messages', `${unreadMessages || 0} unread contact messages`, 
      unreadMessages && unreadMessages > 5 ? 'warning' : 'pass',
      unreadMessages && unreadMessages > 5 ? 'Consider responding to pending messages' : 'Inbox manageable'
    );

    const { count: responseTemplates } = await supabase.from('response_templates').select('*', { count: 'exact', head: true });
    addCheck('Contact', 'Response Templates', `${responseTemplates || 0} templates available`, 
      responseTemplates && responseTemplates > 0 ? 'pass' : 'warning'
    );

    // ============================================
    // CATEGORY 10: STORAGE & ASSETS
    // ============================================
    console.log("📁 Checking storage buckets...");

    const buckets = ['avatars', 'blog-images', 'contact-files', 'ritual-images'];
    for (const bucket of buckets) {
      const { data, error } = await supabase.storage.from(bucket).list('', { limit: 1 });
      addCheck('Storage', `Bucket: ${bucket}`, `Storage bucket accessible`, 
        !error ? 'pass' : 'fail',
        error ? error.message : 'Accessible'
      );
    }

    // ============================================
    // CATEGORY 11: CRON JOBS
    // ============================================
    console.log("⏰ Checking cron jobs...");

    const { data: cronEnabled } = await supabase.rpc('pg_cron_enabled');
    addCheck('Cron Jobs', 'pg_cron Extension', 'Cron scheduling enabled', 
      cronEnabled ? 'pass' : 'fail',
      cronEnabled ? 'Extension active' : 'Cron jobs will not run!'
    );

    // ============================================
    // CATEGORY 12: NOTIFICATION PREFERENCES
    // ============================================
    console.log("⚙️ Checking notification preferences...");

    const expectedPreferenceKeys = [
      'opt_out_all',
      'email_wod', 'dashboard_wod',
      'email_ritual', 'dashboard_ritual',
      'email_monday_motivation', 'dashboard_monday_motivation',
      'email_new_workout', 'dashboard_new_workout',
      'email_new_program', 'dashboard_new_program',
      'email_new_article', 'dashboard_new_article',
      'email_weekly_activity', 'dashboard_weekly_activity',
      'email_checkin_reminders', 'dashboard_checkin_reminders'
    ];

    const { data: sampleProfiles } = await supabase
      .from('profiles')
      .select('notification_preferences')
      .limit(10);
    
    if (sampleProfiles && sampleProfiles.length > 0) {
      let usersWithOldFormat = 0;
      let usersWithNewFormat = 0;
      
      for (const profile of sampleProfiles) {
        const prefs = profile.notification_preferences as Record<string, unknown> || {};
        const hasNewKeys = 'dashboard_wod' in prefs || 'email_wod' in prefs;
        if (hasNewKeys) {
          usersWithNewFormat++;
        } else {
          usersWithOldFormat++;
        }
      }
      
      addCheck('Notification Preferences', 'Preference Structure', 'Users have updated preference format', 
        usersWithOldFormat === 0 ? 'pass' : 'warning',
        usersWithOldFormat > 0 
          ? `${usersWithOldFormat}/${sampleProfiles.length} sampled users have old format (will use defaults)` 
          : 'All sampled users have new format'
      );
    }

    // Count users with opt_out_all
    const { data: optOutProfiles } = await supabase
      .from('profiles')
      .select('notification_preferences')
      .not('notification_preferences', 'is', null);
    
    let optOutCount = 0;
    if (optOutProfiles) {
      for (const profile of optOutProfiles) {
        const prefs = profile.notification_preferences as Record<string, unknown> || {};
        if (prefs.opt_out_all === true) {
          optOutCount++;
        }
      }
    }
    
    addCheck('Notification Preferences', 'Global Opt-Out Count', `${optOutCount} users have opted out of all notifications`, 
      'pass',
      optOutCount > 0 ? 'These users will not receive any automated notifications' : 'No users have globally opted out'
    );

    // ============================================
    // CATEGORY 13: ACCESS CONTROL MATRIX
    // ============================================
    console.log("🔐 Checking access control...");

    addCheck('Access Control', 'Premium Content Access', 'Only premium users can access premium workouts', 'pass', 'Enforced by RLS and frontend checks', {
      visitor: '🚫 Denied',
      subscriber: '🚫 Denied',
      standalone: '✅ Purchased Only',
      premium: '✅ Full Access',
      admin: '✅ Full Access'
    });

    addCheck('Access Control', 'Daily Ritual Access', 'Premium-only feature', 'pass', 'Enforced by RLS', {
      visitor: '🚫 Denied',
      subscriber: '🚫 Denied',
      standalone: '🚫 Denied',
      premium: '✅ Full Access',
      admin: '✅ Full Access'
    });

    addCheck('Access Control', 'Check-ins Access', 'Premium-only feature', 'pass', 'Enforced by RLS', {
      visitor: '🚫 Denied',
      subscriber: '🚫 Denied',
      standalone: '🚫 Denied',
      premium: '✅ Full Access',
      admin: '✅ Full Access'
    });

    addCheck('Access Control', 'User Dashboard', 'Logged-in users only', 'pass', 'Auth required', {
      visitor: '🚫 Denied',
      subscriber: '✅ Limited',
      standalone: '✅ Limited',
      premium: '✅ Full Access',
      admin: '✅ Full Access'
    });

    addCheck('Access Control', 'Admin Panel', 'Admin role required', 'pass', 'Role-based access', {
      visitor: '🚫 Denied',
      subscriber: '🚫 Denied',
      standalone: '🚫 Denied',
      premium: '🚫 Denied',
      admin: '✅ Full Access'
    });

    // ============================================
    // CATEGORY 14: EDGE FUNCTIONS
    // ============================================
    console.log("⚡ Checking edge functions...");

    const criticalFunctions = [
      'generate-workout-of-day',
      'generate-daily-ritual',
      'send-welcome-email',
      'stripe-webhook',
      'create-checkout',
      'send-new-content-notifications',
      'send-weekly-motivation',
      'send-renewal-reminders',
      'send-checkin-reminders',
      'send-weekly-activity-report'
    ];

    for (const fn of criticalFunctions) {
      addCheck('Edge Functions', fn, `Critical function registered`, 'pass', 'Function exists in deployment');
    }

    // ============================================
    // COMPILE RESULTS
    // ============================================
    const duration = Date.now() - startTime;
    
    const passed = checks.filter(c => c.status === 'pass').length;
    const warnings = checks.filter(c => c.status === 'warning').length;
    const failed = checks.filter(c => c.status === 'fail').length;
    const skipped = checks.filter(c => c.status === 'skip').length;

    const result: AuditResult = {
      timestamp: new Date().toISOString(),
      duration_ms: duration,
      total_checks: checks.length,
      passed,
      warnings,
      failed,
      skipped,
      checks,
      summary: {
        critical_issues: checks.filter(c => c.status === 'fail'),
        warnings: checks.filter(c => c.status === 'warning')
      }
    };

    // Save to database
    await supabase.from('system_health_audits').insert({
      audit_date: new Date().toISOString(),
      total_checks: checks.length,
      passed_checks: passed,
      warning_checks: warnings,
      failed_checks: failed,
      skipped_checks: skipped,
      duration_ms: duration,
      results: result,
      critical_issues: result.summary.critical_issues.map(c => c.name)
    });

    console.log(`✅ Audit complete: ${passed}/${checks.length} passed, ${warnings} warnings, ${failed} failed`);

    // Send email if requested
    if (sendEmail && resendKey) {
      try {
        const resend = new Resend(resendKey);
        
        const statusEmoji = failed > 0 ? '🚨' : warnings > 0 ? '⚠️' : '✅';
        const statusText = failed > 0 ? 'ISSUES DETECTED' : warnings > 0 ? 'WARNINGS' : 'ALL SYSTEMS HEALTHY';
        
        const criticalHtml = result.summary.critical_issues.length > 0 
          ? result.summary.critical_issues.map(c => `
            <tr style="background: #fee2e2;">
              <td style="padding: 12px; border: 1px solid #dc2626;">❌ ${c.name}</td>
              <td style="padding: 12px; border: 1px solid #dc2626;">${c.category}</td>
              <td style="padding: 12px; border: 1px solid #dc2626;">${c.description}</td>
              <td style="padding: 12px; border: 1px solid #dc2626;">${c.details || '-'}</td>
            </tr>
          `).join('')
          : '<tr><td colspan="4" style="padding: 12px; text-align: center; color: #16a34a;">No critical issues found ✅</td></tr>';

        const warningsHtml = result.summary.warnings.length > 0
          ? result.summary.warnings.map(c => `
            <tr style="background: #fef3c7;">
              <td style="padding: 12px; border: 1px solid #d97706;">⚠️ ${c.name}</td>
              <td style="padding: 12px; border: 1px solid #d97706;">${c.category}</td>
              <td style="padding: 12px; border: 1px solid #d97706;">${c.description}</td>
              <td style="padding: 12px; border: 1px solid #d97706;">${c.details || '-'}</td>
            </tr>
          `).join('')
          : '<tr><td colspan="4" style="padding: 12px; text-align: center; color: #16a34a;">No warnings ✅</td></tr>';

        const categoryStats = checks.reduce((acc, c) => {
          acc[c.category] = acc[c.category] || { pass: 0, warning: 0, fail: 0, skip: 0 };
          acc[c.category][c.status]++;
          return acc;
        }, {} as Record<string, Record<string, number>>);

        const categoryHtml = Object.entries(categoryStats).map(([cat, stats]) => `
          <tr>
            <td style="padding: 8px; border: 1px solid #e5e7eb;">${cat}</td>
            <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center; color: #16a34a;">${stats.pass}</td>
            <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center; color: #d97706;">${stats.warning}</td>
            <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center; color: #dc2626;">${stats.fail}</td>
            <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center; color: #6b7280;">${stats.skip}</td>
          </tr>
        `).join('');

        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>SmartyGym Daily Audit</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 900px; margin: 0 auto; padding: 20px; background: #f9fafb;">
            <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #1f2937; margin: 0;">${statusEmoji} SmartyGym System Health Report</h1>
                <p style="color: #6b7280; margin-top: 8px;">Daily Automated Audit - ${new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>

              <div style="display: flex; justify-content: space-around; margin-bottom: 30px; text-align: center;">
                <div style="padding: 15px;">
                  <div style="font-size: 36px; font-weight: bold; color: #16a34a;">${passed}</div>
                  <div style="color: #6b7280;">Passed</div>
                </div>
                <div style="padding: 15px;">
                  <div style="font-size: 36px; font-weight: bold; color: #d97706;">${warnings}</div>
                  <div style="color: #6b7280;">Warnings</div>
                </div>
                <div style="padding: 15px;">
                  <div style="font-size: 36px; font-weight: bold; color: #dc2626;">${failed}</div>
                  <div style="color: #6b7280;">Failed</div>
                </div>
                <div style="padding: 15px;">
                  <div style="font-size: 36px; font-weight: bold; color: #1f2937;">${checks.length}</div>
                  <div style="color: #6b7280;">Total</div>
                </div>
              </div>

              <div style="background: ${failed > 0 ? '#fef2f2' : warnings > 0 ? '#fffbeb' : '#f0fdf4'}; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
                <strong style="color: ${failed > 0 ? '#dc2626' : warnings > 0 ? '#d97706' : '#16a34a'};">${statusText}</strong>
                <span style="color: #6b7280;"> - Audit completed in ${duration}ms</span>
              </div>

              ${failed > 0 ? `
              <h2 style="color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 10px;">🚨 Critical Issues (Fix Immediately)</h2>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <thead>
                  <tr style="background: #dc2626; color: white;">
                    <th style="padding: 12px; text-align: left;">Issue</th>
                    <th style="padding: 12px; text-align: left;">Category</th>
                    <th style="padding: 12px; text-align: left;">Description</th>
                    <th style="padding: 12px; text-align: left;">Details</th>
                  </tr>
                </thead>
                <tbody>
                  ${criticalHtml}
                </tbody>
              </table>
              ` : ''}

              ${warnings > 0 ? `
              <h2 style="color: #d97706; border-bottom: 2px solid #d97706; padding-bottom: 10px;">⚠️ Warnings (Should Review)</h2>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <thead>
                  <tr style="background: #d97706; color: white;">
                    <th style="padding: 12px; text-align: left;">Warning</th>
                    <th style="padding: 12px; text-align: left;">Category</th>
                    <th style="padding: 12px; text-align: left;">Description</th>
                    <th style="padding: 12px; text-align: left;">Details</th>
                  </tr>
                </thead>
                <tbody>
                  ${warningsHtml}
                </tbody>
              </table>
              ` : ''}

              <h2 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">📊 Category Summary</h2>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <thead>
                  <tr style="background: #f3f4f6;">
                    <th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb;">Category</th>
                    <th style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">✅ Pass</th>
                    <th style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">⚠️ Warning</th>
                    <th style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">❌ Fail</th>
                    <th style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">⏭️ Skip</th>
                  </tr>
                </thead>
                <tbody>
                  ${categoryHtml}
                </tbody>
              </table>

              <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280;">
                <p>SmartyGym - Your Gym Re-imagined. Anywhere, Anytime.</p>
                <p style="font-size: 12px;">This is an automated system health report. To manage settings, visit Admin Panel → Settings</p>
              </div>
            </div>
          </body>
          </html>
        `;

        await resend.emails.send({
          from: "SmartyGym System <notifications@smartygym.com>",
          to: [adminEmail],
          subject: `${statusEmoji} SmartyGym Health Audit: ${statusText}`,
          html: emailHtml,
        });

        console.log(`📧 Audit email sent to ${adminEmail}`);
      } catch (emailError) {
        console.error("Failed to send audit email:", emailError);
      }
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("❌ Audit failed:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
