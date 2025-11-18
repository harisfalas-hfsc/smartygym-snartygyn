import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Image } from "lucide-react";
import html2canvas from "html2canvas";
import { useAdvancedActivityLog } from "@/hooks/useAdvancedActivityLog";
import { toast } from "sonner";
import { format } from "date-fns";

interface LogBookAdvancedExportProps {
  userId: string;
  primaryFilter: string;
  secondaryFilter?: string;
  timeFilter?: 'weekly' | 'monthly' | 'custom';
  customStartDate?: Date;
  customEndDate?: Date;
}

export const LogBookAdvancedExport = ({ 
  userId, 
  primaryFilter,
  secondaryFilter = 'all',
  timeFilter = 'monthly',
  customStartDate,
  customEndDate
}: LogBookAdvancedExportProps) => {
  const { lineChartData, pieChartData, isLoading } = useAdvancedActivityLog(
    userId,
    primaryFilter,
    secondaryFilter,
    timeFilter,
    customStartDate,
    customEndDate
  );

  const exportToPDF = async () => {
    try {
      toast.info("Generating PDF...");
      
      const calendarElement = document.getElementById('logbook-calendar');
      const chartsElement = document.getElementById('logbook-charts');

      if (!calendarElement || !chartsElement) {
        toast.error("Could not find elements to export");
        return;
      }

      // Capture images
      const calendarCanvas = await html2canvas(calendarElement, { scale: 2 });
      const chartsCanvas = await html2canvas(chartsElement, { scale: 2 });

      // Calculate summary statistics
      const stats = {
        totalActivities: pieChartData.reduce((sum, item) => sum + item.value, 0),
        filter: `${primaryFilter} - ${secondaryFilter} - ${timeFilter}`,
        period: timeFilter === 'custom' && customStartDate && customEndDate
          ? `${format(customStartDate, 'MMM dd, yyyy')} - ${format(customEndDate, 'MMM dd, yyyy')}`
          : timeFilter === 'weekly' ? 'Last 12 weeks' : 'Last 6 months'
      };

      // Create new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>LogBook Export</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 40px;
                color: #333;
              }
              h1 { color: hsl(var(--primary)); margin-bottom: 10px; }
              .filters {
                background: #f5f5f5;
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
              }
              .filters p {
                margin: 5px 0;
                font-weight: 600;
              }
              .stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 15px;
                margin: 20px 0;
              }
              .stat-card {
                background: #f9f9f9;
                padding: 15px;
                border-radius: 8px;
                text-align: center;
              }
              .stat-card h3 {
                margin: 0 0 5px 0;
                font-size: 32px;
                color: hsl(var(--primary));
              }
              .stat-card p {
                margin: 0;
                color: #666;
                font-size: 14px;
              }
              img {
                max-width: 100%;
                margin: 20px 0;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              }
              h2 {
                margin-top: 30px;
                color: #555;
              }
              @media print {
                body { padding: 20px; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <h1>Smarty Gym - LogBook Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
            
            <div class="filters">
              <p>Filters: <strong>${stats.filter}</strong></p>
              <p>Period: <strong>${stats.period}</strong></p>
            </div>

            <h2>Activity Summary</h2>
            <div class="stats">
              <div class="stat-card">
                <h3>${stats.totalActivities}</h3>
                <p>Total Activities</p>
              </div>
            </div>

            <h2>Activity Calendar</h2>
            <img src="${calendarCanvas.toDataURL()}" alt="Activity Calendar" />

            <h2>Activity Charts</h2>
            <img src="${chartsCanvas.toDataURL()}" alt="Activity Charts" />

            <div class="no-print" style="margin-top: 40px; text-align: center;">
              <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">
                Print / Save as PDF
              </button>
            </div>
          </body>
        </html>
      `);

      printWindow.document.close();
      toast.success("PDF preview ready");
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Failed to generate PDF");
    }
  };

  const exportCalendarImage = async () => {
    try {
      toast.info("Generating calendar image...");
      
      const calendarElement = document.getElementById('logbook-calendar');
      if (!calendarElement) {
        toast.error("Could not find calendar");
        return;
      }

      const canvas = await html2canvas(calendarElement, { scale: 2 });
      const image = canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.download = `logbook-calendar-${new Date().toISOString().split('T')[0]}.png`;
      link.href = image;
      link.click();
      
      toast.success("Calendar image downloaded");
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Failed to export calendar");
    }
  };

  const exportChartsImage = async () => {
    try {
      toast.info("Generating charts image...");
      
      const chartsElement = document.getElementById('logbook-charts');
      if (!chartsElement) {
        toast.error("Could not find charts");
        return;
      }

      const canvas = await html2canvas(chartsElement, { scale: 2 });
      const image = canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.download = `logbook-charts-${primaryFilter}-${secondaryFilter}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = image;
      link.click();
      
      toast.success("Charts image downloaded");
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Failed to export charts");
    }
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-32" />
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="h-10 bg-muted rounded w-32" />
            <div className="h-10 bg-muted rounded w-32" />
            <div className="h-10 bg-muted rounded w-32" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export LogBook</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={exportToPDF} variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Export as PDF
          </Button>
          <Button onClick={exportCalendarImage} variant="outline">
            <Image className="mr-2 h-4 w-4" />
            Export Calendar
          </Button>
          <Button onClick={exportChartsImage} variant="outline">
            <Image className="mr-2 h-4 w-4" />
            Export Charts
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
