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
    // Only remove trailing 's' for pluralization (e.g. "squats" -> "squat", "lunges" -> "lunge")
    // But not from words where 's' is part of the word (e.g. "press", "ross")
    .split(' ')
    .map(word => word.length > 3 && word.endsWith('s') && !word.endsWith('ss') ? word.slice(0, -1) : word)
    .join('');
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
    // Boost confidence when the search term is fully contained in the library name
    // e.g. "goblet squat" inside "dumbbell goblet squat" should score high
    return 0.80 + (shorter / longer * 0.20);
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
  confidenceThreshold: number = 0.65
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
  'week 1', 'week 2', 'week 3', 'week 4', 'week 5', 'week 6', 'week 7', 'week 8',
  'duration', 'frequency', 'session', 'session length', 'focus', 'format',
  'protein', 'carbs', 'hydration', 'electrolytes', 'deficit', 'timing',
  'pre-workout', 'post-workout', 'pre-cardio', 'post-cardio',
  'volume progression', 'intensity progression', 'density progression', 'complexity progression',
  'cardiovascular', 'metabolism', 'mental strength', 'energy',
  'calorie burn', 'fat loss', 'conditioning', 'strength', 'movement', 'daily life',
  'daily goal', 'daily hydration', 'electrolyte balance', 'carbohydrate needs',
  'race day nutrition', 'rest days', 'heart rate monitoring', 'weekly progression',
  'total weekly calorie targets', 'caloric deficit', 'carb cycling', 'collagen',
  'machine setup tips', 'treadmill', 'rower', 'by week',
  'cardiovascular fitness', 'expected results', 'nutrition tips',
  'soft tissue preparation'
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
 * Extract exercise names from HTML content (bold text patterns)
 * Handles headers like "Tabata 1: High Knees" by extracting just "High Knees"
 */
export function extractExerciseNames(htmlContent: string): string[] {
  const exercises: string[] = [];
  
  // Pattern 1: Bold text (often exercise names)
  const boldPattern = /<(?:strong|b)>([^<]+)<\/(?:strong|b)>/gi;
  let match;
  while ((match = boldPattern.exec(htmlContent)) !== null) {
    let text = match[1].trim();
    
    // Skip already-matched exercises ({{exercise:id:name}} markup)
    if (/\{\{exercise:/.test(text)) {
      continue;
    }
    
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
    let extractedFromPrefix = false;
    for (const prefixPattern of PREFIX_PATTERNS) {
      const prefixMatch = text.match(prefixPattern);
      if (prefixMatch) {
        const afterPrefix = text.substring(prefixMatch[0].length).trim();
        if (afterPrefix.length >= 3) {
          text = afterPrefix;
          extractedFromPrefix = true;
          break;
        } else {
          // Prefix with nothing useful after - skip this entry
          extractedFromPrefix = true;
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
    let cleaned = text.replace(/^\d+\.\s*/, '').replace(/\s*[-–—]\s*$/, '').trim();
    // Strip trailing colons, semicolons, periods
    cleaned = cleaned.replace(/[:;.]+$/, '');
    // Remove generic "Machine" suffix that hurts matching
    cleaned = cleaned.replace(/\s+machine\s*$/i, '');
    cleaned = cleaned.trim();
    if (cleaned.length >= 3) {
      exercises.push(cleaned);
    }
  }
  
  // Remove duplicates
  return [...new Set(exercises)];
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Build replacement patterns for exercise name in bold tags
 * Handles both direct "Exercise Name" and prefixed "Tabata 1: Exercise Name"
 */
function buildReplacementPatterns(exerciseName: string): RegExp[] {
  const escaped = escapeRegExp(exerciseName);
  // Also match the original name with trailing colon/period, optional "Machine" suffix, and optional whitespace
  const escapedWithSuffix = escaped + '(?:\\s+[Mm]achine)?(?:[:;.])?\\s*';
  return [
    // Direct match: <strong>Exercise Name</strong> (with optional colon/Machine/spaces)
    new RegExp(`(<strong>)(\\d+\\.\\s*)?${escapedWithSuffix}(</strong>)`, 'gi'),
    
    // Match with Tabata prefix
    new RegExp(`(<strong>)(Tabata\\s*\\d*:\\s*)${escapedWithSuffix}(</strong>)`, 'gi'),
    
    // Match with Station prefix
    new RegExp(`(<strong>)(Station\\s*\\d*:\\s*)${escapedWithSuffix}(</strong>)`, 'gi'),
    
    // Match with Exercise prefix
    new RegExp(`(<strong>)(Exercise\\s*\\d*:\\s*)${escapedWithSuffix}(</strong>)`, 'gi'),
    
    // Match with Movement prefix
    new RegExp(`(<strong>)(Movement\\s*\\d*:\\s*)${escapedWithSuffix}(</strong>)`, 'gi'),
    
    // Match with Block prefix
    new RegExp(`(<strong>)(Block\\s*\\d*:\\s*)${escapedWithSuffix}(</strong>)`, 'gi'),
    
    // Match inside list item without bold
    new RegExp(`(<li[^>]*><p[^>]*>)(\\d+\\.\\s*)?${escapedWithSuffix}(?=\\s*[-–—]|\\s*<|$)`, 'gi'),
  ];
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
      
      // Try multiple replacement patterns
      const patterns = buildReplacementPatterns(exerciseName);
      const beforeReplace = processedContent;
      
      for (const pattern of patterns) {
        processedContent = processedContent.replace(pattern, `$1$2${markup}$3`);
        if (processedContent !== beforeReplace) {
          break; // Stop once we've made a replacement
        }
      }
      
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
            ignoreDuplicates: true
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

/**
 * Build a condensed exercise reference list for AI prompts.
 * Groups exercises by body_part and equipment for efficient token usage.
 */
export function buildExerciseReferenceList(exercises: ExerciseBasic[]): string {
  // Group by body_part, then by equipment
  const grouped: Record<string, Record<string, string[]>> = {};
  
  for (const ex of exercises) {
    const bodyPart = (ex.body_part || 'other').toUpperCase();
    const equip = (ex.equipment || 'body weight').toLowerCase();
    
    if (!grouped[bodyPart]) grouped[bodyPart] = {};
    if (!grouped[bodyPart][equip]) grouped[bodyPart][equip] = [];
    grouped[bodyPart][equip].push(ex.name);
  }
  
  // Build condensed string
  const lines: string[] = [
    'EXERCISE LIBRARY REFERENCE (MANDATORY - USE EXACT NAMES):',
    'You MUST use exercises from this library. Write the exercise name EXACTLY as listed below.',
    'Choose exercises that match the workout category, equipment type, difficulty, and focus.',
    'If you need an exercise not on this list, write it clearly but PREFER listed exercises.',
    ''
  ];
  
  // Sort body parts for consistency
  const sortedBodyParts = Object.keys(grouped).sort();
  
  for (const bodyPart of sortedBodyParts) {
    const equipmentGroups = grouped[bodyPart];
    const sortedEquipment = Object.keys(equipmentGroups).sort();
    
    for (const equip of sortedEquipment) {
      const names = equipmentGroups[equip].sort();
      lines.push(`${bodyPart} / ${equip}: ${names.join(', ')}`);
    }
  }
  
  return lines.join('\n');
}

/**
 * Fetch exercise library from Supabase and build reference list.
 */
export async function fetchAndBuildExerciseReference(
  supabaseClient: any,
  logPrefix: string = "[EXERCISE-REF]"
): Promise<{ exercises: ExerciseBasic[]; referenceList: string }> {
  const { data: exercises, error } = await supabaseClient
    .from("exercises")
    .select("id, name, body_part, equipment, target")
    .limit(2000);
  
  if (error || !exercises) {
    console.error(`${logPrefix} Failed to fetch exercise library:`, error);
    return { exercises: [], referenceList: '' };
  }
  
  console.log(`${logPrefix} Loaded ${exercises.length} exercises from library`);
  const referenceList = buildExerciseReferenceList(exercises as ExerciseBasic[]);
  console.log(`${logPrefix} Reference list built (${referenceList.length} chars)`);
  
  return { exercises: exercises as ExerciseBasic[], referenceList };
}
