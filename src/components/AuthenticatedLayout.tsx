import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { ProfileSetupDialog } from "@/components/ProfileSetupDialog";

export const AuthenticatedLayout = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [hasCheckedProfile, setHasCheckedProfile] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);
      
      // Check if profile is complete
      const { data: profile } = await supabase
        .from("profiles")
        .select("has_completed_profile")
        .eq("user_id", session.user.id)
        .single();

      if (profile && !profile.has_completed_profile) {
        setShowProfileSetup(true);
      }
      
      setHasCheckedProfile(true);
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleProfileSetupComplete = () => {
    setShowProfileSetup(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Outlet />
      {hasCheckedProfile && (
        <ProfileSetupDialog 
          open={showProfileSetup} 
          onComplete={handleProfileSetupComplete}
        />
      )}
    </div>
  );
};