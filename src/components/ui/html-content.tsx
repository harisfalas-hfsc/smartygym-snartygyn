import React from 'react';
import { cn } from '@/lib/utils';

interface HTMLContentProps {
  content: string;
  className?: string;
}

export const HTMLContent: React.FC<HTMLContentProps> = ({ content, className }) => {
  // Basic sanitization - strip script tags for security
  const sanitize = (html: string) => {
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  };

  return (
    <div
      className={cn("prose prose-sm max-w-none text-display break-words-safe", className)}
      dangerouslySetInnerHTML={{ __html: sanitize(content) }}
      style={{
        color: 'hsl(var(--foreground))',
      }}
    />
  );
};
