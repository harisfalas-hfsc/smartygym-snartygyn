import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Youtube } from "lucide-react";
import { BackToTop } from "@/components/BackToTop";

const ExerciseLibrary = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Exercise Library - Smarty Gym | YouTube Channel by Haris Falas | smartygym.com</title>
        <meta name="description" content="Watch exercise demonstrations on The Smarty Gym YouTube channel by Haris Falas at smartygym.com. Inside Smarty Gym - comprehensive exercise tutorials and technique guides. Convenient & flexible training for anywhere, anytime." />
        <meta name="keywords" content="smartygym exercises, smarty gym, smartygym.com, Haris Falas, exercise library, workout videos, exercise tutorials, Inside Smarty Gym, gym training videos, exercise demonstrations, convenient fitness, gym reimagined" />
        
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="text-xs sm:text-sm">Back</span>
          </Button>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-center mb-3">Exercise Library</h1>
          <p className="text-center text-lg text-foreground mb-2 max-w-3xl mx-auto">
            Navigate through all exercise demonstrations and find the perfect technique with your Smarty Coach.
          </p>
          <p className="text-center text-sm text-muted-foreground mb-8 max-w-2xl mx-auto">
            Welcome Inside Smarty Gym — watch professional exercise tutorials and technique guides by <a href="/coach-profile" className="text-primary hover:underline font-medium">Haris Falas</a>.
          </p>

          {/* YouTube Channel Card */}
          <Card className="border-2 border-primary/30 shadow-lg">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 border-b border-primary/20">
                <div className="flex items-center gap-2 justify-center">
                  <Youtube className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">The Smarty Gym YouTube Channel</h2>
                </div>
                <p className="text-center text-sm text-muted-foreground mt-1">
                  Browse all exercise videos, tutorials, and demonstrations
                </p>
              </div>
              
              <div className="p-4">
                <div className="w-full bg-muted/30 rounded-lg overflow-hidden" style={{ height: 'calc(100vh - 380px)', minHeight: '500px' }}>
                  <iframe
                    src="https://www.youtube.com/@TheSmartyGym"
                    title="The Smarty Gym YouTube Channel - Exercise Library"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ExerciseLibrary;
