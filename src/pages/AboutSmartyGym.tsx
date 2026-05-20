import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
   
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
   Trophy,
   Wrench,
   Users,
   Newspaper,
   Info,
   ListChecks,
   Apple
} from "lucide-react";

import { SEOEnhancer } from "@/components/SEOEnhancer";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";

export default function AboutSmartyGym() {
  

  const workoutCategories = [
    { name: "Strength", icon: <Dumbbell className="h-4 w-4 text-rose-500" /> },
    { name: "Calorie Burning", icon: <Flame className="h-4 w-4 text-orange-500" /> },
    { name: "Metabolic", icon: <Zap className="h-4 w-4 text-amber-500" /> },
    { name: "Cardio", icon: <Activity className="h-4 w-4 text-red-500" /> },
    { name: "Mobility & Stability", icon: <Target className="h-4 w-4 text-emerald-500" /> },
    { name: "Challenge", icon: <Trophy className="h-4 w-4 text-yellow-500" /> },
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
        <title>About SmartyGym | The Complete Fitness Ecosystem | SmartyGym</title>
        <meta name="description" content="About SmartyGym: discover our complete fitness ecosystem — daily workouts, training programs, Smarty Rituals, tools, exercise library, community, blog, and subscription plans." />
        <meta name="keywords" content="about SmartyGym, fitness app features, workout app guide, training programs, smarty ritual, smarty tools, exercise library, community, blog" />
        
        <meta property="og:title" content="About SmartyGym | The Complete Fitness Ecosystem" />
        <meta property="og:description" content="Your complete guide to the SmartyGym ecosystem — workouts, programs, rituals, tools, exercise library, community, blog, and progress tracking." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://smartygym.com/about-smartygym" />
        
        <link rel="canonical" href="https://smartygym.com/about-smartygym" />
      </Helmet>

      <SEOEnhancer
        entities={["About SmartyGym", "Fitness Features", "Workout Guide"]}
        topics={["about SmartyGym", "workout features", "training programs", "progress tracking", "wellness rituals", "fitness tools", "exercise library", "fitness community", "fitness blog"]}
        expertise={["fitness coaching", "workout programming", "wellness protocols"]}
        contentType="Guide"
        aiSummary="An in-depth overview of the SmartyGym ecosystem: daily workouts, multi-week training programs, Smarty Rituals, logbook, Smarty Tools, exercise library, community, blog and subscription plans."
        aiKeywords={["SmartyGym", "about SmartyGym", "workout features", "training programs", "smarty ritual", "smarty tools", "exercise library", "community", "blog"]}
        relatedContent={["Smarty Workouts", "Smarty Programs", "Daily Ritual", "Smarty Tools", "Exercise Library", "Community", "Blog"]}
        targetAudience="individuals exploring the SmartyGym fitness ecosystem"
        pageType="Guide"
      />

      <div className="min-h-screen bg-background">
        <main className="container mx-auto max-w-6xl md:max-w-[1500px] px-4 md:px-6 pb-8">
          <PageBreadcrumbs items={[
            { label: "Home", href: "/" },
            { label: "About SmartyGym" }
          ]} />

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Info className="h-8 w-8 text-teal-500" />
              <h1 className="text-3xl sm:text-4xl font-bold">
                About <span className="text-primary">SmartyGym</span>
              </h1>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Your Gym Re-imagined. Anywhere, Anytime.
            </p>
          </div>

          {/* Section 1: What is SmartyGym? */}
          <Card className="mb-6 border-2 border-primary/30">
            <CardHeader className="text-left">
              <CardTitle className="text-2xl font-semibold leading-none tracking-tight flex items-center justify-start gap-2 text-left">
                <Heart className="h-5 w-5 text-primary" />
                What is SmartyGym?
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-muted-foreground text-left">
                In a world of endless fitness advice on YouTube, conflicting information on social media, and generic gym memberships 
                that lead nowhere, finding a structured path to real results has never been harder. <span className="text-primary font-bold">SmartyGym</span> provides the 
                ecosystem you need to elevate every aspect of your performance—anywhere, anytime.
              </p>
              <p className="text-muted-foreground mt-4 text-left">
                Your body is your greatest asset. <span className="text-primary font-bold whitespace-nowrap">SmartyGym is your Gym Re-imagined</span>: expert-designed workouts, 
                structured training programs, and a complete wellness ecosystem that keeps you consistent and motivated.
              </p>
            </CardContent>
          </Card>

          {/* Section 2: Workout of the Day */}
          <Card className="mb-6 border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-amber-500" />
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
                  <Brain className="h-4 w-4 text-purple-500" />
                  The Science of Periodization
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span><strong>Smart Periodization:</strong> Science-based category rotation designed for optimal results and balanced fitness development</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span><strong>Difficulty Rotation:</strong> Stars cycle from 1-6, ensuring progressive challenge</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span><strong>Smart Scheduling:</strong> Strategic training that targets different energy systems for structured and science-based progress.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
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
                    <div key={cat.name} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg text-sm font-bold">
                      <span className="text-primary">{cat.icon}</span>
                      <span>{cat.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Workout Metadata */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                  <Timer className="h-4 w-4 text-blue-500" />
                  <div>
                    <div className="text-xs text-muted-foreground">Duration</div>
                    <div className="text-sm font-medium">15-60 min</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  <div>
                    <div className="text-xs text-muted-foreground">Difficulty</div>
                    <div className="text-sm font-medium">1-6 Stars</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <div>
                    <div className="text-xs text-muted-foreground">Types</div>
                    <div className="text-sm font-medium">AMRAP, EMOM, etc.</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                  <Dumbbell className="h-4 w-4 text-rose-500" />
                  <div>
                    <div className="text-xs text-muted-foreground">Equipment</div>
                    <div className="text-sm font-medium">With & Without</div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Link to="/workout/wod">
                  <Button variant="outline" size="sm">
                    View the Workout of the Day
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Section 2b: Smarty Workouts */}
          <Card className="mb-6 border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-rose-500" />
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
                    <div key={cat.name} className="flex items-center gap-2 p-2 bg-background rounded-lg text-sm font-bold border border-border">
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
                  <Crown className="h-4 w-4 text-yellow-500" />
                  Access Levels
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span><strong>Subscribers (Free):</strong> Access all free workouts at no cost</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span><strong>Premium Members:</strong> Full access to all workouts (free & premium)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span><strong>Standalone Purchase:</strong> Buy individual premium workouts without a subscription</span>
                  </li>
                </ul>
              </div>

              <div className="text-center">
                <Link to="/workout">
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
                <ListChecks className="h-5 w-5 text-blue-500" />
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
                    <div key={cat} className="flex items-center gap-2 p-2 bg-background rounded-lg text-sm font-bold border border-border">
                      <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" />
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
                  <Crown className="h-4 w-4 text-yellow-500" />
                  Access Levels
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span><strong>Subscribers (Free):</strong> Access all free training programs at no cost</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span><strong>Premium Members:</strong> Full access to all programs (free & premium)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span><strong>Standalone Purchase:</strong> Buy individual premium programs without a subscription</span>
                  </li>
                </ul>
              </div>

              <div className="text-center">
                <Link to="/trainingprogram">
                  <Button variant="outline" size="sm">
                    Browse All Programs
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Smarty Ritual */}
          <Card className="mb-6 border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
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
                <BookOpen className="h-5 w-5 text-teal-500" />
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
                    <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-sm">Calendar View</h5>
                      <p className="text-xs text-muted-foreground">See your completed workouts at a glance</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <Activity className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-sm">Activity Timeline</h5>
                      <p className="text-xs text-muted-foreground">Filter and review your fitness history</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-purple-500 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-sm">Analytics & Insights</h5>
                      <p className="text-xs text-muted-foreground">Visualize your progress over time</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <Clock className="h-5 w-5 text-cyan-500 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-sm">Smarty Check-ins</h5>
                      <p className="text-xs text-muted-foreground">Track sleep, readiness, and recovery daily</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <Target className="h-5 w-5 text-emerald-500 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-sm">Goals System</h5>
                      <p className="text-xs text-muted-foreground">Set and track your fitness objectives</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <Zap className="h-5 w-5 text-amber-500 mt-0.5" />
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

              <div className="text-center">
                <Link to="/userdashboard">
                  <Button variant="outline" size="sm">
                    Open My Logbook
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Section 6: Smarty Tools */}
          <Card className="mb-6 border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-orange-500" />
                Smarty Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                <strong>Smarty Tools</strong> is your free suite of evidence-based fitness calculators, designed to give you
                instant, science-backed answers for the numbers that drive your training and nutrition.
              </p>

              <div className="bg-muted/30 rounded-lg p-4 border border-border">
                <h4 className="font-semibold mb-3">What's Inside</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 p-2 bg-background rounded-lg text-sm border border-border">
                    <Dumbbell className="h-4 w-4 text-rose-500" />
                    <span>1RM Calculator</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-background rounded-lg text-sm border border-border">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span>BMR Calculator</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-background rounded-lg text-sm border border-border">
                    <Target className="h-4 w-4 text-emerald-500" />
                    <span>Macro Tracking Calculator</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-background rounded-lg text-sm border border-border">
                    <Activity className="h-4 w-4 text-red-500" />
                    <span>Calorie Counter</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
                <h4 className="font-semibold mb-2">The Purpose</h4>
                <p className="text-sm text-muted-foreground">
                  Replace guesswork with data. Track strength benchmarks, dial in your daily energy needs, and align your
                  nutrition with your training goals — all in one place.
                </p>
              </div>

              <div className="text-center">
                <Link to="/tools">
                  <Button variant="outline" size="sm">
                    Explore Smarty Tools
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Section 7: Exercise Library */}
          <Card className="mb-6 border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-emerald-500" />
                Exercise Library
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                The <strong>Exercise Library</strong> is a curated, searchable database of every movement used inside
                SmartyGym workouts and programs — with clear descriptions, step-by-step instructions, and visual demos.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg border border-border">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <h5 className="font-bold text-sm">Detailed Descriptions</h5>
                    <p className="text-xs text-muted-foreground">Purpose, muscles trained, and benefits</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg border border-border">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <h5 className="font-bold text-sm">Step-by-Step Instructions</h5>
                    <p className="text-xs text-muted-foreground">Proper setup, execution, and cues</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg border border-border">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <h5 className="font-bold text-sm">Filter & Search</h5>
                    <p className="text-xs text-muted-foreground">By body part, equipment, or difficulty</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
                <h4 className="font-semibold mb-2">The Purpose</h4>
                <p className="text-sm text-muted-foreground">
                  Train with confidence. Every exercise inside a workout is linked to its full library entry, so you always
                  know exactly how to perform it safely and effectively.
                </p>
              </div>

              <div className="text-center">
                <Link to="/exerciselibrary">
                  <Button variant="outline" size="sm">
                    Visit Exercise Library
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Section 8: Community */}
          <Card className="mb-6 border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-cyan-500" />
                Community
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                The SmartyGym <strong>Community</strong> connects you with other members on the same journey. Share progress,
                rate workouts, and see how you stack up on the global leaderboards.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg border border-border">
                  <Trophy className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                  <div>
                    <h5 className="font-bold text-sm">Leaderboards</h5>
                    <p className="text-xs text-muted-foreground">Global rankings by workouts and streaks</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg border border-border">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <h5 className="font-bold text-sm">Ratings & Reviews</h5>
                    <p className="text-xs text-muted-foreground">Member feedback on workouts and programs</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg border border-border">
                  <Activity className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <h5 className="font-bold text-sm">Live Activity</h5>
                    <p className="text-xs text-muted-foreground">See what the community is training right now</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
                <h4 className="font-semibold mb-2">The Purpose</h4>
                <p className="text-sm text-muted-foreground">
                  Consistency thrives in numbers. The Community keeps you accountable, inspired, and part of a global
                  movement of people training smarter.
                </p>
              </div>

              <div className="text-center">
                <Link to="/community">
                  <Button variant="outline" size="sm">
                    Visit the Community
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Section 9: Blog */}
          <Card className="mb-6 border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Newspaper className="h-5 w-5 text-red-500" />
                Blog
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                The SmartyGym <strong>Blog</strong> is your go-to resource for science-based articles across three sections: <strong>Fitness</strong>, <strong>Wellness</strong>, and <strong>Nutrition</strong> — all written and curated by{" "}
                <Link to="/coach-profile" className="text-primary font-semibold hover:underline">
                  Haris Falas
                </Link>
                .
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg border border-border">
                  <Dumbbell className="h-4 w-4 text-rose-500 mt-0.5 shrink-0" />
                  <div>
                    <h5 className="font-bold text-sm">Fitness</h5>
                    <p className="text-xs text-muted-foreground">Evidence-based training, workouts, and performance</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg border border-border">
                  <Sun className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <h5 className="font-bold text-sm">Wellness</h5>
                    <p className="text-xs text-muted-foreground">Recovery, sleep, mindfulness, and lifestyle optimization</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg border border-border">
                  <Apple className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <h5 className="font-bold text-sm">Nutrition</h5>
                    <p className="text-xs text-muted-foreground">Evidence-based eating, supplementation, and metabolic health</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
                <h4 className="font-semibold mb-2">The Purpose</h4>
                <p className="text-sm text-muted-foreground">
                  Knowledge is the multiplier. The Blog gives you the "why" behind what you train, what you eat, and how
                  you recover — so every choice is an informed one.
                </p>
              </div>

              <div className="text-center">
                <Link to="/blog">
                  <Button variant="outline" size="sm">
                    Read the Blog
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Section 10: Subscription Plans */}
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
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
                <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                  🎉 Try free for 3 days — cancel anytime. No commitment.
                </p>
              </div>

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
                  <Link to="/auth?mode=signup&trial=true">
                    <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700">
                      Start 3-Day Free Trial
                    </Button>
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
