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
import { buildSeoRoutes, stripHtml } from "./lib/seo-routes";

const DIST = resolve("dist");

function assertIncludes(html: string, needle: string, label: string) {
  if (!needle || !html.toLowerCase().includes(needle.toLowerCase())) {
    throw new Error(`[verify-prerender] ${label} missing: ${needle}`);
  }
}

function exactFileFor(distDir: string, routePath: string) {
  if (routePath === "/") return join(distDir, "index.html");
  return join(distDir, routePath.replace(/^\//, ""));
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
    const directoryIndexPath =
      route.path === "/" ? exactPath : join(distDir, route.path.replace(/^\//, ""), "index.html");
    const artifactPath = isFile(exactPath) ? exactPath : directoryIndexPath;

    if (!existsSync(artifactPath)) {
      throw new Error(`[verify-prerender] missing HTML for ${route.path}: expected ${exactPath} or ${directoryIndexPath}`);
    }

    const html = readFileSync(artifactPath, "utf8");
    assertIncludes(html, `<title>${route.title}</title>`, `${route.path} title`);
    assertIncludes(html, `href="https://smartygym.com${route.path}"`, `${route.path} canonical`);

    if (route.kind === "blog-article") {
      const payload = route.payload || {};
      const title = String(payload.title || route.title.replace(/\s*\|\s*SmartyGym Blog$/, ""));
      const content = stripHtml(String(payload.content || ""));
      assertIncludes(html, title, `${route.path} article title`);
      assertIncludes(html, content.slice(0, 120), `${route.path} article body`);
      if (artifactPath !== exactPath) {
        throw new Error(`[verify-prerender] ${route.path} must be an exact extensionless file for the published clean URL`);
      }
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
