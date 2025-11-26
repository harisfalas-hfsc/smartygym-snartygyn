import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Cookie, X } from "lucide-react";
import { Link } from "react-router-dom";

export const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      // Delay showing banner slightly for better UX
      setTimeout(() => {
        setShowBanner(true);
        setTimeout(() => setIsVisible(true), 100);
      }, 1000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    localStorage.setItem("cookie-consent-date", new Date().toISOString());
    closeBanner();
  };

  const handleReject = () => {
    localStorage.setItem("cookie-consent", "rejected");
    localStorage.setItem("cookie-consent-date", new Date().toISOString());
    // Clear non-essential cookies/storage
    const essentialKeys = ["cookie-consent", "cookie-consent-date"];
    Object.keys(localStorage).forEach(key => {
      if (!essentialKeys.includes(key) && !key.startsWith("sb-")) {
        localStorage.removeItem(key);
      }
    });
    closeBanner();
  };

  const closeBanner = () => {
    setIsVisible(false);
    setTimeout(() => setShowBanner(false), 300);
  };

  if (!showBanner) return null;

  return (
    <div 
      className={`fixed bottom-4 right-4 z-[85] max-w-[90vw] sm:max-w-none transition-all duration-300 ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <Card className="w-full sm:w-80 p-4 shadow-2xl border-2 bg-background">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6"
          onClick={handleReject}
        >
          <X className="h-3 w-3" />
        </Button>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Cookie className="h-5 w-5 text-primary flex-shrink-0" />
            <h3 className="text-sm font-semibold">Cookie Notice</h3>
          </div>
          
          <p className="text-xs text-muted-foreground leading-relaxed">
            We use cookies for authentication and preferences. See our{" "}
            <Link to="/privacy-policy" className="text-primary hover:underline font-medium">
              Privacy Policy
            </Link>.
          </p>

          <div className="flex gap-2">
            <Button 
              onClick={handleAccept}
              size="sm"
              className="flex-1 h-8 text-xs"
            >
              Accept
            </Button>
            <Button 
              onClick={handleReject}
              variant="outline"
              size="sm"
              className="flex-1 h-8 text-xs"
            >
              Decline
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
