import { Card, CardContent } from "@/components/ui/card";
import { Megaphone } from "lucide-react";

export const PromotionalContent = () => {
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <Megaphone className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-2">Promotional Content</h3>
          <p className="text-sm text-muted-foreground">
            This section is ready for your promotional materials. Content coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
