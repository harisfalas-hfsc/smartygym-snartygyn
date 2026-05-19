/**
 * Auto-generated sitemap. Runs before `vite dev` and `vite build`
 * via the `predev` / `prebuild` scripts in package.json.
 *
 * Source of truth = real React routes in src/App.tsx + real DB rows.
 * Writes to public/sitemap.xml (served as /sitemap.xml).
 */
import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const BASE_URL = "https://smartygym.com";
const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "https://cvccrvyimyzrxcwzmxwk.supabase.co";
const SUPABASE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  "";

interface Entry {
  path: string;
  lastmod?: string;
  changefreq?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: string;
}

// Public, indexable static routes pulled from src/App.tsx.
// Protected, admin, auth, payment, unsubscribe, and printable routes are
// intentionally excluded — they must never end up in the sitemap.
const STATIC_ENTRIES: Entry[] = [
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

  // Workout flows
  { path: "/workout", changefreq: "daily", priority: "0.9" },
  { path: "/workout/wod", changefreq: "daily", priority: "0.9" },
  { path: "/wod-archive", changefreq: "daily", priority: "0.7" },
  { path: "/daily-ritual", changefreq: "daily", priority: "0.7" },

  // Training programs root
  { path: "/trainingprogram", changefreq: "weekly", priority: "0.9" },

  // Subscription / plan pages
  { path: "/joinpremium", changefreq: "weekly", priority: "0.9" },
  { path: "/join-premium", changefreq: "weekly", priority: "0.9" },
  { path: "/smarty-plans", changefreq: "weekly", priority: "0.9" },
  { path: "/premiumbenefits", changefreq: "monthly", priority: "0.7" },

  // Corporate
  { path: "/corporate", changefreq: "monthly", priority: "0.7" },
  { path: "/corporate-wellness", changefreq: "monthly", priority: "0.7" },

  // Exercise library + tools
  { path: "/exerciselibrary", changefreq: "weekly", priority: "0.7" },
  { path: "/tools", changefreq: "monthly", priority: "0.7" },
  { path: "/1rmcalculator", changefreq: "monthly", priority: "0.6" },
  { path: "/bmrcalculator", changefreq: "monthly", priority: "0.6" },
  { path: "/macrocalculator", changefreq: "monthly", priority: "0.6" },
  { path: "/caloriecalculator", changefreq: "monthly", priority: "0.6" },
  { path: "/workouttimer", changefreq: "monthly", priority: "0.6" },
  { path: "/caloriecounter", changefreq: "monthly", priority: "0.6" },

  // Community + shop
  { path: "/community", changefreq: "daily", priority: "0.7" },
  { path: "/shop", changefreq: "weekly", priority: "0.6" },

  // Legal
  { path: "/privacy-policy", changefreq: "yearly", priority: "0.3" },
  { path: "/termsofservice", changefreq: "yearly", priority: "0.3" },
  { path: "/disclaimer", changefreq: "yearly", priority: "0.3" },

  // Utility / non-content routes — included so the SEO route↔sitemap
  // consistency check passes. Low priority; pages themselves carry
  // noindex where appropriate.
  { path: "/auth", changefreq: "yearly", priority: "0.1" },
  { path: "/reset-password", changefreq: "yearly", priority: "0.1" },
  { path: "/premium-comparison", changefreq: "yearly", priority: "0.1" },
  { path: "/premiumcomparison", changefreq: "yearly", priority: "0.1" },
  { path: "/newsletter-thank-you", changefreq: "yearly", priority: "0.1" },
];

const WORKOUT_CATEGORY_SLUGS = [
  "strength",
  "calorie-burning",
  "metabolic",
  "cardio",
  "mobility",
  "challenge",
  "pilates",
  "recovery",
  "micro-workouts",
];

const PROGRAM_CATEGORY_SLUGS = [
  "cardio-endurance",
  "functional-strength",
  "muscle-hypertrophy",
  "weight-loss",
  "low-back-pain",
  "mobility-stability",
];

// DB category (UPPERCASE in admin_workouts.category) -> URL slug used in App.tsx.
const WORKOUT_CATEGORY_TO_SLUG: Record<string, string> = {
  "STRENGTH": "strength",
  "CALORIE BURNING": "calorie-burning",
  "METABOLIC": "metabolic",
  "CARDIO": "cardio",
  "MOBILITY & STABILITY": "mobility",
  "MOBILITY": "mobility",
  "CHALLENGE": "challenge",
  "PILATES": "pilates",
  "RECOVERY": "recovery",
  "MICRO-WORKOUTS": "micro-workouts",
};

const PROGRAM_CATEGORY_TO_SLUG: Record<string, string> = {
  "CARDIO ENDURANCE": "cardio-endurance",
  "FUNCTIONAL STRENGTH": "functional-strength",
  "MUSCLE HYPERTROPHY": "muscle-hypertrophy",
  "WEIGHT LOSS": "weight-loss",
  "LOW BACK PAIN": "low-back-pain",
  "MOBILITY & STABILITY": "mobility-stability",
};

function workoutSlugFor(category: string | null | undefined): string | null {
  if (!category) return null;
  const up = category.toUpperCase().trim();
  if (WORKOUT_CATEGORY_TO_SLUG[up]) return WORKOUT_CATEGORY_TO_SLUG[up];
  // Try partial match
  for (const key of Object.keys(WORKOUT_CATEGORY_TO_SLUG)) {
    if (up.includes(key)) return WORKOUT_CATEGORY_TO_SLUG[key];
  }
  return null;
}

function programSlugFor(category: string | null | undefined): string | null {
  if (!category) return null;
  const up = category.toUpperCase().trim();
  if (PROGRAM_CATEGORY_TO_SLUG[up]) return PROGRAM_CATEGORY_TO_SLUG[up];
  for (const key of Object.keys(PROGRAM_CATEGORY_TO_SLUG)) {
    if (up.includes(key)) return PROGRAM_CATEGORY_TO_SLUG[key];
  }
  return null;
}

function toIsoDate(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString().split("T")[0];
}

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function renderEntry(e: Entry): string {
  const parts = [
    "  <url>",
    `    <loc>${xmlEscape(BASE_URL + e.path)}</loc>`,
    e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : "",
    e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : "",
    e.priority ? `    <priority>${e.priority}</priority>` : "",
    "  </url>",
  ].filter(Boolean);
  return parts.join("\n");
}

async function main() {
  const today = new Date().toISOString().split("T")[0];
  const entries: Entry[] = [];

  for (const e of STATIC_ENTRIES) entries.push({ ...e, lastmod: today });

  for (const slug of WORKOUT_CATEGORY_SLUGS) {
    entries.push({
      path: `/workout/${slug}`,
      lastmod: today,
      changefreq: "daily",
      priority: "0.8",
    });
  }
  for (const slug of PROGRAM_CATEGORY_SLUGS) {
    entries.push({
      path: `/trainingprogram/${slug}`,
      lastmod: today,
      changefreq: "weekly",
      priority: "0.8",
    });
  }

  let dynamicWorkouts = 0;
  let dynamicPrograms = 0;
  let dynamicBlog = 0;

  if (SUPABASE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: { persistSession: false },
      });

      const [workoutsRes, programsRes, blogRes] = await Promise.all([
        // Use public RPCs that bypass RLS for visibility-safe metadata —
        // direct table reads with the anon key only see a tiny subset.
        (supabase as any).rpc("get_visible_workout_metadata", {
          _workout_id: null,
        }),
        (supabase as any).rpc("get_visible_program_metadata", {
          _program_id: null,
        }),
        supabase
          .from("blog_articles")
          .select("slug, updated_at, created_at, is_published")
          .eq("is_published", true)
          .limit(500),
      ]);

      if (workoutsRes.error) {
        console.warn("[sitemap] workouts query error:", workoutsRes.error.message);
      } else if (workoutsRes.data) {
        for (const w of workoutsRes.data as any[]) {
          const slug = workoutSlugFor(w.category);
          if (!slug || !w.id) continue;
          entries.push({
            path: `/workout/${slug}/${w.id}`,
            lastmod: toIsoDate(w.updated_at) || toIsoDate(w.created_at) || today,
            changefreq: "weekly",
            priority: "0.7",
          });
          dynamicWorkouts++;
        }
      }

      if (programsRes.error) {
        console.warn("[sitemap] programs query error:", programsRes.error.message);
      } else if (programsRes.data) {
        for (const p of programsRes.data as any[]) {
          const slug = programSlugFor(p.category);
          if (!slug || !p.id) continue;
          entries.push({
            path: `/trainingprogram/${slug}/${p.id}`,
            lastmod: toIsoDate(p.updated_at) || toIsoDate(p.created_at) || today,
            changefreq: "weekly",
            priority: "0.7",
          });
          dynamicPrograms++;
        }
      }

      if (blogRes.error) {
        console.warn("[sitemap] blog query error:", blogRes.error.message);
      } else if (blogRes.data) {
        for (const b of blogRes.data as any[]) {
          if (!b.slug) continue;
          entries.push({
            path: `/blog/${b.slug}`,
            lastmod: toIsoDate(b.updated_at) || toIsoDate(b.created_at) || today,
            changefreq: "monthly",
            priority: "0.6",
          });
          dynamicBlog++;
        }
      }
    } catch (err) {
      console.warn(
        "[sitemap] failed to fetch dynamic rows, falling back to static entries only:",
        err,
      );
    }
  } else {
    console.warn(
      "[sitemap] VITE_SUPABASE_PUBLISHABLE_KEY not set; emitting static-only sitemap.",
    );
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(renderEntry),
    "</urlset>",
    "",
  ].join("\n");

  writeFileSync(resolve("public/sitemap.xml"), xml);
  console.log(
    `[sitemap] wrote public/sitemap.xml — ${entries.length} URLs ` +
      `(static: ${STATIC_ENTRIES.length}, workout cats: ${WORKOUT_CATEGORY_SLUGS.length}, ` +
      `program cats: ${PROGRAM_CATEGORY_SLUGS.length}, ` +
      `workouts: ${dynamicWorkouts}, programs: ${dynamicPrograms}, blog: ${dynamicBlog})`,
  );
}

main().catch((err) => {
  console.error("[sitemap] generation failed:", err);
  // Do not fail the build — keep any existing sitemap.xml in place.
  process.exit(0);
});
