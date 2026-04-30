/**
 * Protocol block sanitizer + structural validator.
 *
 * Enforces (memory: protocol-block-formatting-standard):
 *  1. No durations after TABATA / EMOM / AMRAP / FOR TIME inside section headers.
 *  2. No stray text glued to an `{{exercise:ID:Name}}` token.
 *  3. EMOM blocks with explicit `Minute N:` labels must be sequential
 *     (1..N) with no orphan exercise after the last labelled minute.
 */

export interface ProtocolIssue {
  type:
    | "duration_in_header"
    | "stray_after_token"
    | "emom_orphan_exercise"
    | "emom_minute_gap";
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

export function sanitizeProtocolBlocks(input: string | null | undefined): ProtocolSanitizeResult {
  const original = input || "";
  const issues: ProtocolIssue[] = [];
  const fixes: string[] = [];
  const flagged: ProtocolIssue[] = [];

  let cleaned = original;
  cleaned = stripDurationFromHeaders(cleaned, issues, fixes);
  cleaned = cleanStrayAfterToken(cleaned, issues, fixes, flagged);
  detectEmomOrphans(cleaned, flagged);

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