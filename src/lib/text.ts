/**
 * Strips HTML tags from a string, leaving only plain text
 * Useful for displaying content snippets in cards and listings
 */
export function stripHtmlTags(html: string): string {
  if (!html) return '';
  
  // Create a temporary div to parse HTML
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  
  // Return text content only
  return tmp.textContent || tmp.innerText || '';
}
