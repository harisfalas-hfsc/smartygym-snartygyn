import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Camera, Monitor, Smartphone, Tablet } from "lucide-react";
import { toast } from "sonner";

interface ScreenshotCaptureGuideProps {
  platform: 'ios' | 'android';
}

export const ScreenshotCaptureGuide = ({ platform }: ScreenshotCaptureGuideProps) => {
  const recommendedPages = [
    { name: "Homepage", path: "/", description: "Main landing page with hero section" },
    { name: "Smarty Workouts", path: "/smarty-workouts", description: "Workout library with categories" },
    { name: "Workout Detail", path: "/workout/strength", description: "Individual workout page" },
    { name: "Smarty Programs", path: "/smarty-programs", description: "Training programs listing" },
    { name: "User Dashboard", path: "/dashboard", description: "User's personal dashboard (requires login)" },
    { name: "Smarty Tools", path: "/smarty-tools", description: "Calculator and tools section" },
    { name: "Community", path: "/community", description: "Community leaderboard and ratings" },
    { name: "Smarty Plans", path: "/smarty-plans", description: "Pricing and subscription options" },
  ];

  const viewportPresets = platform === 'ios' ? [
    { name: "iPhone 15 Pro Max", width: 430, height: 932, scale: 3, outputSize: "1290×2796" },
    { name: "iPhone 14 Pro Max", width: 428, height: 926, scale: 3, outputSize: "1284×2778" },
    { name: "iPhone 8 Plus", width: 414, height: 736, scale: 3, outputSize: "1242×2208" },
    { name: "iPad Pro 12.9\"", width: 1024, height: 1366, scale: 2, outputSize: "2048×2732" },
  ] : [
    { name: "Android Phone", width: 360, height: 640, scale: 3, outputSize: "1080×1920" },
    { name: "Android Phone (Alt)", width: 412, height: 732, scale: 2.625, outputSize: "1080×1920" },
    { name: "Android Tablet 7\"", width: 600, height: 1024, scale: 1.5, outputSize: "900×1536" },
    { name: "Android Tablet 10\"", width: 800, height: 1280, scale: 2, outputSize: "1600×2560" },
  ];

  const openPageInNewTab = (path: string) => {
    const baseUrl = window.location.origin;
    window.open(`${baseUrl}${path}`, '_blank');
    toast.success('Page opened in new tab');
  };

  const copyViewportSettings = (preset: typeof viewportPresets[0]) => {
    const settings = `Width: ${preset.width}px, Height: ${preset.height}px, Device Scale: ${preset.scale}x`;
    navigator.clipboard.writeText(settings);
    toast.success(`Viewport settings copied: ${preset.name}`);
  };

  return (
    <div className="space-y-4">
      {/* Capture Instructions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            How to Capture Screenshots
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <h4 className="font-semibold">Method 1: Browser DevTools (Recommended)</h4>
            <ol className="text-sm space-y-2 list-decimal list-inside">
              <li>Open the page you want to capture</li>
              <li>Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">F12</kbd> or right-click → "Inspect"</li>
              <li>Click the device toolbar icon (or press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+Shift+M</kbd>)</li>
              <li>Select device or enter custom dimensions from presets below</li>
              <li>Set Device Pixel Ratio (DPR) to match the scale factor</li>
              <li>Click the three-dot menu → "Capture screenshot" or "Capture full size screenshot"</li>
            </ol>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <h4 className="font-semibold">Method 2: Real Device</h4>
            <ol className="text-sm space-y-2 list-decimal list-inside">
              <li>Open smartygym.com on your device</li>
              <li>Navigate to the page you want to capture</li>
              <li><strong>iPhone:</strong> Press Side + Volume Up simultaneously</li>
              <li><strong>Android:</strong> Press Power + Volume Down simultaneously</li>
              <li>Transfer screenshots to your computer</li>
            </ol>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded text-sm">
            <strong>Important:</strong> Screenshots must show actual app content. Log in with a test account to capture dashboard and user-specific screens.
          </div>
        </CardContent>
      </Card>

      {/* Viewport Presets */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            {platform === 'ios' ? <Smartphone className="h-5 w-5 text-primary" /> : <Monitor className="h-5 w-5 text-primary" />}
            Viewport Presets for DevTools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-2 font-medium">Device</th>
                  <th className="text-left p-2 font-medium">Viewport</th>
                  <th className="text-left p-2 font-medium">Scale</th>
                  <th className="text-left p-2 font-medium">Output Size</th>
                  <th className="text-left p-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {viewportPresets.map((preset, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2">{preset.name}</td>
                    <td className="p-2 font-mono text-xs">{preset.width}×{preset.height}</td>
                    <td className="p-2">{preset.scale}x</td>
                    <td className="p-2 font-mono text-xs">{preset.outputSize}</td>
                    <td className="p-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => copyViewportSettings(preset)}
                        className="h-7 text-xs"
                      >
                        Copy
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Pages */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Tablet className="h-5 w-5 text-primary" />
            Recommended Pages to Capture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {recommendedPages.map((page, i) => (
              <div 
                key={i} 
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div>
                  <div className="font-medium text-sm">{page.name}</div>
                  <div className="text-xs text-muted-foreground">{page.description}</div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => openPageInNewTab(page.path)}
                  className="gap-1 shrink-0"
                >
                  <ExternalLink className="h-3 w-3" />
                  Open
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Screenshot Checklist */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Screenshot Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded border-muted-foreground" />
              <span>Homepage / Landing page</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded border-muted-foreground" />
              <span>Workout library / Browse view</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded border-muted-foreground" />
              <span>Individual workout detail page</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded border-muted-foreground" />
              <span>Training programs view</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded border-muted-foreground" />
              <span>User dashboard (logged in)</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded border-muted-foreground" />
              <span>Fitness calculators / tools</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded border-muted-foreground" />
              <span>Community features</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded border-muted-foreground" />
              <span>Pricing / Plans page</span>
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
