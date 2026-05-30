import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function log(step: string, details?: unknown) {
  const extra = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[ASSIGN-RITUAL] ${step}${extra}`);
}

function cyprusToday(): string {
  const now = new Date();
  const cyprus = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Nicosia" }));
  return cyprus.toISOString().split("T")[0];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const today = cyprusToday();
    log("Starting", { today });

    // 1. Already assigned?
    const { data: existing } = await supabase
      .from("daily_ritual_assignments")
      .select("ritual_id, cycle_number")
      .eq("ritual_date", today)
      .maybeSingle();

    if (existing) {
      log("Already assigned", existing);
      return new Response(
        JSON.stringify({ success: true, alreadyAssigned: true, ...existing }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 2. Library
    const { data: library, error: libErr } = await supabase
      .from("daily_smarty_rituals")
      .select("id");
    if (libErr) throw libErr;
    if (!library || library.length === 0) {
      throw new Error("Ritual library is empty — nothing to assign.");
    }
    const libraryIds = library.map((r) => r.id);
    log("Library size", { count: libraryIds.length });

    // 3. Determine current cycle
    const { data: latest } = await supabase
      .from("daily_ritual_assignments")
      .select("cycle_number")
      .order("cycle_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    let cycle = latest?.cycle_number ?? 1;

    // 4. Pool of ids not yet used in this cycle
    const { data: usedRows } = await supabase
      .from("daily_ritual_assignments")
      .select("ritual_id")
      .eq("cycle_number", cycle);
    const usedIds = new Set((usedRows ?? []).map((r) => r.ritual_id));
    let pool = libraryIds.filter((id) => !usedIds.has(id));

    if (pool.length === 0) {
      cycle += 1;
      pool = libraryIds;
      log("Cycle complete — starting new cycle", { cycle });
    }

    // 5. Pick random from pool
    const pickedId = pool[Math.floor(Math.random() * pool.length)];

    // 6. Insert
    const { error: insErr } = await supabase
      .from("daily_ritual_assignments")
      .insert({ ritual_date: today, ritual_id: pickedId, cycle_number: cycle });
    if (insErr) throw insErr;

    log("Assigned", { today, pickedId, cycle, poolSize: pool.length });

    return new Response(
      JSON.stringify({
        success: true,
        ritual_date: today,
        ritual_id: pickedId,
        cycle_number: cycle,
        remaining_in_cycle: pool.length - 1,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    log("ERROR", { msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});