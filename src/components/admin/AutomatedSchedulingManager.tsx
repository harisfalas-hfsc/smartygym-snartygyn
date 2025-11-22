import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Clock, 
  Play, 
  AlertCircle, 
  CheckCircle2, 
  Calendar,
  RefreshCw,
  Settings,
  Info,
  Edit,
  Save,
  X
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface ScheduledJob {
  name: string;
  description: string;
  schedule: string;
  scheduleDescription: string;
  functionName: string;
  isActive: boolean;
  icon: typeof Clock;
  color: string;
  lastRun?: string;
  cronJobName: string;
}

const SCHEDULED_JOBS: ScheduledJob[] = [
  {
    name: "Renewal Reminders",
    description: "Sends reminder messages to users 3 days before their subscription expires",
    schedule: "0 9 * * *",
    scheduleDescription: "Daily at 9:00 AM",
    functionName: "send-renewal-reminders",
    isActive: false,
    icon: Calendar,
    color: "text-cyan-600",
    cronJobName: "send-renewal-reminders-daily"
  },
  {
    name: "Re-engagement Messages",
    description: "Sends messages to users with expired subscriptions who haven't been active in 30 days",
    schedule: "0 10 * * 1",
    scheduleDescription: "Weekly on Monday at 10:00 AM",
    functionName: "send-reengagement-emails",
    isActive: false,
    icon: RefreshCw,
    color: "text-purple-600",
    cronJobName: "send-reengagement-emails-weekly"
  }
];

export const AutomatedSchedulingManager = () => {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<ScheduledJob[]>(SCHEDULED_JOBS);
  const [loading, setLoading] = useState(true);
  const [cronJobsEnabled, setCronJobsEnabled] = useState(false);
  const [editingJob, setEditingJob] = useState<ScheduledJob | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editSchedule, setEditSchedule] = useState("");
  const [editEnabled, setEditEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkCronStatus();
  }, []);

  const checkCronStatus = async () => {
    setLoading(true);
    try {
      // Check if pg_cron extension is enabled
      const { data, error } = await supabase.rpc('pg_cron_enabled' as any);
      
      if (error) {
        if (import.meta.env.DEV) {
          console.log("pg_cron check result:", error);
        }
        setCronJobsEnabled(false);
      } else {
        setCronJobsEnabled(true);
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.log("Error checking cron status:", err);
      }
      setCronJobsEnabled(false);
    }
    setLoading(false);
  };

  const handleTestFunction = async (functionName: string) => {
    try {
      toast({
        title: "Testing Function",
        description: `Invoking ${functionName}...`,
      });

      const { data, error } = await supabase.functions.invoke(functionName);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${functionName} executed successfully`,
      });
      
      if (import.meta.env.DEV) {
        console.log("Function result:", data);
      }
    } catch (error) {
      console.error("Function test error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to test function",
        variant: "destructive",
      });
    }
  };

  const getCronSetupInstructions = () => {
    const projectUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    return `-- Step 1: Enable pg_cron and pg_net extensions (if not already enabled)
-- Run this in your Supabase SQL Editor:

-- Step 2: Schedule the renewal reminders (Daily at 9:00 AM)
SELECT cron.schedule(
  'send-renewal-reminders-daily',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url:='${projectUrl}/functions/v1/send-renewal-reminders',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer ${anonKey}"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);

-- Step 3: Schedule the re-engagement emails (Weekly on Monday at 10:00 AM)
SELECT cron.schedule(
  'send-reengagement-emails-weekly',
  '0 10 * * 1',
  $$
  SELECT net.http_post(
    url:='${projectUrl}/functions/v1/send-reengagement-emails',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer ${anonKey}"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);

-- View all scheduled jobs:
SELECT * FROM cron.job;

-- To unschedule a job (if needed):
-- SELECT cron.unschedule('send-renewal-reminders-daily');
-- SELECT cron.unschedule('send-reengagement-emails-weekly');`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "SQL commands copied to clipboard",
    });
  };

  const handleEditJob = (job: ScheduledJob) => {
    setEditingJob(job);
    setEditSchedule(job.schedule);
    setEditEnabled(job.isActive);
    setEditDialogOpen(true);
  };

  const handleSaveSchedule = async () => {
    if (!editingJob) return;

    setSaving(true);
    try {
      const projectUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      let sql = '';

      // Generate SQL to unschedule
      sql += `-- Unschedule existing job\nSELECT cron.unschedule('${editingJob.cronJobName}');\n\n`;

      // If enabled, generate SQL to schedule with new timing
      if (editEnabled) {
        sql += `-- Schedule with new timing\nSELECT cron.schedule(\n  '${editingJob.cronJobName}',\n  '${editSchedule}',\n  $$\n  SELECT net.http_post(\n    url:='${projectUrl}/functions/v1/${editingJob.functionName}',\n    headers:='{"Content-Type": "application/json", "Authorization": "Bearer ${anonKey}"}'::jsonb,\n    body:='{}'::jsonb\n  ) as request_id;\n  $$\n);`;
      }

      // Copy SQL to clipboard
      await navigator.clipboard.writeText(sql);

      // Update local state optimistically
      setJobs(jobs.map(j => 
        j.cronJobName === editingJob.cronJobName 
          ? { ...j, schedule: editSchedule, isActive: editEnabled, scheduleDescription: parseCronToDescription(editSchedule) }
          : j
      ));

      toast({
        title: "SQL Commands Copied",
        description: "Paste and run these commands in your database SQL editor to apply changes",
      });

      setEditDialogOpen(false);
    } catch (error) {
      console.error("Error generating SQL:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate SQL",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const parseCronToDescription = (cron: string): string => {
    const parts = cron.split(' ');
    if (parts.length !== 5) return cron;
    
    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
    
    if (dayOfWeek !== '*') {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return `Weekly on ${days[parseInt(dayOfWeek)]} at ${hour}:${minute.padStart(2, '0')}`;
    }
    
    if (dayOfMonth === '*' && month === '*') {
      return `Daily at ${hour}:${minute.padStart(2, '0')}`;
    }
    
    return cron;
  };

  return (
    <div className="pt-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Automated Scheduling
          </CardTitle>
          <CardDescription>
            Manage scheduled automated messages and background jobs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Alert */}
          <Alert variant={cronJobsEnabled ? "default" : "destructive"}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Cron Job Status</AlertTitle>
            <AlertDescription>
              {cronJobsEnabled ? (
                <>
                  ✅ pg_cron extension is enabled. Scheduled jobs can run automatically.
                </>
              ) : (
                <>
                  ⚠️ Automated scheduling is NOT currently active. You need to set up cron jobs manually.
                  <br />
                  Follow the instructions below to enable automated scheduling.
                </>
              )}
            </AlertDescription>
          </Alert>

          {/* Current Scheduled Jobs */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Scheduled Jobs</h3>
            <div className="grid gap-4">
              {jobs.map((job) => {
                const Icon = job.icon;
                return (
                  <Card key={job.name} className="border-l-4" style={{ borderLeftColor: job.color }}>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Icon className={`h-5 w-5 ${job.color}`} />
                              <h4 className="font-semibold">{job.name}</h4>
                              <Badge variant={job.isActive ? "default" : "secondary"}>
                                {job.isActive ? "Active" : "Not Scheduled"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {job.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="font-mono">{job.schedule}</span>
                                <span className="text-muted-foreground">({job.scheduleDescription})</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleTestFunction(job.functionName)}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Test Now
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditJob(job)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Schedule
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Setup Instructions */}
          {!cronJobsEnabled && (
            <Card className="border-amber-500/50 bg-amber-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-700">
                  <Settings className="h-5 w-5" />
                  Setup Instructions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>How to Enable Automated Scheduling</AlertTitle>
                  <AlertDescription className="space-y-2 mt-2">
                    <p>
                      To enable automated scheduling, you need to run the SQL commands below in your Supabase SQL Editor.
                      These commands will set up cron jobs that automatically run the scheduled functions.
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>Copy the SQL commands below</li>
                      <li>Open your Supabase SQL Editor</li>
                      <li>Paste and run the commands</li>
                      <li>Refresh this page to see the updated status</li>
                    </ol>
                  </AlertDescription>
                </Alert>

                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono">
                    {getCronSetupInstructions()}
                  </pre>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(getCronSetupInstructions())}
                  >
                    Copy SQL
                  </Button>
                </div>

                <Alert variant="default">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Cron Schedule Format</AlertTitle>
                  <AlertDescription className="text-xs space-y-1 mt-2">
                    <p>Format: <code className="bg-muted px-1 py-0.5 rounded">minute hour day month day-of-week</code></p>
                    <ul className="list-disc list-inside space-y-1">
                      <li><code className="bg-muted px-1 py-0.5 rounded">0 9 * * *</code> = Every day at 9:00 AM</li>
                      <li><code className="bg-muted px-1 py-0.5 rounded">0 10 * * 1</code> = Every Monday at 10:00 AM</li>
                      <li><code className="bg-muted px-1 py-0.5 rounded">*/30 * * * *</code> = Every 30 minutes</li>
                      <li><code className="bg-muted px-1 py-0.5 rounded">0 0 * * 0</code> = Every Sunday at midnight</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Edit Schedule Dialog */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Schedule: {editingJob?.name}</DialogTitle>
                <DialogDescription>
                  Modify the cron schedule expression and enable/disable the job.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="enabled">Status</Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="enabled"
                      checked={editEnabled}
                      onCheckedChange={setEditEnabled}
                    />
                    <span className="text-sm text-muted-foreground">
                      {editEnabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>

                {editEnabled && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="schedule">Cron Expression</Label>
                      <Input
                        id="schedule"
                        value={editSchedule}
                        onChange={(e) => setEditSchedule(e.target.value)}
                        placeholder="0 9 * * *"
                      />
                      <p className="text-xs text-muted-foreground">
                        Current: {parseCronToDescription(editSchedule)}
                      </p>
                    </div>

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>Cron Format</AlertTitle>
                      <AlertDescription className="text-xs space-y-1">
                        <p>Format: <code className="bg-muted px-1 py-0.5 rounded">minute hour day month day-of-week</code></p>
                        <ul className="list-disc list-inside">
                          <li><code className="bg-muted px-1 py-0.5 rounded">0 9 * * *</code> = Daily at 9:00 AM</li>
                          <li><code className="bg-muted px-1 py-0.5 rounded">0 10 * * 1</code> = Monday at 10:00 AM</li>
                          <li><code className="bg-muted px-1 py-0.5 rounded">*/30 * * * *</code> = Every 30 minutes</li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                  </>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                  disabled={saving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSaveSchedule} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Generating..." : "Copy SQL Commands"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};