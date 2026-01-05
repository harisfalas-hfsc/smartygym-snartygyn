import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  FileCheck2, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw,
  Wrench,
  Dumbbell
} from "lucide-react";

interface FormatMismatch {
  id: string;
  name: string;
  category: string | null;
  currentFormat: string | null;
  requiredFormat: string;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
  mainWorkoutExtract: string;
  isWod: boolean;
  isVisible: boolean;
}

interface AuditResult {
  totalScanned: number;
  totalMismatches: number;
  highConfidenceMismatches: number;
  mismatches: FormatMismatch[];
  correctFormats: number;
  byCategory: Record<string, { total: number; mismatches: number }>;
  timestamp: string;
}

// Category format rules (must match database trigger)
const CATEGORY_FORMAT_RULES: Record<string, string> = {
  'STRENGTH': 'REPS & SETS',
  'MOBILITY & STABILITY': 'REPS & SETS',
  'PILATES': 'REPS & SETS',
  'RECOVERY': 'MIX'
};

export const FormatIntegrityAudit = () => {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const runAudit = async () => {
    setIsRunning(true);
    setProgress(0);
    setResult(null);

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 100);

    try {
      const { data, error } = await supabase.functions.invoke('audit-workout-formats');

      clearInterval(progressInterval);
      setProgress(100);

      if (error) throw error;

      setResult(data);
      
      const statusMessage = data.totalMismatches > 0 
        ? `${data.totalMismatches} format mismatches found!`
        : 'All workout formats are correct!';

      toast({
        title: "Format Audit Complete",
        description: `${data.correctFormats}/${data.totalScanned} workouts have correct formats. ${statusMessage}`,
        variant: data.totalMismatches > 0 ? "destructive" : "default",
      });
    } catch (error) {
      console.error("Audit failed:", error);
      clearInterval(progressInterval);
      toast({
        title: "Audit Failed",
        description: "Could not complete format audit",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const fixMismatches = async () => {
    if (!result || result.mismatches.length === 0) return;

    setIsFixing(true);
    let fixed = 0;
    let errors = 0;

    try {
      for (const mismatch of result.mismatches) {
        const { error } = await supabase
          .from('admin_workouts')
          .update({ format: mismatch.requiredFormat })
          .eq('id', mismatch.id);

        if (error) {
          console.error(`Failed to fix ${mismatch.name}:`, error);
          errors++;
        } else {
          fixed++;
        }
      }

      toast({
        title: "Fixes Applied",
        description: `Fixed ${fixed} workout(s). ${errors > 0 ? `${errors} error(s) occurred.` : ''}`,
        variant: errors > 0 ? "destructive" : "default",
      });

      // Re-run audit to confirm
      await runAudit();
    } catch (error) {
      console.error("Fix failed:", error);
      toast({
        title: "Fix Failed",
        description: "Could not apply fixes",
        variant: "destructive",
      });
    } finally {
      setIsFixing(false);
    }
  };

  const getConfidenceBadge = (confidence: string) => {
    const variants: Record<string, string> = {
      high: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
      low: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
    };
    return variants[confidence] || variants.low;
  };

  const fixedCategoryMismatches = result?.mismatches.filter(m => 
    m.category && CATEGORY_FORMAT_RULES[m.category]
  ) || [];

  const flexibleCategoryMismatches = result?.mismatches.filter(m => 
    !m.category || !CATEGORY_FORMAT_RULES[m.category]
  ) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck2 className="h-5 w-5 text-blue-500" />
          Format Integrity Audit
        </CardTitle>
        <CardDescription>
          Verify all workouts have correct formats based on category rules
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground space-y-1">
          <p><strong>Category Format Rules:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            {Object.entries(CATEGORY_FORMAT_RULES).map(([cat, format]) => (
              <li key={cat}><span className="font-medium">{cat}</span> → {format}</li>
            ))}
            <li><span className="font-medium">Other categories</span> → Flexible (detected from content)</li>
          </ul>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="flex items-center gap-2 border-blue-500"
              variant="outline"
              disabled={isRunning}
            >
              {isRunning ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <FileCheck2 className="h-4 w-4 text-blue-500" />
              )}
              {isRunning ? "Running Audit..." : "🔍 Check Format Integrity"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-blue-500" />
                Workout Format Integrity Audit
              </DialogTitle>
            </DialogHeader>

            {!result && !isRunning && (
              <div className="space-y-4 py-8">
                <p className="text-center text-muted-foreground">
                  Scan all workouts to verify format consistency
                </p>
                <div className="flex justify-center">
                  <Button onClick={runAudit} className="gap-2">
                    <FileCheck2 className="h-4 w-4" />
                    Run Format Audit
                  </Button>
                </div>
              </div>
            )}

            {isRunning && (
              <div className="space-y-4 py-8">
                <p className="text-center text-muted-foreground">
                  Scanning all workouts...
                </p>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            {result && (
              <div className="space-y-4">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl font-bold text-blue-600">{result.totalScanned}</div>
                      <div className="text-sm text-blue-700 dark:text-blue-300">Total Scanned</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-50 dark:bg-green-950 border-green-200">
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl font-bold text-green-600">{result.correctFormats}</div>
                      <div className="text-sm text-green-700 dark:text-green-300">Correct</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-red-50 dark:bg-red-950 border-red-200">
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl font-bold text-red-600">{result.totalMismatches}</div>
                      <div className="text-sm text-red-700 dark:text-red-300">Mismatches</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200">
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl font-bold text-yellow-600">{result.highConfidenceMismatches}</div>
                      <div className="text-sm text-yellow-700 dark:text-yellow-300">High Confidence</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Status Banner */}
                <div className={`p-4 rounded-lg text-center ${
                  result.totalMismatches > 0 
                    ? 'bg-red-100 dark:bg-red-900' 
                    : 'bg-green-100 dark:bg-green-900'
                }`}>
                  <span className={`font-semibold ${
                    result.totalMismatches > 0 
                      ? 'text-red-700 dark:text-red-300' 
                      : 'text-green-700 dark:text-green-300'
                  }`}>
                    {result.totalMismatches > 0 
                      ? `🚨 ${result.totalMismatches} FORMAT MISMATCHES DETECTED` 
                      : '✅ ALL FORMATS CORRECT'}
                  </span>
                </div>

                {/* Fix Button */}
                {result.totalMismatches > 0 && (
                  <div className="flex justify-center gap-4">
                    <Button 
                      onClick={fixMismatches} 
                      disabled={isFixing}
                      variant="destructive"
                      className="gap-2"
                    >
                      {isFixing ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Wrench className="h-4 w-4" />
                      )}
                      {isFixing ? "Fixing..." : `Fix All ${result.totalMismatches} Mismatches`}
                    </Button>
                    <Button onClick={runAudit} variant="outline" className="gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Re-run Audit
                    </Button>
                  </div>
                )}

                {/* Category Breakdown */}
                {Object.keys(result.byCategory).length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">By Category:</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {Object.entries(result.byCategory).map(([cat, stats]) => (
                        <div 
                          key={cat} 
                          className={`p-2 rounded border ${
                            stats.mismatches > 0 
                              ? 'border-red-300 bg-red-50 dark:bg-red-950' 
                              : 'border-green-300 bg-green-50 dark:bg-green-950'
                          }`}
                        >
                          <div className="font-medium text-sm">{cat}</div>
                          <div className="text-xs text-muted-foreground">
                            {stats.total} total, {stats.mismatches} issues
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mismatches List */}
                {result.mismatches.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      Format Mismatches ({result.mismatches.length})
                    </h4>

                    {/* Fixed Category Violations */}
                    {fixedCategoryMismatches.length > 0 && (
                      <div className="mb-4">
                        <div className="text-sm font-medium text-red-600 mb-2">
                          🚨 Category Rule Violations ({fixedCategoryMismatches.length})
                        </div>
                        <ScrollArea className="h-[200px]">
                          <div className="space-y-2">
                            {fixedCategoryMismatches.map(mismatch => (
                              <Card key={mismatch.id} className="border-red-300 bg-red-50 dark:bg-red-950">
                                <CardContent className="p-3">
                                  <div className="flex items-start gap-3">
                                    <Dumbbell className="h-5 w-5 text-red-500 mt-0.5" />
                                    <div className="flex-1">
                                      <div className="font-medium flex items-center gap-2">
                                        {mismatch.name}
                                        {mismatch.isWod && <Badge variant="outline" className="text-xs">WOD</Badge>}
                                        {!mismatch.isVisible && <Badge variant="secondary" className="text-xs">Hidden</Badge>}
                                      </div>
                                      <div className="text-sm text-muted-foreground">{mismatch.category}</div>
                                      <div className="text-sm mt-1">
                                        <span className="text-red-600 line-through">{mismatch.currentFormat || 'NULL'}</span>
                                        {' → '}
                                        <span className="text-green-600 font-medium">{mismatch.requiredFormat}</span>
                                      </div>
                                      <div className="text-xs text-muted-foreground mt-1">
                                        {mismatch.reason}
                                      </div>
                                    </div>
                                    <Badge className={getConfidenceBadge(mismatch.confidence)}>
                                      {mismatch.confidence}
                                    </Badge>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}

                    {/* Flexible Category Suggestions */}
                    {flexibleCategoryMismatches.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-yellow-600 mb-2">
                          ⚠️ Flexible Category Suggestions ({flexibleCategoryMismatches.length})
                        </div>
                        <ScrollArea className="h-[200px]">
                          <div className="space-y-2">
                            {flexibleCategoryMismatches.map(mismatch => (
                              <Card key={mismatch.id} className="border-yellow-300 bg-yellow-50 dark:bg-yellow-950">
                                <CardContent className="p-3">
                                  <div className="flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                                    <div className="flex-1">
                                      <div className="font-medium">{mismatch.name}</div>
                                      <div className="text-sm text-muted-foreground">{mismatch.category}</div>
                                      <div className="text-sm mt-1">
                                        <span className="text-yellow-600">{mismatch.currentFormat || 'NULL'}</span>
                                        {' → '}
                                        <span className="text-green-600">{mismatch.requiredFormat}</span>
                                      </div>
                                      <div className="text-xs text-muted-foreground mt-1">
                                        {mismatch.reason}
                                      </div>
                                      {mismatch.mainWorkoutExtract && (
                                        <div className="text-xs bg-background/50 p-2 rounded mt-2 max-h-20 overflow-hidden">
                                          {mismatch.mainWorkoutExtract}
                                        </div>
                                      )}
                                    </div>
                                    <Badge className={getConfidenceBadge(mismatch.confidence)}>
                                      {mismatch.confidence}
                                    </Badge>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                  </div>
                )}

                {result.totalMismatches === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle2 className="h-16 w-16 mx-auto text-green-500 mb-4" />
                    <p className="text-lg font-medium text-green-600">All Formats Verified!</p>
                    <p className="text-sm text-muted-foreground">
                      All {result.totalScanned} workouts have correct formats matching their category rules.
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
