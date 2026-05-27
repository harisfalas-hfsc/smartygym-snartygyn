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
import { buildSeoRoutes, htmlEscape } from "./lib/seo-routes";

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

function exactFileFor(distDir: string, routePath: string) {
  if (routePath === "/") return join(distDir, "index.html");
  return join(distDir, routePath.replace(/^\//, ""));
}

function htmlFileFor(distDir: string, routePath: string) {
  if (routePath === "/") return join(distDir, "index.html");
  return join(distDir, `${routePath.replace(/^\//, "")}.html`);
}

function isFile(path: string) {
  return existsSync(path) && statSync(path).isFile();
}

export async function verifyPrerenderedSeo(options: { distDir?: string } = {}) {
  const distDir = options.distDir || DIST;
  const { routes, counts } = await buildSeoRoutes();

  let checked = 0;
  for (const route of routes) {
    const exactPath = exactFileFor(distDir, route.path);
    const htmlPath = htmlFileFor(distDir, route.path);
    const directoryIndexPath =
      route.path === "/" ? exactPath : join(distDir, route.path.replace(/^\//, ""), "index.html");
    const artifactPath = isFile(exactPath) ? exactPath : isFile(htmlPath) ? htmlPath : directoryIndexPath;

    if (!existsSync(artifactPath)) {
      throw new Error(`[verify-prerender] missing HTML for ${route.path}: expected ${exactPath}, ${htmlPath}, or ${directoryIndexPath}`);
    }

    const html = readFileSync(artifactPath, "utf8");
    const canonicalUrl = `https://smartygym.com${route.path}`;
    assertIncludes(html, `<title>${htmlEscape(route.title)}</title>`, `${route.path} title`);
    assertSingleCanonical(html, canonicalUrl, route.path);
    assertIncludes(html, `content="${canonicalUrl}"`, `${route.path} og:url`);

    if (route.kind === "blog-article") {
      const payload = route.payload || {};
      const title = String(payload.title || route.title.replace(/\s*\|\s*SmartyGym Blog$/, ""));
      assertIncludes(html, `<main class="seo-prerender seo-article">`, `${route.path} prerendered article shell`);
      assertIncludes(html, `<h1>${htmlEscape(title)}</h1>`, `${route.path} article h1`);
      assertIncludes(html, `<div class="seo-article-body">`, `${route.path} article body wrapper`);
      assertIncludes(html, String(payload.content || "").slice(0, 80), `${route.path} article body content`);
      if (artifactPath !== exactPath) {
        throw new Error(`[verify-prerender] ${route.path} must be an exact extensionless file for the published clean URL`);
      }
    }

    if (route.path !== "/" && route.kind !== "blog-article" && !isFile(exactPath) && !isFile(htmlPath)) {
      throw new Error(`[verify-prerender] ${route.path} must have ${htmlPath} because parent clean URLs do not reliably serve directory indexes`);
    }

    checked++;
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
