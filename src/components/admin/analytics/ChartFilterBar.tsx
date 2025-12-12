import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Download } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ChartFilterBarProps {
  timeFilter: string;
  onTimeFilterChange: (value: string) => void;
  customStartDate?: Date;
  onStartDateChange?: (date: Date | undefined) => void;
  customEndDate?: Date;
  onEndDateChange?: (date: Date | undefined) => void;
  additionalFilters?: React.ReactNode;
  onExport?: () => void;
  showExport?: boolean;
  className?: string;
}

export function ChartFilterBar({
  timeFilter,
  onTimeFilterChange,
  customStartDate,
  onStartDateChange,
  customEndDate,
  onEndDateChange,
  additionalFilters,
  onExport,
  showExport = true,
  className,
}: ChartFilterBarProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2 mb-4 p-3 bg-muted/30 rounded-lg", className)}>
      <Select value={timeFilter} onValueChange={onTimeFilterChange}>
        <SelectTrigger className="w-[140px] h-9 text-sm">
          <SelectValue placeholder="Time Period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7">7 Days</SelectItem>
          <SelectItem value="30">30 Days</SelectItem>
          <SelectItem value="90">90 Days</SelectItem>
          <SelectItem value="180">6 Months</SelectItem>
          <SelectItem value="365">1 Year</SelectItem>
          <SelectItem value="custom">Custom</SelectItem>
        </SelectContent>
      </Select>

      {timeFilter === "custom" && (
        <>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 text-sm">
                <CalendarIcon className="mr-2 h-3 w-3" />
                {customStartDate ? format(customStartDate, "MMM d, yyyy") : "Start"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={customStartDate}
                onSelect={onStartDateChange}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          <span className="text-muted-foreground text-sm">to</span>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 text-sm">
                <CalendarIcon className="mr-2 h-3 w-3" />
                {customEndDate ? format(customEndDate, "MMM d, yyyy") : "End"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={customEndDate}
                onSelect={onEndDateChange}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </>
      )}

      {additionalFilters}

      {showExport && onExport && (
        <Button variant="ghost" size="sm" onClick={onExport} className="ml-auto h-9">
          <Download className="h-3 w-3 mr-1" />
          Export
        </Button>
      )}
    </div>
  );
}
