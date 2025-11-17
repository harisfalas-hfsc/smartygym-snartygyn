import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";
import { InfoRibbon } from "@/components/InfoRibbon";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import { useShowBackButton } from "@/hooks/useShowBackButton";
import { supabase } from "@/integrations/supabase/client";
import { CompactFilters } from "@/components/CompactFilters";
import { Link } from "react-router-dom";

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  readTime: string;
  date: string;
  category: string;
  author_name?: string;
}

const articles: Article[] = [
  {
    id: "1",
    slug: "building-muscle-complete-guide",
    title: "Building Muscle: The Complete Guide",
    excerpt: "Everything you need to know about gaining muscle mass effectively",
    image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=800",
    readTime: "8 min read",
    date: "March 15, 2024",
    category: "Fitness",
  },
  {
    id: "2",
    slug: "hiit-vs-steady-state-cardio",
    title: "HIIT vs Steady State Cardio",
    excerpt: "Which cardio method is best for your fitness goals?",
    image: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&q=80&w=800",
    readTime: "6 min read",
    date: "March 12, 2024",
    category: "Fitness",
  },
  {
    id: "3",
    slug: "perfect-form-squat-technique",
    title: "Perfect Form: Squat Technique",
    excerpt: "Master the king of all exercises with proper technique",
    image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80&w=800",
    readTime: "7 min read",
    date: "March 10, 2024",
    category: "Fitness",
  },
  {
    id: "4",
    slug: "recovery-strategies-athletes",
    title: "Recovery Strategies for Athletes",
    excerpt: "Optimize your recovery to maximize performance gains",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800",
    readTime: "9 min read",
    date: "March 8, 2024",
    category: "Wellness",
  },
  {
    id: "5",
    slug: "nutrition-timing-performance",
    title: "Nutrition Timing for Performance",
    excerpt: "When to eat for optimal training results",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800",
    readTime: "7 min read",
    date: "March 5, 2024",
    category: "Nutrition",
  },
  {
    id: "16",
    slug: "creatine-performance-supplement",
    title: "Creatine: The Ultimate Performance Supplement",
    excerpt: "Science-backed benefits and how to use creatine effectively",
    image: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&q=80&w=800",
    readTime: "10 min read",
    date: "March 18, 2024",
    category: "Nutrition",
  },
  {
    id: "17",
    slug: "training-frequency-optimal-schedule",
    title: "Training Frequency: Finding Your Optimal Schedule",
    excerpt: "How often should you train for maximum results?",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800",
    readTime: "8 min read",
    date: "March 17, 2024",
    category: "Fitness",
  },
];

const Blog = () => {
  const navigate = useNavigate();
  const { canGoBack, goBack } = useShowBackButton();
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortFilter, setSortFilter] = useState<string>("newest");
  const [dbArticles, setDbArticles] = useState<Article[]>([]);
  const [allArticles, setAllArticles] = useState<Article[]>(articles);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const { data, error } = await supabase
          .from('blog_articles')
          .select('*')
          .eq('is_published', true)
          .order('published_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          const formattedArticles: Article[] = data.map((article: any) => ({
            id: article.id,
            slug: article.slug,
            title: article.title,
            excerpt: article.excerpt,
            image: article.image_url || 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=800',
            readTime: article.read_time || '5 min read',
            date: new Date(article.published_at || article.created_at).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }),
            category: article.category,
            author_name: article.author_name,
          }));

          setDbArticles(formattedArticles);
          
          const combined = [...formattedArticles, ...articles].sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return dateB - dateA;
          });
          
          setAllArticles(combined);
        }
      } catch (error) {
        console.error('Error fetching articles:', error);
      }
    };

    fetchArticles();
  }, []);

  const filteredArticles = allArticles
    .filter((article) =>
      categoryFilter === "all" || article.category.toLowerCase() === categoryFilter.toLowerCase()
    )
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortFilter === "newest" ? dateB - dateA : dateA - dateB;
    });

  return (
    <>
      <Helmet>
        <title>Fitness Blog - Expert Training & Nutrition Advice | SmartyGym</title>
        <meta name="description" content="Expert fitness articles by Haris Falas, Cyprus-based sports scientist. Get training tips, nutrition advice, workout guides and fitness insights for Cyprus and international athletes." />
        <meta name="keywords" content="Haris Falas, fitness blog Cyprus, training advice Cyprus, nutrition tips, strength training, functional fitness, Cyprus fitness expert, sports scientist Cyprus, workout tips Cyprus, fitness news Cyprus, gym Cyprus, smartygym Cyprus, online fitness Cyprus" />
        
        <meta property="og:title" content="Fitness Blog - Expert Training & Nutrition Advice by Haris Falas | SmartyGym" />
        <meta property="og:description" content="Expert fitness articles by Cyprus sports scientist Haris Falas. Training tips, nutrition advice, and performance insights." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:image" content="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=1200" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Fitness Blog by Haris Falas - SmartyGym.com" />
        <meta name="twitter:description" content="Expert fitness articles by Cyprus sports scientist Haris Falas. Training tips, nutrition advice, and performance insights." />
        <meta name="twitter:image" content="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=1200" />
        
        <link rel="canonical" href={window.location.href} />
        
        {/* Structured Data for Blog */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "SmartyGym Fitness Blog",
            "description": "Expert fitness and nutrition advice by Cyprus sports scientist Haris Falas",
            "url": "https://smartygym.com/blog",
            "author": {
              "@type": "Person",
              "name": "Haris Falas",
              "jobTitle": "Sports Scientist & Strength and Conditioning Coach",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "CY"
              }
            },
            "inLanguage": "en",
            "publisher": {
              "@type": "Organization",
              "name": "SmartyGym",
              "url": "https://smartygym.com"
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          {canGoBack && (
            <div className="mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={goBack}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>
          )}

          <PageBreadcrumbs 
            items={[
              { label: "Home", href: "/" },
              { label: "Blog" }
            ]} 
          />

          <CompactFilters
            filters={[
              {
                name: "Sort by",
                value: sortFilter,
                onChange: setSortFilter,
                options: [
                  { value: "newest", label: "Newest" },
                  { value: "oldest", label: "Oldest" }
                ],
                placeholder: "Sort"
              },
              {
                name: "Category",
                value: categoryFilter,
                onChange: setCategoryFilter,
                options: [
                  { value: "all", label: "All" },
                  { value: "fitness", label: "Fitness" },
                  { value: "wellness", label: "Wellness" },
                  { value: "nutrition", label: "Nutrition" }
                ],
                placeholder: "Category"
              }
            ]}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <Card
                key={article.id}
                itemScope
                itemType="https://schema.org/BlogPosting"
                className="overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg"
                onClick={() => navigate(`/blog/${article.slug}`)}
                data-article-id={article.id}
                data-keywords="smarty gym blog, online fitness tips, smartygym.com, Haris Falas Cyprus, online gym advice"
                aria-label={`${article.title} - SmartyGym Cyprus blog - Online fitness at smartygym.com`}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={article.image}
                    alt={`${article.title} - SmartyGym Cyprus online fitness blog - smartygym.com by Haris Falas`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    itemProp="image"
                  />
                  <div className="absolute top-3 right-3">
                    <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                      {article.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-5">
                  <h2 
                    className="text-xl font-bold mb-2 line-clamp-2"
                    itemProp="headline"
                  >
                {article.title}
                  </h2>
                  <p 
                    className="text-muted-foreground text-sm mb-4 line-clamp-2"
                    itemProp="description"
                  >
                    {article.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{article.readTime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span itemProp="datePublished">{article.date}</span>
                    </div>
                  </div>
                  <meta itemProp="author" content="Haris Falas - SmartyGym Cyprus - smartygym.com" />
                  <meta itemProp="publisher" content="SmartyGym Cyprus - smartygym.com" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Blog;
