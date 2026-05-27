/**
 * Single source of truth for every public, indexable URL on smartygym.com.
 *
 * Used by:
 *   - scripts/generate-sitemap.ts  (writes public/sitemap.xml)
 *   - scripts/prerender.ts         (writes dist/<path>/index.html with real SEO)
 *   - scripts/verify-prerender.ts  (safety checks before publish)
 *
 * Keeping one source guarantees the sitemap and the pre-rendered HTML can
 * never drift apart. Whenever a published blog article, visible workout, or
 * visible training program exists in the database, it appears in both.
 */
import { createClient } from "@supabase/supabase-js";

export const BASE_URL = "https://smartygym.com";

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "https://cvccrvyimyzrxcwzmxwk.supabase.co";
const SUPABASE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2Y2NydnlpbXl6cnhjd3pteHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MTc2NjIsImV4cCI6MjA3NjE5MzY2Mn0.XU_h4CYRiQ7VN079laFHSVMrzB6urOhQZFoTagU_Wno";

export const MIN_EXPECTED_DYNAMIC_WORKOUTS = 100;
export const MIN_EXPECTED_DYNAMIC_PROGRAMS = 10;
export const MIN_EXPECTED_DYNAMIC_BLOG_ARTICLES = 1;

export type RouteKind =
  | "static"
  | "workout-category"
  | "program-category"
  | "blog-article"
  | "workout"
  | "program";

export interface SeoRoute {
  /** URL path relative to BASE_URL, always starts with "/". */
  path: string;
  kind: RouteKind;
  /** Browser tab title, unique per page. */
  title: string;
  /** <=160 char description, unique per page. */
  description: string;
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
  /** og:image absolute URL. */
  image?: string;
  /** Full attached row payload, used by pre-render to build body content. */
  payload?: Record<string, unknown>;
}

/** Public static routes (no DB-backed content). */
const STATIC_ROUTES: Array<
  Omit<SeoRoute, "kind" | "lastmod"> & { changefreq?: SeoRoute["changefreq"] }
> = [
  {
    path: "/",
    title: "SmartyGym | Online Fitness Platform by Haris Falas",
    description:
      "SmartyGym: 500+ expert-designed workouts, training programs and daily rituals by Sports Scientist Haris Falas. 100% human, 0% AI. Train anywhere, anytime.",
    changefreq: "daily",
    priority: "1.0",
  },
  {
    path: "/home",
    title: "SmartyGym Home | Online Fitness Platform",
    description:
      "Your SmartyGym home: daily workout, training programs, exercise library, and tools designed by Sports Scientist Haris Falas.",
    changefreq: "daily",
    priority: "0.9",
  },
  {
    path: "/start",
    title: "Get Started with SmartyGym",
    description:
      "Start your SmartyGym journey: pick a plan, choose your training focus, and get human-designed workouts by Haris Falas.",
    changefreq: "monthly",
    priority: "0.7",
  },
  {
    path: "/about",
    title: "About SmartyGym | Built by Sports Scientist Haris Falas",
    description:
      "Why SmartyGym exists: 100% human-designed training by Haris Falas (BSc Sports Science, CSCS) for busy adults who refuse generic AI workouts.",
    changefreq: "monthly",
    priority: "0.7",
  },
  {
    path: "/about-smartygym",
    title: "About SmartyGym | Mission, Method and Coach",
    description:
      "Discover SmartyGym: a human-coached online fitness platform built around evidence-based training and healthy aging.",
    changefreq: "monthly",
    priority: "0.7",
  },
  {
    path: "/take-a-tour",
    title: "Take a Tour of SmartyGym | Workouts, Programs and Tools",
    description:
      "A guided tour of SmartyGym: daily workout, multi-week programs, exercise library and tools — all human-designed by Haris Falas.",
    changefreq: "monthly",
    priority: "0.6",
  },
  {
    path: "/contact",
    title: "Contact SmartyGym | Talk to Coach Haris Falas",
    description:
      "Get in touch with SmartyGym for support, partnerships, or coaching questions. Direct contact with Sports Scientist Haris Falas.",
    changefreq: "monthly",
    priority: "0.6",
  },
  {
    path: "/faq",
    title: "SmartyGym FAQ | Subscription, Workouts and Programs",
    description:
      "Answers about SmartyGym subscriptions, workouts, programs, the WOD system, and access. Get clarity before you train.",
    changefreq: "monthly",
    priority: "0.6",
  },
  {
    path: "/blog",
    title: "SmartyGym Blog | Evidence-Based Training Articles",
    description:
      "Human-written, evidence-based fitness, nutrition and recovery articles by Sports Scientist Haris Falas. Learn how to train smart.",
    changefreq: "weekly",
    priority: "0.8",
  },
  {
    path: "/coach-profile",
    title: "Haris Falas | Coach Profile | SmartyGym",
    description:
      "Haris Falas — Sports Scientist (BSc), CSCS, EXOS Performance Specialist. 20+ years of strength and conditioning experience powering SmartyGym.",
    changefreq: "monthly",
    priority: "0.8",
  },
  {
    path: "/coach-cv",
    title: "Coach Haris Falas CV | Credentials and Experience",
    description:
      "Full CV of Haris Falas: Sports Science degree, CSCS, EXOS Performance Specialist, and 20+ years of coaching across performance and rehab.",
    changefreq: "monthly",
    priority: "0.6",
  },
  {
    path: "/the-smarty-method",
    title: "The Smarty Method | Training Philosophy by Haris Falas",
    description:
      "The Smarty Method: how Haris Falas combines strength, metabolic conditioning, mobility and recovery to build lifelong fitness.",
    changefreq: "monthly",
    priority: "0.7",
  },
  {
    path: "/best-online-fitness-platform",
    title: "Best Online Fitness Platform | SmartyGym vs Alternatives",
    description:
      "Why SmartyGym is the best online fitness platform for busy adults: 100% human-designed training, not AI-generated workouts.",
    changefreq: "monthly",
    priority: "0.7",
  },
  {
    path: "/why-invest-in-smartygym",
    title: "Why Invest in SmartyGym | Long-Term Fitness Investment",
    description:
      "Why SmartyGym is a long-term investment in your health, performance and healthy aging — not just another fitness subscription.",
    changefreq: "monthly",
    priority: "0.6",
  },

  // Workout flows
  {
    path: "/workout",
    title: "Smarty Workouts | Online Workouts by Haris Falas",
    description:
      "Browse 500+ online workouts by Sports Scientist Haris Falas: strength, cardio, metabolic, mobility, pilates, recovery and challenges.",
    changefreq: "daily",
    priority: "0.9",
  },
  {
    path: "/workout/wod",
    title: "Workout of the Day | SmartyWOD by Haris Falas",
    description:
      "Today's Workout of the Day: two fresh, human-designed workouts (bodyweight + equipment) delivered every morning by Haris Falas.",
    changefreq: "daily",
    priority: "0.9",
  },
  {
    path: "/wod-archive",
    title: "WOD Archive | Past Workouts of the Day | SmartyGym",
    description:
      "Browse the SmartyGym WOD archive — every past Workout of the Day designed by Sports Scientist Haris Falas.",
    changefreq: "daily",
    priority: "0.7",
  },
  {
    path: "/daily-ritual",
    title: "Daily Smarty Ritual | Mobility, Activation and Mindset",
    description:
      "Your Daily Smarty Ritual: short mobility, activation and recovery routines you can do every single day.",
    changefreq: "daily",
    priority: "0.7",
  },

  // Training programs
  {
    path: "/trainingprogram",
    title: "Smarty Training Programs | Multi-Week Plans by Haris Falas",
    description:
      "Multi-week training programs by Haris Falas — strength, hypertrophy, weight loss, cardio endurance, mobility and low back care.",
    changefreq: "weekly",
    priority: "0.9",
  },

  // Subscription / plan pages
  {
    path: "/joinpremium",
    title: "Join SmartyGym Premium | Full Access Membership",
    description:
      "Join SmartyGym Premium for full access to 500+ workouts, multi-week programs, the daily WOD and every Smarty tool.",
    changefreq: "weekly",
    priority: "0.9",
  },
  {
    path: "/join-premium",
    title: "Join Premium | SmartyGym Membership",
    description:
      "Become a SmartyGym Premium member and unlock the full library of workouts, training programs and tools by Haris Falas.",
    changefreq: "weekly",
    priority: "0.9",
  },
  {
    path: "/smarty-plans",
    title: "SmartyGym Plans and Pricing | Free, Premium, Corporate",
    description:
      "Compare SmartyGym plans: free, Premium and Corporate. Human-designed workouts and programs at every level.",
    changefreq: "weekly",
    priority: "0.9",
  },
  {
    path: "/premiumbenefits",
    title: "Premium Benefits | What You Unlock with SmartyGym Premium",
    description:
      "Everything you unlock with SmartyGym Premium: full workout library, multi-week programs, daily WOD and unlimited tool access.",
    changefreq: "monthly",
    priority: "0.7",
  },

  // Corporate
  {
    path: "/corporate",
    title: "SmartyGym Corporate | Wellness for Teams and Companies",
    description:
      "SmartyGym Corporate: human-designed online fitness for teams, with centralized billing and structured training for employees.",
    changefreq: "monthly",
    priority: "0.7",
  },
  {
    path: "/corporate-wellness",
    title: "Corporate Wellness Programs | SmartyGym for Teams",
    description:
      "Build a stronger team with SmartyGym Corporate Wellness: structured workouts, programs and accountability for every employee.",
    changefreq: "monthly",
    priority: "0.7",
  },

  // Library + tools
  {
    path: "/exerciselibrary",
    title: "Exercise Library | Coaching Cues and Demos | SmartyGym",
    description:
      "SmartyGym Exercise Library: clear coaching cues, descriptions and demos for every exercise used across our workouts and programs.",
    changefreq: "weekly",
    priority: "0.7",
  },
  {
    path: "/tools",
    title: "Smarty Tools | Free Fitness and Nutrition Calculators",
    description:
      "Smarty Tools: free 1RM calculator, BMR calculator, macro calculator, calorie counter and workout timer — built by Haris Falas.",
    changefreq: "monthly",
    priority: "0.7",
  },
  {
    path: "/1rmcalculator",
    title: "1RM Calculator | Estimate Your One-Rep Max | SmartyGym",
    description:
      "Free 1RM calculator by SmartyGym. Estimate your one-rep max across major lifts using validated formulas. No signup required.",
    changefreq: "monthly",
    priority: "0.6",
  },
  {
    path: "/bmrcalculator",
    title: "BMR Calculator | Basal Metabolic Rate | SmartyGym",
    description:
      "Free BMR calculator by SmartyGym. Calculate your basal metabolic rate and daily calorie needs with science-based formulas.",
    changefreq: "monthly",
    priority: "0.6",
  },
  {
    path: "/macrocalculator",
    title: "Macro Calculator | Protein, Carbs and Fat | SmartyGym",
    description:
      "Free macro calculator by SmartyGym. Get personalized protein, carb and fat targets for fat loss, maintenance or muscle gain.",
    changefreq: "monthly",
    priority: "0.6",
  },
  {
    path: "/caloriecalculator",
    title: "Calorie Calculator | Daily Calorie Needs | SmartyGym",
    description:
      "Free calorie calculator by SmartyGym. Estimate your daily calorie needs based on goals, body composition and activity.",
    changefreq: "monthly",
    priority: "0.6",
  },
  {
    path: "/workouttimer",
    title: "Workout Timer | Interval, EMOM and Tabata | SmartyGym",
    description:
      "Free interval timer by SmartyGym for EMOM, AMRAP, Tabata and circuits. Built for real training, by Haris Falas.",
    changefreq: "monthly",
    priority: "0.6",
  },
  {
    path: "/caloriecounter",
    title: "Calorie Counter | Food Lookup and Tracking | SmartyGym",
    description:
      "Free SmartyGym calorie counter. Search foods, log meals and stay on top of your daily nutrition.",
    changefreq: "monthly",
    priority: "0.6",
  },

  // Community + shop
  {
    path: "/community",
    title: "SmartyGym Community | Leaderboards and Member Activity",
    description:
      "Join the SmartyGym community: see leaderboards, member streaks and workouts completed across the platform.",
    changefreq: "daily",
    priority: "0.7",
  },
  {
    path: "/shop",
    title: "SmartyGym Shop | Standalone Workouts and Programs",
    description:
      "Buy individual SmartyGym workouts and training programs without a subscription. One-time payment, lifetime access.",
    changefreq: "weekly",
    priority: "0.6",
  },

  // Legal
  {
    path: "/privacy-policy",
    title: "Privacy Policy | SmartyGym",
    description:
      "How SmartyGym handles your personal data, cookies and account information.",
    changefreq: "yearly",
    priority: "0.3",
  },
  {
    path: "/termsofservice",
    title: "Terms of Service | SmartyGym",
    description:
      "The terms that govern your use of SmartyGym, including subscriptions, content access and acceptable use.",
    changefreq: "yearly",
    priority: "0.3",
  },
  {
    path: "/disclaimer",
    title: "Health and Fitness Disclaimer | SmartyGym",
    description:
      "Important health and fitness disclaimer for SmartyGym users — please read before starting any workout or program.",
    changefreq: "yearly",
    priority: "0.3",
  },

  // Utility routes (kept for sitemap consistency, low priority)
  {
    path: "/auth",
    title: "Sign In or Create an Account | SmartyGym",
    description: "Sign in to SmartyGym or create a free account to start training.",
    changefreq: "yearly",
    priority: "0.1",
  },
  {
    path: "/reset-password",
    title: "Reset Password | SmartyGym",
    description: "Reset your SmartyGym account password.",
    changefreq: "yearly",
    priority: "0.1",
  },
  {
    path: "/premium-comparison",
    title: "Compare SmartyGym Premium Plans",
    description: "Compare SmartyGym Premium plan options side by side.",
    changefreq: "yearly",
    priority: "0.1",
  },
  {
    path: "/premiumcomparison",
    title: "Premium Comparison | SmartyGym",
    description: "Compare SmartyGym Premium plan options side by side.",
    changefreq: "yearly",
    priority: "0.1",
  },
  {
    path: "/newsletter-thank-you",
    title: "Thank You | SmartyGym Newsletter",
    description: "You're subscribed to the SmartyGym newsletter.",
    changefreq: "yearly",
    priority: "0.1",
  },
];

export const WORKOUT_CATEGORY_SLUGS = [
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

export const PROGRAM_CATEGORY_SLUGS = [
  "cardio-endurance",
  "functional-strength",
  "muscle-hypertrophy",
  "weight-loss",
  "low-back-pain",
  "mobility-stability",
];

const WORKOUT_CATEGORY_TITLE: Record<string, string> = {
  strength: "Strength Workouts",
  "calorie-burning": "Calorie-Burning Workouts",
  metabolic: "Metabolic Workouts",
  cardio: "Cardio Workouts",
  mobility: "Mobility and Stability Workouts",
  challenge: "Challenge Workouts",
  pilates: "Pilates Workouts",
  recovery: "Recovery Workouts",
  "micro-workouts": "Micro-Workouts (5-Minute Exercise Snacks)",
};

const PROGRAM_CATEGORY_TITLE: Record<string, string> = {
  "cardio-endurance": "Cardio Endurance Programs",
  "functional-strength": "Functional Strength Programs",
  "muscle-hypertrophy": "Muscle Hypertrophy Programs",
  "weight-loss": "Weight Loss Programs",
  "low-back-pain": "Low Back Pain Programs",
  "mobility-stability": "Mobility and Stability Programs",
};

const WORKOUT_CATEGORY_TO_SLUG: Record<string, string> = {
  STRENGTH: "strength",
  "CALORIE BURNING": "calorie-burning",
  METABOLIC: "metabolic",
  CARDIO: "cardio",
  "MOBILITY & STABILITY": "mobility",
  MOBILITY: "mobility",
  CHALLENGE: "challenge",
  PILATES: "pilates",
  RECOVERY: "recovery",
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

export function workoutSlugFor(category: string | null | undefined): string | null {
  if (!category) return null;
  const up = category.toUpperCase().trim();
  if (WORKOUT_CATEGORY_TO_SLUG[up]) return WORKOUT_CATEGORY_TO_SLUG[up];
  for (const key of Object.keys(WORKOUT_CATEGORY_TO_SLUG)) {
    if (up.includes(key)) return WORKOUT_CATEGORY_TO_SLUG[key];
  }
  return null;
}

export function programSlugFor(category: string | null | undefined): string | null {
  if (!category) return null;
  const up = category.toUpperCase().trim();
  if (PROGRAM_CATEGORY_TO_SLUG[up]) return PROGRAM_CATEGORY_TO_SLUG[up];
  for (const key of Object.keys(PROGRAM_CATEGORY_TO_SLUG)) {
    if (up.includes(key)) return PROGRAM_CATEGORY_TO_SLUG[key];
  }
  return null;
}

function toIsoDate(value: unknown): string | undefined {
  if (!value || typeof value !== "string") return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString().split("T")[0];
}

function stripHtml(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function clamp(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}

export interface SeoRouteBundle {
  routes: SeoRoute[];
  counts: {
    static: number;
    workoutCategory: number;
    programCategory: number;
    workouts: number;
    programs: number;
    blogArticles: number;
    total: number;
  };
}

/**
 * Build the complete, authoritative list of public routes for the site.
 * Throws when dynamic counts look too small to publish safely.
 */
export async function buildSeoRoutes(): Promise<SeoRouteBundle> {
  const today = new Date().toISOString().split("T")[0];
  const routes: SeoRoute[] = [];

  for (const r of STATIC_ROUTES) {
    routes.push({ ...r, kind: "static", lastmod: today });
  }

  for (const slug of WORKOUT_CATEGORY_SLUGS) {
    routes.push({
      path: `/workout/${slug}`,
      kind: "workout-category",
      title: `${WORKOUT_CATEGORY_TITLE[slug]} | SmartyGym`,
      description: `Browse all ${WORKOUT_CATEGORY_TITLE[slug].toLowerCase()} on SmartyGym, human-designed by Sports Scientist Haris Falas.`,
      lastmod: today,
      changefreq: "daily",
      priority: "0.8",
    });
  }

  for (const slug of PROGRAM_CATEGORY_SLUGS) {
    routes.push({
      path: `/trainingprogram/${slug}`,
      kind: "program-category",
      title: `${PROGRAM_CATEGORY_TITLE[slug]} | SmartyGym`,
      description: `Browse all ${PROGRAM_CATEGORY_TITLE[slug].toLowerCase()} on SmartyGym — multi-week, structured plans by Haris Falas.`,
      lastmod: today,
      changefreq: "weekly",
      priority: "0.8",
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false },
  });

  let dynamicWorkouts = 0;
  let dynamicPrograms = 0;
  let dynamicBlog = 0;

  const [workoutsRes, programsRes, blogRes] = await Promise.all([
    (supabase as any).rpc("get_visible_workout_metadata", { _workout_id: null }),
    (supabase as any).rpc("get_visible_program_metadata", { _program_id: null }),
    supabase
      .from("blog_articles")
      .select(
        "id, slug, title, excerpt, content, category, image_url, author_name, author_credentials, read_time, published_at, created_at, updated_at, is_published",
      )
      .eq("is_published", true)
      .limit(2000),
  ]);

  if (workoutsRes.error) {
    console.warn("[seo-routes] workouts query error:", workoutsRes.error.message);
  } else if (workoutsRes.data) {
    for (const w of workoutsRes.data as any[]) {
      const slug = workoutSlugFor(w.category);
      if (!slug || !w.id) continue;
      const cleanDesc = stripHtml(w.description);
      const titleParts = [
        w.name,
        "| Online Workout by Haris Falas | SmartyGym",
      ];
      const descParts = [
        w.duration ? `${w.duration} ${w.format || ""}`.trim() : w.format,
        `${w.difficulty || ""} workout`.trim(),
        cleanDesc || `${w.name} by Sports Scientist Haris Falas.`,
      ].filter(Boolean) as string[];
      routes.push({
        path: `/workout/${slug}/${w.id}`,
        kind: "workout",
        title: clamp(titleParts.join(" "), 90),
        description: clamp(descParts.join(" — "), 160),
        image: w.image_url || undefined,
        lastmod: toIsoDate(w.updated_at) || toIsoDate(w.created_at) || today,
        changefreq: "weekly",
        priority: "0.7",
        payload: w,
      });
      dynamicWorkouts++;
    }
  }

  if (programsRes.error) {
    console.warn("[seo-routes] programs query error:", programsRes.error.message);
  } else if (programsRes.data) {
    for (const p of programsRes.data as any[]) {
      const slug = programSlugFor(p.category);
      if (!slug || !p.id) continue;
      const cleanDesc = stripHtml(p.description);
      const title = `${p.name} | Online Training Program by Haris Falas | SmartyGym`;
      const descBits = [
        p.weeks ? `${p.weeks}-week` : "",
        p.days_per_week ? `${p.days_per_week} days/week` : "",
        p.category || "",
        "program by Sports Scientist Haris Falas.",
        cleanDesc,
      ].filter(Boolean) as string[];
      routes.push({
        path: `/trainingprogram/${slug}/${p.id}`,
        kind: "program",
        title: clamp(title, 90),
        description: clamp(descBits.join(" "), 160),
        image: p.image_url || undefined,
        lastmod: toIsoDate(p.updated_at) || toIsoDate(p.created_at) || today,
        changefreq: "weekly",
        priority: "0.7",
        payload: p,
      });
      dynamicPrograms++;
    }
  }

  if (blogRes.error) {
    console.warn("[seo-routes] blog query error:", blogRes.error.message);
  } else if (blogRes.data) {
    for (const b of blogRes.data as any[]) {
      if (!b.slug) continue;
      const cleanExcerpt = stripHtml(b.excerpt) || stripHtml(b.content);
      routes.push({
        path: `/blog/${b.slug}`,
        kind: "blog-article",
        title: clamp(`${b.title} | SmartyGym Blog`, 90),
        description: clamp(cleanExcerpt, 160),
        image: b.image_url || undefined,
        lastmod: toIsoDate(b.updated_at) || toIsoDate(b.created_at) || today,
        changefreq: "monthly",
        priority: "0.6",
        payload: b,
      });
      dynamicBlog++;
    }
  }

  if (
    dynamicWorkouts < MIN_EXPECTED_DYNAMIC_WORKOUTS ||
    dynamicPrograms < MIN_EXPECTED_DYNAMIC_PROGRAMS ||
    dynamicBlog < MIN_EXPECTED_DYNAMIC_BLOG_ARTICLES
  ) {
    throw new Error(
      `[seo-routes] unsafe dynamic counts: workouts=${dynamicWorkouts}, programs=${dynamicPrograms}, blog=${dynamicBlog}. Refusing to publish.`,
    );
  }

  return {
    routes,
    counts: {
      static: STATIC_ROUTES.length,
      workoutCategory: WORKOUT_CATEGORY_SLUGS.length,
      programCategory: PROGRAM_CATEGORY_SLUGS.length,
      workouts: dynamicWorkouts,
      programs: dynamicPrograms,
      blogArticles: dynamicBlog,
      total: routes.length,
    },
  };
}

export function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** HTML-attribute-safe escape (for content inside attribute values). */
export function attrEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** HTML-body-safe escape (for plain text inserted into element bodies). */
export function htmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export { stripHtml };