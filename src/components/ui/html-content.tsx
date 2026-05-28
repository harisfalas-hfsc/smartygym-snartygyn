import React from 'react';
import DOMPurify from 'dompurify';
import { cn } from '@/lib/utils';

interface HTMLContentProps {
  content: string;
  className?: string;
}

const CANONICAL_HTML_PREFIXES = [
  '/blog',
  '/workout',
  '/trainingprogram',
  '/tools',
  '/coach-profile',
  '/coach-cv',
  '/the-smarty-method',
  '/about',
  '/about-smartygym',
  '/best-online-fitness-platform',
  '/why-invest-in-smartygym',
  '/wod-archive',
  '/daily-ritual',
  '/exerciselibrary',
  '/community',
  '/shop',
  '/contact',
  '/faq',
  '/smarty-plans',
  '/joinpremium',
  '/join-premium',
  '/corporate',
  '/corporate-wellness',
];

const toSafeCanonicalHref = (href: string): string => {
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return href;
  try {
    const url = href.startsWith('http') ? new URL(href) : new URL(href, 'https://smartygym.com');
    if (url.hostname && !['smartygym.com', 'www.smartygym.com'].includes(url.hostname)) return href;
    const path = url.pathname.replace(/\/+$/g, '') || '/';
    if (path === '/' || path.endsWith('.html')) return href;
    if (!CANONICAL_HTML_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) return href;
    const canonicalPath = `${path}.html${url.search}${url.hash}`;
    return href.startsWith('http') ? `https://smartygym.com${canonicalPath}` : canonicalPath;
  } catch {
    return href;
  }
};

const normalizeInternalLinks = (html: string): string =>
  html.replace(/href=(['"])(.*?)\1/gi, (_match, quote: string, href: string) => `href=${quote}${toSafeCanonicalHref(href)}${quote}`);

export const HTMLContent: React.FC<HTMLContentProps> = ({ content, className }) => {
  // Sanitize HTML using DOMPurify to prevent XSS attacks
  const sanitizedContent = normalizeInternalLinks(DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'span', 'div', 'blockquote', 'code', 'pre', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'sub', 'sup'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'id', 'style', 'src', 'alt', 'width', 'height', 'colspan', 'rowspan'],
    ALLOW_DATA_ATTR: false,
  }));

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
