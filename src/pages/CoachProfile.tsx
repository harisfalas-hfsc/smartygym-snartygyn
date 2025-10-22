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
              <div className="w-40 h-40 mx-auto mb-6 rounded-full overflow-hidden">
                <img 
                  src={new URL("@/assets/haris-falas-coach.png", import.meta.url).href}
                  alt="Haris Falas - Head Coach" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-4">Meet Our Head Coach</h1>
              <h2 className="text-3xl font-semibold text-primary mb-2">Haris Falas</h2>
              <p className="text-lg text-muted-foreground">Founder & Head Coach, HFSC and Smarty Gym</p>
            </header>

            {/* Main Content Card */}
            <Card className="p-8 md:p-12">
              <div className="prose prose-lg max-w-none">
                <p className="text-lg leading-relaxed mb-6">
                  Haris Falas is the founder and head coach of HFSC and Smarty Gym, one of Cyprus' most respected names in strength and conditioning, human performance, and functional fitness. With more than 20 years of professional experience as a Sports Scientist, Strength & Conditioning Coach, and Educator, Haris has dedicated his career to one mission — helping people move, perform, and live better.
                </p>

                <h3 className="text-2xl font-semibold mb-4 mt-8">A Visionary Coach with Proven Experience</h3>
                
                <p className="text-lg leading-relaxed mb-6">
                  Haris began his journey in the world of sports performance long before functional training became a trend. As a certified Sports Scientist, he developed a deep understanding of biomechanics, physiology, and the psychology of performance. Over the years, he has worked with elite athletes, football teams, and everyday adults—each time blending scientific precision with practical coaching methods that deliver measurable results.
                </p>

                <p className="text-lg leading-relaxed mb-6">
                  Haris has served as a Strength & Conditioning Coach in the Cypriot First Division, most notably with AEL Limassol FC and Nea Salamina FC, where he played a key role in optimizing athletic performance, preventing injuries, and building resilient, high-performing athletes. His professionalism and loyalty have earned him respect across the football community, highlighted by his well-known decision to decline a major offer from Omonia FC—a move that reflected his integrity and dedication to his teams.
                </p>

                <h3 className="text-2xl font-semibold mb-4 mt-8">The Mind Behind HFSC & Smarty Gym</h3>
                
                <p className="text-lg leading-relaxed mb-6">
                  Through HFSC (Haris Falas Strength & Conditioning) and his innovative digital platform Smarty Gym, Haris has redefined how people approach fitness. His philosophy is clear:
                </p>

                <p className="text-xl font-semibold text-primary text-center my-6">
                  "Train smart, move better, perform stronger."
                </p>

                <p className="text-lg leading-relaxed mb-6">
                  Under his leadership, HFSC has become a hub for adults and athletes seeking functional, real-world fitness—training that enhances strength, mobility, and performance while preventing pain and injury. Smarty Gym extends that vision globally, giving people the tools to train anywhere, anytime, with scientifically designed workouts and professional guidance.
                </p>

                <h3 className="text-2xl font-semibold mb-4 mt-8">A Mission That Goes Beyond Fitness</h3>
                
                <p className="text-lg leading-relaxed mb-6">
                  Haris believes fitness isn't just about aesthetics—it's about freedom of movement, energy, and confidence in everyday life. His approach combines traditional strength principles with cutting-edge sports science to create a balanced, sustainable path to peak performance.
                </p>

                <p className="text-lg leading-relaxed mb-6">
                  Known for his passion, precision, and results, Haris continues to inspire both his clients and fellow professionals to think differently about training. His next mission is clear: to make Smarty Gym a global fitness brand, empowering people worldwide to train smart and live strong.
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
                    <h3 className="font-semibold text-lg mb-2">Sports Scientist & Educator</h3>
                    <p className="text-muted-foreground text-sm">
                      Certified professional with deep expertise in biomechanics and physiology
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
                      Elite athletes, professional football teams, and everyday individuals
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
                    <h3 className="font-semibold text-lg mb-2">First Division Coach</h3>
                    <p className="text-muted-foreground text-sm">
                      AEL Limassol FC and Nea Salamina FC - Cypriot First Division
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
                    <h3 className="font-semibold text-lg mb-2">Industry Pioneer</h3>
                    <p className="text-muted-foreground text-sm">
                      Leading Cyprus' functional fitness revolution with HFSC & Smarty Gym
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
