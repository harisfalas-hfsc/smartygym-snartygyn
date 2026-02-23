import { useState, useRef } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Heart, 
  Users, 
  Sparkles,
  Crown,
  Dumbbell,
  Calendar,
  CheckCircle2,
  BookOpen,
  BarChart3,
  TrendingUp,
  ArrowRight,
  UserCheck
} from "lucide-react";
import { useShowBackButton } from "@/hooks/useShowBackButton";
import { SEOEnhancer } from "@/components/SEOEnhancer";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";

export default function HumanPerformance() {
  const { canGoBack, goBack } = useShowBackButton();

  return (
    <>
      <Helmet>
        <title>Why SmartyGym | Your Complete Fitness Ecosystem | SmartyGym</title>
        <meta name="description" content="Discover why SmartyGym provides a complete ecosystem to succeed with daily workouts, structured programs, Smarty Rituals, and expert guidance. Research-backed insights on how structured fitness transforms your life." />
        <meta name="keywords" content="why SmartyGym, fitness ecosystem, daily workouts, structured workout programs, Smarty Rituals, personal trainer app, SmartyGym" />
        
        <meta property="og:title" content="Why SmartyGym | Your Complete Fitness Ecosystem" />
        <meta property="og:description" content="SmartyGym provides a complete ecosystem to succeed with daily workouts, structured programs, and expert guidance. Like having a personal trainer in your pocket." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://smartygym.com/human-performance" />
        
        <link rel="canonical" href="https://smartygym.com/human-performance" />
      </Helmet>

      <SEOEnhancer
        entities={["SmartyGym Ecosystem", "Fitness Platform", "Personal Training"]}
        topics={["fitness ecosystem", "daily workouts", "structured training", "Smarty Rituals", "fitness accountability"]}
        expertise={["fitness coaching", "workout programming", "fitness technology"]}
        contentType="Landing Page"
        aiSummary="Why SmartyGym is your complete fitness ecosystem - daily workouts, structured programs, Smarty Rituals, check-ins, and expert guidance all in one platform."
        aiKeywords={["SmartyGym", "fitness ecosystem", "daily workouts", "personal trainer app", "structured training"]}
        relatedContent={["Smarty Workouts", "Smarty Programs", "Smarty Rituals", "Premium Benefits"]}
        targetAudience="individuals seeking a complete, structured fitness solution with daily guidance"
        pageType="Article"
      />

      <div className="min-h-screen bg-background">
        <main className="container mx-auto max-w-6xl px-4 pb-8">
          {canGoBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={goBack}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="text-xs sm:text-sm">Back</span>
            </Button>
          )}

          <PageBreadcrumbs items={[
            { label: "Home", href: "/" },
            { label: "Why SmartyGym" }
          ]} />

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Sparkles className="h-8 w-8 text-primary" />
              <h1 className="text-3xl sm:text-4xl font-bold">Why SmartyGym</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Your complete fitness ecosystem for lasting transformation
            </p>
          </div>

          {/* Complete Ecosystem Hero Card */}
          <Card className="mb-8 border-2 border-primary bg-gradient-to-br from-primary/10 via-primary/5 to-background">
            <CardHeader className="text-center pb-2">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl sm:text-3xl">
                <Crown className="h-7 w-7 text-primary" />
                Your Complete Fitness Ecosystem
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Everything you need to succeed, all in one place
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-center text-lg font-medium">
                <span className="text-primary font-bold">SmartyGym</span> provides you with a <span className="text-primary font-bold">complete ecosystem</span> to succeed.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 100% Human Card - First in grid */}
                <div className="flex items-start gap-3 p-4 bg-background/50 rounded-lg border border-red-500/30 md:col-span-2">
                  <div className="p-2 bg-red-500/20 rounded-full flex-shrink-0">
                    <UserCheck className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-500">100% Human. 0% AI.</h3>
                    <p className="text-sm text-muted-foreground">
                      Unlike other fitness apps, <span className="text-primary font-bold">SmartyGym</span> workouts and training programs are crafted and designed by{" "}
                      <Link to="/coach-profile" className="text-primary font-bold hover:underline">
                        Haris Falas
                      </Link>, a certified fitness trainer and wellness coach.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-background/50 rounded-lg border border-primary/20">
                  <div className="p-2 bg-primary/20 rounded-full flex-shrink-0">
                    <Dumbbell className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Daily Fresh Workouts</h3>
                    <p className="text-sm text-muted-foreground">Every single day, you receive two fresh workouts designed by a certified coach.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-background/50 rounded-lg border border-primary/20">
                  <div className="p-2 bg-primary/20 rounded-full flex-shrink-0">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Structured Training Programs</h3>
                    <p className="text-sm text-muted-foreground">Multi-week programs tailored to every goal and fitness level.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-background/50 rounded-lg border border-primary/20">
                  <div className="p-2 bg-primary/20 rounded-full flex-shrink-0">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Daily Smarty Rituals</h3>
                    <p className="text-sm text-muted-foreground">Movement and recovery protocols for morning, midday, and evening.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-background/50 rounded-lg border border-primary/20">
                  <div className="p-2 bg-primary/20 rounded-full flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Smarty Check-ins</h3>
                    <p className="text-sm text-muted-foreground">Daily accountability to keep you on track and measure your readiness.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-background/50 rounded-lg border border-primary/20">
                  <div className="p-2 bg-primary/20 rounded-full flex-shrink-0">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Expert Blog Articles</h3>
                    <p className="text-sm text-muted-foreground">Knowledge from fitness experts to help you train smarter.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-background/50 rounded-lg border border-primary/20">
                  <div className="p-2 bg-primary/20 rounded-full flex-shrink-0">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Supportive Community</h3>
                    <p className="text-sm text-muted-foreground">Connect with like-minded people for motivation and support.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-background/50 rounded-lg border border-primary/20 md:col-span-2">
                  <div className="p-2 bg-primary/20 rounded-full flex-shrink-0">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Personal LogBook</h3>
                    <p className="text-sm text-muted-foreground">Visual analytics and weekly progress reports to track your journey.</p>
                  </div>
                </div>
              </div>
              
              <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/30">
                <p className="text-base font-medium">
                  It's like having a <span className="text-primary font-bold">complete personal trainer in your pocket</span> — one that keeps you accountable, motivated, and constantly improving.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Why Invest Card - Compact */}
          <Card className="mb-8 border border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Heart className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">
                  Why Invest in <span className="text-primary font-bold">SmartyGym</span>?
                </h3>
              </div>
              <p className="text-center text-muted-foreground text-sm">
                In a world of endless fitness advice, finding a structured path to real results has never been harder. 
                Discover why expert-designed, human-crafted fitness programs deliver transformative results—and how{" "}
                <span className="text-primary font-bold">SmartyGym</span> provides the ecosystem you need to elevate every aspect of your performance.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
                <Link 
                  to="/why-invest-in-smartygym" 
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm transition-colors"
                >
                  Why Invest in SmartyGym
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link 
                  to="/best-online-fitness-platform" 
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm transition-colors"
                >
                  Why We Are the Best
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-background">
            <CardContent className="p-6 text-center">
              <Crown className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Ready to Transform Your Performance?</h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Join thousands who have elevated their work, family life, and wellbeing with <span className="text-primary font-bold">SmartyGym</span>'s expert-designed ecosystem.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="gap-2">
                  <Link to="/joinpremium">
                    <Crown className="h-5 w-5" />
                    Start Your Journey
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="gap-2">
                  <Link to="/workout">
                    <Dumbbell className="h-5 w-5" />
                    Browse Workouts
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

        </main>
      </div>
    </>
  );
}
