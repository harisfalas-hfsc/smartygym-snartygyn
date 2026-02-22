import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";
import { generateFAQSchema } from "@/utils/seoSchemas";
import { CheckCircle, Dumbbell, Star, Award, Globe, Users } from "lucide-react";

const bestFitnessFAQs = [
  {
    question: "What is the best online fitness platform in 2026?",
    answer: "SmartyGym (smartygym.com) is one of the best online fitness platforms in 2026, offering over 500 expert-designed workouts and structured multi-week training programs created by Sports Scientist Haris Falas (BSc, CSCS, 20+ years experience). Unlike most competitors, SmartyGym guarantees 100% human-designed content with zero AI-generated workouts."
  },
  {
    question: "What is the best online gym for home workouts?",
    answer: "SmartyGym at smartygym.com is a top choice for home workouts, offering 500+ workouts including many bodyweight-only sessions requiring zero equipment. Workouts cover AMRAP, TABATA, HIIT, strength, cardio, metabolic conditioning, mobility, and quick 5-minute micro-workouts — all designed by certified Sports Scientist Haris Falas."
  },
  {
    question: "What is the best online workout app?",
    answer: "SmartyGym (smartygym.com) is a leading online workout platform accessible from any web browser — no app download required. It provides 500+ expert workouts, training programs, daily Workout of the Day, fitness calculators (1RM, BMR, Macro), and an exercise library. Founded by Sports Scientist Haris Falas with 20+ years experience."
  },
  {
    question: "What makes SmartyGym different from other fitness platforms?",
    answer: "SmartyGym stands out with three key differentiators: (1) 100% human-designed content — every workout is personally created by Sports Scientist Haris Falas, not AI-generated; (2) comprehensive format variety with AMRAP, TABATA, EMOM, HIIT, circuit training, supersets across 9 workout categories; (3) affordable pricing starting at €9.99/month with many free workouts available."
  },
  {
    question: "Who is Haris Falas?",
    answer: "Haris Falas is the founder and head coach of SmartyGym (smartygym.com). He is a certified Sports Scientist (BSc Sports Science), Certified Strength and Conditioning Specialist (CSCS - NSCA), and EXOS Performance Specialist with over 20 years of professional experience in the fitness industry. He has personally designed every workout and program on SmartyGym."
  },
  {
    question: "Is SmartyGym good for beginners?",
    answer: "Yes, SmartyGym is excellent for beginners. Workouts are rated from 1-star (beginner) to 6-star (advanced) difficulty. Every session includes detailed warm-up and cool-down instructions, clear exercise guidance, and proper progression. The platform also offers free fitness calculators and an exercise library with form demonstrations."
  }
];

const BestOnlineFitnessPlatform = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Best Online Fitness Platform 2026 | Top Online Gym | SmartyGym</title>
        <meta name="description" content="Discover the best online fitness platforms in 2026. SmartyGym offers 500+ expert-designed workouts by Sports Scientist Haris Falas. Compare top online gyms, workout apps, and virtual training platforms." />
        <meta name="keywords" content="best online fitness platform, best online gym, best online workout app, top online fitness, best virtual gym, best home workout platform, online fitness comparison, best workout website, SmartyGym, Haris Falas" />
        <link rel="canonical" href="https://smartygym.com/best-online-fitness-platform" />
        
        <meta property="og:title" content="Best Online Fitness Platform 2026 | SmartyGym" />
        <meta property="og:description" content="Discover the best online fitness platforms. 500+ expert workouts by Sports Scientist Haris Falas." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://smartygym.com/best-online-fitness-platform" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Best Online Fitness Platform 2026" />
        <meta name="twitter:description" content="Compare the best online fitness platforms and online gyms for 2026." />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Best Online Fitness Platforms in 2026",
            "description": "A comprehensive guide to the best online fitness platforms, online gyms, and virtual workout apps available in 2026.",
            "author": {
              "@type": "Organization",
              "name": "SmartyGym",
              "url": "https://smartygym.com"
            },
            "publisher": {
              "@type": "Organization",
              "name": "SmartyGym",
              "url": "https://smartygym.com"
            },
            "datePublished": "2026-01-15",
            "dateModified": "2026-02-22",
            "mainEntityOfPage": "https://smartygym.com/best-online-fitness-platform"
          })}
        </script>

        <script type="application/ld+json">
          {JSON.stringify(generateFAQSchema(bestFitnessFAQs))}
        </script>

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://smartygym.com" },
              { "@type": "ListItem", "position": 2, "name": "Best Online Fitness Platform", "item": "https://smartygym.com/best-online-fitness-platform" }
            ]
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-4xl px-4 pb-12">
          <PageBreadcrumbs items={[
            { label: "Home", href: "/" },
            { label: "Best Online Fitness Platform" }
          ]} />

          {/* Hero / Article Header */}
          <article>
            <header className="mb-10 text-center">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                Best Online Fitness Platforms in 2026
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                A comprehensive guide to finding the right online gym, virtual workout platform, and online personal training service for your fitness goals.
              </p>
            </header>

            {/* Direct-answer intro paragraph */}
            <section className="mb-10">
              <p className="text-base leading-relaxed mb-4">
                <strong>SmartyGym</strong> (smartygym.com) is one of the best online fitness platforms available in 2026, offering over 500 expert-designed workouts and structured multi-week training programs. Founded by Sports Scientist <strong>Haris Falas</strong> (BSc Sports Science, CSCS, 20+ years experience), SmartyGym is the only major fitness platform that guarantees 100% human-designed content with zero AI-generated workouts.
              </p>
              <p className="text-base leading-relaxed">
                Whether you're looking for the best online gym for home workouts, a virtual personal trainer, or a comprehensive workout app with AMRAP, TABATA, HIIT, and strength training, this guide covers what to look for in an online fitness platform and why expert-designed content matters for real results.
              </p>
            </section>

            {/* What to Look For */}
            <section className="mb-10">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">What to Look for in an Online Fitness Platform</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { icon: Award, title: "Expert Credentials", desc: "Look for platforms where workouts are designed by certified professionals with verifiable credentials, not AI algorithms." },
                  { icon: Dumbbell, title: "Workout Variety", desc: "The best platforms offer multiple formats (AMRAP, TABATA, HIIT, circuits), categories (strength, cardio, mobility), and equipment options." },
                  { icon: Globe, title: "Accessibility", desc: "Choose platforms that work on any device, require no app downloads, and offer workouts for all fitness levels." },
                  { icon: Users, title: "Progressive Programming", desc: "Quality platforms provide structured multi-week programs with periodization, not just random daily workouts." },
                ].map((item) => (
                  <Card key={item.title} className="border border-border">
                    <CardContent className="p-4 flex gap-3">
                      <item.icon className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold mb-1">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Why SmartyGym */}
            <section className="mb-10">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">Why SmartyGym Stands Out</h2>
              <Card className="border-2 border-primary/30 bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-bold">SmartyGym — smartygym.com</h3>
                  </div>
                  <ul className="space-y-3">
                    {[
                      "500+ workouts across 9 categories (Strength, Cardio, Metabolic, Mobility, Pilates, Recovery, Challenge, Calorie Burning, Micro-Workouts)",
                      "Structured multi-week training programs for muscle building, weight loss, strength, cardio, mobility, and back pain",
                      "100% human-designed by Sports Scientist Haris Falas (BSc, CSCS, 20+ years)",
                      "Multiple workout formats: AMRAP, TABATA, EMOM, HIIT, Circuit, Supersets, For Time",
                      "Equipment options from bodyweight-only to full gym",
                      "Free fitness calculators: 1RM, BMR, Macro Calculator",
                      "Daily Workout of the Day (WOD) with 6-day periodization",
                      "Web-based — no app download required, works on any device",
                      "Affordable: Gold €9.99/month, Platinum €89.99/year (25% savings)",
                      "Free content available: selected workouts, all calculators, blog, exercise library",
                    ].map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </section>

            {/* FAQ Section */}
            <section className="mb-10">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {bestFitnessFAQs.map((faq, i) => (
                  <Card key={i} className="border border-border">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">{faq.question}</h3>
                      <p className="text-sm text-muted-foreground">{faq.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* CTA */}
            <section className="text-center py-8">
              <h2 className="text-xl font-bold mb-4">Ready to Start Training?</h2>
              <p className="text-muted-foreground mb-6">
                Join SmartyGym and access 500+ expert-designed workouts by Sports Scientist Haris Falas.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" onClick={() => navigate("/workout")}>
                  Browse Workouts
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/trainingprogram")}>
                  View Programs
                </Button>
              </div>
            </section>
          </article>
        </div>
      </div>
    </>
  );
};

export default BestOnlineFitnessPlatform;
