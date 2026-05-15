// ═══════════════════════════════════════════════════════════════════════════════
// DURATION CALCULATOR
// Computes the ACTUAL duration of a workout from its rendered Main Workout +
// Finisher HTML. The advertised duration excludes Warm-up and Cool Down.
//
// Supported formats: TABATA, EMOM, AMRAP, FOR TIME, REPS & SETS, CIRCUIT, MIX.
// Returns minutes (integer) or null if it cannot be determined deterministically.
// ═══════════════════════════════════════════════════════════════════════════════

function stripTags(s: string): string {
  return s
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p\s*>/gi, "\n")
    .replace(/<li[^>]*>/gi, "\n- ")
    .replace(/<\/li\s*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+\n/g, "\n")
    .replace(/[ \t\r\f\v]+/g, " ")
    .trim();
}

function compact(s: string): string {
  return stripTags(s).replace(/\s+/g, " ").trim();
}

function sectionByEmoji(html: string, emoji: string): string {
  const text = stripTags(html);
  const escaped = emoji.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(new RegExp(`${escaped}[\\s\\S]*?(?=\\n[🧽🔥💪⚡🧘]|$)`, "u"));
  return match?.[0] || "";
}

function exerciseLines(sectionText: string): string[] {
  return sectionText
    .split("\n")
    .map((line) => line.replace(/^\s*-\s*/, "").trim())
    .filter((line) => line.includes("{{exercise:"));
}

function roundCount(text: string): number {
  const source = compact(text);
  const matches = [
    ...source.matchAll(/(?:complete|perform|repeat)\s+(\d+)\s+rounds?/gi),
    ...source.matchAll(/(\d+)\s+rounds?\s+(?:for\s+time|total|with|of)/gi),
  ].map((m) => parseInt(m[1])).filter((n) => n >= 1 && n <= 12);
  return matches.length ? Math.max(...matches) : 1;
}

function averageRestSeconds(text: string): number {
  const source = compact(text);
  const range = source.match(/rest\s+(\d+)\s*[–-]\s*(\d+)\s*(?:sec|seconds?)/i);
  if (range) return (parseInt(range[1]) + parseInt(range[2])) / 2;
  const seconds = source.match(/rest\s+(\d+)\s*(?:sec|seconds?)/i);
  if (seconds) return parseInt(seconds[1]);
  const minutes = source.match(/rest\s+(\d+)\s*(?:min|minutes?)/i);
  if (minutes) return parseInt(minutes[1]) * 60;
  return roundCount(text) > 1 ? 30 : 0;
}

function lineWorkSeconds(line: string): number {
  const source = compact(line);
  const seconds = source.match(/(?:hold\s+for\s+|for\s+)?(\d+)\s*(?:sec|seconds?)\b/i);
  if (seconds) return parseInt(seconds[1]);

  const minutes = source.match(/(\d+)\s*(?:min|minutes?)\b/i);
  if (minutes && !/rounds?|rest/i.test(source)) return parseInt(minutes[1]) * 60;

  const meters = source.match(/(\d+)\s*m\b/i);
  if (meters) return Math.max(20, parseInt(meters[1]) * 0.45);

  const setsReps = source.match(/(\d+)\s*(?:x|sets?\s*(?:of)?)\s*(\d+)/i);
  if (setsReps) return parseInt(setsReps[1]) * parseInt(setsReps[2]) * 3;

  const reps = source.match(/^(\d+)\b/) || source.match(/(\d+)\s*reps?\b/i);
  if (reps) {
    const multiplier = /per\s+side|each\s+side|each\s+arm|each\s+leg|one\s+arm|single\s+arm|one\s+leg|single\s+leg/i.test(source) ? 2 : 1;
    let secondsPerRep = 3;
    if (/squat|deadlift|press|row|lunge|pull|chin|curl|extension/i.test(source)) secondsPerRep = 4;
    if (/climber|jumping jack|high knees|butt kicks/i.test(source)) secondsPerRep = 2;
    return parseInt(reps[1]) * multiplier * secondsPerRep;
  }

  return 30;
}

/** Count Tabata blocks: each prescribed Tabata exercise is 8 × 20:10 = 4 min. */
export function countTabataBlocks(html: string): number {
  return exerciseLines(stripTags(html)).length;
}

/** EMOM: count distinct "Minute N:" labels and any repeat multiplier. */
export function calcEmomMinutes(html: string): number {
  const text = compact(html);
  const labels = [...text.matchAll(/Minute\s+(\d+)/gi)].map((m) => parseInt(m[1]));
  const explicit = text.match(/(\d+)[\s-]*minute\s+EMOM/i);
  const labelled = labels.length ? Math.max(...labels) * roundCount(text) : 0;
  return Math.max(labelled, explicit ? parseInt(explicit[1]) : 0);
}

/** AMRAP / FOR TIME: trust an explicit cap when present. */
export function calcCappedMinutes(html: string): number {
  const text = compact(html);
  const m =
    text.match(/(\d+)[\s-]*minute\s+(?:AMRAP|cap|time\s*cap|time\s*limit)/i) ||
    text.match(/AMRAP\s*(?:in|for)?\s*(\d+)\s*min/i) ||
    text.match(/time\s*cap[:\s]*(\d+)\s*min/i) ||
    text.match(/cap[:\s]*(\d+)\s*min/i) ||
    text.match(/(?:in|within)\s+(\d+)\s*(?:minutes?|min)\b/i);
  return m ? parseInt(m[1]) : 0;
}

/** CIRCUIT / FOR TIME fallback: estimate from exercises, reps, rounds, transitions, and rest. */
export function estimateRepsSetsMinutes(html: string): number {
  const text = stripTags(html);
  const lines = exerciseLines(text);
  if (!lines.length) return 0;
  const rounds = roundCount(text);
  const workSeconds = lines.reduce((sum, line) => sum + lineWorkSeconds(line), 0);
  const transitions = Math.max(0, lines.length - 1) * 10;
  const restSeconds = averageRestSeconds(text) * Math.max(0, rounds - 1);
  return Math.max(1, Math.round(((workSeconds + transitions) * rounds + restSeconds) / 60));
}

/** Calculate actual minutes for ONE section given its format. Returns 0 if unknown. */
export function sectionMinutes(html: string, format: string | null | undefined): number {
  if (!html) return 0;
  const f = (format || "").toUpperCase();
  if (f.includes("TABATA")) return countTabataBlocks(html) * 4;
  if (f.includes("EMOM")) return calcEmomMinutes(html);
  if (f.includes("AMRAP")) return calcCappedMinutes(html) || estimateRepsSetsMinutes(html);
  if (f.includes("FOR TIME")) return calcCappedMinutes(html) || estimateRepsSetsMinutes(html);
  if (f.includes("REPS") && f.includes("SETS")) return 0;
  return calcCappedMinutes(html) || estimateRepsSetsMinutes(html);
}

/** Detect format from a section header like "Main Workout (TABATA)". */
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

  // REPS & SETS is load/tempo/rest dependent, so a deterministic duration is
  // not safe. Returning 0 keeps the public label as "Various" and prevents the
  // quality gate from rejecting valid strength sessions on a partial finisher
  // estimate only.
  if (/REPS/i.test(workoutFormat || "") && /SETS/i.test(workoutFormat || "")) {
    return 0;
  }

  const mainHtml = sectionByEmoji(mainAndFinisherHtml, "💪");
  const finisherHtml = sectionByEmoji(mainAndFinisherHtml, "⚡");

  const mainFmt = detectSectionFormat(mainHtml, workoutFormat);
  const finFmt = detectSectionFormat(finisherHtml, null);

  const mainMin = sectionMinutes(mainHtml, mainFmt);
  const finMin = finisherHtml ? sectionMinutes(finisherHtml, finFmt) : 0;

  return mainMin + finMin;
}

/** Format minutes as "X min", or "Various" for 0/unknown. */
export function formatDurationLabel(minutes: number): string {
  if (!minutes || minutes <= 0) return "Various";
  return `${minutes} min`;
}