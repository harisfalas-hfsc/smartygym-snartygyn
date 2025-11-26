import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";
import { InfoRibbon } from "@/components/InfoRibbon";
import { ArrowLeft, Heart, Dumbbell, Activity, Flame, User, Move, Scale } from "lucide-react";
import { SEOEnhancer } from "@/components/SEOEnhancer";
import { generateBreadcrumbSchema } from "@/utils/seoHelpers";
import { useAccessControl } from "@/hooks/useAccessControl";
import { useShowBackButton } from "@/hooks/useShowBackButton";
import { ScrollReveal } from "@/components/ScrollReveal";
const TrainingProgramFlow = () => {
  const navigate = useNavigate();
  const {
    canGoBack,
    goBack
  } = useShowBackButton();
  const {
    userTier
  } = useAccessControl();
  const isPremium = userTier === "premium";
  const programTypes = [{
    id: "cardio-endurance",
    title: "Cardio Endurance",
    description: "Structured program to build cardiovascular fitness",
    icon: Heart,
    level: "Beginner-Advanced",
    equipment: "Equipment/No Equipment"
  }, {
    id: "functional-strength",
    title: "Functional Strength",
    description: "Structured program for real-world strength and movement",
    icon: Dumbbell,
    level: "Beginner-Advanced",
    equipment: "Equipment/No Equipment"
  }, {
    id: "muscle-hypertrophy",
    title: "Muscle Hypertrophy",
    description: "Structured program focused on muscle growth",
    icon: Activity,
    level: "Beginner-Advanced",
    equipment: "Equipment/No Equipment"
  }, {
    id: "weight-loss",
    title: "Weight Loss",
    description: "Structured program designed for fat loss",
    icon: Flame,
    level: "Beginner-Advanced",
    equipment: "Equipment/No Equipment"
  }, {
    id: "low-back-pain",
    title: "Low Back Pain",
    description: "Structured program to strengthen and rehabilitate",
    icon: User,
    level: "Beginner-Advanced",
    equipment: "Equipment/No Equipment"
  }, {
    id: "mobility-stability",
    title: "Mobility & Stability",
    description: "Structured program for movement quality",
    icon: Move,
    level: "Beginner-Advanced",
    equipment: "Equipment/No Equipment"
  }];
  const handleProgramSelect = (programId: string) => {
    navigate(`/trainingprogram/${programId}`);
  };
  return <>
      <Helmet>
        <title>Online Training Programs | Structured Plans | Haris Falas HFSC | SmartyGym</title>
        <meta name="description" content="Structured online training programs at smartygym.com. Cardio, strength, muscle growth, weight loss, and mobility programs by Sports Scientist Haris Falas HFSC. Long-term gym programs online - train anywhere, anytime." />
        <meta name="keywords" content="online training programs, training programs, gym programs, personal trainer, fitness programs, online gym, HFSC, Haris Falas, Sports Scientist, structured training programs, cardio programs, strength programs, muscle hypertrophy, weight loss programs, mobility programs, gym training online, smartygym.com, HFSC Performance, functional training" />
        
        {/* Greek Language */}
        <link rel="alternate" hrefLang="el" href="https://smartygym.com/trainingprogram" />
        <link rel="alternate" hrefLang="en-GB" href="https://smartygym.com/trainingprogram" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        {canGoBack && <div className="mb-6">
            <Button variant="ghost" size="sm" onClick={goBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="text-xs sm:text-sm">Back</span>
            </Button>
          </div>}
        
        <PageBreadcrumbs items={[{
          label: "Home",
          href: "/"
        }, {
          label: "Training Programs"
        }]} />

        {/* Info Section - About Training Programs */}
        <Card className="mb-8 bg-gradient-to-br from-primary/5 via-background to-primary/5 border-2 border-primary/40 shadow-gold">
          <div className="p-4 sm:p-5">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 text-center">About Our Training Programs</h2>
            <div className="space-y-2 text-muted-foreground max-w-3xl mx-auto">
              <p className="text-sm sm:text-base">
                Our training programs are long-term, structured plans designed to help you achieve your specific fitness goals. Whether you want to lose weight, build muscle, improve functional strength, enhance cardiovascular endurance, rehabilitate from low back pain, or develop better mobility and stability — we have a science-based program for you. These aren't just random workouts — they're strategic, periodized plans that take you from where you are to where you want to be. 
              </p>
              
              <p className="text-sm sm:text-base font-semibold text-foreground text-center mt-6">
                Unlock all programs with a Premium plan or grab one standalone program to start your journey.
              </p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {programTypes.map(program => {
            const Icon = program.icon;
            return <ScrollReveal key={program.id}>
                <Card itemScope itemType="https://schema.org/Course" onClick={() => handleProgramSelect(program.id)} className="group p-6 cursor-pointer transition-all duration-500 ease-out transform-gpu hover:scale-110 hover:-translate-y-3 hover:shadow-2xl hover:shadow-primary/40 hover:border-primary/60 bg-card border-2 border-border" role="button" aria-label={`${program.title} training program - Online gym program at SmartyGym - smartygym.com by Haris Falas`} data-program-category={program.id} data-keywords="online gym training programs, workout training programs, smarty gym, online fitness programs, smartygym.com, Haris Falas">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110" aria-hidden="true">
                      <Icon className="w-8 h-8 text-primary transition-transform duration-300 group-hover:rotate-3" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2" itemProp="name">
                        {program.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3" itemProp="description">
                        {program.description}
                      </p>
                      <p className="text-xs text-muted-foreground/80 italic mb-3">
                        Crafted by{" "}
                        <a href="/coach-profile" className="text-primary hover:underline font-medium whitespace-nowrap" itemProp="instructor" onClick={e => e.stopPropagation()}>
                          Haris Falas
                        </a>
                        {" "}BSc Sports Science, EXOS Specialist, CSCS
                      </p>
                  <div className="flex gap-1 text-[10px] mt-2">
                    <span className="bg-primary/20 text-primary border border-primary/40 px-1.5 py-0.5 rounded-full whitespace-nowrap" itemProp="duration">
                      4-8 weeks
                    </span>
                    <span className="bg-green-500/20 text-green-700 dark:text-green-400 border border-green-500/40 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                      {program.level}
                    </span>
                    <span className="bg-orange-500/20 text-orange-700 dark:text-orange-400 border border-orange-500/40 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                      {program.equipment}
                    </span>
                  </div>
                      <meta itemProp="provider" content="Smarty Gym - Online Gym - smartygym.com" />
                      <meta itemProp="courseMode" content="Online" />
                      <meta itemProp="availableLanguage" content="English" />
                    </div>
                  </div>
                </Card>
              </ScrollReveal>;
          })}
        </div>

        {/* Bottom Premium Banner */}
        {!isPremium && <ScrollReveal delay={600}>
            <div className="bg-card border border-border rounded-xl p-6 mt-8 text-center shadow-soft">
              <h3 className="text-xl font-semibold mb-2">Start your transformation</h3>
              <p className="text-muted-foreground mb-4">
                Join SmartyGym Premium for full access to all training programs.
              </p>
              <Button size="lg" onClick={() => navigate("/premiumbenefits")} className="cta-button">
                Join Premium
              </Button>
            </div>
          </ScrollReveal>}
      </div>
    </>;
};
export default TrainingProgramFlow;