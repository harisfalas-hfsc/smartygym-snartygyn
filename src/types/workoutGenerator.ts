export type ExerciseCategory = 
  | "bodyweight" 
  | "free weight" 
  | "kettlebell" 
  | "dumbbell" 
  | "barbell" 
  | "cable" 
  | "band" 
  | "machine" 
  | "cardio machine" 
  | "mobility";

export type ExerciseRegion = "upper" | "lower" | "core" | "full";

export type ExerciseDifficulty = "beginner" | "intermediate" | "advanced";

export type ExerciseFormat = "tabata" | "circuit" | "amrap" | "emom" | "reps_sets" | "for_time";

export type TrainingGoal = "strength" | "metabolic" | "cardio" | "mobility" | "general";

export interface Exercise {
  name: string;
  category: ExerciseCategory;
  region: ExerciseRegion;
  muscle_group: string;
  movement_type: string;
  equipment: string;
  difficulty: ExerciseDifficulty;
  unilateral: boolean;
  format_suitability: ExerciseFormat[];
  training_goal: TrainingGoal;
  notes: string;
}

export type WorkoutType = 
  | "strength" 
  | "calorie_burning" 
  | "metabolic" 
  | "cardio" 
  | "mobility" 
  | "challenge";

export type EquipmentPreference = "equipment" | "no_equipment";

export type WorkoutFormat = "tabata" | "circuit" | "amrap" | "for_time" | "emom" | "reps_sets" | "mix";

export type BodyFocus = "upper" | "lower" | "core" | "full_body" | "mixed";

export interface WorkoutGeneratorInputs {
  age: number;
  height: number; // cm
  weight: number; // kg
  workoutType: WorkoutType;
  equipmentPreference: EquipmentPreference;
  difficulty: ExerciseDifficulty;
  format: WorkoutFormat;
  duration: number; // minutes
  bodyFocus: BodyFocus[];
}

export interface WorkoutExercise {
  name: string;
  sets?: number;
  reps?: string;
  duration?: string;
  rest?: string;
  tempo?: string;
  notes?: string;
}

export interface WorkoutBlock {
  name: string;
  exercises: WorkoutExercise[];
  rounds?: number;
  restBetweenRounds?: string;
  instructions?: string;
}

export interface GeneratedWorkout {
  name: string;
  serialNumber: string;
  focus: string;
  difficulty: string;
  duration: string;
  equipment: string;
  description: string;
  format: string;
  instructions: string;
  tips: string;
  workoutPlan: WorkoutBlock[];
}
