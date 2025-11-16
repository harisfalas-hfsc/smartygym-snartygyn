import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Award, GraduationCap, Building2, Target, CheckCircle, Smartphone, Shield } from "lucide-react";
import { useShowBackButton } from "@/hooks/useShowBackButton";

const CoachProfile = () => {
  const navigate = useNavigate();
  const { canGoBack, goBack } = useShowBackButton();

  return (
    <>
      <Helmet>
        <title>Haris Falas | Cyprus Personal Trainer & Sports Scientist | SmartyGym</title>
        <meta name="description" content="Haris Falas - Cyprus personal trainer and Sports Scientist with 20+ years experience. Expert in online workouts, online training programs, and online personal training. Certified strength and conditioning coach for Cyprus fitness and worldwide." />
        <meta name="keywords" content="Haris Falas, Cyprus personal trainer, Cyprus personal trainers, Sports Scientist Cyprus, strength and conditioning coach, HFSC, Cyprus fitness expert, online personal training Cyprus, fitness in Cyprus, personal trainer Cyprus, functional training coach, Cyprus fitness professional" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Haris Falas | Cyprus Personal Trainer & Sports Scientist" />
        <meta property="og:description" content="Cyprus personal trainer with 20+ years experience in strength and conditioning, sports science, and online fitness training." />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:image" content="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=1200" />
        <meta property="og:site_name" content="SmartyGym Cyprus" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Haris Falas | Cyprus Personal Trainer" />
        <meta name="twitter:description" content="Cyprus personal trainer and Sports Scientist with 20+ years experience" />
        <meta name="twitter:image" content="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=1200" />
        
        <link rel="canonical" href={window.location.href} />
        
        {/* Structured Data - Person */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": "Haris Falas",
            "jobTitle": "Sports Scientist & Personal Trainer",
            "description": "Cyprus personal trainer and Sports Scientist with over 20 years of experience in strength and conditioning, online fitness training, and athletic performance",
            "knowsAbout": ["Strength Training", "Sports Science", "Functional Training", "Human Performance", "Online Personal Training", "Athletic Conditioning"],
            "hasCredential": {
              "@type": "EducationalOccupationalCredential",
              "credentialCategory": "Sports Science Certification"
            },
            "worksFor": {
              "@type": "Organization",
              "name": "SmartyGym Cyprus",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "CY"
              }
            },
            "alumniOf": "Sports Science Certification",
            "nationality": "Cyprus",
            "workLocation": "Cyprus",
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
              {/* Introduction */}
              <section>
                <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">
                  I've spent more than twenty years helping athletes, teams, and everyday people improve their performance, overcome injuries, lose fat, gain strength, and train with purpose. SmartyGym is the evolution of that journey — a complete online gym built on science, experience, and real coaching.
                </p>
              </section>

              {/* My Background */}
              <section>
                <h3 className="text-xl sm:text-2xl font-semibold mb-4">My Background</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex items-start gap-2">
                    <Award className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base">BSc in Sport Science</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base">MBA in Marketing</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Award className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base">Strength and Conditioning Coach since 2002</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Award className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base">EXOS Performance Specialist (Phases 1, 2, 3)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Award className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base">EXOS Rehabilitation Specialist</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Award className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base">FMS Specialist</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Award className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base">ACE Medical Exercise Specialist</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Award className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base">AFPA Certification</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Award className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base">NSCA CSCS (ongoing)</span>
                  </div>
                </div>
              </section>

              {/* Professional Experience */}
              <section>
                <h3 className="text-xl sm:text-2xl font-semibold mb-4">Professional Experience</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex items-start gap-2">
                    <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base">HFSC Founder & Head Coach</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base">Olympiakos Nicosia</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base">Digenis FC</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base">APOEL FC</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base">Anorthosis</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base">AEL FC</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base">Athletes Evolution Exercise Evaluation</span>
                  </div>
                  <div className="flex items-start gap-2 md:col-span-2">
                    <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base">Multiple teams, athletes, and hundreds of adults</span>
                  </div>
                </div>
              </section>

              {/* My Philosophy */}
              <section>
                <Card className="bg-primary/5 border-2 border-primary/20 p-4 sm:p-6">
                  <h3 className="text-xl sm:text-2xl font-semibold mb-4">My Philosophy</h3>
                  <div className="space-y-1 text-sm sm:text-base leading-relaxed">
                    <p className="font-bold text-foreground">Performance comes in many forms</p>
                    
                    <div className="text-muted-foreground">
                      <p>Whether is the strength to be a better parent</p>
                      <p>The strength to overcome life difficulties</p>
                      <p>The strength to be a better employee</p>
                      <p>The strength to be a better athlete</p>
                      <p>To be able to set higher goals</p>
                      <p>To accept any challenge</p>
                      <p>To build confidence and achieve a healthier and more fulfilling life.</p>
                    </div>

                    <p className="font-semibold text-foreground pt-1">
                      Whoever you are, from an elite athlete to a forward thinking fitness enthusiast..
                    </p>
                    <p className="font-bold text-primary">We move you to new places.</p>

                    <p className="font-bold text-foreground pt-1">We are pioneering human performance.</p>

                    <p className="font-bold text-foreground pt-1">At <span className="font-bold text-primary">SmartyGym</span>, our mission is clear.</p>

                    <p className="font-bold text-primary">We are here to empower you and improve your performance.</p>
                  </div>
                </Card>
              </section>

              {/* Why I Created SmartyGym */}
              <section>
                <h3 className="text-xl sm:text-2xl font-semibold mb-4">Why I Created SmartyGym</h3>
                <div className="flex items-start gap-3">
                  <Smartphone className="w-6 h-6 sm:w-7 sm:h-7 text-primary shrink-0 mt-0.5" />
                  <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">
                    People need coaching beyond the gym. Not everyone can come physically to HFSC in Nicosia. Many travel, work late, or prefer training at home. SmartyGym gives them a complete training solution in their pocket. Anywhere. Anytime.
                  </p>
                </div>
              </section>

              {/* My Promise */}
              <section>
                <Card className="bg-primary/5 border-2 border-primary/20 p-4 sm:p-6 text-center">
                  <h3 className="text-xl sm:text-2xl font-semibold mb-4">My Promise</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2">
                      <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0" />
                      <p className="text-sm sm:text-base font-semibold">No gimmicks.</p>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0" />
                      <p className="text-sm sm:text-base font-semibold">No shortcuts.</p>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0" />
                      <p className="text-sm sm:text-base font-semibold">Just structured, science-based training that works.</p>
                    </div>
                  </div>
                </Card>
              </section>
            </Card>

            {/* CTA Section */}
            <div className="text-center py-8">
              <h3 className="text-xl sm:text-2xl font-semibold mb-6">Join me inside SmartyGym and start your training today.</h3>
              <Button size="lg" onClick={() => navigate("/premiumbenefits")}>
                Start Training
              </Button>
            </div>
          </article>
        </div>
      </div>
    </>
  );
};

export default CoachProfile;
