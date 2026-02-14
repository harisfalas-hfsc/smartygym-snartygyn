import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Exercise {
  id: string;
  name: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const body = await req.json().catch(() => ({}));
    const workoutIds: string[] = body.workout_ids || [];
    const programIds: string[] = body.program_ids || [];

    // Load exercise library
    const { data: exercises, error: exErr } = await supabase
      .from("exercises")
      .select("id, name");
    if (exErr) throw exErr;

    // Build lookup maps
    const exactMap = new Map<string, Exercise>();
    const normMap = new Map<string, Exercise>();
    // Sort by name length descending for longest-match-first
    const sortedExercises = [...exercises!].sort((a, b) => b.name.length - a.name.length);
    
    for (const ex of exercises!) {
      exactMap.set(ex.name.toLowerCase().trim(), ex);
      normMap.set(norm(ex.name), ex);
    }

    const results: any[] = [];

    // Process workouts
    if (workoutIds.length > 0) {
      const { data: workouts, error: wErr } = await supabase
        .from("admin_workouts")
        .select("id, name, main_workout, finisher")
        .in("id", workoutIds);
      if (wErr) throw wErr;

      for (const w of workouts || []) {
        let changed = false;
        let newMain = w.main_workout;
        let newFinisher = w.finisher;

        if (w.main_workout) {
          const fixed = fixHtml(w.main_workout, sortedExercises, exactMap, normMap);
          if (fixed !== w.main_workout) { newMain = fixed; changed = true; }
        }
        if (w.finisher) {
          const fixed = fixHtml(w.finisher, sortedExercises, exactMap, normMap);
          if (fixed !== w.finisher) { newFinisher = fixed; changed = true; }
        }

        if (changed) {
          const { error: uErr } = await supabase
            .from("admin_workouts")
            .update({ main_workout: newMain, finisher: newFinisher })
            .eq("id", w.id);
          results.push({ id: w.id, name: w.name, status: uErr ? "error" : "updated" });
        } else {
          results.push({ id: w.id, name: w.name, status: "no_change" });
        }
      }
    }

    // Process programs
    if (programIds.length > 0) {
      const { data: programs, error: pErr } = await supabase
        .from("admin_training_programs")
        .select("id, name, program_structure, weekly_schedule")
        .in("id", programIds);
      if (pErr) throw pErr;

      for (const p of programs || []) {
        let changed = false;
        let newS = p.program_structure;
        let newW = p.weekly_schedule;

        if (p.program_structure) {
          const fixed = fixHtml(p.program_structure, sortedExercises, exactMap, normMap);
          if (fixed !== p.program_structure) { newS = fixed; changed = true; }
        }
        if (p.weekly_schedule) {
          const fixed = fixHtml(p.weekly_schedule, sortedExercises, exactMap, normMap);
          if (fixed !== p.weekly_schedule) { newW = fixed; changed = true; }
        }

        if (changed) {
          const { error: uErr } = await supabase
            .from("admin_training_programs")
            .update({ program_structure: newS, weekly_schedule: newW })
            .eq("id", p.id);
          results.push({ id: p.id, name: p.name, type: "program", status: uErr ? "error" : "updated" });
        } else {
          results.push({ id: p.id, name: p.name, type: "program", status: "no_change" });
        }
      }
    }

    const updated = results.filter(r => r.status === "updated").length;
    console.log(`[FIX] Done: ${updated} updated out of ${results.length}`);

    return new Response(JSON.stringify({ total: results.length, updated, details: results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[FIX] Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function norm(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/&[^;]+;/g, " ").trim();
}

function escRx(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function fixHtml(
  html: string,
  sortedExercises: Exercise[],
  exactMap: Map<string, Exercise>,
  normMap: Map<string, Exercise>
): string {
  if (!html) return html;

  // Clean whitespace
  let h = html.replace(/[\r\n]+/g, "").replace(/>\s+</g, "><").trim();

  // Process each <li> tag
  h = h.replace(/<li[^>]*>(.*?)<\/li>/gi, (_match, content: string) => {
    // If already fully marked up, keep it
    if (content.includes("{{exercise:")) return `<li>${content}</li>`;

    const text = stripHtml(content);
    if (!text || text.length < 3) return `<li>${content}</li>`;

    // Check for multiple exercises separated by commas
    const commaSegments = text.split(/,\s*/).filter(s => s.trim().length > 2);
    if (commaSegments.length > 1) {
      const matched = commaSegments.map(seg => matchSegment(seg.trim(), sortedExercises, exactMap, normMap));
      if (matched.filter(m => m !== null).length > 1) {
        // Split into multiple <li>
        return matched.map(m => {
          if (m) return `<li>${m.prefix}{{exercise:${m.ex.id}:${m.ex.name}}}${m.suffix}</li>`;
          return "";
        }).filter(Boolean).join("");
      }
    }

    // Single exercise line
    const m = matchSegment(text, sortedExercises, exactMap, normMap);
    if (m) {
      return `<li>${m.prefix}{{exercise:${m.ex.id}:${m.ex.name}}}${m.suffix}</li>`;
    }

    return `<li>${content}</li>`;
  });

  return h;
}

interface SegMatch {
  ex: Exercise;
  prefix: string;
  suffix: string;
}

function matchSegment(
  text: string,
  sortedExercises: Exercise[],
  exactMap: Map<string, Exercise>,
  normMap: Map<string, Exercise>
): SegMatch | null {
  // Extract prefix (reps/sets like "3 x 12" or "12")
  const prefixMatch = text.match(/^([\d]+(?:\s*[xX×]\s*\d+)?\s*(?:each\s*)?(?:reps?\s*)?(?:per\s+side\s*)?(?:sets?\s*(?:of\s*\d+\s*)?)?)/i);
  const prefix = prefixMatch ? prefixMatch[1].trim() : "";
  const exerciseText = prefix ? text.slice(prefix.length).trim() : text.trim();
  
  if (!exerciseText || exerciseText.length < 3) return null;

  // Strip trailing notes like "(each side)" or "- 30 seconds"
  const cleanEx = exerciseText.replace(/\s*[\(\-–].*/g, "").trim();
  const suffix = exerciseText.slice(cleanEx.length).trim();

  // 1. Exact match
  let ex = exactMap.get(cleanEx.toLowerCase());
  if (ex) return { ex, prefix: prefix ? prefix + " " : "", suffix: suffix ? " " + suffix : "" };

  // 2. Normalized match
  ex = normMap.get(norm(cleanEx));
  if (ex) return { ex, prefix: prefix ? prefix + " " : "", suffix: suffix ? " " + suffix : "" };

  // 3. Longest substring match (sorted by length desc)
  for (const e of sortedExercises) {
    if (e.name.length < 4) continue;
    const eName = e.name.toLowerCase();
    if (cleanEx.toLowerCase().includes(eName)) {
      return { ex: e, prefix: prefix ? prefix + " " : "", suffix: suffix ? " " + suffix : "" };
    }
  }

  // 4. Check if exercise name contains our text
  const cleanNorm = norm(cleanEx);
  if (cleanNorm.length >= 5) {
    for (const e of sortedExercises) {
      if (norm(e.name).includes(cleanNorm)) {
        return { ex: e, prefix: prefix ? prefix + " " : "", suffix: suffix ? " " + suffix : "" };
      }
    }
  }

  return null;
}
