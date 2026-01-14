import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Download, Check } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface TextContentItem {
  label: string;
  value: string;
  maxLength?: number;
  description?: string;
}

interface AppStoreTextContentProps {
  platform: 'ios' | 'android';
}

export const AppStoreTextContent = ({ platform }: AppStoreTextContentProps) => {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(label);
      toast.success(`${label} copied to clipboard`);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const iosContent: TextContentItem[] = [
    {
      label: "App Name",
      value: "SmartyGym - Online Gym",
      maxLength: 30,
      description: "Your app's name as it appears on the App Store"
    },
    {
      label: "Subtitle",
      value: "Expert Workouts by Haris Falas",
      maxLength: 30,
      description: "Brief summary that appears below your app name"
    },
    {
      label: "Keywords",
      value: "fitness,workout,training,gym,health,exercise,strength,cardio,nutrition,weight,muscle,coach,expert,science",
      maxLength: 100,
      description: "Comma-separated keywords for search (no spaces)"
    },
    {
      label: "Promotional Text",
      value: "500+ expert workouts by Sports Scientist Haris Falas. 100% human expertise, 0% AI. Real coaching for real results. Download now and transform your fitness!",
      maxLength: 170,
      description: "Can be updated without app review"
    },
    {
      label: "Privacy Policy URL",
      value: "https://smartygym.com/privacy-policy",
      description: "Required for app submission"
    },
    {
      label: "Support URL",
      value: "https://smartygym.com/contact",
      description: "Where users can get help"
    },
    {
      label: "Marketing URL",
      value: "https://smartygym.com",
      description: "Your main website"
    }
  ];

  const androidContent: TextContentItem[] = [
    {
      label: "App Title",
      value: "SmartyGym - Online Gym",
      maxLength: 30,
      description: "Your app's title on Google Play"
    },
    {
      label: "Short Description",
      value: "500+ expert workouts by Sports Scientist Haris Falas. 100% human expertise.",
      maxLength: 80,
      description: "Brief description shown in search results"
    },
    {
      label: "Privacy Policy URL",
      value: "https://smartygym.com/privacy-policy",
      description: "Required for app submission"
    },
    {
      label: "Support Email",
      value: "smartygym@outlook.com",
      description: "Contact email for users"
    },
    {
      label: "Website",
      value: "https://smartygym.com",
      description: "Your main website"
    },
    {
      label: "App Category",
      value: "Health & Fitness",
      description: "Primary category on Play Store"
    }
  ];

  const fullDescription = `Transform Your Fitness with 100% Human Expertise

SmartyGym is your complete fitness companion designed by Sports Scientist Haris Falas. Every workout, every program, every detail is crafted by a real expert with 20+ years of coaching experience. 100% Human. 0% AI. Real expertise, not algorithms.

🏋️ WHAT YOU GET

• 500+ Expert Workouts: Meticulously designed by CSCS-certified Sports Scientist Haris Falas—strength, HIIT, cardio, mobility, and functional training
• Structured Training Programs: Multi-week progressive plans (4-12 weeks) for muscle building, fat loss, athletic performance, and general fitness
• Professional Fitness Tools: BMR calculator, calorie needs, one-rep max, macro tracking—all the tools for intelligent progress
• Interactive Logbook: Track every workout, program, and achievement with detailed history and analytics
• Community Features: Compare progress, rate workouts, and engage with fellow fitness enthusiasts

💪 MEET COACH HARIS FALAS

All content is designed by Haris Falas, a certified Sports Scientist (CSCS) with over 20 years of professional coaching experience:
• Strength Training & Hypertrophy Programming
• Sports Performance & Athletic Development
• Body Transformation & Fat Loss Strategies
• Sports Nutrition & Meal Planning
• Corrective Exercise & Mobility Work
• Advanced Periodization & Program Design

His science-backed approach has helped thousands achieve real results—from complete beginners to elite athletes.

📊 MEMBERSHIP OPTIONS

Free Tier:
• Access to all free workout content
• Full calculator suite (BMR, calories, 1RM)
• Community leaderboard and engagement
• Track your complete workout history

Gold Membership ($9.99/month):
• Unlock ALL 500+ premium workouts
• Access exclusive training programs
• Advanced progress analytics
• Priority support from our team

Platinum Membership ($19.99/month):
• Everything in Gold membership
• Custom workout generator (complementary tool)
• Exclusive premium content
• Early access to new features

🎯 KEY FEATURES

✓ Expert Exercise Instructions: Every workout includes professional coaching cues and detailed guidance
✓ Smart Filtering: Find exactly what you need by difficulty, equipment, duration, and body focus
✓ Offline Access: Download workouts and train anywhere, anytime
✓ Progress Tracking: Mark workouts complete, save favorites, and monitor your fitness journey
✓ Beautiful Interface: Seamless experience across all devices
✓ Secure & Private: Your data is encrypted and protected

🔥 WHY SMARTYGYM?

Unlike generic fitness apps filled with AI-generated content, SmartyGym delivers genuine coaching expertise. You're not getting algorithms—you're getting Haris Falas's 20+ years of real-world coaching experience distilled into every single workout and program.

This is professional-level content designed by a real expert who understands human physiology, progressive overload, periodization, and what actually works.

Whether you're a complete beginner or a seasoned athlete, SmartyGym provides the structure and expertise you need for real results.

📱 DOWNLOAD NOW

Your gym re-imagined. Anywhere, anytime. 100% human expertise.

Start your transformation today with genuine coaching from Sports Scientist Haris Falas.

Support: smartygym@outlook.com
Website: https://smartygym.com
Privacy Policy: https://smartygym.com/privacy-policy`;

  const content = platform === 'ios' ? iosContent : androidContent;

  const downloadAllContent = () => {
    const allContent = content.map(item => `${item.label}:\n${item.value}\n`).join('\n') + 
      `\n\nFull Description:\n${fullDescription}`;
    
    const blob = new Blob([allContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SmartyGym-${platform === 'ios' ? 'iOS' : 'Android'}-Content.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('All content downloaded');
  };

  return (
    <div className="space-y-4">
      {/* Quick Copy Items */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Text Content</span>
            <Button variant="outline" size="sm" onClick={downloadAllContent} className="gap-2">
              <Download className="h-4 w-4" />
              Download All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {content.map((item) => (
            <div key={item.label} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-sm">{item.label}</span>
                  {item.maxLength && (
                    <span className="text-xs text-muted-foreground ml-2">
                      ({item.value.length}/{item.maxLength} chars)
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(item.value, item.label)}
                  className="h-8 gap-1"
                >
                  {copiedItem === item.label ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  Copy
                </Button>
              </div>
              <p className="text-sm bg-muted/50 p-2 rounded font-mono break-all">{item.value}</p>
              {item.description && (
                <p className="text-xs text-muted-foreground">{item.description}</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Full Description */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Full Description</span>
            <div className="flex gap-2">
              <span className="text-xs text-muted-foreground font-normal">
                {fullDescription.length}/4000 chars
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(fullDescription, 'Full Description')}
                className="h-8 gap-1"
              >
                {copiedItem === 'Full Description' ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                Copy
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted/50 p-4 rounded overflow-auto max-h-96 whitespace-pre-wrap font-sans">
            {fullDescription}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};
