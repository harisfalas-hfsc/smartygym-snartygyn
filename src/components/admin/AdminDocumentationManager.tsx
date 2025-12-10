import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer, Copy, FileText, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export const AdminDocumentationManager = () => {
  
  const downloadAsText = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  };

  const copyToClipboard = async (content: string, label: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success(`${label} copied to clipboard`);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const printDocument = (content: string, title: string) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${title}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
              h1 { color: #333; border-bottom: 2px solid #D4AF37; padding-bottom: 10px; }
              h2 { color: #555; margin-top: 20px; }
              pre { background: #f5f5f5; padding: 10px; border-radius: 4px; white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <h1>${title}</h1>
            <pre>${content}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // App Store Submission Checklist
  const appSubmissionChecklist = `SmartyGym - App Submission Checklist (AppMySite)

═══════════════════════════════════════════════════════════════

PHASE 1: APPMYSITE SETUP
────────────────────────────────────────────────────────────────

□ 1. Create AppMySite Account
   • Visit: https://www.appmysite.com/
   • Sign up with your email
   • Choose the appropriate pricing plan

□ 2. Connect Your Website
   • Enter website URL: https://smartygym.com
   • AppMySite will scan and convert your website
   • Review the preview of your app

□ 3. Customize App Appearance
   • Set app name: SmartyGym - Online Gym
   • Upload app icon (1024x1024px)
   • Choose color scheme (matches website branding)
   • Configure splash screen

□ 4. Configure App Settings
   • Enable push notifications
   • Set deep linking rules
   • Configure offline mode (if needed)
   • Add social media links

═══════════════════════════════════════════════════════════════

PHASE 2: iOS APP STORE PREPARATION
────────────────────────────────────────────────────────────────

□ 5. Apple Developer Account
   • Cost: $99/year
   • Visit: https://developer.apple.com/programs/
   • Complete enrollment (requires valid ID)
   • Enable Two-Factor Authentication

□ 6. App Store Connect Setup
   • Login to App Store Connect
   • Create new app entry
   • Bundle ID: com.smartygym.app
   • Set primary language to English (U.S.)

□ 7. Prepare iOS Assets
   Icon Sizes Required:
   • 1024x1024px (App Store)
   • Use appicon.co to generate all required sizes

   Screenshots Required (per device type):
   • iPhone 6.7" Display: 1290 x 2796px (3-5 screenshots)
   • iPhone 6.5" Display: 1284 x 2778px (3-5 screenshots)
   • iPhone 5.5" Display: 1242 x 2208px (3-5 screenshots)
   • iPad Pro 12.9" Display: 2048 x 2732px (3-5 screenshots)

□ 8. App Store Listing Content
   • App Name: SmartyGym - Online Gym
   • Subtitle: Expert Workouts by Haris Falas
   • Keywords: fitness, workout, training, gym, health (see full list in docs)
   • Description: (see full copy in Admin Docs → iOS App Store Copy)
   • Privacy Policy URL: https://smartygym.com/privacy-policy
   • Support URL: https://smartygym.com/contact

□ 9. App Review Information
   • Demo account credentials (create test account)
   • Contact information for App Review team
   • Notes for reviewer (explain features)

□ 10. Build & Submit via AppMySite
   • Generate iOS build in AppMySite
   • Download IPA file
   • Upload to App Store Connect
   • Fill in all metadata
   • Submit for review

═══════════════════════════════════════════════════════════════

PHASE 3: ANDROID PLAY STORE PREPARATION
────────────────────────────────────────────────────────────────

□ 11. Google Play Console Account
   • Cost: $25 (one-time)
   • Visit: https://play.google.com/console/
   • Create developer account
   • Complete identity verification

□ 12. Create App in Play Console
   • Create new app
   • App name: SmartyGym - Online Gym
   • Default language: English (United States)
   • App type: App
   • Free or Paid: Free (with in-app purchases)

□ 13. Prepare Android Assets
   Icon Sizes Required:
   • 512x512px (high-res icon)
   • Use appicon.co to generate all sizes

   Screenshots Required:
   • Phone: 1080 x 1920px (minimum 2, maximum 8)
   • 7-inch Tablet: 1024 x 600px (optional)
   • 10-inch Tablet: 1536 x 2048px (optional)

   Feature Graphic:
   • Size: 1024 x 500px (required)
   • Eye-catching banner for Play Store listing

□ 14. Play Store Listing Content
   • Short Description: (max 80 characters, see Android Play Store Copy)
   • Full Description: (max 4000 characters, see Android Play Store Copy)
   • App Category: Health & Fitness
   • Content Rating: Complete questionnaire (Everyone rating expected)
   • Privacy Policy URL: https://smartygym.com/privacy-policy
   • Support Email: support@smartygym.com

□ 15. Build & Submit via AppMySite
   • Generate Android build (AAB format)
   • Download AAB file
   • Upload to Play Console → Production track
   • Complete content rating questionnaire
   • Set pricing (Free)
   • Select countries for distribution
   • Submit for review

═══════════════════════════════════════════════════════════════

PHASE 4: POST-SUBMISSION
────────────────────────────────────────────────────────────────

□ 16. Monitor Review Status
   • iOS: Check App Store Connect daily (typically 1-3 days)
   • Android: Check Play Console (typically 1-3 days)
   • Respond promptly to any reviewer questions

□ 17. After Approval
   • Test the live app thoroughly
   • Monitor crash reports
   • Check user reviews
   • Update app listing based on feedback

□ 18. Future Updates
   • Use AppMySite to generate new builds
   • Update version numbers
   • Write release notes
   • Submit updates through same process

═══════════════════════════════════════════════════════════════

CRITICAL REMINDERS
────────────────────────────────────────────────────────────────

✓ Test the app on real devices before submission
✓ Ensure privacy policy is live and accessible
✓ Have valid demo/test account credentials ready
✓ All screenshots must show actual app content (no mockups)
✓ Description must not make false claims
✓ App icon must not include text or promotional elements
✓ Stripe payments work correctly (test in sandbox mode)
✓ Backend API and authentication function properly

═══════════════════════════════════════════════════════════════

USEFUL TOOLS & RESOURCES
────────────────────────────────────────────────────────────────

• AppMySite Dashboard: https://www.appmysite.com/dashboard
• App Icon Generator: https://appicon.co/
• Screenshot Creator: Figma or Canva
• Apple Guidelines: https://developer.apple.com/app-store/review/guidelines/
• Google Guidelines: https://play.google.com/about/developer-content-policy/

═══════════════════════════════════════════════════════════════

Generated: ${new Date().toLocaleDateString()}
SmartyGym Admin Documentation`;

  // iOS App Store Copy
  const iosAppStoreCopy = `SmartyGym - iOS App Store Copy

═══════════════════════════════════════════════════════════════

APP NAME
────────────────────────────────────────────────────────────────
SmartyGym - Online Gym

SUBTITLE (30 characters max)
────────────────────────────────────────────────────────────────
Expert Workouts by Haris Falas

KEYWORDS (100 characters max, comma-separated)
────────────────────────────────────────────────────────────────
fitness,workout,training,gym,health,exercise,strength,cardio,nutrition,weight,muscle,coach,expert,science

PROMOTIONAL TEXT (170 characters max)
────────────────────────────────────────────────────────────────
500+ expert workouts by Sports Scientist Haris Falas. 100% human expertise, 0% AI. Real coaching for real results. Download now and transform your fitness!

FULL DESCRIPTION (4000 characters max)
────────────────────────────────────────────────────────────────

Transform Your Fitness with 100% Human Expertise

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
✓ Beautiful Interface: Seamless experience across iPhone, iPad, and all devices
✓ Secure & Private: Your data is encrypted and protected

🔥 WHY SMARTYGYM?

Unlike generic fitness apps filled with AI-generated content, SmartyGym delivers genuine coaching expertise. You're not getting algorithms—you're getting Haris Falas's 20+ years of real-world coaching experience distilled into every single workout and program.

This is professional-level content designed by a real expert who understands human physiology, progressive overload, periodization, and what actually works.

Whether you're a complete beginner or a seasoned athlete, SmartyGym provides the structure and expertise you need for real results.

📱 DOWNLOAD NOW

Your gym re-imagined. Anywhere, anytime. 100% human expertise.

Start your transformation today with genuine coaching from Sports Scientist Haris Falas.

───────────────────────────────────────────────────────────────

Support: support@smartygym.com
Website: https://smartygym.com
Privacy Policy: https://smartygym.com/privacy-policy
Terms of Service: https://smartygym.com/terms

═══════════════════════════════════════════════════════════════`;

  // Android Play Store Copy
  const androidPlayStoreCopy = `SmartyGym - Android Play Store Copy

═══════════════════════════════════════════════════════════════

APP TITLE
────────────────────────────────────────────────────────────────
SmartyGym - Online Gym

SHORT DESCRIPTION (80 characters max)
────────────────────────────────────────────────────────────────
500+ expert workouts by Sports Scientist Haris Falas. 100% human expertise.

FULL DESCRIPTION (4000 characters max)
────────────────────────────────────────────────────────────────

Transform Your Fitness with 100% Human Expertise

SmartyGym is your complete fitness companion designed by Sports Scientist Haris Falas. Every workout, every program, every detail is crafted by a real expert with 20+ years of coaching experience. 100% Human. 0% AI. Real expertise, not algorithms.

🏋️ WHAT YOU GET

• 500+ Expert Workouts: Strength, HIIT, cardio, mobility, and functional training—all meticulously designed by CSCS-certified Sports Scientist Haris Falas
• Structured Training Programs: Multi-week progressive plans (4-12 weeks) for muscle building, fat loss, athletic performance, and overall fitness
• Professional Fitness Tools: BMR calculator, daily calorie needs, one-rep max, macro tracking—everything for intelligent progress
• Interactive Logbook: Track every workout, program, and achievement with detailed history and analytics
• Community Features: Compare progress, rate workouts, and connect with fellow fitness enthusiasts

💪 MEET COACH HARIS FALAS

All content is designed by Haris Falas, a certified Sports Scientist (CSCS) with over 20 years of professional coaching experience specializing in:
• Strength Training & Hypertrophy Programming
• Sports Performance & Athletic Development
• Body Transformation & Fat Loss Strategies
• Sports Nutrition & Meal Planning
• Corrective Exercise & Mobility Work
• Advanced Periodization & Program Design

His science-backed approach has helped thousands achieve real, sustainable results—from complete beginners to elite athletes.

📊 FLEXIBLE MEMBERSHIP OPTIONS

Free Tier:
• Access to all free workout content
• Full calculator suite (BMR, calories, 1RM)
• Community features and leaderboards
• Complete workout history tracking

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

✓ Expert Instructions: Step-by-step guidance for every exercise with professional coaching cues
✓ Smart Filtering: Find workouts by difficulty, equipment, duration, body focus, and more
✓ Offline Access: Download workouts and train anywhere, anytime
✓ Progress Tracking: Mark completions, save favorites, monitor your fitness journey
✓ Cross-Device Sync: Seamless experience across phone, tablet, and web
✓ Secure & Private: Your data is encrypted and protected (GDPR compliant)

🔥 WHY CHOOSE SMARTYGYM?

Unlike generic fitness apps filled with AI-generated content, SmartyGym delivers genuine coaching expertise. You're not getting algorithms—you're getting Haris Falas's 20+ years of real-world coaching experience distilled into every single workout and program.

This is professional-level content designed by a real expert who understands human physiology, progressive overload, periodization, and what actually works for real people.

✓ Real Coach Expertise: Every workout crafted by Sports Scientist Haris Falas
✓ Proven Results: Based on 20+ years of real-world coaching success
✓ Science-Based Programming: Evidence-backed training protocols, not generic templates
✓ Community Support: Train alongside thousands of motivated members
✓ No Gym Required: Home workouts, gym routines, or outdoor training—your choice

Whether you're taking your first steps in fitness or training for athletic competition, SmartyGym provides the structure and expertise you need for real results.

📱 GET STARTED TODAY

Your gym re-imagined. Anywhere, anytime. 100% human expertise.

Join thousands of members transforming their fitness with genuine coaching from Sports Scientist Haris Falas. Download now and experience the difference of real expertise.

───────────────────────────────────────────────────────────────

📧 Support: support@smartygym.com
🌐 Website: https://smartygym.com
🔒 Privacy Policy: https://smartygym.com/privacy-policy
📜 Terms of Service: https://smartygym.com/terms

═══════════════════════════════════════════════════════════════`;

  // Privacy Policy (excerpt for download)
  const privacyPolicyExcerpt = `SmartyGym - Privacy Policy

Full privacy policy is available at: https://smartygym.com/privacy-policy

This document is an excerpt for app store submission purposes. Please visit the URL above for the complete, legally binding privacy policy.

═══════════════════════════════════════════════════════════════

KEY POINTS FOR APP STORE SUBMISSION
────────────────────────────────────────────────────────────────

1. DATA COLLECTION
   We collect:
   • Account information (email, name)
   • Workout and fitness data (completions, favorites, progress)
   • Usage analytics (anonymous)
   • Payment information (via Stripe - not stored on our servers)

2. DATA USAGE
   Your data is used to:
   • Provide and improve our services
   • Personalize your experience
   • Process payments
   • Send important updates (with your consent)

3. DATA SHARING
   We do NOT sell your data. We share only with:
   • Payment processor (Stripe) - for transactions
   • Email service (Resend) - for notifications you opt into
   • Analytics tools - anonymized data only

4. DATA SECURITY
   • All data encrypted in transit and at rest
   • Secure authentication via Supabase
   • Regular security audits
   • GDPR compliant

5. YOUR RIGHTS
   • Access your data anytime
   • Delete your account and data
   • Opt out of marketing emails
   • Export your data

6. CONTACT
   For privacy questions: privacy@smartygym.com

═══════════════════════════════════════════════════════════════

For the complete privacy policy, visit:
https://smartygym.com/privacy-policy

Last Updated: ${new Date().toLocaleDateString()}`;

  // QA Testing Checklist (excerpt)
  const qaTestingChecklist = `SmartyGym - QA Testing Checklist

═══════════════════════════════════════════════════════════════

PRE-LAUNCH MANUAL TESTING CHECKLIST
────────────────────────────────────────────────────────────────

□ AUTHENTICATION FLOWS
  □ User signup with email
  □ Email verification (if enabled)
  □ User login
  □ Password reset flow
  □ Logout
  □ Session persistence

□ PAYMENT FLOWS
  □ Subscribe to Gold membership ($9.99/month)
  □ Subscribe to Platinum membership ($19.99/month)
  □ Standalone workout purchase (free user)
  □ Standalone program purchase (free user)
  □ Verify premium users CANNOT purchase standalone content
  □ Subscription cancellation
  □ Payment failure handling

□ CONTENT ACCESS
  □ Guest: Can view free workouts/programs
  □ Guest: Blocked from premium content (upgrade prompt)
  □ Free User: Access free content + tools/calculators
  □ Free User: Blocked from premium content
  □ Premium User: Access ALL content
  □ Purchased Content: Free user can access purchased items

□ MESSAGING SYSTEM
  □ User sends message to admin
  □ Admin receives and reads message
  □ Admin responds to user
  □ User receives response notification
  □ Read status updates correctly

□ ADMIN OPERATIONS
  □ Admin login successful
  □ Non-admin denied access to /admin
  □ Create new workout (free)
  □ Create new workout (premium)
  □ Edit workout
  □ Stripe product auto-creation works
  □ Manage users
  □ View analytics

□ RESPONSIVE DESIGN
  □ Mobile (320px - 767px)
  □ Tablet (768px - 1023px)
  □ Desktop (1024px+)
  □ All forms functional on mobile
  □ Navigation works on all screen sizes

□ DASHBOARD & LOGBOOK
  □ Favorites display correctly
  □ Workout/program lists load
  □ Completion status persists
  □ Calculator history saves
  □ Charts render data

□ BLOG & ARTICLES
  □ Article listing loads
  □ Article detail page displays
  □ Filtering/sorting works
  □ Social sharing buttons

□ SECURITY VERIFICATION
  □ Unauthorized routes redirect
  □ Premium content blocked for free users
  □ Purchase security enforced
  □ Admin routes protected

□ PERFORMANCE & UX
  □ Page load times < 3 seconds
  □ Loading states display
  □ Error messages clear
  □ Smooth navigation
  □ No console errors

═══════════════════════════════════════════════════════════════

AUTOMATED TESTING STATUS
────────────────────────────────────────────────────────────────

✓ Unit Tests: src/lib/access-control.test.ts
✓ E2E Tests: tests/e2e/ (Playwright)

Run tests before launch:
  npm run test        # Unit tests
  npm run test:e2e    # E2E tests

═══════════════════════════════════════════════════════════════

For full testing documentation, see:
/docs/qa_manual_checklist.md
/docs/DEPLOYMENT_CHECKLIST.md`;

  // Individual User Promotional Presentation
  const individualPresentation = `════════════════════════════════════════════════════════════════════════════════
                              🏋️ SMARTYGYM
                         Your Personal Online Gym
                        100% Human. 0% AI Nonsense.
════════════════════════════════════════════════════════════════════════════════

                              [SmartyGym Logo]

────────────────────────────────────────────────────────────────────────────────
                     TRAIN ANYWHERE. ANYTIME. EXPERTLY.
────────────────────────────────────────────────────────────────────────────────

SmartyGym is your complete online fitness platform, designed by Sports Scientist 
and CSCS-certified coach Haris Falas with over 20 years of experience. No algorithms. 
No AI-generated fluff. Just real expertise, proven methods, and results that matter.

═══════════════════════════════════════════════════════════════════════════════
                              OUR FEATURES
═══════════════════════════════════════════════════════════════════════════════

🏋️ SMARTY WORKOUTS                    📋 SMARTY PROGRAMS
────────────────────────                ────────────────────────
• 500+ expert-designed workouts        • Multi-week structured programs
• Strength, Cardio, HIIT, Mobility     • Progressive training plans
• Bodyweight & equipment options        • Category-specific goals
• Daily Workout of the Day (WOD)       • Step-by-step guidance

✨ SMARTY RITUAL                        🔧 SMARTY TOOLS
────────────────────────                ────────────────────────
• Daily morning activation             • BMR Calculator
• Midday desk reset routines           • 1RM Strength Calculator
• Evening decompression                • Macro Tracking Calculator
• Movement + recovery + performance    • Body Measurements Tracker

📊 SMARTY CHECK-INS                    📚 BLOG & COMMUNITY
────────────────────────                ────────────────────────
• Morning & evening check-ins          • Expert fitness articles
• Track sleep, mood, recovery          • Nutrition & wellness guides
• Build consistency streaks            • Community leaderboards
• Daily Smarty Score                   • Member achievements

═══════════════════════════════════════════════════════════════════════════════
                           MEMBERSHIP PLANS
═══════════════════════════════════════════════════════════════════════════════

┌─────────────────────┬─────────────────────┬─────────────────────┐
│       FREE          │        GOLD         │      PLATINUM       │
├─────────────────────┼─────────────────────┼─────────────────────┤
│                     │                     │                     │
│ ✓ Free Workouts     │ ✓ Everything Free   │ ✓ Everything Gold   │
│ ✓ Free Programs     │ ✓ All Premium       │ ✓ Smarty Ritual     │
│ ✓ Smarty Tools      │   Workouts          │ ✓ Smarty Check-ins  │
│ ✓ Blog Access       │ ✓ All Premium       │ ✓ Priority Support  │
│ ✓ Community         │   Programs          │ ✓ Advanced Tools    │
│                     │ ✓ Daily WOD         │ ✓ Full Logbook      │
│                     │                     │                     │
│      FREE           │   €9.99/month       │   €19.99/month      │
│                     │   or €99/year       │   or €199/year      │
└─────────────────────┴─────────────────────┴─────────────────────┘

═══════════════════════════════════════════════════════════════════════════════
                            MEET YOUR COACH
═══════════════════════════════════════════════════════════════════════════════

                           [Photo: Haris Falas]

                            HARIS FALAS
                     Sports Scientist | CSCS Certified
                      20+ Years Coaching Experience

"Real fitness comes from real expertise. Every workout, every program, 
every piece of advice on SmartyGym is crafted from decades of hands-on 
experience helping people transform their lives."

═══════════════════════════════════════════════════════════════════════════════
                          START YOUR JOURNEY
═══════════════════════════════════════════════════════════════════════════════

🌐 Website: smartygym.com
📧 Email: info@smartygym.com
📱 Instagram: @smartygym
📘 Facebook: SmartyGym

────────────────────────────────────────────────────────────────────────────────
                     JOIN SMARTYGYM TODAY!
             The gym that never closes and never takes a holiday.
────────────────────────────────────────────────────────────────────────────────

© 2024 SmartyGym. All Rights Reserved.`;

  // Corporate Promotional Presentation
  const corporatePresentation = `════════════════════════════════════════════════════════════════════════════════
                           🏢 SMARTY CORPORATE
                    Enterprise Fitness for Your Team
                       100% Human. 0% AI Nonsense.
════════════════════════════════════════════════════════════════════════════════

                              [SmartyGym Logo]

────────────────────────────────────────────────────────────────────────────────
               EMPOWER YOUR WORKFORCE. ELEVATE PERFORMANCE.
────────────────────────────────────────────────────────────────────────────────

Smarty Corporate brings SmartyGym's expert-designed fitness platform to your 
organization. One subscription, unlimited potential. Designed by Sports Scientist 
Haris Falas with 20+ years of experience, your team gets access to proven 
training methods that boost productivity, reduce stress, and improve wellbeing.

═══════════════════════════════════════════════════════════════════════════════
                        WHY SMARTY CORPORATE?
═══════════════════════════════════════════════════════════════════════════════

✓ CENTRALIZED TEAM MANAGEMENT          ✓ PLATINUM ACCESS FOR ALL MEMBERS
  One admin controls everything           Full premium features included

✓ FLEXIBLE TEAM SIZE                    ✓ SIMPLIFIED BILLING
  Scale from 10 to unlimited users        One annual invoice

✓ EMPLOYEE WELLNESS SOLUTION            ✓ REAL EXPERTISE, NOT AI
  Boost productivity & morale             Coach-designed content only

═══════════════════════════════════════════════════════════════════════════════
                    WHAT YOUR TEAM GETS (PLATINUM ACCESS)
═══════════════════════════════════════════════════════════════════════════════

🏋️ SMARTY WORKOUTS                    📋 SMARTY PROGRAMS
────────────────────────                ────────────────────────
• 500+ expert-designed workouts        • Multi-week structured programs
• Strength, Cardio, HIIT, Mobility     • Progressive training plans
• Bodyweight & equipment options        • Category-specific goals
• Daily Workout of the Day (WOD)       • Perfect for any fitness level

✨ SMARTY RITUAL                        🔧 SMARTY TOOLS
────────────────────────                ────────────────────────
• Daily morning activation             • BMR Calculator
• Midday desk reset (anti-sitting!)    • 1RM Strength Calculator
• Evening stress relief                • Macro Tracking Calculator
• Perfect for desk workers             • Body Measurements Tracker

📊 SMARTY CHECK-INS                    📚 BLOG & COMMUNITY
────────────────────────                ────────────────────────
• Morning & evening wellness tracking  • Expert fitness articles
• Sleep, mood, recovery metrics        • Nutrition & wellness guides
• Build team consistency streaks       • Organization leaderboards
• Daily Smarty Score                   • Foster healthy competition

═══════════════════════════════════════════════════════════════════════════════
                       CORPORATE SUBSCRIPTION PLANS
═══════════════════════════════════════════════════════════════════════════════

┌───────────────────┬───────────────────┬───────────────────┬───────────────────┐
│  SMARTY DYNAMIC   │   SMARTY POWER    │   SMARTY ELITE    │ SMARTY ENTERPRISE │
├───────────────────┼───────────────────┼───────────────────┼───────────────────┤
│                   │                   │                   │                   │
│  Up to 10 Users   │  Up to 20 Users   │  Up to 30 Users   │  Unlimited Users  │
│                   │                   │                   │                   │
│  Full Platinum    │  Full Platinum    │  Full Platinum    │  Full Platinum    │
│  Access           │  Access           │  Access           │  Access           │
│                   │                   │                   │                   │
│  Admin Dashboard  │  Admin Dashboard  │  Admin Dashboard  │  Admin Dashboard  │
│                   │                   │                   │                   │
│  Team Management  │  Team Management  │  Team Management  │  Team Management  │
│                   │                   │                   │                   │
│   €399/year       │    €499/year      │    €599/year      │    €699/year      │
│                   │                   │                   │                   │
│  €39.90/user/yr   │  €24.95/user/yr   │  €19.97/user/yr   │  Best Value!      │
└───────────────────┴───────────────────┴───────────────────┴───────────────────┘

                     All plans include 12-month subscription period.
            Team members receive full Platinum access from day one.

═══════════════════════════════════════════════════════════════════════════════
                    ADMIN DASHBOARD FEATURES
═══════════════════════════════════════════════════════════════════════════════

📊 Visual Slots Management              👥 Easy Member Addition
   See all seats at a glance               Add members with email & password

📈 Subscription Overview                🔄 Flexible Management
   Period dates, plan type, status         Remove/add members as needed

═══════════════════════════════════════════════════════════════════════════════
                         DESIGNED BY AN EXPERT
═══════════════════════════════════════════════════════════════════════════════

                           [Photo: Haris Falas]

                            HARIS FALAS
                     Sports Scientist | CSCS Certified
                      20+ Years Coaching Experience

"Corporate wellness isn't about gimmicks—it's about sustainable, 
science-backed movement that fits into busy professional lives."

═══════════════════════════════════════════════════════════════════════════════
                       GET STARTED TODAY
═══════════════════════════════════════════════════════════════════════════════

📞 CONTACT US FOR A DEMO

🌐 Website: smartygym.com/corporate
📧 Email: corporate@smartygym.com
📱 Phone: [Contact Number]

────────────────────────────────────────────────────────────────────────────────
                 INVEST IN YOUR TEAM'S WELLNESS
             SmartyGym: The gym that works when your team works.
────────────────────────────────────────────────────────────────────────────────

© 2024 SmartyGym. All Rights Reserved.`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <FileText className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-3xl font-bold">Admin Documentation</h2>
          <p className="text-muted-foreground">Downloadable guides for app submission, legal docs, and technical references</p>
        </div>
      </div>

      {/* App Store Submission Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            📱 App Store Submission
          </CardTitle>
          <CardDescription>
            Complete guides for publishing SmartyGym to iOS App Store and Google Play Store
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* App Submission Checklist */}
          <div className="border rounded-lg p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-lg">App Submission Checklist (AppMySite)</h3>
              <p className="text-sm text-muted-foreground">Step-by-step guide for publishing via AppMySite platform</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => downloadAsText(appSubmissionChecklist, 'SmartyGym-App-Submission-Checklist.txt')}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download TXT
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => printDocument(appSubmissionChecklist, 'App Submission Checklist')}
                className="gap-2"
              >
                <Printer className="h-4 w-4" />
                Print/PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(appSubmissionChecklist, 'Checklist')}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy
              </Button>
            </div>
          </div>

          {/* iOS App Store Copy */}
          <div className="border rounded-lg p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-lg">iOS App Store Copy</h3>
              <p className="text-sm text-muted-foreground">App name, subtitle, keywords, and full description for App Store Connect</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => downloadAsText(iosAppStoreCopy, 'SmartyGym-iOS-App-Store-Copy.txt')}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download TXT
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(iosAppStoreCopy, 'iOS Copy')}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy All
              </Button>
            </div>
          </div>

          {/* Android Play Store Copy */}
          <div className="border rounded-lg p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-lg">Android Play Store Copy</h3>
              <p className="text-sm text-muted-foreground">App name, short description, and full description for Google Play Console</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => downloadAsText(androidPlayStoreCopy, 'SmartyGym-Android-Play-Store-Copy.txt')}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download TXT
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(androidPlayStoreCopy, 'Android Copy')}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy All
              </Button>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Legal Documents Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            📄 Legal Documents
          </CardTitle>
          <CardDescription>
            Privacy policy and terms of service for app store compliance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Privacy Policy */}
          <div className="border rounded-lg p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-lg">Privacy Policy</h3>
              <p className="text-sm text-muted-foreground">GDPR compliant privacy policy excerpt for app stores</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => downloadAsText(privacyPolicyExcerpt, 'SmartyGym-Privacy-Policy-Excerpt.txt')}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download TXT
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('/privacy-policy', '_blank')}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View Full Policy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard('https://smartygym.com/privacy-policy', 'Privacy Policy URL')}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy URL
              </Button>
            </div>
          </div>

          {/* Terms of Service */}
          <div className="border rounded-lg p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-lg">Terms of Service</h3>
              <p className="text-sm text-muted-foreground">Legal terms and conditions for using SmartyGym</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('/terms', '_blank')}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View Terms
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard('https://smartygym.com/terms', 'Terms URL')}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy URL
              </Button>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Technical Documentation Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            🔧 Technical Documentation
          </CardTitle>
          <CardDescription>
            Testing procedures, deployment checklists, and admin setup guides
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* QA Testing Checklist */}
          <div className="border rounded-lg p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-lg">QA Testing Checklist</h3>
              <p className="text-sm text-muted-foreground">Manual testing procedures before launch</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => downloadAsText(qaTestingChecklist, 'SmartyGym-QA-Testing-Checklist.txt')}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download TXT
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => printDocument(qaTestingChecklist, 'QA Testing Checklist')}
                className="gap-2"
              >
                <Printer className="h-4 w-4" />
                Print/PDF
              </Button>
            </div>
          </div>

          {/* Admin Setup Guide */}
          <div className="border rounded-lg p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-lg">Admin Setup Guide</h3>
              <p className="text-sm text-muted-foreground">Instructions for configuring admin roles in production</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://github.com/yourusername/smartygym/blob/main/docs/admin-setup-guide.md', '_blank')}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View on GitHub
              </Button>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Promotional Materials Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            📣 Promotional Materials
          </CardTitle>
          <CardDescription>
            Marketing flyers, brochures, and presentations for individuals and organizations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Individual User Presentation */}
          <div className="border rounded-lg p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-lg">Individual User Presentation</h3>
              <p className="text-sm text-muted-foreground">2-page A4 brochure for individual premium plans</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => downloadAsText(individualPresentation, 'SmartyGym-Individual-Presentation.txt')}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download TXT
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => printDocument(individualPresentation, 'SmartyGym - Individual User Presentation')}
                className="gap-2"
              >
                <Printer className="h-4 w-4" />
                Print/PDF
              </Button>
            </div>
          </div>

          {/* Corporate Presentation */}
          <div className="border rounded-lg p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-lg">Corporate & Organizations Presentation</h3>
              <p className="text-sm text-muted-foreground">2-page A4 brochure for Smarty Corporate plans</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => downloadAsText(corporatePresentation, 'SmartyGym-Corporate-Presentation.txt')}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download TXT
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => printDocument(corporatePresentation, 'SmartyGym - Corporate Presentation')}
                className="gap-2"
              >
                <Printer className="h-4 w-4" />
                Print/PDF
              </Button>
            </div>
          </div>

        </CardContent>
      </Card>

    </div>
  );
};
