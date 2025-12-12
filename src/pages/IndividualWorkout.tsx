import { useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen } from "lucide-react";
import { WorkoutDisplay } from "@/components/WorkoutDisplay";
import { AccessGate } from "@/components/AccessGate";
import { useWorkoutData } from "@/hooks/useWorkoutData";
import { useAccessControl } from "@/hooks/useAccessControl";
import { ContentNotFound } from "@/components/ContentNotFound";
import { useShowBackButton } from "@/hooks/useShowBackButton";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";
import { ReaderModeDialog } from "@/components/ReaderModeDialog";
import { HTMLContent } from "@/components/ui/html-content";

const IndividualWorkout = () => {
  const [readerModeOpen, setReaderModeOpen] = useState(false);
  const { type, id } = useParams();
  const { userTier, hasPurchased } = useAccessControl();
  const { goBack } = useShowBackButton();
  
  // Helper function to get category label from database category field
  const getCategoryLabel = (category: string | undefined | null): string => {
    if (!category) return '';
    const categoryMap: { [key: string]: string } = {
      'STRENGTH': 'Strength',
      'CALORIE BURNING': 'Calorie Burning',
      'METABOLIC': 'Metabolic',
      'CARDIO': 'Cardio',
      'CARDIO ENDURANCE': 'Cardio Endurance',
      'MOBILITY & STABILITY': 'Mobility & Stability',
      'CHALLENGE': 'Challenge',
      // Lowercase versions for focus field
      'strength': 'Strength',
      'calorie-burning': 'Calorie Burning',
      'metabolic': 'Metabolic',
      'cardio': 'Cardio',
      'cardio-endurance': 'Cardio Endurance',
      'mobility-stability': 'Mobility & Stability',
      'challenge': 'Challenge'
    };
    return categoryMap[category] || category;
  };


  // Fetch from database
  const { data: dbWorkout, isLoading: isLoadingDb } = useWorkoutData(id);

  // If we have database workout, use it directly
  if (isLoadingDb) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading workout...</p>
      </div>
    );
  }

  if (dbWorkout) {
    return (
      <>
        <Helmet>
          <title>{dbWorkout.name} | Online Workout by Haris Falas | SmartyGym</title>
          <meta name="description" content={`${dbWorkout.description || dbWorkout.name} - Professional online workout by Sports Scientist Haris Falas. ${dbWorkout.duration} ${dbWorkout.format} workout. ${dbWorkout.equipment}.`} />
          <meta name="keywords" content={`${dbWorkout.name}, online workouts, ${dbWorkout.format} workout, ${dbWorkout.category} training, Haris Falas, online fitness, ${dbWorkout.equipment} workout`} />
          
          {/* Open Graph */}
          <meta property="og:type" content="article" />
          <meta property="og:url" content={window.location.href} />
          <meta property="og:title" content={`${dbWorkout.name} | Online Workout by Haris Falas`} />
          <meta property="og:description" content={dbWorkout.description || `Professional ${dbWorkout.format} workout designed by Sports Scientist`} />
          <meta property="og:image" content={dbWorkout.image_url} />
          
          {/* Twitter */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={`${dbWorkout.name} | Online Workout`} />
          <meta name="twitter:description" content={dbWorkout.description || dbWorkout.name} />
          <meta name="twitter:image" content={dbWorkout.image_url} />
          
          <link rel="canonical" href={window.location.href} />
          
          {/* Structured Data - ExercisePlan */}
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ExercisePlan",
              "name": dbWorkout.name,
              "description": dbWorkout.description,
              "image": dbWorkout.image_url,
              "duration": dbWorkout.duration,
              "category": dbWorkout.category,
              "activityDuration": dbWorkout.duration,
              "workLocation": "Online / Home / Gym",
              "author": {
                "@type": "Person",
                "name": "Haris Falas",
                "jobTitle": "Sports Scientist & Strength Coach",
                "description": "Fitness expert and personal trainer"
              },
              "identifier": dbWorkout.id
            })}
          </script>
        </Helmet>
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-4 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={goBack}
                className="gap-2"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                <span className="text-xs sm:text-sm">Back</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReaderModeOpen(true)}
                className="gap-2"
              >
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Reader Mode</span>
              </Button>
            </div>

            <PageBreadcrumbs items={[
              { label: "Home", href: "/" },
              { label: "Smarty Workouts", href: "/workout" },
              { label: dbWorkout.name }
            ]} />

            <ReaderModeDialog
              open={readerModeOpen}
              onOpenChange={setReaderModeOpen}
              title={dbWorkout.name}
              metadata={{
                duration: dbWorkout.duration || undefined,
                equipment: dbWorkout.equipment || undefined,
                category: getCategoryLabel(dbWorkout.category)
              }}
              content={
                <div className="space-y-6">
                  {dbWorkout.description && (
                    <div>
                      <h2 className="text-lg font-semibold mb-2">Description</h2>
                      <HTMLContent content={dbWorkout.description} />
                    </div>
                  )}
                  {dbWorkout.warm_up && (
                    <div>
                      <h2 className="text-lg font-semibold mb-2">Warm Up</h2>
                      <HTMLContent content={dbWorkout.warm_up} />
                    </div>
                  )}
                  {dbWorkout.activation && (
                    <div>
                      <h2 className="text-lg font-semibold mb-2">Activation</h2>
                      <HTMLContent content={dbWorkout.activation} />
                    </div>
                  )}
                  {dbWorkout.main_workout && (
                    <div>
                      <h2 className="text-lg font-semibold mb-2">Main Workout</h2>
                      <HTMLContent content={dbWorkout.main_workout} />
                    </div>
                  )}
                  {dbWorkout.finisher && (
                    <div>
                      <h2 className="text-lg font-semibold mb-2">Finisher</h2>
                      <HTMLContent content={dbWorkout.finisher} />
                    </div>
                  )}
                  {dbWorkout.cool_down && (
                    <div>
                      <h2 className="text-lg font-semibold mb-2">Cool Down</h2>
                      <HTMLContent content={dbWorkout.cool_down} />
                    </div>
                  )}
                  {dbWorkout.instructions && (
                    <div>
                      <h2 className="text-lg font-semibold mb-2">Instructions</h2>
                      <HTMLContent content={dbWorkout.instructions} />
                    </div>
                  )}
                  {dbWorkout.tips && (
                    <div>
                      <h2 className="text-lg font-semibold mb-2">Tips</h2>
                      <HTMLContent content={dbWorkout.tips} />
                    </div>
                  )}
                </div>
              }
            />

            <AccessGate 
              requireAuth={true} 
              requirePremium={dbWorkout?.is_premium || false}
              contentType="workout"
              contentId={dbWorkout.id}
              contentName={dbWorkout.name}
              price={dbWorkout.price || undefined}
              stripePriceId={dbWorkout.stripe_price_id || undefined}
              stripeProductId={dbWorkout.stripe_product_id || undefined}
            >
              <WorkoutDisplay
                exercises={[]}
                planContent=""
                title={dbWorkout.name}
                serial={dbWorkout.id}
                focus={getCategoryLabel(dbWorkout.category)}
                difficulty={dbWorkout.difficulty_stars || 3}
                workoutType={dbWorkout.format}
                imageUrl={dbWorkout.image_url}
                duration={dbWorkout.duration}
                equipment={dbWorkout.equipment}
                description={dbWorkout.description}
                format={dbWorkout.format}
                instructions={dbWorkout.instructions}
                tips={dbWorkout.tips}
                activation={dbWorkout.activation}
                warm_up={dbWorkout.warm_up}
                main_workout={dbWorkout.main_workout}
                finisher={dbWorkout.finisher}
                cool_down={dbWorkout.cool_down}
                workoutId={id}
                workoutCategory={type || ''}
                isFreeContent={!dbWorkout.is_premium}
              />
            </AccessGate>
          </div>
        </div>
      </>
    );
  }

  // No workout found in database
  return (
    <ContentNotFound contentType="workout" contentId={id || 'unknown'} />
  );
};

export default IndividualWorkout;