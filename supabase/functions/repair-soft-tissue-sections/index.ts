import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireAdminOrServiceRole } from "../_shared/admin-or-service-auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Repairs the 🧽 Soft Tissue Preparation block in every visible workout so it
 * contains ONLY foam-rolling / lacrosse-ball / trigger-point release cues —
 * never library-exercise markup, never stretches or mobility drills.
 *
 * Stretches and mobility belong in 🔥 Activation or 🧘 Cool Down, not here.
 */

const SECTION_HEADERS = ["🔥", "💪", "⚡", "🧘", "🎯", "❄️", "🏋️"];

// Keywords that mark a line as a legitimate soft-tissue cue.
const VALID_KEYWORDS = [
  "foam roll",
  "foam-roll",
  "foam roller",
  "lacrosse",
  "tennis ball",
  "trigger point",
  "trigger-point",
  "self-massage",
  "self massage",
  "myofascial",
  "smr",
  "release",
];

interface CueSet {
  cues: string[];
}

function pickCues(focus: string, equipment: string, category: string): CueSet {
  const f = (focus || "").toLowerCase();
  const eq = (equipment || "").toUpperCase();
  const cat = (category || "").toUpperCase();

  const lower = /leg|glute|squat|hamstring|quad|calf|hip|lower/.test(f) ||
    /low/.test(cat);
  const upper = /upper|chest|back|push|pull|shoulder|arm|press|row/.test(f);
  const fullOrUnknown = !lower && !upper;

  const tool = eq === "BODYWEIGHT" ? "Tennis ball / self-massage" : "Foam roll";

  if (lower) {
    return {
      cues: [
        `${tool} glutes & TFL — 45 sec each side`,
        `${tool} quadriceps — 45 sec each leg`,
        `${tool} hamstrings — 30 sec each leg`,
        `${tool} calves — 30 sec each leg`,
        `Thoracic spine extensions over foam roller — 8 reps`,
      ],
    };
  }
  if (upper) {
    return {
      cues: [
        `${tool} lats — 30 sec each side`,
        `${tool} pec minor with lacrosse ball — 30 sec each side`,
        `Thoracic spine extensions over foam roller — 8–10 reps`,
        `${tool} upper traps & rhomboids — 30 sec each side`,
        `${tool} forearms — 20 sec each arm`,
      ],
    };
  }
  // full-body / unknown
  return {
    cues: [
      `${tool} glutes & TFL — 45 sec each side`,
      `${tool} quadriceps — 45 sec each leg`,
      `${tool} lats — 30 sec each side`,
      `Thoracic spine extensions over foam roller — 8–10 reps`,
      `${tool} calves — 30 sec each leg`,
    ],
  };
}

function buildSoftTissueBlock(focus: string, equipment: string, category: string): string {
  const { cues } = pickCues(focus, equipment, category);
  const header = `<p class="tiptap-paragraph">🧽 <strong><u>Soft Tissue Preparation 5'</u></strong></p>`;
  const items = cues
    .map((c) => `<li class="tiptap-list-item"><p class="tiptap-paragraph">${c}</p></li>`)
    .join("");
  return `${header}<ul class="tiptap-bullet-list">${items}</ul>`;
}

/**
 * Find soft-tissue block bounds in html: [startIdx, endIdx) where endIdx is the
 * start of the NEXT section header `<p>...emoji...` or end of string.
 */
function findSoftTissueBlock(html: string): { start: number; end: number } | null {
  const re = /<p[^>]*>\s*🧽[\s\S]*?<\/p>/;
  const m = html.match(re);
  if (!m || m.index === undefined) return null;
  const start = m.index;
  // search after the header paragraph for the next section header
  const after = m.index + m[0].length;
  let nextIdx = html.length;
  for (const icon of SECTION_HEADERS) {
    const idx = html.indexOf(icon, after);
    if (idx !== -1 && idx < nextIdx) nextIdx = idx;
  }
  // walk back to the start of the <p> that contains the next-section icon
  if (nextIdx < html.length) {
    const pStart = html.lastIndexOf("<p", nextIdx);
    if (pStart > after) nextIdx = pStart;
  }
  return { start, end: nextIdx };
}

function needsRepair(blockHtml: string): { needs: boolean; reason: string } {
  if (/\{\{exercise:/i.test(blockHtml)) return { needs: true, reason: "exercise markup" };
  // Extract just the body lines (text inside <li>/<p> after header)
  const body = blockHtml.replace(/<p[^>]*>\s*🧽[\s\S]*?<\/p>/, "");
  const text = body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
  if (!text) return { needs: true, reason: "empty" };
  const hasValid = VALID_KEYWORDS.some((kw) => text.includes(kw));
  if (!hasValid) return { needs: true, reason: "no foam-roll / ball / release keyword" };
  // Even if it has some valid lines, reject if it also contains exercise-like words
  const badWords = /\b(stretch|circle|raise|swing|lunge|pose|march|bridge|squat|press|row|curl|twist|hydrant|hip flex|cobra|cat-cow|catcow|sun salutation)\b/;
  if (badWords.test(text)) return { needs: true, reason: "contains stretch/mobility move" };
  return { needs: false, reason: "" };
}

function repairHtml(
  html: string,
  focus: string,
  equipment: string,
  category: string,
): { changed: boolean; html: string; reason: string } {
  if (!html) return { changed: false, html, reason: "no-html" };
  const bounds = findSoftTissueBlock(html);
  if (!bounds) return { changed: false, html, reason: "no-soft-tissue-block" };
  const blockHtml = html.slice(bounds.start, bounds.end);
  const check = needsRepair(blockHtml);
  if (!check.needs) return { changed: false, html, reason: "ok" };
  const newBlock = buildSoftTissueBlock(focus, equipment, category);
  const next = html.slice(0, bounds.start) + newBlock + html.slice(bounds.end);
  return { changed: true, html: next, reason: check.reason };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // SECURITY: only admins or server-to-server (service role) callers allowed
  const unauthorizedResponse = await requireAdminOrServiceRole(req, corsHeaders);
  if (unauthorizedResponse) return unauthorizedResponse;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const body = await req.json().catch(() => ({}));
    const dryRun: boolean = body.dry_run === true;
    const batchSize: number = Math.min(Number(body.batch_size) || 200, 500);
    const offset: number = Number(body.offset) || 0;

    const { data: workouts, error } = await supabase
      .from("admin_workouts")
      .select("id, name, focus, equipment, category, main_workout, warm_up")
      .neq("is_visible", false)
      .order("id")
      .range(offset, offset + batchSize - 1);
    if (error) throw error;

    const repaired: { id: string; name: string; reason: string; field: string }[] = [];
    const skipped: { id: string; name: string; reason: string }[] = [];
    const errors: { id: string; error: string }[] = [];

    for (const w of workouts || []) {
      const focus = w.focus || "";
      const equipment = w.equipment || "";
      const category = w.category || "";
      const updates: Record<string, string> = {};
      let touched = false;
      let reason = "";
      let field = "";

      for (const f of ["main_workout", "warm_up"] as const) {
        const original: string | null = (w as any)[f];
        if (!original) continue;
        const r = repairHtml(original, focus, equipment, category);
        if (r.changed) {
          updates[f] = r.html;
          touched = true;
          reason = r.reason;
          field = f;
        }
      }

      if (!touched) {
        skipped.push({ id: w.id, name: w.name, reason: "already-compliant" });
        continue;
      }

      if (dryRun) {
        repaired.push({ id: w.id, name: w.name, reason, field });
        continue;
      }

      const { error: uErr } = await supabase
        .from("admin_workouts")
        .update(updates)
        .eq("id", w.id);
      if (uErr) {
        errors.push({ id: w.id, error: uErr.message });
      } else {
        repaired.push({ id: w.id, name: w.name, reason, field });
      }
    }

    return new Response(
      JSON.stringify({
        scanned: workouts?.length || 0,
        repaired: repaired.length,
        skipped: skipped.length,
        errors: errors.length,
        dryRun,
        repaired_details: repaired,
        errors_details: errors,
        next_offset: (workouts?.length || 0) === batchSize ? offset + batchSize : null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String((err as Error).message || err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});