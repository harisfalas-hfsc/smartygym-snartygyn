import { useState } from "react";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Circle, ExternalLink, FileText, Image, Shield, Smartphone } from "lucide-react";

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  required: boolean;
}

const AppSubmission = () => {
  const [iosChecklist, setIosChecklist] = useState<ChecklistItem[]>([
    // Assets
    { id: "ios-icon", label: "App icon 1024×1024 generated", completed: false, required: true },
    { id: "ios-screenshots", label: "iPhone screenshots captured (6 minimum)", completed: false, required: true },
    { id: "ios-ipad-screenshots", label: "iPad screenshots captured (optional)", completed: false, required: false },
    
    // Content
    { id: "ios-app-name", label: "App name finalized (30 chars max)", completed: false, required: true },
    { id: "ios-subtitle", label: "Subtitle written (30 chars max)", completed: false, required: true },
    { id: "ios-description", label: "Full description written (4000 chars)", completed: false, required: true },
    { id: "ios-keywords", label: "Keywords optimized (100 chars)", completed: false, required: true },
    { id: "ios-privacy-url", label: "Privacy policy URL verified", completed: false, required: true },
    
    // Technical
    { id: "ios-build", label: "Production build generated via Xcode", completed: false, required: true },
    { id: "ios-test-account", label: "Test account created for reviewers", completed: false, required: true },
    { id: "ios-stripe-test", label: "Stripe test mode payment tested", completed: false, required: true },
    { id: "ios-all-links", label: "All internal links working", completed: false, required: true },
    
    // Submission
    { id: "ios-apple-dev", label: "Apple Developer account active ($99/year)", completed: false, required: true },
    { id: "ios-app-store-connect", label: "App Store Connect configured", completed: false, required: true },
  ]);

  const [androidChecklist, setAndroidChecklist] = useState<ChecklistItem[]>([
    // Assets
    { id: "android-icon", label: "App icon 512×512 generated", completed: false, required: true },
    { id: "android-mipmap", label: "All mipmap density icons generated", completed: false, required: true },
    { id: "android-screenshots", label: "Phone screenshots captured (2 minimum)", completed: false, required: true },
    { id: "android-feature-graphic", label: "Feature graphic 1024×500 created", completed: false, required: true },
    
    // Content
    { id: "android-app-name", label: "App title finalized (50 chars max)", completed: false, required: true },
    { id: "android-short-desc", label: "Short description (80 chars)", completed: false, required: true },
    { id: "android-full-desc", label: "Full description (4000 chars)", completed: false, required: true },
    { id: "android-privacy-url", label: "Privacy policy URL verified", completed: false, required: true },
    
    // Technical
    { id: "android-build", label: "Production APK/AAB generated", completed: false, required: true },
    { id: "android-test-account", label: "Test account created for reviewers", completed: false, required: true },
    { id: "android-stripe-test", label: "Stripe test mode payment tested", completed: false, required: true },
    { id: "android-all-links", label: "All internal links working", completed: false, required: true },
    
    // Submission
    { id: "android-google-play", label: "Google Play Developer account active ($25 one-time)", completed: false, required: true },
    { id: "android-content-rating", label: "Content rating questionnaire completed", completed: false, required: true },
  ]);

  const [status, setStatus] = useState<"draft" | "in_review" | "approved" | "live">("draft");

  const toggleItem = (platform: "ios" | "android", itemId: string) => {
    if (platform === "ios") {
      setIosChecklist(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, completed: !item.completed } : item
        )
      );
    } else {
      setAndroidChecklist(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, completed: !item.completed } : item
        )
      );
    }
  };

  const calculateProgress = (checklist: ChecklistItem[]) => {
    const completed = checklist.filter(item => item.completed).length;
    return Math.round((completed / checklist.length) * 100);
  };

  const iosProgress = calculateProgress(iosChecklist);
  const androidProgress = calculateProgress(androidChecklist);

  const StatusBadge = ({ currentStatus }: { currentStatus: typeof status }) => {
    const variants = {
      draft: { label: "Draft", variant: "secondary" as const },
      in_review: { label: "In Review", variant: "default" as const },
      approved: { label: "Approved", variant: "default" as const },
      live: { label: "Live", variant: "default" as const },
    };
    
    const { label, variant } = variants[currentStatus];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const renderChecklist = (checklist: ChecklistItem[], platform: "ios" | "android") => {
    const sections = {
      assets: checklist.filter(item => ["icon", "mipmap", "screenshots", "feature-graphic", "ipad"].some(keyword => item.id.includes(keyword))),
      content: checklist.filter(item => ["name", "title", "subtitle", "desc", "description", "keywords", "privacy"].some(keyword => item.id.includes(keyword))),
      technical: checklist.filter(item => ["build", "test", "stripe", "links"].some(keyword => item.id.includes(keyword))),
      submission: checklist.filter(item => ["dev", "developer", "store", "play", "rating"].some(keyword => item.id.includes(keyword))),
    };

    return (
      <div className="space-y-6">
        {Object.entries(sections).map(([sectionName, items]) => (
          <div key={sectionName}>
            <h3 className="text-lg font-semibold capitalize mb-3 flex items-center gap-2">
              {sectionName === "assets" && <Image className="h-5 w-5" />}
              {sectionName === "content" && <FileText className="h-5 w-5" />}
              {sectionName === "technical" && <Shield className="h-5 w-5" />}
              {sectionName === "submission" && <Smartphone className="h-5 w-5" />}
              {sectionName}
            </h3>
            <div className="space-y-2">
              {items.map(item => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => toggleItem(platform, item.id)}
                >
                  {item.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className={item.completed ? "line-through text-muted-foreground" : ""}>
                    {item.label}
                  </span>
                  {item.required && !item.completed && (
                    <Badge variant="destructive" className="ml-auto text-xs">Required</Badge>
                  )}
                </div>
              ))}
            </div>
            {sectionName !== "submission" && <Separator className="mt-4" />}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>App Store Submission Checklist | SmartyGym Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">App Store Submission</h1>
              <p className="text-muted-foreground">
                Complete checklist for iOS App Store and Google Play Store submission
              </p>
            </div>
            <StatusBadge currentStatus={status} />
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">iOS Progress</span>
                    <span className="text-sm text-muted-foreground">{iosProgress}%</span>
                  </div>
                  <Progress value={iosProgress} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Android Progress</span>
                    <span className="text-sm text-muted-foreground">{androidProgress}%</span>
                  </div>
                  <Progress value={androidProgress} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Submission Status</CardTitle>
            <CardDescription>Update your submission progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-6">
              <Button
                variant={status === "draft" ? "default" : "outline"}
                onClick={() => setStatus("draft")}
              >
                Draft
              </Button>
              <Button
                variant={status === "in_review" ? "default" : "outline"}
                onClick={() => setStatus("in_review")}
              >
                In Review
              </Button>
              <Button
                variant={status === "approved" ? "default" : "outline"}
                onClick={() => setStatus("approved")}
              >
                Approved
              </Button>
              <Button
                variant={status === "live" ? "default" : "outline"}
                onClick={() => setStatus("live")}
              >
                Live 🎉
              </Button>
            </div>

            <Tabs defaultValue="ios" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="ios">iOS App Store</TabsTrigger>
                <TabsTrigger value="android">Google Play Store</TabsTrigger>
              </TabsList>

              <TabsContent value="ios" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>iOS Submission Checklist</CardTitle>
                    <CardDescription>
                      Complete all required items before submitting to App Store Connect
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {renderChecklist(iosChecklist, "ios")}
                    
                    <Separator className="my-6" />
                    
                    <div className="space-y-3">
                      <h3 className="font-semibold">Quick Links</h3>
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" className="justify-start" asChild>
                          <a href="https://developer.apple.com/account" target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Apple Developer Portal
                          </a>
                        </Button>
                        <Button variant="outline" className="justify-start" asChild>
                          <a href="https://appstoreconnect.apple.com" target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            App Store Connect
                          </a>
                        </Button>
                        <Button variant="outline" className="justify-start" asChild>
                          <a href="/app-icons/README.md" target="_blank">
                            <FileText className="h-4 w-4 mr-2" />
                            App Icon Generation Guide
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="android" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Android Submission Checklist</CardTitle>
                    <CardDescription>
                      Complete all required items before submitting to Google Play Console
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {renderChecklist(androidChecklist, "android")}
                    
                    <Separator className="my-6" />
                    
                    <div className="space-y-3">
                      <h3 className="font-semibold">Quick Links</h3>
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" className="justify-start" asChild>
                          <a href="https://play.google.com/console" target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Google Play Console
                          </a>
                        </Button>
                        <Button variant="outline" className="justify-start" asChild>
                          <a href="https://developer.android.com/distribute/best-practices/launch" target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Launch Checklist
                          </a>
                        </Button>
                        <Button variant="outline" className="justify-start" asChild>
                          <a href="/app-icons/README.md" target="_blank">
                            <FileText className="h-4 w-4 mr-2" />
                            App Icon Generation Guide
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Important Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>📱 <strong>Test Account:</strong> Reviewer credentials are at <code>scripts/create-reviewer-account.sql</code></p>
            <p>🎨 <strong>Screenshots:</strong> Capture guide at <code>public/app-store-screenshots/README.md</code></p>
            <p>✍️ <strong>App Store Copy:</strong> Optimized descriptions at <code>docs/APP_STORE_COPY.md</code></p>
            <p>💳 <strong>Payments:</strong> Ensure Stripe test mode is enabled for reviewer testing</p>
            <p>🔒 <strong>Privacy Policy:</strong> Must be accessible at <code>https://smartygym.com/privacy-policy</code></p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AppSubmission;
