import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Dumbbell, Trophy, Calculator, X } from "lucide-react";
import { Button } from "./ui/button";

export const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      label: "Browse Workouts",
      icon: Dumbbell,
      path: "/workouts",
      color: "from-primary to-primary/80",
    },
    {
      label: "View Programs",
      icon: Trophy,
      path: "/programs",
      color: "from-secondary to-secondary/80",
    },
    {
      label: "Fitness Tools",
      icon: Calculator,
      path: "/tools",
      color: "from-accent to-accent/80",
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Action buttons */}
      {isOpen && (
        <div className="flex flex-col gap-2 animate-fade-in">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.path}
                to={action.path}
                onClick={() => setIsOpen(false)}
                className="group flex items-center gap-3 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="bg-background/95 backdrop-blur-sm px-3 py-2 rounded-lg text-sm font-medium shadow-lg border border-border opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {action.label}
                </span>
                <Button
                  size="icon"
                  className={`h-12 w-12 rounded-full shadow-gold hover:scale-110 transition-all bg-gradient-to-r ${action.color}`}
                >
                  <Icon className="h-5 w-5" />
                </Button>
              </Link>
            );
          })}
        </div>
      )}

      {/* Main FAB button */}
      <Button
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className={`h-14 w-14 rounded-full shadow-gold hover:scale-110 transition-all bg-gradient-to-r from-primary via-primary to-primary/90 ${
          isOpen ? "rotate-45" : ""
        }`}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </Button>
    </div>
  );
};
