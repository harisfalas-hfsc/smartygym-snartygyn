import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WODAnnouncementModal } from "./WODAnnouncementModal";
import { RitualCheckinsAnnouncementModal } from "./RitualCheckinsAnnouncementModal";
import { format } from "date-fns";

export const AnnouncementManager = () => {
  const [showWODModal, setShowWODModal] = useState(false);
  const [showRitualModal, setShowRitualModal] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState<boolean | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  const getTodayKey = (prefix: string) => {
    const today = format(new Date(), "yyyy-MM-dd");
    return `${prefix}_${today}`;
  };

  // Check if user has completed today's check-in
  const checkTodayCheckin = useCallback(async (userId: string) => {
    const today = format(new Date(), "yyyy-MM-dd");
    
    const { data, error } = await supabase
      .from("smarty_checkins")
      .select("id, morning_completed, night_completed")
      .eq("user_id", userId)
      .eq("checkin_date", today)
      .maybeSingle();

    if (error) {
      console.error("Error checking today's check-in:", error);
      return false;
    }

    // Return true if any check-in (morning OR night) is completed
    return data?.morning_completed === true || data?.night_completed === true;
  }, []);

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      // Check WOD modal already shown today
      const wodShownKey = getTodayKey("wod_announcement_shown");
      const wodAlreadyShown = localStorage.getItem(wodShownKey) === "true";

      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      const loggedIn = !!session?.user;
      setIsLoggedIn(loggedIn);

      // Check if user has done check-in today (only if logged in)
      if (loggedIn && session?.user) {
        const checkedIn = await checkTodayCheckin(session.user.id);
        setHasCheckedIn(checkedIn);
      } else {
        setHasCheckedIn(false);
      }

      // Show WOD modal if not already shown today
      if (!wodAlreadyShown) {
        // Small delay to let page render first
        setTimeout(() => setShowWODModal(true), 1000);
      }
    };

    init();
  }, [checkTodayCheckin]);

  // Handle WOD modal close - start timer for Ritual modal
  const handleWODClose = useCallback(() => {
    setShowWODModal(false);
    
    // Mark WOD modal as shown today
    const wodShownKey = getTodayKey("wod_announcement_shown");
    localStorage.setItem(wodShownKey, "true");

    // Check if Ritual modal should show
    const ritualShownKey = getTodayKey("ritual_announcement_shown");
    const ritualAlreadyShown = localStorage.getItem(ritualShownKey) === "true";

    if (ritualAlreadyShown) return;

    // Determine if we should show Ritual modal
    // Show if: NOT logged in, OR logged in but hasn't done check-in today
    const shouldShowRitual = isLoggedIn === false || (isLoggedIn === true && hasCheckedIn === false);

    if (shouldShowRitual) {
      // Start 2 minute timer (120000ms)
      setTimeout(() => {
        setShowRitualModal(true);
      }, 120000); // 2 minutes
    }
  }, [isLoggedIn, hasCheckedIn]);

  // Handle Ritual modal close
  const handleRitualClose = useCallback(() => {
    setShowRitualModal(false);
    
    // Mark Ritual modal as shown today
    const ritualShownKey = getTodayKey("ritual_announcement_shown");
    localStorage.setItem(ritualShownKey, "true");
  }, []);

  return (
    <>
      <WODAnnouncementModal 
        open={showWODModal} 
        onClose={handleWODClose} 
      />
      <RitualCheckinsAnnouncementModal 
        open={showRitualModal} 
        onClose={handleRitualClose} 
      />
    </>
  );
};
