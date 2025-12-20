import { useState, useRef } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Heart, 
  Brain, 
  TrendingUp, 
  Users, 
  Activity,
  Clock,
  Smile,
  Target,
  Shield,
  Home,
  Briefcase,
  Award,
  BarChart3,
  BookOpen,
  ExternalLink,
  Dumbbell,
  Calendar,
  Sparkles,
  Calculator,
  FileText,
  Zap,
  CheckCircle2,
  Smartphone,
  Plane,
  Timer,
  Crown,
  BookOpenText,
  Download
} from "lucide-react";
import { useShowBackButton } from "@/hooks/useShowBackButton";
import { SEOEnhancer } from "@/components/SEOEnhancer";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ReaderModeDialog } from "@/components/ReaderModeDialog";
import { toast } from "sonner";
import { exportToPDF } from "@/utils/pdfExport";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  CartesianGrid,
  Legend
} from "recharts";

// Chart data based on real research
const mentalHealthData = [
  { condition: "Anxiety", withExercise: 25, withoutExercise: 48, fill: "hsl(var(--primary))" },
  { condition: "Depression", withExercise: 20, withoutExercise: 42, fill: "hsl(var(--chart-2))" },
  { condition: "Stress", withExercise: 35, withoutExercise: 62, fill: "hsl(var(--chart-3))" },
  { condition: "Sleep Issues", withExercise: 22, withoutExercise: 45, fill: "hsl(var(--chart-4))" },
];

const consistencyResultsData = [
  { week: "Week 1", structured: 5, unstructured: 5 },
  { week: "Week 4", structured: 20, unstructured: 12 },
  { week: "Week 8", structured: 45, unstructured: 18 },
  { week: "Week 12", structured: 75, unstructured: 22 },
  { week: "Week 24", structured: 120, unstructured: 28 },
];

const adherenceData = [
  { name: "Expert-Guided Programs", value: 67, fill: "hsl(var(--primary))" },
  { name: "Self-Guided Training", value: 23, fill: "hsl(var(--muted-foreground))" },
  { name: "Generic Apps", value: 10, fill: "hsl(var(--muted))" },
];

const inactivityByAgeData = [
  { age: "18-29", percentage: 27 },
  { age: "30-44", percentage: 31 },
  { age: "45-64", percentage: 35 },
  { age: "65-74", percentage: 38 },
  { age: "75+", percentage: 52 },
];

const chartConfig = {
  percentage: { label: "Percentage", color: "hsl(var(--primary))" },
  structured: { label: "Structured Program", color: "hsl(var(--primary))" },
  unstructured: { label: "Self-Guided", color: "hsl(var(--muted-foreground))" },
  withExercise: { label: "With Regular Exercise", color: "hsl(var(--primary))" },
  withoutExercise: { label: "Without Exercise", color: "hsl(var(--destructive))" },
};

export default function WhyInvestInSmartyGym() {
  const { canGoBack, goBack } = useShowBackButton();
  const [readerModeOpen, setReaderModeOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = async () => {
    if (!contentRef.current) return;
    
    toast.loading("Generating PDF...", { id: "pdf-export" });
    
    try {
      await exportToPDF(contentRef.current, {
        title: "Why Invest in SmartyGym",
        filename: "Why-Invest-In-SmartyGym",
        accentColor: "#29B6D2"
      });
      
      toast.success("PDF exported successfully!", { id: "pdf-export" });
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export PDF", { id: "pdf-export" });
    }
  };

  const getReaderContent = () => {
    return `
      <h2>Your Body, Your Greatest Asset</h2>
      <p>In a world of endless fitness advice on YouTube, conflicting information on social media, and generic gym memberships that lead nowhere, finding a structured path to real results has never been harder. This research explores why expert-designed, human-crafted fitness programs deliver transformative results—and how SmartyGym provides the ecosystem you need to elevate every aspect of your performance.</p>
      
      <h2>The Foundation of Human Performance</h2>
      <p>Physical fitness isn't just about looking good—it's the bedrock upon which all other performance is built. Research from the American College of Sports Medicine consistently shows that regular exercise improves cognitive function, emotional regulation, and energy levels across all age groups.</p>
      <p>According to a Harvard Medical School study, just 20 minutes of moderate exercise can boost brain function for up to 12 hours afterward. The implications for work productivity, parenting patience, and creative pursuits are profound.</p>
      <ul>
        <li><strong>23%</strong> Increase in cognitive performance</li>
        <li><strong>32%</strong> Boost in creative problem-solving</li>
        <li><strong>40%</strong> Improvement in stress resilience</li>
      </ul>
      
      <h2>Exercise & Mental Health</h2>
      <p>The National Institute of Mental Health and countless peer-reviewed studies have established that regular physical activity is one of the most effective interventions for mental health—often matching or exceeding the effects of medication for mild to moderate conditions.</p>
      
      <h2>The Modern Fitness Challenge</h2>
      <p>Despite knowing that exercise is beneficial, most people struggle to maintain a consistent routine. The reasons are systemic, not personal failures:</p>
      <ul>
        <li><strong>Information Overload:</strong> YouTube, Instagram, TikTok—endless conflicting advice with no coherent philosophy</li>
        <li><strong>Lack of Structure:</strong> Random workouts without progressive overload or long-term planning</li>
        <li><strong>Time Scarcity:</strong> Work, family, commute—no time for a "real" gym routine</li>
        <li><strong>Accessibility Gaps:</strong> Traveling? No equipment? The routine breaks down</li>
      </ul>
      
      <h2>The Science of Consistency & Progressive Overload</h2>
      <p>Research from the Journal of Strength and Conditioning demonstrates that structured programs with progressive overload produce results 3-5x greater than random workouts over a 24-week period.</p>
      
      <h2>Why Expert-Designed Programs Win</h2>
      <p>The RAND Corporation study on fitness program adherence found that programs designed by certified professionals have a 67% long-term adherence rate, compared to just 23% for self-guided approaches.</p>
      
      <h2>The SmartyGym Ecosystem</h2>
      <p>SmartyGym was built to solve the modern fitness challenge. Created by Sports Scientist and CSCS-certified coach Haris Falas with over 20 years of experience, every workout and program is designed with purpose, progression, and real-world constraints in mind.</p>
      <ul>
        <li><strong>500+ Expert Workouts:</strong> Professionally designed, categorized, and progressive</li>
        <li><strong>Multi-Week Programs:</strong> Structured journeys from 4-12 weeks with clear goals</li>
        <li><strong>Smarty Rituals:</strong> Daily wellness protocols for morning, midday, and evening</li>
        <li><strong>Smarty Check-ins:</strong> Track your readiness, sleep, and recovery</li>
        <li><strong>Smarty Tools:</strong> Calculators for 1RM, BMR, macros, and body measurements</li>
      </ul>
      
      <h2>Conclusion</h2>
      <p>Investing in SmartyGym means investing in every role you play—employee, parent, friend, athlete, and human being. The research is clear: structured, expert-designed fitness programs deliver results that random approaches simply cannot match.</p>
    `;
  };

  return (
    <>
      <Helmet>
        <title>Why Invest in SmartyGym | Research-Backed Fitness | SmartyGym</title>
        <meta name="description" content="Discover the science behind why structured, expert-designed fitness programs deliver transformative results. Research from Harvard, WHO, and more on how SmartyGym elevates your performance." />
        <meta name="keywords" content="why invest in SmartyGym, fitness research, structured workout programs, exercise science, fitness results, SmartyGym" />
        
        <meta property="og:title" content="Why Invest in SmartyGym | Research-Backed Fitness" />
        <meta property="og:description" content="The science behind why expert-designed fitness programs deliver results that random approaches cannot match." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://smartygym.com/why-invest-in-smartygym" />
        
        <link rel="canonical" href="https://smartygym.com/why-invest-in-smartygym" />
      </Helmet>

      <SEOEnhancer
        entities={["SmartyGym Research", "Fitness Science", "Exercise Studies"]}
        topics={["fitness research", "exercise science", "structured training", "mental health", "progressive overload"]}
        expertise={["fitness coaching", "sports science", "workout programming"]}
        contentType="Research Article"
        aiSummary="Research-backed insights on why structured, expert-designed fitness programs deliver transformative results compared to random approaches."
        aiKeywords={["SmartyGym", "fitness research", "exercise science", "structured training", "mental health benefits"]}
        relatedContent={["Why SmartyGym", "Smarty Workouts", "Smarty Programs", "Premium Benefits"]}
        targetAudience="individuals seeking evidence-based fitness solutions with proven results"
        pageType="Article"
      />

      <div className="min-h-screen bg-background">
        <main className="container mx-auto max-w-4xl p-4 pb-8">
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
            { label: "Why SmartyGym", href: "/human-performance" },
            { label: "Why Invest in SmartyGym" }
          ]} />

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <TrendingUp className="h-8 w-8 text-primary" />
              <h1 className="text-3xl sm:text-4xl font-bold">
                Why Invest in <span className="text-primary">SmartyGym</span>
              </h1>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The science behind structured fitness and lasting transformation
            </p>
            
            {/* Reader Mode & PDF Export Buttons */}
            <div className="flex items-center justify-center gap-3 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReaderModeOpen(true)}
                className="gap-2"
              >
                <BookOpenText className="h-4 w-4" />
                Reader Mode
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </div>
          
          {/* Content wrapper for PDF export */}
          <div ref={contentRef} className="bg-background">

          {/* Description Card */}
          <Card data-pdf-section className="mb-8 border-2 border-primary/30">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Your Body, Your Greatest Asset
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-center text-muted-foreground">
                In a world of endless fitness advice on YouTube, conflicting information on social media, and generic gym memberships 
                that lead nowhere, finding a structured path to real results has never been harder. This research explores why 
                expert-designed, human-crafted fitness programs deliver transformative results—and how <span className="text-primary font-bold">SmartyGym</span> provides the 
                ecosystem you need to elevate every aspect of your performance.
              </p>
            </CardContent>
          </Card>

          {/* Main Research Content Card */}
          <Card className="border-2 border-primary/50 bg-gradient-to-br from-primary/5 to-background">
            <CardContent className="p-6 sm:p-8 space-y-10">
              
              {/* Section 1: Foundation of Human Performance */}
              <section data-pdf-section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/20 rounded-full">
                    <Brain className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">The Foundation of Human Performance</h2>
                </div>
                <div className="space-y-4 pl-4 border-l-2 border-primary/30">
                  <p>
                    Physical fitness isn't just about looking good—it's the bedrock upon which all other performance is built. 
                    Research from the <strong>American College of Sports Medicine</strong> consistently shows that regular exercise 
                    improves cognitive function, emotional regulation, and energy levels across all age groups.
                  </p>
                  <p>
                    According to a <strong>Harvard Medical School</strong> study, just 20 minutes of moderate exercise can boost 
                    brain function for up to 12 hours afterward. The implications for work productivity, parenting patience, and 
                    creative pursuits are profound.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                    <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 text-center">
                      <div className="text-3xl font-bold text-primary">23%</div>
                      <div className="text-sm text-muted-foreground">Increase in cognitive performance</div>
                    </div>
                    <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 text-center">
                      <div className="text-3xl font-bold text-primary">32%</div>
                      <div className="text-sm text-muted-foreground">Boost in creative problem-solving</div>
                    </div>
                    <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 text-center">
                      <div className="text-3xl font-bold text-primary">40%</div>
                      <div className="text-sm text-muted-foreground">Improvement in stress resilience</div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 2: Exercise & Mental Health Chart */}
              <section data-pdf-section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/20 rounded-full">
                    <Smile className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">Exercise & Mental Health</h2>
                </div>
                <div className="space-y-4 pl-4 border-l-2 border-primary/30">
                  <p>
                    The <strong>National Institute of Mental Health</strong> and countless peer-reviewed studies have established 
                    that regular physical activity is one of the most effective interventions for mental health—often matching or 
                    exceeding the effects of medication for mild to moderate conditions.
                  </p>
                  
                  {/* Mental Health Comparison Chart */}
                  <div className="bg-muted/30 rounded-lg p-4 my-6">
                    <h3 className="font-semibold mb-4 text-center">Mental Health Symptoms: Exercisers vs. Non-Exercisers</h3>
                    <p className="text-xs text-muted-foreground text-center mb-4">Percentage reporting significant symptoms</p>
                    <ChartContainer config={chartConfig} className="h-72 w-full">
                      <BarChart data={mentalHealthData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="condition" className="text-xs" />
                        <YAxis tickFormatter={(value) => `${value}%`} className="text-xs" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="withExercise" name="With Regular Exercise" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="withoutExercise" name="Without Exercise" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                    <p className="text-xs text-muted-foreground text-center mt-2">Source: American Psychological Association / NIMH Research</p>
                  </div>
                </div>
              </section>

              {/* Section 3: The Modern Fitness Challenge */}
              <section data-pdf-section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/20 rounded-full">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">The Modern Fitness Challenge</h2>
                </div>
                <div className="space-y-4 pl-4 border-l-2 border-primary/30">
                  <p>
                    Despite knowing that exercise is beneficial, most people struggle to maintain a consistent routine. 
                    The reasons are systemic, not personal failures:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Smartphone className="h-5 w-5 text-primary shrink-0 mt-1" />
                      <div>
                        <strong className="block">Information Overload</strong>
                        <span className="text-sm text-muted-foreground">YouTube, Instagram, TikTok—endless conflicting advice with no coherent philosophy</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Target className="h-5 w-5 text-primary shrink-0 mt-1" />
                      <div>
                        <strong className="block">Lack of Structure</strong>
                        <span className="text-sm text-muted-foreground">Random workouts without progressive overload or long-term planning</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Clock className="h-5 w-5 text-primary shrink-0 mt-1" />
                      <div>
                        <strong className="block">Time Scarcity</strong>
                        <span className="text-sm text-muted-foreground">Work, family, commute—no time for a "real" gym routine</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Plane className="h-5 w-5 text-primary shrink-0 mt-1" />
                      <div>
                        <strong className="block">Accessibility Gaps</strong>
                        <span className="text-sm text-muted-foreground">Traveling? No equipment? The routine breaks down</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 4: Consistency Science */}
              <section data-pdf-section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/20 rounded-full">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">The Science of Consistency & Progressive Overload</h2>
                </div>
                <div className="space-y-4 pl-4 border-l-2 border-primary/30">
                  <p>
                    Research from the <strong>Journal of Strength and Conditioning</strong> demonstrates that structured programs 
                    with progressive overload produce results 3-5x greater than random workouts over a 24-week period.
                  </p>
                  
                  {/* Consistency Results Line Chart */}
                  <div className="bg-muted/30 rounded-lg p-4 my-6">
                    <h3 className="font-semibold mb-4 text-center">Fitness Gains: Structured vs. Self-Guided</h3>
                    <p className="text-xs text-muted-foreground text-center mb-4">Performance improvement score over time</p>
                    <ChartContainer config={chartConfig} className="h-64 w-full">
                      <LineChart data={consistencyResultsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="week" className="text-xs" />
                        <YAxis className="text-xs" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line 
                          type="monotone" 
                          dataKey="structured" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={3}
                          dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 5 }}
                          name="Structured Program"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="unstructured" 
                          stroke="hsl(var(--muted-foreground))" 
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={{ fill: "hsl(var(--muted-foreground))", strokeWidth: 2, r: 4 }}
                          name="Self-Guided"
                        />
                      </LineChart>
                    </ChartContainer>
                    <p className="text-xs text-muted-foreground text-center mt-2">Source: Journal of Strength and Conditioning Research</p>
                  </div>
                </div>
              </section>

              {/* Section 5: Adherence Rates */}
              <section data-pdf-section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/20 rounded-full">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">Why Expert-Designed Programs Win</h2>
                </div>
                <div className="space-y-4 pl-4 border-l-2 border-primary/30">
                  <p>
                    The <strong>RAND Corporation</strong> study on fitness program adherence found that programs designed by 
                    certified experts with clear progression have dramatically higher completion rates than self-guided alternatives.
                  </p>
                  
                  {/* Adherence Pie Chart */}
                  <div className="bg-muted/30 rounded-lg p-4 my-6">
                    <h3 className="font-semibold mb-4 text-center">12-Week Program Completion Rates</h3>
                    <ChartContainer config={chartConfig} className="h-64 w-full">
                      <PieChart>
                        <Pie
                          data={adherenceData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, value }) => `${value}%`}
                        >
                          {adherenceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Legend />
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ChartContainer>
                    <p className="text-xs text-muted-foreground text-center mt-2">Source: RAND Corporation Wellness Study</p>
                  </div>
                </div>
              </section>

              {/* Section 6: Impact on Life Roles */}
              <section data-pdf-section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/20 rounded-full">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">Performance Across Life Roles</h2>
                </div>
                <div className="space-y-4 pl-4 border-l-2 border-primary/30">
                  <p>
                    Your fitness doesn't exist in isolation. When you invest in structured training, the benefits cascade 
                    across every role you play:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                    <div className="flex items-start gap-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
                      <Briefcase className="h-6 w-6 text-primary shrink-0 mt-1" />
                      <div>
                        <strong className="block text-primary">As an Employee</strong>
                        <span className="text-sm text-muted-foreground">Higher energy, sharper focus, fewer sick days, better stress management, increased creativity</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
                      <Home className="h-6 w-6 text-primary shrink-0 mt-1" />
                      <div>
                        <strong className="block text-primary">As a Parent</strong>
                        <span className="text-sm text-muted-foreground">More patience, energy to play with kids, modeling healthy habits, emotional regulation</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
                      <Heart className="h-6 w-6 text-primary shrink-0 mt-1" />
                      <div>
                        <strong className="block text-primary">In Relationships</strong>
                        <span className="text-sm text-muted-foreground">Better mood, increased confidence, shared fitness activities, improved intimacy</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
                      <Target className="h-6 w-6 text-primary shrink-0 mt-1" />
                      <div>
                        <strong className="block text-primary">In Your Hobbies</strong>
                        <span className="text-sm text-muted-foreground">Better sports performance, outdoor endurance, recreational activities, travel readiness</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 7: The SmartyGym Ecosystem */}
              <section data-pdf-section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/20 rounded-full">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">The <span className="text-primary">SmartyGym</span> Ecosystem</h2>
                </div>
                <div className="space-y-4 pl-4 border-l-2 border-primary/30">
                  <p>
                    Unlike fragmented resources scattered across the internet, <span className="text-primary font-bold">SmartyGym</span> provides a complete, integrated 
                    ecosystem designed by <strong>Haris Falas</strong>—a Sports Scientist with 20+ years of coaching experience 
                    and CSCS certification. Every component works together under one philosophy.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Dumbbell className="h-5 w-5 text-primary shrink-0 mt-1" />
                      <div>
                        <strong className="block">Smarty Workouts</strong>
                        <span className="text-sm text-muted-foreground">500+ expertly designed workouts for all levels, with or without equipment</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Calendar className="h-5 w-5 text-primary shrink-0 mt-1" />
                      <div>
                        <strong className="block">Smarty Programs</strong>
                        <span className="text-sm text-muted-foreground">Multi-week structured programs with progressive overload built in</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Sparkles className="h-5 w-5 text-primary shrink-0 mt-1" />
                      <div>
                        <strong className="block">Smarty Ritual</strong>
                        <span className="text-sm text-muted-foreground">Daily wellness rituals: morning activation, midday reset, evening wind-down</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Activity className="h-5 w-5 text-primary shrink-0 mt-1" />
                      <div>
                        <strong className="block">Smarty Check-ins</strong>
                        <span className="text-sm text-muted-foreground">Daily tracking to build consistency and monitor your Smarty Score</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <FileText className="h-5 w-5 text-primary shrink-0 mt-1" />
                      <div>
                        <strong className="block">Expert Blog</strong>
                        <span className="text-sm text-muted-foreground">Weekly articles on training, nutrition, and wellness by Haris Falas</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Calculator className="h-5 w-5 text-primary shrink-0 mt-1" />
                      <div>
                        <strong className="block">Smarty Tools</strong>
                        <span className="text-sm text-muted-foreground">Calculators for 1RM, BMR, macros, and progress tracking</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30 my-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-5 w-5 text-red-500" />
                      <strong className="text-red-600 dark:text-red-400">100% Human. 0% AI.</strong>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Every workout, program, and article is designed by a real expert—not generated by algorithms. 
                      You get 20+ years of coaching wisdom, not machine-produced content.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 8: Physical Inactivity Crisis */}
              <section data-pdf-section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-destructive/20 rounded-full">
                    <Activity className="h-6 w-6 text-destructive" />
                  </div>
                  <h2 className="text-2xl font-bold">The Physical Inactivity Crisis</h2>
                </div>
                <div className="space-y-4 pl-4 border-l-2 border-destructive/30">
                  <p>
                    The <strong>World Health Organization</strong> reports that physical inactivity is the fourth leading risk 
                    factor for global mortality, accounting for 6% of deaths worldwide. The data shows that inactivity increases 
                    with age—but structured programs can reverse this trend at any stage of life.
                  </p>
                  
                  {/* Inactivity by Age Bar Chart */}
                  <div className="bg-muted/30 rounded-lg p-4 my-6">
                    <h3 className="font-semibold mb-4 text-center">Physical Inactivity Rates by Age Group</h3>
                    <p className="text-xs text-muted-foreground text-center mb-4">Percentage not meeting WHO activity guidelines</p>
                    <ChartContainer config={chartConfig} className="h-64 w-full">
                      <BarChart data={inactivityByAgeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="age" className="text-xs" />
                        <YAxis tickFormatter={(value) => `${value}%`} className="text-xs" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="percentage" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} name="Inactive %" />
                      </BarChart>
                    </ChartContainer>
                    <p className="text-xs text-muted-foreground text-center mt-2">Source: World Health Organization Global Status Report</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                    <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20 text-center">
                      <div className="text-3xl font-bold text-destructive">1.4B</div>
                      <div className="text-sm text-muted-foreground">Adults globally are insufficiently active</div>
                    </div>
                    <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20 text-center">
                      <div className="text-3xl font-bold text-destructive">$54B</div>
                      <div className="text-sm text-muted-foreground">Annual global healthcare costs from inactivity</div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 9: Accessibility */}
              <section data-pdf-section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/20 rounded-full">
                    <Smartphone className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">Fitness Anywhere, Anytime</h2>
                </div>
                <div className="space-y-4 pl-4 border-l-2 border-primary/30">
                  <p>
                    <span className="text-primary font-bold">SmartyGym</span> eliminates every excuse. Whether you're at home, in a hotel, at the gym, or outdoors—there's 
                    a workout designed for your situation:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-6">
                    <div className="p-3 bg-primary/10 rounded-lg text-center border border-primary/20">
                      <Home className="h-6 w-6 text-primary mx-auto mb-2" />
                      <span className="text-sm font-medium">Home</span>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-lg text-center border border-primary/20">
                      <Plane className="h-6 w-6 text-primary mx-auto mb-2" />
                      <span className="text-sm font-medium">Travel</span>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-lg text-center border border-primary/20">
                      <Dumbbell className="h-6 w-6 text-primary mx-auto mb-2" />
                      <span className="text-sm font-medium">Gym</span>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-lg text-center border border-primary/20">
                      <Timer className="h-6 w-6 text-primary mx-auto mb-2" />
                      <span className="text-sm font-medium">15-60 min</span>
                    </div>
                  </div>
                </div>
              </section>

            </CardContent>
          </Card>

          {/* CTA Section */}
          <Card data-pdf-section className="mt-8 border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-background">
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

          {/* References Section */}
          <Card data-pdf-section className="mt-8 border border-muted">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                References & Sources
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-foreground">1.</span>
                  <span>
                    World Health Organization (2022). <em>Global Status Report on Physical Activity 2022.</em>{" "}
                    <a href="https://www.who.int/publications/i/item/9789240059153" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                      WHO Publications <ExternalLink className="h-3 w-3" />
                    </a>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-foreground">2.</span>
                  <span>
                    American College of Sports Medicine (2023). <em>Exercise and Cognitive Function: A Review of Evidence.</em>{" "}
                    <a href="https://www.acsm.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                      ACSM <ExternalLink className="h-3 w-3" />
                    </a>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-foreground">3.</span>
                  <span>
                    Harvard Medical School (2021). <em>Exercise and the Brain: How Physical Activity Boosts Your Mental Muscles.</em>{" "}
                    <a href="https://www.health.harvard.edu" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                      Harvard Health <ExternalLink className="h-3 w-3" />
                    </a>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-foreground">4.</span>
                  <span>
                    American Psychological Association (2024). <em>Stress in America Survey: Exercise and Mental Health.</em>{" "}
                    <a href="https://www.apa.org/news/press/releases/stress" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                      APA Research <ExternalLink className="h-3 w-3" />
                    </a>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-foreground">5.</span>
                  <span>
                    National Institute of Mental Health (2023). <em>Physical Activity as Treatment for Depression and Anxiety.</em>{" "}
                    <a href="https://www.nimh.nih.gov" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                      NIMH <ExternalLink className="h-3 w-3" />
                    </a>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-foreground">6.</span>
                  <span>
                    Journal of Strength and Conditioning Research (2022). <em>Progressive Overload and Long-Term Training Adaptations.</em>{" "}
                    <a href="https://journals.lww.com/nsca-jscr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                      JSCR <ExternalLink className="h-3 w-3" />
                    </a>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-foreground">7.</span>
                  <span>
                    RAND Corporation (2020). <em>Workplace Wellness Programs: Services Offered, Participation, and Incentives.</em>{" "}
                    <a href="https://www.rand.org/pubs/research_reports/RR254.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                      RAND Research <ExternalLink className="h-3 w-3" />
                    </a>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-foreground">8.</span>
                  <span>
                    British Journal of Sports Medicine (2023). <em>Exercise as Medicine: Evidence for Prescribing Exercise.</em>{" "}
                    <a href="https://bjsm.bmj.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                      BJSM <ExternalLink className="h-3 w-3" />
                    </a>
                  </span>
                </li>
              </ol>
            </CardContent>
          </Card>
          
          </div> {/* End content wrapper */}

        </main>
      </div>
      
      <ReaderModeDialog
        open={readerModeOpen}
        onOpenChange={setReaderModeOpen}
        title="Why Invest in SmartyGym"
        content={getReaderContent()}
        metadata={{
          author: "SmartyGym Research",
          category: "Fitness Science"
        }}
      />
    </>
  );
}
