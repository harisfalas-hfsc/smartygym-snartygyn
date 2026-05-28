/**
 * Auto-generated RSS 2.0 feed for the SmartyGym blog.
 * Runs before `vite dev` and `vite build` (chained from package.json).
 *
 * Source of truth: the same `buildSeoRoutes()` helper used by the sitemap
 * and prerender, filtered to published blog articles only. This guarantees
 * the feed never drifts from the canonical URL set.
 *
 * Output: public/rss.xml (and dist/rss.xml when called from the build).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { BASE_URL, buildSeoRoutes, canonicalUrlFor, xmlEscape } from "./lib/seo-routes";

const FEED_TITLE = "SmartyGym Blog";
const FEED_DESCRIPTION =
  "Workouts, training science, and recovery insights from Sports Scientist Haris Falas.";
const FEED_LANGUAGE = "en-GB";
const FEED_MAX_ITEMS = 50;

function toRfc822(value: string | undefined | null): string {
  const d = value ? new Date(value) : new Date();
  const safe = Number.isNaN(d.getTime()) ? new Date() : d;
  return safe.toUTCString();
}

function stripHtml(html: string | undefined | null): string {
  if (!html) return "";
  return String(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function generateRss(
  outputPaths: string[] = [resolve("public/rss.xml")],
) {
  const { routes } = await buildSeoRoutes();

  const items = routes
    .filter((r) => r.kind === "blog-article")
    .map((r) => {
      const payload: any = (r as any).payload || {};
      const pub =
        payload.published_at ||
        payload.created_at ||
        r.lastmod ||
        new Date().toISOString();
      // Always link to the canonical ".html" version so RSS readers and
      // crawlers (Google, AI assistants) discover the prerendered, fully
      // readable HTML — not the clean URL that the host serves as the SPA
      // shell.
      const canonical = canonicalUrlFor(r.path);
      return {
        title: payload.title || r.title,
        link: canonical,
        guid: canonical,
        description: stripHtml(payload.excerpt) || r.description || "",
        author: payload.author_name as string | undefined,
        category: payload.category as string | undefined,
        image: payload.image_url as string | undefined,
        pubDateValue: pub,
        pubDate: toRfc822(pub),
        sortKey: new Date(pub).getTime() || 0,
      };
    })
    .sort((a, b) => b.sortKey - a.sortKey)
    .slice(0, FEED_MAX_ITEMS);

  const lastBuild = toRfc822(new Date().toISOString());

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">',
    "  <channel>",
    `    <title>${xmlEscape(FEED_TITLE)}</title>`,
    `    <link>${xmlEscape(`${BASE_URL}/blog.html`)}</link>`,
    `    <description>${xmlEscape(FEED_DESCRIPTION)}</description>`,
    `    <language>${FEED_LANGUAGE}</language>`,
    `    <lastBuildDate>${lastBuild}</lastBuildDate>`,
    `    <atom:link href="${xmlEscape(`${BASE_URL}/rss.xml`)}" rel="self" type="application/rss+xml" />`,
    ...items.flatMap((it) =>
      [
        "    <item>",
        `      <title>${xmlEscape(it.title)}</title>`,
        `      <link>${xmlEscape(it.link)}</link>`,
        `      <guid isPermaLink="true">${xmlEscape(it.guid)}</guid>`,
        `      <pubDate>${it.pubDate}</pubDate>`,
        it.author ? `      <dc:creator>${xmlEscape(it.author)}</dc:creator>` : "",
        it.category ? `      <category>${xmlEscape(it.category)}</category>` : "",
        it.description
          ? `      <description>${xmlEscape(it.description)}</description>`
          : "",
        it.image
          ? `      <enclosure url="${xmlEscape(it.image)}" type="image/jpeg" />`
          : "",
        "    </item>",
      ].filter(Boolean),
    ),
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");

  for (const outputPath of outputPaths) {
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, xml);
  }
  console.log(
    `[rss] wrote ${outputPaths
      .map((p) => p.replace(process.cwd() + "/", ""))
      .join(", ")} — ${items.length} items`,
  );
}

async function main() {
  await generateRss();
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main().catch((err) => {
    console.error("[rss] generation failed:", err);
    process.exit(1);
  });
}