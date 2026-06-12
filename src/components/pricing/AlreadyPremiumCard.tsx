import { Crown, LayoutDashboard, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface AlreadyPremiumCardProps {
  className?: string;
}

export function AlreadyPremiumCard({ className }: AlreadyPremiumCardProps) {
  const navigate = useNavigate();

  return (
    <Card className={`bg-gradient-to-br from-primary/20 via-primary/10 to-background border-2 border-primary/50 shadow-lg ${className}`}>
      <CardContent className="p-6 sm:p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="p-4 bg-primary/20 rounded-full">
              <Crown className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
            </div>
            <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
              <CheckCircle className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
        
        <Badge className="bg-primary text-primary-foreground mb-4 text-sm px-4 py-1">
          PREMIUM MEMBER
        </Badge>
        
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">
          You're Already a Premium Member!
        </h2>
        
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          You have full access to all premium features, workouts, and training programs. 
          Premium for life — nothing to renew, nothing to manage.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={() => navigate('/userdashboard')}
            className="gap-2"
          >
            <LayoutDashboard className="h-4 w-4" />
            Go to Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
