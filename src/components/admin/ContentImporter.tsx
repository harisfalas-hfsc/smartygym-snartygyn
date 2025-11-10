import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, CheckCircle, AlertCircle, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const ContentImporter = () => {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{
    workouts: { success: number; failed: number };
    programs: { success: number; failed: number };
  } | null>(null);
  const { toast } = useToast();

  const handleImport = async () => {
    setImporting(true);
    setProgress(0);
    setResults(null);

    try {
      toast({
        title: "Manual Import Required",
        description: "The workout and program data is embedded in React components and cannot be automatically extracted. Please use the admin backoffice to add content manually, or extract the data from IndividualWorkout.tsx and IndividualTrainingProgram.tsx files.",
        duration: 8000,
      });
      
      setProgress(100);
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
              <strong>Important:</strong> Your workout and program data is currently embedded in React components 
              (IndividualWorkout.tsx and IndividualTrainingProgram.tsx). This tool cannot automatically extract it.
              <br /><br />
              <strong>You have two options:</strong>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Use the admin backoffice to manually create workouts and programs</li>
                <li>Extract data from the source files and use the migrate-content API to bulk import</li>
              </ol>
            </AlertDescription>
          </Alert>

          <div className="flex gap-4">
            <Button 
              onClick={() => window.open('/admin', '_blank')}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
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
                <div>
                  <p className="font-semibold">Import Complete!</p>
                  <p className="text-sm">
                    Workouts: {results.workouts.success} imported, {results.workouts.failed} failed
                  </p>
                  <p className="text-sm">
                    Programs: {results.programs.success} imported, {results.programs.failed} failed
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
