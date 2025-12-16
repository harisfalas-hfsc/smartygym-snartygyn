import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY');
const RAPIDAPI_HOST = 'gym-fit.p.rapidapi.com';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { endpoint, params } = await req.json();
    
    console.log('Gym Fit API request:', { endpoint, params });

    if (!RAPIDAPI_KEY) {
      throw new Error('RAPIDAPI_KEY is not configured');
    }

    // Build the API URL based on endpoint type
    let apiUrl = `https://${RAPIDAPI_HOST}/v1`;
    
    switch (endpoint) {
      // Exercise endpoints
      case 'searchExercises':
        // GET /v1/exercises/search?limit=50&offset=0&bodyPart=X&equipment=X&type=X&name=X
        apiUrl += '/exercises/search';
        const searchParams = new URLSearchParams();
        if (params?.limit) searchParams.set('limit', String(params.limit));
        if (params?.offset) searchParams.set('offset', String(params.offset || 0));
        if (params?.bodyPart) searchParams.set('bodyPart', params.bodyPart);
        if (params?.equipment) searchParams.set('equipment', params.equipment);
        if (params?.type) searchParams.set('type', params.type);
        // Test name search parameter
        if (params?.name) searchParams.set('name', params.name);
        if (searchParams.toString()) {
          apiUrl += `?${searchParams.toString()}`;
        }
        break;
        
      case 'getExercise':
        // GET /v1/exercises/{id}
        if (!params?.id) throw new Error('Exercise ID is required');
        apiUrl += `/exercises/${encodeURIComponent(params.id)}`;
        break;
        
      case 'getAlternatives':
        // GET /v1/exercises/{id}/alternatives
        if (!params?.id) throw new Error('Exercise ID is required');
        apiUrl += `/exercises/${encodeURIComponent(params.id)}/alternatives`;
        break;
        
      // Muscle endpoints
      case 'searchMuscles':
        // GET /v1/muscles/search?number=50&offset=0
        apiUrl += '/muscles/search';
        const muscleParams = new URLSearchParams();
        if (params?.number) muscleParams.set('number', String(params.number));
        if (params?.offset) muscleParams.set('offset', String(params.offset || 0));
        if (muscleParams.toString()) {
          apiUrl += `?${muscleParams.toString()}`;
        }
        break;
        
      case 'getMuscle':
        // GET /v1/muscles/{id}
        if (!params?.id) throw new Error('Muscle ID is required');
        apiUrl += `/muscles/${encodeURIComponent(params.id)}`;
        break;
        
      default:
        // Default to exercise search
        apiUrl += '/exercises/search?limit=50&offset=0';
    }

    console.log('Fetching from:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gym Fit API error:', response.status, errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Gym Fit API response received, items:', Array.isArray(data) ? data.length : 'single object');

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error in fetch-gym-fit-exercises:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
