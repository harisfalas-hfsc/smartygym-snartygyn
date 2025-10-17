import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Get Strava connection
    const { data: connection, error: connError } = await supabase
      .from('strava_connections')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (connError || !connection) {
      throw new Error('No Strava connection found');
    }

    let accessToken = connection.access_token;

    // Check if token is expired and refresh if needed
    if (Date.now() / 1000 > connection.expires_at) {
      console.log('Token expired, refreshing...');
      
      const clientId = Deno.env.get('STRAVA_CLIENT_ID');
      const clientSecret = Deno.env.get('STRAVA_CLIENT_SECRET');

      const refreshResponse = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: connection.refresh_token,
          grant_type: 'refresh_token',
        }),
      });

      if (!refreshResponse.ok) {
        throw new Error('Failed to refresh token');
      }

      const refreshData = await refreshResponse.json();
      accessToken = refreshData.access_token;

      // Update tokens in database
      await supabase
        .from('strava_connections')
        .update({
          access_token: refreshData.access_token,
          refresh_token: refreshData.refresh_token,
          expires_at: refreshData.expires_at,
        })
        .eq('user_id', user.id);

      console.log('Token refreshed successfully');
    }

    // Fetch activities from Strava
    const activitiesResponse = await fetch(
      'https://www.strava.com/api/v3/athlete/activities?per_page=50',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!activitiesResponse.ok) {
      throw new Error('Failed to fetch activities from Strava');
    }

    const activities = await activitiesResponse.json();
    console.log(`Fetched ${activities.length} activities from Strava`);

    // Store activities in database
    for (const activity of activities) {
      await supabase
        .from('strava_activities')
        .upsert({
          user_id: user.id,
          strava_activity_id: activity.id,
          name: activity.name,
          type: activity.type,
          distance: activity.distance,
          moving_time: activity.moving_time,
          elapsed_time: activity.elapsed_time,
          total_elevation_gain: activity.total_elevation_gain,
          start_date: activity.start_date,
          average_speed: activity.average_speed,
          max_speed: activity.max_speed,
          calories: activity.calories,
        }, {
          onConflict: 'user_id,strava_activity_id',
        });
    }

    console.log('Activities saved to database');

    return new Response(
      JSON.stringify({ success: true, count: activities.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in strava-fetch-activities:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
