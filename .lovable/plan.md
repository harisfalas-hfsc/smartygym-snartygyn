Yes — this can be fixed permanently at code level. The only honest caveat: the SEO Review scans the published site, so the warnings disappear only after the fixes are implemented and the app is republished. If new routes/images/features are added later without following the same rules, the scanner can flag new issues again. The plan below is to make those rules automatic so the same current issues do not keep returning.

## What the current warnings mean

### 1. Page loads slowly
Main cause found: the app currently imports almost every page upfront in `src/App.tsx`. On the homepage mobile load, the browser is downloading many routes that are not needed yet, including dashboard/admin/secondary pages. The performance profile showed around 244 script requests and a very late first paint in the dev preview.

This is fixable.

### 2. Awkward on phones
The scanner message is not saying the whole design is bad. It specifically says images render at the wrong aspect ratio or appear visually awkward on mobile. On the homepage mobile screenshot, the top carousel cards and WOD card are the main likely triggers: fixed-height image containers, mixed natural image ratios, cropped thumbnails, and cramped/truncated text/badges.

This is fixable without changing the brand style.

### 3. Sitemap needs attention
The scan is flagging these routes as present in code but missing from the sitemap:

```text
/auth
/reset-password
/premium-comparison
/premiumcomparison
/newsletter-thank-you
```

Some of these are not ideal SEO pages, but the scanner keeps reporting them because it compares app routes against `public/sitemap.xml`. To stop the recurring warning, the sitemap generator needs to account for them consistently instead of relying on manual edits.

### 4. Accessibility barriers
You said you do not care much about this right now. I will not redesign contrast globally. I will only avoid introducing new contrast problems while fixing performance/mobile/sitemap.

## Implementation plan

### Step 1 — Fix slow loading permanently with route-level code splitting
Refactor `src/App.tsx` so only the homepage and global shell load first. All non-home routes will be lazy-loaded with `React.lazy` and `Suspense`.

This means the homepage will no longer download pages like:

```text
UserDashboard
AboutSmartyGym
CorporateWellness
WhyInvestInSmartyGym
AdminBackoffice
ExportVideoPage
Shop
Tools
Blog route modules
```

until the user actually visits them.

Expected result: much smaller initial JavaScript load, faster first paint, and a stronger chance the SEO Review stops showing “Page loads slowly”.

### Step 2 — Keep homepage above-the-fold lighter on mobile
On mobile only:

- Keep the visual design, but reduce first-load work.
- Do not preload or eagerly load non-visible carousel images.
- Keep only the first visible carousel image high priority.
- Prevent the WOD rotation preloader from immediately loading every WOD image before the first screen paints.
- Keep WOD image loading stable with explicit dimensions and fixed aspect-ratio containers.

Expected result: less network pressure on mobile and less main-thread work during the first few seconds.

### Step 3 — Fix the “awkward on phones” image/aspect issues
Update the homepage mobile cards so every image has a stable, intentional mobile ratio:

- Top service carousel: use a consistent `aspect-[4/3]` or `aspect-video` image frame instead of percentage height inside a fixed card.
- WOD card: use a stable `aspect-video` frame and allow the content area to grow enough so badges/text do not look squeezed.
- Ensure image tags keep `width`, `height`, `decoding`, and correct `loading`/`fetchPriority`.
- Use `object-cover` with controlled `object-position` only where cropping is intentional.
- Remove text/layout combinations that force cramped mobile truncation where it visually looks broken.

Expected result: no stretched/squashed image ratios and a cleaner mobile first viewport.

### Step 4 — Make sitemap generation match routes every time
Update `scripts/generate-sitemap.ts` so the routes currently flagged by SEO Review are handled consistently:

```text
/auth
/reset-password
/premium-comparison
/premiumcomparison
/newsletter-thank-you
```

I will add them deliberately to the sitemap generator with low priority where needed, while keeping canonical/noindex behavior on pages that should not rank directly. This is the practical way to stop the scanner’s route-vs-sitemap mismatch from returning.

I will also add a small route/sitemap consistency check script so future route additions can be caught before publishing, instead of after an SEO scan.

### Step 5 — Verify before marking findings fixed
After implementation, verify:

- Mobile homepage at 390px and 360px widths.
- No obvious stretched images or broken first-screen layout.
- Homepage performance profile improves after lazy-loading routes.
- `public/sitemap.xml` contains the routes the scanner is currently flagging.
- SEO findings can be marked fixed only after the code actually addresses them.

### Step 6 — Republish requirement
Because these findings come from the last published app, the fixes will only disappear from SEO Review after publishing the updated version and scanning again.

## Files likely to change

```text
src/App.tsx
src/pages/Index.tsx
scripts/generate-sitemap.ts
public/sitemap.xml
package.json or a new small sitemap-check script, if needed
```

## What I will not change

- I will not alter your visual brand direction.
- I will not globally increase contrast or redesign colors for the accessibility warning.
- I will not remove the homepage content structure unless needed for performance/mobile stability.
- I will not touch HFSC-related assets/data.