import React, { useState, useEffect } from 'react';
import { CheckInModal } from './CheckInModal';
import { CheckInBanner } from './CheckInBanner';
import { MorningCheckInForm } from './MorningCheckInForm';
import { NightCheckInForm } from './NightCheckInForm';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useCheckins, CheckinRecord } from '@/hooks/useCheckins';
import { useCheckInWindow } from '@/hooks/useCheckInWindow';

interface CheckInModalManagerProps {
  onBannerStateChange?: (showBanner: boolean, type: 'morning' | 'night' | null) => void;
}

export function CheckInModalManager({ onBannerStateChange }: CheckInModalManagerProps) {
  const [showMorningModal, setShowMorningModal] = useState(false);
  const [showNightModal, setShowNightModal] = useState(false);
  const [showMorningBanner, setShowMorningBanner] = useState(false);
  const [showNightBanner, setShowNightBanner] = useState(false);
  const [showMorningForm, setShowMorningForm] = useState(false);
  const [showNightForm, setShowNightForm] = useState(false);
  
  const { 
    todayCheckin, 
    stats, 
    submitMorningCheckin, 
    submitNightCheckin,
    markModalShown,
    fetchTodayCheckin
  } = useCheckins();
  
  const windowStatus = useCheckInWindow();

  // Check and show modals on mount/window change
  useEffect(() => {
    const checkModals = async () => {
      const checkin = await fetchTodayCheckin();
      
      // Morning modal logic
      if (windowStatus.isMorningWindow && 
          !checkin?.morning_completed && 
          !checkin?.morning_modal_shown) {
        // Check localStorage for session-based dismissal
        const todayStr = new Date().toISOString().split('T')[0];
        const dismissedKey = `morning_modal_dismissed_${todayStr}`;
        if (!localStorage.getItem(dismissedKey)) {
          setShowMorningModal(true);
        } else {
          setShowMorningBanner(true);
        }
      } else if (windowStatus.isMorningWindow && !checkin?.morning_completed) {
        setShowMorningBanner(true);
      }

      // Night modal logic
      if (windowStatus.isNightWindow && 
          !checkin?.night_completed && 
          !checkin?.night_modal_shown) {
        const todayStr = new Date().toISOString().split('T')[0];
        const dismissedKey = `night_modal_dismissed_${todayStr}`;
        if (!localStorage.getItem(dismissedKey)) {
          setShowNightModal(true);
        } else {
          setShowNightBanner(true);
        }
      } else if (windowStatus.isNightWindow && !checkin?.night_completed) {
        setShowNightBanner(true);
      }
    };

    checkModals();
  }, [windowStatus.isMorningWindow, windowStatus.isNightWindow, fetchTodayCheckin]);

  // Notify parent about banner state
  useEffect(() => {
    if (showMorningBanner) {
      onBannerStateChange?.(true, 'morning');
    } else if (showNightBanner) {
      onBannerStateChange?.(true, 'night');
    } else {
      onBannerStateChange?.(false, null);
    }
  }, [showMorningBanner, showNightBanner, onBannerStateChange]);

  const handleMorningDoItNow = () => {
    setShowMorningModal(false);
    setShowMorningForm(true);
  };

  const handleMorningLater = async () => {
    setShowMorningModal(false);
    const todayStr = new Date().toISOString().split('T')[0];
    localStorage.setItem(`morning_modal_dismissed_${todayStr}`, 'true');
    await markModalShown('morning');
    setShowMorningBanner(true);
  };

  const handleNightDoItNow = () => {
    setShowNightModal(false);
    setShowNightForm(true);
  };

  const handleNightLater = async () => {
    setShowNightModal(false);
    const todayStr = new Date().toISOString().split('T')[0];
    localStorage.setItem(`night_modal_dismissed_${todayStr}`, 'true');
    await markModalShown('night');
    setShowNightBanner(true);
  };

  const handleMorningSubmit = async (data: any) => {
    const success = await submitMorningCheckin(data);
    if (success) {
      setShowMorningForm(false);
      setShowMorningBanner(false);
    }
    return success;
  };

  const handleNightSubmit = async (data: any) => {
    const success = await submitNightCheckin(data);
    if (success) {
      setShowNightForm(false);
      setShowNightBanner(false);
    }
    return success;
  };

  return (
    <>
      {/* Morning Modal */}
      <CheckInModal
        type="morning"
        open={showMorningModal}
        onOpenChange={setShowMorningModal}
        onDoItNow={handleMorningDoItNow}
        onLater={handleMorningLater}
        currentStreak={stats?.currentStreak}
      />

      {/* Night Modal */}
      <CheckInModal
        type="night"
        open={showNightModal}
        onOpenChange={setShowNightModal}
        onDoItNow={handleNightDoItNow}
        onLater={handleNightLater}
        currentStreak={stats?.currentStreak}
      />

      {/* Morning Form Dialog */}
      <Dialog open={showMorningForm} onOpenChange={setShowMorningForm}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <MorningCheckInForm
            onSubmit={handleMorningSubmit}
            isWindowOpen={windowStatus.isMorningWindow}
            windowEnd={windowStatus.morningWindowEnd}
            isCompleted={todayCheckin?.morning_completed}
          />
        </DialogContent>
      </Dialog>

      {/* Night Form Dialog */}
      <Dialog open={showNightForm} onOpenChange={setShowNightForm}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <NightCheckInForm
            onSubmit={handleNightSubmit}
            isWindowOpen={windowStatus.isNightWindow}
            windowEnd={windowStatus.nightWindowEnd}
            isCompleted={todayCheckin?.night_completed}
          />
        </DialogContent>
      </Dialog>

      {/* Banners are rendered by parent component using onBannerStateChange */}
    </>
  );
}

// Export a hook for use in dashboard
export function useCheckInBanner() {
  const [bannerState, setBannerState] = useState<{
    show: boolean;
    type: 'morning' | 'night' | null;
  }>({ show: false, type: null });

  const handleBannerStateChange = (show: boolean, type: 'morning' | 'night' | null) => {
    setBannerState({ show, type });
  };

  return { bannerState, handleBannerStateChange };
}