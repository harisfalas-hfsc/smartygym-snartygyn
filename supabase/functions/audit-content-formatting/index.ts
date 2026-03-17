import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FormatIssue {
  id: string;
  name: string;
  category: string | null;
  type: string;
  issues: string[];
  mainWorkoutExtract: string;
}

interface AuditResult {
  totalScanned: number;
  workoutsScanned: number;
  programsScanned: number;
  
  // Section issues
  missingSections: {
    warmUp: number;
    mainWorkout: number;
    finisher: number;
    coolDown: number;
  };
  
  // Icon issues
  missingIcons: {
    warmUp: number;
    mainWorkout: number;
    finisher: number;
    coolDown: number;
  };
  
  // List issues
  exercisesNotInBulletLists: number;
  
  // Format issues
  singleQuoteAttributes: number;
  leadingEmptyParagraphs: number;
  
  // NEW: Spacing issues (Gold Standard V3)
  blankAfterSectionTitle: number;
  missingSectionSeparator: number;
  multipleSectionSeparators: number;
  exercisesOutsideLists: number;
  
  // NEW: Exercise content issues
  restOnlyMainWorkout: number;
  restOnlyFinisher: number;
  emptyMainWorkout: number;
  emptyFinisher: number;
  
  // Overall
  totalIssues: number;
  compliantItems: number;
  
  // Top offenders for review
  topOffenders: FormatIssue[];
  
  timestamp: string;
}

// Section detection patterns
const SECTION_PATTERNS = {
  softTissue: /soft[-\s]?tissue/i,
  warmUp: /(?:warm[-\s]?up|activation)/i,
  mainWorkout: /main[-\s]?workout/i,
  finisher: /finisher/i,
  coolDown: /cool[-\s]?down/i,
};

// Icon patterns (5 sections for 6 target categories)
const ICON_PATTERNS = {
  softTissue: /🧽/,
  warmUp: /🔥/,
  mainWorkout: /💪/,
  finisher: /⚡/,
  coolDown: /🧘/,
};

// 5 section icons for Gold Standard V3
const SECTION_ICONS = ['🧽', '🔥', '💪', '⚡', '🧘'];

// Categories that require 5-section structure
const FIVE_SECTION_CATEGORIES = [
  'STRENGTH',
  'CALORIE BURNING', 
  'METABOLIC',
  'CARDIO',
  'MOBILITY & STABILITY',
  'CHALLENGE'
];

// Check for section presence
function hasSection(content: string, pattern: RegExp): boolean {
  return pattern.test(content);
}

// Check for icon presence with section
function hasSectionIcon(content: string, sectionPattern: RegExp, iconPattern: RegExp): boolean {
  const match = content.match(sectionPattern);
  if (!match) return true; // Section doesn't exist, so icon issue doesn't apply
  return iconPattern.test(content);
}

// Check for single-quote HTML attributes
function hasSingleQuoteAttributes(content: string): boolean {
  return /\s(?:class|id|style|data-\w+)='[^']*'/i.test(content);
}

// Check for leading empty paragraphs
function hasLeadingEmptyParagraphs(content: string): boolean {
  return /^(?:\s*<p[^>]*>\s*<\/p>\s*)+<p/.test(content);
}

// NEW: Check for blank paragraph immediately after section header
function hasBlankAfterSectionTitle(content: string): boolean {
  for (const icon of SECTION_ICONS) {
    // Pattern: section header followed by empty paragraph
    const pattern = new RegExp(
      `<p[^>]*>${icon}[^<]*(?:<[^>]*>[^<]*)*<\\/p>\\s*<p[^>]*>\\s*<\\/p>`,
      'i'
    );
    if (pattern.test(content)) return true;
  }
  return false;
}

// NEW: Check for missing separator between sections
function hasMissingSectionSeparator(content: string): boolean {
  for (const icon of SECTION_ICONS) {
    // Pattern: content (not empty p) immediately followed by section header
    const pattern = new RegExp(
      `</(?:ul|li)>\\s*<p[^>]*>${icon}`,
      'i'
    );
    if (pattern.test(content)) return true;
  }
  return false;
}

// NEW: Check for multiple separators between sections
function hasMultipleSectionSeparators(content: string): boolean {
  for (const icon of SECTION_ICONS) {
    // Pattern: two or more empty paragraphs before section header
    const pattern = new RegExp(
      `(<p[^>]*>\\s*<\\/p>\\s*){2,}<p[^>]*>${icon}`,
      'i'
    );
    if (pattern.test(content)) return true;
  }
  return false;
}

// NEW: Check for exercise paragraphs outside bullet lists
function hasExercisesOutsideLists(content: string): boolean {
  if (!content) return false;
  
  // If content has section icons, check for plain paragraphs between sections
  // that look like exercises (not empty, not headers)
  for (const icon of SECTION_ICONS) {
    if (!content.includes(icon)) continue;
    
  // Find paragraphs between section headers that aren't in lists
    const exercisePattern = /<p class="tiptap-paragraph">(?!<strong>)[A-Z][^<]{10,}<\/p>/;
    const afterSectionPattern = new RegExp(
      `<p[^>]*>${icon}[^<]*<\\/p>\\s*<p class="tiptap-paragraph">(?!<strong>)[A-Z]`,
      'i'
    );
    
    if (afterSectionPattern.test(content)) return true;
  }
  
  return false;
}

// NEW: Count {{exercise:...}} tags between two section icons
function countExerciseTagsBetweenIcons(content: string, startIcon: string, endIcon: string | null): number {
  const startIdx = content.indexOf(startIcon);
  if (startIdx === -1) return 0;
  
  let endIdx: number;
  if (endIcon) {
    endIdx = content.indexOf(endIcon, startIdx + 1);
    if (endIdx === -1) endIdx = content.length;
  } else {
    endIdx = content.length;
  }
  
  const section = content.substring(startIdx, endIdx);
  const matches = section.match(/\{\{exercise:/g);
  return matches ? matches.length : 0;
}

// NEW: Check if section content is only rest instructions (no exercises)
function isSectionRestOnly(content: string, startIcon: string, endIcon: string | null): boolean {
  const startIdx = content.indexOf(startIcon);
  if (startIdx === -1) return false;
  
  let endIdx: number;
  if (endIcon) {
    endIdx = content.indexOf(endIcon, startIdx + 1);
    if (endIdx === -1) endIdx = content.length;
  } else {
    endIdx = content.length;
  }
  
  const section = content.substring(startIdx, endIdx);
  
  // Has no exercise tags AND contains rest instructions
  const hasExerciseTags = /\{\{exercise:/.test(section);
  const hasRestInstructions = /rest\s+\d/i.test(section);
  const hasListItems = /<li/i.test(section);
  
  return !hasExerciseTags && hasRestInstructions && hasListItems;
}

// Detect if content has proper bullet lists for exercises
function hasBulletListIssues(content: string): boolean {
  if (!content) return false;
  
  // Numbered lists like "1. Exercise"
  const numberedPattern = /(?:^|\n|<br\s*\/?>)\s*\d+\.\s*[A-Z][a-z]/;
  
  // Lines starting with "• " or "- " inside paragraphs
  const inlineBulletPattern = /<p[^>]*>(?:•|-)\s+[A-Za-z]/;
  
  // Check if content has <ul> at all
  const hasUl = /<ul[^>]*>/.test(content);
  
  // Exercise sequences without <ul>
  const exerciseSequencePattern = /<p[^>]*>[A-Z][a-z]+(?:\s+[A-Za-z]+){0,4}(?:\s*-\s*\d+\s*(?:reps?|sets?|min|sec))?<\/p>\s*<p[^>]*>[A-Z][a-z]+/;
  
  if (!hasUl && exerciseSequencePattern.test(content)) {
    return true;
  }
  
  return numberedPattern.test(content) || inlineBulletPattern.test(content);
}

function auditWorkout(workout: any): FormatIssue | null {
  const issues: string[] = [];
  const content = workout.main_workout || '';
  const category = workout.category || '';
  
  // Determine if this workout should have the 5-section structure
  const requiresFiveSections = FIVE_SECTION_CATEGORIES.includes(category);
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // NEW: Check for literal newlines/carriage returns (the #1 cause of spacing bugs)
  // ═══════════════════════════════════════════════════════════════════════════════
  if (/[\n\r]/.test(content)) {
    issues.push('Contains newline characters (causes visible gaps)');
  }
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // NEW: Check for whitespace between tags (the #2 cause of spacing bugs)
  // ═══════════════════════════════════════════════════════════════════════════════
  if (/>\s+</.test(content)) {
    issues.push('Whitespace between HTML tags');
  }
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // 5-SECTION STRUCTURE CHECK (only for 6 target categories)
  // ═══════════════════════════════════════════════════════════════════════════════
  if (requiresFiveSections) {
    // Check for 🧽 Soft Tissue Preparation
    if (!hasSection(content, SECTION_PATTERNS.softTissue) && !ICON_PATTERNS.softTissue.test(content)) {
      issues.push('Missing 🧽 Soft Tissue Preparation section');
    }
  }
  
  // Check sections (applies to all categories)
  if (!hasSection(content, SECTION_PATTERNS.warmUp)) {
    issues.push('Missing Warm-Up section');
  }
  if (!hasSection(content, SECTION_PATTERNS.mainWorkout)) {
    issues.push('Missing Main Workout section header');
  }
  if (!hasSection(content, SECTION_PATTERNS.finisher)) {
    issues.push('Missing Finisher section');
  }
  if (!hasSection(content, SECTION_PATTERNS.coolDown)) {
    issues.push('Missing Cool-Down section');
  }
  
  // Check icons
  if (requiresFiveSections && SECTION_PATTERNS.softTissue.test(content) && !ICON_PATTERNS.softTissue.test(content)) {
    issues.push('Missing 🧽 icon for Soft Tissue');
  }
  if (hasSection(content, SECTION_PATTERNS.warmUp) && !hasSectionIcon(content, SECTION_PATTERNS.warmUp, ICON_PATTERNS.warmUp)) {
    issues.push('Missing 🔥 icon for Warm-Up');
  }
  if (hasSection(content, SECTION_PATTERNS.mainWorkout) && !hasSectionIcon(content, SECTION_PATTERNS.mainWorkout, ICON_PATTERNS.mainWorkout)) {
    issues.push('Missing 💪 icon for Main Workout');
  }
  if (hasSection(content, SECTION_PATTERNS.finisher) && !hasSectionIcon(content, SECTION_PATTERNS.finisher, ICON_PATTERNS.finisher)) {
    issues.push('Missing ⚡ icon for Finisher');
  }
  if (hasSection(content, SECTION_PATTERNS.coolDown) && !hasSectionIcon(content, SECTION_PATTERNS.coolDown, ICON_PATTERNS.coolDown)) {
    issues.push('Missing 🧘 icon for Cool-Down');
  }
  
  // Check bullet list issues
  if (hasBulletListIssues(content)) {
    issues.push('Exercises not in proper bullet lists');
  }
  
  // Check formatting issues
  if (hasSingleQuoteAttributes(content)) {
    issues.push('Single-quote HTML attributes');
  }
  if (hasLeadingEmptyParagraphs(content)) {
    issues.push('Leading empty paragraphs');
  }
  
  // Gold Standard V3 spacing checks
  if (hasBlankAfterSectionTitle(content)) {
    issues.push('Blank line after section title');
  }
  if (hasMissingSectionSeparator(content)) {
    issues.push('Missing separator between sections');
  }
  if (hasMultipleSectionSeparators(content)) {
    issues.push('Multiple separators between sections');
  }
  if (hasExercisesOutsideLists(content)) {
    issues.push('Exercises outside bullet lists');
  }
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // NEW: Check for empty paragraphs between list items (intra-list spacing)
  // ═══════════════════════════════════════════════════════════════════════════════
  if (/<\/li>\s*<p[^>]*>\s*<\/p>\s*<li/i.test(content)) {
    issues.push('Empty paragraph between list items');
  }
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // NEW: Check for rest-only or empty exercise sections
  // ═══════════════════════════════════════════════════════════════════════════════
  const mainExerciseCount = countExerciseTagsBetweenIcons(content, '💪', '⚡');
  const finisherExerciseCount = countExerciseTagsBetweenIcons(content, '⚡', '🧘');
  
  if (content.includes('💪') && mainExerciseCount === 0) {
    if (isSectionRestOnly(content, '💪', '⚡')) {
      issues.push('Main Workout contains only rest instructions (no exercises)');
    } else {
      issues.push('Main Workout has no {{exercise:}} tags');
    }
  }
  
  if (content.includes('⚡') && finisherExerciseCount === 0) {
    if (isSectionRestOnly(content, '⚡', '🧘')) {
      issues.push('Finisher contains only rest instructions (no exercises)');
    } else {
      issues.push('Finisher has no {{exercise:}} tags');
    }
  }
  
  if (issues.length === 0) return null;
  
  return {
    id: workout.id,
    name: workout.name,
    category: workout.category,
    type: 'workout',
    issues,
    mainWorkoutExtract: content.substring(0, 300) + (content.length > 300 ? '...' : ''),
  };
}

function auditProgram(program: any): FormatIssue | null {
  const issues: string[] = [];
  
  const fieldsToCheck = [program.weekly_schedule, program.program_structure].filter(Boolean);
  
  for (const content of fieldsToCheck) {
    if (hasBulletListIssues(content)) {
      issues.push('Exercises not in proper bullet lists');
    }
    if (hasSingleQuoteAttributes(content)) {
      issues.push('Single-quote HTML attributes');
    }
    if (hasBlankAfterSectionTitle(content)) {
      issues.push('Blank line after section title');
    }
    if (hasMultipleSectionSeparators(content)) {
      issues.push('Multiple separators between sections');
    }
  }
  
  if (issues.length === 0) return null;
  
  return {
    id: program.id,
    name: program.name,
    category: program.category,
    type: 'program',
    issues: [...new Set(issues)],
    mainWorkoutExtract: (program.weekly_schedule || program.program_structure || '').substring(0, 300),
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

    console.log("[AUDIT-V3] Starting content formatting audit...");

    // Fetch all workouts
    const { data: workouts, error: workoutsError } = await supabase
      .from("admin_workouts")
      .select("id, name, category, main_workout, warm_up, activation, finisher, cool_down, is_visible");

    if (workoutsError) throw workoutsError;

    // Fetch all training programs
    const { data: programs, error: programsError } = await supabase
      .from("admin_training_programs")
      .select("id, name, category, weekly_schedule, program_structure");

    if (programsError) throw programsError;

    console.log(`[AUDIT-V3] Scanning ${workouts?.length || 0} workouts and ${programs?.length || 0} programs`);

    // Initialize counters
    const result: AuditResult = {
      totalScanned: (workouts?.length || 0) + (programs?.length || 0),
      workoutsScanned: workouts?.length || 0,
      programsScanned: programs?.length || 0,
      missingSections: { warmUp: 0, mainWorkout: 0, finisher: 0, coolDown: 0 },
      missingIcons: { warmUp: 0, mainWorkout: 0, finisher: 0, coolDown: 0 },
      exercisesNotInBulletLists: 0,
      singleQuoteAttributes: 0,
      leadingEmptyParagraphs: 0,
      blankAfterSectionTitle: 0,
      missingSectionSeparator: 0,
      multipleSectionSeparators: 0,
      exercisesOutsideLists: 0,
      restOnlyMainWorkout: 0,
      restOnlyFinisher: 0,
      emptyMainWorkout: 0,
      emptyFinisher: 0,
      totalIssues: 0,
      compliantItems: 0,
      topOffenders: [],
      timestamp: new Date().toISOString(),
    };

    // Audit workouts
    const allIssues: FormatIssue[] = [];
    
    for (const workout of workouts || []) {
      const content = workout.main_workout || '';
      
      // Count specific issues
      if (!hasSection(content, SECTION_PATTERNS.warmUp)) result.missingSections.warmUp++;
      if (!hasSection(content, SECTION_PATTERNS.mainWorkout)) result.missingSections.mainWorkout++;
      if (!hasSection(content, SECTION_PATTERNS.finisher)) result.missingSections.finisher++;
      if (!hasSection(content, SECTION_PATTERNS.coolDown)) result.missingSections.coolDown++;
      
      if (hasSection(content, SECTION_PATTERNS.warmUp) && !ICON_PATTERNS.warmUp.test(content)) result.missingIcons.warmUp++;
      if (hasSection(content, SECTION_PATTERNS.mainWorkout) && !ICON_PATTERNS.mainWorkout.test(content)) result.missingIcons.mainWorkout++;
      if (hasSection(content, SECTION_PATTERNS.finisher) && !ICON_PATTERNS.finisher.test(content)) result.missingIcons.finisher++;
      if (hasSection(content, SECTION_PATTERNS.coolDown) && !ICON_PATTERNS.coolDown.test(content)) result.missingIcons.coolDown++;
      
      if (hasBulletListIssues(content)) result.exercisesNotInBulletLists++;
      if (hasSingleQuoteAttributes(content)) result.singleQuoteAttributes++;
      if (hasLeadingEmptyParagraphs(content)) result.leadingEmptyParagraphs++;
      
      // NEW: Gold Standard V3 spacing counts
      if (hasBlankAfterSectionTitle(content)) result.blankAfterSectionTitle++;
      if (hasMissingSectionSeparator(content)) result.missingSectionSeparator++;
      if (hasMultipleSectionSeparators(content)) result.multipleSectionSeparators++;
      if (hasExercisesOutsideLists(content)) result.exercisesOutsideLists++;
      
      // NEW: Exercise content quality checks
      if (content.includes('💪') && countExerciseTagsBetweenIcons(content, '💪', '⚡') === 0) {
        if (isSectionRestOnly(content, '💪', '⚡')) {
          result.restOnlyMainWorkout++;
        } else {
          result.emptyMainWorkout++;
        }
      }
      if (content.includes('⚡') && countExerciseTagsBetweenIcons(content, '⚡', '🧘') === 0) {
        if (isSectionRestOnly(content, '⚡', '🧘')) {
          result.restOnlyFinisher++;
        } else {
          result.emptyFinisher++;
        }
      }
      
      const issue = auditWorkout(workout);
      if (issue) {
        allIssues.push(issue);
      } else {
        result.compliantItems++;
      }
    }

    // Audit programs
    for (const program of programs || []) {
      const issue = auditProgram(program);
      if (issue) {
        allIssues.push(issue);
      } else {
        result.compliantItems++;
      }
    }

    result.totalIssues = allIssues.length;
    
    // Sort by number of issues (most issues first) and take top 20
    result.topOffenders = allIssues
      .sort((a, b) => b.issues.length - a.issues.length)
      .slice(0, 20);

    console.log(`[AUDIT-V3] Complete. Found ${result.totalIssues} items with issues, ${result.compliantItems} compliant`);
    console.log(`[AUDIT-V3] Spacing issues: blankAfterHeader=${result.blankAfterSectionTitle}, missingSeparator=${result.missingSectionSeparator}, multipleSeparators=${result.multipleSectionSeparators}`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[AUDIT-V3] Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
