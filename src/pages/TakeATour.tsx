import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Heart, 
  Dumbbell,
  Calendar,
  Sparkles,
  BookOpen,
  BarChart3,
  CheckCircle2,
  Check,
  Clock,
  Target,
  Sunrise,
  Sun,
  Moon,
  Crown,
  Zap,
  Brain,
  TrendingUp,
  Timer,
  Flame,
  Activity,
  User,
  Trophy
} from "lucide-react";
import { useShowBackButton } from "@/hooks/useShowBackButton";
import { SEOEnhancer } from "@/components/SEOEnhancer";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";

export default function TakeATour() {
  const { canGoBack, goBack } = useShowBackButton();

  const workoutCategories = [
    { name: "Strength", icon: <Dumbbell className="h-4 w-4" /> },
    { name: "Calorie Burning", icon: <Flame className="h-4 w-4" /> },
    { name: "Metabolic", icon: <Zap className="h-4 w-4" /> },
    { name: "Cardio", icon: <Activity className="h-4 w-4" /> },
    { name: "Mobility & Stability", icon: <Target className="h-4 w-4" /> },
    { name: "Challenge", icon: <Trophy className="h-4 w-4" /> },
  ];

  const programCategories = [
    "Cardio Endurance",
    "Functional Strength", 
    "Muscle Hypertrophy",
    "Weight Loss",
    "Low Back Pain Relief",
    "Mobility & Stability"
  ];

  return (
    <>
      <Helmet>
        <title>Take a Tour | Discover SmartyGym Features | SmartyGym</title>
        <meta name="description" content="Explore SmartyGym's complete fitness ecosystem: daily workouts, training programs, Smarty Rituals, progress tracking, and subscription plans. Your guide to getting started." />
        <meta name="keywords" content="SmartyGym tour, fitness app features, workout app guide, training programs, smarty ritual, fitness tracking" />
        
        <meta property="og:title" content="Take a Tour | Discover SmartyGym" />
        <meta property="og:description" content="Your complete guide to the SmartyGym ecosystem - workouts, programs, rituals, and progress tracking." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://smartygym.com/takeatour" />
        
        <link rel="canonical" href="https://smartygym.com/takeatour" />
      </Helmet>

      <SEOEnhancer
        entities={["SmartyGym Tour", "Fitness Features", "Workout Guide"]}
        topics={["fitness app tour", "workout features", "training programs", "progress tracking", "wellness rituals"]}
        expertise={["fitness coaching", "workout programming", "wellness protocols"]}
        contentType="Guide"
        aiSummary="A comprehensive tour of SmartyGym's features including daily workouts, multi-week training programs, Smarty Rituals, and progress tracking tools."
        aiKeywords={["SmartyGym", "fitness tour", "workout features", "training programs", "smarty ritual"]}
        relatedContent={["Smarty Workouts", "Smarty Programs", "Daily Ritual", "User Dashboard"]}
        targetAudience="individuals exploring SmartyGym's fitness ecosystem"
        pageType="Guide"
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
            { label: "Take a Tour" }
          ]} />

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Target className="h-8 w-8 text-primary" />
              <h1 className="text-3xl sm:text-4xl font-bold">
                Take a <span className="text-primary">Tour</span>
              </h1>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover everything SmartyGym has to offer
            </p>
          </div>

          {/* Section 1: What is SmartyGym? */}
          <Card className="mb-6 border-2 border-primary/30">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                What is SmartyGym?
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-center text-muted-foreground">
                In a world of endless fitness advice on YouTube, conflicting information on social media, and generic gym memberships 
                that lead nowhere, finding a structured path to real results has never been harder. <span className="text-primary font-bold">SmartyGym</span> provides the 
                ecosystem you need to elevate every aspect of your performance—anywhere, anytime.
              </p>
              <p className="text-center text-muted-foreground mt-4">
                Your body is your greatest asset. <span className="text-primary font-bold whitespace-nowrap">SmartyGym is your Gym Re-imagined</span>: expert-designed workouts, 
                structured training programs, and a complete wellness ecosystem that keeps you consistent and motivated.
              </p>
            </CardContent>
          </Card>

          {/* Section 2: Workout of the Day */}
          <Card className="mb-6 border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-primary" />
                The Workout of the Day (WOD)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                After you log in, you're greeted with today's fresh workout—the <strong>Workout of the Day</strong>. 
                This isn't random; it's part of a carefully designed periodization system rooted in sports science.
              </p>

              {/* Periodization Explanation */}
              <div className="bg-muted/30 rounded-lg p-4 border border-border">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  The Science of Periodization
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span><strong>Smart Periodization:</strong> Science-based category rotation designed for optimal results and balanced fitness development</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span><strong>Difficulty Rotation:</strong> Stars cycle from 1-6, ensuring progressive challenge</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span><strong>Smart Scheduling:</strong> Strategic training that targets different energy systems for structured and science-based progress.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span><strong>Two Options Daily:</strong> With equipment & bodyweight alternatives</span>
                  </li>
                </ul>
              </div>

              {/* 100% Human Message */}
              <div className="bg-primary/10 rounded-lg p-4 border border-primary/30 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <User className="h-5 w-5 text-primary" />
                  <span className="font-bold text-lg">100% Human. 0% AI.</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Every workout is designed by{" "}
                  <Link to="/coach-profile" className="text-primary font-semibold hover:underline">
                    Haris Falas
                  </Link>
                  , a Sports Scientist and CSCS-certified coach with over 20 years of experience. 
                  No algorithms, no generic templates—just real expertise.
                </p>
              </div>

              {/* Workout Categories */}
              <div>
                <h4 className="font-semibold mb-3">Workout Categories</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {workoutCategories.map((cat) => (
                    <div key={cat.name} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg text-sm">
                      <span className="text-primary">{cat.icon}</span>
                      <span>{cat.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Workout Metadata */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                  <Timer className="h-4 w-4 text-primary" />
                  <div>
                    <div className="text-xs text-muted-foreground">Duration</div>
                    <div className="text-sm font-medium">15-60 min</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <div>
                    <div className="text-xs text-muted-foreground">Difficulty</div>
                    <div className="text-sm font-medium">1-6 Stars</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                  <Zap className="h-4 w-4 text-primary" />
                  <div>
                    <div className="text-xs text-muted-foreground">Types</div>
                    <div className="text-sm font-medium">AMRAP, EMOM, etc.</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                  <Dumbbell className="h-4 w-4 text-primary" />
                  <div>
                    <div className="text-xs text-muted-foreground">Equipment</div>
                    <div className="text-sm font-medium">With & Without</div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Link to="/workouts">
                  <Button variant="outline" size="sm">
                    Explore Today's Workouts
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Section 2b: Smarty Workouts */}
          <Card className="mb-6 border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-primary" />
                Smarty Workouts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Beyond the daily WOD, <strong>Smarty Workouts</strong> is our full library of standalone workouts. 
                Browse by category, difficulty, format, and equipment to find the perfect session for your goals.
              </p>

              {/* Workout Categories */}
              <div className="bg-muted/30 rounded-lg p-4 border border-border">
                <h4 className="font-semibold mb-3">Workout Categories</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {workoutCategories.map((cat) => (
                    <div key={cat.name} className="flex items-center gap-2 p-2 bg-background rounded-lg text-sm border border-border">
                      <span className="text-primary">{cat.icon}</span>
                      <span>{cat.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* The Purpose */}
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
                <h4 className="font-semibold mb-2">The Purpose</h4>
                <p className="text-sm text-muted-foreground">
                  Each workout is designed with a specific training goal in mind—whether it's building <strong>strength</strong>, 
                  burning <strong>calories</strong>, improving <strong>mobility</strong>, or pushing your limits with a <strong>challenge</strong>. 
                  Every session follows proven sports science principles.
                </p>
              </div>

              {/* Access Levels */}
              <div className="bg-muted/30 rounded-lg p-4 border border-border">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Crown className="h-4 w-4 text-primary" />
                  Access Levels
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span><strong>Subscribers (Free):</strong> Access all free workouts at no cost</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span><strong>Premium Members:</strong> Full access to all workouts (free & premium)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span><strong>Standalone Purchase:</strong> Buy individual premium workouts without a subscription</span>
                  </li>
                </ul>
              </div>

              <div className="text-center">
                <Link to="/workouts">
                  <Button variant="outline" size="sm">
                    Browse All Workouts
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Training Programs */}
          <Card className="mb-6 border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Smarty Programs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                For long-term, structured transformation, <strong>Smarty Programs</strong> offer multi-week training journeys 
                lasting 4-12 weeks. Each program follows progressive overload principles to deliver real, measurable results.
              </p>

              <div className="bg-muted/30 rounded-lg p-4 border border-border">
                <h4 className="font-semibold mb-3">Program Categories</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {programCategories.map((cat) => (
                    <div key={cat} className="flex items-center gap-2 p-2 bg-background rounded-lg text-sm border border-border">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      <span>{cat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
                <h4 className="font-semibold mb-2">The Purpose</h4>
                <p className="text-sm text-muted-foreground">
                  Unlike random workouts, training programs provide <strong>progressive overload</strong>—the systematic 
                  increase of stress on the body over time. This is the #1 principle for building strength, endurance, 
                  and transforming your physique.
                </p>
              </div>

              {/* Access Info */}
              <div className="bg-muted/30 rounded-lg p-4 border border-border">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Crown className="h-4 w-4 text-primary" />
                  Access Levels
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span><strong>Subscribers (Free):</strong> Access all free training programs at no cost</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span><strong>Premium Members:</strong> Full access to all programs (free & premium)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span><strong>Standalone Purchase:</strong> Buy individual premium programs without a subscription</span>
                  </li>
                </ul>
              </div>

              <div className="text-center">
                <Link to="/trainingprogram">
                  <Button variant="outline" size="sm">
                    Explore Smarty Programs
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Smarty Ritual */}
          <Card className="mb-6 border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Smarty Ritual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Fitness isn't just about workouts—it's about how you live your entire day. The <strong>Smarty Ritual</strong> provides 
                daily wellness protocols designed to optimize your morning, midday, and evening routines.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/30 text-center">
                  <Sunrise className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                  <h4 className="font-semibold mb-1">Morning Ritual</h4>
                  <p className="text-xs text-muted-foreground">Start your day with intention, movement, and mindset</p>
                </div>
                <div className="p-4 bg-sky-500/10 rounded-lg border border-sky-500/30 text-center">
                  <Sun className="h-6 w-6 text-sky-500 mx-auto mb-2" />
                  <h4 className="font-semibold mb-1">Midday Ritual</h4>
                  <p className="text-xs text-muted-foreground">Reset, refocus, and maintain energy throughout</p>
                </div>
                <div className="p-4 bg-indigo-500/10 rounded-lg border border-indigo-500/30 text-center">
                  <Moon className="h-6 w-6 text-indigo-500 mx-auto mb-2" />
                  <h4 className="font-semibold mb-1">Evening Ritual</h4>
                  <p className="text-xs text-muted-foreground">Wind down, recover, and prepare for quality sleep</p>
                </div>
              </div>

              <div className="text-center">
                <Link to="/daily-ritual">
                  <Button variant="outline" size="sm">
                    Explore Smarty Ritual
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Section 5: Logbook & Progress Tracking */}
          <Card className="mb-6 border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Logbook & Progress Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                What gets measured gets managed. The SmartyGym <strong>Logbook</strong> is your personal fitness journal, 
                tracking every workout, program day, and wellness metric to keep you accountable and motivated.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h5 className="font-medium text-sm">Calendar View</h5>
                      <p className="text-xs text-muted-foreground">See your completed workouts at a glance</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <Activity className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h5 className="font-medium text-sm">Activity Timeline</h5>
                      <p className="text-xs text-muted-foreground">Filter and review your fitness history</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h5 className="font-medium text-sm">Analytics & Insights</h5>
                      <p className="text-xs text-muted-foreground">Visualize your progress over time</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h5 className="font-medium text-sm">Smarty Check-ins</h5>
                      <p className="text-xs text-muted-foreground">Track sleep, readiness, and recovery daily</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <Target className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h5 className="font-medium text-sm">Goals System</h5>
                      <p className="text-xs text-muted-foreground">Set and track your fitness objectives</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <Zap className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h5 className="font-medium text-sm">Monday Motivation</h5>
                      <p className="text-xs text-muted-foreground">Weekly reports to keep you inspired</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-primary/10 rounded-lg border border-primary/30 text-center">
                <p className="text-sm text-muted-foreground">
                  The <strong>SmartyGym ecosystem</strong> keeps you consistent, accountable, and motivated through 
                  smart tracking, Google Calendar integration, and personalized insights.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 6: Subscription Plans */}
          <Card className="mb-6 border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-background">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Subscription Plans
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                SmartyGym offers flexible plans to fit your fitness journey, plus the option to purchase 
                individual workouts or programs if you want to give us a try.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {/* Gold Plan */}
                <div className="p-5 rounded-lg border-2 border-[#D4AF37] shadow-lg">
                  <div className="text-center mb-3">
                    <h4 className="text-xl font-bold text-[#D4AF37] mb-2">Gold Plan</h4>
                    <Badge className="bg-[#D4AF37] text-white mb-3">MONTHLY</Badge>
                    <p className="text-2xl font-bold">€9.99<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                    <p className="text-xs text-[#D4AF37] font-semibold mt-2">🔄 Auto-renews monthly</p>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      Full access to all Smarty Workouts
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      Full access to all Smarty Programs
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      Full access to Smarty Ritual
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      Full access to Smarty Tools
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      Flexible monthly billing
                    </li>
                  </ul>
                </div>

                {/* Platinum Plan */}
                <div className="p-5 rounded-lg border-2 border-[#A8A9AD] shadow-lg bg-gradient-to-br from-[#A8A9AD]/5 to-[#C0C0C0]/10 relative">
                  <Badge className="absolute -top-2 right-2 bg-green-600 text-white px-3 py-1 text-xs shadow-md z-10">
                    BEST VALUE
                  </Badge>
                  <div className="text-center mb-3 pt-2">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Crown className="h-5 w-5 text-[#A8A9AD]" />
                      <h4 className="text-xl font-bold text-[#A8A9AD]">Platinum</h4>
                    </div>
                    <Badge className="bg-[#A8A9AD] text-white mb-3">YEARLY</Badge>
                    <p className="text-2xl font-bold">€89.99<span className="text-sm font-normal text-muted-foreground">/year</span></p>
                    <p className="text-sm text-green-600 font-bold mt-1">Save €29.89!</p>
                    <p className="text-xs text-muted-foreground">Just €7.50/month • 🔄 Auto-renews yearly</p>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      Full access to all Smarty Workouts
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      Full access to all Smarty Programs
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      Full access to Smarty Ritual
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      Full access to Smarty Tools
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      Best value - save 25%
                    </li>
                  </ul>
                </div>
              </div>

              {/* Standalone Purchase */}
              <div className="p-4 bg-muted/30 rounded-lg border border-border text-center">
                <h4 className="font-semibold mb-2">Want to Try Before You Subscribe?</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Purchase individual premium workouts or training programs without a subscription. 
                  Perfect for trying out SmartyGym!
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Link to="/workout">
                    <Button variant="outline" size="sm">Browse Workouts</Button>
                  </Link>
                  <Link to="/trainingprogram">
                    <Button variant="outline" size="sm">Browse Programs</Button>
                  </Link>
                  <Link to="/joinpremium">
                    <Button size="sm">View All Plans</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Ready to start your journey?</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/auth">
                <Button size="lg">
                  Get Started Free
                </Button>
              </Link>
              <Link to="/coach-profile">
                <Button variant="outline" size="lg">
                  Meet Your Coach
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
