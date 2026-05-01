/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * WOD NAMING — public-name validation and cleaning.
 * Extracted verbatim from generate-workout-of-day/index.ts so every path can
 * use the same rules without duplication. Behavior unchanged.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export function hasInternalNameCode(name: string): boolean {
  const trimmed = name.trim();
  return /\d/.test(trimmed)
    || /\b\d{4}(BW|EQ|V)\b$/i.test(trimmed)
    || /\b\d{6,}\b$/.test(trimmed)
    || /\b(v\d+|#\d+)\b$/i.test(trimmed)
    || /\b(II|III|IV|V|VI|VII|VIII|IX|X)\b$/.test(trimmed);
}

export function hasAiStyleName(name: string): boolean {
  return /\b(axial|matrix|meridian|protocol|helix|arcus|synergy|conduit|integration|current|vector|quantum|algorithm|neural|system|module|phase|sequence)\b/i.test(name.trim());
}

export function cleanPublicWorkoutName(
  rawName: string,
  category: string,
  equipment: string,
  existingNames: string[],
): { name: string; changed: boolean; reason: string } {
  const normalizedExisting = new Set(existingNames.map((n) => n.trim().toLowerCase()));
  const baseName = rawName
    .replace(/\s+\d{4}(BW|EQ|V)\b$/i, "")
    .replace(/\s+\b(v\d+|#\d+|II|III|IV|V|VI|VII|VIII|IX|X)\b$/i, "")
    .replace(/\s+/g, " ")
    .trim();

  const candidateIsClean = baseName.length >= 5
    && baseName.split(/\s+/).length <= 4
    && !hasInternalNameCode(baseName)
    && !hasAiStyleName(baseName)
    && !normalizedExisting.has(baseName.toLowerCase());

  if (candidateIsClean) {
    return {
      name: baseName,
      changed: baseName !== rawName.trim(),
      reason: baseName !== rawName.trim() ? "removed internal suffix" : "clean",
    };
  }

  const categoryWord = category === "STRENGTH" ? "Strength"
    : category === "CALORIE BURNING" ? "Conditioning"
    : category === "METABOLIC" ? "Engine"
    : category === "CARDIO" ? "Cardio"
    : category === "MOBILITY & STABILITY" ? "Control"
    : category === "PILATES" ? "Pilates"
    : category === "RECOVERY" ? "Recovery"
    : category === "CHALLENGE" ? "Challenge"
    : "Training";
  const equipmentWord = equipment === "BODYWEIGHT" ? "Bodyweight"
    : equipment === "EQUIPMENT" ? "Loaded"
    : "Athletic";

  const fallbackNames = [
    `${equipmentWord} ${categoryWord} Session`,
    `${categoryWord} Tempo Circuit`,
    `Athletic ${categoryWord} Builder`,
    `${equipmentWord} Movement Flow`,
    `${categoryWord} Control Session`,
    `Precision ${categoryWord} Circuit`,
    `${equipmentWord} Performance Block`,
    `Focused ${categoryWord} Practice`,
  ];

  const fallback = fallbackNames.find((n) => !normalizedExisting.has(n.toLowerCase()))
    || `${equipmentWord} ${categoryWord} Practice`;

  return { name: fallback, changed: true, reason: "duplicate, internal-code, or AI-style name" };
}