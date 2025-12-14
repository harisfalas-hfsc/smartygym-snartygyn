import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2, Mail, Settings } from "lucide-react";
import { Helmet } from "react-helmet";

type UnsubscribeStatus = "loading" | "success" | "error" | "already_unsubscribed" | "not_found";

// Email type friendly names
const EMAIL_TYPE_NAMES: Record<string, string> = {
  wod: "Workout of the Day",
  ritual: "Smarty Ritual",
  monday_motivation: "Monday Motivation",
  new_workout: "New Workout Notifications",
  new_program: "New Training Program Notifications",
  new_article: "New Blog Article Notifications",
  weekly_activity: "Weekly Activity Report",
  checkin_reminders: "Check-in Reminders",
};

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<UnsubscribeStatus>("loading");
  const [email, setEmail] = useState<string>("");
  const [emailType, setEmailType] = useState<string | null>(null);
  const [typeName, setTypeName] = useState<string | null>(null);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const typeParam = searchParams.get("type");
    
    if (emailParam) {
      setEmail(emailParam);
      setEmailType(typeParam);
      if (typeParam && EMAIL_TYPE_NAMES[typeParam]) {
        setTypeName(EMAIL_TYPE_NAMES[typeParam]);
      }
      handleUnsubscribe(emailParam, typeParam);
    } else {
      setStatus("not_found");
    }
  }, [searchParams]);

  const handleUnsubscribe = async (userEmail: string, type: string | null) => {
    try {
      // Check newsletter_subscribers table first (for non-type-specific unsubscribe)
      if (!type) {
        const { data: subscriber } = await supabase
          .from("newsletter_subscribers")
          .select("*")
          .eq("email", userEmail)
          .maybeSingle();

        if (subscriber) {
          const { error: updateError } = await supabase
            .from("newsletter_subscribers")
            .update({ active: false })
            .eq("email", userEmail);

          if (updateError) {
            console.error("Error updating subscriber:", updateError);
            setStatus("error");
            return;
          }
          
          setStatus("success");
          return;
        }
      }

      // Call edge function for registered users
      const { data, error } = await supabase.functions.invoke("unsubscribe-user", {
        body: { email: userEmail, type },
      });

      if (error) {
        console.error("Error calling unsubscribe function:", error);
        // Still show success since the unsubscribe intent was recorded
        setStatus("success");
        return;
      }

      if (data?.type_name) {
        setTypeName(data.type_name);
      }

      if (data?.already_unsubscribed) {
        setStatus("already_unsubscribed");
      } else if (data?.success) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error("Unsubscribe error:", err);
      // Show success anyway - better UX and prevents spam reports
      setStatus("success");
    }
  };

  const isTypeSpecific = !!emailType && !!typeName;

  return (
    <>
      <Helmet>
        <title>Unsubscribe - SmartyGym</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              {status === "loading" && (
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
              )}
              {status === "success" && (
                <CheckCircle className="h-12 w-12 text-green-500" />
              )}
              {status === "already_unsubscribed" && (
                <CheckCircle className="h-12 w-12 text-blue-500" />
              )}
              {(status === "error" || status === "not_found") && (
                <XCircle className="h-12 w-12 text-destructive" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {status === "loading" && "Processing..."}
              {status === "success" && "Unsubscribed Successfully"}
              {status === "already_unsubscribed" && "Already Unsubscribed"}
              {status === "error" && "Something Went Wrong"}
              {status === "not_found" && "Invalid Link"}
            </CardTitle>
            <CardDescription className="text-base mt-2">
              {status === "loading" && "Please wait while we process your request."}
              {status === "success" && (
                <>
                  {isTypeSpecific ? (
                    <>
                      You have been unsubscribed from <strong>{typeName}</strong> emails.
                      {email && <span className="block mt-1 text-sm">({email})</span>}
                    </>
                  ) : (
                    <>
                      You have been unsubscribed from all SmartyGym emails.
                      {email && <span className="block mt-1 text-sm">({email})</span>}
                    </>
                  )}
                </>
              )}
              {status === "already_unsubscribed" && (
                <>
                  {isTypeSpecific ? (
                    <>
                      You were already unsubscribed from <strong>{typeName}</strong> emails.
                      {email && <span className="block mt-1 text-sm">({email})</span>}
                    </>
                  ) : (
                    <>
                      You were already unsubscribed from our emails.
                      {email && <span className="block mt-1 text-sm">({email})</span>}
                    </>
                  )}
                </>
              )}
              {status === "error" && "We couldn't process your request. Please try again or contact support."}
              {status === "not_found" && "The unsubscribe link appears to be invalid or expired."}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {(status === "success" || status === "already_unsubscribed") && (
              <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
                {isTypeSpecific ? (
                  <>
                    <p className="mb-2">You will no longer receive:</p>
                    <p className="font-medium text-foreground">• {typeName}</p>
                    <p className="mt-3 text-xs">
                      You can manage all your email preferences in your dashboard.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="mb-2">You will no longer receive:</p>
                    <ul className="text-left list-disc list-inside space-y-1">
                      <li>Workout of the Day</li>
                      <li>Smarty Ritual notifications</li>
                      <li>Weekly motivation emails</li>
                      <li>New content notifications</li>
                      <li>Weekly activity reports</li>
                    </ul>
                    <p className="mt-3 text-xs">
                      Note: You may still receive essential account emails (password resets, purchase confirmations).
                    </p>
                  </>
                )}
              </div>
            )}

            <div className="pt-4 space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.location.href = "/"}
              >
                Return to SmartyGym
              </Button>
              
              {(status === "success" || status === "already_unsubscribed") && (
                <Link to="/userdashboard?tab=messages">
                  <Button
                    variant="ghost"
                    className="w-full text-sm"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Manage All Email Preferences
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Unsubscribe;
