import { useEffect, useMemo, useState } from "react";
import { format, addDays } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, CheckCircle, RefreshCw, Trash2, ExternalLink, Edit, Shuffle, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { WorkoutEditDialog } from "./WorkoutEditDialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type PreviewRow = {
  date: string;
  bodyweight_workout_id: string | null;
  equipment_workout_id: string | null;
  recovery_workout_id: string | null;
  is_recovery_day: boolean;
  category: string | null;
  difficulty: string | null;
  difficulty_stars_min: number | null;
  difficulty_stars_max: number | null;
  status: "pending" | "approved" | "rejected";
  picked_by: string;
  picked_at: string;
  approved_at: string | null;
  notes: string | null;
};

const defaultTomorrow = () => format(addDays(new Date(), 1), "yyyy-MM-dd");

export const TomorrowWODPreviewDialog = ({ open, onOpenChange }: Props) => {
  const [targetDate, setTargetDate] = useState<string>(defaultTomorrow());
  const [preview, setPreview] = useState<PreviewRow | null>(null);
  const [workouts, setWorkouts] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [swapSlot, setSwapSlot] = useState<null | "bodyweight" | "equipment" | "recovery">(null);
  const [swapCandidates, setSwapCandidates] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);

  const slotIds = useMemo(() => {
    if (!preview) return [];
    return preview.is_recovery_day
      ? [{ slot: "recovery" as const, id: preview.recovery_workout_id }]
      : [
          { slot: "bodyweight" as const, id: preview.bodyweight_workout_id },
          { slot: "equipment" as const, id: preview.equipment_workout_id },
        ];
  }, [preview]);

  const load = async (autoPickIfEmpty = false) => {
    setLoading(true);
    setPreview(null);
    setWorkouts({});
    try {
      const { data, error } = await supabase
        .from("wod_tomorrow_preview")
        .select("*")
        .eq("date", targetDate)
        .maybeSingle();
      if (error) throw error;
      let row = data as PreviewRow | null;
      if (!row && autoPickIfEmpty) {
        const { data: res, error: invErr } = await supabase.functions.invoke("preview-tomorrow-wod", {
          body: { action: "preview", date: targetDate },
        });
        if (invErr) throw invErr;
        row = (res as any)?.preview as PreviewRow;
      }
      setPreview(row);
      if (row) await loadWorkouts(row);
    } catch (err: any) {
      toast.error("Failed to load preview", { description: err?.message || String(err) });
    } finally {
      setLoading(false);
    }
  };

  const loadWorkouts = async (row: PreviewRow) => {
    const ids = [row.bodyweight_workout_id, row.equipment_workout_id, row.recovery_workout_id].filter(Boolean) as string[];
    if (ids.length === 0) return;
    const { data } = await supabase
      .from("admin_workouts")
      .select("id, name, type, equipment, category, format, focus, difficulty, difficulty_stars, duration, image_url, price, main_workout, description, instructions, tips, is_visible, is_premium, is_free, stripe_product_id, stripe_price_id")
      .in("id", ids);
    const map: Record<string, any> = {};
    for (const w of data || []) map[w.id] = w;
    setWorkouts(map);
  };

  useEffect(() => {
    if (open) load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, targetDate]);

  const runAction = async (action: string, extra: Record<string, any> = {}, label = action) => {
    setBusy(label);
    try {
      const { data, error } = await supabase.functions.invoke("preview-tomorrow-wod", {
        body: { action, date: targetDate, ...extra },
      });
      if (error) throw error;
      const r: any = data;
      if (r && r.success === false) {
        toast.error(`${label} failed`, { description: r.error || (r.failures || []).join(" | ") });
      } else {
        toast.success(`${label} OK`);
      }
      await load(false);
      return r;
    } catch (err: any) {
      toast.error(`${label} failed`, { description: err?.message || String(err) });
    } finally {
      setBusy(null);
    }
  };

  const openSwap = async (slot: "bodyweight" | "equipment" | "recovery") => {
    if (!preview) return;
    setSwapSlot(slot);
    setSwapCandidates([]);
    let q = supabase
      .from("admin_workouts")
      .select("id, name, equipment, category, difficulty_stars, image_url")
      .eq("is_visible", true)
      .eq("is_premium", true)
      .eq("is_free", false)
      .eq("is_workout_of_day", false)
      .not("main_workout", "is", null)
      .ilike("image_url", "https://%")
      .order("name", { ascending: true })
      .limit(200);
    if (slot === "recovery") {
      q = q.eq("category", "RECOVERY");
    } else {
      if (preview.category) q = q.eq("category", preview.category);
      q = q.eq("equipment", slot === "bodyweight" ? "BODYWEIGHT" : "EQUIPMENT");
      if (preview.difficulty_stars_min && preview.difficulty_stars_max) {
        q = q
          .gte("difficulty_stars", preview.difficulty_stars_min)
          .lte("difficulty_stars", preview.difficulty_stars_max);
      }
    }
    const { data } = await q;
    setSwapCandidates(data || []);
  };

  const applySwap = async (workoutId: string) => {
    if (!swapSlot) return;
    await runAction("set", { slot: swapSlot, workoutId }, `Swap ${swapSlot}`);
    setSwapSlot(null);
  };

  const statusBadge = () => {
    if (!preview) return null;
    if (preview.status === "approved") return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Approved</Badge>;
    if (preview.status === "rejected") return <Badge variant="destructive">Rejected</Badge>;
    return <Badge variant="outline">Pending</Badge>;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" /> Tomorrow's WOD Preview
            </DialogTitle>
            <DialogDescription>
              Review, edit, swap, and approve the workouts pre-picked for any upcoming day.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-wrap items-end gap-3 mb-4">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Target date</label>
              <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="w-44" />
            </div>
            <Button variant="outline" size="sm" onClick={() => setTargetDate(defaultTomorrow())}>Tomorrow</Button>
            <Button variant="outline" size="sm" onClick={() => load(true)} disabled={loading}>
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Reload"}
            </Button>
            <div className="ml-auto flex items-center gap-2">{statusBadge()}</div>
          </div>

          {preview && (
            <div className="text-xs text-muted-foreground mb-3">
              {preview.category} • {preview.difficulty || "—"} • picked by <strong>{preview.picked_by}</strong> at {new Date(preview.picked_at).toLocaleString()}
              {preview.approved_at && <> • approved {new Date(preview.approved_at).toLocaleString()}</>}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-56" /> <Skeleton className="h-56" />
            </div>
          ) : !preview ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>No preview row for {targetDate}. Click "Re-pick" to generate one now.</AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {slotIds.map(({ slot, id }) => {
                const w = id ? workouts[id] : null;
                return (
                  <Card key={slot}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="uppercase">{slot}</Badge>
                        {w?.difficulty_stars && <span className="text-xs text-muted-foreground">{w.difficulty_stars}★</span>}
                      </div>
                      {!w ? (
                        <div className="text-sm text-muted-foreground py-6 text-center">
                          {id ? "Workout not found (deleted?)" : "Slot empty"}
                        </div>
                      ) : (
                        <>
                          {w.image_url && <img src={w.image_url} alt={w.name} className="w-full h-28 object-cover rounded-md" />}
                          <div>
                            <h4 className="font-semibold leading-tight">{w.name}</h4>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {w.category && <Badge variant="secondary" className="text-xs">{w.category}</Badge>}
                              {w.format && <Badge variant="outline" className="text-xs">{w.format}</Badge>}
                              {w.duration && <Badge variant="outline" className="text-xs">{w.duration}</Badge>}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1" asChild>
                              <a href={`/workout/${w.type || "wod"}/${w.id}`} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3 mr-1" /> View
                              </a>
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1" onClick={() => setEditing(w)}>
                              <Edit className="h-3 w-3 mr-1" /> Edit
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => openSwap(slot)}>
                              <Shuffle className="h-3 w-3" />
                            </Button>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <DialogFooter className="mt-4 gap-2 flex-wrap">
            <Button variant="outline" onClick={() => runAction("repick", {}, "Re-pick")} disabled={!!busy}>
              <RefreshCw className={`h-4 w-4 mr-1 ${busy === "Re-pick" ? "animate-spin" : ""}`} /> Re-pick automatically
            </Button>
            <Button variant="destructive" onClick={() => runAction("reject", {}, "Reject")} disabled={!!busy || !preview}>
              <Trash2 className="h-4 w-4 mr-1" /> Reject
            </Button>
            <Button
              onClick={() => runAction("approve", {}, "Approve")}
              disabled={!!busy || !preview || preview.status === "approved"}
            >
              <CheckCircle className="h-4 w-4 mr-1" /> Approve & publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Swap picker */}
      <Dialog open={!!swapSlot} onOpenChange={(o) => !o && setSwapSlot(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Swap {swapSlot} workout</DialogTitle>
            <DialogDescription>Pick any eligible library workout for this slot.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {swapCandidates.length === 0 ? (
              <p className="text-sm text-muted-foreground">No eligible candidates found.</p>
            ) : (
              swapCandidates.map((w) => (
                <div key={w.id} className="flex items-center gap-3 border rounded-md p-2">
                  {w.image_url && <img src={w.image_url} alt={w.name} className="w-14 h-14 object-cover rounded" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{w.name}</p>
                    <p className="text-xs text-muted-foreground">{w.equipment} • {w.category} • {w.difficulty_stars || "-"}★</p>
                  </div>
                  <Button size="sm" onClick={() => applySwap(w.id)}>Pick</Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <WorkoutEditDialog
        workout={editing}
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        onSave={() => {
          setEditing(null);
          if (preview) loadWorkouts(preview);
        }}
      />
    </>
  );
};