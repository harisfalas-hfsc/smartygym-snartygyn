import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Star } from "lucide-react";
import { BackToTop } from "@/components/BackToTop";
import { useShowBackButton } from "@/hooks/useShowBackButton";
import { AccessGate } from "@/components/AccessGate";

interface Review {
  id: string;
  name: string;
  role: string;
  age?: number;
  review: string;
  emoji: string;
}

const reviews: Review[] = [
  {
    id: "1",
    name: "Maria",
    role: "Busy Businesswoman",
    age: 42,
    emoji: "💼",
    review: "Between meetings, deadlines, and family, I never had time for the gym. With Smarty Gym, I train at home or in hotels when I travel. It's like having a personal trainer in my pocket — smart, flexible, and perfect for my schedule."
  },
  {
    id: "2",
    name: "Jamal",
    role: "Athlete",
    age: 27,
    emoji: "🏋️",
    review: "As a competitive athlete, I need structure, not random workouts. Smarty Gym gives me programs that are science-backed, progressive, and actually improve my performance. This isn't just another app — it's a real gym, just smarter."
  },
  {
    id: "3",
    name: "Sofia",
    role: "University Student",
    age: 19,
    emoji: "👩‍🎓",
    review: "I don't have money for expensive gyms or personal trainers. Smarty Gym is affordable and fun, and I can train anywhere on campus. Honestly, it's the best investment I've made for my health."
  },
  {
    id: "4",
    name: "George",
    role: "Father of Two",
    age: 50,
    emoji: "👨‍👩‍👧",
    review: "I always thought gyms were for young people. But Smarty Gym proved me wrong. The workouts are safe, clear, and effective. My energy levels are up, and I feel 10 years younger. Even my kids join in sometimes!"
  },
  {
    id: "5",
    name: "Aisha",
    role: "Freelancer & Traveler",
    age: 35,
    emoji: "🌍",
    review: "I work from different countries, so sticking to a gym routine was impossible. Smarty Gym travels with me. Whether I'm in a hotel room or on a beach, I just open the app and start. It feels like freedom."
  },
  {
    id: "6",
    name: "Daniel",
    role: "Retired Engineer",
    age: 60,
    emoji: "🧑‍🔧",
    review: "I used to think online fitness wasn't for people my age. But Smarty Gym is simple, motivating, and surprisingly personal. I feel stronger, my back pain is gone, and I'm more active than ever."
  },
  {
    id: "7",
    name: "Alex",
    role: "Marketing Professional",
    emoji: "💻",
    review: "Smarty Gym has transformed how I approach fitness. The workouts are challenging but doable, and I love that I can do them anywhere!"
  },
  {
    id: "8",
    name: "Sarah",
    role: "Teacher",
    emoji: "📚",
    review: "Finally, a fitness platform that actually understands real people's needs. No gimmicks, just solid training."
  },
  {
    id: "9",
    name: "Michael",
    role: "Small Business Owner",
    emoji: "🏪",
    review: "The flexibility Smarty Gym offers is incredible. I can fit workouts around my unpredictable schedule, and the quality is top-notch."
  },
  {
    id: "10",
    name: "Lisa",
    role: "Nurse",
    emoji: "⚕️",
    review: "Working long shifts, I need efficient workouts. Smarty Gym delivers exactly that — science-based, effective, and convenient."
  },
  {
    id: "11",
    name: "David",
    role: "Software Developer",
    emoji: "👨‍💻",
    review: "The structured programs and clear instructions make it easy to stay consistent. I've seen real results in just a few months."
  },
  {
    id: "12",
    name: "Emma",
    role: "Graphic Designer",
    emoji: "🎨",
    review: "Love the variety and creativity in the workouts. It never gets boring, and I always feel challenged in the best way."
  }
];

export default function Community() {
  const navigate = useNavigate();
  const { canGoBack, goBack } = useShowBackButton();

  return (
    <AccessGate requireAuth={true} requirePremium={false} contentType="feature">
      <Helmet>
        <title>Community Reviews - Smarty Gym | What Our Members Say</title>
        <meta name="description" content="Read real reviews from Smarty Gym members. See how our science-based workouts have transformed the fitness journeys of people from all walks of life." />
        <meta name="keywords" content="smarty gym reviews, fitness testimonials, customer reviews, gym reviews Cyprus, online fitness reviews" />
        
        <meta property="og:title" content="Community Reviews - Smarty Gym" />
        <meta property="og:description" content="Real reviews from Smarty Gym members worldwide" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://smartygym.com/community" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Community Reviews - Smarty Gym" />
        <meta name="twitter:description" content="Real reviews from Smarty Gym members worldwide" />
        
        <link rel="canonical" href="https://smartygym.com/community" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <BackToTop />
        
        <div className="container mx-auto max-w-6xl px-4 py-8">
          {canGoBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={goBack}
              className="mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="text-xs sm:text-sm">Back</span>
            </Button>
          )}
          
          <header className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">What Our Community Says</h1>
            <p className="text-center text-muted-foreground mb-4">
              Real people, real results — trusted by hundreds worldwide
            </p>
            
            {/* Info Ribbon */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-8 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Join our growing community of satisfied members — start your fitness journey today
              </p>
              <Button variant="default" size="sm" onClick={() => navigate("/premiumbenefits")}>
                Join Premium
              </Button>
            </div>
          </header>
          
          {/* Reviews Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {reviews.map((review) => (
              <Card 
                key={review.id}
                className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 flex flex-col"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="text-3xl" aria-hidden="true">{review.emoji}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {review.name}{review.age && `, ${review.age}`}
                    </h3>
                    <p className="text-sm text-muted-foreground">{review.role}</p>
                  </div>
                </div>
                
                <div className="flex gap-1 mb-3" aria-label="5 star rating">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                
                <p className="text-sm text-muted-foreground italic leading-relaxed">
                  "{review.review}"
                </p>
              </Card>
            ))}
          </section>

          {/* Bottom CTA */}
          <aside className="bg-card border border-border rounded-xl p-8 text-center shadow-soft">
            <h2 className="text-2xl font-bold mb-2">Ready to Join Our Community?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Experience the same transformation as our members. Get access to science-based workouts, 
              structured programs, and expert guidance designed by Haris Falas.
            </p>
            <div className="flex flex-col items-center gap-2">
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Button size="lg" onClick={() => navigate("/workout")}>
                  Try Free Workout
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/premiumbenefits")}>
                  Join Premium
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AccessGate>
  );
}
