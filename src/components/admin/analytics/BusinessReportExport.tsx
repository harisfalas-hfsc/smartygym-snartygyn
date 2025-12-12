import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Download, Calendar as CalendarIcon, FileText, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import smartyGymLogo from "@/assets/smarty-gym-logo.png";

interface ReportSection {
  id: string;
  label: string;
  checked: boolean;
}

interface BusinessReportExportProps {
  dashboardRef: React.RefObject<HTMLDivElement>;
}

export function BusinessReportExport({ dashboardRef }: BusinessReportExportProps) {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [isGenerating, setIsGenerating] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  
  const [sections, setSections] = useState<ReportSection[]>([
    { id: "users", label: "Users & Subscriptions", checked: true },
    { id: "revenue", label: "Revenue Analytics", checked: true },
    { id: "content", label: "Content Performance", checked: true },
    { id: "completion", label: "Completion Rates", checked: true },
    { id: "website", label: "Website Traffic", checked: true },
    { id: "corporate", label: "Corporate Plans", checked: true },
  ]);

  const toggleSection = (id: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, checked: !s.checked } : s));
  };

  const generateReport = async () => {
    setIsGenerating(true);
    toast.info("Generating comprehensive business report...");

    try {
      // Fetch all data for the report
      const reportData = await fetchReportData();
      
      // Create and download the report
      await createPDFReport(reportData);
      
      toast.success("Business report generated successfully!");
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report");
    } finally {
      setIsGenerating(false);
      setOpen(false);
    }
  };

  const fetchReportData = async () => {
    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();

    // Fetch users
    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("id", { count: "exact" });

    const { count: newUsers } = await supabase
      .from("profiles")
      .select("id", { count: "exact" })
      .gte("created_at", startISO)
      .lte("created_at", endISO);

    // Fetch subscriptions
    const { data: subscriptions } = await supabase
      .from("user_subscriptions")
      .select("plan_type, status");

    const activeGold = subscriptions?.filter(s => s.status === "active" && s.plan_type === "gold").length || 0;
    const activePlatinum = subscriptions?.filter(s => s.status === "active" && s.plan_type === "platinum").length || 0;

    // Fetch revenue from Stripe
    let stripeRevenue = { totalRevenue: 0, subscriptionRevenue: 0 };
    try {
      const { data } = await supabase.functions.invoke('get-stripe-revenue');
      if (data) stripeRevenue = data;
    } catch (e) {
      console.error("Error fetching Stripe revenue:", e);
    }

    // Fetch purchases
    const { data: purchases } = await supabase
      .from("user_purchases")
      .select("*")
      .gte("purchased_at", startISO)
      .lte("purchased_at", endISO);

    const standalonePurchases = purchases?.length || 0;
    const standaloneRevenue = purchases?.reduce((sum, p) => sum + Number(p.price || 0), 0) || 0;

    // Fetch interactions
    const { data: workoutInteractions } = await supabase
      .from("workout_interactions")
      .select("is_completed")
      .gte("created_at", startISO)
      .lte("created_at", endISO);

    const { data: programInteractions } = await supabase
      .from("program_interactions")
      .select("is_completed")
      .gte("created_at", startISO)
      .lte("created_at", endISO);

    const workoutCompletions = workoutInteractions?.filter(w => w.is_completed).length || 0;
    const programCompletions = programInteractions?.filter(p => p.is_completed).length || 0;

    // Fetch website visitors
    const { count: websiteVisitors } = await supabase
      .from("social_media_analytics")
      .select("id", { count: "exact" })
      .eq("event_type", "visit")
      .gte("created_at", startISO)
      .lte("created_at", endISO);

    // Fetch corporate subscriptions
    const { data: corporateSubs } = await supabase
      .from("corporate_subscriptions")
      .select("plan_type, status, current_users_count, max_users");

    const activeCorporate = corporateSubs?.filter(c => c.status === "active") || [];

    // Fetch check-ins
    const { count: checkinsCount } = await supabase
      .from("smarty_checkins")
      .select("id", { count: "exact" })
      .gte("created_at", startISO)
      .lte("created_at", endISO);

    return {
      period: { start: startDate, end: endDate },
      users: {
        total: totalUsers || 0,
        new: newUsers || 0,
        goldSubscribers: activeGold,
        platinumSubscribers: activePlatinum,
      },
      revenue: {
        total: stripeRevenue.totalRevenue,
        subscriptions: stripeRevenue.subscriptionRevenue,
        standalone: standaloneRevenue,
        standalonePurchases,
      },
      content: {
        workoutCompletions,
        programCompletions,
        totalInteractions: (workoutInteractions?.length || 0) + (programInteractions?.length || 0),
      },
      website: {
        visitors: websiteVisitors || 0,
      },
      corporate: {
        active: activeCorporate.length,
        totalUsers: activeCorporate.reduce((sum, c) => sum + (c.current_users_count || 0), 0),
      },
      checkins: checkinsCount || 0,
    };
  };

  const createPDFReport = async (data: any) => {
    // Create a hidden div for the report
    const reportContainer = document.createElement("div");
    reportContainer.style.cssText = "position: absolute; left: -9999px; top: 0; width: 800px; background: white; padding: 40px; font-family: system-ui, -apple-system, sans-serif;";
    document.body.appendChild(reportContainer);

    const selectedSections = sections.filter(s => s.checked).map(s => s.id);

    reportContainer.innerHTML = `
      <div style="background: white; color: #1a1a1a;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 3px solid #D4AF37; padding-bottom: 20px;">
          <div>
            <img src="${smartyGymLogo}" alt="SmartyGym" style="height: 60px; margin-bottom: 10px;" />
            <p style="color: #666; font-size: 14px; margin: 0;">Your Gym Re-imagined. Anywhere, Anytime.</p>
          </div>
          <div style="text-align: right;">
            <h1 style="margin: 0; font-size: 24px; color: #1a1a1a;">Business Analytics Report</h1>
            <p style="color: #666; font-size: 14px; margin: 5px 0 0 0;">
              ${format(data.period.start, "MMM d, yyyy")} - ${format(data.period.end, "MMM d, yyyy")}
            </p>
            <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">
              Generated: ${format(new Date(), "MMM d, yyyy HH:mm")}
            </p>
          </div>
        </div>

        <!-- Executive Summary -->
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #D4AF37;">Executive Summary</h2>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;">
            <div style="text-align: center;">
              <div style="font-size: 28px; font-weight: bold; color: #D4AF37;">${data.users.total}</div>
              <div style="color: #666; font-size: 12px;">Total Users</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 28px; font-weight: bold; color: #D4AF37;">€${data.revenue.total.toLocaleString()}</div>
              <div style="color: #666; font-size: 12px;">Total Revenue</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 28px; font-weight: bold; color: #D4AF37;">${data.website.visitors}</div>
              <div style="color: #666; font-size: 12px;">Website Visitors</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 28px; font-weight: bold; color: #D4AF37;">${data.checkins}</div>
              <div style="color: #666; font-size: 12px;">Check-ins</div>
            </div>
          </div>
        </div>

        ${selectedSections.includes("users") ? `
        <!-- Users Section -->
        <div style="margin-bottom: 30px;">
          <h2 style="margin: 0 0 15px 0; font-size: 16px; color: #1a1a1a; border-bottom: 2px solid #D4AF37; padding-bottom: 8px;">Users & Subscriptions</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr style="background: #f8f9fa;">
              <td style="padding: 12px; border: 1px solid #e0e0e0;">Total Registered Users</td>
              <td style="padding: 12px; border: 1px solid #e0e0e0; text-align: right; font-weight: bold;">${data.users.total}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #e0e0e0;">New Users (Period)</td>
              <td style="padding: 12px; border: 1px solid #e0e0e0; text-align: right; font-weight: bold;">${data.users.new}</td>
            </tr>
            <tr style="background: #f8f9fa;">
              <td style="padding: 12px; border: 1px solid #e0e0e0;">Gold Subscribers</td>
              <td style="padding: 12px; border: 1px solid #e0e0e0; text-align: right; font-weight: bold;">${data.users.goldSubscribers}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #e0e0e0;">Platinum Subscribers</td>
              <td style="padding: 12px; border: 1px solid #e0e0e0; text-align: right; font-weight: bold;">${data.users.platinumSubscribers}</td>
            </tr>
          </table>
        </div>
        ` : ''}

        ${selectedSections.includes("revenue") ? `
        <!-- Revenue Section -->
        <div style="margin-bottom: 30px;">
          <h2 style="margin: 0 0 15px 0; font-size: 16px; color: #1a1a1a; border-bottom: 2px solid #D4AF37; padding-bottom: 8px;">Revenue Analytics</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr style="background: #f8f9fa;">
              <td style="padding: 12px; border: 1px solid #e0e0e0;">Total Revenue</td>
              <td style="padding: 12px; border: 1px solid #e0e0e0; text-align: right; font-weight: bold; color: #D4AF37;">€${data.revenue.total.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #e0e0e0;">Subscription Revenue</td>
              <td style="padding: 12px; border: 1px solid #e0e0e0; text-align: right; font-weight: bold;">€${data.revenue.subscriptions.toLocaleString()}</td>
            </tr>
            <tr style="background: #f8f9fa;">
              <td style="padding: 12px; border: 1px solid #e0e0e0;">Standalone Purchases Revenue</td>
              <td style="padding: 12px; border: 1px solid #e0e0e0; text-align: right; font-weight: bold;">€${data.revenue.standalone.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #e0e0e0;">Total Standalone Purchases</td>
              <td style="padding: 12px; border: 1px solid #e0e0e0; text-align: right; font-weight: bold;">${data.revenue.standalonePurchases}</td>
            </tr>
          </table>
        </div>
        ` : ''}

        ${selectedSections.includes("content") ? `
        <!-- Content Performance Section -->
        <div style="margin-bottom: 30px;">
          <h2 style="margin: 0 0 15px 0; font-size: 16px; color: #1a1a1a; border-bottom: 2px solid #D4AF37; padding-bottom: 8px;">Content Performance</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr style="background: #f8f9fa;">
              <td style="padding: 12px; border: 1px solid #e0e0e0;">Total Content Interactions</td>
              <td style="padding: 12px; border: 1px solid #e0e0e0; text-align: right; font-weight: bold;">${data.content.totalInteractions}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #e0e0e0;">Workout Completions</td>
              <td style="padding: 12px; border: 1px solid #e0e0e0; text-align: right; font-weight: bold;">${data.content.workoutCompletions}</td>
            </tr>
            <tr style="background: #f8f9fa;">
              <td style="padding: 12px; border: 1px solid #e0e0e0;">Program Completions</td>
              <td style="padding: 12px; border: 1px solid #e0e0e0; text-align: right; font-weight: bold;">${data.content.programCompletions}</td>
            </tr>
          </table>
        </div>
        ` : ''}

        ${selectedSections.includes("website") ? `
        <!-- Website Traffic Section -->
        <div style="margin-bottom: 30px;">
          <h2 style="margin: 0 0 15px 0; font-size: 16px; color: #1a1a1a; border-bottom: 2px solid #D4AF37; padding-bottom: 8px;">Website Traffic</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr style="background: #f8f9fa;">
              <td style="padding: 12px; border: 1px solid #e0e0e0;">Total Visitors (Period)</td>
              <td style="padding: 12px; border: 1px solid #e0e0e0; text-align: right; font-weight: bold;">${data.website.visitors}</td>
            </tr>
          </table>
        </div>
        ` : ''}

        ${selectedSections.includes("corporate") ? `
        <!-- Corporate Section -->
        <div style="margin-bottom: 30px;">
          <h2 style="margin: 0 0 15px 0; font-size: 16px; color: #1a1a1a; border-bottom: 2px solid #D4AF37; padding-bottom: 8px;">Corporate Plans</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr style="background: #f8f9fa;">
              <td style="padding: 12px; border: 1px solid #e0e0e0;">Active Corporate Subscriptions</td>
              <td style="padding: 12px; border: 1px solid #e0e0e0; text-align: right; font-weight: bold;">${data.corporate.active}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #e0e0e0;">Total Corporate Users</td>
              <td style="padding: 12px; border: 1px solid #e0e0e0; text-align: right; font-weight: bold;">${data.corporate.totalUsers}</td>
            </tr>
          </table>
        </div>
        ` : ''}

        <!-- Footer -->
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #999; font-size: 12px;">
          <p>SmartyGym Business Analytics Report</p>
          <p>This report is confidential and intended for internal use only.</p>
          <p>Contact: admin@smartygym.com | www.smartygym.com</p>
        </div>
      </div>
    `;

    // Wait for images to load
    await new Promise(resolve => setTimeout(resolve, 500));

    // Capture as image
    const canvas = await html2canvas(reportContainer, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
    });

    // Download as PNG
    const link = document.createElement("a");
    link.download = `SmartyGym-Business-Report-${format(startDate, "yyyy-MM-dd")}-to-${format(endDate, "yyyy-MM-dd")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();

    // Cleanup
    document.body.removeChild(reportContainer);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileText className="h-4 w-4" />
          Full Business Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Business Report</DialogTitle>
          <DialogDescription>
            Create a comprehensive PDF report with selected analytics data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Date Range */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Report Period</Label>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={startDate} onSelect={(d) => d && setStartDate(d)} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={endDate} onSelect={(d) => d && setEndDate(d)} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Sections to Include */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Include in Report</Label>
            <div className="grid grid-cols-2 gap-3">
              {sections.map(section => (
                <div key={section.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={section.id} 
                    checked={section.checked} 
                    onCheckedChange={() => toggleSection(section.id)}
                  />
                  <Label htmlFor={section.id} className="text-sm cursor-pointer">{section.label}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={generateReport} disabled={isGenerating} className="gap-2">
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
