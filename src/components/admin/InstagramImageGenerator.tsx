import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { exportToInstagram, INSTAGRAM_SIZES } from "@/utils/instagramExporter";

// Services Templates
import { ServicesTemplate } from "./instagram/ServicesTemplate";
import { WorkoutsCardTemplate } from "./instagram/services/WorkoutsCardTemplate";
import { ProgramsCardTemplate } from "./instagram/services/ProgramsCardTemplate";
import { ExerciseLibraryCardTemplate } from "./instagram/services/ExerciseLibraryCardTemplate";
import { OneRMCardTemplate } from "./instagram/services/OneRMCardTemplate";
import { BMRCardTemplate } from "./instagram/services/BMRCardTemplate";
import { MacroCardTemplate } from "./instagram/services/MacroCardTemplate";
import { GoldPlanCardTemplate } from "./instagram/services/GoldPlanCardTemplate";
import { PlatinumPlanCardTemplate } from "./instagram/services/PlatinumPlanCardTemplate";

// Brand Templates
import { HumanNotAITemplate } from "./instagram/HumanNotAITemplate";
import { RealExpertiseCardTemplate } from "./instagram/brand/RealExpertiseCardTemplate";
import { PersonalTouchCardTemplate } from "./instagram/brand/PersonalTouchCardTemplate";
import { NotARobotCardTemplate } from "./instagram/brand/NotARobotCardTemplate";

// Workout Templates
import { WorkoutCategoriesTemplate } from "./instagram/WorkoutCategoriesTemplate";
import { StrengthCardTemplate } from "./instagram/workouts/StrengthCardTemplate";
import { CalorieBurningCardTemplate } from "./instagram/workouts/CalorieBurningCardTemplate";
import { MetabolicCardTemplate } from "./instagram/workouts/MetabolicCardTemplate";
import { CardioCardTemplate } from "./instagram/workouts/CardioCardTemplate";
import { MobilityCardTemplate } from "./instagram/workouts/MobilityCardTemplate";
import { PowerCardTemplate } from "./instagram/workouts/PowerCardTemplate";
import { ChallengeCardTemplate } from "./instagram/workouts/ChallengeCardTemplate";

// Program Templates
import { ProgramCategoriesTemplate } from "./instagram/ProgramCategoriesTemplate";
import { CardioEnduranceCardTemplate } from "./instagram/programs/CardioEnduranceCardTemplate";
import { FunctionalStrengthCardTemplate } from "./instagram/programs/FunctionalStrengthCardTemplate";
import { MuscleHypertrophyCardTemplate } from "./instagram/programs/MuscleHypertrophyCardTemplate";
import { WeightLossCardTemplate } from "./instagram/programs/WeightLossCardTemplate";
import { LowBackPainCardTemplate } from "./instagram/programs/LowBackPainCardTemplate";
import { MobilityStabilityCardTemplate } from "./instagram/programs/MobilityStabilityCardTemplate";

// Tools Templates
import { FitnessToolsTemplate } from "./instagram/FitnessToolsTemplate";
import { OneRMToolCardTemplate } from "./instagram/tools/OneRMToolCardTemplate";
import { BMRToolCardTemplate } from "./instagram/tools/BMRToolCardTemplate";
import { MacroToolCardTemplate } from "./instagram/tools/MacroToolCardTemplate";

// Community Templates
import { WorkoutLeaderboardTemplate } from "./instagram/community/WorkoutLeaderboardTemplate";
import { ProgramLeaderboardTemplate } from "./instagram/community/ProgramLeaderboardTemplate";

// Premium Template
import { PremiumBenefitsTemplate } from "./instagram/PremiumBenefitsTemplate";

interface Template {
  id: string;
  name: string;
  description: string;
  component: React.ComponentType;
}

const servicesTemplates: Template[] = [
  { id: "services-overview", name: "Services Overview", description: "All services in one card", component: ServicesTemplate },
  { id: "workouts-card", name: "Workouts Card", description: "Individual workout service card", component: WorkoutsCardTemplate },
  { id: "programs-card", name: "Programs Card", description: "Individual programs service card", component: ProgramsCardTemplate },
  { id: "exercise-library-card", name: "Exercise Library", description: "Individual exercise library card", component: ExerciseLibraryCardTemplate },
  { id: "1rm-card", name: "1RM Calculator", description: "Individual 1RM calculator card", component: OneRMCardTemplate },
  { id: "bmr-card", name: "BMR Calculator", description: "Individual BMR calculator card", component: BMRCardTemplate },
  { id: "macro-card", name: "Macro Tracker", description: "Individual macro tracker card", component: MacroCardTemplate },
  { id: "gold-plan", name: "Gold Plan", description: "Gold membership plan card", component: GoldPlanCardTemplate },
  { id: "platinum-plan", name: "Platinum Plan", description: "Platinum membership plan card", component: PlatinumPlanCardTemplate },
  { id: "premium-benefits", name: "Premium Benefits", description: "All premium benefits listed", component: PremiumBenefitsTemplate },
];

const brandTemplates: Template[] = [
  { id: "human-not-ai", name: "100% Human, 0% AI", description: "Brand values overview", component: HumanNotAITemplate },
  { id: "real-expertise", name: "Real Expertise", description: "Created by sports scientists", component: RealExpertiseCardTemplate },
  { id: "personal-touch", name: "Personal Touch", description: "Workouts that fit your life", component: PersonalTouchCardTemplate },
  { id: "not-robot", name: "Not a Robot", description: "Human-designed content", component: NotARobotCardTemplate },
];

const workoutTemplates: Template[] = [
  { id: "workout-categories", name: "Workout Categories", description: "All workout types overview", component: WorkoutCategoriesTemplate },
  { id: "strength-card", name: "Strength", description: "Strength training card", component: StrengthCardTemplate },
  { id: "calorie-card", name: "Calorie Burning", description: "Calorie burning workouts card", component: CalorieBurningCardTemplate },
  { id: "metabolic-card", name: "Metabolic", description: "Metabolic training card", component: MetabolicCardTemplate },
  { id: "cardio-card", name: "Cardio", description: "Cardio training card", component: CardioCardTemplate },
  { id: "mobility-card", name: "Mobility", description: "Mobility training card", component: MobilityCardTemplate },
  { id: "power-card", name: "Power", description: "Power training card", component: PowerCardTemplate },
  { id: "challenge-card", name: "Challenge", description: "Challenge workouts card", component: ChallengeCardTemplate },
];

const programTemplates: Template[] = [
  { id: "program-categories", name: "Program Categories", description: "All program types overview", component: ProgramCategoriesTemplate },
  { id: "cardio-endurance", name: "Cardio Endurance", description: "Cardio endurance program card", component: CardioEnduranceCardTemplate },
  { id: "functional-strength", name: "Functional Strength", description: "Functional strength program card", component: FunctionalStrengthCardTemplate },
  { id: "muscle-hypertrophy", name: "Muscle Hypertrophy", description: "Muscle building program card", component: MuscleHypertrophyCardTemplate },
  { id: "weight-loss", name: "Weight Loss", description: "Weight loss program card", component: WeightLossCardTemplate },
  { id: "low-back-pain", name: "Low Back Pain", description: "Back pain relief program card", component: LowBackPainCardTemplate },
  { id: "mobility-stability", name: "Mobility & Stability", description: "Mobility program card", component: MobilityStabilityCardTemplate },
];

const toolsTemplates: Template[] = [
  { id: "fitness-tools", name: "Fitness Tools", description: "All fitness tools overview", component: FitnessToolsTemplate },
  { id: "1rm-tool", name: "1RM Tool Card", description: "1RM calculator tool card", component: OneRMToolCardTemplate },
  { id: "bmr-tool", name: "BMR Tool Card", description: "BMR calculator tool card", component: BMRToolCardTemplate },
  { id: "macro-tool", name: "Macro Tool Card", description: "Macro tracker tool card", component: MacroToolCardTemplate },
];

const communityTemplates: Template[] = [
  { id: "workout-leaderboard", name: "Workout Leaderboard", description: "Top workout performers", component: WorkoutLeaderboardTemplate },
  { id: "program-leaderboard", name: "Program Leaderboard", description: "Top program completers", component: ProgramLeaderboardTemplate },
];

export const InstagramImageGenerator = () => {
  const [downloadingStates, setDownloadingStates] = useState<Record<string, boolean>>({});
  const [templateSizes, setTemplateSizes] = useState<Record<string, string>>({});

  const handleDownload = async (template: Template) => {
    setDownloadingStates(prev => ({ ...prev, [template.id]: true }));
    
    try {
      const size = INSTAGRAM_SIZES.find(s => s.name === (templateSizes[template.id] || "square")) || INSTAGRAM_SIZES[0];
      await exportToInstagram(
        `instagram-template-${template.id}`,
        `smartygym-${template.id}-${size.name}`,
        size
      );
      toast.success(`${template.name} downloaded successfully!`);
    } catch (error) {
      console.error("Error exporting template:", error);
      toast.error("Failed to download template");
    } finally {
      setDownloadingStates(prev => ({ ...prev, [template.id]: false }));
    }
  };

  const handleDownloadCategory = async (templates: Template[], categoryName: string) => {
    toast.info(`Downloading all ${categoryName} templates...`);
    
    for (const template of templates) {
      await handleDownload(template);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    toast.success(`All ${categoryName} templates downloaded!`);
  };

  const renderTemplateGrid = (templates: Template[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => {
        const TemplateComponent = template.component;
        return (
          <Card key={template.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{template.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div 
                id={`instagram-template-${template.id}`}
                className="w-full aspect-square border-2 border-primary/20 rounded-lg overflow-hidden"
                style={{ transform: "scale(0.3)", transformOrigin: "top left", width: "333%", height: "333%" }}
              >
                <TemplateComponent />
              </div>

              <Select
                value={templateSizes[template.id] || "square"}
                onValueChange={(value) => setTemplateSizes(prev => ({ ...prev, [template.id]: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INSTAGRAM_SIZES.map((size) => (
                    <SelectItem key={size.name} value={size.name}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={() => handleDownload(template)}
                disabled={downloadingStates[template.id]}
                className="w-full"
              >
                {downloadingStates[template.id] ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download JPEG
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Instagram Image Generator</CardTitle>
        <p className="text-sm text-muted-foreground">
          Generate Instagram-ready marketing images from all website content
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="services" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-6">
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="brand">Brand</TabsTrigger>
            <TabsTrigger value="workouts">Workouts</TabsTrigger>
            <TabsTrigger value="programs">Programs</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="space-y-4">
            <div className="flex justify-end mb-4">
              <Button 
                onClick={() => handleDownloadCategory(servicesTemplates, "Services")}
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                Download All Services
              </Button>
            </div>
            {renderTemplateGrid(servicesTemplates)}
          </TabsContent>

          <TabsContent value="brand" className="space-y-4">
            <div className="flex justify-end mb-4">
              <Button 
                onClick={() => handleDownloadCategory(brandTemplates, "Brand")}
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                Download All Brand
              </Button>
            </div>
            {renderTemplateGrid(brandTemplates)}
          </TabsContent>

          <TabsContent value="workouts" className="space-y-4">
            <div className="flex justify-end mb-4">
              <Button 
                onClick={() => handleDownloadCategory(workoutTemplates, "Workouts")}
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                Download All Workouts
              </Button>
            </div>
            {renderTemplateGrid(workoutTemplates)}
          </TabsContent>

          <TabsContent value="programs" className="space-y-4">
            <div className="flex justify-end mb-4">
              <Button 
                onClick={() => handleDownloadCategory(programTemplates, "Programs")}
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                Download All Programs
              </Button>
            </div>
            {renderTemplateGrid(programTemplates)}
          </TabsContent>

          <TabsContent value="tools" className="space-y-4">
            <div className="flex justify-end mb-4">
              <Button 
                onClick={() => handleDownloadCategory(toolsTemplates, "Tools")}
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                Download All Tools
              </Button>
            </div>
            {renderTemplateGrid(toolsTemplates)}
          </TabsContent>

          <TabsContent value="community" className="space-y-4">
            <div className="flex justify-end mb-4">
              <Button 
                onClick={() => handleDownloadCategory(communityTemplates, "Community")}
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                Download All Community
              </Button>
            </div>
            {renderTemplateGrid(communityTemplates)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
