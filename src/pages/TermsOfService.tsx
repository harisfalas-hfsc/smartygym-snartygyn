import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";
import { BackToTop } from "@/components/BackToTop";

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Terms of Service - Smarty Gym</title>
        <meta name="description" content="Smarty Gym terms of service. Read our terms and conditions for using our fitness platform and services." />
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
              <FileText className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: January 2025</p>
          </header>

          <Card>
            <CardContent className="p-8 space-y-8">
              <section>
                <h2 className="text-2xl font-bold mb-4">Agreement to Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing or using Smarty Gym, you agree to be bound by these Terms of Service. 
                  If you disagree with any part of these terms, you may not access our services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Services</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Smarty Gym provides online fitness services including workout programs, training plans, 
                  nutrition guidance, and fitness tools. We reserve the right to modify, suspend, or 
                  discontinue any part of our services at any time.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">User Accounts</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p className="leading-relaxed">
                    To access certain features, you must create an account. You are responsible for:
                  </p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Maintaining the confidentiality of your account credentials</li>
                    <li>All activities that occur under your account</li>
                    <li>Notifying us immediately of any unauthorized access</li>
                    <li>Providing accurate and complete information</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Subscriptions and Payments</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Billing</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Subscriptions are billed in advance on a monthly or annual basis. You authorize us to 
                      charge the payment method you provide for all fees incurred.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Cancellation</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      You may cancel your subscription at any time. Cancellations take effect at the end of 
                      the current billing period. No refunds are provided for partial periods.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Price Changes</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      We reserve the right to modify subscription prices. We will provide advance notice of 
                      any price changes.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">User Content</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You may be able to post, upload, or submit content. You retain ownership of your content, 
                  but grant us a license to use, display, and distribute it as necessary to provide our services.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  You agree not to post content that is illegal, offensive, defamatory, or violates any 
                  third-party rights.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Health and Safety Disclaimer</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Smarty Gym provides fitness information and programs, but we are not a substitute for 
                  professional medical advice. You should:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Consult a physician before starting any exercise program</li>
                  <li>Stop exercising if you experience pain or discomfort</li>
                  <li>Use proper form and equipment to prevent injury</li>
                  <li>Recognize that results may vary</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Intellectual Property</h2>
                <p className="text-muted-foreground leading-relaxed">
                  All content on Smarty Gym, including text, graphics, logos, images, and software, is our 
                  property or that of our licensors. You may not reproduce, distribute, or create derivative 
                  works without our written permission.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To the maximum extent permitted by law, Smarty Gym shall not be liable for any indirect, 
                  incidental, special, consequential, or punitive damages resulting from your use of our services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Termination</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to terminate or suspend your account at our discretion, without notice, 
                  for conduct that we believe violates these Terms or is harmful to other users or our business.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Governing Law</h2>
                <p className="text-muted-foreground leading-relaxed">
                  These Terms shall be governed by and construed in accordance with applicable laws, without 
                  regard to conflict of law provisions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Changes to Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may revise these Terms at any time. Continued use of our services after changes constitutes 
                  acceptance of the revised Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
                <p className="text-muted-foreground leading-relaxed">
                  For questions about these Terms, please contact us at{" "}
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

export default TermsOfService;
