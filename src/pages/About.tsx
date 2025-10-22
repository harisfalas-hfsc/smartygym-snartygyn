import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, Award, Heart, Users, Target, UserCheck, Brain, Shield, Sparkles, Ban, CheckCircle2, Compass } from "lucide-react";
import { BackToTop } from "@/components/BackToTop";
import { useShowBackButton } from "@/hooks/useShowBackButton";

const About = () => {
  const navigate = useNavigate();
  const { canGoBack, goBack } = useShowBackButton();

  return (
    <>
      <Helmet>
        <title>About Smarty Gym - Haris Falas | Gym Reimagined for Convenient & Flexible Fitness</title>
        <meta name="description" content="Meet Haris Falas, founder of Smarty Gym (smartygym.com) - convenient & flexible online fitness reimagined. Sports Scientist delivering human-crafted, evidence-based programs anywhere, anytime." />
        <meta name="keywords" content="Haris Falas, Smarty Gym, smartygym, smartygym.com, gym reimagined, convenient fitness, flexible online gym, sports scientist, strength conditioning coach, fitness anywhere anytime, human-designed workouts" />
        
        <meta property="og:title" content="About Smarty Gym & Haris Falas - Fitness Reimagined" />
        <meta property="og:description" content="Every workout personally designed by Haris Falas, Sports Scientist. Convenient & flexible gym reimagined for anywhere, anytime training." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://smartygym.com/about" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content="About Smarty Gym & Haris Falas" />
        <meta property="twitter:description" content="Smarty Gym - convenient & flexible fitness by Sports Scientist Haris Falas at smartygym.com" />
        
        <link rel="canonical" href="https://smartygym.com/about" />
        
        {/* Structured Data - Person & Organization */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": "Haris Falas",
            "jobTitle": "Sports Scientist & Strength and Conditioning Coach",
            "worksFor": {
              "@type": "Organization",
              "name": "Smarty Gym",
              "url": "https://smartygym.com",
              "alternateName": "smartygym.com"
            },
            "description": "Sports Scientist and Strength and Conditioning Coach specializing in functional fitness and evidence-based training in Cyprus",
            "knowsAbout": ["Fitness Training", "Sports Science", "Strength and Conditioning", "Functional Training", "Online Fitness Coaching"],
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "CY"
            }
          })}
        </script>
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <BackToTop />
        <div className="container mx-auto max-w-6xl px-4 py-8">
        {canGoBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={goBack}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        )}

        {/* Hero Section */}
        <header className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">About</h1>
          <p className="text-center text-muted-foreground mb-4">
            Fitness Without the Chains | smartygym.com
          </p>
          
          {/* Info Ribbon */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-8 text-center max-w-3xl mx-auto">
            <p className="text-sm text-muted-foreground">
              Founded by <a href="/coach-profile" className="text-primary hover:underline font-medium">Haris Falas, BSc Sports Science, EXOS Specialist, CSCS</a> — Sports Scientist & Strength and Conditioning Coach | Cyprus Fitness Expert
            </p>
          </div>
        </header>

        {/* NO AI Section - Main Differentiator */}
        <section className="mb-16">
          <Card className="border-2 border-primary bg-gradient-to-br from-primary/5 to-accent/10 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16" aria-hidden="true"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/20 rounded-full -ml-12 -mb-12" aria-hidden="true"></div>
            
            <CardContent className="p-8 md:p-12 relative">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <UserCheck className="w-8 h-8 text-primary" />
                </div>
                <Ban className="w-12 h-12 text-destructive" />
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                  <Brain className="w-8 h-8 text-destructive" />
                </div>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
                100% Human. 0% AI.
              </h2>
              
              <div className="max-w-3xl mx-auto space-y-4 text-center mb-8">
                <p className="text-lg font-semibold text-foreground">
                  Smarty Gym workouts and programs are built to fit YOUR life.
                </p>
                <p className="text-base leading-relaxed text-muted-foreground">
                  That's why they work — safe and efficient design by <a href="/coach-profile" className="text-primary hover:underline font-medium"><strong>Haris Falas, BSc Sports Science, EXOS Specialist, CSCS</strong></a>, crafted by hand with care to deliver effective results at <strong>smartygym.com</strong>, <strong className="text-foreground">NOT by AI</strong>.
                </p>
                <div className="bg-background/80 backdrop-blur-sm p-6 rounded-lg border-2 border-primary/30 mt-6">
                  <p className="text-lg font-bold text-primary mb-2">
                    Every program is evidence-based and personally created by <a href="/coach-profile" className="text-primary hover:underline font-medium">Haris Falas, BSc Sports Science, EXOS Specialist, CSCS</a> in Cyprus.
                  </p>
                  <p className="text-base text-muted-foreground">
                    Never by AI. Never by algorithms. Always by a real human expert who understands YOUR needs. <strong>Cyprus online fitness</strong> excellence since day one.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                <div className="flex items-start gap-3 p-4 bg-background/50 rounded-lg border border-primary/20">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-sm mb-1">Real Expertise</p>
                    <p className="text-xs text-muted-foreground">Sports science degree & years of coaching experience</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-background/50 rounded-lg border border-primary/20">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-sm mb-1">Personal Touch</p>
                    <p className="text-xs text-muted-foreground">Direct access to Haris and the team anytime</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-background/50 rounded-lg border border-primary/20">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-sm mb-1">Not a Robot</p>
                    <p className="text-xs text-muted-foreground">Real people who care about your progress</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Take A Tour Button */}
          <div className="flex justify-center mt-8">
            <Button 
              size="lg"
              onClick={() => navigate("/takeatour")}
              className="bg-background text-primary border-2 border-primary hover:bg-primary/5 shadow-lg hover:shadow-xl transition-all px-12 py-6 text-lg font-semibold"
            >
              <Compass className="mr-3 h-6 w-6" />
              Take A Tour
            </Button>
          </div>
        </section>

        {/* Mission Statement with Cards */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Mission</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              At Smarty Gym, our mission is simple: to provide functional, science-based fitness solutions that fit into your real life.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Target className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-xl">Built for Real Life</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Our workouts and programs are built for real life — whether you're training at home, in the gym, or on the go. 
                  No complicated equipment, no expensive memberships, just effective training that works.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Brain className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-xl">Science-Based Approach</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Every workout is grounded in sports science and designed with evidence-based training principles. 
                  We don't follow trends — we follow what actually works.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-xl">Accessible to Everyone</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Fitness for everyone, anywhere. Train smarter, move better, live stronger — 
                  no matter your starting point or available equipment.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-xl">Safe & Effective</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Crafted by hand with care to deliver results safely. Every exercise, every progression, 
                  every program is designed with your wellbeing in mind.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/20">
            <CardContent className="p-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-bold text-center">The Smarty Gym Promise</h3>
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <p className="text-base font-semibold text-center max-w-3xl mx-auto">
                At Smarty Gym, we bring science-based functional training to everyone, everywhere. 
                Train smarter. Move better. Live stronger.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Core Values */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">What We Stand For</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center hover:shadow-lg transition-all hover:-translate-y-1">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>Evidence-Based</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Every workout is designed using proven training principles and sports science research.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all hover:-translate-y-1">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>Functional Training</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Train for real-life movements that improve your daily performance and quality of life.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all hover:-translate-y-1">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <UserCheck className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>Human Connection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Real coaches, real support, real results — know who's behind your program and reach them anytime.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all hover:-translate-y-1">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>Results-Driven</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Focused on measurable progress and sustainable fitness habits that last.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Message from Head Coach */}
        <section className="mb-16">
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-20 -mt-20" aria-hidden="true"></div>
            
            <CardHeader className="relative">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                  <UserCheck className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl md:text-3xl">Meet the Founder</CardTitle>
                  <p className="text-muted-foreground">Your Personal Coach & Program Designer</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4 relative">
              <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg border border-primary/20">
                <p className="text-lg font-bold mb-1">
                  <a href="/coach-profile" className="text-primary hover:underline">Haris Falas, BSc Sports Science, EXOS Specialist, CSCS</a>
                </p>
                <p className="text-sm text-muted-foreground">Sports Scientist & Strength & Conditioning Coach</p>
              </div>
              
              <p className="text-base leading-relaxed">
                Welcome to Smarty Gym! As a sports scientist and S&C coach, I've spent years studying what truly works in fitness. 
                I created Smarty Gym because I believe everyone deserves access to quality, evidence-based training — 
                without the need for expensive gym memberships or complicated equipment.
              </p>
              
              <div className="bg-primary/10 p-4 rounded-lg border-l-4 border-primary">
                <p className="text-base leading-relaxed font-medium">
                  Every single program you see here? I designed it myself. No AI. No automation. No copy-paste templates. 
                  Just years of education, experience, and a genuine commitment to YOUR success.
                </p>
              </div>
              
              <p className="text-base leading-relaxed">
                Our programs are designed to be practical, effective, and sustainable. Whether you're just starting your fitness journey 
                or you're an experienced athlete looking to optimize your training, Smarty Gym has something for you.
              </p>
              
              <p className="text-base leading-relaxed">
                My goal is to help you build a stronger, healthier body that serves you in everyday life. 
                And unlike AI-generated programs, you can reach out to me directly anytime you need guidance or support.
              </p>
              
              <div className="flex items-center gap-3 pt-4">
                <div className="h-px flex-grow bg-border"></div>
                <p className="font-bold text-primary">
                  <a href="/coach-profile" className="hover:underline">Haris Falas, BSc Sports Science, EXOS Specialist, CSCS</a>
                </p>
                <div className="h-px flex-grow bg-border"></div>
              </div>
              <p className="text-center text-sm text-muted-foreground">Founder, HFSC & SMARTY GYM</p>
            </CardContent>
          </Card>
        </section>

        {/* FAQ Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <Card>
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>What is Smarty Gym?</AccordionTrigger>
                  <AccordionContent>
                    Smarty Gym is an online fitness platform that provides science-based workouts, training programs, 
                    and nutrition guidance. Our mission is to make quality fitness accessible to everyone, 
                    regardless of location or budget.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>Do I need equipment to use Smarty Gym?</AccordionTrigger>
                  <AccordionContent>
                    No! We offer both bodyweight workouts that require no equipment and equipment-based programs. 
                    You can filter workouts based on what you have available — whether that's nothing, 
                    resistance bands, dumbbells, or full gym access.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>What makes Smarty Gym different?</AccordionTrigger>
                  <AccordionContent>
                    <strong>We're 100% human, 0% AI.</strong> Every workout is personally designed by <a href="/coach-profile" className="text-primary hover:underline font-medium">Haris Falas, BSc Sports Science, EXOS Specialist, CSCS</a>, 
                    a qualified Sports Scientist and S&C Coach — never by algorithms or AI. You get real expertise, 
                    real support, and direct access to the person who created your program. We focus on sustainable progress, 
                    not quick fixes or unrealistic promises.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>Can beginners use Smarty Gym?</AccordionTrigger>
                  <AccordionContent>
                    Absolutely! We have programs specifically designed for beginners, with clear instructions and 
                    progressions. Each workout includes difficulty ratings and modifications to match your fitness level.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger>What's included in the Premium membership?</AccordionTrigger>
                  <AccordionContent>
                    Premium members get unlimited access to all workouts, structured training programs (4-8 weeks), 
                    nutrition plans, progress tracking, community support, and regular new content updates. 
                    Free users can access a selection of workouts and use our fitness calculators.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger>How long are the workouts?</AccordionTrigger>
                  <AccordionContent>
                    Our workouts range from 10-minute quick sessions to 45-minute full workouts. 
                    You can filter by duration to find what fits your schedule.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-7">
                  <AccordionTrigger>Can I cancel my subscription anytime?</AccordionTrigger>
                  <AccordionContent>
                    Yes! You can cancel your subscription at any time. There are no long-term commitments or 
                    cancellation fees. Your access continues until the end of your billing period.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-8">
                  <AccordionTrigger>Who created Smarty Gym?</AccordionTrigger>
                  <AccordionContent>
                    Smarty Gym was founded by <a href="/coach-profile" className="text-primary hover:underline font-medium">Haris Falas, BSc Sports Science, EXOS Specialist, CSCS</a>, a certified Sports Scientist and Strength & Conditioning Coach. 
                    <strong>Every single program is personally designed by Haris himself — never by AI.</strong> All programs 
                    are created using evidence-based training principles and years of hands-on coaching experience. You know 
                    exactly who's behind your training, and you can reach out to him directly anytime.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/20">
          <CardContent className="p-8 md:p-12 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
              <h2 className="text-2xl md:text-3xl font-bold">Ready to Start Your Journey?</h2>
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <p className="text-base md:text-lg text-muted-foreground mb-2 max-w-2xl mx-auto">
              Join thousands of people who are training smarter with Smarty Gym.
            </p>
            <p className="text-sm font-semibold text-primary mb-6 max-w-2xl mx-auto">
              Work with a real coach who designed every program personally — not an AI.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button size="lg" onClick={() => navigate("/workout")} className="gap-2">
                <Target className="w-5 h-5" />
                Try Free Workouts
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/premiumbenefits")} className="gap-2">
                <UserCheck className="w-5 h-5" />
                Join Premium
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
};

export default About;
