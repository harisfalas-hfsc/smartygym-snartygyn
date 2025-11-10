import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAdminRole } from "@/hooks/useAdminRole";

export default function MigrateContent() {
  const navigate = useNavigate();
  const { isAdmin, loading } = useAdminRole();
  const { toast } = useToast();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You don't have permission to access this tool.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Content Migration Instructions</CardTitle>
            <CardDescription>
              Follow these steps to migrate your hardcoded content to the database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertDescription>
                <h4 className="font-semibold mb-2">Migration Steps:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Copy all workout data from <code className="bg-muted px-1 rounded">src/pages/IndividualWorkout.tsx</code></li>
                  <li>Copy all program data from <code className="bg-muted px-1 rounded">src/pages/IndividualTrainingProgram.tsx</code></li>
                  <li>Use the admin backoffice to manually add each workout and program</li>
                  <li>Or send the data to the migrate-content edge function via API</li>
                </ol>
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Option 1: Manual Entry (Recommended)</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Use the admin backoffice to create workouts and programs one at a time with full control.
                </p>
                <Button onClick={() => navigate("/admin")}>
                  Go to Admin Backoffice
                </Button>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Option 2: Bulk Import via API</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  For bulk import, you'll need to call the <code className="bg-muted px-1 rounded">migrate-content</code> edge function 
                  with properly formatted workout and program data.
                </p>
                <Alert>
                  <AlertDescription className="text-xs">
                    <pre className="overflow-x-auto">
{`// Example API call
const response = await supabase.functions.invoke('migrate-content', {
  body: {
    workouts: [/* array of workout objects */],
    programs: [/* array of program objects */]
  }
});`}
                    </pre>
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
