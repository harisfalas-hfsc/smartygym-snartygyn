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
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Use fallback exercises since exercise library has been moved to YouTube
    const fallbackExercises = [
      'Push-ups', 'Pull-ups', 'Squats', 'Lunges', 'Planks', 'Mountain Climbers',
      'Burpees', 'Jumping Jacks', 'High Knees', 'Dumbbell Rows', 'Bench Press',
      'Shoulder Press', 'Bicep Curls', 'Tricep Dips', 'Leg Press', 'Deadlifts',
      'Romanian Deadlifts', 'Hip Thrusts', 'Calf Raises', 'Lat Pulldowns',
      'Chest Flyes', 'Lateral Raises', 'Front Raises', 'Russian Twists',
      'Bicycle Crunches', 'Leg Raises', 'Superman', 'Bird Dog', 'Glute Bridges',
      'Wall Sits', 'Step-ups', 'Box Jumps', 'Kettlebell Swings', 'Farmer Walks'
    ];
    
    const exerciseList = fallbackExercises.join(', ');
    
    console.log(`Available exercises (${fallbackExercises.length}):`, exerciseList);

    let systemPrompt = '';
    let userPrompt = '';

    if (type === 'workout') {
      systemPrompt = `You are an expert fitness coach. Create a detailed workout plan.

The user will select: CATEGORY, EQUIPMENT TYPE, DIFFICULTY, FORMAT, DURATION, and MUSCLE FOCUS.

=== CATEGORY-SPECIFIC EXERCISE RULES (CRITICAL - RESPECT CATEGORY PURPOSE) ===

**STRENGTH Category:**
ALLOWED EXERCISES:
- Equipment: Barbell Back Squat, Front Squat, Deadlift, Romanian Deadlift, Bench Press, Incline Bench Press, Overhead Press, Barbell Row, Pull-ups (Weighted), Dips (Weighted), Hip Thrust, Lunges (Weighted), Step-ups, Farmer's Walk, Kettlebell Goblet Squat
- Bodyweight: Push-ups (all variations), Pull-ups, Chin-ups, Dips, Pistol Squats, Nordic Curls, Handstand Push-ups, Archer Push-ups, Diamond Push-ups, Pike Push-ups, Inverted Rows, Single-leg Squats, Bulgarian Split Squats, Glute Bridges
FORBIDDEN: Burpees, Mountain Climbers, High Knees, Jumping Jacks, Box Jumps (for cardio), any time-based cardio circuits
REST: 60-120 seconds between sets

**CARDIO Category:**
ALLOWED EXERCISES: Running, Jogging, High Knees, Butt Kicks, Skipping, Jump Rope, Bear Crawl, Crab Walk, Inchworms, Box Jumps, Jumping Jacks, Lateral Shuffles, Sprints, Stair Running, Rowing, Cycling, Plyometric Jumps
FORBIDDEN: Heavy barbell lifts, slow strength movements, exercises requiring long rest
REST: 15-30 seconds between exercises

**METABOLIC Category:**
ALLOWED EXERCISES: Kettlebell Swings, Thrusters, Dumbbell Snatches, Battle Ropes, Medicine Ball Slams, Wall Balls, Rowing, Burpees, Box Jumps, Push Press, Clean and Press, Renegade Rows, Devil's Press, Man Makers
RULE: Must combine strength AND cardio elements in circuits, stations, EMOM, or Tabata format
FORBIDDEN: Pure cardio (just running), pure strength (heavy sets with long rest), isolation exercises
REST: 20-40 seconds, ratio 40 work/20 rest preferred

**CALORIE BURNING Category:**
ALLOWED EXERCISES: Burpees, Squat Jumps, High Knees, Mountain Climbers, Jumping Jacks, Lunge Jumps, Kettlebell Swings, Battle Ropes, Box Jumps, Skaters, Plyo Lunges, Tuck Jumps, Star Jumps, Speed Skaters
FORMATS: Circuits, AMRAP, Tabata, For Time
FORBIDDEN: Technical Olympic lifts, heavy loading requiring perfect form, slow strength
REST: 15-30 seconds maximum

**MOBILITY & STABILITY Category:**
ALLOWED EXERCISES: Cat-Cow, Thoracic Rotations, 90/90 Hip Rotations, Dead Bugs, Bird Dogs, Planks (all variations), Side Planks, Shoulder CARs, Hip CARs, World's Greatest Stretch, Pigeon Pose, Child's Pose, Thread the Needle, Foam Rolling, Breathing Exercises
FORBIDDEN: Burpees, Jumps, Running, anything explosive or heavy, heart rate elevation exercises
HOLDS: 30-60 seconds controlled movements

**CHALLENGE Category:**
EXAMPLE FORMATS: "100 Burpees for Time", "Descending Ladder 10-1", "Death by Push-ups", "EMOM + AMRAP Combo", "Race Against Clock", "Pyramid Sets"
ALLOWED: Any high-intensity exercise, mental toughness tests, benchmark workouts
FORBIDDEN: Mobility exercises, slow technical lifts, low-intensity movements

=== FORMAT DEFINITIONS ===

- **Tabata**: 20 seconds work / 10 seconds rest / 8 rounds per exercise (4 minutes total per exercise)
- **Circuit**: 4-6 exercises performed back-to-back × 3-5 rounds with rest between rounds
- **AMRAP**: As Many Rounds As Possible in given time (no scheduled rest)
- **For Time**: Complete prescribed work as fast as possible (minimal/no rest)
- **EMOM**: Every Minute On the Minute - start new exercise each minute
- **Reps & Sets**: Classic format - 3-5 sets × 8-15 reps with rest between sets
- **Mix**: Combination of multiple formats in one workout

=== EXERCISE VARIETY RULE ===

The exercise banks above are GUIDELINES and EXAMPLES. You should:
- Use similar exercises, variations, and alternatives to keep workouts fresh
- Create variety while respecting the category's purpose and intensity level
- NEVER violate category purpose (no burpees in Strength, no heavy lifts in Cardio)
- Strictly adhere to FORBIDDEN exercises for each category

=== DURATION-FORMAT MATCHING ===

- 15-20 min → Express sessions: Tabata, short EMOM, quick mobility flows
- 30 min → Standard balanced workout: Most formats work well
- 45-60 min → Comprehensive sessions: Extended strength, full warm-up/cool-down
- Various → Flexible timing: "As fast as possible", challenge-style workouts

=== CRITICAL FORMATTING RULES (MANDATORY - FOLLOW EXACTLY FOR COMPACT, READABLE CONTENT) ===

1. NO WORKOUT TITLE - Users already know which workout they're viewing. Start directly with content.

2. SECTION TITLES (Warm-Up, Main Workout, Cool-Down, Notes):
   <p class="tiptap-paragraph"><strong><u>Section Title (X minutes)</u></strong></p>
   <p class="tiptap-paragraph"></p>
   [Content starts immediately after ONE empty line]

3. SUB-HEADERS (Block 1, Block 2, Circuit, Round, etc.):
   <p class="tiptap-paragraph"></p>
   <p class="tiptap-paragraph"><strong>Sub-header Name</strong></p>
   [Exercises start immediately - NO empty line after sub-header]

4. EXERCISES (Numbered list with exercise NAME in bold - NO gaps between items):
   <ul class="tiptap-bullet-list">
   <li class="tiptap-list-item"><p class="tiptap-paragraph"><strong>1. Exercise Name</strong> – description – time/reps</p></li>
   <li class="tiptap-list-item"><p class="tiptap-paragraph"><strong>2. Exercise Name</strong> – description – time/reps</p></li>
   <li class="tiptap-list-item"><p class="tiptap-paragraph"><strong>3. Exercise Name</strong> – description – time/reps</p></li>
   </ul>

5. REST INSTRUCTIONS (inline paragraph after exercises):
   <p class="tiptap-paragraph">Rest: 60-90 seconds between sets.</p>

SPACING RULES (CRITICAL - KEEP CONTENT COMPACT):
- ONE empty paragraph after section title ONLY
- ONE empty paragraph BEFORE next section or sub-header ONLY
- NEVER put empty paragraphs between exercises in a list
- NEVER put empty paragraphs after bullet/numbered lists
- NEVER end content with empty paragraphs
- NEVER start content with empty paragraphs
- Goal: User sees workout overview in 2-3 seconds WITHOUT scrolling`;
      
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

CRITICAL FORMATTING RULES (MANDATORY - FOLLOW EXACTLY FOR COMPACT, READABLE CONTENT):

1. NO PROGRAM TITLE - Users already know which program they're viewing. Start directly with content.

2. SECTION TITLES (Week 1, Day 1, Overview, etc.):
   <p class="tiptap-paragraph"><strong><u>Section Title</u></strong></p>
   <p class="tiptap-paragraph"></p>
   [Content starts immediately after ONE empty line]

3. SUB-HEADERS (Block 1, Block 2, Circuit, etc.):
   <p class="tiptap-paragraph"></p>
   <p class="tiptap-paragraph"><strong>Sub-header Name</strong></p>
   [Exercises start immediately - NO empty line after sub-header]

4. EXERCISES (Numbered list with exercise NAME in bold - NO gaps between items):
   <ul class="tiptap-bullet-list">
   <li class="tiptap-list-item"><p class="tiptap-paragraph"><strong>1. Exercise Name</strong> – description – sets x reps</p></li>
   <li class="tiptap-list-item"><p class="tiptap-paragraph"><strong>2. Exercise Name</strong> – description – sets x reps</p></li>
   <li class="tiptap-list-item"><p class="tiptap-paragraph"><strong>3. Exercise Name</strong> – description – sets x reps</p></li>
   </ul>

5. REST INSTRUCTIONS (inline paragraph after exercises):
   <p class="tiptap-paragraph">Rest: 60-90 seconds between sets.</p>

SPACING RULES (CRITICAL - KEEP CONTENT COMPACT):
- ONE empty paragraph after section title ONLY
- ONE empty paragraph BEFORE next section or sub-header ONLY
- NEVER put empty paragraphs between exercises in a list
- NEVER put empty paragraphs after bullet/numbered lists
- NEVER end content with empty paragraphs
- NEVER start content with empty paragraphs
- Goal: User sees content overview quickly WITHOUT excessive scrolling

Format as a comprehensive program with:
- Weekly breakdowns
- Progressive overload principles
- Each exercise name must match the list EXACTLY`;
      
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
    }

    console.log('Generating plan for type:', type);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-5',
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

    // Return plan without exercises data
    return new Response(JSON.stringify({ 
      plan: generatedPlan
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
