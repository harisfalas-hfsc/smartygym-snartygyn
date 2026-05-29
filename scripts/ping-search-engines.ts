/**
 * Post-build ping: notifies search engines that the sitemap has been updated.
 *
 * Triggered automatically via the `postbuild` npm script after every
 * `vite build` (i.e. every Lovable deploy). Also safe to run manually.
 *
 * Strategy:
 *  1. Prefer invoking the existing `refresh-sitemap-ping` Supabase Edge
 *     Function — single source of truth that also re-queues IndexNow.
 *  2. Fall back to direct legacy ping endpoints (Google + Bing) so the
 *     script still does something useful without env vars.
 *
 * Never throws — sitemap discovery should never break a deploy.
 */

const SITEMAP_URL = "https://smartygym.com/sitemap.xml";
const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || "https://cvccrvyimyzrxcwzmxwk.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2Y2NydnlpbXl6cnhjd3pteHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MTc2NjIsImV4cCI6MjA3NjE5MzY2Mn0.XU_h4CYRiQ7VN079laFHSVMrzB6urOhQZFoTagU_Wno";

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return await Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`timeout after ${ms}ms`)), ms),
    ),
  ]);
}

async function pingEdgeFunction(): Promise<boolean> {
  const url = `${SUPABASE_URL}/functions/v1/refresh-sitemap-ping`;
  try {
    const res = await withTimeout(
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ source: "postbuild" }),
      }),
      15_000,
    );
    const body = await res.text();
    console.log(`[ping] refresh-sitemap-ping → ${res.status}`);
    if (res.ok) {
      console.log(`[ping] response: ${body.slice(0, 400)}`);
      return true;
    }
    return false;
  } catch (e) {
    console.warn(`[ping] edge function failed: ${(e as Error).message}`);
    return false;
  }
}

async function pingLegacyEndpoints(): Promise<void> {
  const targets: Record<string, string> = {
    google: `https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`,
    bing: `https://www.bing.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`,
  };
  for (const [name, url] of Object.entries(targets)) {
    try {
      const res = await withTimeout(fetch(url, { method: "GET" }), 10_000);
      console.log(`[ping] ${name} legacy ping → ${res.status}`);
    } catch (e) {
      console.warn(`[ping] ${name} legacy ping failed: ${(e as Error).message}`);
    }
  }
}

async function main() {
  console.log(`[ping] notifying search engines about ${SITEMAP_URL}`);
  const ok = await pingEdgeFunction();
  if (!ok) {
    console.log("[ping] falling back to direct legacy pings");
    await pingLegacyEndpoints();
  } else {
    // Also do legacy pings — cheap, sometimes still consumed by aggregators.
    await pingLegacyEndpoints();
  }
  console.log("[ping] done");
}

main().catch((e) => {
  console.warn(`[ping] unexpected error: ${(e as Error).message}`);
  // Always exit 0 — never block a deploy because of ping failures.
  process.exit(0);
});