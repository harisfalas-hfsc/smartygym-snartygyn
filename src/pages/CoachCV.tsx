import { Helmet } from "react-helmet";
import { useShowBackButton } from "@/hooks/useShowBackButton";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAccessControl } from "@/hooks/useAccessControl";
import harisPhoto from "@/assets/haris-falas-coach.png";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";
const CoachCV = () => {
  const {
    canGoBack,
    goBack
  } = useShowBackButton();
  const navigate = useNavigate();
  const {
    userTier
  } = useAccessControl();
  const isPremium = userTier === "premium";
  return <>
      <Helmet>
        <title>Haris Falas CV | Qualifications & Experience | Sports Scientist & Strength Coach | SmartyGym</title>
        <meta name="description" content="Haris Falas CV - BSc Sport Science, EXOS Performance Specialist, 20+ years in strength & conditioning. Elite football coaching experience. Sports Scientist & personal trainer qualifications at smartygym.com" />
        <meta name="keywords" content="Haris Falas CV, Haris Falas qualifications, Sports Scientist, personal trainer credentials, strength coach, BSc Sport Science, EXOS specialist, fitness expert CV, trainer experience, smartygym.com, HFSC Performance" />
        
        {/* Greek Language */}
        <link rel="alternate" hrefLang="el" href="https://smartygym.com/coach-cv" />
        <link rel="alternate" hrefLang="en-GB" href="https://smartygym.com/coach-cv" />
      </Helmet>

      <main className="min-h-screen bg-gradient-to-b from-background to-background/50">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {canGoBack && <Button variant="ghost" size="sm" onClick={goBack} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>}

          <PageBreadcrumbs items={[
            { label: "Home", href: "/" },
            { label: "Coach Profile", href: "/coach-profile" },
            { label: "Coach CV" }
          ]} />

          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-primary">
              <img src={harisPhoto} alt="Haris Falas - Sports Scientist & Strength & Conditioning Coach" className="w-full h-full object-cover object-center" />
            </div>
            <h1 className="text-4xl font-bold mb-2">
              <button onClick={() => navigate("/coach-cv")} className="text-primary hover:underline font-medium">
                Haris Falas
              </button>
            </h1>
            <p className="text-muted-foreground text-base">
              Sports Scientist and Strength & Conditioning Coach
            </p>
          </div>

          {/* Qualifications */}
          <Card className="mb-8 border-2 border-primary">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Qualifications</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Sports Scientist specialised in Football Performance</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Strength and Conditioning Coach</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>MBA in Marketing</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>EXOS Performance and Rehab Specialist</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>FMS Specialist</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>ACE Medical Exercise Specialist</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>NSCA CSCS (ongoing)</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Professional Experience */}
          <Card className="mb-8 border-2 border-primary">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Professional Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Strength and Conditioning Coach in elite football</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Worked with Olympiakos Nicosia, APOEL, Anorthosis, AEL, Achna and Digenis</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Designed performance programs and injury-prevention systems</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Founder and Head Coach of HFSC</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Creator of SmartyGym online training platform</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* HFSC and SmartyGym */}
          <Card className="mb-8 border-2 border-primary">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">HFSC and SmartyGym</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                At HFSC, I focus on functional strength, mobility, rehabilitation principles and real performance training for athletes and adults.
              </p>
              <p>
                With SmartyGym, I transformed this approach into a digital platform that gives people structured workouts, programs and professional coaching anywhere, anytime.
              </p>
            </CardContent>
          </Card>

          {/* CTA */}
          {!isPremium && <div className="text-center space-y-4">
              <Button size="lg" onClick={() => navigate("/premiumbenefits")} className="bg-primary text-primary-foreground hover:bg-primary/90">
                Join SmartyGym Today
              </Button>
              <p className="text-sm text-muted-foreground">
                Train with confidence under expert guidance
              </p>
            </div>}
        </div>
      </main>
    </>;
};
export default CoachCV;