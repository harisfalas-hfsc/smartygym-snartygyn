/**
 * GENERATED WORKOUT CONTRACT
 * Hard validator that runs AFTER all matching/sweep/rejection passes and
 * BEFORE a generated workout draft is delivered to the admin or saved to
 * `admin_workouts`. Failing this contract means the draft is broken — do
 * not deliver it, do not save it, force a regenerate.
 *
 * Sections validated (non-micro, non-recovery):
 *   🧽 Soft Tissue Preparation — foam/ball/release only, no tokens, no exercises
 *   🔥 Activation              — every exercise line must be a real library token
 *   💪 Main Workout            — every exercise line must be a real library token + prescription before
 *   ⚡ Finisher                — every exercise line must be a real library token + prescription before
 *   🧘 Cool Down               — every exercise line must be a real library token (or plain breathing/stretch cue)
 *
 * All tokens must:
 *   - Use the literal `{{exercise:ID:Name}}` shape
 *   - Carry a numeric ID that exists in the live exercise library
 *   - Carry the actual library Name for that ID (no renamed/invented names)
 */

export interface ContractExercise { id: string; name: string }

export interface ContractOptions {
  isMicro?: boolean;
  isRecovery?: boolean;
  /** Sections we require exercise prescriptions to come BEFORE the token. */
  enforcePrescription?: boolean;
}

export interface ContractResult {
  ok: boolean;
  failures: string[];
}

const ICONS = {
  SOFT_TISSUE: "🧽",
  ACTIVATION: "🔥",
  MAIN: "💪",
  FINISHER: "⚡",
  COOL_DOWN: "🧘",
} as const;

const ALL_ICONS = [ICONS.SOFT_TISSUE, ICONS.ACTIVATION, ICONS.MAIN, ICONS.FINISHER, ICONS.COOL_DOWN];

const TOKEN_RE = /\{\{exercise:([^:}]+):([^}]+)\}\}/gi;

// Library IDs in this codebase are short alphanumeric strings (e.g. "0043",
// "1759", "3637"). Any token whose ID contains a dash or a lowercase letter
// run that looks like a slug ("bird-dog", "glute-bridge") is rejected as fake.
const FAKE_ID_RE = /[a-z]+-[a-z]+|^[a-z]+$/i;

// Soft-tissue acceptable cue keywords.
const SOFT_TISSUE_KEYWORDS = [
  "foam roll", "foam-roll", "foam roller",
  "lacrosse", "tennis ball", "trigger point", "trigger-point",
  "self-massage", "self massage", "myofascial", "release",
];

// Words that mean the line is actually an exercise / stretch / mobility drill,
// which do NOT belong in 🧽 Soft Tissue Preparation.
const SOFT_TISSUE_FORBIDDEN_RE =
  /\b(stretch|circle|raise|swing|lunge|pose|march|bridge|squat|press|row|curl|twist|hydrant|cobra|cat-cow|catcow|sun salutation|push-?up|pull-?up|sit-?up|crunch|burpee|jump|jack|climb|plank|deadlift|clean|snatch|jerk|thruster|kick)\b/i;

function sectionSlice(html: string, startIcon: string): string {
  const start = html.indexOf(startIcon);
  if (start === -1) return "";
  let end = html.length;
  for (const icon of ALL_ICONS) {
    if (icon === startIcon) continue;
    const idx = html.indexOf(icon, start + startIcon.length);
    if (idx > start && idx < end) end = idx;
  }
  return html.slice(start, end);
}

function liLines(section: string): string[] {
  return section
    .split(/<li[^>]*>/i)
    .slice(1)
    .map((seg) => (seg.split(/<\/li>/i)[0] || ""));
}

function liVisibleText(li: string): string {
  return li.replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim();
}

function looksLikeExerciseLine(text: string): boolean {
  if (!text) return false;
  // Skip pure rest/structural lines
  if (/^(rest|repeat|complete|perform all|focus on|record|note|tip\b|quality|warm[-\s]?up|cool[-\s]?down)/i.test(text)) return false;
  // Skip soft-tissue style lines that may have leaked
  if (SOFT_TISSUE_KEYWORDS.some((k) => text.toLowerCase().includes(k))) return false;
  // Skip pure breathing/stretch cues that are intentionally token-less in Cool Down
  if (/^\d+\s*(?:sec|seconds?|min|minutes?)\s+(?:box breathing|diaphragmatic|nasal|inhale|exhale|breathing)/i.test(text)) return false;
  // Otherwise treat any non-trivial bullet as an exercise line
  return text.length >= 3;
}

function hasPrescriptionBeforeToken(line: string): boolean {
  const tokenIdx = line.search(/\{\{exercise:[^}]+\}\}/i);
  if (tokenIdx < 0) return false;
  const before = line.slice(0, tokenIdx).trim();
  return /(?:\d+(?:\.\d+)?(?:\s*-\s*\d+(?:\.\d+)?)?\s*(?:reps?|sec(?:onds?)?|s\b|min(?:utes?)?|m\b|meters?|metres?|km\b|cal(?:ories)?|rounds?)\b|\d+\s*(?:sets?\s*)?(?:x|×)\s*\d+|minute\s+\d+)/i.test(before);
}

function validateTokensInSection(
  sectionHtml: string,
  sectionLabel: string,
  library: ContractExercise[],
  failures: string[],
): void {
  if (!sectionHtml) return;
  const libById = new Map(library.map((e) => [e.id, e]));
  let m: RegExpExecArray | null;
  TOKEN_RE.lastIndex = 0;
  while ((m = TOKEN_RE.exec(sectionHtml)) !== null) {
    const id = m[1].trim();
    const name = m[2].trim();
    const lib = libById.get(id);
    if (!lib) {
      if (FAKE_ID_RE.test(id) || !/^[A-Za-z0-9_]+$/.test(id)) {
        failures.push(`${sectionLabel}: fake/slug exercise ID "${id}" for "${name}" — not a real library ID`);
        continue;
      }
      failures.push(`${sectionLabel}: exercise ID "${id}" ("${name}") does not exist in the library`);
      continue;
    }
    if (lib.name.toLowerCase().trim() !== name.toLowerCase().trim()) {
      failures.push(`${sectionLabel}: token name "${name}" does not match library name "${lib.name}" for ID ${id}`);
    }
  }
}

function validateSoftTissue(html: string, failures: string[]): void {
  const block = sectionSlice(html, ICONS.SOFT_TISSUE);
  if (!block) {
    failures.push("Soft Tissue Preparation (🧽) section is missing");
    return;
  }
  if (/\{\{exercise:/i.test(block)) {
    failures.push("Soft Tissue Preparation (🧽) contains library exercise tokens — must be foam/ball/release only");
  }
  const body = block.replace(/<p[^>]*>\s*🧽[\s\S]*?<\/p>/i, "");
  const lines = liLines(body).map(liVisibleText).filter(Boolean);
  if (lines.length === 0) {
    failures.push("Soft Tissue Preparation (🧽) has no cues");
    return;
  }
  for (const line of lines) {
    const lower = line.toLowerCase();
    const hasCue = SOFT_TISSUE_KEYWORDS.some((k) => lower.includes(k));
    if (!hasCue) {
      failures.push(`Soft Tissue (🧽) line is missing a foam/ball/release cue: "${line.slice(0, 120)}"`);
    }
    if (SOFT_TISSUE_FORBIDDEN_RE.test(line)) {
      failures.push(`Soft Tissue (🧽) line contains an exercise/stretch movement instead of release work: "${line.slice(0, 120)}"`);
    }
  }
}

function validateExerciseSection(
  html: string,
  icon: string,
  label: string,
  library: ContractExercise[],
  failures: string[],
  enforcePrescription: boolean,
  required: boolean,
): void {
  const block = sectionSlice(html, icon);
  if (!block) {
    if (required) failures.push(`${label} (${icon}) section is missing`);
    return;
  }
  validateTokensInSection(block, label, library, failures);

  const lines = liLines(block);
  for (const liHtml of lines) {
    const text = liVisibleText(liHtml);
    if (!looksLikeExerciseLine(text)) continue;
    const hasToken = /\{\{exercise:[^}]+\}\}/i.test(liHtml);
    if (!hasToken) {
      failures.push(`${label} (${icon}): plain exercise line without a library link: "${text.slice(0, 120)}"`);
      continue;
    }
    if (enforcePrescription && !hasPrescriptionBeforeToken(text)) {
      failures.push(`${label} (${icon}): exercise line is missing reps/time/sets before the token: "${text.slice(0, 120)}"`);
    }
  }
}

export function validateGeneratedWorkoutContract(
  html: string,
  library: ContractExercise[],
  opts: ContractOptions = {},
): ContractResult {
  const failures: string[] = [];
  if (!html || html.trim().length === 0) {
    return { ok: false, failures: ["main_workout content is empty"] };
  }

  const { isMicro = false, isRecovery = false } = opts;

  if (isMicro) {
    // Micro workouts: only 🔥 / 💪 / 🧘 are required, no soft tissue, no finisher.
    validateExerciseSection(html, ICONS.ACTIVATION, "Activation", library, failures, false, true);
    validateExerciseSection(html, ICONS.MAIN, "Main Workout", library, failures, true, true);
    validateExerciseSection(html, ICONS.COOL_DOWN, "Cool Down", library, failures, false, true);
    return { ok: failures.length === 0, failures };
  }

  validateSoftTissue(html, failures);
  validateExerciseSection(html, ICONS.ACTIVATION, "Activation", library, failures, false, true);
  validateExerciseSection(html, ICONS.MAIN, "Main Workout", library, failures, true, true);
  if (!isRecovery) {
    validateExerciseSection(html, ICONS.FINISHER, "Finisher", library, failures, true, true);
  }
  validateExerciseSection(html, ICONS.COOL_DOWN, "Cool Down", library, failures, false, true);

  return { ok: failures.length === 0, failures };
}