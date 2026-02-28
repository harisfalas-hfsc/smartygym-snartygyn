/**
 * WOD Section Completeness Validator
 * 
 * Ensures every generated WOD has all required section icons before saving.
 * Non-recovery WODs: 🧽 🔥 💪 ⚡ 🧘 (5 sections)
 * Recovery WODs: 🧽 🔥 💪 🧘 (4 sections, no finisher required)
 */

const SECTION_ICONS = {
  SOFT_TISSUE: "🧽",
  ACTIVATION: "🔥",
  MAIN_WORKOUT: "💪",
  FINISHER: "⚡",
  COOL_DOWN: "🧘",
} as const;

const NON_RECOVERY_REQUIRED = [
  SECTION_ICONS.SOFT_TISSUE,
  SECTION_ICONS.ACTIVATION,
  SECTION_ICONS.MAIN_WORKOUT,
  SECTION_ICONS.FINISHER,
  SECTION_ICONS.COOL_DOWN,
];

const RECOVERY_REQUIRED = [
  SECTION_ICONS.SOFT_TISSUE,
  SECTION_ICONS.ACTIVATION,
  SECTION_ICONS.MAIN_WORKOUT,
  SECTION_ICONS.COOL_DOWN,
];

const ICON_LABELS: Record<string, string> = {
  "🧽": "Soft Tissue Preparation",
  "🔥": "Activation",
  "💪": "Main Workout",
  "⚡": "Finisher",
  "🧘": "Cool Down",
};

export interface SectionValidationResult {
  isComplete: boolean;
  missingSections: string[];
  missingIcons: string[];
  foundIcons: string[];
}

/**
 * Validates that a main_workout HTML string contains all required section icons.
 * 
 * @param mainWorkoutHtml - The main_workout field HTML content
 * @param isRecovery - Whether this is a recovery day WOD (no finisher required)
 * @returns Validation result with missing section details
 */
export function validateWodSections(
  mainWorkoutHtml: string | null | undefined,
  isRecovery: boolean = false
): SectionValidationResult {
  if (!mainWorkoutHtml) {
    const required = isRecovery ? RECOVERY_REQUIRED : NON_RECOVERY_REQUIRED;
    return {
      isComplete: false,
      missingSections: required.map(icon => ICON_LABELS[icon]),
      missingIcons: [...required],
      foundIcons: [],
    };
  }

  const required = isRecovery ? RECOVERY_REQUIRED : NON_RECOVERY_REQUIRED;
  const foundIcons: string[] = [];
  const missingIcons: string[] = [];
  const missingSections: string[] = [];

  for (const icon of required) {
    if (mainWorkoutHtml.includes(icon)) {
      foundIcons.push(icon);
    } else {
      missingIcons.push(icon);
      missingSections.push(ICON_LABELS[icon]);
    }
  }

  return {
    isComplete: missingIcons.length === 0,
    missingSections,
    missingIcons,
    foundIcons,
  };
}
