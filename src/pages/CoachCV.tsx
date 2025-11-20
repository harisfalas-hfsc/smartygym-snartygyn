import { Helmet } from "react-helmet";
import { useShowBackButton } from "@/hooks/useShowBackButton";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const CoachCV = () => {
  const { canGoBack, goBack } = useShowBackButton();
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Haris Falas - Qualifications & Experience | SmartyGym</title>
        <meta name="description" content="Certified strength and conditioning coach with BSc in Sport Science, MBA, and over 20 years of experience training elite athletes and everyday fitness enthusiasts." />
        <meta name="keywords" content="Haris Falas, strength coach, sport science, EXOS specialist, fitness coach, personal trainer credentials" />
      </Helmet>

      <main className="min-h-screen bg-gradient-to-b from-background to-background/50">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {canGoBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={goBack}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}

          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-primary">
              <img
                src="https://cvccrvyimyzrxcwzmxwk.supabase.co/storage/v1/object/public/logos/haris-photo.png"
                alt="Haris Falas - Professional Strength & Conditioning Coach"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-4xl font-bold mb-2">Haris Falas</h1>
            <p className="text-xl text-muted-foreground">
              Sports Scientist & Strength & Conditioning Coach
            </p>
          </div>

          {/* My Background */}
          <Card className="mb-8 border-2 border-border">
            <CardHeader>
              <CardTitle className="text-2xl">My Background</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>BSc in Sport Science</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>MBA in Marketing</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Strength and Conditioning Coach since 2002</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>EXOS Performance Specialist - Phase 1, 2 and 3</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>EXOS Rehabilitation Specialist</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>FMS (Functional Movement Screen) Specialist</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Specialist in Elite and Amateur Athletes Training</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Athletes Evolution Exercise Evaluation</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Professional Experience */}
          <Card className="mb-8 border-2 border-border">
            <CardHeader>
              <CardTitle className="text-2xl">Professional Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                I've dedicated over two decades to coaching athletes and teams across multiple sports, 
                as well as hundreds of adults at all fitness levels — from complete beginners to experienced gym-goers.
              </p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Former Head Coach Roles:</h3>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start gap-3">
                      <span className="text-primary mt-1">•</span>
                      <span>Greek National Basketball Team U16</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary mt-1">•</span>
                      <span>Multiple professional basketball clubs</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary mt-1">•</span>
                      <span>Professional volleyball teams</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Current Position:</h3>
                  <p className="ml-4">
                    Head of Strength & Conditioning at HFSC (Haris Falas Strength & Conditioning)
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Training Experience:</h3>
                  <p className="ml-4">
                    Successfully trained hundreds of adults seeking to improve their fitness, 
                    strength, mobility, and overall health — combining evidence-based methodology 
                    with personalized programming.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center space-y-4">
            <Button 
              size="lg" 
              onClick={() => navigate("/premiumbenefits")}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Join SmartyGym Today
            </Button>
            <p className="text-sm text-muted-foreground">
              Train with confidence under expert guidance
            </p>
          </div>
        </div>
      </main>
    </>
  );
};

export default CoachCV;
