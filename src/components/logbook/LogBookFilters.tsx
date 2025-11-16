import { Button } from "@/components/ui/button";
import { Dumbbell, Calendar, User, Calculator } from "lucide-react";

type FilterType = 'all' | 'workout' | 'program' | 'tool';

interface LogBookFiltersProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export const LogBookFilters = ({ activeFilter, onFilterChange }: LogBookFiltersProps) => {
  const filters = [
    { value: 'all' as FilterType, label: 'All Activity', icon: null },
    { value: 'workout' as FilterType, label: 'Workouts', icon: Dumbbell },
    { value: 'program' as FilterType, label: 'Programs', icon: Calendar },
    { value: 'tool' as FilterType, label: 'Tools', icon: Calculator },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map(filter => {
        const Icon = filter.icon;
        return (
          <Button
            key={filter.value}
            variant={activeFilter === filter.value ? 'default' : 'outline'}
            onClick={() => onFilterChange(filter.value)}
            className="flex items-center gap-2"
          >
            {Icon && <Icon className="h-4 w-4" />}
            {filter.label}
          </Button>
        );
      })}
    </div>
  );
};
