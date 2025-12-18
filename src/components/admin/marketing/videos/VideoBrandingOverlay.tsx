import { ReactNode } from "react";
import smartyGymLogo from "@/assets/smarty-gym-logo.png";

interface VideoBrandingOverlayProps {
  tagline: string;
  children: ReactNode;
}

export const VideoBrandingOverlay = ({ tagline, children }: VideoBrandingOverlayProps) => {
  return (
    <div className="relative w-full h-full bg-gradient-to-b from-primary/5 via-background to-primary/10">
      {/* Card wrapper with light blue border */}
      <div className="absolute inset-2 border-2 border-primary/60 rounded-2xl overflow-hidden bg-background/95">
        {/* Persistent Top Branding - Logo */}
        <div className="absolute top-3 left-0 right-0 z-40 flex flex-col items-center">
          <img 
            src={smartyGymLogo} 
            alt="SmartyGym Logo" 
            className="h-10 w-auto object-contain"
          />
          {/* Tagline below logo */}
          <p className="mt-1.5 text-xs font-semibold text-primary tracking-wide text-center px-3 leading-tight">
            {tagline}
          </p>
        </div>

        {/* Scene Content Area - Middle section for animations */}
        <div className="absolute inset-0 pt-20 pb-10 flex items-center justify-center">
          {children}
        </div>

        {/* Persistent Bottom Branding - Website */}
        <div className="absolute bottom-3 left-0 right-0 z-40 flex justify-center">
          <span className="text-[10px] font-bold text-primary tracking-widest uppercase">
            smartygym.com
          </span>
        </div>
      </div>
    </div>
  );
};
