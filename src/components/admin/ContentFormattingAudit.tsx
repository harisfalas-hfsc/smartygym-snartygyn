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
  ListChecks
} from "lucide-react";

interface FormatIssue {
  id: string;
  name: string;
  category: string | null;
  type: string;
  issues: string[];
  mainWorkoutExtract: string;
}

interface AuditResult {
  totalScanned: number;
  workoutsScanned: number;
  programsScanned: number;
  missingSections: {
    warmUp: number;
    mainWorkout: number;
    finisher: number;
    coolDown: number;
  };
  missingIcons: {
    warmUp: number;
    mainWorkout: number;
    finisher: number;
    coolDown: number;
  };
  exercisesNotInBulletLists: number;
  singleQuoteAttributes: number;
  leadingEmptyParagraphs: number;
  totalIssues: number;
  compliantItems: number;
  topOffenders: FormatIssue[];
  timestamp: string;
}

interface RepairResult {
  totalProcessed: number;
  workoutsRepaired: number;
  programsRepaired: number;
  iconsAdded: number;
  sectionsAdded: number;
  listsNormalized: number;
  quotesFixed: number;
  repairedIds: string[];
  errors: { id: string; error: string }[];
  timestamp: string;
}

export const ContentFormattingAudit = () => {
  const { toast } = useToast();
  const [isAuditing, setIsAuditing] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [repairResult, setRepairResult] = useState<RepairResult | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const runAudit = async () => {
    setIsAuditing(true);
    setProgress(0);
    setAuditResult(null);
    setRepairResult(null);

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 100);

    try {
      const { data, error } = await supabase.functions.invoke('audit-content-formatting');

      clearInterval(progressInterval);
      setProgress(100);

      if (error) throw error;

      setAuditResult(data);
      
      const statusMessage = data.totalIssues > 0 
        ? `${data.totalIssues} items need formatting fixes`
        : 'All content is properly formatted!';

      toast({
        title: "Content Audit Complete",
        description: `${data.compliantItems}/${data.totalScanned} items compliant. ${statusMessage}`,
        variant: data.totalIssues > 0 ? "destructive" : "default",
      });
    } catch (error) {
      console.error("Audit failed:", error);
      clearInterval(progressInterval);
      toast({
        title: "Audit Failed",
        description: "Could not complete content audit",
        variant: "destructive",
      });
    } finally {
      setIsAuditing(false);
    }
  };

  const runRepair = async () => {
    if (!auditResult || auditResult.totalIssues === 0) return;

    setIsRepairing(true);
    setProgress(0);

    const totalBatches = Math.ceil(auditResult.workoutsScanned / 50);
    let totalRepaired = 0;
    let totalIcons = 0;
    let totalSections = 0;
    let totalLists = 0;
    let totalQuotes = 0;
    const allErrors: { id: string; error: string }[] = [];
    const allRepairedIds: string[] = [];

    try {
      for (let batch = 0; batch < totalBatches; batch++) {
        const { data, error } = await supabase.functions.invoke('repair-content-formatting', {
          body: { batchSize: 50, offset: batch * 50 }
        });

        if (error) throw error;

        totalRepaired += data.workoutsRepaired || 0;
        totalIcons += data.iconsAdded || 0;
        totalSections += data.sectionsAdded || 0;
        totalLists += data.listsNormalized || 0;
        totalQuotes += data.quotesFixed || 0;
        allRepairedIds.push(...(data.repairedIds || []));
        allErrors.push(...(data.errors || []));

        setProgress(Math.round(((batch + 1) / totalBatches) * 100));
      }

      setRepairResult({
        totalProcessed: auditResult.workoutsScanned,
        workoutsRepaired: totalRepaired,
        programsRepaired: 0,
        iconsAdded: totalIcons,
        sectionsAdded: totalSections,
        listsNormalized: totalLists,
        quotesFixed: totalQuotes,
        repairedIds: allRepairedIds,
        errors: allErrors,
        timestamp: new Date().toISOString(),
      });

      toast({
        title: "Repair Complete",
        description: `Repaired ${totalRepaired} items. ${allErrors.length > 0 ? `${allErrors.length} error(s).` : ''}`,
        variant: allErrors.length > 0 ? "destructive" : "default",
      });

      // Re-run audit to confirm
      await runAudit();
    } catch (error) {
      console.error("Repair failed:", error);
      toast({
        title: "Repair Failed",
        description: "Could not complete content repair",
        variant: "destructive",
      });
    } finally {
      setIsRepairing(false);
    }
  };

  const totalMissingIcons = auditResult 
    ? Object.values(auditResult.missingIcons).reduce((a, b) => a + b, 0)
    : 0;
  
  const totalMissingSections = auditResult
    ? Object.values(auditResult.missingSections).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-purple-500" />
          Content Formatting Audit
        </CardTitle>
        <CardDescription>
          Verify all workouts have proper sections, icons, and bullet lists
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground space-y-1">
          <p><strong>Checks performed:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>🔥 Warm-Up / 💪 Main Workout / ⚡ Finisher / 🧘 Cool-Down sections</li>
            <li>Section icons present on all headers</li>
            <li>Exercises formatted as bullet lists</li>
            <li>HTML attribute formatting (double quotes)</li>
          </ul>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="flex items-center gap-2 border-purple-500"
              variant="outline"
              disabled={isAuditing}
            >
              {isAuditing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <ListChecks className="h-4 w-4 text-purple-500" />
              )}
              {isAuditing ? "Running Audit..." : "🔍 Audit Content Formatting"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-purple-500" />
                Content Formatting Audit
              </DialogTitle>
            </DialogHeader>

            {!auditResult && !isAuditing && (
              <div className="space-y-4 py-8">
                <p className="text-center text-muted-foreground">
                  Scan all workouts and programs to verify formatting consistency
                </p>
                <div className="flex justify-center">
                  <Button onClick={runAudit} className="gap-2">
                    <ListChecks className="h-4 w-4" />
                    Run Content Audit
                  </Button>
                </div>
              </div>
            )}

            {(isAuditing || isRepairing) && (
              <div className="space-y-4 py-8">
                <p className="text-center text-muted-foreground">
                  {isAuditing ? "Scanning all content..." : "Repairing content..."}
                </p>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            {auditResult && !isAuditing && !isRepairing && (
              <div className="space-y-4">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl font-bold text-blue-600">{auditResult.totalScanned}</div>
                      <div className="text-sm text-blue-700 dark:text-blue-300">Total Scanned</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-50 dark:bg-green-950 border-green-200">
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl font-bold text-green-600">{auditResult.compliantItems}</div>
                      <div className="text-sm text-green-700 dark:text-green-300">Compliant</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-red-50 dark:bg-red-950 border-red-200">
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl font-bold text-red-600">{auditResult.totalIssues}</div>
                      <div className="text-sm text-red-700 dark:text-red-300">Need Fixes</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200">
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl font-bold text-yellow-600">
                        {Math.round((auditResult.compliantItems / auditResult.totalScanned) * 100)}%
                      </div>
                      <div className="text-sm text-yellow-700 dark:text-yellow-300">Compliance</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Status Banner */}
                <div className={`p-4 rounded-lg text-center ${
                  auditResult.totalIssues > 0 
                    ? 'bg-red-100 dark:bg-red-900' 
                    : 'bg-green-100 dark:bg-green-900'
                }`}>
                  <span className={`font-semibold ${
                    auditResult.totalIssues > 0 
                      ? 'text-red-700 dark:text-red-300' 
                      : 'text-green-700 dark:text-green-300'
                  }`}>
                    {auditResult.totalIssues > 0 
                      ? `🚨 ${auditResult.totalIssues} ITEMS NEED FORMATTING FIXES` 
                      : '✅ ALL CONTENT PROPERLY FORMATTED'}
                  </span>
                </div>

                {/* Issue Breakdown */}
                {auditResult.totalIssues > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded border bg-muted/50">
                      <div className="font-medium">Missing Sections</div>
                      <div className="text-sm text-muted-foreground">
                        Warm-Up: {auditResult.missingSections.warmUp} | 
                        Main: {auditResult.missingSections.mainWorkout} | 
                        Finisher: {auditResult.missingSections.finisher} | 
                        Cool-Down: {auditResult.missingSections.coolDown}
                      </div>
                    </div>
                    <div className="p-3 rounded border bg-muted/50">
                      <div className="font-medium">Missing Icons</div>
                      <div className="text-sm text-muted-foreground">
                        🔥: {auditResult.missingIcons.warmUp} | 
                        💪: {auditResult.missingIcons.mainWorkout} | 
                        ⚡: {auditResult.missingIcons.finisher} | 
                        🧘: {auditResult.missingIcons.coolDown}
                      </div>
                    </div>
                    <div className="p-3 rounded border bg-muted/50">
                      <div className="font-medium">Other Issues</div>
                      <div className="text-sm text-muted-foreground">
                        Bullet Lists: {auditResult.exercisesNotInBulletLists} | 
                        Quotes: {auditResult.singleQuoteAttributes}
                      </div>
                    </div>
                  </div>
                )}

                {/* Fix Button */}
                {auditResult.totalIssues > 0 && (
                  <div className="flex justify-center gap-4">
                    <Button 
                      onClick={runRepair} 
                      disabled={isRepairing}
                      variant="destructive"
                      className="gap-2"
                    >
                      {isRepairing ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Wrench className="h-4 w-4" />
                      )}
                      {isRepairing ? "Repairing..." : `Fix All ${auditResult.totalIssues} Items`}
                    </Button>
                    <Button onClick={runAudit} variant="outline" className="gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Re-run Audit
                    </Button>
                  </div>
                )}

                {/* Repair Results */}
                {repairResult && (
                  <Card className="bg-blue-50 dark:bg-blue-950">
                    <CardContent className="p-4">
                      <div className="font-semibold mb-2">Repair Summary:</div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                        <div>Icons Added: {repairResult.iconsAdded}</div>
                        <div>Sections Added: {repairResult.sectionsAdded}</div>
                        <div>Lists Normalized: {repairResult.listsNormalized}</div>
                        <div>Quotes Fixed: {repairResult.quotesFixed}</div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Top Offenders */}
                {auditResult.topOffenders.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      Items Needing Fixes ({auditResult.topOffenders.length})
                    </h4>
                    <ScrollArea className="h-[250px]">
                      <div className="space-y-2">
                        {auditResult.topOffenders.map(item => (
                          <Card key={item.id} className="border-yellow-300 bg-yellow-50 dark:bg-yellow-950">
                            <CardContent className="p-3">
                              <div className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                                <div className="flex-1">
                                  <div className="font-medium flex items-center gap-2">
                                    {item.name}
                                    <Badge variant="outline" className="text-xs">{item.type}</Badge>
                                  </div>
                                  <div className="text-sm text-muted-foreground">{item.category}</div>
                                  <div className="text-xs mt-1 space-y-0.5">
                                    {item.issues.map((issue, i) => (
                                      <div key={i} className="text-red-600">• {issue}</div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                {auditResult.totalIssues === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle2 className="h-16 w-16 mx-auto text-green-500 mb-4" />
                    <p className="text-lg font-medium text-green-600">All Content Verified!</p>
                    <p className="text-sm text-muted-foreground">
                      All {auditResult.totalScanned} items have proper formatting with sections, icons, and bullet lists.
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
