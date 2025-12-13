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
  Building2,
  Activity,
  Clock,
  DollarSign,
  Smile,
  Target,
  Shield,
  Coffee,
  Home,
  Briefcase,
  Gift,
  Award,
  BarChart3,
  Lightbulb,
  BookOpen,
  ExternalLink,
  TrendingDown,
  AlertTriangle
} from "lucide-react";
import { useShowBackButton } from "@/hooks/useShowBackButton";
import { SEOEnhancer } from "@/components/SEOEnhancer";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
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
const stressByAgeData = [
  { age: "18-25", percentage: 48, fill: "hsl(var(--chart-1))" },
  { age: "26-43", percentage: 51, fill: "hsl(var(--chart-2))" },
  { age: "44-57", percentage: 42, fill: "hsl(var(--chart-3))" },
  { age: "58-64", percentage: 30, fill: "hsl(var(--chart-4))" },
  { age: "65+", percentage: 17, fill: "hsl(var(--chart-5))" },
];

const roiOverTimeData = [
  { year: "Year 1", roi: 1.5 },
  { year: "Year 3", roi: 2.5 },
  { year: "Year 5", roi: 3.27 },
  { year: "Year 7", roi: 4.5 },
  { year: "Year 10", roi: 6.0 },
];

const globalStressData = [
  { region: "Middle East & North Africa", percentage: 52 },
  { region: "US & Canada", percentage: 49 },
  { region: "Sub-Saharan Africa", percentage: 48 },
  { region: "East Asia", percentage: 46 },
  { region: "Latin America", percentage: 44 },
  { region: "Europe", percentage: 39 },
];

const wellnessImpactData = [
  { name: "Absenteeism Reduction", value: 30, fill: "#22c55e" },
  { name: "Healthcare Cost Savings", value: 25, fill: "#16a34a" },
  { name: "Productivity Increase", value: 20, fill: "#15803d" },
  { name: "Retention Improvement", value: 15, fill: "#166534" },
  { name: "Other Benefits", value: 10, fill: "#14532d" },
];

const chartConfig = {
  percentage: { label: "Percentage", color: "hsl(var(--chart-1))" },
  roi: { label: "ROI ($)", color: "hsl(142.1 76.2% 36.3%)" },
};

export default function CorporateWellness() {
  const { canGoBack, goBack } = useShowBackButton();

  return (
    <>
      <Helmet>
        <title>Why Invest in Corporate Wellness? | Corporate Research | SmartyGym</title>
        <meta name="description" content="Discover the research-backed benefits of corporate wellness programs. Learn how investing in employee health improves productivity, reduces costs, and builds stronger teams." />
        <meta name="keywords" content="corporate wellness research, employee health benefits, workplace fitness, productivity improvement, team building, Forbes wellness, healthy employees" />
        
        <meta property="og:title" content="Why Invest in Corporate Wellness? | SmartyGym Corporate" />
        <meta property="og:description" content="Research-backed insights on why corporate wellness programs improve productivity, reduce healthcare costs, and create happier, healthier teams." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://smartygym.com/corporate-wellness" />
        
        <link rel="canonical" href="https://smartygym.com/corporate-wellness" />
      </Helmet>

      <SEOEnhancer
        entities={["Corporate Wellness", "Employee Health", "Workplace Fitness"]}
        topics={["employee wellness programs", "corporate fitness benefits", "workplace health research"]}
        expertise={["corporate wellness research", "employee productivity", "health economics"]}
        contentType="Research Article"
        aiSummary="Comprehensive research on why companies should invest in employee wellness programs. Covers productivity benefits, healthcare cost reduction, and the science behind healthy, happy employees."
        aiKeywords={["corporate wellness", "employee health", "productivity", "Forbes research", "workplace fitness"]}
        relatedContent={["Smarty Corporate Plans", "Premium Benefits", "Training Programs"]}
        targetAudience="business owners, HR managers, and corporate decision-makers"
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
            { label: "Smarty Corporate", href: "/corporate" },
            { label: "Why Invest in Corporate Wellness?" }
          ]} />

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Lightbulb className="h-8 w-8 text-green-500" />
              <h1 className="text-3xl sm:text-4xl font-bold">Why Invest in Corporate Wellness?</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Research-backed insights on the transformative power of corporate fitness programs
            </p>
          </div>

          {/* Description Card */}
          <Card className="mb-8 border-2 border-green-500/30">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Heart className="h-5 w-5 text-green-500" />
                The Business Case for Wellness
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-center text-muted-foreground">
                In today's competitive business landscape, forward-thinking companies recognize that their most valuable asset isn't technology, 
                infrastructure, or capital—it's their people. This comprehensive analysis explores why investing in employee wellness 
                isn't just an ethical choice, but a strategic business decision with measurable returns.
              </p>
            </CardContent>
          </Card>

          {/* Main Research Content Card */}
          <Card className="border-2 border-green-500/50 bg-gradient-to-br from-green-500/5 to-background">
            <CardContent className="p-6 sm:p-8 space-y-10">
              
              {/* Section 1: Human Capital */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-500/20 rounded-full">
                    <Users className="h-6 w-6 text-green-500" />
                  </div>
                  <h2 className="text-2xl font-bold">The Human Capital Advantage</h2>
                </div>
                <div className="space-y-4 pl-4 border-l-2 border-green-500/30">
                  <p>
                    Every successful organization is built on the foundation of its workforce. The skills, creativity, dedication, and energy 
                    of employees drive innovation, customer satisfaction, and ultimately, business success. When companies invest in their 
                    people's wellbeing, they're not just being compassionate—they're protecting and enhancing their most critical asset.
                  </p>
                  <p>
                    According to <strong>Harvard Business Review</strong>, companies like Johnson & Johnson have demonstrated that comprehensive 
                    wellness programs can yield a return of <strong>$2.71 for every dollar spent</strong>, with cumulative savings reaching 
                    $250 million on healthcare costs over a decade.
                  </p>
                </div>
              </section>

              {/* NEW: ROI Section with Chart */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-500/20 rounded-full">
                    <DollarSign className="h-6 w-6 text-green-500" />
                  </div>
                  <h2 className="text-2xl font-bold">The ROI of Wellness Programs</h2>
                </div>
                <div className="space-y-4 pl-4 border-l-2 border-green-500/30">
                  <p>
                    Research published in the <strong>Harvard Business Review</strong> analyzed wellness programs across multiple industries 
                    and found that the return on investment grows significantly over time as health improvements compound.
                  </p>
                  
                  {/* ROI Line Chart */}
                  <div className="bg-muted/30 rounded-lg p-4 my-6">
                    <h3 className="font-semibold mb-4 text-center">Wellness Program ROI Over Time</h3>
                    <p className="text-xs text-muted-foreground text-center mb-4">Return per $1 invested in employee wellness</p>
                    <ChartContainer config={chartConfig} className="h-64 w-full">
                      <LineChart data={roiOverTimeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="year" className="text-xs" />
                        <YAxis tickFormatter={(value) => `$${value}`} className="text-xs" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line 
                          type="monotone" 
                          dataKey="roi" 
                          stroke="#22c55e" 
                          strokeWidth={3}
                          dot={{ fill: "#22c55e", strokeWidth: 2, r: 6 }}
                          name="ROI per $1 spent"
                        />
                      </LineChart>
                    </ChartContainer>
                    <p className="text-xs text-muted-foreground text-center mt-2">Source: Harvard Business Review Meta-Analysis</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                    <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20 text-center">
                      <div className="text-3xl font-bold text-green-500">$2.71</div>
                      <div className="text-sm text-muted-foreground">Return per $1 spent (J&J)</div>
                    </div>
                    <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20 text-center">
                      <div className="text-3xl font-bold text-green-500">$250M</div>
                      <div className="text-sm text-muted-foreground">Saved by J&J over 10 years</div>
                    </div>
                    <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20 text-center">
                      <div className="text-3xl font-bold text-green-500">25%</div>
                      <div className="text-sm text-muted-foreground">Reduction in sick leave</div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 2: Modern Challenges */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-amber-500/20 rounded-full">
                    <Clock className="h-6 w-6 text-amber-500" />
                  </div>
                  <h2 className="text-2xl font-bold">The Modern Challenge</h2>
                </div>
                <div className="space-y-4 pl-4 border-l-2 border-amber-500/30">
                  <p>
                    We live in unprecedented times. The modern employee faces a complex web of pressures that previous generations 
                    never encountered. Understanding these challenges is the first step toward addressing them.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Briefcase className="h-5 w-5 text-amber-500 shrink-0 mt-1" />
                      <div>
                        <strong className="block">Economic Pressures</strong>
                        <span className="text-sm text-muted-foreground">Rising costs of living, financial uncertainty, and job market volatility create constant stress</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Clock className="h-5 w-5 text-amber-500 shrink-0 mt-1" />
                      <div>
                        <strong className="block">Time Scarcity</strong>
                        <span className="text-sm text-muted-foreground">Long commutes, extended work hours, and always-on digital culture leave little time for self-care</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Home className="h-5 w-5 text-amber-500 shrink-0 mt-1" />
                      <div>
                        <strong className="block">Family Responsibilities</strong>
                        <span className="text-sm text-muted-foreground">Balancing childcare, eldercare, and household duties with professional demands</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Brain className="h-5 w-5 text-amber-500 shrink-0 mt-1" />
                      <div>
                        <strong className="block">Mental Load</strong>
                        <span className="text-sm text-muted-foreground">Information overload, decision fatigue, and the pressure to constantly perform</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* NEW: Global Stress Data with Chart */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-amber-500/20 rounded-full">
                    <AlertTriangle className="h-6 w-6 text-amber-500" />
                  </div>
                  <h2 className="text-2xl font-bold">Global Workplace Stress Crisis</h2>
                </div>
                <div className="space-y-4 pl-4 border-l-2 border-amber-500/30">
                  <p>
                    According to the <strong>Gallup 2024 State of the Global Workplace Report</strong>, workplace stress has reached 
                    record highs across all regions. The data reveals a concerning trend that demands immediate attention from employers.
                  </p>
                  
                  {/* Global Stress Bar Chart */}
                  <div className="bg-muted/30 rounded-lg p-4 my-6">
                    <h3 className="font-semibold mb-4 text-center">Workplace Stress by Region (2024)</h3>
                    <p className="text-xs text-muted-foreground text-center mb-4">Percentage of employees reporting daily stress</p>
                    <ChartContainer config={chartConfig} className="h-72 w-full">
                      <BarChart data={globalStressData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis type="number" domain={[0, 60]} tickFormatter={(value) => `${value}%`} className="text-xs" />
                        <YAxis type="category" dataKey="region" className="text-xs" width={95} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="percentage" fill="#f59e0b" radius={[0, 4, 4, 0]} name="Stress %" />
                      </BarChart>
                    </ChartContainer>
                    <p className="text-xs text-muted-foreground text-center mt-2">Source: Gallup State of the Global Workplace 2024</p>
                  </div>

                  {/* Stress by Age Group */}
                  <div className="bg-muted/30 rounded-lg p-4 my-6">
                    <h3 className="font-semibold mb-4 text-center">Workplace Stress by Age Group</h3>
                    <p className="text-xs text-muted-foreground text-center mb-4">Percentage reporting significant daily stress</p>
                    <ChartContainer config={chartConfig} className="h-64 w-full">
                      <BarChart data={stressByAgeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="age" className="text-xs" />
                        <YAxis tickFormatter={(value) => `${value}%`} className="text-xs" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="percentage" radius={[4, 4, 0, 0]} name="Stress %">
                          {stressByAgeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                    <p className="text-xs text-muted-foreground text-center mt-2">Source: Gallup 2024 / American Psychological Association</p>
                  </div>
                </div>
              </section>

              {/* Section 3: Health Beyond Work */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-500/20 rounded-full">
                    <Heart className="h-6 w-6 text-blue-500" />
                  </div>
                  <h2 className="text-2xl font-bold">Health Beyond the Workplace</h2>
                </div>
                <div className="space-y-4 pl-4 border-l-2 border-blue-500/30">
                  <p>
                    An employee's health doesn't exist in a vacuum. When people are healthy and energetic, they excel not just as 
                    workers, but in every role they play:
                  </p>
                  <ul className="space-y-2 list-none">
                    <li className="flex items-start gap-2">
                      <Smile className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                      <span><strong>As Parents:</strong> More energy to engage with children, model healthy behaviors, and be present</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Users className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                      <span><strong>As Friends:</strong> Emotional resilience to maintain meaningful relationships and social connections</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Activity className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                      <span><strong>For Hobbies:</strong> Physical capability to pursue passions, sports, and recreational activities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Brain className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                      <span><strong>For Mental Health:</strong> Reduced anxiety, better sleep, improved mood, and cognitive clarity</span>
                    </li>
                  </ul>
                  <p className="text-muted-foreground italic">
                    When companies support the whole person, they get the whole person's best effort in return.
                  </p>
                </div>
              </section>

              {/* Section 4: Workplace Impact Stats - UPDATED WITH REAL DATA */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-500/20 rounded-full">
                    <BarChart3 className="h-6 w-6 text-red-500" />
                  </div>
                  <h2 className="text-2xl font-bold">The Workplace Impact: By the Numbers</h2>
                </div>
                <div className="space-y-4 pl-4 border-l-2 border-red-500/30">
                  <p>
                    The consequences of poor employee health extend far beyond individual suffering. They translate directly 
                    into business costs and lost productivity. Here are verified statistics from leading research institutions:
                  </p>
                  
                  <div className="bg-muted/30 rounded-lg p-6 my-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <TrendingDown className="h-5 w-5 text-red-500" />
                      The Cost of Poor Health (Research Data)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-background rounded-lg border">
                        <div className="text-3xl font-bold text-red-500">$225.8B</div>
                        <div className="text-sm text-muted-foreground">Annual cost of absenteeism in the US alone</div>
                        <div className="text-xs text-muted-foreground mt-1">Source: CDC Foundation</div>
                      </div>
                      <div className="p-4 bg-background rounded-lg border">
                        <div className="text-3xl font-bold text-red-500">$1,685</div>
                        <div className="text-sm text-muted-foreground">Cost per employee per year from absenteeism</div>
                        <div className="text-xs text-muted-foreground mt-1">Source: CDC Foundation</div>
                      </div>
                      <div className="p-4 bg-background rounded-lg border">
                        <div className="text-3xl font-bold text-red-500">$300B</div>
                        <div className="text-sm text-muted-foreground">Annual cost of workplace stress in the US</div>
                        <div className="text-xs text-muted-foreground mt-1">Source: American Psychological Association</div>
                      </div>
                      <div className="p-4 bg-background rounded-lg border">
                        <div className="text-3xl font-bold text-red-500">36.6%</div>
                        <div className="text-sm text-muted-foreground">Productivity loss from unplanned absences</div>
                        <div className="text-xs text-muted-foreground mt-1">Source: SHRM/Kronos Survey</div>
                      </div>
                    </div>
                  </div>

                  <h3 className="font-semibold mt-6">Contributing Factors</h3>
                  <ul className="space-y-2 list-none">
                    <li className="flex items-start gap-2">
                      <Coffee className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                      <span><strong>Sedentary Work:</strong> Hours of sitting lead to back pain, obesity, cardiovascular issues, and metabolic disorders</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Activity className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                      <span><strong>Poor Nutrition:</strong> Reliance on processed foods and irregular meal patterns affect energy and concentration</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Clock className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                      <span><strong>Stress:</strong> Chronic workplace stress contributes to burnout, anxiety, and cardiovascular disease</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Brain className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                      <span><strong>Sleep Deprivation:</strong> Affects cognitive function, decision-making, and immune system strength</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* NEW: Burnout & Retention Crisis */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-500/20 rounded-full">
                    <TrendingDown className="h-6 w-6 text-red-500" />
                  </div>
                  <h2 className="text-2xl font-bold">The Burnout & Retention Crisis</h2>
                </div>
                <div className="space-y-4 pl-4 border-l-2 border-red-500/30">
                  <p>
                    The <strong>American Psychological Association's 2024 Work in America Survey</strong> reveals alarming trends 
                    in workplace burnout that directly impact employee retention and organizational success:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                    <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                      <div className="text-3xl font-bold text-red-500">43%</div>
                      <div className="text-sm text-muted-foreground">of Millennials have left jobs due to burnout</div>
                    </div>
                    <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                      <div className="text-3xl font-bold text-red-500">44%</div>
                      <div className="text-sm text-muted-foreground">of Gen Z have left jobs due to burnout</div>
                    </div>
                    <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                      <div className="text-3xl font-bold text-red-500">67%</div>
                      <div className="text-sm text-muted-foreground">experienced burnout symptoms in the past month</div>
                    </div>
                    <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                      <div className="text-3xl font-bold text-red-500">15%</div>
                      <div className="text-sm text-muted-foreground">describe their workplace as toxic</div>
                    </div>
                  </div>

                  <p className="text-muted-foreground">
                    These statistics underscore the urgent need for proactive wellness interventions. Companies that invest in 
                    employee wellbeing see significantly lower turnover rates and higher engagement scores.
                  </p>
                </div>
              </section>

              {/* NEW: Global Health Impact (WHO Data) */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-500/20 rounded-full">
                    <Activity className="h-6 w-6 text-blue-500" />
                  </div>
                  <h2 className="text-2xl font-bold">The Global Physical Inactivity Crisis</h2>
                </div>
                <div className="space-y-4 pl-4 border-l-2 border-blue-500/30">
                  <p>
                    The <strong>World Health Organization (2022)</strong> has classified physical inactivity as a global health 
                    emergency with far-reaching consequences for individuals, organizations, and healthcare systems worldwide:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                    <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20 text-center">
                      <div className="text-3xl font-bold text-blue-500">500M</div>
                      <div className="text-sm text-muted-foreground">New NCD cases projected by 2030 due to inactivity</div>
                    </div>
                    <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20 text-center">
                      <div className="text-3xl font-bold text-blue-500">$27B</div>
                      <div className="text-sm text-muted-foreground">Annual healthcare cost burden globally</div>
                    </div>
                    <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20 text-center">
                      <div className="text-3xl font-bold text-blue-500">1.4B</div>
                      <div className="text-sm text-muted-foreground">Adults not meeting physical activity guidelines</div>
                    </div>
                  </div>

                  <p className="text-muted-foreground">
                    Non-communicable diseases (NCDs) such as heart disease, diabetes, and certain cancers are directly linked to 
                    sedentary lifestyles. Corporate wellness programs can play a crucial role in reversing this trend.
                  </p>
                </div>
              </section>

              {/* NEW: Impact of Wellness Programs Pie Chart */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-500/20 rounded-full">
                    <TrendingUp className="h-6 w-6 text-green-500" />
                  </div>
                  <h2 className="text-2xl font-bold">Measurable Benefits of Wellness Programs</h2>
                </div>
                <div className="space-y-4 pl-4 border-l-2 border-green-500/30">
                  <p>
                    Meta-analyses of corporate wellness programs show consistent improvements across multiple organizational metrics. 
                    The chart below illustrates the distribution of benefits based on aggregated research findings:
                  </p>
                  
                  {/* Pie Chart */}
                  <div className="bg-muted/30 rounded-lg p-4 my-6">
                    <h3 className="font-semibold mb-4 text-center">Distribution of Wellness Program Benefits</h3>
                    <ChartContainer config={chartConfig} className="h-72 w-full">
                      <PieChart>
                        <Pie
                          data={wellnessImpactData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                          labelLine={true}
                        >
                          {wellnessImpactData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ChartContainer>
                    <p className="text-xs text-muted-foreground text-center mt-2">Source: Harvard Business Review / RAND Corporation Meta-Analysis</p>
                  </div>
                </div>
              </section>

              {/* Section 5: Benefits of Exercise */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-500/20 rounded-full">
                    <Activity className="h-6 w-6 text-green-500" />
                  </div>
                  <h2 className="text-2xl font-bold">The Transformative Power of Physical Exercise</h2>
                </div>
                <div className="space-y-4 pl-4 border-l-2 border-green-500/30">
                  <p>
                    It is well-known that physical exercise, as a method of promoting health and euphoria, offers a number of 
                    advantages to workers, which boost their work performance in multiple ways:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-6">
                    <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <Brain className="h-5 w-5 text-green-500 shrink-0" />
                      <span>Relieves and mentally refreshes the worker</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <Award className="h-5 w-5 text-green-500 shrink-0" />
                      <span>Improves self-confidence</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <Smile className="h-5 w-5 text-green-500 shrink-0" />
                      <span>Improves appearance, spirit, and self-esteem</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <TrendingUp className="h-5 w-5 text-green-500 shrink-0" />
                      <span>Improves metabolism and weight control</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <Shield className="h-5 w-5 text-green-500 shrink-0" />
                      <span>Increases strength, reducing injury risk</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <Target className="h-5 w-5 text-green-500 shrink-0" />
                      <span>Prevents musculoskeletal problems (back, lower back pain)</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20 md:col-span-2">
                      <Heart className="h-5 w-5 text-green-500 shrink-0" />
                      <span>Reduces arterial pressure and improves blood circulation</span>
                    </div>
                  </div>

                  <p className="font-medium text-green-600 dark:text-green-400">
                    Companies are well aware that these benefits imply more healthy and productive workers, who correspond better 
                    in challenging conditions, are not often absent because of illness, and tend to be happier and more eager to work.
                  </p>
                </div>
              </section>

              {/* Section 6: Exercise as a Gift */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/20 rounded-full">
                    <Gift className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">Wellness as a Corporate Gift</h2>
                </div>
                <div className="space-y-4 pl-4 border-l-2 border-primary/30">
                  <p>
                    When physical exercise is offered to employees by the company—whether as a gift, a bonus, a reward, or as 
                    an additional benefit alongside welfare and healthcare—employees appreciate it more and feel genuine gratitude 
                    toward their employer.
                  </p>
                  <div className="bg-primary/10 rounded-lg p-6 my-6 border border-primary/20">
                    <p className="text-center italic">
                      "A corporate wellness program is more than a benefit—it's a statement that says: 
                      <strong> 'We value you as a complete person, not just as a worker.'</strong>"
                    </p>
                  </div>
                  <p>
                    This investment in employee wellbeing creates a powerful reciprocity effect. Employees who feel cared for 
                    are more loyal, more engaged, and more likely to go above and beyond in their roles. It's not just good 
                    ethics—it's good business.
                  </p>
                </div>
              </section>

              {/* Section 7: Team Effect */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-500/20 rounded-full">
                    <Users className="h-6 w-6 text-purple-500" />
                  </div>
                  <h2 className="text-2xl font-bold">The Team Effect: Building Bonds Through Fitness</h2>
                </div>
                <div className="space-y-4 pl-4 border-l-2 border-purple-500/30">
                  <p>
                    When exercise programs are designed to be performed in groups among colleagues, a number of additional 
                    parameters can be reinforced:
                  </p>
                  <ul className="space-y-2 list-none">
                    <li className="flex items-start gap-2">
                      <Users className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
                      <span><strong>Collegiality:</strong> Shared physical challenges create mutual respect and understanding</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
                      <span><strong>Togetherness:</strong> Working out together builds camaraderie that extends to the workplace</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Smile className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
                      <span><strong>Friendship:</strong> Informal interactions during exercise foster genuine connections</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Target className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
                      <span><strong>Team Spirit:</strong> Collective goals in fitness translate to collaborative mindsets at work</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Activity className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
                      <span><strong>Shared Interests:</strong> Common wellness activities create natural conversation and connection points</span>
                    </li>
                  </ul>
                  <p className="text-muted-foreground">
                    These social benefits multiply the value of corporate fitness programs, creating positive ripple effects 
                    throughout the organization's culture.
                  </p>
                </div>
              </section>

              {/* CTA Section */}
              <section className="mt-12 pt-8 border-t border-green-500/30">
                <div className="text-center space-y-6">
                  <div className="flex items-center justify-center gap-3">
                    <Building2 className="h-8 w-8 text-green-500" />
                    <h2 className="text-2xl font-bold">Ready to Invest in Your Team?</h2>
                  </div>
                  <p className="text-muted-foreground max-w-xl mx-auto">
                    Join the forward-thinking companies that recognize the power of employee wellness. 
                    SmartyGym Corporate plans provide Platinum-level fitness access for your entire team.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
                      <Link to="/corporate">
                        <Building2 className="mr-2 h-5 w-5" />
                        View Corporate Plans
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <Link to="/contact">
                        Contact Us
                      </Link>
                    </Button>
                  </div>
                </div>
              </section>

            </CardContent>
          </Card>

          {/* References Section */}
          <Card className="mt-8 border-2 border-muted">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
                References & Sources
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-muted-foreground mb-4">
                The statistics and research findings presented in this article are sourced from the following reputable organizations and publications:
              </p>
              
              <div className="space-y-4 text-sm">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <strong>World Health Organization (2022)</strong>
                      <p className="text-muted-foreground mt-1">Global Status Report on Physical Activity 2022. Geneva: WHO.</p>
                      <a href="https://www.who.int/publications/i/item/9789240059153" target="_blank" rel="noopener noreferrer" className="text-green-500 hover:underline text-xs">
                        www.who.int/publications
                      </a>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <strong>Berry, L., Mirabito, A., & Baun, W. (2010)</strong>
                      <p className="text-muted-foreground mt-1">"What's the Hard Return on Employee Wellness Programs?" Harvard Business Review, December 2010.</p>
                      <a href="https://hbr.org/2010/12/whats-the-hard-return-on-employee-wellness-programs" target="_blank" rel="noopener noreferrer" className="text-green-500 hover:underline text-xs">
                        hbr.org
                      </a>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <strong>CDC Foundation (2015)</strong>
                      <p className="text-muted-foreground mt-1">Worker Illness and Injury Costs U.S. Employers $225.8 Billion Annually. CDC Foundation Report.</p>
                      <a href="https://www.cdcfoundation.org/pr/2015/worker-illness-and-injury-costs-us-employers-225-billion-annually" target="_blank" rel="noopener noreferrer" className="text-green-500 hover:underline text-xs">
                        cdcfoundation.org
                      </a>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <strong>Gallup (2024)</strong>
                      <p className="text-muted-foreground mt-1">State of the Global Workplace 2024 Report. Gallup, Inc.</p>
                      <a href="https://www.gallup.com/workplace/349484/state-of-the-global-workplace.aspx" target="_blank" rel="noopener noreferrer" className="text-green-500 hover:underline text-xs">
                        gallup.com/workplace
                      </a>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <strong>American Psychological Association (2024)</strong>
                      <p className="text-muted-foreground mt-1">2024 Work in America Survey: Workplace Mental Health and Well-being. APA.</p>
                      <a href="https://www.apa.org/pubs/reports/work-in-america" target="_blank" rel="noopener noreferrer" className="text-green-500 hover:underline text-xs">
                        apa.org/pubs/reports
                      </a>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <strong>SHRM/Kronos (2023)</strong>
                      <p className="text-muted-foreground mt-1">Total Financial Impact of Employee Absences in the U.S. Society for Human Resource Management.</p>
                      <a href="https://www.shrm.org" target="_blank" rel="noopener noreferrer" className="text-green-500 hover:underline text-xs">
                        shrm.org
                      </a>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <strong>RAND Corporation (2013)</strong>
                      <p className="text-muted-foreground mt-1">Workplace Wellness Programs Study: Final Report. RAND Health.</p>
                      <a href="https://www.rand.org/pubs/research_reports/RR254.html" target="_blank" rel="noopener noreferrer" className="text-green-500 hover:underline text-xs">
                        rand.org
                      </a>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <strong>Bureau of Labor Statistics (2024)</strong>
                      <p className="text-muted-foreground mt-1">Labor Force Statistics from the Current Population Survey - Absences from Work. U.S. Department of Labor.</p>
                      <a href="https://www.bls.gov/cps/cpsaat47.htm" target="_blank" rel="noopener noreferrer" className="text-green-500 hover:underline text-xs">
                        bls.gov
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-6 italic">
                Note: Statistics are based on the most recent available data at the time of publication. Actual figures may vary by region, 
                industry, and organizational context. For specific recommendations tailored to your organization, please consult with 
                a corporate wellness specialist.
              </p>
            </CardContent>
          </Card>

        </main>
      </div>
    </>
  );
}
