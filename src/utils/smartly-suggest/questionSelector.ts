import { ConfidenceLevel } from "@/hooks/useConfidenceLevel";
import { SmartyContext } from "@/hooks/useSmartyContext";

export interface QuestionOption {
  label: string;
  value: string | number;
}

export interface Question {
  id: string;
  question: string;
  options: QuestionOption[];
}

export const QUESTION_POOL: Record<string, Question> = {
  TIME: {
    id: 'time',
    question: "How much time do you have?",
    options: [
      { label: "15 min", value: 15 },
      { label: "30 min", value: 30 },
      { label: "45 min", value: 45 },
      { label: "60+ min", value: 60 }
    ]
  },
  
  ENERGY: {
    id: 'energy',
    question: "How's your energy right now?",
    options: [
      { label: "Low - need something light", value: 1 },
      { label: "Moderate - normal workout", value: 3 },
      { label: "High - want a challenge", value: 5 }
    ]
  },
  
  GOAL: {
    id: 'goal',
    question: "What's your focus right now?",
    options: [
      { label: "Burn fat", value: "fat_loss" },
      { label: "Build muscle", value: "muscle_gain" },
      { label: "Get stronger", value: "strength" },
      { label: "Improve mobility", value: "flexibility" },
      { label: "Just move", value: "general_fitness" }
    ]
  },
  
  SORENESS: {
    id: 'soreness',
    question: "How's your body feeling?",
    options: [
      { label: "Fresh - no soreness", value: 1 },
      { label: "Slightly sore", value: 3 },
      { label: "Very sore - need recovery", value: 5 }
    ]
  },
  
  EQUIPMENT: {
    id: 'equipment',
    question: "What equipment do you have?",
    options: [
      { label: "No equipment", value: "bodyweight" },
      { label: "Some equipment", value: "various" },
      { label: "Full gym", value: "equipment" }
    ]
  },
  
  PROGRAM_CHECK: {
    id: 'program_check',
    question: "Continue your program or try something different?",
    options: [
      { label: "Continue program", value: "continue" },
      { label: "Something different", value: "different" }
    ]
  }
};

const isGoalOld = (goal: any): boolean => {
  if (!goal?.updated_at) return true;
  const updatedAt = new Date(goal.updated_at);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return updatedAt < thirtyDaysAgo;
};

export const selectQuestions = (
  confidence: ConfidenceLevel, 
  context: SmartyContext
): Question[] => {
  const questions: Question[] = [];
  
  // HIGH confidence = 1 question (care/confirmation)
  if (confidence === 'high') {
    questions.push(QUESTION_POOL.TIME);
    return questions;
  }
  
  // MEDIUM confidence = 2 questions
  if (confidence === 'medium') {
    questions.push(QUESTION_POOL.TIME);
    
    if (!context.todayCheckin || !context.todayCheckin.morning_completed) {
      questions.push(QUESTION_POOL.ENERGY);
    } else if (!context.userGoal || isGoalOld(context.userGoal)) {
      questions.push(QUESTION_POOL.GOAL);
    } else {
      const hasOngoingProgram = context.programInteractions.some(p => p.is_ongoing);
      if (hasOngoingProgram) {
        questions.push(QUESTION_POOL.PROGRAM_CHECK);
      } else {
        questions.push(QUESTION_POOL.ENERGY);
      }
    }
    return questions;
  }
  
  // LOW confidence = 3 questions
  questions.push(QUESTION_POOL.GOAL);
  questions.push(QUESTION_POOL.TIME);
  questions.push(QUESTION_POOL.ENERGY);
  
  return questions;
};
