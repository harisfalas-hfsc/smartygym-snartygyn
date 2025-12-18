import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, FileText, Building2, Sparkles, Eye, Calendar } from "lucide-react";
import { toast } from "sonner";
import { 
  generateWordDocument, 
  whyInvestContent, 
  whyCorporateContent, 
  smartyGymConceptContent,
  ContentSection
} from "@/utils/wordExport";
import { dailyContentDocuments, DailyContent } from "@/utils/socialMediaContent";
import { ScrollArea } from "@/components/ui/scroll-area";

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

const renderContentPreview = (sections: ContentSection[]) => {
  return sections.map((section, idx) => {
    if (section.type === 'heading') {
      const HeadingTag = section.level === 1 ? 'h2' : section.level === 2 ? 'h3' : 'h4';
      const className = section.level === 1 ? 'text-xl font-bold mt-4 mb-2' : 
                        section.level === 2 ? 'text-lg font-semibold mt-3 mb-2' : 
                        'text-base font-medium mt-2 mb-1';
      return <HeadingTag key={idx} className={className}>{section.content}</HeadingTag>;
    } else if (section.type === 'paragraph') {
      return <p key={idx} className="text-sm text-muted-foreground mb-2">{section.content}</p>;
    } else if (section.type === 'bullet') {
      return <p key={idx} className="text-sm text-muted-foreground mb-1 pl-4">• {section.content}</p>;
    }
    return null;
  });
};

const renderDailyContentPreview = (content: DailyContent) => {
  return (
    <div className="space-y-4">
      <div className="bg-muted/50 p-3 rounded-lg">
        <p className="text-xs text-muted-foreground mb-1">Theme</p>
        <p className="font-medium">{content.theme}</p>
      </div>
      
      <div>
        <h4 className="font-semibold text-primary mb-2">📸 Instagram</h4>
        <pre className="text-sm whitespace-pre-wrap bg-muted/30 p-3 rounded-lg">{content.instagram}</pre>
      </div>
      
      <div>
        <h4 className="font-semibold text-primary mb-2">📘 Facebook</h4>
        <pre className="text-sm whitespace-pre-wrap bg-muted/30 p-3 rounded-lg">{content.facebook}</pre>
      </div>
      
      <div>
        <h4 className="font-semibold text-primary mb-2">🎬 TikTok</h4>
        <pre className="text-sm whitespace-pre-wrap bg-muted/30 p-3 rounded-lg">{content.tiktok}</pre>
      </div>
      
      <div>
        <h4 className="font-semibold text-primary mb-2"># Hashtags</h4>
        <p className="text-sm text-muted-foreground">{content.hashtags}</p>
      </div>
    </div>
  );
};

export const MarketingContent = () => {
  const [previewDoc, setPreviewDoc] = useState<typeof contentDocuments[0] | null>(null);
  const [previewDailyContent, setPreviewDailyContent] = useState<DailyContent | null>(null);

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
      for (const content of dailyContentDocuments) {
        await generateDailyContentWord(content);
      }
      toast.success("All documents downloaded!", { id: "download-all" });
    } catch (error) {
      console.error("Error generating documents:", error);
      toast.error("Failed to generate documents", { id: "download-all" });
    }
  };

  const generateDailyContentWord = async (content: DailyContent) => {
    const sections: ContentSection[] = [
      { type: 'heading', content: `📅 Day ${content.day}: ${content.title}`, level: 1 },
      { type: 'paragraph', content: `Theme: ${content.theme}` },
      { type: 'heading', content: '📸 INSTAGRAM', level: 2 },
      { type: 'paragraph', content: content.instagram },
      { type: 'heading', content: '📘 FACEBOOK', level: 2 },
      { type: 'paragraph', content: content.facebook },
      { type: 'heading', content: '🎬 TIKTOK', level: 2 },
      { type: 'paragraph', content: content.tiktok },
      { type: 'heading', content: '# HASHTAGS', level: 2 },
      { type: 'paragraph', content: content.hashtags },
    ];
    await generateWordDocument(`Day ${content.day}: ${content.title}`, sections, `Day-${content.day}-${content.title.replace(/\s+/g, '-')}`);
  };

  const handleDownloadDailyContent = async (content: DailyContent) => {
    toast.loading(`Generating Day ${content.day}...`, { id: `download-day-${content.day}` });
    try {
      await generateDailyContentWord(content);
      toast.success(`Day ${content.day} downloaded!`, { id: `download-day-${content.day}` });
    } catch (error) {
      console.error("Error generating document:", error);
      toast.error("Failed to generate document", { id: `download-day-${content.day}` });
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

      {/* Main Documents */}
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
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setPreviewDoc(doc)} 
                    variant="outline" 
                    size="sm"
                    className="flex-1 gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </Button>
                  <Button 
                    onClick={() => handleDownload(doc)} 
                    variant="outline" 
                    size="sm"
                    className="flex-1 gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 30 Day Content */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">30-Day Social Media Content</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {dailyContentDocuments.map((content) => (
            <Card key={content.day} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">Day {content.day}</span>
                  <span className="text-xs text-muted-foreground">{content.theme}</span>
                </div>
                <p className="text-sm font-medium truncate" title={content.title}>{content.title}</p>
                <div className="flex gap-1">
                  <Button 
                    onClick={() => setPreviewDailyContent(content)} 
                    variant="outline" 
                    size="sm"
                    className="flex-1 h-7 px-2"
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                  <Button 
                    onClick={() => handleDownloadDailyContent(content)} 
                    variant="outline" 
                    size="sm"
                    className="flex-1 h-7 px-2"
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Preview Dialog for Main Documents */}
      <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{previewDoc?.title}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            {previewDoc && renderContentPreview(previewDoc.content)}
          </ScrollArea>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setPreviewDoc(null)}>Close</Button>
            <Button onClick={() => previewDoc && handleDownload(previewDoc)} className="gap-2">
              <Download className="w-4 h-4" />
              Download .docx
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog for Daily Content */}
      <Dialog open={!!previewDailyContent} onOpenChange={() => setPreviewDailyContent(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Day {previewDailyContent?.day}: {previewDailyContent?.title}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            {previewDailyContent && renderDailyContentPreview(previewDailyContent)}
          </ScrollArea>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setPreviewDailyContent(null)}>Close</Button>
            <Button onClick={() => previewDailyContent && handleDownloadDailyContent(previewDailyContent)} className="gap-2">
              <Download className="w-4 h-4" />
              Download .docx
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
