import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Database, Info } from "lucide-react";

export const ContentImporter = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Content Management
          </CardTitle>
          <CardDescription>
            Manage workouts and training programs through the admin backoffice
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Use the Workouts Manager and Programs Manager tabs to add, edit, and manage all your content directly in the admin backoffice.
            </AlertDescription>
          </Alert>

          <Button 
            onClick={() => window.open('/admin', '_blank')}
            variant="default"
            className="w-full"
          >
            <Database className="h-4 w-4 mr-2" />
            Go to Admin Backoffice
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
