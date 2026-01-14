import { Helmet } from "react-helmet";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Eye, FileText, Users, AlertCircle, ArrowLeft, Globe, Bell, Smartphone, Brain, Cloud, Trash2, Download } from "lucide-react";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";
import { useShowBackButton } from "@/hooks/useShowBackButton";

const PrivacyPolicy = () => {
  const { canGoBack, goBack } = useShowBackButton();

  return (
    <>
      <Helmet>
        <title>Privacy Policy | SmartyGym.com Online Fitness Platform | smartygym.com</title>
        <meta name="description" content="Smarty Gym (smartygym.com) Privacy Policy - Learn how Online Fitness Platform protects your personal data. Founded by Haris Falas. GDPR compliant data protection for online fitness members worldwide." />
        <meta name="keywords" content="smartygym privacy, smartygym.com privacy policy, online fitness privacy, Haris Falas, data protection, GDPR fitness platform, online fitness security, data portability, right to erasure" />
        
        <meta property="og:title" content="Privacy Policy - SmartyGym.com" />
        <meta property="og:description" content="How Smarty Gym protects your data - GDPR compliant online fitness platform" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://smartygym.com/privacy-policy" />
        
        <link rel="canonical" href="https://smartygym.com/privacy-policy" />
        
        {/* WebPage Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Privacy Policy",
            "description": "Privacy Policy for SmartyGym Online Fitness Platform - GDPR Compliant",
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
                "name": "Privacy Policy",
                "item": "https://smartygym.com/privacy-policy"
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
            { label: "Privacy Policy" }
          ]} />

          <div className="flex items-center gap-3 mb-8">
            <Shield className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold">Privacy Policy - SmartyGym.com</h1>
          </div>

          <Card className="p-8 space-y-8">
            <div className="prose dark:prose-invert max-w-none">
              <div className="bg-muted/50 p-4 rounded-lg mb-6">
                <p className="text-sm text-muted-foreground mb-2"><strong>Last Updated:</strong> January 14, 2025</p>
                <p className="text-sm text-muted-foreground mb-2"><strong>Data Controller:</strong> SmartyGym (smartygym.com)</p>
                <p className="text-sm text-muted-foreground"><strong>Contact:</strong> smartygym@outlook.com</p>
              </div>

              <p className="text-lg text-muted-foreground">
                At <strong>SmartyGym</strong> (smartygym.com), founded by <strong>Haris Falas</strong>, we value your privacy and are committed to protecting your personal data. 
                This Privacy Policy explains how our <strong>Online Fitness Platform</strong> collects, uses, stores, and protects your information when you visit our
                website or use our services. Our practices comply with the General Data Protection Regulation (GDPR) 
                (EU) 2016/679, the ePrivacy Directive 2002/58/EC, and applicable data protection laws worldwide.
              </p>

              <div className="flex items-start gap-3 mt-6">
                <FileText className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">1. Data We Collect</h2>
                  <p className="text-muted-foreground mb-3">We may collect the following types of personal information:</p>
                  
                  <h3 className="text-lg font-semibold mt-4 mb-2">Account & Profile Data</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>Name, email address, phone number, and billing information when you sign up for our services or subscriptions.</li>
                    <li>Profile information including avatar, display name, and timezone preferences.</li>
                    <li>Information related to your fitness goals, training preferences, and progress (if you provide it voluntarily).</li>
                  </ul>

                  <h3 className="text-lg font-semibold mt-4 mb-2">Connected Services Data</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li><strong>Google Calendar:</strong> When you connect Google Calendar, we access your calendar events to sync workout schedules. We only read and write events related to SmartyGym workouts.</li>
                    <li><strong>Strava:</strong> If connected, we access your fitness activities to track workout completions and provide personalized recommendations.</li>
                  </ul>

                  <h3 className="text-lg font-semibold mt-4 mb-2">Usage & Technical Data</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>Technical data such as IP address, browser type, device type, operating system, and cookies when you visit our website.</li>
                    <li>Push notification tokens if you enable notifications.</li>
                    <li>Daily check-in data including sleep, hydration, mood, and activity metrics.</li>
                    <li>Workout completion history, saved programs, and exercise preferences.</li>
                  </ul>

                  <h3 className="text-lg font-semibold mt-4 mb-2">AI Interaction Data</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>Queries and prompts you submit to our AI-powered features (workout suggestions, meal planning, etc.).</li>
                    <li>Responses and recommendations generated by AI for your fitness journey.</li>
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
                    <li>Process payments and subscriptions via Stripe.</li>
                    <li>Communicate with you regarding updates, offers, or support via email (Resend) or push notifications.</li>
                    <li>Improve our website, services, and customer experience through analytics.</li>
                    <li>Generate personalized workout and nutrition recommendations using AI.</li>
                    <li>Sync your workout schedules with connected calendars (Google Calendar).</li>
                    <li>Track your fitness activities through connected apps (Strava).</li>
                    <li>Send reminders for check-ins, scheduled workouts, and Smarty Rituals.</li>
                    <li>Ensure legal compliance and security.</li>
                  </ul>
                  <p className="text-muted-foreground mt-3 font-semibold">We will never sell or rent your data to third parties.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">3. Legal Basis for Processing (GDPR Article 6)</h2>
                  <p className="text-muted-foreground mb-3">We process your personal data based on:</p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li><strong>Consent (Art. 6(1)(a)):</strong> When signing up for newsletters, enabling push notifications, or connecting third-party services like Google Calendar or Strava.</li>
                    <li><strong>Contractual necessity (Art. 6(1)(b)):</strong> When you subscribe to a program or use our fitness services.</li>
                    <li><strong>Legal obligations (Art. 6(1)(c)):</strong> Tax or accounting requirements, fraud prevention.</li>
                    <li><strong>Legitimate interests (Art. 6(1)(f)):</strong> Improving our services, security measures, and analytics.</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">4. Data Sharing & Third-Party Services</h2>
                  <p className="text-muted-foreground mb-3">Your personal data may be shared only with the following trusted service providers:</p>
                  
                  <h3 className="text-lg font-semibold mt-4 mb-2">Payment Processing</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li><strong>Stripe:</strong> Processes all payments securely. Stripe is PCI DSS compliant. <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Stripe Privacy Policy</a></li>
                  </ul>

                  <h3 className="text-lg font-semibold mt-4 mb-2">Communication Services</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li><strong>Resend:</strong> Email delivery service for transactional and marketing emails. <a href="https://resend.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Resend Privacy Policy</a></li>
                  </ul>

                  <h3 className="text-lg font-semibold mt-4 mb-2">Connected Integrations</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li><strong>Google (Calendar, YouTube):</strong> Calendar sync and embedded exercise demonstration videos. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Privacy Policy</a></li>
                    <li><strong>Strava:</strong> Fitness activity tracking (optional). <a href="https://www.strava.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Strava Privacy Policy</a></li>
                  </ul>

                  <h3 className="text-lg font-semibold mt-4 mb-2">AI & Content Services</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li><strong>AI Services:</strong> We use AI models to generate personalized workout and nutrition recommendations. AI queries do not include personally identifiable information beyond necessary context.</li>
                    <li><strong>ExerciseDB/RapidAPI:</strong> Exercise database for workout content.</li>
                  </ul>

                  <h3 className="text-lg font-semibold mt-4 mb-2">Infrastructure</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li><strong>Supabase:</strong> Database hosting and authentication services (EU region). <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Supabase Privacy Policy</a></li>
                  </ul>

                  <p className="text-muted-foreground mt-3">All third-party providers are required to comply with GDPR standards and maintain appropriate data protection measures.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">5. Data Retention</h2>
                  <p className="text-muted-foreground mb-3">
                    We retain your personal data only for as long as necessary:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li><strong>Account data:</strong> Retained while your account is active and for 30 days after deletion request.</li>
                    <li><strong>Transaction records:</strong> Retained for 7 years as required by tax law.</li>
                    <li><strong>Marketing preferences:</strong> Until you withdraw consent.</li>
                    <li><strong>Analytics data:</strong> Anonymized after 26 months.</li>
                    <li><strong>Check-in and workout data:</strong> Retained while your account is active.</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">6. Your Rights Under GDPR</h2>
                  <p className="text-muted-foreground mb-3">Under GDPR and applicable data protection laws, you have the following rights:</p>
                  
                  <ul className="space-y-3 text-muted-foreground">
                    <li>
                      <strong>Right of Access (Art. 15):</strong> Request a copy of all personal data we hold about you.
                    </li>
                    <li>
                      <strong>Right to Rectification (Art. 16):</strong> Request correction of inaccurate data.
                    </li>
                    <li>
                      <strong>Right to Erasure (Art. 17):</strong> Request deletion of your personal data. Use the <strong>"Delete My Account"</strong> button in your dashboard settings to permanently delete your account and all associated data.
                    </li>
                    <li>
                      <strong>Right to Restrict Processing (Art. 18):</strong> Request limitation of how we process your data.
                    </li>
                    <li>
                      <strong>Right to Data Portability (Art. 20):</strong> Receive your data in a structured, machine-readable format. Use the <strong>"Download My Data"</strong> button in your dashboard settings to export all your data as JSON.
                    </li>
                    <li>
                      <strong>Right to Object (Art. 21):</strong> Object to processing based on legitimate interests or direct marketing.
                    </li>
                    <li>
                      <strong>Right to Withdraw Consent (Art. 7):</strong> Withdraw consent at any time for processing based on consent.
                    </li>
                  </ul>

                  <div className="bg-muted/50 p-4 rounded-lg mt-4">
                    <p className="text-muted-foreground font-semibold mb-2">How to Exercise Your Rights:</p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>📊 <strong>Download Data:</strong> Dashboard → Settings → "Download My Data"</li>
                      <li>🗑️ <strong>Delete Account:</strong> Dashboard → Settings → "Delete My Account"</li>
                      <li>🔌 <strong>Disconnect Services:</strong> Dashboard → Settings → Connected Services</li>
                      <li>📧 <strong>Other Requests:</strong> Email <a href="mailto:smartygym@outlook.com" className="text-primary hover:underline">smartygym@outlook.com</a></li>
                    </ul>
                  </div>

                  <p className="text-muted-foreground mt-4">
                    <strong>Right to Lodge a Complaint:</strong> You have the right to lodge a complaint with a supervisory authority, in particular in the EU Member State of your habitual residence, place of work, or place of the alleged infringement.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Lock className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">7. Security Measures</h2>
                  <p className="text-muted-foreground mb-3">
                    We implement technical and organizational measures to safeguard your personal data:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>Encryption of data in transit (TLS 1.3) and at rest (AES-256).</li>
                    <li>Secure authentication with hashed passwords and optional two-factor authentication.</li>
                    <li>Row Level Security (RLS) ensuring you can only access your own data.</li>
                    <li>Regular security audits and vulnerability assessments.</li>
                    <li>Access controls limiting employee access to personal data.</li>
                    <li>Secure OAuth 2.0 flows for third-party integrations.</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">8. Cookies & Local Storage</h2>
                  <p className="text-muted-foreground mb-3">
                    Our website uses cookies and similar technologies to provide and improve our services:
                  </p>
                  
                  <h3 className="text-lg font-semibold mt-4 mb-2">Essential Cookies</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>Authentication tokens for secure login sessions.</li>
                    <li>Security cookies for fraud prevention.</li>
                    <li>Core website functionality cookies.</li>
                  </ul>

                  <h3 className="text-lg font-semibold mt-4 mb-2">Functional Storage</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>Theme preferences (light/dark mode).</li>
                    <li>UI settings and layout preferences.</li>
                    <li>Onboarding completion status.</li>
                  </ul>

                  <h3 className="text-lg font-semibold mt-4 mb-2">PWA & Service Worker Data</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>Service Worker cache for offline functionality.</li>
                    <li>IndexedDB storage for app data caching.</li>
                    <li>Push notification subscription tokens.</li>
                  </ul>

                  <h3 className="text-lg font-semibold mt-4 mb-2">Third-Party Cookies</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li><strong>Stripe:</strong> Payment processing and fraud prevention.</li>
                    <li><strong>YouTube:</strong> Embedded video player (when viewing exercise demonstrations).</li>
                  </ul>

                  <p className="text-muted-foreground mt-3">
                    You can manage your cookie preferences through our cookie consent banner or by adjusting your browser settings. 
                    Note that disabling essential cookies may affect website functionality.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Bell className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">9. Push Notifications</h2>
                  <p className="text-muted-foreground mb-3">
                    With your consent, we send push notifications for:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>Workout reminders and scheduled session alerts.</li>
                    <li>Daily check-in reminders.</li>
                    <li>Smarty Ritual notifications (morning, midday, evening).</li>
                    <li>New content announcements and updates.</li>
                    <li>Important account notifications.</li>
                  </ul>
                  <p className="text-muted-foreground mt-3">
                    <strong>How to manage:</strong> You can enable/disable notifications in Dashboard → Settings → Notifications, or through your browser/device settings.
                  </p>
                  <p className="text-muted-foreground mt-2">
                    <strong>Data collected:</strong> Push subscription tokens are stored securely and used solely for delivering notifications. No personal content is included in push payloads.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Smartphone className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">10. Third-Party Integrations</h2>
                  <p className="text-muted-foreground mb-3">
                    SmartyGym offers optional integrations with third-party services:
                  </p>

                  <h3 className="text-lg font-semibold mt-4 mb-2">Google Calendar</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li><strong>What we access:</strong> Read/write permissions for calendar events.</li>
                    <li><strong>What we do:</strong> Create workout schedule events, reminders for check-ins and rituals.</li>
                    <li><strong>How to disconnect:</strong> Dashboard → Settings → Connected Services → Disconnect Google Calendar.</li>
                  </ul>

                  <h3 className="text-lg font-semibold mt-4 mb-2">Strava</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li><strong>What we access:</strong> Your fitness activities and workout data.</li>
                    <li><strong>What we do:</strong> Sync completed workouts for progress tracking.</li>
                    <li><strong>How to disconnect:</strong> Dashboard → Settings → Connected Services → Disconnect Strava, or revoke access in Strava settings.</li>
                  </ul>

                  <h3 className="text-lg font-semibold mt-4 mb-2">YouTube (Embedded Content)</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>Exercise demonstration videos are embedded from YouTube.</li>
                    <li>YouTube may set cookies when you watch videos. See <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google's Privacy Policy</a>.</li>
                  </ul>

                  <p className="text-muted-foreground mt-3">
                    You can disconnect any integration at any time. Disconnecting removes our access to that service's data but does not delete data already processed.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Brain className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">11. AI-Powered Features</h2>
                  <p className="text-muted-foreground mb-3">
                    SmartyGym uses artificial intelligence to enhance your fitness experience:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li><strong>Personalized Recommendations:</strong> AI analyzes your preferences, goals, and progress to suggest workouts and meals.</li>
                    <li><strong>Workout Generation:</strong> AI can create custom workout plans based on your inputs.</li>
                    <li><strong>Smart Suggestions:</strong> The Smartly Suggest feature uses AI to recommend content based on your activity.</li>
                  </ul>
                  <p className="text-muted-foreground mt-3">
                    <strong>Data handling:</strong> AI queries are processed in real-time and not stored for training purposes. We do not use your personal data to train AI models.
                  </p>
                  <p className="text-muted-foreground mt-2">
                    <strong>Automated decisions:</strong> AI recommendations are suggestions only. You maintain full control over which programs and workouts you follow. No automated decisions with legal effects are made.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Globe className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">12. International Data Transfers</h2>
                  <p className="text-muted-foreground mb-3">
                    Your data may be transferred to and processed in countries outside the European Economic Area (EEA):
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li><strong>Primary hosting:</strong> Our database is hosted in the EU region for GDPR compliance.</li>
                    <li><strong>US-based services:</strong> Some third-party providers (Stripe, Resend, Google) process data in the United States.</li>
                  </ul>
                  <p className="text-muted-foreground mt-3">
                    <strong>Safeguards:</strong> For transfers outside the EEA, we ensure appropriate safeguards are in place:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>EU-US Data Privacy Framework certifications where applicable.</li>
                    <li>Standard Contractual Clauses (SCCs) approved by the European Commission.</li>
                    <li>Binding Corporate Rules where applicable.</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Cloud className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">13. Data Breach Notification</h2>
                  <p className="text-muted-foreground">
                    In the event of a personal data breach that poses a risk to your rights and freedoms, we will:
                  </p>
                  <ul className="space-y-2 text-muted-foreground mt-3">
                    <li>Notify the relevant supervisory authority within 72 hours of becoming aware (GDPR Art. 33).</li>
                    <li>Notify affected individuals without undue delay if the breach poses a high risk (GDPR Art. 34).</li>
                    <li>Document the breach, its effects, and remedial actions taken.</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">14. Children's Privacy</h2>
                  <p className="text-muted-foreground">
                    SmartyGym is not intended for children under 16 years of age. We do not knowingly collect personal data from children under 16. If you believe we have inadvertently collected such data, please contact us at <a href="mailto:smartygym@outlook.com" className="text-primary hover:underline">smartygym@outlook.com</a> and we will promptly delete it.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">15. Changes to This Policy</h2>
                  <p className="text-muted-foreground">
                    We may update this Privacy Policy periodically. Changes will be posted on this page with an updated "Last Updated" date. For significant changes, we will notify you via email or dashboard notification. Continued use of our services after changes constitutes acceptance of the updated policy.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">16. Contact Us</h2>
                  <p className="text-muted-foreground mb-3">
                    If you have any questions about this Privacy Policy, wish to exercise your rights, or have concerns about how we handle your data, please contact us:
                  </p>
                  <div className="text-muted-foreground space-y-1">
                    <p><strong>Smarty Gym</strong></p>
                    <p><strong>Data Controller:</strong> Haris Falas</p>
                    <p>Email: <a href="mailto:smartygym@outlook.com" className="text-primary hover:underline">smartygym@outlook.com</a></p>
                  </div>
                  <p className="text-muted-foreground mt-4">
                    We aim to respond to all data protection inquiries within 30 days.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Last updated: January 14, 2025
          </p>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;