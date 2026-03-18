/**
 * WOD Section Completeness Validator
 * 
 * Ensures every generated WOD has all required section icons before saving.
 * Non-recovery WODs: 🧽 🔥 💪 ⚡ 🧘 (5 sections)
 * Recovery WODs: 🧽 🔥 💪 🧘 (4 sections, no finisher required)
 * 
 * Also validates that exercise-bearing sections (💪 Main Workout, ⚡ Finisher)
 * contain a minimum number of {{exercise:...}} tags to prevent empty/rest-only sections.
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

// Minimum exercise tag counts per section
const MIN_MAIN_WORKOUT_EXERCISES = 3;
const MIN_FINISHER_EXERCISES = 1;

export interface SectionValidationResult {
  isComplete: boolean;
  missingSections: string[];
  missingIcons: string[];
  foundIcons: string[];
  // Exercise content validation
  mainWorkoutExerciseCount: number;
  finisherExerciseCount: number;
  hasMinimumExercises: boolean;
  exerciseContentIssues: string[];
}

/**
 * Counts {{exercise:...}} tags within a substring of the HTML content
 * between two section icon markers.
 */
function countExerciseTagsBetween(
  html: string,
  startIcon: string,
  endIcon: string | null
): number {
  const startIdx = html.indexOf(startIcon);
  if (startIdx === -1) return 0;

  let endIdx: number;
  if (endIcon) {
    endIdx = html.indexOf(endIcon, startIdx + 1);
    if (endIdx === -1) endIdx = html.length;
  } else {
    endIdx = html.length;
  }

  const sectionContent = html.substring(startIdx, endIdx);
  const matches = sectionContent.match(/\{\{exercise:/g);
  return matches ? matches.length : 0;
}

/**
 * Validates that a main_workout HTML string contains all required section icons
 * AND that exercise-bearing sections contain a minimum number of exercises.
 * 
 * @param mainWorkoutHtml - The main_workout field HTML content
 * @param isRecovery - Whether this is a recovery day WOD (no finisher required)
 * @returns Validation result with missing section details and exercise counts
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
      mainWorkoutExerciseCount: 0,
      finisherExerciseCount: 0,
      hasMinimumExercises: false,
      exerciseContentIssues: ["No content provided"],
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

  // Count exercises in Main Workout (💪 → ⚡) and Finisher (⚡ → 🧘)
  const mainWorkoutExerciseCount = countExerciseTagsBetween(
    mainWorkoutHtml,
    SECTION_ICONS.MAIN_WORKOUT,
    isRecovery ? SECTION_ICONS.COOL_DOWN : SECTION_ICONS.FINISHER
  );

  const finisherExerciseCount = isRecovery
    ? 0 // Recovery WODs don't require a finisher
    : countExerciseTagsBetween(
        mainWorkoutHtml,
        SECTION_ICONS.FINISHER,
        SECTION_ICONS.COOL_DOWN
      );

  // Check minimum exercise thresholds
  const exerciseContentIssues: string[] = [];

  if (mainWorkoutExerciseCount < MIN_MAIN_WORKOUT_EXERCISES) {
    exerciseContentIssues.push(
      `Main Workout has only ${mainWorkoutExerciseCount} exercise(s), minimum is ${MIN_MAIN_WORKOUT_EXERCISES}`
    );
  }

  if (!isRecovery && finisherExerciseCount < MIN_FINISHER_EXERCISES) {
    exerciseContentIssues.push(
      `Finisher has only ${finisherExerciseCount} exercise(s), minimum is ${MIN_FINISHER_EXERCISES}`
    );
  }

  const hasMinimumExercises = exerciseContentIssues.length === 0;

  return {
    isComplete: missingIcons.length === 0 && exerciseContentIssues.length === 0,
    missingSections,
    missingIcons,
    foundIcons,
    mainWorkoutExerciseCount,
    finisherExerciseCount,
    hasMinimumExercises,
    exerciseContentIssues,
  };
}
