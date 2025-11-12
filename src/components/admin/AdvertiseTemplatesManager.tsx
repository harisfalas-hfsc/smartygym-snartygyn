import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Loader2, RefreshCw, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AdTemplate {
  id: string;
  platform: "Instagram" | "TikTok" | "Facebook";
  type: "Launch" | "Personal Training";
  imageUrl: string | null;
  generating: boolean;
  aspectRatio: string;
  prompt: string;
}

const AD_TEMPLATES: Omit<AdTemplate, "imageUrl" | "generating">[] = [
  {
    id: "instagram-launch",
    platform: "Instagram",
    type: "Launch",
    aspectRatio: "1:1 (1080x1080)",
    prompt: "Create a vibrant, motivating fitness advertisement for Instagram showing an athletic couple working out together in front of a laptop or mobile device. The scene should be bright, light, and energizing with modern gym equipment visible. Include text overlay: 'SMARTY GYM - Coming Soon!' and key points: '✓ Expert-Designed Workouts ✓ Training Programs ✓ Professional Tools ✓ 100% Human Expertise'. Use bright colors like gold, white, and energetic blues. Modern, clean design with inspiring atmosphere. Make it look professional and premium.",
  },
  {
    id: "instagram-pt",
    platform: "Instagram",
    type: "Personal Training",
    aspectRatio: "1:1 (1080x1080)",
    prompt: "Design a professional Instagram advertisement for personal training services. Show a confident fitness trainer coaching a client, both looking motivated and engaged. Bright, premium atmosphere with modern gym setting. Include text: 'PERSONAL TRAINING - Your Journey Starts Here' and benefits: '✓ Custom Programs ✓ Expert Guidance ✓ Achieve Your Goals'. Use gold accents and clean typography. Professional, inspiring, and approachable design with visible workout space. 60% image, 40% text content.",
  },
  {
    id: "tiktok-launch",
    platform: "TikTok",
    type: "Launch",
    aspectRatio: "9:16 (1080x1920)",
    prompt: "Create a dynamic vertical TikTok advertisement showing an energetic young couple working out with phones/tablets in a bright, modern setting. Eye-catching and trendy design. Bold text: 'SMARTY GYM IS COMING!' with quick highlights: '🔥 Real Workouts 🔥 Pro Programs 🔥 Expert Tools 🔥 No AI, Pure Human'. Use trending colors - vibrant gold, electric blue, bright whites. High-energy, youthful vibe with movement. Make it scroll-stopping and shareable.",
  },
  {
    id: "tiktok-pt",
    platform: "TikTok",
    type: "Personal Training",
    aspectRatio: "9:16 (1080x1920)",
    prompt: "Design a vertical TikTok advertisement for personal training with a trainer actively coaching someone during a workout. Dynamic, energetic atmosphere with modern equipment visible. Text overlay: 'UNLOCK YOUR POTENTIAL - Personal Training Available' and quick points: '💪 1-on-1 Expert Coaching 💪 Custom Plans 💪 Real Results'. Bright, trendy colors with gold highlights. 70% action shot, 30% text. Make it feel authentic and achievable.",
  },
  {
    id: "facebook-launch",
    platform: "Facebook",
    type: "Launch",
    aspectRatio: "1.91:1 (1200x628)",
    prompt: "Create a professional Facebook cover-style advertisement showing a diverse couple exercising with digital devices (laptop/tablet) in a bright, welcoming fitness space. Clean, trustworthy design. Prominent text: 'Introducing SMARTY GYM - Your Complete Fitness Platform' with benefits listed: '✓ Professional Workout Programs ✓ Training Plans by Experts ✓ Advanced Fitness Tools ✓ Human-Designed, Not AI'. Use professional color scheme with gold accents, clean white backgrounds. Balanced composition with 50% image, 50% information.",
  },
  {
    id: "facebook-pt",
    platform: "Facebook",
    type: "Personal Training",
    aspectRatio: "1.91:1 (1200x628)",
    prompt: "Design a professional Facebook advertisement for personal training services. Show a trainer and client working together in a bright, modern gym environment with visible equipment. Text: 'Transform With Expert Personal Training' and detailed benefits: '✓ Personalized Workout Plans ✓ Professional 1-on-1 Coaching ✓ Achieve Your Fitness Goals ✓ Expert Human Trainers'. Professional, trustworthy design with gold and blue accents. Balanced layout with 55% imagery, 45% content. Make it look credible and results-focused.",
  },
];

export const AdvertiseTemplatesManager = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<AdTemplate[]>(
    AD_TEMPLATES.map((t) => ({ ...t, imageUrl: null, generating: false }))
  );

  const generateImage = async (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    setTemplates((prev) =>
      prev.map((t) => (t.id === templateId ? { ...t, generating: true } : t))
    );

    try {
      const { data, error } = await supabase.functions.invoke("generate-ad-image", {
        body: {
          prompt: template.prompt,
          aspectRatio: template.aspectRatio,
        },
      });

      if (error) throw error;

      setTemplates((prev) =>
        prev.map((t) =>
          t.id === templateId
            ? { ...t, imageUrl: data.imageUrl, generating: false }
            : t
        )
      );

      toast({
        title: "Success",
        description: "Advertisement image generated successfully",
      });
    } catch (error: any) {
      console.error("Error generating image:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate image",
        variant: "destructive",
      });
      setTemplates((prev) =>
        prev.map((t) => (t.id === templateId ? { ...t, generating: false } : t))
      );
    }
  };

  const downloadImage = async (imageUrl: string, filename: string) => {
    try {
      // Convert base64 to blob
      const base64Response = await fetch(imageUrl);
      const blob = await base64Response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${filename}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Image downloaded successfully",
      });
    } catch (error) {
      console.error("Error downloading image:", error);
      toast({
        title: "Error",
        description: "Failed to download image",
        variant: "destructive",
      });
    }
  };

  const generateAllImages = async () => {
    for (const template of templates) {
      if (!template.imageUrl) {
        await generateImage(template.id);
        // Add small delay between generations to avoid rate limits
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Advertise Templates
            </CardTitle>
            <CardDescription>
              AI-generated advertisement templates for Instagram, TikTok, and Facebook
            </CardDescription>
          </div>
          <Button onClick={generateAllImages} variant="outline" className="shrink-0">
            <RefreshCw className="h-4 w-4 mr-2" />
            Generate All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className="border rounded-lg overflow-hidden bg-card hover:shadow-lg transition-shadow"
            >
              <div className="aspect-square bg-muted flex items-center justify-center relative">
                {template.generating ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Generating...</p>
                  </div>
                ) : template.imageUrl ? (
                  <img
                    src={template.imageUrl}
                    alt={`${template.platform} ${template.type} Ad`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4">
                    <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No image generated</p>
                  </div>
                )}
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-lg">{template.platform}</h3>
                  <p className="text-sm text-muted-foreground">{template.type}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {template.aspectRatio}
                  </p>
                </div>

                <div className="flex gap-2">
                  {!template.imageUrl && !template.generating && (
                    <Button
                      onClick={() => generateImage(template.id)}
                      className="flex-1"
                      size="sm"
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Generate
                    </Button>
                  )}

                  {template.imageUrl && (
                    <>
                      <Button
                        onClick={() => generateImage(template.id)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Regenerate
                      </Button>
                      <Button
                        onClick={() =>
                          downloadImage(
                            template.imageUrl!,
                            `smarty-gym-${template.platform.toLowerCase()}-${template.type.toLowerCase().replace(" ", "-")}`
                          )
                        }
                        variant="default"
                        size="sm"
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
