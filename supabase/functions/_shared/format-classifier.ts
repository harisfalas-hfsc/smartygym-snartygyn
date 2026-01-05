/**
 * Format Classifier - Deterministic Main Workout Format Detection
 * 
 * CRITICAL RULE: FORMAT label is determined SOLELY by the Main Workout section.
 * Finisher, Warm Up, and Cool Down sections are IGNORED for format classification.
 * 
 * Valid formats: TABATA, EMOM, AMRAP, FOR TIME, REPS & SETS, CIRCUIT, MIX
 * 
 * APPROACH: Only flag HIGH-CONFIDENCE mismatches. If uncertain, trust the current format.
 */

export interface FormatClassificationResult {
  inferredFormat: string | null; // null means "no confident inference, trust current"
  confidence: 'high' | 'medium' | 'low' | 'none';
  reason: string;
  mainWorkoutExtract: string;
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
 * Classifies the workout format based on Main Workout content ONLY.
 * Returns null for inferredFormat if not confident enough to override.
 */
export function classifyFormat(mainWorkoutContent: string): FormatClassificationResult {
  const content = mainWorkoutContent.toLowerCase();
  const mainWorkoutExtract = mainWorkoutContent.substring(0, 200).replace(/\n/g, ' ');
  
  // ========== TABATA: Very specific protocol ==========
  // Must have "Tabata" keyword OR the exact 20/10 protocol mentioned explicitly
  const hasTabataKeyword = /\btabata\b/i.test(content);
  const hasTabataProtocol = /20\s*seconds?\s*work\s*[\/\-,]\s*10\s*seconds?\s*rest/i.test(content);
  
  if (hasTabataKeyword || hasTabataProtocol) {
    return {
      inferredFormat: 'TABATA',
      confidence: 'high',
      reason: hasTabataKeyword ? 'Found "Tabata" keyword' : 'Found 20s work / 10s rest protocol',
      mainWorkoutExtract
    };
  }
  
  // ========== EMOM: Must have EMOM keyword or "every minute on the minute" ==========
  const hasEmomKeyword = /\bemom\b/i.test(content);
  const hasEmomPhrase = /every\s*minute\s*on\s*the\s*minute/i.test(content);
  // "Minute 1:", "Minute 2:" pattern without AMRAP/FOR TIME
  const hasMinutePattern = /minute\s*1\s*[:]/i.test(content) && /minute\s*[2-9]\s*[:]/i.test(content);
  
  if (hasEmomKeyword || hasEmomPhrase) {
    return {
      inferredFormat: 'EMOM',
      confidence: 'high',
      reason: hasEmomKeyword ? 'Found "EMOM" keyword' : 'Found "Every Minute On the Minute" phrase',
      mainWorkoutExtract
    };
  }
  
  if (hasMinutePattern && !/amrap/i.test(content) && !/for\s*time/i.test(content)) {
    return {
      inferredFormat: 'EMOM',
      confidence: 'medium',
      reason: 'Found "Minute 1:", "Minute 2:" structure (EMOM-style)',
      mainWorkoutExtract
    };
  }
  
  // ========== AMRAP: Must have AMRAP keyword or full phrase ==========
  const hasAmrapKeyword = /\bamrap\b/i.test(content);
  const hasAmrapPhrase = /as\s*many\s*rounds?\s*as\s*possible/i.test(content);
  const hasAmrapRepsPhrase = /as\s*many\s*reps?\s*as\s*possible/i.test(content);
  
  if (hasAmrapKeyword || hasAmrapPhrase || hasAmrapRepsPhrase) {
    return {
      inferredFormat: 'AMRAP',
      confidence: 'high',
      reason: hasAmrapKeyword ? 'Found "AMRAP" keyword' : 'Found "As Many Rounds/Reps As Possible" phrase',
      mainWorkoutExtract
    };
  }
  
  // ========== FOR TIME: Must have explicit "for time" or "complete as fast as possible" ==========
  const hasForTimePhrase = /\bfor\s*time\b/i.test(content);
  const hasFastAsPossible = /complete\s*(this\s*)?(workout\s*)?as\s*fast\s*as\s*possible/i.test(content);
  const hasTimeCap = /time\s*cap\s*[:=]\s*\d+/i.test(content);
  
  if (hasForTimePhrase || hasFastAsPossible || hasTimeCap) {
    return {
      inferredFormat: 'FOR TIME',
      confidence: 'high',
      reason: hasForTimePhrase ? 'Found "For Time" phrase' : 'Found time-based challenge structure',
      mainWorkoutExtract
    };
  }
  
  // ========== CIRCUIT vs REPS & SETS ==========
  // This is the tricky part. Key distinction:
  // - CIRCUIT: "X Rounds" with work/rest intervals, back-to-back exercises
  // - REPS & SETS: "X Sets" with rest between sets, traditional strength format
  
  // Check for CIRCUIT indicators
  const hasRoundsKeyword = /\d+\s*rounds?\s*(?:of|:|-|–)/i.test(content);
  const hasCircuitKeyword = /\bcircuit\b/i.test(content);
  const hasWorkRestPattern = /\d+\s*seconds?\s*work\s*[\/\-,]\s*\d+\s*seconds?\s*rest/i.test(content);
  const hasRoundsWithSeconds = /\d+\s*rounds?\s*[-–]\s*\d+\s*seconds?\s*work/i.test(content);
  
  // Check for REPS & SETS indicators
  const hasSetsKeyword = /\d+\s*sets?\s*(?:of|:)/i.test(content);
  const hasSetNumbering = /\bset\s*[1-9]\s*[:]/i.test(content);
  const hasSetsXReps = /\d+\s*sets?\s*[x×]\s*\d+/i.test(content);
  const hasRepsXSets = /\d+\s*[x×]\s*\d+\s*reps?/i.test(content);
  const hasRestBetweenSets = /rest\s*(?:\d+[-–]\d+|\d+)\s*(?:seconds?|sec|minutes?|min)\s*between\s*sets/i.test(content);
  const hasExerciseNumbering = /exercise\s*[1-9]\s*[:]/i.test(content);
  
  // REPS & SETS is indicated by: Sets, Set numbering, or Exercise numbering
  const repsSetScore = (hasSetsKeyword ? 2 : 0) + (hasSetNumbering ? 2 : 0) + 
                       (hasSetsXReps ? 2 : 0) + (hasRepsXSets ? 1 : 0) + 
                       (hasRestBetweenSets ? 1 : 0) + (hasExerciseNumbering ? 1 : 0);
  
  // CIRCUIT is indicated by: Rounds with work/rest, back-to-back structure
  const circuitScore = (hasRoundsKeyword ? 2 : 0) + (hasCircuitKeyword ? 2 : 0) + 
                       (hasWorkRestPattern ? 2 : 0) + (hasRoundsWithSeconds ? 2 : 0);
  
  // Only infer if one clearly wins
  if (repsSetScore >= 3 && repsSetScore > circuitScore) {
    return {
      inferredFormat: 'REPS & SETS',
      confidence: repsSetScore >= 4 ? 'high' : 'medium',
      reason: `Found REPS & SETS indicators (score: ${repsSetScore})`,
      mainWorkoutExtract
    };
  }
  
  if (circuitScore >= 3 && circuitScore > repsSetScore) {
    return {
      inferredFormat: 'CIRCUIT',
      confidence: circuitScore >= 4 ? 'high' : 'medium',
      reason: `Found CIRCUIT indicators (score: ${circuitScore})`,
      mainWorkoutExtract
    };
  }
  
  // ========== NO CONFIDENT INFERENCE ==========
  // If we can't confidently determine, return null to trust the current format
  return {
    inferredFormat: null,
    confidence: 'none',
    reason: 'No confident format pattern detected, trusting current format',
    mainWorkoutExtract
  };
}

/**
 * Main entry point: Extract Main Workout and classify format.
 */
export function classifyWorkoutFormat(fullHtmlContent: string): FormatClassificationResult {
  const mainWorkoutSection = extractMainWorkoutSection(fullHtmlContent);
  return classifyFormat(mainWorkoutSection);
}

/**
 * Checks if there's a mismatch that should be fixed.
 * Only returns true for HIGH-CONFIDENCE mismatches.
 */
export function shouldFixFormat(currentFormat: string | null, classification: FormatClassificationResult): boolean {
  // If no confident inference, don't suggest a fix
  if (!classification.inferredFormat) return false;
  if (classification.confidence === 'none' || classification.confidence === 'low') return false;
  
  // Check if formats actually differ
  if (!currentFormat) return true; // No current format, should set one
  
  const current = currentFormat.toUpperCase().trim();
  const inferred = classification.inferredFormat.toUpperCase().trim();
  
  return current !== inferred;
}

/**
 * Legacy compatibility: Simple match check.
 */
export function formatsMatch(currentFormat: string | null, inferredFormat: string | null): boolean {
  if (!currentFormat || !inferredFormat) return true; // Treat null inference as "match"
  return currentFormat.toUpperCase().trim() === inferredFormat.toUpperCase().trim();
}
