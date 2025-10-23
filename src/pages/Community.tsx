import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Star, Trophy, Award, Target, CheckCircle2 } from "lucide-react";
import { BackToTop } from "@/components/BackToTop";
import { useShowBackButton } from "@/hooks/useShowBackButton";
import { useAccessControl } from "@/hooks/useAccessControl";

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

interface LeaderboardMember {
  id: string;
  nickname: string;
  monthsSubscribed: number;
  plan: "Gold" | "Platinum";
  workoutsStarted: number;
  workoutsCompleted: number;
  programsStarted: number;
  programsCompleted: number;
  favoriteCount: number;
}

// Mock data for initial display
const mockLeaderboard: LeaderboardMember[] = [
  {
    id: "1",
    nickname: "IronWarrior",
    monthsSubscribed: 18,
    plan: "Platinum",
    workoutsStarted: 245,
    workoutsCompleted: 210,
    programsStarted: 12,
    programsCompleted: 9,
    favoriteCount: 34
  },
  {
    id: "2",
    nickname: "FitnessFanatic",
    monthsSubscribed: 14,
    plan: "Gold",
    workoutsStarted: 189,
    workoutsCompleted: 165,
    programsStarted: 8,
    programsCompleted: 6,
    favoriteCount: 28
  },
  {
    id: "3",
    nickname: "PowerLifter89",
    monthsSubscribed: 22,
    plan: "Platinum",
    workoutsStarted: 312,
    workoutsCompleted: 287,
    programsStarted: 15,
    programsCompleted: 13,
    favoriteCount: 42
  },
  {
    id: "4",
    nickname: "CardioQueen",
    monthsSubscribed: 10,
    plan: "Gold",
    workoutsStarted: 156,
    workoutsCompleted: 142,
    programsStarted: 7,
    programsCompleted: 5,
    favoriteCount: 21
  },
  {
    id: "5",
    nickname: "BeastMode",
    monthsSubscribed: 16,
    plan: "Platinum",
    workoutsStarted: 234,
    workoutsCompleted: 201,
    programsStarted: 11,
    programsCompleted: 8,
    favoriteCount: 31
  },
  {
    id: "6",
    nickname: "FlexMaster",
    monthsSubscribed: 8,
    plan: "Gold",
    workoutsStarted: 123,
    workoutsCompleted: 108,
    programsStarted: 5,
    programsCompleted: 4,
    favoriteCount: 18
  }
];

export default function Community() {
  const navigate = useNavigate();
  const { canGoBack, goBack } = useShowBackButton();
  const { userTier, isLoading: accessLoading } = useAccessControl();
  
  // Show loading state while checking access
  if (accessLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading community...</p>
        </div>
      </div>
    );
  }
  
  // Premium members see leaderboard, everyone sees reviews
  const showLeaderboard = userTier === "premium";

  return (
    <>
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
          
          {/* Leaderboard / Competition Card - Only visible to Premium Members */}
          {showLeaderboard && (
            <Card className="mb-8 border-2 border-primary/30 bg-primary/5">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Trophy className="h-8 w-8 text-primary" />
                <div>
                  <h2 className="text-2xl font-bold">Community Leaderboard</h2>
                  <p className="text-sm text-muted-foreground">Top performers and their achievements</p>
                </div>
              </div>
              
              <div className="max-h-[400px] overflow-y-auto">
                <div className="space-y-3">
                  {mockLeaderboard.map((member, index) => (
                    <div 
                      key={member.id}
                      className="bg-background rounded-lg p-4 border border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2 min-w-[120px]">
                          {index < 3 && (
                            <Award className={`h-5 w-5 ${
                              index === 0 ? 'text-yellow-500' : 
                              index === 1 ? 'text-gray-400' : 
                              'text-amber-600'
                            }`} />
                          )}
                          <span className="font-bold text-lg">{member.nickname}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                            member.plan === 'Platinum' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-amber-500 text-white'
                          }`}>
                            {member.plan} Member
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {member.monthsSubscribed} months
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-primary" />
                          <div>
                            <p className="text-xs text-muted-foreground">Workouts</p>
                            <p className="font-semibold">{member.workoutsCompleted}/{member.workoutsStarted}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          <div>
                            <p className="text-xs text-muted-foreground">Programs</p>
                            <p className="font-semibold">{member.programsCompleted}/{member.programsStarted}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-primary fill-primary" />
                          <div>
                            <p className="text-xs text-muted-foreground">Favorites</p>
                            <p className="font-semibold">{member.favoriteCount}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-primary" />
                          <div>
                            <p className="text-xs text-muted-foreground">Completion</p>
                            <p className="font-semibold">
                              {Math.round((member.workoutsCompleted / member.workoutsStarted) * 100)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
          )}
          
          {/* Reviews Container */}
          <Card className="mb-12 p-6">
            <div className="max-h-[600px] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.map((review) => (
                  <div 
                    key={review.id}
                    className="p-6 bg-muted rounded-lg hover:shadow-lg transition-all duration-300 flex flex-col"
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
                  </div>
                ))}
              </div>
            </div>
          </Card>

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
    </>
  );
}
