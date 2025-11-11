import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Purchase {
  id: string;
  content_id: string;
  content_type: string;
  content_name: string;
  price: number;
  purchased_at: string;
}

export const usePurchases = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["purchases", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("user_purchases")
        .select("*")
        .eq("user_id", userId)
        .order("purchased_at", { ascending: false });

      if (error) {
        console.error("Error fetching purchases:", error);
        return [];
      }

      return data as Purchase[];
    },
    enabled: !!userId,
  });
};
