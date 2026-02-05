import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";

interface FilterOption {
  value: string;
  label: string;
}

interface CompactFiltersProps {
  filters: {
    name: string;
    value: string;
    onChange: (value: string) => void;
    options: FilterOption[];
    placeholder?: string;
  }[];
  /** Use compact layout for mobile - smaller selects, inline layout */
  compact?: boolean;
}

export const CompactFilters = ({ filters, compact = false }: CompactFiltersProps) => {
  return (
    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-2 border-primary/40 rounded-lg p-3 sm:p-4">
      {compact ? (
        // Compact layout: Label on top, filters in a row below
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1 text-xs font-semibold text-foreground">
            <Filter className="h-3 w-3 text-primary" />
            <span>Filters:</span>
          </div>
          <div className="flex items-center gap-2">
            {filters.map((filter) => (
              <Select
                key={filter.name}
                value={filter.value}
                onValueChange={filter.onChange}
              >
                <SelectTrigger className="flex-1 min-w-0 h-8 text-xs bg-background/80 backdrop-blur-sm border-primary/30 hover:border-primary/50 transition-colors">
                  <SelectValue placeholder={filter.placeholder || filter.name} />
                </SelectTrigger>
                <SelectContent className="bg-background border-primary/30 z-50">
                  {filter.options.map((option) => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value}
                      className="cursor-pointer hover:bg-primary/10 focus:bg-primary/20"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
          </div>
        </div>
      ) : (
        // Standard layout: All inline
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-semibold text-foreground">
            <Filter className="h-4 w-4 text-primary" />
            <span>Filters:</span>
          </div>
          {filters.map((filter) => (
            <Select
              key={filter.name}
              value={filter.value}
              onValueChange={filter.onChange}
            >
              <SelectTrigger className="w-[140px] sm:w-[160px] h-9 bg-background/80 backdrop-blur-sm border-primary/30 hover:border-primary/50 transition-colors">
                <SelectValue placeholder={filter.placeholder || filter.name} />
              </SelectTrigger>
              <SelectContent className="bg-background border-primary/30 z-50">
                {filter.options.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    className="cursor-pointer hover:bg-primary/10 focus:bg-primary/20"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>
      )}
    </div>
  );
};
