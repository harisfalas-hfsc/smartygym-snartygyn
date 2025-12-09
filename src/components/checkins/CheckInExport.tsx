import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckinRecord } from '@/hooks/useCheckins';
import { Download, FileText, Image, Table, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';

interface CheckInExportProps {
  checkins: CheckinRecord[];
  chartRef?: React.RefObject<HTMLDivElement>;
}

export function CheckInExport({ checkins, chartRef }: CheckInExportProps) {
  const [dateRange, setDateRange] = useState<string>('30');
  const [exporting, setExporting] = useState<string | null>(null);

  const getFilteredCheckins = () => {
    const days = parseInt(dateRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return checkins
      .filter(c => new Date(c.checkin_date) >= cutoffDate)
      .sort((a, b) => new Date(b.checkin_date).getTime() - new Date(a.checkin_date).getTime());
  };

  const exportCSV = () => {
    setExporting('csv');
    try {
      const filtered = getFilteredCheckins();
      const headers = [
        'Date',
        'Status',
        'Daily Score',
        'Category',
        'Sleep Hours',
        'Sleep Quality',
        'Sleep Score',
        'Readiness',
        'Soreness',
        'Mood',
        'Mood Score',
        'Steps Bucket',
        'Hydration (L)',
        'Hydration Score',
        'Protein Level',
        'Protein Score',
        'Day Strain',
        'Strain Score',
        'Movement Score'
      ];

      const rows = filtered.map(c => [
        c.checkin_date,
        c.status,
        c.daily_smarty_score ?? '',
        c.score_category ?? '',
        c.sleep_hours ?? '',
        c.sleep_quality ?? '',
        c.sleep_score ?? '',
        c.readiness_score ?? '',
        c.soreness_rating ?? '',
        c.mood_rating ?? '',
        c.mood_score ?? '',
        c.steps_bucket ?? '',
        c.hydration_liters ?? '',
        c.hydration_score ?? '',
        c.protein_level ?? '',
        c.protein_score_norm ?? '',
        c.day_strain ?? '',
        c.day_strain_score ?? '',
        c.movement_score ?? ''
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `smarty-checkins-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      link.click();
    } finally {
      setExporting(null);
    }
  };

  const exportPDF = async () => {
    setExporting('pdf');
    try {
      const filtered = getFilteredCheckins();
      const completeDays = filtered.filter(c => c.daily_smarty_score != null);
      const avgScore = completeDays.length > 0 
        ? Math.round(completeDays.reduce((sum, c) => sum + (c.daily_smarty_score || 0), 0) / completeDays.length)
        : 0;

      // Create a simple HTML report
      const reportHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Smarty Check-ins Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #B8860B; }
            .summary { display: flex; gap: 20px; margin: 20px 0; }
            .stat { background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; }
            .stat-value { font-size: 32px; font-weight: bold; color: #B8860B; }
            .stat-label { color: #666; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #f5f5f5; }
            .score-green { color: #22c55e; }
            .score-yellow { color: #eab308; }
            .score-orange { color: #f97316; }
            .score-red { color: #ef4444; }
          </style>
        </head>
        <body>
          <h1>Smarty Check-ins Report</h1>
          <p>Generated on ${format(new Date(), 'MMMM d, yyyy')}</p>
          <p>Period: Last ${dateRange} days</p>
          
          <div class="summary">
            <div class="stat">
              <div class="stat-value">${avgScore}</div>
              <div class="stat-label">Average Score</div>
            </div>
            <div class="stat">
              <div class="stat-value">${completeDays.length}</div>
              <div class="stat-label">Complete Days</div>
            </div>
            <div class="stat">
              <div class="stat-value">${Math.round((completeDays.length / filtered.length) * 100)}%</div>
              <div class="stat-label">Completion Rate</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Score</th>
                <th>Sleep</th>
                <th>Hydration</th>
                <th>Movement</th>
                <th>Protein</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.map(c => `
                <tr>
                  <td>${format(new Date(c.checkin_date), 'MMM d')}</td>
                  <td class="score-${c.score_category || 'grey'}">${c.daily_smarty_score ?? '-'}</td>
                  <td>${c.sleep_hours ? `${c.sleep_hours}h` : '-'}</td>
                  <td>${c.hydration_liters ? `${c.hydration_liters}L` : '-'}</td>
                  <td>${c.movement_score ?? '-'}/10</td>
                  <td>${c.protein_score_norm ?? '-'}/10</td>
                  <td>${c.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(reportHtml);
        printWindow.document.close();
        printWindow.print();
      }
    } finally {
      setExporting(null);
    }
  };

  const exportImage = async () => {
    if (!chartRef?.current) return;
    
    setExporting('image');
    try {
      const canvas = await html2canvas(chartRef.current);
      const link = document.createElement('a');
      link.download = `smarty-checkins-chart-${format(new Date(), 'yyyy-MM-dd')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      setExporting(null);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Download className="h-5 w-5" />
          Export Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Date Range</label>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Button 
            onClick={exportCSV} 
            variant="outline"
            disabled={exporting === 'csv'}
            className="justify-start"
          >
            {exporting === 'csv' ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Table className="h-4 w-4 mr-2" />
            )}
            Export as CSV
          </Button>
          
          <Button 
            onClick={exportPDF}
            variant="outline"
            disabled={exporting === 'pdf'}
            className="justify-start"
          >
            {exporting === 'pdf' ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            Export as PDF
          </Button>

          {chartRef?.current && (
            <Button 
              onClick={exportImage}
              variant="outline"
              disabled={exporting === 'image'}
              className="justify-start"
            >
              {exporting === 'image' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Image className="h-4 w-4 mr-2" />
              )}
              Export Chart as Image
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}