import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function logStep(step: string, details?: any) {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[QUEUE-WOD-NOTIF-MORNING] ${step}${detailsStr}`);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting morning WOD notification queueing (07:00 Cyprus)");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Cyprus date (DST-aware)
    const now = new Date();
    const monthNum = now.getUTCMonth() + 1;
    const cyprusOffsetHrs = monthNum >= 4 && monthNum <= 10 ? 3 : 2;
    const cyprusNow = new Date(now.getTime() + cyprusOffsetHrs * 60 * 60 * 1000);
    const cyprusTodayStr = cyprusNow.toISOString().split("T")[0];

    const { data: todaysWods, error: fetchErr } = await supabase
      .from("admin_workouts")
      .select("id, name, category, equipment, is_visible")
      .eq("is_workout_of_day", true)
      .eq("generated_for_date", cyprusTodayStr)
      .eq("is_visible", true);

    if (fetchErr) {
      throw new Error(`Failed to fetch today's WODs: ${fetchErr.message}`);
    }

    if (!todaysWods || todaysWods.length === 0) {
      logStep("No active WODs for today; nothing to queue", { cyprusTodayStr });
      return new Response(
        JSON.stringify({ success: true, queued: 0, date: cyprusTodayStr }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Idempotency: skip if any of these WODs are already queued
    const ids = todaysWods.map((w) => w.id);
    const { data: alreadyQueued } = await supabase
      .from("pending_content_notifications")
      .select("content_id")
      .in("content_id", ids)
      .eq("content_type", "wod");

    const queuedSet = new Set((alreadyQueued || []).map((r: any) => r.content_id));
    const toInsert = todaysWods
      .filter((w) => !queuedSet.has(w.id))
      .map((w) => ({
        content_id: w.id,
        content_name: w.name,
        content_type: "wod",
        content_category: w.category,
      }));

    if (toInsert.length === 0) {
      logStep("All WODs already queued; nothing to do");
      return new Response(
        JSON.stringify({ success: true, queued: 0, alreadyQueued: ids.length, date: cyprusTodayStr }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const { error: insErr } = await supabase
      .from("pending_content_notifications")
      .insert(toInsert);

    if (insErr) {
      throw new Error(`Failed to queue notifications: ${insErr.message}`);
    }

    logStep("Queued today's WODs", { count: toInsert.length, date: cyprusTodayStr });
    return new Response(
      JSON.stringify({ success: true, queued: toInsert.length, date: cyprusTodayStr }),
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
