import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ClipboardCheck, CheckCircle, XCircle, AlertTriangle, Loader2, History, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const PARQ_QUESTIONS = [
  "Has your doctor ever said that you have a heart condition and that you should only do physical activity recommended by a doctor?",
  "Do you feel pain in your chest when you do physical activity?",
  "In the past month, have you had chest pain when you were not doing physical activity?",
  "Do you lose your balance because of dizziness or do you ever lose consciousness?",
  "Do you have a bone or joint problem (for example, back, knee or hip) that could be made worse by a change in your physical activity?",
  "Is your doctor currently prescribing drugs (for example, water pills) for your blood pressure or heart condition?",
  "Do you know of any other reason why you should not do physical activity?",
];

interface ParQResponse {
  id: string;
  user_id: string;
  responses: Record<number, string>;
  is_cleared: boolean;
  created_at: string;
}

export function ParQAssessmentSection() {
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [isCleared, setIsCleared] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [history, setHistory] = useState<ParQResponse[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<ParQResponse | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from("parq_responses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setHistory((data as ParQResponse[]) || []);
    } catch (error) {
      console.error("Error fetching PAR-Q history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleAnswerChange = (questionIndex: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: value }));
    setShowResult(false);
  };

  const handleSubmit = async () => {
    const allAnswered = PARQ_QUESTIONS.every((_, index) => answers[index] !== undefined);
    if (!allAnswered) {
      toast({
        title: "Incomplete Assessment",
        description: "Please answer all questions before submitting.",
        variant: "destructive",
      });
      return;
    }

    const hasYesAnswer = Object.values(answers).some((answer) => answer === "yes");
    const cleared = !hasYesAnswer;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("parq_responses").insert({
        user_id: user.id,
        responses: answers,
        is_cleared: cleared,
      });

      if (error) throw error;

      setIsCleared(cleared);
      setShowResult(true);
      await fetchHistory();

      toast({
        title: "Assessment Saved",
        description: "Your PAR-Q assessment has been recorded.",
      });
    } catch (error) {
      console.error("Error saving PAR-Q:", error);
      toast({
        title: "Error",
        description: "Failed to save your assessment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setShowResult(false);
    setIsCleared(false);
  };

  const latestAssessment = history[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          PAR-Q Health Assessment
        </CardTitle>
        <CardDescription>
          Physical Activity Readiness Questionnaire - Complete before starting any workout program
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="assessment">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="assessment" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Take Assessment
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              History
              {history.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {history.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assessment" className="mt-4 space-y-6">
            {/* Latest Status Banner */}
            {latestAssessment && !showResult && (
              <Alert className={latestAssessment.is_cleared ? "border-green-200 bg-green-50/50 dark:bg-green-900/10" : "border-amber-200 bg-amber-50/50 dark:bg-amber-900/10"}>
                <div className="flex items-start gap-2">
                  {latestAssessment.is_cleared ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  )}
                  <div>
                    <AlertTitle className="text-sm font-medium">
                      Last Assessment: {format(new Date(latestAssessment.created_at), "MMM d, yyyy")}
                    </AlertTitle>
                    <AlertDescription className="text-sm text-muted-foreground">
                      {latestAssessment.is_cleared 
                        ? "You were cleared for physical activity. Consider retaking if your health has changed."
                        : "Medical consultation was recommended. Please consult a doctor before exercising."}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            )}

            {/* Result Banner */}
            {showResult && (
              <Alert className={isCleared ? "border-green-200 bg-green-50/50 dark:bg-green-900/10" : "border-destructive/20 bg-destructive/5"}>
                <div className="flex items-start gap-2">
                  {isCleared ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                  <div>
                    <AlertTitle className="text-sm font-medium">
                      {isCleared ? "Cleared for Physical Activity" : "Medical Consultation Recommended"}
                    </AlertTitle>
                    <AlertDescription className="text-sm text-muted-foreground">
                      {isCleared 
                        ? "Based on your responses, you can begin physical activity. Start slowly and build up gradually."
                        : "One or more of your answers suggest you should consult with a physician before starting an exercise program."}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            )}

            {/* Questions */}
            <div className="space-y-4">
              {PARQ_QUESTIONS.map((question, index) => (
                <div key={index} className="space-y-2 p-4 rounded-lg bg-muted/30 border">
                  <Label className="text-sm font-medium leading-relaxed">
                    {index + 1}. {question}
                  </Label>
                  <Select
                    value={answers[index] || ""}
                    onValueChange={(value) => handleAnswerChange(index, value)}
                  >
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Select answer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="flex-1 sm:flex-none"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <ClipboardCheck className="h-4 w-4 mr-2" />
                    Submit Assessment
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleReset}>
                Reset Answers
              </Button>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-muted-foreground pt-4 border-t">
              <strong>Disclaimer:</strong> This questionnaire is for informational purposes only and is not a substitute for professional medical advice. 
              If you have any health concerns, please consult with a qualified healthcare provider before starting any exercise program.
            </p>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No PAR-Q assessments yet</p>
                <p className="text-sm">Complete your first assessment to see it here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedHistoryItem ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">
                        Assessment from {format(new Date(selectedHistoryItem.created_at), "MMMM d, yyyy 'at' h:mm a")}
                      </h4>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedHistoryItem(null)}>
                        Back to list
                      </Button>
                    </div>
                    <Badge variant={selectedHistoryItem.is_cleared ? "default" : "destructive"}>
                      {selectedHistoryItem.is_cleared ? "Cleared" : "Medical Consultation Recommended"}
                    </Badge>
                    <ScrollArea className="h-[300px] pr-4">
                      <div className="space-y-3">
                        {PARQ_QUESTIONS.map((question, index) => (
                          <div key={index} className="p-3 rounded-lg bg-muted/30 border">
                            <p className="text-sm font-medium mb-1">{index + 1}. {question}</p>
                            <Badge variant={selectedHistoryItem.responses[index] === "yes" ? "destructive" : "secondary"}>
                              {selectedHistoryItem.responses[index]?.toUpperCase() || "Not answered"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                ) : (
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2 pr-4">
                      {history.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSelectedHistoryItem(item)}
                          className="w-full p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors text-left"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {item.is_cleared ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <XCircle className="h-5 w-5 text-destructive" />
                              )}
                              <div>
                                <p className="font-medium text-sm">
                                  {format(new Date(item.created_at), "MMMM d, yyyy")}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(item.created_at), "h:mm a")}
                                </p>
                              </div>
                            </div>
                            <Badge variant={item.is_cleared ? "default" : "destructive"} className="shrink-0">
                              {item.is_cleared ? "Cleared" : "Not Cleared"}
                            </Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
