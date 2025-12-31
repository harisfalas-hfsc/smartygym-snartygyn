import { cn } from "@/lib/utils";

interface CategoryCountBadgeProps {
  count: number;
  className?: string;
  size?: "sm" | "md";
}

export const CategoryCountBadge = ({ 
  count, 
  className,
  size = "md" 
}: CategoryCountBadgeProps) => {
  if (count <= 0) return null;
  
  return (
    <div 
      className={cn(
        "absolute z-20 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center shadow-md border-2 border-background",
        size === "sm" ? "w-6 h-6 text-[10px] top-1.5 left-1.5" : "w-7 h-7 text-xs top-2 left-2",
        className
      )}
    >
      {count}
    </div>
  );
};
