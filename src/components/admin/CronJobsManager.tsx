import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Play, Pencil, Trash2, Plus, RefreshCw, AlertCircle, CheckCircle, Calendar, Zap, Info, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CronJobMetadata {
  id: string;
  job_name: string;
  display_name: string;
  description: string | null;
  category: string | null;
  edge_function_name: string | null;
  request_body: unknown;
  is_critical: boolean | null;
  created_at: string;
  updated_at: string;
}

const CATEGORIES = [
  { value: 'content_generation', label: 'Content Generation', color: 'bg-purple-500' },
  { value: 'notifications', label: 'Notifications', color: 'bg-blue-500' },
  { value: 'maintenance', label: 'Maintenance', color: 'bg-orange-500' },
  { value: 'general', label: 'General', color: 'bg-gray-500' }
];

const SCHEDULE_PRESETS = [
  { label: 'Every minute', value: '* * * * *' },
  { label: 'Every 5 minutes', value: '*/5 * * * *' },
  { label: 'Every 10 minutes', value: '*/10 * * * *' },
  { label: 'Every 30 minutes', value: '*/30 * * * *' },
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Daily at midnight UTC', value: '0 0 * * *' },
  { label: 'Daily at 3 AM UTC', value: '0 3 * * *' },
  { label: 'Daily at 6 AM UTC', value: '0 6 * * *' },
  { label: 'Daily at 9 AM UTC', value: '0 9 * * *' },
  { label: 'Weekly on Monday', value: '0 9 * * 1' },
  { label: 'Weekly on Sunday', value: '0 9 * * 0' }
];

const AVAILABLE_FUNCTIONS = [
  'generate-workout-of-day',
  'generate-daily-ritual',
  'send-scheduled-notifications',
  'send-scheduled-emails',
  'send-automated-messages',
  'send-renewal-reminders',
  'send-workout-reminders',
  'send-checkin-reminders',
  'run-system-health-audit',
  'archive-old-wods',
  'refresh-seo-metadata',
  'sync-stripe-subscriptions',
  'process-pending-notifications'
];

export function CronJobsManager() {
  const [jobs, setJobs] = useState<CronJobMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<CronJobMetadata | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [cronEnabled, setCronEnabled] = useState(false);

  // Form states
  const [editSchedule, setEditSchedule] = useState('');
  const [addForm, setAddForm] = useState({
    job_name: '',
    display_name: '',
    description: '',
    category: 'general',
    edge_function_name: '',
    schedule: '0 9 * * *',
    is_critical: false
  });

  useEffect(() => {
    fetchJobs();
    checkCronEnabled();
  }, []);

  const checkCronEnabled = async () => {
    try {
      const { data, error } = await supabase.rpc('pg_cron_enabled');
      if (!error && data) {
        setCronEnabled(true);
      }
    } catch (e) {
      console.log("pg_cron check failed:", e);
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cron_job_metadata')
        .select('*')
        .order('category', { ascending: true })
        .order('display_name', { ascending: true });

      if (error) throw error;
      setJobs(data || []);
    } catch (error: any) {
      console.error("Failed to fetch cron jobs:", error);
      toast.error("Failed to load cron jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async (job: CronJobMetadata) => {
    setTesting(job.job_name);
    try {
      const { data, error } = await supabase.functions.invoke(job.edge_function_name, {
        body: job.request_body || {}
      });

      if (error) throw error;
      toast.success(`${job.display_name} executed successfully`);
    } catch (error: any) {
      toast.error(`Test failed: ${error.message}`);
    } finally {
      setTesting(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedJob) return;
    
    try {
      const { error } = await supabase
        .from('cron_job_metadata')
        .delete()
        .eq('job_name', selectedJob.job_name);

      if (error) throw error;
      
      toast.success("Cron job deleted");
      setShowDeleteConfirm(false);
      setSelectedJob(null);
      fetchJobs();
    } catch (error: any) {
      toast.error(`Delete failed: ${error.message}`);
    }
  };

  const handleAdd = async () => {
    if (!addForm.job_name || !addForm.edge_function_name) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      const { error } = await supabase
        .from('cron_job_metadata')
        .insert({
          job_name: addForm.job_name.toLowerCase().replace(/\s+/g, '-'),
          display_name: addForm.display_name || addForm.job_name,
          description: addForm.description,
          category: addForm.category,
          edge_function_name: addForm.edge_function_name,
          request_body: {},
          is_critical: addForm.is_critical
        });

      if (error) throw error;

      toast.success("Cron job added successfully");
      toast.info("Note: Schedule the actual cron job via SQL for it to run automatically", {
        duration: 5000
      });
      
      setShowAddDialog(false);
      setAddForm({
        job_name: '',
        display_name: '',
        description: '',
        category: 'general',
        edge_function_name: '',
        schedule: '0 9 * * *',
        is_critical: false
      });
      fetchJobs();
    } catch (error: any) {
      toast.error(`Add failed: ${error.message}`);
    }
  };

  const handleEditSave = async () => {
    if (!selectedJob) return;

    try {
      const { error } = await supabase
        .from('cron_job_metadata')
        .update({
          display_name: selectedJob.display_name,
          description: selectedJob.description,
          category: selectedJob.category,
          is_critical: selectedJob.is_critical,
          updated_at: new Date().toISOString()
        })
        .eq('job_name', selectedJob.job_name);

      if (error) throw error;
      
      toast.success("Cron job updated");
      setShowEditDialog(false);
      fetchJobs();
    } catch (error: any) {
      toast.error(`Update failed: ${error.message}`);
    }
  };

  const copyCronSQL = (job: CronJobMetadata, schedule: string) => {
    const projectUrl = 'https://cvccrvyimyzrxcwzmxwk.supabase.co';
    const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2Y2NydnlpbXl6cnhjd3pteHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MTc2NjIsImV4cCI6MjA3NjE5MzY2Mn0.XU_h4CYRiQ7VN079laFHSVMrzB6urOhQZFoTagU_Wno';
    
    const sql = `-- Schedule cron job: ${job.display_name}
SELECT cron.schedule(
  '${job.job_name}',
  '${schedule}',
  $$
  SELECT net.http_post(
    url:='${projectUrl}/functions/v1/${job.edge_function_name}',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer ${anonKey}"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);`;
    
    navigator.clipboard.writeText(sql);
    toast.success("SQL copied to clipboard");
  };

  const getCategoryBadge = (category: string) => {
    const cat = CATEGORIES.find(c => c.value === category) || CATEGORIES[3];
    return <Badge className={`${cat.color} text-white`}>{cat.label}</Badge>;
  };

  const parseCronToHuman = (schedule: string): string => {
    const preset = SCHEDULE_PRESETS.find(p => p.value === schedule);
    if (preset) return preset.label;
    
    const parts = schedule.split(' ');
    if (parts.length !== 5) return schedule;
    
    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
    
    if (minute === '*' && hour === '*') return 'Every minute';
    if (minute.startsWith('*/')) return `Every ${minute.slice(2)} minutes`;
    if (hour === '*') return `At minute ${minute} of every hour`;
    if (dayOfWeek !== '*') {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return `${days[parseInt(dayOfWeek)] || dayOfWeek} at ${hour}:${minute.padStart(2, '0')} UTC`;
    }
    return `Daily at ${hour}:${minute.padStart(2, '0')} UTC`;
  };

  const groupedJobs = jobs.reduce((acc, job) => {
    const cat = job.category || 'general';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(job);
    return acc;
  }, {} as Record<string, CronJobMetadata[]>);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="h-6 w-6" />
            Cron Jobs Manager
          </h2>
          <p className="text-muted-foreground">
            Manage scheduled tasks and automated functions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchJobs}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Cron Job
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      <Alert variant={cronEnabled ? "default" : "destructive"}>
        {cronEnabled ? (
          <CheckCircle className="h-4 w-4" />
        ) : (
          <AlertCircle className="h-4 w-4" />
        )}
        <AlertTitle>
          {cronEnabled ? "Cron Engine Active" : "Cron Engine Status Unknown"}
        </AlertTitle>
        <AlertDescription>
          {cronEnabled 
            ? "pg_cron extension is enabled. Scheduled jobs will run automatically."
            : "Could not verify pg_cron status. Jobs may need manual SQL scheduling."}
        </AlertDescription>
      </Alert>

      {/* Jobs by Category */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Jobs ({jobs.length})</TabsTrigger>
          {CATEGORIES.map(cat => {
            const count = groupedJobs[cat.value]?.length || 0;
            if (count === 0) return null;
            return (
              <TabsTrigger key={cat.value} value={cat.value}>
                {cat.label} ({count})
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <div className="grid gap-4">
            {jobs.map(job => (
              <JobCard 
                key={job.job_name}
                job={job}
                testing={testing}
                onView={() => { setSelectedJob(job); setShowDetailsDialog(true); }}
                onEdit={() => { setSelectedJob(job); setShowEditDialog(true); }}
                onDelete={() => { setSelectedJob(job); setShowDeleteConfirm(true); }}
                onTest={() => handleTest(job)}
                getCategoryBadge={getCategoryBadge}
              />
            ))}
          </div>
        </TabsContent>

        {CATEGORIES.map(cat => (
          <TabsContent key={cat.value} value={cat.value} className="mt-4">
            <div className="grid gap-4">
              {(groupedJobs[cat.value] || []).map(job => (
                <JobCard 
                  key={job.job_name}
                  job={job}
                  testing={testing}
                  onView={() => { setSelectedJob(job); setShowDetailsDialog(true); }}
                  onEdit={() => { setSelectedJob(job); setShowEditDialog(true); }}
                  onDelete={() => { setSelectedJob(job); setShowDeleteConfirm(true); }}
                  onTest={() => handleTest(job)}
                  getCategoryBadge={getCategoryBadge}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* View Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              {selectedJob?.display_name}
            </DialogTitle>
            <DialogDescription>
              Job details and configuration
            </DialogDescription>
          </DialogHeader>
          {selectedJob && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Job Name</Label>
                  <p className="font-mono text-sm">{selectedJob.job_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Category</Label>
                  <div className="mt-1">{getCategoryBadge(selectedJob.category)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Edge Function</Label>
                  <p className="font-mono text-sm">{selectedJob.edge_function_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Critical</Label>
                  <p>{selectedJob.is_critical ? '✅ Yes' : '❌ No'}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="text-sm">{selectedJob.description || 'No description provided'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Request Body</Label>
                <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                  {JSON.stringify(selectedJob.request_body || {}, null, 2)}
                </pre>
              </div>
              <div className="flex gap-2">
                <Label className="text-muted-foreground">Last Updated:</Label>
                <span className="text-sm">{new Date(selectedJob.updated_at).toLocaleString()}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
            <Button onClick={() => { setShowDetailsDialog(false); setShowEditDialog(true); }}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Cron Job</DialogTitle>
            <DialogDescription>
              Update job metadata and schedule
            </DialogDescription>
          </DialogHeader>
          {selectedJob && (
            <div className="space-y-4">
              <div>
                <Label>Display Name</Label>
                <Input 
                  value={selectedJob.display_name}
                  onChange={(e) => setSelectedJob({...selectedJob, display_name: e.target.value})}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea 
                  value={selectedJob.description}
                  onChange={(e) => setSelectedJob({...selectedJob, description: e.target.value})}
                  rows={3}
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select 
                  value={selectedJob.category}
                  onValueChange={(v) => setSelectedJob({...selectedJob, category: v})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={selectedJob.is_critical}
                  onCheckedChange={(v) => setSelectedJob({...selectedJob, is_critical: v})}
                />
                <Label>Critical job (alerts on failure)</Label>
              </div>

              <Alert>
                <Calendar className="h-4 w-4" />
                <AlertTitle>Schedule Change</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p className="text-sm">To change the schedule, select a preset and copy the SQL:</p>
                  <Select value={editSchedule} onValueChange={setEditSchedule}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select schedule..." />
                    </SelectTrigger>
                    <SelectContent>
                      {SCHEDULE_PRESETS.map(preset => (
                        <SelectItem key={preset.value} value={preset.value}>
                          {preset.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {editSchedule && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyCronSQL(selectedJob, editSchedule)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy SQL
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Cron Job</DialogTitle>
            <DialogDescription>
              Create a new scheduled task
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Job Name *</Label>
              <Input 
                value={addForm.job_name}
                onChange={(e) => setAddForm({...addForm, job_name: e.target.value})}
                placeholder="e.g., my-custom-job"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Will be converted to lowercase with hyphens
              </p>
            </div>
            <div>
              <Label>Display Name</Label>
              <Input 
                value={addForm.display_name}
                onChange={(e) => setAddForm({...addForm, display_name: e.target.value})}
                placeholder="e.g., My Custom Job"
              />
            </div>
            <div>
              <Label>Edge Function *</Label>
              <Select 
                value={addForm.edge_function_name}
                onValueChange={(v) => setAddForm({...addForm, edge_function_name: v})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select function..." />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_FUNCTIONS.map(fn => (
                    <SelectItem key={fn} value={fn}>{fn}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Schedule</Label>
              <Select 
                value={addForm.schedule}
                onValueChange={(v) => setAddForm({...addForm, schedule: v})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SCHEDULE_PRESETS.map(preset => (
                    <SelectItem key={preset.value} value={preset.value}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Category</Label>
              <Select 
                value={addForm.category}
                onValueChange={(v) => setAddForm({...addForm, category: v})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea 
                value={addForm.description}
                onChange={(e) => setAddForm({...addForm, description: e.target.value})}
                placeholder="What does this job do?"
                rows={2}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                checked={addForm.is_critical}
                onCheckedChange={(v) => setAddForm({...addForm, is_critical: v})}
              />
              <Label>Critical job</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Cron Job?</DialogTitle>
            <DialogDescription>
              This will remove "{selectedJob?.display_name}" from the system. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Job Card Component
function JobCard({ 
  job, 
  testing, 
  onView, 
  onEdit, 
  onDelete, 
  onTest,
  getCategoryBadge 
}: {
  job: CronJobMetadata;
  testing: string | null;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onTest: () => void;
  getCategoryBadge: (cat: string) => JSX.Element;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold truncate">{job.display_name}</h3>
              {getCategoryBadge(job.category)}
              {job.is_critical && (
                <Badge variant="outline" className="border-red-500 text-red-500">
                  <Zap className="h-3 w-3 mr-1" />
                  Critical
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {job.description || 'No description'}
            </p>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="font-mono">{job.edge_function_name}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="ghost" size="sm" onClick={onView}>
              <Info className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onTest}
              disabled={testing === job.job_name}
            >
              {testing === job.job_name ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete} className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
