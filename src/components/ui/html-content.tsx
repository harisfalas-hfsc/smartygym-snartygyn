import React from 'react';
import DOMPurify from 'dompurify';
import { cn } from '@/lib/utils';

interface HTMLContentProps {
  content: string;
  className?: string;
}

export const HTMLContent: React.FC<HTMLContentProps> = ({ content, className }) => {
  // Sanitize HTML using DOMPurify to prevent XSS attacks
  const sanitizedContent = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'span', 'div', 'blockquote', 'code', 'pre', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'sub', 'sup'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'id', 'style', 'src', 'alt', 'width', 'height', 'colspan', 'rowspan'],
    ALLOW_DATA_ATTR: false,
  });

  return (
    <>
      <style>{`
        .tiptap-paragraph:empty {
          margin: 0;
          padding: 0;
          line-height: 0.5;
        }
      `}</style>
      <div
        className={cn("prose prose-sm max-w-none dark:prose-invert text-display break-words-safe", className)}
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        style={{
          width: '100%',
          maxWidth: '100%',
        }}
      />
    </>
  );
};
