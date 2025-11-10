import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[MIGRATE-WORKOUT-DATA] ${step}${detailsStr}`);
};

// This contains the actual workout data structure from your component
// We'll need to manually copy the workoutData object here
const HARDCODED_WORKOUTS = {
  "challenge-002": {
    name: "Starter Gauntlet",
    type: "challenge",
    difficulty: "Beginner",
    duration: "30 min",
    equipment: "No Equipment Required",
    description: "A simple but motivating challenge workout using bodyweight movements in a round-based format.",
    tier: "subscriber"
  },
  "challenge-003": {
    name: "Challenge Prep",
    type: "challenge",
    difficulty: "Beginner",
    duration: "30 min",
    equipment: "Equipment Required",
    description: "A light challenge-style circuit using dumbbells and bands to build strength and stamina.",
    tier: "subscriber"
  }
  // More workouts will be added by the edge function
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Migration started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verify admin authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw userError;

    const user = userData.user;
    if (!user) throw new Error("Not authenticated");

    // Check admin role
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !roleData) {
      throw new Error("Admin access required");
    }

    logStep("Admin verified");

    // Parse request body
    const { workoutData, programData, mode } = await req.json();
    
    let workoutResults = { success: 0, failed: 0, errors: [] as string[] };
    let programResults = { success: 0, failed: 0, errors: [] as string[] };

    // Migrate workouts
    if (workoutData && Array.isArray(workoutData)) {
      logStep("Migrating workouts", { count: workoutData.length });
      
      for (const workout of workoutData) {
        try {
          // Map difficulty to tier
          const tierMap: { [key: string]: string } = {
            'Beginner': 'subscriber',
            'Intermediate': 'subscriber', 
            'Advanced': 'premium'
          };

          // Convert exercises to main_workout format
          let mainWorkout = '';
          if (workout.exercises && Array.isArray(workout.exercises)) {
            mainWorkout = workout.exercises.map((ex: any) => {
              return `${ex.name}\nSets: ${ex.sets} | Reps: ${ex.reps} | Rest: ${ex.rest}\nNotes: ${ex.notes}`;
            }).join('\n\n');
          }

          // Convert tips and format to notes
          let notes = '';
          if (workout.format) notes += `${workout.format}\n\n`;
          if (workout.instructions) notes += `${workout.instructions}\n\n`;
          if (workout.tips && Array.isArray(workout.tips)) {
            notes += workout.tips.join('\n');
          }

          const { error } = await supabaseClient
            .from('admin_workouts')
            .insert({
              id: workout.id,
              name: workout.name,
              type: workout.workoutType || workout.type || 'Circuit',
              difficulty: workout.difficulty || 'Intermediate',
              duration: workout.duration || '30 min',
              equipment: workout.equipment || 'No Equipment',
              focus: workout.focus || workout.type || 'General',
              description: workout.description || '',
              image_url: workout.imageUrl || workout.image_url || '',
              warm_up: '',
              main_workout: mainWorkout,
              cool_down: '',
              notes: notes,
              tier_required: workout.tier || tierMap[workout.difficulty] || 'subscriber',
              is_premium: workout.tier === 'premium' || workout.difficulty === 'Advanced'
            });

          if (error) {
            workoutResults.failed++;
            workoutResults.errors.push(`${workout.name}: ${error.message}`);
            logStep("Workout failed", { name: workout.name, error: error.message });
          } else {
            workoutResults.success++;
          }
        } catch (err: any) {
          workoutResults.failed++;
          workoutResults.errors.push(`${workout.name}: ${err.message}`);
          logStep("Workout error", { name: workout.name, error: err.message });
        }
      }
    }

    // Migrate programs
    if (programData && Array.isArray(programData)) {
      logStep("Migrating programs", { count: programData.length });
      
      for (const program of programData) {
        try {
          const tierMap: { [key: string]: string } = {
            'Beginner': 'subscriber',
            'Intermediate': 'subscriber',
            'Advanced': 'premium'
          };

          // Convert exercises to weekly schedule format
          let weeklySchedule = '';
          if (program.exercises && Array.isArray(program.exercises)) {
            weeklySchedule = program.exercises.map((ex: any) => {
              return `${ex.week} - ${ex.day}: ${ex.workout}\n${ex.details}`;
            }).join('\n\n');
          }

          let overview = program.description || '';
          if (program.tips && Array.isArray(program.tips)) {
            overview += '\n\nKey Tips:\n' + program.tips.join('\n');
          }

          const { error } = await supabaseClient
            .from('admin_training_programs')
            .insert({
              id: program.id || program.serialNumber,
              name: program.name,
              category: program.focus || program.type || 'General',
              difficulty: program.difficulty || 'Intermediate',
              duration: program.duration || '4 weeks',
              equipment: program.equipment || 'Mixed',
              description: program.description || '',
              image_url: program.imageUrl || program.image_url || '',
              overview: overview,
              weekly_schedule: weeklySchedule,
              program_structure: program.format || '',
              progression_plan: program.instructions || '',
              tier_required: program.tier || tierMap[program.difficulty] || 'subscriber',
              is_premium: program.tier === 'premium' || program.difficulty === 'Advanced'
            });

          if (error) {
            programResults.failed++;
            programResults.errors.push(`${program.name}: ${error.message}`);
            logStep("Program failed", { name: program.name, error: error.message });
          } else {
            programResults.success++;
          }
        } catch (err: any) {
          programResults.failed++;
          programResults.errors.push(`${program.name}: ${err.message}`);
          logStep("Program error", { name: program.name, error: err.message });
        }
      }
    }

    logStep("Migration completed", {
      workouts: workoutResults,
      programs: programResults
    });

    return new Response(
      JSON.stringify({
        success: true,
        workouts: workoutResults,
        programs: programResults
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
