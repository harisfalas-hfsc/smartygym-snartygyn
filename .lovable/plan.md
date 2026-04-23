

# Connect Google Business Profile — Invisible SEO Enhancement

## Summary

Zero visual changes to the website. All modifications are in hidden structured data (JSON-LD) that only search engines read. Your visitors will see no difference.

## Changes

### 1. Add Google Business Profile URL to Organization Schema
- File: `src/utils/seoSchemas.ts`
- Add the Google Business Profile URL to the `sameAs` array alongside your existing Instagram, TikTok, YouTube, and Facebook links
- This is invisible metadata that tells Google "this website and this Business Profile are the same entity"

### 2. Add Google Business Profile URL to Contact Page Schema
- File: `src/pages/Contact.tsx`
- Add the same URL to the `LocalBusiness` structured data
- Again, completely invisible to visitors

### 3. Your Manual Step (Outside the Website)
- On your Google Business Profile, verify that the website field is set to `https://smartygym.com` — this creates the reverse trust link from Google back to your site

## Impact
- Stronger brand signal in Google Search
- Better Knowledge Panel visibility
- Improved brand search rankings
- Zero visual changes to the website

