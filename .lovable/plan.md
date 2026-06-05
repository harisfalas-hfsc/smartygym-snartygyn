Yes — I understand the problem: the article card is now the correct brand width, but the hero image became too dominant, and the article body formatting has poor paragraph rhythm.

Plan:

1. Keep the blog article page on the standard wide card
- Keep the outer blog article card aligned with the rest of the site.
- Do not go back to the narrow old layout.
- This preserves consistency with workout pages, program pages, and the rest of the brand system.

2. Stop the image from becoming a huge full-width block
- On desktop/tablet, place the article image beside the article intro/header area instead of making it a massive full-width banner.
- Use a controlled image column with a fixed visual ratio so it feels premium but not oversized.
- Let the title, category, read time, date, author box, and image form one clean top section.
- On mobile, keep the image stacked under the title so it stays readable and does not squeeze the text.

3. Fix the article body readability
- Add a blog-specific content style so paragraphs have proper spacing after each paragraph.
- Improve line-height, heading spacing, list spacing, blockquote spacing, and image/table behavior inside blog articles.
- Avoid changing workout formatting, because workouts intentionally use compact spacing.

4. Remove the messy A4-style reading box from normal blog display
- Keep article content inside the main card, but avoid the document-like A4 padding/shadow that makes the article feel inconsistent.
- Preserve Reader Mode separately if it still needs document-style formatting.

5. Make it future-proof for all blog articles
- Apply the structure in `ArticleDetail.tsx`, not individual article data.
- Apply the formatting through a reusable blog article CSS class.
- Every existing and future blog article will inherit the same layout and spacing automatically.

Technical details:
- Update only the blog article template and blog-specific CSS.
- Main target files:
  - `src/pages/ArticleDetail.tsx`
  - `src/index.css`
- No article content, SEO metadata, database data, workout pages, program pages, or tool pages will be changed.