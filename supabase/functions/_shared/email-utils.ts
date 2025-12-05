/**
 * Converts tiptap HTML classes to inline-styled email HTML
 * Email clients don't understand CSS classes, so we need inline styles
 */
export function convertTiptapToEmailHtml(content: string): string {
  if (!content) return '';
  
  let html = content;
  
  // Convert tiptap paragraph classes to inline styles
  html = html.replace(/<p class="tiptap-paragraph">/g, '<p style="margin: 0 0 16px 0; line-height: 1.6;">');
  html = html.replace(/<p class='tiptap-paragraph'>/g, '<p style="margin: 0 0 16px 0; line-height: 1.6;">');
  
  // Handle any remaining p tags without classes
  html = html.replace(/<p>/g, '<p style="margin: 0 0 16px 0; line-height: 1.6;">');
  
  // Convert strong/bold tags
  html = html.replace(/<strong>/g, '<strong style="font-weight: bold;">');
  
  // Convert em/italic tags
  html = html.replace(/<em>/g, '<em style="font-style: italic;">');
  
  // Convert underline
  html = html.replace(/<u>/g, '<u style="text-decoration: underline;">');
  
  // Convert heading tags
  html = html.replace(/<h1[^>]*>/g, '<h1 style="font-size: 24px; font-weight: bold; margin: 0 0 16px 0; color: #d4af37;">');
  html = html.replace(/<h2[^>]*>/g, '<h2 style="font-size: 20px; font-weight: bold; margin: 0 0 14px 0; color: #d4af37;">');
  html = html.replace(/<h3[^>]*>/g, '<h3 style="font-size: 18px; font-weight: bold; margin: 0 0 12px 0;">');
  
  // Convert lists
  html = html.replace(/<ul[^>]*>/g, '<ul style="margin: 0 0 16px 0; padding-left: 24px;">');
  html = html.replace(/<ol[^>]*>/g, '<ol style="margin: 0 0 16px 0; padding-left: 24px;">');
  html = html.replace(/<li[^>]*>/g, '<li style="margin-bottom: 8px;">');
  
  // Convert links - make them gold colored
  html = html.replace(/<a /g, '<a style="color: #d4af37; text-decoration: underline;" ');
  
  // Handle button-like links (CTA buttons in templates)
  html = html.replace(
    /style="[^"]*background[^"]*#d4af37[^"]*"/g,
    'style="display: inline-block; background: #d4af37; color: white; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;"'
  );
  
  // Remove any remaining class attributes that email clients won't understand
  html = html.replace(/ class="[^"]*"/g, '');
  html = html.replace(/ class='[^']*'/g, '');
  
  return html;
}

/**
 * Wraps content in a professional email template
 */
export function wrapInEmailTemplate(subject: string, content: string, ctaUrl?: string, ctaText?: string): string {
  const emailContent = convertTiptapToEmailHtml(content);
  
  let ctaButton = '';
  if (ctaUrl && ctaText) {
    ctaButton = `
      <p style="margin-top: 24px;">
        <a href="${ctaUrl}" style="display: inline-block; background: #d4af37; color: white; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">${ctaText}</a>
      </p>
    `;
  }
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;">
      <h1 style="color: #d4af37; margin-bottom: 20px; font-size: 24px;">${subject}</h1>
      <div style="font-size: 16px; line-height: 1.6; color: #333333;">
        ${emailContent}
      </div>
      ${ctaButton}
      <hr style="margin: 32px 0; border: none; border-top: 1px solid #eeeeee;">
      <p style="font-size: 12px; color: #999999;">This email was sent from SmartyGym.</p>
    </div>
  `;
}
