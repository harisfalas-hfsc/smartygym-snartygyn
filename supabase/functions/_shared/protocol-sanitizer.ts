/**
 * Protocol block sanitizer + structural validator.
 *
 * Enforces (memory: protocol-block-formatting-standard):
 *  1. No durations after TABATA / EMOM / AMRAP / FOR TIME inside section headers.
 *  2. No stray text glued to an `{{exercise:ID:Name}}` token.
 *  3. EMOM blocks with explicit `Minute N:` labels must be sequential
 *     (1..N) with no orphan exercise after the last labelled minute.
 *  4. No naked exercise prescriptions in Main Workout / Finisher protocol blocks.
 */

export interface ProtocolIssue {
  type:
    | "duration_in_header"
    | "stray_after_token"
    | "emom_orphan_exercise"
    | "emom_minute_gap"
    | "naked_exercise_prescription";
  detail: string;
  snippet?: string;
}

export interface ProtocolSanitizeResult {
  cleaned: string;
  bugsFound: ProtocolIssue[];
  fixesApplied: string[];
  flaggedForReview: ProtocolIssue[];
}

const HEADER_PROTOCOLS = ["TABATA", "EMOM", "AMRAP", "FOR\\s*TIME"];

/**
 * Strips trailing duration tokens after a protocol keyword inside section headers.
 * Examples cleaned:
 *   "Main Workout (TABATA 24')"    -> "Main Workout (TABATA)"
 *   "Finisher (15-minute EMOM)"    -> "Finisher (EMOM)"
 *   "Finisher (EMOM 10')"          -> "Finisher (EMOM)"
 *   "Main Workout (AMRAP 12 min)"  -> "Main Workout (AMRAP)"
 */
function stripDurationFromHeaders(html: string, issues: ProtocolIssue[], fixes: string[]): string {
  let out = html;

  // Pattern A: PROTOCOL <number>['" min minutes]
  const trailingDuration = new RegExp(
    `\\b(${HEADER_PROTOCOLS.join("|")})\\s*[-–]?\\s*\\d+\\s*('|\\\"|min(?:ute)?s?)?`,
    "gi",
  );

  // Pattern B: <number>['" min minutes][-]PROTOCOL  (e.g. "15-minute EMOM")
  const leadingDuration = new RegExp(
    `\\b\\d+\\s*('|\\\"|-?\\s*min(?:ute)?s?)\\s*[-–]?\\s*(${HEADER_PROTOCOLS.join("|")})\\b`,
    "gi",
  );

  out = out.replace(trailingDuration, (match, proto) => {
    issues.push({ type: "duration_in_header", detail: match, snippet: match });
    fixes.push(`Removed duration from "${match}" → "${proto.toUpperCase()}"`);
    return proto.toUpperCase();
  });

  out = out.replace(leadingDuration, (match, _suffix, proto) => {
    issues.push({ type: "duration_in_header", detail: match, snippet: match });
    fixes.push(`Removed duration from "${match}" → "${proto.toUpperCase()}"`);
    return proto.toUpperCase();
  });

  return out;
}

/**
 * Removes pure-noise stray text that follows directly after `}}` of an exercise token.
 * Auto-removes obvious noise like "}}20 sec interval)", "}} - 30 seconds".
 * Flags ambiguous continuations (like "}} (left side)") for human review WITHOUT modifying.
 */
function cleanStrayAfterToken(
  html: string,
  issues: ProtocolIssue[],
  fixes: string[],
  flagged: ProtocolIssue[],
): string {
  // Match tokens followed immediately by characters that aren't whitespace/HTML
  // Capture up to the next HTML tag or end of paragraph.
  const pattern = /(\}\})([^<\n]+?)(?=<|$)/g;

  return html.replace(pattern, (match, closing, trailing) => {
    const trimmed = trailing.trim();
    if (trimmed.length === 0) return match; // pure whitespace, fine

    // Heuristic: if it starts with a digit, "sec", "interval", or an orphan ")",
    // treat as auto-removable noise.
    const noisePattern = /^(\d|\)|sec\b|interval\b|-?\s*\d+\s*sec|,\s*and\s)/i;
    if (noisePattern.test(trimmed)) {
      issues.push({
        type: "stray_after_token",
        detail: trimmed,
        snippet: `}}${trimmed}`,
      });
      fixes.push(`Removed stray noise after exercise token: "${trimmed.slice(0, 60)}"`);
      return closing; // drop the trailing junk
    }

    // Anything else: flag, keep as-is for human review.
    flagged.push({
      type: "stray_after_token",
      detail: trimmed.slice(0, 120),
      snippet: `}}${trimmed.slice(0, 120)}`,
    });
    return match;
  });
}

/**
 * Detects EMOM finisher/main blocks that mix `Minute N:` labels with orphan exercises
 * that have no minute label after the last labelled minute.
 * We FLAG these (not auto-fix) because the correct rep scheme is editorial.
 */
function detectEmomOrphans(html: string, flagged: ProtocolIssue[]) {
  // For each <ul>...</ul> block that contains "Minute" labels, check the last <li>
  const ulPattern = /<ul[^>]*>([\s\S]*?)<\/ul>/g;
  let ulMatch: RegExpExecArray | null;

  while ((ulMatch = ulPattern.exec(html)) !== null) {
    const block = ulMatch[1];
    if (!/<strong>Minute\s+\d+/i.test(block)) continue;

    const items = block.match(/<li[^>]*>[\s\S]*?<\/li>/g) || [];
    if (items.length === 0) continue;

    const minuteNumbers: number[] = [];
    items.forEach((li) => {
      const m = li.match(/<strong>Minute\s+(\d+)/i);
      if (m) minuteNumbers.push(parseInt(m[1], 10));
    });

    // Orphan: more list items than minute labels
    if (minuteNumbers.length > 0 && minuteNumbers.length < items.length) {
      flagged.push({
        type: "emom_orphan_exercise",
        detail: `EMOM block has ${items.length} bullets but only ${minuteNumbers.length} minute labels`,
      });
    }

    // Gap: minute labels not sequential
    const sorted = [...minuteNumbers].sort((a, b) => a - b);
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i] !== i + 1) {
        flagged.push({
          type: "emom_minute_gap",
          detail: `EMOM minutes are not sequential: [${sorted.join(", ")}]`,
        });
        break;
      }
    }
  }
}

function stripTags(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

function getMainAndFinisherItems(html: string): Array<{ section: string; format: string; text: string }> {
  const items: Array<{ section: string; format: string; text: string }> = [];
  const sectionPattern = /<p[^>]*>\s*(💪|⚡)\s*<strong><u>\s*([^<]+?)\s*<\/u><\/strong>\s*<\/p>([\s\S]*?)(?=<p[^>]*>\s*(?:🧘|⚡|💪|🔥|🧽)|$)/gi;
  let sectionMatch: RegExpExecArray | null;

  while ((sectionMatch = sectionPattern.exec(html)) !== null) {
    const sectionTitle = stripTags(sectionMatch[2] || "");
    const body = sectionMatch[3] || "";
    const formatMatch = sectionTitle.match(/\(([^)]+)\)/);
    const format = (formatMatch?.[1] || sectionTitle).toUpperCase();
    const liPattern = /<li[^>]*>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>[\s\S]*?<\/li>/gi;
    let liMatch: RegExpExecArray | null;
    while ((liMatch = liPattern.exec(body)) !== null) {
      const raw = liMatch[1] || "";
      if (/\{\{exercise:[^}]+\}\}/i.test(raw)) {
        items.push({ section: sectionTitle, format, text: stripTags(raw) });
      }
    }
  }

  return items;
}

function hasClearPrescriptionBeforeExercise(text: string, format: string): boolean {
  // Tabata timing is the protocol itself: 20s work / 10s rest x 8 rounds per exercise.
  if (/TABATA/i.test(format)) return true;

  const tokenIndex = text.search(/\{\{exercise:[^}]+\}\}/i);
  if (tokenIndex < 0) return true;
  const before = text.slice(0, tokenIndex).trim();

  // Accept explicit reps, time, distance, calories, rounds, sets, or labelled EMOM minutes
  // only when they appear before the exercise token.
  return /(?:^|\b)(?:minute\s+\d+\s*:)?\s*(?:\d+(?:\.\d+)?(?:\s*-\s*\d+(?:\.\d+)?)?\s*(?:reps?|sec(?:onds?)?|s\b|min(?:utes?)?|m\b|meters?|metres?|km\b|kilometers?|kilometres?|mi\b|miles?|cal(?:ories)?|kcal|rounds?|sets?)\b|\d+\s*(?:x|×)\s*\d+|amrap\s+\d+)/i.test(before);
}

function detectNakedExercisePrescriptions(html: string, flagged: ProtocolIssue[]) {
  for (const item of getMainAndFinisherItems(html)) {
    if (!hasClearPrescriptionBeforeExercise(item.text, item.format)) {
      flagged.push({
        type: "naked_exercise_prescription",
        detail: `${item.section}: exercise token has no reps, time, distance, calories, or sets before it`,
        snippet: item.text.slice(0, 180),
      });
    }
  }
}

export function sanitizeProtocolBlocks(input: string | null | undefined): ProtocolSanitizeResult {
  const original = input || "";
  const issues: ProtocolIssue[] = [];
  const fixes: string[] = [];
  const flagged: ProtocolIssue[] = [];

  let cleaned = original;
  cleaned = stripDurationFromHeaders(cleaned, issues, fixes);
  cleaned = cleanStrayAfterToken(cleaned, issues, fixes, flagged);
  detectEmomOrphans(cleaned, flagged);
  detectNakedExercisePrescriptions(cleaned, flagged);

  return {
    cleaned,
    bugsFound: issues,
    fixesApplied: fixes,
    flaggedForReview: flagged,
  };
}

/**
 * Hard validator used by the live WOD generator: returns an array of blocking
 * issues that should trigger a regeneration.
 */
export function validateProtocolBlocks(html: string): string[] {
  const issues: string[] = [];

  if (
    new RegExp(`\\b(${HEADER_PROTOCOLS.join("|")})\\s*\\d`, "i").test(html) ||
    /\b\d+\s*-?\s*minute\s+(EMOM|TABATA|AMRAP)/i.test(html)
  ) {
    issues.push("Header contains duration after a protocol keyword (TABATA/EMOM/AMRAP/FOR TIME)");
  }

  if (/\}\}[^\s<]/.test(html)) {
    issues.push("Stray text glued to an exercise token (no whitespace between `}}` and following text)");
  }

  const nakedItems: ProtocolIssue[] = [];
  detectNakedExercisePrescriptions(html, nakedItems);
  for (const item of nakedItems) {
    issues.push(`Naked exercise prescription: ${item.detail}${item.snippet ? ` [${item.snippet}]` : ""}`);
  }

  // EMOM orphan check (blocking)
  const ulPattern = /<ul[^>]*>([\s\S]*?)<\/ul>/g;
  let ulMatch: RegExpExecArray | null;
  while ((ulMatch = ulPattern.exec(html)) !== null) {
    const block = ulMatch[1];
    if (!/<strong>Minute\s+\d+/i.test(block)) continue;
    const items = block.match(/<li[^>]*>[\s\S]*?<\/li>/g) || [];
    const labels = items.filter((li) => /<strong>Minute\s+\d+/i.test(li)).length;
    if (labels > 0 && labels < items.length) {
      issues.push(`EMOM block has ${items.length} bullets but only ${labels} labelled minutes (orphan exercise)`);
      break;
    }
  }

  return issues;
}