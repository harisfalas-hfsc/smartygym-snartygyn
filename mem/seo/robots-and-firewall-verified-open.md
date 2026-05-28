---
name: Robots and Firewall Verified Open to Google
description: Verified that robots.txt and Cloudflare are NOT blocking Googlebot from indexing smartygym.com pages
type: reference
---
Live audit (2026-05-28) with Googlebot user-agent confirmed:
- robots.txt returns 200, has explicit `User-agent: Googlebot / Allow: / Crawl-delay: 0`
- Disallow entries only cover admin/private routes (`/admin`, `/dashboard`, `/auth`, `/reset-password`, `/payment-success`, `/api/`, etc.) — never content routes
- Cloudflare serves Googlebot cleanly: /, /workout/*, /trainingprogram/*, /blog/*, /sitemap.xml all return 200 with no challenge, no cf-mitigated header
- Sitemap declared in robots.txt: https://smartygym.com/sitemap.xml

**Rule:** Do NOT re-investigate robots/firewall as a cause of missing indexing unless headers actually show 403/503/cf-mitigated. Indexing gaps are content/prerender/sitemap issues, not crawler blocks.
