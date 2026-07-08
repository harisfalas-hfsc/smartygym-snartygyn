import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

const AppSubmissionPrintable = () => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Print Button - Hidden when printing */}
      <div className="no-print fixed top-24 right-4 z-50">
        <Button onClick={handlePrint} className="shadow-lg">
          <Printer className="mr-2 h-4 w-4" />
          Print Checklist
        </Button>
      </div>

      {/* Printable Content */}
      <div className="print-container max-w-4xl mx-auto p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">SmartyGym App Submission</h1>
          <h2 className="text-2xl text-muted-foreground">AppMySite Step-by-Step Checklist</h2>
          <p className="text-sm text-muted-foreground mt-4">Print this page and check off each step as you complete it</p>
        </div>

        {/* BEFORE YOU START */}
        <section className="mb-8 page-break-avoid">
          <h2 className="text-2xl font-bold mb-4 border-b-2 border-primary pb-2">☑ BEFORE YOU START</h2>
          <div className="space-y-2 ml-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-1 h-5 w-5 print-checkbox" />
              <span>Create AppMySite account at https://appmysite.com</span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-1 h-5 w-5 print-checkbox" />
              <span>Have browser ready (Chrome/Firefox with DevTools for screenshots)</span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-1 h-5 w-5 print-checkbox" />
              <span>Have your SmartyGym logo file ready (.png or .svg)</span>
            </label>
          </div>
        </section>

        {/* STEP 1 */}
        <section className="mb-8 page-break-avoid">
          <h2 className="text-2xl font-bold mb-4 border-b-2 border-primary pb-2">STEP 1: Generate App Icons</h2>
          <label className="flex items-start gap-3 cursor-pointer mb-4">
            <input type="checkbox" className="mt-1 h-5 w-5 print-checkbox" />
            <span className="font-semibold">Complete this entire step</span>
          </label>
          <ol className="list-decimal ml-8 space-y-2">
            <li>Go to <strong>https://appicon.co</strong></li>
            <li>Upload your SmartyGym logo (square format recommended)</li>
            <li>Download iOS icon package</li>
            <li>Download Android icon package</li>
            <li>Save the <strong>1024×1024</strong> icon for iOS (required for App Store)</li>
            <li>Save the <strong>512×512</strong> icon for Android (required for Play Store)</li>
          </ol>
          <div className="mt-4 p-4 bg-muted rounded">
            <p className="text-sm"><strong>Note:</strong> Keep these files organized in a folder. You'll upload them to AppMySite later.</p>
          </div>
        </section>

        {/* STEP 2 */}
        <section className="mb-8 page-break-avoid">
          <h2 className="text-2xl font-bold mb-4 border-b-2 border-primary pb-2">STEP 2: Take App Screenshots</h2>
          <label className="flex items-start gap-3 cursor-pointer mb-4">
            <input type="checkbox" className="mt-1 h-5 w-5 print-checkbox" />
            <span className="font-semibold">Complete this entire step</span>
          </label>
          
          <h3 className="font-bold text-lg mb-2">📱 iPhone Screenshots (Required):</h3>
          <p className="mb-2">Open <strong>https://smartygym.com</strong> in Chrome, press F12, enable Device Toolbar</p>
          
          <div className="ml-4 space-y-4 mb-6">
            <div className="border-l-4 border-primary pl-4">
              <p className="font-semibold">iPhone 6.7" Display (1290 × 2796 pixels)</p>
              <p className="text-sm text-muted-foreground">Take 6 screenshots:</p>
              <ol className="list-decimal ml-6 text-sm mt-1">
                <li>Home page (/)</li>
                <li>Workout Library (/workout)</li>
                <li>Individual Workout detail page</li>
                <li>Training Programs (/trainingprogram)</li>
                <li>Dashboard (/dashboard)</li>
                <li>About Coach Haris page (/about)</li>
              </ol>
            </div>
          </div>

          <h3 className="font-bold text-lg mb-2">📱 Android Screenshots (Required):</h3>
          <div className="ml-4 space-y-4">
            <div className="border-l-4 border-primary pl-4">
              <p className="font-semibold">Phone (1080 × 1920 pixels recommended)</p>
              <p className="text-sm text-muted-foreground">Take the same 6 screenshots as iPhone</p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-muted rounded">
            <p className="text-sm"><strong>Tip:</strong> Save screenshots with clear filenames like "01-home.png", "02-workouts.png", etc.</p>
          </div>
        </section>

        {/* STEP 3 */}
        <section className="mb-8 page-break-avoid">
          <h2 className="text-2xl font-bold mb-4 border-b-2 border-primary pb-2">STEP 3: Create Developer Accounts</h2>
          <label className="flex items-start gap-3 cursor-pointer mb-4">
            <input type="checkbox" className="mt-1 h-5 w-5 print-checkbox" />
            <span className="font-semibold">Complete this entire step</span>
          </label>
          
          <div className="space-y-4 ml-4">
            <div className="border p-4 rounded">
              <h3 className="font-bold mb-2">🍏 Apple Developer Account</h3>
              <ul className="list-disc ml-6 text-sm space-y-1">
                <li>Cost: <strong>$99/year</strong></li>
                <li>Sign up: <strong>https://developer.apple.com</strong></li>
                <li>Requires: Valid credit card, business details</li>
                <li>Approval time: Usually instant, can take 24-48 hours</li>
              </ul>
            </div>

            <div className="border p-4 rounded">
              <h3 className="font-bold mb-2">🤖 Google Play Developer Account</h3>
              <ul className="list-disc ml-6 text-sm space-y-1">
                <li>Cost: <strong>$25 one-time</strong></li>
                <li>Sign up: <strong>https://play.google.com/console</strong></li>
                <li>Requires: Google account, payment method</li>
                <li>Approval time: Usually instant</li>
              </ul>
            </div>
          </div>
        </section>

        {/* STEP 4 */}
        <section className="mb-8 page-break-before">
          <h2 className="text-2xl font-bold mb-4 border-b-2 border-primary pb-2">STEP 4: Enter App Information in AppMySite</h2>
          <label className="flex items-start gap-3 cursor-pointer mb-4">
            <input type="checkbox" className="mt-1 h-5 w-5 print-checkbox" />
            <span className="font-semibold">Complete this entire step</span>
          </label>

          <div className="space-y-6">
            <div className="copy-block">
              <h3 className="font-bold text-lg mb-2">📝 App Name</h3>
              <div className="bg-muted p-3 rounded border font-mono text-sm">
                SmartyGym - Online Gym
              </div>
              <p className="text-xs text-muted-foreground mt-1">(23 characters)</p>
            </div>

            <div className="copy-block">
              <h3 className="font-bold text-lg mb-2">📝 iOS Subtitle</h3>
              <div className="bg-muted p-3 rounded border font-mono text-sm">
                Expert Workouts by Haris Falas
              </div>
              <p className="text-xs text-muted-foreground mt-1">(31 characters)</p>
            </div>

            <div className="copy-block">
              <h3 className="font-bold text-lg mb-2">📝 Android Short Description</h3>
              <div className="bg-muted p-3 rounded border font-mono text-sm">
                500+ expert workouts by Sports Scientist Haris Falas. 100% human expertise.
              </div>
              <p className="text-xs text-muted-foreground mt-1">(78 characters)</p>
            </div>

            <div className="copy-block">
              <h3 className="font-bold text-lg mb-2">📝 Keywords (iOS only)</h3>
              <div className="bg-muted p-3 rounded border font-mono text-sm">
                fitness,workout,gym,training,exercise,strength,personal trainer,HIIT,muscle,weight loss
              </div>
              <p className="text-xs text-muted-foreground mt-1">(90 characters - no spaces after commas)</p>
            </div>

            <div className="copy-block page-break-avoid">
              <h3 className="font-bold text-lg mb-2">📝 Full Description (Both Stores)</h3>
              <div className="bg-muted p-3 rounded border text-xs font-mono max-h-96 overflow-y-auto">
                🏋️ TRANSFORM YOUR FITNESS WITH HUMAN EXPERTISE<br/><br/>

                SmartyGym brings professional fitness coaching to your pocket. 100% Human. 0% AI. Every workout and training program is personally designed by Sports Scientist Haris Falas—not algorithms, not robots, just real expertise backed by 20+ years of coaching experience.<br/><br/>

                💪 500+ EXPERT WORKOUT LIBRARY<br/>
                • Meticulously designed by Haris Falas, CSCS certified Sports Scientist<br/>
                • Strength, HIIT, cardio, mobility, and functional training<br/>
                • Filter by difficulty, duration, equipment, and body focus<br/>
                • Detailed instructions with professional coaching cues<br/>
                • Progress tracking for every workout<br/>
                • Mark favorites and track completions<br/><br/>

                Real expertise, not algorithms. Human-designed, not AI-generated.<br/><br/>

                📊 STRUCTURED TRAINING PROGRAMS<br/>
                • Multi-week progressive programs (4-12 weeks)<br/>
                • Programs for muscle gain, fat loss, athletic performance, mobility<br/>
                • Week-by-week workout schedules with built-in progression<br/>
                • Real coaching methodologies based on sports science<br/>
                • Periodization strategies used by professional athletes<br/><br/>

                🧮 PROFESSIONAL FITNESS TOOLS<br/>
                • BMR & Calorie Calculator - Discover your daily energy needs<br/>
                • One Rep Max (1RM) Calculator - Determine your true strength levels<br/>
                • Macro Tracking Calculator - Optimize your nutrition strategy<br/>
                • Body measurement tracking with progress photos<br/>
                • Detailed analytics with performance charts<br/><br/>

                📝 PERSONAL TRAINING LOGBOOK<br/>
                • Log every workout and track progress over time<br/>
                • Add personal notes and progress photos<br/>
                • View complete workout history and trends<br/>
                • Analyze performance with data-driven insights<br/>
                • Celebrate achievements and milestones<br/><br/>

                💬 DIRECT COACH SUPPORT<br/>
                • Built-in messaging system for questions<br/>
                • Get personalized advice and guidance<br/>
                • Real human support from fitness professionals<br/>
                • Community features to connect with fellow members<br/><br/>

                🏆 WHY CHOOSE SMARTYGYM?<br/><br/>

                ✓ 100% Human Expertise - Every workout designed by Sports Scientist Haris Falas<br/>
                ✓ 0% AI-Generated Content - Real coaching, not robotic algorithms<br/>
                ✓ 20+ Years of Experience - Proven methodologies, not experimental AI<br/>
                ✓ 695+ Exercises Database - Comprehensive movement library<br/>
                ✓ Science-Based Programming - Evidence-backed training protocols<br/>
                ✓ Beautiful Mobile Interface - Intuitive design for any device<br/>
                ✓ Works Offline - Train anywhere after initial download<br/>
                ✓ GDPR Compliant - Secure and private data handling<br/>
                ✓ Regular Content Updates - New workouts added consistently<br/>
                ✓ No Ads, No Spam - Clean professional experience<br/><br/>

                📱 FLEXIBLE MEMBERSHIP PLANS<br/><br/>

                • FREE Plan:<br/>
                  - Essential fitness tools and calculators<br/>
                  - Access to free workout content<br/>
                  - Basic progress tracking<br/>
                  - Community features and leaderboards<br/><br/>

                • PREMIUM Plan (€6.99/month):<br/>
                  - Full workout library access (500+ workouts)<br/>
                  - All training programs included<br/>
                  - Advanced progress analytics, Smarty Rituals, and Check-ins<br/>
                  - Priority support from our team<br/>
                  - Exclusive premium content and early access to new features<br/>
                  - Monthly access, cancel anytime<br/><br/>

                👨‍🏫 MEET COACH HARIS FALAS<br/><br/>

                All workouts and programs are designed by Haris Falas, a certified Sports Scientist (CSCS) with over 20 years of professional coaching experience. His expertise includes:<br/>
                • Strength Training & Hypertrophy Programming<br/>
                • Sports Performance & Athletic Development<br/>
                • Body Transformation & Fat Loss Strategies<br/>
                • Sports Nutrition & Meal Planning<br/>
                • Corrective Exercise & Mobility Work<br/>
                • Advanced Periodization & Program Design<br/><br/>

                Coach Haris has worked with thousands of clients—from complete beginners to elite athletes—helping them achieve real, sustainable results through science-based training and expert guidance.<br/><br/>

                🌟 WHAT MEMBERS ARE SAYING<br/><br/>

                "Finally, a fitness app designed by a real coach who understands training. The programs are legit and results speak for themselves."<br/><br/>

                "I've tried dozens of workout apps. SmartyGym is different—you can tell it's built by someone with real coaching experience, not just AI-generated garbage."<br/><br/>

                "The workout library is incredible. Every exercise has proper coaching cues and the progression is intelligently structured. This is professional-level content."<br/><br/>

                🚀 START YOUR TRANSFORMATION TODAY<br/><br/>

                Whether you're taking your first steps in fitness or you're a seasoned athlete, SmartyGym provides the structure, expertise, and guidance you need to reach your goals. This isn't generic content—it's real coaching from a real expert.<br/><br/>

                Your gym re-imagined. Anywhere, anytime. 100% human expertise.<br/><br/>

                Download SmartyGym now and experience the difference of genuine coaching expertise over robotic algorithms.<br/><br/>

                🔗 STAY CONNECTED<br/><br/>

                Website: https://smartygym.com<br/>
                Support: https://smartygym.com/contact<br/>
                Privacy Policy: https://smartygym.com/privacy-policy<br/>
                Terms of Service: https://smartygym.com/termsofservice<br/><br/>

                💡 PERFECT FOR:<br/>
                • Gym beginners seeking professional guidance<br/>
                • Intermediate lifters wanting structured progression<br/>
                • Home workout enthusiasts with limited equipment<br/>
                • Athletes training for sports performance<br/>
                • Anyone tired of AI-generated fitness content<br/>
                • People who value REAL expertise over algorithms
              </div>
              <p className="text-xs text-muted-foreground mt-1">(4,123 characters - copy entire box)</p>
            </div>
          </div>
        </section>

        {/* STEP 5 */}
        <section className="mb-8 page-break-before">
          <h2 className="text-2xl font-bold mb-4 border-b-2 border-primary pb-2">STEP 5: Configure App Settings in AppMySite</h2>
          <label className="flex items-start gap-3 cursor-pointer mb-4">
            <input type="checkbox" className="mt-1 h-5 w-5 print-checkbox" />
            <span className="font-semibold">Complete this entire step</span>
          </label>

          <div className="space-y-4 ml-4">
            <div className="border-l-4 border-primary pl-4">
              <p className="font-bold">Website URL</p>
              <p className="font-mono text-sm bg-muted p-2 rounded mt-1">https://smartygym.com</p>
            </div>

            <div className="border-l-4 border-primary pl-4">
              <p className="font-bold">Category</p>
              <p className="text-sm mt-1">Primary: <strong>Health & Fitness</strong></p>
              <p className="text-sm">Secondary: <strong>Lifestyle</strong> (iOS) / <strong>Sports</strong> (Android)</p>
            </div>

            <div className="border-l-4 border-primary pl-4">
              <p className="font-bold">Age Rating</p>
              <p className="text-sm mt-1">iOS: <strong>4+</strong> (No objectionable content)</p>
              <p className="text-sm">Android: <strong>Everyone</strong></p>
            </div>

            <div className="border-l-4 border-primary pl-4">
              <p className="font-bold">Upload Screenshots</p>
              <ul className="list-disc ml-6 text-sm mt-2 space-y-1">
                <li>iPhone 6.7": Upload all 6 screenshots</li>
                <li>Android Phone: Upload all 6 screenshots</li>
                <li>Order matters - put Home page first, then Workout Library</li>
              </ul>
            </div>

            <div className="border-l-4 border-primary pl-4">
              <p className="font-bold">Upload App Icons</p>
              <ul className="list-disc ml-6 text-sm mt-2 space-y-1">
                <li>iOS: 1024×1024 icon</li>
                <li>Android: 512×512 icon</li>
              </ul>
            </div>

            <div className="border-l-4 border-primary pl-4">
              <p className="font-bold">Important URLs</p>
              <div className="space-y-2 mt-2">
                <p className="text-sm">Privacy Policy: <span className="font-mono text-xs">https://smartygym.com/privacy-policy</span></p>
                <p className="text-sm">Terms of Service: <span className="font-mono text-xs">https://smartygym.com/termsofservice</span></p>
                <p className="text-sm">Support URL: <span className="font-mono text-xs">https://smartygym.com/contact</span></p>
              </div>
            </div>
          </div>
        </section>

        {/* STEP 6 */}
        <section className="mb-8 page-break-avoid">
          <h2 className="text-2xl font-bold mb-4 border-b-2 border-primary pb-2">STEP 6: Create Test Account for Reviewers</h2>
          <label className="flex items-start gap-3 cursor-pointer mb-4">
            <input type="checkbox" className="mt-1 h-5 w-5 print-checkbox" />
            <span className="font-semibold">Complete this entire step</span>
          </label>

          <div className="space-y-4">
            <div className="bg-muted p-4 rounded border">
              <h3 className="font-bold mb-2">📧 Reviewer Test Account Credentials</h3>
              <p className="text-sm mb-2">Provide these credentials to Apple & Google reviewers:</p>
              <div className="space-y-2 ml-4">
                <p className="font-mono text-sm">Email: <strong>reviewer@smartygym.com</strong></p>
                <p className="font-mono text-sm">Password: <strong>ReviewPass2025!</strong></p>
                <p className="font-mono text-sm">Plan: <strong>Premium</strong></p>
              </div>
            </div>

            <div className="border-l-4 border-destructive pl-4">
              <p className="font-bold text-destructive">⚠️ CRITICAL: Run SQL Script</p>
              <p className="text-sm mt-2">You MUST run the SQL script at <code className="bg-muted px-2 py-1 rounded">scripts/create-reviewer-account.sql</code> in your Supabase dashboard to create this account and populate it with sample data.</p>
              <p className="text-sm mt-1 text-muted-foreground">Without this, reviewers won't be able to test your app properly!</p>
            </div>

            <div className="border p-4 rounded mt-4">
              <h3 className="font-bold mb-2">📝 Review Notes to Include</h3>
              <div className="bg-muted p-3 rounded text-sm font-mono">
                Test account credentials:<br/>
                Email: reviewer@smartygym.com<br/>
                Password: ReviewPass2025!<br/><br/>
                
                This account has Premium access and sample data pre-loaded.<br/><br/>
                
                Key features to test:<br/>
                1. Workout Library (/workout) - Browse 500+ workouts<br/>
                2. Training Programs (/trainingprogram) - Multi-week programs<br/>
                3. Dashboard (/dashboard) - View progress and favorites<br/>
                4. Fitness Calculators - BMR, 1RM, Macro tracking<br/><br/>
                
                All content is developed by professional coach Haris Falas.<br/>
                Payments are handled securely through Stripe.
              </div>
            </div>
          </div>
        </section>

        {/* STEP 7 */}
        <section className="mb-8 page-break-avoid">
          <h2 className="text-2xl font-bold mb-4 border-b-2 border-primary pb-2">STEP 7: Submit for Review</h2>
          <label className="flex items-start gap-3 cursor-pointer mb-4">
            <input type="checkbox" className="mt-1 h-5 w-5 print-checkbox" />
            <span className="font-semibold">Complete this entire step</span>
          </label>

          <div className="space-y-4 ml-4">
            <div className="border-l-4 border-primary pl-4">
              <p className="font-bold">Final Checks Before Submission</p>
              <ul className="list-disc ml-6 text-sm mt-2 space-y-1">
                <li>All required fields filled in AppMySite</li>
                <li>All screenshots uploaded correctly</li>
                <li>App icons uploaded (1024×1024 and 512×512)</li>
                <li>Test account created and working</li>
                <li>URLs tested (privacy policy, terms, support)</li>
                <li>App description copied correctly (no formatting errors)</li>
              </ul>
            </div>

            <div className="border-l-4 border-primary pl-4">
              <p className="font-bold">Submit via AppMySite</p>
              <ol className="list-decimal ml-6 text-sm mt-2 space-y-1">
                <li>Click "Build App" in AppMySite</li>
                <li>Wait for build to complete (can take 30-60 minutes)</li>
                <li>Download iOS .ipa file and Android .aab file</li>
                <li>Submit iOS app to App Store Connect</li>
                <li>Submit Android app to Google Play Console</li>
              </ol>
            </div>

            <div className="bg-muted p-4 rounded">
              <p className="font-bold mb-2">⏱️ Review Timeline</p>
              <ul className="text-sm space-y-1 ml-4">
                <li>• <strong>Apple:</strong> Typically 24-48 hours, can take up to 7 days</li>
                <li>• <strong>Google:</strong> Usually 1-3 days, can take up to 7 days</li>
                <li>• Check your email regularly for reviewer questions</li>
              </ul>
            </div>
          </div>
        </section>

        {/* STEP 8 */}
        <section className="mb-8 page-break-avoid">
          <h2 className="text-2xl font-bold mb-4 border-b-2 border-primary pb-2">STEP 8: After Approval</h2>
          <label className="flex items-start gap-3 cursor-pointer mb-4">
            <input type="checkbox" className="mt-1 h-5 w-5 print-checkbox" />
            <span className="font-semibold">Complete this entire step</span>
          </label>

          <div className="space-y-4 ml-4">
            <div className="border-l-4 border-primary pl-4">
              <p className="font-bold">iOS App Store</p>
              <ul className="list-disc ml-6 text-sm mt-2 space-y-1">
                <li>Set app to "Ready for Sale" in App Store Connect</li>
                <li>Verify app appears in search</li>
                <li>Test download on real device</li>
                <li>Check all features work correctly</li>
              </ul>
            </div>

            <div className="border-l-4 border-primary pl-4">
              <p className="font-bold">Google Play Store</p>
              <ul className="list-disc ml-6 text-sm mt-2 space-y-1">
                <li>Publish app to production in Play Console</li>
                <li>Verify app appears in search (can take a few hours)</li>
                <li>Test download on Android device</li>
                <li>Monitor crash reports and reviews</li>
              </ul>
            </div>

            <div className="border-l-4 border-primary pl-4">
              <p className="font-bold">Marketing & Monitoring</p>
              <ul className="list-disc ml-6 text-sm mt-2 space-y-1">
                <li>Add app store badges to your website</li>
                <li>Share launch announcement on social media</li>
                <li>Monitor app reviews daily (respond within 24 hours)</li>
                <li>Track downloads and conversion metrics</li>
                <li>Collect user feedback for future updates</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t-2 text-center text-sm text-muted-foreground page-break-avoid">
          <p className="mb-2">🎉 <strong>Congratulations on launching your app!</strong> 🎉</p>
          <p className="mb-4">For support, visit: <span className="font-mono">https://smartygym.com/contact</span></p>
          <p className="text-xs">© 2025 SmartyGym. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default AppSubmissionPrintable;
