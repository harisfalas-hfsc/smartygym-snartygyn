import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Check } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string | null;
  onSwapped?: () => void;
}

const stripHtml = (html: string) => {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
};

export const RitualSwapDialog = ({ open, onOpenChange, date, onSwapped }: Props) => {
  const [rituals, setRituals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [currentId, setCurrentId] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !date) return;
    (async () => {
      setLoading(true);
      try {
        const [{ data: lib }, { data: assigned }] = await Promise.all([
          supabase.from("daily_smarty_rituals").select("*").order("day_number", { ascending: true }),
          supabase.from("daily_ritual_assignments").select("ritual_id").eq("ritual_date", date).maybeSingle(),
        ]);
        setRituals(lib || []);
        setCurrentId(assigned?.ritual_id ?? null);
      } finally {
        setLoading(false);
      }
    })();
  }, [open, date]);

  const filtered = useMemo(() => {
    if (!search.trim()) return rituals;
    const q = search.toLowerCase();
    return rituals.filter((r) => {
      if (String(r.day_number).includes(q)) return true;
      const all = stripHtml(`${r.morning_content || ""} ${r.midday_content || ""} ${r.evening_content || ""}`).toLowerCase();
      return all.includes(q);
    });
  }, [rituals, search]);

  const handlePick = async (ritualId: string) => {
    if (!date) return;
    setBusyId(ritualId);
    try {
      const { error } = await supabase.functions.invoke("assign-daily-ritual", {
        body: { action: "swap", date, ritual_id: ritualId },
      });
      if (error) throw error;
      toast.success("Ritual swapped", { description: `Set for ${date}` });
      onSwapped?.();
    } catch (e: any) {
      toast.error("Swap failed", { description: e?.message || String(e) });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Swap Ritual for {date}</DialogTitle>
          <DialogDescription>
            Pick any ritual from the library. The chosen ritual will replace the current pick for this date.
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by day # or content…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No rituals match.</p>
          ) : (
            filtered.map((r) => {
              const isCurrent = r.id === currentId;
              return (
                <div
                  key={r.id}
                  className={`p-3 rounded-lg border flex items-start justify-between gap-3 ${isCurrent ? "border-primary/50 bg-primary/5" : "border-border"}`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary">Day {r.day_number}</Badge>
                      {isCurrent && (
                        <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                          <Check className="h-3 w-3 mr-1" /> Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {stripHtml(r.morning_content || "").slice(0, 200)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={isCurrent ? "outline" : "default"}
                    disabled={busyId === r.id || isCurrent}
                    onClick={() => handlePick(r.id)}
                  >
                    {busyId === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : isCurrent ? "Active" : "Pick"}
                  </Button>
                </div>
              );
            })
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};