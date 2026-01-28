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
  iconsAdded: number;
  sectionsAdded: number;
  listsNormalized: number;
  quotesFixed: number;
  repairedIds: string[];
  skippedIds: string[];
  errors: { id: string; error: string }[];
  timestamp: string;
}

// Section templates for missing sections
const SECTION_TEMPLATES = {
  warmUp: `<p class="tiptap-paragraph">🔥 <strong><u>Warm Up 10'</u></strong></p>
<ul class="tiptap-bullet-list">
<li class="tiptap-list-item"><p class="tiptap-paragraph">Light cardio 3-5 minutes (jumping jacks, jogging in place)</p></li>
<li class="tiptap-list-item"><p class="tiptap-paragraph">Dynamic stretches 3-5 minutes (arm circles, leg swings, hip circles)</p></li>
<li class="tiptap-list-item"><p class="tiptap-paragraph">Movement prep specific to today's workout</p></li>
</ul>
<p class="tiptap-paragraph"></p>`,
  
  finisher: `<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph">⚡ <strong><u>Finisher</u></strong></p>
<ul class="tiptap-bullet-list">
<li class="tiptap-list-item"><p class="tiptap-paragraph">Complete 3 rounds:</p></li>
</ul>
<p class="tiptap-paragraph">20 Mountain Climbers - 15 Air Squats - 10 Push-ups</p>
<p class="tiptap-paragraph"></p>`,
  
  coolDown: `<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph">🧘 <strong><u>Cool Down 5-10'</u></strong></p>
<ul class="tiptap-bullet-list">
<li class="tiptap-list-item"><p class="tiptap-paragraph">Static stretching for all major muscle groups</p></li>
<li class="tiptap-list-item"><p class="tiptap-paragraph">Deep breathing and relaxation</p></li>
<li class="tiptap-list-item"><p class="tiptap-paragraph">Foam rolling (optional)</p></li>
</ul>`,
};

// Icon patterns for detection
const SECTION_ICON_MAP: Record<string, { pattern: RegExp; icon: string }> = {
  warmUp: { pattern: /(?:warm[-\s]?up|activation|soft[-\s]?tissue)/i, icon: '🔥' },
  mainWorkout: { pattern: /main[-\s]?workout/i, icon: '💪' },
  finisher: { pattern: /finisher/i, icon: '⚡' },
  coolDown: { pattern: /cool[-\s]?down/i, icon: '🧘' },
};

// Add icons to section headers that are missing them
function addMissingSectionIcons(content: string): { content: string; iconsAdded: number } {
  let iconsAdded = 0;
  let result = content;
  
  for (const [sectionKey, { pattern, icon }] of Object.entries(SECTION_ICON_MAP)) {
    // Find section headers without the icon
    // Match patterns like: <strong><u>Warm Up</u></strong> or <strong>Main Workout</strong>
    const headerPattern = new RegExp(
      `(<(?:p|strong|b)[^>]*>\\s*)((?:<strong[^>]*>\\s*)?(?:<u>\\s*)?)` +
      `(${pattern.source})` +
      `((?:\\s*<\/u>)?(?:\\s*<\/strong>)?[^<]*<)`,
      'gi'
    );
    
    result = result.replace(headerPattern, (match, prefix, tags, title, suffix) => {
      // Check if icon already exists nearby
      if (match.includes(icon)) {
        return match;
      }
      iconsAdded++;
      return `${prefix}${icon} ${tags}${title}${suffix}`;
    });
  }
  
  return { content: result, iconsAdded };
}

// Convert plain <ul><li> to TipTap-classed lists
function normalizeLists(content: string): { content: string; listsNormalized: number } {
  let listsNormalized = 0;
  let result = content;
  
  // Add tiptap-bullet-list class to <ul> without it
  result = result.replace(/<ul(?![^>]*class)/gi, (match) => {
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
  result = result.replace(/<li(?![^>]*class)/gi, (match) => {
    return '<li class="tiptap-list-item"';
  });
  
  // Ensure li content is wrapped in <p> if not already
  result = result.replace(
    /<li class="tiptap-list-item">([^<][^]*?)<\/li>/gi,
    (match, content) => {
      // If content doesn't start with <p, wrap it
      if (!content.trim().startsWith('<p')) {
        return `<li class="tiptap-list-item"><p class="tiptap-paragraph">${content.trim()}</p></li>`;
      }
      return match;
    }
  );
  
  return { content: result, listsNormalized };
}

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

// Check if section exists in content
function hasSection(content: string, pattern: RegExp): boolean {
  return pattern.test(content);
}

// Main repair function for a workout
function repairWorkout(workout: any): { 
  repaired: boolean; 
  newContent: string | null;
  stats: { iconsAdded: number; sectionsAdded: number; listsNormalized: number; quotesFixed: number };
} {
  let content = workout.main_workout || '';
  const stats = { iconsAdded: 0, sectionsAdded: 0, listsNormalized: 0, quotesFixed: 0 };
  
  if (!content) {
    return { repaired: false, newContent: null, stats };
  }
  
  let modified = false;
  
  // 1. Fix quote attributes
  const quoteResult = fixQuoteAttributes(content);
  if (quoteResult.quotesFixed > 0) {
    content = quoteResult.content;
    stats.quotesFixed = quoteResult.quotesFixed;
    modified = true;
  }
  
  // 2. Remove leading empty paragraphs
  const cleanedContent = removeLeadingEmptyParagraphs(content);
  if (cleanedContent !== content) {
    content = cleanedContent;
    modified = true;
  }
  
  // 3. Add missing icons to existing section headers
  const iconResult = addMissingSectionIcons(content);
  if (iconResult.iconsAdded > 0) {
    content = iconResult.content;
    stats.iconsAdded = iconResult.iconsAdded;
    modified = true;
  }
  
  // 4. Normalize lists (add TipTap classes)
  const listResult = normalizeLists(content);
  if (listResult.listsNormalized > 0) {
    content = listResult.content;
    stats.listsNormalized = listResult.listsNormalized;
    modified = true;
  }
  
  // 5. Add missing sections (only if workout has main_workout content)
  // Check for Warm-Up
  if (!hasSection(content, /(?:warm[-\s]?up|activation|soft[-\s]?tissue)/i)) {
    content = SECTION_TEMPLATES.warmUp + content;
    stats.sectionsAdded++;
    modified = true;
  }
  
  // Check for Main Workout header (add if missing but keep existing content)
  if (!hasSection(content, /main[-\s]?workout/i)) {
    // Find where warm-up ends and add main workout header
    const warmUpEndMatch = content.match(/<\/ul>\s*<p[^>]*>\s*<\/p>\s*/i);
    if (warmUpEndMatch) {
      const insertPos = content.indexOf(warmUpEndMatch[0]) + warmUpEndMatch[0].length;
      const mainWorkoutHeader = '<p class="tiptap-paragraph">💪 <strong><u>Main Workout</u></strong></p>\n<p class="tiptap-paragraph"></p>\n';
      content = content.slice(0, insertPos) + mainWorkoutHeader + content.slice(insertPos);
      stats.sectionsAdded++;
      modified = true;
    }
  }
  
  // Check for Finisher
  if (!hasSection(content, /finisher/i)) {
    // Add finisher before cool-down if it exists, otherwise at end
    const coolDownMatch = content.match(/<p[^>]*>🧘|cool[-\s]?down/i);
    if (coolDownMatch && coolDownMatch.index !== undefined) {
      content = content.slice(0, coolDownMatch.index) + SECTION_TEMPLATES.finisher + content.slice(coolDownMatch.index);
    } else {
      content = content + SECTION_TEMPLATES.finisher;
    }
    stats.sectionsAdded++;
    modified = true;
  }
  
  // Check for Cool-Down
  if (!hasSection(content, /cool[-\s]?down/i)) {
    content = content + SECTION_TEMPLATES.coolDown;
    stats.sectionsAdded++;
    modified = true;
  }
  
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
    let repairWorkoutsFlag = true;
    let repairProgramsFlag = true;
    
    try {
      const body = await req.json();
      batchSize = body?.batchSize || 25;
      offset = body?.offset || 0;
      targetId = body?.targetId || null;
      repairWorkoutsFlag = body?.repairWorkouts !== false;
      repairProgramsFlag = body?.repairPrograms !== false;
    } catch {
      // Use defaults
    }

    console.log(`[REPAIR] Starting content repair. Batch: ${batchSize}, Offset: ${offset}, Target: ${targetId || 'all'}`);

    const result: RepairResult = {
      totalProcessed: 0,
      workoutsRepaired: 0,
      programsRepaired: 0,
      iconsAdded: 0,
      sectionsAdded: 0,
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
        .select("id, name, main_workout")
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
          result.iconsAdded = repairResult.stats.iconsAdded;
          result.sectionsAdded = repairResult.stats.sectionsAdded;
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
    if (repairWorkoutsFlag) {
      const { data: workouts, error: workoutsError } = await supabase
        .from("admin_workouts")
        .select("id, name, main_workout")
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
              result.iconsAdded += repairResult.stats.iconsAdded;
              result.sectionsAdded += repairResult.stats.sectionsAdded;
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
