import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Building2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { 
  generateWordDocument, 
  whyInvestContent, 
  whyCorporateContent, 
  smartyGymConceptContent 
} from "@/utils/wordExport";

const contentDocuments = [
  {
    id: "why-invest",
    title: "Why Invest in SmartyGym?",
    description: "Research-backed insights on how structured fitness elevates your performance in work, family, and life",
    icon: FileText,
    content: whyInvestContent,
    filename: "Why-Invest-in-SmartyGym",
  },
  {
    id: "why-corporate",
    title: "Why Smarty Corporate?",
    description: "The business case for corporate wellness programs with ROI data and Forbes research",
    icon: Building2,
    content: whyCorporateContent,
    filename: "Why-Smarty-Corporate",
  },
  {
    id: "smartygym-concept",
    title: "The SmartyGym Concept",
    description: "Complete platform presentation: who we are, what we offer, and how we work",
    icon: Sparkles,
    content: smartyGymConceptContent,
    filename: "The-SmartyGym-Concept",
  },
];

export const MarketingContent = () => {
  const handleDownload = async (doc: typeof contentDocuments[0]) => {
    toast.loading(`Generating ${doc.title}...`, { id: `download-${doc.id}` });
    try {
      await generateWordDocument(doc.title, doc.content, doc.filename);
      toast.success(`${doc.title} downloaded!`, { id: `download-${doc.id}` });
    } catch (error) {
      console.error("Error generating document:", error);
      toast.error("Failed to generate document", { id: `download-${doc.id}` });
    }
  };

  const handleDownloadAll = async () => {
    toast.loading("Generating all documents...", { id: "download-all" });
    try {
      for (const doc of contentDocuments) {
        await generateWordDocument(doc.title, doc.content, doc.filename);
      }
      toast.success("All documents downloaded!", { id: "download-all" });
    } catch (error) {
      console.error("Error generating documents:", error);
      toast.error("Failed to generate documents", { id: "download-all" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Marketing Content</h3>
          <p className="text-sm text-muted-foreground">
            Download marketing documents as Word files (.docx)
          </p>
        </div>
        <Button onClick={handleDownloadAll} variant="default" className="gap-2">
          <Download className="w-4 h-4" />
          Download All
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {contentDocuments.map((doc) => {
          const Icon = doc.icon;
          return (
            <Card key={doc.id} className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">{doc.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-sm">
                  {doc.description}
                </CardDescription>
                <Button 
                  onClick={() => handleDownload(doc)} 
                  variant="outline" 
                  className="w-full gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download .docx
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium">About these documents</p>
              <p className="mt-1">
                These Word documents contain text-only content with emojis and icons for easy editing.
                Perfect for presentations, proposals, and marketing materials.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
