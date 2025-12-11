import { Helmet } from "react-helmet";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, UserCheck, CreditCard, Shield, AlertTriangle, Scale, ArrowLeft } from "lucide-react";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";
import { useShowBackButton } from "@/hooks/useShowBackButton";

const TermsOfService = () => {
  const { canGoBack, goBack } = useShowBackButton();

  return (
    <>
      <Helmet>
        <title>Terms of Service | SmartyGym.com Online Fitness Platform | smartygym.com</title>
        <meta name="description" content="Terms and Conditions for SmartyGym (smartygym.com) - Online Fitness Platform by Haris Falas. Read our terms of service for using our evidence-based fitness programs, online workouts, training programs, and online gym services." />
        <meta name="keywords" content="smartygym terms, smartygym.com terms of service, online fitness terms, Haris Falas legal, online fitness legal, fitness platform terms, online gym terms, SmartyGym legal, workout platform terms, training program terms, online gym legal" />
        
        <meta property="og:title" content="Terms of Service | SmartyGym.com" />
        <meta property="og:description" content="Legal terms for using SmartyGym.com Online Fitness Platform by Haris Falas" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://smartygym.com/terms-of-service" />
        
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Terms of Service | SmartyGym" />
        <meta name="twitter:description" content="Legal terms for SmartyGym online fitness platform" />
        
        <link rel="canonical" href="https://smartygym.com/terms-of-service" />
        
        {/* WebPage Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Terms of Service",
            "description": "Terms and Conditions for SmartyGym Online Fitness Platform",
            "publisher": {
              "@type": "Organization",
              "name": "SmartyGym"
            }
          })}
        </script>
        
        {/* BreadcrumbList Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://smartygym.com"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Terms of Service",
                "item": "https://smartygym.com/terms-of-service"
              }
            ]
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {canGoBack && (
            <Button variant="ghost" size="sm" onClick={goBack} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
          
          <PageBreadcrumbs items={[
            { label: "Home", href: "/" },
            { label: "Terms of Service" }
          ]} />

          <div className="flex items-center gap-3 mb-8">
            <FileText className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold">Terms & Conditions - SmartyGym</h1>
          </div>

          <Card className="p-8 space-y-8">
            <div className="prose dark:prose-invert max-w-none">
              <div className="bg-muted/50 p-4 rounded-lg mb-6">
                <p className="text-sm text-muted-foreground mb-2"><strong>Effective Date:</strong> January 2025</p>
                <p className="text-sm text-muted-foreground mb-2"><strong>Website:</strong> smartygym.com</p>
                <p className="text-sm text-muted-foreground"><strong>Company:</strong> SmartyGym | Founded by Haris Falas</p>
              </div>

              <p className="text-lg text-muted-foreground">
                Welcome to <strong>SmartyGym</strong> (smartygym.com)! By accessing or using our <strong>Online Fitness Platform</strong>, services, and subscription-based fitness programs designed by <strong>Haris Falas</strong>, 
                you agree to comply with and be bound by the following Terms & Conditions. Please read them carefully before 
                using our online fitness services.
              </p>

              <div className="flex items-start gap-3 mt-6">
                <UserCheck className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">1. Acceptance of Terms</h2>
                  <p className="text-muted-foreground">
                    By accessing or using SmartyGym, you confirm that you have read, understood, and agree to these 
                    Terms & Conditions. If you do not agree, please do not use our Website or services.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <UserCheck className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">2. Eligibility</h2>
                  <p className="text-muted-foreground">
                    You must be at least 18 years old to use our services. By creating an account, you confirm that you 
                    are legally capable of entering into binding contracts under applicable international law and EU regulations.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">3. Services Provided</h2>
                  <p className="text-muted-foreground mb-3">
                    <strong>SmartyGym</strong> (smartygym.com) provides <strong>Online Fitness Platform</strong> programs, workout plans, and related digital content.
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>Our programs are <strong>professionally designed by certified trainers, specifically Haris Falas</strong>, not generated by artificial intelligence.</li>
                    <li>The services are intended for <strong>personal fitness and wellness purposes only</strong> and are not a substitute for medical advice.</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <UserCheck className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">4. Account Registration</h2>
                  <p className="text-muted-foreground mb-3">
                    To access certain features, you must create an account and provide accurate, complete, and up-to-date information.
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>You are responsible for maintaining the confidentiality of your login details.</li>
                    <li>You agree not to share your account with others.</li>
                    <li>Any unauthorized use of your account must be reported immediately.</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CreditCard className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">5. Subscription & Payments</h2>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>Smarty Gym operates on a subscription model (e.g., monthly, yearly).</li>
                    <li>Payments are processed securely via third-party providers.</li>
                    <li>All fees are stated in Euros (€) and include VAT where applicable.</li>
                    <li>Subscriptions automatically renew unless cancelled prior to the renewal date.</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CreditCard className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">6. Cancellation & Refunds</h2>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>You may cancel your subscription anytime via your account settings.</li>
                    <li>No refunds will be provided for partial subscription periods.</li>
                    <li>If required by applicable consumer protection laws, you may have a <strong>14-day right of withdrawal</strong> for digital services that have not yet started.</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">7. Health & Safety Requirements</h2>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>
                      <strong><span className="whitespace-nowrap">PAR-Q</span> Mandatory:</strong> You MUST complete the <span className="whitespace-nowrap">PAR-Q</span> (Physical Activity Readiness 
                      Questionnaire) health assessment available on our Disclaimer page before starting any workout program.
                    </li>
                    <li>
                      <strong>Medical Consultation:</strong> Always consult a medical professional before beginning 
                      any new exercise program, especially if you have pre-existing health conditions, injuries, or concerns.
                    </li>
                    <li>
                      <strong>Medical Clearance:</strong> If your <span className="whitespace-nowrap">PAR-Q</span> responses indicate health risks, you must 
                      obtain written medical clearance before using our services.
                    </li>
                    <li>
                      All workouts and programs are designed for general fitness purposes and not as medical treatment.
                    </li>
                    <li>
                      Smarty Gym is not responsible for injuries, health issues, or adverse effects resulting from 
                      participation in our programs.
                    </li>
                    <li>
                      <strong>Assumption of Risk:</strong> Participation is entirely at your own risk. See our 
                      Disclaimer page for complete liability release.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">8. Intellectual Property</h2>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>All content on the Website (programs, videos, graphics, text, and logos) is the property of Smarty Gym.</li>
                    <li>Content may not be copied, distributed, or reproduced without prior written permission.</li>
                    <li>Users are granted a limited, personal, non-transferable license to access the content for personal use only.</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">9. User Conduct</h2>
                  <p className="text-muted-foreground mb-3">You agree not to:</p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>Misuse the Website or interfere with its functionality.</li>
                    <li>Share, sell, or distribute content without authorization.</li>
                    <li>Use the Website for unlawful or harmful activities.</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">10. Limitation of Liability</h2>
                  <p className="text-muted-foreground mb-3">
                    To the maximum extent permitted by applicable international law and EU regulations:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>Smarty Gym provides fitness programs "as is" without warranties of any kind, express or implied.</li>
                    <li>
                      We shall not be liable for any direct, indirect, incidental, consequential, special, or punitive 
                      damages arising from your use of our services, including but not limited to personal injury, 
                      property damage, lost profits, or data loss.
                    </li>
                    <li>
                      This limitation applies even if we have been advised of the possibility of such damages.
                    </li>
                    <li>
                      <strong>EU Consumer Rights:</strong> Nothing in these terms shall exclude or limit liability 
                      that cannot be excluded or limited under applicable EU law, including liability for death or 
                      personal injury caused by negligence.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">11. Privacy & Data Protection</h2>
                  <p className="text-muted-foreground">
                    Your privacy is important to us. Please review our <strong>Privacy Policy</strong>, which explains 
                    how we collect, use, and protect your personal data in line with the <strong>GDPR</strong> and applicable data protection laws.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">12. Third-Party Services</h2>
                  <p className="text-muted-foreground">
                    Smarty Gym may integrate with third-party services (such as payment processors or video platforms). 
                    We are not responsible for their actions, policies, or services.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">13. Changes to Terms</h2>
                  <p className="text-muted-foreground">
                    Smarty Gym reserves the right to update or change these Terms & Conditions at any time. Updates will 
                    be posted on the Website with a revised effective date. Continued use of the Website constitutes 
                    acceptance of changes.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Scale className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">14. Governing Law, Jurisdiction & Dispute Resolution</h2>
                  <p className="text-muted-foreground mb-3">
                    These Terms & Conditions are governed by applicable international law and European Union 
                    regulations, including but not limited to:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>General Data Protection Regulation (GDPR) (EU) 2016/679</li>
                    <li>Consumer Rights Directive 2011/83/EU</li>
                    <li>E-Commerce Directive 2000/31/EC</li>
                  </ul>
                  <p className="text-muted-foreground mt-3">
                    Any disputes arising from these terms shall be resolved in accordance with applicable law.
                  </p>
                  <p className="text-muted-foreground mt-3">
                    <strong>Alternative Dispute Resolution:</strong> As an EU-based business, we are committed to 
                    resolving complaints fairly. EU consumers may access the EU Online Dispute Resolution platform 
                    at <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://ec.europa.eu/consumers/odr</a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">15. Contact Us</h2>
                  <p className="text-muted-foreground mb-3">
                    If you have questions about these Terms & Conditions, please contact us:
                  </p>
                  <p className="text-muted-foreground">
                    📩 Email: <a href="mailto:admin@smartygym.com" className="text-primary hover:underline">admin@smartygym.com</a>
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Effective Date: January 2025
          </p>
        </div>
      </div>
    </>
  );
};

export default TermsOfService;
