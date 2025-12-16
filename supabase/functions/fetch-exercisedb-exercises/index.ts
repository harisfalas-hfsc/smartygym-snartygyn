import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { endpoint, params } = await req.json();
    const apiKey = Deno.env.get('EXERCISEDB_API_KEY');

    if (!apiKey) {
      throw new Error('EXERCISEDB_API_KEY not configured');
    }

    const baseUrl = 'https://exercisedb.p.rapidapi.com';
    let url = '';

    switch (endpoint) {
      case 'getAllExercises':
        url = `${baseUrl}/exercises?limit=${params?.limit || 50}&offset=${params?.offset || 0}`;
        break;
      case 'getExercise':
        url = `${baseUrl}/exercises/exercise/${params.id}`;
        break;
      case 'searchByName':
        url = `${baseUrl}/exercises/name/${encodeURIComponent(params.name)}?limit=${params?.limit || 50}`;
        break;
      case 'getByBodyPart':
        url = `${baseUrl}/exercises/bodyPart/${encodeURIComponent(params.bodyPart)}?limit=${params?.limit || 50}`;
        break;
      case 'getByEquipment':
        url = `${baseUrl}/exercises/equipment/${encodeURIComponent(params.equipment)}?limit=${params?.limit || 50}`;
        break;
      case 'getByTarget':
        url = `${baseUrl}/exercises/target/${encodeURIComponent(params.target)}?limit=${params?.limit || 50}`;
        break;
      case 'getBodyPartList':
        url = `${baseUrl}/exercises/bodyPartList`;
        break;
      case 'getEquipmentList':
        url = `${baseUrl}/exercises/equipmentList`;
        break;
      case 'getTargetList':
        url = `${baseUrl}/exercises/targetList`;
        break;
      default:
        throw new Error(`Unknown endpoint: ${endpoint}`);
    }

    console.log(`Fetching from ExerciseDB: ${endpoint}`, params);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'exercisedb.p.rapidapi.com',
        'x-rapidapi-key': apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ExerciseDB API error:', response.status, errorText);
      throw new Error(`ExerciseDB API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`ExerciseDB response for ${endpoint}:`, Array.isArray(data) ? `${data.length} items` : 'single item');

    // Helper to ensure each exercise has a browser-loadable gifUrl.
    // ExerciseDB's public CDN expects 4-digit, zero-padded IDs (e.g. 79 -> 0079).
    const addImageUrl = (exercise: any) => {
      if (!exercise || exercise.id == null) return exercise;

      const normalizedId = String(exercise.id).padStart(4, '0');
      exercise.gifUrl = `https://v2.exercisedb.io/image/${normalizedId}.gif`;
      return exercise;
    };

    // Process response to add image URLs
    let processedData;
    if (Array.isArray(data)) {
      processedData = data.map(addImageUrl);
    } else if (data && data.id) {
      processedData = addImageUrl(data);
    } else {
      processedData = data;
    }

    return new Response(JSON.stringify(processedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in fetch-exercisedb-exercises:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
