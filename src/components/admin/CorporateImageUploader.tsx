import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, Check, AlertCircle } from "lucide-react";

// Import the generated icons
import dynamicIcon from "@/assets/corporate-dynamic-icon.png";
import powerIcon from "@/assets/corporate-power-icon.png";
import eliteIcon from "@/assets/corporate-elite-icon.png";
import enterpriseIcon from "@/assets/corporate-enterprise-icon.png";

interface UploadResult {
  plan: string;
  success: boolean;
  error?: string;
}

export function CorporateImageUploader() {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<UploadResult[]>([]);

  const icons = {
    dynamic: { src: dynamicIcon, name: "Smarty Dynamic" },
    power: { src: powerIcon, name: "Smarty Power" },
    elite: { src: eliteIcon, name: "Smarty Elite" },
    enterprise: { src: enterpriseIcon, name: "Smarty Enterprise" },
  };

  const uploadImages = async () => {
    setUploading(true);
    setResults([]);

    try {
      const imageUrls: Record<string, string> = {};

      // Upload each icon to Supabase storage
      for (const [key, icon] of Object.entries(icons)) {
        try {
          // Fetch the image as blob
          const response = await fetch(icon.src);
          const blob = await response.blob();

          // Upload to storage
          const fileName = `corporate-${key}-${Date.now()}.png`;
          const { data, error } = await supabase.storage
            .from("blog-images")
            .upload(fileName, blob, {
              contentType: "image/png",
              upsert: true,
            });

          if (error) {
            setResults(prev => [...prev, { plan: icon.name, success: false, error: error.message }]);
            continue;
          }

          // Get public URL
          const { data: urlData } = supabase.storage
            .from("blog-images")
            .getPublicUrl(fileName);

          imageUrls[key] = urlData.publicUrl;
          setResults(prev => [...prev, { plan: icon.name, success: true }]);
        } catch (err) {
          setResults(prev => [...prev, { 
            plan: icon.name, 
            success: false, 
            error: err instanceof Error ? err.message : "Upload failed" 
          }]);
        }
      }

      // Now update Stripe products with the URLs
      const { data, error } = await supabase.functions.invoke("update-corporate-product-images", {
        body: { imageUrls },
      });

      if (error) {
        toast({
          title: "Stripe Update Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Images Updated",
          description: "Corporate product images have been uploaded and linked to Stripe.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Corporate Plan Images</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(icons).map(([key, icon]) => (
            <div key={key} className="text-center">
              <img 
                src={icon.src} 
                alt={icon.name} 
                className="w-16 h-16 mx-auto rounded border"
              />
              <p className="text-xs mt-1 text-muted-foreground">{icon.name}</p>
            </div>
          ))}
        </div>

        <Button onClick={uploadImages} disabled={uploading} className="w-full">
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? "Uploading..." : "Upload to Stripe"}
        </Button>

        {results.length > 0 && (
          <div className="space-y-1">
            {results.map((result, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                {result.success ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <span>{result.plan}</span>
                {result.error && (
                  <span className="text-red-500 text-xs">({result.error})</span>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
