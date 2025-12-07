import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Template {
  id: string;
  template_name: string;
  subject: string;
  content: string;
  message_type: string;
  scheduled_time: string;
  next_scheduled_time: string;
  timezone: string;
  recurrence_pattern: string;
  recurrence_interval: string | null;
  target_audience: string;
  is_active: boolean;
  status: string;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[SEND-AUTOMATED-MESSAGES] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('🚀 Starting automated message processing');

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const now = new Date();
    logStep('📅 Current time', { now: now.toISOString() });

    // Fetch templates that need to be sent
    // Looking for templates where:
    // 1. is_active = true
    // 2. status = 'active' or 'scheduled'
    // 3. next_scheduled_time is set and is in the past (due to be sent)
    const { data: templates, error: fetchError } = await supabaseAdmin
      .from('automated_message_templates')
      .select('*')
      .eq('is_active', true)
      .in('status', ['active', 'scheduled'])
      .not('next_scheduled_time', 'is', null)
      .lte('next_scheduled_time', now.toISOString());

    if (fetchError) {
      logStep('❌ Error fetching templates', { error: fetchError.message });
      throw fetchError;
    }

    logStep('📋 Templates query result', { 
      count: templates?.length || 0,
      templates: templates?.map(t => ({ 
        id: t.id, 
        name: t.template_name, 
        nextScheduled: t.next_scheduled_time,
        status: t.status 
      }))
    });

    if (!templates || templates.length === 0) {
      // Also check if there are ANY templates with scheduling info for debugging
      const { data: allTemplates } = await supabaseAdmin
        .from('automated_message_templates')
        .select('id, template_name, is_active, status, next_scheduled_time, scheduled_time, recurrence_pattern')
        .eq('is_active', true);
      
      logStep('📊 All active templates status', { 
        count: allTemplates?.length || 0,
        templates: allTemplates?.map(t => ({
          name: t.template_name,
          status: t.status,
          nextScheduled: t.next_scheduled_time,
          scheduledTime: t.scheduled_time,
          recurrence: t.recurrence_pattern
        }))
      });

      return new Response(
        JSON.stringify({ 
          message: 'No templates to process',
          activeTemplates: allTemplates?.length || 0,
          hint: 'Templates need next_scheduled_time set to be processed by this function'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    let totalSent = 0;
    let totalFailed = 0;

    // Process each template
    for (const template of templates as Template[]) {
      logStep('📨 Processing template', { 
        id: template.id, 
        name: template.template_name,
        messageType: template.message_type,
        targetAudience: template.target_audience
      });

      try {
        // Fetch target users based on audience filter
        let targetUserIds: string[] = [];

        if (template.target_audience === 'all') {
          const { data: allProfiles } = await supabaseAdmin
            .from('profiles')
            .select('user_id');
          targetUserIds = allProfiles?.map(u => u.user_id) || [];
        } else if (template.target_audience === 'free_users') {
          const { data: freeUsers } = await supabaseAdmin
            .from('user_subscriptions')
            .select('user_id')
            .eq('plan_type', 'free');
          targetUserIds = freeUsers?.map(u => u.user_id) || [];
        } else if (template.target_audience === 'premium_users') {
          const { data: premiumUsers } = await supabaseAdmin
            .from('user_subscriptions')
            .select('user_id')
            .in('plan_type', ['gold', 'platinum'])
            .eq('status', 'active');
          targetUserIds = premiumUsers?.map(u => u.user_id) || [];
        } else if (template.target_audience === 'gold_users') {
          const { data: goldUsers } = await supabaseAdmin
            .from('user_subscriptions')
            .select('user_id')
            .eq('plan_type', 'gold')
            .eq('status', 'active');
          targetUserIds = goldUsers?.map(u => u.user_id) || [];
        } else if (template.target_audience === 'platinum_users') {
          const { data: platinumUsers } = await supabaseAdmin
            .from('user_subscriptions')
            .select('user_id')
            .eq('plan_type', 'platinum')
            .eq('status', 'active');
          targetUserIds = platinumUsers?.map(u => u.user_id) || [];
        }

        logStep('👥 Target users found', { count: targetUserIds.length, audience: template.target_audience });

        if (targetUserIds.length === 0) {
          logStep('⚠️ No target users found for template', { templateId: template.id });
          continue;
        }

        // Get user names for personalization
        const { data: targetUsers, error: usersError } = await supabaseAdmin
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', targetUserIds);

        if (usersError) {
          logStep('❌ Error fetching user profiles', { error: usersError.message });
          totalFailed++;
          continue;
        }

        // Send message to each user
        const messages = (targetUsers || []).map(user => ({
          user_id: user.user_id,
          message_type: template.message_type,
          subject: template.subject.replace('[Name]', user.full_name || 'there'),
          content: template.content.replace('[Name]', user.full_name || 'there'),
          is_read: false
        }));

        const { error: insertError } = await supabaseAdmin
          .from('user_system_messages')
          .insert(messages);

        if (insertError) {
          logStep('❌ Error inserting messages', { error: insertError.message });
          totalFailed++;
          continue;
        }

        totalSent += messages.length;
        logStep('✅ Messages sent successfully', { count: messages.length });

        // Calculate next scheduled time based on recurrence
        let nextScheduledTime: string | null = null;
        let newStatus = template.status;

        if (template.recurrence_pattern === 'once') {
          newStatus = 'completed';
          nextScheduledTime = null;
          logStep('📅 One-time template - marking as completed');
        } else {
          const nextDate = new Date(template.next_scheduled_time);
          
          switch (template.recurrence_pattern) {
            case 'daily':
              nextDate.setDate(nextDate.getDate() + 1);
              break;
            case 'every_2_days':
              nextDate.setDate(nextDate.getDate() + 2);
              break;
            case 'every_3_days':
              nextDate.setDate(nextDate.getDate() + 3);
              break;
            case 'weekly':
              nextDate.setDate(nextDate.getDate() + 7);
              break;
            case 'monthly':
              nextDate.setMonth(nextDate.getMonth() + 1);
              break;
            case 'custom':
              if (template.recurrence_interval) {
                const match = template.recurrence_interval.match(/(\d+)\s*(day|days|week|weeks|hour|hours|month|months)/i);
                if (match) {
                  const value = parseInt(match[1]);
                  const unit = match[2].toLowerCase();
                  if (unit.startsWith('day')) {
                    nextDate.setDate(nextDate.getDate() + value);
                  } else if (unit.startsWith('week')) {
                    nextDate.setDate(nextDate.getDate() + (value * 7));
                  } else if (unit.startsWith('hour')) {
                    nextDate.setHours(nextDate.getHours() + value);
                  } else if (unit.startsWith('month')) {
                    nextDate.setMonth(nextDate.getMonth() + value);
                  }
                }
              }
              break;
            default:
              logStep('⚠️ Unknown recurrence pattern', { pattern: template.recurrence_pattern });
              // Default to weekly if unknown
              nextDate.setDate(nextDate.getDate() + 7);
          }
          
          nextScheduledTime = nextDate.toISOString();
          logStep('📅 Next scheduled time calculated', { nextScheduledTime });
        }

        // Update template with new schedule
        const { error: updateError } = await supabaseAdmin
          .from('automated_message_templates')
          .update({
            last_sent_at: now.toISOString(),
            next_scheduled_time: nextScheduledTime,
            status: newStatus
          })
          .eq('id', template.id);

        if (updateError) {
          logStep('⚠️ Error updating template', { error: updateError.message });
        } else {
          logStep('✅ Template updated', { nextScheduledTime, newStatus });
        }

        // Log to audit
        await supabaseAdmin
          .from('notification_audit_log')
          .insert({
            notification_type: 'scheduled_message',
            message_type: template.message_type,
            subject: template.subject,
            content: template.content,
            recipient_count: messages.length,
            success_count: messages.length,
            failed_count: 0,
            sent_at: now.toISOString(),
            metadata: {
              template_id: template.id,
              template_name: template.template_name,
              recurrence_pattern: template.recurrence_pattern,
              target_audience: template.target_audience,
              next_scheduled_time: nextScheduledTime
            }
          });

      } catch (templateError: any) {
        logStep('❌ Error processing template', { error: templateError.message, templateId: template.id });
        totalFailed++;
      }
    }

    logStep('🎉 Processing complete', { totalSent, totalFailed, templatesProcessed: templates.length });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Automated messages processed',
        templatesProcessed: templates.length,
        messagesSent: totalSent,
        failed: totalFailed
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    logStep('💥 FATAL ERROR', { error: error.message, stack: error.stack });
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
