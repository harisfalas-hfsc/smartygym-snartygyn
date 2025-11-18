import { Helmet } from "react-helmet";
import { Card } from "@/components/ui/card";
import { Shield, Lock, Eye, FileText, Users, AlertCircle } from "lucide-react";


const PrivacyPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | SmartyGym.com Online Fitness Platform | smartygym.com</title>
        <meta name="description" content="Smarty Gym (smartygym.com) Privacy Policy - Learn how Online Fitness Platform protects your personal data. Founded by Haris Falas. GDPR compliant data protection for online fitness members." />
        <meta name="keywords" content="smartygym privacy, smartygym.com privacy policy, online fitness privacy, Haris Falas, data protection, GDPR fitness platform, online fitness security" />
        
        <meta property="og:title" content="Privacy Policy - SmartyGym.com" />
        <meta property="og:description" content="How Smarty Gym protects your data - GDPR compliant Cyprus online fitness platform" />
        
        <link rel="canonical" href="https://smartygym.com/privacy-policy" />
      </Helmet>

      <div className="min-h-screen bg-background">
        
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold">Privacy Policy - SmartyGym.com</h1>
          </div>

          <Card className="p-8 space-y-8">
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-lg text-muted-foreground">
                At <strong>SmartyGym</strong> (smartygym.com), founded by <strong>Haris Falas</strong>, we value your privacy and are committed to protecting your personal data. 
                This Privacy Policy explains how our <strong>Online Fitness Platform</strong> collects, uses, stores, and protects your information when you visit our
                website or use our services. Our practices comply with the General Data Protection Regulation (GDPR) 
                (EU) 2016/679 and applicable Cyprus data protection laws.
              </p>

              <div className="flex items-start gap-3 mt-6">
                <FileText className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">1. Data We Collect</h2>
                  <p className="text-muted-foreground mb-3">We may collect the following types of personal information:</p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>Name, email address, phone number, and billing information when you sign up for our services or subscriptions.</li>
                    <li>Information related to your fitness goals, training preferences, and progress (if you provide it voluntarily).</li>
                    <li>Technical data such as IP address, browser type, device type, and cookies when you visit our website.</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Eye className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">2. How We Use Your Data</h2>
                  <p className="text-muted-foreground mb-3">Your personal data may be used to:</p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>Provide you with access to our programs and services.</li>
                    <li>Process payments and subscriptions.</li>
                    <li>Communicate with you regarding updates, offers, or support.</li>
                    <li>Improve our website, services, and customer experience.</li>
                    <li>Ensure legal compliance and security.</li>
                  </ul>
                  <p className="text-muted-foreground mt-3 font-semibold">We will never sell or rent your data to third parties.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">3. Legal Basis for Processing</h2>
                  <p className="text-muted-foreground mb-3">We process your personal data based on:</p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>Your consent (e.g., when signing up for newsletters).</li>
                    <li>Contractual necessity (e.g., when you subscribe to a program).</li>
                    <li>Legal obligations (e.g., tax or accounting requirements).</li>
                    <li>Legitimate interests (e.g., improving our services).</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">4. Data Sharing</h2>
                  <p className="text-muted-foreground mb-3">Your personal data may be shared only with:</p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>Trusted service providers (e.g., payment processors, IT providers).</li>
                    <li>Legal authorities if required by law.</li>
                  </ul>
                  <p className="text-muted-foreground mt-3">All third-party providers are required to comply with GDPR standards.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">5. Data Retention</h2>
                  <p className="text-muted-foreground">
                    We will keep your personal data only for as long as necessary to fulfill the purposes outlined 
                    in this Privacy Policy, unless a longer retention period is required by law.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">6. Your Rights</h2>
                  <p className="text-muted-foreground mb-3">Under GDPR and Cyprus law, you have the right to:</p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>Access your personal data.</li>
                    <li>Request correction or deletion of your data.</li>
                    <li>Restrict or object to data processing.</li>
                    <li>Withdraw consent at any time.</li>
                    <li>Request data portability.</li>
                  </ul>
                  <p className="text-muted-foreground mt-3">
                    To exercise your rights, please contact us at <strong>admin@smartygym.com</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Lock className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">7. Security</h2>
                  <p className="text-muted-foreground">
                    We implement technical and organizational measures to safeguard your personal data against 
                    unauthorized access, loss, or misuse.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">8. Cookies and Similar Technologies</h2>
                  <p className="text-muted-foreground mb-3">
                    Our website uses cookies and similar technologies (such as localStorage) to provide and improve our services:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li><strong>Essential Cookies:</strong> Required for authentication, security, and core website functionality. These cannot be disabled as they are necessary for the website to work.</li>
                    <li><strong>Functional Cookies:</strong> Remember your preferences such as theme selection (light/dark mode) and UI settings to enhance your experience.</li>
                    <li><strong>Third-Party Cookies:</strong> Our payment processor (Stripe) may set cookies to process transactions securely.</li>
                  </ul>
                  <p className="text-muted-foreground mt-3">
                    You can manage your cookie preferences through our cookie consent banner or by adjusting your browser settings. 
                    Note that disabling certain cookies may affect website functionality.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">9. Contact Us</h2>
                  <p className="text-muted-foreground mb-3">
                    If you have any questions about this Privacy Policy or how we handle your data, please contact us:
                  </p>
                  <div className="text-muted-foreground space-y-1">
                    <p><strong>Smarty Gym</strong></p>
                    <p>Email: <a href="mailto:admin@smartygym.com" className="text-primary hover:underline">admin@smartygym.com</a></p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Last updated: January 2025
          </p>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
