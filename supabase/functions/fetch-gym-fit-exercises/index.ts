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
    let apiUrl = `https://${RAPIDAPI_HOST}`;
    
    switch (endpoint) {
      case 'exercises':
        apiUrl += '/exercises';
        break;
      case 'bodyPart':
        apiUrl += `/exercises/bodyPart/${encodeURIComponent(params.bodyPart)}`;
        break;
      case 'equipment':
        apiUrl += `/exercises/equipment/${encodeURIComponent(params.equipment)}`;
        break;
      case 'target':
        apiUrl += `/exercises/target/${encodeURIComponent(params.target)}`;
        break;
      case 'search':
        apiUrl += `/exercises/name/${encodeURIComponent(params.name)}`;
        break;
      case 'bodyPartList':
        apiUrl += '/exercises/bodyPartList';
        break;
      case 'equipmentList':
        apiUrl += '/exercises/equipmentList';
        break;
      case 'targetList':
        apiUrl += '/exercises/targetList';
        break;
      default:
        apiUrl += '/exercises';
    }

    // Add pagination params if provided
    if (params?.limit) {
      apiUrl += `?limit=${params.limit}`;
      if (params.offset) {
        apiUrl += `&offset=${params.offset}`;
      }
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
    console.log('Gym Fit API response received, items:', Array.isArray(data) ? data.length : 'single');

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
