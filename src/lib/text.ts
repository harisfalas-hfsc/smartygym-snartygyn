/**
 * Strips HTML tags from a string, leaving only plain text
 * Uses DOMParser for XSS-safe parsing (doesn't execute scripts)
 * Useful for displaying content snippets in cards and listings
 */
export function stripHtmlTags(html: string): string {
  if (!html) return '';
  
  // Use DOMParser - safer than innerHTML as it doesn't execute scripts
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  return doc.body.textContent || '';
}
