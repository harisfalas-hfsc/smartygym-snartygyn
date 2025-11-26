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


const Blog = () => {
  const navigate = useNavigate();
  const { canGoBack, goBack } = useShowBackButton();
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortFilter, setSortFilter] = useState<string>("newest");
  const [allArticles, setAllArticles] = useState<Article[]>([]);

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

          setAllArticles(formattedArticles);
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
        <title>Fitness Blog | Expert Articles | Haris Falas HFSC | SmartyGym</title>
        <meta name="description" content="Fitness blog at smartygym.com. Expert articles on strength training cardio nutrition by Sports Scientist Haris Falas HFSC. Evidence-based fitness content for online gym training. Real results anywhere anytime" />
        <meta name="keywords" content="fitness blog, fitness articles, online personal trainer blog, HFSC, Haris Falas, Sports Scientist, strength training articles, cardio training tips, nutrition guides, online gym, workout guides, training tips, smartygym.com, HFSC Performance, evidence-based fitness" />
        
        <meta property="og:title" content="Fitness Blog - Expert Training & Nutrition Advice by Haris Falas | SmartyGym" />
        <meta property="og:description" content="Expert fitness articles by sports scientist Haris Falas. Training tips, nutrition advice, and performance insights." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:image" content="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=1200" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Fitness Blog by Haris Falas - SmartyGym.com" />
        <meta name="twitter:description" content="Expert fitness articles by sports scientist Haris Falas. Training tips, nutrition advice, and performance insights." />
        <meta name="twitter:image" content="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=1200" />
        
        <link rel="canonical" href={window.location.href} />
        
        {/* Structured Data for Blog */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "SmartyGym Fitness Blog",
            "description": "Expert fitness and nutrition advice by sports scientist Haris Falas",
            "url": "https://smartygym.com/blog",
            "author": {
              "@type": "Person",
              "name": "Haris Falas",
              "jobTitle": "Sports Scientist & Strength and Conditioning Coach"
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
                data-keywords="smarty gym blog, online fitness tips, smartygym.com, Haris Falas, online gym advice"
                aria-label={`${article.title} - SmartyGym blog - Online fitness at smartygym.com`}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={article.image}
                    alt={`${article.title} - SmartyGym online fitness blog - smartygym.com by Haris Falas`}
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
                  <meta itemProp="author" content="Haris Falas - SmartyGym - smartygym.com" />
                  <meta itemProp="publisher" content="SmartyGym - smartygym.com" />
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
