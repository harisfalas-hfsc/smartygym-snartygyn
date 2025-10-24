import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

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
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!rapidApiKey) {
      throw new Error("RAPIDAPI_KEY is not configured");
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
      const errorText = await exercisesResponse.text();
      console.error("ExerciseDB API Error:", errorText);
      throw new Error(`Failed to fetch exercises: ${exercisesResponse.statusText} - ${errorText}`);
    }

    const exercisesData: ExerciseDBExercise[] = await exercisesResponse.json();
    console.log(`Fetched ${exercisesData.length} exercises from ExerciseDB`);

    // Clear existing exercises from database
    console.log("Clearing existing exercises from database...");
    const { error: deleteError } = await supabase
      .from("exercises")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

    if (deleteError) {
      console.error("Error clearing exercises:", deleteError);
      throw new Error(`Failed to clear exercises: ${deleteError.message}`);
    }

    // Prepare exercises for insertion (only include those with GIF URLs)
    const exercisesToInsert = exercisesData
      .filter((ex) => ex.gifUrl) // Only include exercises with GIF URLs
      .map((ex) => ({
        name: ex.name,
        video_id: ex.id,
        video_url: ex.gifUrl,
        description: ex.instructions.join("\n"),
      }));

    console.log(`Inserting ${exercisesToInsert.length} exercises into database...`);

    // Insert exercises in batches of 100 to avoid payload size limits
    const batchSize = 100;
    let insertedCount = 0;
    
    for (let i = 0; i < exercisesToInsert.length; i += batchSize) {
      const batch = exercisesToInsert.slice(i, i + batchSize);
      const { error: insertError } = await supabase
        .from("exercises")
        .insert(batch);

      if (insertError) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, insertError);
        throw new Error(`Failed to insert exercises: ${insertError.message}`);
      }
      
      insertedCount += batch.length;
      console.log(`Inserted ${insertedCount}/${exercisesToInsert.length} exercises`);
    }

    console.log(`Successfully synced ${insertedCount} exercises to database`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully synced ${insertedCount} exercises with GIF demonstrations`,
        stats: {
          total: insertedCount,
          synced: insertedCount,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error syncing ExerciseDB exercises:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
