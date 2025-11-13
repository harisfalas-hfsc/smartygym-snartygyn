import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Image, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { exportToInstagram, INSTAGRAM_SIZES, InstagramSize } from "@/utils/instagramExporter";
import { ServicesTemplate } from "./instagram/ServicesTemplate";
import { HumanNotAITemplate } from "./instagram/HumanNotAITemplate";
import { FitnessToolsTemplate } from "./instagram/FitnessToolsTemplate";
import { WorkoutCategoriesTemplate } from "./instagram/WorkoutCategoriesTemplate";
import { ProgramCategoriesTemplate } from "./instagram/ProgramCategoriesTemplate";
import { PremiumBenefitsTemplate } from "./instagram/PremiumBenefitsTemplate";

interface Template {
  id: string;
  name: string;
  description: string;
  component: React.ReactNode;
}

export const InstagramImageGenerator = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("services");
  const [selectedSize, setSelectedSize] = useState<InstagramSize>(INSTAGRAM_SIZES[0]);
  const [isExporting, setIsExporting] = useState(false);

  const templates: Template[] = [
    {
      id: "services",
      name: "Services Overview",
      description: "Showcase all Smarty Gym services",
      component: <ServicesTemplate />,
    },
    {
      id: "human-not-ai",
      name: "100% Human, 0% AI",
      description: "Brand differentiation message",
      component: <HumanNotAITemplate />,
    },
    {
      id: "fitness-tools",
      name: "Fitness Tools",
      description: "Highlight free calculators",
      component: <FitnessToolsTemplate />,
    },
    {
      id: "workout-categories",
      name: "Workout Categories",
      description: "Display workout variety",
      component: <WorkoutCategoriesTemplate />,
    },
    {
      id: "program-categories",
      name: "Program Categories",
      description: "Show training program types",
      component: <ProgramCategoriesTemplate />,
    },
    {
      id: "premium-benefits",
      name: "Premium Benefits",
      description: "What you get with premium",
      component: <PremiumBenefitsTemplate />,
    },
  ];

  const currentTemplate = templates.find((t) => t.id === selectedTemplate);

  const handleExport = async () => {
    if (!currentTemplate) return;

    setIsExporting(true);
    try {
      await exportToInstagram(
        "instagram-preview",
        `smartygym-${selectedTemplate}`,
        selectedSize
      );
      toast.success("Image exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export image");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportAll = async () => {
    setIsExporting(true);
    let successCount = 0;

    for (const template of templates) {
      try {
        setSelectedTemplate(template.id);
        // Wait for render
        await new Promise((resolve) => setTimeout(resolve, 500));
        await exportToInstagram(
          "instagram-preview",
          `smartygym-${template.id}`,
          selectedSize
        );
        successCount++;
      } catch (error) {
        console.error(`Failed to export ${template.name}:`, error);
      }
    }

    setIsExporting(false);
    toast.success(`Exported ${successCount} of ${templates.length} templates`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Instagram Image Generator
          </CardTitle>
          <CardDescription>
            Create Instagram-ready images from your website cards. Select a template, choose a size, and download as JPEG.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Template Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Template</label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name} - {template.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Size Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Instagram Size</label>
            <Select
              value={selectedSize.name}
              onValueChange={(value) => {
                const size = INSTAGRAM_SIZES.find((s) => s.name === value);
                if (size) setSelectedSize(size);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INSTAGRAM_SIZES.map((size) => (
                  <SelectItem key={size.name} value={size.name}>
                    {size.label} - {size.width}x{size.height}px
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="flex-1"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export Current Template
                </>
              )}
            </Button>
            <Button
              onClick={handleExportAll}
              disabled={isExporting}
              variant="outline"
            >
              Export All Templates
            </Button>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Preview</label>
            <div className="border-2 border-primary rounded-lg overflow-hidden bg-background">
              <div className="relative" style={{ aspectRatio: `${selectedSize.width}/${selectedSize.height}` }}>
                <div
                  id="instagram-preview"
                  className="absolute inset-0"
                  style={{
                    transform: "scale(0.3)",
                    transformOrigin: "top left",
                    width: `${100 / 0.3}%`,
                    height: `${100 / 0.3}%`,
                  }}
                >
                  {currentTemplate?.component}
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Preview is scaled down. Exported image will be {selectedSize.width}x{selectedSize.height}px
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
