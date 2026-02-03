import { Helmet } from "react-helmet";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, UserCheck, CreditCard, Shield, AlertTriangle, Scale, Brain, Bell, Smartphone, Trash2, Globe } from "lucide-react";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";

const TermsOfService = () => {

  return (
    <>
      <Helmet>
        <title>Terms of Service | SmartyGym.com Online Fitness Platform | smartygym.com</title>
        <meta name="description" content="Terms and Conditions for SmartyGym (smartygym.com) - Online Fitness Platform by Haris Falas. Read our terms of service for using our evidence-based fitness programs, online workouts, training programs, and online gym services." />
        <meta name="keywords" content="smartygym terms, smartygym.com terms of service, online fitness terms, Haris Falas legal, online fitness legal, fitness platform terms, online gym terms, SmartyGym legal, workout platform terms, training program terms, online gym legal, GDPR, EU law" />
        
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
            "dateModified": "2025-01-14",
            "publisher": {
              "@type": "Organization",
              "name": "SmartyGym",
              "url": "https://smartygym.com"
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
                <p className="text-sm text-muted-foreground mb-2"><strong>Effective Date:</strong> January 14, 2025</p>
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
                    <strong>SmartyGym</strong> (smartygym.com) provides the following <strong>Online Fitness Platform</strong> services:
                  </p>
                  
                  <h3 className="text-lg font-semibold mt-4 mb-2">Core Fitness Services</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>Professional workout programs and training plans designed by certified trainer <strong>Haris Falas</strong>.</li>
                    <li>Single workout sessions across various categories (strength, cardio, flexibility, etc.).</li>
                    <li>Daily Smarty Rituals for morning, midday, and evening wellness practices.</li>
                    <li>Daily check-in system to track sleep, hydration, mood, and activity.</li>
                    <li>Exercise library with video demonstrations.</li>
                  </ul>

                  <h3 className="text-lg font-semibold mt-4 mb-2">AI-Powered Features</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>AI-generated personalized workout suggestions based on your preferences and goals.</li>
                    <li>AI-powered meal planning and nutrition recommendations.</li>
                    <li>Smart suggestions for workouts and programs based on your activity history.</li>
                  </ul>

                  <h3 className="text-lg font-semibold mt-4 mb-2">Connected Services & Integrations</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>Google Calendar integration for workout scheduling and reminders.</li>
                    <li>Strava integration for fitness activity tracking (optional).</li>
                    <li>Push notifications for workout reminders, check-ins, and updates.</li>
                  </ul>

                  <h3 className="text-lg font-semibold mt-4 mb-2">Platform Access</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>Progressive Web App (PWA) for mobile and desktop access.</li>
                    <li>Offline functionality for previously loaded content.</li>
                    <li>Community features and leaderboards.</li>
                  </ul>

                  <p className="text-muted-foreground mt-3">
                    <strong>Important:</strong> While we offer AI-generated content, our core programs are <strong>professionally designed by certified trainers</strong>. 
                    All services are intended for <strong>personal fitness and wellness purposes only</strong> and are not a substitute for medical advice.
                  </p>
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
                    <li>You may connect third-party accounts (Google, Strava) at your discretion. You can disconnect these at any time.</li>
                    <li>You are responsible for any activity that occurs under your account.</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CreditCard className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">5. Subscription & Payments</h2>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>Smarty Gym operates on a subscription model (Gold or Platinum plans, monthly or yearly).</li>
                    <li>Payments are processed securely via <strong>Stripe</strong>, a PCI DSS compliant payment processor.</li>
                    <li>All fees are stated in Euros (€) and include VAT where applicable.</li>
                    <li>Subscriptions automatically renew unless cancelled prior to the renewal date.</li>
                    <li>Some content and programs may be available for standalone purchase.</li>
                    <li>Corporate/team subscriptions are available with custom pricing.</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CreditCard className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">6. Cancellation & Refunds</h2>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>You may cancel your subscription anytime via your account settings (Dashboard → Subscription).</li>
                    <li>Upon cancellation, you retain access until the end of your current billing period.</li>
                    <li>No refunds will be provided for partial subscription periods.</li>
                    <li>If required by applicable consumer protection laws (EU Directive 2011/83/EU), you may have a <strong>14-day right of withdrawal</strong> for digital services that have not yet started.</li>
                    <li>By starting to use premium content immediately after purchase, you acknowledge that you waive your withdrawal right.</li>
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
                <Brain className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">8. AI-Generated Content</h2>
                  <p className="text-muted-foreground mb-3">
                    SmartyGym uses artificial intelligence to enhance your fitness experience:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>
                      <strong>Nature of AI Content:</strong> AI-generated workout suggestions, meal plans, and recommendations are created by machine learning models and are not reviewed by humans before being shown to you.
                    </li>
                    <li>
                      <strong>No Medical Advice:</strong> AI recommendations are for informational purposes only and do not constitute medical, nutritional, or professional fitness advice.
                    </li>
                    <li>
                      <strong>User Responsibility:</strong> You are responsible for evaluating whether AI-generated content is appropriate for your fitness level, health conditions, and goals.
                    </li>
                    <li>
                      <strong>Professional Guidance:</strong> AI recommendations should complement, not replace, guidance from certified fitness professionals and healthcare providers.
                    </li>
                    <li>
                      <strong>Accuracy Disclaimer:</strong> While we strive for accuracy, AI-generated content may contain errors or inappropriate suggestions. Always use your judgment.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Smartphone className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">9. Third-Party Integrations</h2>
                  <p className="text-muted-foreground mb-3">
                    SmartyGym integrates with third-party services to enhance your experience:
                  </p>
                  
                  <h3 className="text-lg font-semibold mt-4 mb-2">Google Calendar</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>You may connect your Google Calendar to sync workout schedules.</li>
                    <li>By connecting, you grant SmartyGym permission to create and manage calendar events related to your workouts.</li>
                    <li>You can disconnect at any time from Dashboard → Settings → Connected Services.</li>
                    <li>Google's Terms of Service and Privacy Policy apply to your use of Google Calendar.</li>
                  </ul>

                  <h3 className="text-lg font-semibold mt-4 mb-2">Strava</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>You may connect your Strava account to track fitness activities.</li>
                    <li>By connecting, you authorize SmartyGym to access your activity data.</li>
                    <li>Strava's Terms of Service and Privacy Policy apply to your use of Strava.</li>
                  </ul>

                  <h3 className="text-lg font-semibold mt-4 mb-2">YouTube</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>Exercise demonstrations may include embedded YouTube videos.</li>
                    <li>By viewing these videos, you agree to YouTube's Terms of Service.</li>
                  </ul>

                  <h3 className="text-lg font-semibold mt-4 mb-2">Payment Processing (Stripe)</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>All payments are processed by Stripe.</li>
                    <li>We do not store your complete credit card information on our servers.</li>
                    <li>Stripe's Terms of Service and Privacy Policy apply.</li>
                  </ul>

                  <p className="text-muted-foreground mt-3">
                    We are not responsible for the actions, policies, or services of third-party providers. 
                    You should review their terms before connecting.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Bell className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">10. Push Notifications</h2>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>By enabling push notifications, you consent to receive alerts about workouts, check-ins, and updates.</li>
                    <li>You can manage notification preferences in Dashboard → Settings → Notifications.</li>
                    <li>You can disable notifications at any time through your browser or device settings.</li>
                    <li>We use web push technology (VAPID) to deliver notifications securely.</li>
                    <li>We do not sell notification data to third parties.</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Trash2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">11. Account Deletion</h2>
                  <p className="text-muted-foreground mb-3">
                    You have the right to delete your account at any time:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>
                      <strong>How to delete:</strong> Go to Dashboard → Settings → "Delete My Account" and confirm.
                    </li>
                    <li>
                      <strong>What gets deleted:</strong> Your profile, workout history, saved programs, check-in data, connected service tokens, and all personal preferences.
                    </li>
                    <li>
                      <strong>What may be retained:</strong> Anonymized analytics data, transaction records (required by law for 7 years), and data required for legal compliance.
                    </li>
                    <li>
                      <strong>Active subscriptions:</strong> Deleting your account does not automatically cancel active subscriptions. Please cancel your subscription first.
                    </li>
                    <li>
                      <strong>Irreversible:</strong> Account deletion is permanent and cannot be undone. You will need to create a new account to use our services again.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">12. Intellectual Property</h2>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>All content on the Website (programs, videos, graphics, text, logos, and AI-generated content) is the property of Smarty Gym or its licensors.</li>
                    <li>Content may not be copied, distributed, or reproduced without prior written permission.</li>
                    <li>Users are granted a limited, personal, non-transferable license to access the content for personal use only.</li>
                    <li>You may not use automated tools to scrape, copy, or download content from our platform.</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">13. User Conduct</h2>
                  <p className="text-muted-foreground mb-3">You agree not to:</p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>Misuse the Website or interfere with its functionality.</li>
                    <li>Share, sell, or distribute content without authorization.</li>
                    <li>Use the Website for unlawful or harmful activities.</li>
                    <li>Attempt to access other users' accounts or data.</li>
                    <li>Upload malicious content, viruses, or spam.</li>
                    <li>Abuse AI features by submitting harmful, illegal, or inappropriate queries.</li>
                    <li>Circumvent security measures or access restrictions.</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">14. Limitation of Liability</h2>
                  <p className="text-muted-foreground mb-3">
                    To the maximum extent permitted by applicable international law and EU regulations:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>Smarty Gym provides fitness programs and AI-generated content "as is" without warranties of any kind, express or implied.</li>
                    <li>
                      We shall not be liable for any direct, indirect, incidental, consequential, special, or punitive 
                      damages arising from your use of our services, including but not limited to personal injury, 
                      property damage, lost profits, or data loss.
                    </li>
                    <li>
                      We are not liable for errors or inaccuracies in AI-generated content.
                    </li>
                    <li>
                      We are not liable for actions of third-party service providers (Google, Strava, Stripe, etc.).
                    </li>
                    <li>
                      This limitation applies even if we have been advised of the possibility of such damages.
                    </li>
                    <li>
                      <strong>EU Consumer Rights:</strong> Nothing in these terms shall exclude or limit liability 
                      that cannot be excluded or limited under applicable EU law, including liability for death or 
                      personal injury caused by negligence, fraud, or fraudulent misrepresentation.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">15. Privacy & Data Protection</h2>
                  <p className="text-muted-foreground mb-3">
                    Your privacy is important to us. Please review our <strong><a href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</a></strong>, which explains 
                    how we collect, use, and protect your personal data in line with the <strong>GDPR</strong> and applicable data protection laws.
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>
                      <strong>Data Portability:</strong> You can download all your data at any time from Dashboard → Settings → "Download My Data".
                    </li>
                    <li>
                      <strong>Right to Erasure:</strong> You can delete your account and all associated data from Dashboard → Settings → "Delete My Account".
                    </li>
                    <li>
                      <strong>Connected Services:</strong> You can view and manage connected third-party services from Dashboard → Settings.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Globe className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">16. International Users</h2>
                  <p className="text-muted-foreground mb-3">
                    SmartyGym is accessible worldwide. If you access our services from outside the European Economic Area:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>You are responsible for compliance with local laws applicable to your use of the services.</li>
                    <li>Your data may be transferred to and processed in the EU or other countries where our service providers operate.</li>
                    <li>We apply GDPR standards globally as our baseline for data protection.</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">17. Changes to Terms</h2>
                  <p className="text-muted-foreground">
                    Smarty Gym reserves the right to update or change these Terms & Conditions at any time. Updates will 
                    be posted on the Website with a revised effective date. For material changes, we will notify you via 
                    email or dashboard notification at least 14 days before changes take effect. Continued use of the Website 
                    after changes take effect constitutes acceptance of the updated terms.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Scale className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">18. Governing Law, Jurisdiction & Dispute Resolution</h2>
                  <p className="text-muted-foreground mb-3">
                    These Terms & Conditions are governed by applicable international law and European Union 
                    regulations, including but not limited to:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>General Data Protection Regulation (GDPR) (EU) 2016/679</li>
                    <li>Consumer Rights Directive 2011/83/EU</li>
                    <li>E-Commerce Directive 2000/31/EC</li>
                    <li>Digital Services Act (DSA) Regulation (EU) 2022/2065</li>
                    <li>ePrivacy Directive 2002/58/EC</li>
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
                  <h2 className="text-2xl font-bold mb-3">19. Severability</h2>
                  <p className="text-muted-foreground">
                    If any provision of these Terms is found to be invalid, illegal, or unenforceable, the remaining 
                    provisions will continue in full force and effect. The invalid provision will be modified to the 
                    minimum extent necessary to make it valid and enforceable.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">20. Contact Us</h2>
                  <p className="text-muted-foreground mb-3">
                    If you have questions about these Terms & Conditions, please contact us:
                  </p>
                  <div className="text-muted-foreground space-y-1">
                    <p><strong>Smarty Gym</strong></p>
                    <p><strong>Owner:</strong> Haris Falas</p>
                    <p>📩 Email: <a href="mailto:smartygym@outlook.com" className="text-primary hover:underline">smartygym@outlook.com</a></p>
                    <p>🌐 Website: <a href="https://smartygym.com" className="text-primary hover:underline">smartygym.com</a></p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Effective Date: January 14, 2025
          </p>
        </div>
      </div>
    </>
  );
};

export default TermsOfService;