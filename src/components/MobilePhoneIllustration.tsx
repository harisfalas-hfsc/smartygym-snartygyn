interface MobilePhoneIllustrationProps {
  imageUrl?: string;
  className?: string;
}

export const MobilePhoneIllustration = ({ imageUrl, className }: MobilePhoneIllustrationProps) => {
  return (
    <div className={`relative ${className}`}>
      {/* Phone frame */}
      <div className="relative h-full max-h-[480px] mx-auto aspect-[9/19] border-[8px] border-foreground rounded-[2.5rem] shadow-2xl bg-background overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-foreground rounded-b-2xl z-10" />
        
        {/* Screen content */}
        <div className="relative w-full h-full p-2 bg-gradient-to-br from-primary/10 to-background">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt="SmartyGym App Preview" 
              className="w-full h-full object-cover rounded-[1.5rem]"
            />
          ) : (
            // Default diagonal lines pattern
            <div className="w-full h-full flex items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-primary/20 to-primary/5">
              <div className="space-y-3 w-full px-4">
                <div className="h-2 bg-primary/40 rounded-full w-3/4 transform -rotate-12" />
                <div className="h-2 bg-primary/30 rounded-full w-full transform -rotate-12" />
                <div className="h-2 bg-primary/40 rounded-full w-5/6 transform -rotate-12" />
                <div className="h-2 bg-primary/30 rounded-full w-full transform -rotate-12" />
                <div className="h-2 bg-primary/40 rounded-full w-4/5 transform -rotate-12" />
              </div>
            </div>
          )}
        </div>
        
        {/* Home button indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-foreground/30 rounded-full" />
      </div>
    </div>
  );
};
