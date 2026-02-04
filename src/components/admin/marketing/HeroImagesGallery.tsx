import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { INSTAGRAM_SIZES, InstagramSize } from "@/utils/instagramExporter";
import { saveAs } from "file-saver";

// Import hero images
import heroGymGroup from "@/assets/hero-gym-group.jpg";
import heroHomeCouple from "@/assets/hero-home-couple.jpg";
import heroParkCouple from "@/assets/hero-park-couple.jpg";
import heroWodImage from "@/assets/hero-wod.jpg";
import heroWorkoutsImage from "@/assets/hero-workouts.jpg";
import heroBlogImage from "@/assets/hero-blog.jpg";

interface HeroImage {
  id: string;
  name: string;
  url: string;
  description: string;
}

const heroImages: HeroImage[] = [
  { id: "gym-group", name: "Gym Group", url: heroGymGroup, description: "Group training in gym" },
  { id: "home-couple", name: "Home Couple", url: heroHomeCouple, description: "Couple training at home" },
  { id: "park-couple", name: "Park Couple", url: heroParkCouple, description: "Couple training in park" },
  { id: "wod", name: "Workout of the Day", url: heroWodImage, description: "WOD hero background" },
  { id: "workouts", name: "Workouts", url: heroWorkoutsImage, description: "Workouts hero background" },
  { id: "blog", name: "Blog", url: heroBlogImage, description: "Blog hero background" },
];

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

export const HeroImagesGallery = () => {
  const [selectedSizes, setSelectedSizes] = useState<Record<string, InstagramSize>>(
    Object.fromEntries(heroImages.map(h => [h.id, INSTAGRAM_SIZES[0]]))
  );

  const handleDownload = async (image: HeroImage) => {
    const size = selectedSizes[image.id] || INSTAGRAM_SIZES[0];
    try {
      await downloadImageAsInstagramSize(
        image.url,
        `hero-${image.id}`,
        size
      );
      toast.success(`Downloaded ${image.name}`);
    } catch (error) {
      toast.error("Failed to download image");
      console.error(error);
    }
  };

  const handleDownloadAll = async () => {
    toast.loading(`Downloading ${heroImages.length} images...`, { id: "download-all" });
    
    let successCount = 0;
    for (const image of heroImages) {
      try {
        await handleDownload(image);
        successCount++;
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.error(`Failed to download ${image.name}:`, error);
      }
    }
    
    toast.success(`Downloaded ${successCount}/${heroImages.length} images!`, { id: "download-all" });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {heroImages.length} hero images available
        </p>
        <Button onClick={handleDownloadAll} variant="default" className="gap-2">
          <Download className="w-4 h-4" />
          Download All
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {heroImages.map((image) => (
          <Card key={image.id} className="overflow-hidden">
            <div className="h-40 bg-muted relative">
              <img
                src={image.url}
                alt={image.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <CardContent className="p-2 space-y-2">
              <div>
                <h4 className="text-xs font-medium truncate" title={image.name}>
                  {image.name}
                </h4>
                <p className="text-xs text-muted-foreground truncate">
                  {image.description}
                </p>
              </div>
              <div className="flex gap-1">
                <Select
                  value={selectedSizes[image.id]?.name || "square"}
                  onValueChange={(value) => {
                    const size = INSTAGRAM_SIZES.find(s => s.name === value);
                    if (size) {
                      setSelectedSizes(prev => ({ ...prev, [image.id]: size }));
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
                  onClick={() => handleDownload(image)}
                >
                  <Download className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
