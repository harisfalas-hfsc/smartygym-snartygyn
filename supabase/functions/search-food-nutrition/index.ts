import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const USDA_API_URL = 'https://api.nal.usda.gov/fdc/v1/foods/search';
const USDA_API_KEY = 'DEMO_KEY';

interface USDAFood {
  fdcId: number;
  description: string;
  foodNutrients?: { nutrientId: number; value?: number }[];
  dataType?: string;
}

function extractNutrients(food: USDAFood) {
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
}

async function searchUSDA(query: string, pageSize = 20): Promise<USDAFood[]> {
  const params = new URLSearchParams({
    api_key: USDA_API_KEY,
    query,
    pageSize: String(pageSize),
    dataType: 'Foundation,SR Legacy',
  });
  const response = await fetch(`${USDA_API_URL}?${params}`);
  if (!response.ok) return [];
  const data = await response.json();
  return data.foods || [];
}

function scoreFood(food: USDAFood, queryLower: string): number {
  const name = food.description.toLowerCase();
  const words = name.split(/[\s,]+/).filter(Boolean);

  let score = 0;

  // Base relevance scoring
  if (name === queryLower) score = 100;
  else if (name.startsWith(queryLower)) score = 80;
  else if (words.some(w => w === queryLower)) score = 70;
  else if (words.some(w => w.startsWith(queryLower))) score = 60;
  else if (name.includes(queryLower)) score = 40;
  else score = 20;

  // Penalize noisy categories
  const penaltyPatterns = ['babyfood', 'baby food', 'infant', 'toddler', 'formula', 'baby', 'junior', 'strained'];
  if (penaltyPatterns.some(p => name.includes(p))) score -= 30;

  const brandIndicators = ['chick-fil-a', 'mcdonald', 'wendy', 'burger king', 'subway', 'taco bell', 'pizza hut', 'kfc', 'popeye', 'denny', 'applebee'];
  if (brandIndicators.some(b => name.includes(b))) score -= 20;

  // Prefer shorter, generic names (fewer words = more generic)
  score -= Math.min(words.length, 8);

  // Prefer Foundation data type
  if (food.dataType === 'Foundation') score += 5;

  return Math.max(1, score);
}

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

    const trimmed = query.trim();
    const queryLower = trimmed.toLowerCase();

    // Stage A+B: run exact and wildcard searches in parallel
    const [exactFoods, wildcardFoods] = await Promise.all([
      searchUSDA(trimmed),
      searchUSDA(trimmed + '*', 20),
    ]);
    let rawFoods = [...exactFoods, ...wildcardFoods];

    // Stage C: if still sparse, try up to 2 common food-word completions in parallel
    if (rawFoods.length < 5 && trimmed.length <= 8) {
      const commonFoods = [
        'chicken', 'cheese', 'cherry', 'chips', 'chocolate', 'chickpea',
        'banana', 'bacon', 'bean', 'beef', 'bread', 'broccoli', 'butter',
        'rice', 'salmon', 'steak', 'sugar', 'tomato', 'tuna', 'turkey',
        'potato', 'pasta', 'pork', 'pepper', 'peanut', 'pizza',
        'milk', 'mango', 'mushroom', 'oat', 'onion', 'orange', 'egg',
        'fish', 'flour', 'apple', 'avocado', 'almond', 'carrot', 'corn',
        'cream', 'cucumber', 'garlic', 'grape', 'honey', 'lemon', 'lettuce',
        'lobster', 'lamb', 'yogurt', 'walnut', 'shrimp', 'spinach', 'soy',
      ];
      const matches = commonFoods.filter(f => f.startsWith(queryLower)).slice(0, 2);
      const completionResults = await Promise.all(
        matches.map(word => searchUSDA(word, 20))
      );
      for (const foods of completionResults) {
        rawFoods = [...rawFoods, ...foods];
      }
    }

    // Pre-filter: remove babyfood/infant items entirely for better results
    const noisePatterns = ['babyfood', 'baby food', 'infant formula', 'gerber'];
    rawFoods = rawFoods.filter(f => {
      const nameLower = f.description.toLowerCase();
      return !noisePatterns.some(p => nameLower.includes(p));
    });

    // Deduplicate by fdcId
    const seen = new Set<number>();
    const unique: USDAFood[] = [];
    for (const f of rawFoods) {
      if (!seen.has(f.fdcId)) {
        seen.add(f.fdcId);
        unique.push(f);
      }
    }

    // Score and sort
    const scored = unique
      .map(f => ({ food: f, score: scoreFood(f, queryLower) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);

    const foods = scored.map(s => extractNutrients(s.food));

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
