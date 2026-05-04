import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Beaker, Loader2, AlertTriangle, CheckCircle2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  "STRENGTH",
  "CALORIE BURNING",
  "METABOLIC",
  "CARDIO",
  "MOBILITY & STABILITY",
  "CHALLENGE",
  "PILATES",
] as const;

const FORMATS_BY_CATEGORY: Record<string, string[]> = {
  STRENGTH: ["REPS & SETS"],
  "MOBILITY & STABILITY": ["REPS & SETS"],
  PILATES: ["REPS & SETS"],
  "CALORIE BURNING": ["CIRCUIT", "AMRAP", "EMOM", "TABATA"],
  METABOLIC: ["CIRCUIT", "AMRAP", "EMOM", "TABATA"],
  CARDIO: ["CIRCUIT", "AMRAP", "EMOM", "FOR TIME"],
  CHALLENGE: ["AMRAP", "FOR TIME", "EMOM", "TABATA"],
};

interface TestGenerateWODDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TestResult {
  success: boolean;
  workouts?: Array<{ id: string; name: string; equipment: string }>;
  failed?: string[];
  error?: string;
}

export const TestGenerateWODDialog = ({ open, onOpenChange }: TestGenerateWODDialogProps) => {
  const [category, setCategory] = useState<string>("STRENGTH");
  const [stars, setStars] = useState<number>(5);
  const [equipment, setEquipment] = useState<"BODYWEIGHT" | "EQUIPMENT" | "VARIOUS">("EQUIPMENT");
  const [format, setFormat] = useState<string>("REPS & SETS");
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  const formats = FORMATS_BY_CATEGORY[category] || ["CIRCUIT"];

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    const fmts = FORMATS_BY_CATEGORY[cat] || ["CIRCUIT"];
    setFormat(fmts[0]);
  };

  const handleRun = async () => {
    setIsRunning(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("generate-workout-of-day", {
        body: {
          background: false,
          testMode: true,
          triggerSource: "admin-test",
          forceCategory: category,
          forceDifficultyStars: stars,
          forceEquipment: equipment,
          forceFormat: format,
        },
      });

      if (error) {
        setResult({ success: false, error: error.message });
        toast.error("Test generation failed", { description: error.message });
        return;
      }

      const success = data?.success === true && Array.isArray(data?.workouts) && data.workouts.length > 0;
      setResult({
        success,
        workouts: data?.workouts || [],
        failed: data?.failed || [],
        error: success ? undefined : "Generator did not return a successful workout",
      });

      if (success) {
        toast.success("Test WOD generated", {
          description: `${data.workouts[0].name} — open the workout below to inspect.`,
        });
      } else {
        toast.error("Test WOD generation incomplete", {
          description: `Failed slots: ${(data?.failed || []).join(", ") || "unknown"}`,
        });
      }
    } catch (e: any) {
      setResult({ success: false, error: e?.message || String(e) });
      toast.error("Test generation crashed", { description: e?.message || String(e) });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Beaker className="h-5 w-5 text-primary" />
            Test WOD generation (no publish)
          </DialogTitle>
          <DialogDescription>
            Runs the real generation pipeline with forced parameters. The result is saved as a hidden-from-WOD workout
            tagged <code>[TEST]</code> in the admin library. It does <strong>not</strong> replace today's WOD and does
            <strong> not</strong> trigger notifications.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 overflow-y-auto flex-1 min-h-0">
          <Alert className="border-yellow-500/40 bg-yellow-500/10">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <AlertTitle>Diagnostic tool</AlertTitle>
            <AlertDescription>
              Use this to validate that a specific category/difficulty combination still passes the publish contract.
              Default settings reproduce the previous STRENGTH / Advanced / EQUIPMENT failure mode.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Difficulty (stars)</Label>
            <Select value={String(stars)} onValueChange={(v) => setStars(Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">★ 1 — Beginner</SelectItem>
                <SelectItem value="2">★★ 2 — Beginner</SelectItem>
                <SelectItem value="3">★★★ 3 — Intermediate</SelectItem>
                <SelectItem value="4">★★★★ 4 — Intermediate</SelectItem>
                <SelectItem value="5">★★★★★ 5 — Advanced</SelectItem>
                <SelectItem value="6">★★★★★★ 6 — Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Equipment</Label>
            <Select value={equipment} onValueChange={(v) => setEquipment(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="EQUIPMENT">EQUIPMENT</SelectItem>
                <SelectItem value="BODYWEIGHT">BODYWEIGHT</SelectItem>
                <SelectItem value="VARIOUS">VARIOUS (recovery)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {formats.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
            {(category === "STRENGTH" || category === "MOBILITY & STABILITY" || category === "PILATES") && (
              <p className="text-xs text-muted-foreground">
                This category is locked to <strong>REPS &amp; SETS</strong> by the generator regardless of selection.
              </p>
            )}
          </div>

          {result && (
            <Alert className={result.success ? "border-green-500/40 bg-green-500/10" : "border-red-500/40 bg-red-500/10"}>
              {result.success ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
              <AlertTitle>{result.success ? "Test passed" : "Test failed"}</AlertTitle>
              <AlertDescription className="space-y-2">
                {result.error && <div className="text-sm">{result.error}</div>}
                {result.failed && result.failed.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {result.failed.map((f) => <Badge key={f} variant="destructive">Failed: {f}</Badge>)}
                  </div>
                )}
                {result.workouts && result.workouts.length > 0 && (
                  <ul className="space-y-1 text-sm">
                    {result.workouts.map((w) => (
                      <li key={w.id} className="flex items-center justify-between gap-2 rounded bg-background/60 px-2 py-1">
                        <span className="truncate">{w.name}</span>
                        <a
                          className="inline-flex items-center gap-1 text-primary hover:underline whitespace-nowrap"
                          href={`/workouts/${w.id}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open <ExternalLink className="h-3 w-3" />
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isRunning}>Close</Button>
          <Button onClick={handleRun} disabled={isRunning}>
            {isRunning ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Running…</> : <><Beaker className="h-4 w-4 mr-2" />Run test generation</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};