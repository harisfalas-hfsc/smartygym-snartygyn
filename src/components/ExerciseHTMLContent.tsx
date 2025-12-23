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

    // Step 1: Parse admin-added exercise markup {{exercise:id:name}} (does NOT depend on library loading)
    const markupExercises = parseExerciseMarkup(processedHtml);

    if (import.meta.env.DEV) {
      const hasExerciseMarkup = processedHtml.toLowerCase().includes('{{exercise:');
      if (hasExerciseMarkup && markupExercises.length === 0) {
        // eslint-disable-next-line no-console
        console.warn('ExerciseHTMLContent: found exercise markup but parsed 0 tags');
      }
    }

    markupExercises.forEach(({ fullMatch, id, name }) => {
      const placeholder = `__EXERCISE_${exercisesToRender.length}__`;
      exercisesToRender.push({ name, id, originalText: fullMatch });
      processedHtml = processedHtml.replace(fullMatch, placeholder);
    });

    // Step 2: Find bold text and try to match to exercises (depends on library loading)
    if (!isLoading && exercises.length) {
      const boldPattern = /<(strong|b)>([^<]+)<\/(strong|b)>/gi;
      let match;
      const boldMatches: Array<{ fullMatch: string; text: string; tag: string }> = [];

      while ((match = boldPattern.exec(processedHtml)) !== null) {
        // Skip if already a placeholder
        if (match[2].includes('__EXERCISE_')) continue;

        boldMatches.push({
          fullMatch: match[0],
          text: match[2].trim(),
          tag: match[1],
        });
      }

      // Process bold matches
      boldMatches.forEach(({ fullMatch, text, tag }) => {
        // Skip short text, numbers-only, or common non-exercise terms
        if (
          text.length < 3 ||
          /^\d+$/.test(text) ||
          /^(set|rep|rest|round|min|sec|x\d|warm|cool|note|tip)/i.test(text) ||
          /^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i.test(text) ||
          /^(week|day|phase)/i.test(text)
        ) {
          return;
        }

        // Try to find a matching exercise
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

      // Step 3: Match plain-text exercise mentions (e.g. list items: "Jumping Jacks - 1 minute")
      // We do this by rewriting text nodes to include __EXERCISE_n__ placeholders.
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
