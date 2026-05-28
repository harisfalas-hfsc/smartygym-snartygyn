/**
 * Build safety check for SEO pre-rendering.
 *
 * It verifies the exact public URLs that appear in sitemap.xml have matching
 * static HTML artifacts in dist. This catches the failure where nested
 * dist/<route>/index.html files exist but clean URLs receive the SPA homepage.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildSeoRoutes, canonicalPathFor, canonicalUrlFor, htmlEscape } from "./lib/seo-routes";
import { slugifyContentName } from "../src/lib/seo-slugs";

const DIST = resolve("dist");

function assertIncludes(html: string, needle: string, label: string) {
  if (!needle || !html.toLowerCase().includes(needle.toLowerCase())) {
    throw new Error(`[verify-prerender] ${label} missing: ${needle}`);
  }
}

function assertSingleCanonical(html: string, expectedHref: string, label: string) {
  const canonicals = [...html.matchAll(/<link\s+[^>]*rel=["']canonical["'][^>]*>/gi)].map((match) => match[0]);
  if (canonicals.length !== 1) {
    throw new Error(`[verify-prerender] ${label} must have exactly one canonical tag, found ${canonicals.length}`);
  }
  const href = canonicals[0].match(/href=["']([^"']+)["']/i)?.[1] || "";
  if (href !== expectedHref) {
    throw new Error(`[verify-prerender] ${label} canonical is ${href}, expected ${expectedHref}`);
  }
}

function assertNotHomepageShell(html: string, routePath: string) {
  if (routePath !== "/" && html.includes("SmartyGym | Online Fitness Platform by Haris Falas")) {
    throw new Error(`[verify-prerender] ${routePath} still contains the homepage <title>; clean URL source is not unique`);
  }
}

function assertPayloadText(html: string, raw: unknown, label: string) {
  const normalize = (value: string) => value
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
  const text = normalize(String(raw || ""));
  if (text.length >= 40) {
    assertIncludes(normalize(html), text.slice(0, 80), label);
  }
}

function artifactFileFor(distDir: string, routePath: string) {
  if (routePath === "/") return join(distDir, "index.html");
  return join(distDir, routePath.replace(/^\//, "") + ".html");
}

function cleanArtifactFileFor(distDir: string, routePath: string) {
  if (routePath === "/") return join(distDir, "index.html");
  return join(distDir, routePath.replace(/^\//, ""));
}

function isFile(path: string) {
  return existsSync(path) && statSync(path).isFile();
}

function assertCleanUrlRedirect(redirects: string, routePath: string) {
  const expected = `${routePath} ${routePath}.html 301!`;
  const expectedTrailing = `${routePath}/ ${routePath}.html 301!`;
  if (!redirects.includes(expected) || !redirects.includes(expectedTrailing)) {
    throw new Error(`[verify-prerender] missing clean-URL .html redirect for ${routePath}`);
  }
}

function assertRedirectRule(redirectsFile: string, from: string, to: string) {
  const target = canonicalPathFor(to);
  const expected = `${from} ${target} 301!`;
  const expectedTrailing = `${from}/ ${target} 301!`;
  if (!redirectsFile.includes(expected) || !redirectsFile.includes(expectedTrailing)) {
    throw new Error(`[verify-prerender] missing legacy ID redirect from ${from} to ${to}`);
  }
}

export async function verifyPrerenderedSeo(options: { distDir?: string } = {}) {
  const distDir = options.distDir || DIST;
  const { routes, redirects: legacyRedirects, counts } = await buildSeoRoutes();
  const redirectsPath = join(distDir, "_redirects");
  if (!isFile(redirectsPath)) {
    throw new Error("[verify-prerender] missing dist/_redirects for clean URL rewrites");
  }
  const redirects = readFileSync(redirectsPath, "utf8");
  const headersPath = join(distDir, "_headers");
  if (!isFile(headersPath)) {
    throw new Error("[verify-prerender] missing dist/_headers for HTML MIME type rules");
  }
  const headers = readFileSync(headersPath, "utf8");
  if (!/Content-Type:\s*text\/html/i.test(headers)) {
    throw new Error("[verify-prerender] dist/_headers missing text/html Content-Type rule");
  }

  let checked = 0;
  for (const route of routes) {
    const artifactPath = artifactFileFor(distDir, route.path);
    if (!isFile(artifactPath)) {
      throw new Error(`[verify-prerender] missing clean URL source HTML for ${route.path}: expected ${artifactPath}`);
    }

    const html = readFileSync(artifactPath, "utf8");
    const cleanArtifactPath = cleanArtifactFileFor(distDir, route.path);
    if (!isFile(cleanArtifactPath)) {
      throw new Error(`[verify-prerender] missing extensionless clean URL artifact for ${route.path}: expected ${cleanArtifactPath}`);
    }
    const cleanHtml = readFileSync(cleanArtifactPath, "utf8");
    if (route.path !== "/" && cleanHtml !== html) {
      throw new Error(`[verify-prerender] clean URL artifact does not match .html artifact for ${route.path}`);
    }
    const canonicalUrl = canonicalUrlFor(route.path);
    assertNotHomepageShell(html, route.path);
    assertIncludes(html, `<title>${htmlEscape(route.title)}</title>`, `${route.path} title`);
    assertSingleCanonical(html, canonicalUrl, route.path);
    assertIncludes(html, `content="${canonicalUrl}"`, `${route.path} og:url`);

    if (route.kind === "blog-article") {
      const payload = route.payload || {};
      const title = String(payload.title || route.title.replace(/\s*\|\s*SmartyGym Blog$/, ""));
      assertIncludes(html, `<main class="seo-prerender seo-article">`, `${route.path} prerendered article shell`);
      assertIncludes(html, `<h1>${htmlEscape(title)}</h1>`, `${route.path} article h1`);
      assertIncludes(html, `<div class="seo-article-body">`, `${route.path} article body wrapper`);
      assertPayloadText(html, payload.content, `${route.path} article body content`);
    }

    if (route.kind === "workout") {
      const payload = route.payload || {};
      if (route.path.includes(String(payload.id || "__never__"))) {
        throw new Error(`[verify-prerender] ${route.path} still exposes workout database ID in canonical URL`);
      }
      const expectedSlug = slugifyContentName(String(payload.name || payload.id || ""));
      assertIncludes(route.path, `/${expectedSlug}`, `${route.path} readable workout URL slug`);
      assertIncludes(html, `<main class="seo-prerender seo-workout">`, `${route.path} prerendered workout shell`);
      assertIncludes(html, `<h1>${htmlEscape(String(payload.name || ""))}</h1>`, `${route.path} workout h1`);
      assertPayloadText(
        html,
        (payload as any).main_workout || (payload as any).description || (payload as any).warm_up,
        `${route.path} workout body content`,
      );
    }

    if (route.kind === "program") {
      const payload = route.payload || {};
      if (route.path.includes(String(payload.id || "__never__"))) {
        throw new Error(`[verify-prerender] ${route.path} still exposes program database ID in canonical URL`);
      }
      const expectedSlug = slugifyContentName(String(payload.name || payload.id || ""));
      assertIncludes(route.path, `/${expectedSlug}`, `${route.path} readable program URL slug`);
      assertIncludes(html, `<main class="seo-prerender seo-program">`, `${route.path} prerendered program shell`);
      assertIncludes(html, `<h1>${htmlEscape(String(payload.name || ""))}</h1>`, `${route.path} program h1`);
      assertPayloadText(
        html,
        (payload as any).program_structure || (payload as any).overview || (payload as any).description,
        `${route.path} program body content`,
      );
    }

    if (route.path !== "/") {
      assertCleanUrlRedirect(redirects, route.path);
    }

    checked++;
  }

  for (const rule of legacyRedirects) {
    assertRedirectRule(redirects, rule.from, rule.to);
  }

  console.log(
    `[verify-prerender] checked ${checked} routes (` +
      `static=${counts.static}, workout-cat=${counts.workoutCategory}, ` +
      `program-cat=${counts.programCategory}, workouts=${counts.workouts}, ` +
      `programs=${counts.programs}, blog=${counts.blogArticles})`,
  );
}

async function main() {
  await verifyPrerenderedSeo();
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
