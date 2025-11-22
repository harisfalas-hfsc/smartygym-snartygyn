import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSessionExpiry = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check session on mount
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        handleSessionExpired();
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' && !session) {
        handleSessionExpired();
      }
    });

    // Handle unhandled promise rejections
    const handleRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.message?.includes('JWT') || 
          event.reason?.message?.includes('session') ||
          event.reason?.message?.includes('Auth')) {
        handleSessionExpired();
      }
    };

    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  const handleSessionExpired = () => {
    const currentPath = window.location.pathname;
    
    // Don't show toast or redirect for public pages
    const publicPaths = ['/', '/auth', '/blog', '/about', '/contact', '/faq', '/shop'];
    if (publicPaths.some(path => currentPath.startsWith(path))) {
      return;
    }

    toast({
      title: 'Session Expired',
      description: 'Please log in again to continue.',
      variant: 'destructive',
    });

    // Store intended destination
    sessionStorage.setItem('returnUrl', currentPath);
    navigate('/auth', { replace: true });
  };
};
