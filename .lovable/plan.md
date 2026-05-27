I verified the live raw HTML directly:

- `https://smartygym.com/blog/why-ai-fitness-apps-are-dangerous` still returns the generic SPA shell.
- `https://smartygym.com/blog/why-ai-fitness-apps-are-dangerous.html` already returns the correct article title and full article HTML.

So the content generation is working, but the clean URL is not being mapped to the generated `.html` file. The previous directory `index.html` fallback is not being honored by the host for this deployment.

Plan:

1. Update the prerender output to make clean URLs deterministic
   - Keep generating per-route `.html` files.
   - Keep generating per-route `index.html` files.
   - Add an explicit static routing file that maps every clean route to its generated `.html` file for the current hosting environment.
   - Add fallback rules for blog, workouts, training programs, tools, and category routes so `/blog/:slug`, `/workout/:slug`, `/trainingprogram/:slug`, and tool URLs cannot fall back to the homepage shell.

2. Strengthen future-content coverage
   - Ensure the route builder continues to pull every published blog article, visible workout, visible training program, workout category, program category, and Smarty tool on every build.
   - Future content will be included automatically when you publish again because the build queries the database and regenerates the route map.
   - No manual code change should be needed for new blog articles, workouts, or training programs.

3. Strengthen verification so this cannot silently ship broken again
   - Update the verifier to check both the generated `.html` route and the clean-route mapping.
   - For dynamic content, fail the build if canonical, title, or real body text is missing.
   - Specifically verify representative blog, workout, training program, and Smarty tool routes.

4. Validate the exact failure mode
   - After implementation, confirm that the generated build contains:
     - `/blog/why-ai-fitness-apps-are-dangerous.html`
     - `/blog/why-ai-fitness-apps-are-dangerous/index.html`
     - a host routing entry mapping `/blog/why-ai-fitness-apps-are-dangerous` to the article HTML
   - Then publish. The clean URL must return the article HTML, not the homepage shell.

Technical detail:

The existing prerenderer is correctly producing the article HTML at `.html`; the live clean URL is failing because hosting is serving the SPA fallback for extensionless nested URLs. The fix is not to change the article system — it is to harden static route serving so every clean public URL resolves to its prerendered HTML file before the SPA fallback.

Scope covered:

- Existing blog articles
- Existing free workouts
- Existing free training programs
- Existing Smarty tools
- Future blog articles
- Future workouts
- Future training programs
- Future category pages
- Future content published through the existing content systems