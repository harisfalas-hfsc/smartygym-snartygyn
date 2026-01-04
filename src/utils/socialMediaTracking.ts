import { supabase } from "@/integrations/supabase/client";

// Generate or retrieve session ID
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('sm_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('sm_session_id', sessionId);
  }
  return sessionId;
};

// Detect referral source from URL parameters or document referrer
const detectReferralSource = (): { source: string; utmParams: any } => {
  const urlParams = new URLSearchParams(window.location.search);
  const referrer = document.referrer.toLowerCase();
  
  const utmParams = {
    utm_source: urlParams.get('utm_source'),
    utm_medium: urlParams.get('utm_medium'),
    utm_campaign: urlParams.get('utm_campaign'),
    utm_content: urlParams.get('utm_content'),
  };

  // Check UTM source first
  if (utmParams.utm_source) {
    const source = utmParams.utm_source.toLowerCase();
    if (source.includes('facebook') || source.includes('fb')) return { source: 'facebook', utmParams };
    if (source.includes('instagram') || source.includes('ig')) return { source: 'instagram', utmParams };
    if (source.includes('tiktok')) return { source: 'tiktok', utmParams };
    if (source.includes('youtube') || source.includes('yt')) return { source: 'youtube', utmParams };
    return { source: 'other', utmParams };
  }

  // Check document referrer
  if (referrer) {
    if (referrer.includes('facebook.com') || referrer.includes('fb.com')) return { source: 'facebook', utmParams };
    if (referrer.includes('instagram.com')) return { source: 'instagram', utmParams };
    if (referrer.includes('tiktok.com')) return { source: 'tiktok', utmParams };
    if (referrer.includes('youtube.com') || referrer.includes('youtu.be')) return { source: 'youtube', utmParams };
    if (referrer.includes('twitter.com') || referrer.includes('x.com')) return { source: 'twitter', utmParams };
    if (referrer.includes('linkedin.com')) return { source: 'linkedin', utmParams };
    // Organic search engines
    if (referrer.includes('google.com') || referrer.includes('google.')) return { source: 'google', utmParams };
    if (referrer.includes('bing.com')) return { source: 'bing', utmParams };
    if (referrer.includes('yahoo.com')) return { source: 'yahoo', utmParams };
    if (referrer.includes('duckduckgo.com')) return { source: 'duckduckgo', utmParams };
    if (referrer.includes('ecosia.org')) return { source: 'ecosia', utmParams };
    if (referrer) return { source: 'other', utmParams };
  }

  return { source: 'direct', utmParams };
};

// Get device and browser info
const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  let deviceType = 'desktop';
  
  if (/Mobile|Android|iPhone|iPad|iPod/i.test(ua)) {
    deviceType = /iPad/i.test(ua) ? 'tablet' : 'mobile';
  }

  return {
    device_type: deviceType,
    browser_info: ua.substring(0, 200), // Limit length
  };
};

interface TrackEventParams {
  eventType: 'visit' | 'signup' | 'subscription_purchase' | 'standalone_purchase' | 'workout_view' | 'program_view';
  eventValue?: number;
  userId?: string;
}

// Bot/crawler user agent patterns to exclude from tracking
const BOT_PATTERNS = [
  'bot', 'crawler', 'spider', 'scraper',
  'googlebot', 'bingbot', 'facebookexternalhit',
  'meta-externalagent', 'meta-externalads',
  'adsbot', 'bytespider', 'slurp', 'duckduckbot',
  'baidu', 'yandex', 'sogou', 'exabot', 'facebot',
  'ia_archiver', 'mj12bot', 'semrushbot', 'ahrefsbot',
  'headlesschrome', 'phantomjs', 'prerender',
  'petalbot', 'applebot', 'twitterbot', 'linkedinbot',
  'whatsapp', 'telegrambot', 'discordbot', 'slackbot'
];

// Check if current context should be excluded from tracking
const shouldExcludeFromTracking = (): boolean => {
  // Exclude Lovable preview iframe
  if (window.location.hostname.includes('lovableproject.com') || 
      window.location.hostname.includes('lovable.app') ||
      window.self !== window.top) {
    return true;
  }
  
  // Exclude if admin exclusion cookie is set
  if (document.cookie.includes('sm_exclude_tracking=true')) {
    return true;
  }
  
  // Exclude bots and crawlers
  const ua = navigator.userAgent.toLowerCase();
  if (BOT_PATTERNS.some(pattern => ua.includes(pattern))) {
    return true;
  }
  
  return false;
};

export const trackSocialMediaEvent = async ({ eventType, eventValue = 0, userId }: TrackEventParams) => {
  try {
    // Skip tracking for excluded contexts
    if (shouldExcludeFromTracking()) {
      return;
    }
    
    const sessionId = getSessionId();
    const { source, utmParams } = detectReferralSource();
    const deviceInfo = getDeviceInfo();

    const { error } = await supabase
      .from('social_media_analytics')
      .insert({
        session_id: sessionId,
        user_id: userId || null,
        referral_source: source,
        utm_source: utmParams.utm_source,
        utm_medium: utmParams.utm_medium,
        utm_campaign: utmParams.utm_campaign,
        utm_content: utmParams.utm_content,
        landing_page: window.location.pathname,
        event_type: eventType,
        event_value: eventValue,
        device_type: deviceInfo.device_type,
        browser_info: deviceInfo.browser_info,
      });

    if (error) {
      console.error('Error tracking social media event:', error);
    }
  } catch (error) {
    console.error('Error in trackSocialMediaEvent:', error);
  }
};

// Track initial page visit
export const trackPageVisit = () => {
  // Only track if not already tracked in this session
  const tracked = sessionStorage.getItem('sm_visit_tracked');
  if (!tracked) {
    trackSocialMediaEvent({ eventType: 'visit' });
    sessionStorage.setItem('sm_visit_tracked', 'true');
  }
};
