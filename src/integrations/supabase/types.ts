export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bmr_history: {
        Row: {
          age: number
          bmr_result: number
          created_at: string
          gender: string
          height: number
          id: string
          user_id: string
          weight: number
        }
        Insert: {
          age: number
          bmr_result: number
          created_at?: string
          gender: string
          height: number
          id?: string
          user_id: string
          weight: number
        }
        Update: {
          age?: number
          bmr_result?: number
          created_at?: string
          gender?: string
          height?: number
          id?: string
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
      calorie_history: {
        Row: {
          activity_level: string
          age: number
          created_at: string
          gender: string
          goal: string
          height: number
          id: string
          maintenance_calories: number
          target_calories: number
          user_id: string
          weight: number
        }
        Insert: {
          activity_level: string
          age: number
          created_at?: string
          gender: string
          goal: string
          height: number
          id?: string
          maintenance_calories: number
          target_calories: number
          user_id: string
          weight: number
        }
        Update: {
          activity_level?: string
          age?: number
          created_at?: string
          gender?: string
          goal?: string
          height?: number
          id?: string
          maintenance_calories?: number
          target_calories?: number
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
      community_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          updated_at: string
          user_id: string
          user_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          updated_at?: string
          user_id: string
          user_name: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          updated_at?: string
          user_id?: string
          user_name?: string
        }
        Relationships: []
      }
      exercises: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          video_id: string
          video_url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          video_id: string
          video_url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          video_id?: string
          video_url?: string
        }
        Relationships: []
      }
      onerm_history: {
        Row: {
          created_at: string
          exercise_name: string | null
          id: string
          one_rm_result: number
          reps: number
          user_id: string
          weight_lifted: number
        }
        Insert: {
          created_at?: string
          exercise_name?: string | null
          id?: string
          one_rm_result: number
          reps: number
          user_id: string
          weight_lifted: number
        }
        Update: {
          created_at?: string
          exercise_name?: string | null
          id?: string
          one_rm_result?: number
          reps?: number
          user_id?: string
          weight_lifted?: number
        }
        Relationships: []
      }
      plan_generation_usage: {
        Row: {
          generated_at: string
          id: string
          month_year: string
          plan_type: string
          user_id: string
        }
        Insert: {
          generated_at?: string
          id?: string
          month_year: string
          plan_type: string
          user_id: string
        }
        Update: {
          generated_at?: string
          id?: string
          month_year?: string
          plan_type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      progress_logs: {
        Row: {
          created_at: string
          id: string
          log_date: string
          notes: string | null
          photos_url: string | null
          plan_id: string
          plan_type: string
          user_id: string
          weight: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          log_date?: string
          notes?: string | null
          photos_url?: string | null
          plan_id: string
          plan_type: string
          user_id: string
          weight?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          log_date?: string
          notes?: string | null
          photos_url?: string | null
          plan_id?: string
          plan_type?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      saved_diet_plans: {
        Row: {
          comment: string | null
          content: string
          created_at: string
          id: string
          is_favorite: boolean | null
          name: string
          rating: number | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          content: string
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          name: string
          rating?: number | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          content?: string
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          name?: string
          rating?: number | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_training_programs: {
        Row: {
          comment: string | null
          content: string
          created_at: string
          duration: string
          id: string
          is_favorite: boolean | null
          name: string
          rating: number | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          content: string
          created_at?: string
          duration: string
          id?: string
          is_favorite?: boolean | null
          name: string
          rating?: number | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          content?: string
          created_at?: string
          duration?: string
          id?: string
          is_favorite?: boolean | null
          name?: string
          rating?: number | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_workouts: {
        Row: {
          comment: string | null
          content: string
          created_at: string
          id: string
          is_favorite: boolean | null
          name: string
          rating: number | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          content: string
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          name: string
          rating?: number | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          content?: string
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          name?: string
          rating?: number | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      strava_activities: {
        Row: {
          average_speed: number | null
          calories: number | null
          created_at: string
          distance: number | null
          elapsed_time: number | null
          id: string
          max_speed: number | null
          moving_time: number | null
          name: string
          start_date: string
          strava_activity_id: number
          total_elevation_gain: number | null
          type: string
          user_id: string
        }
        Insert: {
          average_speed?: number | null
          calories?: number | null
          created_at?: string
          distance?: number | null
          elapsed_time?: number | null
          id?: string
          max_speed?: number | null
          moving_time?: number | null
          name: string
          start_date: string
          strava_activity_id: number
          total_elevation_gain?: number | null
          type: string
          user_id: string
        }
        Update: {
          average_speed?: number | null
          calories?: number | null
          created_at?: string
          distance?: number | null
          elapsed_time?: number | null
          id?: string
          max_speed?: number | null
          moving_time?: number | null
          name?: string
          start_date?: string
          strava_activity_id?: number
          total_elevation_gain?: number | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      strava_connections: {
        Row: {
          access_token: string
          athlete_id: number
          created_at: string
          expires_at: number
          id: string
          refresh_token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          athlete_id: number
          created_at?: string
          expires_at: number
          id?: string
          refresh_token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          athlete_id?: number
          created_at?: string
          expires_at?: number
          id?: string
          refresh_token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_type: Database["public"]["Enums"]["plan_type"]
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type?: Database["public"]["Enums"]["plan_type"]
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type?: Database["public"]["Enums"]["plan_type"]
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      plan_type: "free" | "gold" | "platinum"
      subscription_status: "active" | "canceled" | "past_due"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      plan_type: ["free", "gold", "platinum"],
      subscription_status: ["active", "canceled", "past_due"],
    },
  },
} as const
