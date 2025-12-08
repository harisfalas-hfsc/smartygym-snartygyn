import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Sunrise, Sun, Moon, Share2, Lock, Crown, Clock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAccessControl } from "@/hooks/useAccessControl";
import { useShowBackButton } from "@/hooks/useShowBackButton";
import { HTMLContent } from "@/components/HTMLContent";
import { RitualCalendarButton } from "@/components/ritual/RitualCalendarButton";
import { RitualShareDialog } from "@/components/ritual/RitualShareDialog";

import harisPhoto from "@/assets/haris-falas-coach.png";

interface DailyRitual {
  id: string;
  ritual_date: string;
  day_number: number;
  morning_content: string;
  midday_content: string;
  evening_content: string;
}

const DailySmartyRitual = () => {
  const navigate = useNavigate();
  const { userTier, isLoading: accessLoading } = useAccessControl();
  const { canGoBack, goBack } = useShowBackButton();
  
  const [ritual, setRitual] = useState<DailyRitual | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState<string | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);

  const isAuthenticated = userTier !== "guest";
  const isPremium = userTier === "premium";

  // Fetch ritual
  useEffect(() => {
    const fetchRitual = async () => {
      try {
        // Get today's date in Cyprus timezone
        const now = new Date();
        const cyprusTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Nicosia" }));
        const today = cyprusTime.toISOString().split('T')[0];
        const hour = cyprusTime.getHours();
        const minute = cyprusTime.getMinutes();

        // Check if we're in the "countdown" window (04:30 - 07:00)
        const isCountdownWindow = (hour === 4 && minute >= 30) || (hour === 5) || (hour === 6);
        
        if (isCountdownWindow) {
          // Calculate countdown to 07:00
          const targetTime = new Date(cyprusTime);
          targetTime.setHours(7, 0, 0, 0);
          const diff = targetTime.getTime() - cyprusTime.getTime();
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setCountdown(`${hours}h ${minutes}m`);
          setLoading(false);
          return;
        }

        // Fetch today's ritual
        const { data, error } = await supabase
          .from("daily_smarty_rituals")
          .select("*")
          .eq("ritual_date", today)
          .eq("is_visible", true)
          .maybeSingle();

        if (!data) {
          // If no ritual for today, show countdown
          setCountdown("Coming soon...");
          setLoading(false);
          return;
        }

        setRitual(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching ritual:", err);
        setLoading(false);
      }
    };

    if (!accessLoading) {
      fetchRitual();
    }
  }, [accessLoading]);

  if (loading || accessLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Countdown display
  if (countdown) {
    return (
      <>
        <Helmet>
          <title>Daily Smarty Ritual | SmartyGym</title>
          <meta name="description" content="Your daily movement ritual for optimal performance - Morning, Midday, and Evening phases designed by Haris Falas" />
        </Helmet>
        <div className="min-h-screen bg-background">
          <div className="container mx-auto max-w-4xl px-4 py-8">
            {canGoBack && (
              <Button variant="ghost" size="sm" onClick={goBack} className="mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
            
            <Card className="text-center py-16">
              <CardContent>
                <Clock className="h-16 w-16 text-primary mx-auto mb-6" />
                <h1 className="text-3xl font-bold mb-4">Next Ritual Arriving Soon</h1>
                <p className="text-xl text-muted-foreground mb-6">
                  Your Daily Smarty Ritual will be available at 07:00
                </p>
                <Badge variant="outline" className="text-lg px-6 py-2">
                  {countdown}
                </Badge>
                
                {/* Premium-only messaging */}
                {!isPremium && (
                  <div className="mt-8 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Crown className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Premium Feature</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      The Daily Smarty Ritual is exclusively available for Premium members
                    </p>
                    <Button onClick={() => navigate("/joinpremium")}>
                      <Crown className="mr-2 h-4 w-4" />
                      Upgrade to Premium
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Daily Smarty Ritual{ritual ? ` - Day ${ritual.day_number}` : ''} | SmartyGym</title>
        <meta name="description" content="Your daily movement ritual for optimal performance - Morning, Midday, and Evening phases designed by Haris Falas" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            {canGoBack && (
              <Button variant="ghost" size="sm" onClick={goBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
            <div className="flex items-center gap-2">
              {isPremium && ritual && (
                <Button variant="outline" size="sm" onClick={() => setShowShareDialog(true)}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              )}
            </div>
          </div>

          {/* Description Card */}
          <Card className="mb-8 bg-gradient-to-br from-primary/5 via-background to-primary/5 border-2 border-primary/40 shadow-gold">
            <div className="p-4 sm:p-5">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 text-center">About Smarty Ritual</h2>
              <div className="space-y-2 text-muted-foreground max-w-3xl mx-auto">
                <p className="text-sm sm:text-base">
                  Your all-day game plan for movement, recovery, and performance. Each day brings a fresh ritual with three expertly designed phases:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 justify-items-center mt-4">
                  <div className="flex items-center gap-2">
                    <Sunrise className="h-4 w-4 text-orange-500" />
                    <span className="text-sm"><strong>Morning:</strong> Activation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm"><strong>Midday:</strong> Reset</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4 text-purple-600" />
                    <span className="text-sm"><strong>Evening:</strong> Unwind</span>
                  </div>
                </div>
                <p className="text-sm sm:text-base font-semibold text-foreground text-center mt-4">
                  Designed by <a href="/coach-profile" className="text-primary hover:underline">Haris Falas</a> to keep you energized, mobile, and performing at your best.
                </p>
              </div>
            </div>
          </Card>

          {/* Main Card */}
          <Card className="overflow-hidden">
            {/* Header Section - Elegant Centered Layout */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-8 relative">
              <div className="flex flex-col items-center text-center">
                {/* Haris Photo - centered above title */}
                <div className="mb-3">
                  <img 
                    src={harisPhoto} 
                    alt="Haris Falas" 
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-primary/20 shadow-lg"
                  />
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Designed by <a href="/coach-profile" className="text-primary font-semibold hover:underline">Haris Falas</a>
                </p>
                <h1 className="text-2xl md:text-3xl font-bold mb-3">
                  Daily <span className="text-primary">Smarty</span> Ritual
                </h1>
                <p className="text-muted-foreground max-w-md">
                  Your all-day game plan for movement, recovery, and performance
                </p>
              </div>
            </div>

            {/* Access Gate for non-premium */}
            {!isPremium && (
              <div className="p-6 bg-muted/50">
                <div className="flex flex-col items-center justify-center gap-4 text-center">
                  <Lock className="h-12 w-12 text-muted-foreground" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Premium Exclusive Feature</h3>
                    <p className="text-muted-foreground mb-4 max-w-md">
                      The Daily Smarty Ritual is exclusively available for Premium members. Upgrade now to unlock daily movement rituals designed for optimal health and performance.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      {!isAuthenticated ? (
                        <>
                          <Button onClick={() => navigate("/auth")}>
                            Sign In
                          </Button>
                          <Button variant="outline" onClick={() => navigate("/joinpremium")}>
                            <Crown className="mr-2 h-4 w-4" />
                            View Premium Plans
                          </Button>
                        </>
                      ) : (
                        <Button onClick={() => navigate("/joinpremium")}>
                          <Crown className="mr-2 h-4 w-4" />
                          Upgrade to Premium
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Ritual Content */}
            {isPremium && ritual && (
              <CardContent className="p-6 space-y-8">
                {/* Calendar Integration - pass full content */}
                <div className="flex justify-center">
                  <RitualCalendarButton ritual={{
                    ritual_date: ritual.ritual_date,
                    day_number: ritual.day_number,
                    morning_content: ritual.morning_content,
                    midday_content: ritual.midday_content,
                    evening_content: ritual.evening_content,
                  }} />
                </div>

                <Separator />

                {/* Morning Ritual */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/20">
                      <Sunrise className="h-6 w-6 text-orange-500" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Morning Ritual</h2>
                      <p className="text-sm text-muted-foreground">~8:00 AM • Start Strong</p>
                    </div>
                  </div>
                  <div className="pl-12">
                    <HTMLContent content={ritual.morning_content} />
                  </div>
                </div>

                <Separator />

                {/* Midday Ritual */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                      <Sun className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Midday Ritual</h2>
                      <p className="text-sm text-muted-foreground">~1:00 PM • Reset & Reload</p>
                    </div>
                  </div>
                  <div className="pl-12">
                    <HTMLContent content={ritual.midday_content} />
                  </div>
                </div>

                <Separator />

                {/* Evening Ritual */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/20">
                      <Moon className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Evening Ritual</h2>
                      <p className="text-sm text-muted-foreground">~5:00 PM • Unwind</p>
                    </div>
                  </div>
                  <div className="pl-12">
                    <HTMLContent content={ritual.evening_content} />
                  </div>
                </div>

              </CardContent>
            )}
          </Card>

        </div>
      </div>

      {/* Share Dialog */}
      {ritual && (
        <RitualShareDialog 
          open={showShareDialog} 
          onOpenChange={setShowShareDialog}
          ritualDate={ritual.ritual_date}
          dayNumber={ritual.day_number}
        />
      )}
    </>
  );
};

export default DailySmartyRitual;