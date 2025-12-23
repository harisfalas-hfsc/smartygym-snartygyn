import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';
import { cn } from '@/lib/utils';
import { useExerciseLibrary } from '@/hooks/useExerciseLibrary';
import { parseExerciseMarkup, extractExerciseNames } from '@/utils/exerciseMatching';
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

/**
 * Enhanced HTML content component that processes exercise names and adds View buttons
 * - Parses {{exercise:id:name}} markup for admin-added exercises
 * - Uses fuzzy matching to find exercises in bold text
 */
export const ExerciseHTMLContent: React.FC<ExerciseHTMLContentProps> = ({ 
  content, 
  className,
  enableExerciseLinking = true 
}) => {
  const { findMatchingExercise, exercises, isLoading } = useExerciseLibrary();
  
  const processedContent = useMemo(() => {
    if (!content || !enableExerciseLinking || isLoading || !exercises.length) {
      return null;
    }
    
    let processedHtml = content;
    const exercisesToRender: ProcessedExercise[] = [];
    
    // Step 1: Parse admin-added exercise markup {{exercise:id:name}}
    const markupExercises = parseExerciseMarkup(content);
    markupExercises.forEach(({ fullMatch, id, name }) => {
      const placeholder = `__EXERCISE_${exercisesToRender.length}__`;
      exercisesToRender.push({ name, id, originalText: fullMatch });
      processedHtml = processedHtml.replace(fullMatch, placeholder);
    });
    
    // Step 2: Find bold text and try to match to exercises
    const boldPattern = /<(strong|b)>([^<]+)<\/(strong|b)>/gi;
    let match;
    const boldMatches: Array<{ fullMatch: string; text: string; tag: string }> = [];
    
    while ((match = boldPattern.exec(processedHtml)) !== null) {
      // Skip if already a placeholder
      if (match[2].includes('__EXERCISE_')) continue;
      
      boldMatches.push({
        fullMatch: match[0],
        text: match[2].trim(),
        tag: match[1]
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
          name: text, // Keep original text for display
          id: matchResult.exercise.id, 
          originalText: fullMatch 
        });
        processedHtml = processedHtml.replace(fullMatch, `<${tag}>${placeholder}</${tag}>`);
      }
    });
    
    return { html: processedHtml, exercises: exercisesToRender };
  }, [content, enableExerciseLinking, findMatchingExercise, exercises, isLoading]);
  
  // Fallback: render without exercise linking
  if (!processedContent) {
    const sanitizedContent = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'span', 'div', 'blockquote', 'code', 'pre', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'sub', 'sup'],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'id', 'style', 'src', 'alt', 'width', 'height', 'colspan', 'rowspan'],
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
  
  // Split the processed HTML by exercise placeholders and render
  const { html, exercises: exerciseList } = processedContent;
  
  // Sanitize the HTML first
  const sanitizedHtml = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'span', 'div', 'blockquote', 'code', 'pre', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'sub', 'sup'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'id', 'style', 'src', 'alt', 'width', 'height', 'colspan', 'rowspan'],
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
  
  // Split by placeholders and render with ExerciseLinkButton components
  const parts = sanitizedHtml.split(/(__EXERCISE_\d+__)/);
  
  return (
    <div
      className={cn("prose prose-sm max-w-none dark:prose-invert text-display break-words-safe", className)}
      style={{ width: '100%', maxWidth: '100%' }}
    >
      {parts.map((part, index) => {
        const placeholderMatch = part.match(/__EXERCISE_(\d+)__/);
        
        if (placeholderMatch) {
          const exerciseIndex = parseInt(placeholderMatch[1]);
          const exercise = exerciseList[exerciseIndex];
          
          if (exercise) {
            return (
              <ExerciseLinkButton
                key={`exercise-${index}`}
                exerciseName={exercise.name}
                exerciseId={exercise.id}
                showViewButton={!!exercise.id}
              />
            );
          }
        }
        
        // Render regular HTML
        return (
          <span
            key={`html-${index}`}
            dangerouslySetInnerHTML={{ __html: part }}
          />
        );
      })}
    </div>
  );
};

export default ExerciseHTMLContent;
