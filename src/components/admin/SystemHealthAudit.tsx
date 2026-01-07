import { useState } from "react";
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
  Wrench
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

export const SystemHealthAudit = () => {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isFixingMetadata, setIsFixingMetadata] = useState(false);

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

      // Re-run audit to show updated status
      if (result) {
        runAudit(false);
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

  const runAudit = async (sendEmail: boolean = false) => {
    setIsRunning(true);
    setProgress(0);
    setResult(null);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 5, 90));
    }, 200);

    try {
      const { data, error } = await supabase.functions.invoke('run-system-health-audit', {
        body: { sendEmail, adminEmail: 'smartygym@outlook.com' }
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) throw error;

      setResult(data);
      
      const statusMessage = data.failed > 0 
        ? `${data.failed} critical issues found!`
        : data.warnings > 0 
        ? `${data.warnings} warnings detected`
        : 'All systems healthy!';

      toast({
        title: sendEmail ? "Audit Complete & Email Sent" : "Audit Complete",
        description: `${data.passed}/${data.total_checks} checks passed. ${statusMessage}`,
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
          Comprehensive platform audit with 100+ checks across all systems
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="flex items-center gap-2 border-green-500"
                variant="outline"
                disabled={isRunning}
              >
                {isRunning ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <HeartPulse className="h-4 w-4 text-green-500" />
                )}
                {isRunning ? "Running Audit..." : "🏥 Check System Health"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <HeartPulse className="h-5 w-5 text-green-500" />
                  System Health Audit
                </DialogTitle>
              </DialogHeader>

              {!result && !isRunning && (
                <div className="space-y-4 py-8">
                  <p className="text-center text-muted-foreground">
                    Run a comprehensive audit of all platform systems
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button onClick={() => runAudit(false)} className="gap-2">
                      <HeartPulse className="h-4 w-4" />
                      Run Audit
                    </Button>
                    <Button onClick={() => runAudit(true)} variant="outline" className="gap-2">
                      <Mail className="h-4 w-4" />
                      Run & Send Email Report
                    </Button>
                  </div>
                </div>
              )}

              {isRunning && (
                <div className="space-y-4 py-8">
                  <p className="text-center text-muted-foreground">
                    Running comprehensive system audit...
                  </p>
                  <Progress value={progress} className="w-full" />
                  <p className="text-center text-sm text-muted-foreground">
                    Checking databases, content, integrations, and access controls...
                  </p>
                </div>
              )}

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

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => runAudit(false)}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Run Again
                    </Button>
                    <Button onClick={() => runAudit(true)}>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email Report
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <p className="text-xs text-muted-foreground">
            Auto-runs daily at 22:00 Cyprus time with email to smartygym@outlook.com
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
