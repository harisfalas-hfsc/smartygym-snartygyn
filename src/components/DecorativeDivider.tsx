interface DecorativeDividerProps {
  className?: string;
}

export const DecorativeDivider = ({ className = "" }: DecorativeDividerProps) => {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/50 to-primary/20"></div>
      <div className="w-2 h-2 rounded-full bg-primary/60 shadow-[0_0_8px_rgba(var(--primary),0.4)]"></div>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent via-primary/50 to-primary/20"></div>
    </div>
  );
};
