import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, FileText, Shield, HelpCircle } from "lucide-react";

interface QuickLinksProps {
  platform: 'ios' | 'android';
}

export const QuickLinks = ({ platform }: QuickLinksProps) => {
  const iosLinks = [
    {
      title: "Apple Developer Portal",
      url: "https://developer.apple.com/account/",
      description: "Manage your developer account and certificates",
      icon: Shield,
    },
    {
      title: "App Store Connect",
      url: "https://appstoreconnect.apple.com/",
      description: "Submit and manage your iOS apps",
      icon: FileText,
    },
    {
      title: "App Store Review Guidelines",
      url: "https://developer.apple.com/app-store/review/guidelines/",
      description: "Official review guidelines to ensure approval",
      icon: FileText,
    },
    {
      title: "Human Interface Guidelines",
      url: "https://developer.apple.com/design/human-interface-guidelines/",
      description: "Apple's design standards and best practices",
      icon: FileText,
    },
    {
      title: "App Icon Generator",
      url: "https://appicon.co/",
      description: "Generate all required icon sizes from one image",
      icon: ExternalLink,
    },
    {
      title: "TestFlight",
      url: "https://developer.apple.com/testflight/",
      description: "Beta testing platform for iOS apps",
      icon: HelpCircle,
    },
  ];

  const androidLinks = [
    {
      title: "Google Play Console",
      url: "https://play.google.com/console/",
      description: "Submit and manage your Android apps",
      icon: FileText,
    },
    {
      title: "Play Store Policy Center",
      url: "https://play.google.com/about/developer-content-policy/",
      description: "Content policies and guidelines",
      icon: Shield,
    },
    {
      title: "Material Design Guidelines",
      url: "https://m3.material.io/",
      description: "Google's design system for Android",
      icon: FileText,
    },
    {
      title: "Android Developer Guide",
      url: "https://developer.android.com/distribute",
      description: "Complete guide to publishing on Play Store",
      icon: FileText,
    },
    {
      title: "App Icon Generator",
      url: "https://appicon.co/",
      description: "Generate all required icon sizes from one image",
      icon: ExternalLink,
    },
    {
      title: "Play Console Help",
      url: "https://support.google.com/googleplay/android-developer/",
      description: "Official support and documentation",
      icon: HelpCircle,
    },
  ];

  const links = platform === 'ios' ? iosLinks : androidLinks;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <ExternalLink className="h-5 w-5 text-primary" />
          Quick Links & Resources
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 sm:grid-cols-2">
          {links.map((link, i) => {
            const Icon = link.icon;
            return (
              <Button
                key={i}
                variant="outline"
                className="h-auto p-3 justify-start text-left flex-col items-start gap-1"
                onClick={() => window.open(link.url, '_blank')}
              >
                <div className="flex items-center gap-2 w-full">
                  <Icon className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-medium text-sm">{link.title}</span>
                </div>
                <span className="text-xs text-muted-foreground pl-6">{link.description}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
