interface MobilePhoneIllustrationProps {
  imageUrl?: string;
  className?: string;
  variant?: 'phone' | 'tablet';
  children?: React.ReactNode;
}

export const MobilePhoneIllustration = ({ imageUrl, className, variant = 'phone', children }: MobilePhoneIllustrationProps) => {
  return (
    <div className={`relative ${className}`}>
      {/* Tablet/Phone frame */}
      <div className={`relative h-full mx-auto border-foreground shadow-2xl bg-background overflow-hidden ${
        variant === 'tablet' 
          ? 'max-h-[480px] aspect-[4/3] border-[6px] rounded-[1.5rem]'
          : 'max-h-[480px] aspect-[9/19] border-[8px] rounded-[2.5rem]'
      }`}>
        {/* Notch - ONLY FOR PHONE */}
        {variant === 'phone' && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-foreground rounded-b-2xl z-10" />
        )}
        
        {/* Screen content */}
        <div className={`relative w-full h-full ${
          children ? (variant === 'tablet' ? 'p-3 pb-8' : 'p-3') : 'p-2 bg-gradient-to-br from-primary/10 to-background'
        }`}>
          {children ? (
            // Render children (workout cards)
            <div className="w-full h-full overflow-hidden">
              {children}
            </div>
          ) : imageUrl ? (
            <img 
              src={imageUrl} 
              alt={variant === 'tablet' ? 'SmartyGym Tablet Preview' : 'SmartyGym App Preview'}
              className={`w-full h-full object-cover ${
                variant === 'tablet' ? 'rounded-[1rem]' : 'rounded-[1.5rem]'
              }`}
            />
          ) : (
            // Default diagonal lines pattern
            <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5 ${
              variant === 'tablet' ? 'rounded-[1rem]' : 'rounded-[1.5rem]'
            }`}>
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
        
        {/* Home button indicator - ONLY FOR TABLET */}
        {variant === 'tablet' && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-3 h-3 bg-foreground rounded-full" />
        )}
        
        {/* Home button indicator - ONLY FOR PHONE */}
        {variant === 'phone' && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-foreground/30 rounded-full" />
        )}
      </div>
    </div>
  );
};
