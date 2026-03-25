

# Remove FAQ from "Why We Are the Best" + Generate Comparison Table Image

## Two tasks

### Task 1: Remove FAQ section from the Best Fitness Platform page

**What changes:**

**`src/pages/BestOnlineFitnessPlatform.tsx`**
- Remove `<FAQSection faqs={bestFitnessFAQs} />` from the JSX (line ~270)
- Remove the FAQ schema: `generateFAQSchema(bestFitnessFAQs)` (line ~222)
- Remove `bestFitnessFAQs` from the import
- Remove `generateFAQSchema` from the import

**`src/components/seo/BestFitnessSections.tsx`**
- Remove the `FAQSection` component export

**What stays untouched:**
- The standalone `/faq` page — completely separate file, no changes
- The `bestFitnessFAQs` data in `bestFitnessPlatformData.ts` stays (harmless, and the FAQ schema on other pages may reference similar patterns)
- All other pages with their own FAQ schemas — untouched
- No layout, styling, or functionality changes anywhere else

### Task 2: Generate downloadable landscape comparison table image

Using the competitor comparison data already in the codebase, I will generate a high-quality landscape PDF of the comparison table with:
- SmartyGym brand colors (#29B6D2 accent, dark header)
- All 6 competitors + SmartyGym column
- All 11 feature rows + verdict row
- Clean, professional table design using reportlab
- Landscape A4 orientation
- Output to `/mnt/documents/` for download

