import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MobilePushTargetingPanel } from "./MobilePushTargetingPanel";
import { MobilePushTemplates } from "./MobilePushTemplates";
import { Users, FileText } from "lucide-react";

export const MobileAppPushManager = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Mobile App Push Notifications</h3>
        <p className="text-sm text-muted-foreground">
          Manage targeting and templates for AppMySite manual push notifications. 
          Users control their preferences in the mobile app settings.
        </p>
      </div>

      <Tabs defaultValue="targeting" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="targeting" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Targeting
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="targeting" className="mt-4">
          <MobilePushTargetingPanel />
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <MobilePushTemplates />
        </TabsContent>
      </Tabs>
    </div>
  );
};
