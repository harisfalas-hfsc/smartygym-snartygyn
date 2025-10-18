import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { type, data } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Fetch available exercises from database
    const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
    const { data: exercises, error: exercisesError } = await supabase
      .from('exercises')
      .select('name, video_id, video_url');
    
    if (exercisesError) {
      console.error('Error fetching exercises:', exercisesError);
    }
    
    // Fallback exercises if database is empty
    const fallbackExercises = [
      'Push-ups', 'Pull-ups', 'Squats', 'Lunges', 'Planks', 'Mountain Climbers',
      'Burpees', 'Jumping Jacks', 'High Knees', 'Dumbbell Rows', 'Bench Press',
      'Shoulder Press', 'Bicep Curls', 'Tricep Dips', 'Leg Press', 'Deadlifts',
      'Romanian Deadlifts', 'Hip Thrusts', 'Calf Raises', 'Lat Pulldowns',
      'Chest Flyes', 'Lateral Raises', 'Front Raises', 'Russian Twists',
      'Bicycle Crunches', 'Leg Raises', 'Superman', 'Bird Dog', 'Glute Bridges',
      'Wall Sits', 'Step-ups', 'Box Jumps', 'Kettlebell Swings', 'Farmer Walks'
    ];
    
    const exerciseList = exercises && exercises.length > 0 
      ? exercises.map(e => e.name).join(', ')
      : fallbackExercises.join(', ');
    
    console.log(`Available exercises (${exercises?.length || fallbackExercises.length}):`, exerciseList);

    let systemPrompt = '';
    let userPrompt = '';

    if (type === 'workout') {
      systemPrompt = `You are an expert fitness coach. Create a detailed workout plan using ONLY the exercises from this list:
${exerciseList}

CRITICAL RULES:
1. You MUST ONLY use exercises from the list above
2. Format each exercise name EXACTLY as it appears in the list
3. Do NOT suggest any exercises not in the list
4. If the list doesn't have enough exercises for the goal, use available exercises creatively

Format the response as a structured workout plan with:
- Warm-up section
- Main workout with sets, reps, and rest periods
- Cool-down section
- Each exercise name must match the list EXACTLY (will be auto-linked to demonstration videos)`;
      
      userPrompt = `Create a workout plan for:
      - Age: ${data.age}
      - Height: ${data.height} cm
      - Weight: ${data.weight} kg
      - Goal: ${data.goal}
      - Available time: ${data.timeAvailable} minutes
      - Equipment: ${data.equipment}
      ${data.limitations ? `- Physical limitations: ${data.limitations}` : ''}
      
Available exercises: ${exerciseList}`;
    } else if (type === 'training-program') {
      systemPrompt = `You are an expert fitness coach. Create a detailed multi-week training program using ONLY the exercises from this list:
${exerciseList}

CRITICAL RULES:
1. You MUST ONLY use exercises from the list above
2. Format each exercise name EXACTLY as it appears in the list
3. Do NOT suggest any exercises not in the list
4. If the list doesn't have enough exercises, use available exercises creatively with progressive overload

Format as a comprehensive program with:
- Weekly breakdowns
- Progressive overload principles
- Each exercise name must match the list EXACTLY (will be auto-linked to demonstration videos)`;
      
      userPrompt = `Create a training program for:
       - Age: ${data.age}
       - Height: ${data.height} cm
       - Weight: ${data.weight} kg
       - Goal: ${data.goal}
       - Duration: ${data.programLength} weeks
       - Training days per week: ${data.daysPerWeek}
       - Experience level: ${data.experienceLevel}
       - Equipment: ${Array.isArray(data.equipment) ? data.equipment.join(", ") : data.equipment}
       ${data.limitations ? `- Physical limitations: ${data.limitations}` : ''}
       
Available exercises: ${exerciseList}`;
    } else if (type === 'diet') {
      // Calculate protein needs based on goal
      let proteinPerKg = 1.6; // default
      if (data.goal === "Muscle gain" || data.goal === "Bulking") {
        proteinPerKg = 2.0; // 2g per kg for muscle gain
      } else if (data.goal === "Weight loss" || data.goal === "Cutting") {
        proteinPerKg = 1.8;
      }

      const proteinGrams = Math.round(parseFloat(data.weight) * proteinPerKg);

      systemPrompt = `You are an expert nutritionist. Create a detailed diet plan based on the user's information.
      Include meal timing, macronutrient breakdown, specific food suggestions, and hydration guidelines.
      Format as a comprehensive daily meal plan with portions and nutritional information.
      CRITICAL: For muscle gain goals, ensure protein intake is at least 2g per kg of body weight (${proteinGrams}g daily for this user).`;
      
      userPrompt = `Create a diet plan for:
       - Age: ${data.age}
       - Height: ${data.height} cm
       - Weight: ${data.weight} kg
       - Goal: ${data.goal}
       - Activity level: ${data.activityLevel}
       - Meals per day: ${data.mealsPerDay}
       - Diet Method: ${data.dietMethod}
       ${data.dietMethod === "Custom" ? `- Custom Macros - Protein: ${data.customMacros.protein}%, Carbs: ${data.customMacros.carbs}%, Fats: ${data.customMacros.fats}%` : ''}
       - Dietary restrictions: ${Array.isArray(data.dietaryRestrictions) ? data.dietaryRestrictions.join(", ") : 'None'}
       ${data.allergies && Array.isArray(data.allergies) && data.allergies.length > 0 ? `- Allergies: ${data.allergies.join(", ")}` : ''}
       
       IMPORTANT: Ensure protein is at least ${proteinGrams}g per day for optimal results with this goal.`;
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
        return new Response(JSON.stringify({ error: "Service unavailable. Please contact support." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error('Service gateway error:', response.status, errorText);
      return new Response(JSON.stringify({ error: "Service temporarily unavailable. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const planData = await response.json();
    const generatedPlan = planData.choices[0].message.content;

    // Return plan with exercises data for video linking
    return new Response(JSON.stringify({ 
      plan: generatedPlan,
      exercises: exercises || []
    }), {
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
