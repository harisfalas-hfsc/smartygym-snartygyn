import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkoutsManager } from "./WorkoutsManager";
import { ProgramsManager } from "./ProgramsManager";
import { Dumbbell, Calendar } from "lucide-react";

interface ContentManagerProps {
  externalWorkoutDialog?: boolean;
  setExternalWorkoutDialog?: (value: boolean) => void;
  externalProgramDialog?: boolean;
  setExternalProgramDialog?: (value: boolean) => void;
}

export const ContentManager = ({
  externalWorkoutDialog,
  setExternalWorkoutDialog,
  externalProgramDialog,
  setExternalProgramDialog,
}: ContentManagerProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="w-5 h-5" />
          Content Library
        </CardTitle>
        <CardDescription>
          Manage workouts and training programs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="workouts" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="workouts" className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4" />
              Workouts
            </TabsTrigger>
            <TabsTrigger value="programs" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Programs
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="workouts">
            <WorkoutsManager 
              externalDialog={externalWorkoutDialog}
              setExternalDialog={setExternalWorkoutDialog}
            />
          </TabsContent>
          
          <TabsContent value="programs">
            <ProgramsManager 
              externalDialog={externalProgramDialog}
              setExternalDialog={setExternalProgramDialog}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
