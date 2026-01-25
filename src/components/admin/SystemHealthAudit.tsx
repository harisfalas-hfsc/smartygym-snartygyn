import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  HeartPulse, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  SkipForward,
  RefreshCw,
  Mail,
  Database,
  Shield,
  Zap,
  Calendar,
  Users,
  CreditCard,
  FileText,
  Clock,
  Bell,
  Wrench,
  Loader2
} from "lucide-react";

interface HealthCheck {
  id: number;
  category: string;
  name: string;
  description: string;
  status: 'pass' | 'warning' | 'fail' | 'skip';
  details?: string;
  accessMatrix?: {
    visitor: string;
    subscriber: string;
    standalone: string;
    premium: string;
    admin: string;
  };
}

interface AuditResult {
  timestamp: string;
  duration_ms: number;
  total_checks: number;
  passed: number;
  warnings: number;
  failed: number;
  skipped: number;
  checks: HealthCheck[];
  summary: {
    critical_issues: HealthCheck[];
    warnings: HealthCheck[];
  };
}

interface QuickCheck {
  name: string;
  status: 'pass' | 'warning' | 'fail';
  details?: string;
}

interface QuickAuditResult {
  timestamp: string;
  duration_ms: number;
  cyprus_date: string;
  total_checks: number;
  passed: number;
  warnings: number;
  failed: number;
  checks: QuickCheck[];
  overall_status: 'healthy' | 'warning' | 'critical';
}

export const SystemHealthAudit = () => {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [isRunningFull, setIsRunningFull] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [quickResult, setQuickResult] = useState<QuickAuditResult | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isFixingMetadata, setIsFixingMetadata] = useState(false);
  const [fullAuditRunId, setFullAuditRunId] = useState<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const fixStripeMetadata = async () => {
    setIsFixingMetadata(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please log in as admin to fix metadata",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('fix-stripe-metadata', {
        body: { dryRun: false }
      });

      if (error) throw error;

      toast({
        title: "Stripe Metadata Fixed",
        description: `Fixed ${data.fixed || 0} products. ${data.alreadyTagged || 0} were already tagged.`,
      });

      // Re-run quick audit to show updated status
      if (quickResult) {
        runQuickAudit();
      }
    } catch (error: any) {
      console.error("Fix metadata failed:", error);
      toast({
        title: "Fix Failed",
        description: error.message || "Could not fix Stripe metadata",
        variant: "destructive",
      });
    } finally {
      setIsFixingMetadata(false);
    }
  };

  const hasStripeMetadataWarnings = result?.summary.warnings.some(
    w => w.category === 'Stripe' && w.name.toLowerCase().includes('metadata')
  ) || result?.summary.critical_issues.some(
    c => c.category === 'Stripe' && c.name.toLowerCase().includes('metadata')
  );

  // Quick audit - fast essential checks
  const runQuickAudit = async () => {
    setIsRunning(true);
    setQuickResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('run-quick-health-audit');

      if (error) throw error;

      setQuickResult(data);
      
      toast({
        title: "Quick Audit Complete",
        description: `${data.passed}/${data.total_checks} checks passed`,
        variant: data.failed > 0 ? "destructive" : "default",
      });
    } catch (error) {
      console.error("Quick audit failed:", error);
      toast({
        title: "Audit Failed",
        description: "Could not complete quick health check",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Poll for full audit completion
  const pollAuditStatus = async (runId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('get-audit-status', {
        body: { runId }
      });

      if (error) throw error;

      if (data.status === 'completed' && data.results) {
        // Audit complete
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        
        setResult(data.results);
        setProgress(100);
        setIsRunningFull(false);
        setFullAuditRunId(null);

        toast({
          title: "Full Audit Complete",
          description: `${data.summary.passed}/${data.summary.total_checks} checks passed`,
          variant: data.summary.failed > 0 ? "destructive" : "default",
        });
      } else {
        // Still running - increment progress
        setProgress(prev => Math.min(prev + 3, 95));
      }
    } catch (error) {
      console.error("Poll failed:", error);
    }
  };

  // Full audit - comprehensive checks (runs in background)
  const runFullAudit = async (sendEmail: boolean = false) => {
    setIsRunningFull(true);
    setProgress(0);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('trigger-full-audit', {
        body: { sendEmail }
      });

      if (error) throw error;

      if (data.runId) {
        setFullAuditRunId(data.runId);
        
        // Start polling
        pollIntervalRef.current = setInterval(() => {
          pollAuditStatus(data.runId);
        }, 3000);

        toast({
          title: "Full Audit Started",
          description: "Running comprehensive checks in background...",
        });
      }
    } catch (error) {
      console.error("Failed to trigger full audit:", error);
      setIsRunningFull(false);
      
      // Fallback to direct call for backward compatibility
      runDirectAudit(sendEmail);
    }
  };

  // Direct audit call (fallback)
  const runDirectAudit = async (sendEmail: boolean = false) => {
    setIsRunning(true);
    setProgress(0);
    setResult(null);

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 2, 90));
    }, 500);

    try {
      const { data, error } = await supabase.functions.invoke('run-system-health-audit', {
        body: { sendEmail }
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) throw error;

      setResult(data);
      
      toast({
        title: sendEmail ? "Audit Complete & Email Sent" : "Audit Complete",
        description: `${data.passed}/${data.total_checks} checks passed`,
        variant: data.failed > 0 ? "destructive" : "default",
      });
    } catch (error) {
      console.error("Audit failed:", error);
      clearInterval(progressInterval);
      toast({
        title: "Audit Failed",
        description: "Could not complete system health audit",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'fail': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'skip': return <SkipForward className="h-4 w-4 text-gray-400" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pass: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
      fail: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
      skip: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
    };
    return variants[status] || variants.skip;
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      'Database': <Database className="h-4 w-4" />,
      'Content': <FileText className="h-4 w-4" />,
      'WOD System': <Calendar className="h-4 w-4" />,
      'Daily Ritual': <Clock className="h-4 w-4" />,
      'Users': <Users className="h-4 w-4" />,
      'Stripe': <CreditCard className="h-4 w-4" />,
      'Email': <Mail className="h-4 w-4" />,
      'Notifications': <Bell className="h-4 w-4" />,
      'Contact': <Mail className="h-4 w-4" />,
      'Storage': <Database className="h-4 w-4" />,
      'Cron Jobs': <Clock className="h-4 w-4" />,
      'Access Control': <Shield className="h-4 w-4" />,
      'Edge Functions': <Zap className="h-4 w-4" />
    };
    return icons[category] || <FileText className="h-4 w-4" />;
  };

  const groupedChecks = result?.checks.reduce((acc, check) => {
    if (!acc[check.category]) acc[check.category] = [];
    acc[check.category].push(check);
    return acc;
  }, {} as Record<string, HealthCheck[]>) || {};

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HeartPulse className="h-5 w-5 text-green-500" />
          System Health Audit
        </CardTitle>
        <CardDescription>
          Quick check (instant) or full audit (100+ checks, runs in background)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="flex items-center gap-2 border-green-500"
                variant="outline"
                disabled={isRunning || isRunningFull}
              >
                {(isRunning || isRunningFull) ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <HeartPulse className="h-4 w-4 text-green-500" />
                )}
                🏥 Check System Health
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <HeartPulse className="h-5 w-5 text-green-500" />
                  System Health Audit
                </DialogTitle>
              </DialogHeader>

              {!result && !quickResult && !isRunning && !isRunningFull && (
                <div className="space-y-6 py-8">
                  <p className="text-center text-muted-foreground">
                    Choose an audit type:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    <Card className="border-2 border-green-200 dark:border-green-800">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Zap className="h-5 w-5 text-green-500" />
                          <span className="font-semibold">Quick Check</span>
                          <Badge variant="secondary">~5 sec</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Essential checks: WOD, Ritual, Subscriptions, Cron, Emails
                        </p>
                        <Button onClick={runQuickAudit} className="w-full gap-2" variant="outline">
                          <HeartPulse className="h-4 w-4" />
                          Run Quick Check
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-2 border-blue-200 dark:border-blue-800">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Database className="h-5 w-5 text-blue-500" />
                          <span className="font-semibold">Full Audit</span>
                          <Badge variant="secondary">2-5 min</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          100+ checks: Content, Stripe sync, Images, Access control
                        </p>
                        <div className="flex gap-2">
                          <Button onClick={() => runFullAudit(false)} className="flex-1 gap-2" variant="outline">
                            <RefreshCw className="h-4 w-4" />
                            Run
                          </Button>
                          <Button onClick={() => runFullAudit(true)} className="flex-1 gap-2">
                            <Mail className="h-4 w-4" />
                            Run + Email
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Quick Check Running */}
              {isRunning && !isRunningFull && (
                <div className="space-y-4 py-8 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-green-500" />
                  <p className="text-muted-foreground">Running quick health check...</p>
                </div>
              )}

              {/* Full Audit Running */}
              {isRunningFull && (
                <div className="space-y-4 py-8">
                  <p className="text-center text-muted-foreground">
                    Full audit running in background...
                  </p>
                  <Progress value={progress} className="w-full" />
                  <p className="text-center text-sm text-muted-foreground">
                    Checking databases, content, Stripe sync, images, access controls...
                  </p>
                  <p className="text-center text-xs text-muted-foreground">
                    This takes 2-5 minutes. You can close this dialog and check back later.
                  </p>
                </div>
              )}

              {/* Quick Result Display */}
              {quickResult && !result && !isRunning && !isRunningFull && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <Card className="bg-green-50 dark:bg-green-950 border-green-200">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">{quickResult.passed}</div>
                        <div className="text-sm text-green-700 dark:text-green-300">Passed</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-yellow-600">{quickResult.warnings}</div>
                        <div className="text-sm text-yellow-700 dark:text-yellow-300">Warnings</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-red-50 dark:bg-red-950 border-red-200">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-red-600">{quickResult.failed}</div>
                        <div className="text-sm text-red-700 dark:text-red-300">Failed</div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className={`p-4 rounded-lg text-center ${
                    quickResult.overall_status === 'critical' ? 'bg-red-100 dark:bg-red-900' : 
                    quickResult.overall_status === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900' : 
                    'bg-green-100 dark:bg-green-900'
                  }`}>
                    <span className="font-semibold">
                      {quickResult.overall_status === 'critical' ? '🚨 ISSUES DETECTED' : 
                       quickResult.overall_status === 'warning' ? '⚠️ WARNINGS' : 
                       '✅ SYSTEMS HEALTHY'}
                    </span>
                    <span className="text-muted-foreground ml-2">
                      - Completed in {quickResult.duration_ms}ms
                    </span>
                  </div>

                  <div className="space-y-2">
                    {quickResult.checks.map((check, idx) => (
                      <div 
                        key={idx} 
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          check.status === 'fail' ? 'bg-red-50 dark:bg-red-950' :
                          check.status === 'warning' ? 'bg-yellow-50 dark:bg-yellow-950' :
                          'bg-green-50 dark:bg-green-950'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {getStatusIcon(check.status)}
                          <span className="font-medium">{check.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{check.details}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setQuickResult(null)}>
                      ← Back
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={runQuickAudit}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Quick Again
                      </Button>
                      <Button onClick={() => { setQuickResult(null); runFullAudit(false); }}>
                        <Database className="h-4 w-4 mr-2" />
                        Run Full Audit
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Full Result Display */}
              {result && (
                <div className="space-y-4">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="bg-green-50 dark:bg-green-950 border-green-200">
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-green-600">{result.passed}</div>
                        <div className="text-sm text-green-700 dark:text-green-300">Passed</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200">
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-yellow-600">{result.warnings}</div>
                        <div className="text-sm text-yellow-700 dark:text-yellow-300">Warnings</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-red-50 dark:bg-red-950 border-red-200">
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-red-600">{result.failed}</div>
                        <div className="text-sm text-red-700 dark:text-red-300">Failed</div>
                      </CardContent>
                    </Card>
                    <Card className="border">
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold">{result.total_checks}</div>
                        <div className="text-sm text-muted-foreground">Total</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Overall Status */}
                  <div className={`p-4 rounded-lg text-center ${
                    result.failed > 0 ? 'bg-red-100 dark:bg-red-900' : 
                    result.warnings > 0 ? 'bg-yellow-100 dark:bg-yellow-900' : 
                    'bg-green-100 dark:bg-green-900'
                  }`}>
                    <span className={`font-semibold ${
                      result.failed > 0 ? 'text-red-700 dark:text-red-300' : 
                      result.warnings > 0 ? 'text-yellow-700 dark:text-yellow-300' : 
                      'text-green-700 dark:text-green-300'
                    }`}>
                      {result.failed > 0 ? '🚨 CRITICAL ISSUES DETECTED' : 
                       result.warnings > 0 ? '⚠️ WARNINGS DETECTED' : 
                       '✅ ALL SYSTEMS HEALTHY'}
                    </span>
                    <span className="text-muted-foreground ml-2">
                      - Audit completed in {result.duration_ms}ms
                    </span>
                  </div>

                  <Tabs defaultValue="critical" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="critical" className="flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        Critical ({result.failed})
                      </TabsTrigger>
                      <TabsTrigger value="warnings" className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Warnings ({result.warnings})
                      </TabsTrigger>
                      <TabsTrigger value="all">
                        All Checks ({result.total_checks})
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="critical">
                      <ScrollArea className="h-[400px]">
                        {result.summary.critical_issues.length > 0 ? (
                          <div className="space-y-2">
                            {result.summary.critical_issues.map(check => (
                              <Card key={check.id} className="border-red-300 bg-red-50 dark:bg-red-950">
                                <CardContent className="p-4">
                                  <div className="flex items-start gap-3">
                                    <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                                    <div className="flex-1">
                                      <div className="font-medium">{check.name}</div>
                                      <div className="text-sm text-muted-foreground">{check.category}</div>
                                      <div className="text-sm mt-1">{check.description}</div>
                                      {check.details && (
                                        <div className="text-sm text-red-600 dark:text-red-400 mt-1 font-medium">
                                          {check.details}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-green-600">
                            <CheckCircle2 className="h-12 w-12 mx-auto mb-2" />
                            <p>No critical issues found!</p>
                          </div>
                        )}
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent value="warnings">
                      <ScrollArea className="h-[400px]">
                        {result.summary.warnings.length > 0 ? (
                          <div className="space-y-2">
                            {/* Quick Fix Button for Stripe Metadata */}
                            {hasStripeMetadataWarnings && (
                              <Card className="border-blue-300 bg-blue-50 dark:bg-blue-950 mb-3">
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <Wrench className="h-5 w-5 text-blue-500" />
                                      <div>
                                        <div className="font-medium">Quick Fix Available</div>
                                        <div className="text-sm text-muted-foreground">
                                          Automatically add SMARTYGYM metadata to Stripe products
                                        </div>
                                      </div>
                                    </div>
                                    <Button 
                                      onClick={fixStripeMetadata} 
                                      disabled={isFixingMetadata}
                                      size="sm"
                                      className="gap-2"
                                    >
                                      {isFixingMetadata ? (
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Wrench className="h-4 w-4" />
                                      )}
                                      {isFixingMetadata ? "Fixing..." : "Fix Metadata Now"}
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                            {result.summary.warnings.map(check => (
                              <Card key={check.id} className="border-yellow-300 bg-yellow-50 dark:bg-yellow-950">
                                <CardContent className="p-4">
                                  <div className="flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                                    <div className="flex-1">
                                      <div className="font-medium">{check.name}</div>
                                      <div className="text-sm text-muted-foreground">{check.category}</div>
                                      <div className="text-sm mt-1">{check.description}</div>
                                      {check.details && (
                                        <div className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                                          {check.details}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-green-600">
                            <CheckCircle2 className="h-12 w-12 mx-auto mb-2" />
                            <p>No warnings!</p>
                          </div>
                        )}
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent value="all">
                      <ScrollArea className="h-[400px]">
                        <div className="space-y-4">
                          {Object.entries(groupedChecks).map(([category, categoryChecks]) => (
                            <div key={category}>
                              <div className="flex items-center gap-2 mb-2 sticky top-0 bg-background py-2">
                                {getCategoryIcon(category)}
                                <span className="font-semibold">{category}</span>
                                <Badge variant="secondary">{categoryChecks.length}</Badge>
                              </div>
                              <div className="space-y-1 pl-6">
                                {categoryChecks.map(check => (
                                  <div 
                                    key={check.id} 
                                    className="flex items-center gap-2 p-2 rounded hover:bg-muted/50"
                                  >
                                    {getStatusIcon(check.status)}
                                    <span className="flex-1 text-sm">{check.name}</span>
                                    <Badge className={getStatusBadge(check.status)}>
                                      {check.status}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>

                  {/* Access Control Matrix */}
                  {result.checks.some(c => c.accessMatrix) && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Access Control Matrix
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr className="bg-muted">
                              <th className="border p-2 text-left">Feature</th>
                              <th className="border p-2 text-center">Visitor</th>
                              <th className="border p-2 text-center">Subscriber</th>
                              <th className="border p-2 text-center">Standalone</th>
                              <th className="border p-2 text-center">Premium</th>
                              <th className="border p-2 text-center">Admin</th>
                            </tr>
                          </thead>
                          <tbody>
                            {result.checks
                              .filter(c => c.accessMatrix)
                              .map(check => (
                                <tr key={check.id}>
                                  <td className="border p-2">{check.name}</td>
                                  <td className="border p-2 text-center">{check.accessMatrix?.visitor}</td>
                                  <td className="border p-2 text-center">{check.accessMatrix?.subscriber}</td>
                                  <td className="border p-2 text-center">{check.accessMatrix?.standalone}</td>
                                  <td className="border p-2 text-center">{check.accessMatrix?.premium}</td>
                                  <td className="border p-2 text-center">{check.accessMatrix?.admin}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setResult(null)}>
                      ← Back
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => runFullAudit(false)}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Run Again
                      </Button>
                      <Button onClick={() => runFullAudit(true)}>
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email Report
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <p className="text-xs text-muted-foreground">
            Daily full audit at 17:00 Cyprus → smartygym@outlook.com
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
