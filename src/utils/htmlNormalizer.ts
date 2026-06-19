/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * GOLD STANDARD V4 HTML NORMALIZER - CLIENT-SIDE VERSION
 * Mirrors server-side normalizer exactly.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const SECTION_ICONS = ['🧽', '🔥', '💪', '⚡', '🧘'];
const CANONICAL_EMPTY_P = '<p class="tiptap-paragraph"></p>';
const EXERCISE_MARKUP_RE = /\{\{exercise:[^}]+\}\}/i;

export function normalizeWorkoutHtml(content: string): string {
  if (!content || !content.trim()) return content;
  
  let result = content;
  
  // STEP 0: Fix malformed HTML
  result = sanitizeMalformedHtml(result);
  
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
  
  // STEP 7: Section header spacing. Keep one intentional blank paragraph
  // before major program/workout headers so generated programs do not render
  // as one stacked block in the editor or published page.
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
  
  // STEP 13: Absorb/wrap orphan exercise paragraphs so every exercise line is a bullet
  result = absorbOrphanExerciseParagraphs(result);
  result = wrapLooseExerciseParagraphRuns(result);
  result = result.replace(/<\/ul>(?:<p[^>]*>\s*<\/p>)*<ul[^>]*>/gi, '');
  
  // Final collapse
  result = result.replace(/(<p class="tiptap-paragraph"><\/p>){2,}/gi, CANONICAL_EMPTY_P);
  result = enforceProgramSectionSpacing(result);
  
  return result;
}

function enforceProgramSectionSpacing(html: string): string {
  if (!html) return html;
  const majorHeaderPattern = /<p class="tiptap-paragraph"><strong>(?:🎯 Program Goal|🧭 Program Instructions|📈 Program Progression|📅 WEEK [AB] TEMPLATE|🎯 Objective|[①②③④⑤⑥] DAY \d+|😴 DAY \d+|🏁 DAY \d+|Estimated session time|🔥 Soft Tissue Preparation|⚡ Activation \/ Warm-Up|🏋 Main Workout|💥 Finisher|🧘 Cool Down)/gi;
  let result = html.replace(majorHeaderPattern, (match, offset, full) => {
    if (offset === 0) return match;
    const before = full.slice(Math.max(0, offset - CANONICAL_EMPTY_P.length), offset);
    return before === CANONICAL_EMPTY_P ? match : `${CANONICAL_EMPTY_P}${match}`;
  });
  result = result.replace(/^(<p class="tiptap-paragraph"><\/p>)+/, '');
  result = result.replace(/(<p class="tiptap-paragraph"><\/p>){2,}/gi, CANONICAL_EMPTY_P);
  return result;
}

function sanitizeMalformedHtml(html: string): string {
  if (!html) return html;
  let result = html;
  result = result.replace(/<li[^>]*"[a-zA-Z][^<]*\/li>/gi, '');
  result = result.replace(/<li([^>]*)>(?!<p)([^<]+)(?:<\/li>)/gi, 
    '<li$1><p class="tiptap-paragraph">$2</p></li>');
  result = result.replace(/<p([^>]*)>\s*<\/strong>/gi, '<p$1>');
  result = result.replace(/class="[^"]*"\s*class="/gi, 'class="');
  return result;
}

function stripStructuralLabelsFromExerciseBullets(html: string): string {
  if (!html) return html;
  return html.replace(
    /(<li[^>]*><p[^>]*>)\s*<strong>[^<]*<\/strong>\s*(\{\{exercise:[^}]+\}\})/gi,
    '$1$2'
  );
}

function splitMultiExerciseLines(html: string): string {
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

function removeOrphanExerciseListItems(html: string): string {
  if (!html) return html;

  return html.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (fullList, listContent: string) => {
    const liRegex = /<li[^>]*>(?:\s*<p[^>]*>([\s\S]*?)<\/p>\s*|([\s\S]*?))<\/li>/gi;
    const items: Array<{content: string}> = [];
    let liMatch: RegExpExecArray | null;

    while ((liMatch = liRegex.exec(listContent)) !== null) {
      items.push({ content: liMatch[1] || liMatch[2] || '' });
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
        convertedParagraphs.push(
          `<p class="tiptap-paragraph">${item.content.trim()}</p>`
        );
      }
    }

    if (keptExerciseItems.length === 0) return convertedParagraphs.join('');

    const listHtml = `<ul class="tiptap-bullet-list">${keptExerciseItems.join('')}</ul>`;
    return convertedParagraphs.length > 0 ? `${listHtml}${convertedParagraphs.join('')}` : listHtml;
  });
}

function textFromHtmlFragment(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\{\{exercise:[^}]+\}\}/gi, 'exercise')
    .replace(/\s+/g, ' ')
    .trim();
}

function isExerciseLineContent(content: string): boolean {
  if (!content || /[🧽🔥💪⚡🧘]/.test(content)) return false;
  if (EXERCISE_MARKUP_RE.test(content)) return true;

  const text = textFromHtmlFragment(content);
  if (!text || text.length > 180) return false;
  if (/^(?:perform|complete|rest|repeat|alternate|focus|goal|note|notes|tempo|rounds?\b|circuit\b|set\b)/i.test(text)) {
    return false;
  }

  return /^(?:\d+\s*(?:[-–]\s*\d+\s*)?(?:reps?|sec(?:onds?)?|mins?|minutes?|meters?|metres?|m|cal(?:ories)?|breaths?)\b|\d+\s*x\s*\d+\b|\d+\/\d+\b|amrap\b|emom\b)/i.test(text);
}

function absorbOrphanExerciseParagraphs(html: string): string {
  if (!html) return html;
  let result = html;
  let previous: string;

  do {
    previous = result;
    result = result.replace(
      /<\/ul>(?:<p[^>]*>\s*<\/p>)*(<p[^>]*>([\s\S]*?)<\/p>)/gi,
      (match, _pTag, pContent) => {
        if (isExerciseLineContent(pContent)) {
          return `<li class="tiptap-list-item"><p class="tiptap-paragraph">${pContent.trim()}</p></li></ul>`;
        }
        return match;
      }
    );
  } while (result !== previous);

  return result;
}

function wrapLooseExerciseParagraphRuns(html: string): string {
  if (!html) return html;

  return html.split(/(<ul\b[\s\S]*?<\/ul>)/gi).map((part) => {
    if (/^<ul\b/i.test(part.trim())) return part;

    const paragraphPattern = /<p[^>]*>([\s\S]*?)<\/p>/gi;
    let output = '';
    let lastIndex = 0;
    let pendingItems: string[] = [];

    const flushPending = () => {
      if (pendingItems.length > 0) {
        output += `<ul class="tiptap-bullet-list">${pendingItems.join('')}</ul>`;
        pendingItems = [];
      }
    };

    part.replace(paragraphPattern, (match, pContent, offset) => {
      output += part.slice(lastIndex, offset);
      if (isExerciseLineContent(pContent)) {
        pendingItems.push(`<li class="tiptap-list-item"><p class="tiptap-paragraph">${pContent.trim()}</p></li>`);
      } else {
        flushPending();
        output += match;
      }
      lastIndex = offset + match.length;
      return match;
    });

    if (lastIndex === 0) {
      return part;
    }

    output += part.slice(lastIndex);
    flushPending();
    return output;
  }).join('');
}
