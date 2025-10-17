import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!YOUTUBE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // YouTube playlist ID
    const playlistId = 'PLT3yfwvL9SV72Hm_8XHZ8ovkuFFv9L5l2';
    
    console.log('Fetching exercises from YouTube playlist:', playlistId);
    
    let allVideos: any[] = [];
    let nextPageToken = '';
    
    // Fetch all videos from playlist (handle pagination)
    do {
      const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
      url.searchParams.append('part', 'snippet');
      url.searchParams.append('playlistId', playlistId);
      url.searchParams.append('maxResults', '50');
      url.searchParams.append('key', YOUTUBE_API_KEY);
      if (nextPageToken) {
        url.searchParams.append('pageToken', nextPageToken);
      }
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('YouTube API error:', response.status, errorText);
        throw new Error(`YouTube API error: ${response.status}`);
      }
      
      const data = await response.json();
      allVideos = allVideos.concat(data.items || []);
      nextPageToken = data.nextPageToken || '';
      
      console.log(`Fetched ${data.items?.length || 0} videos, total: ${allVideos.length}`);
    } while (nextPageToken);
    
    console.log(`Total videos fetched: ${allVideos.length}`);
    
    // Transform and insert exercises
    const exercises = allVideos.map(item => ({
      name: item.snippet.title,
      video_id: item.snippet.resourceId.videoId,
      video_url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
      description: item.snippet.description,
    }));
    
    // Clear existing exercises and insert new ones
    const { error: deleteError } = await supabase
      .from('exercises')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (deleteError) {
      console.error('Error deleting old exercises:', deleteError);
    }
    
    // Insert new exercises
    const { data: insertedData, error: insertError } = await supabase
      .from('exercises')
      .insert(exercises)
      .select();
    
    if (insertError) {
      console.error('Error inserting exercises:', insertError);
      throw insertError;
    }
    
    console.log(`Successfully synced ${insertedData?.length || 0} exercises`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        count: insertedData?.length || 0,
        exercises: insertedData 
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in sync-youtube-exercises:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});