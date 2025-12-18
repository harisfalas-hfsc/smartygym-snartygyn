import { ReactNode } from "react";
import smartyGymLogo from "@/assets/smarty-gym-logo.png";

interface VideoBrandingOverlayProps {
  tagline: string;
  children: ReactNode;
}

export const VideoBrandingOverlay = ({ tagline, children }: VideoBrandingOverlayProps) => {
  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border-[3px] border-primary bg-gradient-to-b from-background via-primary/5 to-background">
      {/* Top Branding - Large Logo */}
      <div className="absolute top-6 left-0 right-0 z-40 flex flex-col items-center">
        <img
          src={smartyGymLogo}
          alt="SmartyGym logo"
          className="h-20 w-auto object-contain drop-shadow-lg"
        />
        {/* Tagline below logo */}
        <p className="mt-3 text-base font-extrabold text-primary tracking-wider text-center px-6 uppercase">
          {tagline}
        </p>
      </div>

      {/* Scene Content Area - Middle section for animations */}
      <div className="absolute inset-0 pt-36 pb-16 flex items-center justify-center px-5">
        {children}
      </div>

      {/* Bottom Branding - Website */}
      <div className="absolute bottom-6 left-0 right-0 z-40 flex justify-center">
        <span className="text-base font-extrabold text-primary tracking-widest uppercase">
          smartygym.com
        </span>
      </div>
    </div>
  );
};

