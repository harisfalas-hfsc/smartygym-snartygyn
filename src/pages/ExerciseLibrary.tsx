import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageTitleCard } from "@/components/PageTitleCard";
import { ArrowLeft, Youtube, Video } from "lucide-react";
import { BackToTop } from "@/components/BackToTop";
import { useShowBackButton } from "@/hooks/useShowBackButton";

const ExerciseLibrary = () => {
  const navigate = useNavigate();
  const { canGoBack, goBack } = useShowBackButton();

  return (
    <>
      <Helmet>
        <title>Exercise Library Cyprus | Online Gym Videos | SmartyGym YouTube | Haris Falas</title>
        <meta name="description" content="Watch 100+ online gym exercise demonstrations at smartygym.com - Cyprus' #1 online fitness. The Smarty Gym YouTube channel by Sports Scientist Haris Falas. Inside Smarty Gym: comprehensive exercise tutorials, technique guides, gym training videos." />
        <meta name="keywords" content="exercise library Cyprus, online gym exercises, gym exercise videos, online fitness videos, smartygym exercises, smartygym.com, online gym Cyprus, Haris Falas exercises, Haris Falas Cyprus, exercise library online, workout videos online, exercise tutorials Cyprus, Inside Smarty Gym, gym training videos Cyprus, exercise demonstrations, gym exercises online, fitness exercise library, training videos online, workout demonstrations, gym technique videos, Cyprus fitness videos, online gym tutorials, exercise videos Cyprus, gym workout videos, fitness demonstrations Cyprus" />
        
        <meta property="og:title" content="Exercise Library - Smarty Gym | YouTube Channel" />
        <meta property="og:description" content="Watch exercise demonstrations on The Smarty Gym YouTube channel by Haris Falas - Inside Smarty Gym" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://smartygym.com/exerciselibrary" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Exercise Library - Smarty Gym" />
        <meta name="twitter:description" content="Exercise videos at smartygym.com - Inside Smarty Gym by Haris Falas" />
        
        <link rel="canonical" href="https://smartygym.com/exerciselibrary" />
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
                <span className="text-xs sm:text-sm">Back</span>
              </Button>
            </div>
          )}
          
          <PageTitleCard
            title="Exercise Library" 
            icon={Video}
          />

          {/* YouTube Channel Card */}
          <Card className="border-2 border-primary/30 shadow-lg">
            <CardContent className="p-6">
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg border border-primary/20 mb-6">
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 justify-center mb-3">
                  <Youtube className="h-6 w-6 text-primary flex-shrink-0" />
                  <h2 className="text-xl font-semibold text-foreground text-center">The Smarty Gym YouTube Channel</h2>
                </div>
                <p className="text-center text-muted-foreground mb-4">
                  Browse all exercise videos, tutorials, and demonstrations
                </p>
                <div className="flex justify-center">
                  <Button
                    asChild
                    className="gap-2"
                    size="lg"
                  >
                    <a href="https://www.youtube.com/@TheSmartyGym" target="_blank" rel="noopener noreferrer">
                      <Youtube className="h-5 w-5" />
                      Visit YouTube Channel
                    </a>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border border-border">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 text-foreground">💪 Exercise Demonstrations</h3>
                    <p className="text-sm text-muted-foreground">
                      Watch proper form and technique for hundreds of exercises
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border border-border">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 text-foreground">🎯 Training Tips</h3>
                    <p className="text-sm text-muted-foreground">
                      Learn from expert coaching and training methodology
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border border-border">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 text-foreground">📚 Tutorial Videos</h3>
                    <p className="text-sm text-muted-foreground">
                      Step-by-step guides for mastering complex movements
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border border-border">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 text-foreground">🔥 Workout Previews</h3>
                    <p className="text-sm text-muted-foreground">
                      Preview workouts and see what to expect from each session
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ExerciseLibrary;
