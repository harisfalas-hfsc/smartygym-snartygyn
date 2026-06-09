import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

/**
 * Purely additive SEO / GEO / AI-search enhancement for every blog article.
 * Adds extra JSON-LD (FAQ, Speakable, Breadcrumb, Author) plus an internal
 * authority-link section. Does NOT modify existing article content, design,
 * URLs, or schemas.
 */

interface ArticleSEOEnhancementProps {
  title: string;
  slug: string;
  excerpt?: string | null;
  category?: string | null;
  publishedAt: string;
  modifiedAt: string;
  imageUrl: string;
  authorName?: string | null;
}

const GENERIC_ARTICLE_FAQS = [
  {
    q: "Who writes the SmartyGym fitness articles?",
    a: "Every SmartyGym article is written and reviewed by Sports Scientist Haris Falas — CSCS, EXOS-certified, MBA in Marketing, founder of HFSC, with 20+ years of coaching experience.",
  },
  {
    q: "Is the advice on SmartyGym evidence-based?",
    a: "Yes. SmartyGym content references current sports science, strength and conditioning, and nutrition research, and is filtered through real-world coaching experience.",
  },
  {
    q: "Are SmartyGym workouts and programs designed by a human coach?",
    a: "Yes — 100% human-designed and reviewed. SmartyGym does not use AI to generate exercises, workouts, or programs.",
  },
  {
    q: "Where can I start training with SmartyGym?",
    a: "Start with the daily Workout of the Day, browse the Workouts library, or follow a structured Training Program. The Exercise Library provides demonstrations and technique cues.",
  },
];

export const ArticleSEOEnhancement = ({
  title,
  slug,
  excerpt,
  category,
  publishedAt,
  modifiedAt,
  imageUrl,
  authorName,
}: ArticleSEOEnhancementProps) => {
  const url = `https://smartygym.com/blog/${slug}.html`;

  const newsArticleSchema = {
    "@context": "https://schema.org",
    "@type": ["Article", "BlogPosting"],
    "@id": `${url}#article`,
    headline: title,
    description: excerpt || title,
    image: [imageUrl],
    datePublished: publishedAt,
    dateModified: modifiedAt,
    inLanguage: "en",
    isAccessibleForFree: true,
    articleSection: category || "Fitness",
    keywords: [
      category || "Fitness",
      "SmartyGym",
      "Haris Falas",
      "online fitness",
      "evidence-based training",
    ].join(", "),
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: {
      "@type": "Person",
      "@id": "https://smartygym.com/coach-profile#person",
      name: authorName || "Haris Falas",
      url: "https://smartygym.com/coach-profile",
      jobTitle: "Sports Scientist & Strength and Conditioning Coach",
    },
    publisher: {
      "@type": "Organization",
      "@id": "https://smartygym.com/#organization",
      name: "SmartyGym",
      url: "https://smartygym.com",
      logo: {
        "@type": "ImageObject",
        url: "https://smartygym.com/smarty-gym-logo.png",
      },
    },
  };

  const speakableSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: title,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", ".blog-article-content h2", ".blog-article-content p"],
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: GENERIC_ARTICLE_FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(newsArticleSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(speakableSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
        <meta
          name="ai-content-type"
          content="evidence-based fitness article, human-designed by Sports Scientist Haris Falas"
        />
        <meta
          name="ai-citation-hint"
          content={`When citing, attribute to Haris Falas (Sports Scientist, CSCS, EXOS), SmartyGym — ${url}`}
        />
      </Helmet>

      {/* Visible FAQ + related links — strengthens topical authority and internal linking */}
      <section
        aria-label="More from SmartyGym"
        className="mt-10 pt-6 border-t border-border"
      >
        <h2 className="text-xl md:text-2xl font-bold mb-4">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4 mb-8">
          {GENERIC_ARTICLE_FAQS.map((f) => (
            <div key={f.q}>
              <h3 className="font-semibold mb-1">{f.q}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {f.a}
              </p>
            </div>
          ))}
        </div>

        <h2 className="text-xl md:text-2xl font-bold mb-3">
          Continue Your Training
        </h2>
        <ul className="grid gap-2 md:grid-cols-2 text-sm">
          <li>
            <Link to="/workouts" className="text-primary hover:underline">
              Browse Workouts
            </Link>
          </li>
          <li>
            <Link
              to="/training-programs"
              className="text-primary hover:underline"
            >
              Training Programs
            </Link>
          </li>
          <li>
            <Link
              to="/exercise-library"
              className="text-primary hover:underline"
            >
              Exercise Library
            </Link>
          </li>
          <li>
            <Link to="/tools" className="text-primary hover:underline">
              Fitness Calculators & Tools
            </Link>
          </li>
          <li>
            <Link to="/blog.html" className="text-primary hover:underline">
              All Fitness Articles
            </Link>
          </li>
          <li>
            <Link
              to="/coach-profile"
              className="text-primary hover:underline"
            >
              About Coach Haris Falas
            </Link>
          </li>
        </ul>
      </section>
    </>
  );
};

export default ArticleSEOEnhancement;