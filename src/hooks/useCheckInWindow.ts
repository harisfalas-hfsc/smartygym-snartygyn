import { useState, useEffect, useCallback } from 'react';

export interface CheckInWindowStatus {
  isMorningWindow: boolean;
  isNightWindow: boolean;
  morningWindowStart: string;
  morningWindowEnd: string;
  nightWindowStart: string;
  nightWindowEnd: string;
  currentTime: Date;
  nextWindow: 'morning' | 'night' | null;
  timeUntilNextWindow: string;
}

export function useCheckInWindow(timezone: string = 'Europe/Athens') {
  const [windowStatus, setWindowStatus] = useState<CheckInWindowStatus>({
    isMorningWindow: false,
    isNightWindow: false,
    morningWindowStart: '07:00',
    morningWindowEnd: '09:00',
    nightWindowStart: '19:00',
    nightWindowEnd: '21:00',
    currentTime: new Date(),
    nextWindow: null,
    timeUntilNextWindow: ''
  });

  const getTimeInTimezone = useCallback((tz: string): Date => {
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      
      const parts = formatter.formatToParts(now);
      const getPart = (type: string) => parts.find(p => p.type === type)?.value || '00';
      
      return new Date(
        parseInt(getPart('year')),
        parseInt(getPart('month')) - 1,
        parseInt(getPart('day')),
        parseInt(getPart('hour')),
        parseInt(getPart('minute')),
        parseInt(getPart('second'))
      );
    } catch (error) {
      console.error('Error getting time in timezone:', error);
      return new Date();
    }
  }, []);

  const isInTimeWindow = useCallback((
    currentHour: number,
    currentMinute: number,
    startHour: number,
    startMinute: number,
    endHour: number,
    endMinute: number
  ): boolean => {
    const currentMinutes = currentHour * 60 + currentMinute;
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }, []);

  const calculateNextWindow = useCallback((
    currentHour: number,
    currentMinute: number
  ): { window: 'morning' | 'night' | null; timeUntil: string } => {
    const currentMinutes = currentHour * 60 + currentMinute;
    const morningStart = 7 * 60; // 07:00
    const morningEnd = 9 * 60; // 09:00
    const nightStart = 19 * 60; // 19:00
    const nightEnd = 21 * 60; // 21:00

    let minutesUntil = 0;
    let nextWindow: 'morning' | 'night' | null = null;

    if (currentMinutes < morningStart) {
      // Before morning window
      minutesUntil = morningStart - currentMinutes;
      nextWindow = 'morning';
    } else if (currentMinutes >= morningEnd && currentMinutes < nightStart) {
      // After morning, before night
      minutesUntil = nightStart - currentMinutes;
      nextWindow = 'night';
    } else if (currentMinutes >= nightEnd) {
      // After night, next morning is tomorrow
      minutesUntil = (24 * 60 - currentMinutes) + morningStart;
      nextWindow = 'morning';
    } else {
      // Currently in a window
      return { window: null, timeUntil: '' };
    }

    const hours = Math.floor(minutesUntil / 60);
    const mins = minutesUntil % 60;
    const timeUntil = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

    return { window: nextWindow, timeUntil };
  }, []);

  const updateWindowStatus = useCallback(() => {
    const localTime = getTimeInTimezone(timezone);
    const hour = localTime.getHours();
    const minute = localTime.getMinutes();

    const isMorningWindow = isInTimeWindow(hour, minute, 7, 0, 9, 0);
    const isNightWindow = isInTimeWindow(hour, minute, 19, 0, 21, 0);
    const { window: nextWindow, timeUntil } = calculateNextWindow(hour, minute);

    setWindowStatus({
      isMorningWindow,
      isNightWindow,
      morningWindowStart: '07:00',
      morningWindowEnd: '09:00',
      nightWindowStart: '19:00',
      nightWindowEnd: '21:00',
      currentTime: localTime,
      nextWindow,
      timeUntilNextWindow: timeUntil
    });
  }, [timezone, getTimeInTimezone, isInTimeWindow, calculateNextWindow]);

  useEffect(() => {
    updateWindowStatus();
    const interval = setInterval(updateWindowStatus, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [updateWindowStatus]);

  return windowStatus;
}