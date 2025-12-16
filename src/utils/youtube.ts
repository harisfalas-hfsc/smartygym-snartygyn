/**
 * Extract YouTube video ID from various URL formats
 */
export const extractYouTubeId = (url: string): string | null => {
  if (!url) return null;
  
  // Handle various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};

/**
 * Get YouTube thumbnail URL from video ID
 */
export const getYouTubeThumbnail = (videoId: string, quality: 'default' | 'mq' | 'hq' | 'sd' | 'maxres' = 'mq'): string => {
  const qualityMap = {
    default: 'default',
    mq: 'mqdefault',
    hq: 'hqdefault',
    sd: 'sddefault',
    maxres: 'maxresdefault'
  };
  
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
};

/**
 * Get restricted YouTube embed URL (no related videos, minimal branding)
 */
export const getRestrictedEmbedUrl = (videoId: string, autoplay: boolean = true): string => {
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    controls: '1',
    showinfo: '0',
    autoplay: autoplay ? '1' : '0',
    enablejsapi: '1'
  });
  
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
};

/**
 * Validate if a string is a valid YouTube URL
 */
export const isValidYouTubeUrl = (url: string): boolean => {
  return extractYouTubeId(url) !== null;
};
