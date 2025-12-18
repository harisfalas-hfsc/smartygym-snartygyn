import { ReactNode } from "react";

interface VideoBrandingOverlayProps {
  tagline: string;
  children: ReactNode;
}

export const VideoBrandingOverlay = ({ tagline, children }: VideoBrandingOverlayProps) => {
  return (
    <div className="relative w-full h-full bg-gradient-to-b from-background via-background to-background/95">
      {/* Persistent Top Branding - Logo */}
      <div className="absolute top-4 left-0 right-0 z-40 flex flex-col items-center">
        <img 
          src="/lovable-uploads/0debe816-5446-4e2c-a99b-0ec9dfe42108.png" 
          alt="SmartyGym Logo" 
          className="h-12 w-auto object-contain"
        />
        {/* Tagline below logo */}
        <p className="mt-2 text-sm font-medium text-primary tracking-wide text-center px-4">
          {tagline}
        </p>
      </div>

      {/* Scene Content Area - Middle section for animations */}
      <div className="absolute inset-0 pt-24 pb-12 flex items-center justify-center">
        {children}
      </div>

      {/* Persistent Bottom Branding - Website */}
      <div className="absolute bottom-4 left-0 right-0 z-40 flex justify-center">
        <span className="text-xs font-semibold text-foreground/80 tracking-widest uppercase">
          smartygym.com
        </span>
      </div>
    </div>
  );
};
