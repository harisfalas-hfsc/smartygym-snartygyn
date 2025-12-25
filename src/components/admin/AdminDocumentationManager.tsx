import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Printer, Copy, FileText, ExternalLink, Apple, Smartphone, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { generateWordDocument, nativePushNotificationsContent, firebaseConsoleSetupContent, appPublishingCostChecklistContent, wodPhilosophyContent, workoutsPhilosophyContent, trainingProgramsPhilosophyContent } from "@/utils/wordExport";
import { portabilityDocContent, getPortabilityDocText } from "@/utils/portabilityDocContent";
import { Dumbbell } from "lucide-react";
import { IndividualBrochure } from "./IndividualBrochure";
import { CorporateBrochure } from "./CorporateBrochure";
import { AppStoreTextContent } from "./app-store/AppStoreTextContent";
import { AssetSpecifications } from "./app-store/AssetSpecifications";
import { ScreenshotCaptureGuide } from "./app-store/ScreenshotCaptureGuide";
import { QuickLinks } from "./app-store/QuickLinks";
import { AppStoreAssetGenerator } from "./app-store/AppStoreAssetGenerator";
import { AppyPiePackage } from "./app-store/AppyPiePackage";
import { AppStoreSettingsEditor } from "./app-store/AppStoreSettingsEditor";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Bell } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export const AdminDocumentationManager = () => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'ios-assets': true,
    'ios-screenshots': false,
    'ios-content': false,
    'ios-links': false,
    'android-assets': true,
    'android-screenshots': false,
    'android-content': false,
    'android-links': false,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };
  
  const downloadAsText = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  };

  const copyToClipboard = async (content: string, label: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success(`${label} copied to clipboard`);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const printDocument = (content: string, title: string) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${title}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
              h1 { color: #333; border-bottom: 2px solid #0ea5e9; padding-bottom: 10px; }
              h2 { color: #555; margin-top: 20px; }
              pre { background: #f5f5f5; padding: 10px; border-radius: 4px; white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <h1>${title}</h1>
            <pre>${content}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const openBrochure = (type: 'individual' | 'corporate' | 'cron-jobs') => {
    const pathMap = {
      'individual': '/admin/brochure-individual',
      'corporate': '/admin/brochure-corporate',
      'cron-jobs': '/admin/brochure-cron-jobs'
    };
    const path = pathMap[type];
    window.open(path, '_blank');
    toast.success(`Opening ${type} document in new tab`);
  };

  // App Store Submission Checklist
  const appSubmissionChecklist = `SmartyGym - App Submission Checklist

═══════════════════════════════════════════════════════════════

PHASE 1: PREPARATION
────────────────────────────────────────────────────────────────

□ 1. Developer Accounts Setup
   • Apple Developer: $99/year at developer.apple.com/programs/
   • Google Play Console: $25 one-time at play.google.com/console/

□ 2. Prepare Assets
   • App icon: 1024×1024px (iOS), 512×512px (Android)
   • Screenshots for required device sizes
   • Feature graphic: 1024×500px (Android only)

□ 3. Prepare Content
   • App name, subtitle, keywords
   • Full description (4000 characters max)
   • Privacy policy URL (required)

═══════════════════════════════════════════════════════════════

PHASE 2: iOS APP STORE
────────────────────────────────────────────────────────────────

□ 4. App Store Connect Setup
   • Create new app entry
   • Bundle ID: com.smartygym.app
   • Set primary language

□ 5. Required Screenshots
   • iPhone 6.7" (1290×2796px) - 3-10 screenshots
   • iPhone 6.5" (1284×2778px) - 3-10 screenshots
   • iPhone 5.5" (1242×2208px) - 3-10 screenshots
   • iPad 12.9" (2048×2732px) - optional

□ 6. App Information
   • App Name: SmartyGym - Online Gym
   • Subtitle: Expert Workouts by Haris Falas
   • Upload all icon sizes
   • Privacy Policy URL: https://smartygym.com/privacy-policy

□ 7. Submit for Review

═══════════════════════════════════════════════════════════════

PHASE 3: GOOGLE PLAY STORE
────────────────────────────────────────────────────────────────

□ 8. Play Console Setup
   • Create new app
   • App name: SmartyGym - Online Gym
   • Category: Health & Fitness

□ 9. Required Assets
   • High-res icon: 512×512px
   • Feature graphic: 1024×500px
   • Phone screenshots: 1080×1920px (2-8)

□ 10. Store Listing
   • Short description (80 chars max)
   • Full description (4000 chars max)
   • Complete content rating questionnaire

□ 11. Submit for Review

═══════════════════════════════════════════════════════════════

USEFUL TOOLS
────────────────────────────────────────────────────────────────

• App Icon Generator: https://appicon.co/
• Screenshot Creator: Canva or Figma
• Apple Guidelines: https://developer.apple.com/app-store/review/guidelines/
• Google Guidelines: https://play.google.com/about/developer-content-policy/

═══════════════════════════════════════════════════════════════`;

  // Privacy Policy Excerpt
  const privacyPolicyExcerpt = `SmartyGym Privacy Policy Summary

Last Updated: ${new Date().toLocaleDateString()}

WHAT WE COLLECT:
• Account information (email, name)
• Fitness data (workout history, progress logs)
• Payment information (processed by Stripe)
• Device information for app optimization

HOW WE USE IT:
• Provide personalized fitness experience
• Process payments and subscriptions
• Send important updates and notifications
• Improve our services

YOUR RIGHTS:
• Access your personal data
• Request data deletion
• Opt out of marketing communications
• Export your data

DATA SECURITY:
• Encrypted data transmission (SSL/TLS)
• Secure cloud storage
• Regular security audits

Full Privacy Policy: https://smartygym.com/privacy-policy
Contact: support@smartygym.com`;

  // QA Testing Checklist
  const qaTestingChecklist = `SmartyGym - QA Testing Checklist

PRE-SUBMISSION TESTING
═══════════════════════════════════════════════════════════════

AUTHENTICATION
□ Sign up with email works
□ Login with existing account works
□ Password reset flow works
□ Logout works correctly

WORKOUTS
□ Browse workouts loads correctly
□ Workout detail pages display properly
□ Video playback (if applicable)
□ Mark workout complete works

SUBSCRIPTIONS
□ Free tier access is correct
□ Premium content gated properly
□ Stripe checkout completes
□ Subscription status updates

RESPONSIVE DESIGN
□ Mobile view (iPhone/Android)
□ Tablet view (iPad/Android tablet)
□ Desktop view

PERFORMANCE
□ Pages load within 3 seconds
□ No console errors
□ Images load properly
□ Offline handling (if applicable)

═══════════════════════════════════════════════════════════════`;

  const individualPresentation = `SmartyGym Individual Premium Presentation

YOUR GYM RE-IMAGINED. ANYWHERE, ANYTIME.
100% Human Expertise. 0% AI.

WHY SMARTYGYM?
• 500+ Expert Workouts designed by Sports Scientist Haris Falas
• Structured Training Programs (4-12 weeks)
• Professional Fitness Tools
• Progress Tracking & Analytics

MEMBERSHIP OPTIONS:
• Gold: €9.99/month - All premium workouts + programs
• Platinum: €89.89/year - Everything + exclusive content

Start your transformation at smartygym.com`;

  const corporatePresentation = `SmartyGym Corporate Plans

INVEST IN YOUR TEAM'S WELLNESS

SMARTY CORPORATE PLANS:
• Smarty Dynamic (10 users): €399/year
• Smarty Power (20 users): €499/year
• Smarty Elite (30 users): €599/year
• Smarty Enterprise (unlimited): €699/year

BENEFITS:
• Full Platinum access for all members
• Centralized billing
• Team management dashboard
• Priority support

Contact: corporate@smartygym.com`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <FileText className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-3xl font-bold">App Store Asset Center</h2>
          <p className="text-muted-foreground">Everything you need to publish SmartyGym on iOS App Store and Google Play Store</p>
        </div>
      </div>

      {/* AI Asset Generator & Appy Pie Package */}
      <div className="grid gap-6 md:grid-cols-2">
        <AppStoreAssetGenerator />
        <AppyPiePackage />
      </div>

      {/* App Store Settings Editor */}
      <AppStoreSettingsEditor />

      {/* Main Tabs: Apple vs Google */}
      <Tabs defaultValue="apple" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="apple" className="gap-2 text-base">
            <Apple className="h-5 w-5" />
            Apple App Store
          </TabsTrigger>
          <TabsTrigger value="android" className="gap-2 text-base">
            <Smartphone className="h-5 w-5" />
            Google Play Store
          </TabsTrigger>
        </TabsList>

        {/* iOS Tab Content */}
        <TabsContent value="apple" className="space-y-4">
          <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Apple className="h-6 w-6" />
                iOS App Store Submission
              </CardTitle>
              <CardDescription>
                Apple Developer account required ($99/year). Complete all sections below for successful submission.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* iOS Sections */}
          <Collapsible open={openSections['ios-assets']} onOpenChange={() => toggleSection('ios-assets')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-card border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold">📱 App Icon & Assets</span>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Required</span>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${openSections['ios-assets'] ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <AssetSpecifications platform="ios" />
            </CollapsibleContent>
          </Collapsible>

          <Collapsible open={openSections['ios-screenshots']} onOpenChange={() => toggleSection('ios-screenshots')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-card border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold">📸 Screenshots Guide</span>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Required</span>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${openSections['ios-screenshots'] ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <ScreenshotCaptureGuide platform="ios" />
            </CollapsibleContent>
          </Collapsible>

          <Collapsible open={openSections['ios-content']} onOpenChange={() => toggleSection('ios-content')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-card border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold">✍️ Text Content</span>
                <span className="text-xs text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">Ready to copy</span>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${openSections['ios-content'] ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <AppStoreTextContent platform="ios" />
            </CollapsibleContent>
          </Collapsible>

          <Collapsible open={openSections['ios-links']} onOpenChange={() => toggleSection('ios-links')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-card border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold">🔗 Quick Links & Resources</span>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${openSections['ios-links'] ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <QuickLinks platform="ios" />
            </CollapsibleContent>
          </Collapsible>
        </TabsContent>

        {/* Android Tab Content */}
        <TabsContent value="android" className="space-y-4">
          <Card className="border-green-500/30 bg-gradient-to-r from-green-500/5 to-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-6 w-6 text-green-600" />
                Google Play Store Submission
              </CardTitle>
              <CardDescription>
                Google Play Console account required ($25 one-time). Complete all sections below for successful submission.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Android Sections */}
          <Collapsible open={openSections['android-assets']} onOpenChange={() => toggleSection('android-assets')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-card border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold">📱 App Icon & Feature Graphic</span>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Required</span>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${openSections['android-assets'] ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <AssetSpecifications platform="android" />
            </CollapsibleContent>
          </Collapsible>

          <Collapsible open={openSections['android-screenshots']} onOpenChange={() => toggleSection('android-screenshots')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-card border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold">📸 Screenshots Guide</span>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Required</span>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${openSections['android-screenshots'] ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <ScreenshotCaptureGuide platform="android" />
            </CollapsibleContent>
          </Collapsible>

          <Collapsible open={openSections['android-content']} onOpenChange={() => toggleSection('android-content')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-card border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold">✍️ Text Content</span>
                <span className="text-xs text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">Ready to copy</span>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${openSections['android-content'] ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <AppStoreTextContent platform="android" />
            </CollapsibleContent>
          </Collapsible>

          <Collapsible open={openSections['android-links']} onOpenChange={() => toggleSection('android-links')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-card border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold">🔗 Quick Links & Resources</span>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${openSections['android-links'] ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <QuickLinks platform="android" />
            </CollapsibleContent>
          </Collapsible>
        </TabsContent>
      </Tabs>

      {/* Submission Checklist Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <CheckCircle className="h-6 w-6 text-primary" />
            Submission Checklist
          </CardTitle>
          <CardDescription>
            Master checklist for both app stores - download and track your progress
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => downloadAsText(appSubmissionChecklist, 'SmartyGym-App-Submission-Checklist.txt')}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download Checklist
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => printDocument(appSubmissionChecklist, 'App Submission Checklist')}
            className="gap-2"
          >
            <Printer className="h-4 w-4" />
            Print/PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(appSubmissionChecklist, 'Checklist')}
            className="gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy
          </Button>
        </CardContent>
      </Card>

      {/* Legal Documents Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            📄 Legal Documents
          </CardTitle>
          <CardDescription>
            Privacy policy and terms of service for app store compliance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Privacy Policy */}
          <div className="border rounded-lg p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-lg">Privacy Policy</h3>
              <p className="text-sm text-muted-foreground">GDPR compliant privacy policy for app stores</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => downloadAsText(privacyPolicyExcerpt, 'SmartyGym-Privacy-Policy-Summary.txt')}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download Summary
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('/privacy-policy', '_blank')}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View Full Policy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard('https://smartygym.com/privacy-policy', 'Privacy Policy URL')}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy URL
              </Button>
            </div>
          </div>

          {/* Terms of Service */}
          <div className="border rounded-lg p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-lg">Terms of Service</h3>
              <p className="text-sm text-muted-foreground">Legal terms and conditions for using SmartyGym</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('/terms', '_blank')}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View Terms
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard('https://smartygym.com/terms', 'Terms URL')}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy URL
              </Button>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Technical Documentation Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            🔧 Technical Documentation
          </CardTitle>
          <CardDescription>
            Testing procedures and deployment checklists
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* QA Testing Checklist */}
          <div className="border rounded-lg p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-lg">QA Testing Checklist</h3>
              <p className="text-sm text-muted-foreground">Manual testing procedures before launch</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => downloadAsText(qaTestingChecklist, 'SmartyGym-QA-Testing-Checklist.txt')}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download TXT
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => printDocument(qaTestingChecklist, 'QA Testing Checklist')}
                className="gap-2"
              >
                <Printer className="h-4 w-4" />
                Print/PDF
              </Button>
            </div>
          </div>

          {/* Native Push Notifications Guide */}
          <div className="border rounded-lg p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Native Push Notifications Guide
              </h3>
              <p className="text-sm text-muted-foreground">Complete setup guide for iOS APNs and Android FCM push notifications</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    View Guide
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5 text-primary" />
                      Native Push Notifications Implementation Guide
                    </DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="h-[60vh] pr-4">
                    <div className="space-y-4">
                      {nativePushNotificationsContent.map((section, index) => (
                        <div key={index}>
                          {section.type === 'heading' && (
                            <h2 className={`font-bold ${
                              section.level === 1 ? 'text-xl mt-6 mb-3 text-primary' : 
                              section.level === 2 ? 'text-lg mt-4 mb-2' : 'text-base mt-3 mb-1'
                            }`}>
                              {section.content}
                            </h2>
                          )}
                          {section.type === 'paragraph' && (
                            <p className="text-sm text-muted-foreground mb-2">{section.content}</p>
                          )}
                          {section.type === 'bullet' && (
                            <p className="text-sm pl-4 mb-1">• {section.content}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
              <Button
                variant="default"
                size="sm"
                onClick={() => generateWordDocument(
                  'Native Push Notifications Guide',
                  nativePushNotificationsContent,
                  'SmartyGym-Native-Push-Notifications-Guide'
                )}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download DOCX
              </Button>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Promotional Materials Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            📣 Promotional Materials
          </CardTitle>
          <CardDescription>
            Marketing brochures and presentations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Individual User Presentation */}
          <div className="border rounded-lg p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-lg">Individual User Brochure</h3>
              <p className="text-sm text-muted-foreground">Professional A4 brochure for individual premium plans</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => openBrochure('individual')}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open Brochure
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadAsText(individualPresentation, 'SmartyGym-Individual-Presentation.txt')}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download TXT
              </Button>
            </div>
          </div>

          {/* Corporate Presentation */}
          <div className="border rounded-lg p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-lg">Corporate Brochure</h3>
              <p className="text-sm text-muted-foreground">Professional A4 brochure for Smarty Corporate plans</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => openBrochure('corporate')}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open Brochure
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadAsText(corporatePresentation, 'SmartyGym-Corporate-Presentation.txt')}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download TXT
              </Button>
            </div>
          </div>

          {/* Cron Jobs Documentation */}
          <div className="border rounded-lg p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-lg">Cron Jobs & Notifications</h3>
              <p className="text-sm text-muted-foreground">Complete documentation of all automated messages and emails</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => openBrochure('cron-jobs')}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open Documentation
              </Button>
            </div>
          </div>

          {/* Firebase Console Setup Guide */}
          <div className="border rounded-lg p-4 space-y-3 border-orange-500/30 bg-gradient-to-r from-orange-500/5 to-transparent">
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                🔥 Firebase Console Setup Guide
              </h3>
              <p className="text-sm text-muted-foreground">Step-by-step guide for configuring Firebase for push notifications</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="default" size="sm" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    View Guide
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle>🔥 Firebase Console Setup Guide</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="h-[60vh] pr-4">
                    <div className="space-y-4 text-sm">
                      {firebaseConsoleSetupContent.map((section, index) => {
                        if (section.type === 'heading') {
                          const HeadingTag = section.level === 1 ? 'h2' : section.level === 2 ? 'h3' : 'h4';
                          const headingClass = section.level === 1 
                            ? 'text-xl font-bold mt-6 mb-2 text-primary' 
                            : section.level === 2 
                            ? 'text-lg font-semibold mt-4 mb-2' 
                            : 'text-base font-medium mt-3 mb-1';
                          return <HeadingTag key={index} className={headingClass}>{section.content}</HeadingTag>;
                        } else if (section.type === 'paragraph') {
                          return <p key={index} className="text-muted-foreground leading-relaxed">{section.content}</p>;
                        } else if (section.type === 'bullet') {
                          return <p key={index} className="text-muted-foreground pl-4">• {section.content}</p>;
                        }
                        return null;
                      })}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateWordDocument(
                  'Firebase Console Setup Guide',
                  firebaseConsoleSetupContent,
                  'Firebase-Console-Setup-Guide'
                )}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download DOCX
              </Button>
            </div>
          </div>

          {/* App Publishing Cost & Checklist Guide */}
          <div className="border rounded-lg p-4 space-y-3 border-green-500/30 bg-gradient-to-r from-green-500/5 to-transparent">
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                💰 App Publishing Cost & Checklist Guide
              </h3>
              <p className="text-sm text-muted-foreground">Complete cost breakdown and step-by-step checklist for app store publishing</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="default" size="sm" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    View Guide
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle>💰 App Publishing Cost & Checklist Guide</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="h-[60vh] pr-4">
                    <div className="space-y-4 text-sm">
                      {appPublishingCostChecklistContent.map((section, index) => {
                        if (section.type === 'heading') {
                          const HeadingTag = section.level === 1 ? 'h2' : section.level === 2 ? 'h3' : 'h4';
                          const headingClass = section.level === 1 
                            ? 'text-xl font-bold mt-6 mb-2 text-primary' 
                            : section.level === 2 
                            ? 'text-lg font-semibold mt-4 mb-2' 
                            : 'text-base font-medium mt-3 mb-1';
                          return <HeadingTag key={index} className={headingClass}>{section.content}</HeadingTag>;
                        } else if (section.type === 'paragraph') {
                          return <p key={index} className="text-muted-foreground leading-relaxed">{section.content}</p>;
                        } else if (section.type === 'bullet') {
                          return <p key={index} className="text-muted-foreground pl-4">• {section.content}</p>;
                        }
                        return null;
                      })}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateWordDocument(
                  'App Publishing Cost & Checklist Guide',
                  appPublishingCostChecklistContent,
                  'App-Publishing-Cost-Checklist-Guide'
                )}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download DOCX
              </Button>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Workouts & Training Programs Philosophy Section */}
      <Card className="border-orange-500/30 bg-gradient-to-r from-orange-500/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            🏋️ Workouts & Training Programs Philosophy
          </CardTitle>
          <CardDescription>
            Complete AI generation rules, instructions, and philosophy documents - the exact instructions the AI follows when creating content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* WOD (Workout of the Day) */}
          <div className="border rounded-lg p-4 space-y-3 border-orange-500/30 bg-gradient-to-r from-orange-500/5 to-transparent">
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                ⚡ WOD (Workout of the Day) Generation Philosophy
              </h3>
              <p className="text-sm text-muted-foreground">7-day category cycle, difficulty rotation, format rules, equipment lists, naming guidelines, periodization, and value-for-money standards</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="default" size="sm" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    View Guide
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle>⚡ WOD (Workout of the Day) Generation Philosophy</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="h-[60vh] pr-4">
                    <div className="space-y-4 text-sm">
                      {wodPhilosophyContent.map((section, index) => {
                        if (section.type === 'heading') {
                          const HeadingTag = section.level === 1 ? 'h2' : section.level === 2 ? 'h3' : 'h4';
                          const headingClass = section.level === 1 
                            ? 'text-xl font-bold mt-6 mb-2 text-primary' 
                            : section.level === 2 
                            ? 'text-lg font-semibold mt-4 mb-2' 
                            : 'text-base font-medium mt-3 mb-1';
                          return <HeadingTag key={index} className={headingClass}>{section.content}</HeadingTag>;
                        } else if (section.type === 'paragraph') {
                          return <p key={index} className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{section.content}</p>;
                        } else if (section.type === 'bullet') {
                          return <p key={index} className="text-muted-foreground pl-4">• {section.content}</p>;
                        } else if (section.type === 'code') {
                          return <pre key={index} className="bg-muted p-3 rounded text-xs overflow-x-auto">{section.content}</pre>;
                        }
                        return null;
                      })}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateWordDocument(
                  'WOD (Workout of the Day) Generation Philosophy',
                  wodPhilosophyContent,
                  'WOD-Generation-Philosophy'
                )}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download DOCX
              </Button>
            </div>
          </div>

          {/* Workouts */}
          <div className="border rounded-lg p-4 space-y-3 border-blue-500/30 bg-gradient-to-r from-blue-500/5 to-transparent">
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                💪 Workouts Generation Philosophy
              </h3>
              <p className="text-sm text-muted-foreground">Category philosophies (Strength, Cardio, Metabolic, etc.), exercise variety, equipment safety, format definitions, and HTML formatting</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="default" size="sm" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    View Guide
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle>💪 Workouts Generation Philosophy</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="h-[60vh] pr-4">
                    <div className="space-y-4 text-sm">
                      {workoutsPhilosophyContent.map((section, index) => {
                        if (section.type === 'heading') {
                          const HeadingTag = section.level === 1 ? 'h2' : section.level === 2 ? 'h3' : 'h4';
                          const headingClass = section.level === 1 
                            ? 'text-xl font-bold mt-6 mb-2 text-primary' 
                            : section.level === 2 
                            ? 'text-lg font-semibold mt-4 mb-2' 
                            : 'text-base font-medium mt-3 mb-1';
                          return <HeadingTag key={index} className={headingClass}>{section.content}</HeadingTag>;
                        } else if (section.type === 'paragraph') {
                          return <p key={index} className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{section.content}</p>;
                        } else if (section.type === 'bullet') {
                          return <p key={index} className="text-muted-foreground pl-4">• {section.content}</p>;
                        } else if (section.type === 'code') {
                          return <pre key={index} className="bg-muted p-3 rounded text-xs overflow-x-auto">{section.content}</pre>;
                        }
                        return null;
                      })}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateWordDocument(
                  'Workouts Generation Philosophy',
                  workoutsPhilosophyContent,
                  'Workouts-Generation-Philosophy'
                )}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download DOCX
              </Button>
            </div>
          </div>

          {/* Training Programs */}
          <div className="border rounded-lg p-4 space-y-3 border-purple-500/30 bg-gradient-to-r from-purple-500/5 to-transparent">
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                📋 Training Programs Generation Philosophy
              </h3>
              <p className="text-sm text-muted-foreground">6 program categories (Cardio Endurance, Functional Strength, Hypertrophy, Weight Loss, Low Back Pain, Mobility), structure rules, and periodization</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="default" size="sm" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    View Guide
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle>📋 Training Programs Generation Philosophy</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="h-[60vh] pr-4">
                    <div className="space-y-4 text-sm">
                      {trainingProgramsPhilosophyContent.map((section, index) => {
                        if (section.type === 'heading') {
                          const HeadingTag = section.level === 1 ? 'h2' : section.level === 2 ? 'h3' : 'h4';
                          const headingClass = section.level === 1 
                            ? 'text-xl font-bold mt-6 mb-2 text-primary' 
                            : section.level === 2 
                            ? 'text-lg font-semibold mt-4 mb-2' 
                            : 'text-base font-medium mt-3 mb-1';
                          return <HeadingTag key={index} className={headingClass}>{section.content}</HeadingTag>;
                        } else if (section.type === 'paragraph') {
                          return <p key={index} className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{section.content}</p>;
                        } else if (section.type === 'bullet') {
                          return <p key={index} className="text-muted-foreground pl-4">• {section.content}</p>;
                        } else if (section.type === 'code') {
                          return <pre key={index} className="bg-muted p-3 rounded text-xs overflow-x-auto">{section.content}</pre>;
                        }
                        return null;
                      })}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateWordDocument(
                  'Training Programs Generation Philosophy',
                  trainingProgramsPhilosophyContent,
                  'Training-Programs-Generation-Philosophy'
                )}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download DOCX
              </Button>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Portability & Self-Hosting Guide */}
      <Card className="border-emerald-500/30 bg-gradient-to-r from-emerald-500/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            🚀 Portability & Self-Hosting Guide
          </CardTitle>
          <CardDescription>
            Complete documentation for exporting, migrating, and self-hosting SmartyGym if you ever decide to leave Lovable
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border rounded-lg p-4 space-y-3 border-emerald-500/30 bg-gradient-to-r from-emerald-500/5 to-transparent">
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                📦 Full Portability Documentation
              </h3>
              <p className="text-sm text-muted-foreground">Source code export, frontend deployment, database migration, AI feature migration, cron jobs, and what happens on subscription cancellation</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="default" size="sm" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    View Guide
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle>🚀 Portability & Self-Hosting Guide</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="h-[60vh] pr-4">
                    <div className="space-y-4 text-sm">
                      {portabilityDocContent.map((section, index) => {
                        if (section.type === 'heading') {
                          const HeadingTag = section.level === 1 ? 'h2' : section.level === 2 ? 'h3' : 'h4';
                          const headingClass = section.level === 1 
                            ? 'text-xl font-bold mt-6 mb-2 text-primary' 
                            : section.level === 2 
                            ? 'text-lg font-semibold mt-4 mb-2' 
                            : 'text-base font-medium mt-3 mb-1';
                          return <HeadingTag key={index} className={headingClass}>{section.content}</HeadingTag>;
                        } else if (section.type === 'paragraph') {
                          return <p key={index} className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{section.content}</p>;
                        } else if (section.type === 'bullet') {
                          return <p key={index} className="text-muted-foreground pl-4">• {section.content}</p>;
                        } else if (section.type === 'code') {
                          return <pre key={index} className="bg-muted p-3 rounded text-xs overflow-x-auto">{section.content}</pre>;
                        }
                        return null;
                      })}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadAsText(getPortabilityDocText(), 'SmartyGym-Portability-Guide.txt')}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download TXT
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => printDocument(getPortabilityDocText(), 'SmartyGym Portability & Self-Hosting Guide')}
                className="gap-2"
              >
                <Printer className="h-4 w-4" />
                Print / PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};
