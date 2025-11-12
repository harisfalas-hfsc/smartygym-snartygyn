import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
}

export const ServiceCard = ({ icon: Icon, title, description, onClick }: ServiceCardProps) => {
  return (
    <Card
      onClick={onClick}
      className="p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-gold hover:-translate-y-1 bg-card border-border group"
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
          <Icon className="w-8 h-8 text-primary transition-transform duration-300 group-hover:scale-110" />
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-2 transition-colors duration-300 group-hover:text-primary">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </Card>
  );
};
