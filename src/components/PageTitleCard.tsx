import { Card } from "@/components/ui/card";

interface PageTitleCardProps {
  title: string;
}

export const PageTitleCard = ({ title }: PageTitleCardProps) => {
  return (
    <Card className="border-2 border-primary bg-gradient-to-r from-primary/5 to-primary/10 mb-6 sm:mb-8">
      <div className="p-4 sm:p-6 text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
          {title}
        </h1>
      </div>
    </Card>
  );
};
