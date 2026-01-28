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
  blankAfterHeaderFixed: number;
  sectionSeparatorsFixed: number;
  repairedIds: string[];
  skippedIds: string[];
  errors: { id: string; error: string }[];
  timestamp: string;
  dryRun?: boolean;
  preview?: { before: string; after: string };
}

// ═══════════════════════════════════════════════════════════════════════════════
// GOLD STANDARD FORMAT REPAIR V3
// Fixes:
// 1. No blank line after section title (header → first bullet immediately)
// 2. Exactly ONE blank line between sections
// 3. All exercises in bullet lists
// 4. Single icon only (no duplicates)
// 5. Double quotes for HTML attributes
// 6. Proper TipTap classes on all elements
// ═══════════════════════════════════════════════════════════════════════════════

const SECTION_ICONS = ['🔥', '💪', '⚡', '🧘'];
const SECTION_HEADER_PATTERN = new RegExp(`^<p[^>]*>\\s*(${SECTION_ICONS.join('|')})`, 'i');
const EMPTY_P_PATTERN = /<p[^>]*>\s*<\/p>/gi;
const CANONICAL_EMPTY_P = '<p class="tiptap-paragraph"></p>';

// Fix single-quote attributes to double quotes
function fixQuoteAttributes(content: string): { content: string; quotesFixed: number } {
  let quotesFixed = 0;
  const result = content.replace(
    /(\s(?:class|id|style|data-\w+))='([^']*)'/gi,
    (_, attr, value) => {
      quotesFixed++;
      return `${attr}="${value}"`;
    }
  );
  return { content: result, quotesFixed };
}

// Normalize all empty paragraphs to canonical form
function normalizeEmptyParagraphs(content: string): string {
  return content.replace(EMPTY_P_PATTERN, CANONICAL_EMPTY_P);
}

// Remove leading empty paragraphs
function removeLeadingEmptyParagraphs(content: string): string {
  return content.replace(/^(?:\s*<p[^>]*>\s*<\/p>\s*)+/, '');
}

// Remove trailing empty paragraphs
function removeTrailingEmptyParagraphs(content: string): string {
  return content.replace(/(?:\s*<p[^>]*>\s*<\/p>\s*)+$/, '');
}

// Check if a block is a section header (contains one of the 4 icons)
function isSectionHeader(block: string): boolean {
  return SECTION_ICONS.some(icon => block.includes(icon));
}

// Check if a block is an empty paragraph
function isEmptyParagraph(block: string): boolean {
  return /<p[^>]*>\s*<\/p>/.test(block);
}

// Check if a block is a bullet list
function isBulletList(block: string): boolean {
  return /<ul[^>]*>/.test(block);
}

// Fix duplicate icons - keep exactly one icon per header
function fixDuplicateIcons(content: string): { content: string; iconsFixed: number } {
  let iconsFixed = 0;
  let result = content;
  
  for (const icon of SECTION_ICONS) {
    // Pattern: icon directly before <strong> or other tags followed by same icon
    const patterns = [
      new RegExp(`${icon}\\s*<(strong|b)>\\s*${icon}`, 'gi'),
      new RegExp(`${icon}\\s*<p([^>]*)>\\s*${icon}`, 'gi'),
      new RegExp(`${icon}\\s*<p([^>]*)><(strong|b)><u>\\s*${icon}`, 'gi'),
      new RegExp(`${icon}\\s*${icon}`, 'gi'),
    ];
    
    for (const pattern of patterns) {
      result = result.replace(pattern, (match, ...groups) => {
        iconsFixed++;
        // Return just the icon with proper context
        if (match.includes('<p')) {
          const attrs = groups[0] || '';
          return `<p${attrs}>${icon}`;
        }
        if (match.includes('<strong') || match.includes('<b')) {
          return `${icon} <${groups[0]}>`;
        }
        return icon;
      });
    }
  }
  
  // Clean up stray icons outside paragraph tags
  for (const icon of SECTION_ICONS) {
    result = result.replace(new RegExp(`^${icon}\\s*(?=<p)`, 'gim'), '');
  }
  
  return { content: result, iconsFixed };
}

// Add TipTap classes to elements that lack them
function addTipTapClasses(content: string): { content: string; listsNormalized: number } {
  let listsNormalized = 0;
  let result = content;
  
  // Add tiptap-bullet-list to <ul> without it
  result = result.replace(/<ul(?![^>]*class)/gi, () => {
    listsNormalized++;
    return '<ul class="tiptap-bullet-list"';
  });
  
  // Ensure <ul> with class has tiptap-bullet-list
  result = result.replace(/<ul\s+class="([^"]*)"/gi, (match, classes) => {
    if (!classes.includes('tiptap-bullet-list')) {
      listsNormalized++;
      return `<ul class="${classes} tiptap-bullet-list"`;
    }
    return match;
  });
  
  // Add tiptap-list-item to <li> without it
  result = result.replace(/<li(?![^>]*class)/gi, '<li class="tiptap-list-item"');
  
  // Add tiptap-paragraph to <p> without it
  result = result.replace(/<p(?![^>]*class)/gi, '<p class="tiptap-paragraph"');
  
  return { content: result, listsNormalized };
}

// Convert plain paragraph exercises to bullet list format
function convertExercisesToBulletLists(content: string): { content: string; listsCreated: number } {
  let listsCreated = 0;
  
  // Split into blocks (paragraphs and lists)
  const blocks = content.split(/(<\/?(?:p|ul|li)[^>]*>)/gi).filter(Boolean);
  const result: string[] = [];
  let inList = false;
  let listBuffer: string[] = [];
  let currentPContent = '';
  let inParagraph = false;
  
  // Simpler approach: find consecutive exercise paragraphs and wrap them
  const segments = content.split(/(<ul[^>]*>[\s\S]*?<\/ul>)/gi);
  const processed: string[] = [];
  
  for (const segment of segments) {
    if (segment.startsWith('<ul')) {
      // Already a list, keep as is
      processed.push(segment);
    } else {
      // Check for exercise paragraphs that should be bulletized
      const paragraphs = segment.split(/(<p[^>]*>[\s\S]*?<\/p>)/gi).filter(Boolean);
      let exerciseBuffer: string[] = [];
      
      for (const para of paragraphs) {
        const paraMatch = para.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
        
        if (!paraMatch) {
          // Not a paragraph, flush buffer and add
          if (exerciseBuffer.length > 0) {
            listsCreated++;
            const listItems = exerciseBuffer.map(text => 
              `<li class="tiptap-list-item"><p class="tiptap-paragraph">${text}</p></li>`
            ).join('');
            processed.push(`<ul class="tiptap-bullet-list">${listItems}</ul>`);
            exerciseBuffer = [];
          }
          processed.push(para);
          continue;
        }
        
        const innerContent = paraMatch[1].trim();
        
        // Check if this is a section header, empty, or special content
        const isHeader = SECTION_ICONS.some(icon => innerContent.includes(icon));
        const isEmpty = !innerContent || innerContent === '&nbsp;';
        const isSubHeader = /<strong>[^<]*<\/strong>/.test(innerContent) && !innerContent.includes('–') && innerContent.length < 50;
        const isRestInstruction = /^rest:/i.test(innerContent);
        
        if (isHeader || isEmpty || isSubHeader || isRestInstruction) {
          // Flush buffer before special content
          if (exerciseBuffer.length > 0) {
            listsCreated++;
            const listItems = exerciseBuffer.map(text => 
              `<li class="tiptap-list-item"><p class="tiptap-paragraph">${text}</p></li>`
            ).join('');
            processed.push(`<ul class="tiptap-bullet-list">${listItems}</ul>`);
            exerciseBuffer = [];
          }
          processed.push(para);
        } else {
          // This is likely an exercise - add to buffer
          exerciseBuffer.push(innerContent);
        }
      }
      
      // Flush any remaining exercises
      if (exerciseBuffer.length > 0) {
        listsCreated++;
        const listItems = exerciseBuffer.map(text => 
          `<li class="tiptap-list-item"><p class="tiptap-paragraph">${text}</p></li>`
        ).join('');
        processed.push(`<ul class="tiptap-bullet-list">${listItems}</ul>`);
      }
    }
  }
  
  return { content: processed.join(''), listsCreated };
}

// CRITICAL: Remove empty paragraphs immediately after section headers
function removeBlankAfterHeaders(content: string): { content: string; blankAfterHeaderFixed: number } {
  let blankAfterHeaderFixed = 0;
  let result = content;
  
  // First, fix whitespace in headers: <strong> <u> → <strong><u>
  result = result.replace(/<strong>\s+<u>/gi, '<strong><u>');
  result = result.replace(/<\/u>\s+<\/strong>/gi, '</u></strong>');
  
  for (const icon of SECTION_ICONS) {
    // More robust pattern: section header (containing icon anywhere) followed by empty paragraph(s)
    // Header ends with </p>, then empty <p></p>, then content starts
    const pattern = new RegExp(
      `(<p[^>]*>[^<]*${icon}[\\s\\S]*?<\\/p>)` + // Section header containing icon
      `(\\s*<p[^>]*>\\s*<\\/p>\\s*)+` + // One or more empty paragraphs
      `(?=\\s*<(?:ul|p|li))`, // Followed by content tag
      'gi'
    );
    
    result = result.replace(pattern, (match, header) => {
      blankAfterHeaderFixed++;
      return header; // Keep only the header, remove the empty paragraphs
    });
  }
  
  return { content: result, blankAfterHeaderFixed };
}

// CRITICAL: Ensure exactly one empty paragraph between sections
function enforceSectionSeparators(content: string): { content: string; sectionSeparatorsFixed: number } {
  let sectionSeparatorsFixed = 0;
  let result = content;
  
  // STEP 1: Collapse ALL consecutive empty paragraphs to exactly one (anywhere in the document)
  // This is the most important fix - catches the MULTIPLE_SEPARATORS issue
  const consecutiveEmptyPattern = /(<p[^>]*>\s*<\/p>\s*){2,}/gi;
  result = result.replace(consecutiveEmptyPattern, () => {
    sectionSeparatorsFixed++;
    return CANONICAL_EMPTY_P;
  });
  
  // STEP 2: For section headers, ensure there's exactly one empty paragraph before (not after the first)
  for (const icon of SECTION_ICONS) {
    // Add missing separator before section headers (if not the first element)
    const missingSeparatorPattern = new RegExp(
      `(</(?:ul|li)>)` + // End of list (not paragraph - those already have separators)
      `(?!\\s*<p[^>]*>\\s*<\\/p>)` + // NOT followed by empty paragraph
      `(\\s*<p[^>]*>[^<]*${icon})`, // Directly followed by section header
      'gi'
    );
    
    result = result.replace(missingSeparatorPattern, (_, endTag, headerStart) => {
      sectionSeparatorsFixed++;
      return `${endTag}${CANONICAL_EMPTY_P}${headerStart}`;
    });
  }
  
  // STEP 3: Remove separator before the FIRST section header (start of document)
  result = result.replace(/^<p class="tiptap-paragraph"><\/p>/, '');
  
  return { content: result, sectionSeparatorsFixed };
}

// Remove empty paragraphs between list items (within the same section)
function removeIntraListSpacing(content: string): { content: string; spacingFixed: number } {
  let spacingFixed = 0;
  let result = content;
  
  // Remove empty paragraphs between </li> and <li>
  result = result.replace(/<\/li>\s*<p[^>]*>\s*<\/p>\s*<li/gi, () => {
    spacingFixed++;
    return '</li><li';
  });
  
  // Remove empty paragraphs between </ul> and <ul> (consecutive lists)
  result = result.replace(/<\/ul>\s*<p[^>]*>\s*<\/p>\s*<ul/gi, () => {
    spacingFixed++;
    return '</ul><ul';
  });
  
  return { content: result, spacingFixed };
}

// Main repair function - GOLD STANDARD V3
function repairContent(content: string): {
  content: string;
  stats: {
    iconsFixed: number;
    spacingFixed: number;
    listsNormalized: number;
    quotesFixed: number;
    blankAfterHeaderFixed: number;
    sectionSeparatorsFixed: number;
  };
} {
  const stats = {
    iconsFixed: 0,
    spacingFixed: 0,
    listsNormalized: 0,
    quotesFixed: 0,
    blankAfterHeaderFixed: 0,
    sectionSeparatorsFixed: 0,
    newlinesStripped: 0,
    listsMerged: 0,
  };
  
  if (!content || !content.trim()) {
    return { content, stats };
  }
  
  let result = content;
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // STEP 0 (NEW): STRIP ALL NEWLINE CHARACTERS - This is the root cause of spacing issues
  // The "Crucible Test" has 0 newlines, broken workouts have 20+ newlines
  // ═══════════════════════════════════════════════════════════════════════════════
  const originalNewlines = (result.match(/[\n\r]/g) || []).length;
  result = result.replace(/[\n\r]+/g, ''); // Remove all newlines
  result = result.replace(/\s{2,}/g, ' '); // Collapse multiple spaces to single
  stats.newlinesStripped = originalNewlines;
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // STEP 0.5 (NEW): MERGE CONSECUTIVE <ul> BLOCKS
  // Some workouts have fragmented lists: </ul><ul> which should be one list
  // ═══════════════════════════════════════════════════════════════════════════════
  let mergeCount = 0;
  // Merge consecutive lists (with or without empty paragraphs between them)
  result = result.replace(/<\/ul>\s*(?:<p[^>]*>\s*<\/p>\s*)*<ul[^>]*>/gi, () => {
    mergeCount++;
    return ''; // Remove the boundary, merging lists
  });
  stats.listsMerged = mergeCount;
  
  // Step 1: Fix quote attributes
  const quoteResult = fixQuoteAttributes(result);
  result = quoteResult.content;
  stats.quotesFixed = quoteResult.quotesFixed;
  
  // Step 2: Fix duplicate icons
  const iconResult = fixDuplicateIcons(result);
  result = iconResult.content;
  stats.iconsFixed = iconResult.iconsFixed;
  
  // Step 3: Normalize all empty paragraphs to canonical form
  result = normalizeEmptyParagraphs(result);
  
  // Step 4: Remove leading/trailing empty paragraphs
  result = removeLeadingEmptyParagraphs(result);
  result = removeTrailingEmptyParagraphs(result);
  
  // Step 5: Add TipTap classes to elements
  const classResult = addTipTapClasses(result);
  result = classResult.content;
  stats.listsNormalized = classResult.listsNormalized;
  
  // Step 6: CRITICAL - Remove blank lines after section headers
  const blankResult = removeBlankAfterHeaders(result);
  result = blankResult.content;
  stats.blankAfterHeaderFixed = blankResult.blankAfterHeaderFixed;
  
  // Step 7: Enforce exactly one separator between sections
  const separatorResult = enforceSectionSeparators(result);
  result = separatorResult.content;
  stats.sectionSeparatorsFixed = separatorResult.sectionSeparatorsFixed;
  
  // Step 8: Remove spacing between list items
  const intraListResult = removeIntraListSpacing(result);
  result = intraListResult.content;
  stats.spacingFixed = intraListResult.spacingFixed;
  
  // Step 9: Convert any remaining exercise paragraphs to bullet lists
  // (Only for content that has sections but exercises not in lists)
  if (SECTION_ICONS.some(icon => result.includes(icon))) {
    const bulletResult = convertExercisesToBulletLists(result);
    result = bulletResult.content;
    stats.listsNormalized += bulletResult.listsCreated;
  }
  
  // Final cleanup: remove any doubled-up empty paragraphs that may have been created
  // This is a literal string match, not regex - must properly match the actual content
  let prevLength = 0;
  while (result.length !== prevLength) {
    prevLength = result.length;
    // Replace two consecutive empty paragraphs with one
    result = result.replace(/<p class="tiptap-paragraph"><\/p>\s*<p class="tiptap-paragraph"><\/p>/gi, CANONICAL_EMPTY_P);
  }
  
  // Final: ensure proper TipTap classes again after all transformations
  const finalClassResult = addTipTapClasses(result);
  result = finalClassResult.content;
  
  return { content: result, stats };
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
    let dryRun = false;
    let includePrograms = false;
    
    try {
      const body = await req.json();
      batchSize = body?.batchSize || 25;
      offset = body?.offset || 0;
      targetId = body?.targetId || null;
      dryRun = body?.dryRun === true;
      includePrograms = body?.includePrograms === true;
    } catch {
      // Use defaults
    }

    console.log(`[REPAIR-V3] Starting. Batch: ${batchSize}, Offset: ${offset}, Target: ${targetId || 'all'}, DryRun: ${dryRun}`);

    const result: RepairResult = {
      totalProcessed: 0,
      workoutsRepaired: 0,
      programsRepaired: 0,
      iconsFixed: 0,
      spacingFixed: 0,
      listsNormalized: 0,
      quotesFixed: 0,
      blankAfterHeaderFixed: 0,
      sectionSeparatorsFixed: 0,
      repairedIds: [],
      skippedIds: [],
      errors: [],
      timestamp: new Date().toISOString(),
      dryRun,
    };

    // Single target mode
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

      const originalContent = workout.main_workout || '';
      const repairResult = repairContent(originalContent);
      result.totalProcessed = 1;

      const modified = repairResult.content !== originalContent;
      
      if (dryRun) {
        result.preview = {
          before: originalContent,
          after: repairResult.content,
        };
        result.iconsFixed = repairResult.stats.iconsFixed;
        result.spacingFixed = repairResult.stats.spacingFixed;
        result.listsNormalized = repairResult.stats.listsNormalized;
        result.quotesFixed = repairResult.stats.quotesFixed;
        result.blankAfterHeaderFixed = repairResult.stats.blankAfterHeaderFixed;
        result.sectionSeparatorsFixed = repairResult.stats.sectionSeparatorsFixed;
        
        console.log(`[REPAIR-V3] DRY RUN - Would fix:`, repairResult.stats);
      } else if (modified) {
        const { error: updateError } = await supabase
          .from("admin_workouts")
          .update({ main_workout: repairResult.content })
          .eq("id", targetId);

        if (updateError) {
          result.errors.push({ id: targetId, error: updateError.message });
        } else {
          result.workoutsRepaired = 1;
          result.repairedIds.push(targetId);
          Object.assign(result, {
            iconsFixed: repairResult.stats.iconsFixed,
            spacingFixed: repairResult.stats.spacingFixed,
            listsNormalized: repairResult.stats.listsNormalized,
            quotesFixed: repairResult.stats.quotesFixed,
            blankAfterHeaderFixed: repairResult.stats.blankAfterHeaderFixed,
            sectionSeparatorsFixed: repairResult.stats.sectionSeparatorsFixed,
          });
        }
      } else {
        result.skippedIds.push(targetId);
      }

      console.log(`[REPAIR-V3] Single target complete`, result);

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

    console.log(`[REPAIR-V3] Processing ${workouts?.length || 0} workouts`);

    for (const workout of workouts || []) {
      result.totalProcessed++;
      
      try {
        const originalContent = workout.main_workout || '';
        const repairResult = repairContent(originalContent);
        const modified = repairResult.content !== originalContent;

        if (modified && !dryRun) {
          const { error: updateError } = await supabase
            .from("admin_workouts")
            .update({ main_workout: repairResult.content })
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
            result.blankAfterHeaderFixed += repairResult.stats.blankAfterHeaderFixed;
            result.sectionSeparatorsFixed += repairResult.stats.sectionSeparatorsFixed;
          }
        } else if (modified && dryRun) {
          result.workoutsRepaired++;
          result.repairedIds.push(workout.id);
          result.iconsFixed += repairResult.stats.iconsFixed;
          result.spacingFixed += repairResult.stats.spacingFixed;
          result.listsNormalized += repairResult.stats.listsNormalized;
          result.quotesFixed += repairResult.stats.quotesFixed;
          result.blankAfterHeaderFixed += repairResult.stats.blankAfterHeaderFixed;
          result.sectionSeparatorsFixed += repairResult.stats.sectionSeparatorsFixed;
        } else {
          result.skippedIds.push(workout.id);
        }
      } catch (e) {
        const errMsg = e instanceof Error ? e.message : String(e);
        result.errors.push({ id: workout.id, error: errMsg });
      }
    }

    // Process training programs if requested
    if (includePrograms) {
      const { data: programs, error: programsError } = await supabase
        .from("admin_training_programs")
        .select("id, name, weekly_schedule, program_structure")
        .range(offset, offset + batchSize - 1)
        .order("created_at", { ascending: true });

      if (!programsError && programs) {
        console.log(`[REPAIR-V3] Processing ${programs.length} programs`);

        for (const program of programs) {
          result.totalProcessed++;
          
          try {
            let programModified = false;
            const updates: Record<string, string> = {};

            // Repair weekly_schedule
            if (program.weekly_schedule) {
              const scheduleResult = repairContent(program.weekly_schedule);
              if (scheduleResult.content !== program.weekly_schedule) {
                updates.weekly_schedule = scheduleResult.content;
                programModified = true;
                result.iconsFixed += scheduleResult.stats.iconsFixed;
                result.spacingFixed += scheduleResult.stats.spacingFixed;
                result.listsNormalized += scheduleResult.stats.listsNormalized;
                result.quotesFixed += scheduleResult.stats.quotesFixed;
                result.blankAfterHeaderFixed += scheduleResult.stats.blankAfterHeaderFixed;
                result.sectionSeparatorsFixed += scheduleResult.stats.sectionSeparatorsFixed;
              }
            }

            // Repair program_structure
            if (program.program_structure) {
              const structureResult = repairContent(program.program_structure);
              if (structureResult.content !== program.program_structure) {
                updates.program_structure = structureResult.content;
                programModified = true;
                result.iconsFixed += structureResult.stats.iconsFixed;
                result.spacingFixed += structureResult.stats.spacingFixed;
                result.listsNormalized += structureResult.stats.listsNormalized;
                result.quotesFixed += structureResult.stats.quotesFixed;
                result.blankAfterHeaderFixed += structureResult.stats.blankAfterHeaderFixed;
                result.sectionSeparatorsFixed += structureResult.stats.sectionSeparatorsFixed;
              }
            }

            if (programModified && !dryRun) {
              const { error: updateError } = await supabase
                .from("admin_training_programs")
                .update(updates)
                .eq("id", program.id);

              if (updateError) {
                result.errors.push({ id: program.id, error: updateError.message });
              } else {
                result.programsRepaired++;
                result.repairedIds.push(program.id);
              }
            } else if (programModified && dryRun) {
              result.programsRepaired++;
              result.repairedIds.push(program.id);
            } else {
              result.skippedIds.push(program.id);
            }
          } catch (e) {
            const errMsg = e instanceof Error ? e.message : String(e);
            result.errors.push({ id: program.id, error: errMsg });
          }
        }
      }
    }

    console.log(`[REPAIR-V3] Complete. Repaired ${result.workoutsRepaired} workouts, ${result.programsRepaired} programs`, {
      iconsFixed: result.iconsFixed,
      spacingFixed: result.spacingFixed,
      listsNormalized: result.listsNormalized,
      quotesFixed: result.quotesFixed,
      blankAfterHeaderFixed: result.blankAfterHeaderFixed,
      sectionSeparatorsFixed: result.sectionSeparatorsFixed,
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[REPAIR-V3] Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
