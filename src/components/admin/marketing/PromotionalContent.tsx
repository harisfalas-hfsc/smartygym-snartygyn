import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Eye, Calendar, Instagram, Facebook } from "lucide-react";
import { toast } from "sonner";
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import { socialMediaStrategy } from "@/utils/socialMediaContent";
import { ScrollArea } from "@/components/ui/scroll-area";

export const PromotionalContent = () => {
  const [previewOpen, setPreviewOpen] = useState(false);

  const generateStrategyDocument = async () => {
    toast.loading("Generating 30-Day Strategy...", { id: "strategy-download" });
    
    try {
      const tableRows = [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Day", bold: true })] })], width: { size: 8, type: WidthType.PERCENTAGE } }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Instagram", bold: true })] })], width: { size: 23, type: WidthType.PERCENTAGE } }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Facebook", bold: true })] })], width: { size: 23, type: WidthType.PERCENTAGE } }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "TikTok", bold: true })] })], width: { size: 23, type: WidthType.PERCENTAGE } }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Content Title", bold: true })] })], width: { size: 23, type: WidthType.PERCENTAGE } }),
          ],
        }),
        ...socialMediaStrategy.map((day) => 
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ text: day.day.toString() })] }),
              new TableCell({ children: [new Paragraph({ text: day.instagram })] }),
              new TableCell({ children: [new Paragraph({ text: day.facebook })] }),
              new TableCell({ children: [new Paragraph({ text: day.tiktok })] }),
              new TableCell({ children: [new Paragraph({ text: day.contentTitle })] }),
            ],
          })
        ),
      ];

      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              children: [new TextRun({ text: "30-Day Social Media Strategy", bold: true, size: 48 })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [new TextRun({ text: "SmartyGym Launch Campaign", italics: true, size: 28 })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),
            new Paragraph({
              children: [new TextRun({ text: "📅 Week 1: Brand Introduction", bold: true, size: 28 })],
              spacing: { before: 200, after: 100 },
            }),
            new Paragraph({
              children: [new TextRun({ text: "Focus: Introduce SmartyGym, Coach Haris, and core philosophy. Build awareness and curiosity.", size: 22 })],
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [new TextRun({ text: "📅 Week 2: Features Deep Dive", bold: true, size: 28 })],
              spacing: { before: 200, after: 100 },
            }),
            new Paragraph({
              children: [new TextRun({ text: "Focus: Showcase all major features - workouts, programs, rituals, check-ins, tools. Educate audience.", size: 22 })],
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [new TextRun({ text: "📅 Week 3: Value Proposition", bold: true, size: 28 })],
              spacing: { before: 200, after: 100 },
            }),
            new Paragraph({
              children: [new TextRun({ text: "Focus: Explain WHY expert-designed beats random. Compare plans. Build desire.", size: 22 })],
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [new TextRun({ text: "📅 Week 4: Engagement & Conversion", bold: true, size: 28 })],
              spacing: { before: 200, after: 100 },
            }),
            new Paragraph({
              children: [new TextRun({ text: "Focus: Social proof, FAQ, launch offer, urgency. Convert followers to members.", size: 22 })],
              spacing: { after: 400 },
            }),
            new Paragraph({
              children: [new TextRun({ text: "📊 Daily Posting Schedule", bold: true, size: 32 })],
              spacing: { before: 400, after: 200 },
            }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: tableRows,
            }),
            new Paragraph({
              children: [new TextRun({ text: "\n\n⏰ Best Posting Times", bold: true, size: 28 })],
              spacing: { before: 400, after: 100 },
            }),
            new Paragraph({ children: [new TextRun({ text: "• Instagram: 11 AM, 2 PM, 7 PM (local time)", size: 22 })] }),
            new Paragraph({ children: [new TextRun({ text: "• Facebook: 1 PM, 4 PM, 8 PM (local time)", size: 22 })] }),
            new Paragraph({ children: [new TextRun({ text: "• TikTok: 7 AM, 12 PM, 7 PM (local time)", size: 22 })] }),
          ],
        }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, "30-Day-Social-Media-Strategy.docx");
      toast.success("Strategy downloaded!", { id: "strategy-download" });
    } catch (error) {
      console.error("Error generating strategy:", error);
      toast.error("Failed to generate strategy", { id: "strategy-download" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Promotional Materials</h3>
        <p className="text-sm text-muted-foreground">
          Social media launch strategy and campaign materials
        </p>
      </div>

      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>30-Day Social Media Strategy</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Complete launch campaign for Instagram, Facebook & TikTok
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-muted/50 rounded-lg">
              <Instagram className="h-5 w-5 mx-auto mb-1 text-pink-500" />
              <p className="text-xs text-muted-foreground">Instagram</p>
              <p className="font-semibold">30 Posts</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <Facebook className="h-5 w-5 mx-auto mb-1 text-blue-500" />
              <p className="text-xs text-muted-foreground">Facebook</p>
              <p className="font-semibold">30 Posts</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <svg className="h-5 w-5 mx-auto mb-1" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
              </svg>
              <p className="text-xs text-muted-foreground">TikTok</p>
              <p className="font-semibold">30 Videos</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={() => setPreviewOpen(true)} variant="outline" className="flex-1 gap-2">
              <Eye className="w-4 h-4" />
              Preview Strategy
            </Button>
            <Button onClick={generateStrategyDocument} className="flex-1 gap-2">
              <Download className="w-4 h-4" />
              Download .docx
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Strategy Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>30-Day Social Media Strategy</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 pr-4">
              <div className="grid grid-cols-4 gap-2 text-xs font-semibold bg-muted p-2 rounded sticky top-0">
                <span>Day</span>
                <span>Instagram</span>
                <span>Facebook</span>
                <span>TikTok</span>
              </div>
              {socialMediaStrategy.map((day) => (
                <div key={day.day} className="grid grid-cols-4 gap-2 text-sm p-2 border-b">
                  <span className="font-bold text-primary">Day {day.day}</span>
                  <span>{day.instagram}</span>
                  <span>{day.facebook}</span>
                  <span>{day.tiktok}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>Close</Button>
            <Button onClick={generateStrategyDocument} className="gap-2">
              <Download className="w-4 h-4" />
              Download .docx
            </Button>
          </div>
        </DialogContent>
      </Dialog>


      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-2">📌 Strategy Overview</p>
            <ul className="space-y-1">
              <li>• <strong>Week 1:</strong> Brand Introduction - Who we are, Coach Haris, philosophy</li>
              <li>• <strong>Week 2:</strong> Features Deep Dive - Workouts, programs, rituals, tools</li>
              <li>• <strong>Week 3:</strong> Value Proposition - Why expert design, plans comparison</li>
              <li>• <strong>Week 4:</strong> Conversion - Success stories, FAQ, launch offer, urgency</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
