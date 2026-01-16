import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, History, ChevronLeft } from "lucide-react";
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

interface UserParQHistoryTabProps {
  userId: string;
}

export function UserParQHistoryTab({ userId }: UserParQHistoryTabProps) {
  const [history, setHistory] = useState<ParQResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ParQResponse | null>(null);

  useEffect(() => {
    fetchHistory();
  }, [userId]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("parq_responses")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setHistory((data as ParQResponse[]) || []);
    } catch (error) {
      console.error("Error fetching PAR-Q history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p className="font-medium">No PAR-Q Assessments</p>
        <p className="text-sm">This user has not completed any PAR-Q assessments yet.</p>
      </div>
    );
  }

  if (selectedItem) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setSelectedItem(null)}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <span className="text-sm text-muted-foreground">
            {format(new Date(selectedItem.created_at), "MMMM d, yyyy 'at' h:mm a")}
          </span>
        </div>
        
        <div className="flex items-center gap-2 mb-4">
          {selectedItem.is_cleared ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-destructive" />
          )}
          <Badge variant={selectedItem.is_cleared ? "default" : "destructive"}>
            {selectedItem.is_cleared ? "Cleared for Activity" : "Medical Consultation Recommended"}
          </Badge>
        </div>

        <ScrollArea className="h-[280px] pr-4">
          <div className="space-y-3">
            {PARQ_QUESTIONS.map((question, index) => (
              <div key={index} className="p-3 rounded-lg bg-muted/30 border">
                <p className="text-sm font-medium mb-2">{index + 1}. {question}</p>
                <Badge 
                  variant={selectedItem.responses[index] === "yes" ? "destructive" : "secondary"}
                  className="text-xs"
                >
                  {selectedItem.responses[index]?.toUpperCase() || "Not answered"}
                </Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-2 pr-4">
        {history.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedItem(item)}
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
  );
}
