import { Helmet } from "react-helmet";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollReveal } from "@/components/ScrollReveal";
import { CheckCircle2, Target, Heart, Users, Shield, Award, Compass, GraduationCap, Plane, Dumbbell, UserCheck, Smartphone, Calendar, Video, Wrench, FileText, BookOpen, ChevronRight } from "lucide-react";
import { useAccessControl } from "@/hooks/useAccessControl";
import { SEOEnhancer } from "@/components/SEOEnhancer";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";

const About = () => {
  const navigate = useNavigate();
  const { userTier } = useAccessControl();
  const isPremium = userTier === "premium";

  return (
    <>
      <Helmet>
        <title>About SmartyGym | Online Fitness Platform | Science-Based Training</title>
        <meta name="description" content="Learn about SmartyGym - Your leading online fitness platform. Science-based workouts, expert coaching by Haris Falas, and accessible training for everyone, anywhere." />
        <meta name="keywords" content="about smartygym, online fitness platform, science-based training, haris falas, online personal training, functional workouts, home gym" />
        
        {/* Open Graph */}
        <meta property="og:title" content="About SmartyGym - Your Online Gym Re-imagined" />
        <meta property="og:description" content="Discover how SmartyGym makes quality fitness accessible to everyone with science-based workouts and expert coaching." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://smartygym.com/about" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About SmartyGym - Online Fitness Platform" />
        <meta name="twitter:description" content="Science-based workouts and expert coaching by certified coach Haris Falas." />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://smartygym.com/about" />
        
        {/* Structured Data - Organization */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "SmartyGym",
            "url": "https://smartygym.com",
            "logo": "https://smartygym.com/smarty-gym-logo.png",
            "description": "Online fitness platform providing science-based workouts and training programs designed by certified coach Haris Falas",
            "founder": {
              "@type": "Person",
              "name": "Haris Falas",
              "jobTitle": "Sports Scientist & Strength & Conditioning Coach"
            },
            "areaServed": "Worldwide",
            "sameAs": [
              "https://www.instagram.com/smartygym",
              "https://www.facebook.com/smartygym"
            ]
          })}
        </script>
        
        {/* Breadcrumb Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://smartygym.com"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "About",
                "item": "https://smartygym.com/about"
              }
            ]
          })}
        </script>
      </Helmet>

      <SEOEnhancer
        entities={["About SmartyGym", "Company Information", "Our Mission", "Haris Falas"]}
        topics={["company background", "fitness mission", "online gym platform", "expert coaching"]}
        expertise={["platform development", "fitness coaching", "sports science"]}
        contentType="About Page"
        aiSummary="About SmartyGym: Global online fitness platform founded by Sports Scientist Haris Falas. Science-based workouts, accessible training, and 100% human-designed programs. Your gym reimagined for real life."
        aiKeywords={["about smartygym", "online fitness platform", "haris falas", "fitness mission", "company background", "gym platform"]}
        relatedContent={["Coach Profile", "FAQ", "Contact", "Premium Membership"]}
        targetAudience="users learning about the platform"
        pageType="AboutPage"
      />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          
          <PageBreadcrumbs items={[
            { label: "Home", href: "/" },
            { label: "About" }
          ]} />

          {/* Hero Section */}
          <ScrollReveal>
            <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
          About <span className="text-primary">SmartyGym</span>
        </h1>
              <Link to="/the-smarty-method" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline md:hidden">
                <BookOpen className="w-4 h-4" />
                Discover The Smarty Method
                <ChevronRight className="w-4 h-4" />
              </Link>
              <p className="hidden md:block text-lg text-muted-foreground max-w-3xl mx-auto">
                We're redefining online fitness — making quality training accessible, flexible, and designed for real life.
              </p>
            </div>
          </ScrollReveal>

          {/* Mission Statement */}
          {/* Desktop: Single card with both paragraphs */}
          <ScrollReveal>
            <Card className="mb-12 border-2 border-primary hidden md:block">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <Target className="w-12 h-12 text-primary mx-auto" />
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    Your Gym Re-imagined. Anywhere, Anytime.
                  </h2>
                  <div className="space-y-4 max-w-4xl mx-auto">
                    <div className="space-y-3 max-w-md mx-auto">
                      <div className="flex items-center gap-3">
                        <Dumbbell className="w-6 h-6 text-orange-500 flex-shrink-0" />
                        <span className="text-base font-semibold text-foreground">Expert-Crafted Workouts</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="w-6 h-6 text-blue-500 flex-shrink-0" />
                        <span className="text-base font-semibold text-foreground">Structured Training Programs</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Video className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                        <span className="text-base font-semibold text-foreground">Exercise Library</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Wrench className="w-6 h-6 text-purple-500 flex-shrink-0" />
                        <span className="text-base font-semibold text-foreground">Smarty Tools</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-cyan-500 flex-shrink-0" />
                        <span className="text-base font-semibold text-foreground">Articles</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-6 h-6 text-pink-500 flex-shrink-0" />
                        <span className="text-base font-semibold text-foreground">LogBook</span>
                      </div>
                    </div>
                    <p className="text-base text-muted-foreground text-center leading-relaxed">
                      Everything a complete gym must offer, built by real professionals, in your pocket at <strong className="text-foreground">smartygym.com</strong>.
                    </p>
                    <p className="text-base text-muted-foreground text-center leading-relaxed">
                      We are not here to replace your gym. We are here to back you up when life gets in the way. Whether you're traveling, on holiday, can't make it to the gym, or your gym is closed — <span className="text-primary font-semibold">SmartyGym</span> is your backup plan. Or, if you prefer training from home entirely, we've got you covered. Or, if you go to your gym but want to follow a professional, science-based workout or training program designed by{' '}
                      <a 
                        href="/coach-profile" 
                        onClick={(e) => {
                          e.preventDefault();
                          navigate('/coach-profile');
                        }}
                        className="text-primary hover:underline font-medium cursor-pointer"
                      >
                        Haris Falas
                      </a>, we provide that expert guidance. <span className="font-semibold text-primary">Wherever you are, your gym comes with you.</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Mobile: Two separate cards */}
          <div className="md:hidden space-y-6 mb-12">
            <Card className="border-2 border-primary">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <Target className="w-12 h-12 text-primary mx-auto" />
                  <h2 className="text-2xl font-bold text-foreground">
                    Your Gym Re-imagined. Anywhere, Anytime.
                  </h2>
                  <div className="space-y-3 text-left">
                    <div className="flex items-center gap-3 cursor-pointer active:opacity-70" onClick={() => navigate('/workout')}>
                      <Dumbbell className="w-6 h-6 text-orange-500 flex-shrink-0" />
                      <span className="text-sm font-semibold text-primary hover:underline">Expert-Crafted Workouts</span>
                    </div>
                    <div className="flex items-center gap-3 cursor-pointer active:opacity-70" onClick={() => navigate('/trainingprogram')}>
                      <Calendar className="w-6 h-6 text-blue-500 flex-shrink-0" />
                      <span className="text-sm font-semibold text-primary hover:underline">Structured Training Programs</span>
                    </div>
                    <div className="flex items-center gap-3 cursor-pointer active:opacity-70" onClick={() => navigate('/exerciselibrary')}>
                      <Video className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                      <span className="text-sm font-semibold text-primary hover:underline">Exercise Library</span>
                    </div>
                    <div className="flex items-center gap-3 cursor-pointer active:opacity-70" onClick={() => navigate('/tools')}>
                      <Wrench className="w-6 h-6 text-purple-500 flex-shrink-0" />
                      <span className="text-sm font-semibold text-primary hover:underline">Smarty Tools</span>
                    </div>
                    <div className="flex items-center gap-3 cursor-pointer active:opacity-70" onClick={() => navigate('/blog')}>
                      <FileText className="w-6 h-6 text-cyan-500 flex-shrink-0" />
                      <span className="text-sm font-semibold text-primary hover:underline">Articles</span>
                    </div>
                    <div className="flex items-center gap-3 cursor-pointer active:opacity-70" onClick={() => navigate('/userdashboard?tab=logbook')}>
                      <BookOpen className="w-6 h-6 text-pink-500 flex-shrink-0" />
                      <span className="text-sm font-semibold text-primary hover:underline">LogBook</span>
                    </div>
                  </div>
                  <p className="text-base text-muted-foreground text-center leading-relaxed">
                    Everything a complete gym must offer, built by real professionals, in your pocket at <strong className="text-primary">smartygym.com</strong>.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <Smartphone className="w-12 h-12 text-primary mx-auto" />
                  <h2 className="text-2xl font-bold text-foreground">
                    Who Is <span className="text-primary">SmartyGym</span> For
                  </h2>
                  <div className="space-y-3 text-left">
                    <div className="flex items-center gap-3">
                      <Users className="w-6 h-6 text-blue-500 flex-shrink-0" />
                      <span className="text-sm font-semibold text-foreground">Busy adults</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Heart className="w-6 h-6 text-pink-500 flex-shrink-0" />
                      <span className="text-sm font-semibold text-foreground">Parents</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <GraduationCap className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                      <span className="text-sm font-semibold text-foreground">Beginners</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Target className="w-6 h-6 text-orange-500 flex-shrink-0" />
                      <span className="text-sm font-semibold text-foreground">Intermediate lifters</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Plane className="w-6 h-6 text-cyan-500 flex-shrink-0" />
                      <span className="text-sm font-semibold text-foreground">Travelers</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Dumbbell className="w-6 h-6 text-purple-500 flex-shrink-0" />
                      <span className="text-sm font-semibold text-foreground">Gym-goers</span>
                    </div>
                  </div>
                  <div className="pt-4 space-y-2">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      We are not here to replace your gym. We are here to back you up when life gets in the way.
                    </p>
                    <p className="text-sm font-semibold text-primary">
                      Wherever you are, your gym comes with you.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mobile: Core Values - Single compact card */}
          <Card className="mb-12 border-2 border-primary md:hidden">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold text-foreground">What We Stand For</h2>
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-6 h-6 text-red-500 flex-shrink-0" />
                    <span className="text-sm font-semibold text-foreground">100% Human. 0% AI.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Heart className="w-6 h-6 text-orange-500 flex-shrink-0" />
                    <span className="text-sm font-semibold text-foreground">Built for Real Life</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Award className="w-6 h-6 text-purple-500 flex-shrink-0" />
                    <span className="text-sm font-semibold text-foreground">Science-Based Approach</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm font-semibold text-foreground">Accessible to Everyone</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-blue-500 flex-shrink-0" />
                    <span className="text-sm font-semibold text-foreground">Safe and Effective</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Desktop: Core Values - Grid Layout */}
          <ScrollReveal>
            <section className="mb-12 hidden md:block">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">What We Stand For</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-2 border-border hover:border-primary transition-all">
                  <CardContent className="p-6 text-center space-y-3">
                    <Heart className="w-10 h-10 text-orange-500 mx-auto" />
                    <h3 className="font-bold text-lg">Built for Real Life</h3>
                    <p className="text-sm text-muted-foreground">
                      Flexible training that fits your schedule, location, and lifestyle — not the other way around.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-border hover:border-primary transition-all">
                  <CardContent className="p-6 text-center space-y-3">
                    <Award className="w-10 h-10 text-purple-500 mx-auto" />
                    <h3 className="font-bold text-lg">Science-Based Approach</h3>
                    <p className="text-sm text-muted-foreground">
                      Every workout is designed using evidence-based training principles, not trends or fads.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-border hover:border-primary transition-all">
                  <CardContent className="p-6 text-center space-y-3">
                    <Users className="w-10 h-10 text-emerald-500 mx-auto" />
                    <h3 className="font-bold text-lg">Accessible to Everyone</h3>
                    <p className="text-sm text-muted-foreground">
                      From beginners to advanced athletes, everyone deserves access to quality fitness guidance.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-border hover:border-primary transition-all">
                  <CardContent className="p-6 text-center space-y-3">
                    <Shield className="w-10 h-10 text-blue-500 mx-auto" />
                    <h3 className="font-bold text-lg">Safe and Effective</h3>
                    <p className="text-sm text-muted-foreground">
                      Proper technique, realistic progressions, and injury prevention are at the core of everything we do.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>
          </ScrollReveal>

          {/* The SmartyGym Promise */}
          <ScrollReveal>
            <Card className="mb-12 border-2 border-border bg-primary/5">
              <CardContent className="p-6">
                <div className="text-center space-y-6">
                  <Compass className="w-12 h-12 text-primary mx-auto" />
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">The <span className="text-primary">SmartyGym</span> Promise</h2>
                  
                  <div className="grid md:grid-cols-3 gap-6 text-left max-w-5xl mx-auto">
                    
                    <div className="space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-primary" />
                      <h3 className="font-bold">Real Expertise</h3>
                      <p className="text-sm text-muted-foreground">
                        Every program is designed by certified coach <a href="/coach-profile" className="text-primary hover:underline font-medium">Haris Falas</a> — never by AI, always with 20+ years of experience.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-primary" />
                      <h3 className="font-bold">Personal Touch</h3>
                      <p className="text-sm text-muted-foreground">
                        Direct access to the coach who created your program. Real support, real guidance, real results.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-primary" />
                      <h3 className="font-bold">Not a Robot</h3>
                      <p className="text-sm text-muted-foreground">
                        We don't generate workouts with algorithms. We design them with care, experience, and your goals in mind.
                      </p>
                    </div>

                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>


          {/* Desktop/Tablet: Who Is SmartyGym For? - Grid Layout */}
          <ScrollReveal>
            <Card className="mb-12 border-2 border-border hidden md:block">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <Users className="w-12 h-12 text-primary mx-auto" />
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    Who Is <span className="text-primary">SmartyGym</span> For
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-4xl mx-auto mt-6">
                    <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                      <Users className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-sm font-semibold text-foreground">Busy adults</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                      <Heart className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-sm font-semibold text-foreground">Parents</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                      <GraduationCap className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-sm font-semibold text-foreground">Beginners</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                      <Target className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-sm font-semibold text-foreground">Intermediate lifters</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                      <Plane className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-sm font-semibold text-foreground">Travelers</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                      <Dumbbell className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-sm font-semibold text-foreground">Gym-goers</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* CTA - Only visible to non-premium users */}
          {!isPremium && (
            <ScrollReveal>
              <Card className="border-2 border-primary bg-primary/5 text-center">
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-2xl md:text-3xl font-bold">Ready to Start Your Journey?</h2>
                  <Button 
                    size="lg" 
                    onClick={() => navigate('/joinpremium')}
                    className="mt-4"
                  >
                    Start Now
                  </Button>
                </CardContent>
              </Card>
            </ScrollReveal>
          )}

        </div>
      </div>
    </>
  );
};

export default About;
