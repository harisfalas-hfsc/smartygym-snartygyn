import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Sunrise, Sun, Moon } from "lucide-react";
import { HTMLContent } from "@/components/HTMLContent";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

interface Ritual {
  id: string;
  ritual_date: string;
  day_number: number;
  morning_content: string;
  midday_content: string;
  evening_content: string;
}

export const RitualArchive = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [selectedRitual, setSelectedRitual] = useState<Ritual | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch available ritual dates
  useEffect(() => {
    const fetchAvailableDates = async () => {
      const { data, error } = await supabase
        .from("daily_smarty_rituals")
        .select("ritual_date")
        .eq("is_visible", true)
        .order("ritual_date", { ascending: false });

      if (!error && data) {
        const dates = data.map(r => new Date(r.ritual_date + "T00:00:00"));
        setAvailableDates(dates);
      }
    };

    fetchAvailableDates();
  }, []);

  // Fetch ritual for selected date
  useEffect(() => {
    if (!selectedDate) {
      setSelectedRitual(null);
      return;
    }

    const fetchRitual = async () => {
      setLoading(true);
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      
      const { data, error } = await supabase
        .from("daily_smarty_rituals")
        .select("*")
        .eq("ritual_date", dateStr)
        .eq("is_visible", true)
        .maybeSingle();

      if (!error && data) {
        setSelectedRitual(data);
      } else {
        setSelectedRitual(null);
      }
      setLoading(false);
    };

    fetchRitual();
  }, [selectedDate]);

  // Check if a date has a ritual
  const hasRitual = (date: Date) => {
    return availableDates.some(d => 
      d.getFullYear() === date.getFullYear() &&
      d.getMonth() === date.getMonth() &&
      d.getDate() === date.getDate()
    );
  };

  // Custom modifier for dates with rituals
  const modifiers = {
    hasRitual: availableDates,
  };

  const modifiersStyles = {
    hasRitual: {
      backgroundColor: "hsl(var(--primary) / 0.2)",
      borderRadius: "50%",
    },
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 justify-center text-lg">
          <CalendarDays className="h-5 w-5 text-primary" />
          Ritual Archive
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Calendar */}
          <div className="flex justify-center lg:justify-start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              disabled={(date) => !hasRitual(date)}
              className="rounded-md border"
            />
          </div>

          {/* Selected Ritual Content */}
          <div className="flex-1">
            {!selectedDate && (
              <div className="text-center text-muted-foreground py-8">
                <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Select a date to view past rituals</p>
                <p className="text-sm mt-1">{availableDates.length} rituals available</p>
              </div>
            )}

            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            )}

            {selectedDate && !loading && !selectedRitual && (
              <div className="text-center text-muted-foreground py-8">
                <p>No ritual available for this date</p>
              </div>
            )}

            {selectedRitual && !loading && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 justify-center lg:justify-start">
                  <Badge variant="secondary" className="bg-primary text-primary-foreground">
                    Day {selectedRitual.day_number}
                  </Badge>
                  <span className="text-muted-foreground">
                    {format(new Date(selectedRitual.ritual_date), "MMMM d, yyyy")}
                  </span>
                </div>

                {/* Morning */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Sunrise className="h-4 w-4 text-orange-500" />
                    <span className="font-semibold text-sm">Morning</span>
                  </div>
                  <div className="pl-6 text-sm">
                    <HTMLContent content={selectedRitual.morning_content} />
                  </div>
                </div>

                <Separator />

                {/* Midday */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4 text-yellow-600" />
                    <span className="font-semibold text-sm">Midday</span>
                  </div>
                  <div className="pl-6 text-sm">
                    <HTMLContent content={selectedRitual.midday_content} />
                  </div>
                </div>

                <Separator />

                {/* Evening */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4 text-purple-600" />
                    <span className="font-semibold text-sm">Evening</span>
                  </div>
                  <div className="pl-6 text-sm">
                    <HTMLContent content={selectedRitual.evening_content} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
