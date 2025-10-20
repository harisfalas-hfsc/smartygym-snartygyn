import { Helmet } from "react-helmet";
import { Card } from "@/components/ui/card";
import { AlertTriangle, Heart, Scale, Shield, Users } from "lucide-react";
import { BackToTop } from "@/components/BackToTop";

const Disclaimer = () => {
  return (
    <>
      <Helmet>
        <title>Disclaimer | Smarty Gym Cyprus Online Fitness | smartygym.com</title>
        <meta name="description" content="Health and fitness disclaimer for Smarty Gym (smartygym.com) - Cyprus online fitness platform by Haris Falas. Important information about exercise risks and liability for online fitness training." />
        <meta name="keywords" content="smartygym disclaimer, smartygym.com health disclaimer, Cyprus online fitness disclaimer, Haris Falas, fitness training risks, online fitness legal" />
        
        <meta property="og:title" content="Disclaimer - Smarty Gym Cyprus" />
        <meta property="og:description" content="Important health and safety information for Smarty Gym online fitness platform" />
        
        <link rel="canonical" href="https://smartygym.com/disclaimer" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <BackToTop />
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="flex items-center gap-3 mb-8">
            <AlertTriangle className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold">Disclaimer - Smarty Gym Cyprus</h1>
          </div>

          <Card className="p-8 space-y-8">
            <div className="prose dark:prose-invert max-w-none">
              <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg mb-6">
                <p className="text-sm font-semibold">
                  <strong>Last updated:</strong> August 15, 2025
                </p>
              </div>

              <p className="text-lg text-muted-foreground">
                The information provided on <strong>Smarty Gym</strong> (smartygym.com), founded by <strong>Haris Falas</strong> in Cyprus (the "Website" and mobile applications) is intended 
                solely for <strong>general educational and informational purposes</strong>. While every effort has been made by our <strong>Cyprus online fitness</strong> experts 
                to provide safe and effective guidance, <strong>Smarty Gym is not a substitute for professional medical 
                advice, diagnosis, or treatment</strong>.
              </p>

              <div className="flex items-start gap-3 mt-6">
                <Heart className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">1. Not Medical Advice</h2>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>
                      All workout programs, exercises, nutritional advice, or fitness-related content provided by Smarty Gym 
                      are <strong>for general fitness purposes only</strong>.
                    </li>
                    <li>
                      You should always <strong>consult your doctor or another qualified healthcare provider</strong> before 
                      starting any new exercise, diet, or wellness program, especially if you have a history of medical 
                      conditions, injuries, or other health concerns.
                    </li>
                    <li>
                      Do not disregard professional medical advice or delay seeking it because of information found on 
                      this Website or App.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">2. Assumption of Risk</h2>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>
                      By using Smarty Gym, you <strong>voluntarily assume all risks</strong> associated with physical 
                      activity, exercise, and training.
                    </li>
                    <li>
                      Exercise carries inherent risks, including but not limited to: injury, muscle strain, joint issues, 
                      cardiovascular complications, or other health-related problems.
                    </li>
                    <li>
                      Smarty Gym, its trainers, and affiliates <strong>accept no responsibility</strong> for any injury, 
                      illness, accident, or health-related issue that may occur during or after participation in our programs.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">3. Individual Responsibility</h2>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>
                      Users are responsible for exercising within their <strong>personal limits and capabilities</strong>.
                    </li>
                    <li>
                      If at any point you feel pain, dizziness, faintness, or shortness of breath while exercising, you 
                      should <strong>stop immediately and seek medical attention</strong>.
                    </li>
                    <li>
                      Children and minors should not use Smarty Gym programs without <strong>adult supervision</strong> and 
                      prior medical clearance.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">4. No Guarantees of Results</h2>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>
                      While our programs are designed by experienced trainers, <strong>results vary by individual</strong> 
                      depending on age, health status, genetics, lifestyle, and adherence to the program.
                    </li>
                    <li>
                      Smarty Gym <strong>does not guarantee specific fitness, weight loss, or health outcomes</strong>.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Scale className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">5. Limitation of Liability</h2>
                  <p className="text-muted-foreground mb-3">
                    To the fullest extent permitted by law in Cyprus and the European Union:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>
                      Smarty Gym, its owners, trainers, employees, and affiliates <strong>shall not be held liable</strong> for 
                      any direct, indirect, incidental, or consequential damages arising from participation in any workout, 
                      program, or activity offered on this Website or App.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-primary/10 border border-primary/20 p-6 rounded-lg mt-8">
                <p className="text-muted-foreground font-semibold">
                  By accessing and using Smarty Gym, you acknowledge that you have <strong>read, understood, and 
                  accepted</strong> this Disclaimer.
                </p>
              </div>
            </div>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Last updated: August 15, 2025
          </p>
        </div>
      </div>
    </>
  );
};

export default Disclaimer;
