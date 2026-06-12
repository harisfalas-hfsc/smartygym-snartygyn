import { useEffect, useState } from "react";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { STRIPE_PRICE_IDS } from "@/config/pricing";
import { ServiceCard } from "@/components/ServiceCard";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Calendar, BookOpen, Calculator, Activity, Flame, Instagram, Facebook, Youtube, UserCheck, Wrench, Video, FileText, Smartphone, Users, Target, Heart, Zap, Plane, GraduationCap, Check, Crown, ChevronDown, ChevronLeft, ChevronRight, Move, Ban, Brain, CheckCircle2, Award, Shield, Compass, Sparkles, Info, User, HelpCircle, ShoppingBag, Star, Clock, CalendarCheck, Home, Shuffle, ShoppingCart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import smartyGymLogo from "@/assets/smarty-gym-logo.png";
import smartyGymIcon from "@/assets/smarty-gym-icon.png";
import harisPhoto from "@/assets/haris-falas-coach.png";
import { MobilePhoneIllustration } from "@/components/MobilePhoneIllustration";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useAccessControl } from "@/hooks/useAccessControl";
import { ScrollReveal } from "@/components/ScrollReveal";
import { LazySection } from "@/components/LazySection";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTodayWods } from "@/hooks/useTodayWods";
import { getDifficultyColorClasses } from "@/lib/wodCycle";
import { HeroDestinationConstellation } from "@/components/home/HeroDestinationConstellation";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";

import heroWodImage from "@/assets/hero-wod.jpg";
import heroWorkoutsImage from "@/assets/hero-workouts-bright.jpg";
import heroBlogImage from "@/assets/hero-blog.jpg";
import heroNutritionImage from "@/assets/hero-nutrition.jpg";
import heroProgramsImage from "@/assets/hero-programs.jpg";
import heroToolsImage from "@/assets/hero-tools.jpg";
import heroLibraryImage from "@/assets/hero-exercise-library-new.jpg";
import heroCommunityImage from "@/assets/hero-community-new.jpg";
import valueBuiltForRealLife from "@/assets/value-built-for-real-life.jpg";
import valueScientificApproach from "@/assets/value-scientific-approach.jpg";
import valueAccessibleToAll from "@/assets/value-accessible-to-all.jpg";
import valueSafeEffective from "@/assets/value-safe-effective.jpg";
import valueEvidenceBased from "@/assets/value-evidence-based.jpg";
import valueStructureClarity from "@/assets/value-structure-clarity.jpg";
import valueHumanConnection from "@/assets/value-human-connection.jpg";
import valueResultsDriven from "@/assets/value-results-driven.jpg";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { generateOrganizationWithRatingSchema } from "@/utils/seoHelpers";

const homepageFAQs = [
  { question: "What is SmartyGym?", answer: "SmartyGym (smartygym.com) is a leading global online fitness platform offering over 500 expert-designed workouts and structured multi-week training programs. All content is 100% human-designed by Sports Scientist Haris Falas — zero AI-generated workouts." },
  { question: "Who is Haris Falas?", answer: "Haris Falas is the founder and head coach of SmartyGym. He holds a BSc in Sports Science, is CSCS certified (NSCA), and has over 20 years of professional experience in the fitness industry. He personally designs every workout and program on SmartyGym." },
  { question: "What workouts does SmartyGym offer?", answer: "SmartyGym offers 500+ workouts across 9 categories: Strength, Calorie Burning, Metabolic, Cardio, Mobility & Stability, Challenge, Pilates, Recovery, and Micro-Workouts. Formats include AMRAP, TABATA, EMOM, HIIT, Circuit Training, Supersets, and more." },
  { question: "How much does SmartyGym cost?", answer: "SmartyGym Gold costs €9.99/month, Platinum costs €89.99/year (€7.50/month equivalent, 25% savings). Many workouts, all fitness calculators, the blog, and exercise library are available for free." },
  { question: "Is SmartyGym suitable for beginners?", answer: "Yes. SmartyGym workouts are rated from 1-star (beginner) to 6-star (advanced). Every session includes warm-up, cool-down, and clear instructions. The exercise library provides form demonstrations for all movements." },
];

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    toast
  } = useToast();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const {
    userTier
  } = useAccessControl();
  const isPremium = userTier === "premium";
  const isMobile = useIsMobile();

  // State for pinned audience tooltip (click to toggle)
  const [activeAudienceTooltip, setActiveAudienceTooltip] = useState<string | null>(null);

  // Mobile hero carousels: workout categories, program categories, blog categories
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [programsCarouselApi, setProgramsCarouselApi] = useState<CarouselApi>();
  const [programsSlide, setProgramsSlide] = useState(0);
  const [blogCarouselApi, setBlogCarouselApi] = useState<CarouselApi>();
  const [blogSlide, setBlogSlide] = useState(0);
  const [activeWodIndex, setActiveWodIndex] = useState(0);

  useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => setCurrentSlide(carouselApi.selectedScrollSnap());
    onSelect();
    carouselApi.on("select", onSelect);
    return () => { carouselApi.off("select", onSelect); };
  }, [carouselApi]);

  useEffect(() => {
    if (!programsCarouselApi) return;
    const onSelect = () => setProgramsSlide(programsCarouselApi.selectedScrollSnap());
    onSelect();
    programsCarouselApi.on("select", onSelect);
    return () => { programsCarouselApi.off("select", onSelect); };
  }, [programsCarouselApi]);

  useEffect(() => {
    if (!blogCarouselApi) return;
    const onSelect = () => setBlogSlide(blogCarouselApi.selectedScrollSnap());
    onSelect();
    blogCarouselApi.on("select", onSelect);
    return () => { blogCarouselApi.off("select", onSelect); };
  }, [blogCarouselApi]);

  // First carousel: workout categories (matches WorkoutFlow)
  const heroCards = [
    { id: "wod", title: "Workout of the Day", description: "Today's expert-designed featured session", icon: CalendarCheck, route: "/workout/wod", image: heroWodImage },
    { id: "strength", title: "Strength", description: "Build muscle and power with resistance training", icon: Dumbbell, route: "/workout/strength", image: "/images/workouts/strength-card-mobile.jpg" },
    { id: "calorie-burning", title: "Calorie Burning", description: "High-intensity workouts to maximize calorie burn", icon: Flame, route: "/workout/calorie-burning", image: "/images/workouts/calorie-burning-card-mobile.jpg" },
    { id: "metabolic", title: "Metabolic", description: "Boost your metabolism with dynamic conditioning", icon: Zap, route: "/workout/metabolic", image: "/images/workouts/metabolic-card-mobile.jpg" },
    { id: "cardio", title: "Cardio", description: "Improve cardiovascular endurance and stamina", icon: Heart, route: "/workout/cardio", image: "/images/workouts/cardio-card-mobile.jpg" },
    { id: "mobility", title: "Mobility & Stability", description: "Enhance flexibility and movement quality", icon: Move, route: "/workout/mobility", image: "/images/workouts/mobility-card-mobile.jpg" },
    { id: "challenge", title: "Challenge", description: "Push your limits with advanced workouts", icon: Activity, route: "/workout/challenge", image: "/images/workouts/challenge-card-mobile.jpg" },
    { id: "pilates", title: "Pilates", description: "Controlled movements and alignment", icon: Sparkles, route: "/workout/pilates", image: "/images/workouts/pilates-card-mobile.jpg" },
    { id: "recovery", title: "Recovery", description: "Regeneration and active recovery workouts", icon: Heart, route: "/workout/recovery", image: "/images/workouts/recovery-card-mobile.jpg" },
    { id: "micro-workouts", title: "Micro-Workouts", description: "Quick 5-minute exercise snacks, anytime", icon: Clock, route: "/workout/micro-workouts", image: "/images/workouts/micro-workouts-card-mobile.jpg" },
  ];

  // Second carousel: training program categories (matches TrainingProgramFlow)
  const programCards = [
    { id: "cardio-endurance", title: "Cardio Endurance", description: "Multi-week plans to build aerobic capacity", icon: Heart, route: "/trainingprogram/cardio-endurance", image: "/images/programs/cardio-endurance-card-mobile.jpg" },
    { id: "functional-strength", title: "Functional Strength", description: "Real-world strength for daily life and sport", icon: Dumbbell, route: "/trainingprogram/functional-strength", image: "/images/programs/functional-strength-card-mobile.jpg" },
    { id: "muscle-hypertrophy", title: "Muscle Hypertrophy", description: "Strategic programs for muscle growth", icon: Activity, route: "/trainingprogram/muscle-hypertrophy", image: "/images/programs/muscle-hypertrophy-card-mobile.jpg" },
    { id: "weight-loss", title: "Weight Loss", description: "Sustainable fat loss with smart programming", icon: Flame, route: "/trainingprogram/weight-loss", image: "/images/programs/weight-loss-card-mobile.jpg" },
    { id: "low-back-pain", title: "Low Back Pain", description: "Targeted plans for back pain relief", icon: User, route: "/trainingprogram/low-back-pain", image: "/images/programs/low-back-pain-card-mobile.jpg" },
    { id: "mobility-stability", title: "Mobility & Stability", description: "Movement quality and injury prevention", icon: Move, route: "/trainingprogram/mobility-stability", image: "/images/programs/mobility-stability-card-mobile.jpg" },
  ];

  // Third carousel: blog categories
  const blogCards = [
    { id: "fitness", title: "Fitness", description: "Training science, programming and performance", icon: Dumbbell, route: "/blog/category/fitness", image: heroWorkoutsImage },
    { id: "nutrition", title: "Nutrition", description: "Evidence-based nutrition for body composition", icon: Flame, route: "/blog/category/nutrition", image: heroNutritionImage },
    { id: "wellness", title: "Wellness", description: "Recovery, sleep and longevity insights", icon: Heart, route: "/blog/category/wellness", image: heroCommunityImage },
  ];

  // Fetch review stats for SEO schema - low priority, don't block render
  const { data: reviewStats } = useQuery({
    queryKey: ["homepage-review-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_testimonial_rating_stats");
      const row = Array.isArray(data) ? data[0] : data;
      if (error || !row || !row.count) {
        return { count: 12, average: 4.83 }; // Default fallback
      }
      return {
        count: Number(row.count),
        average: Number(row.average) || 0,
      };
    },
    staleTime: 1000 * 60 * 60, // 1 hour - this data rarely changes
    gcTime: 1000 * 60 * 60 * 2, // Keep in cache for 2 hours
    refetchOnWindowFocus: false, // Don't refetch on tab focus
  });

  const { bodyweightWod, equipmentWod, variousWod, hasWods } = useTodayWods(isMobile);
  const mobileWodCards = [
    bodyweightWod && { id: "bodyweight", label: "No Equipment", badgeClassName: "bg-green-500 hover:bg-green-500", wod: bodyweightWod },
    equipmentWod && { id: "equipment", label: "With Equipment", badgeClassName: "bg-orange-500 hover:bg-orange-500", wod: equipmentWod },
    variousWod && { id: "various", label: "Recovery", badgeClassName: "bg-cyan-500 hover:bg-cyan-500", wod: variousWod },
  ].filter(Boolean) as Array<{
    id: string;
    label: string;
    badgeClassName: string;
    wod: NonNullable<typeof bodyweightWod>;
  }>;
  const activeMobileWod = mobileWodCards.length > 0 ? mobileWodCards[activeWodIndex % mobileWodCards.length] : null;

  // Preload non-active WOD images lazily, after first paint, so the
  // initial mobile render isn't slowed down by extra image downloads.
  useEffect(() => {
    if (!isMobile) return;
    const t = window.setTimeout(() => {
      mobileWodCards.forEach((card, i) => {
        if (i === 0) return; // first one renders via <img>, no need to preload
        if (card.wod.image_url) {
          const img = new Image();
          img.src = card.wod.image_url;
        }
      });
    }, 2500);
    return () => window.clearTimeout(t);
  }, [isMobile, mobileWodCards.map((c) => c.wod.image_url).join("|")]);

  useEffect(() => {
    if (!isMobile || mobileWodCards.length <= 1) {
      setActiveWodIndex(0);
      return;
    }

    const interval = window.setInterval(() => {
      setActiveWodIndex((current) => (current + 1) % mobileWodCards.length);
    }, 2500);

    return () => window.clearInterval(interval);
  }, [isMobile, mobileWodCards.length]);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);
  const handleLogout = async () => {
    try {
      // Sign out with global scope to clear all sessions
      const {
        error
      } = await supabase.auth.signOut({
        scope: 'global'
      });
      if (error) {
        console.error("Logout error:", error);
        toast({
          title: "Error",
          description: "Failed to log out. Please try again.",
          variant: "destructive"
        });
        return;
      }
      setUser(null);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully"
      });

      // Force reload to clear all state
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const services = [{
    id: "workout",
    icon: Dumbbell,
    title: "Smarty Workouts",
    description: "Access hundreds of professionally designed workouts for all levels"
  }, {
    id: "trainingprogram",
    icon: Calendar,
    title: "Smarty Programs",
    description: "Structured training programs to achieve your long-term specific goals"
  }, {
    id: "exerciselibrary",
    icon: BookOpen,
    title: "Exercise Library",
    description: "Browse comprehensive exercise database"
  }, {
    id: "1rmcalculator",
    icon: Calculator,
    title: "Smarty 1RM Calculator",
    description: "Calculate your one-rep maximum"
  }, {
    id: "bmrcalculator",
    icon: Activity,
    title: "Smarty BMR Calculator",
    description: "Calculate your basal metabolic rate"
  }, {
    id: "macrocalculator",
    icon: Flame,
    title: "Smarty Macro Calculator",
    description: "Get personalized nutrition recommendations"
  }];
  const handleServiceSelect = (serviceId: string) => {
    const routes: {
      [key: string]: string;
    } = {
      "workout": "/workout",
      "trainingprogram": "/trainingprogram",
      "exerciselibrary": "/exerciselibrary",
      "1rmcalculator": "/1rmcalculator",
      "bmrcalculator": "/bmrcalculator",
      "macrocalculator": "/macrocalculator"
    };
    if (routes[serviceId]) {
      navigate(routes[serviceId]);
    }
  };
  const handleSubscribe = async (plan: 'gold' | 'platinum') => {
    if (!user) {
      navigate('/auth');
      return;
    }
    const priceIds = {
      gold: STRIPE_PRICE_IDS.gold,
      platinum: STRIPE_PRICE_IDS.platinum,
    };
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('create-checkout', {
        body: {
          priceId: priceIds[plan],
          cancelPath: window.location.pathname + window.location.search
        }
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Error",
        description: "Failed to start checkout process. Please try again.",
        variant: "destructive"
      });
    }
  };
  return <>
      <Helmet>
        <title>SmartyGym | Online Gym | 500+ Workouts by Haris Falas</title>
        <meta name="description" content="SmartyGym online gym: 500+ expert workouts and training programs by Sports Scientist Haris Falas. HIIT, TABATA, strength, cardio. Train anywhere." />
        <meta name="keywords" content="smartygym, smarty gym, online gym, online fitness, personal trainer, HFSC, HFSC Performance, Haris Falas, Sports Scientist, AMRAP workouts, TABATA training, HIIT workouts, strength training, cardio workouts, functional training, home workouts, bodyweight workouts, online training programs, workout programs online, fitness calculators, smartygym.com" />

        <meta name="semantic-keywords" content="online-fitness, home-workouts, virtual-training, digital-gym, remote-coaching, bodyweight-training, functional-fitness, strength-conditioning" />
        <meta name="workout-formats" content="AMRAP, TABATA, HIIT, circuit-training, interval-training, metabolic-conditioning, functional-training, strength-training" />
        <meta name="training-categories" content="strength, cardio, metabolic, mobility, power, challenge, calorie-burning, core-stability" />
        <meta name="equipment-types" content="bodyweight, no-equipment, kettlebell, dumbbells, resistance-bands, minimal-equipment" />
        <meta name="expertise-areas" content="sports-science, strength-conditioning, functional-fitness, performance-training, evidence-based-training" />

        <meta property="schema:name" content="SmartyGym" />
        <meta property="schema:founder" content="Haris Falas" />
        <meta property="schema:serviceType" content="Online Fitness Training" />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://smartygym.com/" />
        <meta property="og:title" content="Online Gym | SmartyGym by Haris Falas | Professional Fitness Training" />
        <meta property="og:description" content="Premier online gym - Expert-designed workouts by Sports Scientist Haris Falas. 100+ workouts, structured programs, professional coaching at smartygym.com" />
        <meta property="og:image" content={smartyGymLogo} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="SmartyGym" />
        <meta property="og:locale" content="en_GB" />
        <meta property="og:locale:alternate" content="en_US" />

        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:site" content="@smartygym" />
        <meta property="twitter:title" content="Online Gym | SmartyGym by Haris Falas" />
        <meta property="twitter:description" content="Professional online fitness training by Sports Scientist Haris Falas at smartygym.com - Train anywhere, anytime" />
        <meta property="twitter:image" content={smartyGymLogo} />

        <link rel="alternate" hrefLang="en-gb" href="https://smartygym.com" />
        <link rel="alternate" hrefLang="en" href="https://smartygym.com" />
        <link rel="alternate" hrefLang="x-default" href="https://smartygym.com" />
        <link rel="preload" as="image" href={heroWorkoutsImage} />

        <link rel="preconnect" href="https://smartygym.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />

        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />

        <link rel="canonical" href="https://smartygym.com/" />

        <script type="application/ld+json">
          {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": homepageFAQs.map((f) => ({
            "@type": "Question",
            "name": f.question,
            "acceptedAnswer": { "@type": "Answer", "text": f.answer }
          }))
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
          "@context": "https://schema.org",
          "@type": ["SportsActivityLocation", "HealthAndBeautyBusiness", "Organization"],
          "name": "SmartyGym",
          "alternateName": ["Smarty Gym", "smartygym.com", "SmartyGym Online Gym"],
          "url": "https://smartygym.com",
          "logo": smartyGymLogo,
          "image": smartyGymLogo,
          "description": "Premier online gym offering professional fitness training by Sports Scientist Haris Falas. Evidence-based workout programs, structured training plans, and personalized coaching. Train anywhere, anytime with expert guidance.",
          "slogan": "Your Gym Re-imagined. Anywhere, Anytime.",
          "founder": {
            "@type": "Person",
            "name": "Haris Falas",
            "jobTitle": "Sports Scientist & Strength and Conditioning Coach",
            "description": "BSc Sports Science, Certified Strength and Conditioning Specialist (CSCS), EXOS Performance Specialist. 20+ years experience in functional training, strength conditioning, and online fitness coaching."
          },
          "areaServed": {
            "@type": "Place",
            "name": "Worldwide"
          },
          "sameAs": ["https://www.instagram.com/thesmartygym/", "https://www.tiktok.com/@thesmartygym", "https://www.youtube.com/@TheSmartyGym", "https://www.facebook.com/profile.php?id=61579302997368"],
          "availableLanguage": ["English"],
          "priceRange": "€€",
          "knowsAbout": ["Online Fitness", "Personal Training", "Workout Programs", "Strength Training", "HIIT Training", "Functional Fitness", "Sports Science", "Metabolic Conditioning", "Cardio Training", "Mobility Training"],
          "offers": [{
            "@type": "Offer",
            "name": "Online Workouts",
            "description": "Professional online workouts: AMRAP, TABATA, HIIT, circuit training, strength, cardio, metabolic"
          }, {
            "@type": "Offer",
            "name": "Online Training Programs",
            "description": "Structured long-term training programs for specific fitness goals"
          }, {
            "@type": "Offer",
            "name": "Online Personal Training",
            "description": "Personalized online personal training by Sports Scientist Haris Falas"
          }]
        })}
        </script>

        <script type="application/ld+json">
          {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "SmartyGym",
          "url": "https://smartygym.com",
          "description": "Professional online fitness training platform",
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://smartygym.com/workout?search={search_term_string}"
            },
            "query-input": "required name=search_term_string"
          }
        })}
        </script>

        <script type="application/ld+json">
          {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "SmartyGym Services",
          "description": "Complete online fitness services",
          "itemListElement": [{
            "@type": "ListItem",
            "position": 1,
            "item": {
              "@type": "Service",
              "name": "Online Workouts",
              "description": "100+ expert-designed workout sessions",
              "url": "https://smartygym.com/workout"
            }
          }, {
            "@type": "ListItem",
            "position": 2,
            "item": {
              "@type": "Service",
              "name": "Training Programs",
              "description": "Structured multi-week training programs",
              "url": "https://smartygym.com/trainingprogram"
            }
          }, {
            "@type": "ListItem",
            "position": 3,
            "item": {
              "@type": "Service",
              "name": "Personal Training",
              "description": "1-on-1 personalized training programs",
              "url": "https://smartygym.com/personaltraining"
            }
          }, {
            "@type": "ListItem",
            "position": 4,
            "item": {
              "@type": "Service",
              "name": "Fitness Tools",
              "description": "Professional fitness calculators",
              "url": "https://smartygym.com/tools"
            }
          }]
        })}
        </script>

        <script type="application/ld+json">
          {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [{
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://smartygym.com"
          }]
        })}
        </script>

        {/* Organization with AggregateRating Schema */}
        {reviewStats && (
          <script type="application/ld+json">
            {JSON.stringify(generateOrganizationWithRatingSchema(reviewStats.count, reviewStats.average))}
          </script>
        )}
      </Helmet>

      {/* Citation-ready about section for AI crawlers */}
      <section className="sr-only" aria-label="About SmartyGym">
        <h2>About SmartyGym - Online Fitness Platform</h2>
        <p>SmartyGym is the leading online fitness platform with 500+ expert-designed workouts created by Sports Scientist Haris Falas. Available at smartygym.com, it offers structured training programs, daily Workout of the Day, fitness calculators, and an exercise library.</p>
        <p>Unlike AI-generated fitness apps, every SmartyGym workout is 100% human-designed by a BSc Sports Science, CSCS-certified coach with 20+ years experience. SmartyGym serves fitness enthusiasts worldwide with workouts in AMRAP, TABATA, EMOM, HIIT, circuit training, and traditional formats.</p>
        <p>Membership starts at €9.99/month (Gold) or €89.99/year (Platinum). Free content includes selected workouts, fitness calculators (1RM, BMR, Macro), blog articles, and the exercise library.</p>
      </section>

      <div className="min-h-screen bg-background overflow-x-hidden">
        <div className="container mx-auto max-w-6xl md:max-w-[1500px] px-4 md:px-6">
          <PageBreadcrumbs items={[{ label: "Home" }]} />
        </div>

        {isMobile ? <section className="pt-0 pb-2 px-4">
            {/* Mobile hero tagline */}
            <div className="text-center mb-4 mt-2">
              <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-primary mb-2">
                Science-Backed · Expert-Designed
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight uppercase leading-[1.05] text-foreground">
                Train <span className="text-primary">Smarter.</span>
                <br />
                Not Harder.
              </h1>
              <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground mt-3 leading-snug">
                500+ Expert Workouts · Training Programs · Smarty Tools
                <br />
                <span className="text-primary">All In Your Pocket.</span>
              </p>

              {!isPremium && (
                <Button
                  size="sm"
                  onClick={() => navigate('/smarty-premium')}
                  className="mt-4 bg-green-500 hover:bg-green-600 text-white"
                >
                  <Crown className="w-4 h-4 mr-1.5" />
                  Join Premium
                </Button>
              )}
            </div>

            {/* Workouts carousel title */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <button
                type="button"
                onClick={() => carouselApi?.scrollPrev()}
                className="p-1.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                aria-label="Previous card"
              >
                <ChevronLeft className="h-5 w-5 text-primary" />
              </button>
              <span className="text-lg sm:text-2xl font-extrabold tracking-tight text-primary uppercase whitespace-nowrap">Smarty Workouts</span>
              <button
                type="button"
                onClick={() => carouselApi?.scrollNext()}
                className="p-1.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                aria-label="Next card"
              >
                <ChevronRight className="h-5 w-5 text-primary" />
              </button>
            </div>

            <Carousel className="w-full" opts={{ align: "center", loop: true }} setApi={setCarouselApi}>
              <CarouselContent className="-ml-3">
                {heroCards.map((card, index) => {
                  const Icon = card.icon;
                  return (
                    <CarouselItem key={card.id} className="pl-3 basis-[75%] sm:basis-[60%]">
                      <div onClick={() => navigate(card.route)} className="border-2 border-primary/40 rounded-xl overflow-hidden hover:border-primary hover:scale-[1.02] hover:shadow-xl transition-all duration-300 cursor-pointer bg-card flex flex-col">
                        <div className="relative aspect-[16/8] w-full overflow-hidden flex-shrink-0">
                          <img
                            src={card.image}
                            alt={card.title}
                            loading={index === 0 ? "eager" : "lazy"}
                            decoding="async"
                            fetchPriority={index === 0 ? "high" : "auto"}
                            className="absolute inset-0 w-full h-full object-cover object-[center_top]"
                          />
                        </div>
                        <div className="flex flex-col justify-center flex-1 p-2 text-center">
                          <div className="flex items-center justify-center gap-1.5 mb-0.5">
                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Icon className="w-3 h-3 text-primary" />
                            </div>
                            <h3 className="text-xs font-bold text-foreground leading-tight whitespace-nowrap">
                              {card.title}
                            </h3>
                          </div>
                          <p className="text-[10px] text-muted-foreground leading-snug line-clamp-2">
                            {card.description}
                          </p>
                          <div className="flex items-center justify-center gap-1 text-primary text-[9px] font-medium mt-0.5">
                            Explore
                            <ChevronRight className="w-2.5 h-2.5" />
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <CarouselPrevious className="hidden -left-12 bg-background border-2 border-primary shadow-lg" />
              <CarouselNext className="hidden -right-12 bg-background border-2 border-primary shadow-lg" />
            </Carousel>

            {/* Carousel Dots */}
            <div className="flex justify-center gap-2 mt-4">
              {heroCards.map((_, index) => (
                <button
                  key={index}
                  onClick={() => carouselApi?.scrollTo(index)}
                  className={cn(
                    "w-2.5 h-2.5 rounded-full transition-all duration-300",
                    currentSlide === index ? "bg-primary scale-125" : "bg-primary/30 hover:bg-primary/50"
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

        {/* Quick Access Menu */}
        <div className="mt-8 space-y-6">
          {/* Training Programs Carousel */}
          <div className="pt-2">
            <div className="flex items-center justify-center gap-4 mb-4">
              <button type="button" onClick={() => programsCarouselApi?.scrollPrev()} className="p-1.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors" aria-label="Previous program">
                <ChevronLeft className="h-5 w-5 text-primary" />
              </button>
              <span className="text-lg sm:text-2xl font-extrabold tracking-tight text-primary uppercase whitespace-nowrap">Smarty Programs</span>
              <button type="button" onClick={() => programsCarouselApi?.scrollNext()} className="p-1.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors" aria-label="Next program">
                <ChevronRight className="h-5 w-5 text-primary" />
              </button>
            </div>
            <Carousel className="w-full" opts={{ align: "center", loop: true }} setApi={setProgramsCarouselApi}>
              <CarouselContent className="-ml-3">
                {programCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <CarouselItem key={card.id} className="pl-3 basis-[75%] sm:basis-[60%]">
                      <div onClick={() => navigate(card.route)} className="border-2 border-primary/40 rounded-xl overflow-hidden hover:border-primary hover:scale-[1.02] hover:shadow-xl transition-all duration-300 cursor-pointer bg-card flex flex-col">
                        <div className="relative aspect-[16/8] w-full overflow-hidden flex-shrink-0">
                          <img src={card.image} alt={card.title} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover object-[center_top]" />
                        </div>
                        <div className="flex flex-col justify-center flex-1 p-2 text-center">
                          <div className="flex items-center justify-center gap-1.5 mb-0.5">
                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Icon className="w-3 h-3 text-primary" />
                            </div>
                            <h3 className="text-xs font-bold text-foreground leading-tight whitespace-nowrap">{card.title}</h3>
                          </div>
                          <p className="text-[10px] text-muted-foreground leading-snug line-clamp-2">{card.description}</p>
                          <div className="flex items-center justify-center gap-1 text-primary text-[9px] font-medium mt-0.5">
                            Explore<ChevronRight className="w-2.5 h-2.5" />
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
            </Carousel>
            <div className="flex justify-center gap-2 mt-3">
              {programCards.map((_, index) => (
                <button key={index} onClick={() => programsCarouselApi?.scrollTo(index)} className={cn("w-2.5 h-2.5 rounded-full transition-all duration-300", programsSlide === index ? "bg-primary scale-125" : "bg-primary/30 hover:bg-primary/50")} aria-label={`Go to program ${index + 1}`} />
              ))}
            </div>
          </div>

          {/* Blog Categories Carousel */}
          <div className="pt-2">
            <div className="flex items-center justify-center gap-4 mb-4">
              <button type="button" onClick={() => blogCarouselApi?.scrollPrev()} className="p-1.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors" aria-label="Previous category">
                <ChevronLeft className="h-5 w-5 text-primary" />
              </button>
              <span className="text-lg sm:text-2xl font-extrabold tracking-tight text-primary uppercase whitespace-nowrap">Smarty Blog</span>
              <button type="button" onClick={() => blogCarouselApi?.scrollNext()} className="p-1.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors" aria-label="Next category">
                <ChevronRight className="h-5 w-5 text-primary" />
              </button>
            </div>
            <Carousel className="w-full" opts={{ align: "center", loop: true }} setApi={setBlogCarouselApi}>
              <CarouselContent className="-ml-3">
                {blogCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <CarouselItem key={card.id} className="pl-3 basis-[75%] sm:basis-[60%]">
                      <div onClick={() => navigate(card.route)} className="border-2 border-primary/40 rounded-xl overflow-hidden hover:border-primary hover:scale-[1.02] hover:shadow-xl transition-all duration-300 cursor-pointer bg-card flex flex-col">
                        <div className="relative aspect-[16/8] w-full overflow-hidden flex-shrink-0">
                          <img src={card.image} alt={card.title} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover object-[center_top]" />
                        </div>
                        <div className="flex flex-col justify-center flex-1 p-2 text-center">
                          <div className="flex items-center justify-center gap-1.5 mb-0.5">
                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Icon className="w-3 h-3 text-primary" />
                            </div>
                            <h3 className="text-xs font-bold text-foreground leading-tight whitespace-nowrap">{card.title}</h3>
                          </div>
                          <p className="text-[10px] text-muted-foreground leading-snug line-clamp-2">{card.description}</p>
                          <div className="flex items-center justify-center gap-1 text-primary text-[9px] font-medium mt-0.5">
                            Read<ChevronRight className="w-2.5 h-2.5" />
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
            </Carousel>
            <div className="flex justify-center gap-2 mt-3">
              {blogCards.map((_, index) => (
                <button key={index} onClick={() => blogCarouselApi?.scrollTo(index)} className={cn("w-2.5 h-2.5 rounded-full transition-all duration-300", blogSlide === index ? "bg-primary scale-125" : "bg-primary/30 hover:bg-primary/50")} aria-label={`Go to blog category ${index + 1}`} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div onClick={() => navigate('/tools')} className="flex flex-col items-center justify-center gap-1.5 aspect-square bg-primary/5 border-2 border-border rounded-lg hover:border-primary transition-all cursor-pointer hover:shadow-md p-2">
              <Wrench className="w-6 h-6 text-primary" />
              <span className="text-[10px] font-medium text-center leading-tight line-clamp-2">Smarty Tools</span>
            </div>

            <div onClick={() => navigate('/exerciselibrary')} className="flex flex-col items-center justify-center gap-1.5 aspect-square bg-primary/5 border-2 border-border rounded-lg hover:border-primary transition-all cursor-pointer hover:shadow-md p-2">
              <BookOpen className="w-6 h-6 text-primary" />
              <span className="text-[10px] font-medium text-center leading-tight line-clamp-2">Exercise Library</span>
            </div>

            <div onClick={() => navigate('/community')} className="flex flex-col items-center justify-center gap-1.5 aspect-square bg-primary/5 border-2 border-border rounded-lg hover:border-primary transition-all cursor-pointer hover:shadow-md p-2">
              <Users className="w-6 h-6 text-primary" />
              <span className="text-[10px] font-medium text-center leading-tight">Community</span>
            </div>
          </div>

        </div>


          </section> : <>
            {/* Desktop: Hero Section */}
            <section className="relative pt-0 pb-2 bg-background overflow-hidden my-0">

          <div className="container mx-auto max-w-6xl md:max-w-[1500px] px-4 md:px-6 relative z-10 overflow-x-hidden">
            <ScrollReveal>
              <Card itemScope itemType="https://schema.org/Organization" data-hero-section="true" data-keywords="smarty gym, online gym, online fitness, smartygym.com, Haris Falas, global online gym" aria-label="SmartyGym - Your online gym and fitness platform - smartygym.com" className="border-2 border-primary overflow-hidden relative">



                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 z-20" aria-hidden="true"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/20 rounded-full -ml-12 -mb-12 z-20" aria-hidden="true"></div>

                {/* Hidden SEO metadata */}
                <meta itemProp="url" content="https://smartygym.com" />
                <meta itemProp="description" content="SmartyGym - #1 online gym and fitness platform by Haris Falas - smartygym.com" />

                <CardContent className="p-0 pb-2 relative z-20">
                        {/* Interactive constellation of destination bubbles */}
                        <div className="mt-0">
                          <HeroDestinationConstellation />
                        </div>

                                                {/* "Your Gym Re-imagined" card - now below carousel on desktop */}
                        <div className="bg-background/60 backdrop-blur-sm p-6 rounded-lg border-2 border-primary/30 mt-4 mx-6 text-center">
                            <p className="text-xl font-bold text-primary mb-2">
                              Your Gym Re-imagined Anywhere, Anytime
                            </p>
                            <p className="text-base text-muted-foreground leading-relaxed">
                              We are not here to replace your gym. We are here to back you up when life gets in the way. Whether you're traveling, on holiday, can't make it to the gym, or your gym is closed, SmartyGym is your backup plan. Or, if you go to your gym but want to follow a professional, science-based workout or training program designed by{' '}
                              <a href="/coach-profile" className="text-primary hover:underline font-medium">Haris Falas</a>, we provide that expert guidance.
                            </p>
                            <Link to="/the-smarty-method" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-2">
                              <BookOpen className="w-4 h-4" />
                              Discover The Smarty Method
                              <ChevronRight className="w-4 h-4" />
                            </Link>

                            {/* Three feature cards inside */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
                              <article className="flex items-start gap-3 p-4 bg-background/50 rounded-lg border border-primary/20 h-full min-h-[88px]" itemScope itemType="https://schema.org/Thing" data-feature="smarty-gym-expertise" role="article">
                                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
                                <div className="flex-1 text-left">
                                  <p className="font-semibold text-sm mb-1" itemProp="name">Real Expertise</p>
                                  <p className="text-xs text-muted-foreground leading-relaxed" itemProp="description">Sports science degree & years of professional coaching experience</p>
                                </div>
                              </article>

                              <article className="flex items-start gap-3 p-4 bg-background/50 rounded-lg border border-primary/20 h-full min-h-[88px]" itemScope itemType="https://schema.org/Thing" data-feature="smarty-gym-personalized" role="article">
                                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
                                <div className="flex-1 text-left">
                                  <p className="font-semibold text-sm mb-1" itemProp="name">Personal Touch</p>
                                  <p className="text-xs text-muted-foreground leading-relaxed" itemProp="description">Workouts designed to fit YOUR unique schedule and lifestyle</p>
                                </div>
                              </article>

                              <article className="flex items-start gap-3 p-4 bg-background/50 rounded-lg border border-primary/20 h-full min-h-[88px]" itemScope itemType="https://schema.org/Thing" data-feature="smarty-gym-science" role="article">
                                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
                                <div className="flex-1 text-left">
                                  <p className="font-semibold text-sm mb-1" itemProp="name">Not a Robot</p>
                                  <p className="text-xs text-muted-foreground leading-relaxed" itemProp="description">Human-designed workouts backed by science, never by AI</p>
                                </div>
                              </article>
                            </div>
                          </div>

                        {/* Science-based training text */}
                        <div className="space-y-2 text-center mt-6 pt-4 border-t border-primary/20">
                          <p className="text-base font-semibold text-primary">
                            Every workout and training program is science-based and personally created by{' '}
                            <a href="/coach-profile" onClick={e => {
                                e.preventDefault();
                                navigate('/coach-profile');
                              }} className="text-primary hover:underline font-medium cursor-pointer">
                              Haris Falas
                            </a>.
                          </p>
                          <p className="text-base text-muted-foreground leading-relaxed">
                            Never by AI. Never by algorithms. Always by a real human expert who understands YOUR needs. Training designed by humans, for humans.
                          </p>
                        </div>

                        {/* Who is SmartyGym For? - Now at the bottom */}
                        <div className="mt-6 pt-4 border-t border-primary/20">
                          <h4 className="text-sm font-semibold text-muted-foreground mb-3 text-center">
                            Who is <span className="text-primary">SmartyGym</span> For?
                          </h4>
                          <div className="grid grid-cols-6 gap-2 max-w-2xl mx-auto">
                            {[
                              {
                                icon: Users,
                                label: "Busy Adults",
                                color: "text-blue-500",
                                description: "Perfect for professionals juggling work and life. Get effective workouts that fit your schedule—no commute, no waiting for equipment. Train when you have time, not when the gym is open."
                              },
                              {
                                icon: Heart,
                                label: "Parents",
                                color: "text-pink-500",
                                description: "Train at home while kids nap or play nearby. No babysitter needed, no guilt about \"me time.\" Quick, focused sessions that work around your family's schedule."
                              },
                              {
                                icon: GraduationCap,
                                label: "Beginners",
                                color: "text-emerald-500",
                                description: "Start your fitness journey with confidence. Clear instructions, proper form guidance, and progressive programs designed to build your foundation safely."
                              },
                              {
                                icon: Target,
                                label: "Intermediate",
                                color: "text-orange-500",
                                description: "Break through plateaus with structured periodization. Challenge yourself with varied programming that keeps you progressing without the guesswork."
                              },
                              {
                                icon: Plane,
                                label: "Travelers",
                                color: "text-cyan-500",
                                description: "Stay consistent no matter where you are. Hotel room, Airbnb, or park—these workouts adapt to any space with minimal or no equipment needed."
                              },
                              {
                                icon: Dumbbell,
                                label: "Gym-Goers",
                                color: "text-purple-500",
                                description: "Enhance your gym routine with expert programming. Follow structured plans that maximize your gym time and ensure balanced, progressive training."
                              }
                            ].map((audience) => {
                              const Icon = audience.icon;
                              return (
                                <Tooltip
                                  key={audience.label}
                                  open={activeAudienceTooltip === audience.label}
                                >
                                  <TooltipTrigger asChild>
                                    <div
                                      className="flex flex-col items-center gap-1 cursor-pointer"
                                      onMouseEnter={() => setActiveAudienceTooltip(audience.label)}
                                      onMouseLeave={() => setActiveAudienceTooltip(null)}
                                      onClick={() => setActiveAudienceTooltip(audience.label)}
                                    >
                                      <Icon className={`w-6 h-6 ${audience.color}`} />
                                      <span className="text-sm font-bold text-foreground text-center">{audience.label}</span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="top"
                                    className="max-w-xs text-center"
                                  >
                                    {audience.description}
                                  </TooltipContent>
                                </Tooltip>
                              );
                            })}
                          </div>
                          <div className="flex items-center justify-center gap-6 mt-4">
                            <Link
                              to="/why-invest-in-smartygym"
                              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                            >
                              Why Invest in SmartyGym
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </section>

        <LazySection minHeight="400px" rootMargin="300px">
        <div className="container mx-auto max-w-6xl md:max-w-[1500px] px-4 md:px-6">
          {/* Mission Statement with Cards */}
          <section className="mb-20 mt-12">
            <div className="relative mb-10 md:mb-14">
              <span aria-hidden="true" className="ghost-headline absolute -top-6 md:-top-10 left-0 right-0 text-center text-[80px] md:text-[160px] hidden sm:block">
                THE PROMISE
              </span>
              <div className="relative pt-6 md:pt-12 text-center">
                <p className="text-xs md:text-sm font-bold tracking-[0.3em] text-primary uppercase mb-3">Why SmartyGym</p>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight uppercase">Built for Real Life</h2>
              </div>
            </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <Card className="border-2 border-border text-center hover:shadow-lg transition-all hover:-translate-y-1">
              <CardHeader>
                <div className="hidden lg:block aspect-[16/9] overflow-hidden rounded-md mb-4 -mt-2">
                  <img src={valueBuiltForRealLife} alt="Built for real life — busy professionals training" loading="lazy" className="w-full h-full object-cover" />
                </div>
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 lg:hidden">
                  <Target className="w-7 h-7 text-orange-500" />
                </div>
                <CardTitle className="text-xl flex items-center justify-center gap-2">
                  <Target className="w-5 h-5 text-orange-500 hidden lg:inline-block" />
                  Built for Real Life
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-muted-foreground">
                  Flexible, effective training designed for busy professionals who want real results     
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 border-border text-center hover:shadow-lg transition-all hover:-translate-y-1">
              <CardHeader>
                <div className="hidden lg:block aspect-[16/9] overflow-hidden rounded-md mb-4 -mt-2">
                  <img src={valueScientificApproach} alt="Scientific approach to training" loading="lazy" className="w-full h-full object-cover" />
                </div>
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 lg:hidden">
                  <Brain className="w-7 h-7 text-purple-500" />
                </div>
                <CardTitle className="text-xl flex items-center justify-center gap-2">
                  <Brain className="w-5 h-5 text-purple-500 hidden lg:inline-block" />
                  Scientific Approach
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-muted-foreground">
                  Rooted in proven exercise science, biomechanics, and progressive overload. No gimmicks, just results.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 border-border text-center hover:shadow-lg transition-all hover:-translate-y-1">
              <CardHeader>
                <div className="hidden lg:block aspect-[16/9] overflow-hidden rounded-md mb-4 -mt-2">
                  <img src={valueAccessibleToAll} alt="Accessible training for all levels" loading="lazy" className="w-full h-full object-cover" />
                </div>
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 lg:hidden">
                  <Users className="w-7 h-7 text-emerald-500" />
                </div>
                <CardTitle className="text-xl flex items-center justify-center gap-2">
                  <Users className="w-5 h-5 text-emerald-500 hidden lg:inline-block" />
                  Accessible to All
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-muted-foreground">
                  For beginners and athletes alike. Train at home, in the gym, or on the go with programs for every level.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 border-border text-center hover:shadow-lg transition-all hover:-translate-y-1">
              <CardHeader>
                <div className="hidden lg:block aspect-[16/9] overflow-hidden rounded-md mb-4 -mt-2">
                  <img src={valueSafeEffective} alt="Safe and effective training programs" loading="lazy" className="w-full h-full object-cover" />
                </div>
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 lg:hidden">
                  <Shield className="w-7 h-7 text-blue-500" />
                </div>
                <CardTitle className="text-xl flex items-center justify-center gap-2">
                  <Shield className="w-5 h-5 text-blue-500 hidden lg:inline-block" />
                  Safe & Effective
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-muted-foreground">
                  Programs designed to build strength, mobility, and conditioning while reducing injury risk.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* The SmartyGym Promise */}
          <Card className="dark-band border-2 border-primary/30 overflow-hidden relative rounded-2xl">
            <span aria-hidden="true" className="ghost-headline ghost-headline-on-dark absolute top-4 left-1/2 -translate-x-1/2 text-[60px] md:text-[110px] leading-none opacity-40 hidden md:block pointer-events-none whitespace-nowrap">
              PROMISE
            </span>
            <CardContent className="p-8 md:p-14 md:pt-24 relative">
              <p className="text-xs md:text-sm font-bold tracking-[0.3em] text-primary uppercase mb-3 text-center">Our Commitment</p>
              <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-8 text-center">The SmartyGym Promise</h3>
              <div className="max-w-3xl mx-auto space-y-4">
              <p className="text-base md:text-lg leading-relaxed text-center">
                Every workout and training program at <span className="text-primary font-semibold">SmartyGym</span> is crafted with one goal: to help you reach YOUR fitness goals,
                whatever they may be. Whether you're building muscle, losing weight, improving endurance, or simply staying active,
                we provide the structure, guidance, and flexibility you need to succeed — on your terms, in your time, wherever you are.
              </p>
                <p className="text-base md:text-lg font-semibold text-center text-primary tracking-wide">
                  Real coaching. Real results. Anywhere you train.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Core Values Section */}
        <section className="mb-20">
          <div className="relative mb-10 md:mb-14">
            <span aria-hidden="true" className="ghost-headline absolute -top-6 md:-top-10 left-0 right-0 text-center text-[80px] md:text-[160px] hidden sm:block">
              VALUES
            </span>
            <div className="relative pt-6 md:pt-12 text-center">
              <p className="text-xs md:text-sm font-bold tracking-[0.3em] text-primary uppercase mb-3">Our Principles</p>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight uppercase">What We Stand For</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 border-border text-center hover:shadow-lg transition-all hover:-translate-y-1">
              <CardHeader>
                <div className="hidden lg:block aspect-[16/9] overflow-hidden rounded-md mb-4 -mt-2">
                  <img src={valueEvidenceBased} alt="Evidence-based training methodology" loading="lazy" className="w-full h-full object-cover" />
                </div>
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 lg:hidden">
                  <Award className="w-7 h-7 text-cyan-500" />
                </div>
                <CardTitle className="text-xl flex items-center justify-center gap-2">
                  <Award className="w-5 h-5 text-cyan-500 hidden lg:inline-block" />
                  Evidence-Based
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-muted-foreground">
                  Every program is backed by sports science, biomechanics, and proven training principles — not trends or guesswork.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 border-border text-center hover:shadow-lg transition-all hover:-translate-y-1">
              <CardHeader>
                <div className="hidden lg:block aspect-[16/9] overflow-hidden rounded-md mb-4 -mt-2">
                  <img src={valueStructureClarity} alt="Structured workout plans with clarity" loading="lazy" className="w-full h-full object-cover" />
                </div>
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 lg:hidden">
                  <CheckCircle2 className="w-7 h-7 text-pink-500" />
                </div>
                <CardTitle className="text-xl flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-pink-500 hidden lg:inline-block" />
                  Structure & Clarity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-muted-foreground">
                  Clear workout plans, step-by-step guidance, and structured progression so you always know what to do and why.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 border-border text-center hover:shadow-lg transition-all hover:-translate-y-1">
              <CardHeader>
                <div className="hidden lg:block aspect-[16/9] overflow-hidden rounded-md mb-4 -mt-2">
                  <img src={valueHumanConnection} alt="Human connection in coaching" loading="lazy" className="w-full h-full object-cover" />
                </div>
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 lg:hidden">
                  <Heart className="w-7 h-7 text-red-500" />
                </div>
                <CardTitle className="text-xl flex items-center justify-center gap-2">
                  <Heart className="w-5 h-5 text-red-500 hidden lg:inline-block" />
                  Human Connection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-muted-foreground">
                  Real coaching, personalized support, and direct access to expert guidance — not chatbots or automated responses.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 border-border text-center hover:shadow-lg transition-all hover:-translate-y-1">
              <CardHeader>
                <div className="hidden lg:block aspect-[16/9] overflow-hidden rounded-md mb-4 -mt-2">
                  <img src={valueResultsDriven} alt="Results-driven training programs" loading="lazy" className="w-full h-full object-cover" />
                </div>
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 lg:hidden">
                  <Target className="w-7 h-7 text-green-500" />
                </div>
                <CardTitle className="text-xl flex items-center justify-center gap-2">
                  <Target className="w-5 h-5 text-green-500 hidden lg:inline-block" />
                  Results-Driven
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-muted-foreground">
                  Our programs are designed to deliver measurable results — strength gains, fat loss, endurance, or whatever your goal is.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Message from Head Coach */}
        {/* Message from Head Coach */}
        <section className="mb-20">
          <div className="relative mb-10 md:mb-14">
            <span aria-hidden="true" className="ghost-headline absolute -top-6 md:-top-10 left-0 right-0 text-center text-[80px] md:text-[160px] hidden sm:block">
              THE COACH
            </span>
            <div className="relative pt-6 md:pt-12 text-center">
              <p className="text-xs md:text-sm font-bold tracking-[0.3em] text-primary uppercase mb-3">A Word From</p>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight uppercase">Message from Haris Falas</h2>
            </div>
          </div>
          <Card className="dark-band border-2 border-primary/30 overflow-hidden relative rounded-2xl">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full -mr-20 -mt-20" aria-hidden="true"></div>

            <CardContent className="relative p-8 md:p-14 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10 items-start">
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-4">
                <div className="w-40 h-40 lg:w-64 lg:h-64 rounded-2xl overflow-hidden border-2 border-primary/40 shadow-2xl">
                  <img src={harisPhoto} alt="Haris Falas - Personal Coach" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-2xl font-black uppercase tracking-tight">
                    <a href="/coach-profile" className="text-primary hover:underline">Haris Falas</a>
                  </p>
                  <p className="text-sm uppercase tracking-[0.2em] text-primary/80 mt-1">Founder · Head Coach</p>
                  <p className="text-sm text-muted-foreground mt-2">Sports Scientist · Strength & Conditioning Coach</p>
                </div>
              </div>

              <div className="space-y-4">
              <p className="text-base leading-relaxed">
                For more than twenty years I've coached athletes, teams, and everyday people — beginners, busy professionals, and gym-goers who simply want to train with purpose. If there's one thing I've learned, it's that people don't struggle because they're lazy. They struggle because they walk into their training without a clear plan, without structure, and without guidance they can trust.
              </p>

              <p className="text-base leading-relaxed">
                That's exactly why I created SmartyGym.
              </p>

              <p className="text-base leading-relaxed">
                My vision is to give people the kind of coaching that makes everything simpler: structured programs, smart progressions, expert guidance, and clear workouts you can follow with confidence — whether you train at home, outdoors, or inside a gym. SmartyGym is here to support your fitness journey, not replace any part of it. If you train in a gym, you'll have a plan. If you train at home, you'll have a structure. If you're busy or traveling, you'll still know exactly what to do.
              </p>

              <p className="text-base leading-relaxed">
                I built this platform for people who want real training, not random exercises. For those who want to feel stronger, move better, improve performance, and see results — with a system that removes confusion and brings clarity every step of the way.
              </p>

              <div className="bg-primary/15 p-4 rounded-lg border-l-4 border-primary">
                <p className="text-base leading-relaxed font-medium">
                  Every single program you see here? I designed it myself. No AI. No automation. No copy-paste templates.
                  Just years of education, experience, and a genuine commitment to YOUR success.
                </p>
              </div>

              <p className="text-base leading-relaxed">
                This project isn't just another fitness idea. It's the result of decades of experience, passion for coaching, and a deep belief that everyone deserves access to smart, effective training, no matter their level or lifestyle.
              </p>

              <p className="text-base leading-relaxed">
                Thank you for trusting me with your fitness. I'm here to guide you, support you, and help you improve — one session at a time.
              </p>

              <p className="text-base leading-relaxed font-medium">
                Every day is a game day.
              </p>

              <div className="flex items-center justify-center gap-2 pt-4">
                <div className="h-px flex-grow bg-primary/30"></div>
                <p className="font-black uppercase tracking-[0.2em] text-primary">
                  <a href="/coach-profile" className="hover:underline">Haris Falas</a>
                </p>
                <div className="h-px flex-grow bg-primary/30"></div>
              </div>
              <p className="text-center text-sm text-muted-foreground">Founder, SmartyGym</p>
              </div>
            </CardContent>
          </Card>
        </section>


        {/* CTA Section */}
        <section className="mb-20">
          <Card className="dark-band border-2 border-primary/30 overflow-hidden relative rounded-2xl">
            <span aria-hidden="true" className="ghost-headline ghost-headline-on-dark absolute top-4 left-1/2 -translate-x-1/2 text-[60px] md:text-[110px] leading-none opacity-40 hidden md:block pointer-events-none whitespace-nowrap">
              JOIN
            </span>
            <CardContent className="p-10 md:p-16 md:pt-24 text-center space-y-6 relative">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">Ready to Start Your Journey?</h2>
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Join thousands of people who are training smarter with SmartyGym.
              </p>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Work with a real coach who designed every program personally — not an AI.
              </p>
              <div className="flex flex-wrap gap-4 justify-center pt-4">
                <Button size="lg" onClick={() => navigate("/workout")} className="gap-2 rounded-full px-8 uppercase tracking-wider font-bold">
                  <Target className="h-5 w-5" />
                  Browse Workouts
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/trainingprogram")} className="gap-2 rounded-full px-8 uppercase tracking-wider font-bold border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  <Calendar className="h-5 w-5" />
                  Explore Programs
                </Button>
                {!isPremium && <Button size="lg" variant="outline" onClick={() => navigate("/smarty-premium")} className="gap-2 rounded-full px-8 uppercase tracking-wider font-bold border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    <UserCheck className="h-5 w-5" />
                    Join Premium
                  </Button>}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
        </LazySection>
          </>}

    </div>
    </>;
};
export default Index;