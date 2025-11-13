import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface PageTitleCardProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  imageSrc?: string;
  children?: React.ReactNode;
}

export const PageTitleCard = ({ title, subtitle, icon: Icon, imageSrc, children }: PageTitleCardProps) => {
  return (
    <Card className="border-2 border-primary bg-gradient-to-r from-primary/5 to-primary/10 mb-6 sm:mb-8">
      <div className={`p-4 sm:p-6 text-center relative ${Icon || imageSrc ? 'pl-14 sm:pl-20' : ''}`}>
        {Icon && (
          <div className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2">
            <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          </div>
        )}
        {imageSrc && (
          <div className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2">
            <img src={imageSrc} alt="" className="w-8 h-8 sm:w-12 sm:h-12 object-contain" />
          </div>
        )}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            {subtitle}
          </p>
        )}
        {children && (
          <div className="mt-3">
            {children}
          </div>
        )}
      </div>
    </Card>
  );
};
