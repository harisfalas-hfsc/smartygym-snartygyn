import { useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { WorkoutDisplay } from "@/components/WorkoutDisplay";
import { AccessGate } from "@/components/AccessGate";
import { useTrainingProgramData } from "@/hooks/useTrainingProgramData";
import { useAccessControl } from "@/hooks/useAccessControl";
import { ContentNotFound } from "@/components/ContentNotFound";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";
import { ReaderModeDialog } from "@/components/ReaderModeDialog";
import { HTMLContent } from "@/components/ui/html-content";

// Helper function to generate SEO-optimized alt text
const generateProgramAltText = (program: any): string => {
  const parts = [
    program.name,
    program.weeks ? `${program.weeks} week` : '',
    program.difficulty ? `${program.difficulty} level` : '',
    program.category || '',
    'training program by Sports Scientist Haris Falas',
    'SmartyGym'
  ].filter(Boolean);
  return parts.join(' - ');
};

const IndividualTrainingProgram = () => {
  const [readerModeOpen, setReaderModeOpen] = useState(false);
  const { type, id } = useParams();
  const { userTier, hasPurchased } = useAccessControl();
  
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
    
    const programUrl = `https://smartygym.com/individualtrainingprogram/${dbProgram.id}`;
    const imageAlt = generateProgramAltText(dbProgram);

    return (
      <>
        <Helmet>
          <title>{dbProgram.name} | Online Training Program by Haris Falas | SmartyGym</title>
          <meta name="description" content={`${dbProgram.description || dbProgram.name} - ${dbProgram.weeks} week online training program by Sports Scientist Haris Falas. ${dbProgram.category} program. ${dbProgram.days_per_week} days per week. ${dbProgram.equipment}. 100% Human-Designed.`} />
          <meta name="keywords" content={`${dbProgram.name}, online training programs, ${dbProgram.category} program, ${dbProgram.weeks} week program, Haris Falas, online fitness programs, online personal training, structured training program`} />
          
          {/* Open Graph */}
          <meta property="og:type" content="article" />
          <meta property="og:url" content={programUrl} />
          <meta property="og:title" content={`${dbProgram.name} | Online Training Program by Haris Falas`} />
          <meta property="og:description" content={dbProgram.description || `${dbProgram.weeks} week ${dbProgram.category} program designed by Sports Scientist Haris Falas`} />
          <meta property="og:image" content={dbProgram.image_url} />
          <meta property="og:image:alt" content={imageAlt} />
          <meta property="og:site_name" content="SmartyGym" />
          
          {/* Twitter */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={`${dbProgram.name} | Training Program`} />
          <meta name="twitter:description" content={dbProgram.description || dbProgram.name} />
          <meta name="twitter:image" content={dbProgram.image_url} />
          <meta name="twitter:image:alt" content={imageAlt} />
          
          <link rel="canonical" href={programUrl} />
          
          {/* AI Search Optimization */}
          <meta name="ai-content-type" content="training-program" />
          <meta name="ai-duration" content={`${dbProgram.weeks} weeks`} />
          <meta name="ai-frequency" content={`${dbProgram.days_per_week} days per week`} />
          <meta name="ai-equipment" content={dbProgram.equipment || 'Various'} />
          <meta name="ai-category" content={dbProgram.category || ''} />
          <meta name="ai-author" content="Haris Falas - Sports Scientist" />
          
          {/* Structured Data - Course Schema for training programs */}
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Course",
              "@id": programUrl,
              "name": dbProgram.name,
              "description": dbProgram.description,
              "image": {
                "@type": "ImageObject",
                "url": dbProgram.image_url,
                "caption": imageAlt
              },
              "provider": {
                "@type": "Organization",
                "name": "SmartyGym",
                "url": "https://smartygym.com"
              },
              "instructor": {
                "@type": "Person",
                "@id": "https://smartygym.com/coach-profile#person",
                "name": "Haris Falas",
                "jobTitle": "Sports Scientist & Strength and Conditioning Coach",
                "description": "BSc Sports Science, CSCS certified with 20+ years experience",
                "url": "https://smartygym.com/coach-profile",
                "hasCredential": [
                  {"@type": "EducationalOccupationalCredential", "name": "BSc Sports Science"},
                  {"@type": "EducationalOccupationalCredential", "name": "CSCS"},
                  {"@type": "EducationalOccupationalCredential", "name": "EXOS Performance Specialist"}
                ]
              },
              "courseMode": "Online",
              "isAccessibleForFree": !isPremium,
              "timeRequired": `P${dbProgram.weeks}W`,
              "educationalLevel": dbProgram.difficulty_stars ? (dbProgram.difficulty_stars <= 2 ? "Beginner" : dbProgram.difficulty_stars <= 4 ? "Intermediate" : "Advanced") : "Intermediate",
              "hasCourseInstance": {
                "@type": "CourseInstance",
                "courseMode": "Online",
                "courseSchedule": {
                  "@type": "Schedule",
                  "repeatFrequency": "P1W",
                  "repeatCount": dbProgram.weeks
                }
              },
              "offers": dbProgram.is_standalone_purchase && dbProgram.price ? {
                "@type": "Offer",
                "price": dbProgram.price,
                "priceCurrency": "EUR",
                "availability": "https://schema.org/InStock"
              } : undefined
            })}
          </script>
          
          {/* ExercisePlan Schema */}
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
              "intensity": dbProgram.difficulty_stars ? `${dbProgram.difficulty_stars}/6 stars` : "Intermediate",
              "repetitions": `${dbProgram.days_per_week} days per week for ${dbProgram.weeks} weeks`,
              "workLocation": "Online / Home / Gym",
              "author": {
                "@type": "Person",
                "name": "Haris Falas",
                "jobTitle": "Sports Scientist & Strength and Conditioning Coach"
              },
              "identifier": dbProgram.id
            })}
          </script>
          
          {/* Breadcrumb Schema */}
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://smartygym.com"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Smarty Programs",
                  "item": "https://smartygym.com/trainingprogram"
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": dbProgram.name,
                  "item": programUrl
                }
              ]
            })}
          </script>
        </Helmet>
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-6 flex items-center justify-end">
              {hasAccess && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReaderModeOpen(true)}
                  className="gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">Reader Mode</span>
                </Button>
              )}
            </div>

            <PageBreadcrumbs items={[
              { label: "Home", href: "/" },
              { label: "Smarty Programs", href: "/trainingprogram" },
              { label: dbProgram.name }
            ]} />

            {hasAccess && (
              <ReaderModeDialog
                open={readerModeOpen}
                onOpenChange={setReaderModeOpen}
                title={dbProgram.name}
                metadata={{
                  duration: `${dbProgram.weeks} weeks / ${dbProgram.days_per_week} days per week`,
                  equipment: dbProgram.equipment || undefined,
                  category: dbProgram.category || undefined
                }}
                content={
                  <div className="space-y-6 workout-content">
                    {dbProgram.description && (
                      <div>
                        <h2 className="text-lg font-semibold mb-2">Description</h2>
                        <HTMLContent content={dbProgram.description} />
                      </div>
                    )}
                    {dbProgram.overview && (
                      <div>
                        <h2 className="text-lg font-semibold mb-2">Overview</h2>
                        <HTMLContent content={dbProgram.overview} />
                      </div>
                    )}
                    {dbProgram.target_audience && (
                      <div>
                        <h2 className="text-lg font-semibold mb-2">Target Audience</h2>
                        <HTMLContent content={dbProgram.target_audience} />
                      </div>
                    )}
                    {dbProgram.program_structure && (
                      <div>
                        <h2 className="text-lg font-semibold mb-2">Program Structure</h2>
                        <HTMLContent content={dbProgram.program_structure} />
                      </div>
                    )}
                    {dbProgram.weekly_schedule && (
                      <div>
                        <h2 className="text-lg font-semibold mb-2">Weekly Schedule</h2>
                        <HTMLContent content={dbProgram.weekly_schedule} />
                      </div>
                    )}
                    {dbProgram.progression_plan && (
                      <div>
                        <h2 className="text-lg font-semibold mb-2">Progression Plan</h2>
                        <HTMLContent content={dbProgram.progression_plan} />
                      </div>
                    )}
                    {dbProgram.nutrition_tips && (
                      <div>
                        <h2 className="text-lg font-semibold mb-2">Nutrition Tips</h2>
                        <HTMLContent content={dbProgram.nutrition_tips} />
                      </div>
                    )}
                    {dbProgram.expected_results && (
                      <div>
                        <h2 className="text-lg font-semibold mb-2">Expected Results</h2>
                        <HTMLContent content={dbProgram.expected_results} />
                      </div>
                    )}
                  </div>
                }
              />
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
