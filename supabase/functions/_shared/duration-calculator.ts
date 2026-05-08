// ═══════════════════════════════════════════════════════════════════════════════
// DURATION CALCULATOR
// Computes the ACTUAL duration of a workout from its rendered Main Workout +
// Finisher HTML. The advertised duration excludes Warm-up and Cool Down.
//
// Supported formats: TABATA, EMOM, AMRAP, FOR TIME, REPS & SETS, CIRCUIT, MIX.
// Returns minutes (integer) or null if it cannot be determined deterministically.
// ═══════════════════════════════════════════════════════════════════════════════

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function listItems(html: string): string[] {
  return html.match(/<li[^>]*>[\s\S]*?<\/li>/gi) || [];
}

/** Count Tabata blocks: each line that prescribes "8 rounds" OR "20 sec / 10 sec rest". 4 min/block. */
export function countTabataBlocks(html: string): number {
  let n = 0;
  for (const li of listItems(html)) {
    if (!/exercise:/i.test(li)) continue;
    if (/8\s*rounds?/i.test(li)) { n++; continue; }
    if (/20\s*sec/i.test(li) && /10\s*sec/i.test(li)) { n++; continue; }
  }
  return n;
}

/** EMOM: count distinct "Minute N:" labels and any "Repeat X rounds" multiplier. */
export function calcEmomMinutes(html: string): number {
  const text = stripTags(html);
  const labels = [...text.matchAll(/Minute\s+(\d+)/gi)].map(m => parseInt(m[1]));
  if (labels.length === 0) return 0;
  const pattern = Math.max(...labels);
  const rep = text.match(/(?:repeat|complete|perform)\s+(\d+)\s+round/i);
  const rounds = rep ? parseInt(rep[1]) : 1;
  const explicit = text.match(/(\d+)[\s-]*minute\s+EMOM/i);
  const total = pattern * rounds;
  return explicit ? Math.max(total, parseInt(explicit[1])) : total;
}

/** AMRAP / FOR TIME: trust an explicit time-cap inside the section body. */
export function calcCappedMinutes(html: string): number {
  const text = stripTags(html);
  const m =
    text.match(/(\d+)[\s-]*minute\s+(?:AMRAP|cap|time\s*cap)/i) ||
    text.match(/AMRAP\s*(?:in|for)?\s*(\d+)\s*min/i) ||
    text.match(/time\s*cap[:\s]*(\d+)\s*min/i) ||
    text.match(/cap[:\s]*(\d+)\s*min/i);
  return m ? parseInt(m[1]) : 0;
}

/** REPS & SETS / CIRCUIT: estimate from sets×reps + rest. Coarse but bounded. */
export function estimateRepsSetsMinutes(html: string): number {
  const text = stripTags(html);
  // Sum "X sets" * roughly 1 minute per set (rep work + transition).
  const sets = [...text.matchAll(/(\d+)\s*(?:x|sets?)/gi)].map(m => parseInt(m[1]));
  const totalSets = sets.reduce((a, b) => a + Math.min(b, 6), 0);
  if (totalSets === 0) return 0;
  // Add rest: sum "X sec rest" / 60.
  const rests = [...text.matchAll(/(\d+)\s*sec(?:onds?)?\s*rest/gi)].map(m => parseInt(m[1]));
  const restMin = Math.round(rests.reduce((a, b) => a + b, 0) / 60);
  return totalSets + restMin;
}

/** Calculate actual minutes for ONE section given its format. Returns 0 if unknown. */
export function sectionMinutes(html: string, format: string | null | undefined): number {
  if (!html) return 0;
  const f = (format || "").toUpperCase();
  if (f.includes("TABATA")) return countTabataBlocks(html) * 4;
  if (f.includes("EMOM"))   return calcEmomMinutes(html);
  if (f.includes("AMRAP") || f.includes("FOR TIME")) return calcCappedMinutes(html);
  // REPS & SETS / CIRCUIT / MIX fallback
  return estimateRepsSetsMinutes(html);
}

/** Detect format from an HTML section header like "Main Workout (TABATA)". */
export function detectSectionFormat(sectionHtml: string, fallback?: string | null): string | null {
  const m = sectionHtml.match(/\((TABATA|EMOM|AMRAP|FOR\s*TIME|CIRCUIT|REPS\s*&\s*SETS|MIX)\)/i);
  return m ? m[1].toUpperCase() : (fallback || null);
}

/** Public API: compute total Main+Finisher minutes from raw HTML blob containing both. */
export function calculateWorkoutDurationMinutes(
  mainAndFinisherHtml: string,
  workoutFormat?: string | null,
): number {
  if (!mainAndFinisherHtml) return 0;

  // Split on the Finisher header (⚡ icon) when present.
  const finisherSplit = mainAndFinisherHtml.split(/<p[^>]*>\s*⚡/i);
  const mainHtml = finisherSplit[0] || "";
  const finisherHtml = finisherSplit.length > 1 ? "<p>⚡" + finisherSplit.slice(1).join("<p>⚡") : "";

  const mainFmt = detectSectionFormat(mainHtml, workoutFormat);
  const finFmt = detectSectionFormat(finisherHtml, workoutFormat);

  const mainMin = sectionMinutes(mainHtml, mainFmt);
  const finMin = finisherHtml ? sectionMinutes(finisherHtml, finFmt) : 0;

  return mainMin + finMin;
}

/** Format minutes as "X min", or "Various" for 0/unknown. */
export function formatDurationLabel(minutes: number): string {
  if (!minutes || minutes <= 0) return "Various";
  return `${minutes} min`;
}