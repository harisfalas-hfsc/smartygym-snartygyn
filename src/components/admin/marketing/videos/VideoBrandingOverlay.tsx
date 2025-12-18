import { ReactNode } from "react";
import smartyGymLogo from "@/assets/smarty-gym-logo.png";

interface VideoBrandingOverlayProps {
  tagline: string;
  children: ReactNode;
}

export const VideoBrandingOverlay = ({ tagline, children }: VideoBrandingOverlayProps) => {
  return (
    <div className="relative w-full h-full border-3 border-primary rounded-2xl overflow-hidden bg-gradient-to-b from-background via-primary/5 to-background">
      {/* Top Branding - Large Logo */}
      <div className="absolute top-4 left-0 right-0 z-40 flex flex-col items-center">
        <img 
          src={smartyGymLogo} 
          alt="SmartyGym Logo" 
          className="h-16 w-auto object-contain drop-shadow-lg"
        />
        {/* Tagline below logo */}
        <p className="mt-2 text-sm font-bold text-primary tracking-wider text-center px-4 uppercase">
          {tagline}
        </p>
      </div>

      {/* Scene Content Area - Middle section for animations */}
      <div className="absolute inset-0 pt-28 pb-12 flex items-center justify-center px-4">
        {children}
      </div>

      {/* Bottom Branding - Website */}
      <div className="absolute bottom-4 left-0 right-0 z-40 flex justify-center">
        <span className="text-sm font-bold text-primary tracking-widest uppercase">
          smartygym.com
        </span>
      </div>
    </div>
  );
};
