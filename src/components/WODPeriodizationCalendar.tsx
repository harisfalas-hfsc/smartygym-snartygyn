import { format, subDays, addDays } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getWODInfoForDate, getDifficultyBadgeClass, getDifficultyBorderClass } from "@/lib/wodCycle";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

const TIMEZONE = "Europe/Athens";

/**
 * Compact Periodization Calendar - 84-Day Cycle
 * Shows Yesterday, Today, Tomorrow with category and difficulty level
 * Uses Europe/Athens timezone to match backend WOD generation
 */
const WODPeriodizationCalendar = () => {
  const now = new Date();
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(1); // Start on Today (index 1)
  
  // Get today's date in Cyprus timezone (Europe/Athens)
  const todayStr = formatInTimeZone(now, TIMEZONE, "yyyy-MM-dd");
  const today = new Date(todayStr + "T00:00:00Z");
  const yesterday = subDays(today, 1);
  const tomorrow = addDays(today, 1);

  const yesterdayStr = format(yesterday, "yyyy-MM-dd");
  const tomorrowStr = format(tomorrow, "yyyy-MM-dd");

  const yesterdayInfo = getWODInfoForDate(yesterdayStr);
  const todayInfo = getWODInfoForDate(todayStr);
  const tomorrowInfo = getWODInfoForDate(tomorrowStr);

  // Carousel state management - start on Today
  useEffect(() => {
    if (!carouselApi) return;
    
    // Start on Today (index 1)
    carouselApi.scrollTo(1, false);
    
    const onSelect = () => {
      setCurrentSlide(carouselApi.selectedScrollSnap());
    };
    
    carouselApi.on("select", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  const renderDayCell = (
    label: string,
    dateStr: string,
    info: ReturnType<typeof getWODInfoForDate>,
    isToday: boolean = false
  ) => {
    const fullDate = format(new Date(dateStr), "EEEE, MMMM d");
    const borderColor = getDifficultyBorderClass(info.difficulty.level);

    return (
      <div
        className={`flex flex-col items-center p-2 rounded-md transition-all ${borderColor} ${
          isToday
            ? "bg-primary/10 border-2"
            : "bg-muted/30 border"
        }`}
      >
        {/* Day Label */}
        <div className="flex items-center gap-0.5">
          {label === "Yesterday" && <ChevronLeft className="w-2.5 h-2.5 text-muted-foreground" />}
          <span className={`text-[10px] font-medium ${isToday ? "text-primary" : "text-muted-foreground"}`}>
            {label}
          </span>
          {label === "Tomorrow" && <ChevronRight className="w-2.5 h-2.5 text-muted-foreground" />}
        </div>

        {/* Date */}
        <div className={`text-[9px] sm:text-xs font-semibold ${isToday ? "text-primary" : "text-foreground"}`}>
          {fullDate}
        </div>

        {/* Category */}
        <div className={`text-[10px] font-bold mt-1 text-center ${isToday ? "text-foreground" : "text-muted-foreground"}`}>
          {info.category}
        </div>

        {/* Difficulty Badge */}
        {info.isRecoveryDay ? (
          <Badge variant="outline" className="mt-1 text-[9px] px-1.5 py-0 bg-blue-500/10 text-blue-500 border-blue-400/30">
            All Levels
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className={`mt-1 text-[9px] px-1.5 py-0 ${getDifficultyBadgeClass(info.difficulty.level)}`}
          >
            {info.difficulty.level}
          </Badge>
        )}
      </div>
    );
  };

  const days = [
    { label: "Yesterday", dateStr: yesterdayStr, info: yesterdayInfo, isToday: false },
    { label: "Today", dateStr: todayStr, info: todayInfo, isToday: true },
    { label: "Tomorrow", dateStr: tomorrowStr, info: tomorrowInfo, isToday: false },
  ];

  return (
    <Card className="mb-4 border-border/50 bg-gradient-to-r from-muted/20 via-background to-muted/20">
      <CardContent className="p-2 sm:p-3">
        {/* Desktop/Tablet: 3-Column Grid */}
        <div className="hidden md:grid grid-cols-3 gap-1.5 sm:gap-2">
          {renderDayCell("Yesterday", yesterdayStr, yesterdayInfo)}
          {renderDayCell("Today", todayStr, todayInfo, true)}
          {renderDayCell("Tomorrow", tomorrowStr, tomorrowInfo)}
        </div>

        {/* Mobile: Carousel */}
        <div className="md:hidden">
          <Carousel
            className="w-full"
            opts={{
              align: "center",
              loop: false,
              startIndex: 1,
            }}
            setApi={setCarouselApi}
          >
            <CarouselContent className="-ml-2">
              {days.map((day, index) => (
                <CarouselItem key={index} className="pl-2 basis-full">
                  {renderDayCell(day.label, day.dateStr, day.info, day.isToday)}
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-2 mt-3">
            {days.map((day, index) => (
              <button
                key={index}
                onClick={() => carouselApi?.scrollTo(index)}
                className={cn(
                  "w-2.5 h-2.5 rounded-full border-2 transition-all duration-300",
                  currentSlide === index
                    ? "border-primary bg-transparent scale-125"
                    : "border-primary/40 bg-transparent hover:border-primary/60"
                )}
                aria-label={`Go to ${day.label}`}
              />
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2 text-[9px]">
          <div className="flex items-center gap-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
            <span className="text-muted-foreground">Beginner</span>
          </div>
          <div className="flex items-center gap-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-muted-foreground">Intermediate</span>
          </div>
          <div className="flex items-center gap-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span className="text-muted-foreground">Advanced</span>
          </div>
          <div className="flex items-center gap-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">Recovery</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WODPeriodizationCalendar;
