import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollReveal } from "@/components/ScrollReveal";
import { CheckCircle2, Target, Heart, Users, Shield, Award, Compass, ArrowLeft } from "lucide-react";
import { useShowBackButton } from "@/hooks/useShowBackButton";

const About = () => {
  const navigate = useNavigate();
  const showBackButton = useShowBackButton();

  return (
    <>
      <Helmet>
        <title>About SmartyGym | Online Fitness Platform Cyprus | Science-Based Training</title>
        <meta name="description" content="Learn about SmartyGym - Cyprus's leading online fitness platform. Science-based workouts, expert coaching by Haris Falas, and accessible training for everyone, anywhere." />
        <meta name="keywords" content="about smartygym, online fitness platform cyprus, science-based training, haris falas, online personal training, functional workouts, home gym cyprus" />
        
        {/* Open Graph */}
        <meta property="og:title" content="About SmartyGym - Your Online Gym Re-imagined" />
        <meta property="og:description" content="Discover how SmartyGym makes quality fitness accessible to everyone with science-based workouts and expert coaching." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://smartygym.com/about" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About SmartyGym - Online Fitness Platform Cyprus" />
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

      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          
          {/* Back Button */}
          {showBackButton && (
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="mb-6 gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          )}

          {/* Hero Section */}
          <ScrollReveal>
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                About SmartyGym
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                We're redefining online fitness — making quality training accessible, flexible, and designed for real life.
              </p>
            </div>
          </ScrollReveal>

          {/* Mission Statement */}
          <ScrollReveal>
            <Card className="mb-12 border-2 border-primary">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <Target className="w-12 h-12 text-primary mx-auto" />
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    Your Gym Re-imagined. Anywhere, Anytime.
                  </h2>
                  <p className="text-base leading-relaxed text-muted-foreground max-w-4xl mx-auto">
                    SmartyGym was created to solve a simple problem: life gets in the way. Whether you're traveling, 
                    stuck at home, can't make it to the gym, or simply prefer training on your own terms — 
                    we're here to back you up. Our platform offers science-based workouts and training programs 
                    designed by qualified coaches, ensuring you never miss a session and always have access to expert training.
                  </p>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Core Values */}
          <ScrollReveal>
            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">What We Stand For</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <Card className="border-2 border-border hover:border-primary transition-all">
                  <CardContent className="p-6 text-center space-y-3">
                    <Heart className="w-10 h-10 text-primary mx-auto" />
                    <h3 className="font-bold text-lg">Built for Real Life</h3>
                    <p className="text-sm text-muted-foreground">
                      Flexible training that fits your schedule, location, and lifestyle — not the other way around.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-border hover:border-primary transition-all">
                  <CardContent className="p-6 text-center space-y-3">
                    <Award className="w-10 h-10 text-primary mx-auto" />
                    <h3 className="font-bold text-lg">Science-Based Approach</h3>
                    <p className="text-sm text-muted-foreground">
                      Every workout is designed using evidence-based training principles, not trends or fads.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-border hover:border-primary transition-all">
                  <CardContent className="p-6 text-center space-y-3">
                    <Users className="w-10 h-10 text-primary mx-auto" />
                    <h3 className="font-bold text-lg">Accessible to Everyone</h3>
                    <p className="text-sm text-muted-foreground">
                      From beginners to advanced athletes, everyone deserves access to quality fitness guidance.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-border hover:border-primary transition-all">
                  <CardContent className="p-6 text-center space-y-3">
                    <Shield className="w-10 h-10 text-primary mx-auto" />
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
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">The SmartyGym Promise</h2>
                  
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

          {/* Who Is SmartyGym For */}
          <ScrollReveal>
            <Card className="mb-12 border-2 border-border">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <Users className="w-12 h-12 text-primary mx-auto" />
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    Who Is SmartyGym For?
                  </h2>
                  <div className="max-w-4xl mx-auto space-y-6 text-left">
                    <div>
                      <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                        Beginner-Friendly
                      </h3>
                      <p className="text-muted-foreground ml-7">
                        If you're new to fitness, SmartyGym is a safe, structured, and supportive place to start. 
                        Our workouts guide you through proper technique, realistic progressions, and sustainable training habits.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                        Expert-Approved
                      </h3>
                      <p className="text-muted-foreground ml-7">
                        If you're already experienced, you'll appreciate the science-based approach, intelligent programming, 
                        and advanced training methods built into every session. No fluff, no shortcuts — just effective training 
                        designed by a qualified coach with over 20 years in the field.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* CTA */}
          <ScrollReveal>
            <Card className="border-2 border-primary bg-primary/5 text-center">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-2xl md:text-3xl font-bold">Ready to Start Your Journey?</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Join thousands of people training smarter with SmartyGym. Whether you're at home, in the gym, 
                  or on the go — we've got you covered.
                </p>
                <Button 
                  size="lg" 
                  onClick={() => navigate('/joinpremium')}
                  className="mt-4"
                >
                  Start Training Today
                </Button>
              </CardContent>
            </Card>
          </ScrollReveal>

        </div>
      </div>
    </>
  );
};

export default About;
