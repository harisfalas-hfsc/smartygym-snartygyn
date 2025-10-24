import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const WGER_API_BASE = "https://wger.de/api/v2";

interface WgerExercise {
  id: number;
  name: string;
  description: string;
  category: number;
  muscles: number[];
  equipment: number[];
}

interface WgerVideo {
  id: number;
  exercise: number;
  video: string;
  is_main: boolean;
  size: number;
  duration: string;
  width: number;
  height: number;
  codec: string;
  codec_long: string;
  license: number;
  license_author: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Fetching exercises from wger API...");
    
    // Fetch exercises in English (language=2)
    const exercisesResponse = await fetch(
      `${WGER_API_BASE}/exercise/?language=2&limit=200`,
      {
        headers: {
          "Accept": "application/json",
        },
      }
    );

    if (!exercisesResponse.ok) {
      throw new Error(`Failed to fetch exercises: ${exercisesResponse.statusText}`);
    }

    const exercisesData = await exercisesResponse.json();
    console.log(`Fetched ${exercisesData.results?.length || 0} exercises`);

    // Fetch all videos
    const videosResponse = await fetch(
      `${WGER_API_BASE}/exercisevideo/?limit=500`,
      {
        headers: {
          "Accept": "application/json",
        },
      }
    );

    if (!videosResponse.ok) {
      throw new Error(`Failed to fetch videos: ${videosResponse.statusText}`);
    }

    const videosData = await videosResponse.json();
    console.log(`Fetched ${videosData.results?.length || 0} videos`);

    // Create a map of exercise ID to videos
    const videoMap = new Map<number, WgerVideo[]>();
    for (const video of videosData.results || []) {
      if (!videoMap.has(video.exercise)) {
        videoMap.set(video.exercise, []);
      }
      videoMap.get(video.exercise)!.push(video);
    }

    // Map our exercises to wger exercises by name similarity
    const ourExercises = [
      "Air Squats", "Burpees", "Bridge", "Bicycle Crunches", "Bear Crawl",
      "Box Jumps", "Burpee Box Jump Overs", "Crunches", "Chin-ups", "Dips",
      "Diamond Push-ups", "Dead Bugs", "Frog Jumps", "Glute Bridges", "High Knees",
      "Handstand Push-ups", "Hip Thrusts", "Inchworms", "Jumping Jacks", "Jump Rope",
      "Knee Raises", "Lunges", "Mountain Climbers", "One Leg Squats", "Plank",
      "Pike Push-ups", "Push-ups", "Pull-ups", "Russian Twists", "Reverse Lunges",
      "Sit-ups", "Side Plank", "Step-ups", "Squat Jumps", "Tuck Jumps",
      "Wall Sit", "Broad Jumps", "Barbell Back Squats", "Barbell Front Squats",
      "Barbell Bench Press", "Barbell Deadlifts", "Barbell Overhead Press",
      "Barbell Bent Over Rows", "Barbell Clean and Jerk", "Barbell Snatch",
      "Barbell Thrusters", "Dumbbell Shoulder Press", "Dumbbell Rows",
      "Dumbbell Chest Press", "Dumbbell Lunges", "Dumbbell Goblet Squats",
      "Dumbbell Bicep Curls", "Dumbbell Tricep Extensions", "Dumbbell Lateral Raises",
      "Dumbbell Front Raises", "Dumbbell Romanian Deadlifts", "Kettlebell Swings",
      "Kettlebell Goblet Squats", "Kettlebell Turkish Get-ups", "Kettlebell Cleans",
      "Kettlebell Snatches", "Medicine Ball Slams", "Medicine Ball Wall Balls",
      "Medicine Ball Russian Twists", "Resistance Band Squats", "Resistance Band Rows",
      "Resistance Band Chest Press", "Resistance Band Bicep Curls", "Battle Ropes",
      "TRX Rows", "TRX Push-ups", "TRX Pistol Squats", "Sled Push", "Sled Pull",
      "Box Step-ups", "Farmer's Walk", "Sprint Intervals", "Assault Bike Sprints",
      "Rowing Machine Intervals", "Treadmill Sprints", "Stair Climber", "Jump Squats",
      "Broad Jump", "Lateral Bounds", "Single Leg Hops", "Plyo Push-ups",
      "Clapping Push-ups", "Depth Jumps", "Banded Squats", "Banded Deadlifts",
      "Banded Pull-aparts", "Banded Lateral Walks", "Banded Monster Walks",
      "Overhead Squats", "Walking Lunges", "Pistol Squats", "Bulgarian Split Squats",
      "Good Mornings", "Hyperextensions", "Ab Wheel Rollouts", "Hollow Body Holds",
      "L-Sits", "Dragon Flags"
    ];

    // Find matches
    const exerciseMatches: Array<{
      name: string;
      wgerExercise?: WgerExercise;
      videos: WgerVideo[];
      matched: boolean;
    }> = [];

    for (const ourExerciseName of ourExercises) {
      const normalizedOurName = ourExerciseName.toLowerCase()
        .replace(/[-']/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      // Try to find a matching wger exercise
      let bestMatch: WgerExercise | undefined;
      let bestScore = 0;

      for (const wgerEx of exercisesData.results || []) {
        const normalizedWgerName = wgerEx.name.toLowerCase()
          .replace(/[-']/g, " ")
          .replace(/\s+/g, " ")
          .trim();

        // Calculate similarity score
        let score = 0;
        const ourWords = normalizedOurName.split(" ");
        const wgerWords = normalizedWgerName.split(" ");

        for (const ourWord of ourWords) {
          for (const wgerWord of wgerWords) {
            if (ourWord === wgerWord) {
              score += 2;
            } else if (ourWord.includes(wgerWord) || wgerWord.includes(ourWord)) {
              score += 1;
            }
          }
        }

        if (score > bestScore) {
          bestScore = score;
          bestMatch = wgerEx;
        }
      }

      const videos = bestMatch ? (videoMap.get(bestMatch.id) || []) : [];
      
      exerciseMatches.push({
        name: ourExerciseName,
        wgerExercise: bestMatch,
        videos: videos,
        matched: bestScore > 1 && videos.length > 0,
      });
    }

    // Separate matched and unmatched
    const matched = exerciseMatches.filter(e => e.matched);
    const unmatched = exerciseMatches.filter(e => !e.matched);

    console.log(`Matched ${matched.length} exercises with videos`);
    console.log(`Could not find videos for ${unmatched.length} exercises`);

    return new Response(
      JSON.stringify({
        success: true,
        matched: matched.map(e => ({
          name: e.name,
          wgerName: e.wgerExercise?.name,
          wgerId: e.wgerExercise?.id,
          videoUrl: e.videos[0]?.video,
          videoCount: e.videos.length,
        })),
        unmatched: unmatched.map(e => ({
          name: e.name,
          bestMatch: e.wgerExercise?.name,
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
    console.error("Error fetching wger exercises:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
