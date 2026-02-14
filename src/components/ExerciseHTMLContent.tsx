import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';
import { cn } from '@/lib/utils';
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
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent || '';
    
    if (!text.includes('__EXERCISE_')) {
      return text;
    }
    
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
  
  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as Element;
    const tagName = element.tagName.toLowerCase();
    
    if (!ALLOWED_TAGS.includes(tagName)) {
      const children = Array.from(node.childNodes).map((child, idx) =>
        domToReact(child, exerciseList, `${keyPrefix}-${idx}`)
      );
      return <>{children}</>;
    }
    
    const props: Record<string, string> = {};
    for (const attr of Array.from(element.attributes)) {
      if (ALLOWED_ATTR.includes(attr.name)) {
        const propName = attr.name === 'class' ? 'className' : attr.name;
        props[propName] = attr.value;
      }
    }
    
    const children = Array.from(node.childNodes).map((child, idx) =>
      domToReact(child, exerciseList, `${keyPrefix}-${idx}`)
    );
    
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
 * Enhanced HTML content component that renders exercise View buttons
 * ONLY from backend-generated {{exercise:id:name}} markup.
 * No live fuzzy matching — the backend reprocessor is the single source of truth.
 */
export const ExerciseHTMLContent: React.FC<ExerciseHTMLContentProps> = ({ 
  content, 
  className,
  enableExerciseLinking = true 
}) => {
  const processedContent = useMemo(() => {
    if (!content || !enableExerciseLinking) {
      return null;
    }

    // Normalize common typos
    let processedHtml = content
      .replace(/\{\{exrcise:/gi, '{{exercise:')
      .replace(/\{\{excersize:/gi, '{{exercise:')
      .replace(/\{\{excercise:/gi, '{{exercise:');

    const exercisesToRender: ProcessedExercise[] = [];

    // Parse {{exercise:id:name}} markup and replace with placeholders
    const markupExercises = parseExerciseMarkup(processedHtml);

    markupExercises.forEach(({ fullMatch, id, name }) => {
      const placeholder = `__EXERCISE_${exercisesToRender.length}__`;
      exercisesToRender.push({ name, id, originalText: fullMatch });
      processedHtml = processedHtml.replace(fullMatch, placeholder);
    });

    return { html: processedHtml, exercises: exercisesToRender };
  }, [content, enableExerciseLinking]);

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
  
  const sanitizedHtml = DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });
  
  if (exerciseList.length === 0) {
    return (
      <div
        className={cn("prose prose-sm max-w-none dark:prose-invert text-display break-words-safe", className)}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        style={{ width: '100%', maxWidth: '100%' }}
      />
    );
  }
  
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
  
  const reactContent = Array.from(wrapper.childNodes).map((child, idx) =>
    domToReact(child, exerciseList, `root-${idx}`)
  );
  
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
