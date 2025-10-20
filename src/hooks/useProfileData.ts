import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ProfileData {
  weight: string;
  height: string;
  age: string;
  gender: string;
  fitness_level: string;
  fitness_goals: string[];
  equipment_preferences: string[];
}

export const useProfileData = () => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("weight, height, age, gender, fitness_level, fitness_goals, equipment_preferences")
          .eq("user_id", user.id)
          .single();

        if (profile) {
          setProfileData({
            weight: profile.weight?.toString() || "",
            height: profile.height?.toString() || "",
            age: profile.age?.toString() || "",
            gender: profile.gender || "",
            fitness_level: profile.fitness_level || "",
            fitness_goals: profile.fitness_goals || [],
            equipment_preferences: profile.equipment_preferences || []
          });
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  return { profileData, loading };
};