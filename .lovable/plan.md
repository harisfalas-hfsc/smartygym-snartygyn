## Goal

Mirror the counter pattern from Smarty Workouts/Programs ("Unlock all N…") on the **Blog** and **Smarty Tools** "About" cards — but without paywall wording, since both are free. Apply on mobile and desktop. Preserve the existing line count of each description card so alignment stays intact.

## Changes

### 1. `src/pages/Blog.tsx` — About Blog card (lines 156–165)

Add a second short line under the existing description showing the total article count.

- Existing line stays unchanged.
- New line uses the same styling pattern as Workouts: `text-primary font-bold` on the number.
- Wording (no paywall, since articles are free):
  - `Explore all <b>{allArticles.length}</b> free articles across Fitness, Nutrition, and Wellness.`
- Count source: `allArticles.length` (already fetched on the page).
- Mobile + desktop both render this line (no `isMobile` split needed — the card currently has just one line on both, we add exactly one more on both → still tightly bounded, no alignment break with the cards grid below).

### 2. `src/pages/Tools.tsx` — About Smarty Tools card (lines 156–199)

Add a free counter line for the number of available tools.

- Existing bold intro line stays unchanged.
- New short line below it (visible on mobile + desktop, above the desktop-only 5-column grid):
  - `Use all <b>5</b> tools — completely free, no signup required.`
- Count is static `5` (1RM, BMR, Macro, Workout Timer, Calorie Counter), derived from the existing tools array length to stay in sync if a tool is added later.
- The desktop 5-column detailed grid below remains unchanged so card alignment with the tool cards stays identical.

## Notes

- No paywall/"Unlock" wording, per request.
- Only the About card text changes; tool cards, article cards, filters, and layout are untouched, so grid alignment is preserved.
- Both views (mobile + desktop) receive the new line consistently.
