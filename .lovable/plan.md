

# Enrich LocalBusiness Schema and Update Sitemap — Global Focus

## Summary

Extend the Contact page's `LocalBusiness` structured data with full social profiles, opening hours, global service area, and business details. Update sitemap dates for freshness. Zero visual, design, style, or content changes — all modifications are invisible metadata only.

## Changes

### 1. Enrich LocalBusiness Schema on Contact Page
**File:** `src/pages/Contact.tsx`

Extend the existing sparse `LocalBusiness` schema to include:
- **`@type`**: Change to `["LocalBusiness", "HealthClub"]` for richer categorization
- **`areaServed`**: Array of 30+ countries (all G20 nations plus key European and advanced economies) — signals to Google this is a global platform, not tied to any single country
- **`openingHoursSpecification`**: 24/7 availability (online platform, matching the existing HealthClub schema)
- **`priceRange`**: `€€`
- **`currenciesAccepted`**: `EUR`
- **`paymentAccepted`**: `Credit Card, Debit Card`
- **`contactPoint`**: Expand with available languages (English, Greek)
- **`logo`** and **`image`**: Add logo reference
- **`sameAs`**: Add the multi-domain network URLs (i-training.net, smartywod.com, smartylogbook.com, smartywellness.com, smartyworkout.com) to match the main Organization schema
- **No physical address**: Deliberately omitted to avoid associating the brand with any single country

The `areaServed` list will include: United States, Canada, United Kingdom, Germany, France, Italy, Spain, Netherlands, Belgium, Sweden, Denmark, Norway, Finland, Poland, Austria, Switzerland, Portugal, Ireland, Greece, Cyprus, Australia, Japan, South Korea, China, India, Russia, Brazil, Mexico, South Africa, Turkey, Saudi Arabia, Argentina, Indonesia — covering all G20 and major advanced economies.

### 2. Update Sitemap Dates
**File:** `public/sitemap.xml`

- Update all `lastmod` dates to April 2026 to signal active maintenance and freshness to search engines
- No structural changes, just date refreshes

## Technical Details

**Files to edit:**
- `src/pages/Contact.tsx` — Enrich `LocalBusiness` JSON-LD with global areaServed, hours, payment, social profiles, multi-domain network
- `public/sitemap.xml` — Update `lastmod` dates

No new files. No visual changes. No design changes. No content changes. No style changes. Completely invisible to visitors.

