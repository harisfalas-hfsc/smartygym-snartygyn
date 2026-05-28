Yes — I can fix this. I checked the live website, not just the one article.

Here is the clear truth in human language:

What is still correct:
- Google can open your sitemap.
- Your sitemap currently has 636 URLs.
- Every URL inside the current sitemap returns 200, not 404.
- Robots.txt and firewall are not blocking Google.
- The real `.html` pages are mostly available as pages.

What is wrong:
- The clean version of almost every page is broken as a normal web URL.
- I tested the live site and found 616 clean URLs returning `application/octet-stream`.
- That means Chrome can download them as files instead of opening them as pages.
- This is why you saw links starting a download.
- The screenshot URL is also an old/stale article URL:
  `https://smartygym.com/blog/amrap-vs-emom-vs-tabata.html`
  That exact URL is live 404.
- The current correct article URL is:
  `https://smartygym.com/blog/amrap-vs-emom-vs-tabata-which-is-best.html`
- So the problem is not only one article. The bigger problem is the clean URL / `.html` URL system created during the SEO fixes.

What I will fix:

1. Stop pages from downloading
- Remove the generated extensionless files that the host serves as downloads.
- Keep real public pages on `.html` URLs because those are currently served correctly as `text/html`.
- Make clean URLs redirect to the `.html` page instead of downloading a file.

Example:
- Bad now: `/blog/amrap-vs-emom-vs-tabata-which-is-best` downloads.
- Fixed: `/blog/amrap-vs-emom-vs-tabata-which-is-best` redirects to `/blog/amrap-vs-emom-vs-tabata-which-is-best.html`.

2. Restore old URLs that Google already knows
- Add permanent redirects for old article/workout/program URLs that changed.
- The screenshot URL will not stay 404.
- It will redirect to the correct current article.

Example:
- Bad now: `/blog/amrap-vs-emom-vs-tabata.html` is 404.
- Fixed: it redirects to `/blog/amrap-vs-emom-vs-tabata-which-is-best.html`.

3. Check every sitemap URL, not only one example
- Recheck all 636 sitemap URLs.
- Confirm no sitemap URL returns 404.
- Confirm no sitemap URL returns download content.
- Confirm Googlebot gets proper HTML pages.

4. Check every clean version of sitemap URLs
- For each `.html` sitemap URL, test the clean version too.
- Clean versions must redirect to `.html`.
- Clean versions must not return `application/octet-stream`.
- Clean versions must not download.

5. Fix internal links inside pages
- Check blog article content links.
- Check workout links.
- Check training program links.
- Fix links that point to clean URLs if those clean URLs can download.
- Public links should point to stable page URLs.

6. Fix the build safety check
- Add a rule that fails the SEO build if a clean URL artifact would be generated again.
- Add a rule that fails if clean URLs are not redirected properly.
- This prevents the same mess from coming back in the next publish.

7. Keep sitemap numbers honest
- I will not invent pages to make the number look bigger.
- I will report the exact final count by type:
  - static pages
  - workout category pages
  - training program category pages
  - workout pages
  - training program pages
  - blog pages
- If a page is missing, I will identify which one, not guess.

8. Final live verification after publish
After implementation and publish, I will test live `smartygym.com` again and report:
- screenshot URL status
- correct article URL status
- clean URL redirect status
- download-risk count
- sitemap URL count
- sitemap 404 count
- robots/firewall status

What you need to do:
- Approve this plan.
- I will implement the cleanup.
- Then you publish once.
- Then I recheck the live website before saying it is done.

This is the cleanup: remove the download-causing clean files, force clean URLs to real page redirects, restore stale Google URLs, and audit the whole sitemap instead of one page.