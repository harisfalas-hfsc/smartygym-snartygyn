import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageTitleCard } from "@/components/PageTitleCard";
import { InfoRibbon } from "@/components/InfoRibbon";
import { DecorativeDivider } from "@/components/DecorativeDivider";
import { ArrowLeft, Clock, Calendar, FileText } from "lucide-react";
import { useShowBackButton } from "@/hooks/useShowBackButton";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  readTime: string;
  date: string;
  category: string;
}

const articles: Article[] = [
  {
    id: "1",
    title: "Building Muscle: The Complete Guide",
    excerpt: "Everything you need to know about gaining muscle mass effectively",
    image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=800",
    readTime: "8 min read",
    date: "March 15, 2024",
    category: "Fitness",
  },
  {
    id: "2",
    title: "HIIT vs Steady State Cardio",
    excerpt: "Which cardio method is best for your fitness goals?",
    image: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&q=80&w=800",
    readTime: "6 min read",
    date: "March 12, 2024",
    category: "Fitness",
  },
  {
    id: "3",
    title: "Perfect Form: Squat Technique",
    excerpt: "Master the king of all exercises with proper technique",
    image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80&w=800",
    readTime: "7 min read",
    date: "March 10, 2024",
    category: "Fitness",
  },
  {
    id: "4",
    title: "Recovery Strategies for Athletes",
    excerpt: "Optimize your recovery to maximize performance gains",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800",
    readTime: "9 min read",
    date: "March 8, 2024",
    category: "Wellness",
  },
  {
    id: "5",
    title: "Nutrition Timing for Performance",
    excerpt: "When to eat for optimal training results",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800",
    readTime: "7 min read",
    date: "March 5, 2024",
    category: "Nutrition",
  },
  {
    id: "16",
    title: "Creatine: The Ultimate Performance Supplement",
    excerpt: "Science-backed benefits and how to use creatine effectively",
    image: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&q=80&w=800",
    readTime: "10 min read",
    date: "March 18, 2024",
    category: "Nutrition",
  },
  {
    id: "17",
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

  const filteredArticles = categoryFilter === "all" 
    ? articles 
    : articles.filter(article => article.category.toLowerCase() === categoryFilter.toLowerCase());

  return (
    <>
      <Helmet>
        <title>Fitness Blog - Expert Training & Nutrition Advice | Smarty Gym</title>
        <meta name="description" content="Expert fitness articles by Haris Falas, Cyprus-based sports scientist. Get training tips, nutrition advice, workout guides and fitness insights for Cyprus and international athletes." />
        <meta name="keywords" content="Haris Falas, fitness blog Cyprus, training advice Cyprus, nutrition tips, strength training, functional fitness, Cyprus fitness expert, sports scientist Cyprus, workout tips Cyprus, fitness news Cyprus, gym Cyprus, smartygym Cyprus, online fitness Cyprus" />
        
        <meta property="og:title" content="Fitness Blog - Expert Training & Nutrition Advice by Haris Falas | Smarty Gym" />
        <meta property="og:description" content="Expert fitness articles by Cyprus sports scientist Haris Falas. Training tips, nutrition advice, and performance insights." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:image" content="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=1200" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Fitness Blog by Haris Falas - Smarty Gym Cyprus" />
        <meta name="twitter:description" content="Expert fitness articles by Cyprus sports scientist Haris Falas. Training tips, nutrition advice, and performance insights." />
        <meta name="twitter:image" content="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=1200" />
        
        <link rel="canonical" href={window.location.href} />
        
        {/* Structured Data for Blog */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "Smarty Gym Fitness Blog",
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
              "name": "Smarty Gym",
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

          <PageTitleCard
            title="Blog" 
            subtitle="Insights on Fitness Wellness and Nutrition"
            icon={FileText} 
          />

          <DecorativeDivider className="mb-8" />

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Button
              variant={categoryFilter === "all" ? "default" : "outline"}
              onClick={() => setCategoryFilter("all")}
              size="sm"
            >
              All
            </Button>
            <Button
              variant={categoryFilter === "fitness" ? "default" : "outline"}
              onClick={() => setCategoryFilter("fitness")}
              size="sm"
            >
              Fitness
            </Button>
            <Button
              variant={categoryFilter === "wellness" ? "default" : "outline"}
              onClick={() => setCategoryFilter("wellness")}
              size="sm"
            >
              Wellness
            </Button>
            <Button
              variant={categoryFilter === "nutrition" ? "default" : "outline"}
              onClick={() => setCategoryFilter("nutrition")}
              size="sm"
            >
              Nutrition
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <Card
                key={article.id}
                className="overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg"
                onClick={() => navigate(`/article/${article.id}`)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-3 right-3">
                    <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                      {article.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-5">
                  <h2 className="text-xl font-bold mb-2 line-clamp-2">{article.title}</h2>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{article.excerpt}</p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{article.readTime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{article.date}</span>
                    </div>
                  </div>
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
