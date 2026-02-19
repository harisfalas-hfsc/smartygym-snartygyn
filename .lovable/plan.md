
# Social Media SEO Optimization

## What This Does
Everything happens behind the scenes -- zero visual changes to the website. This fixes incorrect social media URLs scattered across the code and adds TikTok presence to all SEO schemas, so Google and AI systems (ChatGPT, Claude, Perplexity, etc.) correctly associate SmartyGym with all four social platforms.

## The Problem Right Now
Your social media URLs are inconsistent across the site's SEO code. Some files point to the wrong Instagram (`smartygymcy` instead of `thesmartygym`), wrong Facebook (`smartygym.official` instead of your actual page), and TikTok is missing from most SEO schemas entirely.

## Correct Social Media URLs
These are the official URLs that will be used everywhere:
- Instagram: `https://www.instagram.com/thesmartygym/`
- TikTok: `https://www.tiktok.com/@thesmartygym`
- Facebook: `https://www.facebook.com/profile.php?id=61579302997368`
- YouTube: `https://www.youtube.com/@TheSmartyGym`

## What Changes (All Behind the Scenes)

### 1. Fix `index.html` -- Global SEO Schemas
- Update the Organization schema `sameAs` array: replace old Instagram/Facebook URLs with correct ones, add TikTok
- Add TikTok and Instagram profile meta tags for AI crawlers
- Add `article:publisher` meta tag pointing to Facebook page

### 2. Fix `src/components/SEOEnhancer.tsx` -- AI Crawler Metadata
- Update the `KNOWLEDGE_GRAPH_LINKS` object with all four correct social URLs (including TikTok)
- Add TikTok-specific `schema:sameAs` meta tag

### 3. Fix `src/utils/seoHelpers.ts` -- Schema Generators
- Update every `sameAs` array (Person schema for Haris Falas, Organization schema, etc.) to use correct URLs and include TikTok

### 4. Fix `src/utils/seoSchemas.ts` -- Additional Schemas
- Same fix: update all `sameAs` arrays with correct URLs and add TikTok

### 5. Fix `src/pages/Index.tsx` -- Homepage Schema
- Update the Organization `sameAs` in the homepage JSON-LD

### 6. Fix `src/components/admin/CorporateBrochure.tsx` and `IndividualBrochure.tsx`
- Update social links from wrong URLs (`smarty.gym`, `smartygym.official`) to correct ones

### 7. Fix `public/llms.txt` -- AI Knowledge Base
- Update the social profiles section with correct URLs and add TikTok

### 8. Fix `supabase/functions/refresh-seo-metadata/index.ts`
- Update `sameAs` array in the edge function schema with correct URLs and TikTok

## Files Modified
- `index.html`
- `src/components/SEOEnhancer.tsx`
- `src/utils/seoHelpers.ts`
- `src/utils/seoSchemas.ts`
- `src/pages/Index.tsx`
- `src/components/admin/CorporateBrochure.tsx`
- `src/components/admin/IndividualBrochure.tsx`
- `public/llms.txt`
- `supabase/functions/refresh-seo-metadata/index.ts`

## No Visual Changes
Everything is metadata, schemas, and behind-the-scenes SEO code. Your website will look exactly the same.
