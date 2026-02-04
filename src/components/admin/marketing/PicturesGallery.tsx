import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TemplatesGallery } from "./TemplatesGallery";
import { WorkoutImagesGallery } from "./WorkoutImagesGallery";
import { ProgramImagesGallery } from "./ProgramImagesGallery";
import { HeroImagesGallery } from "./HeroImagesGallery";

export const PicturesGallery = () => {
  return (
    <Tabs defaultValue="templates" className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-6">
        <TabsTrigger value="templates">Templates</TabsTrigger>
        <TabsTrigger value="workouts">Workouts</TabsTrigger>
        <TabsTrigger value="programs">Programs</TabsTrigger>
        <TabsTrigger value="hero">Hero Cards</TabsTrigger>
      </TabsList>
      
      <TabsContent value="templates">
        <TemplatesGallery />
      </TabsContent>
      
      <TabsContent value="workouts">
        <WorkoutImagesGallery />
      </TabsContent>
      
      <TabsContent value="programs">
        <ProgramImagesGallery />
      </TabsContent>
      
      <TabsContent value="hero">
        <HeroImagesGallery />
      </TabsContent>
    </Tabs>
  );
};
