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
import { buildSeoRoutes } from "./lib/seo-routes";
import {
  applyHeadOverrides,
  injectBody,
  injectJsonLd,
  renderRouteBody,
} from "./lib/seo-render";

const DIST = resolve("dist");
const TEMPLATE_PATH = join(DIST, "index.html");

async function main() {
  if (!existsSync(TEMPLATE_PATH)) {
    throw new Error(
      `[prerender] dist/index.html not found at ${TEMPLATE_PATH}. Run after \`vite build\`.`,
    );
  }
  const template = readFileSync(TEMPLATE_PATH, "utf8");

  const { routes, counts } = await buildSeoRoutes();
  console.log(
    `[prerender] rendering ${counts.total} routes (` +
      `static=${counts.static}, workout-cat=${counts.workoutCategory}, ` +
      `program-cat=${counts.programCategory}, workouts=${counts.workouts}, ` +
      `programs=${counts.programs}, blog=${counts.blogArticles})`,
  );

  let written = 0;
  for (const route of routes) {
    const { bodyHtml, jsonLd } = renderRouteBody(route);
    let html = applyHeadOverrides(template, route);
    html = injectJsonLd(html, jsonLd);
    html = injectBody(html, bodyHtml);

    const outPath =
      route.path === "/"
        ? join(DIST, "index.html")
        : join(DIST, route.path.replace(/^\//, ""), "index.html");
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, html);
    written++;
  }
  console.log(`[prerender] wrote ${written} HTML files into dist/`);
}

main().catch((err) => {
  console.error("[prerender] failed:", err);
  process.exit(1);
});