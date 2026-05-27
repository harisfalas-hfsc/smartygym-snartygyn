/**
 * Build-time pre-renderer.
 * Runs after `vite build` and writes dist/<path>/index.html for every public
 * route, with unique <title>, <meta description>, canonical, OG tags, JSON-LD
 * and real crawlable body content inside <div id="root">.
 *
 * Google sees the static HTML on first response (no JavaScript required).
 * React's createRoot then hydrates and renders the live app on top.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildSeoRoutes } from "./lib/seo-routes";
import {
  applyHeadOverrides,
  injectBody,
  injectJsonLd,
  renderRouteBody,
} from "./lib/seo-render";

const DIST = resolve("dist");
const TEMPLATE_PATH = join(DIST, "index.html");

export async function prerenderSeoHtml(options: {
  distDir?: string;
  templatePath?: string;
} = {}) {
  const distDir = options.distDir || DIST;
  const templatePath = options.templatePath || join(distDir, "index.html");

  if (!existsSync(templatePath)) {
    throw new Error(
      `[prerender] dist/index.html not found at ${templatePath}. Run after Vite writes the HTML bundle.`,
    );
  }
  const template = readFileSync(templatePath, "utf8");

  const { routes, counts } = await buildSeoRoutes();
  console.log(
    `[prerender] rendering ${counts.total} routes (` +
      `static=${counts.static}, workout-cat=${counts.workoutCategory}, ` +
      `program-cat=${counts.programCategory}, workouts=${counts.workouts}, ` +
      `programs=${counts.programs}, blog=${counts.blogArticles})`,
  );

  let written = 0;
  const writeHtml = (outPath: string, html: string) => {
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, html);
    written++;
  };

  const hasChildren = new Set(
    routes
      .filter((route) => route.path !== "/" && routes.some((candidate) => candidate.path.startsWith(`${route.path}/`)))
      .map((route) => route.path),
  );

  for (const route of routes) {
    const { bodyHtml, jsonLd } = renderRouteBody(route);
    let html = applyHeadOverrides(template, route);
    html = injectJsonLd(html, jsonLd);
    html = injectBody(html, bodyHtml);

    if (route.path === "/") {
      writeHtml(join(distDir, "index.html"), html);
    } else {
      const cleanPath = route.path.replace(/^\//, "");

      // Lovable's static host serves SPA fallback HTML for clean deep URLs
      // before resolving nested directory indexes. For leaf content routes,
      // write an exact extensionless file so /blog/my-article returns article
      // HTML. Keep shallow/category routes as directory indexes so they do not
      // block deeper child routes such as /blog/<slug> or /workout/<cat>/<id>.
      const isDeepLeaf = !hasChildren.has(route.path);
      if (isDeepLeaf) {
        writeHtml(join(distDir, cleanPath), html);
      } else {
        writeHtml(join(distDir, cleanPath, "index.html"), html);
      }
    }
  }
  console.log(`[prerender] wrote ${written} HTML files into ${distDir.replace(process.cwd() + "/", "")}/`);
}

async function main() {
  await prerenderSeoHtml();
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main().catch((err) => {
    console.error("[prerender] failed:", err);
    process.exit(1);
  });
}