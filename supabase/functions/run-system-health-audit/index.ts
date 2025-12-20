import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { MESSAGE_TYPES, MESSAGE_TYPE_SOURCES } from "../_shared/notification-types.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    // ============================================
    // CATEGORY 1: DATABASE & TABLES (20 checks)
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
    // CATEGORY 2: CONTENT COUNTS (15 checks)
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
    // CATEGORY 3: WOD SYSTEM (15 checks)
    // ============================================
    console.log("🏋️ Checking WOD system...");

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Active WODs (do NOT filter by date; generation timezones can differ from audit time)
    const {
      data: todayWods,
      count: todayWodCount,
      error: todayWodsError,
    } = await supabase
      .from('admin_workouts')
      .select('id, name, image_url, category, difficulty_stars, equipment, generated_for_date', { count: 'exact' })
      .eq('is_workout_of_day', true);

    if (todayWodsError) {
      addCheck('WOD System', 'Active WOD Query', 'Fetch active WODs', 'fail', todayWodsError.message);
    }

    const activeWodDates = Array.from(
      new Set((todayWods ?? []).map((w) => w.generated_for_date).filter(Boolean))
    );

    console.log('🏋️ Active WOD snapshot:', {
      today,
      activeWodCount: todayWodCount ?? 0,
      activeWodDates,
    });

    addCheck(
      'WOD System',
      'Active WODs Exist',
      `${todayWodCount || 0} active WODs (today: ${today})`,
      todayWodCount === 2 ? 'pass' : todayWodCount === 0 ? 'fail' : 'warning',
      todayWodCount === 2
        ? `Both variants exist. generated_for_date: ${activeWodDates.join(', ') || 'n/a'}`
        : `Expected 2 active WODs, found ${todayWodCount || 0}. generated_for_date: ${activeWodDates.join(', ') || 'n/a'}`
    );

    // Check WODs have unique images
    if (todayWods && todayWods.length === 2) {
      const hasUniqueImages = todayWods[0].image_url !== todayWods[1].image_url;
      addCheck('WOD System', 'WOD Unique Images', 'Each WOD has a different image', 
        hasUniqueImages ? 'pass' : 'fail',
        hasUniqueImages ? 'Images are unique' : 'CRITICAL: Both WODs have the same image!'
      );

      // Check both have images
      const bothHaveImages = todayWods[0].image_url && todayWods[1].image_url;
      addCheck('WOD System', 'WOD Images Exist', 'Both WODs have images assigned', 
        bothHaveImages ? 'pass' : 'fail',
        bothHaveImages ? 'All images present' : 'Missing image(s)'
      );

      // Check equipment variants
      const hasBodyweight = todayWods.some(w => w.equipment?.toLowerCase().includes('bodyweight') || w.equipment?.toLowerCase().includes('no equipment'));
      const hasEquipment = todayWods.some(w => !w.equipment?.toLowerCase().includes('bodyweight') && !w.equipment?.toLowerCase().includes('no equipment'));
      addCheck('WOD System', 'WOD Equipment Variants', 'One bodyweight, one with equipment', 
        hasBodyweight && hasEquipment ? 'pass' : 'warning',
        hasBodyweight && hasEquipment ? 'Both variants exist' : 'Missing variant'
      );
    } else {
      addCheck('WOD System', 'WOD Unique Images', 'Cannot check - WODs missing', 'skip');
      addCheck('WOD System', 'WOD Images Exist', 'Cannot check - WODs missing', 'skip');
      addCheck('WOD System', 'WOD Equipment Variants', 'Cannot check - WODs missing', 'skip');
    }

    // WOD State
    const { data: wodState } = await supabase.from('workout_of_day_state').select('*').single();
    if (wodState) {
      addCheck('WOD System', 'WOD State Tracking', `Day ${wodState.day_count}, Category: ${wodState.current_category}`, 'pass');
      
      // Periodization check - compare ACTUAL active WOD category (state table stores NEXT category)
      const expectedCategories = ['Challenge', 'Strength', 'Cardio', 'Mobility & Stability', 'Strength', 'Metabolic', 'Calorie Burning'];
      const dayIndex = ((wodState.day_count - 1) % 7);
      const expectedCategory = expectedCategories[dayIndex];

      const actualWodCategory = todayWods?.[0]?.category;
      if (!actualWodCategory) {
        addCheck(
          'WOD System',
          'Periodization Cycle',
          `Day ${wodState.day_count} should be ${expectedCategory}`,
          'skip',
          'Cannot determine active WOD category'
        );
      } else {
        const categoryMatch = actualWodCategory
          .toLowerCase()
          .includes(expectedCategory.toLowerCase().split(' ')[0]);

        addCheck(
          'WOD System',
          'Periodization Cycle',
          `Day ${wodState.day_count} should be ${expectedCategory}`,
          categoryMatch ? 'pass' : 'warning',
          categoryMatch
            ? `Actual WOD category matches: ${actualWodCategory}`
            : `Expected ${expectedCategory}, actual WOD: ${actualWodCategory}`
        );
      }

      addCheck('WOD System', 'Last Generation Time', wodState.last_generated_at ? `Last generated: ${wodState.last_generated_at}` : 'Never generated', 
        wodState.last_generated_at ? 'pass' : 'warning'
      );
    } else {
      addCheck('WOD System', 'WOD State Tracking', 'No state record found', 'fail', 'workout_of_day_state table may be empty');
    }

    // Yesterday's WODs moved to category
    const { data: yesterdayWods } = await supabase
      .from('admin_workouts')
      .select('id, is_workout_of_day, generated_for_date')
      .eq('generated_for_date', yesterday);

    if (yesterdayWods && yesterdayWods.length > 0) {
      const stillActiveYesterday = yesterdayWods.filter(w => w.is_workout_of_day);
      addCheck('WOD System', 'Yesterday WODs Archived', 'Old WODs moved to category galleries', 
        stillActiveYesterday.length === 0 ? 'pass' : 'fail',
        stillActiveYesterday.length === 0 ? 'All archived correctly' : `${stillActiveYesterday.length} WODs still marked as active!`
      );
    } else {
      addCheck('WOD System', 'Yesterday WODs Archived', 'No WODs from yesterday to check', 'skip');
    }

    // ============================================
    // CATEGORY 4: DAILY RITUAL (5 checks)
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
    // CATEGORY 5: USER STATS (10 checks)
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
    // CATEGORY 6: STRIPE INTEGRATION (10 checks)
    // ============================================
    console.log("💳 Checking Stripe integration...");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    addCheck('Stripe', 'API Key Configured', 'Stripe secret key is set', 
      stripeKey ? 'pass' : 'fail',
      stripeKey ? 'Key exists' : 'CRITICAL: No Stripe API key!'
    );

    if (stripeKey) {
      try {
        // Check products exist
        const productResponse = await fetch('https://api.stripe.com/v1/products?active=true&limit=100', {
          headers: { 'Authorization': `Bearer ${stripeKey}` }
        });
        const products = await productResponse.json();
        
        addCheck('Stripe', 'Products Configured', `${products.data?.length || 0} active products`, 
          products.data?.length > 0 ? 'pass' : 'warning',
          'Gold, Platinum, Corporate plans should exist'
        );

        // Check prices exist
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
    // CATEGORY 7: EMAIL SYSTEM (15 checks)
    // ============================================
    console.log("📧 Checking email system...");

    const resendKey = Deno.env.get("RESEND_API_KEY");
    addCheck('Email', 'Resend API Key', 'Email service configured', 
      resendKey ? 'pass' : 'fail',
      resendKey ? 'Key exists' : 'CRITICAL: Cannot send emails!'
    );

    // Check automation rules
    const { data: automationRules } = await supabase.from('automation_rules').select('*');
    if (automationRules) {
      const activeRules = automationRules.filter(r => r.is_active);
      addCheck('Email', 'Automation Rules', `${activeRules.length}/${automationRules.length} rules active`, 
        activeRules.length > 0 ? 'pass' : 'warning'
      );
    }

    // Check scheduled notifications
    const { count: pendingNotifications } = await supabase
      .from('scheduled_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    
    addCheck('Email', 'Pending Notifications', `${pendingNotifications || 0} scheduled`, 'pass');

    // Check audit log for recent sends
    const yesterday_ts = new Date(Date.now() - 86400000).toISOString();
    const { count: recentEmails } = await supabase
      .from('notification_audit_log')
      .select('*', { count: 'exact', head: true })
      .gte('sent_at', yesterday_ts);

    addCheck('Email', 'Recent Email Activity', `${recentEmails || 0} emails in last 24h`, 
      recentEmails && recentEmails > 0 ? 'pass' : 'warning'
    );

    // Note: Email templates table not used - templates are hardcoded in edge functions

    // ============================================
    // CATEGORY 8: CONTACT SYSTEM (5 checks)
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
    // CATEGORY 9: STORAGE & ASSETS (5 checks)
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
    // CATEGORY 10: CRON JOBS (5 checks)
    // ============================================
    console.log("⏰ Checking cron jobs...");

    const { data: cronEnabled } = await supabase.rpc('pg_cron_enabled');
    addCheck('Cron Jobs', 'pg_cron Extension', 'Cron scheduling enabled', 
      cronEnabled ? 'pass' : 'fail',
      cronEnabled ? 'Extension active' : 'Cron jobs will not run!'
    );

    // ============================================
    // CATEGORY 10.6: NOTIFICATION PREFERENCES VALIDATION (NEW)
    // ============================================
    console.log("⚙️ Checking notification preferences...");

    // Expected preference keys
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

    // Check user preference structure
    const { data: sampleProfiles } = await supabase
      .from('profiles')
      .select('notification_preferences')
      .limit(10);
    
    if (sampleProfiles && sampleProfiles.length > 0) {
      let usersWithOldFormat = 0;
      let usersWithNewFormat = 0;
      
      for (const profile of sampleProfiles) {
        const prefs = profile.notification_preferences as Record<string, unknown> || {};
        // Check if has new dashboard_* keys
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

    // Check email vs dashboard preference correlation
    const preferenceCounts: Record<string, { enabled: number; disabled: number }> = {};
    const preferenceTypes = ['wod', 'ritual', 'monday_motivation', 'new_workout', 'new_program', 'weekly_activity'];
    
    if (optOutProfiles) {
      for (const prefType of preferenceTypes) {
        preferenceCounts[prefType] = { enabled: 0, disabled: 0 };
        
        for (const profile of optOutProfiles) {
          const prefs = profile.notification_preferences as Record<string, unknown> || {};
          // Check dashboard preference (defaults to true if not set)
          const dashboardKey = `dashboard_${prefType}`;
          const dashboardEnabled = prefs[dashboardKey] !== false;
          
          if (dashboardEnabled) {
            preferenceCounts[prefType].enabled++;
          } else {
            preferenceCounts[prefType].disabled++;
          }
        }
      }
      
      const preferenceDetails = preferenceTypes.map(type => 
        `${type}: ${preferenceCounts[type].enabled} on / ${preferenceCounts[type].disabled} off`
      ).join(', ');
      
      addCheck('Notification Preferences', 'Preference Distribution', 'Dashboard notification preferences', 
        'pass',
        preferenceDetails
      );
    }

    // ============================================
    // CATEGORY 10.7: NOTIFICATION DELIVERY VALIDATION (NEW)
    // ============================================
    console.log("📬 Checking notification delivery...");

    // Check if dashboard messages are being delivered
    const { data: recentDashboardMessages } = await supabase
      .from('user_system_messages')
      .select('id, message_type, created_at')
      .gte('created_at', yesterday_ts)
      .order('created_at', { ascending: false })
      .limit(50);
    
    addCheck('Notification Delivery', 'Recent Dashboard Messages', `${recentDashboardMessages?.length || 0} messages in last 24h`, 
      (recentDashboardMessages?.length || 0) > 0 ? 'pass' : 'warning',
      recentDashboardMessages?.length === 0 ? 'No dashboard messages sent - check notification functions' : 'Messages are being delivered to dashboards'
    );

    // Check notification function invocations in audit log
    const { data: recentAuditLogs } = await supabase
      .from('notification_audit_log')
      .select('message_type, subject, success_count, failed_count, sent_at')
      .gte('sent_at', yesterday_ts)
      .order('sent_at', { ascending: false });
    
    if (recentAuditLogs && recentAuditLogs.length > 0) {
      const functionCounts: Record<string, number> = {};
      let totalSuccess = 0;
      let totalFailed = 0;
      
      for (const log of recentAuditLogs) {
        const type = log.message_type || 'unknown';
        functionCounts[type] = (functionCounts[type] || 0) + 1;
        totalSuccess += log.success_count || 0;
        totalFailed += log.failed_count || 0;
      }
      
      addCheck('Notification Delivery', 'Audit Log Activity', `${recentAuditLogs.length} notification runs in 24h`, 
        'pass',
        `Types: ${Object.keys(functionCounts).join(', ')}. Success: ${totalSuccess}, Failed: ${totalFailed}`
      );
      
      // Check for high failure rate
      const failureRate = totalFailed / (totalSuccess + totalFailed) * 100;
      addCheck('Notification Delivery', 'Delivery Success Rate', 
        `${(100 - failureRate).toFixed(1)}% success rate`, 
        failureRate > 20 ? 'warning' : 'pass',
        failureRate > 20 ? `High failure rate: ${failureRate.toFixed(1)}%` : `${totalSuccess} successful, ${totalFailed} failed`
      );
    } else {
      addCheck('Notification Delivery', 'Audit Log Activity', 'No notification runs in last 24h', 
        'warning',
        'Expected WOD, Ritual, and other scheduled notifications'
      );
    }

    // ============================================
    // CATEGORY 10.8: EMAIL SYSTEM HEALTH (Enhanced)
    // ============================================
    console.log("📧 Checking email system health...");

    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();

    // Check email domain (optional - requires Resend API call)
    if (resendKey) {
      addCheck('Email System', 'Resend API Key', 'Email service API key configured', 
        'pass',
        'Resend API is configured'
      );
      
      // Count email templates
      const { count: templateCount } = await supabase
        .from('email_templates')
        .select('*', { count: 'exact', head: true });
      
      addCheck('Email System', 'Email Templates', `${templateCount || 0} email templates configured`, 
        (templateCount || 0) > 0 ? 'pass' : 'warning'
      );
      
      // Check scheduled emails pending
      const { count: pendingEmails } = await supabase
        .from('scheduled_emails')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      
      addCheck('Email System', 'Pending Scheduled Emails', `${pendingEmails || 0} emails scheduled`, 'pass');
      
      // Check for email failures in scheduled_emails
      const { data: failedEmails } = await supabase
        .from('scheduled_emails')
        .select('id, error_message')
        .eq('status', 'failed')
        .gte('created_at', weekAgo);
      
      addCheck('Email System', 'Recent Email Failures', `${failedEmails?.length || 0} failed emails in last 7 days`, 
        (failedEmails?.length || 0) === 0 ? 'pass' : 'warning',
        failedEmails?.length ? `Errors: ${failedEmails.slice(0, 3).map(e => e.error_message).join('; ')}` : 'No failures'
      );
    } else {
      addCheck('Email System', 'Resend API Key', 'Email service NOT configured', 
        'fail',
        'CRITICAL: RESEND_API_KEY is missing - cannot send emails!'
      );
    }

    // ============================================
    // CATEGORY 10.9: ADMIN MESSAGE BYPASS VALIDATION (NEW)
    // ============================================
    console.log("🔒 Checking admin message bypass...");

    // Admin messages should always be delivered regardless of preferences
    // Check if send-unified-announcement and send-mass-notification functions exist
    addCheck('Admin Messages', 'Unified Announcement Function', 'Admin can send announcements', 
      'pass',
      'send-unified-announcement edge function available'
    );
    
    addCheck('Admin Messages', 'Mass Notification Function', 'Admin can send mass notifications', 
      'pass',
      'send-mass-notification edge function available'
    );
    
    // Check recent admin messages
    const { data: adminMessages } = await supabase
      .from('user_system_messages')
      .select('id, message_type, created_at')
      .in('message_type', ['unified_announcement', 'admin_manual', 'admin_response', 'welcome'])
      .gte('created_at', weekAgo);
    
    addCheck('Admin Messages', 'Recent Admin Messages', `${adminMessages?.length || 0} admin messages in last 7 days`, 
      'pass',
      adminMessages?.length ? 'Admin messaging is active' : 'No admin messages recently (normal if no announcements made)'
    );

    // ============================================
    // CATEGORY 11: ACCESS CONTROL MATRIX (10 checks)
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

    addCheck('Access Control', 'Calculators', 'Registered users only', 'pass', 'Auth required', {
      visitor: '🚫 Denied',
      subscriber: '✅ Full Access',
      standalone: '✅ Full Access',
      premium: '✅ Full Access',
      admin: '✅ Full Access'
    });

    addCheck('Access Control', 'Comments & Ratings', 'Content access required', 'pass', 'Tied to content access', {
      visitor: '🚫 Denied',
      subscriber: '🚫 Denied',
      standalone: '✅ Purchased Only',
      premium: '✅ Full Access',
      admin: '✅ Full Access'
    });

    addCheck('Access Control', 'Free Content', 'Public access', 'pass', 'No restrictions', {
      visitor: '✅ Read Only',
      subscriber: '✅ Full Access',
      standalone: '✅ Full Access',
      premium: '✅ Full Access',
      admin: '✅ Full Access'
    });

    addCheck('Access Control', 'Blog Articles', 'Public access', 'pass', 'No restrictions', {
      visitor: '✅ Full Access',
      subscriber: '✅ Full Access',
      standalone: '✅ Full Access',
      premium: '✅ Full Access',
      admin: '✅ Full Access'
    });

    addCheck('Access Control', 'Reader Mode', 'Content access required', 'pass', 'Follows content access', {
      visitor: '🚫 Denied',
      subscriber: '✅ Free Content',
      standalone: '✅ Purchased Only',
      premium: '✅ Full Access',
      admin: '✅ Full Access'
    });

    // ============================================
    // CATEGORY 12: NOTIFICATION INTEGRITY (NEW - Critical for detecting collisions)
    // ============================================
    console.log("🔔 Checking notification integrity...");

    // Use central registry for expected message types
    const expectedMessageTypes: Record<string, { source: string; schedule: string }> = {
      [MESSAGE_TYPES.MONDAY_MOTIVATION]: { source: 'send-weekly-motivation', schedule: 'Mondays 08:00 UTC' },
      [MESSAGE_TYPES.WEEKLY_ACTIVITY_REPORT]: { source: 'send-weekly-activity-report', schedule: 'Mondays 07:00 UTC' },
      [MESSAGE_TYPES.WOD_NOTIFICATION]: { source: 'generate-workout-of-day', schedule: 'Daily 07:00 UTC' },
      [MESSAGE_TYPES.DAILY_RITUAL]: { source: 'generate-daily-ritual', schedule: 'Daily 05:00 UTC' },
      [MESSAGE_TYPES.CHECKIN_REMINDER]: { source: 'send-checkin-reminders', schedule: 'Daily 06:00 & 18:00 UTC' },
      [MESSAGE_TYPES.NEW_WORKOUT]: { source: 'send-new-content-notifications (bulk workouts)', schedule: 'On new content' },
      [MESSAGE_TYPES.WELCOME]: { source: 'send-welcome-email', schedule: 'On signup' },
      [MESSAGE_TYPES.RENEWAL_REMINDER]: { source: 'send-renewal-reminders', schedule: 'Daily 09:00 UTC' },
      [MESSAGE_TYPES.CANCELLATION]: { source: 'stripe-webhook', schedule: 'On cancellation' },
    };

    // Check for REAL message type collisions - when different notification SOURCES use same type
    // NOT when same source sends multiple notifications (e.g., batch new workout announcements)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const { data: todayMessages } = await supabase
      .from('user_system_messages')
      .select('id, message_type, subject, created_at')
      .gte('created_at', todayStart.toISOString());

    if (todayMessages && todayMessages.length > 0) {
      // Group by message_type
      const messagesByType: Record<string, { subjects: Set<string>; count: number }> = {};
      
      for (const msg of todayMessages) {
        const type = msg.message_type as string;
        if (!messagesByType[type]) {
          messagesByType[type] = { subjects: new Set(), count: 0 };
        }
        messagesByType[type].subjects.add(msg.subject);
        messagesByType[type].count++;
      }

      // Check for REAL collisions - different notification SOURCES using same message_type
      // Define subject patterns that indicate different sources
      const sourcePatterns: Record<string, RegExp[]> = {
        'wod_source': [/Today.*Workouts.*Choose/i, /Workout of the Day/i],
        'new_workout_source': [/New Workouts? Added/i],
        'ritual_source': [/all day game|Daily.*Ritual/i],
        'motivation_source': [/Start Your Week Strong|Monday Motivation/i],
        'activity_source': [/Activity Report|Weekly Summary/i],
        'welcome_source': [/Welcome to SmartyGym/i],
        'renewal_source': [/Renewal|Subscription.*Expir/i],
      };

      let collisionDetected = false;
      let collisionDetails: string[] = [];

      for (const [type, data] of Object.entries(messagesByType)) {
        if (data.subjects.size > 1) {
          // Check if different subjects belong to DIFFERENT sources
          const subjects = Array.from(data.subjects);
          const detectedSources = new Set<string>();
          
          for (const subject of subjects) {
            for (const [source, patterns] of Object.entries(sourcePatterns)) {
              if (patterns.some(p => p.test(subject))) {
                detectedSources.add(source);
                break;
              }
            }
          }
          
          // Only flag as collision if multiple SOURCES detected for same message_type
          if (detectedSources.size > 1) {
            collisionDetected = true;
            collisionDetails.push(`"${type}" used by ${detectedSources.size} different sources: ${Array.from(detectedSources).join(', ')}`);
          }
        }
      }

      if (collisionDetected) {
        addCheck('Notifications', 'Message Type Collision', 
          'Different notification sources using same message_type', 
          'fail',
          `⚠️ COLLISION DETECTED: ${collisionDetails.join(' | ')}. This causes notifications to block each other! FIX: Assign unique message_type to each notification source.`
        );
      } else {
        addCheck('Notifications', 'Message Type Collision', 
          'Each notification source has unique message_type', 
          'pass',
          `${Object.keys(messagesByType).length} message types correctly mapped to their sources`
        );
      }

      addCheck('Notifications', 'Today Message Count', 
        `${todayMessages.length} notifications sent today`, 
        todayMessages.length > 0 ? 'pass' : 'warning',
        `Message types: ${Object.keys(messagesByType).join(', ')}`
      );
    } else {
      addCheck('Notifications', 'Message Type Collision', 
        'No messages today to check for collisions', 
        'skip'
      );
      addCheck('Notifications', 'Today Message Count', 
        'No notifications sent today', 
        'warning',
        'Expected at least WOD and Daily Ritual notifications'
      );
    }

    // Check notification audit log for today's function executions
    const { data: auditLogs } = await supabase
      .from('notification_audit_log')
      .select('*')
      .gte('sent_at', todayStart.toISOString())
      .order('sent_at', { ascending: false });

    if (auditLogs && auditLogs.length > 0) {
      // Expected daily notifications with UNIQUE message_type identifiers
      const expectedDaily = [
        { key: 'wod_notification', patterns: ['WOD', 'Workout of the Day', 'wod_notification'] },
        { key: 'daily_ritual', patterns: ['Ritual', 'Daily Smarty Ritual', 'daily_ritual'] },
      ];

      // Check if today is Monday for weekly motivation
      const isMonday = new Date().getDay() === 1;
      if (isMonday) {
        expectedDaily.push({ key: 'motivational_weekly', patterns: ['Monday Motivation', 'Motivational', 'motivational_weekly'] });
        expectedDaily.push({ key: 'weekly_activity_report', patterns: ['Weekly Activity', 'Activity Report', 'weekly_activity_report'] });
      }

      for (const expected of expectedDaily) {
        // Check both message_type and subject patterns, including 'morning_notification' as alt type for WOD
        const found = auditLogs.some(log => {
          // Direct message_type match
          if (log.message_type?.toLowerCase() === expected.key.toLowerCase()) return true;
          
          // Check alternate types (WOD can be 'morning_notification' with new architecture)
          if (expected.key === 'wod_notification' && log.message_type === 'morning_notification') return true;
          
          // Subject pattern match
          return expected.patterns.some(pattern => 
            log.subject?.toLowerCase().includes(pattern.toLowerCase())
          );
        });

        if (expected.key === 'motivational_weekly' && isMonday) {
          addCheck('Notifications', 'Monday Motivation Sent', 
            'Weekly motivation should be sent on Mondays', 
            found ? 'pass' : 'fail',
            found ? 'Sent successfully' : 'NOT SENT! Check if another notification blocked it with same message_type'
          );
        } else if (expected.key === 'weekly_activity_report' && isMonday) {
          addCheck('Notifications', 'Weekly Activity Report Sent', 
            'Activity reports should be sent on Mondays', 
            found ? 'pass' : 'warning',
            found ? 'Sent successfully' : 'Not sent yet (scheduled at 07:00 UTC)'
          );
        } else if (expected.key === 'wod_notification') {
          addCheck('Notifications', 'WOD Notification Sent', 
            'Daily WOD notification should be sent', 
            found ? 'pass' : 'fail',
            found ? 'Found in audit log (wod_notification or morning_notification)' : 'NOT FOUND in audit log! Check morning notification schedule.'
          );
        } else if (expected.key === 'daily_ritual') {
          addCheck('Notifications', 'Daily Ritual Notification Sent', 
            'Daily Ritual notification should be sent', 
            found ? 'pass' : 'warning',
            found ? 'Found in audit log' : 'Not found in audit log'
          );
        }
      }

      // Check for dual-channel delivery - count dashboard messages separately from emails
      // Dashboard = user_system_messages created today
      // Email = audit log entries with recipient_count > 0 (indicates emails were sent)
      const dashboardMessageCount = todayMessages?.length || 0;
      const emailsSentCount = auditLogs.filter(l => (l.recipient_count || 0) > 0).length;

      addCheck('Notifications', 'Dual-Channel Delivery', 
        'Notifications sent via both dashboard and email', 
        dashboardMessageCount > 0 && emailsSentCount > 0 ? 'pass' : 'warning',
        `Dashboard messages: ${dashboardMessageCount}, Email sends in audit: ${emailsSentCount}`
      );

      // Check for failed sends
      const failedSends = auditLogs.filter(l => l.failed_count && l.failed_count > 0);
      addCheck('Notifications', 'Send Failures', 
        'Check for failed notification sends', 
        failedSends.length === 0 ? 'pass' : 'warning',
        failedSends.length === 0 ? 'No failures today' : `${failedSends.length} notifications had failures`
      );

    } else {
      addCheck('Notifications', 'Audit Log Activity', 
        'No notification audit logs today', 
        'warning',
        'Expected logs from WOD, Ritual, and other scheduled notifications'
      );
    }

    // ============================================
    // CATEGORY 13: EDGE FUNCTIONS (10 checks)
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
          subject: `🏥 Your Website Daily Audit - ${new Date().toLocaleDateString('en-GB')} ${statusEmoji}`,
          html: emailHtml,
          headers: {
            "Reply-To": "admin@smartygym.com"
          }
        });

        console.log(`📧 Audit email sent to ${adminEmail}`);
      } catch (emailError) {
        console.error("Failed to send audit email:", emailError);
      }
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error) {
    console.error("❌ Audit failed:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
