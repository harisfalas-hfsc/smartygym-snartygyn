/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * GOLD STANDARD V3 HTML NORMALIZER
 * Ensures workout HTML has zero spacing issues by:
 * 1. Stripping all newline characters (\n, \r)
 * 2. Collapsing all whitespace between HTML tags
 * 3. Normalizing header markup (<b> → <strong>)
 * 4. Merging fragmented <ul> blocks
 * 5. Ensuring exactly one empty paragraph between sections
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const SECTION_ICONS = ['🧽', '🔥', '💪', '⚡', '🧘'];
const CANONICAL_EMPTY_P = '<p class="tiptap-paragraph"></p>';

/**
 * Normalize HTML content to Gold Standard V3 formatting
 * Call this BEFORE inserting into the database to prevent spacing issues
 */
export function normalizeWorkoutHtml(content: string): string {
  if (!content || !content.trim()) {
    return content;
  }
  
  let result = content;
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // STEP 1 (CRITICAL): Strip all newline characters
  // This is THE root cause of spacing issues - CSS pre-wrap renders \n as visible gaps
  // ═══════════════════════════════════════════════════════════════════════════════
  result = result.replace(/[\n\r]+/g, '');
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // STEP 2 (CRITICAL): Collapse all whitespace between tags
  // Patterns like "</p> <ul" create whitespace text nodes = visible gaps
  // ═══════════════════════════════════════════════════════════════════════════════
  result = result.replace(/>\s+</g, '><');
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // STEP 3: Normalize header markup variants
  // <u><b>...</b></u>, <b><u>...</u></b> → <strong><u>...</u></strong>
  // ═══════════════════════════════════════════════════════════════════════════════
  result = result.replace(/<u><b>/gi, '<strong><u>');
  result = result.replace(/<\/b><\/u>/gi, '</u></strong>');
  result = result.replace(/<b><u>/gi, '<strong><u>');
  result = result.replace(/<\/u><\/b>/gi, '</u></strong>');
  result = result.replace(/<b>/gi, '<strong>');
  result = result.replace(/<\/b>/gi, '</strong>');
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // STEP 4: Merge consecutive <ul> blocks
  // Fragmented lists like </ul><ul> should be one continuous list
  // ═══════════════════════════════════════════════════════════════════════════════
  result = result.replace(/<\/ul>(?:<p[^>]*><\/p>)*<ul[^>]*>/gi, '');
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // STEP 5: Fix single-quote HTML attributes → double quotes
  // ═══════════════════════════════════════════════════════════════════════════════
  result = result.replace(
    /(\s(?:class|id|style|data-\w+))='([^']*)'/gi,
    (_, attr, value) => `${attr}="${value}"`
  );
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // STEP 6: Add TipTap classes to elements missing them
  // ═══════════════════════════════════════════════════════════════════════════════
  result = result.replace(/<ul(?![^>]*class)/gi, '<ul class="tiptap-bullet-list"');
  result = result.replace(/<li(?![^>]*class)/gi, '<li class="tiptap-list-item"');
  result = result.replace(/<p(?![^>]*class)/gi, '<p class="tiptap-paragraph"');
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // STEP 7: Normalize empty paragraphs to canonical form
  // ═══════════════════════════════════════════════════════════════════════════════
  result = result.replace(/<p[^>]*>\s*<\/p>/gi, CANONICAL_EMPTY_P);
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // STEP 8: Remove blank lines after section headers
  // ═══════════════════════════════════════════════════════════════════════════════
  for (const icon of SECTION_ICONS) {
    const pattern = new RegExp(
      `(<p[^>]*>[^<]*${icon}[\\s\\S]*?<\\/p>)(<p class="tiptap-paragraph"><\\/p>)+(?=<(?:ul|p|li))`,
      'gi'
    );
    result = result.replace(pattern, '$1');
  }
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // STEP 9: Ensure empty paragraph BEFORE section headers (icon-based)
  // ═══════════════════════════════════════════════════════════════════════════════
  for (const icon of SECTION_ICONS) {
    const insertPattern = new RegExp(
      `(<\\/(?:ul|p)>)(?!<p class="tiptap-paragraph"><\\/p>)(<p[^>]*>[^<]*${icon})`,
      'gi'
    );
    result = result.replace(insertPattern, `$1${CANONICAL_EMPTY_P}$2`);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // STEP 10: Collapse multiple consecutive empty paragraphs to exactly one
  // ═══════════════════════════════════════════════════════════════════════════════
  result = result.replace(/(<p class="tiptap-paragraph"><\/p>){2,}/gi, CANONICAL_EMPTY_P);
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // STEP 10: Remove empty paragraphs between list items
  // ═══════════════════════════════════════════════════════════════════════════════
  result = result.replace(/<\/li><p class="tiptap-paragraph"><\/p><li/gi, '</li><li');
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // STEP 11: Remove leading/trailing empty paragraphs
  // ═══════════════════════════════════════════════════════════════════════════════
  result = result.replace(/^(<p class="tiptap-paragraph"><\/p>)+/, '');
  result = result.replace(/(<p class="tiptap-paragraph"><\/p>)+$/, '');
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // STEP 12: Split multi-exercise list items into individual items
  // Each exercise MUST have its own <li> with its own View button
  // ═══════════════════════════════════════════════════════════════════════════════
  result = splitMultiExerciseLines(result);
  
  return result;
}

/**
 * Split <li> items containing multiple {{exercise:...}} tags into separate <li> items.
 * Also handles comma-separated exercise names and structural labels mixed with exercises.
 */
export function splitMultiExerciseLines(html: string): string {
  if (!html) return html;
  
  // Pattern: find <li> items with their inner <p> content
  return html.replace(/<li[^>]*><p[^>]*>([\s\S]*?)<\/p><\/li>/gi, (match, content: string) => {
    // Count exercise markup tags
    const exerciseTags = content.match(/\{\{exercise:[^}]+\}\}/g);
    
    if (!exerciseTags || exerciseTags.length <= 1) {
      // Single or no exercise - keep as-is
      return match;
    }
    
    // Multiple exercises on one line - split them
    const parts = content.split(/(\{\{exercise:[^}]+\}\})/);
    const items: string[] = [];
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (/^\{\{exercise:/.test(part)) {
        // This is an exercise tag - grab any suffix (sets/reps/duration) from next part
        let suffix = '';
        if (i + 1 < parts.length) {
          const nextPart = parts[i + 1];
          // Take suffix up to the next exercise tag or end, strip leading separators
          const cleanedSuffix = nextPart
            .replace(/^[\s,\-–—·•]+/, '')  // strip leading separators
            .replace(/[\s,\-–—·•]+$/, '')  // strip trailing separators
            .trim();
          
          // Only use as suffix if it doesn't look like another exercise name
          // (i.e., short text like "3x12" or "30 seconds" or "each side")
          if (cleanedSuffix && !cleanedSuffix.includes('{{exercise:') && cleanedSuffix.length < 80) {
            suffix = cleanedSuffix;
            parts[i + 1] = ''; // consumed
          }
        }
        
        const itemContent = suffix ? `${part} ${suffix}` : part;
        items.push(`<li class="tiptap-list-item"><p class="tiptap-paragraph">${itemContent}</p></li>`);
      }
      // Non-exercise parts (structural labels, separators) are discarded
    }
    
    return items.length > 0 ? items.join('') : match;
  });
}

/**
 * Validate that normalized HTML is compliant (for guard/rejection logic)
 * Returns true if content is clean, false if issues remain
 */
export function validateWorkoutHtml(content: string): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  if (/[\n\r]/.test(content)) {
    issues.push('Contains newline characters');
  }
  
  if (/>\s+</.test(content)) {
    issues.push('Whitespace between HTML tags');
  }
  
  if (/<\/li><p[^>]*><\/p><li/i.test(content)) {
    issues.push('Empty paragraph between list items');
  }
  
  if (/(<p class="tiptap-paragraph"><\/p>){2,}/.test(content)) {
    issues.push('Multiple consecutive empty paragraphs');
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}
