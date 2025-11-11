import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import smartyGymLogo from "@/assets/smarty-gym-logo.png";
import { AvatarSetupDialog } from "@/components/AvatarSetupDialog";
import { useTranslation } from "react-i18next";

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [showAvatarSetup, setShowAvatarSetup] = useState(false);
  const [newUserId, setNewUserId] = useState<string | null>(null);
  
  // Get the mode from URL params, default to login
  const defaultTab = searchParams.get("mode") === "signup" ? "signup" : "login";

  // Check if user is already authenticated and set up listener
  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/userdashboard");
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        // User signed out, stay on auth page
        console.log("User signed out");
      } else if (session) {
        // User signed in
        navigate("/userdashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Sign Up State
  const [signUpData, setSignUpData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  // Login State
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signUpData.password !== signUpData.confirmPassword) {
      toast({
        title: t('common.error'),
        description: t('auth.errors.passwordMismatch'),
        variant: "destructive",
      });
      return;
    }

    if (signUpData.password.length < 8) {
      toast({
        title: t('common.error'),
        description: t('auth.errors.passwordTooShort'),
        variant: "destructive",
      });
      return;
    }

    if (!signUpData.acceptTerms) {
      toast({
        title: t('common.error'),
        description: t('auth.errors.acceptTermsRequired'),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: signUpData.fullName,
          },
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast({
            title: t('common.error'),
            description: t('auth.errors.alreadyRegistered'),
            variant: "destructive",
          });
        } else {
          toast({
            title: t('common.error'),
            description: error.message,
            variant: "destructive",
          });
        }
      } else if (data.user) {
        setNewUserId(data.user.id);
        
        // Send welcome message
        try {
          await supabase.functions.invoke('send-system-message', {
            body: {
              userId: data.user.id,
              messageType: 'welcome'
            }
          });
        } catch (msgError) {
          console.error('Failed to send welcome message:', msgError);
        }
        
        toast({
          title: t('common.success'),
          description: t('auth.success.accountCreated'),
        });
        setShowAvatarSetup(true);
      }
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast({
            title: t('common.error'),
            description: t('auth.errors.invalidCredentials'),
            variant: "destructive",
          });
        } else {
          toast({
            title: t('common.error'),
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: t('common.success'),
          description: t('auth.success.loggedIn'),
        });
        setTimeout(() => navigate("/userdashboard"), 1500);
      }
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {showAvatarSetup && newUserId && (
        <AvatarSetupDialog
          open={showAvatarSetup}
          onOpenChange={(open) => {
            setShowAvatarSetup(open);
            if (!open) {
              setTimeout(() => navigate("/userdashboard"), 500);
            }
          }}
          userId={newUserId}
          userName={signUpData.fullName}
        />
      )}

      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('auth.back')}
        </Button>
        
        <Card className="w-full">
          <CardHeader className="space-y-1 flex flex-col items-center">
            <img src={smartyGymLogo} alt="Smarty Gym" className="h-20 w-auto mb-2" />
            <CardTitle className="text-2xl font-bold text-center">{t('auth.welcome')}</CardTitle>
            <CardDescription className="text-center">
              {t('auth.welcomeDescription')}
            </CardDescription>
          </CardHeader>
        <CardContent>
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{t('auth.login')}</TabsTrigger>
              <TabsTrigger value="signup">{t('auth.signup')}</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">{t('auth.email')}</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder={t('auth.emailPlaceholder')}
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">{t('auth.password')}</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder={t('auth.passwordPlaceholder')}
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t('auth.signingIn') : t('auth.signIn')}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">{t('auth.fullName')}</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder={t('auth.namePlaceholder')}
                    value={signUpData.fullName}
                    onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">{t('auth.email')}</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder={t('auth.emailPlaceholder')}
                    value={signUpData.email}
                    onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">{t('auth.password')}</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder={t('auth.passwordPlaceholder')}
                    value={signUpData.password}
                    onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password">{t('auth.confirmPassword')}</Label>
                  <Input
                    id="signup-confirm-password"
                    type="password"
                    placeholder={t('auth.passwordPlaceholder')}
                    value={signUpData.confirmPassword}
                    onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={signUpData.acceptTerms}
                    onCheckedChange={(checked) => setSignUpData({ ...signUpData, acceptTerms: checked as boolean })}
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {t('auth.acceptTerms')}
                  </label>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t('auth.creatingAccount') : t('auth.createAccount')}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
