// Live sitemap served at /sitemap.xml (via public/_redirects rewrite).
// Regenerates from the database on every request so newly published
// blog articles, workouts, and programs appear without a redeploy.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const BASE_URL = "https://smartygym.com";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const STATIC_ENTRIES: { path: string; changefreq?: string; priority?: string }[] = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/home", changefreq: "daily", priority: "0.9" },
  { path: "/start", changefreq: "monthly", priority: "0.7" },
  { path: "/about", changefreq: "monthly", priority: "0.7" },
  { path: "/about-smartygym", changefreq: "monthly", priority: "0.7" },
  { path: "/take-a-tour", changefreq: "monthly", priority: "0.6" },
  { path: "/contact", changefreq: "monthly", priority: "0.6" },
  { path: "/faq", changefreq: "monthly", priority: "0.6" },
  { path: "/blog", changefreq: "weekly", priority: "0.8" },
  { path: "/coach-profile", changefreq: "monthly", priority: "0.8" },
  { path: "/coach-cv", changefreq: "monthly", priority: "0.6" },
  { path: "/the-smarty-method", changefreq: "monthly", priority: "0.7" },
  { path: "/best-online-fitness-platform", changefreq: "monthly", priority: "0.7" },
  { path: "/why-invest-in-smartygym", changefreq: "monthly", priority: "0.6" },
  { path: "/workout", changefreq: "daily", priority: "0.9" },
  { path: "/workout/wod", changefreq: "daily", priority: "0.9" },
  { path: "/wod-archive", changefreq: "daily", priority: "0.7" },
  { path: "/daily-ritual", changefreq: "daily", priority: "0.7" },
  { path: "/trainingprogram", changefreq: "weekly", priority: "0.9" },
  { path: "/joinpremium", changefreq: "weekly", priority: "0.9" },
  { path: "/join-premium", changefreq: "weekly", priority: "0.9" },
  { path: "/smarty-premium", changefreq: "weekly", priority: "0.9" },
  { path: "/premiumbenefits", changefreq: "monthly", priority: "0.7" },
  { path: "/corporate", changefreq: "monthly", priority: "0.7" },
  { path: "/corporate-wellness", changefreq: "monthly", priority: "0.7" },
  { path: "/exerciselibrary", changefreq: "weekly", priority: "0.7" },
  { path: "/tools", changefreq: "monthly", priority: "0.7" },
  { path: "/1rmcalculator", changefreq: "monthly", priority: "0.6" },
  { path: "/bmrcalculator", changefreq: "monthly", priority: "0.6" },
  { path: "/macrocalculator", changefreq: "monthly", priority: "0.6" },
  { path: "/caloriecalculator", changefreq: "monthly", priority: "0.6" },
  { path: "/workouttimer", changefreq: "monthly", priority: "0.6" },
  { path: "/caloriecounter", changefreq: "monthly", priority: "0.6" },
  { path: "/community", changefreq: "daily", priority: "0.7" },
  { path: "/shop", changefreq: "weekly", priority: "0.6" },
  { path: "/privacy-policy", changefreq: "yearly", priority: "0.3" },
  { path: "/termsofservice", changefreq: "yearly", priority: "0.3" },
  { path: "/disclaimer", changefreq: "yearly", priority: "0.3" },
];

const WORKOUT_CATEGORY_SLUGS = ["strength","calorie-burning","metabolic","cardio","mobility","challenge","pilates","recovery","micro-workouts"];
const PROGRAM_CATEGORY_SLUGS = ["cardio-endurance","functional-strength","muscle-hypertrophy","weight-loss","low-back-pain","mobility-stability"];

const WORKOUT_CATEGORY_TO_SLUG: Record<string, string> = {
  "STRENGTH": "strength", "CALORIE BURNING": "calorie-burning", "METABOLIC": "metabolic",
  "CARDIO": "cardio", "MOBILITY & STABILITY": "mobility", "MOBILITY": "mobility",
  "CHALLENGE": "challenge", "PILATES": "pilates", "RECOVERY": "recovery",
  "MICRO-WORKOUTS": "micro-workouts",
};
const PROGRAM_CATEGORY_TO_SLUG: Record<string, string> = {
  "CARDIO ENDURANCE": "cardio-endurance", "FUNCTIONAL STRENGTH": "functional-strength",
  "MUSCLE HYPERTROPHY": "muscle-hypertrophy", "WEIGHT LOSS": "weight-loss",
  "LOW BACK PAIN": "low-back-pain", "MOBILITY & STABILITY": "mobility-stability",
};

function slugFor(map: Record<string, string>, category?: string | null): string | null {
  if (!category) return null;
  const up = category.toUpperCase().trim();
  if (map[up]) return map[up];
  for (const k of Object.keys(map)) if (up.includes(k)) return map[k];
  return null;
}

function isoDate(v?: string | null): string | undefined {
  if (!v) return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString().split("T")[0];
}

const xmlEscape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

function renderEntry(e: { path: string; lastmod?: string; changefreq?: string; priority?: string }): string {
  return [
    "  <url>",
    `    <loc>${xmlEscape(BASE_URL + e.path)}</loc>`,
    e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : "",
    e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : "",
    e.priority ? `    <priority>${e.priority}</priority>` : "",
    "  </url>",
  ].filter(Boolean).join("\n");
}

Deno.serve(async (_req) => {
  const today = new Date().toISOString().split("T")[0];
  const entries: { path: string; lastmod?: string; changefreq?: string; priority?: string }[] = [];

  for (const e of STATIC_ENTRIES) entries.push({ ...e, lastmod: today });
  for (const slug of WORKOUT_CATEGORY_SLUGS)
    entries.push({ path: `/workout/${slug}`, lastmod: today, changefreq: "daily", priority: "0.8" });
  for (const slug of PROGRAM_CATEGORY_SLUGS)
    entries.push({ path: `/trainingprogram/${slug}`, lastmod: today, changefreq: "weekly", priority: "0.8" });

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
    const [workouts, programs, blog] = await Promise.all([
      supabase.rpc("get_visible_workout_metadata", { _workout_id: null }),
      supabase.rpc("get_visible_program_metadata", { _program_id: null }),
      supabase.from("blog_articles").select("slug, updated_at, created_at").eq("is_published", true).limit(2000),
    ]);

    for (const w of (workouts.data ?? []) as any[]) {
      const slug = slugFor(WORKOUT_CATEGORY_TO_SLUG, w.category);
      if (!slug || !w.id) continue;
      entries.push({
        path: `/workout/${slug}/${w.id}`,
        lastmod: isoDate(w.updated_at) || isoDate(w.created_at) || today,
        changefreq: "weekly", priority: "0.7",
      });
    }
    for (const p of (programs.data ?? []) as any[]) {
      const slug = slugFor(PROGRAM_CATEGORY_TO_SLUG, p.category);
      if (!slug || !p.id) continue;
      entries.push({
        path: `/trainingprogram/${slug}/${p.id}`,
        lastmod: isoDate(p.updated_at) || isoDate(p.created_at) || today,
        changefreq: "weekly", priority: "0.7",
      });
    }
    for (const b of (blog.data ?? []) as any[]) {
      if (!b.slug) continue;
      entries.push({
        path: `/blog/${b.slug}`,
        lastmod: isoDate(b.updated_at) || isoDate(b.created_at) || today,
        changefreq: "monthly", priority: "0.6",
      });
    }
  } catch (err) {
    console.error("[sitemap] DB query failed:", err);
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(renderEntry),
    "</urlset>",
    "",
  ].join("\n");

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
      "X-Robots-Tag": "noindex",
    },
  });
});