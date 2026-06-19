import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { requireAdminOrServiceRole } from "../_shared/admin-or-service-auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CATEGORIES = ["Fitness", "Nutrition", "Wellness"] as const;
type Category = typeof CATEGORIES[number];

// Mirrors the link sets used by generate-weekly-blog-articles so manually-
// triggered articles follow the exact same internal-linking rules.
const INTERNAL_LINKS: Record<Category, string[]> = {
  Fitness: [
    '<a href="/workout" class="text-primary hover:underline font-medium">workout library</a>',
    '<a href="/trainingprogram" class="text-primary hover:underline font-medium">training programs</a>',
    '<a href="/1rmcalculator" class="text-primary hover:underline font-medium">One Rep Max Calculator</a>',
    '<a href="/disclaimer" class="text-primary hover:underline font-medium">health disclaimer and PAR-Q screening</a>',
    '<a href="/exerciselibrary" class="text-primary hover:underline font-medium">exercise library</a>',
  ],
  Nutrition: [
    '<a href="/caloriecalculator" class="text-primary hover:underline font-medium">Calorie Calculator</a>',
    '<a href="/bmrcalculator" class="text-primary hover:underline font-medium">BMR Calculator</a>',
    '<a href="/workout" class="text-primary hover:underline font-medium">workout library</a>',
    '<a href="/trainingprogram" class="text-primary hover:underline font-medium">training programs</a>',
    '<a href="/daily-ritual" class="text-primary hover:underline font-medium">Daily Smarty Ritual</a>',
  ],
  Wellness: [
    '<a href="/daily-ritual" class="text-primary hover:underline font-medium">Daily Smarty Ritual</a>',
    '<a href="/workout" class="text-primary hover:underline font-medium">workout library</a>',
    '<a href="/trainingprogram" class="text-primary hover:underline font-medium">training programs</a>',
    '<a href="/disclaimer" class="text-primary hover:underline font-medium">health disclaimer and PAR-Q screening</a>',
    '<a href="/blog" class="text-primary hover:underline font-medium">blog articles</a>',
  ],
};

const VALID_PATHS = [
  "/workout", "/trainingprogram", "/1rmcalculator", "/bmrcalculator",
  "/caloriecalculator", "/exerciselibrary", "/daily-ritual",
  "/disclaimer", "/blog",
];

const WORD_COUNTS = [800, 1000, 1200, 1500] as const;
type WordCount = typeof WORD_COUNTS[number];

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "")
    .substring(0, 80);
}

function estimateReadTime(content: string): string {
  const textOnly = content.replace(/<[^>]*>/g, "");
  const wordCount = textOnly.split(/\s+/).length;
  const minutes = Math.max(3, Math.ceil(wordCount / 200));
  return `${minutes} min read`;
}

function parseArticleJson(responseText: string): { title?: string; excerpt?: string; content?: string } | null {
  const cleaned = responseText
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  const candidates = [cleaned];
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    candidates.push(cleaned.slice(firstBrace, lastBrace + 1));
  }

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate.replace(/,\s*([}\]])/g, "$1"));
    } catch {
      // try next candidate
    }
  }

  return null;
}

function validateAndFixLinks(content: string): string {
  return content.replace(/<a\s+([^>]*?)>(.*?)<\/a>/gi, (fullMatch, attrs, innerText) => {
    const hrefMatch = attrs.match(/href=["']([^"']*)["']/i);
    if (!hrefMatch) return innerText;
    const href = hrefMatch[1];
    if (href.startsWith("http://") || href.startsWith("https://") || href.startsWith("mailto:") || href.startsWith("tel:")) return fullMatch;
    if (VALID_PATHS.includes(href)) return fullMatch;
    if (href.startsWith("/blog/")) return fullMatch;
    console.warn(`Removed invalid internal link: ${href}`);
    return innerText;
  });
}

async function generateBlogImage(
  supabaseUrl: string,
  serviceKey: string,
  title: string,
  category: string,
  slug: string,
  excerpt: string,
  content: string,
): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/generate-blog-image`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${serviceKey}` },
      body: JSON.stringify({ title, category, slug, excerpt, content }),
      signal: controller.signal,
    });
    if (!response.ok) {
      console.error(`Image generation failed: ${response.status}`);
      return null;
    }
    const data = await response.json();
    return data.imageUrl || null;
  } catch (error) {
    console.error("Image generation error:", error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const unauthorizedResponse = await requireAdminOrServiceRole(req, corsHeaders);
  if (unauthorizedResponse) return unauthorizedResponse;

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json().catch(() => ({}));
    const title: string = (body?.title || "").toString().trim();
    const category: string = (body?.category || "").toString().trim();
    const requestedWordCount = Number(body?.wordCount || 1000);
    const wordCount: WordCount = WORD_COUNTS.includes(requestedWordCount as WordCount)
      ? requestedWordCount as WordCount
      : 1000;

    if (!title) {
      return new Response(JSON.stringify({ ok: false, error: "Title is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!CATEGORIES.includes(category as Category)) {
      return new Response(JSON.stringify({ ok: false, error: "Category must be Fitness, Nutrition, or Wellness" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cat = category as Category;
    const links = INTERNAL_LINKS[cat] || [];
    const linksStr = links.map((l) => `  ${l}`).join("\n");
    const validLinksReference = VALID_PATHS.map((p) => `  ${p}`).join("\n");

    const minWords = Math.max(650, wordCount - 100);
    const maxWords = wordCount + 100;

    const prompt = `You are a professional fitness content writer for SmartyGym, a premium fitness platform. The admin has provided the EXACT title for this article — your job is to read that title, understand the subject, and write the full article around it. Do NOT change or reinterpret the title.

CATEGORY: ${cat}
ADMIN-PROVIDED TITLE: "${title}"
TARGET LENGTH: ${wordCount} words. Acceptable range: ${minWords}-${maxWords} words.

REQUIREMENTS:
1. Use the admin's title verbatim — do not rewrite, shorten, or "improve" it.
2. Write an SEO-optimized excerpt (under 160 characters) summarizing the article.
3. Write the full article body in HTML format at the selected target length: about ${wordCount} words.
4. Use <h2> tags for section headings (4-6 sections).
5. Use <p> tags for paragraphs.
6. Include <ul> and <li> for any lists.
7. Use <strong> for emphasis on key terms.
8. Include at least 3 of these internal links naturally within the content:
${linksStr}
9. Make content evidence-based, citing studies or scientific principles where relevant.
10. Write in a professional but accessible tone.
11. Do NOT include the title as an H1 in the content — it is displayed separately.

VALID INTERNAL LINKS — ONLY use links from this list. Do NOT invent or guess any URLs:
${validLinksReference}
  /blog/[slug] — for linking to other blog articles (only if you know the exact slug)

Any link not on this list will be automatically removed. Do NOT create links to paths like /dailyritual, /parq, /programs, /tools, or any other made-up paths.

AUTHOR CONTEXT: Written by Haris Falas, Sports Scientist with CSCS certification and 20+ years experience.

RESPOND WITH EXACTLY THIS JSON FORMAT (no markdown, no code blocks, just raw JSON):
{
  "title": "${title.replace(/"/g, '\\"')}",
  "excerpt": "Your 1-sentence SEO excerpt here",
  "content": "<p>Your full HTML article content here...</p>"
}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Lovable-API-Key": LOVABLE_API_KEY,
        "X-Lovable-AIG-SDK": "supabase-edge-function",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        max_tokens: 8192,
        temperature: 0.55,
        messages: [
          { role: "system", content: "You are a professional fitness blog content writer. Always respond with valid JSON only, no markdown formatting." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      const status = aiResponse.status === 429 || aiResponse.status === 402 ? aiResponse.status : 500;
      return new Response(JSON.stringify({ ok: false, error: `AI gateway error: ${aiResponse.status}` }), {
        status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    let responseText = aiData.choices?.[0]?.message?.content || "";

    let parsed: { title: string; excerpt: string; content: string };
    const parsedResponse = parseArticleJson(responseText);
    if (!parsedResponse) {
      console.error("JSON parse error:", responseText.substring(0, 200));
      return new Response(JSON.stringify({ ok: false, error: "AI returned malformed JSON" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    parsed = parsedResponse as { title: string; excerpt: string; content: string };

    // Lock the title to exactly what the admin gave us, regardless of what the model returned.
    parsed.title = title;
    if (!parsed.content) {
      return new Response(JSON.stringify({ ok: false, error: "AI returned empty content" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    parsed.content = validateAndFixLinks(parsed.content);

    let slug = generateSlug(parsed.title);
    // Avoid colliding with an existing slug — append short timestamp if so.
    const { data: existing } = await supabase
      .from("blog_articles").select("id").eq("slug", slug).maybeSingle();
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`.substring(0, 80);
    }

    const readTime = estimateReadTime(parsed.content);
    const imageUrl = await generateBlogImage(
      supabaseUrl, supabaseServiceKey, parsed.title, cat, slug, parsed.excerpt || parsed.title, parsed.content,
    );

    // Return a DRAFT — the admin reviews & clicks Save in ArticleEditDialog.
    const draft = {
      title: parsed.title,
      slug,
      category: cat,
      excerpt: parsed.excerpt || "",
      content: parsed.content,
      author_name: "Haris Falas",
      author_credentials: "Sports Scientist | CSCS Certified | 20+ Years Experience",
      is_ai_generated: true,
      is_published: false,
      read_time: readTime,
      image_url: imageUrl || "",
    };

    return new Response(JSON.stringify({ ok: true, draft }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
    });
  } catch (error: any) {
    console.error("generate-admin-article error:", error);
    return new Response(JSON.stringify({ ok: false, error: error.message || "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});