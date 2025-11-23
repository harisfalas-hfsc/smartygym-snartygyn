import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmailComposer } from "./EmailComposer";
import { EmailTemplatesManager } from "./EmailTemplatesManager";
import { Mail, FileText } from "lucide-react";

export const EmailManager = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Email Campaigns
        </CardTitle>
        <CardDescription>
          Send bulk emails to registered users and manage templates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="compose" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="compose" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Compose Email
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Templates
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="compose">
            <EmailComposer />
          </TabsContent>
          
          <TabsContent value="templates">
            <EmailTemplatesManager />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
