import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image, FileText, Megaphone } from "lucide-react";
import { PicturesGallery } from "./marketing/PicturesGallery";
import { MarketingContent } from "./marketing/MarketingContent";
import { PromotionalContent } from "./marketing/PromotionalContent";

export const MarketingManager = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Marketing</h2>
        <p className="text-muted-foreground">
          Pictures, content documents, and promotional materials
        </p>
      </div>

      <Tabs defaultValue="pictures" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pictures" className="gap-2">
            <Image className="h-4 w-4" />
            <span className="hidden sm:inline">Pictures</span>
          </TabsTrigger>
          <TabsTrigger value="content" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Content</span>
          </TabsTrigger>
          <TabsTrigger value="promotional" className="gap-2">
            <Megaphone className="h-4 w-4" />
            <span className="hidden sm:inline">Promotional</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pictures" className="mt-6">
          <PicturesGallery />
        </TabsContent>

        <TabsContent value="content" className="mt-6">
          <MarketingContent />
        </TabsContent>

        <TabsContent value="promotional" className="mt-6">
          <PromotionalContent />
        </TabsContent>
      </Tabs>
    </div>
  );
};
