import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Shield } from "lucide-react";
import { BackToTop } from "@/components/BackToTop";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Privacy Policy - Smarty Gym</title>
        <meta name="description" content="Smarty Gym privacy policy. Learn how we collect, use, and protect your personal information." />
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
              <Shield className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: January 2025</p>
          </header>

          <Card>
            <CardContent className="p-8 space-y-8">
              <section>
                <h2 className="text-2xl font-bold mb-4">Introduction</h2>
                <p className="text-muted-foreground leading-relaxed">
                  At Smarty Gym, we take your privacy seriously. This Privacy Policy explains how we collect, 
                  use, disclose, and safeguard your information when you use our website and services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Information We Collect</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      We collect information that you provide directly to us, including name, email address, 
                      payment information, and fitness-related data you choose to share.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Usage Data</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      We automatically collect certain information about your device and how you interact with 
                      our services, including browser type, pages visited, and time spent on pages.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">How We Use Your Information</h2>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>To provide and maintain our services</li>
                  <li>To process your transactions and manage your subscription</li>
                  <li>To send you updates, newsletters, and marketing communications</li>
                  <li>To respond to your inquiries and provide customer support</li>
                  <li>To improve our services and develop new features</li>
                  <li>To protect against fraud and ensure security</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Information Sharing</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We do not sell your personal information. We may share your information with:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Service providers who assist in operating our platform</li>
                  <li>Payment processors to handle transactions</li>
                  <li>Legal authorities when required by law</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Data Security</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We implement appropriate technical and organizational measures to protect your personal 
                  information. However, no method of transmission over the internet is 100% secure, and we 
                  cannot guarantee absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Your Rights</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Access the personal information we hold about you</li>
                  <li>Request correction of inaccurate information</li>
                  <li>Request deletion of your personal information</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Export your data</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Cookies</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We use cookies and similar tracking technologies to track activity on our service and store 
                  certain information. You can instruct your browser to refuse all cookies or to indicate when 
                  a cookie is being sent.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Children's Privacy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our services are not intended for individuals under the age of 18. We do not knowingly 
                  collect personal information from children under 18.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Changes to This Policy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by 
                  posting the new Privacy Policy on this page and updating the "Last updated" date.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have questions about this Privacy Policy, please contact us at{" "}
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

export default PrivacyPolicy;
