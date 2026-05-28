/**
 * Live SEO audit. Hits the actual deployed smartygym.com domain (not dist/)
 * and verifies that every sampled URL is healthy from a Googlebot perspective:
 *  - HTTP 200, Content-Type text/html
 *  - Title is unique (not the homepage title) for non-home routes
 *  - <link rel="canonical"> matches the expected canonical .html URL
 *  - <h1> exists and is not the homepage H1 on non-home routes
 *  - Page contains real prerendered content (not just the SPA shell)
 *
 * It also probes the clean-URL counterpart of each .html URL to confirm the
 * boot redirect / canonical strategy is in place.
 *
 * Usage:  bunx tsx scripts/audit-live-seo.ts [--base https://smartygym.com] [--sample 5]
 */
import { buildSeoRoutes, canonicalUrlFor, BASE_URL } from "./lib/seo-routes";

interface CheckResult {
  url: string;
  ok: boolean;
  status: number;
  contentType: string;
  title: string;
  canonical: string;
  h1: string;
  failures: string[];
}

const UA = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
const HOMEPAGE_TITLE_SIGNATURE = "SmartyGym | Online Fitness Platform by Haris Falas";

function arg(name: string, fallback?: string): string | undefined {
  const idx = process.argv.findIndex((a) => a === `--${name}`);
  if (idx >= 0 && process.argv[idx + 1]) return process.argv[idx + 1];
  return fallback;
}

async function fetchUrl(url: string): Promise<{ status: number; contentType: string; location: string; body: string }> {
  const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "manual" });
  const body = res.status >= 200 && res.status < 400 ? await res.text() : "";
  return {
    status: res.status,
    contentType: res.headers.get("content-type") || "",
    location: res.headers.get("location") || "",
    body,
  };
}

function extract(html: string, re: RegExp): string {
  const m = html.match(re);
  if (!m) return "";
  return (m[1] || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

async function audit(url: string, expectedCanonical: string, isHome: boolean): Promise<CheckResult> {
  const failures: string[] = [];
  const r = await fetchUrl(url);
  const title = extract(r.body, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const canonicalTag = r.body.match(/<link[^>]+rel=["']canonical["'][^>]*>/i)?.[0] || "";
  const canonical = canonicalTag.match(/href=["']([^"']+)["']/i)?.[1] || "";
  const h1 = extract(r.body, /<h1[^>]*>([\s\S]*?)<\/h1>/i);

  if (r.status !== 200) failures.push(`status ${r.status}`);
  if (!r.contentType.toLowerCase().includes("text/html")) failures.push(`content-type ${r.contentType}`);
  if (!isHome && title === HOMEPAGE_TITLE_SIGNATURE) failures.push("title is homepage shell");
  if (canonical !== expectedCanonical) failures.push(`canonical=${canonical || "(missing)"} expected=${expectedCanonical}`);
  if (!h1) failures.push("missing <h1>");
  if (!isHome && h1 === HOMEPAGE_TITLE_SIGNATURE) failures.push("h1 is homepage shell");

  return {
    url,
    ok: failures.length === 0,
    status: r.status,
    contentType: r.contentType,
    title,
    canonical,
    h1,
    failures,
  };
}

async function main() {
  const base = arg("base", BASE_URL)!.replace(/\/$/, "");
  const sampleArg = arg("sample", "4")!;
  const sample = sampleArg === "all" ? Number.POSITIVE_INFINITY : Number(sampleArg);

  const { routes, redirects } = await buildSeoRoutes();
  const byKind: Record<string, typeof routes> = {};
  for (const r of routes) (byKind[r.kind] = byKind[r.kind] || []).push(r);

  const pick = <T,>(arr: T[], n: number): T[] => {
    if (!Number.isFinite(n) || arr.length <= n) return arr;
    const step = Math.floor(arr.length / n);
    return Array.from({ length: n }, (_, i) => arr[i * step]);
  };

  const targets = [
    ...pick(byKind["static"] || [], sample),
    ...pick(byKind["workout-category"] || [], sample),
    ...pick(byKind["program-category"] || [], sample),
    ...pick(byKind["blog-article"] || [], sample),
    ...pick(byKind["workout"] || [], sample),
    ...pick(byKind["program"] || [], sample),
  ];

  console.log(`[audit] base=${base} routes=${routes.length} sampled=${targets.length}`);
  let passed = 0;
  const cleanFails: string[] = [];
  const legacyFails: string[] = [];

  for (const route of targets) {
    const canonical = canonicalUrlFor(route.path).replace(BASE_URL, base);
    const result = await audit(canonical, canonical, route.path === "/");
    const tag = result.ok ? "PASS" : "FAIL";
    console.log(`[audit] ${tag} ${canonical}`);
    if (!result.ok) {
      console.log(`        title=${result.title.slice(0, 80)}`);
      console.log(`        canonical=${result.canonical}`);
      console.log(`        h1=${result.h1.slice(0, 80)}`);
      for (const f of result.failures) console.log(`        - ${f}`);
    } else {
      passed++;
    }

    // Probe the clean URL counterpart (skip homepage).
    if (route.path !== "/") {
      const cleanUrl = `${base}${route.path}`;
      const c = await fetchUrl(cleanUrl);
      const expectedPath = new URL(canonical).pathname;
      const cleanOk = [301, 302, 307, 308].includes(c.status) && c.location.includes(expectedPath);
      if (!cleanOk) {
        cleanFails.push(`${cleanUrl} (status=${c.status}, content-type=${c.contentType}, location=${c.location || "(none)"})`);
      }
    }
  }

  for (const rule of redirects) {
    const from = `${base}${rule.from}`;
    const to = canonicalUrlFor(rule.to).replace(BASE_URL, base);
    const sources = rule.from.endsWith(".html") ? [from] : [from, `${from}.html`];
    for (const source of sources) {
      const r = await fetchUrl(source);
      const expectedPath = new URL(to).pathname;
      const httpRedirectOk =
        [301, 302, 307, 308].includes(r.status) && r.location.includes(expectedPath);
      // Accept static meta-refresh stubs as a redirect-equivalent (the host
      // does not honor `_redirects`). The stub is `noindex, follow` with a
      // meta refresh + canonical pointing at the new slug URL.
      const metaRefreshOk =
        r.status === 200 &&
        r.contentType.toLowerCase().includes("text/html") &&
        /<meta\s+http-equiv=["']refresh["'][^>]*url=([^"'>\s]+)/i.test(r.body) &&
        new RegExp(`url=${expectedPath.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}`, "i").test(r.body) &&
        /<meta\s+name=["']robots["'][^>]*noindex/i.test(r.body);
      if (!httpRedirectOk && !metaRefreshOk) {
        legacyFails.push(`${source} (status=${r.status}, content-type=${r.contentType}, location=${r.location || "(none)"}, expected=${expectedPath})`);
      }
    }
  }

  console.log(`\n[audit] ${passed}/${targets.length} canonical URLs passed`);
  if (cleanFails.length) {
    console.log(`[audit] ${cleanFails.length} clean URL(s) are not redirecting to their .html canonical:`);
    for (const f of cleanFails) console.log(`        - ${f}`);
  } else {
    console.log(`[audit] clean URL probes OK`);
  }
  if (legacyFails.length) {
    console.log(`[audit] ${legacyFails.length} legacy redirect(s) failed:`);
    for (const f of legacyFails) console.log(`        - ${f}`);
  } else {
    console.log(`[audit] legacy redirects OK`);
  }
  if (passed !== targets.length || cleanFails.length || legacyFails.length) process.exitCode = 1;
}

main().catch((err) => {
  console.error("[audit] failed:", err);
  process.exit(1);
});