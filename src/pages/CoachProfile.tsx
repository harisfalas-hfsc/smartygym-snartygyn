import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Award, Target, TrendingUp, Users } from "lucide-react";
import { useShowBackButton } from "@/hooks/useShowBackButton";

const CoachProfile = () => {
  const navigate = useNavigate();
  const { canGoBack, goBack } = useShowBackButton();

  return (
    <>
      <Helmet>
        <title>Meet Our Head Coach - Haris Falas | Smarty Gym</title>
        <meta name="description" content="Haris Falas is a certified sports scientist and strength coach with over two decades of experience in strength and conditioning, bringing results-driven functional training to Smarty Gym." />
        <meta name="keywords" content="Haris Falas, strength coach, sports scientist, functional training, HFSC, certified coach, strength and conditioning, Cyprus fitness, personal trainer" />
        
        <meta property="og:title" content="Meet Our Head Coach - Haris Falas | Smarty Gym" />
        <meta property="og:description" content="Over two decades of experience in strength and conditioning, sports science, and human performance." />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:image" content="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=1200" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Meet Our Head Coach - Haris Falas | Smarty Gym" />
        <meta name="twitter:description" content="Over two decades of experience in strength and conditioning, sports science, and human performance." />
        <meta name="twitter:image" content="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=1200" />
        
        <link rel="canonical" href={window.location.href} />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": "Haris Falas",
            "jobTitle": "Head Coach & Sports Scientist",
            "description": "Certified sports scientist and strength coach with over two decades of experience",
            "knowsAbout": ["Strength Training", "Sports Science", "Functional Training", "Human Performance"],
            "alumniOf": "Sports Science Certification",
            "worksFor": {
              "@type": "Organization",
              "name": "Smarty Gym"
            }
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
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <span className="text-5xl font-bold text-primary-foreground">HF</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Meet Our Head Coach</h1>
              <h2 className="text-3xl font-semibold text-primary mb-2">Haris Falas</h2>
              <p className="text-lg text-muted-foreground">Certified Sports Scientist & Strength Coach</p>
            </header>

            {/* Main Content Card */}
            <Card className="p-8 md:p-12">
              <div className="prose prose-lg max-w-none">
                <p className="text-lg leading-relaxed mb-6">
                  Haris Falas is the driving force behind Smarty Gym and HFSC, bringing over two decades of experience in strength and conditioning, sports science, and human performance. Known for his results-driven approach and deep understanding of how the body truly moves, Haris has coached everyone from elite athletes to everyday adults seeking better performance, strength, and pain-free living.
                </p>

                <p className="text-lg leading-relaxed mb-6">
                  As a certified sports scientist and strength coach, Haris combines evidence-based training with real-world experience, ensuring every workout is effective, safe, and purposeful. His philosophy is simple — <strong>train smart, move better, perform stronger</strong>.
                </p>

                <p className="text-lg leading-relaxed mb-8">
                  Beyond the gym, Haris is a respected figure in Cyprus' fitness industry and an innovator aiming to redefine functional training through the Smarty Gym platform, helping people worldwide train anywhere, anytime, with purpose and precision.
                </p>
              </div>

              {/* Key Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Certified Professional</h3>
                    <p className="text-muted-foreground text-sm">
                      Sports scientist and strength coach with professional certifications
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">20+ Years Experience</h3>
                    <p className="text-muted-foreground text-sm">
                      Over two decades coaching elite athletes and everyday individuals
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Evidence-Based Approach</h3>
                    <p className="text-muted-foreground text-sm">
                      Combines scientific research with practical real-world application
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Industry Leader</h3>
                    <p className="text-muted-foreground text-sm">
                      Respected figure in Cyprus' fitness industry and functional training
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* CTA Section */}
            <div className="text-center py-8">
              <h3 className="text-2xl font-semibold mb-4">Ready to Train with Purpose?</h3>
              <p className="text-muted-foreground mb-6">
                Experience Haris Falas' proven training methods through Smarty Gym's comprehensive programs
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button size="lg" onClick={() => navigate("/premiumbenefits")}>
                  Start Training
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/blog")}>
                  Read Articles
                </Button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </>
  );
};

export default CoachProfile;
