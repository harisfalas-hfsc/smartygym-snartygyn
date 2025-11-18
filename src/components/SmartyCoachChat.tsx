import { useState, useEffect, useRef } from "react";
import { X, Loader2, Sparkles, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SmartyCoachQuestionButtons } from "./SmartyCoachQuestionButtons";
import { SmartyCoachAnswerButtons } from "./SmartyCoachAnswerButtons";
import type {
  QuestionType,
  ConversationState,
  Message,
  Recommendation,
  SmartyCoachResponse,
  UserContext,
} from "@/types/smartyCoach";
import { useNavigate } from "react-router-dom";

interface SmartyCoachChatProps {
  onClose: () => void;
}

export const SmartyCoachChat = ({ onClose }: SmartyCoachChatProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [state, setState] = useState<ConversationState>({
    currentQuestion: null,
    selectedGoal: null,
    selectedEquipment: null,
    selectedTime: null,
    isLoading: false,
    recommendation: null,
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      type: "coach",
      content: "Hi! I'm SmartyCoach 💪 How can I help you today?",
      timestamp: new Date(),
    },
  ]);

  const [awaitingAnswer, setAwaitingAnswer] = useState<QuestionType | null>(null);
  const [userContext, setUserContext] = useState<UserContext | null>(null);

  // Load user context on mount
  useEffect(() => {
    const loadUserContext = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const userId = session.user.id;

        const [{ data: workoutData }, { data: programData }, { data: subData }] = await Promise.all([
          supabase
            .from("workout_interactions")
            .select("workout_id, has_viewed, is_completed")
            .eq("user_id", userId),
          supabase
            .from("program_interactions")
            .select("program_id, has_viewed, is_completed")
            .eq("user_id", userId),
          supabase
            .from("user_subscriptions")
            .select("plan_type, status")
            .eq("user_id", userId)
            .maybeSingle(),
        ]);

        const completedWorkouts = (workoutData || [])
          .filter(w => w.is_completed && w.workout_id)
          .map(w => w.workout_id as string);

        const viewedWorkouts = (workoutData || [])
          .filter(w => w.has_viewed && !w.is_completed && w.workout_id)
          .map(w => w.workout_id as string);

        const completedPrograms = (programData || [])
          .filter(p => p.is_completed && p.program_id)
          .map(p => p.program_id as string);

        const viewedPrograms = (programData || [])
          .filter(p => p.has_viewed && !p.is_completed && p.program_id)
          .map(p => p.program_id as string);

        const subscriptionPlan: string =
          subData && subData.status === "active"
            ? (subData.plan_type as string)
            : "free";

        setUserContext({
          completedWorkouts,
          viewedWorkouts,
          completedPrograms,
          viewedPrograms,
          subscriptionPlan,
        });
      } catch (e) {
        console.error("SmartyCoach user context error:", e);
      }
    };

    loadUserContext();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, state.recommendation]);

  const addMessage = (type: "coach" | "user", content: string) => {
    setMessages((prev) => [...prev, { type, content, timestamp: new Date() }]);
  };

  const handleQuestionSelect = (question: QuestionType) => {
    setState((prev) => ({ ...prev, currentQuestion: question }));
    addMessage("user", getQuestionLabel(question));

    if (question === "today") {
      addMessage("coach", "Great! Let me ask you a few quick questions.");
      setTimeout(() => setAwaitingAnswer("goal"), 300);
    } else if (question === "workout-or-program" || question === "goal") {
      setAwaitingAnswer("goal");
    } else if (question === "equipment") {
      setAwaitingAnswer("equipment");
    } else if (question === "limited-time") {
      setAwaitingAnswer("time");
    }
  };

  const handleAnswerSelect = async (answer: string | string[]) => {
    if (awaitingAnswer === "goal") {
      const goalsArray = Array.isArray(answer) ? answer : [answer];
      setState((prev) => ({ ...prev, selectedGoal: goalsArray }));
      
      const goalLabels = goalsArray.map(g => getAnswerLabel(g)).join(", ");
      addMessage("user", goalLabels);

      if (state.currentQuestion === "today") {
        setTimeout(() => {
          addMessage("coach", "What equipment do you have available?");
          setAwaitingAnswer("equipment");
        }, 300);
      } else {
        await getRecommendation(state.currentQuestion!, goalsArray, null, null);
      }
    } else if (awaitingAnswer === "equipment") {
      const equipmentArray = Array.isArray(answer) ? answer : [answer];
      setState((prev) => ({ ...prev, selectedEquipment: equipmentArray }));
      
      const equipmentLabels = equipmentArray.map(eq => getAnswerLabel(eq)).join(", ");
      addMessage("user", equipmentLabels);

      if (state.currentQuestion === "today") {
        setTimeout(() => {
          addMessage("coach", "How much time do you have?");
          setAwaitingAnswer("time");
        }, 300);
      } else {
        await getRecommendation(state.currentQuestion!, null, equipmentArray, null);
      }
    } else if (awaitingAnswer === "time" || awaitingAnswer === "limited-time") {
      const answerStr = Array.isArray(answer) ? answer[0] : answer;
      setState((prev) => ({ ...prev, selectedTime: answerStr }));
      addMessage("user", getAnswerLabel(answerStr));

      if (state.currentQuestion === "today") {
        await getRecommendation("today", state.selectedGoal, state.selectedEquipment, answerStr);
      } else {
        await getRecommendation(state.currentQuestion!, null, null, answerStr);
      }
    }
  };

  const getRecommendation = async (
    question: QuestionType,
    goal: string[] | null,
    equipment: string[] | null,
    time: string | null
  ) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    setAwaitingAnswer(null);

    try {
      const payload = {
        question,
        goal: goal && goal.length ? goal : undefined,
        equipment: equipment && equipment.length ? equipment : undefined,
        time: time || undefined,
        userContext: userContext || undefined,
      };

      const { data, error } = await supabase.functions.invoke<SmartyCoachResponse>("smarty-coach", {
        body: payload,
      });

      if (error) throw error;

      if (data?.recommendation) {
        setState((prev) => ({ ...prev, recommendation: data.recommendation, isLoading: false }));
        addMessage("coach", data.message);
      }
    } catch (error: any) {
      console.error("SmartyCoach error:", error);

      if (error.message?.includes("429")) {
        toast({
          title: "Too many requests",
          description: "Please wait a moment and try again.",
          variant: "destructive",
        });
      } else if (error.message?.includes("402")) {
        toast({
          title: "Service unavailable",
          description: "AI service is temporarily unavailable.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }

      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleViewContent = (rec: Recommendation) => {
    const route = rec.type === "workout" ? `/workout/${rec.id}` : `/trainingprogram/${rec.id}`;
    navigate(route);
    onClose();
  };

  const handleStartOver = () => {
    setState({
      currentQuestion: null,
      selectedGoal: null,
      selectedEquipment: null,
      selectedTime: null,
      isLoading: false,
      recommendation: null,
    });
    setMessages([
      {
        type: "coach",
        content: "Let's start fresh! What would you like to know?",
        timestamp: new Date(),
      },
    ]);
    setAwaitingAnswer(null);
  };

  return (
    <Card className="fixed bottom-28 right-6 w-[90vw] sm:w-[400px] h-[500px] shadow-gold border-primary/20 flex flex-col animate-scale-in z-40 bg-card/95 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="font-semibold text-foreground">SmartyCoach</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.type === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              <p className="text-sm">{msg.content}</p>
            </div>
          </div>
        ))}

        {state.isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Finding the perfect match...</span>
            </div>
          </div>
        )}

        {state.recommendation && (
          <div className="space-y-3">
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-start justify-between mb-2">
                <Badge variant={state.recommendation.isPremium ? "default" : "secondary"}>
                  {state.recommendation.type === "workout" ? "Workout" : "Program"}
                </Badge>
                {state.recommendation.isPremium && (
                  <Badge variant="outline" className="text-primary border-primary">
                    {state.recommendation.tierRequired?.toUpperCase()}
                  </Badge>
                )}
              </div>
              <h4 className="font-semibold text-foreground mb-1">{state.recommendation.name}</h4>
              <p className="text-sm text-muted-foreground mb-3">{state.recommendation.reason}</p>
              <Button
                onClick={() => handleViewContent(state.recommendation!)}
                className="w-full"
                size="sm"
              >
                View {state.recommendation.type === "workout" ? "Workout" : "Program"}
                <ExternalLink className="h-3 w-3 ml-2" />
              </Button>
            </Card>

            {state.recommendation.ecosystemSuggestion && (
              <Card className="p-3 bg-accent/5 border-accent/20">
                <p className="text-xs text-muted-foreground mb-1">Also try:</p>
                <p className="text-sm font-medium text-foreground">
                  {state.recommendation.ecosystemSuggestion.tool}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {state.recommendation.ecosystemSuggestion.reason}
                </p>
              </Card>
            )}

            <Button variant="outline" onClick={handleStartOver} className="w-full" size="sm">
              Ask Another Question
            </Button>
          </div>
        )}
      </div>

      {/* Question/Answer Buttons */}
      {!state.recommendation && !state.isLoading && (
        <>
          {!awaitingAnswer && !state.currentQuestion && (
            <SmartyCoachQuestionButtons onSelectQuestion={handleQuestionSelect} />
          )}
          {awaitingAnswer && (
            <SmartyCoachAnswerButtons
              questionType={awaitingAnswer}
              onSelectAnswer={handleAnswerSelect}
            />
          )}
        </>
      )}
    </Card>
  );
};

// Helper functions
  function getQuestionLabel(question: QuestionType): string {
    const labels: Record<QuestionType, string> = {
      today: "What should I do today?",
      "workout-or-program": "Should I go for a workout or a training program?",
      goal: "What is your goal?",
      equipment: "What is best for my equipment?",
      "limited-time": "I have limited time, what should I do?",
      time: "How much time do you have?",
    };
    return labels[question];
  }

function getAnswerLabel(answer: string): string {
  const labelMap: Record<string, string> = {
    "lose-fat": "Lose fat",
    sweat: "Sweat",
    "get-stronger": "Get stronger",
    "build-muscle": "Build muscle mass",
    "improve-cardio": "Improve cardio",
    "improve-mobility": "Improve mobility",
    "improve-endurance": "Improve endurance",
    "tone-body": "Tone my body",
    "increase-explosiveness": "Increase explosiveness",
    "improve-functional-strength": "Improve functional strength",
    "increase-power": "Increase power",
    "increase-stamina": "Increase stamina",
    "general-fitness": "General fitness",
    "reduce-stress": "Reduce stress",
    "fix-posture": "Fix my posture",
    bodyweight: "Bodyweight only",
    "full-gym": "Full gym access",
    "rack-barbell": "Rack + Barbell + Plates",
    dumbbells: "Dumbbells",
    kettlebells: "Kettlebells",
    "jump-rope": "Jump rope",
    "medicine-ball": "Medicine ball",
    "pull-up-bar": "Pull-up bar",
    "resistance-bands": "Resistance bands",
    trx: "TRX / Suspension trainer",
    bench: "Bench",
    "step-platform": "Step platform",
    sandbag: "Sandbag",
    "ankle-weights": "Ankle weights",
    "weighted-vest": "Weighted vest",
    "10": "10 minutes",
    "20": "20 minutes",
    "30": "30 minutes",
    "45": "45 minutes",
    "60": "60 minutes",
  };
  return labelMap[answer] || answer;
}
