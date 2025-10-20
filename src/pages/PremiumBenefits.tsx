import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  Check, 
  Dumbbell, 
  Calendar, 
  Calculator,
  BookOpen,
  Users,
  ArrowLeft,
  Zap,
  TrendingUp,
  Heart,
  Target
} from "lucide-react";

export default function PremiumBenefits() {
  const navigate = useNavigate();

  const benefits = [
    { icon: Dumbbell, title: "Unlimited Workouts", description: "Access to all personalized workout plans" },
    { icon: Calendar, title: "Training Programs", description: "Structured 6-8 week programs by experts" },
    { icon: Heart, title: "Track Favorites", description: "Save and organize your favorite workouts" },
    { icon: TrendingUp, title: "Progress Tracking", description: "Monitor completed workouts and achievements" },
    { icon: Target, title: "Goal Setting", description: "Set and track your fitness goals" },
    { icon: BookOpen, title: "Exercise Library", description: "Complete exercise database with videos" },
    { icon: Calculator, title: "Fitness Tools", description: "BMR, 1RM, and macro calculators with history" },
    { icon: Users, title: "Community Access", description: "Connect with other fitness enthusiasts" },
    { icon: Zap, title: "Priority Support", description: "Get help when you need it" }
  ];

  const yearlyBenefits = [
    "Save €29.89 (25% off) compared to monthly",
    "Only €7.50 per month when paid annually",
    "Lock in your rate for 12 months",
    "Best value for committed users",
    "Full access to all features"
  ];

  return (
    <>
      <Helmet>
        <title>Premium Benefits | Smarty Gym</title>
        <meta name="description" content="Discover what you get with Smarty Gym Premium - unlimited workouts, training programs, and exclusive fitness tools." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <main className="container mx-auto max-w-7xl p-4 py-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="text-xs sm:text-sm">Back to Home</span>
          </Button>

          <div className="text-center mb-8">
            <Crown className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">Transform Your Fitness Journey</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of members who've upgraded to premium and achieved their fitness goals
            </p>
          </div>

          {/* What You Get */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">What You Get with Premium</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                    <div className="p-2 bg-primary/10 rounded-full shrink-0">
                      <benefit.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Why Choose Yearly */}
          <Card className="mb-8 border-2 border-primary">
            <CardHeader className="bg-primary/5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Why Choose the Yearly Plan?</CardTitle>
                <Badge className="bg-green-600 text-white">BEST VALUE</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-4">Save Big with Annual Membership</h3>
                  <div className="space-y-3">
                    {yearlyBenefits.map((benefit, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                        <span className="text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-primary/5 rounded-lg p-6 flex flex-col justify-center">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Monthly Plan</p>
                    <div className="text-2xl font-bold line-through text-muted-foreground mb-2">
                      €9.99 × 12 = €119.88
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">per year</p>
                    
                    <div className="my-4 border-t border-border"></div>
                    
                    <p className="text-sm text-muted-foreground mb-2">Annual Plan (Save 25%)</p>
                    <div className="text-4xl font-bold text-primary mb-2">
                      €89.99
                    </div>
                    <p className="text-sm text-green-600 font-semibold">
                      You save €29.89!
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center gap-4">
            <Button 
              size="lg" 
              className="w-full max-w-md text-lg py-6"
              onClick={() => navigate("/join-premium")}
            >
              <Crown className="mr-2 h-5 w-5" />
              Choose Your Plan
            </Button>
            <p className="text-sm text-muted-foreground">
              Cancel anytime • No hidden fees • Secure payment
            </p>
          </div>

          {/* Testimonials */}
          <Card className="mt-12">
            <CardHeader>
              <CardTitle>What Our Premium Members Say</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="h-4 w-4 fill-yellow-500" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm italic mb-2">
                    "The yearly plan was the best investment I made in my fitness journey. Totally worth it!"
                  </p>
                  <p className="text-xs text-muted-foreground">— Sarah M., Gold Member</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="h-4 w-4 fill-yellow-500" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm italic mb-2">
                    "I've tried 3 months and the progress tracking features helped me stay consistent."
                  </p>
                  <p className="text-xs text-muted-foreground">— Michael T., Platinum Member</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="h-4 w-4 fill-yellow-500" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm italic mb-2">
                    "Great value for money, especially with the annual plan. Highly recommend!"
                  </p>
                  <p className="text-xs text-muted-foreground">— Emma L., Platinum Member</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
}
