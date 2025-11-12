import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface PageTitleCardProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  imageSrc?: string;
}

export const PageTitleCard = ({ title, subtitle, icon: Icon, imageSrc }: PageTitleCardProps) => {
  return (
    <Card className="border-2 border-primary bg-gradient-to-r from-primary/5 to-primary/10 mb-6 sm:mb-8">
      <div className="p-4 sm:p-6 text-center relative">
        {Icon && (
          <div className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2">
            <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          </div>
        )}
        {imageSrc && (
          <div className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 overflow-hidden w-10 h-10 sm:w-14 sm:h-14">
            <img src={imageSrc} alt="" className="h-full object-cover object-left scale-150" style={{ objectPosition: '25% center' }} />
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
      </div>
    </Card>
  );
};
