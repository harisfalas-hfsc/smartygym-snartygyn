import { WifiOff, Wifi } from "lucide-react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useEffect, useState } from "react";

interface OfflineBannerProps {
  showReconnectedMessage?: boolean;
}

export function OfflineBanner({ showReconnectedMessage = true }: OfflineBannerProps) {
  const { isOffline, wasOffline, clearWasOffline } = useNetworkStatus();
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (!isOffline && wasOffline && showReconnectedMessage) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        clearWasOffline();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOffline, wasOffline, clearWasOffline, showReconnectedMessage]);

  if (!isOffline && !showReconnected) {
    return null;
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[100] px-4 py-2 text-center text-sm font-medium transition-all duration-300 ${
        isOffline 
          ? "bg-destructive text-destructive-foreground" 
          : "bg-primary text-primary-foreground"
      }`}
    >
      <div className="flex items-center justify-center gap-2">
        {isOffline ? (
          <>
            <WifiOff className="h-4 w-4" />
            <span>You're offline — Some features may be limited</span>
          </>
        ) : (
          <>
            <Wifi className="h-4 w-4" />
            <span>Back online!</span>
          </>
        )}
      </div>
    </div>
  );
}
