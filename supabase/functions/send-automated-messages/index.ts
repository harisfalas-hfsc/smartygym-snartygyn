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
  console.log(`[send-automated-messages] ${step}`, details ? JSON.stringify(details, null, 2) : '');
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Starting automated message processing');

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
    logStep('Current time', { now: now.toISOString() });

    // Fetch templates that need to be sent
    const { data: templates, error: fetchError } = await supabaseAdmin
      .from('automated_message_templates')
      .select('*')
      .eq('is_active', true)
      .eq('status', 'active')
      .not('scheduled_time', 'is', null)
      .lte('next_scheduled_time', now.toISOString());

    if (fetchError) {
      logStep('Error fetching templates', { error: fetchError });
      throw fetchError;
    }

    logStep('Found templates to process', { count: templates?.length || 0 });

    if (!templates || templates.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No templates to process' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    let totalSent = 0;
    let totalFailed = 0;

    // Process each template
    for (const template of templates as Template[]) {
      logStep('Processing template', { id: template.id, name: template.template_name });

      try {
        // Fetch target users based on audience filter
        let usersQuery = supabaseAdmin
          .from('profiles')
          .select('user_id, full_name');

        // Apply audience filter
        if (template.target_audience === 'free_users') {
          const { data: freeUsers } = await supabaseAdmin
            .from('user_subscriptions')
            .select('user_id')
            .eq('plan_type', 'free');
          
          const freeUserIds = freeUsers?.map(u => u.user_id) || [];
          usersQuery = usersQuery.in('user_id', freeUserIds);
        } else if (template.target_audience === 'premium_users') {
          const { data: premiumUsers } = await supabaseAdmin
            .from('user_subscriptions')
            .select('user_id')
            .in('plan_type', ['gold', 'platinum'])
            .eq('status', 'active');
          
          const premiumUserIds = premiumUsers?.map(u => u.user_id) || [];
          usersQuery = usersQuery.in('user_id', premiumUserIds);
        }

        const { data: targetUsers, error: usersError } = await usersQuery;

        if (usersError) {
          logStep('Error fetching users', { error: usersError });
          totalFailed++;
          continue;
        }

        if (!targetUsers || targetUsers.length === 0) {
          logStep('No target users found for template', { templateId: template.id });
          continue;
        }

        logStep('Found target users', { count: targetUsers.length });

        // Send message to each user
        const messages = targetUsers.map(user => ({
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
          logStep('Error inserting messages', { error: insertError });
          totalFailed++;
          continue;
        }

        totalSent += targetUsers.length;
        logStep('Messages sent successfully', { count: targetUsers.length });

        // Calculate next scheduled time based on recurrence
        let nextScheduledTime: string | null = null;
        let newStatus = template.status;

        if (template.recurrence_pattern === 'once') {
          newStatus = 'completed';
          nextScheduledTime = null;
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
            case 'custom':
              if (template.recurrence_interval) {
                const match = template.recurrence_interval.match(/(\d+)\s*(day|days|week|weeks|hour|hours)/i);
                if (match) {
                  const value = parseInt(match[1]);
                  const unit = match[2].toLowerCase();
                  if (unit.startsWith('day')) {
                    nextDate.setDate(nextDate.getDate() + value);
                  } else if (unit.startsWith('week')) {
                    nextDate.setDate(nextDate.getDate() + (value * 7));
                  } else if (unit.startsWith('hour')) {
                    nextDate.setHours(nextDate.getHours() + value);
                  }
                }
              }
              break;
          }
          
          nextScheduledTime = nextDate.toISOString();
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
          logStep('Error updating template', { error: updateError });
        } else {
          logStep('Template updated', { nextScheduledTime, newStatus });
        }

        // Log to audit
        await supabaseAdmin
          .from('notification_audit_log')
          .insert({
            notification_type: 'scheduled_message',
            message_type: template.message_type,
            subject: template.subject,
            content: template.content,
            recipient_count: targetUsers.length,
            success_count: targetUsers.length,
            failed_count: 0,
            sent_at: now.toISOString(),
            metadata: {
              template_id: template.id,
              template_name: template.template_name,
              recurrence_pattern: template.recurrence_pattern,
              target_audience: template.target_audience
            }
          });

      } catch (templateError) {
        logStep('Error processing template', { error: templateError, templateId: template.id });
        totalFailed++;
      }
    }

    logStep('Processing complete', { totalSent, totalFailed });

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
    logStep('Fatal error', { error: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});