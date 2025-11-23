import { ALL_EXERCISES } from "@/data/exerciseDatabase";
import { 
  WorkoutGeneratorInputs, 
  GeneratedWorkout, 
  Exercise,
  WorkoutBlock,
  WorkoutExercise
} from "@/types/workoutGenerator";

export function generateWorkout(inputs: WorkoutGeneratorInputs): GeneratedWorkout {
  // Filter exercises based on inputs
  const filteredExercises = filterExercises(inputs);
  
  // Select exercises for the workout
  const selectedExercises = selectExercises(filteredExercises, inputs);
  
  // Structure the workout based on format
  const workoutPlan = structureWorkout(selectedExercises, inputs);
  
  // Generate workout metadata
  const workout: GeneratedWorkout = {
    name: generateWorkoutName(inputs),
    serialNumber: generateSerialNumber(),
    focus: getFocusLabel(inputs.workoutType),
    difficulty: inputs.difficulty.charAt(0).toUpperCase() + inputs.difficulty.slice(1),
    duration: `${inputs.duration} minutes`,
    equipment: inputs.equipmentPreference === "equipment" ? "Equipment Required" : "Bodyweight Only",
    description: generateDescription(inputs),
    format: getFormatLabel(inputs.format),
    instructions: generateInstructions(inputs),
    tips: generateTips(inputs),
    workoutPlan
  };
  
  return workout;
}

function filterExercises(inputs: WorkoutGeneratorInputs): Exercise[] {
  return ALL_EXERCISES.filter(exercise => {
    // Filter by equipment
    if (inputs.equipmentPreference === "no_equipment") {
      if (exercise.equipment !== "none") return false;
    }
    
    // Filter by difficulty
    const difficultyLevels = ["beginner", "intermediate", "advanced"];
    const maxDifficultyIndex = difficultyLevels.indexOf(inputs.difficulty);
    const exerciseDifficultyIndex = difficultyLevels.indexOf(exercise.difficulty);
    if (exerciseDifficultyIndex > maxDifficultyIndex) return false;
    
    // Filter by body focus
    if (inputs.bodyFocus.length > 0 && !inputs.bodyFocus.includes("mixed")) {
      const matchesFocus = inputs.bodyFocus.some(focus => {
        if (focus === "full_body") return exercise.region === "full";
        return exercise.region === focus;
      });
      if (!matchesFocus) return false;
    }
    
    // Filter by workout type
    if (inputs.workoutType === "strength") {
      if (exercise.equipment === "none") return false;
      if (!exercise.format_suitability.includes("reps_sets")) return false;
    } else if (inputs.workoutType === "mobility") {
      if (exercise.training_goal !== "mobility") return false;
    } else if (inputs.workoutType === "cardio") {
      if (!["cardio", "metabolic"].includes(exercise.training_goal)) return false;
    }
    
    // Filter by format suitability
    if (inputs.format !== "mix") {
      if (!exercise.format_suitability.includes(inputs.format)) return false;
    }
    
    return true;
  });
}

function selectExercises(exercises: Exercise[], inputs: WorkoutGeneratorInputs): Exercise[] {
  const count = getExerciseCount(inputs);
  
  // Shuffle and select
  const shuffled = [...exercises].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

function getExerciseCount(inputs: WorkoutGeneratorInputs): number {
  if (inputs.workoutType === "strength") return inputs.duration <= 30 ? 6 : 8;
  if (inputs.workoutType === "mobility") return inputs.duration <= 20 ? 8 : 12;
  if (inputs.workoutType === "cardio") return inputs.duration <= 20 ? 6 : 10;
  if (inputs.workoutType === "challenge") return 12;
  return inputs.duration <= 20 ? 8 : 12;
}

function structureWorkout(exercises: Exercise[], inputs: WorkoutGeneratorInputs): WorkoutBlock[] {
  const blocks: WorkoutBlock[] = [];
  
  if (inputs.format === "tabata" || inputs.workoutType === "cardio") {
    blocks.push({
      name: "Main Workout",
      exercises: exercises.map(ex => ({
        name: ex.name,
        duration: "20s",
        rest: "10s"
      })),
      rounds: 8,
      instructions: "Perform each exercise for 20 seconds, rest 10 seconds. Complete 8 rounds."
    });
  } else if (inputs.format === "circuit" || inputs.format === "mix") {
    const rounds = inputs.duration <= 20 ? 3 : 4;
    blocks.push({
      name: "Circuit",
      exercises: exercises.map(ex => ({
        name: ex.name,
        reps: inputs.workoutType === "strength" ? "10-12" : "12-15",
        rest: "30s"
      })),
      rounds,
      restBetweenRounds: "90 seconds",
      instructions: `Complete all exercises for the prescribed reps, then rest 90 seconds. Repeat for ${rounds} rounds.`
    });
  } else if (inputs.format === "reps_sets") {
    blocks.push({
      name: "Strength Training",
      exercises: exercises.map(ex => ({
        name: ex.name,
        sets: 4,
        reps: "8-10",
        rest: "90s",
        tempo: "3-0-1-0"
      })),
      instructions: "Perform each exercise for 4 sets of 8-10 reps with controlled tempo. Rest 90 seconds between sets."
    });
  } else if (inputs.format === "amrap") {
    blocks.push({
      name: `AMRAP ${inputs.duration} Minutes`,
      exercises: exercises.map(ex => ({
        name: ex.name,
        reps: "12-15"
      })),
      instructions: `Complete as many rounds as possible in ${inputs.duration} minutes. Focus on quality movement.`
    });
  } else if (inputs.format === "emom") {
    blocks.push({
      name: `EMOM ${inputs.duration} Minutes`,
      exercises: exercises.map((ex, i) => ({
        name: ex.name,
        reps: "10-12",
        notes: `Minute ${i + 1}`
      })),
      instructions: `Every minute on the minute, perform the prescribed exercise. Rest for the remainder of the minute.`
    });
  } else if (inputs.format === "for_time") {
    blocks.push({
      name: "For Time",
      exercises: exercises.map(ex => ({
        name: ex.name,
        reps: "15"
      })),
      rounds: 3,
      instructions: "Complete 3 rounds for time. Move as quickly as possible while maintaining form."
    });
  }
  
  return blocks;
}

function generateWorkoutName(inputs: WorkoutGeneratorInputs): string {
  const type = getFocusLabel(inputs.workoutType);
  const format = getFormatLabel(inputs.format);
  const focus = inputs.bodyFocus.includes("full_body") ? "Full Body" : 
                inputs.bodyFocus.includes("upper") ? "Upper Body" :
                inputs.bodyFocus.includes("lower") ? "Lower Body" : "Mixed";
  
  return `${inputs.duration}-Minute ${type} ${format} - ${focus}`;
}

function generateSerialNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `SW-${year}-${random}`;
}

function getFocusLabel(type: string): string {
  const labels: Record<string, string> = {
    strength: "Strength",
    calorie_burning: "Calorie Burning",
    metabolic: "Metabolic",
    cardio: "Cardio",
    mobility: "Mobility",
    challenge: "Challenge"
  };
  return labels[type] || "Workout";
}

function getFormatLabel(format: string): string {
  const labels: Record<string, string> = {
    tabata: "Tabata",
    circuit: "Circuit",
    amrap: "AMRAP",
    for_time: "For Time",
    emom: "EMOM",
    reps_sets: "Reps & Sets",
    mix: "Mixed Format"
  };
  return labels[format] || "Workout";
}

function generateDescription(inputs: WorkoutGeneratorInputs): string {
  const type = getFocusLabel(inputs.workoutType);
  const equipment = inputs.equipmentPreference === "equipment" ? "using available equipment" : "using only your bodyweight";
  
  return `A ${inputs.duration}-minute ${type.toLowerCase()} workout designed for ${inputs.difficulty} level athletes, ${equipment}. This workout targets your training goals with scientifically-backed exercise selection.`;
}

function generateInstructions(inputs: WorkoutGeneratorInputs): string {
  if (inputs.format === "tabata") {
    return "Perform each exercise for 20 seconds at high intensity, followed by 10 seconds of rest. Complete all exercises for the prescribed number of rounds.";
  } else if (inputs.format === "circuit") {
    return "Move through each exercise completing the prescribed reps before moving to the next. Rest as indicated between exercises and rounds.";
  } else if (inputs.format === "reps_sets") {
    return "Complete all sets of one exercise before moving to the next. Focus on controlled tempo and proper form.";
  } else if (inputs.format === "amrap") {
    return "Complete as many rounds as possible within the time limit. Pace yourself to maintain consistent quality throughout.";
  } else if (inputs.format === "emom") {
    return "Start each new exercise at the top of the minute. Use remaining time to rest before the next minute begins.";
  } else if (inputs.format === "for_time") {
    return "Complete all prescribed rounds as quickly as possible while maintaining proper form. Record your time.";
  }
  return "Follow the workout structure provided. Warm up before starting and cool down when finished.";
}

function generateTips(inputs: WorkoutGeneratorInputs): string {
  const tips = [
    "Always warm up with 5-10 minutes of light cardio and dynamic stretching.",
    "Focus on proper form over speed or heavy weight.",
    "Stay hydrated throughout your workout.",
    "Listen to your body and modify exercises as needed.",
    "Cool down with 5-10 minutes of stretching."
  ];
  
  if (inputs.workoutType === "strength") {
    tips.push("Use a weight that allows you to complete all reps with good form.");
  } else if (inputs.workoutType === "cardio" || inputs.workoutType === "metabolic") {
    tips.push("Pace yourself to maintain intensity throughout the entire workout.");
  } else if (inputs.workoutType === "mobility") {
    tips.push("Move slowly and breathe deeply through each movement.");
  }
  
  return tips.join(" ");
}
