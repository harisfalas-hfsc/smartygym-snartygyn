import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';
import { cn } from '@/lib/utils';
import { useExerciseLibrary } from '@/hooks/useExerciseLibrary';
import { parseExerciseMarkup } from '@/utils/exerciseMatching';
import ExerciseLinkButton from '@/components/ExerciseLinkButton';

interface ExerciseHTMLContentProps {
  content: string;
  className?: string;
  enableExerciseLinking?: boolean;
}

interface ProcessedExercise {
  name: string;
  id: string | null;
  originalText: string;
}

const ALLOWED_TAGS = ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'span', 'div', 'blockquote', 'code', 'pre', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'sub', 'sup'];
const ALLOWED_ATTR = ['href', 'target', 'rel', 'class', 'id', 'style', 'src', 'alt', 'width', 'height', 'colspan', 'rowspan'];

/**
 * Escape special regex characters in a string
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Extract exercise name from plain text like "Jumping Jacks - 1 minute" or "Burpees x 10"
 * Returns null if text doesn't look like an exercise mention
 */
function extractExerciseCandidate(text: string): string | null {
  // Skip structural/instructional text
  if (/^(perform|complete|repeat|do|hold|maintain|keep|breathe|foam roll|lacrosse ball|gentle jogging)/i.test(text.trim())) {
    return null;
  }
  
  // Skip timing-only lines like "30 seconds rest"
  if (/^\d+\s*(seconds?|minutes?|mins?|secs?)\s*(rest|recovery|break)/i.test(text.trim())) {
    return null;
  }

  const patterns = [
    // "Jumping Jacks - 1 minute"
    /^([A-Za-z][A-Za-z\s'-]+?)\s*[-–—]\s*\d/i,
    // "Burpees x 10"
    /^([A-Za-z][A-Za-z\s'-]+?)\s*[x×]\s*\d/i,
    // "Mountain Climbers (30 sec)"
    /^([A-Za-z][A-Za-z\s'-]+?)\s*\(\d/i,
    // "Push-ups: 20 reps"
    /^([A-Za-z][A-Za-z\s'-]+?)\s*:\s*\d/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const candidate = match[1].trim();
      if (/^(warm|cool|rest|set|rep|round|block|station|circuit|phase|day|week)/i.test(candidate)) {
        return null;
      }
      if (candidate.length >= 4 && candidate.length <= 50) {
        return candidate;
      }
    }
  }
  
  // NEW: "30 seconds Jumping Jacks" or "1 minute Child's Pose"
  const durationFirst = text.trim().match(/^\d+\s*(?:seconds?|secs?|minutes?|mins?)\s+([A-Za-z][A-Za-z\s'-]+)/i);
  if (durationFirst && durationFirst[1]) {
    const candidate = durationFirst[1].replace(/\s*\([^)]*\)/, '').trim();
    if (candidate.length >= 4 && candidate.length <= 50 &&
        !/^(rest|recovery|break|each|per)/i.test(candidate)) {
      return candidate;
    }
  }
  
  // NEW: "20 Air Squats" (number + exercise name)
  const numberFirst = text.trim().match(/^(\d+)\s+([A-Za-z][A-Za-z\s'-]+)/);
  if (numberFirst && numberFirst[2]) {
    const candidate = numberFirst[2].replace(/\s*\([^)]*\)/, '').trim();
    if (candidate.length >= 4 && candidate.length <= 50 &&
        !/^(rounds?|sets?|reps?|seconds?|minutes?|mins?|secs?)/i.test(candidate)) {
      return candidate;
    }
  }
  
  // NEW: Plain exercise name (no prefix/suffix) - for standalone lines like "Burpees" or "High Knees"
  const plainText = text.trim();
  if (/^[A-Za-z][A-Za-z\s'-]{3,50}$/.test(plainText)) {
    if (!/^(warm|cool|rest|set|rep|round|block|station|circuit|phase|day|week|perform|complete|repeat|do|hold|maintain)/i.test(plainText)) {
      return plainText;
    }
  }
  
  return null;
}


/**
 * Convert a DOM node to React elements, replacing __EXERCISE_n__ placeholders with ExerciseLinkButton
 */
function domToReact(
  node: Node,
  exerciseList: ProcessedExercise[],
  keyPrefix: string = ''
): React.ReactNode {
  // Text node - check for exercise placeholders
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent || '';
    
    // Check if text contains exercise placeholders
    if (!text.includes('__EXERCISE_')) {
      return text;
    }
    
    // Split by placeholder pattern and render inline
    const parts = text.split(/(__EXERCISE_\d+__)/);
    return parts.map((part, idx) => {
      const match = part.match(/__EXERCISE_(\d+)__/);
      if (match) {
        const exerciseIndex = parseInt(match[1]);
        const exercise = exerciseList[exerciseIndex];
        if (exercise) {
          return (
            <ExerciseLinkButton
              key={`${keyPrefix}-ex-${idx}`}
              exerciseName={exercise.name}
              exerciseId={exercise.id}
              showViewButton={!!exercise.id}
            />
          );
        }
      }
      return part || null;
    }).filter(Boolean);
  }
  
  // Element node
  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as Element;
    const tagName = element.tagName.toLowerCase();
    
    // Skip disallowed tags
    if (!ALLOWED_TAGS.includes(tagName)) {
      // Still process children
      const children = Array.from(node.childNodes).map((child, idx) =>
        domToReact(child, exerciseList, `${keyPrefix}-${idx}`)
      );
      return <>{children}</>;
    }
    
    // Build props from attributes
    const props: Record<string, string> = {};
    for (const attr of Array.from(element.attributes)) {
      if (ALLOWED_ATTR.includes(attr.name)) {
        // Convert class to className for React
        const propName = attr.name === 'class' ? 'className' : attr.name;
        props[propName] = attr.value;
      }
    }
    
    // Process children recursively
    const children = Array.from(node.childNodes).map((child, idx) =>
      domToReact(child, exerciseList, `${keyPrefix}-${idx}`)
    );
    
    // Self-closing tags
    if (['br', 'hr', 'img'].includes(tagName)) {
      return React.createElement(tagName, { key: `${keyPrefix}-el`, ...props });
    }
    
    return React.createElement(
      tagName,
      { key: `${keyPrefix}-el`, ...props },
      children.length > 0 ? children : null
    );
  }
  
  return null;
}

/**
 * Enhanced HTML content component that processes exercise names and adds View buttons
 * - Parses {{exercise:id:name}} markup for admin-added exercises
 * - Uses fuzzy matching to find exercises in bold text
 * - Renders exercises INLINE within their containing elements
 */
/**
 * Check if a position in HTML is within a Main Workout or Finisher section.
 * Sections are delimited by emoji headers: 🧽 (skip), 🔥 (skip), 💪 (process), ⚡ (process), 🧘 (skip)
 */
function isInProcessableSection(html: string, position: number): boolean {
  const sectionEmojis = [
    { emoji: '🧽', process: false },
    { emoji: '🔥', process: false },
    { emoji: '💪', process: true },
    { emoji: '⚡', process: true },
    { emoji: '🧘', process: false },
  ];
  
  // Find which section this position falls in
  let currentProcess = true; // Default: if no sections found, process everything
  let hasAnySections = false;
  
  for (const { emoji, process } of sectionEmojis) {
    const idx = html.indexOf(emoji);
    if (idx !== -1) {
      hasAnySections = true;
    }
  }
  
  if (!hasAnySections) return true; // No section markers = process everything
  
  // Build a list of all section starts sorted by position
  const sectionStarts: Array<{ index: number; process: boolean }> = [];
  for (const { emoji, process } of sectionEmojis) {
    let searchFrom = 0;
    while (true) {
      const idx = html.indexOf(emoji, searchFrom);
      if (idx === -1) break;
      sectionStarts.push({ index: idx, process });
      searchFrom = idx + 1;
    }
  }
  sectionStarts.sort((a, b) => a.index - b.index);
  
  // Find which section contains our position
  let inProcessable = false; // Before first section = not processable
  for (const ss of sectionStarts) {
    if (ss.index > position) break;
    inProcessable = ss.process;
  }
  
  return inProcessable;
}

export const ExerciseHTMLContent: React.FC<ExerciseHTMLContentProps> = ({ 
  content, 
  className,
  enableExerciseLinking = true 
}) => {
  const { findMatchingExercise, exercises, isLoading } = useExerciseLibrary();
  
  const processedContent = useMemo(() => {
    if (!content || !enableExerciseLinking) {
      return null;
    }

    // Normalize common typos before processing
    let processedHtml = content
      .replace(/\{\{exrcise:/gi, '{{exercise:')
      .replace(/\{\{excersize:/gi, '{{exercise:')
      .replace(/\{\{excercise:/gi, '{{exercise:');

    const exercisesToRender: ProcessedExercise[] = [];

    // Step 1: Parse admin-added exercise markup {{exercise:id:name}}
    // These are ONLY in Main Workout and Finisher sections (backend guarantees this)
    const markupExercises = parseExerciseMarkup(processedHtml);

    markupExercises.forEach(({ fullMatch, id, name }) => {
      const placeholder = `__EXERCISE_${exercisesToRender.length}__`;
      exercisesToRender.push({ name, id, originalText: fullMatch });
      processedHtml = processedHtml.replace(fullMatch, placeholder);
    });

    // Step 2: Find bold text and try to match to exercises (depends on library loading)
    // SECTION-AWARE: Only match in 💪 Main Workout and ⚡ Finisher sections
    if (!isLoading && exercises.length) {
      const boldPattern = /<(strong|b)>([^<]+)<\/(strong|b)>/gi;
      let match;
      const boldMatches: Array<{ fullMatch: string; text: string; tag: string; index: number }> = [];

      while ((match = boldPattern.exec(processedHtml)) !== null) {
        if (match[2].includes('__EXERCISE_')) continue;
        boldMatches.push({
          fullMatch: match[0],
          text: match[2].trim(),
          tag: match[1],
          index: match.index,
        });
      }

      boldMatches.forEach(({ fullMatch, text, tag, index }) => {
        // SECTION CHECK: skip if not in processable section
        if (!isInProcessableSection(processedHtml, index)) return;
        
        if (
          text.length < 3 ||
          /^\d+$/.test(text) ||
          /^(set|rep|rest|round|min|sec|x\d|warm|cool|note|tip)/i.test(text) ||
          /^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i.test(text) ||
          /^(week|day|phase)/i.test(text)
        ) {
          return;
        }

        const matchResult = findMatchingExercise(text, 0.8);

        if (matchResult) {
          const placeholder = `__EXERCISE_${exercisesToRender.length}__`;
          exercisesToRender.push({
            name: text,
            id: matchResult.exercise.id,
            originalText: fullMatch,
          });
          processedHtml = processedHtml.replace(fullMatch, `<${tag}>${placeholder}</${tag}>`);
        }
      });

      // Step 3: Match plain-text exercise mentions - SECTION-AWARE
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(`<div>${processedHtml}</div>`, 'text/html');
        const root = doc.body.firstElementChild as HTMLElement | null;

        if (root) {
          const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
          const textNodes: Text[] = [];

          let node = walker.nextNode();
          while (node) {
            textNodes.push(node as Text);
            node = walker.nextNode();
          }

          textNodes.forEach((textNode) => {
            const parentTag = textNode.parentElement?.tagName?.toLowerCase();
            if (!parentTag) return;
            if (parentTag === 'script' || parentTag === 'style') return;

            const raw = textNode.textContent ?? '';
            if (!raw.trim()) return;
            if (raw.includes('__EXERCISE_')) return;
            if (raw.toLowerCase().includes('{{exercise:')) return;

            // SECTION CHECK: Find position of this text node in the original HTML
            // Use the text content to approximate position
            const posInHtml = processedHtml.indexOf(raw);
            if (posInHtml !== -1 && !isInProcessableSection(processedHtml, posInHtml)) return;

            const candidate = extractExerciseCandidate(raw);
            if (!candidate) return;

            const matchResult = findMatchingExercise(candidate, 0.82);
            if (!matchResult) return;

            const placeholder = `__EXERCISE_${exercisesToRender.length}__`;
            exercisesToRender.push({
              name: candidate,
              id: matchResult.exercise.id,
              originalText: candidate,
            });

            const re = new RegExp(escapeRegExp(candidate), 'gi');
            textNode.textContent = raw.replace(re, placeholder);
          });

          processedHtml = root.innerHTML;
        }
      } catch {
        // If DOM parsing fails for any reason, keep the existing processedHtml.
      }
    }

    return { html: processedHtml, exercises: exercisesToRender };
  }, [content, enableExerciseLinking, findMatchingExercise, exercises, isLoading]);

  // Fallback: render without exercise linking
  if (!processedContent) {
    const sanitizedContent = DOMPurify.sanitize(content, {
      ALLOWED_TAGS,
      ALLOWED_ATTR,
      ALLOW_DATA_ATTR: false,
    });

    return (
      <div
        className={cn("prose prose-sm max-w-none dark:prose-invert text-display break-words-safe", className)}
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        style={{ width: '100%', maxWidth: '100%' }}
      />
    );
  }
  
  const { html, exercises: exerciseList } = processedContent;
  
  // Sanitize the HTML
  const sanitizedHtml = DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });
  
  // If no exercises were found, render normally
  if (exerciseList.length === 0) {
    return (
      <div
        className={cn("prose prose-sm max-w-none dark:prose-invert text-display break-words-safe", className)}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        style={{ width: '100%', maxWidth: '100%' }}
      />
    );
  }
  
  // Parse sanitized HTML into DOM and convert to React elements
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${sanitizedHtml}</div>`, 'text/html');
  const wrapper = doc.body.firstChild;
  
  if (!wrapper) {
    return (
      <div
        className={cn("prose prose-sm max-w-none dark:prose-invert text-display break-words-safe", className)}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        style={{ width: '100%', maxWidth: '100%' }}
      />
    );
  }
  
  // Convert DOM to React elements with inline exercise buttons
  const reactContent = Array.from(wrapper.childNodes).map((child, idx) =>
    domToReact(child, exerciseList, `root-${idx}`)
  );
  
  // DEV check: ensure all placeholders were replaced
  if (import.meta.env.DEV && sanitizedHtml.includes('__EXERCISE_')) {
    // eslint-disable-next-line no-console
    console.warn('ExerciseHTMLContent: some __EXERCISE_ placeholders were not replaced in DOM conversion');
  }
  
  return (
    <div
      className={cn("prose prose-sm max-w-none dark:prose-invert text-display break-words-safe", className)}
      style={{ width: '100%', maxWidth: '100%' }}
    >
      {reactContent}
    </div>
  );
};

export default ExerciseHTMLContent;
