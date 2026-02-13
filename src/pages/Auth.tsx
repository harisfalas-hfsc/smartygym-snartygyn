import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Loader2, WifiOff, Mail, ArrowLeft } from "lucide-react";
import smartyGymLogo from "@/assets/smarty-gym-logo.png";
import { AvatarSetupDialog } from "@/components/AvatarSetupDialog";
import { ForgotPasswordDialog } from "@/components/auth/ForgotPasswordDialog";
import { trackSocialMediaEvent } from "@/utils/socialMediaTracking";

import { checkPasswordBreach } from "@/utils/passwordBreachCheck";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { OfflineBanner } from "@/components/OfflineBanner";

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showAvatarSetup, setShowAvatarSetup] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [newUserId, setNewUserId] = useState<string | null>(null);
  const { isOffline } = useNetworkStatus();
  
  // Get the mode from URL params, default to login
  const defaultTab = searchParams.get("mode") === "signup" ? "signup" : "login";

  // Check if user is already authenticated and set up listener
  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        if (import.meta.env.DEV) {
          console.log("User signed out");
        }
      } else if (session) {
        // Check if this is a first-time verified user (no welcome message yet)
        const { data: existingWelcome } = await supabase
          .from('user_system_messages')
          .select('id')
          .eq('user_id', session.user.id)
          .eq('message_type', 'welcome')
          .limit(1);

        if (!existingWelcome || existingWelcome.length === 0) {
          // First-time verified user — fire post-signup actions
          console.log("First-time verified user detected, triggering post-signup actions");
          
          setNewUserId(session.user.id);

          // Send welcome message
          try {
            await supabase.functions.invoke('send-system-message', {
              body: { userId: session.user.id, messageType: 'welcome' }
            });
          } catch (msgError) {
            console.error('Failed to send welcome message:', msgError);
          }

          // Generate welcome workout
          try {
            const { error: wwError } = await supabase.functions.invoke('generate-welcome-workout', {
              body: { user_id: session.user.id }
            });
            if (wwError) console.error('Welcome workout generation failed:', wwError);
          } catch (wwErr) {
            console.error('Failed to trigger welcome workout:', wwErr);
          }

          // Track signup event
          trackSocialMediaEvent({ eventType: 'signup', userId: session.user.id });

          setShowAvatarSetup(true);
          return; // Don't navigate yet — avatar setup dialog will handle it
        }

        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const [showVerificationMessage, setShowVerificationMessage] = useState(false);

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
  const [rememberMe, setRememberMe] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    if (isOffline) {
      toast({
        title: "No Internet Connection",
        description: "Please connect to the internet to sign in with Google.",
        variant: "destructive",
      });
      return;
    }
    
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        setGoogleLoading(false);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive",
      });
      setGoogleLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isOffline) {
      toast({
        title: "No Internet Connection",
        description: "Please connect to the internet to create an account.",
        variant: "destructive",
      });
      return;
    }
    
    if (signUpData.password !== signUpData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (signUpData.password.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }

    if (!signUpData.acceptTerms) {
      toast({
        title: "Error",
        description: "Please accept the terms and conditions",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // Check if password has been found in data breaches
    const breachResult = await checkPasswordBreach(signUpData.password);
    
    if (breachResult.isBreached) {
      setLoading(false);
      toast({
        title: "Compromised Password Detected",
        description: (
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p>This password has been found in {breachResult.count.toLocaleString()} data breaches.</p>
              <p className="mt-1 text-sm">Please choose a different, unique password for your security.</p>
            </div>
          </div>
        ),
        variant: "destructive",
        duration: 8000,
      });
      return;
    }

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
            title: "Error",
            description: "This email is already registered. Please login instead.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
      } else if (data.user) {
        setShowVerificationMessage(true);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isOffline) {
      toast({
        title: "No Internet Connection",
        description: "Please connect to the internet to sign in.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "Error",
            description: "Invalid email or password",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        // Note: Remember Me feature requires custom_session_duration column
        // To be added via database migration
        // For now, session management is handled by Supabase auth defaults
        if (rememberMe && data.session && import.meta.env.DEV) {
          console.log('Remember Me selected - custom session handling pending migration');
        }


        toast({
          title: "Success!",
          description: rememberMe ? "Logged in successfully. You'll stay logged in for 30 days." : "Logged in successfully. Redirecting...",
        });
        setTimeout(() => navigate("/"), 1500);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <OfflineBanner />

      {showVerificationMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md text-center">
            <CardHeader className="space-y-4 flex flex-col items-center pb-2">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold">Check Your Email! 📧</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                We've sent a <span className="font-semibold text-foreground">verification link</span> to{" "}
                <span className="font-semibold text-primary break-all">{signUpData.email}</span>.
              </p>
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 sm:p-4">
                <p className="text-sm sm:text-base font-medium text-foreground">
                  You must verify your email before you can sign in.
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Check your inbox (and spam folder) for the verification email and click the link inside.
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => setShowVerificationMessage(false)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {showAvatarSetup && newUserId && (
        <AvatarSetupDialog
          open={showAvatarSetup}
          onOpenChange={(open) => {
            setShowAvatarSetup(open);
            if (!open) {
              setTimeout(() => navigate("/take-a-tour"), 500);
            }
          }}
          userId={newUserId}
          userName={signUpData.fullName}
        />
      )}

      <div className="w-full max-w-md">
        <Card className="w-full">
          <CardHeader className="space-y-1 flex flex-col items-center">
            <img src={smartyGymLogo} alt="SmartyGym" className="h-20 w-auto mb-2" />
            <CardTitle className="text-2xl font-bold text-center">Welcome to SmartyGym</CardTitle>
            <CardDescription className="text-center">
              Create an account or sign in to continue
            </CardDescription>
          </CardHeader>
        <CardContent>
          {/* Google Sign In Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full mb-4 flex items-center justify-center gap-2"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            {googleLoading ? "Signing in..." : "Continue with Google"}
          </Button>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                  />
                </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <PasswordInput
                  id="login-password"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                />
              </div>
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="remember-me" className="text-sm cursor-pointer">
                    Keep me logged in for 30 days
                  </Label>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={signUpData.fullName}
                    onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={signUpData.email}
                    onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                    required
                  />
                </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <PasswordInput
                  id="signup-password"
                  placeholder="••••••••"
                  value={signUpData.password}
                  onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                <PasswordInput
                  id="signup-confirm-password"
                  placeholder="••••••••"
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
                    I accept the terms and conditions
                  </label>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <ForgotPasswordDialog
        open={showForgotPassword}
        onOpenChange={setShowForgotPassword}
      />
      </div>
    </div>
  );
}
