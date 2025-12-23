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

// Common structural headers that are NOT exercises
const STRUCTURAL_HEADERS = [
  'warm up', 'warmup', 'warm-up',
  'cool down', 'cooldown', 'cool-down',
  'main workout', 'finisher', 'activation',
  'notes', 'tips', 'instructions', 'description',
  'rounds', 'sets', 'reps', 'rest', 'recovery',
  'block', 'circuit', 'station', 'phase',
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
  'day 1', 'day 2', 'day 3', 'day 4', 'day 5', 'day 6', 'day 7',
  'week 1', 'week 2', 'week 3', 'week 4'
];

// Prefix patterns that indicate a header with exercise after colon
const PREFIX_PATTERNS = [
  /^tabata\s*\d*:\s*/i,           // "Tabata 1: High Knees" → "High Knees"
  /^\d+\s*rounds?\s*(?:of)?:\s*/i, // "3 Rounds of: Burpees" → "Burpees"
  /^for\s*time:\s*/i,              // "For Time: ..." → skip
  /^amrap\s*(?:\d+)?:\s*/i,        // "AMRAP 10: ..." → skip  
  /^emom\s*(?:\d+)?:\s*/i,         // "EMOM 12: ..." → skip
  /^accumulation\s*challenge:\s*/i, // "Accumulation Challenge: ..." → skip
  /^station\s*\d*:\s*/i,           // "Station 1: ..." → extract after
  /^exercise\s*\d*:\s*/i,          // "Exercise 1: ..." → extract after
  /^movement\s*\d*:\s*/i,          // "Movement 1: ..." → extract after
  /^block\s*\d*:\s*/i,             // "Block 1: ..." → extract after
];

// Patterns that are purely structural (no exercise follows)
const PURE_STRUCTURAL_PATTERNS = [
  /^for\s*time$/i,
  /^amrap\s*\d*$/i,
  /^emom\s*\d*$/i,
  /^\d+\s*rounds?$/i,
  /^\d+\s*sets?$/i,
  /^\d+\s*reps?$/i,
  /^rest\s*\d*/i,
  /^recovery$/i,
];

/**
 * Extract potential exercise names from HTML content
 * Looks for patterns like:
 * - Bold text: <strong>Exercise Name</strong>
 * - List items: <li>Exercise Name - details</li>
 * - Lines starting with exercise patterns
 * Handles headers like "Tabata 1: High Knees" by extracting just "High Knees"
 */
export const extractExerciseNames = (htmlContent: string): string[] => {
  const exercises: string[] = [];
  
  // Pattern 1: Bold text (often exercise names)
  const boldPattern = /<(?:strong|b)>([^<]+)<\/(?:strong|b)>/gi;
  let match;
  while ((match = boldPattern.exec(htmlContent)) !== null) {
    let text = match[1].trim();
    
    // Skip if too short or just numbers
    if (text.length < 3 || /^\d+\.?\s*$/.test(text)) {
      continue;
    }
    
    // Skip pure structural patterns
    if (PURE_STRUCTURAL_PATTERNS.some(pattern => pattern.test(text))) {
      continue;
    }
    
    // Check if text is a structural header
    const normalizedText = text.toLowerCase().replace(/[-_]/g, ' ').trim();
    if (STRUCTURAL_HEADERS.some(header => normalizedText === header || normalizedText.startsWith(header + ' '))) {
      continue;
    }
    
    // Handle prefix patterns - extract exercise name after colon
    for (const prefixPattern of PREFIX_PATTERNS) {
      const prefixMatch = text.match(prefixPattern);
      if (prefixMatch) {
        const afterPrefix = text.substring(prefixMatch[0].length).trim();
        if (afterPrefix.length >= 3) {
          text = afterPrefix;
          break;
        } else {
          // Prefix with nothing useful after - skip this entry
          text = '';
          break;
        }
      }
    }
    
    // Skip if empty after prefix extraction
    if (!text) continue;
    
    // Additional filters
    if (
      /^(set|rep|rest|round|min|sec|x\s|×\s)/i.test(text) ||
      /minutes?$/i.test(text) ||
      /^\d+\s*(x|×)/i.test(text)
    ) {
      continue;
    }
    
    // Clean up any trailing/leading punctuation or numbers
    const cleaned = text.replace(/^\d+\.\s*/, '').replace(/\s*[-–—]\s*$/, '').trim();
    if (cleaned.length >= 3) {
      exercises.push(cleaned);
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
