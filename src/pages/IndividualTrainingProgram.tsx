import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { WorkoutDisplay } from "@/components/WorkoutDisplay";
import { AccessGate } from "@/components/AccessGate";
import { PurchaseButton } from "@/components/PurchaseButton";
import { useTrainingProgramData } from "@/hooks/useTrainingProgramData";
import { useAccessControl } from "@/hooks/useAccessControl";
import { ContentNotFound } from "@/components/ContentNotFound";
import { useShowBackButton } from "@/hooks/useShowBackButton";

const IndividualTrainingProgram = () => {
  const { type, id } = useParams();
  const { userTier, hasPurchased } = useAccessControl();
  const { goBack } = useShowBackButton();
  
  // Helper function to format focus label
  const getFocusLabel = (type: string | undefined): string => {
    const focusMap: { [key: string]: string } = {
      'cardio': 'Cardio',
      'functional': 'Functional Training',
      'hypertrophy': 'Hypertrophy',
      'weightloss': 'Weight Loss',
      'weight-loss': 'Weight Loss',
      'backcare': 'Back Care',
      'back-care': 'Back Care',
      'mobility': 'Mobility & Stability',
      'strength': 'Strength',
      'endurance': 'Endurance'
    };
    return focusMap[type || ''] || 'General Training';
  };

  
  // Fetch program from database
  const { data: dbProgram, isLoading: isLoadingDb } = useTrainingProgramData(id);

  // If we have database program, use it directly
  if (isLoadingDb) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading program...</p>
      </div>
    );
  }

  if (dbProgram) {
    const isPremium = dbProgram.is_premium;
    const canPurchase = dbProgram.is_standalone_purchase && dbProgram.price && isPremium;
    const alreadyPurchased = hasPurchased(dbProgram.id, "program");
    const hasAccess = userTier === "premium" || alreadyPurchased || !isPremium;

    return (
      <>
        <Helmet>
          <title>{dbProgram.name} | Online Training Program by Haris Falas | SmartyGym</title>
          <meta name="description" content={`${dbProgram.description || dbProgram.name} - ${dbProgram.weeks} week online training program by Sports Scientist Haris Falas. ${dbProgram.category} program. ${dbProgram.days_per_week} days per week. ${dbProgram.equipment}.`} />
          <meta name="keywords" content={`${dbProgram.name}, online training programs, ${dbProgram.category} program, ${dbProgram.weeks} week program, Haris Falas, online fitness programs, online personal training, structured training program`} />
          
          {/* Open Graph */}
          <meta property="og:type" content="article" />
          <meta property="og:url" content={window.location.href} />
          <meta property="og:title" content={`${dbProgram.name} | Online Training Program by Haris Falas`} />
          <meta property="og:description" content={dbProgram.description || `${dbProgram.weeks} week ${dbProgram.category} program designed by Sports Scientist Haris Falas`} />
          <meta property="og:image" content={dbProgram.image_url} />
          
          {/* Twitter */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={`${dbProgram.name} | Training Program`} />
          <meta name="twitter:description" content={dbProgram.description || dbProgram.name} />
          <meta name="twitter:image" content={dbProgram.image_url} />
          
          <link rel="canonical" href={window.location.href} />
          
          {/* Structured Data - ExercisePlan */}
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ExercisePlan",
              "name": dbProgram.name,
              "description": dbProgram.description,
              "image": dbProgram.image_url,
              "duration": `P${dbProgram.weeks}W`,
              "category": dbProgram.category,
               "exerciseType": dbProgram.category,
              "intensity": dbProgram.difficulty_stars ? `${dbProgram.difficulty_stars} stars` : undefined,
              "repetitions": `${dbProgram.days_per_week} days per week`,
              "workLocation": "Online / Home / Gym",
              "author": {
                "@type": "Person",
                "name": "Haris Falas",
                "jobTitle": "Sports Scientist & Strength Coach",
                "description": "Online personal trainer specializing in structured training programs"
              },
              "identifier": dbProgram.id,
              "offers": dbProgram.is_standalone_purchase ? {
                "@type": "Offer",
                "price": dbProgram.price,
                "priceCurrency": "EUR"
              } : undefined
            })}
          </script>
        </Helmet>
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
              <Button
                variant="outline"
                onClick={goBack}
                className="gap-2"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                <span className="text-xs sm:text-sm">Back</span>
              </Button>
            </div>

            {/* Show purchase button for standalone purchases */}
            {canPurchase && !hasAccess && (
              <div className="mb-6">
                <Card className="border-primary/50 bg-gradient-to-r from-primary/5 to-primary/10">
                  <div className="p-6 text-center space-y-4">
                    <h3 className="text-xl font-semibold">
                      {alreadyPurchased ? "You Own This Program" : "Get Instant Access"}
                    </h3>
                    <p className="text-muted-foreground">
                      {alreadyPurchased 
                        ? "This program is in your library" 
                        : "Purchase this program once and own it forever"}
                    </p>
                    <div className="text-3xl font-bold text-primary">
                      €{Number(dbProgram.price).toFixed(2)}
                    </div>
                    {!alreadyPurchased && (
                      <PurchaseButton
                        contentId={dbProgram.id}
                        contentType="program"
                        contentName={dbProgram.name}
                        price={Number(dbProgram.price) || 0}
                        stripeProductId={dbProgram.stripe_product_id}
                        stripePriceId={dbProgram.stripe_price_id}
                      />
                    )}
                  </div>
                </Card>
              </div>
            )}

            <AccessGate 
              requireAuth={true} 
              requirePremium={isPremium && !hasAccess} 
              contentType="program"
              contentId={dbProgram.id}
              contentName={dbProgram.name}
              price={canPurchase ? Number(dbProgram.price) : undefined}
              stripePriceId={dbProgram.stripe_price_id || undefined}
              stripeProductId={dbProgram.stripe_product_id || undefined}
            >
              <WorkoutDisplay
                exercises={[]}
                planContent=""
                title={dbProgram.name}
                serial={dbProgram.id}
                focus={dbProgram.category || getFocusLabel(type)}
                difficulty={dbProgram.difficulty_stars || 3}
                imageUrl={dbProgram.image_url}
                duration={`${dbProgram.weeks} weeks / ${dbProgram.days_per_week} days per week`}
                equipment={dbProgram.equipment}
                description={dbProgram.description}
                overview={dbProgram.overview}
                target_audience={dbProgram.target_audience}
                program_structure={dbProgram.program_structure}
                weekly_schedule={dbProgram.weekly_schedule}
                progression_plan={dbProgram.progression_plan}
                nutrition_tips={dbProgram.nutrition_tips}
                expected_results={dbProgram.expected_results}
                programId={id}
                programType={type || ''}
                isFreeContent={!isPremium}
              />
            </AccessGate>
          </div>
        </div>
      </>
    );
  }

  // No program found in database
  return (
    <ContentNotFound contentType="program" contentId={id || 'unknown'} />
  );
};

export default IndividualTrainingProgram;
