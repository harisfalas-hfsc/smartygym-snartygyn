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
    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-2 border-primary/40 rounded-lg p-3 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Filter className="h-3.5 w-3.5 text-primary flex-shrink-0" />
        <span className="text-xs font-semibold uppercase tracking-wide text-primary">Filters</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {filters.map((filter) => (
          <div key={filter.name} className="flex flex-col gap-1 min-w-0">
            <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground truncate">
              {filter.name}
            </label>
            <Select value={filter.value} onValueChange={filter.onChange}>
              <SelectTrigger
                className={
                  (compact ? "h-8 text-xs" : "h-9 text-sm") +
                  " w-full min-w-0 bg-background/80 backdrop-blur-sm border-primary/30 hover:border-primary/50 transition-colors"
                }
              >
                <SelectValue placeholder={filter.placeholder || filter.name} />
              </SelectTrigger>
              <SelectContent className="bg-background border-primary/30 z-50 max-h-[60vh]">
                {filter.options.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="cursor-pointer hover:bg-primary/10 focus:bg-primary/20 text-sm"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </div>
  );
};
