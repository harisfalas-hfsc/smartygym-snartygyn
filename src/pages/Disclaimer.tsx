import { Helmet } from "react-helmet";
import { Card } from "@/components/ui/card";
import { AlertTriangle, Heart, Scale, Shield, Users, FileCheck } from "lucide-react";

import { ParQQuestionnaire } from "@/components/ParQQuestionnaire";

const Disclaimer = () => {
  return (
    <>
      <Helmet>
        <title>Disclaimer | SmartyGym.com Online Fitness Platform | smartygym.com</title>
        <meta name="description" content="Health and fitness disclaimer for SmartyGym (smartygym.com) - Online Fitness Platform by Haris Falas. Important information about exercise risks and liability for online fitness training." />
        <meta name="keywords" content="smartygym disclaimer, smartygym.com health disclaimer, online fitness disclaimer, Haris Falas, fitness training risks, online fitness legal" />
        
        <meta property="og:title" content="Disclaimer - SmartyGym.com" />
        <meta property="og:description" content="Important health and safety information for SmartyGym online fitness platform" />
        
        <link rel="canonical" href="https://smartygym.com/disclaimer" />
      </Helmet>

      <div className="min-h-screen bg-background">
        
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="flex items-center gap-3 mb-8">
            <AlertTriangle className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold">Disclaimer - SmartyGym.com</h1>
          </div>

          <Card className="p-8 space-y-8">
            <div className="prose dark:prose-invert max-w-none">
              <div className="bg-destructive/10 border-2 border-destructive/30 p-6 rounded-lg mb-6">
                <p className="text-base font-bold text-destructive mb-3">
                  ⚠️ IMPORTANT: MANDATORY <span className="whitespace-nowrap">PAR-Q</span> HEALTH ASSESSMENT
                </p>
                <p className="text-sm font-semibold text-destructive">
                  Before starting any workout program, diet plan, or physical activity offered by SmartyGym, 
                  you MUST complete the <span className="whitespace-nowrap">PAR-Q</span> (Physical Activity Readiness Questionnaire) health assessment 
                  available below. By using our services, you confirm that you have read and completed this
                  questionnaire and accept full responsibility for your participation.
                </p>
              </div>

              <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg mb-6">
                <p className="text-sm font-semibold">
                  <strong>Last updated:</strong> January 2025
                </p>
              </div>

              <p className="text-lg text-muted-foreground">
                The information provided on <strong>SmartyGym</strong> (smartygym.com), founded by <strong>Haris Falas</strong> (the "Website" and mobile applications) is intended 
                solely for <strong>general educational and informational purposes</strong>. While every effort has been made by our <strong>Online Fitness Platform</strong> experts 
                to provide safe and effective guidance, <strong>SmartyGym is not a substitute for professional medical
                advice, diagnosis, or treatment</strong>.
              </p>

              <div className="flex items-start gap-3 mt-6">
                <Heart className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">1. Not Medical Advice</h2>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>
                      All workout programs, exercises, nutritional advice, or fitness-related content provided by SmartyGym 
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
                      By using SmartyGym, you <strong>voluntarily assume all risks</strong> associated with physical 
                      activity, exercise, and training.
                    </li>
                    <li>
                      Exercise carries inherent risks, including but not limited to: injury, muscle strain, joint issues, 
                      cardiovascular complications, or other health-related problems.
                    </li>
                    <li>
                      SmartyGym, its trainers, and affiliates <strong>accept no responsibility</strong> for any injury, 
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
                      Children and minors should not use SmartyGym programs without <strong>adult supervision</strong> and 
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
                      SmartyGym <strong>does not guarantee specific fitness, weight loss, or health outcomes</strong>.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Scale className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">5. Limitation of Liability & Release of Claims</h2>
                  <p className="text-muted-foreground mb-3">
                    To the fullest extent permitted by law in the European Union and internationally:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>
                      <strong>Complete Release:</strong> By using Smarty Gym services, you voluntarily and knowingly 
                      assume all risks associated with physical activity and hereby <strong>RELEASE, WAIVE, DISCHARGE, 
                      and COVENANT NOT TO SUE</strong> Smarty Gym, Haris Falas, its owners, trainers, employees, 
                      contractors, affiliates, and agents from any and all liability.
                    </li>
                    <li>
                      <strong>No Liability:</strong> SmartyGym and its representatives <strong>shall not be held 
                      liable</strong> for any direct, indirect, incidental, consequential, special, punitive, or 
                      exemplary damages arising from participation in any workout, program, diet plan, or activity 
                      offered on this Website or App, including but not limited to:
                      <ul className="ml-6 mt-2 space-y-1">
                        <li>• Personal injury, death, or disability</li>
                        <li>• Property damage or loss</li>
                        <li>• Medical expenses or costs</li>
                        <li>• Lost wages or income</li>
                        <li>• Pain and suffering</li>
                        <li>• Emotional distress</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Waiver of Right to Sue:</strong> You expressly waive any right to bring legal action 
                      against SmartyGym for injuries or damages sustained during or after participation in our programs.
                    </li>
                    <li>
                      <strong>Indemnification:</strong> You agree to indemnify and hold harmless SmartyGym from any 
                      claims, damages, or expenses (including legal fees) arising from your use of our services or 
                      breach of this disclaimer.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileCheck className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">6. Mandatory <span className="whitespace-nowrap">PAR-Q</span> Completion</h2>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>
                      <strong>Required Health Assessment:</strong> Before starting any workout or program, you 
                      <strong> MUST complete the <span className="whitespace-nowrap">PAR-Q</span> questionnaire</strong> below. This is a mandatory safety
                      requirement.
                    </li>
                    <li>
                      <strong>Medical Clearance:</strong> If your <span className="whitespace-nowrap">PAR-Q</span> responses indicate potential health risks, 
                      you must obtain written clearance from a qualified physician before proceeding with any physical activity.
                    </li>
                    <li>
                      <strong>Truthful Disclosure:</strong> You are responsible for providing accurate and truthful 
                      information in the <span className="whitespace-nowrap">PAR-Q</span> questionnaire. Failure to do so may increase your risk of injury.
                    </li>
                    <li>
                      <strong>Ongoing Responsibility:</strong> You must retake the <span className="whitespace-nowrap">PAR-Q</span> assessment if your health 
                      status changes or if you develop new medical conditions.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">7. Jurisdiction & Governing Law</h2>
                  <p className="text-muted-foreground">
                    This Disclaimer is governed by applicable law and EU regulations. 
                    Any disputes shall be subject to the jurisdiction of courts of competent jurisdiction. This limitation 
                    of liability applies to the maximum extent permitted by applicable law and EU consumer protection 
                    directives while maintaining your statutory rights as a consumer under EU law.
                  </p>
                </div>
              </div>

              <div className="bg-destructive/10 border-2 border-destructive/30 p-6 rounded-lg mt-8">
                <p className="text-base font-bold text-destructive mb-3">
                  ⚠️ ACCEPTANCE AND ACKNOWLEDGMENT
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  By accessing and using SmartyGym, you acknowledge and confirm that you have:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                  <li><strong>Read and understood</strong> this entire Disclaimer</li>
                  <li><strong>Completed the <span className="whitespace-nowrap">PAR-Q</span> questionnaire</strong> below</li>
                  <li><strong>Obtained medical clearance</strong> if required by your <span className="whitespace-nowrap">PAR-Q</span> responses</li>
                  <li><strong>Voluntarily assumed all risks</strong> associated with physical activity</li>
                  <li><strong>Released SmartyGym from all liability</strong> for any injuries or damages</li>
                  <li><strong>Agreed to exercise at your own risk</strong></li>
                </ul>
                <p className="text-sm font-bold text-destructive mt-4">
                  IF YOU DO NOT AGREE WITH ANY PART OF THIS DISCLAIMER, DO NOT USE SMARTYGYM SERVICES.
                </p>
              </div>
            </div>
          </Card>

          {/* PAR-Q+ Questionnaire */}
          <div className="mt-8">
            <h2 className="text-3xl font-bold mb-4 text-center">Complete Your <span className="whitespace-nowrap">PAR-Q</span> Assessment</h2>
            <p className="text-center text-muted-foreground mb-6">
              This health assessment is mandatory before starting any workout program. Please answer all questions truthfully.
            </p>
            <ParQQuestionnaire />
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Last updated: January 2025
          </p>
        </div>
      </div>
    </>
  );
};

export default Disclaimer;
