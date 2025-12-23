// Fuzzy matching utility for exercise names
// Handles variations like "Push-Ups" vs "push up", "Squats" vs "squat"

export interface MatchResult {
  exercise: {
    id: string;
    name: string;
    body_part: string;
    equipment: string;
    target: string;
  };
  confidence: number;
}

/**
 * Normalize an exercise name for comparison
 * - Converts to lowercase
 * - Removes hyphens, underscores, extra spaces
 * - Removes trailing 's' for singular/plural matching
 * - Removes common words that don't affect matching
 */
export const normalizeExerciseName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[-_]/g, ' ')           // Replace hyphens/underscores with spaces
    .replace(/[''`]/g, '')           // Remove apostrophes
    .replace(/\s+/g, ' ')            // Collapse multiple spaces
    .trim()
    .replace(/s\b/g, '')             // Remove trailing 's' from words
    .replace(/\s+/g, '');            // Remove all spaces for final comparison
};

/**
 * Calculate similarity between two strings using Levenshtein distance
 */
const levenshteinDistance = (a: string, b: string): number => {
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
};

/**
 * Calculate confidence score between two normalized strings
 */
const calculateConfidence = (searchNorm: string, exerciseNorm: string): number => {
  // Exact match
  if (searchNorm === exerciseNorm) return 1.0;
  
  // One contains the other
  if (exerciseNorm.includes(searchNorm) || searchNorm.includes(exerciseNorm)) {
    const longer = Math.max(searchNorm.length, exerciseNorm.length);
    const shorter = Math.min(searchNorm.length, exerciseNorm.length);
    return shorter / longer;
  }
  
  // Levenshtein-based similarity
  const distance = levenshteinDistance(searchNorm, exerciseNorm);
  const maxLength = Math.max(searchNorm.length, exerciseNorm.length);
  const similarity = 1 - (distance / maxLength);
  
  return similarity;
};

/**
 * Find the best matching exercise from the library
 */
export const findBestMatch = (
  searchTerm: string,
  exercises: Array<{
    id: string;
    name: string;
    body_part: string;
    equipment: string;
    target: string;
  }>,
  confidenceThreshold: number = 0.75
): MatchResult | null => {
  const searchNorm = normalizeExerciseName(searchTerm);
  
  if (searchNorm.length < 3) return null; // Too short to match reliably
  
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
};

/**
 * Extract potential exercise names from HTML content
 * Looks for patterns like:
 * - Bold text: <strong>Exercise Name</strong>
 * - List items: <li>Exercise Name - details</li>
 * - Lines starting with exercise patterns
 */
export const extractExerciseNames = (htmlContent: string): string[] => {
  const exercises: string[] = [];
  
  // Pattern 1: Bold text (often exercise names)
  const boldPattern = /<(?:strong|b)>([^<]+)<\/(?:strong|b)>/gi;
  let match;
  while ((match = boldPattern.exec(htmlContent)) !== null) {
    const text = match[1].trim();
    // Filter out non-exercise bold text (too short, contains only numbers, etc.)
    if (text.length >= 3 && !/^\d+$/.test(text) && !/^(set|rep|rest|round|min|sec)/i.test(text)) {
      exercises.push(text);
    }
  }
  
  // Pattern 2: List items that look like exercises
  const listPattern = /<li>([^<-]+)/gi;
  while ((match = listPattern.exec(htmlContent)) !== null) {
    const text = match[1].trim();
    if (text.length >= 3 && !/^\d+/.test(text)) {
      exercises.push(text);
    }
  }
  
  // Pattern 3: Exercise markup {{exercise:id:name}} (tolerant of typos like exrcise, excersize)
  const markupPattern = /\{\{(?:exercise|exrcise|excersize|excercise):([^:]+):([^}]+)\}\}/gi;
  while ((match = markupPattern.exec(htmlContent)) !== null) {
    exercises.push(match[2]); // Push the name
  }
  
  // Remove duplicates
  return [...new Set(exercises)];
};

/**
 * Parse exercise markup and return structured data
 */
export const parseExerciseMarkup = (content: string): Array<{
  fullMatch: string;
  id: string;
  name: string;
}> => {
  const results: Array<{ fullMatch: string; id: string; name: string }> = [];
  // Tolerant pattern: accepts exercise, exrcise, excersize, excercise (case-insensitive)
  const markupPattern = /\{\{(?:exercise|exrcise|excersize|excercise):([^:]+):([^}]+)\}\}/gi;
  let match;
  
  while ((match = markupPattern.exec(content)) !== null) {
    results.push({
      fullMatch: match[0],
      id: match[1],
      name: match[2]
    });
  }
  
  return results;
};
