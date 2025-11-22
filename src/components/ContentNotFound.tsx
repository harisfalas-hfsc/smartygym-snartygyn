import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, Search } from "lucide-react";

interface ContentNotFoundProps {
  contentType: "workout" | "program";
  contentId: string;
}

export const ContentNotFound = ({ contentType, contentId }: ContentNotFoundProps) => {
  const navigate = useNavigate();
  
  const contentTypeLabel = contentType === "workout" ? "Workout" : "Training Program";
  const libraryPath = contentType === "workout" ? "/workouts" : "/training-programs";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full border-2 border-destructive/30">
        <CardContent className="pt-12 pb-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-6 bg-destructive/10 rounded-full">
              <AlertCircle className="w-16 h-16 text-destructive" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-4xl font-bold">{contentTypeLabel} Not Found</h1>
            <p className="text-xl text-muted-foreground">
              The {contentType} <span className="font-mono text-sm bg-muted px-2 py-1 rounded">"{contentId}"</span> doesn't exist or has been removed.
            </p>
          </div>

          <div className="pt-6 space-y-3">
            <Button 
              onClick={() => navigate(libraryPath)} 
              className="w-full max-w-sm" 
              size="lg"
            >
              <Search className="w-4 h-4 mr-2" />
              Browse {contentType === "workout" ? "Workouts" : "Programs"}
            </Button>
            
            <Button 
              onClick={() => navigate(-1)} 
              variant="outline" 
              className="w-full max-w-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>

          <div className="pt-6 border-t">
            <p className="text-sm text-muted-foreground">
              If you believe this is an error, please <a href="/contact" className="text-primary hover:underline">contact support</a>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
