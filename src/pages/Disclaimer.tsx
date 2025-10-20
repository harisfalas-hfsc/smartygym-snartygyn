import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { BackToTop } from "@/components/BackToTop";

const Disclaimer = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Disclaimer - Smarty Gym</title>
        <meta name="description" content="Smarty Gym disclaimer. Important information about using our fitness services and programs." />
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <BackToTop />
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>

          <header className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <AlertTriangle className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Disclaimer</h1>
            <p className="text-muted-foreground">Last updated: January 2025</p>
          </header>

          <Card>
            <CardContent className="p-8 space-y-8">
              <section>
                <h2 className="text-2xl font-bold mb-4">General Information</h2>
                <p className="text-muted-foreground leading-relaxed">
                  The information provided by Smarty Gym is for general informational and educational purposes 
                  only. All information on the site is provided in good faith, however we make no representation 
                  or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, 
                  reliability, availability, or completeness of any information on the site.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Medical Disclaimer</h2>
                <div className="bg-destructive/10 border-l-4 border-destructive p-4 rounded mb-4">
                  <p className="font-semibold text-destructive mb-2">
                    IMPORTANT: Consult Your Healthcare Provider
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    The content on this website is not intended to be a substitute for professional medical 
                    advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified 
                    health provider with any questions you may have regarding a medical condition or fitness program.
                  </p>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Never disregard professional medical advice or delay in seeking it because of something you 
                  have read on this website. If you think you may have a medical emergency, call your doctor 
                  or emergency services immediately.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Fitness and Exercise Disclaimer</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Before beginning any exercise program, you should consult with your physician or other 
                  healthcare provider. This is particularly important if you:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Have a history of heart disease or high blood pressure</li>
                  <li>Have diabetes or other metabolic conditions</li>
                  <li>Have joint, bone, or muscle problems</li>
                  <li>Are pregnant or nursing</li>
                  <li>Are over 40 years of age</li>
                  <li>Have any other health concerns</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  By participating in any exercise program provided by Smarty Gym, you acknowledge that physical 
                  exercise involves risk of injury. You assume all risks associated with participation in any 
                  exercise program.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Nutrition and Diet Disclaimer</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Nutrition and diet information provided on this website is for educational purposes only and 
                  is not intended as a substitute for advice from a registered dietitian or nutritionist. 
                  Individual nutritional needs vary based on many factors including age, gender, activity level, 
                  and health conditions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Results Disclaimer</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Results may vary from person to person. We make no guarantee of specific results, and the 
                  results can vary. Factors that may affect your results include your starting fitness level, 
                  dedication to the program, diet, lifestyle, and individual body composition.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Professional Relationship</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Use of this website and our services does not establish a professional-client relationship 
                  beyond the scope of the services provided. For personalized medical or fitness advice, please 
                  consult with appropriate healthcare professionals in person.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Third-Party Links</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our website may contain links to third-party websites or content. We do not endorse, monitor, 
                  or have control over these third-party sites. We are not responsible for the content, accuracy, 
                  or practices of any linked sites.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Liability Limitation</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Under no circumstances shall Smarty Gym, its founders, coaches, or affiliates be liable for 
                  any direct, indirect, incidental, consequential, or punitive damages arising from your use of 
                  the website or services, including but not limited to personal injury, loss of data, or loss 
                  of profits.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Accuracy of Information</h2>
                <p className="text-muted-foreground leading-relaxed">
                  While we strive to provide accurate and up-to-date information, we make no warranties or 
                  representations about the completeness, accuracy, or reliability of any information, products, 
                  or services. Information on this website may be updated without notice.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Assumption of Risk</h2>
                <p className="text-muted-foreground leading-relaxed">
                  By using this website and participating in any programs or following any advice provided, you 
                  acknowledge that you are doing so at your own risk. You agree to take full responsibility for 
                  your actions and any consequences that may result.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have any questions about this disclaimer, please contact us at{" "}
                  <a href="mailto:info@smartygym.com" className="text-primary hover:underline">
                    info@smartygym.com
                  </a>
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Disclaimer;
