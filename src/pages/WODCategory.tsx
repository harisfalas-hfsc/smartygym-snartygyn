import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Eye, Check, Heart, Crown, ShoppingCart, Clock, Dumbbell, Flame, Star, Home, TrendingUp } from "lucide-react";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";
import { ContentLoadingSkeleton } from "@/components/ContentLoadingSkeleton";
import { useAllWorkouts } from "@/hooks/useWorkoutData";
import { useWorkoutInteractions } from "@/hooks/useWorkoutInteractions";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { WODTimeline } from "@/components/WODTimeline";
const WODCategory = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | undefined>();

  // Fetch current user
  useEffect(() => {
    supabase.auth.getUser().then(({
      data: {
        user
      }
    }) => {
      setUserId(user?.id);
    });
  }, []);

  // Fetch workouts and interactions from database
  const {
    data: allWorkouts = [],
    isLoading
  } = useAllWorkouts();
  const {
    data: interactions = []
  } = useWorkoutInteractions(userId);

  // Get BOTH current WODs (is_workout_of_day = true)
  const currentWODs = allWorkouts.filter(workout => workout.is_workout_of_day === true);
  const bodyweightWOD = currentWODs.find(w => w.equipment === "BODYWEIGHT");
  const equipmentWOD = currentWODs.find(w => w.equipment === "EQUIPMENT");

  // Get interactions for current WODs
  const getInteraction = (workoutId: string | undefined) => {
    if (!workoutId) return null;
    return interactions.find(i => i.workout_id === workoutId);
  };

  // Helper function to check if workout is new (created within last 2 days)
  const isNew = (createdAt: string | null | undefined) => {
    if (!createdAt) return false;
    const daysSinceCreation = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceCreation <= 2;
  };

  // Strip HTML tags from description
  const stripHtml = (html: string | null | undefined) => {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, "");
  };

  // Render a single WOD card
  const renderWODCard = (wod: typeof bodyweightWOD, isBodyweight: boolean) => {
    if (!wod) return null;
    const interaction = getInteraction(wod.id);
    const equipmentIcon = isBodyweight ? <Home className="w-4 h-4" /> : <Dumbbell className="w-4 h-4" />;
    const equipmentLabel = isBodyweight ? "No Equipment" : "With Equipment";
    return <Card className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-primary/60 flex-1" onClick={() => navigate(`/workout/wod/${wod.id}`)}>
        {/* Image */}
        <div className="relative aspect-video overflow-hidden">
          <img src={wod.image_url || "/placeholder.svg"} alt={wod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

          {/* Equipment Badge - Top Left */}
          <Badge className={`absolute top-3 left-3 ${isBodyweight ? 'bg-blue-500' : 'bg-orange-500'} text-white border-0`}>
            {equipmentIcon}
            <span className="ml-1">{equipmentLabel}</span>
          </Badge>

          {/* NEW Badge */}
          {isNew(wod.created_at) && <Badge className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
              NEW
            </Badge>}

          {/* Status badges for logged-in users */}
          {userId && interaction && <div className="absolute bottom-12 right-3 flex gap-2">
              {interaction.is_completed && <Badge className="bg-green-500/90 text-white border-0">
                  <Check className="w-3 h-3 mr-1" />
                  Done
                </Badge>}
              {interaction.has_viewed && !interaction.is_completed && <Badge className="bg-blue-500/90 text-white border-0">
                  <Eye className="w-3 h-3 mr-1" />
                  Viewed
                </Badge>}
              {interaction.is_favorite && <Badge className="bg-pink-500/90 text-white border-0">
                  <Heart className="w-3 h-3 mr-1" />
                </Badge>}
            </div>}

          {/* Access Badge - Bottom */}
          <div className="absolute bottom-3 right-3">
            {wod.is_premium ? <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge> : wod.is_standalone_purchase && wod.price ? <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-lg">
                <ShoppingCart className="w-3 h-3 mr-1" />
                €{wod.price.toFixed(2)}
              </Badge> : <Badge className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-0 shadow-lg">
                <Check className="w-3 h-3 mr-1" />
                Free
              </Badge>}
          </div>
        </div>

        {/* Card Content */}
        <CardContent className="p-3 sm:p-4">
          {/* Title */}
          <h3 className="text-lg sm:text-xl font-bold text-foreground mb-1.5 group-hover:text-primary transition-colors line-clamp-1">
            {wod.name}
          </h3>

          {/* Description */}
          {wod.description && <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
              {stripHtml(wod.description).substring(0, 120)}...
            </p>}

          {/* Compact Metadata Display - Horizontal Layout */}
          <div className="space-y-1.5 mb-2 text-sm">
            {/* Row 1: Format + Difficulty + Duration */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm">
              <div className="flex items-center gap-1">
                <Flame className="w-3 h-3 text-primary" />
                <span className="text-muted-foreground">{wod.format || "Standard"}</span>
              </div>
              <span className="text-muted-foreground/50">•</span>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-primary" />
                <span className="text-muted-foreground">
                  {wod.difficulty || "All Levels"} {wod.difficulty_stars && `(${wod.difficulty_stars}⭐)`}
                </span>
              </div>
              <span className="text-muted-foreground/50">•</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-primary" />
                <span className="text-muted-foreground">{wod.duration || "45-60 min"}</span>
              </div>
            </div>
            {/* Row 2: Premium + BUY badges only */}
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 text-xs py-0.5">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
              {wod.is_standalone_purchase && wod.price && <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 cursor-help text-xs py-0.5">
                        <ShoppingCart className="w-3 h-3 mr-1" />
                        BUY €{wod.price.toFixed(2)}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Buy this workout individually to try our coaching style</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>}
            </div>
          </div>

          {/* CTA Button */}
          <Button className="w-full" size="sm">
            View Workout
          </Button>
        </CardContent>
      </Card>;
  };
  return <>
      {isLoading ? <div className="min-h-screen bg-background py-8 px-4">
          <div className="container mx-auto max-w-7xl">
            <ContentLoadingSkeleton />
          </div>
        </div> : <>
          <Helmet>
            <title>Smarty Workouts | Workout of the Day | Daily Expert Workouts | SmartyGym</title>
            <meta name="description" content="Two daily expert-designed workouts at 7:00 AM - one with equipment, one without. Following a 6-day periodization cycle. Your SmartyGym: the gym that never closes." />
            <meta name="keywords" content="workout of the day, WOD, daily workouts, bodyweight workout, equipment workout, online gym, periodization, Haris Falas" />
            <meta property="og:title" content="Workout of the Day | SmartyGym" />
            <meta property="og:description" content="Two daily expert-designed workouts - choose equipment or bodyweight" />
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://smartygym.com/workout/wod" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="Workout of the Day | SmartyGym" />
            <meta name="twitter:description" content="Fresh workouts every day at 7:00 AM" />
            <link rel="canonical" href="https://smartygym.com/workout/wod" />
          </Helmet>

          <div className="min-h-screen bg-background">
            <div className="container mx-auto max-w-5xl px-4 py-8">
              <Button variant="ghost" size="sm" onClick={() => navigate("/workout")} className="mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                <span className="text-xs sm:text-sm">Back</span>
              </Button>

              <PageBreadcrumbs items={[{
            label: "Home",
            href: "/"
          }, {
            label: "Smarty Workouts",
            href: "/workout"
          }, {
            label: "WOD"
          }]} />

              {/* About Workout of the Day Card */}
              <Card className="mb-8 bg-gradient-to-br from-primary/5 via-background to-primary/5 border-2 border-primary/40 shadow-primary">
                <div className="p-4 sm:p-6">
                  <h1 className="text-xl sm:text-2xl font-bold mb-3 text-center">About Workout of the Day</h1>
                  <p className="text-sm sm:text-base text-center text-muted-foreground max-w-3xl mx-auto">
                    Every day SmartyGym delivers TWO fresh, expertly designed workouts following a strategic periodization cycle — one with equipment and one without. Each day focuses on a different training style: Strength, Calorie Burning, Metabolic, Cardio, Mobility & Stability, and Challenge. Choose based on your situation: at home, traveling, in your office, or at the gym.
                  </p>
                </div>
              </Card>

              {/* Yesterday/Today/Tomorrow Timeline */}
              <WODTimeline />

              {/* Two WOD Cards Side by Side */}
              {bodyweightWOD || equipmentWOD ? <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderWODCard(bodyweightWOD, true)}
                  {renderWODCard(equipmentWOD, false)}
                </div> : (/* No WOD Available */
          <Card className="border-2 border-dashed border-primary/30">
                  <CardContent className="p-12 text-center">
                    <Clock className="w-16 h-16 text-primary/50 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      Today's Workouts are Being Prepared
                    </h2>
                    <p className="text-muted-foreground">
                      Check back at <span className="text-primary font-semibold">7:00 AM</span> for your fresh Workouts of the Day!
                    </p>
                  </CardContent>
                </Card>)}

            </div>
          </div>
        </>}
    </>;
};
export default WODCategory;