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
  'soft tissue preparation', 'perform each exercise', 'complete', 'repeat',
  'foam roll', 'lacrosse ball', 'gentle jogging',
];

// Words that indicate structural/instructional text, not exercise names
const STRUCTURAL_WORD_STARTS = [
  'perform', 'complete', 'repeat', 'rest', 'foam roll', 'lacrosse ball',
  'gentle jogging', 'seconds', 'minute', 'round', 'set',
];

// Prefix patterns that indicate a header with exercise after colon
const PREFIX_PATTERNS = [
  /^tabata\s*\d*:\s*/i,
  /^tabata\s+round\s*\d*:\s*/i,
  /^\d+\s*rounds?\s*(?:of)?:\s*/i,
  /^for\s*time:\s*/i,
  /^amrap\s*(?:\d+)?:\s*/i,
  /^emom\s*(?:\d+)?:\s*/i,
  /^accumulation\s*challenge:\s*/i,
  /^station\s*\d*:\s*/i,
  /^exercise\s*\d*:\s*/i,
  /^movement\s*\d*:\s*/i,
  /^block\s*\d*:\s*/i,
  /^[A-D]\d*[\.:]?\s*/i,
  /^[A-D]\d*\)\s*/i,
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
 * Check if a string looks like an exercise name (not structural/instructional text)
 */
function isLikelyExerciseName(text: string): boolean {
  const lower = text.toLowerCase().trim();
  
  if (lower.length < 3 || lower.length > 60) return false;
  if (/^\d+\.?\s*$/.test(text)) return false;
  
  // Skip structural patterns
  if (PURE_STRUCTURAL_PATTERNS.some(p => p.test(text))) return false;
  if (STRUCTURAL_HEADERS.some(h => lower === h || lower.startsWith(h + ' '))) return false;
  if (STRUCTURAL_WORD_STARTS.some(w => lower.startsWith(w))) return false;
  
  // Skip lines that are instructions/descriptions (contain certain verbs)
  if (/^(perform|complete|repeat|do|hold|maintain|keep|breathe|inhale|exhale)\s/i.test(lower)) return false;
  
  // Skip timing instructions
  if (/^\d+\s*(seconds?|minutes?|mins?|secs?)\s/i.test(lower)) return false;
  
  // Skip "X rounds of" style
  if (/^\d+\s*rounds?\s/i.test(lower)) return false;
  
  // Must start with a letter (exercise names start with letters)
  if (!/^[A-Za-z]/.test(text)) return false;
  
  return true;
}

/**
 * Clean an exercise name by stripping metadata, qualifiers, etc.
 */
function cleanExerciseName(text: string): string {
  let cleaned = text;
  // Strip leading numbers with dot (e.g., "1. Burpees")
  cleaned = cleaned.replace(/^\d+\.\s*/, '');
  // Strip trailing colons, semicolons, periods
  cleaned = cleaned.replace(/[:;.]+$/, '');
  // Remove trailing dashes
  cleaned = cleaned.replace(/\s*[-–—]\s*$/, '');
  // Remove generic "Machine" suffix
  cleaned = cleaned.replace(/\s+machine\s*$/i, '');
  // Strip sets/reps info after colon
  cleaned = cleaned.replace(/:\s*\d+\s*(?:sets?|rounds?|reps?|x\s|×\s|min|sec).*/i, '').trim();
  // Strip trailing sets/reps info without colon
  cleaned = cleaned.replace(/\s+\d+\s*(?:sets?\s*(?:x|×)\s*\d+|reps?|rounds?|min(?:utes?)?|sec(?:onds?)?).*$/i, '').trim();
  // Remove parenthetical qualifiers
  cleaned = cleaned.replace(/\s*\([^)]*\)\s*/g, '').trim();
  return cleaned;
}

/**
 * Extract exercise names from HTML content
 * Now handles: bold text, text after bold prefixes, and plain text in list items
 */
export function extractExerciseNames(htmlContent: string): string[] {
  const exercises: string[] = [];
  const seen = new Set<string>();
  
  function addExercise(name: string) {
    const cleaned = cleanExerciseName(name);
    if (cleaned.length >= 3 && isLikelyExerciseName(cleaned) && !seen.has(cleaned.toLowerCase())) {
      seen.add(cleaned.toLowerCase());
      exercises.push(cleaned);
    }
  }
  
  // Skip content that already has exercise markup
  if (!htmlContent) return [];
  
  // ─── Pattern 1: Bold text (exercise name fully inside bold tags) ───
  const boldPattern = /<(?:strong|b)>([^<]+)<\/(?:strong|b)>/gi;
  let match;
  while ((match = boldPattern.exec(htmlContent)) !== null) {
    let text = match[1].trim();
    if (/\{\{exercise:/.test(text)) continue;
    
    // Handle prefix patterns - extract exercise name after colon
    for (const prefixPattern of PREFIX_PATTERNS) {
      const prefixMatch = text.match(prefixPattern);
      if (prefixMatch) {
        const afterPrefix = text.substring(prefixMatch[0].length).trim();
        if (afterPrefix.length >= 3) {
          text = afterPrefix;
        } else {
          text = '';
        }
        break;
      }
    }
    
    if (text) addExercise(text);
  }
  
  // ─── Pattern 2: Text AFTER a closing bold tag in the same element ───
  // e.g., <strong>Station 1:</strong> Burpees
  // This captures the plain text "Burpees" that follows the bold prefix
  const afterBoldPattern = /<\/(?:strong|b)>\s*([^<]+)/gi;
  while ((match = afterBoldPattern.exec(htmlContent)) !== null) {
    let text = match[1].trim();
    if (!text || /\{\{exercise:/.test(text)) continue;
    
    // Strip leading duration/reps numbers (e.g., "20 seconds Burpees" or just "Burpees")
    // But keep "Air Squats" which starts with a letter
    const cleaned = cleanExerciseName(text);
    if (cleaned) addExercise(cleaned);
  }
  
  // ─── Pattern 3: Plain text in list items ───
  // Handles: <li...><p...>30 seconds Jumping Jacks</p></li>
  // Handles: <li...><p...>Burpees</p></li>  
  // Handles: <li...><p...>20 Air Squats</p></li>
  const listItemPattern = /<li[^>]*>\s*<p[^>]*>([^<]+)<\/p>/gi;
  while ((match = listItemPattern.exec(htmlContent)) !== null) {
    let text = match[1].trim();
    if (!text || /\{\{exercise:/.test(text)) continue;
    
    // Skip if this text was already captured by bold patterns
    // (list items that contain bold will be caught by Pattern 1/2)
    
    // Try to extract exercise name from various formats:
    
    // Format: "30 seconds Jumping Jacks" or "1 minute Child's Pose"
    const durationFirst = text.match(/^\d+\s*(?:seconds?|secs?|minutes?|mins?)\s+(.+)/i);
    if (durationFirst && durationFirst[1]) {
      const candidate = cleanExerciseName(durationFirst[1]);
      if (candidate) addExercise(candidate);
      continue;
    }
    
    // Format: "20 Air Squats" (number + exercise name)
    const numberFirst = text.match(/^(\d+)\s+([A-Za-z][A-Za-z\s'-]+)/);
    if (numberFirst && numberFirst[2]) {
      const candidate = cleanExerciseName(numberFirst[2]);
      if (candidate) addExercise(candidate);
      continue;
    }
    
    // Format: plain exercise name "Burpees" or "High Knees"
    if (/^[A-Za-z]/.test(text)) {
      const candidate = cleanExerciseName(text);
      if (candidate) addExercise(candidate);
    }
  }
  
  return exercises;
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Replace an exercise name with markup in content
 * Handles all the different locations where exercise names appear
 */
function replaceExerciseInContent(content: string, exerciseName: string, markup: string): string {
  const escaped = escapeRegExp(exerciseName);
  const escapedWithSuffix = escaped + '(?:\\s+[Mm]achine)?(?:[:;.])?\\s*';
  let result = content;
  
  // Strategy: try specific patterns first, then broader ones
  
  const patterns = [
    // 1. Exercise name fully inside bold tags (direct or with prefix)
    new RegExp(`(<(?:strong|b)>(?:\\d+\\.\\s*)?)${escapedWithSuffix}(<\/(?:strong|b)>)`, 'gi'),
    
    // 2. Exercise name with Tabata/Station/Exercise/Movement/Block prefix inside bold
    new RegExp(`(<(?:strong|b)>(?:(?:Tabata|Station|Exercise|Movement|Block)\\s*(?:Round\\s*)?\\d*:\\s*))${escapedWithSuffix}(<\/(?:strong|b)>)`, 'gi'),
    
    // 3. Exercise name with A1:/B2: prefix inside bold
    new RegExp(`(<(?:strong|b)>[A-D]\\d*[\\.:]\\s*)${escapedWithSuffix}(<\/(?:strong|b)>)`, 'gi'),
    
    // 4. Exercise name with parenthetical qualifiers inside bold
    new RegExp(`(<(?:strong|b)>(?:\\d+\\.\\s*)?)${escaped}(?:\\s+[Mm]achine)?(?:\\s*\\([^)]*\\))?(?:[:;.])?\\s*(<\/(?:strong|b)>)`, 'gi'),
    
    // 5. Exercise name AFTER a closing bold tag (e.g., </strong> Burpees)
    new RegExp(`(<\/(?:strong|b)>\\s*)${escapedWithSuffix}`, 'gi'),
    
    // 6. Exercise name after duration in list item (e.g., "30 seconds Jumping Jacks")
    new RegExp(`(\\d+\\s*(?:seconds?|secs?|minutes?|mins?)\\s+)${escapedWithSuffix}`, 'gi'),
    
    // 7. Exercise name after a number in list item (e.g., "20 Air Squats")
    new RegExp(`(\\d+\\s+)${escapedWithSuffix}`, 'gi'),
    
    // 8. Standalone exercise name in a paragraph inside a list item
    new RegExp(`(<p[^>]*>\\s*)${escapedWithSuffix}(\\s*<\/p>)`, 'gi'),
  ];
  
  let anyReplaced = false;
  for (const pattern of patterns) {
    const before = result;
    const captureCount = (pattern.source.match(/\((?!\?)/g) || []).length;
    
    if (captureCount === 2) {
      result = result.replace(pattern, `$1${markup}$2`);
    } else if (captureCount === 1) {
      result = result.replace(pattern, `$1${markup}`);
    } else {
      result = result.replace(pattern, markup);
    }
    
    if (result !== before) {
      anyReplaced = true;
      // Don't return early — continue to catch ALL occurrences with different patterns
    }
  }
  
  return result;
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
  console.log(`${logPrefix} Extracted ${extractedNames.length} potential exercises:`, extractedNames.slice(0, 15));
  
  let processedContent = content;
  
  for (const exerciseName of extractedNames) {
    // Don't skip — the same exercise name may appear multiple times in different sections
    // The replacement function will only replace un-marked occurrences
    
    const matchResult = findBestMatch(exerciseName, exerciseLibrary, 0.65);
    
    if (matchResult) {
      const markup = `{{exercise:${matchResult.exercise.id}:${matchResult.exercise.name}}}`;
      const beforeReplace = processedContent;
      
      processedContent = replaceExerciseInContent(processedContent, exerciseName, markup);
      
      if (beforeReplace !== processedContent) {
        matched.push({
          original: exerciseName,
          matched: matchResult.exercise.name,
          id: matchResult.exercise.id,
          confidence: matchResult.confidence
        });
        console.log(`${logPrefix} ✓ MATCHED: "${exerciseName}" → "${matchResult.exercise.name}" (${(matchResult.confidence * 100).toFixed(0)}%)`);
      } else {
        unmatched.push(exerciseName);
        console.log(`${logPrefix} ⚠ Pattern mismatch: "${exerciseName}" (found match but couldn't replace in HTML)`);
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
      }
    } catch (err) {
      console.log(`${logPrefix} Error logging "${exerciseName}":`, err);
    }
  }
}

/**
 * Build a condensed exercise reference list for AI prompts.
 */
export function buildExerciseReferenceList(exercises: ExerciseBasic[]): string {
  const grouped: Record<string, Record<string, string[]>> = {};
  
  for (const ex of exercises) {
    const bodyPart = (ex.body_part || 'other').toUpperCase();
    const equip = (ex.equipment || 'body weight').toLowerCase();
    
    if (!grouped[bodyPart]) grouped[bodyPart] = {};
    if (!grouped[bodyPart][equip]) grouped[bodyPart][equip] = [];
    grouped[bodyPart][equip].push(ex.name);
  }
  
  const lines: string[] = [
    'EXERCISE LIBRARY REFERENCE (MANDATORY - USE EXACT NAMES):',
    'You MUST use exercises from this library. Write the exercise name EXACTLY as listed below.',
    'Choose exercises that match the workout category, equipment type, difficulty, and focus.',
    'If you need an exercise not on this list, write it clearly but PREFER listed exercises.',
    ''
  ];
  
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
  const referenceList = buildExerciseReferenceList(exercises);
  
  return { exercises, referenceList };
}
