import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EXERCISEDB_API_BASE = "https://exercisedb.p.rapidapi.com";

interface ExerciseDBExercise {
  id: string;
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
  secondaryMuscles: string[];
  instructions: string[];
  gifUrl: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rapidApiKey = Deno.env.get("RAPIDAPI_KEY");
    
    if (!rapidApiKey) {
      throw new Error("RAPIDAPI_KEY is not configured");
    }

    console.log("Fetching exercises from ExerciseDB API...");
    
    // Fetch all exercises from ExerciseDB
    const exercisesResponse = await fetch(
      `${EXERCISEDB_API_BASE}/exercises?limit=1400`,
      {
        headers: {
          "X-RapidAPI-Key": rapidApiKey,
          "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
        },
      }
    );

    if (!exercisesResponse.ok) {
      throw new Error(`Failed to fetch exercises: ${exercisesResponse.statusText}`);
    }

    const exercisesData: ExerciseDBExercise[] = await exercisesResponse.json();
    console.log(`Fetched ${exercisesData.length} exercises from ExerciseDB`);

    // Map our exercises to ExerciseDB exercises by name similarity
    const ourExercises = [
      "Air Squats", "Burpees", "Bridge", "Bicycle Crunches", "Bear Crawl",
      "Calf Raises", "Crunches", "Chair Dips", "Crow Pose", "Decline Push-ups",
      "Diamond Push-ups", "Donkey Kicks", "Flutter Kicks", "Forward Lunges", "Frog Jumps",
      "Glute Bridges", "High Knees", "Handstand Push-ups", "Hip Thrusts", "Inchworms",
      "Jumping Jacks", "Jump Squats", "Knee Push-ups", "Leg Raises", "Lunges",
      "Mountain Climbers", "Neutral Grip Pull-ups", "Nose to Wall Handstand", "One Leg Squats", "Plank",
      "Pike Push-ups", "Push-ups", "Pull-ups", "Russian Twists", "Reverse Lunges",
      "Side Plank", "Sit-ups", "Superman", "Step-ups", "Tuck Jumps",
      "Tricep Dips", "V-ups", "Wall Sits", "Wide Grip Push-ups", "Yoga Push-ups",
      "Barbell Back Squats", "Barbell Bench Press", "Barbell Deadlifts", "Barbell Rows", "Barbell Curls",
      "Barbell Overhead Press", "Cable Flyes", "Cable Rows", "Cable Tricep Pushdowns", "Dumbbell Arnold Press",
      "Dumbbell Bench Press", "Dumbbell Bicep Curls", "Dumbbell Chest Flyes", "Dumbbell Front Raises", "Dumbbell Goblet Squats",
      "Dumbbell Hammer Curls", "Dumbbell Incline Press", "Dumbbell Lateral Raises", "Dumbbell Lunges", "Dumbbell Romanian Deadlifts",
      "Dumbbell Rows", "Dumbbell Shrugs", "Dumbbell Shoulder Press", "Dumbbell Tricep Extensions", "EZ Bar Curls",
      "Face Pulls", "Farmer's Walk", "Goblet Squats", "Hack Squats", "Hammer Strength Press",
      "Incline Dumbbell Curls", "Kettlebell Swings", "Kettlebell Goblet Squats", "Lat Pulldowns", "Leg Press",
      "Leg Curls", "Leg Extensions", "Machine Chest Press", "Machine Shoulder Press", "Nordic Curls",
      "Overhead Tricep Extensions", "Pec Deck Flyes", "Preacher Curls", "Reverse Flyes", "Romanian Deadlifts",
      "Seated Cable Rows", "Seated Calf Raises", "Smith Machine Squats", "T-Bar Rows", "Tricep Kickbacks",
      "Upright Rows", "Weighted Dips", "Weighted Pull-ups", "Wrist Curls", "Zottman Curls"
    ];

    // Find matches
    const exerciseMatches: Array<{
      name: string;
      exerciseDBExercise?: ExerciseDBExercise;
      matched: boolean;
    }> = [];

    for (const ourExerciseName of ourExercises) {
      const normalizedOurName = ourExerciseName.toLowerCase()
        .replace(/[-']/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      // Try to find a matching ExerciseDB exercise
      let bestMatch: ExerciseDBExercise | undefined;
      let bestScore = 0;

      for (const exerciseDBEx of exercisesData) {
        const normalizedDBName = exerciseDBEx.name.toLowerCase()
          .replace(/[-']/g, " ")
          .replace(/\s+/g, " ")
          .trim();

        // Calculate similarity score
        let score = 0;
        const ourWords = normalizedOurName.split(" ");
        const dbWords = normalizedDBName.split(" ");

        for (const ourWord of ourWords) {
          for (const dbWord of dbWords) {
            if (ourWord === dbWord) {
              score += 2;
            } else if (ourWord.includes(dbWord) || dbWord.includes(ourWord)) {
              score += 1;
            }
          }
        }

        if (score > bestScore) {
          bestScore = score;
          bestMatch = exerciseDBEx;
        }
      }

      exerciseMatches.push({
        name: ourExerciseName,
        exerciseDBExercise: bestMatch,
        matched: bestScore > 1 && !!bestMatch,
      });
    }

    // Separate matched and unmatched
    const matched = exerciseMatches.filter(e => e.matched);
    const unmatched = exerciseMatches.filter(e => !e.matched);

    console.log(`Matched ${matched.length} exercises with GIFs`);
    console.log(`Could not find matches for ${unmatched.length} exercises`);

    return new Response(
      JSON.stringify({
        success: true,
        matched: matched.map(e => ({
          name: e.name,
          exerciseDBName: e.exerciseDBExercise?.name,
          exerciseDBId: e.exerciseDBExercise?.id,
          gifUrl: e.exerciseDBExercise?.gifUrl,
          bodyPart: e.exerciseDBExercise?.bodyPart,
          target: e.exerciseDBExercise?.target,
          equipment: e.exerciseDBExercise?.equipment,
        })),
        unmatched: unmatched.map(e => ({
          name: e.name,
          bestMatch: e.exerciseDBExercise?.name,
        })),
        stats: {
          total: ourExercises.length,
          matched: matched.length,
          unmatched: unmatched.length,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error fetching ExerciseDB exercises:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
