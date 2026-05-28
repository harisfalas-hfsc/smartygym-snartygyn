I checked the live domain again.

Answer: it is not fully fixed yet.

What works now:
- The clean article URL returns real prerendered HTML.
- The article title is present in raw HTML.
- The article text is present in raw HTML.

What is still broken:
- Clean extensionless URLs are served as `application/octet-stream`, not `text/html`.
- Trailing-slash URLs like `/blog/why-ai-fitness-apps-are-dangerous/` still return the generic homepage shell.

Plan to fix it properly:

1. Stop relying on host-specific `_headers`
- Lovable hosting is not applying the generated `_headers` rules to extensionless files.
- I will stop depending on that for the main canonical URLs.

2. Make canonical URLs serve real `.html` files through forced rewrites
- For every public route, generate `dist/<route>.html` as the real HTML file.
- Generate `_redirects` rules so `/blog/slug` rewrites to `/blog/slug.html` with `200!`.
- This should make the response use `text/html` because the served artifact has a `.html` extension.

3. Fix trailing slash variants
- Generate forced redirect rules so `/blog/slug/` redirects to `/blog/slug` with `301!`.
- Same for workouts, training programs, tools, categories, and all future generated routes.

4. Keep fallback artifacts for host compatibility
- Keep `dist/<route>` extensionless files as backup only.
- Keep parent `index.html` files where needed for nested routes.
- Do not break existing client-side navigation.

5. Harden verification
- Update `scripts/verify-prerender.ts` so the build fails unless every sitemap route has:
  - a `.html` prerender file
  - a clean URL rewrite to that `.html` file
  - a trailing-slash 301 redirect to the canonical clean URL
  - correct title, canonical, body content, and no homepage shell

6. After publish, verify live with curl
- Check headers and HTML for representative routes:
  - blog article
  - workout page
  - training program page
  - tool page
  - trailing-slash variant
- Success condition: canonical clean URLs return `content-type: text/html` and raw HTML contains the correct title and page body before JavaScript.