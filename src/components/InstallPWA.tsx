import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface InstallPWAProps {
  waitForPushPrompt?: boolean;
}

export const InstallPWA = ({ waitForPushPrompt = false }: InstallPWAProps) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if already installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                       (window.navigator as any).standalone === true;
    
    if (isInstalled) {
      return;
    }

    // Check if user dismissed the prompt recently
    const dismissedTime = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissedTime) {
      const timeSinceDismissed = Date.now() - parseInt(dismissedTime);
      // Show again after 24 hours
      if (timeSinceDismissed < 24 * 60 * 60 * 1000) {
        return;
      }
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show immediately if not waiting for push prompt
      if (!waitForPushPrompt) {
        setShowPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    // For iOS devices where beforeinstallprompt doesn't fire
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS && !isInstalled && !waitForPushPrompt) {
      setShowPrompt(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, [waitForPushPrompt]);

  // Listen for push prompt completion to show PWA prompt
  useEffect(() => {
    if (!waitForPushPrompt) return;

    const handlePushComplete = () => {
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone === true;
      if (!isInstalled && (deferredPrompt || /iPad|iPhone|iPod/.test(navigator.userAgent))) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('push-prompt-complete', handlePushComplete);
    return () => window.removeEventListener('push-prompt-complete', handlePushComplete);
  }, [waitForPushPrompt, deferredPrompt]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // For iOS or if prompt not available
      toast({
        title: "Install SmartyGym",
        description: "Tap the Share button and select 'Add to Home Screen'",
        duration: 5000,
      });
      setShowPrompt(false);
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === "accepted") {
        toast({
          title: "Success!",
          description: "SmartyGym has been installed",
        });
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error("Error installing PWA:", error);
      toast({
        title: "Installation",
        description: "Use your browser's menu to install SmartyGym",
        duration: 5000,
      });
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[90] md:left-auto md:right-4 md:max-w-sm animate-fade-in">
      <Card className="p-3 sm:p-4 shadow-lg border-2 border-primary/20 bg-card">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Download className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1">Install SmartyGym</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Get instant access to workouts, offline access, and a native app experience!
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={handleInstall}
                size="sm"
                className="flex-1"
              >
                Install App
              </Button>
              <Button 
                onClick={handleDismiss}
                size="sm"
                variant="ghost"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};