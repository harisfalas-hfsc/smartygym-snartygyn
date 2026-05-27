/**
 * Auto-generated sitemap. Runs before `vite dev` and `vite build` via the
 * `predev` / `prebuild` scripts in package.json. Uses the shared SEO route
 * source so sitemap and pre-rendered HTML never drift apart.
 */
import { writeFileSync } from "node:fs";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { BASE_URL, buildSeoRoutes, xmlEscape } from "./lib/seo-routes";

export async function generateSitemap(outputPaths = [resolve("public/sitemap.xml")]) {
  const { routes, counts } = await buildSeoRoutes();
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...routes.map((e) =>
      [
        "  <url>",
        `    <loc>${xmlEscape(BASE_URL + e.path)}</loc>`,
        e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : "",
        e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : "",
        e.priority ? `    <priority>${e.priority}</priority>` : "",
        "  </url>",
      ]
        .filter(Boolean)
        .join("\n"),
    ),
    "</urlset>",
    "",
  ].join("\n");
  for (const outputPath of outputPaths) {
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, xml);
  }
  console.log(
    `[sitemap] wrote ${outputPaths.map((p) => p.replace(process.cwd() + "/", "")).join(", ")} — ${counts.total} URLs (static=${counts.static}, workout-cat=${counts.workoutCategory}, program-cat=${counts.programCategory}, workouts=${counts.workouts}, programs=${counts.programs}, blog=${counts.blogArticles})`,
  );
}

async function main() {
  await generateSitemap();
}

main().catch((err) => {
  console.error("[sitemap] generation failed:", err);
  process.exit(1);
});
