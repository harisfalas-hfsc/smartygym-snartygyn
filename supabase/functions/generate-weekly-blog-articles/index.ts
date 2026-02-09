import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CATEGORIES = ["Fitness", "Nutrition", "Wellness"];

const CATEGORY_TOPICS: Record<string, string[]> = {
  Fitness: [
    "strength training techniques", "functional fitness for daily life", "mobility and flexibility",
    "workout recovery strategies", "cardio vs resistance training", "home workout routines",
    "injury prevention exercises", "core training fundamentals", "training periodization",
    "exercise form and technique", "high-intensity interval training", "low-impact exercises",
    "training for endurance", "bodyweight training progressions", "compound vs isolation exercises",
    "fitness for beginners", "advanced training methods", "sport-specific conditioning",
    "postural correction exercises", "training frequency and volume"
  ],
  Nutrition: [
    "protein requirements for muscle growth", "meal timing and performance", "hydration science",
    "micronutrients and health", "anti-inflammatory foods", "gut health and performance",
    "pre-workout nutrition", "post-workout recovery meals", "healthy fats explained",
    "carbohydrate cycling", "supplement science", "plant-based protein sources",
    "meal prep strategies", "nutrition myths debunked", "vitamins for active adults",
    "balanced macronutrients", "nutrition for fat loss", "superfoods science",
    "eating for energy", "nutrition and immune system"
  ],
  Wellness: [
    "sleep optimization strategies", "stress management techniques", "mindfulness and meditation",
    "mental health and exercise", "work-life balance", "breathing techniques for performance",
    "cold exposure therapy", "heat therapy benefits", "circadian rhythm optimization",
    "digital detox strategies", "gratitude and mental wellness", "social connection and health",
    "nature and wellbeing", "journaling for mental clarity", "habit building science",
    "burnout prevention", "self-care routines", "emotional resilience training",
    "recovery day activities", "holistic health approaches"
  ]
};

const INTERNAL_LINKS: Record<string, string[]> = {
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
  ]
};

const VALID_PATHS = [
  "/workout", "/trainingprogram", "/1rmcalculator", "/bmrcalculator",
  "/caloriecalculator", "/exerciselibrary", "/daily-ritual",
  "/disclaimer", "/blog"
];

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

/**
 * Validates all internal links in the generated HTML content.
 * - Allows links whose href is in VALID_PATHS
 * - Allows links starting with "/blog/" (cross-article links)
 * - Allows external links (http://, https://, mailto:, tel:)
 * - Strips invalid internal links but keeps the anchor text
 */
function validateAndFixLinks(content: string): string {
  return content.replace(/<a\s+([^>]*?)>(.*?)<\/a>/gi, (fullMatch, attrs, innerText) => {
    const hrefMatch = attrs.match(/href=["']([^"']*)["']/i);
    if (!hrefMatch) return innerText; // No href — strip the tag, keep text

    const href = hrefMatch[1];

    // Allow external links
    if (href.startsWith("http://") || href.startsWith("https://") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      return fullMatch;
    }

    // Allow valid internal paths
    if (VALID_PATHS.includes(href)) {
      return fullMatch;
    }

    // Allow cross-article blog links (e.g. /blog/some-article-slug)
    if (href.startsWith("/blog/")) {
      return fullMatch;
    }

    // Invalid internal link — remove the <a> tag but keep the text
    console.warn(`Removed invalid internal link: ${href}`);
    return innerText;
  });
}

async function generateBlogImage(
  supabaseUrl: string,
  anonKey: string,
  title: string,
  category: string,
  slug: string
): Promise<string | null> {
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/generate-blog-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ title, category, slug }),
    });

    if (!response.ok) {
      console.error(`Image generation failed for "${title}": ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data.imageUrl || null;
  } catch (error) {
    console.error(`Image generation error for "${title}":`, error);
    return null;
  }
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const results: { category: string; title: string; slug: string; status: string }[] = [];

    for (const category of CATEGORIES) {
      try {
        console.log(`\n=== Generating ${category} article ===`);

        // Fetch recent titles to avoid duplicates
        const { data: recentArticles } = await supabase
          .from("blog_articles")
          .select("title")
          .eq("category", category)
          .order("created_at", { ascending: false })
          .limit(20);

        const recentTitles = (recentArticles || []).map((a: any) => a.title);
        const recentTitlesStr = recentTitles.length > 0
          ? `\n\nDo NOT repeat or closely paraphrase any of these recent titles:\n${recentTitles.map((t: string) => `- ${t}`).join("\n")}`
          : "";

        // Pick topic hints for variety
        const topics = CATEGORY_TOPICS[category] || [];
        const shuffled = topics.sort(() => Math.random() - 0.5);
        const topicHints = shuffled.slice(0, 5).join(", ");

        // Get internal links for this category
        const links = INTERNAL_LINKS[category] || [];
        const linksStr = links.map((l: string) => `  ${l}`).join("\n");

        const validLinksReference = VALID_PATHS.map(p => `  ${p}`).join("\n");

        const prompt = `You are a professional fitness content writer for SmartyGym, a premium fitness platform. Write a comprehensive, SEO-optimized blog article for the "${category}" category.

TOPIC INSPIRATION (pick one or combine): ${topicHints}
${recentTitlesStr}

REQUIREMENTS:
1. Write a unique, engaging title (under 60 characters if possible)
2. Write an SEO-optimized excerpt (under 160 characters) summarizing the article
3. Write the full article body in HTML format (800-1200 words)
4. Use <h2> tags for section headings (4-6 sections)
5. Use <p> tags for paragraphs
6. Include <ul> and <li> for any lists
7. Use <strong> for emphasis on key terms
8. Include at least 3 of these internal links naturally within the content:
${linksStr}
9. Make content evidence-based, citing studies or scientific principles where relevant
10. Write in a professional but accessible tone
11. Do NOT include the title as an H1 in the content — it's displayed separately

VALID INTERNAL LINKS — ONLY use links from this list. Do NOT invent or guess any URLs:
${validLinksReference}
  /blog/[slug] — for linking to other blog articles (only if you know the exact slug)

Any link not on this list will be automatically removed. Do NOT create links to paths like /dailyritual, /parq, /programs, /tools, or any other made-up paths.

AUTHOR CONTEXT: Written by Haris Falas, Sports Scientist with CSCS certification and 20+ years experience.

RESPOND WITH EXACTLY THIS JSON FORMAT (no markdown, no code blocks, just raw JSON):
{
  "title": "Your Article Title Here",
  "excerpt": "Your 1-sentence SEO excerpt here",
  "content": "<p>Your full HTML article content here...</p>"
}`;

        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: "You are a professional fitness blog content writer. Always respond with valid JSON only, no markdown formatting." },
              { role: "user", content: prompt }
            ],
          }),
        });

        if (!aiResponse.ok) {
          const errText = await aiResponse.text();
          console.error(`AI error for ${category}:`, aiResponse.status, errText);
          results.push({ category, title: "", slug: "", status: `AI error: ${aiResponse.status}` });
          continue;
        }

        const aiData = await aiResponse.json();
        let responseText = aiData.choices?.[0]?.message?.content || "";
        
        // Clean up response - remove markdown code blocks if present
        responseText = responseText.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

        let parsed: { title: string; excerpt: string; content: string };
        try {
          parsed = JSON.parse(responseText);
        } catch (parseError) {
          console.error(`JSON parse error for ${category}:`, responseText.substring(0, 200));
          results.push({ category, title: "", slug: "", status: "JSON parse error" });
          continue;
        }

        if (!parsed.title || !parsed.content) {
          results.push({ category, title: "", slug: "", status: "Missing title or content" });
          continue;
        }

        // Validate and fix all internal links before saving
        parsed.content = validateAndFixLinks(parsed.content);

        const slug = generateSlug(parsed.title);
        const readTime = estimateReadTime(parsed.content);

        // Check if slug already exists
        const { data: existing } = await supabase
          .from("blog_articles")
          .select("id")
          .eq("slug", slug)
          .maybeSingle();

        if (existing) {
          console.log(`Slug "${slug}" already exists, skipping`);
          results.push({ category, title: parsed.title, slug, status: "Skipped (duplicate slug)" });
          continue;
        }

        // Generate image
        console.log(`Generating image for: ${parsed.title}`);
        const imageUrl = await generateBlogImage(supabaseUrl, supabaseAnonKey, parsed.title, category, slug);

        // Insert as draft
        const { error: insertError } = await supabase
          .from("blog_articles")
          .insert({
            title: parsed.title,
            slug,
            category,
            excerpt: parsed.excerpt || parsed.title,
            content: parsed.content,
            author_name: "Haris Falas",
            author_credentials: "Sports Scientist | CSCS Certified | 20+ Years Experience",
            is_ai_generated: true,
            is_published: false,
            read_time: readTime,
            image_url: imageUrl,
          });

        if (insertError) {
          console.error(`Insert error for ${category}:`, insertError);
          results.push({ category, title: parsed.title, slug, status: `Insert error: ${insertError.message}` });
          continue;
        }

        console.log(`✅ Created draft: ${parsed.title}`);
        results.push({ category, title: parsed.title, slug, status: "Created as draft" });

        // Rate limit between categories
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (catError: any) {
        console.error(`Error processing ${category}:`, catError);
        results.push({ category, title: "", slug: "", status: `Error: ${catError.message}` });
      }
    }

    return new Response(
      JSON.stringify({ success: true, articles: results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error: any) {
    console.error("Weekly blog generation error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
