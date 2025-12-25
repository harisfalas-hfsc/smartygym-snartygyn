import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, CheckCircle2, XCircle, Image, Monitor, RefreshCw, Upload, Trash2, History, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Asset {
  id: string;
  asset_type: string;
  platform: string;
  file_name: string;
  file_path: string;
  width: number | null;
  height: number | null;
  storage_url: string | null;
  created_at: string;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function getImageDimensionsFromDataUrl(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error("Failed to parse image dimensions"));
    img.src = dataUrl;
  });
}

export const AppStoreAssetGenerator = () => {
  const [isGeneratingIcons, setIsGeneratingIcons] = useState(false);
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);
  const [isUploadingFeatureGraphic, setIsUploadingFeatureGraphic] = useState(false);
  const [isDeletingAsset, setIsDeletingAsset] = useState<string | null>(null);
  const [showAssetHistory, setShowAssetHistory] = useState(false);

  const [iconFile, setIconFile] = useState<File | null>(null);
  const [featureGraphicFile, setFeatureGraphicFile] = useState<File | null>(null);

  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAssets = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("app_store_assets")
        .select("*")
        .not("storage_url", "is", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAssets((data || []) as Asset[]);
    } catch (error) {
      console.error("Error fetching assets:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const uploadAsset = useCallback(
    async (params: { file: File; asset_type: string; platform: string; expected?: { w: number; h: number } }) => {
      const { file, asset_type, platform, expected } = params;

      const dataUrl = await readFileAsDataUrl(file);
      const { width, height } = await getImageDimensionsFromDataUrl(dataUrl);

      if (expected && (width !== expected.w || height !== expected.h)) {
        throw new Error(`Wrong dimensions. Got ${width}×${height}, expected ${expected.w}×${expected.h}.`);
      }

      const { data, error } = await supabase.functions.invoke("upload-app-store-asset", {
        body: {
          asset_type,
          platform,
          file_name: file.name,
          content_type: file.type || "image/png",
          data_url: dataUrl,
          width,
          height,
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Upload failed");

      return data;
    },
    []
  );

  const generateAppIcons = async () => {
    setIsGeneratingIcons(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-app-icons");

      if (error) throw error;

      if (data.success) {
        toast.success("Logo uploaded as app icon", {
          description: "Download it or upload your own icon below.",
        });
        setTimeout(() => fetchAssets(), 1000);
      } else {
        throw new Error(data.error || "Failed to generate icons");
      }
    } catch (error) {
      console.error("Error generating icons:", error);
      toast.error("Failed to upload logo icon", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsGeneratingIcons(false);
    }
  };

  const uploadIcon = async () => {
    if (!iconFile) {
      toast.error("Please select an icon file first");
      return;
    }

    setIsUploadingIcon(true);
    try {
      await uploadAsset({
        file: iconFile,
        asset_type: "master-icon",
        platform: "all",
        expected: { w: 1024, h: 1024 },
      });

      toast.success("App icon uploaded", {
        description: "Your exact file is now stored and ready to download.",
      });

      setIconFile(null);
      setTimeout(() => fetchAssets(), 750);
    } catch (error) {
      console.error("Error uploading icon:", error);
      toast.error("Icon upload failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsUploadingIcon(false);
    }
  };

  const uploadFeatureGraphic = async () => {
    if (!featureGraphicFile) {
      toast.error("Please select a feature graphic file first");
      return;
    }

    setIsUploadingFeatureGraphic(true);
    try {
      await uploadAsset({
        file: featureGraphicFile,
        asset_type: "feature-graphic",
        platform: "android",
        expected: { w: 1024, h: 500 },
      });

      toast.success("Feature graphic uploaded", {
        description: "Your exact file is now stored and ready to download.",
      });

      setFeatureGraphicFile(null);
      setTimeout(() => fetchAssets(), 750);
    } catch (error) {
      console.error("Error uploading feature graphic:", error);
      toast.error("Feature graphic upload failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsUploadingFeatureGraphic(false);
    }
  };

  // Latest assets
  const masterIcon = assets.find((a) => a.asset_type === "master-icon" && a.storage_url);
  const featureGraphic = assets.find((a) => a.asset_type === "feature-graphic" && a.storage_url);
  
  // Asset history (all assets of each type)
  const allIcons = assets.filter((a) => a.asset_type === "master-icon" && a.storage_url);
  const allFeatureGraphics = assets.filter((a) => a.asset_type === "feature-graphic" && a.storage_url);

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

  const deleteAsset = async (assetId: string) => {
    setIsDeletingAsset(assetId);
    try {
      const { data, error } = await supabase.functions.invoke("delete-app-store-asset", {
        body: { asset_id: assetId },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Delete failed");

      toast.success("Asset deleted", {
        description: "The asset has been permanently removed.",
      });
      
      // Refresh assets list
      await fetchAssets();
    } catch (error) {
      console.error("Error deleting asset:", error);
      toast.error("Delete failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsDeletingAsset(null);
    }
  };

  const deleteAllOfType = async (assetType: string) => {
    setIsDeletingAsset(assetType);
    try {
      const { data, error } = await supabase.functions.invoke("delete-app-store-asset", {
        body: { asset_type: assetType, delete_all_of_type: true },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Delete failed");

      toast.success(`All ${assetType === 'feature-graphic' ? 'feature graphics' : 'icons'} deleted`, {
        description: `Removed ${data.deleted_count} asset(s).`,
      });
      
      await fetchAssets();
    } catch (error) {
      console.error("Error deleting assets:", error);
      toast.error("Delete failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsDeletingAsset(null);
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5 text-primary" />
          App Store Assets
        </CardTitle>
        <CardDescription>
          Upload your exact brand files (no AI). Icons and feature graphics are stored and ready for download.
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
              <p className="text-xs text-muted-foreground">{masterIcon ? "Ready" : "Not uploaded"}</p>
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
              <p className="text-xs text-muted-foreground">{featureGraphic ? "Ready" : "Not uploaded"}</p>
            </div>
          </div>
        </div>

        {/* App Icon */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image className="h-5 w-5 text-primary" />
              <h4 className="font-semibold">App Icon (1024×1024 PNG)</h4>
            </div>
            <Badge variant={masterIcon ? "default" : "secondary"}>{masterIcon ? "Ready" : "Missing"}</Badge>
          </div>

          <p className="text-sm text-muted-foreground">
            Upload your exact icon file (recommended). If you want, you can still use the "Upload Website Logo" button to store
            the current logo from your website.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={generateAppIcons} disabled={isGeneratingIcons} className="gap-2">
              {isGeneratingIcons ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload Website Logo
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

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="file"
              accept="image/png"
              onChange={(e) => setIconFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm file:mr-3 file:rounded-md file:border file:bg-background file:px-3 file:py-2 file:text-foreground"
            />
            <Button onClick={uploadIcon} disabled={!iconFile || isUploadingIcon} className="gap-2">
              {isUploadingIcon ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload 1024×1024
                </>
              )}
            </Button>
          </div>

          {masterIcon?.storage_url && (
            <div className="mt-3 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-start gap-4">
                <img
                  src={`${masterIcon.storage_url}?t=${Date.now()}`}
                  alt="SmartyGym app icon (master icon 1024×1024)"
                  className="w-20 h-20 rounded-xl shadow-md"
                  loading="lazy"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">Stored App Icon</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    For store submission, resize using{" "}
                    <a
                      href="https://appicon.co/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      appicon.co
                    </a>
                    .
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="gap-1"
                        disabled={isDeletingAsset === masterIcon.id}
                      >
                        {isDeletingAsset === masterIcon.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                        Remove
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete App Icon?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this app icon from storage. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteAsset(masterIcon.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Feature Graphic */}
        <section className="space-y-3 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-primary" />
              <h4 className="font-semibold">Feature Graphic (1024×500 PNG)</h4>
            </div>
            <Badge variant={featureGraphic ? "default" : "secondary"}>{featureGraphic ? "Ready" : "Missing"}</Badge>
          </div>

          <p className="text-sm text-muted-foreground">
            Upload your exact 1024×500 feature graphic (required for Google Play listing). AI generation is disabled.
          </p>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="file"
              accept="image/png"
              onChange={(e) => setFeatureGraphicFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm file:mr-3 file:rounded-md file:border file:bg-background file:px-3 file:py-2 file:text-foreground"
            />
            <Button onClick={uploadFeatureGraphic} disabled={!featureGraphicFile || isUploadingFeatureGraphic} className="gap-2">
              {isUploadingFeatureGraphic ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload 1024×500
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
              <div className="flex items-start gap-4">
                <img
                  src={`${featureGraphic.storage_url}?t=${Date.now()}`}
                  alt="SmartyGym feature graphic (1024×500)"
                  className="w-full max-w-xs rounded-lg shadow-md"
                  loading="lazy"
                />
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-muted-foreground">1024×500 Feature Graphic - Stored</p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="gap-1"
                        disabled={isDeletingAsset === featureGraphic.id}
                      >
                        {isDeletingAsset === featureGraphic.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                        Remove
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Feature Graphic?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this feature graphic from storage. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteAsset(featureGraphic.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Asset History */}
        {(allIcons.length > 1 || allFeatureGraphics.length > 1) && (
          <section className="pt-4 border-t space-y-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAssetHistory(!showAssetHistory)}
              className="gap-2"
            >
              <History className="h-4 w-4" />
              {showAssetHistory ? "Hide" : "Show"} Asset History ({allIcons.length + allFeatureGraphics.length} total)
            </Button>

            {showAssetHistory && (
              <div className="space-y-4">
                {/* Icon History */}
                {allIcons.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-medium">App Icons ({allIcons.length})</h5>
                      {allIcons.length > 1 && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive gap-1">
                              <Trash2 className="h-3 w-3" />
                              Clear All
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete All App Icons?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete all {allIcons.length} app icons. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteAllOfType("master-icon")}>
                                Delete All
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                    <div className="grid gap-2">
                      {allIcons.map((icon) => (
                        <div key={icon.id} className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm">
                          <div className="flex items-center gap-2">
                            <img
                              src={`${icon.storage_url}?t=${Date.now()}`}
                              alt={icon.file_name}
                              className="w-8 h-8 rounded"
                            />
                            <span className="truncate max-w-[150px]">{icon.file_name}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(icon.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteAsset(icon.id)}
                            disabled={isDeletingAsset === icon.id}
                            className="text-destructive"
                          >
                            {isDeletingAsset === icon.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Feature Graphic History */}
                {allFeatureGraphics.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-medium">Feature Graphics ({allFeatureGraphics.length})</h5>
                      {allFeatureGraphics.length > 1 && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive gap-1">
                              <Trash2 className="h-3 w-3" />
                              Clear All
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete All Feature Graphics?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete all {allFeatureGraphics.length} feature graphics. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteAllOfType("feature-graphic")}>
                                Delete All
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                    <div className="grid gap-2">
                      {allFeatureGraphics.map((fg) => (
                        <div key={fg.id} className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm">
                          <div className="flex items-center gap-2">
                            <img
                              src={`${fg.storage_url}?t=${Date.now()}`}
                              alt={fg.file_name}
                              className="w-12 h-6 rounded object-cover"
                            />
                            <span className="truncate max-w-[150px]">{fg.file_name}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(fg.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteAsset(fg.id)}
                            disabled={isDeletingAsset === fg.id}
                            className="text-destructive"
                          >
                            {isDeletingAsset === fg.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* Refresh */}
        <div className="pt-4 border-t">
          <Button variant="ghost" size="sm" onClick={fetchAssets} disabled={isLoading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh Assets
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
