import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const FIRST_NAMES = [
  "Maria", "Alex", "James", "Sofia", "Chris", "Elena", "David", "Anna",
  "Michael", "Laura", "Nick", "Sarah", "Tom", "Emma", "Lucas", "Olivia",
  "Andreas", "Chloe", "Daniel", "Mia"
];

const CITIES = [
  "London", "Athens", "Berlin", "Madrid", "Milan", "Paris", "Amsterdam",
  "Lisbon", "Prague", "Vienna", "Dublin", "Copenhagen", "Stockholm"
];

const MESSAGES = [
  () => `${pick(FIRST_NAMES)} from ${pick(CITIES)} just signed up`,
  () => `New member ${pick(FIRST_NAMES)} from ${pick(CITIES)} joined SmartyGym`,
  () => `${pick(FIRST_NAMES)} just completed their first workout`,
  () => `${pick(FIRST_NAMES)} started a new training program`,
  () => `${randInt(8, 25)} people started a training program today`,
  () => `${pick(FIRST_NAMES)} from ${pick(CITIES)} just explored the workout library`,
  () => `${pick(FIRST_NAMES)} just read an article on the blog`,
  () => `${randInt(3, 12)} new members joined today`,
  () => `${pick(FIRST_NAMES)} just finished a ${randInt(4, 12)}-week training program`,
  () => `${pick(FIRST_NAMES)} from ${pick(CITIES)} is browsing workouts right now`,
];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min; }

export function SocialProofToast() {
  const location = useLocation();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionRef = useRef<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { sessionRef.current = session; });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => { sessionRef.current = s; });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Only on homepage, only for non-logged-in users
    if (location.pathname !== "/") {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      return;
    }

    const showToast = () => {
      if (sessionRef.current) return; // logged in, skip
      const message = pick(MESSAGES)();
      toast(message, {
        duration: 4000,
        position: "bottom-left",
        className: "text-sm",
      });
    };

    // First toast after 10-15 seconds
    const initialDelay = setTimeout(() => {
      showToast();
      // Then every 45-60 seconds
      intervalRef.current = setInterval(showToast, randInt(45000, 60000));
    }, randInt(10000, 15000));

    return () => {
      clearTimeout(initialDelay);
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    };
  }, [location.pathname]);

  return null; // Renders nothing, just triggers toasts
}
