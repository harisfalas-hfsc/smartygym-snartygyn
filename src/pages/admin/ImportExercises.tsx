import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Check, AlertCircle } from "lucide-react";

interface Exercise {
  id: string;
  name: string;
  body_part: string;
  equipment: string;
  target: string;
  secondary_muscles: string[];
  instructions: string[];
  gif_url: string | null;
}

// Parse CSV line handling quoted fields
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

const ImportExercises = () => {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>("");
  const [result, setResult] = useState<{ inserted: number; errors: number } | null>(null);
  const { toast } = useToast();

  const importExercises = async () => {
    setImporting(true);
    setProgress(0);
    setStatus("Fetching CSV file...");
    setResult(null);

    try {
      // Fetch the CSV file
      const response = await fetch("/data/exercises.csv");
      const csvText = await response.text();

      setStatus("Parsing CSV...");
      const lines = csvText.trim().split("\n");
      const headers = parseCSVLine(lines[0]);

      // Build column index map
      const colIndex: { [key: string]: number } = {};
      headers.forEach((h, i) => {
        colIndex[h.trim()] = i;
      });

      // Parse all exercises
      const exercises: Exercise[] = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        const values = parseCSVLine(line);

        // Collect secondary muscles
        const secondaryMuscles: string[] = [];
        for (let j = 0; j <= 5; j++) {
          const key = `secondaryMuscles/${j}`;
          if (colIndex[key] !== undefined) {
            const val = values[colIndex[key]]?.trim();
            if (val) secondaryMuscles.push(val);
          }
        }

        // Collect instructions
        const instructions: string[] = [];
        for (let j = 0; j <= 10; j++) {
          const key = `instructions/${j}`;
          if (colIndex[key] !== undefined) {
            const val = values[colIndex[key]]?.trim();
            if (val) instructions.push(val);
          }
        }

        const exercise: Exercise = {
          id: values[colIndex["id"]]?.trim(),
          name: values[colIndex["name"]]?.trim(),
          body_part: values[colIndex["bodyPart"]]?.trim(),
          equipment: values[colIndex["equipment"]]?.trim(),
          target: values[colIndex["target"]]?.trim(),
          secondary_muscles: secondaryMuscles,
          instructions: instructions,
          gif_url: null, // Set to null until actual GIFs are uploaded
        };

        if (exercise.id && exercise.name) {
          exercises.push(exercise);
        }
      }

      setStatus(`Parsed ${exercises.length} exercises. Clearing existing data...`);
      setProgress(10);

      // Clear existing exercises
      await supabase.from("exercises").delete().neq("id", "");

      setStatus("Inserting exercises in batches...");
      const batchSize = 50;
      let inserted = 0;
      let errors = 0;

      for (let i = 0; i < exercises.length; i += batchSize) {
        const batch = exercises.slice(i, i + batchSize);
        const { error } = await supabase.from("exercises").insert(batch);

        if (error) {
          console.error(`Batch error at ${i}:`, error);
          errors += batch.length;
        } else {
          inserted += batch.length;
        }

        const progressPercent = 10 + ((i + batchSize) / exercises.length) * 90;
        setProgress(Math.min(progressPercent, 100));
        setStatus(`Inserted ${inserted} of ${exercises.length} exercises...`);
      }

      setProgress(100);
      setStatus("Import complete!");
      setResult({ inserted, errors });

      toast({
        title: "Import Complete",
        description: `Successfully imported ${inserted} exercises. ${errors} errors.`,
      });
    } catch (error: any) {
      console.error("Import error:", error);
      setStatus(`Error: ${error.message}`);
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import ExerciseDB Exercises
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            This will import all 1,324 exercises from the ExerciseDB CSV file into your database.
            GIF URLs will be set to NULL until the actual GIF files are uploaded.
          </p>

          <Button
            onClick={importExercises}
            disabled={importing}
            className="w-full"
            size="lg"
          >
            {importing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Start Import
              </>
            )}
          </Button>

          {importing && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-muted-foreground text-center">{status}</p>
            </div>
          )}

          {result && (
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center gap-2 text-green-600">
                <Check className="h-5 w-5" />
                <span className="font-medium">Import Complete</span>
              </div>
              <div className="text-sm space-y-1">
                <p>✓ Inserted: {result.inserted} exercises</p>
                {result.errors > 0 && (
                  <p className="text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Errors: {result.errors}
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportExercises;
