# Universal Desktop Card/Container Widening

Apply the same desktop-only widening already validated on the homepage to every other page on the site. Mobile and tablet layouts stay untouched.

## The Standard (already used on Index.tsx)

Replace the standard page container:
```
container mx-auto max-w-6xl px-4 pb-8
```
with:
```
container mx-auto max-w-6xl md:max-w-[1500px] px-4 md:px-6 pb-8
```

- `md:` and above → expands to ~1500px wide with slightly larger horizontal padding.
- Below `md:` (mobile/tablet portrait) → keeps the existing `max-w-6xl` + `px-4` exactly as today.
- Multi-column grids (e.g. `lg:grid-cols-4`) are kept as-is so card rows remain on a single line, just wider — matching the "What We Stand For" behavior.
- Narrow legal/text pages (`max-w-4xl`) get widened only on desktop too, but more conservatively (see below) so paragraphs don't become too long to read comfortably.

## Pages To Update

Wide content pages (currently `max-w-6xl` → become `md:max-w-[1500px]`):
- Smarty Workouts (WODArchive, WODCategory)
- Smarty Programs (TrainingProgramDetail listing wrappers if 6xl)
- Smarty Rituals (DailySmartyRitual)
- Smarty Tools (Tools)
- Exercise Library (ExerciseLibrary)
- Community (Community)
- Blog (Blog)
- Take a Tour (TakeATour)
- Smarty Plans (SmartyPlans)
- Smarty Corporate (SmartyCorporate)
- Contact (Contact)
- About (About)
- Human Performance / Why We Are the Best (HumanPerformance, BestOnlineFitnessPlatform)

Narrow pages (currently `max-w-4xl` → become `md:max-w-[1200px]` for desktop comfort, mobile unchanged):
- FAQ (FAQ)
- The Smarty Method (TheSmartyMethod — currently `max-w-5xl`, bump to `md:max-w-[1200px]`)
- Why Invest in Smarty Gym (WhyInvestInSmartyGym)
- Corporate Wellness / Why Smarty Corporate (CorporateWellness)
- Privacy Policy (PrivacyPolicy)
- Terms of Service (TermsOfService)
- Disclaimer (Disclaimer)

## Card-Row Consistency Rule (Desktop)

Wherever a page has a row of 4 short feature/value cards (the "What We Stand For" pattern), ensure the grid uses `lg:grid-cols-4` so all four sit on one desktop line inside the wider container. Same logic for any 3-card rows (`lg:grid-cols-3`). No card should drop to a second line on desktop just because the container got wider.

I will scan each listed page and adjust grid column classes only where a card row currently wraps unintentionally on desktop.

## Out of Scope

- Mobile and tablet portrait layouts — not touched (changes are all `md:` or `lg:` prefixed).
- Workout/Program/Article *detail* reading pages where narrower text columns are intentional for readability (only the outer page chrome widens, inner prose columns left alone).
- Admin pages, Auth, NotFound, PaymentSuccess, Unsubscribe flows.

## Technical Summary

1. Search/replace the container pattern on each listed page file.
2. For narrow legal/info pages, use `md:max-w-[1200px]` instead of `[1500px]`.
3. Audit grid classes (`grid-cols-*`) on the touched pages; bump to `lg:grid-cols-4` (or 3) where a single-line row is the intent.
4. Leave `HeroDestinationConstellation` and homepage as the reference baseline.
5. After implementation, this width pattern becomes the project standard — to be saved as a memory so future pages adopt it automatically.
