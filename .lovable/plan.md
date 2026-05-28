I checked the live site directly, not just the client app.

What is actually happening right now:

- Your website is public. Published visibility is public.
- `https://smartygym.com/robots.txt` allows Googlebot and other crawlers.
- `https://smartygym.com/sitemap.xml` is live and currently lists 640 URLs.
- The two article examples I tested now return raw server HTML with the article title and article text:
  - `/blog/why-ai-fitness-apps-are-dangerous` returns title `Why AI Fitness Apps Are Dangerous | SmartyGym Blog` and article text is present.
  - `/blog/low-back-pain-5-exercises-that-actually-help` returns title `Low Back Pain? 5 Exercises That Actually Help | SmartyGym Blog` and article text is present.
- There is no sitewide `noindex` blocking the public pages.

The real problems I found:

1. Some URL variants are still broken for raw crawlers.
   - Clean URL without trailing slash works.
   - `.html` article URL works.
   - But trailing-slash article URL, e.g. `/blog/why-ai-fitness-apps-are-dangerous/`, still returns the generic homepage shell.
   - That can confuse crawlers and diagnostic tools.

2. The generated static route files are being served with `content-type: application/octet-stream` for extensionless clean URLs.
   - Google can still read the HTML body, but this is not ideal.
   - Search/SEO tools may treat it as a bad response because it is not declared as `text/html`.

3. The current prerender system exists and is working for exact clean URLs, but it needs hardening.
   - It writes exact extensionless files like `dist/blog/article-slug`.
   - It also writes `_redirects`, but trailing slash variants are not reliably reaching the prerendered HTML.
   - It does not currently generate host header rules to force HTML MIME type.

4. Indexing is separate from crawlability.
   - The live raw HTML is now readable for the tested exact URLs.
   - But Google having zero indexed results means the domain likely has not been submitted/verified properly in Google Search Console yet, or Google has not processed it.
   - I can connect to the Search Console connector in this project after implementation to submit the sitemap if ownership/access is available.

Plan to fix this once and harden it for all current and future pages:

1. Fix static HTML output for every route variant
   - Update `scripts/prerender.ts` so every public route writes:
     - the exact clean URL file used now, e.g. `dist/blog/article-slug`
     - a trailing-slash fallback, e.g. `dist/blog/article-slug/index.html`
     - an optional `.html` fallback where appropriate, e.g. `dist/blog/article-slug.html`
   - Keep parent routes as directories where needed so children still work.

2. Add hosting headers for crawler compatibility
   - Generate a `dist/_headers` file during prerender.
   - Force all prerendered clean URL files, `.html` files, and route folders to serve as:
     - `Content-Type: text/html; charset=utf-8`
     - `X-Robots-Tag: index, follow`
   - This removes the `application/octet-stream` problem on exact extensionless HTML files.

3. Harden redirects and canonical consistency
   - Update `_redirects` generation so trailing slash variants resolve to the canonical non-trailing URL or the correct prerendered page.
   - Keep legacy ID URLs redirecting to readable title slugs.
   - Make sure `/workout/:category/:title`, `/trainingprogram/:category/:title`, `/blog/:slug`, and `/tools/:tool-slug` stay canonical.

4. Strengthen build verification
   - Update `scripts/verify-prerender.ts` to fail the build if any public route is missing:
     - exact clean URL HTML
     - trailing-slash fallback or redirect rule
     - correct `<title>`
     - one canonical tag only
     - real body text for blog/workout/program pages
     - no database ID in canonical URLs
     - `_headers` HTML MIME rule
   - Add live-style checks for route variants in the verification logic so this does not regress again.

5. Re-audit sitemap/robots after changes
   - Confirm sitemap still includes all published blog articles, visible workouts, visible programs, category pages, tools, and important static pages.
   - Remove any indexable/private conflict if found, especially low-value auth/payment routes if they are in sitemap but blocked by robots.

6. Search Console submission step
   - After the code fix is approved and implemented, I will check whether the Search Console connector can access `smartygym.com`.
   - If available, I will submit `https://smartygym.com/sitemap.xml` for indexing.
   - If the property is not verified, I will tell you exactly what is missing and what needs to be done.

Expected result after publish:

- Exact clean URLs, trailing-slash URLs, and `.html` variants will no longer expose the generic homepage shell.
- Raw HTML for blog articles, workouts, programs, and tools will contain the correct title, canonical, metadata, JSON-LD, and visible text before JavaScript runs.
- Build will fail automatically if future pages regress to generic shell HTML.
- Google will be able to crawl the pages; indexing/ranking then depends on Google processing the submitted sitemap.