/**
 * Renders the per-route HTML body content + JSON-LD blocks that get injected
 * into the static index.html template by scripts/prerender.ts.
 *
 * The pre-rendered body is what Google sees BEFORE JavaScript hydrates.
 * React's createRoot replaces it after hydration, so the visible UI stays the
 * same for users.
 */
import {
  BASE_URL,
  canonicalUrlFor,
  attrEscape,
  htmlEscape,
  stripHtml,
  type SeoRoute,
} from "./seo-routes";

const AUTHOR = {
  name: "Haris Falas",
  jobTitle: "Sports Scientist & Strength and Conditioning Coach",
  url: `${BASE_URL}/coach-profile`,
  description: "BSc Sports Science, CSCS certified with 20+ years experience",
};

const ORG = {
  name: "SmartyGym",
  url: BASE_URL,
};

function person() {
  return {
    "@type": "Person",
    "@id": `${BASE_URL}/coach-profile#person`,
    name: AUTHOR.name,
    jobTitle: AUTHOR.jobTitle,
    description: AUTHOR.description,
    url: AUTHOR.url,
  };
}

function breadcrumb(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${BASE_URL}${it.path}`,
    })),
  };
}

function safeImg(url: string | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http")) return url;
  if (url.startsWith("/")) return `${BASE_URL}${url}`;
  return url;
}

function sectionHtml(label: string, raw: string | null | undefined): string {
  if (!raw || !stripHtml(raw)) return "";
  // Admin-authored HTML is already sanitized in the app; we trust it the same
  // way the React app does and insert as-is.
  return `<section class="seo-section"><h2>${htmlEscape(label)}</h2>${normalizeInternalLinks(raw)}</section>`;
}

const HTML_CANONICAL_PREFIXES = [
  "/blog", "/workout", "/trainingprogram", "/tools", "/coach-profile", "/coach-cv",
  "/the-smarty-method", "/about", "/about-smartygym", "/best-online-fitness-platform",
  "/why-invest-in-smartygym", "/wod-archive", "/daily-ritual", "/exerciselibrary",
  "/community", "/shop", "/contact", "/faq", "/smarty-plans", "/joinpremium",
  "/join-premium", "/corporate", "/corporate-wellness",
];

function normalizeInternalLinks(html: string): string {
  return html.replace(/href=(["'])(.*?)\1/gi, (_match, quote: string, href: string) => {
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return `href=${quote}${href}${quote}`;
    try {
      const url = href.startsWith("http") ? new URL(href) : new URL(href, BASE_URL);
      if (url.hostname && !["smartygym.com", "www.smartygym.com"].includes(url.hostname)) return `href=${quote}${href}${quote}`;
      const path = url.pathname.replace(/\/+$/g, "") || "/";
      if (path === "/" || path.endsWith(".html")) return `href=${quote}${href}${quote}`;
      if (!HTML_CANONICAL_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) return `href=${quote}${href}${quote}`;
      const canonicalPath = `${path}.html${url.search}${url.hash}`;
      const nextHref = href.startsWith("http") ? `${BASE_URL}${canonicalPath}` : canonicalPath;
      return `href=${quote}${attrEscape(nextHref)}${quote}`;
    } catch {
      return `href=${quote}${href}${quote}`;
    }
  });
}

/** Build a list of JSON-LD blocks + the crawlable body HTML for a route. */
export function renderRouteBody(route: SeoRoute): {
  bodyHtml: string;
  jsonLd: unknown[];
} {
  const canonical = canonicalUrlFor(route.path);
  const jsonLd: unknown[] = [];

  if (route.kind === "blog-article") {
    const a = (route.payload || {}) as any;
    const published = a.published_at || a.created_at;
    const modified = a.updated_at || published;
    const img = safeImg(a.image_url);
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: a.title,
      description: route.description,
      datePublished: published,
      dateModified: modified,
      image: img,
      author: person(),
      publisher: { "@type": "Organization", name: ORG.name, url: ORG.url },
      mainEntityOfPage: canonical,
      articleSection: a.category,
    });
    jsonLd.push(
      breadcrumb([
        { name: "Home", path: "/" },
        { name: "Blog", path: "/blog" },
        { name: a.title, path: route.path },
      ]),
    );
    const dateLabel = published
      ? new Date(published).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "";
    const author = a.author_name || AUTHOR.name;
    const credentials = a.author_credentials
      ? `<p class="seo-author-credentials">${htmlEscape(
          String(a.author_credentials),
        )}</p>`
      : "";
    const cover = img
      ? `<img src="${attrEscape(img)}" alt="${attrEscape(
          a.title || "",
        )}" width="1200" height="630" loading="eager" />`
      : "";
    return {
      bodyHtml: `
<main class="seo-prerender seo-article">
  <nav class="seo-breadcrumbs" aria-label="Breadcrumb">
    <a href="/">Home</a> &rsaquo; <a href="/blog.html">Blog</a> &rsaquo; <span>${htmlEscape(a.title || "")}</span>
  </nav>
  <article>
    <header>
      <p class="seo-eyebrow">${htmlEscape(a.category || "Fitness")}</p>
      <h1>${htmlEscape(a.title || "")}</h1>
      <p class="seo-byline">By <a href="/coach-profile.html">${htmlEscape(author)}</a>${
        dateLabel ? ` &middot; <time datetime="${attrEscape(published)}">${htmlEscape(dateLabel)}</time>` : ""
      }${a.read_time ? ` &middot; ${htmlEscape(String(a.read_time))}` : ""}</p>
      ${credentials}
      <p class="seo-excerpt">${htmlEscape(stripHtml(a.excerpt) || "")}</p>
      ${cover}
    </header>
    <div class="seo-article-body">${normalizeInternalLinks(a.content || "")}</div>
  </article>
</main>`,
      jsonLd,
    };
  }

  if (route.kind === "workout") {
    const w = (route.payload || {}) as any;
    const img = safeImg(w.image_url);
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "ExercisePlan",
      "@id": canonical,
      name: w.name,
      description: stripHtml(w.description) || route.description,
      image: img,
      activityDuration: w.duration,
      exerciseType: w.format,
      category: w.category,
      intensity: w.difficulty_stars
        ? `${w.difficulty_stars}/6 stars`
        : w.difficulty,
      workLocation: "Online / Home / Gym",
      isAccessibleForFree: !w.is_premium,
      author: person(),
      provider: { "@type": "Organization", name: ORG.name, url: ORG.url },
      identifier: w.id,
    });
    jsonLd.push(
      breadcrumb([
        { name: "Home", path: "/" },
        { name: "Smarty Workouts", path: "/workout" },
        { name: w.name, path: route.path },
      ]),
    );
    const metaRow = [
      w.category && `<li><strong>Category:</strong> ${htmlEscape(w.category)}</li>`,
      w.duration && `<li><strong>Duration:</strong> ${htmlEscape(w.duration)}</li>`,
      w.format && `<li><strong>Format:</strong> ${htmlEscape(w.format)}</li>`,
      w.difficulty && `<li><strong>Difficulty:</strong> ${htmlEscape(w.difficulty)}</li>`,
      w.equipment && `<li><strong>Equipment:</strong> ${htmlEscape(w.equipment)}</li>`,
    ]
      .filter(Boolean)
      .join("");
    const cover = img
      ? `<img src="${attrEscape(img)}" alt="${attrEscape(
          w.name || "",
        )}" width="1200" height="630" loading="eager" />`
      : "";
    return {
      bodyHtml: `
<main class="seo-prerender seo-workout">
  <nav class="seo-breadcrumbs" aria-label="Breadcrumb">
    <a href="/">Home</a> &rsaquo; <a href="/workout.html">Smarty Workouts</a> &rsaquo; <span>${htmlEscape(w.name || "")}</span>
  </nav>
  <article>
    <header>
      <h1>${htmlEscape(w.name || "")}</h1>
      <ul class="seo-meta">${metaRow}</ul>
      ${cover}
      <p class="seo-excerpt">${htmlEscape(stripHtml(w.description) || "")}</p>
      <p class="seo-author">By <a href="/coach-profile.html">${htmlEscape(AUTHOR.name)}</a> &middot; ${htmlEscape(AUTHOR.jobTitle)}</p>
    </header>
    ${sectionHtml("Warm-Up", w.warm_up)}
    ${sectionHtml("Activation", w.activation)}
    ${sectionHtml("Main Workout", w.main_workout)}
    ${sectionHtml("Finisher", w.finisher)}
    ${sectionHtml("Cool-Down", w.cool_down)}
    ${sectionHtml("Instructions", w.instructions)}
    ${sectionHtml("Tips", w.tips)}
    ${sectionHtml("Notes", w.notes)}
    ${w.is_premium ? `<p class="seo-access">This workout is part of SmartyGym Premium. Full workout structure is available to members and standalone buyers.</p>` : ""}
  </article>
</main>`,
      jsonLd,
    };
  }

  if (route.kind === "program") {
    const p = (route.payload || {}) as any;
    const img = safeImg(p.image_url);
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "Course",
      "@id": canonical,
      name: p.name,
      description: stripHtml(p.description) || route.description,
      image: img,
      provider: { "@type": "Organization", name: ORG.name, url: ORG.url },
      instructor: person(),
      courseMode: "Online",
      isAccessibleForFree: !p.is_premium,
      timeRequired: p.weeks ? `P${p.weeks}W` : undefined,
      educationalLevel: p.difficulty || undefined,
      identifier: p.id,
    });
    // Additional ExercisePlan schema (per SEO spec) so search and AI
    // crawlers also surface programs as exercise plans, not only courses.
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "ExercisePlan",
      "@id": `${canonical}#exerciseplan`,
      name: p.name,
      description: stripHtml(p.description) || route.description,
      image: img,
      activityDuration: p.weeks ? `${p.weeks} weeks` : undefined,
      exerciseType: p.category,
      category: p.category,
      intensity: p.difficulty_stars ? `${p.difficulty_stars}/6 stars` : p.difficulty,
      workLocation: "Online / Home / Gym",
      isAccessibleForFree: !p.is_premium,
      author: person(),
      provider: { "@type": "Organization", name: ORG.name, url: ORG.url },
      identifier: p.id,
    });
    jsonLd.push(
      breadcrumb([
        { name: "Home", path: "/" },
        { name: "Smarty Programs", path: "/trainingprogram" },
        { name: p.name, path: route.path },
      ]),
    );
    const metaRow = [
      p.category && `<li><strong>Category:</strong> ${htmlEscape(p.category)}</li>`,
      p.weeks && `<li><strong>Duration:</strong> ${htmlEscape(String(p.weeks))} weeks</li>`,
      p.days_per_week && `<li><strong>Frequency:</strong> ${htmlEscape(String(p.days_per_week))} days/week</li>`,
      p.difficulty && `<li><strong>Difficulty:</strong> ${htmlEscape(p.difficulty)}</li>`,
      p.equipment && `<li><strong>Equipment:</strong> ${htmlEscape(p.equipment)}</li>`,
    ]
      .filter(Boolean)
      .join("");
    const cover = img
      ? `<img src="${attrEscape(img)}" alt="${attrEscape(
          p.name || "",
        )}" width="1200" height="630" loading="eager" />`
      : "";
    return {
      bodyHtml: `
<main class="seo-prerender seo-program">
  <nav class="seo-breadcrumbs" aria-label="Breadcrumb">
    <a href="/">Home</a> &rsaquo; <a href="/trainingprogram.html">Smarty Programs</a> &rsaquo; <span>${htmlEscape(p.name || "")}</span>
  </nav>
  <article>
    <header>
      <h1>${htmlEscape(p.name || "")}</h1>
      <ul class="seo-meta">${metaRow}</ul>
      ${cover}
      <p class="seo-excerpt">${htmlEscape(stripHtml(p.description) || "")}</p>
      <p class="seo-author">Designed by <a href="/coach-profile.html">${htmlEscape(AUTHOR.name)}</a> &middot; ${htmlEscape(AUTHOR.jobTitle)}</p>
    </header>
    ${sectionHtml("Overview", p.overview)}
    ${sectionHtml("Target Audience", p.target_audience)}
    ${sectionHtml("Program Structure", p.program_structure)}
    ${sectionHtml("Weekly Schedule", p.weekly_schedule)}
    ${sectionHtml("Progression Plan", p.progression_plan)}
    ${sectionHtml("Nutrition Tips", p.nutrition_tips)}
    ${sectionHtml("Expected Results", p.expected_results)}
    ${p.is_premium ? `<p class="seo-access">This program is part of SmartyGym Premium. Full week-by-week structure is available to members and standalone buyers.</p>` : ""}
  </article>
</main>`,
      jsonLd,
    };
  }

  // Static / category pages — a clean, crawlable shell.
  // Tool routes get extra WebApplication + FAQPage schema so the static
  // prerendered HTML carries them (not just client-side after hydration).
  if (route.path.startsWith("/tools/") || route.path === "/tools") {
    const toolFaq = TOOL_FAQS[route.path];
    if (toolFaq) {
      jsonLd.push({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "@id": canonical,
        name: route.title.replace(/\s*\|\s*SmartyGym.*$/, "").trim(),
        description: route.description,
        url: canonical,
        applicationCategory: "HealthApplication",
        applicationSubCategory: "Fitness Calculator",
        operatingSystem: "Web Browser",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
        author: person(),
        creator: { "@type": "Person", name: AUTHOR.name },
        provider: { "@type": "Organization", name: ORG.name, url: ORG.url },
        publisher: { "@type": "Organization", name: ORG.name, url: ORG.url },
        inLanguage: ["en-GB", "en-US"],
      });
      jsonLd.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: toolFaq.map((q) => ({
          "@type": "Question",
          name: q.q,
          acceptedAnswer: { "@type": "Answer", text: q.a },
        })),
      });
    }
  }

  jsonLd.push({
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": canonical,
    url: canonical,
    name: route.title,
    description: route.description,
    isPartOf: { "@type": "WebSite", name: ORG.name, url: ORG.url },
    publisher: { "@type": "Organization", name: ORG.name, url: ORG.url },
  });
  return {
    bodyHtml: `
<main class="seo-prerender seo-page">
  <article>
    <header>
      <h1>${htmlEscape(route.title.replace(/\s*\|\s*SmartyGym.*$/, ""))}</h1>
      <p class="seo-excerpt">${htmlEscape(route.description)}</p>
    </header>
    <p>This page is part of <a href="/">SmartyGym</a>, the online fitness platform by Sports Scientist <a href="/coach-profile.html">Haris Falas</a>. 100% human-designed training — no AI-generated workouts.</p>
    <nav class="seo-nav" aria-label="Explore SmartyGym">
      <ul>
        <li><a href="/workout.html">Smarty Workouts</a></li>
        <li><a href="/trainingprogram.html">Smarty Training Programs</a></li>
        <li><a href="/workout/wod.html">Workout of the Day</a></li>
        <li><a href="/blog.html">SmartyGym Blog</a></li>
        <li><a href="/tools.html">Smarty Tools</a></li>
        <li><a href="/exerciselibrary.html">Exercise Library</a></li>
      </ul>
    </nav>
  </article>
</main>`,
    jsonLd,
  };
}

/** Inject route-specific SEO into the static index.html template. */
export function applyHeadOverrides(
  templateHtml: string,
  route: SeoRoute,
): string {
  const canonical = canonicalUrlFor(route.path);
  const title = route.title;
  const description = route.description;
  const image = safeImg(route.image);

  let html = templateHtml;

  // Title
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${htmlEscape(title)}</title>`);

  // Description
  html = html.replace(
    /<meta\s+name=["']description["'][^>]*>/i,
    `<meta name="description" content="${attrEscape(description)}" />`,
  );

  // Canonical
  if (/<link\s+rel=["']canonical["'][^>]*>/i.test(html)) {
    html = html.replace(
      /<link\s+rel=["']canonical["'][^>]*>/i,
      `<link rel="canonical" href="${attrEscape(canonical)}" />`,
    );
  } else {
    html = html.replace(
      /<\/head>/i,
      `  <link rel="canonical" href="${attrEscape(canonical)}" />\n</head>`,
    );
  }

  // Open Graph
  const ogReplacements: Array<[RegExp, string]> = [
    [/<meta\s+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${attrEscape(title)}" />`],
    [/<meta\s+property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${attrEscape(description)}" />`],
    [/<meta\s+property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${attrEscape(canonical)}" />`],
    [/<meta\s+name=["']twitter:title["'][^>]*>/i, `<meta name="twitter:title" content="${attrEscape(title)}" />`],
    [/<meta\s+name=["']twitter:description["'][^>]*>/i, `<meta name="twitter:description" content="${attrEscape(description)}" />`],
  ];
  const ogType =
    route.kind === "blog-article" || route.kind === "workout" || route.kind === "program"
      ? "article"
      : "website";
  ogReplacements.push([
    /<meta\s+property=["']og:type["'][^>]*>/i,
    `<meta property="og:type" content="${ogType}" />`,
  ]);

  for (const [re, repl] of ogReplacements) {
    if (re.test(html)) html = html.replace(re, repl);
    else html = html.replace(/<\/head>/i, `  ${repl}\n</head>`);
  }

  if (image) {
    if (/<meta\s+property=["']og:image["'][^>]*>/i.test(html)) {
      html = html.replace(
        /<meta\s+property=["']og:image["'][^>]*>/i,
        `<meta property="og:image" content="${attrEscape(image)}" />`,
      );
    } else {
      html = html.replace(
        /<\/head>/i,
        `  <meta property="og:image" content="${attrEscape(image)}" />\n</head>`,
      );
    }
    if (/<meta\s+name=["']twitter:image["'][^>]*>/i.test(html)) {
      html = html.replace(
        /<meta\s+name=["']twitter:image["'][^>]*>/i,
        `<meta name="twitter:image" content="${attrEscape(image)}" />`,
      );
    } else {
      html = html.replace(
        /<\/head>/i,
        `  <meta name="twitter:image" content="${attrEscape(image)}" />\n</head>`,
      );
    }
  }

  return html;
}

export function injectJsonLd(html: string, blocks: unknown[]): string {
  if (!blocks.length) return html;
  const tags = blocks
    .map(
      (b) =>
        `<script type="application/ld+json" data-prerender="1">${JSON.stringify(b)}</script>`,
    )
    .join("\n");
  return html.replace(/<\/head>/i, `${tags}\n</head>`);
}

export function injectBody(html: string, bodyHtml: string): string {
  // The shell ships <div id="root"></div>. We embed the pre-rendered HTML
  // inside it so Google sees real content. React's createRoot replaces this
  // node's children on hydration, so users still get the full app.
  return html.replace(
    /<div id="root">\s*<\/div>/,
    `<div id="root">${bodyHtml}</div>`,
  );
}