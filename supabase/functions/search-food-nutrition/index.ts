import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const USDA_API_URL = 'https://api.nal.usda.gov/fdc/v1/foods/search';
const USDA_API_KEY = 'DEMO_KEY';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();

    if (!query || query.trim().length < 2) {
      return new Response(JSON.stringify({ foods: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const params = new URLSearchParams({
      api_key: USDA_API_KEY,
      query: query.trim(),
      pageSize: '15',
      dataType: 'Foundation,SR Legacy',
    });

    const response = await fetch(`${USDA_API_URL}?${params}`);
    if (!response.ok) {
      throw new Error(`USDA API error: ${response.status}`);
    }

    const data = await response.json();

    const foods = (data.foods || []).map((food: any) => {
      const nutrients: Record<string, number> = {};
      for (const n of food.foodNutrients || []) {
        const id = n.nutrientId;
        const val = n.value ?? 0;
        if (id === 1008) nutrients.calories = val;
        if (id === 1003) nutrients.protein = val;
        if (id === 1005) nutrients.carbs = val;
        if (id === 1004) nutrients.fat = val;
        if (id === 1079) nutrients.fiber = val;
      }

      return {
        fdcId: food.fdcId,
        name: food.description,
        calories: nutrients.calories ?? 0,
        protein: nutrients.protein ?? 0,
        carbs: nutrients.carbs ?? 0,
        fat: nutrients.fat ?? 0,
        fiber: nutrients.fiber ?? 0,
      };
    });

    return new Response(JSON.stringify({ foods }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error searching food:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
