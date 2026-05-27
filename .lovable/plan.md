I will implement the SEO fix as a routing problem, not just a metadata problem.

The current failure means this: the app is still letting clean URLs like `/blog/article-slug` fall through to the SPA homepage shell. So even if article HTML exists somewhere else, crawlers and “View Source” are not receiving it at the real URL.

Plan:

1. Replace the fragile clean-URL strategy
   - Stop relying only on `_redirects`, `.html` siblings, or extensionless files.
   - Generate the static HTML in the exact directory form that static hosts reliably serve:
     - `/blog/why-ai-fitness-apps-are-dangerous/index.html`
     - `/workouts/<category>/<slug>/index.html`
     - `/trainingprogram/<category>/<slug>/index.html`
     - `/tools/<tool>/index.html`
   - This is the most crawler-safe static output pattern because the clean URL maps directly to a real folder index file.

2. Remove the risky extensionless-file workaround
   - The previous attempt wrote files like `dist/blog/slug` without `.html`.
   - That can conflict with directory-based routes and may be ignored by the host.
   - I will simplify this so every public SEO URL has a real `index.html` inside its own folder.

3. Generate per-page source HTML for all public content
   - Blog articles: title, description, canonical, OG tags, JSON-LD, H1, and full article text inside the initial HTML.
   - Free workouts: unique title, canonical, workout body, metadata, JSON-LD.
   - Free training programs: unique title, canonical, program body, metadata, JSON-LD.
   - Smarty tools and public static pages: unique title/canonical/source content.
   - Category pages: unique titles and crawlable lists.

4. Future-proof the build
   - The route builder will continue querying the backend during every production build.
   - Any newly published blog article, free workout, free training program, category, or Smarty tool gets a new static `index.html` automatically on the next publish.
   - No manual code change for new content.

5. Add a source-level verification that cannot pass falsely
   - The verifier will read the exact file that should be served for the clean URL, e.g. `dist/blog/why-ai-fitness-apps-are-dangerous/index.html`.
   - It will fail the build if that file contains the homepage title instead of the article title.
   - It will fail if the article body text is missing.
   - It will fail if canonical/OG URL points to the wrong URL.
   - It will verify representative blog, workout, training program, tool, and category URLs.

6. Add a deployment sanity file/report
   - Generate a small SEO verification report during build listing the exact files created and checked.
   - This makes it clear whether the published build contains the static source files.

7. After implementation
   - The only acceptable result is:
     - `view-source:https://smartygym.com/blog/why-ai-fitness-apps-are-dangerous`
     - shows the article title and article text in raw HTML before JavaScript.
   - If Lovable hosting still serves the SPA shell despite real `/route/index.html` files, then the platform hosting layer is overriding static route files, and the next required step is support/platform escalation or moving the public site to SSR/static hosting that honors generated route files.

Technical details:

```text
During production build:

backend content
  -> scripts/lib/seo-routes.ts
  -> scripts/prerender.ts
  -> dist/blog/article-slug/index.html
  -> dist/workouts/category/slug/index.html
  -> dist/trainingprogram/category/slug/index.html
  -> dist/tools/tool-name/index.html
  -> scripts/verify-prerender.ts checks exact source files
```

I will not touch the protected generated backend client/type files. I will only adjust the prerenderer/verifier and, if needed, the SEO route/body renderer.