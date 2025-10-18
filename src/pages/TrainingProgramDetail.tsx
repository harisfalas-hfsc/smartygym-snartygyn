import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Heart, Activity, TrendingUp, Target, Zap, Crown, Mountain, Footprints, Wind, Shield, Sparkles, Dumbbell, Users, Sword, Anchor, Flame, CircleDot, Gauge, Calendar } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type EquipmentFilter = "all" | "bodyweight" | "equipment";
type LevelFilter = "all" | "beginner" | "intermediate" | "advanced";
type DurationFilter = "all" | "4" | "6" | "8";

interface TrainingProgram {
  id: string;
  name: string;
  description: string;
  duration: "4" | "6" | "8";
  equipment: "bodyweight" | "equipment";
  level: "beginner" | "intermediate" | "advanced";
  icon: LucideIcon;
}

const TrainingProgramDetail = () => {
  const navigate = useNavigate();
  const { type } = useParams();
  const [equipmentFilter, setEquipmentFilter] = useState<EquipmentFilter>("all");
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all");
  const [durationFilter, setDurationFilter] = useState<DurationFilter>("all");

  const programTitles: { [key: string]: string } = {
    "cardio": "Cardio Program",
    "functional-strength": "Functional Strength Program",
    "muscle-hypertrophy": "Muscle Hypertrophy Program",
    "weight-loss": "Weight Loss Program",
    "low-back-pain": "Low Back Pain Program",
    "mobility-stability": "Mobility & Stability Program"
  };

  const programData: { [key: string]: TrainingProgram[] } = {
    "cardio": [
      // Bodyweight Beginner
      { id: "1", name: "Heart Foundation", description: "Build your cardio base with walking and light jogging", duration: "4", equipment: "bodyweight", level: "beginner", icon: Heart },
      { id: "2", name: "Beginner's Endurance", description: "Progressive running program for newcomers", duration: "6", equipment: "bodyweight", level: "beginner", icon: Footprints },
      // Bodyweight Intermediate
      { id: "3", name: "5K Runner's Plan", description: "Train for your first 5K race", duration: "6", equipment: "bodyweight", level: "intermediate", icon: Target },
      { id: "4", name: "Interval Mastery", description: "HIIT-focused cardio progression", duration: "8", equipment: "bodyweight", level: "intermediate", icon: Zap },
      // Bodyweight Advanced
      { id: "5", name: "Marathon Prep", description: "Elite endurance for long-distance running", duration: "8", equipment: "bodyweight", level: "advanced", icon: Crown },
      { id: "6", name: "VO2 Max Builder", description: "Advanced aerobic capacity training", duration: "6", equipment: "bodyweight", level: "advanced", icon: TrendingUp },
      // Equipment Beginner
      { id: "7", name: "Bike to Fitness", description: "Stationary cycling program for beginners", duration: "4", equipment: "equipment", level: "beginner", icon: Activity },
      { id: "8", name: "Rowing Basics", description: "Learn proper rowing technique and build endurance", duration: "6", equipment: "equipment", level: "beginner", icon: CircleDot },
      // Equipment Intermediate
      { id: "9", name: "Cardio Circuit", description: "Mixed equipment cardio training", duration: "6", equipment: "equipment", level: "intermediate", icon: Target },
      { id: "10", name: "Endurance Evolution", description: "Progressive overload for cardio machines", duration: "8", equipment: "equipment", level: "intermediate", icon: Mountain },
      // Equipment Advanced
      { id: "11", name: "Triathlon Training", description: "Multi-modal elite cardio program", duration: "8", equipment: "equipment", level: "advanced", icon: Crown },
      { id: "12", name: "Cardio Domination", description: "Peak cardiovascular performance", duration: "6", equipment: "equipment", level: "advanced", icon: Flame },
    ],
    "functional-strength": [
      // Bodyweight Beginner
      { id: "1", name: "Daily Movement", description: "Functional patterns for everyday life", duration: "4", equipment: "bodyweight", level: "beginner", icon: Activity },
      { id: "2", name: "Foundation Strength", description: "Build basic functional strength", duration: "6", equipment: "bodyweight", level: "beginner", icon: Footprints },
      // Bodyweight Intermediate
      { id: "3", name: "Athletic Performance", description: "Sport-specific functional training", duration: "6", equipment: "bodyweight", level: "intermediate", icon: Target },
      { id: "4", name: "Movement Mastery", description: "Complex movement patterns", duration: "8", equipment: "bodyweight", level: "intermediate", icon: TrendingUp },
      // Bodyweight Advanced
      { id: "5", name: "Elite Functional", description: "Advanced movement and control", duration: "8", equipment: "bodyweight", level: "advanced", icon: Crown },
      { id: "6", name: "Gymnastic Strength", description: "High-level bodyweight skills", duration: "6", equipment: "bodyweight", level: "advanced", icon: Sparkles },
      // Equipment Beginner
      { id: "7", name: "Kettlebell Fundamentals", description: "Functional strength with kettlebells", duration: "4", equipment: "equipment", level: "beginner", icon: Dumbbell },
      { id: "8", name: "Sandbag Training", description: "Real-world functional strength", duration: "6", equipment: "equipment", level: "beginner", icon: Activity },
      // Equipment Intermediate
      { id: "9", name: "Power Development", description: "Explosive functional movements", duration: "6", equipment: "equipment", level: "intermediate", icon: Zap },
      { id: "10", name: "Compound Mastery", description: "Multi-joint functional exercises", duration: "8", equipment: "equipment", level: "intermediate", icon: Mountain },
      // Equipment Advanced
      { id: "11", name: "Athletic Elite", description: "Peak functional performance", duration: "8", equipment: "equipment", level: "advanced", icon: Crown },
      { id: "12", name: "CrossFit Foundation", description: "Functional fitness at its finest", duration: "6", equipment: "equipment", level: "advanced", icon: Sword },
    ],
    "muscle-hypertrophy": [
      // Bodyweight Beginner
      { id: "1", name: "Muscle Builder Basics", description: "Start building muscle with bodyweight", duration: "4", equipment: "bodyweight", level: "beginner", icon: Users },
      { id: "2", name: "Calisthenics Growth", description: "Progressive muscle building", duration: "6", equipment: "bodyweight", level: "beginner", icon: TrendingUp },
      // Bodyweight Intermediate
      { id: "3", name: "Volume Training", description: "Increase training volume for growth", duration: "6", equipment: "bodyweight", level: "intermediate", icon: Mountain },
      { id: "4", name: "Advanced Calisthenics", description: "Weighted bodyweight progressions", duration: "8", equipment: "bodyweight", level: "intermediate", icon: Dumbbell },
      // Bodyweight Advanced
      { id: "5", name: "Gymnast Physique", description: "Elite muscle control and size", duration: "8", equipment: "bodyweight", level: "advanced", icon: Crown },
      { id: "6", name: "Maximum Hypertrophy", description: "Peak natural muscle building", duration: "6", equipment: "bodyweight", level: "advanced", icon: Sparkles },
      // Equipment Beginner
      { id: "7", name: "First Gains", description: "Beginner's guide to muscle growth", duration: "4", equipment: "equipment", level: "beginner", icon: Dumbbell },
      { id: "8", name: "Foundation Builder", description: "Build your muscle base", duration: "6", equipment: "equipment", level: "beginner", icon: Activity },
      // Equipment Intermediate
      { id: "9", name: "Push Pull Legs", description: "Classic hypertrophy split", duration: "6", equipment: "equipment", level: "intermediate", icon: Users },
      { id: "10", name: "Volume Accumulation", description: "Progressive overload for size", duration: "8", equipment: "equipment", level: "intermediate", icon: TrendingUp },
      // Equipment Advanced
      { id: "11", name: "Bodybuilding Pro", description: "Advanced muscle building techniques", duration: "8", equipment: "equipment", level: "advanced", icon: Crown },
      { id: "12", name: "Mass Monster", description: "Maximum muscle hypertrophy", duration: "6", equipment: "equipment", level: "advanced", icon: Anchor },
    ],
    "weight-loss": [
      // Bodyweight Beginner
      { id: "1", name: "Fat Loss Kickstart", description: "Begin your weight loss journey", duration: "4", equipment: "bodyweight", level: "beginner", icon: Flame },
      { id: "2", name: "Calorie Burn Plan", description: "Progressive fat-burning program", duration: "6", equipment: "bodyweight", level: "beginner", icon: Activity },
      // Bodyweight Intermediate
      { id: "3", name: "HIIT Fat Burn", description: "High-intensity weight loss", duration: "6", equipment: "bodyweight", level: "intermediate", icon: Zap },
      { id: "4", name: "Metabolic Shred", description: "Boost metabolism and burn fat", duration: "8", equipment: "bodyweight", level: "intermediate", icon: Flame },
      // Bodyweight Advanced
      { id: "5", name: "Lean Machine", description: "Advanced fat loss protocol", duration: "8", equipment: "bodyweight", level: "advanced", icon: TrendingUp },
      { id: "6", name: "Shred Master", description: "Elite body composition program", duration: "6", equipment: "bodyweight", level: "advanced", icon: Crown },
      // Equipment Beginner
      { id: "7", name: "Cardio Weight Loss", description: "Equipment-based fat burning", duration: "4", equipment: "equipment", level: "beginner", icon: Heart },
      { id: "8", name: "Beginner's Burn", description: "Safe and effective weight loss", duration: "6", equipment: "equipment", level: "beginner", icon: Flame },
      // Equipment Intermediate
      { id: "9", name: "Resistance Fat Loss", description: "Combine strength and cardio", duration: "6", equipment: "equipment", level: "intermediate", icon: Dumbbell },
      { id: "10", name: "Circuit Shredder", description: "High-volume fat-burning circuits", duration: "8", equipment: "equipment", level: "intermediate", icon: Zap },
      // Equipment Advanced
      { id: "11", name: "Competition Prep", description: "Get stage-ready lean", duration: "8", equipment: "equipment", level: "advanced", icon: Crown },
      { id: "12", name: "Ultimate Shred", description: "Maximum fat loss program", duration: "6", equipment: "equipment", level: "advanced", icon: Flame },
    ],
    "low-back-pain": [
      // Bodyweight Beginner
      { id: "1", name: "Back Pain Relief", description: "Gentle movements for pain management", duration: "4", equipment: "bodyweight", level: "beginner", icon: Shield },
      { id: "2", name: "Core Foundation", description: "Build core strength for back health", duration: "6", equipment: "bodyweight", level: "beginner", icon: Activity },
      // Bodyweight Intermediate
      { id: "3", name: "Back Rehabilitation", description: "Progressive back strengthening", duration: "6", equipment: "bodyweight", level: "intermediate", icon: TrendingUp },
      { id: "4", name: "Spine Stability", description: "Advanced core and back work", duration: "8", equipment: "bodyweight", level: "intermediate", icon: Shield },
      // Bodyweight Advanced
      { id: "5", name: "Back Resilience", description: "Build bulletproof back strength", duration: "8", equipment: "bodyweight", level: "advanced", icon: Anchor },
      { id: "6", name: "Performance Recovery", description: "Return to peak performance", duration: "6", equipment: "bodyweight", level: "advanced", icon: Crown },
      // Equipment Beginner
      { id: "7", name: "Resistance Band Relief", description: "Gentle resistance for back pain", duration: "4", equipment: "equipment", level: "beginner", icon: Activity },
      { id: "8", name: "Stability Ball Basics", description: "Core work for back health", duration: "6", equipment: "equipment", level: "beginner", icon: CircleDot },
      // Equipment Intermediate
      { id: "9", name: "Deadlift Progression", description: "Safe progression to lifting", duration: "6", equipment: "equipment", level: "intermediate", icon: Dumbbell },
      { id: "10", name: "Back Strength Builder", description: "Progressive resistance training", duration: "8", equipment: "equipment", level: "intermediate", icon: Mountain },
      // Equipment Advanced
      { id: "11", name: "Powerlifting Prep", description: "Advanced back strengthening", duration: "8", equipment: "equipment", level: "advanced", icon: Anchor },
      { id: "12", name: "Athletic Back", description: "Performance-level back training", duration: "6", equipment: "equipment", level: "advanced", icon: Crown },
    ],
    "mobility-stability": [
      // Bodyweight Beginner
      { id: "1", name: "Flexibility Start", description: "Basic stretching and mobility", duration: "4", equipment: "bodyweight", level: "beginner", icon: Activity },
      { id: "2", name: "Joint Health", description: "Improve range of motion safely", duration: "6", equipment: "bodyweight", level: "beginner", icon: Shield },
      // Bodyweight Intermediate
      { id: "3", name: "Dynamic Mobility", description: "Active flexibility training", duration: "6", equipment: "bodyweight", level: "intermediate", icon: Wind },
      { id: "4", name: "Balance Master", description: "Advanced stability work", duration: "8", equipment: "bodyweight", level: "intermediate", icon: Target },
      // Bodyweight Advanced
      { id: "5", name: "Movement Artist", description: "Elite mobility and control", duration: "8", equipment: "bodyweight", level: "advanced", icon: Sparkles },
      { id: "6", name: "Contortionist Program", description: "Extreme flexibility training", duration: "6", equipment: "bodyweight", level: "advanced", icon: Crown },
      // Equipment Beginner
      { id: "7", name: "Foam Rolling Basics", description: "Self-myofascial release program", duration: "4", equipment: "equipment", level: "beginner", icon: CircleDot },
      { id: "8", name: "Band Stretching", description: "Assisted flexibility work", duration: "6", equipment: "equipment", level: "beginner", icon: Activity },
      // Equipment Intermediate
      { id: "9", name: "Yoga Props Flow", description: "Equipment-assisted mobility", duration: "6", equipment: "equipment", level: "intermediate", icon: Shield },
      { id: "10", name: "Stability Training", description: "Balance and control work", duration: "8", equipment: "equipment", level: "intermediate", icon: Target },
      // Equipment Advanced
      { id: "11", name: "Athletic Mobility", description: "Sport-specific flexibility", duration: "8", equipment: "equipment", level: "advanced", icon: Mountain },
      { id: "12", name: "Performance Flexibility", description: "Elite mobility program", duration: "6", equipment: "equipment", level: "advanced", icon: Crown },
    ],
  };

  const title = programTitles[type || ""] || "Training Program";
  const programs = programData[type || "cardio"] || [];
  
  const filteredPrograms = programs.filter(
    program => 
      (equipmentFilter === "all" || program.equipment === equipmentFilter) &&
      (levelFilter === "all" || program.level === levelFilter) &&
      (durationFilter === "all" || program.duration === durationFilter)
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/training-program")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span className="text-xs sm:text-sm">Back to Training Programs</span>
        </Button>
        
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8">{title}</h1>
        
        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Equipment Filter */}
          <div>
            <p className="text-sm font-medium mb-2">Equipment Type</p>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={equipmentFilter === "all" ? "default" : "outline"}
                onClick={() => setEquipmentFilter("all")}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={equipmentFilter === "bodyweight" ? "default" : "outline"}
                onClick={() => setEquipmentFilter("bodyweight")}
                size="sm"
              >
                Body Weight
              </Button>
              <Button
                variant={equipmentFilter === "equipment" ? "default" : "outline"}
                onClick={() => setEquipmentFilter("equipment")}
                size="sm"
              >
                Equipment
              </Button>
            </div>
          </div>

          {/* Level Filter */}
          <div>
            <p className="text-sm font-medium mb-2">Experience Level</p>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={levelFilter === "all" ? "default" : "outline"}
                onClick={() => setLevelFilter("all")}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={levelFilter === "beginner" ? "default" : "outline"}
                onClick={() => setLevelFilter("beginner")}
                size="sm"
              >
                Beginner
              </Button>
              <Button
                variant={levelFilter === "intermediate" ? "default" : "outline"}
                onClick={() => setLevelFilter("intermediate")}
                size="sm"
              >
                Intermediate
              </Button>
              <Button
                variant={levelFilter === "advanced" ? "default" : "outline"}
                onClick={() => setLevelFilter("advanced")}
                size="sm"
              >
                Advanced
              </Button>
            </div>
          </div>

          {/* Duration Filter */}
          <div>
            <p className="text-sm font-medium mb-2">Program Duration</p>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={durationFilter === "all" ? "default" : "outline"}
                onClick={() => setDurationFilter("all")}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={durationFilter === "4" ? "default" : "outline"}
                onClick={() => setDurationFilter("4")}
                size="sm"
              >
                4 Weeks
              </Button>
              <Button
                variant={durationFilter === "6" ? "default" : "outline"}
                onClick={() => setDurationFilter("6")}
                size="sm"
              >
                6 Weeks
              </Button>
              <Button
                variant={durationFilter === "8" ? "default" : "outline"}
                onClick={() => setDurationFilter("8")}
                size="sm"
              >
                8 Weeks
              </Button>
            </div>
          </div>
        </div>

        {/* Program Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredPrograms.map((program) => {
            const Icon = program.icon;
            return (
              <Card
                key={program.id}
                className="p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-gold bg-card border-border"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{program.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{program.description}</p>
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{program.duration} weeks</span>
                    </div>
                  </div>
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
  );
};

export default TrainingProgramDetail;
