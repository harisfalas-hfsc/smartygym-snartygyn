import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, Image } from "lucide-react";
import { useActivityLog } from "@/hooks/useActivityLog";
import { toast } from "sonner";
import html2canvas from "html2canvas";

interface LogBookExportProps {
  userId: string;
  filter: string;
}

export const LogBookExport = ({ userId, filter }: LogBookExportProps) => {
  const { activities } = useActivityLog(userId, filter === 'all' ? undefined : filter);

  const exportToPDF = async () => {
    try {
      // Capture calendar
      const calendarElement = document.getElementById('logbook-calendar');
      const chartsElement = document.getElementById('logbook-charts');

      if (!calendarElement || !chartsElement) {
        toast.error('Unable to find elements to export');
        return;
      }

      toast.info('Generating PDF... This may take a moment');

      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Please allow popups to export PDF');
        return;
      }

      // Capture calendar as image
      const calendarCanvas = await html2canvas(calendarElement);
      const calendarImg = calendarCanvas.toDataURL('image/png');

      // Capture charts as image
      const chartsCanvas = await html2canvas(chartsElement);
      const chartsImg = chartsCanvas.toDataURL('image/png');

      // Generate summary statistics
      const workouts = activities.filter(a => a.content_type === 'workout' && a.action_type === 'completed').length;
      const programs = activities.filter(a => a.content_type === 'program' && a.action_type === 'program_day_completed').length;
      const pt = activities.filter(a => a.content_type === 'personal_training' && a.action_type === 'pt_day_completed').length;
      const tools = activities.filter(a => a.content_type === 'tool').length;

      // Create HTML for PDF
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>My LogBook - Activity Report</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 40px;
                max-width: 1200px;
                margin: 0 auto;
              }
              h1 {
                color: #333;
                border-bottom: 3px solid #000;
                padding-bottom: 10px;
              }
              .summary {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 20px;
                margin: 30px 0;
              }
              .stat-card {
                border: 1px solid #ddd;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
              }
              .stat-value {
                font-size: 36px;
                font-weight: bold;
                color: #000;
              }
              .stat-label {
                font-size: 14px;
                color: #666;
                margin-top: 5px;
              }
              img {
                max-width: 100%;
                margin: 20px 0;
                border: 1px solid #ddd;
                border-radius: 8px;
              }
              .section {
                margin: 40px 0;
              }
              @media print {
                body { padding: 20px; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <h1>My LogBook - Activity Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
            
            <div class="section">
              <h2>Activity Summary</h2>
              <div class="summary">
                <div class="stat-card">
                  <div class="stat-value">${workouts}</div>
                  <div class="stat-label">Workouts Completed</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${programs}</div>
                  <div class="stat-label">Program Days</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${pt}</div>
                  <div class="stat-label">PT Days</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${tools}</div>
                  <div class="stat-label">Tool Calculations</div>
                </div>
              </div>
            </div>

            <div class="section">
              <h2>Activity Calendar</h2>
              <img src="${calendarImg}" alt="Activity Calendar" />
            </div>

            <div class="section">
              <h2>Activity Analytics</h2>
              <img src="${chartsImg}" alt="Activity Charts" />
            </div>

            <button class="no-print" onclick="window.print()" style="
              padding: 12px 24px;
              background: #000;
              color: white;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              font-size: 16px;
              margin: 20px 0;
            ">
              Print / Save as PDF
            </button>
          </body>
        </html>
      `);

      printWindow.document.close();
      toast.success('PDF preview opened! Click "Print" to save as PDF');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  const exportCalendarImage = async () => {
    try {
      const element = document.getElementById('logbook-calendar');
      if (!element) {
        toast.error('Calendar not found');
        return;
      }

      toast.info('Generating image...');
      const canvas = await html2canvas(element);
      const link = document.createElement('a');
      link.download = `activity-calendar-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL();
      link.click();
      toast.success('Calendar image downloaded!');
    } catch (error) {
      console.error('Error exporting calendar:', error);
      toast.error('Failed to export calendar');
    }
  };

  const exportChartsImage = async () => {
    try {
      const element = document.getElementById('logbook-charts');
      if (!element) {
        toast.error('Charts not found');
        return;
      }

      toast.info('Generating image...');
      const canvas = await html2canvas(element);
      const link = document.createElement('a');
      link.download = `activity-charts-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL();
      link.click();
      toast.success('Charts image downloaded!');
    } catch (error) {
      console.error('Error exporting charts:', error);
      toast.error('Failed to export charts');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Activity Log</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Export your activity log and analytics to review your progress offline.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={exportToPDF} className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Export as PDF
          </Button>
          <Button onClick={exportCalendarImage} variant="outline" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Save Calendar Image
          </Button>
          <Button onClick={exportChartsImage} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Save Charts Image
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
