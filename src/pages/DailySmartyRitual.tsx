import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Sun, Cloud, Moon, Calendar, Share2, Lock, Crown, Clock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAccessControl } from "@/hooks/useAccessControl";
import { useShowBackButton } from "@/hooks/useShowBackButton";
import { useToast } from "@/hooks/use-toast";
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
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { userTier, isLoading: accessLoading } = useAccessControl();
  const { canGoBack, goBack } = useShowBackButton();
  
  const [ritual, setRitual] = useState<DailyRitual | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const isAuthenticated = userTier !== "guest";
  const [countdown, setCountdown] = useState<string | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);

  const isPremium = userTier === "premium";
  const isSubscriber = userTier === "subscriber";
  const canAccess = isPremium || hasPurchased;

  // Check for purchase success
  useEffect(() => {
    if (searchParams.get('purchase') === 'success') {
      toast({
        title: "Purchase Successful!",
        description: "You now have access to today's ritual.",
      });
      setHasPurchased(true);
    }
  }, [searchParams, toast]);

  // Fetch ritual and check access
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

        // Check if user has purchased this date (for non-premium)
        if (isAuthenticated && !isPremium) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: purchase } = await supabase
              .from("ritual_purchases")
              .select("id")
              .eq("user_id", user.id)
              .eq("ritual_date", today)
              .maybeSingle();

            setHasPurchased(!!purchase);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching ritual:", err);
        setLoading(false);
      }
    };

    if (!accessLoading) {
      fetchRitual();
    }
  }, [accessLoading, isAuthenticated, isPremium]);

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    if (!ritual) return;

    setPurchasing(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-ritual-purchase-checkout', {
        body: { ritual_date: ritual.ritual_date }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      console.error("Purchase error:", err);
      toast({
        title: "Error",
        description: "Failed to start purchase. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPurchasing(false);
    }
  };

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
                  Your Daily Smarty Ritual will be available at 07:00 Cyprus time
                </p>
                <Badge variant="outline" className="text-lg px-6 py-2">
                  {countdown}
                </Badge>
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
        <title>Daily Smarty Ritual - Day {ritual?.day_number} | SmartyGym</title>
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
              {canAccess && (
                <>
                  <Button variant="outline" size="sm" onClick={() => setShowShareDialog(true)}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Main Card */}
          <Card className="overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 relative">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="bg-primary text-primary-foreground">
                      Day {ritual?.day_number}
                    </Badge>
                    {isPremium && (
                      <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                        <Crown className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">
                    Daily <span className="text-primary">Smarty</span> Ritual
                  </h1>
                  <p className="text-muted-foreground">
                    Your all-day game plan for movement, recovery, and performance
                  </p>
                </div>
                {/* Haris Photo */}
                <div className="hidden md:block">
                  <img 
                    src={harisPhoto} 
                    alt="Haris Falas" 
                    className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
                  />
                </div>
              </div>
            </div>

            {/* Access Gate for non-premium/non-purchased */}
            {!canAccess && (
              <div className="p-6 bg-muted/50">
                <div className="flex items-center justify-center gap-4 text-center">
                  <Lock className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold mb-1">Premium Content</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {isSubscriber 
                        ? "Unlock today's ritual for €1.99 or upgrade to Premium for full access"
                        : "Sign in to access the Daily Smarty Ritual"}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      {isSubscriber ? (
                        <>
                          <Button onClick={handlePurchase} disabled={purchasing}>
                            {purchasing ? (
                              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                            ) : (
                              "Unlock for €1.99"
                            )}
                          </Button>
                          <Button variant="outline" onClick={() => navigate("/joinpremium")}>
                            <Crown className="mr-2 h-4 w-4" />
                            Upgrade to Premium
                          </Button>
                        </>
                      ) : !isAuthenticated ? (
                        <>
                          <Button onClick={() => navigate("/auth")}>
                            Sign In
                          </Button>
                          <Button variant="outline" onClick={() => navigate("/joinpremium")}>
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
            {canAccess && ritual && (
              <CardContent className="p-6 space-y-8">
                {/* Calendar Integration */}
                <div className="flex justify-center">
                  <RitualCalendarButton ritual={ritual} />
                </div>

                <Separator />

                {/* Morning Ritual */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                      <Sun className="h-6 w-6 text-yellow-600" />
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
                    <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                      <Cloud className="h-6 w-6 text-blue-600" />
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

                <Separator />

                {/* Author Credit */}
                <div className="flex items-center justify-center gap-4 pt-4 text-center">
                  <img 
                    src={harisPhoto} 
                    alt="Haris Falas" 
                    className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                  />
                  <div className="text-left">
                    <p className="text-sm text-muted-foreground">Designed by</p>
                    <p className="font-semibold">Haris Falas</p>
                    <p className="text-xs text-muted-foreground">Sports Scientist • CSCS</p>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>

      {/* Share Dialog */}
      <RitualShareDialog 
        open={showShareDialog} 
        onOpenChange={setShowShareDialog}
        ritualDate={ritual?.ritual_date || ''}
        dayNumber={ritual?.day_number || 0}
      />
    </>
  );
};

export default DailySmartyRitual;
