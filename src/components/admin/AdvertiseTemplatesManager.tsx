import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Loader2, RefreshCw, Image as ImageIcon, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AdComposer } from "@/utils/adComposer";
import { getRandomWorkoutImage, WORKOUT_IMAGES } from "@/utils/brandingService";

interface AdTemplate {
  id: string;
  platform: "Instagram" | "TikTok" | "Facebook";
  imageUrl: string | null;
  generating: boolean;
  aspectRatio: string;
}

interface AdPurpose {
  value: string;
  label: string;
  description: string;
  promptTemplate: (details: string, platform: string) => string;
}

const AD_PURPOSES: AdPurpose[] = [
  {
    value: "new_workout",
    label: "New Workout Release",
    description: "Announce a new workout program",
    promptTemplate: (details, platform) => {
      const aspectRatios = {
        Instagram: "1:1 (1080x1080)",
        TikTok: "9:16 (1080x1920)",
        Facebook: "1.91:1 (1200x628)",
      };
      return `Create a dynamic, energetic ${platform} advertisement for a new workout: "${details}". Show an athletic person performing an exercise in a bright, modern gym setting. Include bold text: "NEW WORKOUT AVAILABLE - ${details}" with highlights: "🔥 Expert Designed 🔥 Proven Results 🔥 Start Today". Use vibrant gold and blue colors with high energy. Aspect ratio: ${aspectRatios[platform as keyof typeof aspectRatios]}. Make it eye-catching and motivating with 60% action imagery, 40% text content.`;
    },
  },
  {
    value: "new_program",
    label: "New Training Program",
    description: "Promote a new training program",
    promptTemplate: (details, platform) => {
      const aspectRatios = {
        Instagram: "1:1 (1080x1080)",
        TikTok: "9:16 (1080x1920)",
        Facebook: "1.91:1 (1200x628)",
      };
      return `Design a professional ${platform} advertisement for a new training program: "${details}". Feature determined athletes working out together in a premium gym environment. Text overlay: "NEW PROGRAM LAUNCH - ${details}" with benefits: "✓ Structured Plan ✓ Progressive Results ✓ Expert Coaching". Use premium gold accents with clean, motivating design. Aspect ratio: ${aspectRatios[platform as keyof typeof aspectRatios]}. Professional and inspiring with balanced 55% imagery, 45% content layout.`;
    },
  },
  {
    value: "awareness",
    label: "Brand Awareness",
    description: "Build brand awareness and reach",
    promptTemplate: (details, platform) => {
      const aspectRatios = {
        Instagram: "1:1 (1080x1080)",
        TikTok: "9:16 (1080x1920)",
        Facebook: "1.91:1 (1200x628)",
      };
      return `Create a bright, inspiring ${platform} brand awareness advertisement for Smarty Gym. Show diverse people achieving fitness success with digital devices in a modern, welcoming environment. Bold text: "SMARTY GYM - ${details}" with key points: "💪 Expert Workouts 💪 Training Programs 💪 Professional Tools 💪 100% Human Expertise". Use vibrant colors, gold accents, clean design. Aspect ratio: ${aspectRatios[platform as keyof typeof aspectRatios]}. Friendly, approachable, and premium feel with 50% lifestyle imagery, 50% brand messaging.`;
    },
  },
  {
    value: "special_offer",
    label: "Special Offer/Promotion",
    description: "Advertise limited-time offers",
    promptTemplate: (details, platform) => {
      const aspectRatios = {
        Instagram: "1:1 (1080x1080)",
        TikTok: "9:16 (1080x1920)",
        Facebook: "1.91:1 (1200x628)",
      };
      return `Design an exciting ${platform} promotional advertisement for: "${details}". Show energetic people celebrating fitness achievements with bright, attention-grabbing visuals. Bold text: "LIMITED TIME OFFER - ${details}" with urgency: "⚡ Act Now ⚡ Limited Spots ⚡ Don't Miss Out". Use bold gold, electric blue, and bright white colors. Aspect ratio: ${aspectRatios[platform as keyof typeof aspectRatios]}. High-energy, urgent, and compelling with prominent call-to-action. 40% imagery, 60% offer details.`;
    },
  },
  {
    value: "personal_training",
    label: "Personal Training Service",
    description: "Promote personal training services",
    promptTemplate: (details, platform) => {
      const aspectRatios = {
        Instagram: "1:1 (1080x1080)",
        TikTok: "9:16 (1080x1920)",
        Facebook: "1.91:1 (1200x628)",
      };
      return `Create a professional ${platform} advertisement for personal training. Show a confident trainer actively coaching a client with visible engagement and motivation. Text: "PERSONAL TRAINING - ${details}" with benefits: "✓ Custom Programs ✓ 1-on-1 Expert Coaching ✓ Achieve Your Goals ✓ Professional Guidance". Premium design with gold accents and trustworthy feel. Aspect ratio: ${aspectRatios[platform as keyof typeof aspectRatios]}. Professional, approachable, results-focused with 65% coaching action, 35% service details.`;
    },
  },
];

const PLATFORMS = ["Instagram", "TikTok", "Facebook"] as const;

export const AdvertiseTemplatesManager = () => {
  const { toast } = useToast();
  const [selectedPurpose, setSelectedPurpose] = useState<string>("");
  const [customDetails, setCustomDetails] = useState<string>("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [selectedBackground, setSelectedBackground] = useState<string>("");
  const [generatedAds, setGeneratedAds] = useState<AdTemplate[]>([]);

  const generateAdsForPlatform = async () => {
    if (!selectedPurpose || !customDetails.trim() || !selectedPlatform) {
      toast({
        title: "Missing Information",
        description: "Please select ad purpose, enter details, and choose a platform",
        variant: "destructive",
      });
      return;
    }

    const platform = selectedPlatform as "Instagram" | "TikTok" | "Facebook";
    const aspectRatios = {
      Instagram: "1:1 (1080x1080)",
      TikTok: "9:16 (1080x1920)",
      Facebook: "1.91:1 (1200x628)",
    };

    const newAd: AdTemplate = {
      id: `${platform.toLowerCase()}-${Date.now()}`,
      platform,
      aspectRatio: aspectRatios[platform],
      imageUrl: null,
      generating: true,
    };

    setGeneratedAds((prev) => [newAd, ...prev]);

    try {
      // Use actual Smarty Gym branding and images
      const composer = new AdComposer();
      const backgroundImage = selectedBackground || getRandomWorkoutImage();
      
      const imageUrl = await composer.composeAd({
        platform,
        purpose: selectedPurpose,
        details: customDetails,
        backgroundImage,
      });

      setGeneratedAds((prev) =>
        prev.map((ad) =>
          ad.id === newAd.id
            ? { ...ad, imageUrl, generating: false }
            : ad
        )
      );

      toast({
        title: "Success",
        description: `${platform} advertisement created with your branding`,
      });
    } catch (error: any) {
      console.error("Error generating image:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate image",
        variant: "destructive",
      });
      setGeneratedAds((prev) =>
        prev.map((ad) =>
          ad.id === newAd.id ? { ...ad, generating: false } : ad
        )
      );
    }
  };

  const regenerateAd = async (adId: string) => {
    const ad = generatedAds.find((a) => a.id === adId);
    if (!ad || !selectedPurpose || !customDetails.trim()) return;

    setGeneratedAds((prev) =>
      prev.map((a) => (a.id === adId ? { ...a, generating: true } : a))
    );

    try {
      const composer = new AdComposer();
      const backgroundImage = selectedBackground || getRandomWorkoutImage();
      
      const imageUrl = await composer.composeAd({
        platform: ad.platform,
        purpose: selectedPurpose,
        details: customDetails,
        backgroundImage,
      });

      setGeneratedAds((prev) =>
        prev.map((a) =>
          a.id === adId
            ? { ...a, imageUrl, generating: false }
            : a
        )
      );

      toast({
        title: "Success",
        description: "Advertisement regenerated with your branding",
      });
    } catch (error: any) {
      console.error("Error regenerating image:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to regenerate image",
        variant: "destructive",
      });
      setGeneratedAds((prev) =>
        prev.map((a) => (a.id === adId ? { ...a, generating: false } : a))
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

  const deleteAd = (adId: string) => {
    setGeneratedAds((prev) => prev.filter((ad) => ad.id !== adId));
    toast({
      title: "Deleted",
      description: "Advertisement removed",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Advertise Templates
        </CardTitle>
        <CardDescription>
          Create branded advertisements using your actual Smarty Gym images, logo, and tagline
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Ad Generator Form */}
        <div className="border rounded-lg p-6 bg-muted/50 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Generate New Advertisement</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purpose">Ad Purpose *</Label>
              <Select value={selectedPurpose} onValueChange={setSelectedPurpose}>
                <SelectTrigger id="purpose">
                  <SelectValue placeholder="Choose what to advertise" />
                </SelectTrigger>
                <SelectContent>
                  {AD_PURPOSES.map((purpose) => (
                    <SelectItem key={purpose.value} value={purpose.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{purpose.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {purpose.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="platform">Platform *</Label>
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger id="platform">
                  <SelectValue placeholder="Choose platform" />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((platform) => (
                    <SelectItem key={platform} value={platform}>
                      {platform}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Details *</Label>
            <Input
              id="details"
              placeholder="e.g., 'HIIT Cardio Blast', 'Summer Special - 30% Off', 'Transform Your Body in 12 Weeks'"
              value={customDetails}
              onChange={(e) => setCustomDetails(e.target.value)}
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">
              Enter the specific name, offer, or message for your advertisement
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="background">Background Image (Optional)</Label>
            <Select value={selectedBackground} onValueChange={setSelectedBackground}>
              <SelectTrigger id="background">
                <SelectValue placeholder="Random workout image (recommended)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Random (Recommended)</SelectItem>
                <SelectItem value={WORKOUT_IMAGES[0]}>Bodyweight Inferno</SelectItem>
                <SelectItem value={WORKOUT_IMAGES[1]}>HIIT Inferno</SelectItem>
                <SelectItem value={WORKOUT_IMAGES[2]}>Cardio Blast</SelectItem>
                <SelectItem value={WORKOUT_IMAGES[3]}>Power Surge</SelectItem>
                <SelectItem value={WORKOUT_IMAGES[4]}>Metabolic Burn</SelectItem>
                <SelectItem value={WORKOUT_IMAGES[5]}>Explosive Engine</SelectItem>
                <SelectItem value={WORKOUT_IMAGES[6]}>Functional Strength</SelectItem>
                <SelectItem value={WORKOUT_IMAGES[7]}>Cardio Endurance</SelectItem>
                <SelectItem value={WORKOUT_IMAGES[8]}>Muscle Hypertrophy</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Uses actual Smarty Gym workout images from your library
            </p>
          </div>

          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium text-primary">✓ 100% Brand Aligned</p>
            <p className="text-xs text-muted-foreground">
              All ads use your actual Smarty Gym logo, exact tagline "Your gym reimagined. Anywhere, anytime.", 
              real workout images from your library, and gold brand colors. No random generic content.
            </p>
          </div>

          <Button
            onClick={generateAdsForPlatform}
            disabled={!selectedPurpose || !customDetails.trim() || !selectedPlatform}
            className="w-full"
            size="lg"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Branded Advertisement
          </Button>
        </div>

        {/* Generated Ads Gallery */}
        {generatedAds.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Generated Advertisements</h3>
              <p className="text-sm text-muted-foreground">{generatedAds.length} ads created</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generatedAds.map((ad) => (
                <div
                  key={ad.id}
                  className="border rounded-lg overflow-hidden bg-card hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square bg-muted flex items-center justify-center relative">
                    {ad.generating ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Generating...</p>
                      </div>
                    ) : ad.imageUrl ? (
                      <img
                        src={ad.imageUrl}
                        alt={`${ad.platform} Advertisement`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Generation failed</p>
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg">{ad.platform}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {ad.aspectRatio}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {ad.imageUrl && (
                        <>
                          <Button
                            onClick={() => regenerateAd(ad.id)}
                            variant="outline"
                            size="sm"
                            disabled={ad.generating}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() =>
                              downloadImage(
                                ad.imageUrl!,
                                `smarty-gym-${ad.platform.toLowerCase()}-${Date.now()}`
                              )
                            }
                            variant="default"
                            size="sm"
                            className="flex-1"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <Button
                            onClick={() => deleteAd(ad.id)}
                            variant="ghost"
                            size="sm"
                          >
                            <RefreshCw className="h-4 w-4 rotate-180" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
