import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { ScrollReveal } from "@/components/ScrollReveal";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SUBSCRIPTION_PRICES, SUBSCRIPTION_BILLING_PERIODS } from "@/config/pricing";
import {
  Shield, TrendingUp, Target, Heart, Clock,
  Dumbbell, CalendarDays, ListChecks, Sparkles, Wrench,
  BookOpen, Users, Newspaper, ClipboardList, Crown,
  ChevronRight, Award, Flame, Brain, Zap,
  BarChart3, CheckCircle2, Activity, Waves, Mountain,
  Timer, Baby, Plane, Briefcase, Star,
  LineChart, Goal
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer,
  LineChart as RechartsLineChart, Line, Area, AreaChart,
  CartesianGrid
} from "recharts";

const SG = () => <span className="text-primary font-semibold">SmartyGym</span>;

// Mock data for decorative charts
const progressData = [
  { week: "W1", value: 40 },
  { week: "W2", value: 48 },
  { week: "W3", value: 52 },
  { week: "W4", value: 58 },
  { week: "W5", value: 55 },
  { week: "W6", value: 63 },
  { week: "W7", value: 68 },
  { week: "W8", value: 75 },
];

const workoutFrequencyData = [
  { day: "Mon", sessions: 1 },
  { day: "Tue", sessions: 1 },
  { day: "Wed", sessions: 0 },
  { day: "Thu", sessions: 1 },
  { day: "Fri", sessions: 1 },
  { day: "Sat", sessions: 1 },
  { day: "Sun", sessions: 0 },
];

const TheSmartyMethod = () => {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "The Smarty Method" },
  ];

  const wodPeriodizationCards = [
    { icon: Activity, title: "Different Energy System Daily", description: "Each day of the week targets a different energy system — aerobic, anaerobic, phosphagen. Your body is challenged in every way it needs to be." },
    { icon: Waves, title: "All Fitness Parameters Covered", description: "Strength, cardio, mobility, metabolic conditioning, stability, recovery. Every parameter a human body needs is addressed within each weekly cycle." },
    { icon: Baby, title: "Designed for Real Life", description: "Whether you're a parent, a traveler, a busy professional, or a student — the Workout of the Day handles the planning so you don't have to." },
    { icon: Mountain, title: "Progressive & Purposeful", description: "No random workouts. Each day builds on the previous one. Each week follows a structured plan. Every session has a clear objective." },
    { icon: Timer, title: "Time-Efficient Programming", description: "Sessions designed to deliver maximum results in realistic timeframes. Because your time is valuable and every minute must count." },
  ];

  const workoutStructure = [
    { step: "01", title: "Clear Objective", description: "Every session starts with a defined goal — strength, calorie burning, metabolic conditioning, cardio, mobility and stability, challenge, pilates, recovery, or micro-workout." },
    { step: "02", title: "Warm-Up & Activation", description: "Targeted preparation that primes your muscles, joints, and nervous system for the work ahead." },
    { step: "03", title: "Primary Training Block", description: "The core of the session — structured sets, reps, and intensities aligned with the session's objective." },
    { step: "04", title: "Finisher Conditioning", description: "A focused finishing block designed to push capacity, burn calories, or reinforce the session's training effect." },
    { step: "05", title: "Cool-Down & Recovery", description: "Guided cool-down protocols to promote recovery, reduce soreness, and prepare your body for the next session." },
  ];

  const ecosystemItems = [
    { icon: CalendarDays, title: "Workout of the Day", description: "A fresh, professionally designed workout delivered daily. Structured, purposeful, and aligned with a periodized weekly plan — never random.", link: "/workout/wod", color: "text-primary" },
    { icon: Dumbbell, title: "Smarty Workouts", description: "Individual structured sessions across multiple categories — each with a clear focus, proper warm-up, primary training block, and cool-down.", link: "/workout", color: "text-primary" },
    { icon: ListChecks, title: "Smarty Programs", description: "Multi-week structured training plans with built-in progression. Designed to take you from where you are to where you want to be.", link: "/trainingprogram", color: "text-blue-500" },
    { icon: Sparkles, title: "Smarty Ritual", description: "Daily habits and routines that improve mindset, recovery, and consistency. The discipline behind the results.", link: "/daily-ritual", color: "text-purple-500" },
    { icon: Wrench, title: "Smarty Tools", description: "Performance tools — timers, 1RM calculators, BMR calculators, macro trackers — designed to support data-driven decisions.", link: "/tools", color: "text-orange-500" },
    { icon: BookOpen, title: "Exercise Library", description: "A curated, professional exercise database with proper demonstrations. Ensuring correct technique and movement quality.", link: "/exerciselibrary", color: "text-emerald-500" },
    { icon: Users, title: "Community", description: "A motivating digital environment where members support each other, share progress, and stay accountable.", link: "/community", color: "text-cyan-500" },
    { icon: Newspaper, title: "Blog", description: "Educational content focused on fitness, health, performance, and lifestyle optimization. Written by professionals, not generated by machines.", link: "/blog", color: "text-red-500" },
  ];

  const logbookFeatures = [
    { icon: Goal, title: "Goal Setting", description: "Define clear, measurable goals. Track your targets and milestones. Know exactly where you're heading and why." },
    { icon: ClipboardList, title: "Workout Logging", description: "Record every session — exercises, sets, reps, weights. Build a complete training journal that becomes your most valuable coaching tool." },
    { icon: BarChart3, title: "Progress Tracking", description: "Monitor your 1RM progress, BMR calculations, macro targets, and workout completions over time with clear visual data." },
    { icon: Star, title: "Session Rating", description: "Rate each session, leave notes, track energy and mood. Understand patterns that drive your best — and worst — performances." },
  ];

  const audienceSegments = [
    { icon: Briefcase, title: "Busy Professionals", description: "Your schedule is packed. You need a professional system that delivers results in the time you actually have — not the time you wish you had." },
    { icon: Baby, title: "Parents", description: "Between school runs, bedtimes, and everything in between — fitness has to fit your life. Not the other way around." },
    { icon: Plane, title: "Travelers", description: "Airports, hotels, different time zones. Your gym travels with you. No equipment dependency, no excuses, no disruption." },
    { icon: Dumbbell, title: "Gym-Goers", description: "You have a gym membership — but do you have a plan? Structured programming in your pocket changes everything." },
    { icon: Award, title: "Beginners", description: "Starting is the hardest part. You need safe, structured guidance from a qualified professional — not random YouTube videos." },
    { icon: TrendingUp, title: "Experienced Lifters", description: "You've been training for years. You need intelligent periodization and fresh programming to break through plateaus." },
  ];

  return (
    <>
      <Helmet>
        <title>The Smarty Method | SmartyGym Performance System</title>
        <meta name="description" content="Discover The Smarty Method — a complete performance system designed by Strength & Conditioning Coach Haris Falas. Science-based workouts, structured programs, and intelligent periodization." />
        <meta property="og:title" content="The Smarty Method | SmartyGym" />
        <meta property="og:description" content="More than workouts. A complete performance system built on science, experience, and intelligent periodization." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://smartygym.com/the-smarty-method" />
      </Helmet>

      <main className="min-h-screen bg-background">
        <div className="container mx-auto max-w-5xl px-4 py-8">
          <PageBreadcrumbs items={breadcrumbItems} />

          {/* Hero / Introduction */}
          <ScrollReveal>
            <section className="text-center mb-16">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
                More Than Workouts.{" "}
                <span className="text-primary">A Complete Performance System.</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                <SG /> is not a collection of random workouts. It is a structured ecosystem designed by Strength and Conditioning Coach{" "}
                <Link to="/coach-profile" className="text-primary hover:underline font-semibold">Haris Falas</Link>,
                built on science, real-world coaching experience, and intelligent periodization.
                Every element serves a purpose. Every session has a goal. Every program follows a plan.
              </p>
            </section>
          </ScrollReveal>

          {/* The Expertise Behind the System */}
          <ScrollReveal delay={100}>
            <section className="mb-16">
              <Card className="border-primary/40">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Award className="w-7 h-7 text-primary flex-shrink-0" />
                    <h2 className="text-2xl sm:text-3xl font-bold">The Expertise Behind the System</h2>
                  </div>
                  <div className="space-y-4 text-muted-foreground leading-relaxed">
                    <p>
                      <Link to="/coach-profile" className="text-primary hover:underline font-semibold">Haris Falas</Link> is a qualified Strength and Conditioning Coach with a degree in Sports Science and years of hands-on experience in the fitness industry — from personal training and group coaching to program design and athlete preparation.
                    </p>
                    <p>
                      That experience shaped <SG />. Every workout, every program, every tool reflects a coaching philosophy rooted in <strong className="text-foreground">precision</strong>, <strong className="text-foreground">leadership</strong>, and <strong className="text-foreground">long-term thinking</strong>. This is not content created for clicks. It is training architecture designed for results.
                    </p>
                    <p>
                      The difference between a workout you found online and a workout from <SG /> is the difference between guessing and knowing. When a professional designs your training, every variable is accounted for.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>
          </ScrollReveal>

          {/* WOD: Smart Periodization */}
          <ScrollReveal delay={100}>
            <section className="mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-center">Workout of the Day: Smart Periodization</h2>
              <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
                The <SG /> Workout of the Day is not a random daily workout. It is part of a carefully designed weekly periodization cycle that ensures every energy system, every fitness parameter, and every aspect of human performance is covered — week after week.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {wodPeriodizationCards.map((item) => (
                  <Card key={item.title} className="border-primary/30 hover:border-primary transition-colors">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <item.icon className="w-5 h-5 text-primary flex-shrink-0" />
                        <h3 className="font-semibold text-lg">{item.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </ScrollReveal>

          {/* How We Build Our Workouts */}
          <ScrollReveal delay={100}>
            <section className="mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-center">How We Build Our Workouts & Training Programs</h2>
              <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
                Every session follows a deliberate structure. Nothing is left to chance.
              </p>
              <div className="space-y-4">
                {workoutStructure.map((item) => (
                  <Card key={item.step} className="border-primary/20 hover:border-primary/50 transition-colors">
                    <CardContent className="p-5 flex items-start gap-4">
                      <span className="text-2xl font-bold text-primary/40 flex-shrink-0 w-10">{item.step}</span>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </ScrollReveal>

          {/* The Smarty Ecosystem */}
          <ScrollReveal delay={100}>
            <section className="mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-center">The Smarty Ecosystem</h2>
              <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
                A complete, interconnected system where every component supports your progress.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ecosystemItems.map((item) => (
                  <Link to={item.link} key={item.title} className="group">
                    <Card className="border-primary/20 hover:border-primary transition-all h-full group-hover:shadow-lg group-hover:shadow-primary/10">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <item.icon className={`w-5 h-5 flex-shrink-0 ${item.color}`} />
                          <h3 className="font-semibold text-lg">{item.title}</h3>
                          <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          </ScrollReveal>

          {/* The Logbook and Tracking System */}
          <ScrollReveal delay={100}>
            <section className="mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-center">The Logbook & Tracking System</h2>
              <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
                What gets measured gets managed. Without tracking, you're guessing. With <SG />, you're building a data-driven training journal that turns effort into measurable progress.
              </p>

              {/* Feature cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {logbookFeatures.map((item) => (
                  <Card key={item.title} className="border-primary/30 hover:border-primary transition-colors">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <item.icon className="w-5 h-5 text-primary flex-shrink-0" />
                        <h3 className="font-semibold text-lg">{item.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Decorative Charts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="border-primary/20">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <LineChart className="w-4 h-4 text-primary" />
                      <h4 className="font-semibold text-sm">Strength Progress</h4>
                    </div>
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={progressData}>
                          <defs>
                            <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                          <YAxis hide />
                          <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="url(#progressGradient)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Track your lifts and see your strength grow over time.</p>
                  </CardContent>
                </Card>

                <Card className="border-primary/20">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <BarChart3 className="w-4 h-4 text-primary" />
                      <h4 className="font-semibold text-sm">Weekly Consistency</h4>
                    </div>
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={workoutFrequencyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                          <YAxis hide />
                          <Bar dataKey="sessions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Accountability creates consistency. Consistency creates results.</p>
                  </CardContent>
                </Card>
              </div>
            </section>
          </ScrollReveal>

          {/* Two Smarty Plans */}
          <ScrollReveal delay={100}>
            <section className="mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-center">Two Smarty Plans</h2>
              <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
                Full access to the entire <SG /> ecosystem. Choose the commitment that fits your life.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
                <Card className="border-primary/30 hover:border-primary transition-colors">
                  <CardContent className="p-6 text-center">
                    <Crown className="w-8 h-8 text-primary/70 mx-auto mb-3" />
                    <h3 className="text-xl font-bold mb-1">Gold Plan</h3>
                    <p className="text-2xl font-bold text-primary mb-1">€{SUBSCRIPTION_PRICES.gold}<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Full ecosystem access with the flexibility to manage your membership month to month. No long-term commitment required.
                    </p>
                    <Button asChild variant="outline" size="sm">
                      <Link to="/smarty-plans">View Plans</Link>
                    </Button>
                  </CardContent>
                </Card>
                <Card className="border-primary hover:shadow-lg hover:shadow-primary/10 transition-all">
                  <CardContent className="p-6 text-center">
                    <Crown className="w-8 h-8 text-primary mx-auto mb-3" />
                    <h3 className="text-xl font-bold mb-1">Platinum Plan</h3>
                    <p className="text-2xl font-bold text-primary mb-1">€{SUBSCRIPTION_PRICES.platinum}<span className="text-sm font-normal text-muted-foreground">/year</span></p>
                    <p className="text-sm text-muted-foreground mb-4">
                      The same full access at the best value. Commit to a year of structured training and save. Serious results require serious commitment.
                    </p>
                    <Button asChild size="sm">
                      <Link to="/smarty-plans">View Plans</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </section>
          </ScrollReveal>

          {/* Closing Section — The Why */}
          <ScrollReveal delay={100}>
            <section className="mb-8">
              <Card className="border-primary">
                <CardContent className="p-6 sm:p-10 text-center">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6">
                    Built to Win. <span className="text-primary">Built to Last.</span>
                  </h2>

                  <div className="space-y-4 text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-10 text-left">
                    <p>
                      The world is changing. Everything is moving online — education, work, healthcare. Fitness is no exception. The future of training is <strong className="text-foreground">hybrid</strong>: combining the best of digital programming with real-world effort. <SG /> was built for that future.
                    </p>
                    <p>
                      Life is busier than it has ever been. Between demanding jobs, raising children, traveling, managing stress, and trying to stay healthy — most people don't have the luxury of spending two hours at a gym figuring out what to do. They need a <strong className="text-foreground">system</strong>. A professional, structured plan that fits in their pocket, adapts to their schedule, and delivers real results.
                    </p>
                    <p>
                      That's why <SG /> exists. Not because the world needed another fitness app. But because it needed a <strong className="text-foreground">professional coaching platform</strong> — designed by a real Strength and Conditioning Coach — that makes structured, science-based training accessible to everyone, everywhere, at any time.
                    </p>
                    <p>
                      Even if you go to a gym every day, having a structured program in your pocket changes everything. No more guesswork. No more wasted sessions. No more wondering if what you're doing is actually working. <SG /> is the coach you carry with you — <strong className="text-foreground">always ready, always planned, always professional</strong>.
                    </p>
                  </div>

                  <h3 className="text-xl font-bold mb-6">Who is <SG /> For?</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8">
                    {audienceSegments.map((seg) => (
                      <div key={seg.title} className="flex items-start gap-3 p-4 bg-background/50 rounded-lg border border-primary/20 text-left">
                        <seg.icon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm mb-1">{seg.title}</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">{seg.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button asChild size="lg">
                    <Link to="/smarty-plans">
                      <Crown className="mr-2 h-5 w-5" />
                      Start Your Journey
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </section>
          </ScrollReveal>
        </div>
      </main>
    </>
  );
};

export default TheSmartyMethod;
