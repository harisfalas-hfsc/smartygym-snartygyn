import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

async function refreshAccessToken(refreshToken: string): Promise<{ access_token: string; expires_in: number } | null> {
  try {
    console.log('Attempting to refresh access token...');
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: GOOGLE_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      })
    });

    const data = await response.json();
    if (data.error) {
      console.error('Token refresh error:', data.error, data.error_description);
      return null;
    }

    console.log('Token refreshed successfully');
    return { access_token: data.access_token, expires_in: data.expires_in };
  } catch (error) {
    console.error('Failed to refresh token:', error);
    return null;
  }
}

async function getValidAccessToken(supabase: any, userId: string): Promise<{ token: string | null; error?: string }> {
  console.log('Getting valid access token for user:', userId);
  
  const { data: connection, error } = await supabase
    .from('user_calendar_connections')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', 'google')
    .eq('is_active', true)
    .single();

  if (error || !connection) {
    console.error('No calendar connection found:', error);
    return { token: null, error: 'No calendar connection found. Please reconnect your Google Calendar.' };
  }

  const tokenExpiry = new Date(connection.token_expires_at);
  const now = new Date();

  console.log('Token expiry:', tokenExpiry.toISOString(), 'Now:', now.toISOString());

  // If token is expired or about to expire (within 5 minutes), refresh it
  if (tokenExpiry.getTime() - now.getTime() < 5 * 60 * 1000) {
    console.log('Token expired or expiring soon, refreshing...');
    const newToken = await refreshAccessToken(connection.refresh_token);

    if (!newToken) {
      console.log('Token refresh failed, marking connection as inactive');
      // Mark connection as inactive if refresh fails
      await supabase
        .from('user_calendar_connections')
        .update({ is_active: false })
        .eq('id', connection.id);
      return { token: null, error: 'Calendar connection expired. Please reconnect your Google Calendar.' };
    }

    // Update token in database
    const newExpiry = new Date(Date.now() + (newToken.expires_in * 1000));
    await supabase
      .from('user_calendar_connections')
      .update({
        access_token: newToken.access_token,
        token_expires_at: newExpiry.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', connection.id);

    return { token: newToken.access_token };
  }

  return { token: connection.access_token };
}

async function createCalendarEvent(accessToken: string, eventData: any): Promise<{ id: string | null; error?: string }> {
  try {
    console.log('Creating calendar event:', eventData.summary);
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventData)
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Google Calendar API error:', response.status, data.error);
      return { id: null, error: data.error?.message || 'Failed to create event' };
    }

    console.log('Event created successfully:', data.id);
    return { id: data.id };
  } catch (error) {
    console.error('Failed to create calendar event:', error);
    return { id: null, error: 'Network error creating event' };
  }
}

async function updateCalendarEvent(accessToken: string, eventId: string, eventData: any): Promise<boolean> {
  try {
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventData)
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Google Calendar update error:', data.error);
      return false;
    }

    console.log('Event updated:', eventId);
    return true;
  } catch (error) {
    console.error('Failed to update calendar event:', error);
    return false;
  }
}

async function deleteCalendarEvent(accessToken: string, eventId: string): Promise<boolean> {
  try {
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (response.status === 204 || response.status === 200) {
      console.log('Event deleted:', eventId);
      return true;
    }

    console.error('Failed to delete event, status:', response.status);
    return false;
  } catch (error) {
    console.error('Failed to delete calendar event:', error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header');
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error('Invalid user token:', userError);
      return new Response(JSON.stringify({ error: 'Invalid user token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const body = await req.json();
    const { action, scheduled_workout_id, event_data, activities } = body;

    console.log('=== Sync Google Calendar ===');
    console.log('Action:', action);
    console.log('User:', user.id);

    // Get valid access token
    const { token: accessToken, error: tokenError } = await getValidAccessToken(supabase, user.id);
    if (!accessToken) {
      console.error('Failed to get valid access token:', tokenError);
      return new Response(JSON.stringify({ 
        error: tokenError || 'No valid calendar connection', 
        reconnect_required: true 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Action: Create event for scheduled workout
    if (action === 'create') {
      const { scheduled_date, scheduled_time, content_name, content_type, notes } = event_data;

      console.log('Creating event for:', content_name, 'on', scheduled_date);

      // Build event start/end times
      const startDateTime = scheduled_time
        ? `${scheduled_date}T${scheduled_time}:00`
        : `${scheduled_date}T09:00:00`;

      const startDate = new Date(startDateTime);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration

      const calendarEvent = {
        summary: content_name.startsWith('✅') || content_name.startsWith('🏆') || content_name.startsWith('📊')
          ? content_name
          : `🏋️ ${content_name}`,
        description: notes || `SmartyGym ${content_type === 'workout' ? 'Workout' : content_type === 'program' ? 'Program' : 'Activity'}`,
        start: {
          dateTime: startDate.toISOString(),
          timeZone: 'Europe/Nicosia'
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone: 'Europe/Nicosia'
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 30 }
          ]
        }
      };

      const { id: eventId, error: createError } = await createCalendarEvent(accessToken, calendarEvent);

      if (!eventId) {
        console.error('Failed to create event:', createError);
        return new Response(JSON.stringify({ error: createError || 'Failed to create calendar event' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Update scheduled_workout with Google Calendar event ID
      if (scheduled_workout_id) {
        await supabase
          .from('scheduled_workouts')
          .update({ google_calendar_event_id: eventId })
          .eq('id', scheduled_workout_id);
      }

      console.log('Event created successfully:', eventId);
      return new Response(JSON.stringify({ success: true, event_id: eventId }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Action: Update existing event
    if (action === 'update') {
      const { google_calendar_event_id, scheduled_date, scheduled_time, content_name, notes } = event_data;

      if (!google_calendar_event_id) {
        return new Response(JSON.stringify({ error: 'No event ID provided' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const startDateTime = scheduled_time
        ? `${scheduled_date}T${scheduled_time}:00`
        : `${scheduled_date}T09:00:00`;

      const startDate = new Date(startDateTime);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

      const updateData = {
        summary: `🏋️ ${content_name}`,
        start: {
          dateTime: startDate.toISOString(),
          timeZone: 'Europe/Nicosia'
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone: 'Europe/Nicosia'
        }
      };

      const success = await updateCalendarEvent(accessToken, google_calendar_event_id, updateData);

      return new Response(JSON.stringify({ success }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Action: Delete event
    if (action === 'delete') {
      const { google_calendar_event_id } = event_data;

      if (!google_calendar_event_id) {
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const success = await deleteCalendarEvent(accessToken, google_calendar_event_id);

      return new Response(JSON.stringify({ success }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Action: Bulk export past activities
    if (action === 'bulk-export') {
      const { activity_types, start_date, end_date } = activities;
      const results = { exported: 0, failed: 0, events: [] as string[] };

      console.log('Bulk export - Types:', activity_types, 'Date range:', start_date, 'to', end_date);

      // Export completed workouts
      if (activity_types.includes('workouts')) {
        console.log('Fetching completed workouts...');
        const { data: workouts, error: workoutsError } = await supabase
          .from('workout_interactions')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_completed', true)
          .gte('updated_at', start_date)
          .lte('updated_at', end_date);

        if (workoutsError) {
          console.error('Error fetching workouts:', workoutsError);
        } else {
          console.log(`Found ${workouts?.length || 0} completed workouts`);
          
          for (const workout of workouts || []) {
            const completedDate = new Date(workout.updated_at);
            const event = {
              summary: `✅ ${workout.workout_name}`,
              description: `Completed SmartyGym Workout`,
              start: {
                dateTime: completedDate.toISOString(),
                timeZone: 'Europe/Nicosia'
              },
              end: {
                dateTime: new Date(completedDate.getTime() + 60 * 60 * 1000).toISOString(),
                timeZone: 'Europe/Nicosia'
              }
            };

            const { id: eventId } = await createCalendarEvent(accessToken, event);
            if (eventId) {
              results.exported++;
              results.events.push(eventId);
            } else {
              results.failed++;
            }

            // Rate limiting for Google API
            await new Promise(resolve => setTimeout(resolve, 250));
          }
        }
      }

      // Export completed programs
      if (activity_types.includes('programs')) {
        console.log('Fetching completed programs...');
        const { data: programs, error: programsError } = await supabase
          .from('program_interactions')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_completed', true)
          .gte('updated_at', start_date)
          .lte('updated_at', end_date);

        if (programsError) {
          console.error('Error fetching programs:', programsError);
        } else {
          console.log(`Found ${programs?.length || 0} completed programs`);
          
          for (const program of programs || []) {
            const completedDate = new Date(program.updated_at);
            const event = {
              summary: `🏆 ${program.program_name} - Completed!`,
              description: `Completed SmartyGym Training Program`,
              start: {
                dateTime: completedDate.toISOString(),
                timeZone: 'Europe/Nicosia'
              },
              end: {
                dateTime: new Date(completedDate.getTime() + 60 * 60 * 1000).toISOString(),
                timeZone: 'Europe/Nicosia'
              }
            };

            const { id: eventId } = await createCalendarEvent(accessToken, event);
            if (eventId) {
              results.exported++;
              results.events.push(eventId);
            } else {
              results.failed++;
            }

            await new Promise(resolve => setTimeout(resolve, 250));
          }
        }
      }

      // Export check-ins
      if (activity_types.includes('checkins')) {
        console.log('Fetching check-ins...');
        const { data: checkins, error: checkinsError } = await supabase
          .from('smarty_checkins')
          .select('*')
          .eq('user_id', user.id)
          .gte('checkin_date', start_date)
          .lte('checkin_date', end_date);

        if (checkinsError) {
          console.error('Error fetching check-ins:', checkinsError);
        } else {
          console.log(`Found ${checkins?.length || 0} check-ins`);
          
          for (const checkin of checkins || []) {
            const checkinDate = new Date(checkin.checkin_date);
            checkinDate.setHours(8, 0, 0, 0);

            const event = {
              summary: `📊 Daily Check-in (Score: ${checkin.daily_smarty_score || 'N/A'})`,
              description: `SmartyGym Daily Check-in\nCategory: ${checkin.score_category || 'N/A'}`,
              start: {
                dateTime: checkinDate.toISOString(),
                timeZone: 'Europe/Nicosia'
              },
              end: {
                dateTime: new Date(checkinDate.getTime() + 30 * 60 * 1000).toISOString(),
                timeZone: 'Europe/Nicosia'
              }
            };

            const { id: eventId } = await createCalendarEvent(accessToken, event);
            if (eventId) {
              results.exported++;
              results.events.push(eventId);
            } else {
              results.failed++;
            }

            await new Promise(resolve => setTimeout(resolve, 250));
          }
        }
      }

      console.log('Bulk export complete:', results);
      return new Response(JSON.stringify({
        success: true,
        exported: results.exported,
        failed: results.failed,
        message: `Successfully exported ${results.exported} activities to Google Calendar`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('Sync Google Calendar error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
