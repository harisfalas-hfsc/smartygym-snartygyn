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
      admin_training_programs: {
        Row: {
          category: string
          created_at: string | null
          days_per_week: number | null
          description: string | null
          difficulty: string | null
          difficulty_stars: number | null
          duration: string | null
          equipment: string | null
          expected_results: string | null
          id: string
          image_url: string | null
          is_ai_generated: boolean | null
          is_free: boolean | null
          is_premium: boolean | null
          is_standalone_purchase: boolean | null
          is_visible: boolean | null
          name: string
          nutrition_tips: string | null
          overview: string | null
          price: number | null
          program_structure: string | null
          progression_plan: string | null
          serial_number: number | null
          stripe_price_id: string | null
          stripe_product_id: string | null
          target_audience: string | null
          tier_required: string | null
          updated_at: string | null
          weekly_schedule: string | null
          weeks: number | null
        }
        Insert: {
          category: string
          created_at?: string | null
          days_per_week?: number | null
          description?: string | null
          difficulty?: string | null
          difficulty_stars?: number | null
          duration?: string | null
          equipment?: string | null
          expected_results?: string | null
          id: string
          image_url?: string | null
          is_ai_generated?: boolean | null
          is_free?: boolean | null
          is_premium?: boolean | null
          is_standalone_purchase?: boolean | null
          is_visible?: boolean | null
          name: string
          nutrition_tips?: string | null
          overview?: string | null
          price?: number | null
          program_structure?: string | null
          progression_plan?: string | null
          serial_number?: number | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          target_audience?: string | null
          tier_required?: string | null
          updated_at?: string | null
          weekly_schedule?: string | null
          weeks?: number | null
        }
        Update: {
          category?: string
          created_at?: string | null
          days_per_week?: number | null
          description?: string | null
          difficulty?: string | null
          difficulty_stars?: number | null
          duration?: string | null
          equipment?: string | null
          expected_results?: string | null
          id?: string
          image_url?: string | null
          is_ai_generated?: boolean | null
          is_free?: boolean | null
          is_premium?: boolean | null
          is_standalone_purchase?: boolean | null
          is_visible?: boolean | null
          name?: string
          nutrition_tips?: string | null
          overview?: string | null
          price?: number | null
          program_structure?: string | null
          progression_plan?: string | null
          serial_number?: number | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          target_audience?: string | null
          tier_required?: string | null
          updated_at?: string | null
          weekly_schedule?: string | null
          weeks?: number | null
        }
        Relationships: []
      }
      admin_workouts: {
        Row: {
          activation: string | null
          category: string | null
          cool_down: string | null
          created_at: string | null
          description: string | null
          difficulty: string | null
          difficulty_stars: number | null
          duration: string | null
          equipment: string | null
          finisher: string | null
          focus: string | null
          format: string | null
          generated_for_date: string | null
          id: string
          image_url: string | null
          instructions: string | null
          is_ai_generated: boolean | null
          is_free: boolean | null
          is_premium: boolean | null
          is_standalone_purchase: boolean | null
          is_visible: boolean | null
          is_workout_of_day: boolean | null
          main_workout: string | null
          name: string
          notes: string | null
          price: number | null
          serial_number: number | null
          stripe_price_id: string | null
          stripe_product_id: string | null
          tier_required: string | null
          tips: string | null
          type: string
          updated_at: string | null
          warm_up: string | null
        }
        Insert: {
          activation?: string | null
          category?: string | null
          cool_down?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          difficulty_stars?: number | null
          duration?: string | null
          equipment?: string | null
          finisher?: string | null
          focus?: string | null
          format?: string | null
          generated_for_date?: string | null
          id: string
          image_url?: string | null
          instructions?: string | null
          is_ai_generated?: boolean | null
          is_free?: boolean | null
          is_premium?: boolean | null
          is_standalone_purchase?: boolean | null
          is_visible?: boolean | null
          is_workout_of_day?: boolean | null
          main_workout?: string | null
          name: string
          notes?: string | null
          price?: number | null
          serial_number?: number | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          tier_required?: string | null
          tips?: string | null
          type: string
          updated_at?: string | null
          warm_up?: string | null
        }
        Update: {
          activation?: string | null
          category?: string | null
          cool_down?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          difficulty_stars?: number | null
          duration?: string | null
          equipment?: string | null
          finisher?: string | null
          focus?: string | null
          format?: string | null
          generated_for_date?: string | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          is_ai_generated?: boolean | null
          is_free?: boolean | null
          is_premium?: boolean | null
          is_standalone_purchase?: boolean | null
          is_visible?: boolean | null
          is_workout_of_day?: boolean | null
          main_workout?: string | null
          name?: string
          notes?: string | null
          price?: number | null
          serial_number?: number | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          tier_required?: string | null
          tips?: string | null
          type?: string
          updated_at?: string | null
          warm_up?: string | null
        }
        Relationships: []
      }
      app_store_assets: {
        Row: {
          asset_type: string
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          height: number | null
          id: string
          platform: string
          storage_url: string | null
          updated_at: string
          width: number | null
        }
        Insert: {
          asset_type: string
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          height?: number | null
          id?: string
          platform: string
          storage_url?: string | null
          updated_at?: string
          width?: number | null
        }
        Update: {
          asset_type?: string
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          height?: number | null
          id?: string
          platform?: string
          storage_url?: string | null
          updated_at?: string
          width?: number | null
        }
        Relationships: []
      }
      app_store_settings: {
        Row: {
          app_name: string
          category: string
          content_rating: string
          created_at: string
          full_description: string
          id: string
          keywords: string
          marketing_url: string
          privacy_policy_url: string
          promotional_text: string
          short_description: string
          subtitle: string
          support_email: string
          support_url: string
          terms_of_service_url: string
          updated_at: string
          whats_new: string
        }
        Insert: {
          app_name?: string
          category?: string
          content_rating?: string
          created_at?: string
          full_description?: string
          id?: string
          keywords?: string
          marketing_url?: string
          privacy_policy_url?: string
          promotional_text?: string
          short_description?: string
          subtitle?: string
          support_email?: string
          support_url?: string
          terms_of_service_url?: string
          updated_at?: string
          whats_new?: string
        }
        Update: {
          app_name?: string
          category?: string
          content_rating?: string
          created_at?: string
          full_description?: string
          id?: string
          keywords?: string
          marketing_url?: string
          privacy_policy_url?: string
          promotional_text?: string
          short_description?: string
          subtitle?: string
          support_email?: string
          support_url?: string
          terms_of_service_url?: string
          updated_at?: string
          whats_new?: string
        }
        Relationships: []
      }
      app_vault_data: {
        Row: {
          created_at: string | null
          display_order: number | null
          field_key: string
          field_type: string | null
          field_value: string | null
          id: string
          notes: string | null
          section: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          field_key: string
          field_type?: string | null
          field_value?: string | null
          id?: string
          notes?: string | null
          section: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          field_key?: string
          field_type?: string | null
          field_value?: string | null
          id?: string
          notes?: string | null
          section?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      automated_message_templates: {
        Row: {
          automation_key: string | null
          content: string
          created_at: string | null
          dashboard_content: string | null
          dashboard_subject: string | null
          email_content: string | null
          email_subject: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          last_sent_at: string | null
          message_type: Database["public"]["Enums"]["message_type"]
          next_scheduled_time: string | null
          recurrence_interval: string | null
          recurrence_pattern: string | null
          scheduled_time: string | null
          status: string | null
          subject: string
          target_audience: string | null
          template_name: string
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          automation_key?: string | null
          content: string
          created_at?: string | null
          dashboard_content?: string | null
          dashboard_subject?: string | null
          email_content?: string | null
          email_subject?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          last_sent_at?: string | null
          message_type: Database["public"]["Enums"]["message_type"]
          next_scheduled_time?: string | null
          recurrence_interval?: string | null
          recurrence_pattern?: string | null
          scheduled_time?: string | null
          status?: string | null
          subject: string
          target_audience?: string | null
          template_name: string
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          automation_key?: string | null
          content?: string
          created_at?: string | null
          dashboard_content?: string | null
          dashboard_subject?: string | null
          email_content?: string | null
          email_subject?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          last_sent_at?: string | null
          message_type?: Database["public"]["Enums"]["message_type"]
          next_scheduled_time?: string | null
          recurrence_interval?: string | null
          recurrence_pattern?: string | null
          scheduled_time?: string | null
          status?: string | null
          subject?: string
          target_audience?: string | null
          template_name?: string
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      automation_rules: {
        Row: {
          automation_key: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          last_triggered_at: string | null
          message_type: string
          name: string
          next_trigger_at: string | null
          rule_type: string
          sends_dashboard_message: boolean | null
          sends_email: boolean | null
          target_audience: string | null
          total_executions: number | null
          trigger_config: Json | null
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          automation_key: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          message_type: string
          name: string
          next_trigger_at?: string | null
          rule_type: string
          sends_dashboard_message?: boolean | null
          sends_email?: boolean | null
          target_audience?: string | null
          total_executions?: number | null
          trigger_config?: Json | null
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          automation_key?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          message_type?: string
          name?: string
          next_trigger_at?: string | null
          rule_type?: string
          sends_dashboard_message?: boolean | null
          sends_email?: boolean | null
          target_audience?: string | null
          total_executions?: number | null
          trigger_config?: Json | null
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      banned_users: {
        Row: {
          banned_at: string | null
          banned_by: string
          expires_at: string | null
          id: string
          is_permanent: boolean | null
          reason: string
          user_id: string
        }
        Insert: {
          banned_at?: string | null
          banned_by: string
          expires_at?: string | null
          id?: string
          is_permanent?: boolean | null
          reason: string
          user_id: string
        }
        Update: {
          banned_at?: string | null
          banned_by?: string
          expires_at?: string | null
          id?: string
          is_permanent?: boolean | null
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
      blog_articles: {
        Row: {
          author_credentials: string | null
          author_id: string | null
          author_name: string | null
          category: string
          content: string
          created_at: string
          excerpt: string
          id: string
          image_url: string | null
          is_ai_generated: boolean | null
          is_published: boolean | null
          published_at: string | null
          read_time: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author_credentials?: string | null
          author_id?: string | null
          author_name?: string | null
          category: string
          content: string
          created_at?: string
          excerpt: string
          id?: string
          image_url?: string | null
          is_ai_generated?: boolean | null
          is_published?: boolean | null
          published_at?: string | null
          read_time?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author_credentials?: string | null
          author_id?: string | null
          author_name?: string | null
          category?: string
          content?: string
          created_at?: string
          excerpt?: string
          id?: string
          image_url?: string | null
          is_ai_generated?: boolean | null
          is_published?: boolean | null
          published_at?: string | null
          read_time?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
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
      contact_messages: {
        Row: {
          attachments: Json | null
          category: string
          created_at: string
          email: string
          id: string
          message: string
          name: string
          read_at: string | null
          responded_at: string | null
          response: string | null
          response_read_at: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          attachments?: Json | null
          category?: string
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          read_at?: string | null
          responded_at?: string | null
          response?: string | null
          response_read_at?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          attachments?: Json | null
          category?: string
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          read_at?: string | null
          responded_at?: string | null
          response?: string | null
          response_read_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      content_flags: {
        Row: {
          content_id: string
          content_type: string
          created_at: string | null
          flagged_by: string
          id: string
          reason: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string | null
          flagged_by: string
          id?: string
          reason: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string | null
          flagged_by?: string
          id?: string
          reason?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Relationships: []
      }
      corporate_members: {
        Row: {
          corporate_subscription_id: string
          created_at: string
          created_by: string
          email: string
          id: string
          user_id: string
        }
        Insert: {
          corporate_subscription_id: string
          created_at?: string
          created_by: string
          email: string
          id?: string
          user_id: string
        }
        Update: {
          corporate_subscription_id?: string
          created_at?: string
          created_by?: string
          email?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "corporate_members_corporate_subscription_id_fkey"
            columns: ["corporate_subscription_id"]
            isOneToOne: false
            referencedRelation: "corporate_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      corporate_subscriptions: {
        Row: {
          admin_user_id: string
          created_at: string
          current_period_end: string
          current_period_start: string
          current_users_count: number
          id: string
          max_users: number
          organization_name: string
          plan_type: Database["public"]["Enums"]["corporate_plan_type"]
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          admin_user_id: string
          created_at?: string
          current_period_end: string
          current_period_start?: string
          current_users_count?: number
          id?: string
          max_users: number
          organization_name: string
          plan_type: Database["public"]["Enums"]["corporate_plan_type"]
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          admin_user_id?: string
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          current_users_count?: number
          id?: string
          max_users?: number
          organization_name?: string
          plan_type?: Database["public"]["Enums"]["corporate_plan_type"]
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cron_job_metadata: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          display_name: string
          edge_function_name: string | null
          id: string
          is_active: boolean | null
          is_critical: boolean | null
          job_name: string
          next_run_estimate: string | null
          request_body: Json | null
          schedule: string | null
          schedule_human_readable: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_name: string
          edge_function_name?: string | null
          id?: string
          is_active?: boolean | null
          is_critical?: boolean | null
          job_name: string
          next_run_estimate?: string | null
          request_body?: Json | null
          schedule?: string | null
          schedule_human_readable?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_name?: string
          edge_function_name?: string | null
          id?: string
          is_active?: boolean | null
          is_critical?: boolean | null
          job_name?: string
          next_run_estimate?: string | null
          request_body?: Json | null
          schedule?: string | null
          schedule_human_readable?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      daily_smarty_rituals: {
        Row: {
          created_at: string | null
          day_number: number
          evening_content: string
          id: string
          is_visible: boolean | null
          midday_content: string
          morning_content: string
          ritual_date: string
        }
        Insert: {
          created_at?: string | null
          day_number: number
          evening_content: string
          id?: string
          is_visible?: boolean | null
          midday_content: string
          morning_content: string
          ritual_date: string
        }
        Update: {
          created_at?: string | null
          day_number?: number
          evening_content?: string
          id?: string
          is_visible?: boolean | null
          midday_content?: string
          morning_content?: string
          ritual_date?: string
        }
        Relationships: []
      }
      email_campaign_log: {
        Row: {
          campaign_type: string
          email_id: string | null
          id: string
          sent_at: string | null
          user_id: string
        }
        Insert: {
          campaign_type: string
          email_id?: string | null
          id?: string
          sent_at?: string | null
          user_id: string
        }
        Update: {
          campaign_type?: string
          email_id?: string | null
          id?: string
          sent_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          body: string
          category: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          subject: string
          updated_at: string | null
        }
        Insert: {
          body: string
          category: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          subject: string
          updated_at?: string | null
        }
        Update: {
          body?: string
          category?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      exercise_library_videos: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_promotional: boolean | null
          is_visible: boolean | null
          muscle_group: string | null
          program_category: string | null
          target_muscle: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          workout_category: string | null
          workout_phase: string | null
          youtube_url: string
          youtube_video_id: string
        }
        Insert: {
          category?: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_promotional?: boolean | null
          is_visible?: boolean | null
          muscle_group?: string | null
          program_category?: string | null
          target_muscle?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          workout_category?: string | null
          workout_phase?: string | null
          youtube_url: string
          youtube_video_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_promotional?: boolean | null
          is_visible?: boolean | null
          muscle_group?: string | null
          program_category?: string | null
          target_muscle?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          workout_category?: string | null
          workout_phase?: string | null
          youtube_url?: string
          youtube_video_id?: string
        }
        Relationships: []
      }
      exercises: {
        Row: {
          body_part: string
          category: string | null
          created_at: string | null
          description: string | null
          difficulty: string | null
          equipment: string
          gif_url: string | null
          id: string
          instructions: string[] | null
          name: string
          secondary_muscles: string[] | null
          target: string
        }
        Insert: {
          body_part: string
          category?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          equipment: string
          gif_url?: string | null
          id: string
          instructions?: string[] | null
          name: string
          secondary_muscles?: string[] | null
          target: string
        }
        Update: {
          body_part?: string
          category?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          equipment?: string
          gif_url?: string | null
          id?: string
          instructions?: string[] | null
          name?: string
          secondary_muscles?: string[] | null
          target?: string
        }
        Relationships: []
      }
      mismatched_exercises: {
        Row: {
          created_at: string | null
          exercise_name: string
          id: string
          resolved_at: string | null
          resolved_exercise_id: string | null
          source_id: string | null
          source_name: string | null
          source_type: string
        }
        Insert: {
          created_at?: string | null
          exercise_name: string
          id?: string
          resolved_at?: string | null
          resolved_exercise_id?: string | null
          source_id?: string | null
          source_name?: string | null
          source_type: string
        }
        Update: {
          created_at?: string | null
          exercise_name?: string
          id?: string
          resolved_at?: string | null
          resolved_exercise_id?: string | null
          source_id?: string | null
          source_name?: string | null
          source_type?: string
        }
        Relationships: []
      }
      moderation_actions: {
        Row: {
          action_type: string
          created_at: string | null
          id: string
          moderator_id: string
          reason: string | null
          target_id: string
          target_type: string
        }
        Insert: {
          action_type: string
          created_at?: string | null
          id?: string
          moderator_id: string
          reason?: string | null
          target_id: string
          target_type: string
        }
        Update: {
          action_type?: string
          created_at?: string | null
          id?: string
          moderator_id?: string
          reason?: string | null
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          active: boolean
          email: string
          id: string
          name: string
          subscribed_at: string
        }
        Insert: {
          active?: boolean
          email: string
          id?: string
          name: string
          subscribed_at?: string
        }
        Update: {
          active?: boolean
          email?: string
          id?: string
          name?: string
          subscribed_at?: string
        }
        Relationships: []
      }
      notification_audit_log: {
        Row: {
          content: string
          failed_count: number | null
          id: string
          message_type: string
          metadata: Json | null
          notification_type: string
          recipient_count: number | null
          recipient_filter: string | null
          sent_at: string | null
          sent_by: string | null
          subject: string
          success_count: number | null
        }
        Insert: {
          content: string
          failed_count?: number | null
          id?: string
          message_type: string
          metadata?: Json | null
          notification_type: string
          recipient_count?: number | null
          recipient_filter?: string | null
          sent_at?: string | null
          sent_by?: string | null
          subject: string
          success_count?: number | null
        }
        Update: {
          content?: string
          failed_count?: number | null
          id?: string
          message_type?: string
          metadata?: Json | null
          notification_type?: string
          recipient_count?: number | null
          recipient_filter?: string | null
          sent_at?: string | null
          sent_by?: string | null
          subject?: string
          success_count?: number | null
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
      pending_content_notifications: {
        Row: {
          content_category: string | null
          content_id: string
          content_name: string
          content_type: string
          created_at: string | null
          id: string
        }
        Insert: {
          content_category?: string | null
          content_id: string
          content_name: string
          content_type: string
          created_at?: string | null
          id?: string
        }
        Update: {
          content_category?: string | null
          content_id?: string
          content_name?: string
          content_type?: string
          created_at?: string | null
          id?: string
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
          avatar_url: string | null
          created_at: string
          custom_session_duration: number | null
          full_name: string | null
          id: string
          notification_preferences: Json | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          custom_session_duration?: number | null
          full_name?: string | null
          id?: string
          notification_preferences?: Json | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          custom_session_duration?: number | null
          full_name?: string | null
          id?: string
          notification_preferences?: Json | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      program_interactions: {
        Row: {
          created_at: string | null
          has_viewed: boolean | null
          id: string
          is_completed: boolean | null
          is_favorite: boolean | null
          is_ongoing: boolean | null
          program_id: string
          program_name: string
          program_type: string
          rating: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          has_viewed?: boolean | null
          id?: string
          is_completed?: boolean | null
          is_favorite?: boolean | null
          is_ongoing?: boolean | null
          program_id: string
          program_name: string
          program_type: string
          rating?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          has_viewed?: boolean | null
          id?: string
          is_completed?: boolean | null
          is_favorite?: boolean | null
          is_ongoing?: boolean | null
          program_id?: string
          program_name?: string
          program_type?: string
          rating?: number | null
          updated_at?: string | null
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
      promotional_videos: {
        Row: {
          component_code: string | null
          component_name: string | null
          created_at: string | null
          description: string | null
          duration: string | null
          id: string
          is_current: boolean
          name: string
          parent_version_id: string | null
          updated_at: string | null
          version: number
          video_url: string | null
        }
        Insert: {
          component_code?: string | null
          component_name?: string | null
          created_at?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          is_current?: boolean
          name: string
          parent_version_id?: string | null
          updated_at?: string | null
          version?: number
          video_url?: string | null
        }
        Update: {
          component_code?: string | null
          component_name?: string | null
          created_at?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          is_current?: boolean
          name?: string
          parent_version_id?: string | null
          updated_at?: string | null
          version?: number
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promotional_videos_parent_version_id_fkey"
            columns: ["parent_version_id"]
            isOneToOne: false
            referencedRelation: "promotional_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          identifier: string
          last_request_at: string | null
          request_count: number
          window_start: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          identifier: string
          last_request_at?: string | null
          request_count?: number
          window_start?: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          identifier?: string
          last_request_at?: string | null
          request_count?: number
          window_start?: string
        }
        Relationships: []
      }
      response_templates: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          subject: string
          updated_at: string
        }
        Insert: {
          category?: string
          content: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          subject: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      ritual_purchases: {
        Row: {
          id: string
          purchased_at: string | null
          ritual_date: string
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          user_id: string
        }
        Insert: {
          id?: string
          purchased_at?: string | null
          ritual_date: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          user_id: string
        }
        Update: {
          id?: string
          purchased_at?: string | null
          ritual_date?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
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
      scheduled_emails: {
        Row: {
          body: string
          created_at: string | null
          created_by: string | null
          error_message: string | null
          id: string
          last_sent_at: string | null
          next_scheduled_time: string | null
          recipient_count: number | null
          recipient_emails: string[] | null
          recurrence_interval: string | null
          recurrence_pattern: string | null
          scheduled_time: string
          sent_at: string | null
          status: string | null
          subject: string
          target_audience: string
          template_id: string | null
          timezone: string | null
        }
        Insert: {
          body: string
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          id?: string
          last_sent_at?: string | null
          next_scheduled_time?: string | null
          recipient_count?: number | null
          recipient_emails?: string[] | null
          recurrence_interval?: string | null
          recurrence_pattern?: string | null
          scheduled_time: string
          sent_at?: string | null
          status?: string | null
          subject: string
          target_audience: string
          template_id?: string | null
          timezone?: string | null
        }
        Update: {
          body?: string
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          id?: string
          last_sent_at?: string | null
          next_scheduled_time?: string | null
          recipient_count?: number | null
          recipient_emails?: string[] | null
          recurrence_interval?: string | null
          recurrence_pattern?: string | null
          scheduled_time?: string
          sent_at?: string | null
          status?: string | null
          subject?: string
          target_audience?: string
          template_id?: string | null
          timezone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_emails_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_notifications: {
        Row: {
          body: string
          created_at: string
          created_by: string | null
          error_message: string | null
          icon: string | null
          id: string
          last_sent_at: string | null
          next_scheduled_time: string | null
          recipient_count: number | null
          recurrence_interval: string | null
          recurrence_pattern: string | null
          scheduled_time: string
          sent_at: string | null
          status: string
          target_audience: string
          timezone: string | null
          title: string
          url: string | null
        }
        Insert: {
          body: string
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          icon?: string | null
          id?: string
          last_sent_at?: string | null
          next_scheduled_time?: string | null
          recipient_count?: number | null
          recurrence_interval?: string | null
          recurrence_pattern?: string | null
          scheduled_time: string
          sent_at?: string | null
          status?: string
          target_audience: string
          timezone?: string | null
          title: string
          url?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          icon?: string | null
          id?: string
          last_sent_at?: string | null
          next_scheduled_time?: string | null
          recipient_count?: number | null
          recurrence_interval?: string | null
          recurrence_pattern?: string | null
          scheduled_time?: string
          sent_at?: string | null
          status?: string
          target_audience?: string
          timezone?: string | null
          title?: string
          url?: string | null
        }
        Relationships: []
      }
      scheduled_workouts: {
        Row: {
          content_id: string
          content_name: string
          content_type: string
          created_at: string
          google_calendar_event_id: string | null
          id: string
          notes: string | null
          reminder_before_minutes: number | null
          reminder_sent: boolean | null
          scheduled_date: string
          scheduled_time: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content_id: string
          content_name: string
          content_type: string
          created_at?: string
          google_calendar_event_id?: string | null
          id?: string
          notes?: string | null
          reminder_before_minutes?: number | null
          reminder_sent?: boolean | null
          scheduled_date: string
          scheduled_time?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content_id?: string
          content_name?: string
          content_type?: string
          created_at?: string
          google_calendar_event_id?: string | null
          id?: string
          notes?: string | null
          reminder_before_minutes?: number | null
          reminder_sent?: boolean | null
          scheduled_date?: string
          scheduled_time?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      seo_metadata: {
        Row: {
          content_id: string
          content_type: string
          created_at: string | null
          id: string
          image_alt_text: string | null
          internal_links: string[] | null
          json_ld: Json | null
          keywords: string[] | null
          last_refreshed_at: string | null
          meta_description: string | null
          meta_title: string | null
          updated_at: string | null
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string | null
          id?: string
          image_alt_text?: string | null
          internal_links?: string[] | null
          json_ld?: Json | null
          keywords?: string[] | null
          last_refreshed_at?: string | null
          meta_description?: string | null
          meta_title?: string | null
          updated_at?: string | null
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string | null
          id?: string
          image_alt_text?: string | null
          internal_links?: string[] | null
          json_ld?: Json | null
          keywords?: string[] | null
          last_refreshed_at?: string | null
          meta_description?: string | null
          meta_title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      seo_refresh_log: {
        Row: {
          completed_at: string | null
          error_message: string | null
          id: string
          items_scanned: number | null
          items_updated: number | null
          metadata: Json | null
          refresh_type: string
          sitemap_generated: boolean | null
          started_at: string | null
        }
        Insert: {
          completed_at?: string | null
          error_message?: string | null
          id?: string
          items_scanned?: number | null
          items_updated?: number | null
          metadata?: Json | null
          refresh_type: string
          sitemap_generated?: boolean | null
          started_at?: string | null
        }
        Update: {
          completed_at?: string | null
          error_message?: string | null
          id?: string
          items_scanned?: number | null
          items_updated?: number | null
          metadata?: Json | null
          refresh_type?: string
          sitemap_generated?: boolean | null
          started_at?: string | null
        }
        Relationships: []
      }
      shop_products: {
        Row: {
          amazon_url: string | null
          category: string
          created_at: string
          description: string
          display_order: number | null
          id: string
          image_url: string
          is_available: boolean | null
          is_featured: boolean | null
          price: number | null
          price_range: string
          product_type: string
          stock_quantity: number | null
          stripe_price_id: string | null
          stripe_product_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          amazon_url?: string | null
          category: string
          created_at?: string
          description: string
          display_order?: number | null
          id?: string
          image_url: string
          is_available?: boolean | null
          is_featured?: boolean | null
          price?: number | null
          price_range: string
          product_type?: string
          stock_quantity?: number | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          amazon_url?: string | null
          category?: string
          created_at?: string
          description?: string
          display_order?: number | null
          id?: string
          image_url?: string
          is_available?: boolean | null
          is_featured?: boolean | null
          price?: number | null
          price_range?: string
          product_type?: string
          stock_quantity?: number | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      smarty_checkins: {
        Row: {
          checkin_date: string
          created_at: string | null
          daily_smarty_score: number | null
          day_strain: number | null
          day_strain_score: number | null
          hydration_liters: number | null
          hydration_score: number | null
          id: string
          mood_rating: number | null
          mood_score: number | null
          morning_completed: boolean | null
          morning_completed_at: string | null
          morning_modal_shown: boolean | null
          movement_score: number | null
          night_completed: boolean | null
          night_completed_at: string | null
          night_modal_shown: boolean | null
          protein_level: number | null
          protein_score_norm: number | null
          readiness_score: number | null
          readiness_score_norm: number | null
          score_category: string | null
          sleep_hours: number | null
          sleep_quality: number | null
          sleep_score: number | null
          soreness_rating: number | null
          soreness_score: number | null
          status: string | null
          steps_bucket: number | null
          steps_value: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          checkin_date: string
          created_at?: string | null
          daily_smarty_score?: number | null
          day_strain?: number | null
          day_strain_score?: number | null
          hydration_liters?: number | null
          hydration_score?: number | null
          id?: string
          mood_rating?: number | null
          mood_score?: number | null
          morning_completed?: boolean | null
          morning_completed_at?: string | null
          morning_modal_shown?: boolean | null
          movement_score?: number | null
          night_completed?: boolean | null
          night_completed_at?: string | null
          night_modal_shown?: boolean | null
          protein_level?: number | null
          protein_score_norm?: number | null
          readiness_score?: number | null
          readiness_score_norm?: number | null
          score_category?: string | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          sleep_score?: number | null
          soreness_rating?: number | null
          soreness_score?: number | null
          status?: string | null
          steps_bucket?: number | null
          steps_value?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          checkin_date?: string
          created_at?: string | null
          daily_smarty_score?: number | null
          day_strain?: number | null
          day_strain_score?: number | null
          hydration_liters?: number | null
          hydration_score?: number | null
          id?: string
          mood_rating?: number | null
          mood_score?: number | null
          morning_completed?: boolean | null
          morning_completed_at?: string | null
          morning_modal_shown?: boolean | null
          movement_score?: number | null
          night_completed?: boolean | null
          night_completed_at?: string | null
          night_modal_shown?: boolean | null
          protein_level?: number | null
          protein_score_norm?: number | null
          readiness_score?: number | null
          readiness_score_norm?: number | null
          score_category?: string | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          sleep_score?: number | null
          soreness_rating?: number | null
          soreness_score?: number | null
          status?: string | null
          steps_bucket?: number | null
          steps_value?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      social_media_analytics: {
        Row: {
          browser_info: string | null
          created_at: string | null
          device_type: string | null
          event_type: string
          event_value: number | null
          id: string
          landing_page: string | null
          referral_source: string
          session_id: string
          user_id: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          browser_info?: string | null
          created_at?: string | null
          device_type?: string | null
          event_type: string
          event_value?: number | null
          id?: string
          landing_page?: string | null
          referral_source: string
          session_id: string
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          browser_info?: string | null
          created_at?: string | null
          device_type?: string | null
          event_type?: string
          event_value?: number | null
          id?: string
          landing_page?: string | null
          referral_source?: string
          session_id?: string
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      system_health_audits: {
        Row: {
          audit_date: string
          created_at: string
          critical_issues: string[] | null
          duration_ms: number | null
          failed_checks: number
          id: string
          passed_checks: number
          results: Json | null
          skipped_checks: number
          total_checks: number
          warning_checks: number
        }
        Insert: {
          audit_date?: string
          created_at?: string
          critical_issues?: string[] | null
          duration_ms?: number | null
          failed_checks?: number
          id?: string
          passed_checks?: number
          results?: Json | null
          skipped_checks?: number
          total_checks?: number
          warning_checks?: number
        }
        Update: {
          audit_date?: string
          created_at?: string
          critical_issues?: string[] | null
          duration_ms?: number | null
          failed_checks?: number
          id?: string
          passed_checks?: number
          results?: Json | null
          skipped_checks?: number
          total_checks?: number
          warning_checks?: number
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          created_at: string
          display_name: string
          id: string
          rating: number
          testimonial_text: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          rating: number
          testimonial_text: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          rating?: number
          testimonial_text?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_activity_log: {
        Row: {
          action_type: string
          activity_date: string
          content_type: string
          created_at: string
          id: string
          item_id: string
          item_name: string
          program_day: number | null
          program_week: number | null
          tool_input: Json | null
          tool_result: Json | null
          total_days_per_week: number | null
          total_weeks: number | null
          user_id: string
        }
        Insert: {
          action_type: string
          activity_date?: string
          content_type: string
          created_at?: string
          id?: string
          item_id: string
          item_name: string
          program_day?: number | null
          program_week?: number | null
          tool_input?: Json | null
          tool_result?: Json | null
          total_days_per_week?: number | null
          total_weeks?: number | null
          user_id: string
        }
        Update: {
          action_type?: string
          activity_date?: string
          content_type?: string
          created_at?: string
          id?: string
          item_id?: string
          item_name?: string
          program_day?: number | null
          program_week?: number | null
          tool_input?: Json | null
          tool_result?: Json | null
          total_days_per_week?: number | null
          total_weeks?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_data: Json | null
          badge_level: string
          badge_type: string
          earned_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          badge_data?: Json | null
          badge_level: string
          badge_type: string
          earned_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          badge_data?: Json | null
          badge_level?: string
          badge_type?: string
          earned_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_calendar_connections: {
        Row: {
          access_token: string
          auto_sync_enabled: boolean | null
          calendar_id: string | null
          checkin_reminder_event_ids: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          provider: string
          refresh_token: string
          ritual_reminder_event_ids: Json | null
          token_expires_at: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          auto_sync_enabled?: boolean | null
          calendar_id?: string | null
          checkin_reminder_event_ids?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          provider?: string
          refresh_token: string
          ritual_reminder_event_ids?: Json | null
          token_expires_at: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          auto_sync_enabled?: boolean | null
          calendar_id?: string | null
          checkin_reminder_event_ids?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          provider?: string
          refresh_token?: string
          ritual_reminder_event_ids?: Json | null
          token_expires_at?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_measurement_goals: {
        Row: {
          created_at: string
          id: string
          target_body_fat: number | null
          target_date: string | null
          target_muscle_mass: number | null
          target_weight: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          target_body_fat?: number | null
          target_date?: string | null
          target_muscle_mass?: number | null
          target_weight?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          target_body_fat?: number | null
          target_date?: string | null
          target_muscle_mass?: number | null
          target_weight?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_purchases: {
        Row: {
          content_deleted: boolean | null
          content_id: string
          content_name: string
          content_type: string
          fulfillment_status: string | null
          id: string
          price: number
          purchased_at: string
          shipping_address: Json | null
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          tracking_info: string | null
          user_id: string
        }
        Insert: {
          content_deleted?: boolean | null
          content_id: string
          content_name: string
          content_type: string
          fulfillment_status?: string | null
          id?: string
          price: number
          purchased_at?: string
          shipping_address?: Json | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          tracking_info?: string | null
          user_id: string
        }
        Update: {
          content_deleted?: boolean | null
          content_id?: string
          content_name?: string
          content_type?: string
          fulfillment_status?: string | null
          id?: string
          price?: number
          purchased_at?: string
          shipping_address?: Json | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          tracking_info?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
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
      user_system_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          message_type: Database["public"]["Enums"]["message_type"]
          subject: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type: Database["public"]["Enums"]["message_type"]
          subject: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: Database["public"]["Enums"]["message_type"]
          subject?: string
          user_id?: string
        }
        Relationships: []
      }
      wod_auto_generation_config: {
        Row: {
          created_at: string
          generation_hour_utc: number
          id: string
          is_enabled: boolean
          pause_reason: string | null
          paused_until: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          generation_hour_utc?: number
          id?: string
          is_enabled?: boolean
          pause_reason?: string | null
          paused_until?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          generation_hour_utc?: number
          id?: string
          is_enabled?: boolean
          pause_reason?: string | null
          paused_until?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      wod_generation_runs: {
        Row: {
          completed_at: string | null
          created_at: string
          cyprus_date: string
          error_message: string | null
          expected_category: string | null
          expected_count: number
          found_count: number | null
          id: string
          is_recovery_day: boolean | null
          started_at: string
          status: string
          trigger_source: string | null
          wods_created: Json | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          cyprus_date: string
          error_message?: string | null
          expected_category?: string | null
          expected_count: number
          found_count?: number | null
          id?: string
          is_recovery_day?: boolean | null
          started_at?: string
          status?: string
          trigger_source?: string | null
          wods_created?: Json | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          cyprus_date?: string
          error_message?: string | null
          expected_category?: string | null
          expected_count?: number
          found_count?: number | null
          id?: string
          is_recovery_day?: boolean | null
          started_at?: string
          status?: string
          trigger_source?: string | null
          wods_created?: Json | null
        }
        Relationships: []
      }
      workout_comments: {
        Row: {
          comment_text: string
          created_at: string
          id: string
          program_id: string | null
          program_name: string | null
          program_type: string | null
          updated_at: string
          user_id: string
          workout_id: string | null
          workout_name: string | null
          workout_type: string | null
        }
        Insert: {
          comment_text: string
          created_at?: string
          id?: string
          program_id?: string | null
          program_name?: string | null
          program_type?: string | null
          updated_at?: string
          user_id: string
          workout_id?: string | null
          workout_name?: string | null
          workout_type?: string | null
        }
        Update: {
          comment_text?: string
          created_at?: string
          id?: string
          program_id?: string | null
          program_name?: string | null
          program_type?: string | null
          updated_at?: string
          user_id?: string
          workout_id?: string | null
          workout_name?: string | null
          workout_type?: string | null
        }
        Relationships: []
      }
      workout_interactions: {
        Row: {
          created_at: string | null
          has_viewed: boolean | null
          id: string
          is_completed: boolean | null
          is_favorite: boolean | null
          rating: number | null
          updated_at: string | null
          user_id: string
          workout_id: string
          workout_name: string
          workout_type: string
        }
        Insert: {
          created_at?: string | null
          has_viewed?: boolean | null
          id?: string
          is_completed?: boolean | null
          is_favorite?: boolean | null
          rating?: number | null
          updated_at?: string | null
          user_id: string
          workout_id: string
          workout_name: string
          workout_type: string
        }
        Update: {
          created_at?: string | null
          has_viewed?: boolean | null
          id?: string
          is_completed?: boolean | null
          is_favorite?: boolean | null
          rating?: number | null
          updated_at?: string | null
          user_id?: string
          workout_id?: string
          workout_name?: string
          workout_type?: string
        }
        Relationships: []
      }
      workout_of_day_state: {
        Row: {
          created_at: string | null
          difficulty_advanced_count: number | null
          difficulty_beginner_count: number | null
          difficulty_intermediate_count: number | null
          equipment_bodyweight_count: number | null
          equipment_with_count: number | null
          format_usage: Json | null
          id: string
          last_difficulty: string | null
          last_equipment: string | null
          last_generated_at: string | null
          manual_overrides: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          difficulty_advanced_count?: number | null
          difficulty_beginner_count?: number | null
          difficulty_intermediate_count?: number | null
          equipment_bodyweight_count?: number | null
          equipment_with_count?: number | null
          format_usage?: Json | null
          id?: string
          last_difficulty?: string | null
          last_equipment?: string | null
          last_generated_at?: string | null
          manual_overrides?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          difficulty_advanced_count?: number | null
          difficulty_beginner_count?: number | null
          difficulty_intermediate_count?: number | null
          equipment_bodyweight_count?: number | null
          equipment_with_count?: number | null
          format_usage?: Json | null
          id?: string
          last_difficulty?: string | null
          last_equipment?: string | null
          last_generated_at?: string | null
          manual_overrides?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      leaderboard_stats: {
        Row: {
          avatar_url: string | null
          avg_score: number | null
          best_score: number | null
          complete_days: number | null
          display_name: string | null
          streak_days: number | null
          total_checkins: number | null
        }
        Relationships: []
      }
      program_activity_summary: {
        Row: {
          avg_rating: number | null
          favorites_count: number | null
          program_name: string | null
          program_type: string | null
          times_completed: number | null
          times_started: number | null
        }
        Relationships: []
      }
      workout_activity_summary: {
        Row: {
          avg_rating: number | null
          favorites_count: number | null
          times_completed: number | null
          workout_name: string | null
          workout_type: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_rate_limit: {
        Args: {
          p_endpoint: string
          p_identifier: string
          p_max_requests?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      ensure_cron_jobs: { Args: never; Returns: Json }
      exec_sql: { Args: { sql: string }; Returns: undefined }
      get_cron_jobs: {
        Args: never
        Returns: {
          active: boolean
          jobname: string
          schedule: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role_check: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_user_banned: { Args: { user_id_param: string }; Returns: boolean }
      pg_cron_enabled: { Args: never; Returns: boolean }
      update_wod_cron_schedule: { Args: { new_hour: number }; Returns: Json }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      corporate_plan_type: "dynamic" | "power" | "elite" | "enterprise"
      message_type:
        | "welcome"
        | "purchase_workout"
        | "purchase_program"
        | "purchase_personal_training"
        | "purchase_subscription"
        | "renewal_reminder"
        | "renewal_thank_you"
        | "cancellation"
        | "announcement_new_workout"
        | "announcement_new_program"
        | "announcement_new_service"
        | "announcement_special_offer"
        | "announcement_update"
        | "announcement_event"
        | "purchase_shop_product"
        | "motivational_weekly"
        | "daily_ritual"
        | "weekly_activity_report"
        | "wod_notification"
        | "checkin_reminder"
        | "subscription_expired"
        | "reactivation"
        | "support"
        | "mass_notification"
        | "new_workout"
        | "new_program"
        | "new_article"
        | "program_delivered"
        | "morning_wod"
        | "morning_wod_recovery"
        | "morning_ritual"
        | "morning_daily_digest"
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
      app_role: ["admin", "moderator", "user"],
      corporate_plan_type: ["dynamic", "power", "elite", "enterprise"],
      message_type: [
        "welcome",
        "purchase_workout",
        "purchase_program",
        "purchase_personal_training",
        "purchase_subscription",
        "renewal_reminder",
        "renewal_thank_you",
        "cancellation",
        "announcement_new_workout",
        "announcement_new_program",
        "announcement_new_service",
        "announcement_special_offer",
        "announcement_update",
        "announcement_event",
        "purchase_shop_product",
        "motivational_weekly",
        "daily_ritual",
        "weekly_activity_report",
        "wod_notification",
        "checkin_reminder",
        "subscription_expired",
        "reactivation",
        "support",
        "mass_notification",
        "new_workout",
        "new_program",
        "new_article",
        "program_delivered",
        "morning_wod",
        "morning_wod_recovery",
        "morning_ritual",
        "morning_daily_digest",
      ],
      plan_type: ["free", "gold", "platinum"],
      subscription_status: ["active", "canceled", "past_due"],
    },
  },
} as const
