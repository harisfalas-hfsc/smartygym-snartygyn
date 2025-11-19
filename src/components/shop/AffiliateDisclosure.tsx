import { Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const AffiliateDisclosure = () => {
  return (
    <Alert className="mb-6 border-primary/20 bg-primary/5">
      <Info className="h-4 w-4 text-primary" />
      <AlertDescription className="text-sm">
        <strong>Affiliate Disclosure:</strong> As an Amazon Associate, I earn from qualifying purchases. 
        This means if you click a link and make a purchase, I may receive a small commission at no extra cost to you. 
        I only recommend products I personally use or believe will add value to your fitness journey.
      </AlertDescription>
    </Alert>
  );
};
