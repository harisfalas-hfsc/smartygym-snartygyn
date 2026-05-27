/**
 * Auto-generated sitemap. Runs before `vite dev` and `vite build` via the
 * `predev` / `prebuild` scripts in package.json. Uses the shared SEO route
 * source so sitemap and pre-rendered HTML never drift apart.
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { BASE_URL, buildSeoRoutes, xmlEscape } from "./lib/seo-routes";

async function main() {
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
  writeFileSync(resolve("public/sitemap.xml"), xml);
  console.log(
    `[sitemap] wrote public/sitemap.xml — ${counts.total} URLs (static=${counts.static}, workout-cat=${counts.workoutCategory}, program-cat=${counts.programCategory}, workouts=${counts.workouts}, programs=${counts.programs}, blog=${counts.blogArticles})`,
  );
}

main().catch((err) => {
  console.error("[sitemap] generation failed:", err);
  process.exit(1);
});
