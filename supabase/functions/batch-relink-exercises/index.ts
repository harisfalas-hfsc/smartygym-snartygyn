import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOG_PREFIX = "[BATCH-RELINK]";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { batchSize = 5, offset = 0, dryRun = false, workoutIds } = await req.json().catch(() => ({}));

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch workout IDs to process
    let workouts: Array<{ id: string; name: string; equipment: string }>;

    if (workoutIds && Array.isArray(workoutIds) && workoutIds.length > 0) {
      // Process specific workouts
      const { data, error } = await supabase
        .from('admin_workouts')
        .select('id, name, equipment')
        .in('id', workoutIds);
      
      if (error) throw new Error(`Failed to fetch workouts: ${error.message}`);
      workouts = data || [];
    } else {
      // Fetch a batch of all workouts
      const { data, error } = await supabase
        .from('admin_workouts')
        .select('id, name, equipment')
        .order('created_at', { ascending: true })
        .range(offset, offset + batchSize - 1);
      
      if (error) throw new Error(`Failed to fetch workouts: ${error.message}`);
      workouts = data || [];
    }

    // Get total count
    const { count: totalCount } = await supabase
      .from('admin_workouts')
      .select('id', { count: 'exact', head: true });

    console.log(`${LOG_PREFIX} Processing batch: ${workouts.length} workouts (offset=${offset}, total=${totalCount})`);

    if (workouts.length === 0) {
      return new Response(JSON.stringify({
        message: "No more workouts to process",
        offset,
        totalCount,
        processed: 0,
        done: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Call ai-exercise-linker for this batch
    const ids = workouts.map(w => w.id);
    console.log(`${LOG_PREFIX} Calling ai-exercise-linker for ${ids.length} workouts: ${workouts.map(w => w.name).join(', ')}`);

    const linkerUrl = `${supabaseUrl}/functions/v1/ai-exercise-linker`;
    const linkerResponse = await fetch(linkerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        type: 'workout',
        ids,
        dryRun
      })
    });

    if (!linkerResponse.ok) {
      const errorText = await linkerResponse.text();
      console.error(`${LOG_PREFIX} ai-exercise-linker error: ${linkerResponse.status} ${errorText}`);
      throw new Error(`ai-exercise-linker failed: ${linkerResponse.status}`);
    }

    const linkerResult = await linkerResponse.json();
    console.log(`${LOG_PREFIX} Batch complete: ${linkerResult.totalExercisesFound} found, ${linkerResult.totalExactMatches} matched, ${linkerResult.totalReplacements} replaced, ${linkerResult.totalErrors} errors`);

    const nextOffset = offset + workouts.length;
    const done = nextOffset >= (totalCount || 0);

    return new Response(JSON.stringify({
      batchOffset: offset,
      batchSize: workouts.length,
      totalCount,
      nextOffset: done ? null : nextOffset,
      done,
      dryRun,
      linkerResult
    }, null, 2), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (e) {
    console.error(`${LOG_PREFIX} Error:`, e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
