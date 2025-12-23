// ═══════════════════════════════════════════════════════════════════════════════
// SHARED EXERCISE MATCHING UTILITIES
// Used by generate-workout-of-day and generate-fitness-plan to link exercises
// ═══════════════════════════════════════════════════════════════════════════════

export interface ExerciseBasic {
  id: string;
  name: string;
  body_part: string;
  equipment: string;
  target: string;
}

export interface MatchResult {
  exercise: ExerciseBasic;
  confidence: number;
}

export interface ProcessingResult {
  processedContent: string;
  matched: Array<{ original: string; matched: string; id: string; confidence: number }>;
  unmatched: string[];
}

/**
 * Normalize an exercise name for comparison
 */
export function normalizeExerciseName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[-_]/g, ' ')
    .replace(/[''`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/s\b/g, '')
    .replace(/\s+/g, '');
}

/**
 * Calculate Levenshtein distance between two strings
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

/**
 * Calculate confidence score between two normalized strings
 */
export function calculateConfidence(searchNorm: string, exerciseNorm: string): number {
  if (searchNorm === exerciseNorm) return 1.0;
  
  if (exerciseNorm.includes(searchNorm) || searchNorm.includes(exerciseNorm)) {
    const longer = Math.max(searchNorm.length, exerciseNorm.length);
    const shorter = Math.min(searchNorm.length, exerciseNorm.length);
    return shorter / longer;
  }
  
  const distance = levenshteinDistance(searchNorm, exerciseNorm);
  const maxLength = Math.max(searchNorm.length, exerciseNorm.length);
  const similarity = 1 - (distance / maxLength);
  
  return similarity;
}

/**
 * Find the best matching exercise from the library
 */
export function findBestMatch(
  searchTerm: string,
  exercises: ExerciseBasic[],
  confidenceThreshold: number = 0.75
): MatchResult | null {
  const searchNorm = normalizeExerciseName(searchTerm);
  
  if (searchNorm.length < 3) return null;
  
  let bestMatch: MatchResult | null = null;
  let bestConfidence = 0;
  
  for (const exercise of exercises) {
    const exerciseNorm = normalizeExerciseName(exercise.name);
    const confidence = calculateConfidence(searchNorm, exerciseNorm);
    
    if (confidence > bestConfidence && confidence >= confidenceThreshold) {
      bestConfidence = confidence;
      bestMatch = { exercise, confidence };
    }
  }
  
  return bestMatch;
}

/**
 * Extract exercise names from HTML content (bold text patterns)
 */
export function extractExerciseNames(htmlContent: string): string[] {
  const exercises: string[] = [];
  
  // Pattern 1: Bold text (often exercise names)
  const boldPattern = /<(?:strong|b)>([^<]+)<\/(?:strong|b)>/gi;
  let match;
  while ((match = boldPattern.exec(htmlContent)) !== null) {
    const text = match[1].trim();
    // Filter out non-exercise bold text (headers, numbers, formatting)
    if (
      text.length >= 3 && 
      !/^\d+\.?\s*$/.test(text) && // Not just numbers
      !/^(set|rep|rest|round|min|sec|x\s|×\s|block|circuit|warm|cool|notes?|tip|instruction)/i.test(text) &&
      !/minutes?$/i.test(text) && // Not duration like "5 minutes"
      !/^\d+\s*(x|×)/i.test(text) // Not "3 x 10" format
    ) {
      // Clean up any trailing/leading punctuation or numbers
      const cleaned = text.replace(/^\d+\.\s*/, '').replace(/\s*[-–—]\s*$/, '').trim();
      if (cleaned.length >= 3) {
        exercises.push(cleaned);
      }
    }
  }
  
  // Remove duplicates
  return [...new Set(exercises)];
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Process content and replace matched exercises with markup
 */
export function processContentWithExerciseMatching(
  content: string,
  exerciseLibrary: ExerciseBasic[],
  logPrefix: string = "[EXERCISE-MATCH]"
): ProcessingResult {
  const matched: Array<{ original: string; matched: string; id: string; confidence: number }> = [];
  const unmatched: string[] = [];
  
  if (!content || !exerciseLibrary || exerciseLibrary.length === 0) {
    console.log(`${logPrefix} No content or empty exercise library`);
    return { processedContent: content || '', matched, unmatched };
  }
  
  // Extract exercise names from content
  const extractedNames = extractExerciseNames(content);
  console.log(`${logPrefix} Extracted ${extractedNames.length} potential exercises:`, extractedNames.slice(0, 10));
  
  let processedContent = content;
  
  for (const exerciseName of extractedNames) {
    const matchResult = findBestMatch(exerciseName, exerciseLibrary, 0.75);
    
    if (matchResult) {
      // Replace the exercise name with markup (inside bold tags)
      const markup = `{{exercise:${matchResult.exercise.id}:${matchResult.exercise.name}}}`;
      
      // Replace within bold tags - use word boundaries to avoid partial matches
      const originalPattern = new RegExp(
        `(<strong>)(\\d+\\.\\s*)?${escapeRegExp(exerciseName)}(</strong>)`,
        'gi'
      );
      
      const beforeReplace = processedContent;
      processedContent = processedContent.replace(originalPattern, `$1$2${markup}$3`);
      
      // Only count as matched if we actually replaced something
      if (beforeReplace !== processedContent) {
        matched.push({
          original: exerciseName,
          matched: matchResult.exercise.name,
          id: matchResult.exercise.id,
          confidence: matchResult.confidence
        });
        console.log(`${logPrefix} ✓ MATCHED: "${exerciseName}" → "${matchResult.exercise.name}" (${(matchResult.confidence * 100).toFixed(0)}%)`);
      } else {
        // Match found but pattern didn't match - add to unmatched
        unmatched.push(exerciseName);
        console.log(`${logPrefix} ⚠ Pattern mismatch: "${exerciseName}"`);
      }
    } else {
      unmatched.push(exerciseName);
      console.log(`${logPrefix} ✗ UNMATCHED: "${exerciseName}"`);
    }
  }
  
  console.log(`${logPrefix} Summary: ${matched.length} matched, ${unmatched.length} unmatched`);
  
  return { processedContent, matched, unmatched };
}

/**
 * Log unmatched exercises to the mismatched_exercises table
 */
export async function logUnmatchedExercises(
  supabaseClient: any,
  unmatchedNames: string[],
  sourceType: 'wod' | 'workout' | 'program',
  sourceId: string | null,
  sourceName: string | null,
  logPrefix: string = "[MISMATCH-LOG]"
): Promise<void> {
  if (!unmatchedNames || unmatchedNames.length === 0) {
    console.log(`${logPrefix} No unmatched exercises to log`);
    return;
  }
  
  console.log(`${logPrefix} Logging ${unmatchedNames.length} unmatched exercises...`);
  
  for (const exerciseName of unmatchedNames) {
    try {
      // Use upsert to avoid duplicate entries (unique constraint on exercise_name)
      const { error } = await supabaseClient
        .from('mismatched_exercises')
        .upsert(
          {
            exercise_name: exerciseName,
            source_type: sourceType,
            source_id: sourceId,
            source_name: sourceName,
            created_at: new Date().toISOString()
          },
          { 
            onConflict: 'exercise_name',
            ignoreDuplicates: true // Don't update if already exists
          }
        );
      
      if (error) {
        console.log(`${logPrefix} Failed to log "${exerciseName}": ${error.message}`);
      } else {
        console.log(`${logPrefix} Logged: "${exerciseName}"`);
      }
    } catch (err) {
      console.log(`${logPrefix} Error logging "${exerciseName}":`, err);
    }
  }
}
