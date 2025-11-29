import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Eye, Check, Heart, Crown, ShoppingCart, Clock, Dumbbell, Flame, Star } from "lucide-react";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";
import { ContentLoadingSkeleton } from "@/components/ContentLoadingSkeleton";
import { useAllWorkouts } from "@/hooks/useWorkoutData";
import { useWorkoutInteractions } from "@/hooks/useWorkoutInteractions";
import { supabase } from "@/integrations/supabase/client";

const WODCategory = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | undefined>();

  // Fetch current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id);
    });
  }, []);

  // Fetch workouts and interactions from database
  const { data: allWorkouts = [], isLoading } = useAllWorkouts();
  const { data: interactions = [] } = useWorkoutInteractions(userId);

  // Get ONLY the current WOD (is_workout_of_day = true)
  const currentWOD = allWorkouts.find(workout => workout.is_workout_of_day === true);

  // Get interaction for current WOD
  const wodInteraction = currentWOD
    ? interactions.find(i => i.workout_id === currentWOD.id)
    : null;

  // Helper function to check if workout is new (created within last 7 days)
  const isNew = (createdAt: string | null | undefined) => {
    if (!createdAt) return false;
    const daysSinceCreation = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceCreation <= 7;
  };

  // Strip HTML tags from description
  const stripHtml = (html: string | null | undefined) => {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, "");
  };

  return (
    <>
      {isLoading ? (
        <div className="min-h-screen bg-background py-8 px-4">
          <div className="container mx-auto max-w-7xl">
            <ContentLoadingSkeleton />
          </div>
        </div>
      ) : (
        <>
          <Helmet>
            <title>Workout of the Day | Daily Expert Workouts | SmartyGym</title>
            <meta name="description" content="Daily expert-designed workouts at 7:00 AM following a 6-day periodization cycle: Strength, Calorie Burning, Metabolic, Cardio, Mobility & Stability, Challenge. Your SmartyGym: the gym that never closes." />
            <meta name="keywords" content="workout of the day, WOD, daily workouts, online gym, periodization, strength training, cardio, metabolic, mobility, challenge workouts, Haris Falas" />

            <meta property="og:title" content="Workout of the Day | SmartyGym" />
            <meta property="og:description" content="Daily expert-designed workouts following a strategic periodization cycle" />
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://smartygym.com/workout/wod" />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="Workout of the Day | SmartyGym" />
            <meta name="twitter:description" content="Fresh workout every day at 7:00 AM" />

            <link rel="canonical" href="https://smartygym.com/workout/wod" />
          </Helmet>

          <div className="min-h-screen bg-background">
            <div className="container mx-auto max-w-4xl px-4 py-8">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/workout")}
                className="mb-6"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                <span className="text-xs sm:text-sm">Back</span>
              </Button>

              <PageBreadcrumbs
                items={[
                  { label: "Home", href: "/" },
                  { label: "Workouts", href: "/workout" },
                  { label: "WOD" }
                ]}
              />

              {/* About Workout of the Day Card */}
              <Card className="mb-8 bg-gradient-to-br from-primary/5 via-background to-primary/5 border-2 border-primary/40 shadow-gold">
                <div className="p-4 sm:p-6">
                  <h1 className="text-xl sm:text-2xl font-bold mb-3 text-center">About Workout of the Day</h1>
                  <div className="space-y-2 text-muted-foreground max-w-3xl mx-auto">
                    <p className="text-sm sm:text-base text-center">
                      Every day at 7:00 AM, <span className="text-primary font-semibold">Your SmartyGym: the gym that never closes and never takes a holiday</span> delivers a fresh, expertly designed workout following a strategic periodization cycle. Each day focuses on a different training style: <strong>Strength</strong>, <strong>Calorie Burning</strong>, <strong>Metabolic</strong>, <strong>Cardio</strong>, <strong>Mobility & Stability</strong>, and <strong>Challenge</strong> — rotating continuously for balanced, progressive training. It's like going to the gym and following the workout of the day — but you can do it at your local gym, at home, in your office, outdoors, or even while traveling.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Single WOD Card - Large & Centered */}
              {currentWOD ? (
                <Card
                  className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-primary/60"
                  onClick={() => navigate(`/workout/wod/${currentWOD.id}`)}
                >
                  {/* Large Image */}
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={currentWOD.image_url || "/placeholder.svg"}
                      alt={currentWOD.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* NEW Badge */}
                    {isNew(currentWOD.created_at) && (
                      <Badge className="absolute top-3 left-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
                        NEW
                      </Badge>
                    )}

                    {/* Status badges for logged-in users */}
                    {userId && wodInteraction && (
                      <div className="absolute top-3 right-3 flex gap-2">
                        {wodInteraction.is_completed && (
                          <Badge className="bg-green-500/90 text-white border-0">
                            <Check className="w-3 h-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                        {wodInteraction.has_viewed && !wodInteraction.is_completed && (
                          <Badge className="bg-blue-500/90 text-white border-0">
                            <Eye className="w-3 h-3 mr-1" />
                            Viewed
                          </Badge>
                        )}
                        {wodInteraction.is_favorite && (
                          <Badge className="bg-pink-500/90 text-white border-0">
                            <Heart className="w-3 h-3 mr-1" />
                            Favorite
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Access Badge - Bottom */}
                    <div className="absolute bottom-3 right-3">
                      {currentWOD.is_premium ? (
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg">
                          <Crown className="w-3 h-3 mr-1" />
                          Premium
                        </Badge>
                      ) : currentWOD.is_standalone_purchase && currentWOD.price ? (
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-lg">
                          <ShoppingCart className="w-3 h-3 mr-1" />
                          €{currentWOD.price.toFixed(2)}
                        </Badge>
                      ) : (
                        <Badge className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-0 shadow-lg">
                          <Check className="w-3 h-3 mr-1" />
                          Free
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Card Content */}
                  <CardContent className="p-6 sm:p-8">
                    {/* Title */}
                    <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors text-center">
                      {currentWOD.name}
                    </h2>

                    {/* Description */}
                    {currentWOD.description && (
                      <p className="text-muted-foreground mb-6 text-center max-w-2xl mx-auto line-clamp-3">
                        {stripHtml(currentWOD.description).substring(0, 200)}...
                      </p>
                    )}

                    {/* Metadata Badges */}
                    <div className="flex flex-wrap justify-center gap-2 mb-6">
                      {currentWOD.category && (
                        <Badge variant="outline" className="text-sm">
                          <Flame className="w-3 h-3 mr-1" />
                          {currentWOD.category}
                        </Badge>
                      )}
                      {currentWOD.format && (
                        <Badge variant="outline" className="text-sm">
                          {currentWOD.format}
                        </Badge>
                      )}
                      {currentWOD.difficulty && (
                        <Badge variant="outline" className="text-sm">
                          <Star className="w-3 h-3 mr-1" />
                          {currentWOD.difficulty}
                        </Badge>
                      )}
                      {currentWOD.equipment && (
                        <Badge variant="outline" className="text-sm">
                          <Dumbbell className="w-3 h-3 mr-1" />
                          {currentWOD.equipment}
                        </Badge>
                      )}
                      {currentWOD.duration && (
                        <Badge variant="outline" className="text-sm">
                          <Clock className="w-3 h-3 mr-1" />
                          {currentWOD.duration} min
                        </Badge>
                      )}
                    </div>

                    {/* CTA Button */}
                    <Button className="w-full text-lg py-6" size="lg">
                      View Today's Workout
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                /* No WOD Available */
                <Card className="border-2 border-dashed border-primary/30">
                  <CardContent className="p-12 text-center">
                    <Clock className="w-16 h-16 text-primary/50 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      Today's Workout is Being Prepared
                    </h2>
                    <p className="text-muted-foreground">
                      Check back at <span className="text-primary font-semibold">7:00 AM</span> for your fresh Workout of the Day!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default WODCategory;
