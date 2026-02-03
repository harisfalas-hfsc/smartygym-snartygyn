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
  // STEP 9: Collapse multiple consecutive empty paragraphs to exactly one
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
  
  return result;
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
