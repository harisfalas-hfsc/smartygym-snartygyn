import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";
import { InfoRibbon } from "@/components/InfoRibbon";
import { ArrowLeft, Award, Heart, Users, Target, UserCheck, Brain, Shield, Sparkles, Ban, CheckCircle2, Compass } from "lucide-react";
import { BackToTop } from "@/components/BackToTop";
import { useShowBackButton } from "@/hooks/useShowBackButton";
import { useAccessControl } from "@/hooks/useAccessControl";

const About = () => {
  const navigate = useNavigate();
  const { canGoBack, goBack } = useShowBackButton();
  const { userTier } = useAccessControl();
  const isPremium = userTier === "premium";

  return (
    <>
      <Helmet>
        <title>About SmartyGym | Haris Falas Sports Scientist | Online Gym Cyprus | smartygym.com</title>
        <meta name="description" content="Meet Haris Falas - Founder of Cyprus' #1 online gym, smartygym.com. BSc Sports Science, CSCS, EXOS specialist. 20+ years experience in online fitness, personal training & strength conditioning. Human-designed programs, 0% AI." />
        <meta name="keywords" content="Haris Falas, Haris Falas Cyprus, online gym Cyprus, SmartyGym Cyprus, smartygym, smartygym.com, Cyprus fitness, personal training Cyprus, sports scientist Cyprus, strength conditioning coach, online fitness expert, gym Cyprus, Cyprus personal trainer, CSCS Cyprus, fitness coach Cyprus, online gym, gym Reimagined, convenient fitness, flexible online gym, human-designed workouts, no AI fitness" />
        
        <meta property="og:title" content="About SmartyGym | Haris Falas Sports Scientist | Online Gym Cyprus" />
        <meta property="og:description" content="Cyprus' #1 online gym by Haris Falas - BSc Sports Science, CSCS. 20+ years in online fitness & personal training. Human-designed programs, 0% AI at smartygym.com" />
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

        {/* Breadcrumbs */}
        <PageBreadcrumbs 
          items={[
            { label: "Home", href: "/" },
            { label: "About" }
          ]} 
        />

        {/* NO AI Section - Main Differentiator */}
        <section className="mb-16">
          <Card className="border-2 border-primary bg-gradient-to-br from-primary/5 to-accent/10 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16" aria-hidden="true"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/20 rounded-full -ml-12 -mb-12" aria-hidden="true"></div>
            
            <CardContent className="p-8 md:p-12 relative">
              {/* Take A Tour Button - Top Left */}
              <div className="mb-6 md:mb-0 md:absolute md:top-8 md:left-8 z-10">
                <Button 
                  size="lg"
                  onClick={() => navigate("/takeatour")}
                  className="bg-background text-primary border-2 border-primary hover:bg-primary/5 shadow-lg hover:shadow-xl transition-all px-6 py-3 text-sm md:text-base font-semibold"
                >
                  <Compass className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  Take A Tour
                </Button>
              </div>

              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <UserCheck className="w-8 h-8 text-primary" />
                </div>
                <Ban className="w-12 h-12 text-destructive" />
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                  <Brain className="w-8 h-8 text-destructive" />
                </div>
              </div>
              
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-center">
                100% Human. 0% AI.
              </h2>
              
              <div className="max-w-3xl mx-auto space-y-4 text-center mb-8">
                <p className="text-lg font-semibold text-foreground">
                  Smarty Gym workouts and programs are built to fit YOUR life.
                </p>
                <p className="text-base leading-relaxed text-muted-foreground">
                  That's why they work — safe and efficient design by <a href="/coach-profile" className="text-primary hover:underline font-medium"><strong>Haris Falas</strong></a>, crafted by hand with care to deliver effective results at <strong>smartygym.com</strong>, <strong className="text-foreground">NOT by AI</strong>.
                </p>
                <div className="bg-background/80 backdrop-blur-sm p-6 rounded-lg border-2 border-primary/30 mt-6">
                  <p className="text-lg font-bold text-primary mb-2">
                    Every workout and training program is science-based and personally created by <a href="/coach-profile" className="text-primary hover:underline font-medium">Haris Falas</a>.
                  </p>
                  <p className="text-base text-muted-foreground">
                    Never by AI. Never by algorithms. Always by a real human expert who understands YOUR needs. Training designed by humans, for humans.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                <article 
                  className="flex items-start gap-3 p-4 bg-background/50 rounded-lg border border-primary/20"
                  itemScope
                  itemType="https://schema.org/Thing"
                  data-feature="smarty-gym-expertise"
                  data-keywords="smarty gym, online gym, online fitness, smartygym.com, Haris Falas Cyprus, sports scientist"
                  role="article"
                  aria-label="Real expertise - Smarty Gym Cyprus online fitness - smartygym.com by Haris Falas"
                >
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-sm mb-1" itemProp="name">Real Expertise</p>
                    <p className="text-xs text-muted-foreground" itemProp="description">Sports science degree & years of coaching</p>
                  </div>
                </article>
                <article 
                  className="flex items-start gap-3 p-4 bg-background/50 rounded-lg border border-primary/20"
                  itemScope
                  itemType="https://schema.org/Thing"
                  data-feature="smarty-gym-personal-touch"
                  data-keywords="smarty gym, online gym, online fitness, smartygym.com, Haris Falas Cyprus, personalized training"
                  role="article"
                  aria-label="Personal touch - Smarty Gym Cyprus online fitness - smartygym.com by Haris Falas"
                >
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-sm mb-1" itemProp="name">Personal Touch</p>
                    <p className="text-xs text-muted-foreground" itemProp="description">Every program refined through real client feedback</p>
                  </div>
                </article>
                <article 
                  className="flex items-start gap-3 p-4 bg-background/50 rounded-lg border border-primary/20"
                  itemScope
                  itemType="https://schema.org/Thing"
                  data-feature="smarty-gym-human-designed"
                  data-keywords="smarty gym, online gym, online fitness, smartygym.com, Haris Falas Cyprus, human designed workouts"
                  role="article"
                  aria-label="Human designed workouts - Smarty Gym Cyprus online fitness - smartygym.com by Haris Falas"
                >
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-sm mb-1" itemProp="name">Not a Robot</p>
                    <p className="text-xs text-muted-foreground" itemProp="description">Human-designed workouts backed by science, not AI</p>
                  </div>
                </article>
              </div>

              {/* Freedom Statement - Emphasized */}
              <div className="mt-6 mb-0 max-w-3xl mx-auto">
                <div className="bg-gradient-to-r from-primary/10 to-accent/15 backdrop-blur-sm p-4 rounded-lg border-2 border-primary/40 shadow-md">
                  <div className="flex items-center justify-center gap-4">
                    <Sparkles className="w-6 h-6 text-primary flex-shrink-0" />
                    <p className="text-xl font-bold text-center text-foreground">
                      At smartygym.com, we don't just sell fitness. We sell freedom.
                    </p>
                    <Sparkles className="w-6 h-6 text-primary flex-shrink-0" />
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        </section>

        {/* Mission Statement with Cards */}
        <section className="mb-16">
          {/* Your Gym Anywhere Card */}
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/20 mb-8">
            <CardContent className="p-8">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-2xl font-bold flex-1">
                  Your Gym Reimagined Anywhere, Anytime
                </h3>
                <Button
                  onClick={() => navigate("/joinpremium", { state: { from: location.pathname } })}
                  className="ml-4 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                >
                  Join Now
                </Button>
              </div>
              <div className="space-y-4 max-w-3xl mx-auto">
                <p className="text-base font-semibold text-center">
                  We are not here to replace your gym. We are here to back you up when life gets in the way.
                </p>
                <p className="text-base text-muted-foreground text-center leading-relaxed">
                  Whether you're traveling, on holiday, can't make it to the gym, or your gym is closed — 
                  Smarty Gym is your backup plan. Or, if you prefer training from home entirely, we've got you covered. 
                  Expert workouts, professional programs, and practical tools — all designed by real coaches, not algorithms.
                </p>
                <p className="text-base font-semibold text-center text-primary">
                  Wherever you are, your gym comes with you.
                </p>
              </div>
            </CardContent>
          </Card>

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
                  <CardTitle className="text-2xl md:text-3xl">Message from Haris Falas</CardTitle>
                  <p className="text-muted-foreground">Your Personal Coach & Program Designer</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4 relative">
              <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg border border-primary/20">
                <p className="text-lg font-bold mb-1">
                  <a href="/coach-profile" className="text-primary hover:underline">Haris Falas</a>
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
                  <a href="/coach-profile" className="hover:underline">Haris Falas</a>
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
                    Smarty Gym is an online fitness platform providing functional, science-based workouts and training programs 
                    designed by certified coaches. Whether you're training at home, in the gym, or on the go, Smarty Gym 
                    is your backup when life gets in the way — or your complete fitness solution if you prefer training from home. 
                    We make quality fitness accessible anywhere, anytime.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>Who is Haris Falas?</AccordionTrigger>
                  <AccordionContent>
                    <a href="/coach-profile" className="text-primary hover:underline font-medium">Haris Falas</a> is a certified Sports Scientist 
                    and Strength & Conditioning Coach with over 20 years of professional experience. He has worked with elite athletes and professional 
                    football teams in the Cypriot First Division, including AEL Limassol FC and Nea Salamina FC. As the founder of HFSC and 
                    Smarty Gym, <strong>Haris personally designs every single workout and program</strong> — never by AI, always with evidence-based 
                    training principles and real coaching experience.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>What makes Smarty Gym different?</AccordionTrigger>
                  <AccordionContent>
                    <strong>We're 100% human, 0% AI.</strong> Every workout is personally designed by <a href="/coach-profile" className="text-primary hover:underline font-medium">Haris Falas</a>, 
                    a qualified Sports Scientist and S&C Coach — never by algorithms or AI. You get real expertise from a real coach with 20+ years 
                    of experience, real support, and direct access to the person who created your program. We focus on sustainable, functional training 
                    that fits into your real life — not quick fixes or unrealistic promises.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3a">
                  <AccordionTrigger className="text-left">What's the difference between a workout and training program?</AccordionTrigger>
                  <AccordionContent>
                    A <strong>workout</strong> is a standalone training session designed for a specific goal — whether that's calorie burning, 
                    strength building, cardio conditioning, mobility work, or power development. It's perfect when you want a single, 
                    focused session that fits your current needs or time constraints.
                    <br /><br />
                    A <strong>training program</strong> is a complete, structured plan that runs up to 8 weeks and contains multiple workouts 
                    scheduled for every day of the week. Programs are designed with progression in mind, helping you achieve long-term 
                    fitness goals like building muscle hypertrophy, improving cardiovascular endurance, enhancing functional strength, 
                    or losing weight through systematic, progressive training over time.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3b">
                  <AccordionTrigger className="text-left">How do I choose between a workout and training program?</AccordionTrigger>
                  <AccordionContent>
                    <strong>Choose a workout if:</strong>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>You want flexibility to train when it fits your schedule</li>
                      <li>You're looking for variety and mixing different training styles</li>
                      <li>You have limited time and need quick, focused sessions</li>
                      <li>You're maintaining fitness rather than pursuing specific long-term goals</li>
                    </ul>
                    <br />
                    <strong>Choose a training program if:</strong>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>You have a specific goal like building muscle, losing weight, or improving endurance</li>
                      <li>You want structured progression and accountability</li>
                      <li>You can commit to 4-8 weeks of consistent training</li>
                      <li>You prefer having your training planned out with clear weekly schedules</li>
                      <li>You want to see measurable results through systematic training</li>
                    </ul>
                    <br />
                    <strong>Pro tip:</strong> Many members use both — following a program for their main goal while adding individual 
                    workouts for extra sessions or when they want to focus on something specific!
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>Do I need equipment to use Smarty Gym?</AccordionTrigger>
                  <AccordionContent>
                    No! We offer both bodyweight workouts that require no equipment and equipment-based programs. 
                    You can filter workouts based on what you have available — whether that's nothing, 
                    resistance bands, dumbbells, or full gym access. Train anywhere with whatever you have.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger>How long are the workouts?</AccordionTrigger>
                  <AccordionContent>
                    Our workouts range from quick 10-minute sessions to comprehensive 60-minute full workouts. 
                    You can filter by duration to find what fits your schedule — whether you have just 10 minutes or a full hour to train.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger>Can beginners use Smarty Gym?</AccordionTrigger>
                  <AccordionContent>
                    Absolutely! We have workouts and programs specifically designed for all fitness levels, including beginners. 
                    Each workout includes clear instructions, difficulty ratings, and modifications to match your current fitness level. 
                    Start where you are and progress at your own pace with safe, effective programming.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-7">
                  <AccordionTrigger>Why should I go premium?</AccordionTrigger>
                  <AccordionContent>
                    Premium membership unlocks unlimited access to all workouts and training programs, full dashboard access with progress tracking, 
                    complete workout and program history, ability to favorite and rate all content, and direct WhatsApp support from the coaching team. 
                    Free subscribers can access selected free workouts, programs, calculators, and the exercise library, but Premium gives you the full 
                    Smarty Gym experience with structured training programs for long-term goals and personalized support. Choose monthly (€9.99/month) or save 25% with yearly (€89.99/year, only €7.50/month).
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-8">
                  <AccordionTrigger>What's the difference between free and premium access?</AccordionTrigger>
                  <AccordionContent>
                    <strong>Visitors (no login)</strong> can view the exercise library and blog. <strong>Free subscribers</strong> get access to selected free workouts and programs, 
                    full calculators (1RM, BMR, Macro), and limited dashboard features. <strong>Premium members</strong> get unlimited access to all workouts and training programs, 
                    full dashboard with comprehensive progress tracking, complete workout/program favorites and history, and direct WhatsApp support from our coaching team.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-9">
                  <AccordionTrigger>Can I cancel my subscription anytime?</AccordionTrigger>
                  <AccordionContent>
                    Yes! You can cancel your subscription at any time with no long-term commitments or cancellation fees. 
                    Your premium access continues until the end of your current billing period, so you get full value for what you've paid.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-10">
                  <AccordionTrigger>How do I get support or contact the coach?</AccordionTrigger>
                  <AccordionContent>
                    Premium members get direct WhatsApp support from our coaching team for personalized guidance and questions. 
                    All users can also reach out through our <a href="/contact" className="text-primary hover:underline font-medium">contact page</a>. 
                    Unlike AI-generated programs, you're working with real people who care about your progress and are here to help.
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
                {!isPremium && (
                  <Button size="lg" variant="outline" onClick={() => navigate("/premiumbenefits")} className="gap-2">
                    <UserCheck className="w-5 h-5" />
                    Join Premium
                  </Button>
                )}
              </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
};

export default About;
