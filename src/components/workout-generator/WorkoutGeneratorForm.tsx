import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Dumbbell, Zap, Heart, Activity, Move, Trophy, AlertCircle } from "lucide-react";
import type { WorkoutGeneratorInputs } from "@/types/workoutGenerator";

const formSchema = z.object({
  age: z.number().min(13, "Age must be at least 13").max(100, "Age must be less than 100"),
  height: z.number().min(100, "Height must be at least 100cm").max(250, "Height must be less than 250cm"),
  weight: z.number().min(30, "Weight must be at least 30kg").max(300, "Weight must be less than 300kg"),
  workoutType: z.enum(["strength", "calorie_burning", "metabolic", "cardio", "mobility", "challenge"]),
  equipmentPreference: z.enum(["equipment", "no_equipment"]),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  format: z.enum(["tabata", "circuit", "amrap", "for_time", "emom", "reps_sets", "mix"]),
  duration: z.number().min(15).max(60),
  bodyFocus: z.array(z.enum(["upper", "lower", "core", "full_body", "mixed"])).min(1, "Select at least one body focus area"),
});

type FormData = z.infer<typeof formSchema>;

interface WorkoutGeneratorFormProps {
  onSubmit: (data: WorkoutGeneratorInputs) => void;
  isLoading: boolean;
}

const workoutTypes = [
  { value: "strength", label: "Strength", icon: Dumbbell, description: "Build muscle and power" },
  { value: "calorie_burning", label: "Calorie Burning", icon: Zap, description: "High-intensity fat burn" },
  { value: "metabolic", label: "Metabolic", icon: Activity, description: "Boost metabolism" },
  { value: "cardio", label: "Cardio", icon: Heart, description: "Improve endurance" },
  { value: "mobility", label: "Mobility & Stability", icon: Move, description: "Flexibility and balance" },
  { value: "challenge", label: "Challenge", icon: Trophy, description: "Advanced mixed workout" },
];

const bodyFocusOptions = [
  { value: "upper", label: "Upper Body" },
  { value: "lower", label: "Lower Body" },
  { value: "core", label: "Core" },
  { value: "full_body", label: "Full Body" },
  { value: "mixed", label: "Mixed" },
];

export function WorkoutGeneratorForm({ onSubmit, isLoading }: WorkoutGeneratorFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: 30,
      height: 175,
      weight: 75,
      workoutType: "metabolic",
      equipmentPreference: "no_equipment",
      difficulty: "intermediate",
      format: "circuit",
      duration: 30,
      bodyFocus: ["full_body"],
    },
  });

  const workoutType = watch("workoutType");
  const equipmentPreference = watch("equipmentPreference");
  const difficulty = watch("difficulty");
  const bodyFocus = watch("bodyFocus");
  const currentFormat = watch("format");

  // Smart validation: adjust format options based on workout type
  const availableFormats = React.useMemo(() => {
    if (workoutType === "strength") {
      return [{ value: "reps_sets", label: "Reps & Sets" }];
    }
    if (workoutType === "cardio") {
      return [
        { value: "tabata", label: "Tabata (20s on / 10s off)" },
        { value: "circuit", label: "Circuit" },
        { value: "amrap", label: "AMRAP (As Many Rounds As Possible)" },
        { value: "for_time", label: "For Time" },
        { value: "emom", label: "EMOM (Every Minute On the Minute)" },
        { value: "mix", label: "Mix (Variety)" },
      ];
    }
    return [
      { value: "tabata", label: "Tabata (20s on / 10s off)" },
      { value: "circuit", label: "Circuit" },
      { value: "amrap", label: "AMRAP (As Many Rounds As Possible)" },
      { value: "for_time", label: "For Time" },
      { value: "emom", label: "EMOM (Every Minute On the Minute)" },
      { value: "reps_sets", label: "Reps & Sets" },
      { value: "mix", label: "Mix (Variety)" },
    ];
  }, [workoutType]);

  // Auto-adjust format when workout type changes
  React.useEffect(() => {
    const isCurrentFormatAvailable = availableFormats.some(f => f.value === currentFormat);
    
    if (!isCurrentFormatAvailable) {
      setValue("format", availableFormats[0].value as any);
    }
  }, [workoutType, availableFormats, currentFormat, setValue]);

  // Show warning for suboptimal combinations
  const showCardioUpperBodyWarning = 
    workoutType === "cardio" && 
    bodyFocus?.length === 1 && 
    bodyFocus[0] === "upper";

  const handleFormSubmit = (data: FormData) => {
    onSubmit(data as WorkoutGeneratorInputs);
  };

  const toggleBodyFocus = (value: string) => {
    const current = bodyFocus || [];
    const newFocus = current.includes(value as any)
      ? current.filter((f) => f !== value)
      : [...current, value as any];
    setValue("bodyFocus", newFocus as any, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Personal Info Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Personal Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              {...register("age", { valueAsNumber: true })}
              className={errors.age ? "border-destructive" : ""}
            />
            {errors.age && <p className="text-sm text-destructive">{errors.age.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">Height (cm)</Label>
            <Input
              id="height"
              type="number"
              {...register("height", { valueAsNumber: true })}
              className={errors.height ? "border-destructive" : ""}
            />
            {errors.height && <p className="text-sm text-destructive">{errors.height.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              {...register("weight", { valueAsNumber: true })}
              className={errors.weight ? "border-destructive" : ""}
            />
            {errors.weight && <p className="text-sm text-destructive">{errors.weight.message}</p>}
          </div>
        </div>
      </div>

      {/* Workout Type Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Workout Type</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {workoutTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => setValue("workoutType", type.value as any)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  workoutType === type.value
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <Icon className="w-6 h-6 mb-2 text-primary" />
                <div className="font-medium">{type.label}</div>
                <div className="text-sm text-muted-foreground">{type.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Equipment Preference */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Equipment Preference</h3>
        <RadioGroup value={equipmentPreference} onValueChange={(val) => setValue("equipmentPreference", val as any)}>
          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="equipment" id="equipment" />
              <Label htmlFor="equipment">Equipment Available</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no_equipment" id="no_equipment" />
              <Label htmlFor="no_equipment">No Equipment (Bodyweight Only)</Label>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Difficulty Level */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Difficulty Level</h3>
        <div className="flex gap-3">
          {["beginner", "intermediate", "advanced"].map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setValue("difficulty", level as any)}
              className={`px-6 py-2 rounded-full border-2 transition-all capitalize ${
                difficulty === level
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Format and Duration */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="format">Workout Format</Label>
          <Select value={watch("format")} onValueChange={(val) => setValue("format", val as any)}>
            <SelectTrigger id="format">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableFormats.map((format) => (
                <SelectItem key={format.value} value={format.value}>
                  {format.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {workoutType === "strength" && (
            <p className="text-xs text-muted-foreground">
              Strength workouts use Reps & Sets format
            </p>
          )}
          {workoutType === "cardio" && (
            <p className="text-xs text-muted-foreground">
              Cardio workouts use time-based formats
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Select value={watch("duration").toString()} onValueChange={(val) => setValue("duration", parseInt(val))}>
            <SelectTrigger id="duration">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="20">20 minutes</SelectItem>
              <SelectItem value="25">25 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="45">45 minutes</SelectItem>
              <SelectItem value="60">60 minutes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Body Focus */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Body Focus</h3>
        <div className="flex flex-wrap gap-3">
          {bodyFocusOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleBodyFocus(option.value)}
              className={`px-4 py-2 rounded-lg border-2 transition-all ${
                bodyFocus?.includes(option.value as any)
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        {errors.bodyFocus && <p className="text-sm text-destructive">{errors.bodyFocus.message}</p>}
        {showCardioUpperBodyWarning && (
          <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              <strong>Note:</strong> Cardio exercises are primarily full-body or lower-body focused. 
              Consider selecting <strong>Full Body</strong> or <strong>Lower</strong> for best results.
            </p>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
        {isLoading ? "Generating Your Workout..." : "Generate My Workout"}
      </Button>
    </form>
  );
}
