import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell } from "lucide-react";

interface PlanDisplayProps {
  planContent: string;
  title?: string;
}

export const PlanDisplay = ({ planContent, title = "Your Plan" }: PlanDisplayProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none whitespace-pre-wrap">
          {planContent}
        </div>
      </CardContent>
    </Card>
  );
};
