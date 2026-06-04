-- SEO metadata is intentionally public-facing content (titles, descriptions,
-- keywords, JSON-LD) — the same data is rendered into the HTML head and body
-- on every public page. Allow anon + authenticated to SELECT so the
-- prerender pipeline and the client app can read per-item overrides.

GRANT SELECT ON public.seo_metadata TO anon, authenticated;

DROP POLICY IF EXISTS "Public can read SEO metadata" ON public.seo_metadata;
CREATE POLICY "Public can read SEO metadata"
ON public.seo_metadata
FOR SELECT
TO anon, authenticated
USING (true);
