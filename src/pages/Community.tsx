import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Dumbbell, Apple, Heart, Clock, Calendar, Filter } from "lucide-react";
import { BackToTop } from "@/components/BackToTop";
import { ShareButtons } from "@/components/ShareButtons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  readTime: string;
  date: string;
  category: string;
}

const fitnessArticles: Article[] = [
  {
    id: "1",
    title: "Building Muscle: The Complete Guide",
    excerpt: "Everything you need to know about gaining muscle mass effectively",
    image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=800",
    readTime: "8 min read",
    date: "March 15, 2024",
    category: "Fitness"
  },
  {
    id: "2",
    title: "HIIT vs Steady State Cardio",
    excerpt: "Which cardio method is best for your fitness goals?",
    image: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&q=80&w=800",
    readTime: "6 min read",
    date: "March 12, 2024",
    category: "Fitness"
  },
  {
    id: "3",
    title: "Perfect Form: Squat Technique",
    excerpt: "Master the king of all exercises with proper technique",
    image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80&w=800",
    readTime: "7 min read",
    date: "March 10, 2024",
    category: "Fitness"
  },
  {
    id: "4",
    title: "Recovery Strategies for Athletes",
    excerpt: "Optimize your recovery to maximize performance gains",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800",
    readTime: "9 min read",
    date: "March 8, 2024",
    category: "Fitness"
  },
  {
    id: "5",
    title: "Mobility Work: Why It Matters",
    excerpt: "Improve movement quality and prevent injuries",
    image: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?auto=format&fit=crop&q=80&w=800",
    readTime: "6 min read",
    date: "March 5, 2024",
    category: "Fitness"
  }
];

const nutritionArticles: Article[] = [
  {
    id: "6",
    title: "Meal Prep for Busy People",
    excerpt: "Save time and eat healthy with strategic meal preparation",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800",
    readTime: "8 min read",
    date: "March 14, 2024",
    category: "Nutrition"
  },
  {
    id: "7",
    title: "Macro Tracking Made Simple",
    excerpt: "Learn how to track macronutrients effectively",
    image: "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?auto=format&fit=crop&q=80&w=800",
    readTime: "7 min read",
    date: "March 11, 2024",
    category: "Nutrition"
  },
  {
    id: "8",
    title: "Pre and Post Workout Nutrition",
    excerpt: "Fuel your workouts and optimize recovery with proper timing",
    image: "https://images.unsplash.com/photo-1547496502-affa22d38842?auto=format&fit=crop&q=80&w=800",
    readTime: "6 min read",
    date: "March 9, 2024",
    category: "Nutrition"
  },
  {
    id: "9",
    title: "Healthy Fats: The Complete Guide",
    excerpt: "Understanding the role of fats in your diet",
    image: "https://images.unsplash.com/photo-1447078806655-40579c2520d6?auto=format&fit=crop&q=80&w=800",
    readTime: "7 min read",
    date: "March 6, 2024",
    category: "Nutrition"
  },
  {
    id: "10",
    title: "Hydration: Beyond Water",
    excerpt: "Optimize your hydration strategy for peak performance",
    image: "https://images.unsplash.com/photo-1627308595171-d1b5d67129c4?auto=format&fit=crop&q=80&w=800",
    readTime: "6 min read",
    date: "March 3, 2024",
    category: "Nutrition"
  }
];

const wellnessArticles: Article[] = [
  {
    id: "11",
    title: "Managing Stress for Better Health",
    excerpt: "Understanding the mind-body connection in fitness",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800",
    readTime: "8 min read",
    date: "March 13, 2024",
    category: "Wellness"
  },
  {
    id: "12",
    title: "Sleep Optimization for Athletes",
    excerpt: "Maximize recovery and performance through better sleep",
    image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80&w=800",
    readTime: "9 min read",
    date: "March 7, 2024",
    category: "Wellness"
  },
  {
    id: "13",
    title: "Building Sustainable Fitness Habits",
    excerpt: "Create lasting change with habit-focused strategies",
    image: "https://images.unsplash.com/photo-1533681904393-9ab6eee7e408?auto=format&fit=crop&q=80&w=800",
    readTime: "7 min read",
    date: "March 4, 2024",
    category: "Wellness"
  },
  {
    id: "14",
    title: "Injury Prevention Strategies",
    excerpt: "Stay healthy and train consistently with smart prevention",
    image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&q=80&w=800",
    readTime: "8 min read",
    date: "March 2, 2024",
    category: "Wellness"
  },
  {
    id: "15",
    title: "The Mind-Muscle Connection",
    excerpt: "Enhance your workouts through focused intention",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=800",
    readTime: "6 min read",
    date: "March 1, 2024",
    category: "Wellness"
  }
];

export default function Community() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<string>("newest");

  const categories = [
    {
      id: "fitness",
      title: "Fitness",
      description: "Training, workouts, and strength building",
      icon: Dumbbell,
      articles: fitnessArticles
    },
    {
      id: "nutrition",
      title: "Nutrition",
      description: "Diet plans, meal prep, and nutrition tips",
      icon: Apple,
      articles: nutritionArticles
    },
    {
      id: "wellness",
      title: "Wellness",
      description: "Health news, recovery, and lifestyle",
      icon: Heart,
      articles: wellnessArticles
    }
  ];

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);

  // Sort articles based on selected order
  const sortedArticles = useMemo(() => {
    if (!selectedCategoryData) return [];
    
    const articles = [...selectedCategoryData.articles];
    
    switch (sortOrder) {
      case "newest":
        return articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      case "oldest":
        return articles.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      case "shortest":
        return articles.sort((a, b) => {
          const aTime = parseInt(a.readTime);
          const bTime = parseInt(b.readTime);
          return aTime - bTime;
        });
      case "longest":
        return articles.sort((a, b) => {
          const aTime = parseInt(a.readTime);
          const bTime = parseInt(b.readTime);
          return bTime - aTime;
        });
      default:
        return articles;
    }
  }, [selectedCategoryData, sortOrder]);

  // SEO metadata
  const pageTitle = selectedCategory 
    ? `${selectedCategoryData?.title} Articles - Smarty Gym Blog`
    : "Smarty Gym Blog - Fitness, Nutrition & Wellness Articles";
  
  const pageDescription = selectedCategory
    ? `Explore expert ${selectedCategoryData?.title.toLowerCase()} articles covering ${selectedCategoryData?.description.toLowerCase()}. Get professional insights and tips from Smarty Gym.`
    : "Expert insights on fitness training, nutrition plans, and wellness strategies from Smarty Gym. Read our comprehensive guides to achieve your health and fitness goals.";

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="fitness blog, workout articles, nutrition tips, wellness guides, training programs, exercise library, health advice" />
        
        {/* Open Graph tags for social sharing */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:site_name" content="Smarty Gym" />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <BackToTop />
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => selectedCategory ? setSelectedCategory(null) : navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span className="text-xs sm:text-sm">{selectedCategory ? "Back to Categories" : "Back to Home"}</span>
        </Button>
        
        {!selectedCategory ? (
          <>
            <header className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">Smarty Gym Blog</h1>
              <p className="text-muted-foreground">
                Expert insights on fitness, nutrition, and wellness from our team
              </p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <Card
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setSortOrder("newest");
                    }}
                    className="p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-gold bg-card border-border"
                    role="button"
                    tabIndex={0}
                    aria-label={`View ${category.title} articles`}
                  >
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center" aria-hidden="true">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <h2 className="font-semibold text-xl mb-2">{category.title}</h2>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                        <p className="text-xs text-muted-foreground mt-3">
                          {category.articles.length} articles
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <header className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  {selectedCategoryData && (
                    <>
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center" aria-hidden="true">
                        <selectedCategoryData.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">{selectedCategoryData.title} Articles</h1>
                        <p className="text-sm text-muted-foreground">{selectedCategoryData.description}</p>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Filter Dropdown */}
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger className="w-[180px]" aria-label="Sort articles">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border z-50">
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="shortest">Shortest Read</SelectItem>
                      <SelectItem value="longest">Longest Read</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-label={`${selectedCategoryData?.title} articles`}>
              {sortedArticles.map((article) => (
                <article 
                  key={article.id}
                  className="group"
                >
                  <Card 
                    className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 flex flex-col h-full cursor-pointer"
                    onClick={() => navigate(`/article/${article.id}`)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Read article: ${article.title}`}
                  >
                    <div className="aspect-video w-full overflow-hidden">
                      <img 
                        src={article.image} 
                        alt={`${article.title} - ${article.category} article illustration showing ${article.excerpt}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{article.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4 flex-grow line-clamp-3">{article.excerpt}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" aria-hidden="true" />
                          <time>{article.readTime}</time>
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" aria-hidden="true" />
                          <time dateTime={article.date}>{article.date}</time>
                        </span>
                      </div>
                      <div className="mt-auto" onClick={(e) => e.stopPropagation()}>
                        <ShareButtons 
                          title={article.title} 
                          url={`${window.location.origin}/article/${article.id}`} 
                        />
                      </div>
                    </div>
                  </Card>
                </article>
              ))}
            </section>
          </>
        )}

        {/* Bottom CTA */}
        <aside className="bg-card border border-border rounded-xl p-6 mt-12 text-center shadow-soft">
          <h2 className="text-xl font-semibold mb-2">Train Smarter With Us</h2>
          <p className="text-muted-foreground mb-4">
            Join Smarty Gym Premium for personalized programs and expert guidance
          </p>
          <Button size="lg" onClick={() => navigate("/auth")} aria-label="Join Smarty Gym Premium">
            Join Premium
          </Button>
        </aside>
      </div>
    </div>
    </>
  );
}
