/**
 * WOD QUALITY GATE
 * Hard checks that prevent under-programmed or unmeasurable workouts from
 * publishing. Used by the WOD generator after section validation.
 *
 * Three rules:
 *  1. Duration minimums by difficulty (Main + Finisher minutes).
 *  2. Finisher must declare structure (rounds / sets / AMRAP cap / EMOM / Tabata).
 *  3. Every exercise token in Main + Finisher must have a measurable
 *     prescription (reps / sec / min / m / km / cal / sets x reps) BEFORE it
 *     on the same line.
 */

import { calculateWorkoutDurationMinutes } from "./duration-calculator.ts";

export interface QualityGateResult {
  ok: boolean;
  failures: string[];
  computedMinutes: number;
}

const SHORT_BRUTAL_FORMATS = ["TABATA"];

/** Minimum Main + Finisher minutes by difficulty stars and category. */
function minimumMinutes(stars: number, category: string, format: string): number {
  const cat = (category || "").toUpperCase();
  const fmt = (format || "").toUpperCase();
  if (cat === "RECOVERY") return 25;

  // Beginner
  if (stars <= 2) return 20;
  // Intermediate
  if (stars <= 4) return 28;

  // Advanced (5-6): 35 min for short brutal formats (Tabata), 38 min otherwise.
  if (SHORT_BRUTAL_FORMATS.some((f) => fmt.includes(f))) return 35;
  return 38;
}

function extractSection(html: string, startIcon: string, endIcons: string[]): string {
  const start = html.indexOf(startIcon);
  if (start === -1) return "";
  const ends = endIcons
    .map((icon) => html.indexOf(icon, start + startIcon.length))
    .filter((idx) => idx > start);
  const end = ends.length ? Math.min(...ends) : html.length;
  return html.slice(start, end);
}

/** Detect the format declared inside a section header like "Main Workout (EMOM)". */
function detectSectionFormat(section: string): string {
  const m = section.match(/\((TABATA|EMOM|AMRAP|FOR\s*TIME|CIRCUIT|REPS\s*&\s*SETS|MIX)\)/i);
  return m ? m[1].toUpperCase().replace(/\s+/g, " ") : "";
}

/** Count exercise-token lines inside a section (used for chipper/ladder detection). */
function countExerciseLines(section: string): number {
  const lis = section.split(/<li[^>]*>/i).slice(1);
  return lis.filter((s) => /\{\{exercise:/i.test(s)).length;
}

/** Extract the leading rep number of each exercise <li> for ladder/chipper detection. */
function leadingRepsPerLine(section: string): number[] {
  const lis = section.split(/<li[^>]*>/i).slice(1);
  const reps: number[] = [];
  for (const raw of lis) {
    if (!/\{\{exercise:/i.test(raw)) continue;
    const text = raw.replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").trim();
    const before = text.split(/\{\{exercise:/i)[0] || "";
    const m = before.match(/(?:^|\s)(\d+)\b/);
    if (m) reps.push(parseInt(m[1], 10));
  }
  return reps;
}

/**
 * Format-specific structural check for ONE section (Main Workout or Finisher).
 * Returns an explanatory failure string if the section is missing the
 * mandatory rounds / cap / total-minutes / chipper structure for its format.
 */
function validateSectionStructure(
  label: "Main Workout" | "Finisher",
  section: string,
): string | null {
  if (!section) return null;
  const fmt = detectSectionFormat(section);
  if (!fmt) return null; // not a protocol section
  const text = section.replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ");

  // EMOM: must declare total minutes OR have Minute labels plus a "Repeat N rounds = M minutes" line.
  if (fmt === "EMOM") {
    const explicitTotal = /\b\d+[\s-]*minute\s+EMOM\b/i.test(text);
    const hasLabels = /\bMinute\s+\d+\b/i.test(text);
    const repeatTotal = /\brepeat\s+\d+\s+rounds?\s*=\s*\d+\s*min(?:utes?)?\b/i.test(text);
    const totalEquals = /=\s*\d+\s*min(?:utes?)?\b/i.test(text);
    if (!(explicitTotal || (hasLabels && (repeatTotal || totalEquals)))) {
      return `${label} (EMOM) is missing total duration. Add either "N-minute EMOM" in the header body or a "Repeat N rounds = M minutes" line.`;
    }
    return null;
  }

  // AMRAP: must declare a time cap.
  if (fmt === "AMRAP") {
    const hasCap =
      /\b\d+[\s-]*minute\s+AMRAP\b/i.test(text) ||
      /AMRAP\s*(?:in|for)?\s*\d+\s*min(?:utes?)?\b/i.test(text) ||
      /as\s+many\s+rounds?\s+as\s+possible\s+(?:in|within|for)\s+\d+\s*min(?:utes?)?\b/i.test(text) ||
      /\b(?:cap|time\s*cap|time\s*limit)[:\s]*\d+\s*min(?:utes?)?\b/i.test(text) ||
      /\bin\s+\d+\s*min(?:utes?)?\b/i.test(text);
    if (!hasCap) {
      return `${label} (AMRAP) is missing a time cap. Add "in N minutes" or "N-minute AMRAP".`;
    }
    return null;
  }

  // FOR TIME / CIRCUIT: must declare rounds, a chipper ladder (descending reps),
  // a time cap, OR be a single very-high-volume challenge (e.g. "100 burpees for time").
  if (fmt === "FOR TIME" || fmt === "CIRCUIT") {
    const hasRounds =
      /\b(?:complete|perform|repeat|do)\s+\d+\s+rounds?\b/i.test(text) ||
      /\b\d+\s+rounds?\s+(?:for\s+time|total|of|with)\b/i.test(text) ||
      /\brounds?\s*:\s*\d+\b/i.test(text);
    const hasCap =
      /\b(?:cap|time\s*cap|time\s*limit)[:\s]*\d+\s*min(?:utes?)?\b/i.test(text) ||
      /\bwithin\s+\d+\s*min(?:utes?)?\b/i.test(text);
    const reps = leadingRepsPerLine(section);
    const isDescending = reps.length >= 3 &&
      reps.every((n, i) => i === 0 || n < reps[i - 1]);
    const isAscending = reps.length >= 3 &&
      reps.every((n, i) => i === 0 || n > reps[i - 1]);
    const isLadder = isDescending || isAscending;
    const lineCount = countExerciseLines(section);
    const singleHighVolume = lineCount === 1 && reps[0] >= 50;
    if (!(hasRounds || hasCap || isLadder || singleHighVolume)) {
      return `${label} (${fmt}) is missing rounds, time cap, or descending/ascending ladder. One round of a short rep list is not a valid ${fmt} workout.`;
    }
    return null;
  }

  // TABATA: must reference 20/10 x 8 protocol OR contain enough exercise blocks
  // to compute a real duration (every Tabata exercise = 4 minutes).
  if (fmt === "TABATA") {
    const explicit =
      /\b20\s*(?:sec|seconds?|s)\b[\s\S]{0,40}\b10\s*(?:sec|seconds?|s)\b/i.test(text) ||
      /\b8\s*(?:rounds?|x|sets?)\b/i.test(text) ||
      /\b\d+\s*(?:tabata\s*)?blocks?\b/i.test(text);
    const lineCount = countExerciseLines(section);
    if (!explicit && lineCount < 2) {
      return `${label} (TABATA) must declare the 20-sec/10-sec x 8 protocol or list multiple Tabata blocks.`;
    }
    return null;
  }

  return null;
}

function stripHtmlToLines(section: string): string[] {
  // Split by <li> boundaries → one logical exercise line per <li>.
  const liSegments = section.split(/<li[^>]*>/i).slice(1);
  return liSegments
    .map((seg) => seg.split(/<\/li>/i)[0] || "")
    .map((seg) => seg.replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

const PRESCRIPTION_RE =
  /(?:\d+\s*(?:sets?\s*x\s*)?\d*\s*(?:reps?|sec(?:onds?)?|min(?:utes?)?|m\b|km\b|cal(?:ories)?|rounds?))|^\s*\d+\s+/i;

const STRUCTURE_KEYWORD_RE =
  /\b(\d+\s*rounds?|\d+\s*sets?|amrap|emom|tabata|for\s*time|complete\s+\d+|repeat\s+\d+|\d+[\s-]*minute)\b/i;

const MINUTE_LABEL_RE = /\bMinute\s+\d+\b/i;

/** Per-line prescription check for Main + Finisher exercise lines. */
function findUnmeasurableLines(section: string): string[] {
  const offending: string[] = [];
  for (const line of stripHtmlToLines(section)) {
    if (!line.includes("{{exercise:")) continue;
    // Strip the exercise token + its tail to inspect what comes BEFORE the token.
    const beforeToken = line.split(/\{\{exercise:/i)[0] || "";
    if (PRESCRIPTION_RE.test(beforeToken) || MINUTE_LABEL_RE.test(beforeToken)) continue;
    offending.push(line.length > 120 ? line.slice(0, 117) + "…" : line);
  }
  return offending;
}

export function applyWodQualityGate(args: {
  mainWorkoutHtml: string;
  category: string;
  difficultyStars: number;
  format: string;
  isRecoveryDay: boolean;
}): QualityGateResult {
  const { mainWorkoutHtml, category, difficultyStars, format, isRecoveryDay } = args;
  const failures: string[] = [];

  const computedMinutes = calculateWorkoutDurationMinutes(mainWorkoutHtml, format);

  // Recovery days have their own programming rules — skip the quality gate.
  if (isRecoveryDay) {
    return { ok: true, failures: [], computedMinutes };
  }

  // 1) Duration minimum.
  const minMinutes = minimumMinutes(difficultyStars, category, format);
  const isRepsAndSets = /REPS/i.test(format || "") && /SETS/i.test(format || "");
  // REPS & SETS duration is intentionally not deterministic: the real work time
  // depends on load, tempo, rest, and set execution. The calculator may still
  // estimate a short finisher, so never reject strength-style WODs on partial
  // computed minutes. Prescription/section density gates below remain strict.
  if (!isRepsAndSets && computedMinutes > 0 && computedMinutes < minMinutes) {
    failures.push(
      `Main+Finisher duration ${computedMinutes} min is below the ${minMinutes} min minimum for ${category} ${difficultyStars}-star (${format}).`,
    );
  }

  // 2) Per-section STRUCTURE check (rounds / time cap / EMOM total / Tabata protocol).
  //    Catches the "For Time with 1 round of 5 exercises" anti-pattern that used
  //    to slip through the loose keyword regex below.
  const mainSection = extractSection(mainWorkoutHtml, "💪", ["⚡", "🧘"]);
  const finisherSection = extractSection(mainWorkoutHtml, "⚡", ["🧘"]);
  const mainStructureFail = validateSectionStructure("Main Workout", mainSection);
  const finStructureFail = validateSectionStructure("Finisher", finisherSection);
  if (mainStructureFail) failures.push(mainStructureFail);
  if (finStructureFail) failures.push(finStructureFail);

  // 3) Loose finisher keyword fallback (kept for non-protocol finishers).
  if (finisherSection && !detectSectionFormat(finisherSection)) {
    if (!STRUCTURE_KEYWORD_RE.test(finisherSection)) {
      failures.push(
        "Finisher is missing structural prescription (rounds / sets / AMRAP cap / EMOM / Tabata / Complete N).",
      );
    }
  }

  // 4) Per-line prescription check on Main + Finisher.
  const unmeasurableMain = findUnmeasurableLines(mainSection);
  const unmeasurableFin = findUnmeasurableLines(finisherSection);
  if (unmeasurableMain.length) {
    failures.push(
      `Main Workout has ${unmeasurableMain.length} exercise line(s) without a measurable prescription before the exercise: ${unmeasurableMain.slice(0, 2).join(" | ")}`,
    );
  }
  if (unmeasurableFin.length) {
    failures.push(
      `Finisher has ${unmeasurableFin.length} exercise line(s) without a measurable prescription before the exercise: ${unmeasurableFin.slice(0, 2).join(" | ")}`,
    );
  }

  return { ok: failures.length === 0, failures, computedMinutes };
}
