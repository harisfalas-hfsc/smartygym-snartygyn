import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Download, CheckCircle2, XCircle, AlertCircle, Image, Monitor, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Asset {
  id: string;
  asset_type: string;
  platform: string;
  file_name: string;
  file_path: string;
  width: number;
  height: number;
  storage_url: string | null;
  created_at: string;
}

export const AppStoreAssetGenerator = () => {
  const [isGeneratingIcons, setIsGeneratingIcons] = useState(false);
  const [isGeneratingFeatureGraphic, setIsGeneratingFeatureGraphic] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAssets = async () => {
    try {
      const { data, error } = await supabase
        .from("app_store_assets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAssets(data || []);
    } catch (error) {
      console.error("Error fetching assets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const generateAppIcons = async () => {
    setIsGeneratingIcons(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-app-icons");
      
      if (error) throw error;
      
      if (data.success) {
        toast.success("App icon generated!", {
          description: "Download the master icon and use appicon.co for all sizes."
        });
        fetchAssets();
      } else {
        throw new Error(data.error || "Failed to generate icons");
      }
    } catch (error) {
      console.error("Error generating icons:", error);
      toast.error("Failed to generate icons", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setIsGeneratingIcons(false);
    }
  };

  const generateFeatureGraphic = async () => {
    setIsGeneratingFeatureGraphic(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-feature-graphic");
      
      if (error) throw error;
      
      if (data.success) {
        toast.success("Feature graphic generated!", {
          description: "Ready for Google Play Store submission."
        });
        fetchAssets();
      } else {
        throw new Error(data.error || "Failed to generate feature graphic");
      }
    } catch (error) {
      console.error("Error generating feature graphic:", error);
      toast.error("Failed to generate feature graphic", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setIsGeneratingFeatureGraphic(false);
    }
  };

  const masterIcon = assets.find(a => a.asset_type === "icon" && a.file_name.includes("master"));
  const featureGraphic = assets.find(a => a.asset_type === "feature-graphic");

  const downloadAsset = (url: string, fileName: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success(`Downloading ${fileName}`);
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Asset Generator
        </CardTitle>
        <CardDescription>
          Generate app icons and feature graphics using AI. All assets are stored and ready for download.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-card border rounded-lg">
            <div className={`p-2 rounded-full ${masterIcon ? "bg-green-500/20" : "bg-muted"}`}>
              {masterIcon ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="font-medium">App Icon</p>
              <p className="text-xs text-muted-foreground">
                {masterIcon ? "Generated" : "Not generated"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-card border rounded-lg">
            <div className={`p-2 rounded-full ${featureGraphic ? "bg-green-500/20" : "bg-muted"}`}>
              {featureGraphic ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="font-medium">Feature Graphic</p>
              <p className="text-xs text-muted-foreground">
                {featureGraphic ? "Generated" : "Not generated"}
              </p>
            </div>
          </div>
        </div>

        {/* App Icon Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image className="h-5 w-5 text-primary" />
              <h4 className="font-semibold">App Icon (iOS + Android)</h4>
            </div>
            <Badge variant={masterIcon ? "default" : "secondary"}>
              {masterIcon ? "Ready" : "Not Generated"}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Generate a professional 1024×1024 master icon. Use appicon.co to resize it for all required iOS and Android sizes.
          </p>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={generateAppIcons}
              disabled={isGeneratingIcons}
              className="gap-2"
            >
              {isGeneratingIcons ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {masterIcon ? "Regenerate Icon" : "Generate App Icon"}
                </>
              )}
            </Button>
            
            {masterIcon?.storage_url && (
              <Button
                variant="outline"
                onClick={() => downloadAsset(masterIcon.storage_url!, masterIcon.file_name)}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download Icon
              </Button>
            )}
          </div>

          {masterIcon?.storage_url && (
            <div className="mt-3 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-start gap-4">
                <img
                  src={masterIcon.storage_url}
                  alt="App Icon"
                  className="w-20 h-20 rounded-xl shadow-md"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">Master Icon Generated</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    Download this icon and upload to{" "}
                    <a
                      href="https://appicon.co/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      appicon.co
                    </a>{" "}
                    to generate all required sizes for iOS and Android.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Feature Graphic Section */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-green-600" />
              <h4 className="font-semibold">Feature Graphic (Android Only)</h4>
            </div>
            <Badge variant={featureGraphic ? "default" : "secondary"}>
              {featureGraphic ? "Ready" : "Not Generated"}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Generate a 1024×500 promotional banner required for Google Play Store listing.
          </p>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={generateFeatureGraphic}
              disabled={isGeneratingFeatureGraphic}
              variant="outline"
              className="gap-2 border-green-600/30 hover:bg-green-600/10"
            >
              {isGeneratingFeatureGraphic ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {featureGraphic ? "Regenerate" : "Generate Feature Graphic"}
                </>
              )}
            </Button>
            
            {featureGraphic?.storage_url && (
              <Button
                variant="outline"
                onClick={() => downloadAsset(featureGraphic.storage_url!, featureGraphic.file_name)}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            )}
          </div>

          {featureGraphic?.storage_url && (
            <div className="mt-3 p-3 bg-muted/50 rounded-lg">
              <img
                src={featureGraphic.storage_url}
                alt="Feature Graphic"
                className="w-full max-w-md rounded-lg shadow-md"
              />
              <p className="text-xs text-muted-foreground mt-2">
                1024×500 Feature Graphic - Ready for Google Play Store
              </p>
            </div>
          )}
        </div>

        {/* Refresh Button */}
        <div className="pt-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchAssets}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Assets
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
