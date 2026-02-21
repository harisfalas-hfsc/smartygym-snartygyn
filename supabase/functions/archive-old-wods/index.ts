import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function logStep(step: string, details?: any) {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ARCHIVE-OLD-WODS] ${step}${detailsStr}`);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting WOD archival process at 00:00 UTC");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current UTC date for logging
    const now = new Date();
    const utcDateStr = now.toISOString().split('T')[0];
    
    logStep("Date context", { 
      utcNow: now.toISOString(), 
      utcDateStr
    });

    // Find ALL active WODs (regardless of date) - they all need to be archived
    // This runs at 00:00 UTC, so any WOD still marked as is_workout_of_day should be archived
    const { data: wodsToArchive, error: fetchError } = await supabase
      .from("admin_workouts")
      .select("*")
      .eq("is_workout_of_day", true);

    if (fetchError) {
      throw new Error(`Failed to fetch WODs: ${fetchError.message}`);
    }

    if (!wodsToArchive || wodsToArchive.length === 0) {
      logStep("No WODs to archive");
      return new Response(
        JSON.stringify({ success: true, archived: 0, message: "No WODs to archive" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    logStep(`Found ${wodsToArchive.length} WODs to archive`);

    let archivedCount = 0;
    const archivedWods: string[] = [];

    for (const wod of wodsToArchive) {
      logStep("Archiving WOD", { id: wod.id, name: wod.name, category: wod.category, generated_for_date: wod.generated_for_date, wod_source: wod.wod_source });

      // Library-selected WODs: just clear the WOD flags, no serial number changes
      if (wod.wod_source === 'library') {
        const { error: clearError } = await supabase
          .from("admin_workouts")
          .update({
            is_workout_of_day: false,
            generated_for_date: null,
            wod_source: null,
            updated_at: new Date().toISOString()
          })
          .eq("id", wod.id);

        if (clearError) {
          logStep("Error clearing library WOD flags", { id: wod.id, error: clearError.message });
        } else {
          archivedCount++;
          archivedWods.push(`${wod.name} (${wod.category}) [library-cleared]`);
          logStep("Library WOD flags cleared", { id: wod.id, name: wod.name });
        }
        continue;
      }

      // AI-generated WODs: normal archival with serial number assignment
      // Get the next serial number for this category using persistent counter
      const { data: counterSettings, error: counterError } = await supabase
        .from("system_settings")
        .select("setting_value")
        .eq("setting_key", "serial_number_counters")
        .single();

      let nextSerialNumber = 1;

      if (!counterError && counterSettings) {
        const counters = counterSettings.setting_value as { workouts?: Record<string, number>, programs?: Record<string, number> } || { workouts: {} };
        nextSerialNumber = counters.workouts?.[wod.category] || 1;

        // Increment counter for next use
        counters.workouts = counters.workouts || {};
        counters.workouts[wod.category] = nextSerialNumber + 1;

        await supabase
          .from("system_settings")
          .update({ setting_value: counters, updated_at: new Date().toISOString() })
          .eq("setting_key", "serial_number_counters");

        logStep("Counter incremented", { category: wod.category, nextSerial: nextSerialNumber + 1 });
      } else {
        // Fallback to counting existing workouts
        const { data: existingWorkouts } = await supabase
          .from("admin_workouts")
          .select("serial_number")
          .eq("category", wod.category)
          .eq("is_workout_of_day", false)
          .order("serial_number", { ascending: false })
          .limit(1);

        nextSerialNumber = (existingWorkouts?.[0]?.serial_number || 0) + 1;
      }

      // Update the WOD to archive it
      const { error: updateError } = await supabase
        .from("admin_workouts")
        .update({
          is_workout_of_day: false,
          serial_number: nextSerialNumber,
          generated_for_date: null,
          updated_at: new Date().toISOString()
        })
        .eq("id", wod.id);

      if (updateError) {
        logStep("Error archiving WOD", { id: wod.id, error: updateError.message });
      } else {
        archivedCount++;
        archivedWods.push(`${wod.name} (${wod.category})`);
        logStep("WOD archived successfully", { id: wod.id, newSerialNumber: nextSerialNumber });
      }
    }

    logStep(`Archival complete: ${archivedCount} WODs archived`);

    return new Response(
      JSON.stringify({
        success: true,
        archived: archivedCount,
        wods: archivedWods
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logStep("ERROR", { message: errorMessage });

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
