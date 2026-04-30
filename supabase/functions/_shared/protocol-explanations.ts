/**
 * Canonical protocol explanations injected into the workout `instructions` field.
 *
 * Rule (memory: protocol-block-formatting-standard):
 * - Never embed durations or rep math in TABATA/EMOM/AMRAP/FOR TIME headers.
 * - The protocol explanation always lives in the Instructions field, not in the workout body.
 */

export type ProtocolKey =
  | "TABATA"
  | "EMOM"
  | "AMRAP"
  | "FOR TIME"
  | "CIRCUIT"
  | "MIX";

const PARA = (text: string) => `<p class="tiptap-paragraph">${text}</p>`;

const TABATA_BLOCK = [
  PARA(
    "<strong>Tabata protocol:</strong> each exercise is 8 rounds of 20 seconds maximum effort followed by 10 seconds rest, totalling 4 minutes per exercise. Move directly to the next exercise without extra rest. Push hard during every 20-second work interval — quality first, then intensity.",
  ),
].join("");

const EMOM_BLOCK = [
  PARA(
    "<strong>EMOM (Every Minute On the Minute):</strong> at the start of each minute, perform the prescribed reps as fast as possible with good form, then rest for the remainder of that minute. The next minute starts on the clock no matter how long you took. If a pattern repeats (for example minutes 1–5), perform that pattern, then start it again at the next round.",
  ),
].join("");

const AMRAP_BLOCK = [
  PARA(
    "<strong>AMRAP (As Many Rounds As Possible):</strong> set a clock for the prescribed total time and complete as many full rounds of the listed exercises as you can, in the order shown. Quality reps count — break form, the round does not.",
  ),
].join("");

const FOR_TIME_BLOCK = [
  PARA(
    "<strong>For Time:</strong> complete every prescribed rep of every exercise as fast as possible with clean form. Stop the clock when the last rep is finished. Pace the early rounds — finishing strong matters more than starting fast.",
  ),
].join("");

const CIRCUIT_BLOCK = [
  PARA(
    "<strong>Circuit:</strong> perform each exercise back to back with minimal rest between movements. Rest only between full rounds for the duration noted. Stay honest with reps; if you cannot maintain technique, scale the load or reps before scaling the rest.",
  ),
].join("");

const MIX_BLOCK = [
  PARA(
    "<strong>MIX format:</strong> this workout combines two or more protocols (for example EMOM into Tabata). Follow the rules of each block as written — switch protocol cleanly when you reach the next section.",
  ),
].join("");

export const PROTOCOL_EXPLANATIONS: Record<ProtocolKey, string> = {
  TABATA: TABATA_BLOCK,
  EMOM: EMOM_BLOCK,
  AMRAP: AMRAP_BLOCK,
  "FOR TIME": FOR_TIME_BLOCK,
  CIRCUIT: CIRCUIT_BLOCK,
  MIX: MIX_BLOCK,
};

/**
 * Detects which protocol blocks appear in a workout body so we can inject the
 * matching explanations even when the workout uses MIX format with sub-protocols.
 */
export function detectProtocols(body: string, format?: string | null): ProtocolKey[] {
  const found = new Set<ProtocolKey>();
  const haystack = `${body || ""} ${format || ""}`.toUpperCase();

  if (/\bTABATA\b/.test(haystack)) found.add("TABATA");
  if (/\bEMOM\b/.test(haystack)) found.add("EMOM");
  if (/\bAMRAP\b/.test(haystack)) found.add("AMRAP");
  if (/\bFOR\s*TIME\b/.test(haystack)) found.add("FOR TIME");
  if (/\bCIRCUIT\b/.test(haystack)) found.add("CIRCUIT");
  if (/\bMIX\b/.test(haystack)) found.add("MIX");

  return [...found];
}

/**
 * Returns instructions HTML with any missing protocol explanation prepended.
 * Idempotent: an explanation already present (matched by its leading bold tag)
 * is never duplicated.
 */
export function injectProtocolExplanations(
  instructionsHtml: string | null | undefined,
  body: string,
  format?: string | null,
): { html: string; injected: ProtocolKey[] } {
  const current = (instructionsHtml || "").trim();
  const protocols = detectProtocols(body, format);
  const injected: ProtocolKey[] = [];
  const blocks: string[] = [];

  for (const proto of protocols) {
    const marker = `<strong>${proto === "FOR TIME" ? "For Time" : proto.charAt(0) + proto.slice(1).toLowerCase()}`;
    // Match either exact-case or already-injected variant
    const present =
      current.includes(`<strong>${proto}`) ||
      current.toLowerCase().includes(marker.toLowerCase()) ||
      (proto === "EMOM" && current.includes("Every Minute On the Minute")) ||
      (proto === "AMRAP" && current.includes("As Many Rounds As Possible")) ||
      (proto === "TABATA" && current.toLowerCase().includes("tabata protocol"));

    if (!present) {
      blocks.push(PROTOCOL_EXPLANATIONS[proto]);
      injected.push(proto);
    }
  }

  if (blocks.length === 0) {
    return { html: current, injected };
  }

  const merged = `${blocks.join("")}${current}`;
  return { html: merged, injected };
}