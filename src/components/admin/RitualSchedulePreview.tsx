import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Calendar, Edit2, Shuffle, Clock, Sparkles, Loader2, Eye, Pencil } from "lucide-react";
import { format, addDays } from "date-fns";
import { RitualSwapDialog } from "./RitualSwapDialog";
import { RitualViewDialog } from "./RitualViewDialog";
import { RitualEditDialog } from "./RitualEditDialog";

const WINDOW = 7;

const stripHtml = (html: string) => {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
};
const truncate = (s: string, n = 90) => {
  const t = stripHtml(s);
  return t.length > n ? t.slice(0, n) + "…" : t;
};

export const RitualSchedulePreview = () => {
  const queryClient = useQueryClient();
  const [swapDate, setSwapDate] = useState<string | null>(null);
  const [rerollingDate, setRerollingDate] = useState<string | null>(null);
  const [viewRitual, setViewRitual] = useState<any>(null);
  const [viewDate, setViewDate] = useState<string | null>(null);
  const [editRitual, setEditRitual] = useState<any>(null);

  const today = format(new Date(), "yyyy-MM-dd");
  const end = format(addDays(new Date(), WINDOW), "yyyy-MM-dd");

  const { data: schedule, isLoading } = useQuery({
    queryKey: ["ritual-schedule", today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_ritual_assignments")
        .select("ritual_date, cycle_number, ritual_id, daily_smarty_rituals(*)")
        .gte("ritual_date", today)
        .lte("ritual_date", end)
        .order("ritual_date", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const handleReroll = async (date: string) => {
    setRerollingDate(date);
    try {
      const { error } = await supabase.functions.invoke("assign-daily-ritual", {
        body: { action: "reroll", date },
      });
      if (error) throw error;
      toast.success("Ritual re-rolled", { description: `New random pick for ${date}` });
      queryClient.invalidateQueries({ queryKey: ["ritual-schedule"] });
      queryClient.invalidateQueries({ queryKey: ["ritual-today"] });
    } catch (e: any) {
      toast.error("Re-roll failed", { description: e?.message || String(e) });
    } finally {
      setRerollingDate(null);
    }
  };

  const handleTopup = async () => {
    try {
      const { error } = await supabase.functions.invoke("assign-daily-ritual", { body: { action: "topup" } });
      if (error) throw error;
      toast.success("Schedule refreshed");
      queryClient.invalidateQueries({ queryKey: ["ritual-schedule"] });
    } catch (e: any) {
      toast.error("Refresh failed", { description: e?.message || String(e) });
    }
  };

  const days = Array.from({ length: WINDOW + 1 }, (_, i) => {
    const d = addDays(new Date(), i);
    const ds = format(d, "yyyy-MM-dd");
    const row = schedule?.find((r: any) => r.ritual_date === ds);
    return { date: d, dateStr: ds, row };
  });

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-primary" />
                Upcoming Ritual Schedule (Next 7 Days)
              </CardTitle>
              <CardDescription>
                Library rotation — each ritual appears once per full cycle before repeating. Swap or re-roll any day.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleTopup}>
              <Sparkles className="h-4 w-4 mr-2" />
              Refresh Schedule
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            days.map(({ date, dateStr, row }) => {
              const ritual: any = (row as any)?.daily_smarty_rituals;
              const isToday = dateStr === today;
              return (
                <div
                  key={dateStr}
                  className={`p-4 rounded-lg border ${isToday ? "border-primary/50 bg-primary/5" : "border-border"}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">{format(date, "EEEE, MMM d")}</span>
                        {isToday && (
                          <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">Today</Badge>
                        )}
                        {ritual ? (
                          <>
                            <Badge variant="outline" className="text-xs">Ritual {ritual.day_number}</Badge>
                            <Badge variant="secondary" className="text-xs">
                              Cycle {(row as any).cycle_number}
                            </Badge>
                          </>
                        ) : (
                          <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30 text-xs">
                            Not assigned
                          </Badge>
                        )}
                      </div>
                      {ritual && (
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div><span className="font-medium text-foreground">Morning:</span> {truncate(ritual.morning_content)}</div>
                          <div><span className="font-medium text-foreground">Midday:</span> {truncate(ritual.midday_content)}</div>
                          <div><span className="font-medium text-foreground">Evening:</span> {truncate(ritual.evening_content)}</div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {ritual && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setViewRitual(ritual); setViewDate(dateStr); }}
                            title="View"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditRitual(ritual)}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReroll(dateStr)}
                        disabled={rerollingDate === dateStr}
                      >
                        {rerollingDate === dateStr ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Shuffle className="h-4 w-4 mr-1" />
                        )}
                        Re-roll
                      </Button>
                      <Button variant="default" size="sm" onClick={() => setSwapDate(dateStr)}>
                        <Edit2 className="h-4 w-4 mr-1" />
                        Swap
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <p className="text-xs text-muted-foreground pt-2">
            <Clock className="h-3 w-3 inline mr-1" />
            Auto top-up runs daily at 00:05 Cyprus. Window covers today + next 7 days.
          </p>
        </CardContent>
      </Card>

      <RitualSwapDialog
        open={!!swapDate}
        onOpenChange={(o) => !o && setSwapDate(null)}
        date={swapDate}
        onSwapped={() => {
          queryClient.invalidateQueries({ queryKey: ["ritual-schedule"] });
          queryClient.invalidateQueries({ queryKey: ["ritual-today"] });
          setSwapDate(null);
        }}
      />

      <RitualViewDialog
        open={!!viewRitual}
        onOpenChange={(o) => { if (!o) { setViewRitual(null); setViewDate(null); } }}
        ritual={viewRitual}
        contextDate={viewDate}
      />

      <RitualEditDialog
        open={!!editRitual}
        onOpenChange={(o) => !o && setEditRitual(null)}
        ritual={editRitual}
        onSave={() => {
          setEditRitual(null);
          queryClient.invalidateQueries({ queryKey: ["ritual-schedule"] });
          queryClient.invalidateQueries({ queryKey: ["ritual-today"] });
        }}
      />
    </>
  );
};