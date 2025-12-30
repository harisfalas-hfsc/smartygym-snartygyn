import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Eye } from "lucide-react";
import { toast } from "sonner";
import { exportToInstagram, INSTAGRAM_SIZES, InstagramSize } from "@/utils/instagramExporter";

// Import all templates
import { HumanNotAICompositeTemplate } from "../instagram/composite/HumanNotAICompositeTemplate";
import { HomeHeroCompositeTemplate } from "../instagram/composite/HomeHeroCompositeTemplate";
import { FullHeroCompositeTemplate } from "../instagram/composite/FullHeroCompositeTemplate";
import { GoldPlanCompositeTemplate } from "../instagram/composite/GoldPlanCompositeTemplate";
import { PlatinumPlanCompositeTemplate } from "../instagram/composite/PlatinumPlanCompositeTemplate";
import { ServicesOverviewCompositeTemplate } from "../instagram/composite/ServicesOverviewCompositeTemplate";
import { WorkoutCategoriesCompositeTemplate } from "../instagram/composite/WorkoutCategoriesCompositeTemplate";
import { ProgramCategoriesCompositeTemplate } from "../instagram/composite/ProgramCategoriesCompositeTemplate";
import { FitnessToolsCompositeTemplate } from "../instagram/composite/FitnessToolsCompositeTemplate";
import { WorkoutsCardTemplate } from "../instagram/services/WorkoutsCardTemplate";
import { ProgramsCardTemplate } from "../instagram/services/ProgramsCardTemplate";
import { ExerciseLibraryCardTemplate } from "../instagram/services/ExerciseLibraryCardTemplate";
import { OneRMCardTemplate } from "../instagram/services/OneRMCardTemplate";
import { BMRCardTemplate } from "../instagram/services/BMRCardTemplate";
import { MacroCardTemplate } from "../instagram/services/MacroCardTemplate";
import { GoldPlanCardTemplate } from "../instagram/services/GoldPlanCardTemplate";
import { PlatinumPlanCardTemplate } from "../instagram/services/PlatinumPlanCardTemplate";
import { RealExpertiseCardTemplate } from "../instagram/brand/RealExpertiseCardTemplate";
import { PersonalTouchCardTemplate } from "../instagram/brand/PersonalTouchCardTemplate";
import { NotARobotCardTemplate } from "../instagram/brand/NotARobotCardTemplate";
import { YourGymInPocketCardTemplate } from "../instagram/brand/YourGymInPocketCardTemplate";
import { HumanNotAICardTemplate } from "../instagram/brand/HumanNotAICardTemplate";
import { TrainAnywhereCardTemplate } from "../instagram/brand/TrainAnywhereCardTemplate";
import { StrengthCardTemplate } from "../instagram/workouts/StrengthCardTemplate";
import { CalorieBurningCardTemplate } from "../instagram/workouts/CalorieBurningCardTemplate";
import { MetabolicCardTemplate } from "../instagram/workouts/MetabolicCardTemplate";
import { CardioCardTemplate } from "../instagram/workouts/CardioCardTemplate";
import { MobilityCardTemplate } from "../instagram/workouts/MobilityCardTemplate";
import { ChallengeCardTemplate } from "../instagram/workouts/ChallengeCardTemplate";
import { CardioEnduranceCardTemplate } from "../instagram/programs/CardioEnduranceCardTemplate";
import { FunctionalStrengthCardTemplate } from "../instagram/programs/FunctionalStrengthCardTemplate";
import { MuscleHypertrophyCardTemplate } from "../instagram/programs/MuscleHypertrophyCardTemplate";
import { WeightLossCardTemplate } from "../instagram/programs/WeightLossCardTemplate";
import { LowBackPainCardTemplate } from "../instagram/programs/LowBackPainCardTemplate";
import { MobilityStabilityCardTemplate } from "../instagram/programs/MobilityStabilityCardTemplate";
import { OneRMToolCardTemplate } from "../instagram/tools/OneRMToolCardTemplate";
import { BMRToolCardTemplate } from "../instagram/tools/BMRToolCardTemplate";
import { MacroToolCardTemplate } from "../instagram/tools/MacroToolCardTemplate";
import { BrowseWorkoutsFeatureTemplate } from "../instagram/features/BrowseWorkoutsFeatureTemplate";
import { BrowseProgramsFeatureTemplate } from "../instagram/features/BrowseProgramsFeatureTemplate";
import { ExplorePlatformFeatureTemplate } from "../instagram/features/ExplorePlatformFeatureTemplate";
import { UnlimitedAccessBenefitTemplate } from "../instagram/features/UnlimitedAccessBenefitTemplate";
import { PersonalizedPlansBenefitTemplate } from "../instagram/features/PersonalizedPlansBenefitTemplate";
import { SaveFavoritesBenefitTemplate } from "../instagram/features/SaveFavoritesBenefitTemplate";
import { PersonalDashboardBenefitTemplate } from "../instagram/features/PersonalDashboardBenefitTemplate";
import { GoalSettingBenefitTemplate } from "../instagram/features/GoalSettingBenefitTemplate";
import { WorkoutLeaderboardTemplate } from "../instagram/community/WorkoutLeaderboardTemplate";
import { ProgramLeaderboardTemplate } from "../instagram/community/ProgramLeaderboardTemplate";
import { OnlineFitnessRedefinedCardTemplate } from "../instagram/hero/OnlineFitnessRedefinedCardTemplate";
import { GymInPocketCardTemplate } from "../instagram/hero/GymInPocketCardTemplate";
import { HumanNotAIHeroCardTemplate } from "../instagram/hero/HumanNotAIHeroCardTemplate";
import { TrainAnywhereCardTemplate as TrainAnywhereHeroCardTemplate } from "../instagram/hero/TrainAnywhereCardTemplate";
import { WorkoutsNavCardTemplate } from "../instagram/hero/WorkoutsNavCardTemplate";
import { ProgramsNavCardTemplate } from "../instagram/hero/ProgramsNavCardTemplate";
import { ToolsNavCardTemplate } from "../instagram/hero/ToolsNavCardTemplate";
import { LibraryNavCardTemplate } from "../instagram/hero/LibraryNavCardTemplate";
import { BlogNavCardTemplate } from "../instagram/hero/BlogNavCardTemplate";
import { CoachNavCardTemplate } from "../instagram/hero/CoachNavCardTemplate";
import { TabletWithSixCardsTemplate } from "../instagram/hero/TabletWithSixCardsTemplate";
import { WelcomeHeroCompositeTemplate } from "../instagram/hero/WelcomeHeroCompositeTemplate";
import { WhoIsForCompositeTemplate } from "../instagram/audience/WhoIsForCompositeTemplate";
import { BusyAdultsCardTemplate } from "../instagram/audience/BusyAdultsCardTemplate";
import { ParentsCardTemplate } from "../instagram/audience/ParentsCardTemplate";
import { BeginnersCardTemplate } from "../instagram/audience/BeginnersCardTemplate";
import { IntermediateCardTemplate } from "../instagram/audience/IntermediateCardTemplate";
import { TravelersCardTemplate } from "../instagram/audience/TravelersCardTemplate";
import { GymGoersCardTemplate } from "../instagram/audience/GymGoersCardTemplate";
import { WhatWeStandForCompositeTemplate } from "../instagram/values/WhatWeStandForCompositeTemplate";
import { EvidenceBasedCardTemplate } from "../instagram/values/EvidenceBasedCardTemplate";
import { StructureClarityCardTemplate } from "../instagram/values/StructureClarityCardTemplate";
import { HumanConnectionCardTemplate } from "../instagram/values/HumanConnectionCardTemplate";
import { ResultsDrivenCardTemplate } from "../instagram/values/ResultsDrivenCardTemplate";
import { SmartyGymPromiseTemplate } from "../instagram/promise/SmartyGymPromiseTemplate";
import { HarisFalasMessageTemplate } from "../instagram/coach/HarisFalasMessageTemplate";

interface Template {
  id: string;
  name: string;
  component: React.ComponentType;
}

// All templates in one unified array
const allTemplates: Template[] = [
  // Composite
  { id: "full-hero", name: "Complete Hero", component: FullHeroCompositeTemplate },
  { id: "home-hero", name: "Homepage Hero", component: HomeHeroCompositeTemplate },
  { id: "human-not-ai", name: "100% Human. 0% AI.", component: HumanNotAICompositeTemplate },
  { id: "gold-plan-composite", name: "Gold Plan (Full)", component: GoldPlanCompositeTemplate },
  { id: "platinum-plan-composite", name: "Platinum Plan (Full)", component: PlatinumPlanCompositeTemplate },
  { id: "services-overview", name: "Services Overview", component: ServicesOverviewCompositeTemplate },
  { id: "workout-categories", name: "Workout Categories", component: WorkoutCategoriesCompositeTemplate },
  { id: "program-categories", name: "Program Categories", component: ProgramCategoriesCompositeTemplate },
  { id: "fitness-tools", name: "Fitness Tools", component: FitnessToolsCompositeTemplate },
  // Hero
  { id: "welcome-hero-composite", name: "Welcome Hero", component: WelcomeHeroCompositeTemplate },
  { id: "tablet-six-cards", name: "Tablet with 6 Cards", component: TabletWithSixCardsTemplate },
  { id: "online-fitness-redefined", name: "Online Fitness Redefined", component: OnlineFitnessRedefinedCardTemplate },
  { id: "gym-in-pocket-hero", name: "Gym In Your Pocket (Hero)", component: GymInPocketCardTemplate },
  { id: "human-not-ai-hero", name: "100% Human. 0% AI. (Hero)", component: HumanNotAIHeroCardTemplate },
  { id: "train-anywhere-hero", name: "Train Anywhere (Hero)", component: TrainAnywhereHeroCardTemplate },
  { id: "workouts-nav", name: "500+ Expert Workouts", component: WorkoutsNavCardTemplate },
  { id: "programs-nav", name: "Programs (Nav)", component: ProgramsNavCardTemplate },
  { id: "tools-nav", name: "Smart Tools (Nav)", component: ToolsNavCardTemplate },
  { id: "library-nav", name: "Exercise Library (Nav)", component: LibraryNavCardTemplate },
  { id: "blog-nav", name: "Blog & Articles (Nav)", component: BlogNavCardTemplate },
  { id: "coach-nav", name: "Expert Coach (Nav)", component: CoachNavCardTemplate },
  // Services
  { id: "workouts-service", name: "Workouts", component: WorkoutsCardTemplate },
  { id: "programs-service", name: "Training Programs", component: ProgramsCardTemplate },
  { id: "exercise-library", name: "Exercise Library", component: ExerciseLibraryCardTemplate },
  { id: "1rm-calc", name: "1RM Calculator", component: OneRMCardTemplate },
  { id: "bmr-calc", name: "BMR Calculator", component: BMRCardTemplate },
  { id: "macro-tracker", name: "Macro Tracker", component: MacroCardTemplate },
  { id: "gold-plan", name: "Gold Plan", component: GoldPlanCardTemplate },
  { id: "platinum-plan", name: "Platinum Plan", component: PlatinumPlanCardTemplate },
  // Brand
  { id: "real-expertise", name: "Real Expertise", component: RealExpertiseCardTemplate },
  { id: "personal-touch", name: "Personal Touch", component: PersonalTouchCardTemplate },
  { id: "not-robot", name: "Not a Robot", component: NotARobotCardTemplate },
  { id: "gym-in-pocket", name: "Your Gym In Pocket", component: YourGymInPocketCardTemplate },
  { id: "human-not-ai-card", name: "100% Human. 0% AI.", component: HumanNotAICardTemplate },
  { id: "train-anywhere", name: "Train Anywhere", component: TrainAnywhereCardTemplate },
  // Workouts
  { id: "strength", name: "Strength", component: StrengthCardTemplate },
  { id: "calorie-burning", name: "Calorie Burning", component: CalorieBurningCardTemplate },
  { id: "metabolic", name: "Metabolic", component: MetabolicCardTemplate },
  { id: "cardio", name: "Cardio", component: CardioCardTemplate },
  { id: "mobility", name: "Mobility", component: MobilityCardTemplate },
  { id: "challenge", name: "Challenge", component: ChallengeCardTemplate },
  // Programs
  { id: "cardio-endurance", name: "Cardio Endurance", component: CardioEnduranceCardTemplate },
  { id: "functional-strength", name: "Functional Strength", component: FunctionalStrengthCardTemplate },
  { id: "muscle-hypertrophy", name: "Muscle Hypertrophy", component: MuscleHypertrophyCardTemplate },
  { id: "weight-loss", name: "Weight Loss", component: WeightLossCardTemplate },
  { id: "low-back-pain", name: "Low Back Pain", component: LowBackPainCardTemplate },
  { id: "mobility-stability", name: "Mobility & Stability", component: MobilityStabilityCardTemplate },
  // Tools
  { id: "1rm-tool", name: "1RM Calculator Tool", component: OneRMToolCardTemplate },
  { id: "bmr-tool", name: "BMR Calculator Tool", component: BMRToolCardTemplate },
  { id: "macro-tool", name: "Macro Tracker Tool", component: MacroToolCardTemplate },
  // Features
  { id: "browse-workouts", name: "Browse Workouts", component: BrowseWorkoutsFeatureTemplate },
  { id: "browse-programs", name: "Browse Programs", component: BrowseProgramsFeatureTemplate },
  { id: "explore-platform", name: "Explore Platform", component: ExplorePlatformFeatureTemplate },
  { id: "unlimited-access", name: "Unlimited Access", component: UnlimitedAccessBenefitTemplate },
  { id: "personalized-plans", name: "Personalized Plans", component: PersonalizedPlansBenefitTemplate },
  { id: "save-favorites", name: "Save Favorites", component: SaveFavoritesBenefitTemplate },
  { id: "personal-dashboard", name: "Personal Dashboard", component: PersonalDashboardBenefitTemplate },
  { id: "goal-setting", name: "Goal Setting", component: GoalSettingBenefitTemplate },
  // Audience
  { id: "who-is-for-composite", name: "Who Is SmartyGym For?", component: WhoIsForCompositeTemplate },
  { id: "busy-adults", name: "Busy Adults", component: BusyAdultsCardTemplate },
  { id: "parents", name: "Parents", component: ParentsCardTemplate },
  { id: "beginners", name: "Beginners", component: BeginnersCardTemplate },
  { id: "intermediate", name: "Intermediate", component: IntermediateCardTemplate },
  { id: "travelers", name: "Travelers", component: TravelersCardTemplate },
  { id: "gym-goers", name: "Gym-Goers", component: GymGoersCardTemplate },
  // Values
  { id: "what-we-stand-for", name: "What We Stand For", component: WhatWeStandForCompositeTemplate },
  { id: "evidence-based", name: "Evidence-Based", component: EvidenceBasedCardTemplate },
  { id: "structure-clarity", name: "Structure & Clarity", component: StructureClarityCardTemplate },
  { id: "human-connection", name: "Human Connection", component: HumanConnectionCardTemplate },
  { id: "results-driven", name: "Results-Driven", component: ResultsDrivenCardTemplate },
  // Promise
  { id: "smartygym-promise", name: "SmartyGym Promise", component: SmartyGymPromiseTemplate },
  // Coach
  { id: "haris-message", name: "Haris Falas Message", component: HarisFalasMessageTemplate },
  // Community
  { id: "workout-leaderboard", name: "Workout Leaderboard", component: WorkoutLeaderboardTemplate },
  { id: "program-leaderboard", name: "Program Leaderboard", component: ProgramLeaderboardTemplate },
];

export const PicturesGallery = () => {
  const [selectedSizes, setSelectedSizes] = useState<Record<string, InstagramSize>>(
    Object.fromEntries(allTemplates.map(t => [t.id, INSTAGRAM_SIZES[0]]))
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
      toast.success(`Downloaded ${templateName}`);
    } catch (error) {
      toast.error("Failed to download image");
      console.error(error);
    }
  };

  const handleDownloadAll = async () => {
    toast.loading("Downloading all pictures...", { id: "download-all" });
    let successCount = 0;
    
    for (const template of allTemplates) {
      try {
        await handleDownload(template.id, template.name);
        successCount++;
        // Small delay between downloads to prevent browser throttling
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.error(`Failed to download ${template.name}:`, error);
      }
    }
    
    toast.success(`Downloaded ${successCount}/${allTemplates.length} pictures!`, { id: "download-all" });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{allTemplates.length} pictures available</p>
        <Button onClick={handleDownloadAll} variant="default" className="gap-2">
          <Download className="w-4 h-4" />
          Download All
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {allTemplates.map((template) => {
          const TemplateComponent = template.component;
          return (
            <Card key={template.id} className="overflow-hidden">
              <div 
                id={`export-${template.id}`} 
                className="h-40 bg-muted relative group cursor-pointer overflow-hidden"
                onClick={() => setPreviewTemplate(template)}
              >
                <div className="scale-[0.15] origin-top-left">
                  <TemplateComponent />
                </div>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Eye className="w-10 h-10 text-white" />
                </div>
              </div>
              
              <CardContent className="p-2 space-y-2">
                <h4 className="text-xs font-medium truncate" title={template.name}>{template.name}</h4>
                <div className="flex gap-1">
                  <Select
                    value={selectedSizes[template.id]?.name || "square"}
                    onValueChange={(value) => {
                      const size = INSTAGRAM_SIZES.find(s => s.name === value);
                      if (size) {
                        setSelectedSizes(prev => ({ ...prev, [template.id]: size }));
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(template.id, template.name);
                    }}
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            {previewTemplate && (
              <div id={`export-${previewTemplate.id}`} className="max-w-full overflow-auto">
                <previewTemplate.component />
              </div>
            )}
          </div>
          <div className="flex justify-center gap-2 mt-4">
            <Select
              value={previewTemplate ? selectedSizes[previewTemplate.id]?.name : "square"}
              onValueChange={(value) => {
                if (!previewTemplate) return;
                const size = INSTAGRAM_SIZES.find(s => s.name === value);
                if (size) {
                  setSelectedSizes(prev => ({ ...prev, [previewTemplate.id]: size }));
                }
              }}
            >
              <SelectTrigger className="w-40">
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
              onClick={() => previewTemplate && handleDownload(previewTemplate.id, previewTemplate.name)}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
