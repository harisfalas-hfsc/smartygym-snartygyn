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
      itemScope
      itemType="https://schema.org/Service"
      onClick={onClick}
      className="p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-primary hover:-translate-y-1 bg-card border-border group"
      role="button"
      aria-label={`${title} - Online fitness service at SmartyGym by Haris Falas - smartygym.com`}
      data-service-type={title.toLowerCase().replace(/\s+/g, '-')}
      data-keywords="smarty gym, online gym, online fitness, smartygym.com, Haris Falas"
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <div 
          className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110"
          aria-hidden="true"
        >
          <Icon className="w-8 h-8 text-primary transition-transform duration-300 group-hover:scale-110" />
        </div>
        <div>
          <h3 
            className="font-semibold text-lg mb-2 transition-colors duration-300 group-hover:text-primary"
            itemProp="name"
          >
            {title}
          </h3>
          <p 
            className="text-sm text-muted-foreground"
            itemProp="description"
          >
            {description}
          </p>
          <meta itemProp="provider" content="SmartyGym - smartygym.com" />
          <meta itemProp="serviceType" content="Online Fitness" />
          <meta itemProp="areaServed" content="Worldwide" />
        </div>
      </div>
    </Card>
  );
};
