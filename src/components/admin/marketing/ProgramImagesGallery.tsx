import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { INSTAGRAM_SIZES, InstagramSize } from "@/utils/instagramExporter";
import { saveAs } from "file-saver";

interface Program {
  id: string;
  name: string;
  category: string;
  image_url: string | null;
}

const downloadImageAsInstagramSize = async (
  imageUrl: string,
  filename: string,
  size: InstagramSize
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size.width;
      canvas.height = size.height;
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }
      
      // Fill with dark background
      ctx.fillStyle = "hsl(224, 71%, 4%)";
      ctx.fillRect(0, 0, size.width, size.height);
      
      // Calculate scaling to cover the entire canvas
      const scale = Math.max(size.width / img.width, size.height / img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const x = (size.width - scaledWidth) / 2;
      const y = (size.height - scaledHeight) / 2;
      
      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            saveAs(blob, `${filename}-${size.name}-${Date.now()}.jpg`);
            resolve();
          } else {
            reject(new Error("Failed to create blob"));
          }
        },
        "image/jpeg",
        0.95
      );
    };
    
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = imageUrl;
  });
};

export const ProgramImagesGallery = () => {
  const [selectedSizes, setSelectedSizes] = useState<Record<string, InstagramSize>>({});

  const { data: programs, isLoading } = useQuery({
    queryKey: ["admin-program-images"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_training_programs")
        .select("id, name, category, image_url")
        .not("image_url", "is", null)
        .order("name");
      
      if (error) throw error;
      return (data || []) as Program[];
    },
  });

  const handleDownload = async (program: Program) => {
    if (!program.image_url) return;
    
    const size = selectedSizes[program.id] || INSTAGRAM_SIZES[0];
    try {
      await downloadImageAsInstagramSize(
        program.image_url,
        program.name.replace(/\s+/g, "-").toLowerCase(),
        size
      );
      toast.success(`Downloaded ${program.name}`);
    } catch (error) {
      toast.error("Failed to download image");
      console.error(error);
    }
  };

  const handleDownloadAll = async () => {
    if (!programs) return;
    
    const programsWithImages = programs.filter(p => p.image_url);
    toast.loading(`Downloading ${programsWithImages.length} images...`, { id: "download-all" });
    
    let successCount = 0;
    for (const program of programsWithImages) {
      try {
        await handleDownload(program);
        successCount++;
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.error(`Failed to download ${program.name}:`, error);
      }
    }
    
    toast.success(`Downloaded ${successCount}/${programsWithImages.length} images!`, { id: "download-all" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const programsWithImages = programs?.filter(p => p.image_url) || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {programsWithImages.length} program images available
        </p>
        <Button onClick={handleDownloadAll} variant="default" className="gap-2">
          <Download className="w-4 h-4" />
          Download All
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {programsWithImages.map((program) => (
          <Card key={program.id} className="overflow-hidden">
            <div className="h-40 bg-muted relative">
              <img
                src={program.image_url!}
                alt={program.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <CardContent className="p-2 space-y-2">
              <div>
                <h4 className="text-xs font-medium truncate" title={program.name}>
                  {program.name}
                </h4>
                <p className="text-xs text-muted-foreground truncate">
                  {program.category}
                </p>
              </div>
              <div className="flex gap-1">
                <Select
                  value={selectedSizes[program.id]?.name || "square"}
                  onValueChange={(value) => {
                    const size = INSTAGRAM_SIZES.find(s => s.name === value);
                    if (size) {
                      setSelectedSizes(prev => ({ ...prev, [program.id]: size }));
                    }
                  }}
                >
                  <SelectTrigger className="h-7 text-xs flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INSTAGRAM_SIZES.map((size) => (
                      <SelectItem key={size.name} value={size.name} className="text-xs">
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2"
                  onClick={() => handleDownload(program)}
                >
                  <Download className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {programsWithImages.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No program images found
        </div>
      )}
    </div>
  );
};
