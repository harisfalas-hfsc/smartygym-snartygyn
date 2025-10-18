import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

const WorkoutFlow = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto py-4 sm:py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span className="text-xs sm:text-sm">Back to Home</span>
        </Button>
        
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 sm:mb-8">Workout</h1>
        
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground text-center">Coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkoutFlow;
