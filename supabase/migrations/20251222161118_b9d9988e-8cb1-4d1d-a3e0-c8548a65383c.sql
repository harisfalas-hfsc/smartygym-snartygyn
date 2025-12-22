-- Create table for storing all app vault data
CREATE TABLE public.app_vault_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL,
  field_key TEXT NOT NULL,
  field_value TEXT,
  field_type TEXT DEFAULT 'text',
  notes TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(section, field_key)
);

-- Enable RLS
ALTER TABLE public.app_vault_data ENABLE ROW LEVEL SECURITY;

-- Only admins can manage vault data
CREATE POLICY "Only admins can view vault data"
ON public.app_vault_data FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can insert vault data"
ON public.app_vault_data FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update vault data"
ON public.app_vault_data FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete vault data"
ON public.app_vault_data FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at trigger
CREATE TRIGGER update_app_vault_data_updated_at
BEFORE UPDATE ON public.app_vault_data
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Pre-populate with SmartyGym data
INSERT INTO public.app_vault_data (section, field_key, field_value, field_type, notes, display_order) VALUES
-- Application Identity
('identity', 'app_name', 'SmartyGym', 'text', 'Official app name for all stores', 1),
('identity', 'app_subtitle', 'Expert Fitness', 'text', 'iOS subtitle (max 30 chars)', 2),
('identity', 'bundle_id_ios', 'app.lovable.f0bf7ae7990c4724b9e4b9150ef73d37', 'text', 'iOS Bundle Identifier - cannot be changed after submission', 3),
('identity', 'package_name_android', 'app.lovable.f0bf7ae7990c4724b9e4b9150ef73d37', 'text', 'Android Package Name - cannot be changed after submission', 4),
('identity', 'current_version', '1.0.0', 'text', 'Current app version', 5),
('identity', 'short_description', 'Professional fitness coaching with expert-designed workouts and training programs', 'text', 'Google Play short description (max 80 chars)', 6),
('identity', 'long_description', 'Transform your fitness journey with SmartyGym – the professional fitness platform designed by Sports Scientist Haris Falas. Get access to 500+ expert-designed workouts, comprehensive training programs, and powerful fitness tools.\n\nFeatures:\n• Daily Workout of the Day\n• Custom Workout Generator\n• Training Program Library\n• BMR & Calorie Calculators\n• Progress Tracking\n• Community Features\n\nWhether you are a beginner or advanced athlete, SmartyGym provides the guidance you need to achieve real results.', 'text', 'Full app description for stores', 7),
('identity', 'keywords', 'fitness,workout,gym,training,exercise,strength,personal trainer,HIIT,muscle,weight loss', 'text', 'iOS keywords (max 100 chars, comma-separated)', 8),
('identity', 'primary_category', 'Health & Fitness', 'text', 'Primary store category', 9),
('identity', 'secondary_category', 'Lifestyle', 'text', 'Secondary store category', 10),
('identity', 'privacy_policy_url', 'https://smartygym.com/privacy-policy', 'url', 'Required for both stores', 11),
('identity', 'terms_of_service_url', 'https://smartygym.com/terms-of-service', 'url', 'Terms and conditions page', 12),
('identity', 'support_email', 'support@smartygym.com', 'text', 'Customer support email', 13),
('identity', 'support_url', 'https://smartygym.com/contact', 'url', 'Support page URL', 14),
('identity', 'marketing_url', 'https://smartygym.com', 'url', 'Marketing website', 15),

-- Branding
('branding', 'primary_color', '#0ea5e9', 'text', 'Primary brand color (Sky Blue)', 1),
('branding', 'secondary_color', '#f97316', 'text', 'Secondary/accent color (Orange)', 2),
('branding', 'background_dark', '#0f172a', 'text', 'Dark background color', 3),
('branding', 'background_light', '#ffffff', 'text', 'Light background color', 4),
('branding', 'font_primary', 'Plus Jakarta Sans', 'text', 'Primary font family', 5),
('branding', 'font_secondary', 'Inter', 'text', 'Secondary font family', 6),
('branding', 'logo_url', 'https://smartygym.com/smarty-gym-logo.png', 'url', 'Main logo file', 7),
('branding', 'icon_sizes_ios', '20x20, 29x29, 40x40, 60x60, 76x76, 83.5x83.5, 1024x1024', 'text', 'Required iOS icon sizes (all @1x, @2x, @3x)', 8),
('branding', 'icon_sizes_android', '48x48, 72x72, 96x96, 144x144, 192x192, 512x512', 'text', 'Required Android icon sizes', 9),
('branding', 'feature_graphic_size', '1024x500', 'text', 'Google Play feature graphic size', 10),
('branding', 'screenshot_sizes_ios', '1290x2796 (6.7"), 1284x2778 (6.5"), 1242x2688 (6.5"), 1179x2556 (6.1")', 'text', 'iOS screenshot sizes by device', 11),
('branding', 'screenshot_sizes_android', '1080x1920 (minimum), up to 3840x3840', 'text', 'Android screenshot requirements', 12),

-- PWA Configuration
('pwa', 'pwa_url', 'https://smartygym.com', 'url', 'Main PWA URL', 1),
('pwa', 'start_url', '/', 'text', 'App start URL path', 2),
('pwa', 'display_mode', 'standalone', 'text', 'PWA display mode', 3),
('pwa', 'orientation', 'portrait', 'text', 'Default orientation', 4),
('pwa', 'theme_color', '#0ea5e9', 'text', 'Browser theme color', 5),
('pwa', 'background_color', '#0f172a', 'text', 'Splash screen background', 6),
('pwa', 'scope', '/', 'text', 'PWA navigation scope', 7),
('pwa', 'service_worker', 'Workbox-based service worker with caching strategies', 'text', 'Service worker implementation', 8),
('pwa', 'offline_support', 'Yes - cached pages and assets available offline', 'text', 'Offline capability status', 9),
('pwa', 'manifest_location', '/manifest.json', 'text', 'Web manifest file path', 10),

-- Firebase Configuration
('firebase', 'project_name', 'SmartyGym', 'text', 'Firebase project display name', 1),
('firebase', 'project_id', '[To be configured]', 'text', 'Firebase project ID', 2),
('firebase', 'console_url', 'https://console.firebase.google.com', 'url', 'Firebase Console access', 3),
('firebase', 'fcm_enabled', 'Yes', 'text', 'Firebase Cloud Messaging status', 4),
('firebase', 'vapid_public_key', '[Configured in Supabase secrets]', 'text', 'VAPID public key for web push', 5),
('firebase', 'vapid_private_key', '[Configured in Supabase secrets]', 'text', 'VAPID private key location', 6),
('firebase', 'android_config_file', 'google-services.json', 'text', 'Android Firebase config filename', 7),
('firebase', 'ios_config_file', 'GoogleService-Info.plist', 'text', 'iOS Firebase config filename', 8),
('firebase', 'push_trigger_method', 'Edge functions via Supabase', 'text', 'How push notifications are triggered', 9),
('firebase', 'notification_types', 'WOD alerts, New content, Check-in reminders, System messages', 'text', 'Types of push notifications sent', 10),

-- Apple iOS Requirements
('apple', 'developer_account', 'Apple Developer Program ($99/year)', 'text', 'Required account type', 1),
('apple', 'app_store_connect_url', 'https://appstoreconnect.apple.com', 'url', 'App Store Connect portal', 2),
('apple', 'bundle_identifier', 'app.lovable.f0bf7ae7990c4724b9e4b9150ef73d37', 'text', 'iOS Bundle ID', 3),
('apple', 'capabilities_required', 'Push Notifications, Background Modes (fetch, remote-notification)', 'text', 'Required app capabilities', 4),
('apple', 'apns_key_type', 'APNs Auth Key (.p8)', 'text', 'Recommended push notification key type', 5),
('apple', 'certificates_needed', 'Distribution Certificate, APNs Key', 'text', 'Required certificates', 6),
('apple', 'provisioning_profile', 'App Store Distribution profile', 'text', 'Required provisioning profile', 7),
('apple', 'content_rating', '4+ (No objectionable content)', 'text', 'Age rating for App Store', 8),
('apple', 'common_rejection_risks', '1. Missing privacy policy\n2. Broken links\n3. Placeholder content\n4. Login required without guest mode\n5. Push notification permission timing\n6. In-app purchase issues', 'text', 'Common reasons for App Store rejection', 9),
('apple', 'review_guidelines_url', 'https://developer.apple.com/app-store/review/guidelines/', 'url', 'Apple Review Guidelines', 10),

-- Google Play Requirements
('google', 'developer_account', 'Google Play Console ($25 one-time)', 'text', 'Required account type', 1),
('google', 'play_console_url', 'https://play.google.com/console', 'url', 'Google Play Console portal', 2),
('google', 'package_name', 'app.lovable.f0bf7ae7990c4724b9e4b9150ef73d37', 'text', 'Android Package Name', 3),
('google', 'target_sdk', '34 (Android 14)', 'text', 'Target SDK version', 4),
('google', 'min_sdk', '24 (Android 7.0)', 'text', 'Minimum SDK version', 5),
('google', 'app_signing', 'Google Play App Signing (recommended)', 'text', 'App signing method', 6),
('google', 'keystore_info', 'Upload key generated locally, signing key managed by Google', 'text', 'Keystore configuration', 7),
('google', 'content_rating', 'Everyone (IARC)', 'text', 'Content rating for Play Store', 8),
('google', 'data_safety_categories', 'Personal info (email), App activity, App info and performance', 'text', 'Data safety form categories', 9),
('google', 'permissions_used', 'INTERNET, RECEIVE_BOOT_COMPLETED, VIBRATE, POST_NOTIFICATIONS', 'text', 'Android permissions required', 10),
('google', 'release_tracks', 'Internal testing → Closed testing → Open testing → Production', 'text', 'Recommended release progression', 11),

-- Hosting & Infrastructure
('hosting', 'hosting_provider', 'Lovable Cloud (Supabase)', 'text', 'Primary hosting platform', 1),
('hosting', 'domain', 'smartygym.com', 'text', 'Primary domain', 2),
('hosting', 'ssl_status', 'Active - Auto-renewed SSL certificate', 'text', 'SSL certificate status', 3),
('hosting', 'cdn', 'Cloudflare (via Lovable)', 'text', 'Content delivery network', 4),
('hosting', 'database', 'PostgreSQL (Supabase)', 'text', 'Database type', 5),
('hosting', 'storage', 'Supabase Storage', 'text', 'File storage solution', 6),
('hosting', 'edge_functions', 'Supabase Edge Functions (Deno)', 'text', 'Serverless functions platform', 7),
('hosting', 'environment_variables', 'VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, VITE_SUPABASE_PROJECT_ID', 'text', 'Frontend environment variables', 8),
('hosting', 'scaling', 'Auto-scaling via Lovable Cloud', 'text', 'Scaling approach', 9),
('hosting', 'backup_frequency', 'Daily automated backups', 'text', 'Database backup schedule', 10),

-- Ownership & Access
('ownership', 'app_owner', 'SmartyGym / Haris Falas', 'text', 'Legal owner of the application', 1),
('ownership', 'ownership_confirmation', 'All app assets, code, and data are owned exclusively by the app owner', 'text', 'Ownership statement', 2),
('ownership', 'platforms', 'Web (PWA), iOS App Store, Google Play Store', 'text', 'Platforms where app exists', 3),
('ownership', 'source_code_location', 'Lovable.dev project', 'text', 'Where source code is hosted', 4),
('ownership', 'migration_instructions', '1. Export database from Supabase\n2. Download source code from Lovable\n3. Export storage bucket contents\n4. Transfer domain DNS\n5. Set up new hosting environment\n6. Import data and deploy', 'text', 'Steps to migrate to another provider', 5),
('ownership', 'backup_locations', 'Supabase (database), Lovable (code), Storage buckets (assets)', 'text', 'Where backups are stored', 6),
('ownership', 'access_credentials', 'Stored securely in Lovable Cloud secrets', 'text', 'API keys and credentials location', 7),

-- Maintenance & Updates
('maintenance', 'update_deployment', 'Automatic deployment on code push via Lovable', 'text', 'How updates are deployed', 1),
('maintenance', 'version_update_process', '1. Update version in package.json\n2. Update version in app vault\n3. Build new release\n4. Submit to App Store/Play Store\n5. Wait for review\n6. Release to users', 'text', 'Version update steps', 2),
('maintenance', 'app_resubmission', '1. Make required changes\n2. Increment version number\n3. Generate new build\n4. Upload to App Store Connect / Play Console\n5. Submit for review', 'text', 'App resubmission process', 3),
('maintenance', 'rollback_plan', '1. Identify issue\n2. Revert to previous Lovable version\n3. For native apps: submit hotfix update\n4. For critical issues: enable maintenance mode', 'text', 'Emergency rollback procedure', 4),
('maintenance', 'monitoring', 'Supabase Dashboard, Error logs, Analytics', 'text', 'Monitoring tools used', 5),
('maintenance', 'support_process', 'User contacts via app → Contact form → Admin reviews → Response sent', 'text', 'User support workflow', 6)

ON CONFLICT (section, field_key) DO NOTHING;