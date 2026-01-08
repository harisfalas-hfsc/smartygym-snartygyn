// Centralized admin settings helper
// Single source of truth for admin notification email

const DEFAULT_ADMIN_EMAIL = "smartygym@outlook.com";

/**
 * Get the admin notification email from system_settings
 * Falls back to default if not found
 */
export async function getAdminNotificationEmail(supabase: any): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('setting_value')
      .eq('setting_key', 'admin_notification_email')
      .maybeSingle();
    
    if (error) {
      console.warn(`⚠️ Failed to fetch admin email setting: ${error.message}`);
      return DEFAULT_ADMIN_EMAIL;
    }
    
    if (data?.setting_value?.email) {
      return data.setting_value.email;
    }
    
    console.warn('⚠️ Admin email setting not found, using default');
    return DEFAULT_ADMIN_EMAIL;
  } catch (err) {
    console.error('❌ Error fetching admin email:', err);
    return DEFAULT_ADMIN_EMAIL;
  }
}

/**
 * Get coach inbox email (for premium direct messages)
 * Falls back to admin notification email if not set
 */
export async function getCoachInboxEmail(supabase: any): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('setting_value')
      .eq('setting_key', 'coach_inbox_email')
      .maybeSingle();
    
    if (error || !data?.setting_value?.email) {
      // Fall back to admin notification email
      return getAdminNotificationEmail(supabase);
    }
    
    return data.setting_value.email;
  } catch (err) {
    console.error('❌ Error fetching coach email:', err);
    return getAdminNotificationEmail(supabase);
  }
}
