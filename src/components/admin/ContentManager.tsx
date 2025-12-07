import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkoutsManager } from "./WorkoutsManager";
import { ProgramsManager } from "./ProgramsManager";
import { WODManager } from "./WODManager";
import { RitualsManager } from "./RitualsManager";
import { Dumbbell, Calendar, Flame, Sparkles } from "lucide-react";

interface ContentManagerProps {
  externalWorkoutDialog?: boolean;
  setExternalWorkoutDialog?: (value: boolean) => void;
  externalProgramDialog?: boolean;
  setExternalProgramDialog?: (value: boolean) => void;
  externalRitualDialog?: boolean;
  setExternalRitualDialog?: (value: boolean) => void;
  activeInnerTab?: string;
}

export const ContentManager = ({
  externalWorkoutDialog,
  setExternalWorkoutDialog,
  externalProgramDialog,
  setExternalProgramDialog,
  externalRitualDialog,
  setExternalRitualDialog,
  activeInnerTab,
}: ContentManagerProps) => {
  const [innerTab, setInnerTab] = useState(activeInnerTab || "workouts");

  useEffect(() => {
    if (activeInnerTab) {
      setInnerTab(activeInnerTab);
    }
  }, [activeInnerTab]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="w-5 h-5" />
          Content Library
        </CardTitle>
        <CardDescription>
          Manage workouts, training programs, WOD, and Daily Smarty Rituals
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={innerTab} onValueChange={setInnerTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="workouts" className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4" />
              Workouts
            </TabsTrigger>
            <TabsTrigger value="programs" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Programs
            </TabsTrigger>
            <TabsTrigger value="wod" className="flex items-center gap-2">
              <Flame className="w-4 h-4" />
              WOD
            </TabsTrigger>
            <TabsTrigger value="rituals" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Rituals
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

          <TabsContent value="wod">
            <WODManager />
          </TabsContent>

          <TabsContent value="rituals">
            <RitualsManager 
              externalDialog={externalRitualDialog}
              setExternalDialog={setExternalRitualDialog}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};