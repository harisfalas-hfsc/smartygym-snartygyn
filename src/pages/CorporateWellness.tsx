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
  Lightbulb
} from "lucide-react";
import { useShowBackButton } from "@/hooks/useShowBackButton";
import { SEOEnhancer } from "@/components/SEOEnhancer";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";

export default function CorporateWellness() {
  const { canGoBack, goBack } = useShowBackButton();

  return (
    <>
      <Helmet>
        <title>Why Invest in Employee Wellness? | Corporate Research | SmartyGym</title>
        <meta name="description" content="Discover the research-backed benefits of corporate wellness programs. Learn how investing in employee health improves productivity, reduces costs, and builds stronger teams." />
        <meta name="keywords" content="corporate wellness research, employee health benefits, workplace fitness, productivity improvement, team building, Forbes wellness, healthy employees" />
        
        <meta property="og:title" content="Why Invest in Employee Wellness? | SmartyGym Corporate" />
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
            { label: "Why Invest in Wellness?" }
          ]} />

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Lightbulb className="h-8 w-8 text-green-500" />
              <h1 className="text-3xl sm:text-4xl font-bold">Why Invest in Employee Wellness?</h1>
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
                    According to <strong>Forbes magazine</strong>, big and successful companies worldwide have integrated physical activity 
                    into their culture—and specifically exercise—as a means of optimizing the performance of their staff, not only during 
                    work, but also during the rest of their day. Additionally, these companies are currently looking to find ways to 
                    reduce their healthcare expenses as well as to strengthen the spirit and productivity of their staff.
                  </p>
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

              {/* Section 4: Workplace Impact Stats */}
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
                    into business costs and lost productivity:
                  </p>
                  
                  <div className="bg-muted/30 rounded-lg p-6 my-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-red-500" />
                      Key Statistics
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-background rounded-lg border">
                        <div className="text-3xl font-bold text-red-500">4-6 days</div>
                        <div className="text-sm text-muted-foreground">Average sick leave per employee annually due to lifestyle-related illness</div>
                      </div>
                      <div className="p-4 bg-background rounded-lg border">
                        <div className="text-3xl font-bold text-red-500">12%</div>
                        <div className="text-sm text-muted-foreground">Productivity loss from employees working while unwell (presenteeism)</div>
                      </div>
                      <div className="p-4 bg-background rounded-lg border">
                        <div className="text-3xl font-bold text-red-500">€2,500+</div>
                        <div className="text-sm text-muted-foreground">Average annual cost per smoker employee in lost productivity</div>
                      </div>
                      <div className="p-4 bg-background rounded-lg border">
                        <div className="text-3xl font-bold text-red-500">35%</div>
                        <div className="text-sm text-muted-foreground">Higher healthcare costs for sedentary vs. active employees</div>
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
        </main>
      </div>
    </>
  );
}