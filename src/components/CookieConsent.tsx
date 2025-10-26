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
      className={`fixed bottom-0 left-0 right-0 z-50 p-4 transition-all duration-300 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
    >
      <Card className="max-w-4xl mx-auto p-4 sm:p-6 shadow-lg border-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-shrink-0">
            <Cookie className="h-6 w-6 text-primary" />
          </div>
          
          <div className="flex-1 space-y-2">
            <h3 className="text-sm font-semibold">Cookie Notice</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              We use essential cookies for authentication and functionality, plus optional cookies to remember your preferences. 
              By accepting, you help us provide a better experience. See our{" "}
              <Link to="/privacy-policy" className="text-primary hover:underline font-medium">
                Privacy Policy
              </Link>{" "}
              for details.
            </p>
          </div>

          <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
            <Button 
              onClick={handleAccept}
              size="sm"
              className="flex-1 sm:flex-none text-xs"
            >
              Accept All
            </Button>
            <Button 
              onClick={handleReject}
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none text-xs"
            >
              Essential Only
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 sm:relative sm:top-0 sm:right-0 h-6 w-6"
            onClick={handleReject}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};
