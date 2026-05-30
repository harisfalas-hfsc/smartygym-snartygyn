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

function addDaysISO(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split("T")[0];
}

const WINDOW_DAYS = 7; // today + next 7

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Parse optional body
    let body: any = {};
    if (req.method === "POST") {
      try { body = await req.json(); } catch { body = {}; }
    }
    const action: "topup" | "reroll" | "swap" = body?.action || "topup";
    const today = cyprusToday();
    log("Starting", { action, today, body });

    // Load library once
    const { data: library, error: libErr } = await supabase
      .from("daily_smarty_rituals")
      .select("id");
    if (libErr) throw libErr;
    if (!library || library.length === 0) {
      throw new Error("Ritual library is empty — nothing to assign.");
    }
    const libraryIds = library.map((r) => r.id);

    // Helper: pick a ritual for a date using cycle logic
    async function pickForDate(date: string, excludeRitualId?: string) {
      // Determine latest cycle from all assignments
      const { data: latest } = await supabase
        .from("daily_ritual_assignments")
        .select("cycle_number")
        .order("cycle_number", { ascending: false })
        .limit(1)
        .maybeSingle();
      let cycle = latest?.cycle_number ?? 1;

      const { data: usedRows } = await supabase
        .from("daily_ritual_assignments")
        .select("ritual_id, ritual_date")
        .eq("cycle_number", cycle);
      const usedIds = new Set(
        (usedRows ?? [])
          .filter((r) => r.ritual_date !== date)
          .map((r) => r.ritual_id),
      );
      let pool = libraryIds.filter((id) => !usedIds.has(id) && id !== excludeRitualId);

      if (pool.length === 0) {
        cycle += 1;
        pool = libraryIds.filter((id) => id !== excludeRitualId);
      }
      const pickedId = pool[Math.floor(Math.random() * pool.length)];
      return { pickedId, cycle };
    }

    // ─── SWAP: set an explicit ritual_id for a date ───
    if (action === "swap") {
      const date = body?.date as string;
      const ritual_id = body?.ritual_id as string;
      if (!date || !ritual_id) throw new Error("swap requires { date, ritual_id }");
      if (!libraryIds.includes(ritual_id)) throw new Error("ritual_id not in library");

      // Use existing cycle for that date, or current cycle
      const { data: existing } = await supabase
        .from("daily_ritual_assignments")
        .select("cycle_number")
        .eq("ritual_date", date)
        .maybeSingle();
      const { data: latest } = await supabase
        .from("daily_ritual_assignments")
        .select("cycle_number")
        .order("cycle_number", { ascending: false })
        .limit(1)
        .maybeSingle();
      const cycle = existing?.cycle_number ?? latest?.cycle_number ?? 1;

      const { error: upErr } = await supabase
        .from("daily_ritual_assignments")
        .upsert({ ritual_date: date, ritual_id, cycle_number: cycle, assigned_at: new Date().toISOString() });
      if (upErr) throw upErr;
      log("Swapped", { date, ritual_id, cycle });
      return new Response(JSON.stringify({ success: true, action, date, ritual_id, cycle_number: cycle }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── REROLL: re-pick a random ritual for a date ───
    if (action === "reroll") {
      const date = body?.date as string;
      if (!date) throw new Error("reroll requires { date }");
      const { data: existing } = await supabase
        .from("daily_ritual_assignments")
        .select("ritual_id, cycle_number")
        .eq("ritual_date", date)
        .maybeSingle();
      const { pickedId, cycle } = await pickForDate(date, existing?.ritual_id ?? undefined);
      const { error: upErr } = await supabase
        .from("daily_ritual_assignments")
        .upsert({ ritual_date: date, ritual_id: pickedId, cycle_number: cycle, assigned_at: new Date().toISOString() });
      if (upErr) throw upErr;
      log("Rerolled", { date, pickedId, cycle });
      return new Response(JSON.stringify({ success: true, action, date, ritual_id: pickedId, cycle_number: cycle }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── TOPUP: ensure today + next WINDOW_DAYS all have assignments ───
    const results: any[] = [];
    for (let i = 0; i <= WINDOW_DAYS; i++) {
      const date = addDaysISO(today, i);
      const { data: existing } = await supabase
        .from("daily_ritual_assignments")
        .select("ritual_id, cycle_number")
        .eq("ritual_date", date)
        .maybeSingle();
      if (existing) {
        results.push({ date, skipped: true });
        continue;
      }
      const { pickedId, cycle } = await pickForDate(date);
      const { error: insErr } = await supabase
        .from("daily_ritual_assignments")
        .insert({ ritual_date: date, ritual_id: pickedId, cycle_number: cycle });
      if (insErr) {
        results.push({ date, error: insErr.message });
      } else {
        results.push({ date, ritual_id: pickedId, cycle_number: cycle });
      }
    }
    log("Topup complete", { count: results.length });
    return new Response(JSON.stringify({ success: true, action: "topup", results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    log("ERROR", { msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});