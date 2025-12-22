import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, Download, FileText, Copy, ExternalLink, FileType } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PackageData {
  packageUrl: string;
  fileName: string;
  fileType: string;
  content: {
    appName: string;
    subtitle: string;
    shortDescription: string;
    keywords: string;
    fullDescription: string;
    whatsNew: string;
    promotionalText: string;
    supportUrl: string;
    marketingUrl: string;
    privacyPolicyUrl: string;
    termsOfServiceUrl: string;
    supportEmail: string;
    category: string;
    contentRating: string;
  };
  assetStatus: {
    hasIcons: boolean;
    hasFeatureGraphic: boolean;
    hasScreenshots: boolean;
  };
}

export const AppyPiePackage = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [packageData, setPackageData] = useState<PackageData | null>(null);

  const generatePackage = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-app-store-package");
      
      if (error) throw error;
      
      if (data.success) {
        setPackageData(data);
        toast.success("Appy Pie package generated!", {
          description: "Download the Word document with all your app store content."
        });
      } else {
        throw new Error(data.error || "Failed to generate package");
      }
    } catch (error) {
      console.error("Error generating package:", error);
      toast.error("Failed to generate package", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const downloadPackage = () => {
    if (packageData?.packageUrl) {
      const a = document.createElement("a");
      a.href = packageData.packageUrl;
      a.download = packageData.fileName;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Downloading Word document...");
    }
  };

  return (
    <Card className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-orange-500" />
          Download Package for Appy Pie
        </CardTitle>
        <CardDescription>
          Generate a complete Word document with all text content, links, and asset URLs ready for Appy Pie submission.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={generatePackage}
          disabled={isGenerating}
          size="lg"
          className="w-full gap-2 bg-orange-500 hover:bg-orange-600"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Generating Package...
            </>
          ) : (
            <>
              <Package className="h-5 w-5" />
              Generate Appy Pie Package
            </>
          )}
        </Button>

        {packageData && (
          <div className="space-y-4 pt-4">
            {/* Asset Status */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <h4 className="font-semibold text-sm">Asset Status</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant={packageData.assetStatus.hasIcons ? "default" : "destructive"}>
                  {packageData.assetStatus.hasIcons ? "✓" : "✗"} Icons
                </Badge>
                <Badge variant={packageData.assetStatus.hasFeatureGraphic ? "default" : "destructive"}>
                  {packageData.assetStatus.hasFeatureGraphic ? "✓" : "✗"} Feature Graphic
                </Badge>
                <Badge variant="secondary">
                  ℹ️ Screenshots (manual)
                </Badge>
              </div>
              {(!packageData.assetStatus.hasIcons || !packageData.assetStatus.hasFeatureGraphic) && (
                <p className="text-xs text-amber-600 mt-2">
                  ⚠️ Generate missing assets using the AI Asset Generator above before submitting.
                </p>
              )}
            </div>

            {/* Download Button */}
            <Button
              onClick={downloadPackage}
              variant="outline"
              className="w-full gap-2"
            >
              <FileType className="h-4 w-4" />
              Download Word Document (.doc)
            </Button>

            {/* Quick Copy Section */}
            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Quick Copy - Essential Fields
              </h4>
              
              <div className="grid gap-2">
                {[
                  { label: "App Name", value: packageData.content.appName },
                  { label: "Subtitle (iOS)", value: packageData.content.subtitle },
                  { label: "Short Description (Android)", value: packageData.content.shortDescription },
                  { label: "Keywords", value: packageData.content.keywords },
                  { label: "Privacy Policy URL", value: packageData.content.privacyPolicyUrl },
                  { label: "Support Email", value: packageData.content.supportEmail },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between p-2 bg-background border rounded-lg text-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-muted-foreground">{item.label}:</span>
                      <span className="ml-2 font-medium truncate">{item.value}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(item.value, item.label)}
                      className="ml-2 shrink-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Full Description Copy */}
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(packageData.content.fullDescription, "Full Description")}
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy Full Description
                </Button>
              </div>
            </div>

            {/* Important Links */}
            <div className="space-y-2 pt-4 border-t">
              <h4 className="font-semibold text-sm">Important Links</h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(packageData.content.privacyPolicyUrl, "_blank")}
                  className="gap-2"
                >
                  <ExternalLink className="h-3 w-3" />
                  Privacy Policy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(packageData.content.termsOfServiceUrl, "_blank")}
                  className="gap-2"
                >
                  <ExternalLink className="h-3 w-3" />
                  Terms of Service
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open("https://appicon.co/", "_blank")}
                  className="gap-2"
                >
                  <ExternalLink className="h-3 w-3" />
                  appicon.co (resize icons)
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
