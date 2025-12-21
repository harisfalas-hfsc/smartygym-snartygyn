import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

export interface ContentSection {
  type: 'heading' | 'paragraph' | 'bullet';
  content: string;
  level?: 1 | 2 | 3;
}

export const generateWordDocument = async (
  title: string,
  sections: ContentSection[],
  filename: string
) => {
  const children: Paragraph[] = [];
  
  // Title
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: 48,
        }),
      ],
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Tagline
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Your Gym Re-imagined. Anywhere, Anytime.",
          italics: true,
          size: 24,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
    })
  );

  // Content sections
  for (const section of sections) {
    if (section.type === 'heading') {
      const headingLevel = section.level === 1 ? HeadingLevel.HEADING_1 
        : section.level === 2 ? HeadingLevel.HEADING_2 
        : HeadingLevel.HEADING_3;
      
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: section.content,
              bold: true,
              size: section.level === 1 ? 32 : section.level === 2 ? 28 : 24,
            }),
          ],
          heading: headingLevel,
          spacing: { before: 400, after: 200 },
        })
      );
    } else if (section.type === 'paragraph') {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: section.content,
              size: 22,
            }),
          ],
          spacing: { after: 200 },
        })
      );
    } else if (section.type === 'bullet') {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `• ${section.content}`,
              size: 22,
            }),
          ],
          spacing: { after: 100 },
          indent: { left: 720 },
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${filename}.docx`);
};

// Firebase Console Setup Guide content
export const firebaseConsoleSetupContent: ContentSection[] = [
  { type: 'heading', content: 'Firebase Console Setup Guide', level: 1 },
  { type: 'paragraph', content: 'This guide walks you through setting up Firebase for push notifications in your SmartyGym native app. Follow each step carefully and download the required files.' },
  
  { type: 'heading', content: 'What You Need Before Starting', level: 1 },
  { type: 'bullet', content: 'A Google account' },
  { type: 'bullet', content: 'Your SmartyGym Bundle ID: app.lovable.f0bf7ae7990c4724b9e4b9150ef73d37' },
  { type: 'bullet', content: 'Access to BuildNatively dashboard' },
  
  { type: 'heading', content: 'Step 1: Create a Firebase Project', level: 1 },
  { type: 'bullet', content: 'Go to https://console.firebase.google.com' },
  { type: 'bullet', content: 'Click "Create a project" or "Add project"' },
  { type: 'bullet', content: 'Enter project name: SmartyGym' },
  { type: 'bullet', content: 'Click Continue' },
  { type: 'bullet', content: 'Google Analytics: You can disable this (optional, not needed for push notifications)' },
  { type: 'bullet', content: 'Click "Create project" and wait for it to complete' },
  { type: 'bullet', content: 'Click "Continue" when done' },
  { type: 'paragraph', content: '[Screenshot: Firebase Console homepage showing "Create a project" button]' },
  
  { type: 'heading', content: 'Step 2: Add Android App', level: 1 },
  { type: 'bullet', content: 'In your Firebase project dashboard, click the Android icon (robot icon)' },
  { type: 'bullet', content: 'Enter Android package name: app.lovable.f0bf7ae7990c4724b9e4b9150ef73d37' },
  { type: 'bullet', content: 'Enter App nickname: SmartyGym Android (optional but helpful)' },
  { type: 'bullet', content: 'Leave Debug signing certificate SHA-1 empty for now' },
  { type: 'bullet', content: 'Click "Register app"' },
  { type: 'paragraph', content: '[Screenshot: Add Android app dialog with package name field]' },
  
  { type: 'heading', content: 'Step 3: Download google-services.json (CRITICAL)', level: 2 },
  { type: 'paragraph', content: 'This is your Android Config file for BuildNatively!' },
  { type: 'bullet', content: 'Click "Download google-services.json"' },
  { type: 'bullet', content: 'Save this file somewhere safe - you will upload it to BuildNatively' },
  { type: 'bullet', content: 'Click "Next" through the remaining steps (you can skip the SDK setup steps)' },
  { type: 'bullet', content: 'Click "Continue to console"' },
  { type: 'paragraph', content: '[Screenshot: Download button for google-services.json highlighted]' },
  
  { type: 'heading', content: 'Step 4: Add iOS App', level: 1 },
  { type: 'bullet', content: 'Back in the Firebase project dashboard, click "Add app" → iOS icon (Apple logo)' },
  { type: 'bullet', content: 'Enter iOS Bundle ID: app.lovable.f0bf7ae7990c4724b9e4b9150ef73d37' },
  { type: 'bullet', content: 'Enter App nickname: SmartyGym iOS (optional)' },
  { type: 'bullet', content: 'Leave App Store ID empty for now' },
  { type: 'bullet', content: 'Click "Register app"' },
  { type: 'paragraph', content: '[Screenshot: Add iOS app dialog with Bundle ID field]' },
  
  { type: 'heading', content: 'Step 5: Download GoogleService-Info.plist (CRITICAL)', level: 2 },
  { type: 'paragraph', content: 'This is your iOS Config file for BuildNatively!' },
  { type: 'bullet', content: 'Click "Download GoogleService-Info.plist"' },
  { type: 'bullet', content: 'Save this file somewhere safe - you will upload it to BuildNatively' },
  { type: 'bullet', content: 'Click "Next" through the remaining steps (skip the SDK setup)' },
  { type: 'bullet', content: 'Click "Continue to console"' },
  { type: 'paragraph', content: '[Screenshot: Download button for GoogleService-Info.plist highlighted]' },
  
  { type: 'heading', content: 'Step 6: Get FCM Server Key (For Backend)', level: 1 },
  { type: 'bullet', content: 'In Firebase Console, click the gear icon (⚙️) next to "Project Overview"' },
  { type: 'bullet', content: 'Select "Project settings"' },
  { type: 'bullet', content: 'Go to the "Cloud Messaging" tab' },
  { type: 'bullet', content: 'Look for "Cloud Messaging API (Legacy)" section' },
  { type: 'bullet', content: 'If you see "Cloud Messaging API (Legacy) Disabled", click the three dots → "Manage API in Google Cloud Console" → Enable it' },
  { type: 'bullet', content: 'Copy the "Server key" - this is your FCM_SERVER_KEY for the backend' },
  { type: 'paragraph', content: '[Screenshot: Cloud Messaging tab showing Server key location]' },
  
  { type: 'heading', content: 'Step 7: Upload Files to BuildNatively', level: 1 },
  { type: 'paragraph', content: 'Now go to your BuildNatively dashboard and complete the Firebase section:' },
  { type: 'bullet', content: 'Enable Firebase Notification: Yes' },
  { type: 'bullet', content: 'Android Config: Upload the google-services.json file' },
  { type: 'bullet', content: 'iOS Config: Upload the GoogleService-Info.plist file' },
  { type: 'paragraph', content: '[Screenshot: BuildNatively Firebase settings section]' },
  
  { type: 'heading', content: 'Step 8: Set iOS Permission Description', level: 1 },
  { type: 'paragraph', content: 'In BuildNatively, set the "Permission description for iOS" to:' },
  { type: 'paragraph', content: '"SmartyGym would like to send you notifications about your workouts, new programs, and important updates to help you stay on track with your fitness goals."' },
  
  { type: 'heading', content: 'Step 9: Store Backend Secret', level: 1 },
  { type: 'paragraph', content: 'The FCM Server Key from Step 6 needs to be added to your Lovable Cloud secrets:' },
  { type: 'bullet', content: 'Secret Name: FCM_SERVER_KEY' },
  { type: 'bullet', content: 'Value: The server key you copied from Firebase Cloud Messaging tab' },
  
  { type: 'heading', content: 'Summary: Files You Should Have', level: 1 },
  { type: 'bullet', content: 'google-services.json → Upload to BuildNatively (Android Config)' },
  { type: 'bullet', content: 'GoogleService-Info.plist → Upload to BuildNatively (iOS Config)' },
  { type: 'bullet', content: 'FCM Server Key → Add to Lovable Cloud secrets as FCM_SERVER_KEY' },
  
  { type: 'heading', content: 'Troubleshooting', level: 1 },
  { type: 'heading', content: 'Notifications not arriving?', level: 2 },
  { type: 'bullet', content: 'Verify the Bundle ID matches exactly: app.lovable.f0bf7ae7990c4724b9e4b9150ef73d37' },
  { type: 'bullet', content: 'Make sure you uploaded the correct config files (Android file for Android, iOS file for iOS)' },
  { type: 'bullet', content: 'Check that Cloud Messaging API (Legacy) is enabled in Firebase' },
  { type: 'bullet', content: 'Ensure the FCM_SERVER_KEY secret is correctly set in Lovable Cloud' },
  
  { type: 'heading', content: 'Can\'t find the Server Key?', level: 2 },
  { type: 'bullet', content: 'Go to Firebase Console → Project Settings → Cloud Messaging' },
  { type: 'bullet', content: 'If Legacy API is disabled, enable it via Google Cloud Console link' },
  { type: 'bullet', content: 'The Server Key appears under "Cloud Messaging API (Legacy)" section' },
  
  { type: 'heading', content: 'Need Help?', level: 1 },
  { type: 'paragraph', content: 'If you encounter any issues, contact support with screenshots of your Firebase Console and BuildNatively settings.' },
];

// Native Push Notifications Implementation Guide content
export const nativePushNotificationsContent: ContentSection[] = [
  { type: 'heading', content: 'Native Push Notifications Implementation Guide', level: 1 },
  { type: 'paragraph', content: 'This guide covers the complete setup for native push notifications in iOS and Android apps built with Capacitor. Native push notifications use different systems than web push: iOS uses Apple Push Notification service (APNs), and Android uses Firebase Cloud Messaging (FCM). Both are integrated via the Capacitor Push Notifications Plugin.' },
  
  { type: 'heading', content: 'Prerequisites', level: 1 },
  { type: 'bullet', content: 'Apple Developer Account ($99/year) - https://developer.apple.com' },
  { type: 'bullet', content: 'Google/Firebase Account (Free) - https://console.firebase.google.com' },
  { type: 'bullet', content: 'Xcode installed (Mac required for iOS)' },
  { type: 'bullet', content: 'Android Studio installed' },
  { type: 'bullet', content: 'Capacitor already set up in your project' },
  
  { type: 'heading', content: 'Apple APNs Setup (iOS)', level: 1 },
  
  { type: 'heading', content: 'Step 1: Create an App ID', level: 2 },
  { type: 'bullet', content: 'Go to Apple Developer Portal (https://developer.apple.com/account)' },
  { type: 'bullet', content: 'Navigate to Certificates, Identifiers & Profiles' },
  { type: 'bullet', content: 'Click Identifiers → + button' },
  { type: 'bullet', content: 'Select App IDs → Continue' },
  { type: 'bullet', content: 'Fill in: Description: SmartyGym, Bundle ID: com.smartygym.app' },
  { type: 'bullet', content: 'Scroll down to Capabilities and check Push Notifications' },
  { type: 'bullet', content: 'Click Continue → Register' },
  
  { type: 'heading', content: 'Step 2: Create an APNs Key', level: 2 },
  { type: 'bullet', content: 'In Apple Developer Portal, go to Keys' },
  { type: 'bullet', content: 'Click + to create a new key' },
  { type: 'bullet', content: 'Enter Key Name: SmartyGym Push Key' },
  { type: 'bullet', content: 'Check Apple Push Notifications service (APNs)' },
  { type: 'bullet', content: 'Click Continue → Register' },
  { type: 'bullet', content: 'IMPORTANT: Download the .p8 file immediately (you can only download it once!)' },
  { type: 'bullet', content: 'Note down: Key ID and Team ID' },
  
  { type: 'heading', content: 'Step 3: Store APNs Credentials', level: 2 },
  { type: 'paragraph', content: 'You\'ll need these values for your backend:' },
  { type: 'bullet', content: 'APNS_KEY_ID=ABC123DEFG' },
  { type: 'bullet', content: 'APNS_TEAM_ID=TEAMID1234' },
  { type: 'bullet', content: 'APNS_KEY_CONTENT=(contents of the .p8 file)' },
  { type: 'bullet', content: 'APNS_BUNDLE_ID=com.smartygym.app' },
  
  { type: 'heading', content: 'Step 4: Configure Xcode Project', level: 2 },
  { type: 'paragraph', content: 'After running "npx cap add ios":' },
  { type: 'bullet', content: 'Open the iOS project: npx cap open ios' },
  { type: 'bullet', content: 'Select your project in the navigator' },
  { type: 'bullet', content: 'Go to Signing & Capabilities tab' },
  { type: 'bullet', content: 'Click + Capability' },
  { type: 'bullet', content: 'Add Push Notifications' },
  { type: 'bullet', content: 'Add Background Modes and check: Remote notifications, Background fetch' },
  
  { type: 'heading', content: 'Firebase FCM Setup (Android)', level: 1 },
  
  { type: 'heading', content: 'Step 1: Create Firebase Project', level: 2 },
  { type: 'bullet', content: 'Go to Firebase Console (https://console.firebase.google.com)' },
  { type: 'bullet', content: 'Click Add project' },
  { type: 'bullet', content: 'Enter project name: SmartyGym' },
  { type: 'bullet', content: 'Disable Google Analytics (optional)' },
  { type: 'bullet', content: 'Click Create project' },
  
  { type: 'heading', content: 'Step 2: Add Android App to Firebase', level: 2 },
  { type: 'bullet', content: 'In your Firebase project, click the Android icon to add an app' },
  { type: 'bullet', content: 'Enter Android package name: com.smartygym.app' },
  { type: 'bullet', content: 'App nickname: SmartyGym (optional)' },
  { type: 'bullet', content: 'Click Register app' },
  
  { type: 'heading', content: 'Step 3: Download Configuration File', level: 2 },
  { type: 'bullet', content: 'Download google-services.json' },
  { type: 'bullet', content: 'Place it in your project at: android/app/google-services.json' },
  
  { type: 'heading', content: 'Step 4: Get FCM Server Key', level: 2 },
  { type: 'bullet', content: 'In Firebase Console, go to Project Settings (gear icon)' },
  { type: 'bullet', content: 'Go to Cloud Messaging tab' },
  { type: 'bullet', content: 'Note down the Server key (or create a new one)' },
  
  { type: 'heading', content: 'Step 5: Store FCM Credentials', level: 2 },
  { type: 'paragraph', content: 'You\'ll need this for your backend:' },
  { type: 'bullet', content: 'FCM_SERVER_KEY=AAAA...' },
  
  { type: 'heading', content: 'Capacitor Plugin Integration', level: 1 },
  
  { type: 'heading', content: 'Step 1: Install the Plugin', level: 2 },
  { type: 'paragraph', content: 'Run: npm install @capacitor/push-notifications && npx cap sync' },
  
  { type: 'heading', content: 'Step 2: Android Configuration', level: 2 },
  { type: 'paragraph', content: 'Edit android/app/build.gradle, ensure these are present:' },
  { type: 'bullet', content: 'implementation platform("com.google.firebase:firebase-bom:32.7.0")' },
  { type: 'bullet', content: 'implementation "com.google.firebase:firebase-messaging"' },
  { type: 'bullet', content: 'Add: apply plugin: "com.google.gms.google-services" at the end' },
  
  { type: 'heading', content: 'Database Schema Updates', level: 1 },
  { type: 'paragraph', content: 'Run migration to create native_push_tokens table with columns: id, user_id, device_token, platform (ios/android), is_active, created_at, updated_at.' },
  
  { type: 'heading', content: 'Required Secrets', level: 1 },
  
  { type: 'heading', content: 'For iOS (APNs)', level: 2 },
  { type: 'bullet', content: 'APNS_KEY_ID - Key ID from Apple Developer Portal' },
  { type: 'bullet', content: 'APNS_TEAM_ID - Your Apple Developer Team ID' },
  { type: 'bullet', content: 'APNS_KEY_CONTENT - Contents of the .p8 key file' },
  { type: 'bullet', content: 'APNS_BUNDLE_ID - App bundle ID (com.smartygym.app)' },
  { type: 'bullet', content: 'APNS_PRODUCTION - Set to "true" for production, empty for sandbox' },
  
  { type: 'heading', content: 'For Android (FCM)', level: 2 },
  { type: 'bullet', content: 'FCM_SERVER_KEY - Firebase Cloud Messaging server key' },
  
  { type: 'heading', content: 'Testing Guide', level: 1 },
  { type: 'bullet', content: 'iOS: Build and run on a physical iOS device (simulators don\'t support push)' },
  { type: 'bullet', content: 'Android: Build and run on Android device or emulator' },
  { type: 'bullet', content: 'Test scenarios: App in foreground, background, closed; Tap notification; Multiple devices' },
  
  { type: 'heading', content: 'Implementation Checklist', level: 1 },
  
  { type: 'heading', content: 'Phase 1: Setup', level: 2 },
  { type: 'bullet', content: 'Create Apple Developer account' },
  { type: 'bullet', content: 'Create Firebase project' },
  { type: 'bullet', content: 'Generate APNs key (.p8 file)' },
  { type: 'bullet', content: 'Download google-services.json' },
  { type: 'bullet', content: 'Add secrets to backend' },
  
  { type: 'heading', content: 'Phase 2: Code Integration', level: 2 },
  { type: 'bullet', content: 'Install @capacitor/push-notifications' },
  { type: 'bullet', content: 'Add google-services.json to android/app/' },
  { type: 'bullet', content: 'Configure Android gradle files' },
  { type: 'bullet', content: 'Add Push Notifications capability in Xcode' },
  { type: 'bullet', content: 'Create useNativePushNotifications hook' },
  { type: 'bullet', content: 'Create NativePushProvider component' },
  { type: 'bullet', content: 'Run database migration' },
  
  { type: 'heading', content: 'Phase 3: Backend', level: 2 },
  { type: 'bullet', content: 'Create/update send-native-push edge function' },
  { type: 'bullet', content: 'Test APNs integration' },
  { type: 'bullet', content: 'Test FCM integration' },
  
  { type: 'heading', content: 'Phase 4: Testing', level: 2 },
  { type: 'bullet', content: 'Test on iOS physical device' },
  { type: 'bullet', content: 'Test on Android device/emulator' },
  { type: 'bullet', content: 'Test all notification scenarios' },
  { type: 'bullet', content: 'Verify token cleanup for invalid tokens' },
  
  { type: 'heading', content: 'Phase 5: Production', level: 2 },
  { type: 'bullet', content: 'Switch APNs to production endpoint' },
  { type: 'bullet', content: 'Submit app to App Store' },
  { type: 'bullet', content: 'Submit app to Google Play Store' },
  
  { type: 'heading', content: 'Cost Summary', level: 1 },
  { type: 'bullet', content: 'Apple Developer Program: $99/year' },
  { type: 'bullet', content: 'Firebase (FCM): Free' },
  { type: 'bullet', content: 'APNs: Free' },
  { type: 'bullet', content: 'Google Play Developer: $25 one-time' },
];

// Why Invest in SmartyGym content
export const whyInvestContent: ContentSection[] = [
  { type: 'heading', content: '💪 Your Body, Your Greatest Asset', level: 1 },
  { type: 'paragraph', content: 'In a world of endless fitness advice on YouTube, conflicting information on social media, and generic gym memberships that lead nowhere, finding a structured path to real results has never been harder. This research explores why expert-designed, human-crafted fitness programs deliver transformative results—and how SmartyGym provides the ecosystem you need to elevate every aspect of your performance.' },
  
  { type: 'heading', content: '🧠 The Foundation of Human Performance', level: 1 },
  { type: 'paragraph', content: 'Physical fitness isn\'t just about looking good—it\'s the bedrock upon which all other performance is built. Research from the American College of Sports Medicine consistently shows that regular exercise improves cognitive function, emotional regulation, and energy levels across all age groups.' },
  { type: 'paragraph', content: 'According to a Harvard Medical School study, just 20 minutes of moderate exercise can boost brain function for up to 12 hours afterward. The implications for work productivity, parenting patience, and creative pursuits are profound.' },
  { type: 'bullet', content: '23% Increase in cognitive performance' },
  { type: 'bullet', content: '32% Boost in creative problem-solving' },
  { type: 'bullet', content: '40% Improvement in stress resilience' },
  
  { type: 'heading', content: '😊 Exercise & Mental Health', level: 1 },
  { type: 'paragraph', content: 'The National Institute of Mental Health and countless peer-reviewed studies have established that regular physical activity is one of the most effective interventions for mental health—often matching or exceeding the effects of medication for mild to moderate conditions.' },
  
  { type: 'heading', content: '⚡ The Modern Fitness Challenge', level: 1 },
  { type: 'paragraph', content: 'Despite knowing that exercise is beneficial, most people struggle to maintain a consistent routine. The reasons are systemic, not personal failures:' },
  { type: 'bullet', content: 'Information Overload: YouTube, Instagram, TikTok—endless conflicting advice with no coherent philosophy' },
  { type: 'bullet', content: 'Lack of Structure: Random workouts without progressive overload or long-term planning' },
  { type: 'bullet', content: 'Time Scarcity: Work, family, commute—no time for a "real" gym routine' },
  { type: 'bullet', content: 'Accessibility Gaps: Traveling? No equipment? The routine breaks down' },
  
  { type: 'heading', content: '📈 The Science of Consistency', level: 1 },
  { type: 'paragraph', content: 'Research from the Journal of Strength and Conditioning demonstrates that structured programs with progressive overload produce results 3-5x greater than random workouts over a 24-week period.' },
  
  { type: 'heading', content: '🏆 Why Expert-Designed Programs Win', level: 1 },
  { type: 'paragraph', content: 'The RAND Corporation study on fitness program adherence found that programs designed by certified professionals have a 67% long-term adherence rate, compared to just 23% for self-guided approaches.' },
  
  { type: 'heading', content: '🌟 The SmartyGym Ecosystem', level: 1 },
  { type: 'paragraph', content: 'SmartyGym was built to solve the modern fitness challenge. Created by Sports Scientist and CSCS-certified coach Haris Falas with over 20 years of experience, every workout and program is designed with purpose, progression, and real-world constraints in mind.' },
  { type: 'bullet', content: '500+ Expert Workouts: Professionally designed, categorized, and progressive' },
  { type: 'bullet', content: 'Multi-Week Programs: Structured journeys from 4-12 weeks with clear goals' },
  { type: 'bullet', content: 'Smarty Rituals: Daily wellness protocols for morning, midday, and evening' },
  { type: 'bullet', content: 'Smarty Check-ins: Track your readiness, sleep, and recovery' },
  { type: 'bullet', content: 'Smarty Tools: Calculators for 1RM, BMR, macros, and body measurements' },
  
  { type: 'heading', content: '✅ Conclusion', level: 1 },
  { type: 'paragraph', content: 'Investing in SmartyGym means investing in every role you play—employee, parent, friend, athlete, and human being. The research is clear: structured, expert-designed fitness programs deliver results that random approaches simply cannot match.' },
];

// Why Smarty Corporate content
export const whyCorporateContent: ContentSection[] = [
  { type: 'heading', content: '🏢 The Business Case for Wellness', level: 1 },
  { type: 'paragraph', content: 'In today\'s competitive business landscape, forward-thinking companies recognize that their most valuable asset isn\'t technology, infrastructure, or capital—it\'s their people. This comprehensive analysis explores why investing in employee wellness isn\'t just an ethical choice, but a strategic business decision with measurable returns.' },
  
  { type: 'heading', content: '👥 The Human Capital Advantage', level: 1 },
  { type: 'paragraph', content: 'Every successful organization is built on the foundation of its workforce. The skills, creativity, dedication, and energy of employees drive innovation, customer satisfaction, and ultimately, business success.' },
  { type: 'paragraph', content: 'According to Harvard Business Review, companies like Johnson & Johnson have demonstrated that comprehensive wellness programs can yield a return of $2.71 for every dollar spent, with cumulative savings reaching $250 million on healthcare costs over a decade.' },
  
  { type: 'heading', content: '💰 The ROI of Wellness Programs', level: 1 },
  { type: 'bullet', content: '$2.71 Return per $1 spent (Johnson & Johnson)' },
  { type: 'bullet', content: '$250M Saved by J&J over 10 years' },
  { type: 'bullet', content: '25% Reduction in sick leave' },
  
  { type: 'heading', content: '⏰ The Modern Challenge', level: 1 },
  { type: 'paragraph', content: 'We live in unprecedented times. The modern employee faces a complex web of pressures that previous generations never encountered:' },
  { type: 'bullet', content: 'Economic Pressures: Rising costs of living, financial uncertainty, and job market volatility' },
  { type: 'bullet', content: 'Time Scarcity: Long commutes, extended work hours, and always-on digital culture' },
  { type: 'bullet', content: 'Family Responsibilities: Balancing childcare, eldercare, and household duties' },
  { type: 'bullet', content: 'Mental Load: Information overload, decision fatigue, and the pressure to constantly perform' },
  
  { type: 'heading', content: '🌍 Global Workplace Stress Crisis', level: 1 },
  { type: 'paragraph', content: 'According to the Gallup 2024 State of the Global Workplace Report, workplace stress has reached record highs across all regions. Middle East & North Africa leads at 52%, followed by US & Canada at 49%.' },
  
  { type: 'heading', content: '❤️ Health Beyond Work', level: 1 },
  { type: 'paragraph', content: 'When we discuss employee wellness, we must recognize that employees don\'t exist in a vacuum. They are parents, partners, friends, and community members. Their health affects not just their work performance but their entire life ecosystem.' },
  
  { type: 'heading', content: '🔬 The Science of Exercise & Performance', level: 1 },
  { type: 'paragraph', content: 'Research from the American College of Sports Medicine shows that regular physical activity improves cognitive function by up to 23%, reduces anxiety symptoms by 40%, and increases productivity by 21%.' },
  
  { type: 'heading', content: '📊 Forbes Business Case', level: 1 },
  { type: 'paragraph', content: 'Forbes research indicates that employees with access to wellness programs report 28% higher job satisfaction, 32% lower intention to leave, and 41% lower absenteeism rates.' },
  
  { type: 'heading', content: '🎯 Smarty Corporate Plans', level: 1 },
  { type: 'paragraph', content: 'SmartyGym offers four corporate wellness tiers designed for organizations of all sizes:' },
  { type: 'bullet', content: 'Smarty Dynamic (10 users) - €399/year' },
  { type: 'bullet', content: 'Smarty Power (20 users) - €499/year' },
  { type: 'bullet', content: 'Smarty Elite (30 users) - €599/year' },
  { type: 'bullet', content: 'Smarty Enterprise (unlimited) - €699/year' },
  
  { type: 'heading', content: '✅ Conclusion', level: 1 },
  { type: 'paragraph', content: 'Investing in corporate wellness is not an expense—it\'s a strategic investment that pays dividends in productivity, retention, healthcare savings, and company culture. The research is clear: healthy employees build healthy businesses.' },
];

// The SmartyGym Concept content
export const smartyGymConceptContent: ContentSection[] = [
  { type: 'heading', content: '📍 WHO WE ARE', level: 1 },
  { type: 'paragraph', content: 'SmartyGym is your gym re-imagined—anywhere, anytime. We are a comprehensive online fitness platform built on the principle of "100% Human. 0% AI." Every workout, program, and piece of content is designed by real fitness experts, not algorithms.' },
  { type: 'paragraph', content: 'Founded by Sports Scientist Haris Falas (CSCS-certified, 20+ years experience), SmartyGym brings professional fitness coaching to everyone, everywhere.' },
  
  { type: 'heading', content: '👥 WHO IS SMARTYGYM FOR?', level: 1 },
  { type: 'bullet', content: '💼 Busy Adults - Juggling work, life, and fitness goals' },
  { type: 'bullet', content: '👨‍👩‍👧‍👦 Parents - Limited time but unlimited commitment to health' },
  { type: 'bullet', content: '🌱 Beginners - Starting their fitness journey with expert guidance' },
  { type: 'bullet', content: '💪 Intermediate Lifters - Seeking structure and progressive overload' },
  { type: 'bullet', content: '✈️ Travelers - Needing flexible workouts without equipment' },
  { type: 'bullet', content: '🏋️ Gym-Goers - Wanting expert programming for better results' },
  
  { type: 'heading', content: '⚙️ HOW WE WORK', level: 1 },
  { type: 'paragraph', content: 'Our platform is built on intelligent periodization principles:' },
  { type: 'bullet', content: 'Expert-designed, human-crafted content—never auto-generated' },
  { type: 'bullet', content: 'Intelligent sequencing (never two strength days in a row)' },
  { type: 'bullet', content: 'Recovery-aware programming' },
  { type: 'bullet', content: 'Equipment and bodyweight options for every workout' },
  
  { type: 'heading', content: '🎯 WHAT WE OFFER', level: 1 },
  
  { type: 'heading', content: '📚 SMARTY WORKOUTS', level: 2 },
  { type: 'paragraph', content: '500+ expert-designed workouts across 6 categories:' },
  { type: 'bullet', content: '💪 Strength - Build muscle and raw power' },
  { type: 'bullet', content: '❤️ Cardio - Boost cardiovascular endurance' },
  { type: 'bullet', content: '🔥 Metabolic - High-intensity conditioning' },
  { type: 'bullet', content: '🔥 Calorie Burning - Maximize caloric expenditure' },
  { type: 'bullet', content: '🧘 Mobility & Stability - Improve movement quality' },
  { type: 'bullet', content: '🎯 Challenge - Push your limits' },
  { type: 'paragraph', content: 'Workout formats include: CIRCUIT, EMOM, FOR TIME, AMRAP, TABATA, REPS & SETS, and MIX.' },
  
  { type: 'heading', content: '📅 SMARTY PROGRAMS', level: 2 },
  { type: 'paragraph', content: 'Multi-week structured training journeys (4-12 weeks) with clear progression:' },
  { type: 'bullet', content: 'Cardio Endurance' },
  { type: 'bullet', content: 'Functional Strength' },
  { type: 'bullet', content: 'Muscle Hypertrophy' },
  { type: 'bullet', content: 'Weight Loss' },
  { type: 'bullet', content: 'Low Back Pain Relief' },
  { type: 'bullet', content: 'Mobility & Stability' },
  
  { type: 'heading', content: '📝 BLOG & EXPERT ARTICLES', level: 2 },
  { type: 'paragraph', content: 'Research-backed fitness knowledge, nutrition guidance, and training tips from the coach. Science meets practical application.' },
  
  { type: 'heading', content: '🌅 WORKOUT OF THE DAY (WOD)', level: 1 },
  { type: 'paragraph', content: 'Our flagship feature delivering fresh, strategically programmed workouts every single day.' },
  
  { type: 'heading', content: 'WOD Philosophy', level: 2 },
  { type: 'bullet', content: 'Strategic Recovery - Never two strength days back-to-back' },
  { type: 'bullet', content: 'Intelligent Sequencing - 7-day category rotation for balanced training' },
  { type: 'bullet', content: 'Variety - Different formats, difficulties, and equipment options' },
  { type: 'bullet', content: 'Safety, Variety, Results - Guaranteed' },
  
  { type: 'heading', content: 'WOD Structure', level: 2 },
  { type: 'bullet', content: 'Two fresh workouts daily (bodyweight + equipment)' },
  { type: 'bullet', content: 'Generated at midnight, notifications at 7:00 AM' },
  { type: 'bullet', content: 'Difficulty rotation (1-6 stars) ensuring progressive challenge' },
  { type: 'bullet', content: '7-day category cycle: Strength → Cardio → Metabolic → Mobility & Stability → Calorie Burning → Challenge → Rest' },
  
  { type: 'heading', content: '✨ SMARTY RITUALS', level: 1 },
  { type: 'paragraph', content: 'Daily wellness protocols for holistic health (Premium feature):' },
  { type: 'bullet', content: '🌅 Morning Ritual - Start your day with intention' },
  { type: 'bullet', content: '☀️ Midday Ritual - Reset and refocus' },
  { type: 'bullet', content: '🌙 Evening Ritual - Wind down and recover' },
  { type: 'paragraph', content: 'Each ritual includes mindfulness exercises, movement prompts, and wellness tips tailored to the time of day.' },
  
  { type: 'heading', content: '📊 SMARTY CHECK-INS', level: 1 },
  { type: 'paragraph', content: 'Track your daily readiness and wellness metrics:' },
  { type: 'bullet', content: 'Morning Check-in: Sleep quality, energy, mood, soreness' },
  { type: 'bullet', content: 'Night Check-in: Day strain, hydration, protein intake, steps' },
  { type: 'bullet', content: 'Daily Smarty Score calculation for performance insights' },
  { type: 'bullet', content: 'Historical tracking and trend analysis' },
  
  { type: 'heading', content: '🎯 GOALS SYSTEM', level: 1 },
  { type: 'paragraph', content: 'Set and track your fitness goals:' },
  { type: 'bullet', content: 'Weight targets with progress tracking' },
  { type: 'bullet', content: 'Body fat percentage goals' },
  { type: 'bullet', content: 'Muscle mass targets' },
  { type: 'bullet', content: 'Target dates with countdown' },
  { type: 'bullet', content: 'Personalized Monday Motivation reports based on goal progress' },
  
  { type: 'heading', content: '📖 LOGBOOK', level: 1 },
  { type: 'paragraph', content: 'Your complete activity history:' },
  { type: 'bullet', content: 'Calendar view of all completed workouts and activities' },
  { type: 'bullet', content: 'Activity timeline with filtering' },
  { type: 'bullet', content: 'Google Calendar integration for auto-sync' },
  { type: 'bullet', content: 'Progress visualization' },
  
  { type: 'heading', content: '🧮 SMARTY TOOLS', level: 1 },
  { type: 'paragraph', content: 'Professional calculators and tracking:' },
  { type: 'bullet', content: '1RM Calculator - Track strength progress across 13 exercises' },
  { type: 'bullet', content: 'BMR Calculator - Know your basal metabolic rate' },
  { type: 'bullet', content: 'Macro Calculator - Get personalized nutrition targets' },
  { type: 'bullet', content: 'Measurements Tracker - Body weight, fat %, muscle mass' },
  { type: 'bullet', content: 'Progress charts with historical data' },
  
  { type: 'heading', content: '👥 COMMUNITY', level: 1 },
  { type: 'paragraph', content: 'Connect with fellow Smarty members:' },
  { type: 'bullet', content: 'Leaderboards for workouts and programs' },
  { type: 'bullet', content: 'Top 6 competition format' },
  { type: 'bullet', content: 'Ratings and reviews' },
  { type: 'bullet', content: 'Comments and discussions' },
  { type: 'bullet', content: 'Testimonials from real users' },
  
  { type: 'heading', content: '👑 SUBSCRIPTION TIERS', level: 1 },
  { type: 'bullet', content: '🆓 Free - Access to free workouts and basic features' },
  { type: 'bullet', content: '🥇 Gold (€6.99/mo) - Full access to all workouts and programs' },
  { type: 'bullet', content: '💎 Platinum (€59.99/yr) - Everything plus Smarty Rituals, Check-ins, and premium features' },
  
  { type: 'heading', content: '🎯 OUR PROMISE', level: 1 },
  { type: 'paragraph', content: 'SmartyGym promises:' },
  { type: 'bullet', content: '100% Human-crafted content by certified professionals' },
  { type: 'bullet', content: 'Science-backed programming with real results' },
  { type: 'bullet', content: 'Accessible fitness for everyone, everywhere' },
  { type: 'bullet', content: 'Continuous updates with fresh workouts daily' },
  { type: 'bullet', content: 'Expert guidance at an affordable price' },
  
  { type: 'paragraph', content: '' },
  { type: 'paragraph', content: '---' },
  { type: 'paragraph', content: 'SmartyGym — Your Gym Re-imagined. Anywhere, Anytime.' },
  { type: 'paragraph', content: 'www.smartygym.com' },
];

// App Publishing Cost & Checklist Guide
export const appPublishingCostChecklistContent: ContentSection[] = [
  { type: 'heading', content: '📱 APP PUBLISHING COST & CHECKLIST GUIDE', level: 1 },
  { type: 'paragraph', content: 'Complete guide for publishing SmartyGym to the Apple App Store and Google Play Store, including all costs and step-by-step checklist.' },

  { type: 'heading', content: '💰 COST BREAKDOWN', level: 1 },
  
  { type: 'heading', content: '1. BuildNatively Subscription', level: 2 },
  { type: 'paragraph', content: 'BuildNatively converts your web app to native iOS and Android apps.' },
  { type: 'bullet', content: 'Monthly Plan: $32/month (billed annually)' },
  { type: 'bullet', content: 'Lifetime Plan: $699 one-time payment' },
  { type: 'paragraph', content: 'Website: https://app.buildnatively.com/' },
  { type: 'paragraph', content: 'Includes: App conversion, binary builds, push notification integration, iOS auto-upload to App Store Connect.' },
  { type: 'paragraph', content: 'Does NOT include: Apple/Google developer accounts, website hosting (Lovable handles this).' },

  { type: 'heading', content: '2. Apple Developer Program (Required for iOS)', level: 2 },
  { type: 'bullet', content: 'Cost: $99/year (mandatory annual fee)' },
  { type: 'bullet', content: 'Enrollment: https://developer.apple.com/programs/enroll/' },
  { type: 'bullet', content: 'Requirements: Apple ID, personal or business verification' },
  { type: 'paragraph', content: 'This is required to publish ANY app to the Apple App Store.' },

  { type: 'heading', content: '3. Google Play Console (Required for Android)', level: 2 },
  { type: 'bullet', content: 'Cost: $25 one-time fee (lifetime access)' },
  { type: 'bullet', content: 'Enrollment: https://play.google.com/console/signup' },
  { type: 'bullet', content: 'Requirements: Google account, payment verification' },
  { type: 'paragraph', content: 'This is required to publish ANY app to the Google Play Store.' },

  { type: 'heading', content: '📊 TOTAL COST SUMMARY', level: 1 },
  
  { type: 'heading', content: 'Option A: Monthly BuildNatively', level: 2 },
  { type: 'bullet', content: 'Year 1: $384 (BuildNatively) + $99 (Apple) + $25 (Google) = $508' },
  { type: 'bullet', content: 'Year 2+: $384 (BuildNatively) + $99 (Apple) = $483/year' },
  
  { type: 'heading', content: 'Option B: Lifetime BuildNatively (Recommended)', level: 2 },
  { type: 'bullet', content: 'Year 1: $699 (BuildNatively) + $99 (Apple) + $25 (Google) = $823' },
  { type: 'bullet', content: 'Year 2+: $99 (Apple only) = $99/year' },
  { type: 'paragraph', content: '💡 Lifetime plan saves money if you plan to maintain the app for 2+ years.' },

  { type: 'heading', content: '✅ PRE-PUBLISHING CHECKLIST', level: 1 },

  { type: 'heading', content: 'Step 1: Developer Account Setup', level: 2 },
  { type: 'bullet', content: '☐ Create Apple Developer account ($99/year)' },
  { type: 'bullet', content: '☐ Complete Apple identity verification (can take 24-48 hours)' },
  { type: 'bullet', content: '☐ Create Google Play Console account ($25 one-time)' },
  { type: 'bullet', content: '☐ Complete Google payment verification' },

  { type: 'heading', content: 'Step 2: BuildNatively Setup', level: 2 },
  { type: 'bullet', content: '☐ Subscribe to BuildNatively plan' },
  { type: 'bullet', content: '☐ Create new app project in BuildNatively' },
  { type: 'bullet', content: '☐ Enter app details (name: SmartyGym, bundle ID: app.lovable.f0bf7ae7990c4724b9e4b9150ef73d37)' },

  { type: 'heading', content: 'Step 3: Firebase Configuration', level: 2 },
  { type: 'bullet', content: '☐ Create Firebase project at https://console.firebase.google.com' },
  { type: 'bullet', content: '☐ Add Android app and download google-services.json' },
  { type: 'bullet', content: '☐ Add iOS app and download GoogleService-Info.plist' },
  { type: 'bullet', content: '☐ Enable Cloud Messaging API and copy Server Key' },
  { type: 'bullet', content: '☐ Upload config files to BuildNatively' },
  { type: 'bullet', content: '☐ Store FCM_SERVER_KEY in Lovable Cloud secrets' },

  { type: 'heading', content: 'Step 4: App Assets', level: 2 },
  { type: 'bullet', content: '☐ Upload App Icon (1024x1024 PNG, no transparency for iOS)' },
  { type: 'bullet', content: '☐ Upload Splash Screen image' },
  { type: 'bullet', content: '☐ Set iOS permission description for push notifications' },
  { type: 'paragraph', content: 'Suggested text: "SmartyGym would like to send you notifications about your workouts, appointments, and important updates."' },

  { type: 'heading', content: 'Step 5: Store Listings Preparation', level: 2 },
  { type: 'bullet', content: '☐ Prepare app description (see App Store Text Content in admin docs)' },
  { type: 'bullet', content: '☐ Prepare keywords/tags for discoverability' },
  { type: 'bullet', content: '☐ Capture screenshots for all required device sizes' },
  { type: 'bullet', content: '☐ Create feature graphic (Google Play: 1024x500)' },
  { type: 'bullet', content: '☐ Prepare privacy policy URL' },
  { type: 'bullet', content: '☐ Prepare support URL and email' },

  { type: 'heading', content: '🚀 PUBLISHING PROCESS', level: 1 },

  { type: 'heading', content: 'iOS Publishing', level: 2 },
  { type: 'bullet', content: '1. BuildNatively generates iOS build (IPA file)' },
  { type: 'bullet', content: '2. Auto-uploads to App Store Connect (via BuildNatively)' },
  { type: 'bullet', content: '3. Complete app listing in App Store Connect' },
  { type: 'bullet', content: '4. Submit for Apple review (typically 1-3 days)' },
  { type: 'bullet', content: '5. App goes live after approval' },

  { type: 'heading', content: 'Android Publishing', level: 2 },
  { type: 'bullet', content: '1. BuildNatively generates Android build (AAB file)' },
  { type: 'bullet', content: '2. Download AAB from BuildNatively' },
  { type: 'bullet', content: '3. Upload AAB to Google Play Console manually' },
  { type: 'bullet', content: '4. Complete store listing in Play Console' },
  { type: 'bullet', content: '5. Submit for Google review (typically 1-7 days for new apps)' },
  { type: 'bullet', content: '6. App goes live after approval' },

  { type: 'heading', content: '⏱️ TIMELINE ESTIMATES', level: 1 },
  { type: 'bullet', content: 'Developer account setup: 1-3 days (Apple verification can take time)' },
  { type: 'bullet', content: 'BuildNatively & Firebase setup: 1-2 hours' },
  { type: 'bullet', content: 'Asset preparation: 2-4 hours' },
  { type: 'bullet', content: 'Store listing completion: 1-2 hours per platform' },
  { type: 'bullet', content: 'Apple review: 1-3 days (can be longer for first submission)' },
  { type: 'bullet', content: 'Google review: 1-7 days (new apps take longer)' },
  { type: 'paragraph', content: 'Total estimated time: 1-2 weeks from start to live on both stores.' },

  { type: 'heading', content: '🔧 OPTIONAL SERVICES', level: 1 },
  { type: 'bullet', content: 'BuildNatively "App Store Release" service: $600 - They handle the entire submission process for you' },
  { type: 'paragraph', content: 'This is optional but useful if you want hands-off publishing.' },

  { type: 'heading', content: '📝 IMPORTANT NOTES', level: 1 },
  { type: 'bullet', content: 'Lovable hosts your website - no separate hosting needed' },
  { type: 'bullet', content: 'BuildNatively does NOT host your app - it converts and builds only' },
  { type: 'bullet', content: 'You must maintain Apple Developer membership annually to keep iOS app live' },
  { type: 'bullet', content: 'Google Play is one-time fee - no annual renewal needed' },
  { type: 'bullet', content: 'App updates require new builds through BuildNatively' },

  { type: 'paragraph', content: '' },
  { type: 'paragraph', content: '---' },
  { type: 'paragraph', content: 'SmartyGym — Your Gym Re-imagined. Anywhere, Anytime.' },
  { type: 'paragraph', content: 'www.smartygym.com' },
];

// WOD Philosophy Content - Complete AI Instructions
export const wodPhilosophyContent: ContentSection[] = [
  { type: 'heading', content: 'WOD (WORKOUT OF THE DAY) GENERATION PHILOSOPHY', level: 1 },
  { type: 'paragraph', content: 'Science based operational rules for daily workout generation.' },
  
  { type: 'heading', content: 'CORE PRINCIPLE', level: 1 },
  { type: 'paragraph', content: 'The Workout of the Day system is designed to balance performance, recovery, variety, and adherence over long-term use. Each workout must respect physiology, training principles, and accumulated fatigue from previous days.' },
  { type: 'paragraph', content: 'The system prioritizes:' },
  { type: 'bullet', content: 'Progressive overload over weeks' },
  { type: 'bullet', content: 'Neuromuscular recovery' },
  { type: 'bullet', content: 'Metabolic and cardiovascular balance' },
  { type: 'bullet', content: 'Joint health and injury prevention' },
  { type: 'bullet', content: 'User engagement without randomness' },
  
  { type: 'heading', content: '7-DAY CATEGORY CYCLE (FIXED)', level: 1 },
  { type: 'paragraph', content: 'The category sequence is fixed and must not change.' },
  { type: 'bullet', content: 'Day 1: Challenge' },
  { type: 'bullet', content: 'Day 2: Strength (Reps and Sets only)' },
  { type: 'bullet', content: 'Day 3: Cardio' },
  { type: 'bullet', content: 'Day 4: Mobility and Stability (Reps and Sets only)' },
  { type: 'bullet', content: 'Day 5: Strength (Reps and Sets only)' },
  { type: 'bullet', content: 'Day 6: Metabolic' },
  { type: 'bullet', content: 'Day 7: Calorie Burning' },
  { type: 'paragraph', content: 'Rationale: High neural and mechanical stress days are always followed by lower systemic or restorative days. No two consecutive days overload the same primary system.' },
  
  { type: 'heading', content: 'DAILY WORKOUT OUTPUT', level: 1 },
  { type: 'paragraph', content: 'For every Workout of the Day, the system must generate:' },
  { type: 'bullet', content: 'One Bodyweight version' },
  { type: 'bullet', content: 'One Equipment based version' },
  { type: 'paragraph', content: 'Both versions must: Follow the same category, difficulty, and format logic. Deliver equivalent physiological stress. Differ only in tools, not in intent.' },
  
  { type: 'heading', content: 'DIFFICULTY SYSTEM (6-STAR MODEL)', level: 1 },
  { type: 'paragraph', content: 'Difficulty reflects: Volume, Intensity, Density, Coordination demand, Cognitive load' },
  { type: 'bullet', content: '1–2 Stars: Beginner' },
  { type: 'bullet', content: '3–4 Stars: Intermediate' },
  { type: 'bullet', content: '5–6 Stars: Advanced' },
  { type: 'heading', content: 'Base Weekly Difficulty Pattern', level: 2 },
  { type: 'paragraph', content: 'Default daily difficulty sequence: Intermediate → Advanced → Beginner → Advanced → Intermediate → Beginner → Advanced' },
  { type: 'paragraph', content: 'This pattern ensures no accumulation of high fatigue days. Advanced days are buffered by lower stress sessions.' },
  { type: 'heading', content: 'Weekly Rotation Rule', level: 2 },
  { type: 'paragraph', content: 'Each new week, the difficulty pattern shifts forward by one position. No category is always Beginner or always Advanced. The same star rating must not appear on the same category in consecutive weeks.' },
  
  { type: 'heading', content: 'FORMAT RULES BY CATEGORY (STRICT BUT INTELLIGENT)', level: 1 },
  { type: 'heading', content: 'Strength', level: 2 },
  { type: 'bullet', content: 'Reps and Sets only' },
  { type: 'bullet', content: 'Rest between sets is mandatory' },
  { type: 'bullet', content: 'Focus on load, tempo, and technical quality' },
  { type: 'heading', content: 'Mobility and Stability', level: 2 },
  { type: 'bullet', content: 'Reps and Sets only' },
  { type: 'bullet', content: 'Slow tempo' },
  { type: 'bullet', content: 'Controlled ranges of motion' },
  { type: 'bullet', content: 'No time pressure' },
  { type: 'heading', content: 'Cardio, Metabolic, Calorie Burning', level: 2 },
  { type: 'bullet', content: 'Primary formats: Circuit, EMOM, For Time, AMRAP, Tabata' },
  { type: 'bullet', content: 'Reps and Sets may appear ONLY as: Low load, Submaximal, Part of a larger continuous structure' },
  { type: 'bullet', content: 'Never as classic strength loading' },
  { type: 'heading', content: 'Challenge', level: 2 },
  { type: 'bullet', content: 'Any format except classic Reps and Sets' },
  { type: 'bullet', content: 'Mix formats are encouraged' },
  { type: 'paragraph', content: 'IMPORTANT: Reps and Sets is a pacing and control tool. It is exclusive as a main structure only in Strength and Mobility. Other categories may include reps based blocks ONLY if they preserve continuous activity.' },
  
  { type: 'heading', content: 'FORMAT MIXING LOGIC (ADVANCED RULE)', level: 1 },
  { type: 'paragraph', content: 'In non-strength categories, workouts may combine formats.' },
  { type: 'bullet', content: 'Tabata followed by AMRAP' },
  { type: 'bullet', content: 'Circuit finishing with For Time' },
  { type: 'bullet', content: 'EMOM transitioning into Tabata' },
  { type: 'paragraph', content: 'Rules: Only one dominant stimulus per workout. Mixing must increase engagement, not confusion. Never mix maximal strength loading with metabolic density.' },
  
  { type: 'heading', content: 'LOAD AND INTENSITY GOVERNANCE', level: 1 },
  { type: 'heading', content: 'Strength', level: 2 },
  { type: 'bullet', content: '60–90 percent of estimated 1RM depending on stars' },
  { type: 'bullet', content: 'Longer rest' },
  { type: 'bullet', content: 'Low movement count' },
  { type: 'heading', content: 'Metabolic and Cardio', level: 2 },
  { type: 'bullet', content: '30–50 percent of strength capacity' },
  { type: 'bullet', content: 'Never above moderate load' },
  { type: 'bullet', content: 'Continuous movement priority' },
  { type: 'heading', content: 'Calorie Burning', level: 2 },
  { type: 'bullet', content: 'Light to moderate loads' },
  { type: 'bullet', content: 'High repetition' },
  { type: 'bullet', content: 'Sustainable pacing' },
  { type: 'paragraph', content: 'ABSOLUTE RULE: No metabolic or calorie workout may prescribe heavy percentages of 1RM.' },
  
  { type: 'heading', content: 'EQUIPMENT GOVERNANCE', level: 1 },
  { type: 'paragraph', content: 'All workouts must use gym based equipment only.' },
  { type: 'heading', content: 'Allowed Cardio Machines', level: 2 },
  { type: 'bullet', content: 'Treadmill, Assault bike, Spin bike, Elliptical, Ski erg, Rowing machine, Stair climber, Jump rope' },
  { type: 'heading', content: 'Allowed Gym Tools', level: 2 },
  { type: 'bullet', content: 'Wall balls, Medicine balls, Kettlebells, Dumbbells, Battle ropes, Weight vest, Sled pushes/pulls, Box jumps, Sandbags, Farmer carries' },
  { type: 'paragraph', content: 'PROHIBITED: Swimming, Outdoor only activities, Terrain dependent movements' },
  { type: 'paragraph', content: 'Equipment selection must: Match category intent. Scale correctly with difficulty. Never dominate technique at the expense of movement quality.' },
  
  { type: 'heading', content: 'VOLUME AND VALUE-FOR-MONEY STANDARDS', level: 1 },
  { type: 'bullet', content: 'Beginner (1-2 stars): 100–150 total movements' },
  { type: 'bullet', content: 'Intermediate (3-4 stars): 150–250 total movements' },
  { type: 'bullet', content: 'Advanced (5-6 stars): 200–350 or more movements' },
  { type: 'paragraph', content: 'Movement count reflects: Total reps, Total steps, Total calories, Total strokes. The goal is perceived value without unnecessary fatigue.' },
  
  { type: 'heading', content: 'CHALLENGE CATEGORY SPECIAL RULES', level: 1 },
  { type: 'paragraph', content: 'Challenge workouts test: Mental resilience, Coordination, Work capacity, Decision making under fatigue' },
  { type: 'paragraph', content: 'They may: Combine multiple formats, Use non linear structures, Increase cognitive demand' },
  { type: 'paragraph', content: 'They must still: Respect safety, Avoid maximal strength loading, Remain scalable' },
  
  { type: 'heading', content: 'RECOVERY AND FATIGUE AWARENESS', level: 1 },
  { type: 'paragraph', content: 'The AI must always evaluate: Previous day category, Previous day difficulty, Cumulative stress' },
  { type: 'paragraph', content: 'Advanced days following advanced days must: Reduce volume, Reduce impact, Or shift stimulus focus' },
  
  { type: 'heading', content: 'CONSISTENCY OVER NOVELTY', level: 1 },
  { type: 'paragraph', content: 'The system favors: Smart variation, Rotating structures, Predictable logic' },
  { type: 'paragraph', content: 'Over: Random exercise selection, Extreme fatigue chasing, Unstructured creativity' },
  
  { type: 'heading', content: 'GENERAL SYSTEM RULES - NON NEGOTIABLE', level: 1 },
  { type: 'bullet', content: '1. FORMATTING, DESIGN & STRUCTURE ARE UNTOUCHABLE - The system must NEVER change the existing formatting, layout, or visual logic.' },
  { type: 'bullet', content: '2. CATEGORIES, SUBCATEGORIES & LOGIC ARE FIXED - The six categories, difficulty system, weekly sequence, and format rules are FINAL.' },
  { type: 'bullet', content: '3. EVERY WORKOUT MUST HAVE CLEAR PURPOSE - Each workout must clearly express what it trains and why it exists in the weekly sequence.' },
  { type: 'bullet', content: '4. DESCRIPTION, INSTRUCTIONS & TIPS ARE MANDATORY - Every workout must include: Clear description, Step by step instructions, Practical tips' },
  { type: 'bullet', content: '5. VALUE FOR MONEY IS A CORE FILTER - These workouts are sold products. Every WOD must deliver substantial training value.' },
  { type: 'bullet', content: '6. INTELLIGENT VARIATION, NOT REPETITION - Rotate exercises, movement patterns, equipment usage, format combinations where allowed.' },
  { type: 'bullet', content: '7. EXAMPLES DO NOT LIMIT CREATIVITY - The system is encouraged to explore new but logical progressions within rules.' },
  { type: 'bullet', content: '8. LOAD, SPEED & FATIGUE MUST MATCH THE CATEGORY - No heavy 1RM percentages in metabolic work. No rushed balance work in mobility sessions.' },
  { type: 'bullet', content: '9. PROFESSIONAL TONE, NEVER CIRCUS - Workout names and structures must remain serious, professional, and coach driven.' },
  { type: 'bullet', content: '10. LONG TERM USAGE MENTALITY - Every workout must respect recovery, joint health, nervous system fatigue, motivation sustainability.' },
  
  { type: 'heading', content: 'FINAL COACH STATEMENT', level: 1 },
  { type: 'paragraph', content: 'This WOD system is designed to be used daily, year round. It prioritizes performance longevity, joint health, and results over hype. Every workout must earn its place in the sequence.' },
  
  { type: 'paragraph', content: '' },
  { type: 'paragraph', content: '---' },
  { type: 'paragraph', content: 'SmartyGym — Your Gym Re-imagined. Anywhere, Anytime.' },
  { type: 'paragraph', content: 'www.smartygym.com' },
];

// Workouts Philosophy Content
export const workoutsPhilosophyContent: ContentSection[] = [
  { type: 'heading', content: 'WORKOUTS GENERATION PHILOSOPHY', level: 1 },
  { type: 'paragraph', content: 'Complete rules for generating individual workouts in the SmartyGym platform.' },
  
  { type: 'heading', content: 'SIX WORKOUT CATEGORIES', level: 1 },
  { type: 'bullet', content: 'STRENGTH - Build muscle, increase force production, improve functional strength' },
  { type: 'bullet', content: 'CARDIO - Improve heart rate capacity, aerobic and anaerobic conditioning' },
  { type: 'bullet', content: 'METABOLIC - Maximize calorie burn, boost metabolism, improve work capacity' },
  { type: 'bullet', content: 'CALORIE BURNING - Maximum calorie expenditure, fat loss focus' },
  { type: 'bullet', content: 'MOBILITY & STABILITY - Flexibility, joint mobility, core stability, injury prevention' },
  { type: 'bullet', content: 'CHALLENGE - Test limits, mental toughness, full-body effort' },
  
  { type: 'heading', content: 'FORMAT RULES', level: 1 },
  { type: 'bullet', content: 'STRENGTH: REPS & SETS only - rest between sets mandatory' },
  { type: 'bullet', content: 'MOBILITY & STABILITY: REPS & SETS only - slow tempo, controlled movements' },
  { type: 'bullet', content: 'CARDIO/METABOLIC/CALORIE BURNING: Circuit, EMOM, For Time, AMRAP, Tabata' },
  { type: 'bullet', content: 'CHALLENGE: Any format except classic Reps & Sets, mix formats encouraged' },
  
  { type: 'heading', content: 'DIFFICULTY LEVELS (6-STAR SYSTEM)', level: 1 },
  { type: 'bullet', content: '1-2 Stars: Beginner - Lower volume, simpler movements, longer rest' },
  { type: 'bullet', content: '3-4 Stars: Intermediate - Moderate volume and complexity' },
  { type: 'bullet', content: '5-6 Stars: Advanced - High volume, complex movements, minimal rest' },
  
  { type: 'heading', content: 'EQUIPMENT OPTIONS', level: 1 },
  { type: 'paragraph', content: 'Each workout should be available in both versions:' },
  { type: 'bullet', content: 'BODYWEIGHT - No equipment required, portable and accessible' },
  { type: 'bullet', content: 'EQUIPMENT - Uses gym equipment (dumbbells, kettlebells, machines, etc.)' },
  
  { type: 'heading', content: 'QUALITY STANDARDS', level: 1 },
  { type: 'bullet', content: 'Every workout must have clear purpose and training intent' },
  { type: 'bullet', content: 'Must include warm-up, main workout, and cool-down sections' },
  { type: 'bullet', content: 'Must include detailed instructions and coaching tips' },
  { type: 'bullet', content: 'Volume must match difficulty level (100-350+ movements)' },
  
  { type: 'paragraph', content: '' },
  { type: 'paragraph', content: '---' },
  { type: 'paragraph', content: 'SmartyGym — Your Gym Re-imagined. Anywhere, Anytime.' },
];

// Training Programs Philosophy Content
export const trainingProgramsPhilosophyContent: ContentSection[] = [
  { type: 'heading', content: 'TRAINING PROGRAMS GENERATION PHILOSOPHY', level: 1 },
  { type: 'paragraph', content: 'Complete rules for generating multi-week structured training programs.' },
  
  { type: 'heading', content: 'PROGRAM CATEGORIES', level: 1 },
  { type: 'bullet', content: 'Cardio Endurance - Improve cardiovascular capacity over 4-12 weeks' },
  { type: 'bullet', content: 'Functional Strength - Build practical, real-world strength' },
  { type: 'bullet', content: 'Muscle Hypertrophy - Focus on muscle growth and size' },
  { type: 'bullet', content: 'Weight Loss - Calorie deficit + exercise programming' },
  { type: 'bullet', content: 'Low Back Pain Relief - Therapeutic exercise progression' },
  { type: 'bullet', content: 'Mobility & Stability - Flexibility and movement quality focus' },
  
  { type: 'heading', content: 'PROGRAM STRUCTURE', level: 1 },
  { type: 'bullet', content: 'Duration: 4-12 weeks depending on goal complexity' },
  { type: 'bullet', content: 'Days per week: 3-6 days based on program intensity' },
  { type: 'bullet', content: 'Progressive overload: Clear week-to-week progression' },
  { type: 'bullet', content: 'Periodization: Proper loading and deload weeks' },
  
  { type: 'heading', content: 'REQUIRED COMPONENTS', level: 1 },
  { type: 'bullet', content: 'Program overview and expected results' },
  { type: 'bullet', content: 'Weekly schedule with clear workout days' },
  { type: 'bullet', content: 'Individual workout details for each day' },
  { type: 'bullet', content: 'Progression plan showing how difficulty increases' },
  { type: 'bullet', content: 'Nutrition tips relevant to the program goal' },
  
  { type: 'heading', content: 'QUALITY STANDARDS', level: 1 },
  { type: 'bullet', content: 'Programs must deliver measurable results' },
  { type: 'bullet', content: 'Clear target audience definition' },
  { type: 'bullet', content: 'Equipment requirements specified upfront' },
  { type: 'bullet', content: 'Rest and recovery built into the schedule' },
  
  { type: 'paragraph', content: '' },
  { type: 'paragraph', content: '---' },
  { type: 'paragraph', content: 'SmartyGym — Your Gym Re-imagined. Anywhere, Anytime.' },
];
