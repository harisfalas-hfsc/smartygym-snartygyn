import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, CheckCircle, AlertCircle, Database, FileDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

export const ContentImporter = () => {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{
    workouts: { success: number; failed: number; errors?: string[] };
    programs: { success: number; failed: number; errors?: string[] };
  } | null>(null);
  const [workoutJson, setWorkoutJson] = useState("");
  const [programJson, setProgramJson] = useState("");
  const [showJsonInputs, setShowJsonInputs] = useState(false);
  const { toast } = useToast();

  const handleImport = async () => {
    if (!workoutJson && !programJson) {
      toast({
        title: "No Data Provided",
        description: "Please paste workout and/or program data in JSON format",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);
    setProgress(0);
    setResults(null);

    try {
      let workoutData = null;
      let programData = null;

      // Parse JSON data
      if (workoutJson) {
        try {
          workoutData = JSON.parse(workoutJson);
          setProgress(25);
        } catch (e) {
          throw new Error("Invalid workout JSON format");
        }
      }

      if (programJson) {
        try {
          programData = JSON.parse(programJson);
          setProgress(50);
        } catch (e) {
          throw new Error("Invalid program JSON format");
        }
      }

      // Call migration edge function
      const { data, error } = await supabase.functions.invoke('migrate-workout-data', {
        body: {
          workoutData,
          programData,
          mode: 'import'
        }
      });

      if (error) throw error;

      setProgress(100);
      setResults(data);
      
      toast({
        title: "Import Complete!",
        description: `Workouts: ${data.workouts.success} imported, ${data.workouts.failed} failed. Programs: ${data.programs.success} imported, ${data.programs.failed} failed.`,
      });

    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import content",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const handleClearDatabase = async () => {
    if (!confirm('Are you sure you want to delete ALL workouts and programs from the database? This cannot be undone!')) {
      return;
    }

    try {
      const { error: workoutsError } = await supabase
        .from('admin_workouts')
        .delete()
        .neq('id', '');

      const { error: programsError } = await supabase
        .from('admin_training_programs')
        .delete()
        .neq('id', '');

      if (workoutsError) throw workoutsError;
      if (programsError) throw programsError;

      toast({
        title: "Database Cleared",
        description: "All workouts and programs have been deleted",
      });
      
      setResults(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to clear database",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Content Migration Tool
          </CardTitle>
          <CardDescription>
            Import all hardcoded workouts and training programs into the database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Migration Instructions:</strong> To migrate your hardcoded workouts and programs:
              <ol className="list-decimal list-inside mt-2 space-y-2">
                <li>Open <code>src/pages/IndividualWorkout.tsx</code> in Dev Mode</li>
                <li>Copy the entire <code>workoutData</code> object (lines 197-4560)</li>
                <li>Convert it to an array format: <code>[{`{id: "challenge-002", ...workoutData["challenge-002"]}`}, ...]</code></li>
                <li>Paste it in the "Workout Data JSON" field below</li>
                <li>Repeat for <code>programData</code> from <code>IndividualTrainingProgram.tsx</code></li>
                <li>Click "Import to Database"</li>
              </ol>
              <br />
              <strong>Alternative:</strong> I can provide a pre-formatted migration script if you share the data with me.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Button 
              onClick={() => setShowJsonInputs(!showJsonInputs)}
              variant="outline"
              className="w-full"
            >
              <FileDown className="h-4 w-4 mr-2" />
              {showJsonInputs ? "Hide" : "Show"} Data Input Fields
            </Button>
          </div>

          {showJsonInputs && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Workout Data JSON (Array Format)</label>
                <Textarea
                  placeholder='[{"id": "challenge-002", "name": "Starter Gauntlet", ...}, ...]'
                  value={workoutJson}
                  onChange={(e) => setWorkoutJson(e.target.value)}
                  rows={10}
                  className="font-mono text-xs"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Program Data JSON (Array Format)</label>
                <Textarea
                  placeholder='[{"id": "T-F001", "name": "Functional Strength Builder", ...}, ...]'
                  value={programJson}
                  onChange={(e) => setProgramJson(e.target.value)}
                  rows={10}
                  className="font-mono text-xs"
                />
              </div>

              <Button 
                onClick={handleImport}
                disabled={importing || (!workoutJson && !programJson)}
                className="w-full"
              >
                {importing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import to Database
                  </>
                )}
              </Button>
            </div>
          )}

          <div className="flex gap-4">
            <Button 
              onClick={() => window.open('/admin', '_blank')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              Go to Admin Backoffice
            </Button>

            <Button 
              onClick={handleClearDatabase}
              variant="destructive"
              disabled={importing}
            >
              Clear Database
            </Button>
          </div>

          {importing && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-muted-foreground">Importing content...</p>
            </div>
          )}

          {results && (
            <div className="space-y-4 pt-4">
              <div className="flex items-start gap-2 text-green-600">
                <CheckCircle className="h-5 w-5 mt-0.5" />
                <div className="w-full">
                  <p className="font-semibold">Import Complete!</p>
                  <p className="text-sm">
                    Workouts: {results.workouts.success} imported, {results.workouts.failed} failed
                  </p>
                  <p className="text-sm">
                    Programs: {results.programs.success} imported, {results.programs.failed} failed
                  </p>
                  
                  {(results.workouts.errors && results.workouts.errors.length > 0) && (
                    <details className="mt-2">
                      <summary className="text-sm text-red-600 cursor-pointer">
                        View {results.workouts.errors.length} workout errors
                      </summary>
                      <div className="mt-2 p-2 bg-red-50 rounded text-xs max-h-40 overflow-auto">
                        {results.workouts.errors.map((err, i) => (
                          <div key={i} className="text-red-700">{err}</div>
                        ))}
                      </div>
                    </details>
                  )}
                  
                  {(results.programs.errors && results.programs.errors.length > 0) && (
                    <details className="mt-2">
                      <summary className="text-sm text-red-600 cursor-pointer">
                        View {results.programs.errors.length} program errors
                      </summary>
                      <div className="mt-2 p-2 bg-red-50 rounded text-xs max-h-40 overflow-auto">
                        {results.programs.errors.map((err, i) => (
                          <div key={i} className="text-red-700">{err}</div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
