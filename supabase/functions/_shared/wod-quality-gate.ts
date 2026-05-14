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
  // Only enforce when we can actually compute a duration (REPS & SETS returns 0 → skip).
  if (computedMinutes > 0 && computedMinutes < minMinutes) {
    failures.push(
      `Main+Finisher duration ${computedMinutes} min is below the ${minMinutes} min minimum for ${category} ${difficultyStars}-star (${format}).`,
    );
  }

  // 2) Finisher structure keyword.
  const finisherSection = extractSection(mainWorkoutHtml, "⚡", ["🧘"]);
  if (finisherSection) {
    if (!STRUCTURE_KEYWORD_RE.test(finisherSection)) {
      failures.push(
        "Finisher is missing structural prescription (rounds / sets / AMRAP cap / EMOM / Tabata / Complete N).",
      );
    }
  }

  // 3) Per-line prescription check on Main + Finisher.
  const mainSection = extractSection(mainWorkoutHtml, "💪", ["⚡", "🧘"]);
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
