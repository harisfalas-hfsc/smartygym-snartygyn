import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Dumbbell, Apple, Heart, Clock, Calendar } from "lucide-react";
import { BackToTop } from "@/components/BackToTop";
import { ShareButtons } from "@/components/ShareButtons";

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
    id: "fitness-1",
    title: "5 Compound Movements Every Athlete Should Master",
    excerpt: "Discover the fundamental exercises that build real-world strength and functional fitness for everyday life.",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
    readTime: "5 min read",
    date: "2025-01-15",
    category: "fitness"
  },
  {
    id: "fitness-2",
    title: "Progressive Overload: The Science of Getting Stronger",
    excerpt: "Learn how to systematically increase training stimulus to achieve continuous gains in strength and muscle.",
    image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80",
    readTime: "6 min read",
    date: "2025-01-12",
    category: "fitness"
  },
  {
    id: "fitness-3",
    title: "Mobility vs Flexibility: What's the Difference?",
    excerpt: "Understanding the distinction between mobility and flexibility can transform your training approach.",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
    readTime: "4 min read",
    date: "2025-01-10",
    category: "fitness"
  },
  {
    id: "fitness-4",
    title: "Training Through Fatigue: When to Push, When to Rest",
    excerpt: "Master the art of listening to your body while maintaining consistent progress in your training.",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80",
    readTime: "5 min read",
    date: "2025-01-08",
    category: "fitness"
  },
  {
    id: "fitness-5",
    title: "Functional Training: Beyond the Gym",
    excerpt: "How to build strength that translates to real-life movements and daily activities.",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
    readTime: "6 min read",
    date: "2025-01-05",
    category: "fitness"
  }
];

const nutritionArticles: Article[] = [
  {
    id: "nutrition-1",
    title: "Protein Timing: Does It Really Matter?",
    excerpt: "Examining the science behind protein timing and what actually matters for muscle growth and recovery.",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80",
    readTime: "5 min read",
    date: "2025-01-14",
    category: "nutrition"
  },
  {
    id: "nutrition-2",
    title: "Carbs Aren't the Enemy: Understanding Energy Systems",
    excerpt: "Why carbohydrates are essential for performance and how to fuel your training properly.",
    image: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800&q=80",
    readTime: "6 min read",
    date: "2025-01-11",
    category: "nutrition"
  },
  {
    id: "nutrition-3",
    title: "Hydration for Performance: Beyond Water",
    excerpt: "The role of electrolytes, timing, and proper hydration strategies for optimal training.",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80",
    readTime: "4 min read",
    date: "2025-01-09",
    category: "nutrition"
  },
  {
    id: "nutrition-4",
    title: "Meal Prep Made Simple: A Beginner's Guide",
    excerpt: "Practical strategies for planning and preparing nutritious meals that support your fitness goals.",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80",
    readTime: "7 min read",
    date: "2025-01-07",
    category: "nutrition"
  },
  {
    id: "nutrition-5",
    title: "Supplements: What Works, What Doesn't",
    excerpt: "A science-based look at the most popular fitness supplements and their actual effectiveness.",
    image: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=800&q=80",
    readTime: "8 min read",
    date: "2025-01-04",
    category: "nutrition"
  }
];

const wellnessArticles: Article[] = [
  {
    id: "wellness-1",
    title: "Sleep and Recovery: The Missing Link in Training",
    excerpt: "Why quality sleep is just as important as your workout routine for achieving fitness goals.",
    image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&q=80",
    readTime: "5 min read",
    date: "2025-01-13",
    category: "wellness"
  },
  {
    id: "wellness-2",
    title: "Managing Stress for Better Performance",
    excerpt: "Understanding the cortisol-performance connection and practical stress management techniques.",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
    readTime: "6 min read",
    date: "2025-01-10",
    category: "wellness"
  },
  {
    id: "wellness-3",
    title: "The Mind-Muscle Connection: Training Your Brain",
    excerpt: "How mental focus and awareness can significantly improve your training results.",
    image: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&q=80",
    readTime: "5 min read",
    date: "2025-01-08",
    category: "wellness"
  },
  {
    id: "wellness-4",
    title: "Injury Prevention: Small Changes, Big Impact",
    excerpt: "Simple daily habits that can dramatically reduce your risk of training-related injuries.",
    image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&q=80",
    readTime: "6 min read",
    date: "2025-01-06",
    category: "wellness"
  },
  {
    id: "wellness-5",
    title: "Building Sustainable Fitness Habits",
    excerpt: "The psychology of habit formation and how to make fitness a natural part of your lifestyle.",
    image: "https://images.unsplash.com/photo-1507120410856-1f35574c3b45?w=800&q=80",
    readTime: "7 min read",
    date: "2025-01-03",
    category: "wellness"
  }
];

export default function Community() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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

  return (
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
            <h1 className="text-3xl sm:text-4xl font-bold text-center mb-2">Smarty Gym Blog</h1>
            <p className="text-center text-muted-foreground mb-8">
              Expert insights on fitness, nutrition, and wellness from our team
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <Card
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className="p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-gold bg-card border-border"
                  >
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-xl mb-2">{category.title}</h3>
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
            <div className="flex items-center gap-3 mb-6">
              {selectedCategoryData && (
                <>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <selectedCategoryData.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">{selectedCategoryData.title}</h1>
                    <p className="text-sm text-muted-foreground">{selectedCategoryData.description}</p>
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6">
              {selectedCategoryData?.articles.map((article) => (
                <Card key={article.id} className="overflow-hidden bg-card border-border">
                  <div className="grid md:grid-cols-[300px,1fr] gap-0">
                    <div className="relative h-48 md:h-full">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <CardHeader className="p-0 mb-4">
                        <CardTitle className="text-xl mb-2">{article.title}</CardTitle>
                        <CardDescription>{article.excerpt}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-4">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {article.readTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(article.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        <ShareButtons 
                          title={article.title} 
                          url={`${window.location.origin}/blog/${article.id}`} 
                        />
                      </CardContent>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Bottom CTA */}
        <div className="bg-card border border-border rounded-xl p-6 mt-12 text-center shadow-soft">
          <h3 className="text-xl font-semibold mb-2">Train smarter with us</h3>
          <p className="text-muted-foreground mb-4">
            Join Smarty Gym Premium for personalized programs and expert guidance
          </p>
          <Button size="lg" onClick={() => navigate("/auth")}>
            Join Premium
          </Button>
        </div>
      </div>
    </div>
  );
}
