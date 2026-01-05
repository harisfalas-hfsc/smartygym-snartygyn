/**
 * Format Classifier - Category-Based Format Enforcement
 * 
 * CRITICAL RULES:
 * - STRENGTH = always REPS & SETS (no exceptions)
 * - MOBILITY & STABILITY = always REPS & SETS (no exceptions)
 * - PILATES = always REPS & SETS (no exceptions)
 * - RECOVERY = always MIX (no exceptions)
 * - Other categories (CARDIO, METABOLIC, CALORIE BURNING, CHALLENGE) = flexible formats
 * 
 * For flexible categories, FORMAT is determined SOLELY by the Main Workout section.
 * Finisher, Warm Up, and Cool Down sections are IGNORED for format classification.
 */

// Categories with FIXED formats (no variation allowed)
export const FIXED_FORMAT_CATEGORIES: Record<string, string> = {
  'STRENGTH': 'REPS & SETS',
  'MOBILITY & STABILITY': 'REPS & SETS',
  'PILATES': 'REPS & SETS',
  'RECOVERY': 'MIX'
};

// Categories that allow format variation
export const FLEXIBLE_FORMAT_CATEGORIES = [
  'CARDIO',
  'METABOLIC',
  'CALORIE BURNING',
  'CHALLENGE',
  'MICRO-WORKOUTS'
];

export interface FormatClassificationResult {
  inferredFormat: string;
  confidence: 'high' | 'medium' | 'low' | 'none';
  reason: string;
  mainWorkoutExtract: string;
  isCategoryEnforced: boolean;
}

/**
 * Gets the required format for a category.
 * Returns null for flexible categories (content-based detection needed).
 */
export function getRequiredFormatForCategory(category: string | null): string | null {
  if (!category) return null;
  const normalizedCategory = category.toUpperCase().trim();
  return FIXED_FORMAT_CATEGORIES[normalizedCategory] || null;
}

/**
 * Checks if a category allows format variation.
 */
export function isCategoryFlexible(category: string | null): boolean {
  if (!category) return true;
  const normalizedCategory = category.toUpperCase().trim();
  return !FIXED_FORMAT_CATEGORIES[normalizedCategory];
}

/**
 * Extracts ONLY the Main Workout section from workout HTML content.
 */
export function extractMainWorkoutSection(htmlContent: string): string {
  if (!htmlContent) return '';
  
  const content = htmlContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Find Main Workout section start
  const mainWorkoutPatterns = [
    /<strong><u>Main Workout[^<]*<\/u><\/strong>/i,
    /<b><u>Main Workout[^<]*<\/u><\/b>/i,
    /<strong>Main Workout[^<]*<\/strong>/i,
    /Main Workout/i
  ];
  
  let mainStart = -1;
  for (const pattern of mainWorkoutPatterns) {
    const match = content.search(pattern);
    if (match !== -1) {
      mainStart = match;
      break;
    }
  }
  
  if (mainStart === -1) {
    return content;
  }
  
  // Find the end (next section header)
  const endPatterns = [
    /<strong><u>Finisher/i,
    /<strong><u>Cool Down/i,
    /<strong><u>Cool-Down/i,
    /<b><u>Finisher/i,
    /<b><u>Cool Down/i,
    /<strong>Finisher/i,
    /<strong>Cool Down/i,
    /Finisher\s*[:]/i,
    /Cool Down\s*[:]/i
  ];
  
  let mainEnd = content.length;
  for (const pattern of endPatterns) {
    const searchFrom = mainStart + 20;
    const remaining = content.substring(searchFrom);
    const match = remaining.search(pattern);
    if (match !== -1) {
      const absolutePosition = searchFrom + match;
      if (absolutePosition < mainEnd) {
        mainEnd = absolutePosition;
      }
    }
  }
  
  return content.substring(mainStart, mainEnd);
}

/**
 * Content-based format detection for FLEXIBLE categories only.
 * Used for CARDIO, METABOLIC, CALORIE BURNING, CHALLENGE, MICRO-WORKOUTS.
 */
export function detectFormatFromContent(mainWorkoutContent: string): { format: string; confidence: 'high' | 'medium' | 'low'; reason: string } {
  const content = mainWorkoutContent.toLowerCase();
  
  // ========== TABATA: Very specific protocol ==========
  const hasTabataKeyword = /\btabata\b/i.test(content);
  const hasTabataProtocol = /20\s*seconds?\s*work\s*[\/\-,]\s*10\s*seconds?\s*rest/i.test(content);
  
  if (hasTabataKeyword || hasTabataProtocol) {
    return {
      format: 'TABATA',
      confidence: 'high',
      reason: hasTabataKeyword ? 'Found "Tabata" keyword' : 'Found 20s work / 10s rest protocol'
    };
  }
  
  // ========== EMOM: Must have EMOM keyword or phrase ==========
  const hasEmomKeyword = /\bemom\b/i.test(content);
  const hasEmomPhrase = /every\s*minute\s*on\s*the\s*minute/i.test(content);
  
  if (hasEmomKeyword || hasEmomPhrase) {
    return {
      format: 'EMOM',
      confidence: 'high',
      reason: hasEmomKeyword ? 'Found "EMOM" keyword' : 'Found "Every Minute On the Minute" phrase'
    };
  }
  
  // ========== AMRAP: Must have AMRAP keyword or phrase ==========
  const hasAmrapKeyword = /\bamrap\b/i.test(content);
  const hasAmrapPhrase = /as\s*many\s*rounds?\s*as\s*possible/i.test(content);
  const hasAmrapRepsPhrase = /as\s*many\s*reps?\s*as\s*possible/i.test(content);
  
  if (hasAmrapKeyword || hasAmrapPhrase || hasAmrapRepsPhrase) {
    return {
      format: 'AMRAP',
      confidence: 'high',
      reason: hasAmrapKeyword ? 'Found "AMRAP" keyword' : 'Found "As Many Rounds/Reps As Possible" phrase'
    };
  }
  
  // ========== FOR TIME: Must have explicit phrase ==========
  const hasForTimePhrase = /\bfor\s*time\b/i.test(content);
  const hasFastAsPossible = /complete\s*(this\s*)?(workout\s*)?as\s*fast\s*as\s*possible/i.test(content);
  const hasTimeCap = /time\s*cap\s*[:=]\s*\d+/i.test(content);
  
  if (hasForTimePhrase || hasFastAsPossible || hasTimeCap) {
    return {
      format: 'FOR TIME',
      confidence: 'high',
      reason: hasForTimePhrase ? 'Found "For Time" phrase' : 'Found time-based challenge structure'
    };
  }
  
  // ========== CIRCUIT: Rounds with work/rest ==========
  const hasRoundsKeyword = /\d+\s*rounds?\s*(?:of|:|-|–)/i.test(content);
  const hasCircuitKeyword = /\bcircuit\b/i.test(content);
  const hasWorkRestPattern = /\d+\s*seconds?\s*work\s*[\/\-,]\s*\d+\s*seconds?\s*rest/i.test(content);
  
  if (hasCircuitKeyword || (hasRoundsKeyword && hasWorkRestPattern)) {
    return {
      format: 'CIRCUIT',
      confidence: 'high',
      reason: hasCircuitKeyword ? 'Found "Circuit" keyword' : 'Found rounds with work/rest pattern'
    };
  }
  
  if (hasRoundsKeyword) {
    return {
      format: 'CIRCUIT',
      confidence: 'medium',
      reason: 'Found "X Rounds" pattern'
    };
  }
  
  // Default to CIRCUIT for flexible categories if no clear pattern
  return {
    format: 'CIRCUIT',
    confidence: 'low',
    reason: 'No clear format pattern detected, defaulting to CIRCUIT'
  };
}

/**
 * Main classification function: Category-based rules FIRST, content-based as fallback.
 */
export function classifyWorkoutFormat(
  category: string | null,
  fullHtmlContent: string
): FormatClassificationResult {
  const mainWorkoutSection = extractMainWorkoutSection(fullHtmlContent);
  const mainWorkoutExtract = mainWorkoutSection.substring(0, 200).replace(/\n/g, ' ');
  
  // STEP 1: Check if category has a FIXED format (STRENGTH, MOBILITY & STABILITY, PILATES, RECOVERY)
  const requiredFormat = getRequiredFormatForCategory(category);
  
  if (requiredFormat) {
    return {
      inferredFormat: requiredFormat,
      confidence: 'high',
      reason: `Category "${category}" MUST use format "${requiredFormat}" (no exceptions)`,
      mainWorkoutExtract,
      isCategoryEnforced: true
    };
  }
  
  // STEP 2: For flexible categories, use content-based detection
  const contentResult = detectFormatFromContent(mainWorkoutSection);
  
  return {
    inferredFormat: contentResult.format,
    confidence: contentResult.confidence,
    reason: contentResult.reason,
    mainWorkoutExtract,
    isCategoryEnforced: false
  };
}

/**
 * Checks if there's a mismatch that should be fixed.
 */
export function shouldFixFormat(
  category: string | null,
  currentFormat: string | null,
  classification: FormatClassificationResult
): boolean {
  if (!currentFormat) return true;
  
  const current = currentFormat.toUpperCase().trim();
  const inferred = classification.inferredFormat.toUpperCase().trim();
  
  // Category-enforced formats ALWAYS override
  if (classification.isCategoryEnforced) {
    return current !== inferred;
  }
  
  // For content-based detection, only fix high-confidence mismatches
  if (classification.confidence !== 'high') {
    return false;
  }
  
  return current !== inferred;
}

/**
 * Validates a workout's format against its category.
 * Returns the correct format if there's a violation, null if format is valid.
 */
export function validateFormatForCategory(category: string | null, format: string | null): string | null {
  const requiredFormat = getRequiredFormatForCategory(category);
  
  if (!requiredFormat) {
    // Flexible category - any format is valid
    return null;
  }
  
  if (!format || format.toUpperCase().trim() !== requiredFormat.toUpperCase().trim()) {
    // Fixed category but wrong format - return the required format
    return requiredFormat;
  }
  
  // Format is correct
  return null;
}
