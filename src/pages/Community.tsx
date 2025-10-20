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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedCategoryData?.articles.map((article) => (
                <Card 
                  key={article.id} 
                  className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 flex flex-col h-full cursor-pointer"
                  onClick={() => navigate(`/article/${article.id}`)}
                >
                  <div className="aspect-video w-full overflow-hidden">
                    <img 
                      src={article.image} 
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{article.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 flex-grow line-clamp-3">{article.excerpt}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {article.readTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {article.date}
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
