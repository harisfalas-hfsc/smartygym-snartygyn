import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Calendar, Eye, CheckCircle } from "lucide-react";
import { AccessGate } from "@/components/AccessGate";
import { CompactFilters } from "@/components/CompactFilters";
import { useAllPrograms } from "@/hooks/useProgramData";
import { useProgramInteractions } from "@/hooks/useProgramInteractions";
import { supabase } from "@/integrations/supabase/client";
import cardioEnduranceImg from "@/assets/cardio-endurance-program.jpg";
import functionalStrengthImg from "@/assets/functional-strength-program.jpg";
import muscleHypertrophyImg from "@/assets/muscle-hypertrophy-program.jpg";
import metabolicBurnImg from "@/assets/metabolic-burn-workout.jpg";
import fatFurnaceImg from "@/assets/fat-furnace-workout.jpg";
import coreBuilderImg from "@/assets/core-builder-workout.jpg";
import flowMobilityImg from "@/assets/flow-mobility-workout.jpg";
import muscleHypertrophyProImg from "@/assets/muscle-hypertrophy-pro-program.jpg";
import cardioMaxEnduranceImg from "@/assets/cardio-max-endurance-program.jpg";
import lowBackPerformanceImg from "@/assets/low-back-performance-program.jpg";
import mobilityMasterFlowImg from "@/assets/mobility-master-flow-program.jpg";
import functionalStrengthEliteImg from "@/assets/functional-strength-elite-program.jpg";
import functionalStrengthFoundationsImg from "@/assets/functional-strength-foundations-program.jpg";
import muscleHypertrophyBuildImg from "@/assets/muscle-hypertrophy-build-program.jpg";
import cardioPerformanceImg from "@/assets/cardio-performance-program.jpg";
import weightLossIgniteImg from "@/assets/weight-loss-ignite-program.jpg";
import lowBackPainReliefImg from "@/assets/low-back-pain-relief-program.jpg";
import mobilityStabilityFlowImg from "@/assets/mobility-stability-flow-program.jpg";

type EquipmentFilter = "all" | "bodyweight" | "equipment";
type LevelFilter = "all" | "beginner" | "intermediate" | "advanced";
type DurationFilter = "all" | "4" | "6" | "8";
type StatusFilter = "all" | "viewed" | "completed";

export interface TrainingProgram {
  id: string;
  name: string;
  description: string;
  duration: "4" | "6" | "8";
  equipment: "bodyweight" | "equipment";
  level: "beginner" | "intermediate" | "advanced";
  imageUrl: string;
  isFree?: boolean;
}

const TrainingProgramDetail = () => {
  const navigate = useNavigate();
  const { type } = useParams();
  const [equipmentFilter, setEquipmentFilter] = useState<EquipmentFilter>("all");
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all");
  const [durationFilter, setDurationFilter] = useState<DurationFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [userId, setUserId] = useState<string | undefined>();

  // Fetch current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id);
    });
  }, []);

  // Fetch programs and interactions from database
  const { data: allPrograms = [], isLoading } = useAllPrograms();
  const { data: interactions = [] } = useProgramInteractions(userId);
  
  // Map URL type to database category
  const categoryMap: { [key: string]: string } = {
    "cardio-endurance": "CARDIO",
    "functional-strength": "STRENGTH",
    "muscle-hypertrophy": "HYPERTROPHY",
    "weight-loss": "WEIGHT LOSS",
    "low-back-pain": "RECOVERY",
    "mobility-stability": "MOBILITY"
  };

  const programTitles: { [key: string]: string } = {
    "cardio-endurance": "Cardio Endurance Programs",
    "functional-strength": "Functional Strength Programs",
    "muscle-hypertrophy": "Muscle Hypertrophy Programs",
    "weight-loss": "Weight Loss Programs",
    "low-back-pain": "Low Back Pain Programs",
    "mobility-stability": "Mobility & Stability Programs"
  };

  const programInfo: { [key: string]: { title: string; content: string } } = {
    "muscle-hypertrophy": {
      title: "Muscle Hypertrophy",
      content: "Building muscle requires consistent mechanical tension, sufficient training volume, and progressive overload—but recovery and nutrition are what turn effort into visible growth. Aim for 1.6–2.0 g of protein per kilogram of body weight daily, maintain a slight caloric surplus (around 200–300 kcal above maintenance), and get at least 7–9 hours of sleep each night to optimize anabolic hormones. Supplementation such as creatine monohydrate, whey protein, and omega-3 fatty acids can support muscle repair and performance. Stay hydrated and plan deload weeks if recovery feels compromised."
    },
    "functional-strength": {
      title: "Functional Strength",
      content: "Functional strength is about quality of movement, balance, and power that transfers to daily life and sport. To progress, focus on technique before load, emphasizing joint stability, core control, and mobility. Fuel your training with nutrient-dense meals rich in lean protein, complex carbohydrates, and healthy fats. Prioritize post-workout recovery meals containing both carbs and protein, and include mobility sessions or active recovery days to enhance performance longevity."
    },
    "cardio-endurance": {
      title: "Cardio",
      content: "Cardiovascular fitness improves heart health, endurance, and recovery capacity. For best results, combine steady-state sessions (65–75% max HR) with interval or tempo training to develop both aerobic and anaerobic systems. Support energy demands by eating enough carbohydrates, staying hydrated, and keeping electrolytes balanced. Limit alcohol and processed foods that interfere with recovery. Regular sleep and stress management are essential for maintaining consistent cardio output."
    },
    "weight-loss": {
      title: "Weight Loss",
      content: "Fat loss happens in a calorie deficit—burning more energy than you consume—without compromising muscle mass. Combine resistance training with cardio and aim for moderate caloric restriction (around –400 to –600 kcal/day). Emphasize high-protein meals to preserve lean tissue, control hunger, and improve metabolism. Reduce refined carbs and sugar, and favor whole foods and fiber-rich vegetables. Quality sleep (7–9 hours) and stress control are critical, since hormonal imbalance can slow fat loss. Stay consistent; small daily improvements create long-term change."
    },
    "low-back-pain": {
      title: "Low Back Pain",
      content: "A strong, stable core and proper movement mechanics are key to preventing and reducing low back pain. Alongside training, maintain good posture while sitting or working, avoid long periods of inactivity, and practice daily mobility for the hips and thoracic spine. Adequate hydration, anti-inflammatory foods (like omega-3 sources, fruits, and vegetables), and a healthy body weight reduce strain on the spine. Remember that pain often reflects movement habits—move more, move well, and progress gradually."
    },
    "mobility-stability": {
      title: "Mobility & Stability",
      content: "Mobility and stability training enhance joint range of motion, balance, and coordination—foundations for every other goal. Perform movements slowly, focusing on control, breathing, and alignment. Support your progress by avoiding prolonged sitting, incorporating dynamic warm-ups and stretching, and staying well-hydrated. Magnesium-rich foods and sufficient sleep improve muscle relaxation and recovery. Patience and consistency are the keys to lasting mobility improvements."
    }
  };

  const programData: { [key: string]: TrainingProgram[] } = {
    "cardio-endurance": [
      {
        id: "T-C001",
        name: "Cardio Performance Booster",
        description: "6-week cardiovascular conditioning plan to build aerobic base, increase VO₂ max, and improve overall endurance.",
        duration: "6",
        equipment: "equipment",
        level: "intermediate",
        imageUrl: cardioEnduranceImg,
        isFree: false
      },
      {
        id: "T-C002",
        name: "Cardio Max Endurance",
        description: "Progressive 8-week endurance plan for athletes seeking peak aerobic and anaerobic capacity using HIIT and threshold training.",
        duration: "8",
        equipment: "equipment",
        level: "advanced",
        imageUrl: cardioMaxEnduranceImg,
        isFree: false
      },
      {
        id: "T-C003",
        name: "Cardio Performance",
        description: "6-week program to develop endurance, VO₂ max, and cardiovascular efficiency through interval training and steady-state conditioning.",
        duration: "6",
        equipment: "equipment",
        level: "intermediate",
        imageUrl: cardioPerformanceImg,
        isFree: false
      }
    ],
    "functional-strength": [
      {
        id: "T-F001",
        name: "Functional Strength Builder",
        description: "6-week program to develop foundational full-body strength, improve neuromuscular control, and enhance movement efficiency.",
        duration: "6",
        equipment: "equipment",
        level: "intermediate",
        imageUrl: functionalStrengthImg,
        isFree: false
      },
      {
        id: "T-F002",
        name: "Functional Strength Elite I",
        description: "Eight weeks of high-intensity compound lifting and functional circuits that develop maximal strength, explosiveness, and control through every plane of motion.",
        duration: "8",
        equipment: "equipment",
        level: "advanced",
        imageUrl: functionalStrengthEliteImg,
        isFree: false
      },
      {
        id: "T-F003",
        name: "Functional Strength Elite II",
        description: "A power-endurance plan for advanced athletes blending heavy compound movements with metabolic finishers. Ideal for building real-world strength and capacity.",
        duration: "8",
        equipment: "equipment",
        level: "advanced",
        imageUrl: functionalStrengthEliteImg,
        isFree: false
      },
      {
        id: "T-F004",
        name: "Functional Strength Foundations",
        description: "6-week program developing functional strength for daily activities and athletic performance through multi-joint movements and core stability.",
        duration: "6",
        equipment: "equipment",
        level: "intermediate",
        imageUrl: functionalStrengthFoundationsImg,
        isFree: false
      }
    ],
    "muscle-hypertrophy": [
      {
        id: "T-H001",
        name: "Muscle Hypertrophy Builder",
        description: "6-week intermediate hypertrophy split designed to maximize muscle volume and structural balance with moderate loads.",
        duration: "6",
        equipment: "equipment",
        level: "intermediate",
        imageUrl: muscleHypertrophyImg,
        isFree: false
      },
      {
        id: "T-H002",
        name: "Muscle Hypertrophy Pro I",
        description: "A classic push-pull-legs split geared for maximum size. High volume, controlled tempo, and progressive overload build thickness and symmetry.",
        duration: "8",
        equipment: "equipment",
        level: "advanced",
        imageUrl: muscleHypertrophyProImg,
        isFree: false
      },
      {
        id: "T-H003",
        name: "Muscle Hypertrophy Pro II",
        description: "A blended upper/lower split for advanced lifters targeting balanced growth and metabolic stress. Includes mechanical drops and supersets to maximize hypertrophy.",
        duration: "8",
        equipment: "equipment",
        level: "advanced",
        imageUrl: muscleHypertrophyProImg,
        isFree: false
      },
      {
        id: "T-H004",
        name: "Muscle Hypertrophy Build",
        description: "6-week hypertrophy plan targeting all major muscle groups using progressive overload principles and time-under-tension.",
        duration: "6",
        equipment: "equipment",
        level: "intermediate",
        imageUrl: muscleHypertrophyBuildImg,
        isFree: false
      }
    ],
    "weight-loss": [
      {
        id: "T-W001",
        name: "Weight Loss Ignite",
        description: "Metabolic-driven 6-week fat loss program combining circuit training, interval cardio, and strength elements.",
        duration: "6",
        equipment: "equipment",
        level: "intermediate",
        imageUrl: metabolicBurnImg,
        isFree: true
      },
      {
        id: "T-W002",
        name: "Weight Loss Max Burn I",
        description: "An eight-week metabolic-conditioning plan created to accelerate fat loss while maintaining lean muscle. It blends strength endurance, Tabata, and cardio intervals with structured recovery and outdoor runs.",
        duration: "8",
        equipment: "equipment",
        level: "advanced",
        imageUrl: fatFurnaceImg,
        isFree: false
      },
      {
        id: "T-W003",
        name: "Weight Loss Shred II",
        description: "A challenging hybrid program that combines resistance training, cardio intervals, and athletic conditioning to keep metabolism elevated all day.",
        duration: "8",
        equipment: "equipment",
        level: "advanced",
        imageUrl: fatFurnaceImg,
        isFree: false
      },
      {
        id: "T-W004",
        name: "Weight Loss Ignite Premium",
        description: "6-week program maximizing caloric expenditure while maintaining lean muscle using metabolic circuits and HIIT.",
        duration: "6",
        equipment: "equipment",
        level: "intermediate",
        imageUrl: weightLossIgniteImg,
        isFree: false
      }
    ],
    "low-back-pain": [
      {
        id: "T-L001",
        name: "Low Back Pain Rehab Strength",
        description: "Controlled 6-week program for strengthening spinal stabilizers, improving posture, and reducing lower back discomfort.",
        duration: "6",
        equipment: "equipment",
        level: "intermediate",
        imageUrl: coreBuilderImg,
        isFree: false
      },
      {
        id: "T-L002",
        name: "Low Back Performance",
        description: "Advanced 8-week strength and stability program to reinforce posterior chain and protect against re-injury.",
        duration: "8",
        equipment: "equipment",
        level: "advanced",
        imageUrl: lowBackPerformanceImg,
        isFree: false
      },
      {
        id: "T-L003",
        name: "Low Back Pain Relief",
        description: "6-week program strengthening spinal stabilizers, improving posture, and reducing lower back discomfort through controlled movements.",
        duration: "6",
        equipment: "equipment",
        level: "intermediate",
        imageUrl: lowBackPainReliefImg,
        isFree: false
      }
    ],
    "mobility-stability": [
      {
        id: "T-M001",
        name: "Mobility & Stability Flow",
        description: "Full-body 6-week mobility plan improving joint range, neuromuscular control, and posture.",
        duration: "6",
        equipment: "bodyweight",
        level: "intermediate",
        imageUrl: flowMobilityImg,
        isFree: false
      },
      {
        id: "T-M002",
        name: "Mobility & Stability Master Flow",
        description: "Advanced 8-week flow for dynamic joint control, strength through range, and high-level body awareness.",
        duration: "8",
        equipment: "equipment",
        level: "advanced",
        imageUrl: mobilityMasterFlowImg,
        isFree: false
      },
      {
        id: "T-M003",
        name: "Mobility & Stability Flow Premium",
        description: "6-week program improving joint range of motion, neuromuscular control, and balance for better performance and injury prevention.",
        duration: "6",
        equipment: "bodyweight",
        level: "intermediate",
        imageUrl: mobilityStabilityFlowImg,
        isFree: false
      }
    ],
  };

  const title = programTitles[type || ""] || "Training Programs";
  const mappedCategory = categoryMap[type || "cardio-endurance"];
  
  // Filter programs by category from URL and user filters
  const filteredPrograms = allPrograms.filter(program => {
    // Match category - correctly filtering by category field
    if (!program.category?.toUpperCase().includes(mappedCategory)) return false;
    
    // Equipment filter
    if (equipmentFilter !== "all") {
      const hasEquipment = program.duration?.toLowerCase() !== "bodyweight";
      if (equipmentFilter === "bodyweight" && hasEquipment) return false;
      if (equipmentFilter === "equipment" && !hasEquipment) return false;
    }
    
    // Duration filter (programs use "duration" field like "6 weeks", "8 weeks")
    if (durationFilter !== "all") {
      const programWeeks = program.duration?.match(/\d+/)?.[0];
      if (programWeeks !== durationFilter) return false;
    }
    
    // Status filter (only for authenticated users)
    if (statusFilter !== "all" && userId) {
      const interaction = interactions.find(i => i.program_id === program.id);
      if (statusFilter === "viewed" && !interaction?.has_viewed) return false;
      if (statusFilter === "completed" && !interaction?.is_completed) return false;
    }
    
    return true;
  });

  return (
    <>
      {isLoading ? (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-muted-foreground">Loading programs...</p>
        </div>
      ) : (
        <>
      <Helmet>
        <title>{title} Online Training Programs | Cyprus | Haris Falas | SmartyGym</title>
        <meta name="description" content={`${title} online training programs by Cyprus Sports Scientist Haris Falas. Professional 6-8 week structured ${type || 'fitness'} programs. Evidence-based training for Cyprus and worldwide. Expert online personal training approach.`} />
        <meta name="keywords" content={`online training programs, ${title}, ${type} programs, Cyprus fitness programs, Haris Falas programs, structured training programs, online personal training, Cyprus personal trainers, 6 week programs, 8 week programs, fitness programs Cyprus, online fitness Cyprus`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={`${title} Online Training Programs | Cyprus by Haris Falas`} />
        <meta property="og:description" content={`Structured 6-8 week ${title.toLowerCase()} online training programs by Cyprus Sports Scientist Haris Falas`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://smartygym.com/trainingprogram/${type || ''}`} />
        <meta property="og:site_name" content="SmartyGym Cyprus" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${title} Online Training Programs | Haris Falas`} />
        <meta name="twitter:description" content={`Professional ${title.toLowerCase()} with structured progression by Cyprus expert`} />
        
        <link rel="canonical" href={`https://smartygym.com/trainingprogram/${type || ''}`} />
        
        {/* Structured Data - Collection of Training Programs */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": `${title} Online Training Programs`,
            "description": `Collection of structured online ${title.toLowerCase()} - 6 to 8 week training programs designed by Cyprus Sports Scientist Haris Falas`,
            "numberOfItems": filteredPrograms.length,
            "provider": {
              "@type": "Person",
              "name": "Haris Falas",
              "jobTitle": "Sports Scientist & Personal Trainer",
              "description": "Cyprus personal trainer with expertise in structured program design"
            },
            "itemListElement": filteredPrograms.map((program, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "item": {
                "@type": "ExercisePlan",
                "name": program.name,
                "description": program.description,
                "image": program.image_url,
                "duration": program.duration,
                "workLocation": "Online / Home / Gym",
                "exerciseType": program.category
              }
            }))
          })}
        </script>
      </Helmet>
      
      <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/trainingprogram")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span className="text-xs sm:text-sm">Back</span>
        </Button>
        
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8">{title}</h1>
        
        {/* Info Card */}
        {programInfo[type || ""] && (
          <Card className="mb-8 p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/30">
            <h2 className="text-xl font-semibold mb-4 text-center">{programInfo[type || ""].title}</h2>
            <p className="text-muted-foreground leading-relaxed text-center">{programInfo[type || ""].content}</p>
          </Card>
        )}
        
        {/* Compact Filters */}
        <CompactFilters
          filters={[
            {
              name: "Equipment",
              value: equipmentFilter,
              onChange: (value) => setEquipmentFilter(value as EquipmentFilter),
              placeholder: "Equipment",
              options: [
                { value: "all", label: "All Equipment" },
                { value: "bodyweight", label: "Bodyweight" },
                { value: "equipment", label: "Equipment" },
              ],
            },
            {
              name: "Level",
              value: levelFilter,
              onChange: (value) => setLevelFilter(value as LevelFilter),
              placeholder: "Level",
              options: [
                { value: "all", label: "All Levels" },
                { value: "beginner", label: "Beginner" },
                { value: "intermediate", label: "Intermediate" },
                { value: "advanced", label: "Advanced" },
              ],
            },
            {
              name: "Duration",
              value: durationFilter,
              onChange: (value) => setDurationFilter(value as DurationFilter),
              placeholder: "Duration",
              options: [
                { value: "all", label: "All Durations" },
                { value: "4", label: "4 Weeks" },
                { value: "6", label: "6 Weeks" },
                { value: "8", label: "8 Weeks" },
              ],
            },
            ...(userId ? [{
              name: "Status",
              value: statusFilter,
              onChange: (value) => setStatusFilter(value as StatusFilter),
              placeholder: "Status",
              options: [
                { value: "all", label: "All Programs" },
                { value: "viewed", label: "Viewed" },
                { value: "completed", label: "Completed" },
              ],
            }] : []),
          ]}
        />

        {/* Program Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredPrograms.map((program) => {
            const interaction = userId ? interactions.find(i => i.program_id === program.id) : null;
            const isViewed = interaction?.has_viewed;
            const isCompleted = interaction?.is_completed;
            
            return (
              <Card
                key={program.id}
                className="overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-gold bg-card border-border"
                onClick={() => navigate(`/trainingprogram/${type}/${program.id}`)}
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <img 
                    src={program.image_url} 
                    alt={`${program.name} - ${program.duration} training program by Haris Falas Sports Scientist at Smarty Gym Cyprus`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{program.duration} weeks</span>
                  </div>
                  {!program.is_premium && (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                      FREE
                    </div>
                  )}
                  {program.is_standalone_purchase && program.price && (
                    <div className="absolute bottom-2 right-2 bg-gold-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      €{Number(program.price).toFixed(2)}
                    </div>
                  )}
                  {userId && isCompleted && (
                    <div className="absolute bottom-2 left-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Completed
                    </div>
                  )}
                  {userId && isViewed && !isCompleted && (
                    <div className="absolute bottom-2 left-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      Viewed
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-lg">{program.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{program.description}</p>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredPrograms.length === 0 && (
          <Card className="p-8">
            <p className="text-center text-muted-foreground">
              No programs found for this combination. Try different filters.
            </p>
          </Card>
        )}
      </div>
      </div>
      </>
      )}
    </>
  );
};

export default TrainingProgramDetail;
