import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ProgramPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programData: {
    name: string;
    category: string;
    difficulty_stars: number;
    weeks: number;
    days_per_week: number;
    equipment: string;
    training_program: string;
    program_description: string;
    construction: string;
    tips: string;
    image_url: string;
  };
}

export const ProgramPreviewDialog = ({ open, onOpenChange, programData }: ProgramPreviewDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Program Preview - How User Will See It</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section */}
          <div className="relative">
            {programData.image_url && (
              <div className="w-full h-64 rounded-lg overflow-hidden mb-4">
                <img 
                  src={programData.image_url} 
                  alt={programData.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <h1 className="text-3xl font-bold mb-2">{programData.name}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary">{programData.category}</Badge>
              <Badge variant="outline">{programData.equipment}</Badge>
              <Badge variant="outline">
                {programData.weeks} Weeks / {programData.days_per_week} Days per Week
              </Badge>
              <Badge variant="outline">
                {'⭐'.repeat(programData.difficulty_stars)}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Description */}
          {programData.program_description && (
            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{programData.program_description}</p>
              </CardContent>
            </Card>
          )}

          {/* Training Program Content */}
          {programData.training_program && (
            <Card>
              <CardHeader>
                <CardTitle>Training Program</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-lg">
                  {programData.training_program}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          {programData.construction && (
            <Card>
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{programData.construction}</p>
              </CardContent>
            </Card>
          )}

          {/* Tips */}
          {programData.tips && (
            <Card>
              <CardHeader>
                <CardTitle>Tips & Guidance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{programData.tips}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};