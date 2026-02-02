import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";
import { ArrowLeft, Calculator, Activity, Flame } from "lucide-react";
import { useShowBackButton } from "@/hooks/useShowBackButton";
import { useAccessControl } from "@/hooks/useAccessControl";
import { SEOEnhancer } from "@/components/SEOEnhancer";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";

// Import tool background images
import oneRmBg from "@/assets/tools/1rm-calculator-bg.jpg";
import bmrBg from "@/assets/tools/bmr-calculator-bg.jpg";
import macroBg from "@/assets/tools/macro-calculator-bg.jpg";

const Tools = () => {
  const navigate = useNavigate();
  const { canGoBack, goBack } = useShowBackButton();
  const { userTier } = useAccessControl();
  const isPremium = userTier === "premium";

  const [toolsCarouselApi, setToolsCarouselApi] = useState<CarouselApi>();
  const [toolsCurrentSlide, setToolsCurrentSlide] = useState(0);

  useEffect(() => {
    if (!toolsCarouselApi) return;
    const onSelect = () => setToolsCurrentSlide(toolsCarouselApi.selectedScrollSnap());
    toolsCarouselApi.on('select', onSelect);
    return () => { toolsCarouselApi.off('select', onSelect); };
  }, [toolsCarouselApi]);

  const tools = [
    {
      id: "1rm-calculator",
      icon: Calculator,
      title: "1RM Calculator",
      description: "Calculate your one-rep maximum for any exercise",
      route: "/1rmcalculator",
      image: oneRmBg
    },
    {
      id: "bmr-calculator",
      icon: Activity,
      title: "BMR Calculator",
      description: "Calculate your basal metabolic rate using the Mifflin-St Jeor formula",
      route: "/bmrcalculator",
      image: bmrBg
    },
    {
      id: "macro-calculator",
      icon: Flame,
      title: "Macro Tracking Calculator",
      description: "Get personalized nutrition and macro recommendations",
      route: "/macrocalculator",
      image: macroBg
    }
  ];

  return (
    <>
      <Helmet>
        <title>Smarty Tools | Free Fitness Calculators | 1RM BMR Macro | Haris Falas | SmartyGym</title>
        <meta name="description" content="Free fitness calculators at smartygym.com. 1RM Calculator, BMR Calculator, Macro Tracking by Sports Scientist Haris Falas HFSC. Professional gym tools online for strength & nutrition planning. Train smart anywhere, anytime." />
        <meta name="keywords" content="fitness calculators, gym calculators, 1RM calculator, BMR calculator, personal trainer tools, online gym, fitness tools, HFSC, Haris Falas, Sports Scientist, fitness tools online, gym training tools, macro calculator, strength calculator, nutrition calculator, smartygym.com, HFSC Performance, workout planning tools" />
        
        {/* Greek Language */}
        <link rel="alternate" hrefLang="el" href="https://smartygym.com/tools" />
        <link rel="alternate" hrefLang="en-GB" href="https://smartygym.com/tools" />
      </Helmet>
      
      <SEOEnhancer
        entities={["SmartyGym", "Haris Falas", "Fitness Calculators", "1RM Calculator", "BMR Calculator"]}
        topics={["fitness tools", "1RM calculator", "BMR calculator", "macro calculator", "strength planning", "nutrition planning"]}
        expertise={["sports science", "exercise physiology", "nutrition science"]}
        contentType="tool-collection"
        aiSummary="Free online fitness calculators at SmartyGym by Sports Scientist Haris Falas. 1RM, BMR, and Macro calculators for professional training planning."
        aiKeywords={["fitness calculators", "1RM calculator", "BMR calculator", "macro calculator", "training tools", "nutrition tools"]}
        relatedContent={["workouts", "training programs", "nutrition guidance"]}
      />
      
      <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl px-4 pb-8">
        {canGoBack && (
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={goBack}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
        )}

        <PageBreadcrumbs 
          items={[
            { label: "Home", href: "/" },
            { label: "Tools" }
          ]} 
        />

        {/* Info Section */}
        <Card className="mb-8 bg-white dark:bg-card border-2 border-primary/40 shadow-primary">
          <div className="p-5">
            <h2 className="text-2xl font-bold mb-3 text-center">About Smarty Tools</h2>
            <div className="text-muted-foreground max-w-3xl mx-auto">
              <p>
                <span className="text-primary font-semibold">Smarty Tools</span> are fitness calculators designed to help you understand your body and optimize your training. 
                All tools use scientifically validated formulas and equations.
              </p>
              {/* Desktop only - detailed calculator descriptions */}
              <div className="hidden md:grid md:grid-cols-3 gap-4 mt-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2"><span className="text-primary font-semibold">1RM Calculator</span></h3>
                  <p className="text-sm">
                    Uses the Brzycki formula to estimate your one-rep maximum. Essential for programming strength training.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2"><span className="text-primary font-semibold">BMR Calculator</span></h3>
                  <p className="text-sm">
                    Uses the Mifflin-St Jeor equation to calculate your basal metabolic rate — the calories you burn at rest.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2"><span className="text-primary font-semibold">Macro Tracking Calculator</span></h3>
                  <p className="text-sm">
                    Get complete nutrition recommendations including calories, macros, fiber, water, and meal frequency.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Mobile Carousel - With descriptions in cards */}
        <div className="md:hidden">
          <Carousel 
            setApi={setToolsCarouselApi}
            opts={{ align: "center", loop: true, startIndex: 0 }}
            className="w-full"
          >
            <CarouselContent className="-ml-2">
              {tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <CarouselItem key={tool.id} className="pl-2 basis-[85%]">
                    <div
                      onClick={() => navigate(tool.route)}
                      className="group relative h-48 rounded-xl overflow-hidden cursor-pointer transition-all duration-500 ease-out transform-gpu hover:scale-[1.02] hover:shadow-xl"
                    >
                      {/* Background Image */}
                      <img 
                        src={tool.image} 
                        alt={tool.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 group-hover:from-black/95" />
                      
                      {/* Content */}
                      <div className="relative h-full flex flex-col justify-end p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-base font-semibold text-white">{tool.title}</h3>
                          <div className="w-9 h-9 rounded-full bg-background/90 flex items-center justify-center shadow-md">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                        </div>
                        <p className="text-xs text-white/80 line-clamp-2">{tool.description}</p>
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="left-2 h-8 w-8 bg-background/80 border-primary/20" />
            <CarouselNext className="right-2 h-8 w-8 bg-background/80 border-primary/20" />
          </Carousel>
          {/* Navigation dots */}
          <div className="flex justify-center gap-2 mt-4">
            {tools.map((_, index) => (
              <button
                key={index}
                onClick={() => toolsCarouselApi?.scrollTo(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  toolsCurrentSlide === index ? 'bg-primary' : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Desktop Grid - Image cards */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                onClick={() => navigate(tool.route)}
                className="group relative h-64 rounded-xl overflow-hidden cursor-pointer transition-all duration-500 ease-out transform-gpu hover:scale-[1.08] hover:-translate-y-3 hover:shadow-2xl hover:shadow-primary/40 hover:z-10"
              >
                {/* Background Image */}
                <img 
                  src={tool.image} 
                  alt={tool.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 group-hover:from-black/95 transition-all duration-300" />
                
                {/* Content */}
                <div className="relative h-full flex flex-col justify-end p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">{tool.title}</h3>
                    <div className="w-10 h-10 rounded-full bg-background/90 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <p className="text-sm text-white/80">{tool.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      </div>
    </>
  );
};

export default Tools;
