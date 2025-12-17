import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Download, Image, Smartphone, Tablet, Monitor } from "lucide-react";
import { toast } from "sonner";

interface AssetSpecificationsProps {
  platform: 'ios' | 'android';
}

export const AssetSpecifications = ({ platform }: AssetSpecificationsProps) => {
  const iosIconSizes = [
    { size: "1024×1024", use: "App Store", required: true },
    { size: "180×180", use: "iPhone @3x", required: true },
    { size: "120×120", use: "iPhone @2x", required: true },
    { size: "167×167", use: "iPad Pro", required: true },
    { size: "152×152", use: "iPad @2x", required: true },
    { size: "76×76", use: "iPad @1x", required: true },
  ];

  const iosScreenshotSizes = [
    { device: "iPhone 6.7\"", size: "1290×2796", devices: "iPhone 15 Pro Max, 15 Plus, 14 Pro Max", required: true },
    { device: "iPhone 6.5\"", size: "1284×2778", devices: "iPhone 14 Plus, 13 Pro Max, 12 Pro Max", required: true },
    { device: "iPhone 5.5\"", size: "1242×2208", devices: "iPhone 8 Plus, 7 Plus, 6s Plus", required: true },
    { device: "iPad 12.9\"", size: "2048×2732", devices: "iPad Pro 12.9\"", required: false },
  ];

  const androidIconSizes = [
    { size: "512×512", use: "Play Store (High-res)", required: true },
    { size: "192×192", use: "xxxhdpi", required: true },
    { size: "144×144", use: "xxhdpi", required: true },
    { size: "96×96", use: "xhdpi", required: true },
    { size: "72×72", use: "hdpi", required: true },
    { size: "48×48", use: "mdpi", required: true },
  ];

  const androidScreenshotSizes = [
    { device: "Phone", size: "1080×1920", note: "Minimum 2, maximum 8", required: true },
    { device: "7\" Tablet", size: "1024×600", note: "Optional", required: false },
    { device: "10\" Tablet", size: "1536×2048", note: "Optional", required: false },
  ];

  const downloadLogo = () => {
    // Link to the logo in assets
    const logoUrl = '/smarty-gym-logo.png';
    const a = document.createElement('a');
    a.href = logoUrl;
    a.download = 'smarty-gym-logo.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Logo downloaded - use appicon.co to generate all sizes');
  };

  return (
    <div className="space-y-4">
      {/* App Icon Specifications */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Image className="h-5 w-5 text-primary" />
            App Icon Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Primary Icon Specification</h4>
            <ul className="text-sm space-y-1">
              <li>• Size: <strong>{platform === 'ios' ? '1024×1024px' : '512×512px'}</strong></li>
              <li>• Format: <strong>PNG</strong></li>
              <li>• Color Space: <strong>sRGB</strong></li>
              <li>• Transparency: <strong>Not allowed</strong></li>
              {platform === 'ios' && <li>• Corners: <strong>Square (iOS rounds automatically)</strong></li>}
            </ul>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="default" size="sm" onClick={downloadLogo} className="gap-2">
              <Download className="h-4 w-4" />
              Download Logo
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.open('https://appicon.co/', '_blank')}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Open appicon.co
            </Button>
          </div>

          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded">
            <strong>How to use:</strong> Download the logo, upload it to appicon.co, and it will generate all required icon sizes automatically. Download the generated icons and use them in your app submission.
          </div>

          {/* Icon Sizes Table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-2 font-medium">Size</th>
                  <th className="text-left p-2 font-medium">Use</th>
                  <th className="text-left p-2 font-medium">Required</th>
                </tr>
              </thead>
              <tbody>
                {(platform === 'ios' ? iosIconSizes : androidIconSizes).map((icon, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2 font-mono">{icon.size}</td>
                    <td className="p-2">{icon.use}</td>
                    <td className="p-2">
                      {icon.required ? (
                        <span className="text-green-600 font-medium">Required</span>
                      ) : (
                        <span className="text-muted-foreground">Optional</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Screenshot Specifications */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            Screenshot Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Screenshot Guidelines</h4>
            <ul className="text-sm space-y-1">
              <li>• Format: <strong>PNG or JPEG</strong></li>
              <li>• Quantity: <strong>{platform === 'ios' ? '3-10 per device' : '2-8 per device'}</strong></li>
              <li>• Content: <strong>Must show actual app screens (no mockups)</strong></li>
              <li>• Text overlays: <strong>Allowed but keep minimal</strong></li>
            </ul>
          </div>

          {/* Screenshot Sizes Table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-2 font-medium">Device</th>
                  <th className="text-left p-2 font-medium">Size (px)</th>
                  <th className="text-left p-2 font-medium">{platform === 'ios' ? 'Devices' : 'Note'}</th>
                  <th className="text-left p-2 font-medium">Required</th>
                </tr>
              </thead>
              <tbody>
                {(platform === 'ios' ? iosScreenshotSizes : androidScreenshotSizes).map((ss, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2">{ss.device}</td>
                    <td className="p-2 font-mono">{ss.size}</td>
                    <td className="p-2 text-xs text-muted-foreground">
                      {platform === 'ios' ? (ss as any).devices : (ss as any).note}
                    </td>
                    <td className="p-2">
                      {ss.required ? (
                        <span className="text-green-600 font-medium">Required</span>
                      ) : (
                        <span className="text-muted-foreground">Optional</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Feature Graphic (Android Only) */}
      {platform === 'android' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Monitor className="h-5 w-5 text-primary" />
              Feature Graphic (Required)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Feature Graphic Specification</h4>
              <ul className="text-sm space-y-1">
                <li>• Size: <strong>1024×500px</strong></li>
                <li>• Format: <strong>PNG or JPEG</strong></li>
                <li>• Purpose: <strong>Promotional banner displayed on Play Store</strong></li>
                <li>• Content: <strong>Eye-catching, brand-focused, minimal text</strong></li>
              </ul>
            </div>

            <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded">
              <strong>Design Tips:</strong> Keep text in the center (safe zone), use high contrast colors, include your logo, and make it visually appealing. Use tools like Canva or Figma to create this graphic.
            </div>

            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.open('https://www.canva.com/', '_blank')}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open Canva
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.open('https://www.figma.com/', '_blank')}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open Figma
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
