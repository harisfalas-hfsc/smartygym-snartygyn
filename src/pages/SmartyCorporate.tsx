import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Building2, 
  Check, 
  Users, 
  Crown,
  ArrowLeft,
  CreditCard,
  Shield,
  Headphones
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { useShowBackButton } from "@/hooks/useShowBackButton";
import { SEOEnhancer } from "@/components/SEOEnhancer";

// Stripe product and price IDs for corporate plans
const CORPORATE_PLANS = {
  dynamic: {
    name: "Smarty Dynamic",
    maxUsers: 10,
    price: 399,
    priceId: "price_1Sc28CIxQYg9inGKfoqZgtXZ",
    productId: "prod_TZATAcAlqgc1P7",
  },
  power: {
    name: "Smarty Power",
    maxUsers: 20,
    price: 499,
    priceId: "price_1Sc28EIxQYg9inGKCDUA4ii8",
    productId: "prod_TZATDsKcDvMtHc",
  },
  elite: {
    name: "Smarty Elite",
    maxUsers: 30,
    price: 599,
    priceId: "price_1Sc28GIxQYg9inGKS8NkWB11",
    productId: "prod_TZATGTAsKalmCn",
  },
  enterprise: {
    name: "Smarty Enterprise",
    maxUsers: 9999,
    price: 699,
    priceId: "price_1Sc28HIxQYg9inGK3YzEE4YR",
    productId: "prod_TZATUtaS2jhgtK",
  },
};

export default function SmartyCorporate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canGoBack, goBack } = useShowBackButton();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [orgDialogOpen, setOrgDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<keyof typeof CORPORATE_PLANS | null>(null);
  const [organizationName, setOrganizationName] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGetStarted = (planKey: keyof typeof CORPORATE_PLANS) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setSelectedPlan(planKey);
    setOrgDialogOpen(true);
  };

  const handleProceedToCheckout = async () => {
    if (!selectedPlan || !organizationName.trim()) {
      toast({
        title: "Organization name required",
        description: "Please enter your organization name to continue.",
        variant: "destructive"
      });
      return;
    }

    setLoading(selectedPlan);
    setOrgDialogOpen(false);

    try {
      const { data, error } = await supabase.functions.invoke('create-corporate-checkout', {
        body: { 
          planType: selectedPlan,
          organizationName: organizationName.trim()
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        toast({
          title: "Checkout opened",
          description: "Complete your purchase in the new tab",
        });
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start checkout process. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
      setOrganizationName("");
      setSelectedPlan(null);
    }
  };

  const benefits = [
    { icon: CreditCard, text: "Centralized billing for your organization" },
    { icon: Users, text: "Admin dashboard to manage team members" },
    { icon: Crown, text: "Platinum-level access for all members" },
    { icon: Shield, text: "1-year subscription period" },
    { icon: Headphones, text: "Priority support for organizations" },
  ];

  return (
    <>
      <Helmet>
        <title>Smarty Corporate | Team & Business Plans | SmartyGym</title>
        <meta name="description" content="SmartyGym Corporate plans for teams, businesses, and organizations. Get Platinum access for 10-unlimited team members. Centralized billing, admin dashboard, priority support." />
        <meta name="keywords" content="corporate fitness, team fitness plan, business gym membership, organization fitness, group fitness subscription, corporate wellness, team training, SmartyGym corporate" />
        
        <meta property="og:title" content="Smarty Corporate | Team & Business Plans | SmartyGym" />
        <meta property="og:description" content="Corporate fitness plans for teams and businesses. Platinum access for all members with centralized billing." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://smartygym.com/corporate" />
        
        <link rel="canonical" href="https://smartygym.com/corporate" />
      </Helmet>

      <SEOEnhancer
        entities={["Corporate Fitness", "Team Membership", "Business Wellness"]}
        topics={["corporate fitness plans", "team training", "business wellness programs"]}
        expertise={["corporate wellness", "team fitness management"]}
        contentType="Corporate Plans"
        aiSummary="SmartyGym Corporate: Premium fitness access for teams and organizations. Plans from €399/year (10 users) to €699/year (unlimited). All members get Platinum access with admin dashboard for team management."
        aiKeywords={["corporate fitness", "team membership", "business wellness", "group fitness"]}
        relatedContent={["Premium Benefits", "Workout Library", "Training Programs"]}
        targetAudience="businesses and organizations seeking team fitness solutions"
        pageType="Product"
      />

      <div className="min-h-screen bg-background">
        <main className="container mx-auto max-w-7xl p-4 py-8">
          {canGoBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={goBack}
              className="mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="text-xs sm:text-sm">Back</span>
            </Button>
          )}

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Building2 className="h-8 w-8 text-primary" />
              <h1 className="text-3xl sm:text-4xl font-bold">Smarty Corporate</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Premium fitness access for teams, businesses, and organizations. One subscription, unlimited possibilities.
            </p>
          </div>

          {/* About Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                About Smarty Corporate
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                Smarty Corporate is designed for teams, businesses, and organizations that want to provide premium fitness access to their members. 
                With one master account, an administrator can create and manage multiple user accounts, each receiving full Platinum-level access 
                to all SmartyGym features including workouts, training programs, daily rituals, and fitness tools.
              </p>
              <p>
                All team members enjoy the same benefits as individual Platinum subscribers for the duration of the subscription. 
                The administrator has access to a dedicated dashboard to manage team members, monitor usage, and control access.
              </p>
            </CardContent>
          </Card>

          {/* Benefits Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Corporate Benefits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <benefit.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Info Ribbon */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-8 text-center">
            <p className="text-sm text-muted-foreground">
              <strong>All plans include 1-year subscription.</strong> Team members receive Platinum access from the date they are added by the administrator.
            </p>
          </div>

          {/* Pricing Plans */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Smarty Dynamic - 10 users */}
            <Card className="relative border-2 border-border hover:border-primary/50 transition-colors flex flex-col">
              <CardHeader className="text-center pb-2">
                <div className="flex items-center justify-center gap-2 min-h-[56px]">
                  <Users className="h-5 w-5 text-primary shrink-0" />
                  <h2 className="text-xl font-bold">Smarty Dynamic</h2>
                </div>
                <div className="min-h-[28px] flex items-center justify-center">
                  <Badge className="bg-primary/20 text-primary">
                    Up to 10 Users
                  </Badge>
                </div>
                <CardTitle className="text-3xl font-bold mt-3">€399</CardTitle>
                <p className="text-sm text-muted-foreground">per year</p>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 flex flex-col">
                <div className="space-y-2 flex-1">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">10 team member accounts</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">Platinum access for all</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">Admin dashboard</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">1-year subscription</span>
                  </div>
                </div>
                <Button 
                  className="w-full mt-auto" 
                  onClick={() => handleGetStarted('dynamic')}
                  disabled={loading === 'dynamic'}
                >
                  {loading === 'dynamic' ? "Processing..." : "Get Started"}
                </Button>
              </CardContent>
            </Card>

            {/* Smarty Power - 20 users */}
            <Card className="relative border-2 border-border hover:border-primary/50 transition-colors flex flex-col">
              <CardHeader className="text-center pb-2">
                <div className="flex items-center justify-center gap-2 min-h-[56px]">
                  <Users className="h-5 w-5 text-primary shrink-0" />
                  <h2 className="text-xl font-bold">Smarty Power</h2>
                </div>
                <div className="min-h-[28px] flex items-center justify-center">
                  <Badge className="bg-primary/20 text-primary">
                    Up to 20 Users
                  </Badge>
                </div>
                <CardTitle className="text-3xl font-bold mt-3">€499</CardTitle>
                <p className="text-sm text-muted-foreground">per year</p>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 flex flex-col">
                <div className="space-y-2 flex-1">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">20 team member accounts</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">Platinum access for all</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">Admin dashboard</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">1-year subscription</span>
                  </div>
                </div>
                <Button 
                  className="w-full mt-auto" 
                  onClick={() => handleGetStarted('power')}
                  disabled={loading === 'power'}
                >
                  {loading === 'power' ? "Processing..." : "Get Started"}
                </Button>
              </CardContent>
            </Card>

            {/* Smarty Elite - 30 users */}
            <Card className="relative border-2 border-border hover:border-primary/50 transition-colors flex flex-col">
              <CardHeader className="text-center pb-2">
                <div className="flex items-center justify-center gap-2 min-h-[56px]">
                  <Users className="h-5 w-5 text-primary shrink-0" />
                  <h2 className="text-xl font-bold">Smarty Elite</h2>
                </div>
                <div className="min-h-[28px] flex items-center justify-center">
                  <Badge className="bg-primary/20 text-primary">
                    Up to 30 Users
                  </Badge>
                </div>
                <CardTitle className="text-3xl font-bold mt-3">€599</CardTitle>
                <p className="text-sm text-muted-foreground">per year</p>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 flex flex-col">
                <div className="space-y-2 flex-1">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">30 team member accounts</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">Platinum access for all</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">Admin dashboard</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">1-year subscription</span>
                  </div>
                </div>
                <Button 
                  className="w-full mt-auto" 
                  onClick={() => handleGetStarted('elite')}
                  disabled={loading === 'elite'}
                >
                  {loading === 'elite' ? "Processing..." : "Get Started"}
                </Button>
              </CardContent>
            </Card>

            {/* Smarty Enterprise - Unlimited */}
            <Card className="relative border-2 border-primary shadow-lg flex flex-col bg-gradient-to-br from-primary/5 to-amber-500/5">
              <Badge className="absolute -top-2 right-2 bg-green-600 text-white px-2 py-1 text-xs shadow-md z-10">
                BEST VALUE
              </Badge>
              <CardHeader className="text-center pb-2 pt-4">
                <div className="flex items-center justify-center gap-2 min-h-[56px]">
                  <Building2 className="h-5 w-5 text-primary shrink-0" />
                  <h2 className="text-xl font-bold text-primary">Smarty Enterprise</h2>
                </div>
                <div className="min-h-[28px] flex items-center justify-center">
                  <Badge className="bg-primary text-primary-foreground">
                    Unlimited Users
                  </Badge>
                </div>
                <CardTitle className="text-3xl font-bold mt-3">€699</CardTitle>
                <p className="text-sm text-muted-foreground">per year</p>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 flex flex-col">
                <div className="space-y-2 flex-1">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm font-semibold">Unlimited team members</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">Platinum access for all</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">Admin dashboard</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">Priority enterprise support</span>
                  </div>
                </div>
                <Button 
                  className="w-full mt-auto" 
                  onClick={() => handleGetStarted('enterprise')}
                  disabled={loading === 'enterprise'}
                >
                  {loading === 'enterprise' ? "Processing..." : "Get Started"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Organization Name Dialog */}
          <Dialog open={orgDialogOpen} onOpenChange={setOrgDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enter Your Organization Name</DialogTitle>
                <DialogDescription>
                  This name will be displayed to your team members and used in your corporate dashboard.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  placeholder="e.g., Acme Corporation"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  className="mt-2"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOrgDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleProceedToCheckout} disabled={!organizationName.trim()}>
                  Continue to Payment
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Contact CTA */}
          <Card className="bg-muted/50">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Need a Custom Solution?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Have specific requirements or need a tailored corporate wellness program? Get in touch with us.
              </p>
              <Button variant="outline" onClick={() => navigate('/contact')}>
                Contact Us
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
}