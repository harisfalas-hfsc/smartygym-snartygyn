export type QuestionType = 
  | "today"
  | "workout-or-program" 
  | "goal"
  | "equipment"
  | "time"
  | "limited-time";

export type GoalType = 
  | "lose-fat"
  | "sweat"
  | "get-stronger"
  | "build-muscle"
  | "improve-cardio"
  | "improve-mobility"
  | "improve-endurance"
  | "tone-body"
  | "increase-explosiveness"
  | "improve-functional-strength"
  | "increase-power"
  | "increase-stamina"
  | "general-fitness"
  | "reduce-stress"
  | "fix-posture";

export type EquipmentType = 
  | "bodyweight"
  | "full-gym"
  | "rack-barbell"
  | "dumbbells"
  | "kettlebells"
  | "jump-rope"
  | "medicine-ball"
  | "pull-up-bar"
  | "resistance-bands"
  | "trx"
  | "bench"
  | "step-platform"
  | "sandbag"
  | "ankle-weights"
  | "weighted-vest";

export type TimeOption = "10" | "20" | "30" | "45" | "60" | "unlimited";

export interface ConversationState {
  currentQuestion: QuestionType | null;
  selectedGoal: string | null;
  selectedEquipment: string[] | null;
  selectedTime: string | null;
  isLoading: boolean;
  recommendation: Recommendation | null;
}

export interface Message {
  type: "coach" | "user";
  content: string;
  timestamp: Date;
}

export interface Recommendation {
  type: "workout" | "program";
  id: string;
  name: string;
  category: string;
  reason: string;
  isPerfectMatch: boolean;
  isPremium: boolean;
  tierRequired: string | null;
  ecosystemSuggestion?: {
    tool: string;
    route: string;
    reason: string;
  };
}

export interface SmartyCoachRequest {
  question: QuestionType;
  goal?: GoalType;
  equipment?: EquipmentType;
  time?: TimeOption;
}

export interface SmartyCoachResponse {
  recommendation: Recommendation;
  message: string;
}
