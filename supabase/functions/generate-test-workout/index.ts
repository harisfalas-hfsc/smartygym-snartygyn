import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ═══════════════════════════════════════════════════════════════════════════════
// EXERCISE MATCHING UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

interface ExerciseBasic {
  id: string;
  name: string;
  body_part: string;
  equipment: string;
  target: string;
}

interface MatchResult {
  exercise: ExerciseBasic;
  confidence: number;
}

/**
 * Normalize an exercise name for comparison
 */
function normalizeExerciseName(name: string): string {
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
function levenshteinDistance(a: string, b: string): number {
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
function calculateConfidence(searchNorm: string, exerciseNorm: string): number {
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
function findBestMatch(
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
function extractExerciseNames(htmlContent: string): string[] {
  const exercises: string[] = [];
  
  // Pattern 1: Bold text (often exercise names)
  const boldPattern = /<(?:strong|b)>([^<]+)<\/(?:strong|b)>/gi;
  let match;
  while ((match = boldPattern.exec(htmlContent)) !== null) {
    const text = match[1].trim();
    // Filter out non-exercise bold text
    if (text.length >= 3 && !/^\d+$/.test(text) && !/^(set|rep|rest|round|min|sec|x\s|×\s)/i.test(text)) {
      exercises.push(text);
    }
  }
  
  // Remove duplicates
  return [...new Set(exercises)];
}

/**
 * Process content and replace matched exercises with markup
 */
function processContentWithExerciseMatching(
  content: string,
  exerciseLibrary: ExerciseBasic[]
): { processedContent: string; matched: string[]; unmatched: string[] } {
  const matched: string[] = [];
  const unmatched: string[] = [];
  
  // Extract exercise names from content
  const extractedNames = extractExerciseNames(content);
  console.log(`[EXERCISE-MATCH] Extracted ${extractedNames.length} potential exercises:`, extractedNames);
  
  let processedContent = content;
  
  for (const exerciseName of extractedNames) {
    const matchResult = findBestMatch(exerciseName, exerciseLibrary, 0.75);
    
    if (matchResult) {
      // Replace the exercise name with markup
      const markup = `{{exercise:${matchResult.exercise.id}:${matchResult.exercise.name}}}`;
      // Replace within bold tags
      const originalPattern = new RegExp(`(<strong>)${escapeRegExp(exerciseName)}(</strong>)`, 'gi');
      processedContent = processedContent.replace(originalPattern, `$1${markup}$2`);
      
      matched.push(`${exerciseName} → ${matchResult.exercise.name} (${(matchResult.confidence * 100).toFixed(0)}%)`);
      console.log(`[EXERCISE-MATCH] ✓ MATCHED: "${exerciseName}" → "${matchResult.exercise.name}" (confidence: ${(matchResult.confidence * 100).toFixed(0)}%)`);
    } else {
      unmatched.push(exerciseName);
      console.log(`[EXERCISE-MATCH] ✗ UNMATCHED: "${exerciseName}"`);
    }
  }
  
  return { processedContent, matched, unmatched };
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ═══════════════════════════════════════════════════════════════════════════════
// AI WORKOUT GENERATION
// ═══════════════════════════════════════════════════════════════════════════════

const STRENGTH_PROMPT = `You are SMARTY, an elite fitness coach creating a STRENGTH workout.

WORKOUT NAME: "HARIS TEST FOR VIEW BUTTON"
CATEGORY: Strength
DIFFICULTY: Intermediate (3-4 stars)
EQUIPMENT: Mix of bodyweight and equipment

Create a complete strength training session following this EXACT structure:

FORMAT: REPS & SETS (Traditional strength training format)

REQUIRED SECTIONS:
1. **WARM-UP** (5-8 minutes) - Dynamic stretches and activation
2. **ACTIVATION** (3-5 minutes) - Muscle activation drills
3. **MAIN WORKOUT** - 5-6 exercises with sets x reps
4. **COOL-DOWN** (5 minutes) - Static stretches

FORMATTING RULES:
- Use <strong>Exercise Name</strong> for each exercise (wrap exercise names in bold)
- Use bullet points or numbered lists
- Include rest periods between sets
- Each exercise should have clear sets x reps notation

EXAMPLE EXERCISE FORMAT:
<strong>Barbell Back Squat</strong> - 4 sets × 8 reps (90 sec rest)

Focus on compound movements that target multiple muscle groups.
Include a mix of upper and lower body exercises.

Generate a complete, well-structured workout.`;

async function generateWithAI(prompt: string): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY is not configured");
  }

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: "You are SMARTY, an expert fitness coach. Generate workout content in HTML format." },
        { role: "user", content: prompt }
      ],
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[AI ERROR]", response.status, errorText);
    throw new Error(`AI generation failed: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════════════════════

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[TEST-WORKOUT] Starting test workout generation...");
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Step 1: Fetch all exercises from the library
    console.log("[TEST-WORKOUT] Fetching exercise library...");
    const { data: exercises, error: exercisesError } = await supabase
      .from('exercises')
      .select('id, name, body_part, equipment, target');
    
    if (exercisesError) {
      throw new Error(`Failed to fetch exercises: ${exercisesError.message}`);
    }
    
    console.log(`[TEST-WORKOUT] Loaded ${exercises?.length || 0} exercises from library`);

    // Step 2: Generate workout content with AI
    console.log("[TEST-WORKOUT] Generating workout with AI...");
    const aiContent = await generateWithAI(STRENGTH_PROMPT);
    console.log("[TEST-WORKOUT] AI generated content length:", aiContent.length);

    // Step 3: Process content and match exercises
    console.log("[TEST-WORKOUT] Matching exercises to library...");
    
    const { processedContent: processedMainWorkout, matched: matchedMain, unmatched: unmatchedMain } = 
      processContentWithExerciseMatching(aiContent, exercises || []);

    console.log("[TEST-WORKOUT] ═══════════════════════════════════════════════════");
    console.log("[TEST-WORKOUT] MATCHING RESULTS:");
    console.log("[TEST-WORKOUT] MATCHED:", matchedMain);
    console.log("[TEST-WORKOUT] UNMATCHED:", unmatchedMain);
    console.log("[TEST-WORKOUT] ═══════════════════════════════════════════════════");

    // Step 4: Create the workout in admin_workouts
    const workoutId = crypto.randomUUID();
    const today = new Date().toISOString().split('T')[0];
    
    const workoutData = {
      id: workoutId,
      name: "HARIS TEST FOR VIEW BUTTON",
      type: "strength",
      category: "STRENGTH",
      description: "Test workout to verify exercise library matching and View button functionality",
      difficulty: "Intermediate",
      difficulty_stars: 3,
      duration: "45-60 min",
      equipment: "EQUIPMENT",
      format: "REPS & SETS",
      focus: "Full Body Strength",
      is_visible: true,
      is_free: true,
      is_premium: false,
      is_ai_generated: true,
      is_workout_of_day: false,
      main_workout: processedMainWorkout,
      warm_up: null,
      cool_down: null,
      activation: null,
      instructions: `<p>This is a test workout to verify the exercise library integration.</p>
<p><strong>Matched exercises:</strong> ${matchedMain.length}</p>
<p><strong>Unmatched exercises:</strong> ${unmatchedMain.length}</p>
<p>Unmatched: ${unmatchedMain.join(', ') || 'None'}</p>`,
      tips: null,
      notes: `Generated for testing. Matched: ${matchedMain.length}, Unmatched: ${unmatchedMain.length}`,
      generated_for_date: today,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log("[TEST-WORKOUT] Saving workout to database...");
    const { error: insertError } = await supabase
      .from('admin_workouts')
      .insert(workoutData);

    if (insertError) {
      throw new Error(`Failed to insert workout: ${insertError.message}`);
    }

    console.log("[TEST-WORKOUT] ✓ Workout created successfully!");
    console.log("[TEST-WORKOUT] Workout ID:", workoutId);

    return new Response(
      JSON.stringify({
        success: true,
        workoutId,
        workoutName: "HARIS TEST FOR VIEW BUTTON",
        matchingResults: {
          totalExtracted: matchedMain.length + unmatchedMain.length,
          matched: matchedMain,
          unmatched: unmatchedMain,
        },
        message: "Test workout created successfully! Check /admin to view it."
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[TEST-WORKOUT] Error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
