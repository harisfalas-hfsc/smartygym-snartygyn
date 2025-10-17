import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { type, data } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let systemPrompt = '';
    let userPrompt = '';

    if (type === 'workout') {
      systemPrompt = `You are an expert fitness coach. Create a detailed workout plan based on the user's information. 
      Format the response as a structured workout plan with exercises, sets, reps, and rest periods.
      Include warm-up and cool-down sections. Be specific and actionable.`;
      
      userPrompt = `Create a workout plan for:
      - Age: ${data.age}
      - Height: ${data.height} cm
      - Weight: ${data.weight} kg
      - Goal: ${data.goal}
      - Available time: ${data.timeAvailable} minutes
      - Equipment: ${data.equipment}
      ${data.limitations ? `- Physical limitations: ${data.limitations}` : ''}`;
    } else if (type === 'training-program') {
      systemPrompt = `You are an expert fitness coach. Create a detailed multi-week training program based on the user's information.
      Include progressive overload principles, weekly structure, and clear progression guidelines.
      Format as a comprehensive program with weekly breakdowns.`;
      
      userPrompt = `Create a training program for:
      - Age: ${data.age}
      - Height: ${data.height} cm
      - Weight: ${data.weight} kg
      - Goal: ${data.goal}
      - Duration: ${data.programLength} weeks
      - Training days per week: ${data.daysPerWeek}
      - Experience level: ${data.experienceLevel}
      - Equipment: ${data.equipment}
      ${data.limitations ? `- Physical limitations: ${data.limitations}` : ''}`;
    } else if (type === 'diet') {
      systemPrompt = `You are an expert nutritionist. Create a detailed diet plan based on the user's information.
      Include meal timing, macronutrient breakdown, specific food suggestions, and hydration guidelines.
      Format as a comprehensive daily meal plan with portions and nutritional information.`;
      
      userPrompt = `Create a diet plan for:
      - Age: ${data.age}
      - Height: ${data.height} cm
      - Weight: ${data.weight} kg
      - Goal: ${data.goal}
      - Activity level: ${data.activityLevel}
      - Meals per day: ${data.mealsPerDay}
      - Dietary restrictions: ${data.dietaryRestrictions || 'None'}
      ${data.allergies ? `- Allergies: ${data.allergies}` : ''}`;
    }

    console.log('Generating plan for type:', type);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await response.json();
    const generatedPlan = aiData.choices[0].message.content;

    return new Response(JSON.stringify({ plan: generatedPlan }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-fitness-plan function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
