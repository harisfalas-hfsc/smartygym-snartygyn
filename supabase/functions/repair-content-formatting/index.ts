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

// ═══════════════════════════════════════════════════════════════════════════════
// GOLD STANDARD FORMAT REPAIR V2
// Fixes: duplicate icons, excessive spacing, quote attributes
// Does NOT inject sections - only cleans existing content
// ═══════════════════════════════════════════════════════════════════════════════

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

// Remove leading empty paragraphs (content should start with actual content)
function removeLeadingEmptyParagraphs(content: string): string {
  return content.replace(/^(?:\s*<p[^>]*>\s*<\/p>\s*)+/, '');
}

// Remove trailing empty paragraphs
function removeTrailingEmptyParagraphs(content: string): string {
  return content.replace(/(?:\s*<p[^>]*>\s*<\/p>\s*)+$/, '');
}

// Collapse excessive consecutive empty paragraphs to max 1
function collapseExcessiveEmptyParagraphs(content: string): { content: string; spacingFixed: number } {
  let spacingFixed = 0;
  let result = content;
  
  // Replace 2+ consecutive empty paragraphs with just one
  const pattern = /(<p[^>]*>\s*<\/p>\s*){2,}/gi;
  result = result.replace(pattern, (match) => {
    spacingFixed++;
    return '<p class="tiptap-paragraph"></p>';
  });
  
  return { content: result, spacingFixed };
}

// Remove empty paragraphs between exercises within a section
// Keep only empty paragraphs that appear after section headers (indicated by icons)
function removeIntraSectionEmptyParagraphs(content: string): { content: string; spacingFixed: number } {
  let spacingFixed = 0;
  let result = content;
  
  // Remove empty paragraphs that appear between list items or between plain exercise lines
  // Pattern: </li> followed by empty paragraph followed by <li>
  result = result.replace(/<\/li>\s*<p class="tiptap-paragraph"><\/p>\s*<li/gi, () => {
    spacingFixed++;
    return '</li><li';
  });
  
  // Pattern: </ul> followed by empty paragraph followed by <p> that doesn't have an icon
  // (empty paragraphs after lists but before non-section-header paragraphs)
  result = result.replace(/<\/ul>\s*<p class="tiptap-paragraph"><\/p>\s*<p class="tiptap-paragraph">(?![🔥💪⚡🧘])/gi, () => {
    spacingFixed++;
    return '</ul><p class="tiptap-paragraph">';
  });
  
  return { content: result, spacingFixed };
}

// Fix duplicate icons - handles multiple patterns:
// 1. 🔥 <strong>🔥 → 🔥 <strong>
// 2. 🔥 <p><strong>🔥 → <p>🔥 <strong>
// 3. 💪 <p class="tiptap-paragraph">🔥 → <p class="tiptap-paragraph">💪
function fixDuplicateIcons(content: string): { content: string; iconsFixed: number } {
  let iconsFixed = 0;
  let result = content;
  
  const icons = ['🔥', '💪', '⚡', '🧘'];
  
  for (const icon of icons) {
    // Pattern 1: icon directly before <strong> or <b> followed by same icon inside
    // e.g., 🔥 <strong>🔥 → 🔥 <strong>
    const p1 = new RegExp(`${icon}\\s*<(strong|b)>\\s*${icon}`, 'gi');
    result = result.replace(p1, (match, tag) => {
      iconsFixed++;
      return `${icon} <${tag}>`;
    });
    
    // Pattern 2: icon before paragraph tag, same icon inside paragraph
    // e.g., 💪 <p class="tiptap-paragraph">💪 → <p class="tiptap-paragraph">💪
    const p2 = new RegExp(`${icon}\\s*<p([^>]*)>\\s*${icon}`, 'gi');
    result = result.replace(p2, (match, attrs) => {
      iconsFixed++;
      return `<p${attrs}>${icon}`;
    });
    
    // Pattern 3: Stray icon outside paragraph followed by same icon inside
    // e.g., 🔥 <p class="tiptap-paragraph"><strong><u>🔥 → <p class="tiptap-paragraph">🔥 <strong><u>
    const p3 = new RegExp(`${icon}\\s*<p([^>]*)><(strong|b)><u>\\s*${icon}`, 'gi');
    result = result.replace(p3, (match, pAttrs, tag) => {
      iconsFixed++;
      return `<p${pAttrs}>${icon} <${tag}><u>`;
    });
    
    // Pattern 4: icon inside strong AND inside underline
    // e.g., <strong><u>🔥 Warm → <strong>🔥 <u>Warm (but we want icon before strong)
    // Actually for this pattern: ensure icon is before <strong><u>
    const p4 = new RegExp(`<(strong|b)><u>\\s*${icon}`, 'gi');
    result = result.replace(p4, (match, tag) => {
      // Only fix if there's no icon already before the strong
      return `${icon} <${tag}><u>`;
    });
    
    // Pattern 5: Now clean up any double icons that might have been created
    const p5 = new RegExp(`${icon}\\s*${icon}`, 'gi');
    result = result.replace(p5, () => {
      iconsFixed++;
      return icon;
    });
  }
  
  // Clean up any stray icons that ended up outside paragraph tags at line start
  for (const icon of icons) {
    const strayPattern = new RegExp(`^${icon}\\s*(?=<p)`, 'gim');
    result = result.replace(strayPattern, () => {
      iconsFixed++;
      return '';
    });
  }
  
  return { content: result, iconsFixed };
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
  
  // Add tiptap-paragraph class to <p> without it
  result = result.replace(/<p(?![^>]*class)/gi, () => {
    return '<p class="tiptap-paragraph"';
  });
  
  return { content: result, listsNormalized };
}

// Convert plain paragraph exercises to bullet list format
// This identifies exercise lines (lines that contain exercise descriptions) and wraps them in ul/li
function convertExercisesToBulletLists(content: string): { content: string; listsCreated: number } {
  let listsCreated = 0;
  
  // Don't convert if already has bullet lists
  if (content.includes('<ul') && content.includes('<li')) {
    return { content, listsCreated: 0 };
  }
  
  // Split content into lines
  const lines = content.split(/(<p[^>]*>.*?<\/p>)/gi).filter(Boolean);
  const result: string[] = [];
  let inExerciseBlock = false;
  let exerciseLines: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Check if this is a section header (has icon or is a bold header)
    const isSectionHeader = /^<p[^>]*>(?:🔥|💪|⚡|🧘|<strong>)/.test(line);
    const isEmpty = /<p[^>]*>\s*<\/p>/.test(line);
    
    // Check if this is an exercise line (plain paragraph with exercise content)
    const isExerciseLine = /<p class="tiptap-paragraph">([^<]+)<\/p>/.test(line) && 
                           !isSectionHeader && 
                           !isEmpty &&
                           !/<strong>.*?:.*?<\/strong>/.test(line); // Not a round/minute header
    
    if (isExerciseLine && !inExerciseBlock) {
      // Start collecting exercise lines
      inExerciseBlock = true;
      exerciseLines = [line];
    } else if (isExerciseLine && inExerciseBlock) {
      // Continue collecting
      exerciseLines.push(line);
    } else {
      // Not an exercise line - flush collected exercises as bullet list
      if (exerciseLines.length > 0) {
        listsCreated++;
        const listItems = exerciseLines.map(ex => {
          const match = ex.match(/<p class="tiptap-paragraph">([^<]+)<\/p>/i);
          if (match) {
            return `<li class="tiptap-list-item"><p class="tiptap-paragraph">${match[1].trim()}</p></li>`;
          }
          return '';
        }).filter(Boolean).join('\n');
        
        result.push(`<ul class="tiptap-bullet-list">\n${listItems}\n</ul>`);
        exerciseLines = [];
        inExerciseBlock = false;
      }
      result.push(line);
    }
  }
  
  // Flush any remaining exercises
  if (exerciseLines.length > 0) {
    listsCreated++;
    const listItems = exerciseLines.map(ex => {
      const match = ex.match(/<p class="tiptap-paragraph">([^<]+)<\/p>/i);
      if (match) {
        return `<li class="tiptap-list-item"><p class="tiptap-paragraph">${match[1].trim()}</p></li>`;
      }
      return '';
    }).filter(Boolean).join('\n');
    
    result.push(`<ul class="tiptap-bullet-list">\n${listItems}\n</ul>`);
  }
  
  return { content: result.join('\n'), listsCreated };
}

// Main repair function for a workout - GOLD STANDARD V2 WITH BULLETS
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
  
  const originalContent = content;
  
  // Step 1: Fix quote attributes (single quotes → double quotes)
  const quoteResult = fixQuoteAttributes(content);
  content = quoteResult.content;
  stats.quotesFixed = quoteResult.quotesFixed;
  
  // Step 2: Fix duplicate icons FIRST (before any spacing changes)
  const iconResult = fixDuplicateIcons(content);
  content = iconResult.content;
  stats.iconsFixed = iconResult.iconsFixed;
  
  // Step 3: Remove leading empty paragraphs
  content = removeLeadingEmptyParagraphs(content);
  
  // Step 4: Remove trailing empty paragraphs
  content = removeTrailingEmptyParagraphs(content);
  
  // Step 5: Collapse excessive consecutive empty paragraphs
  const spacingResult = collapseExcessiveEmptyParagraphs(content);
  content = spacingResult.content;
  stats.spacingFixed = spacingResult.spacingFixed;
  
  // Step 6: Remove empty paragraphs between exercises within sections
  const intraSectionResult = removeIntraSectionEmptyParagraphs(content);
  content = intraSectionResult.content;
  stats.spacingFixed += intraSectionResult.spacingFixed;
  
  // Step 7: Convert plain paragraph exercises to bullet lists
  const bulletResult = convertExercisesToBulletLists(content);
  content = bulletResult.content;
  stats.listsNormalized += bulletResult.listsCreated;
  
  // Step 8: Normalize lists (add TipTap classes to any remaining plain lists)
  const listResult = normalizeLists(content);
  content = listResult.content;
  stats.listsNormalized += listResult.listsNormalized;
  
  // Check if any actual changes were made
  const modified = content !== originalContent;
  
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

    console.log(`[REPAIR-V2] Starting content repair. Batch: ${batchSize}, Offset: ${offset}, Target: ${targetId || 'all'}`);

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

      console.log(`[REPAIR-V2] Single target complete`, result);

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

    console.log(`[REPAIR-V2] Processing ${workouts?.length || 0} workouts`);

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

    console.log(`[REPAIR-V2] Complete. Repaired ${result.workoutsRepaired} workouts`, {
      iconsFixed: result.iconsFixed,
      spacingFixed: result.spacingFixed,
      listsNormalized: result.listsNormalized,
      quotesFixed: result.quotesFixed
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[REPAIR-V2] Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});