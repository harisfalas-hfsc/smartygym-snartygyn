import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Eye } from "lucide-react";
import { toast } from "sonner";
import { exportToInstagram, INSTAGRAM_SIZES, InstagramSize } from "@/utils/instagramExporter";

// Composite Cards
import { HumanNotAICompositeTemplate } from "./instagram/composite/HumanNotAICompositeTemplate";
import { HomeHeroCompositeTemplate } from "./instagram/composite/HomeHeroCompositeTemplate";
import { FullHeroCompositeTemplate } from "./instagram/composite/FullHeroCompositeTemplate";
import { GoldPlanCompositeTemplate } from "./instagram/composite/GoldPlanCompositeTemplate";
import { PlatinumPlanCompositeTemplate } from "./instagram/composite/PlatinumPlanCompositeTemplate";
import { ServicesOverviewCompositeTemplate } from "./instagram/composite/ServicesOverviewCompositeTemplate";
import { WorkoutCategoriesCompositeTemplate } from "./instagram/composite/WorkoutCategoriesCompositeTemplate";
import { ProgramCategoriesCompositeTemplate } from "./instagram/composite/ProgramCategoriesCompositeTemplate";
import { FitnessToolsCompositeTemplate } from "./instagram/composite/FitnessToolsCompositeTemplate";

// Services
import { WorkoutsCardTemplate } from "./instagram/services/WorkoutsCardTemplate";
import { ProgramsCardTemplate } from "./instagram/services/ProgramsCardTemplate";
import { ExerciseLibraryCardTemplate } from "./instagram/services/ExerciseLibraryCardTemplate";
import { OneRMCardTemplate } from "./instagram/services/OneRMCardTemplate";
import { BMRCardTemplate } from "./instagram/services/BMRCardTemplate";
import { MacroCardTemplate } from "./instagram/services/MacroCardTemplate";
import { GoldPlanCardTemplate } from "./instagram/services/GoldPlanCardTemplate";
import { PlatinumPlanCardTemplate } from "./instagram/services/PlatinumPlanCardTemplate";

// Brand & Values
import { RealExpertiseCardTemplate } from "./instagram/brand/RealExpertiseCardTemplate";
import { PersonalTouchCardTemplate } from "./instagram/brand/PersonalTouchCardTemplate";
import { NotARobotCardTemplate } from "./instagram/brand/NotARobotCardTemplate";
import { YourGymInPocketCardTemplate } from "./instagram/brand/YourGymInPocketCardTemplate";
import { HumanNotAICardTemplate } from "./instagram/brand/HumanNotAICardTemplate";
import { TrainAnywhereCardTemplate } from "./instagram/brand/TrainAnywhereCardTemplate";

// Workouts
import { StrengthCardTemplate } from "./instagram/workouts/StrengthCardTemplate";
import { CalorieBurningCardTemplate } from "./instagram/workouts/CalorieBurningCardTemplate";
import { MetabolicCardTemplate } from "./instagram/workouts/MetabolicCardTemplate";
import { CardioCardTemplate } from "./instagram/workouts/CardioCardTemplate";
import { MobilityCardTemplate } from "./instagram/workouts/MobilityCardTemplate";
import { ChallengeCardTemplate } from "./instagram/workouts/ChallengeCardTemplate";

// Programs
import { CardioEnduranceCardTemplate } from "./instagram/programs/CardioEnduranceCardTemplate";
import { FunctionalStrengthCardTemplate } from "./instagram/programs/FunctionalStrengthCardTemplate";
import { MuscleHypertrophyCardTemplate } from "./instagram/programs/MuscleHypertrophyCardTemplate";
import { WeightLossCardTemplate } from "./instagram/programs/WeightLossCardTemplate";
import { LowBackPainCardTemplate } from "./instagram/programs/LowBackPainCardTemplate";
import { MobilityStabilityCardTemplate } from "./instagram/programs/MobilityStabilityCardTemplate";

// Tools
import { OneRMToolCardTemplate } from "./instagram/tools/OneRMToolCardTemplate";
import { BMRToolCardTemplate } from "./instagram/tools/BMRToolCardTemplate";
import { MacroToolCardTemplate } from "./instagram/tools/MacroToolCardTemplate";

// Features & Benefits
import { BrowseWorkoutsFeatureTemplate } from "./instagram/features/BrowseWorkoutsFeatureTemplate";
import { BrowseProgramsFeatureTemplate } from "./instagram/features/BrowseProgramsFeatureTemplate";
import { ExplorePlatformFeatureTemplate } from "./instagram/features/ExplorePlatformFeatureTemplate";
import { UnlimitedAccessBenefitTemplate } from "./instagram/features/UnlimitedAccessBenefitTemplate";
import { PersonalizedPlansBenefitTemplate } from "./instagram/features/PersonalizedPlansBenefitTemplate";
import { SaveFavoritesBenefitTemplate } from "./instagram/features/SaveFavoritesBenefitTemplate";
import { PersonalDashboardBenefitTemplate } from "./instagram/features/PersonalDashboardBenefitTemplate";
import { GoalSettingBenefitTemplate } from "./instagram/features/GoalSettingBenefitTemplate";

// Community
import { WorkoutLeaderboardTemplate } from "./instagram/community/WorkoutLeaderboardTemplate";
import { ProgramLeaderboardTemplate } from "./instagram/community/ProgramLeaderboardTemplate";

// Hero Section Cards
import { OnlineFitnessRedefinedCardTemplate } from "./instagram/hero/OnlineFitnessRedefinedCardTemplate";
import { GymInPocketCardTemplate } from "./instagram/hero/GymInPocketCardTemplate";
import { HumanNotAIHeroCardTemplate } from "./instagram/hero/HumanNotAIHeroCardTemplate";
import { TrainAnywhereCardTemplate as TrainAnywhereHeroCardTemplate } from "./instagram/hero/TrainAnywhereCardTemplate";
import { WorkoutsNavCardTemplate } from "./instagram/hero/WorkoutsNavCardTemplate";
import { ProgramsNavCardTemplate } from "./instagram/hero/ProgramsNavCardTemplate";
import { ToolsNavCardTemplate } from "./instagram/hero/ToolsNavCardTemplate";
import { LibraryNavCardTemplate } from "./instagram/hero/LibraryNavCardTemplate";
import { BlogNavCardTemplate } from "./instagram/hero/BlogNavCardTemplate";
import { CoachNavCardTemplate } from "./instagram/hero/CoachNavCardTemplate";
import { TabletWithSixCardsTemplate } from "./instagram/hero/TabletWithSixCardsTemplate";
import { WelcomeHeroCompositeTemplate } from "./instagram/hero/WelcomeHeroCompositeTemplate";

// Audience Cards
import { WhoIsForCompositeTemplate } from "./instagram/audience/WhoIsForCompositeTemplate";
import { BusyAdultsCardTemplate } from "./instagram/audience/BusyAdultsCardTemplate";
import { ParentsCardTemplate } from "./instagram/audience/ParentsCardTemplate";
import { BeginnersCardTemplate } from "./instagram/audience/BeginnersCardTemplate";
import { IntermediateCardTemplate } from "./instagram/audience/IntermediateCardTemplate";
import { TravelersCardTemplate } from "./instagram/audience/TravelersCardTemplate";
import { GymGoersCardTemplate } from "./instagram/audience/GymGoersCardTemplate";

// Values Cards
import { WhatWeStandForCompositeTemplate } from "./instagram/values/WhatWeStandForCompositeTemplate";
import { EvidenceBasedCardTemplate } from "./instagram/values/EvidenceBasedCardTemplate";
import { StructureClarityCardTemplate } from "./instagram/values/StructureClarityCardTemplate";
import { HumanConnectionCardTemplate } from "./instagram/values/HumanConnectionCardTemplate";
import { ResultsDrivenCardTemplate } from "./instagram/values/ResultsDrivenCardTemplate";

// Promise & Coach
import { SmartyGymPromiseTemplate } from "./instagram/promise/SmartyGymPromiseTemplate";
import { HarisFalasMessageTemplate } from "./instagram/coach/HarisFalasMessageTemplate";

interface Template {
  id: string;
  name: string;
  component: React.ComponentType;
}

const compositeTemplates: Template[] = [
  { id: "full-hero", name: "Complete Hero", component: FullHeroCompositeTemplate },
  { id: "home-hero", name: "Homepage Hero", component: HomeHeroCompositeTemplate },
  { id: "human-not-ai", name: "100% Human. 0% AI.", component: HumanNotAICompositeTemplate },
  { id: "gold-plan-composite", name: "Gold Plan (Full Card)", component: GoldPlanCompositeTemplate },
  { id: "platinum-plan-composite", name: "Platinum Plan (Full Card)", component: PlatinumPlanCompositeTemplate },
  { id: "services-overview", name: "Services Overview", component: ServicesOverviewCompositeTemplate },
  { id: "workout-categories", name: "Workout Categories", component: WorkoutCategoriesCompositeTemplate },
  { id: "program-categories", name: "Program Categories", component: ProgramCategoriesCompositeTemplate },
  { id: "fitness-tools", name: "Fitness Tools", component: FitnessToolsCompositeTemplate },
];

const serviceTemplates: Template[] = [
  { id: "workouts-service", name: "Workouts", component: WorkoutsCardTemplate },
  { id: "programs-service", name: "Training Programs", component: ProgramsCardTemplate },
  { id: "exercise-library", name: "Exercise Library", component: ExerciseLibraryCardTemplate },
  { id: "1rm-calc", name: "1RM Calculator", component: OneRMCardTemplate },
  { id: "bmr-calc", name: "BMR Calculator", component: BMRCardTemplate },
  { id: "macro-tracker", name: "Macro Tracker", component: MacroCardTemplate },
  { id: "gold-plan", name: "Gold Plan", component: GoldPlanCardTemplate },
  { id: "platinum-plan", name: "Platinum Plan", component: PlatinumPlanCardTemplate },
];

const brandTemplates: Template[] = [
  { id: "real-expertise", name: "Real Expertise", component: RealExpertiseCardTemplate },
  { id: "personal-touch", name: "Personal Touch", component: PersonalTouchCardTemplate },
  { id: "not-robot", name: "Not a Robot", component: NotARobotCardTemplate },
  { id: "gym-in-pocket", name: "Your Gym In Your Pocket", component: YourGymInPocketCardTemplate },
  { id: "human-not-ai-card", name: "100% Human. 0% AI.", component: HumanNotAICardTemplate },
  { id: "train-anywhere", name: "Train Anywhere, Anytime", component: TrainAnywhereCardTemplate },
];

const workoutTemplates: Template[] = [
  { id: "strength", name: "Strength", component: StrengthCardTemplate },
  { id: "calorie-burning", name: "Calorie Burning", component: CalorieBurningCardTemplate },
  { id: "metabolic", name: "Metabolic", component: MetabolicCardTemplate },
  { id: "cardio", name: "Cardio", component: CardioCardTemplate },
  { id: "mobility", name: "Mobility", component: MobilityCardTemplate },
  { id: "challenge", name: "Challenge", component: ChallengeCardTemplate },
];

const programTemplates: Template[] = [
  { id: "cardio-endurance", name: "Cardio Endurance", component: CardioEnduranceCardTemplate },
  { id: "functional-strength", name: "Functional Strength", component: FunctionalStrengthCardTemplate },
  { id: "muscle-hypertrophy", name: "Muscle Hypertrophy", component: MuscleHypertrophyCardTemplate },
  { id: "weight-loss", name: "Weight Loss", component: WeightLossCardTemplate },
  { id: "low-back-pain", name: "Low Back Pain Relief", component: LowBackPainCardTemplate },
  { id: "mobility-stability", name: "Mobility & Stability", component: MobilityStabilityCardTemplate },
];

const toolTemplates: Template[] = [
  { id: "1rm-tool", name: "1RM Calculator Tool", component: OneRMToolCardTemplate },
  { id: "bmr-tool", name: "BMR Calculator Tool", component: BMRToolCardTemplate },
  { id: "macro-tool", name: "Macro Tracker Tool", component: MacroToolCardTemplate },
];

const featureTemplates: Template[] = [
  { id: "browse-workouts", name: "Browse Workouts", component: BrowseWorkoutsFeatureTemplate },
  { id: "browse-programs", name: "Browse Programs", component: BrowseProgramsFeatureTemplate },
  { id: "explore-platform", name: "Explore Platform", component: ExplorePlatformFeatureTemplate },
  { id: "unlimited-access", name: "Unlimited Access", component: UnlimitedAccessBenefitTemplate },
  { id: "personalized-plans", name: "Personalized Plans", component: PersonalizedPlansBenefitTemplate },
  { id: "save-favorites", name: "Save Favorites", component: SaveFavoritesBenefitTemplate },
  { id: "personal-dashboard", name: "Personal Dashboard", component: PersonalDashboardBenefitTemplate },
  { id: "goal-setting", name: "Goal Setting", component: GoalSettingBenefitTemplate },
];

const communityTemplates: Template[] = [
  { id: "workout-leaderboard", name: "Workout Leaderboard", component: WorkoutLeaderboardTemplate },
  { id: "program-leaderboard", name: "Program Leaderboard", component: ProgramLeaderboardTemplate },
];

const heroTemplates: Template[] = [
  { id: "welcome-hero-composite", name: "Welcome Hero Composite", component: WelcomeHeroCompositeTemplate },
  { id: "tablet-six-cards", name: "Tablet with 6 Cards", component: TabletWithSixCardsTemplate },
  { id: "online-fitness-redefined", name: "Online Fitness Redefined", component: OnlineFitnessRedefinedCardTemplate },
  { id: "gym-in-pocket", name: "Your Gym In Your Pocket", component: GymInPocketCardTemplate },
  { id: "human-not-ai-hero", name: "100% Human. 0% AI. (Hero)", component: HumanNotAIHeroCardTemplate },
  { id: "train-anywhere-hero", name: "Train Anywhere, Anytime (Hero)", component: TrainAnywhereHeroCardTemplate },
  { id: "workouts-nav", name: "500+ Expert Workouts", component: WorkoutsNavCardTemplate },
  { id: "programs-nav", name: "Training Programs (Nav)", component: ProgramsNavCardTemplate },
  { id: "tools-nav", name: "Smart Tools (Nav)", component: ToolsNavCardTemplate },
  { id: "library-nav", name: "Exercise Library (Nav)", component: LibraryNavCardTemplate },
  { id: "blog-nav", name: "Blog & Articles (Nav)", component: BlogNavCardTemplate },
  { id: "coach-nav", name: "Expert Coach Guidance (Nav)", component: CoachNavCardTemplate },
];

const audienceTemplates: Template[] = [
  { id: "who-is-for-composite", name: "Who Is SmartyGym For? (Composite)", component: WhoIsForCompositeTemplate },
  { id: "busy-adults", name: "Busy Adults", component: BusyAdultsCardTemplate },
  { id: "parents", name: "Parents", component: ParentsCardTemplate },
  { id: "beginners", name: "Beginners", component: BeginnersCardTemplate },
  { id: "intermediate", name: "Intermediate Lifters", component: IntermediateCardTemplate },
  { id: "travelers", name: "Travelers", component: TravelersCardTemplate },
  { id: "gym-goers", name: "Gym-Goers", component: GymGoersCardTemplate },
];

const valuesTemplates: Template[] = [
  { id: "what-we-stand-for-composite", name: "What We Stand For (Composite)", component: WhatWeStandForCompositeTemplate },
  { id: "evidence-based", name: "Evidence-Based", component: EvidenceBasedCardTemplate },
  { id: "structure-clarity", name: "Structure & Clarity", component: StructureClarityCardTemplate },
  { id: "human-connection", name: "Human Connection", component: HumanConnectionCardTemplate },
  { id: "results-driven", name: "Results-Driven", component: ResultsDrivenCardTemplate },
];

const promiseTemplates: Template[] = [
  { id: "smartygym-promise", name: "The SmartyGym Promise", component: SmartyGymPromiseTemplate },
];

const coachTemplates: Template[] = [
  { id: "haris-message", name: "Message from Haris Falas", component: HarisFalasMessageTemplate },
];

export const InstagramImageGenerator = () => {
  const [selectedSizes, setSelectedSizes] = useState<Record<string, InstagramSize>>(
    Object.fromEntries([
      ...compositeTemplates,
      ...heroTemplates,
      ...serviceTemplates,
      ...brandTemplates,
      ...workoutTemplates,
      ...programTemplates,
      ...toolTemplates,
      ...featureTemplates,
      ...audienceTemplates,
      ...valuesTemplates,
      ...promiseTemplates,
      ...coachTemplates,
      ...communityTemplates,
    ].map(t => [t.id, INSTAGRAM_SIZES[0]]))
  );
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  const handleDownload = async (templateId: string, templateName: string) => {
    const size = selectedSizes[templateId];
    try {
      await exportToInstagram(
        `export-${templateId}`,
        `${templateName}-${size.name}`,
        size
      );
      toast.success(`Downloaded ${templateName} as ${size.label}`);
    } catch (error) {
      toast.error("Failed to download image");
      console.error(error);
    }
  };

  const handleDownloadAll = async (templates: Template[], category: string) => {
    toast.loading(`Downloading all ${category} templates...`);
    for (const template of templates) {
      await handleDownload(template.id, template.name);
    }
    toast.success(`All ${category} templates downloaded`);
  };

  const renderTemplateGrid = (templates: Template[], category: string) => (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => handleDownloadAll(templates, category)} variant="outline" size="sm" className="w-full sm:w-auto">
          <Download className="w-4 h-4 mr-2" />
          <span className="truncate">Download All in {category}</span>
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {templates.map((template) => {
          const TemplateComponent = template.component;
          return (
            <Card key={template.id} className="overflow-hidden">
              <div 
                id={`template-${template.id}`} 
                className="h-48 bg-muted relative group cursor-pointer overflow-hidden"
                onClick={() => setPreviewTemplate(template)}
              >
                <div className="scale-[0.19] origin-top-left">
                  <TemplateComponent />
                </div>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Eye className="w-12 h-12 text-white" />
                </div>
              </div>
              
              <CardContent className="p-3 space-y-2">
                <h4 className="text-sm font-semibold truncate" title={template.name}>{template.name}</h4>
                <Select
                  value={selectedSizes[template.id]?.name || "square"}
                  onValueChange={(value) => {
                    const size = INSTAGRAM_SIZES.find(s => s.name === value);
                    if (size) {
                      setSelectedSizes(prev => ({ ...prev, [template.id]: size }));
                    }
                  }}
                >
                  <SelectTrigger className="h-9 text-xs">
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
                  onClick={() => handleDownload(template.id, template.name)}
                  className="w-full h-9 text-xs"
                  size="sm"
                >
                  <Download className="w-3 h-3 mr-1.5" />
                  <span className="truncate">Download</span>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Instagram Template Library</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="composite" className="w-full">
            <div className="w-full overflow-x-auto">
              <TabsList className="inline-flex w-auto min-w-full">
                <TabsTrigger value="composite" className="flex-shrink-0">Composite</TabsTrigger>
                <TabsTrigger value="hero" className="flex-shrink-0">Hero Cards</TabsTrigger>
                <TabsTrigger value="services" className="flex-shrink-0">Services</TabsTrigger>
                <TabsTrigger value="brand" className="flex-shrink-0">Brand</TabsTrigger>
                <TabsTrigger value="workouts" className="flex-shrink-0">Workouts</TabsTrigger>
                <TabsTrigger value="programs" className="flex-shrink-0">Programs</TabsTrigger>
                <TabsTrigger value="tools" className="flex-shrink-0">Tools</TabsTrigger>
                <TabsTrigger value="features" className="flex-shrink-0">Features</TabsTrigger>
                <TabsTrigger value="audience" className="flex-shrink-0">Audience</TabsTrigger>
                <TabsTrigger value="values" className="flex-shrink-0">Values</TabsTrigger>
                <TabsTrigger value="promise" className="flex-shrink-0">Promise</TabsTrigger>
                <TabsTrigger value="coach" className="flex-shrink-0">Coach</TabsTrigger>
                <TabsTrigger value="community" className="flex-shrink-0">Community</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="composite" className="mt-6">
              {renderTemplateGrid(compositeTemplates, "Composite")}
            </TabsContent>

            <TabsContent value="hero" className="mt-6">
              {renderTemplateGrid(heroTemplates, "Hero Cards")}
            </TabsContent>

            <TabsContent value="services" className="mt-6">
              {renderTemplateGrid(serviceTemplates, "Services")}
            </TabsContent>

            <TabsContent value="brand" className="mt-6">
              {renderTemplateGrid(brandTemplates, "Brand & Values")}
            </TabsContent>

            <TabsContent value="workouts" className="mt-6">
              {renderTemplateGrid(workoutTemplates, "Workouts")}
            </TabsContent>

            <TabsContent value="programs" className="mt-6">
              {renderTemplateGrid(programTemplates, "Programs")}
            </TabsContent>

            <TabsContent value="tools" className="mt-6">
              {renderTemplateGrid(toolTemplates, "Tools")}
            </TabsContent>

            <TabsContent value="features" className="mt-6">
              {renderTemplateGrid(featureTemplates, "Features & Benefits")}
            </TabsContent>

            <TabsContent value="audience" className="mt-6">
              {renderTemplateGrid(audienceTemplates, "Audience")}
            </TabsContent>

            <TabsContent value="values" className="mt-6">
              {renderTemplateGrid(valuesTemplates, "Values")}
            </TabsContent>

            <TabsContent value="promise" className="mt-6">
              {renderTemplateGrid(promiseTemplates, "Promise")}
            </TabsContent>

            <TabsContent value="coach" className="mt-6">
              {renderTemplateGrid(coachTemplates, "Coach")}
            </TabsContent>

            <TabsContent value="community" className="mt-6">
              {renderTemplateGrid(communityTemplates, "Community")}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Hidden full-size templates for export */}
      <div className="fixed -left-[9999px] -top-[9999px] pointer-events-none">
        {[
          ...compositeTemplates,
          ...heroTemplates,
          ...serviceTemplates,
          ...brandTemplates,
          ...workoutTemplates,
          ...programTemplates,
          ...toolTemplates,
          ...featureTemplates,
          ...audienceTemplates,
          ...valuesTemplates,
          ...promiseTemplates,
          ...coachTemplates,
          ...communityTemplates,
        ].map((template) => (
          <div key={template.id} id={`export-${template.id}`}>
            <template.component />
          </div>
        ))}
      </div>

      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">{previewTemplate?.name} - Full Preview</DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-4">
              <div id={`preview-${previewTemplate.id}`} className="w-full overflow-x-auto">
                <div className="min-w-[300px]">
                  <previewTemplate.component />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 justify-end">
                <Select
                  value={selectedSizes[previewTemplate.id]?.name || "square"}
                  onValueChange={(value) => {
                    const size = INSTAGRAM_SIZES.find(s => s.name === value);
                    if (size) {
                      setSelectedSizes(prev => ({ ...prev, [previewTemplate.id]: size }));
                    }
                  }}
                >
                  <SelectTrigger className="w-full sm:w-40">
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
                <Button onClick={() => handleDownload(previewTemplate.id, previewTemplate.name)} className="w-full sm:w-auto">
                  <Download className="w-4 h-4 mr-2" />
                  <span className="truncate">Download</span>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
