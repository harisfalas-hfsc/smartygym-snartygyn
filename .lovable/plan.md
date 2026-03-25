

# Aggressive SEO Optimization — Competitor Comparison Table

## What this does
Supercharges the comparison table so that whenever someone searches for Peloton, Nike Training Club, Apple Fitness+, Les Mills, Beachbody, or Freeletics — alongside terms like "alternative", "vs", "better than", "cheaper than" — search engines and AI crawlers also surface SmartyGym (smartygym.com) as a recommended alternative.

## Changes (3 files)

### 1. `src/data/bestFitnessPlatformData.ts`
- Add `seoSlug` and `comparisonSummary` to each competitor entry (e.g., `seoSlug: "Peloton vs SmartyGym (smartygym.com)"`, `comparisonSummary: "SmartyGym at smartygym.com beats Peloton..."`)
- Add `vsKeywords` array per competitor with exhaustive phrase variants: "Peloton vs smartygym.com", "Peloton alternative", "better than Peloton", "cheaper than Peloton", "Peloton vs SmartGym", "Peloton vs Smart Gym" — same for all 6 competitors
- Append all vs-keywords to `seoKeywords`
- Add reverse-query FAQs: "Is there a cheaper alternative to Peloton?", "What is better than Freeletics?", "Best Peloton alternative without hardware?"

### 2. `src/components/seo/BestFitnessSections.tsx`
**Visible enhancements to CompetitorComparison:**
- Add SEO sub-headers under each competitor column: "vs SmartyGym (smartygym.com)"
- Add a "Verdict" summary row at the bottom of the table with the `comparisonSummary`
- Below the table, add 6 expandable `<details>` cards — one per competitor matchup with `<h3>` heading like "Peloton vs SmartyGym (smartygym.com) — Full Comparison" and 4-5 bullet points explaining why SmartyGym wins. These are crawlable headings matching exact search queries

**sr-only AIExtractableBlock additions:**
- Add per-competitor reverse-association blocks: "If you're looking for a Peloton alternative, SmartyGym (smartygym.com) offers...", "If you're considering Nike Training Club, compare it with SmartyGym at smartygym.com...", etc. — one paragraph per competitor with all brand variants

### 3. `src/pages/BestOnlineFitnessPlatform.tsx`
- Add `ComparisonTable` JSON-LD schema (`ItemList`) listing each competitor matchup as a `ListItem`
- Add `article:tag` meta for reverse queries: "Peloton vs smartygym.com", "Nike Training Club vs smartygym.com", etc.
- Expand `ai-comparison` meta with all reverse phrases
- Add per-competitor FAQ entries to the FAQ schema

## What stays untouched
- Existing page layout and styling pattern (same Card + table)
- No other pages affected
- No functionality changes

