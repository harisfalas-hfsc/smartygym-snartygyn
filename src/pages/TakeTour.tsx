import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { 
  Dumbbell, 
  Calendar, 
  Calculator, 
  Crown, 
  Sparkles, 
  TrendingUp, 
  Target,
  CheckCircle,
  Play,
  BarChart
} from "lucide-react";

const TakeTour = () => {
  const navigate = useNavigate();

  const freeFeatures = [
    {
      icon: Dumbbell,
      title: "Free Workouts",
      description: "Access standalone workout sessions without logging in",
      color: "text-blue-500"
    },
    {
      icon: Calendar,
      title: "Free Training Programs",
      description: "Explore sample training programs to get started",
      color: "text-purple-500"
    },
    {
      icon: Calculator,
      title: "Fitness Calculators",
      description: "Use our 1RM, BMR, and Macro calculators - completely free",
      color: "text-green-500"
    }
  ];

  const premiumBenefits = [
    {
      icon: Crown,
      title: "Unlimited Access",
      description: "Full access to all workouts and training programs"
    },
    {
      icon: Sparkles,
      title: "Personalized Plans",
      description: "Custom workout and diet plans tailored to your goals"
    },
    {
      icon: TrendingUp,
      title: "Save Favorites",
      description: "Save your favorite workouts and exercises for quick access"
    },
    {
      icon: BarChart,
      title: "Personal Dashboard",
      description: "Access your personalized dashboard with progress tracking"
    },
    {
      icon: Target,
      title: "Goal Setting",
      description: "Set and track your fitness milestones"
    }
  ];

  return (
    <>
      <Helmet>
        <title>Take a Tour - Discover Smarty Gym | Your Fitness Reimagined by Haris Falas</title>
        <meta name="description" content="Explore smartygym.com - convenient & flexible online fitness reimagined by Haris Falas. See how our gym works anywhere, anytime. Free workouts, premium programs & tools." />
        <meta name="keywords" content="smartygym tour, smarty gym demo, smartygym.com features, Haris Falas, gym reimagined, convenient fitness, flexible online gym, fitness anywhere anytime, online fitness tour" />
        
        <meta property="og:title" content="Take a Tour - Smarty Gym Features" />
        <meta property="og:description" content="Discover how Smarty Gym reimagines fitness - convenient, flexible training anywhere, anytime by Haris Falas" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://smartygym.com/takeatour" />
        
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content="Take a Tour - Smarty Gym" />
        <meta property="twitter:description" content="Explore smartygym.com features - fitness reimagined for convenience & flexibility" />
        
        <link rel="canonical" href="https://smartygym.com/takeatour" />
      </Helmet>

      {/* Sticky CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg">
        <div className="container mx-auto max-w-6xl px-4 py-3">
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Button 
              variant="premium"
              onClick={() => navigate("/workout")}
              className="w-full sm:w-auto"
            >
              <Play className="mr-2 h-5 w-5" />
              Start Your Fitness Experience
            </Button>
            <Button 
              variant="premium"
              onClick={() => navigate("/premiumbenefits")}
              className="w-full sm:w-auto"
            >
              <Crown className="mr-2 h-5 w-5" />
              Unlock Premium
            </Button>
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-background pb-24">
        {/* Hero Section */}
        <section className="relative py-12 px-4 bg-gradient-to-br from-primary/10 via-background to-primary/5 border-b border-border">
          <div className="container mx-auto max-w-4xl text-center space-y-6 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Welcome to <span className="text-primary">SmartyGym</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your fitness reimagined - Anywhere, anytime. Let's show you around!
            </p>
            <div className="inline-block bg-primary/20 border border-primary/30 rounded-full px-6 py-2">
              <p className="text-sm font-semibold">🎯 Science-based • 💪 Expert-designed • 🌍 Worldwide</p>
            </div>
          </div>
        </section>

        {/* How It Works - Step by Step */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">How SmartyGym Works</h2>
            
            {/* Step 1: Start Free */}
            <div className="mb-16 animate-fade-in">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold">
                  1
                </div>
                <h3 className="text-2xl font-bold">Start Without Logging In</h3>
              </div>
              
              <Card className="p-8 bg-gradient-to-br from-blue-500/10 to-background border-2 border-blue-500/20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {freeFeatures.map((feature, index) => (
                    <div key={index} className="text-center space-y-3 hover-scale">
                      <div className={`inline-block p-4 rounded-full bg-background ${feature.color}`}>
                        <feature.icon className="h-8 w-8" />
                      </div>
                      <h4 className="font-semibold text-lg">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-8 text-center">
                  <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-full px-4 py-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-semibold">No Credit Card Required • No Login Needed</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Step 2: Create Account */}
            <div className="mb-16 animate-fade-in">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold">
                  2
                </div>
                <h3 className="text-xl sm:text-2xl font-bold">Create Your Free Account</h3>
              </div>
              
              <Card className="p-8 bg-gradient-to-br from-purple-500/10 to-background border-2 border-purple-500/20">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1 space-y-4">
                    <h4 className="text-lg sm:text-xl font-semibold">Track Your Journey</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Access all free workouts and programs</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Use all fitness calculators and tools</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Explore the exercise library</span>
                      </li>
                    </ul>
                    <Button onClick={() => navigate("/auth")} className="mt-4">
                      Create Free Account
                    </Button>
                  </div>
                  <div className="flex-1">
                    <div className="bg-muted rounded-lg p-6 border-2 border-primary/20">
                      <div className="text-sm text-muted-foreground mb-2">Free Access</div>
                      <div className="space-y-3">
                        <div className="bg-background rounded p-3 border border-border">
                          <div className="flex items-center gap-3">
                            <Dumbbell className="h-5 w-5 text-primary" />
                            <div>
                              <div className="font-semibold text-sm">Free Workouts</div>
                              <div className="text-xs text-muted-foreground">No subscription needed</div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-background rounded p-3 border border-border">
                          <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-primary" />
                            <div>
                              <div className="font-semibold text-sm">Free Programs</div>
                              <div className="text-xs text-muted-foreground">Sample training plans</div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-background rounded p-3 border border-border">
                          <div className="flex items-center gap-3">
                            <Calculator className="h-5 w-5 text-primary" />
                            <div>
                              <div className="font-semibold text-sm">All Tools</div>
                              <div className="text-xs text-muted-foreground">Calculators & resources</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Step 3: Go Premium */}
            <div className="animate-fade-in">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold shadow-lg">
                  3
                </div>
                <h3 className="text-xl sm:text-2xl font-bold">Unlock Your Full Potential</h3>
              </div>
              
              <Card className="p-8 bg-gradient-to-br from-primary/10 via-background to-primary/5 border-2 border-primary/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-4 -mr-4">
                  <div className="bg-primary text-primary-foreground rounded-full px-6 py-2 rotate-12 shadow-lg">
                    <span className="font-bold">⭐ PREMIUM</span>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h4 className="text-xl sm:text-2xl font-bold mb-4">What You Get With Premium</h4>
                  <p className="text-muted-foreground mb-6">
                    Transform your fitness journey with unlimited access to everything SmartyGym offers
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {premiumBenefits.map((benefit, index) => (
                    <div key={index} className="flex gap-4 hover-scale">
                      <div className="bg-primary/20 rounded-lg p-3 h-fit">
                        <benefit.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h5 className="font-semibold mb-1">{benefit.title}</h5>
                        <p className="text-sm text-muted-foreground">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-background/50 backdrop-blur-sm rounded-lg p-6 border border-primary/20">
                  <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
                    <div className="text-center md:text-left">
                      <div className="text-sm text-muted-foreground mb-1">Gold Plan</div>
                      <div className="text-3xl font-bold mb-1">€9.99<span className="text-lg text-muted-foreground">/month</span></div>
                      <div className="text-sm text-primary font-semibold">Full access • Cancel anytime</div>
                    </div>
                    <div className="text-center md:text-left">
                      <div className="text-sm text-muted-foreground mb-1">Platinum Plan</div>
                      <div className="text-3xl font-bold mb-1">€89.99<span className="text-lg text-muted-foreground">/year</span></div>
                      <div className="text-sm text-primary font-semibold">Save 25% • Best Value</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Why Choose Smarty Gym */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">Why SmartyGym?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-6 hover-scale">
                <div className="text-4xl mb-4">🎓</div>
                <h3 className="text-xl font-bold mb-3">Expert-Designed Programs</h3>
                <p className="text-muted-foreground">
                  Created by Haris Falas, Sports Scientist & Strength and Conditioning Coach with years of experience
                </p>
              </Card>

              <Card className="p-6 hover-scale">
                <div className="text-4xl mb-4">🔬</div>
                <h3 className="text-xl font-bold mb-3">Science-Based Approach</h3>
                <p className="text-muted-foreground">
                  Every workout and program is backed by sports science and proven training principles
                </p>
              </Card>

              <Card className="p-6 hover-scale">
                <div className="text-4xl mb-4">🌍</div>
                <h3 className="text-xl font-bold mb-3">Train Anywhere</h3>
                <p className="text-muted-foreground">
                  Access your workouts from any device, any location. Your gym travels with you
                </p>
              </Card>

              <Card className="p-6 hover-scale">
                <div className="text-4xl mb-4">💰</div>
                <h3 className="text-xl font-bold mb-3">Affordable Excellence</h3>
                <p className="text-muted-foreground">
                  Premium fitness coaching at a fraction of the cost of traditional personal training
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of people worldwide who are transforming their fitness with SmartyGym
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" onClick={() => navigate("/workout")} className="w-full sm:w-auto">
                <Play className="mr-2 h-5 w-5" />
                Try Free Workout Now
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate("/about")}
                className="w-full sm:w-auto"
              >
                Learn More About Us
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default TakeTour;
