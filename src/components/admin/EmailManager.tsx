import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmailComposer } from "./EmailComposer";
import { EmailTemplatesManager } from "./EmailTemplatesManager";
import { NewsletterManager } from "./NewsletterManager";
import { Mail, FileText, Users } from "lucide-react";

export const EmailManager = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Email & Newsletter
        </CardTitle>
        <CardDescription>
          Manage email campaigns, templates, and newsletter subscribers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="compose" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="compose" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Compose Email
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="newsletter" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Newsletter
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="compose">
            <EmailComposer />
          </TabsContent>
          
          <TabsContent value="templates">
            <EmailTemplatesManager />
          </TabsContent>
          
          <TabsContent value="newsletter">
            <NewsletterManager />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
