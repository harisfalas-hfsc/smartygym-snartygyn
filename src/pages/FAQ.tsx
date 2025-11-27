import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollReveal } from "@/components/ScrollReveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, ArrowLeft, MessageCircle } from "lucide-react";
import { useShowBackButton } from "@/hooks/useShowBackButton";
import { SEOEnhancer } from "@/components/SEOEnhancer";

const FAQ = () => {
  const navigate = useNavigate();
  const showBackButton = useShowBackButton();

  return (
    <>
      <Helmet>
        <title>FAQ - Frequently Asked Questions | SmartyGym Online Fitness</title>
        <meta name="description" content="Get answers to common questions about SmartyGym - online workouts, training programs, pricing, equipment needs, and how to get started with your fitness journey." />
        <meta name="keywords" content="smartygym faq, online fitness questions, home workout help, training program questions, fitness coaching faq, online gym help" />
        
        {/* Open Graph */}
        <meta property="og:title" content="FAQ - Your Questions Answered | SmartyGym" />
        <meta property="og:description" content="Everything you need to know about SmartyGym - workouts, programs, pricing, and getting started." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://smartygym.com/faq" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="FAQ - SmartyGym" />
        <meta name="twitter:description" content="Common questions about online fitness training with SmartyGym." />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://smartygym.com/faq" />
        
        {/* FAQ Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What is SmartyGym?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "SmartyGym is an online fitness platform providing functional, science-based workouts and training programs designed by certified coaches. Whether you're training at home, in the gym, or on the go, SmartyGym is your backup when life gets in the way — or your complete fitness solution if you prefer training from home."
                }
              },
              {
                "@type": "Question",
                "name": "Who is Haris Falas?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Haris Falas is a certified Sports Scientist and Strength & Conditioning Coach with over 20 years of professional experience. He has worked with elite athletes and professional football teams in the Cypriot First Division. As the founder of HFSC and SmartyGym, Haris personally designs every single workout and program."
                }
              },
              {
                "@type": "Question",
                "name": "What makes SmartyGym different?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "We're 100% human, 0% AI. Every workout is personally designed by Haris Falas, a qualified Sports Scientist and S&C Coach — never by algorithms or AI. You get real expertise from a real coach with 20+ years of experience, real support, and direct access to the person who created your program."
                }
              },
              {
                "@type": "Question",
                "name": "Do I need gym equipment?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Not necessarily. We offer a wide variety of workouts and programs designed for different equipment scenarios: bodyweight only, minimal equipment (resistance bands, dumbbells), and full gym access. You can filter content based on what you have available."
                }
              },
              {
                "@type": "Question",
                "name": "Is there a free trial?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes! We offer free access to selected workouts, tools, and resources so you can explore the platform before committing. Additionally, you can purchase selected premium workouts or training programs as standalone items — this lets you experience our coaching philosophy and training quality before committing to a full subscription. Premium subscriptions (Gold and Platinum) unlock our full library."
                }
              },
              {
                "@type": "Question",
                "name": "What is a standalone purchase?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "A standalone purchase allows you to buy individual premium workouts or training programs without committing to a subscription. This is perfect for trying our training methodology before upgrading. Simply create a free account, browse our content, click 'Buy Now' on any standalone-enabled item, complete payment, and access it immediately. You get full dashboard access for purchased content including logbook tracking, ratings, and all calculator tools."
                }
              }
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
                "name": "FAQ",
                "item": "https://smartygym.com/faq"
              }
            ]
          })}
        </script>
      </Helmet>

      <SEOEnhancer
        entities={["FAQ", "Frequently Asked Questions", "Help Center", "Support"]}
        topics={["fitness questions", "membership help", "workout guidance", "training support"]}
        expertise={["customer support", "fitness guidance", "platform help"]}
        contentType="FAQ Page"
        aiSummary="SmartyGym FAQ: Answers to common questions about online workouts, training programs, membership plans, equipment needs, and getting started with your fitness journey."
        aiKeywords={["smartygym faq", "online fitness questions", "gym membership help", "workout questions", "training program help"]}
        relatedContent={["Contact", "About", "Premium Membership", "Getting Started"]}
        targetAudience="users seeking help and information"
        pageType="FAQPage"
      />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          
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
            <div className="text-center mb-10">
              <HelpCircle className="w-16 h-16 text-primary mx-auto mb-4" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                Frequently Asked Questions
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Everything you need to know about SmartyGym
              </p>
            </div>
          </ScrollReveal>

          {/* FAQ Accordion */}
          <ScrollReveal>
            <Card className="border-2 border-primary mb-8">
              <CardContent className="p-3 sm:p-4">
                <Accordion type="single" collapsible className="w-full">
                  
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-left">What is SmartyGym?</AccordionTrigger>
                    <AccordionContent className="py-2 leading-relaxed">
                      SmartyGym is an online fitness platform providing functional, science-based workouts and training programs
                      designed by certified coaches. Whether you're training at home, in the gym, or on the go, SmartyGym 
                      is your backup when life gets in the way — or your complete fitness solution if you prefer training from home. 
                      We make quality fitness accessible anywhere, anytime.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2">
                    <AccordionTrigger className="text-left">Who is Haris Falas?</AccordionTrigger>
                    <AccordionContent className="py-2 leading-relaxed">
                      <a href="/coach-profile" className="text-primary hover:underline font-medium">Haris Falas</a> is a certified Sports Scientist
                      and Strength & Conditioning Coach with over 20 years of professional experience. He has worked with elite athletes and professional 
                      football teams in the Cypriot First Division. As the founder of HFSC and 
                      SmartyGym, <strong>Haris personally designs every single workout and program</strong> — never by AI, always with evidence-based
                      training principles and real coaching experience.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3">
                    <AccordionTrigger className="text-left">What makes SmartyGym different?</AccordionTrigger>
                    <AccordionContent className="py-2 leading-relaxed">
                      <strong>We're 100% human, 0% AI.</strong> Every workout is personally designed by <a href="/coach-profile" className="text-primary hover:underline font-medium">Haris Falas</a>,
                      a qualified Sports Scientist and S&C Coach — never by algorithms or AI. You get real expertise from a real coach with 20+ years 
                      of experience, real support, and direct access to the person who created your program. We focus on sustainable, functional training 
                      that fits into your real life — not quick fixes or unrealistic promises.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3a">
                    <AccordionTrigger className="text-left">What's the difference between a workout and training program?</AccordionTrigger>
                    <AccordionContent className="py-2 leading-relaxed">
                      A <strong>workout</strong> is a standalone training session designed for a specific goal — whether that's calorie burning, 
                      strength building, cardio conditioning, mobility work, or power development. It's perfect when you want a single, 
                      focused session or when you're mixing and matching your own training plan.<br/><br/>
                      
                      A <strong>training program</strong> is a complete, structured plan that spans multiple weeks (e.g., 4, 6, or 12 weeks). 
                      It includes progressive training phases, periodization, recovery strategies, and a clear roadmap toward a specific goal 
                      (like building strength, losing fat, or improving performance). Programs are ideal if you want a full training cycle 
                      with built-in progression and accountability.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-4">
                    <AccordionTrigger className="text-left">What kind of workouts do you offer?</AccordionTrigger>
                    <AccordionContent className="py-2 leading-relaxed">
                      We offer a wide variety of training styles to match your goals and preferences: Strength Training, Hypertrophy (Muscle Building), 
                      Metabolic Conditioning, HIIT, Cardio, Mobility & Flexibility, Functional Training, Endurance, Core & Stability, Power & Explosiveness, 
                      and Sport-Specific workouts. All workouts are categorized by difficulty level (beginner, intermediate, advanced), duration, and equipment requirements.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-5">
                    <AccordionTrigger className="text-left">Do I need gym equipment?</AccordionTrigger>
                    <AccordionContent className="py-2 leading-relaxed">
                      Not necessarily. We offer a wide variety of workouts and programs designed for different equipment scenarios: <strong>bodyweight only</strong>, 
                      <strong>minimal equipment</strong> (resistance bands, dumbbells), and <strong>full gym access</strong>. You can filter content based on what you have available. 
                      Whether you're training at home, in a hotel room, or at a fully equipped gym, there's something for you.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-6">
                    <AccordionTrigger className="text-left">Who is SmartyGym for?</AccordionTrigger>
                    <AccordionContent className="py-2 leading-relaxed">
                      SmartyGym is for <strong>everyone</strong> — whether you're a complete beginner taking your first steps into fitness, 
                      or an experienced athlete looking for structured, science-based training. Our platform is designed to meet you where you are 
                      and guide you forward with safe, effective programming. If you value expert coaching, flexibility, and real results, SmartyGym is for you.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-7">
                    <AccordionTrigger className="text-left">Can I really get results training from home?</AccordionTrigger>
                    <AccordionContent className="py-2 leading-relaxed">
                      Absolutely. Results come from consistency, proper programming, and progressive overload — not from expensive equipment or gym memberships. 
                      Our home-based workouts are designed using the same science-based principles as gym-based training. Whether you're using bodyweight, 
                      resistance bands, or a pair of dumbbells, you can build strength, lose fat, improve fitness, and reach your goals with the right guidance.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-8">
                    <AccordionTrigger className="text-left">Is there a free trial?</AccordionTrigger>
                    <AccordionContent className="py-2 leading-relaxed">
                      Yes! We offer <strong>free access</strong> to selected workouts, tools, and resources so you can explore the platform before committing. 
                      Additionally, you can <strong>purchase selected premium workouts or training programs as standalone items</strong> — 
                      this lets you experience our coaching philosophy and training quality before committing to a full subscription.
                      Premium subscriptions (Gold and Platinum) unlock our full library of workouts, training programs, and advanced features. 
                      Check out our <a href="/premium-comparison" className="text-primary hover:underline font-medium">pricing plans</a> to see what's included.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-8a">
                    <AccordionTrigger className="text-left">What is a standalone purchase?</AccordionTrigger>
                    <AccordionContent className="py-2 leading-relaxed">
                      A <strong>standalone purchase</strong> allows you to buy individual premium workouts or training programs without committing to a subscription. 
                      This is perfect for trying our training methodology and coaching style before deciding to upgrade.<br/><br/>
                      
                      <strong>How to purchase:</strong><br/>
                      1. <strong>Create a free account</strong> — sign up to access the platform.<br/>
                      2. <strong>Browse</strong> our workouts or training programs.<br/>
                      3. <strong>Click "Buy Now"</strong> on any standalone-enabled content (marked with a price).<br/>
                      4. <strong>Complete payment</strong> securely via Stripe.<br/>
                      5. <strong>Access immediately</strong> — your purchased content is unlocked right away.<br/><br/>
                      
                      <strong>What you get:</strong> Full dashboard access for your purchased content, including logbook tracking, 
                      the ability to rate and review, mark as complete, add to favorites, and access to all our calculator tools. 
                      It's a great way to try before you commit to a full plan!
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-9">
                    <AccordionTrigger className="text-left">How do I get started?</AccordionTrigger>
                    <AccordionContent className="py-2 leading-relaxed">
                      Getting started is simple:<br/>
                      1. <strong>Browse</strong> our free workouts and tools to get a feel for the platform.<br/>
                      2. <strong>Sign up</strong> for a free account to save your progress and track your training.<br/>
                      3. <strong>Upgrade</strong> to a premium plan if you want full access to all workouts, training programs, and exclusive content.<br/>
                      4. <strong>Start training</strong> — pick a workout or program and get moving!<br/><br/>
                      
                      If you need guidance, check out our <a href="/taketour" className="text-primary hover:underline font-medium">Take a Tour</a> page 
                      or <a href="/contact" className="text-primary hover:underline font-medium">contact us</a> directly.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-10">
                    <AccordionTrigger className="text-left">How can I contact you?</AccordionTrigger>
                    <AccordionContent className="py-2 leading-relaxed">
                      We're here to help! You can reach us through our <a href="/contact" className="text-primary hover:underline font-medium">Contact page</a>, 
                      where you can send a message or get direct access to coach <a href="/coach-profile" className="text-primary hover:underline font-medium">Haris Falas</a>. 
                      We typically respond within 24 hours. You can also follow us on social media for updates, tips, and community support.
                    </AccordionContent>
                  </AccordionItem>

                </Accordion>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Still Have Questions CTA */}
          <ScrollReveal>
            <Card className="border-2 border-border bg-primary/5 text-center">
              <CardContent className="p-6 space-y-4">
                <MessageCircle className="w-12 h-12 text-primary mx-auto" />
                <h2 className="text-2xl font-bold">Still Have Questions?</h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  Can't find what you're looking for? Get in touch with us directly and we'll be happy to help.
                </p>
                <Button 
                  size="lg" 
                  onClick={() => navigate('/contact')}
                  className="mt-4"
                >
                  Contact Us
                </Button>
              </CardContent>
            </Card>
          </ScrollReveal>

        </div>
      </div>
    </>
  );
};

export default FAQ;
