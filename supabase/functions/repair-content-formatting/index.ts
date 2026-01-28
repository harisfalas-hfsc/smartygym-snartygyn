import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RepairResult {
  totalProcessed: number;
  workoutsRepaired: number;
  programsRepaired: number;
  iconsFixed: number;
  spacingFixed: number;
  listsNormalized: number;
  quotesFixed: number;
  repairedIds: string[];
  skippedIds: string[];
  errors: { id: string; error: string }[];
  timestamp: string;
}

// Categories that should NOT have sections injected (standalone formats)
const STANDALONE_CATEGORIES = ['CHALLENGE'];

// Fix single-quote attributes to double quotes
function fixQuoteAttributes(content: string): { content: string; quotesFixed: number } {
  let quotesFixed = 0;
  
  const result = content.replace(
    /(\s(?:class|id|style|data-\w+))='([^']*)'/gi,
    (match, attr, value) => {
      quotesFixed++;
      return `${attr}="${value}"`;
    }
  );
  
  return { content: result, quotesFixed };
}

// Remove leading empty paragraphs
function removeLeadingEmptyParagraphs(content: string): string {
  return content.replace(/^(?:\s*<p[^>]*>\s*<\/p>\s*)+/, '');
}

// Remove excessive consecutive empty paragraphs (keep max 1)
function removeExcessiveEmptyParagraphs(content: string): { content: string; spacingFixed: number } {
  let spacingFixed = 0;
  let result = content;
  
  // Keep replacing double empty paragraphs with single until no more doubles exist
  const pattern = /<p class="tiptap-paragraph"><\/p>\s*<p class="tiptap-paragraph"><\/p>/gi;
  while (pattern.test(result)) {
    result = result.replace(pattern, '<p class="tiptap-paragraph"></p>');
    spacingFixed++;
    pattern.lastIndex = 0; // Reset regex for next test
  }
  
  return { content: result, spacingFixed };
}

// Normalize lists - add TipTap classes to plain ul/li
function normalizeLists(content: string): { content: string; listsNormalized: number } {
  let listsNormalized = 0;
  let result = content;
  
  // Add tiptap-bullet-list class to <ul> without it
  result = result.replace(/<ul(?![^>]*class)/gi, () => {
    listsNormalized++;
    return '<ul class="tiptap-bullet-list"';
  });
  
  // Ensure ul with class has tiptap-bullet-list
  result = result.replace(/<ul\s+class="([^"]*)"/gi, (match, classes) => {
    if (!classes.includes('tiptap-bullet-list')) {
      listsNormalized++;
      return `<ul class="${classes} tiptap-bullet-list"`;
    }
    return match;
  });
  
  // Add tiptap-list-item class to <li> without it
  result = result.replace(/<li(?![^>]*class)/gi, () => {
    return '<li class="tiptap-list-item"';
  });
  
  return { content: result, listsNormalized };
}

// Fix duplicate icons (icon outside AND inside tags)
function fixDuplicateIcons(content: string): { content: string; iconsFixed: number } {
  let iconsFixed = 0;
  let result = content;
  
  const iconPatterns = [
    { icon: '🔥', pattern: /🔥\s*<(strong|b)>\s*🔥/gi },
    { icon: '💪', pattern: /💪\s*<(strong|b)>\s*💪/gi },
    { icon: '⚡', pattern: /⚡\s*<(strong|b)>\s*⚡/gi },
    { icon: '🧘', pattern: /🧘\s*<(strong|b)>\s*🧘/gi },
  ];
  
  for (const { icon, pattern } of iconPatterns) {
    result = result.replace(pattern, (match, tag) => {
      iconsFixed++;
      return `${icon} <${tag}>`;
    });
  }
  
  return { content: result, iconsFixed };
}

// Main repair function for a workout - DOES NOT inject sections
function repairWorkout(workout: { id: string; name: string; main_workout: string | null; category?: string }): { 
  repaired: boolean; 
  newContent: string | null;
  stats: { iconsFixed: number; spacingFixed: number; listsNormalized: number; quotesFixed: number };
} {
  let content = workout.main_workout || '';
  const stats = { iconsFixed: 0, spacingFixed: 0, listsNormalized: 0, quotesFixed: 0 };
  
  if (!content) {
    return { repaired: false, newContent: null, stats };
  }
  
  let modified = false;
  const originalContent = content;
  
  // 1. Fix quote attributes
  const quoteResult = fixQuoteAttributes(content);
  if (quoteResult.quotesFixed > 0) {
    content = quoteResult.content;
    stats.quotesFixed = quoteResult.quotesFixed;
  }
  
  // 2. Remove leading empty paragraphs
  content = removeLeadingEmptyParagraphs(content);
  
  // 3. Fix duplicate icons
  const iconResult = fixDuplicateIcons(content);
  if (iconResult.iconsFixed > 0) {
    content = iconResult.content;
    stats.iconsFixed = iconResult.iconsFixed;
  }
  
  // 4. Remove excessive empty paragraphs
  const spacingResult = removeExcessiveEmptyParagraphs(content);
  if (spacingResult.spacingFixed > 0) {
    content = spacingResult.content;
    stats.spacingFixed = spacingResult.spacingFixed;
  }
  
  // 5. Normalize lists (add TipTap classes)
  const listResult = normalizeLists(content);
  if (listResult.listsNormalized > 0) {
    content = listResult.content;
    stats.listsNormalized = listResult.listsNormalized;
  }
  
  // Check if any actual changes were made
  modified = content !== originalContent;
  
  return {
    repaired: modified,
    newContent: modified ? content : null,
    stats,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body for options
    let batchSize = 25;
    let offset = 0;
    let targetId: string | null = null;
    
    try {
      const body = await req.json();
      batchSize = body?.batchSize || 25;
      offset = body?.offset || 0;
      targetId = body?.targetId || null;
    } catch {
      // Use defaults
    }

    console.log(`[REPAIR] Starting content repair. Batch: ${batchSize}, Offset: ${offset}, Target: ${targetId || 'all'}`);

    const result: RepairResult = {
      totalProcessed: 0,
      workoutsRepaired: 0,
      programsRepaired: 0,
      iconsFixed: 0,
      spacingFixed: 0,
      listsNormalized: 0,
      quotesFixed: 0,
      repairedIds: [],
      skippedIds: [],
      errors: [],
      timestamp: new Date().toISOString(),
    };

    // If targeting a specific ID
    if (targetId) {
      const { data: workout, error } = await supabase
        .from("admin_workouts")
        .select("id, name, main_workout, category")
        .eq("id", targetId)
        .single();

      if (error || !workout) {
        return new Response(JSON.stringify({ error: `Workout ${targetId} not found` }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        });
      }

      const repairResult = repairWorkout(workout);
      result.totalProcessed = 1;

      if (repairResult.repaired && repairResult.newContent) {
        const { error: updateError } = await supabase
          .from("admin_workouts")
          .update({ main_workout: repairResult.newContent })
          .eq("id", targetId);

        if (updateError) {
          result.errors.push({ id: targetId, error: updateError.message });
        } else {
          result.workoutsRepaired = 1;
          result.repairedIds.push(targetId);
          result.iconsFixed = repairResult.stats.iconsFixed;
          result.spacingFixed = repairResult.stats.spacingFixed;
          result.listsNormalized = repairResult.stats.listsNormalized;
          result.quotesFixed = repairResult.stats.quotesFixed;
        }
      } else {
        result.skippedIds.push(targetId);
      }

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Batch processing for all workouts
    const { data: workouts, error: workoutsError } = await supabase
      .from("admin_workouts")
      .select("id, name, main_workout, category")
      .range(offset, offset + batchSize - 1)
      .order("created_at", { ascending: true });

    if (workoutsError) throw workoutsError;

    console.log(`[REPAIR] Processing ${workouts?.length || 0} workouts`);

    for (const workout of workouts || []) {
      result.totalProcessed++;
      
      try {
        const repairResult = repairWorkout(workout);
        
        if (repairResult.repaired && repairResult.newContent) {
          const { error: updateError } = await supabase
            .from("admin_workouts")
            .update({ main_workout: repairResult.newContent })
            .eq("id", workout.id);

          if (updateError) {
            result.errors.push({ id: workout.id, error: updateError.message });
          } else {
            result.workoutsRepaired++;
            result.repairedIds.push(workout.id);
            result.iconsFixed += repairResult.stats.iconsFixed;
            result.spacingFixed += repairResult.stats.spacingFixed;
            result.listsNormalized += repairResult.stats.listsNormalized;
            result.quotesFixed += repairResult.stats.quotesFixed;
          }
        } else {
          result.skippedIds.push(workout.id);
        }
      } catch (e) {
        const errMsg = e instanceof Error ? e.message : String(e);
        result.errors.push({ id: workout.id, error: errMsg });
      }
    }

    console.log(`[REPAIR] Complete. Repaired ${result.workoutsRepaired} workouts`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[REPAIR] Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
