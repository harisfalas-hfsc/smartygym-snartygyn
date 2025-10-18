import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import logo from "@/assets/smarty-gym-logo.png";

const questions = [
  "Has your doctor ever said that you have a heart condition and that you should only do physical activity recommended by a doctor?",
  "Do you feel pain in your chest when you do physical activity?",
  "In the past month, have you had chest pain when you were not doing physical activity?",
  "Do you lose your balance because of dizziness or do you ever lose consciousness?",
  "Do you have a bone or joint problem that could be made worse by a change in your physical activity?",
  "Is your doctor currently prescribing drugs (for example, water pills) for your blood pressure or heart condition?",
  "Do you know of any other reason why you should not do physical activity?"
];

export const ParQQuestionnaire = () => {
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [showResult, setShowResult] = useState(false);
  const [isCleared, setIsCleared] = useState(false);

  const handleAnswerChange = (questionIndex: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: value
    }));
    setShowResult(false);
  };

  const handleSubmit = () => {
    const allAnswered = questions.every((_, index) => answers[index]);
    if (!allAnswered) {
      alert("Please answer all questions before submitting.");
      return;
    }

    const hasYes = Object.values(answers).some(answer => answer === "yes");
    setIsCleared(!hasYes);
    setShowResult(true);
  };

  const handleReset = () => {
    setAnswers({});
    setShowResult(false);
    setIsCleared(false);
  };

  return (
    <Card className="border-2 border-primary/30">
      <CardHeader className="bg-primary/5">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Smarty Gym" className="h-12 w-12 object-contain" />
          <CardTitle className="text-2xl text-primary">PAR-Q+ Assessment</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Physical Activity Readiness Questionnaire - Complete this before starting your workout program
        </p>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {questions.map((question, index) => (
          <div key={index} className="space-y-2">
            <Label className="text-sm font-semibold">
              {index + 1}. {question}
            </Label>
            <Select
              value={answers[index] || ""}
              onValueChange={(value) => handleAnswerChange(index, value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select your answer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ))}

        <div className="flex gap-3 pt-4">
          <Button 
            onClick={handleSubmit}
            className="flex-1"
            size="lg"
          >
            Submit Assessment
          </Button>
          <Button 
            onClick={handleReset}
            variant="outline"
            size="lg"
          >
            Reset
          </Button>
        </div>

        {showResult && (
          <Alert 
            variant={isCleared ? "default" : "destructive"}
            className="border-2"
          >
            {isCleared ? (
              <>
                <CheckCircle2 className="h-5 w-5" />
                <AlertDescription className="space-y-3">
                  <div className="font-bold text-lg">✅ You are cleared to proceed!</div>
                  <p className="text-sm">
                    Based on your responses, you can safely start this workout program. 
                    Remember to:
                  </p>
                  <ul className="text-sm space-y-1 ml-4 list-disc">
                    <li>Start slowly and progress gradually</li>
                    <li>Listen to your body and rest when needed</li>
                    <li>Stop immediately if you experience any pain or discomfort</li>
                    <li>Stay hydrated throughout your workout</li>
                  </ul>
                  <p className="text-sm font-semibold">
                    By proceeding, you acknowledge that you are exercising at your own risk 
                    and that Smarty Gym is released from any liability.
                  </p>
                </AlertDescription>
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5" />
                <AlertDescription className="space-y-3">
                  <div className="font-bold text-lg">⚠️ Medical Clearance Required</div>
                  <p className="text-sm">
                    Based on your responses, we strongly recommend that you consult with 
                    your physician or healthcare provider before starting this workout program.
                  </p>
                  <p className="text-sm font-semibold">
                    Please seek medical advice and obtain clearance from a qualified healthcare 
                    professional before proceeding with any physical activity program.
                  </p>
                  <p className="text-sm">
                    Your safety is our priority. Once you have medical clearance, you may 
                    proceed with the workout program.
                  </p>
                  <p className="text-sm font-bold">
                    Smarty Gym and its affiliates are released from any liability related to 
                    your participation in this program. You are exercising at your own risk.
                  </p>
                </AlertDescription>
              </>
            )}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};