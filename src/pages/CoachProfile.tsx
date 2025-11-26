import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Award, GraduationCap, Building2, Target, CheckCircle, Smartphone, Shield } from "lucide-react";
import { useShowBackButton } from "@/hooks/useShowBackButton";
import { useAccessControl } from "@/hooks/useAccessControl";

const CoachProfile = () => {
  const navigate = useNavigate();
  const { canGoBack, goBack } = useShowBackButton();
  const { userTier } = useAccessControl();
  const isPremium = userTier === "premium";

  return (
    <>
      <Helmet>
        <title>Haris Falas | Online Personal Trainer | Sports Scientist HFSC | SmartyGym</title>
        <meta name="description" content="Haris Falas - online personal trainer & Sports Scientist with 20+ years experience at HFSC Performance. Expert online workouts, training programs, and personal training worldwide. Strength & conditioning coach at smartygym.com" />
        <meta name="keywords" content="Haris Falas, personal trainer, online personal trainer, Sports Scientist, HFSC, HFSC Performance, strength and conditioning coach, fitness expert, online fitness professional, gym coach, training specialist, smartygym.com" />
        
        {/* Greek Language */}
        <link rel="alternate" hrefLang="el" href="https://smartygym.com/coach-profile" />
        <link rel="alternate" hrefLang="en-GB" href="https://smartygym.com/coach-profile" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Haris Falas | Online Personal Trainer & Sports Scientist" />
        <meta property="og:description" content="Online personal trainer with 20+ years experience in strength and conditioning, sports science, and online fitness training." />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:image" content="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=1200" />
        <meta property="og:site_name" content="SmartyGym" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Haris Falas | Online Personal Trainer" />
        <meta name="twitter:description" content="Online personal trainer and Sports Scientist with 20+ years experience" />
        <meta name="twitter:image" content="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=1200" />
        
        <link rel="canonical" href={window.location.href} />
        
        {/* Structured Data - Person */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": "Haris Falas",
            "jobTitle": "Sports Scientist & Personal Trainer",
            "description": "Online personal trainer and Sports Scientist with over 20 years of experience in strength and conditioning, online fitness training, and athletic performance",
            "knowsAbout": ["Strength Training", "Sports Science", "Functional Training", "Human Performance", "Online Personal Training", "Athletic Conditioning"],
            "hasCredential": {
              "@type": "EducationalOccupationalCredential",
              "credentialCategory": "Sports Science Certification"
            },
            "worksFor": {
              "@type": "Organization",
              "name": "SmartyGym",
              "url": "https://smartygym.com"
            },
            "alumniOf": "Sports Science Certification",
            "offers": [
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Online Personal Training",
                  "description": "Customized online personal training programs"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Online Workouts",
                  "description": "Professional online workout programs"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Online Training Programs",
                  "description": "Structured training programs for all fitness levels"
                }
              }
            ]
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
        <div className="container mx-auto max-w-4xl px-4 py-8">
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

          <article className="space-y-8">
            {/* Hero Section */}
            <header className="text-center mb-12">
              <div className="w-40 h-40 mx-auto mb-6 rounded-full overflow-hidden">
                <img 
                  src={new URL("@/assets/haris-falas-coach.png", import.meta.url).href}
                  alt="Haris Falas - Head Coach" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Meet Haris Falas</h1>
              <p className="text-base sm:text-lg text-muted-foreground">
                Strength & Conditioning Coach® and Founder of <span className="text-primary font-semibold">SmartyGym</span>
              </p>
            </header>

            {/* Main Content Card */}
            <Card className="p-6 sm:p-8 md:p-10 space-y-6 sm:space-y-8">
              {/* Message from Haris Falas */}
              <section>
                <h2 className="text-2xl font-bold mb-6">Message from Haris Falas</h2>
                
                <div className="space-y-4">
                  <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg border border-primary/20">
                    <p className="text-lg font-bold mb-1">
                      Haris Falas
                    </p>
                    <p className="text-sm text-muted-foreground">Sports Scientist and Strength & Conditioning Coach</p>
                  </div>
                  
                  <p className="text-base leading-relaxed">
                    For more than twenty years I've coached athletes, teams, and everyday people — beginners, busy professionals, and gym-goers who simply want to train with purpose. If there's one thing I've learned, it's that people don't struggle because they're lazy. They struggle because they walk into their training without a clear plan, without structure, and without guidance they can trust.
                  </p>

                  <p className="text-base leading-relaxed">
                    That's exactly why I created <span className="text-primary font-semibold">SmartyGym</span>.
                  </p>

                  <p className="text-base leading-relaxed">
                    My vision is to give people the kind of coaching that makes everything simpler: structured programs, smart progressions, expert guidance, and clear workouts you can follow with confidence — whether you train at home, outdoors, or inside a gym. <span className="text-primary font-semibold">SmartyGym</span> is here to support your fitness journey, not replace any part of it. If you train in a gym, you'll have a plan. If you train at home, you'll have a structure. If you're busy or traveling, you'll still know exactly what to do.
                  </p>

                  <p className="text-base leading-relaxed">
                    I built this platform for people who want real training, not random exercises. For those who want to feel stronger, move better, improve performance, and see results — with a system that removes confusion and brings clarity every step of the way.
                  </p>
                  
                  <div className="bg-primary/10 p-4 rounded-lg border-l-4 border-primary">
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
                    <div className="h-px flex-grow bg-border"></div>
                    <p className="font-bold text-primary">
                      Haris Falas
                    </p>
                    <div className="h-px flex-grow bg-border"></div>
                  </div>
                </div>
              </section>

              {/* CV Button */}
              <div className="text-center">
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={() => navigate("/coach-cv")}
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  View Haris Falas CV
                </Button>
              </div>
            </Card>

            {/* Why I Created SmartyGym */}
            <Card className="p-6 sm:p-8 md:p-10">
              <section>
                <h3 className="text-xl sm:text-2xl font-semibold mb-4">Why I Created <span className="text-primary">SmartyGym</span></h3>
                <div className="flex items-start gap-3">
                  <Smartphone className="w-6 h-6 sm:w-7 sm:h-7 text-primary shrink-0 mt-0.5" />
                  <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">
                    I created <span className="text-primary font-semibold">SmartyGym</span> because I believe that everybody deserves fitness. Everybody deserves convenience. Everybody deserves to have access to my premium and science-based workouts and training programs. It's cost-efficient and to help people to start their fitness journey or not stop when life gets in the way.
                  </p>
                </div>
              </section>

              {/* My Promise */}
              <section className="mt-6 sm:mt-8">
                <Card className="bg-primary/5 border-2 border-primary/20 p-4 sm:p-6">
                  <h3 className="text-xl sm:text-2xl font-semibold mb-4">My Promise</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-start gap-2">
                      <Target className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0" />
                      <p className="text-sm sm:text-base font-semibold">Only workouts and training programs—just the actual product.</p>
                    </div>
                    <div className="flex items-center justify-start gap-2">
                      <Award className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0" />
                      <p className="text-sm sm:text-base font-semibold">20+ years of knowledge and experience, not promotions.</p>
                    </div>
                    <div className="flex items-center justify-start gap-2">
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0" />
                      <p className="text-sm sm:text-base font-semibold">100% training quality as if I was coaching you in person.</p>
                    </div>
                  </div>
                </Card>
              </section>
            </Card>

            {/* CTA Section */}
            {!isPremium && (
              <div className="text-center py-8">
                <h3 className="text-xl sm:text-2xl font-semibold mb-6">Join me inside <span className="text-primary font-semibold">SmartyGym</span> and start your training today.</h3>
                <Button size="lg" onClick={() => navigate("/premiumbenefits")} className="cta-button">
                  Start Training
                </Button>
              </div>
            )}
          </article>
        </div>
      </div>
    </>
  );
};

export default CoachProfile;
