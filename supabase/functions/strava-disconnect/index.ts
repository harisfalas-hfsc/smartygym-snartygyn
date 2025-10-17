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

    // Deauthorize with Strava
    const deauthResponse = await fetch(
      'https://www.strava.com/oauth/deauthorize',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${connection.access_token}`,
        },
      }
    );

    if (!deauthResponse.ok) {
      console.warn('Failed to deauthorize with Strava, proceeding with local deletion');
    }

    // Delete activities
    const { error: activitiesError } = await supabase
      .from('strava_activities')
      .delete()
      .eq('user_id', user.id);

    if (activitiesError) {
      console.error('Error deleting activities:', activitiesError);
    }

    // Delete connection
    const { error: deleteError } = await supabase
      .from('strava_connections')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) {
      throw deleteError;
    }

    console.log('Strava disconnected successfully');

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in strava-disconnect:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
