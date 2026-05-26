/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * GOLD STANDARD V4 HTML NORMALIZER
 * Robust sanitizer-first approach:
 * 0. Fix malformed/broken HTML tags
 * 1. Strip newlines, collapse whitespace
 * 2. Normalize markup
 * 3. Merge fragmented lists
 * 4. Split multi-exercise lines (1 exercise = 1 bullet)
 * 5. Remove orphan bullets from exercise lists
 * 6. Section spacing
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const SECTION_ICONS = ['🧽', '🔥', '💪', '⚡', '🧘'];
const CANONICAL_EMPTY_P = '<p class="tiptap-paragraph"></p>';

export function normalizeWorkoutHtml(content: string): string {
  if (!content || !content.trim()) return content;
  
  let result = content;
  
  // STEP 0: Fix malformed HTML before anything else
  result = sanitizeMalformedHtml(result);

  // STEP 0a: Collapse repeated gender-variant suffix tokens that occasionally
  // leak out of the exercise-matching pipeline. Pattern seen in production:
  //   "dynamic chest stretch (male) (male) (male) (male) ..."
  // Any run of 2+ "(male)"/"(female)" tokens is pure noise and is removed.
  result = result.replace(/(\s*\((?:male|female)\)){2,}/gi, '');

  // STEP 0b: Fix malformed nested exercise tokens BEFORE any whitespace work.
  // Pattern observed in production:
  //   {{jumping-jacks:{{exercise:jumping-jacks:Jumping Jacks}} }}
  // → {{exercise:jumping-jacks:Jumping Jacks}}
  result = unwrapNestedExerciseTokens(result);
  
  // STEP 1: Strip newlines, collapse whitespace
  result = result.replace(/[\n\r]+/g, '');
  result = result.replace(/>\s+</g, '><');
  
  // STEP 2: Normalize header markup
  result = result.replace(/<u><b>/gi, '<strong><u>');
  result = result.replace(/<\/b><\/u>/gi, '</u></strong>');
  result = result.replace(/<b><u>/gi, '<strong><u>');
  result = result.replace(/<\/u><\/b>/gi, '</u></strong>');
  result = result.replace(/<b>/gi, '<strong>');
  result = result.replace(/<\/b>/gi, '</strong>');
  
  // STEP 3: Merge consecutive <ul> blocks
  result = result.replace(/<\/ul>(?:<p[^>]*><\/p>)*<ul[^>]*>/gi, '');
  
  // STEP 4: Fix single-quote attributes
  result = result.replace(
    /(\s(?:class|id|style|data-\w+))='([^']*)'/gi,
    (_, attr, value) => `${attr}="${value}"`
  );
  
  // STEP 5: Add TipTap classes
  result = result.replace(/<ul(?![^>]*class)/gi, '<ul class="tiptap-bullet-list"');
  result = result.replace(/<li(?![^>]*class)/gi, '<li class="tiptap-list-item"');
  result = result.replace(/<p(?![^>]*class)/gi, '<p class="tiptap-paragraph"');
  
  // STEP 6: Normalize empty paragraphs
  result = result.replace(/<p[^>]*>\s*<\/p>/gi, CANONICAL_EMPTY_P);
  
  // STEP 7: Section header spacing
  for (const icon of SECTION_ICONS) {
    const pattern = new RegExp(
      `(<p[^>]*>[^<]*${icon}[\\s\\S]*?<\\/p>)(<p class="tiptap-paragraph"><\\/p>)+(?=<(?:ul|p|li))`,
      'gi'
    );
    result = result.replace(pattern, '$1');
  }
  for (const icon of SECTION_ICONS) {
    const insertPattern = new RegExp(
      `(<\\/(?:ul|p)>)(?!<p class="tiptap-paragraph"><\\/p>)(<p[^>]*>[^<]*${icon})`,
      'gi'
    );
    result = result.replace(insertPattern, `$1${CANONICAL_EMPTY_P}$2`);
  }
  
  // STEP 8: Collapse multiple empty paragraphs
  result = result.replace(/(<p class="tiptap-paragraph"><\/p>){2,}/gi, CANONICAL_EMPTY_P);
  result = result.replace(/<\/li><p class="tiptap-paragraph"><\/p><li/gi, '</li><li');
  
  // STEP 9: Remove leading/trailing empty paragraphs
  result = result.replace(/^(<p class="tiptap-paragraph"><\/p>)+/, '');
  result = result.replace(/(<p class="tiptap-paragraph"><\/p>)+$/, '');
  
  // STEP 10: Strip structural labels from exercise bullets
  result = stripStructuralLabelsFromExerciseBullets(result);
  
  // STEP 11: Split multi-exercise lines
  result = splitMultiExerciseLines(result);
  
  // STEP 12: Remove orphan bullets
  result = removeOrphanExerciseListItems(result);
  
  // STEP 13: Move orphan exercise <p> tags outside lists into the list
  result = absorbOrphanExerciseParagraphs(result);

  // STEP 14: Cool Down consistency — absorb orphan Static Stretching /
  // Breathing / Diaphragmatic Breathing paragraphs that sit AFTER the
  // cool-down <ul> into that same list so every line renders as a bullet.
  result = absorbCoolDownOrphanParagraphs(result);
  
  // Final collapse
  result = result.replace(/(<p class="tiptap-paragraph"><\/p>){2,}/gi, CANONICAL_EMPTY_P);
  
  return result;
}

/**
 * Fix malformed nested exercise tokens of the form:
 *   {{some-slug:{{exercise:some-slug:Name}} }}
 *   {{exercise:slug:{{exercise:slug:Name}}}}
 * Reduces them to a single valid {{exercise:ID:Name}} token.
 */
export function unwrapNestedExerciseTokens(html: string): string {
  if (!html || !html.includes('{{')) return html;
  let result = html;
  // Run a few passes in case of multiple nestings on a single line.
  for (let i = 0; i < 3; i++) {
    const before = result;
    result = result.replace(
      /\{\{[^:{}]+:\s*(\{\{(?:exercise|exrcise|excersize|excercise):[^{}]+\}\})\s*\}\}/gi,
      '$1',
    );
    if (result === before) break;
  }
  return result;
}

/**
 * Cool Down sections sometimes end with detached <p><strong>Static
 * Stretching:</strong> ...</p> or <p><strong>Breathing:</strong> ...</p>
 * paragraphs sitting AFTER the </ul>. Move each such paragraph into the
 * preceding <ul> as a real <li> so the bullet rendering is consistent.
 */
export function absorbCoolDownOrphanParagraphs(html: string): string {
  if (!html || !html.includes('🧘')) return html;

  const coolStart = html.indexOf('🧘');
  if (coolStart === -1) return html;

  // Operate only on the cool-down slice so we never touch other sections.
  const before = html.slice(0, coolStart);
  const coolSlice = html.slice(coolStart);

  // Find the FIRST </ul> after the cool down header. Everything between that
  // </ul> and the next section boundary is potential orphan content.
  const ulCloseIdx = coolSlice.indexOf('</ul>');
  if (ulCloseIdx === -1) return html;

  const head = coolSlice.slice(0, ulCloseIdx); // up to and NOT including </ul>
  let tail = coolSlice.slice(ulCloseIdx + '</ul>'.length);

  // Match orphan paragraphs whose <strong> opens with one of our labels.
  const labelRe = /^(?:<p[^>]*>\s*)?<strong>\s*(?:Static Stretching|Diaphragmatic Breathing|Breathing)\b/i;
  const orphanItems: string[] = [];

  // Iteratively peel paragraphs from the start of `tail`.
  // Stop at first non-label paragraph or non-paragraph content.
  while (true) {
    const trimmed = tail.replace(/^(<p class="tiptap-paragraph"><\/p>)+/, '');
    const skipped = tail.length - trimmed.length;
    const pMatch = trimmed.match(/^<p[^>]*>([\s\S]*?)<\/p>/i);
    if (!pMatch) break;
    const pContent = pMatch[1];
    if (!labelRe.test(`<p>${pContent}</p>`)) break;
    orphanItems.push(`<li class="tiptap-list-item"><p class="tiptap-paragraph">${pContent.trim()}</p></li>`);
    tail = trimmed.slice(pMatch[0].length);
    // Re-anchor: consume any single empty <p> separator that the generator left.
    tail = tail.replace(/^(<p class="tiptap-paragraph"><\/p>)+/, '');
    // (skipped is intentionally not added back — we drop empty separators.)
    void skipped;
  }

  if (orphanItems.length === 0) return html;

  return before + head + orphanItems.join('') + '</ul>' + tail;
}

/**
 * Fix malformed/broken HTML tags that would cause regex failures downstream.
 * Examples:
 *   <li class="tiptap-list-item"hamstring stretch/li> → drops the broken tag
 *   </strong></p></li> missing opening → safe
 */
export function sanitizeMalformedHtml(html: string): string {
  if (!html) return html;
  let result = html;
  
  // Fix <li ...> missing closing ">" before content (e.g., <li class="x"some text/li>)
  // These are completely broken and unrecoverable - remove them
  result = result.replace(/<li[^>]*"[a-zA-Z][^<]*\/li>/gi, '');
  
  // Fix unclosed <li> tags (no </li>)
  // Pattern: <li...>content that doesn't end with </li> before next <li or </ul>
  // This is handled by ensuring all <li> have </li>
  
  // Fix <li> without <p> wrapper inside
  result = result.replace(/<li([^>]*)>(?!<p)([^<]+)(?:<\/li>)/gi, 
    '<li$1><p class="tiptap-paragraph">$2</p></li>');
  
  // Fix orphan </strong> at start of <p> content (leftover from stripped labels)
  result = result.replace(/<p([^>]*)>\s*<\/strong>/gi, '<p$1>');
  
  // Fix doubled class attributes
  result = result.replace(/class="[^"]*"\s*class="/gi, 'class="');
  
  return result;
}

/**
 * Strip structural labels like <strong>Set 3:</strong> or <strong>Static Stretching (8 min):</strong>
 * that precede exercise tags inside list items.
 */
export function stripStructuralLabelsFromExerciseBullets(html: string): string {
  if (!html) return html;
  
  // Pattern: <li...><p...><strong>Label:</strong> {{exercise:...}}</p></li>
  // → <li...><p...>{{exercise:...}}</p></li>
  return html.replace(
    /(<li[^>]*><p[^>]*>)\s*<strong>[^<]*<\/strong>\s*(\{\{exercise:[^}]+\}\})/gi,
    '$1$2'
  );
}

/**
 * Split <li> items containing multiple {{exercise:...}} tags into separate <li> items.
 * Also splits exercises separated by commas with plain text names.
 */
export function splitMultiExerciseLines(html: string): string {
  if (!html) return html;
  
  return html.replace(/<li[^>]*><p[^>]*>([\s\S]*?)<\/p><\/li>/gi, (match, content: string) => {
    const exerciseTags = content.match(/\{\{exercise:[^}]+\}\}/g);
    if (!exerciseTags || exerciseTags.length <= 1) return match;
    
    const parts = content.split(/(\{\{exercise:[^}]+\}\})/);
    const items: string[] = [];
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (/^\{\{exercise:/.test(part)) {
        let suffix = '';
        if (i + 1 < parts.length) {
          const cleaned = parts[i + 1]
            .replace(/^[\s,\-–—·•:]+/, '')
            .replace(/[\s,\-–—·•]+$/, '')
            .replace(/<\/?strong>/gi, '')
            .trim();
          if (cleaned && !cleaned.includes('{{exercise:') && cleaned.length < 80) {
            suffix = cleaned;
            parts[i + 1] = '';
          }
        }
        const itemContent = suffix ? `${part} ${suffix}` : part;
        items.push(`<li class="tiptap-list-item"><p class="tiptap-paragraph">${itemContent}</p></li>`);
      }
    }
    
    return items.length > 0 ? items.join('') : match;
  });
}

/**
 * In lists containing exercise markup, remove non-exercise bullets.
 * - Keeps bullets with {{exercise:...}}
 * - Converts meaningful non-exercise text to <p> paragraphs
 * - Drops empty bullets entirely
 */
export function removeOrphanExerciseListItems(html: string): string {
  if (!html) return html;

  return html.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (fullList, listContent: string) => {
    // Extract all <li> items - handle both with and without <p> wrappers
    const liRegex = /<li[^>]*>(?:\s*<p[^>]*>([\s\S]*?)<\/p>\s*|([\s\S]*?))<\/li>/gi;
    const items: Array<{content: string; raw: string}> = [];
    let liMatch: RegExpExecArray | null;

    while ((liMatch = liRegex.exec(listContent)) !== null) {
      items.push({
        content: liMatch[1] || liMatch[2] || '',
        raw: liMatch[0]
      });
    }

    if (items.length === 0) return fullList;

    const hasExerciseMarkup = items.some(item => /\{\{exercise:[^}]+\}\}/i.test(item.content));
    if (!hasExerciseMarkup) return fullList;

    const keptExerciseItems: string[] = [];
    const convertedParagraphs: string[] = [];

    for (const item of items) {
      const hasExercise = /\{\{exercise:[^}]+\}\}/i.test(item.content);
      const plainText = item.content
        .replace(/<[^>]+>/g, '')
        .replace(/\{\{exercise:[^}]+\}\}/g, '')
        .replace(/&nbsp;/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (hasExercise) {
        keptExerciseItems.push(
          `<li class="tiptap-list-item"><p class="tiptap-paragraph">${item.content.trim()}</p></li>`
        );
      } else if (plainText.length > 5) {
        // Only keep non-exercise text if it's substantial (not just "Rest" or empty)
        convertedParagraphs.push(
          `<p class="tiptap-paragraph">${item.content.trim()}</p>`
        );
      }
      // Drop empty or trivially short orphan bullets
    }

    if (keptExerciseItems.length === 0) {
      return convertedParagraphs.join('');
    }

    const listHtml = `<ul class="tiptap-bullet-list">${keptExerciseItems.join('')}</ul>`;
    return convertedParagraphs.length > 0 
      ? `${listHtml}${convertedParagraphs.join('')}` 
      : listHtml;
  });
}

/**
 * Move <p> tags containing {{exercise:...}} that sit OUTSIDE a <ul> list
 * into the preceding or following list as proper <li> items.
 */
export function absorbOrphanExerciseParagraphs(html: string): string {
  if (!html) return html;
  
  // Pattern: </ul><p...>...{{exercise:...}}...</p> → absorb into preceding list
  let result = html.replace(
    /<\/ul>(<p[^>]*>([\s\S]*?)<\/p>)(?=<|\s*$)/gi,
    (match, pTag, pContent) => {
      if (/\{\{exercise:[^}]+\}\}/.test(pContent)) {
        // This orphan <p> has an exercise - absorb it as a <li> into the preceding list
        return `<li class="tiptap-list-item"><p class="tiptap-paragraph">${pContent.trim()}</p></li></ul>`;
      }
      return match;
    }
  );
  
  return result;
}

export function validateWorkoutHtml(content: string): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  if (/[\n\r]/.test(content)) issues.push('Contains newline characters');
  if (/>\s+</.test(content)) issues.push('Whitespace between HTML tags');
  if (/<\/li><p[^>]*><\/p><li/i.test(content)) issues.push('Empty paragraph between list items');
  if (/(<p class="tiptap-paragraph"><\/p>){2,}/.test(content)) issues.push('Multiple consecutive empty paragraphs');
  
  // New strict checks
  if (/<li[^>]*><p[^>]*>[^{<]*<\/p><\/li>/i.test(content) && /\{\{exercise:/.test(content)) {
    // Check if there are non-exercise <li> in a list that has exercises
    issues.push('Non-exercise bullet in exercise list');
  }
  
  return { isValid: issues.length === 0, issues };
}
