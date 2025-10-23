import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { WorkoutDisplay } from "@/components/WorkoutDisplay";
import { AccessGate } from "@/components/AccessGate";
import cardioEnduranceImg from "@/assets/cardio-endurance-program.jpg";
import functionalStrengthImg from "@/assets/functional-strength-program.jpg";
import muscleHypertrophyImg from "@/assets/muscle-hypertrophy-program.jpg";

const IndividualTrainingProgram = () => {
  const navigate = useNavigate();
  const { type, id } = useParams();

  // Only specific programs are free
  const freePrograms = ['cardio-001']; // Cardio Endurance Builder
  const isFreeProgram = freePrograms.includes(id || '');

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

  const programData: {
    [key: string]: {
      name: string;
      serialNumber: string;
      focus: string;
      difficulty: string;
      duration: string;
      equipment: string;
      imageUrl: string;
      description: string;
      format: string;
      instructions: string;
      exercises: Array<{
        week: string;
        day: string;
        workout: string;
        details: string;
      }>;
      tips: string[];
    };
  } = {};

  const program = programData[id || ""];

  if (!program) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8">
          <p className="text-center">Training program not found</p>
          <Button onClick={() => navigate("/trainingprogram")} className="mt-4">
            Back to Programs
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{program.name} - {program.duration} Training Program Cyprus | Haris Falas | smartygym.com</title>
        <meta name="description" content={`${program.name} - ${program.description} ${program.duration} ${program.focus} program. Progressive strength training, functional fitness, structured workout plan by Sports Scientist Haris Falas at smartygym.com Cyprus`} />
        <meta name="keywords" content={`${program.name}, ${program.duration} program, ${program.focus} training, structured workout plan, progressive overload, strength program Cyprus, functional fitness program, training program, ${program.equipment}, ${program.difficulty} program, Haris Falas Cyprus, Smarty Gym, smartygym.com, online training Cyprus, periodization, muscle building, endurance training, performance program, sports science Cyprus`} />
        
        <meta property="og:title" content={`${program.name} - ${program.duration} Structured Training Program`} />
        <meta property="og:description" content={`${program.description} ${program.duration} ${program.focus} program by Haris Falas at Smarty Gym Cyprus`} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://smartygym.com/trainingprogram/${type}/${id}`} />
        <meta property="og:image" content={program.imageUrl} />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${program.name} - ${program.duration} Training Program | Smarty Gym Cyprus`} />
        <meta name="twitter:description" content={`${program.duration} ${program.focus} program by Sports Scientist Haris Falas`} />
        <meta name="twitter:image" content={program.imageUrl} />
        
        <link rel="canonical" href={`https://smartygym.com/trainingprogram/${type}/${id}`} />
        
        {/* Structured Data - Exercise Program */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Course",
            "name": program.name,
            "description": program.description,
            "image": program.imageUrl,
            "timeRequired": program.duration,
            "courseCode": program.serialNumber,
            "hasCourseInstance": {
              "@type": "CourseInstance",
              "courseMode": "online",
              "courseWorkload": program.duration
            },
            "author": {
              "@type": "Person",
              "name": "Haris Falas",
              "jobTitle": "Sports Scientist & Strength and Conditioning Coach",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "CY"
              }
            },
            "provider": {
              "@type": "Organization",
              "name": "Smarty Gym",
              "url": "https://smartygym.com",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "CY"
              }
            },
            "keywords": `${program.focus}, ${program.duration}, structured training, Cyprus fitness program`
          })}
        </script>
      </Helmet>

      <AccessGate requireAuth={true} requirePremium={!isFreeProgram} contentType="program">
        <div className="min-h-screen bg-background">
          <div className="container mx-auto max-w-4xl px-4 py-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/trainingprogram/${type}`)}
              className="mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="text-xs sm:text-sm">Back</span>
            </Button>

            {/* Use WorkoutDisplay component with all functionality */}
            <WorkoutDisplay
            exercises={[
              { name: "Exercise Demo", video_id: "dQw4w9WgXcQ", video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }
            ]}
            planContent=""
            title={program.name}
            serial={program.serialNumber}
            focus={program.focus}
            difficulty={program.difficulty === "Beginner" ? 1 : program.difficulty === "Intermediate" ? 3 : 5}
            imageUrl={program.imageUrl}
            duration={program.duration}
            equipment={program.equipment}
            description={program.description}
            format={program.format}
            instructions={program.instructions}
            tips={program.tips.join('\n')}
            programWeeks={[{
              week: 1,
              focus: "Training Program",
              days: program.exercises.map(ex => ({
                day: `${ex.week} - ${ex.day}`,
                exercises: [{
                  name: ex.workout,
                  sets: "See details",
                  reps: ex.details,
                  intensity: "As prescribed",
                  rest: "As needed"
                }]
              }))
            }]}
          />
        </div>
      </div>
      </AccessGate>
    </>
  );
};

export default IndividualTrainingProgram;
