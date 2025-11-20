import { Card, CardContent } from "@/components/ui/card";
import { Heart } from "lucide-react";

export const PersonalRecommendation = () => {
  return (
    <Card className="mb-8 border-primary/20 bg-primary/5">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <Heart className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
          <div>
            <p className="text-base leading-relaxed">
              <strong>A Personal Note from <a href="/coach-profile" className="text-primary hover:underline font-medium">Haris Falas</a>:</strong>
            </p>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              These are products I personally use, trust, and believe offer genuine value for your money. 
              Every item here has earned its place through real-world testing in my training and coaching practice. 
              I only recommend equipment that I would confidently suggest to my own clients and family members.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
