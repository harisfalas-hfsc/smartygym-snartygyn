import { Toaster } from "@/components/ui/toaster";
import { useEffect, lazy, Suspense } from "react";
import { DeviceThemeDefault } from "./components/DeviceThemeDefault";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Helmet } from "react-helmet";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthenticatedLayout } from "./components/AuthenticatedLayout";
import { AdminRoute } from "./components/AdminRoute";
import { trackPageVisit } from "./utils/socialMediaTracking";
import { ScrollToTop } from "./components/ScrollToTop";
import { AnalyticsTracker } from "./components/AnalyticsTracker";
import { BackgroundSEO } from "./components/seo/BackgroundSEO";

import { ErrorBoundary } from "./components/ErrorBoundary";
import { useSessionExpiry } from "./hooks/useSessionExpiry";

import { AccessControlProvider } from "./contexts/AccessControlContext";
import { NavigationHistoryProvider } from "./contexts/NavigationHistoryContext";
import { Navigation } from "./components/Navigation";
import { FixedBackButton } from "./components/FixedBackButton";
import { Footer } from "./components/Footer";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { useIsMobile } from "./hooks/use-mobile";
import { useAdminRole } from "./hooks/useAdminRole";
import Index from "./pages/Index";

// Lazy-loaded routes — only the homepage (Index) is loaded eagerly.
// Everything else is downloaded on demand to keep first paint fast.
const Auth = lazy(() => import("./pages/Auth"));
const LandingRouter = lazy(() => import("./pages/LandingRouter"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const WorkoutFlow = lazy(() => import("./pages/WorkoutFlow"));
const WorkoutDetail = lazy(() => import("./pages/WorkoutDetail"));
const IndividualWorkout = lazy(() => import("./pages/IndividualWorkout"));
const WODArchive = lazy(() => import("./pages/WODArchive"));
const DailySmartyRitual = lazy(() => import("./pages/DailySmartyRitual"));
const WODCategory = lazy(() => import("./pages/WODCategory"));
const TrainingProgramFlow = lazy(() => import("./pages/TrainingProgramFlow"));
const TrainingProgramDetail = lazy(() => import("./pages/TrainingProgramDetail"));
const IndividualTrainingProgram = lazy(() => import("./pages/IndividualTrainingProgram"));
const OneRMCalculator = lazy(() => import("./pages/OneRMCalculator"));
const BMRCalculator = lazy(() => import("./pages/BMRCalculator"));
const MacroTrackingCalculator = lazy(() => import("./pages/MacroTrackingCalculator"));
const ExerciseLibrary = lazy(() => import("./pages/ExerciseLibrary"));
const CorporateAdmin = lazy(() => import("./pages/CorporateAdmin"));
const CalculatorHistory = lazy(() => import("./pages/CalculatorHistory"));
const WorkoutTimer = lazy(() => import("./pages/WorkoutTimer"));
const CalorieCounter = lazy(() => import("./pages/CalorieCounter"));
const Tools = lazy(() => import("./pages/Tools"));
const BestOnlineFitnessPlatform = lazy(() => import("./pages/BestOnlineFitnessPlatform"));
const Blog = lazy(() => import("./pages/Blog"));
const About = lazy(() => import("./pages/About"));
const FAQ = lazy(() => import("./pages/FAQ"));
const CoachProfile = lazy(() => import("./pages/CoachProfile"));
const CoachCV = lazy(() => import("./pages/CoachCV"));
const Contact = lazy(() => import("./pages/Contact"));
const AboutSmartyGym = lazy(() => import("./pages/AboutSmartyGym"));
const Shop = lazy(() => import("./pages/Shop"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const Disclaimer = lazy(() => import("./pages/Disclaimer"));
const NotFound = lazy(() => import("./pages/NotFound"));
const JoinPremium = lazy(() => import("./pages/JoinPremium"));
const SmartyCorporate = lazy(() => import("./pages/SmartyCorporate"));
const CorporateWellness = lazy(() => import("./pages/CorporateWellness"));
const WhyInvestInSmartyGym = lazy(() => import("./pages/WhyInvestInSmartyGym"));
const PremiumBenefits = lazy(() => import("./pages/PremiumBenefits"));
const SmartyPlans = lazy(() => import("./pages/SmartyPlans"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const NewsletterThankYou = lazy(() => import("./pages/NewsletterThankYou"));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe"));
const UnsubscribeHelp = lazy(() => import("./pages/UnsubscribeHelp"));
const Community = lazy(() => import("./pages/Community"));
const AdminBackoffice = lazy(() => import("./pages/AdminBackoffice"));
const ExportVideoPage = lazy(() => import("./pages/admin/ExportVideoPage"));
const SEOPreview = lazy(() => import("./pages/admin/SEOPreview"));
const ProcessLogo = lazy(() => import("./pages/ProcessLogo"));
const AppSubmission = lazy(() => import("./pages/AppSubmission"));
const AppSubmissionPrintable = lazy(() => import("./pages/AppSubmissionPrintable"));
const BrochureIndividual = lazy(() => import("./pages/BrochureIndividual"));
const BrochureCorporate = lazy(() => import("./pages/BrochureCorporate"));
const BrochureCronJobs = lazy(() => import("./pages/BrochureCronJobs"));
const TheSmartyMethod = lazy(() => import("./pages/TheSmartyMethod"));
const ArticleDetail = lazy(() =>
  import("./pages/ArticleDetail").then((m) => ({ default: m.ArticleDetail })),
);
import { AccessGate } from "./components/AccessGate";

import { PageTransition } from "./components/PageTransition";
import { LoadingBar } from "./components/LoadingBar";
import { AnnouncementManager } from "./components/announcements/AnnouncementManager";
// FreeTrialPopup intentionally disabled — replaced by SmartyCoachWelcomePopup.
// Kept dormant for easy re-enable later.
// import { FreeTrialPopup } from "./components/growth/FreeTrialPopup";
import { SmartyCoachWelcomePopup } from "./components/smarty-coach/SmartyCoachWelcomePopup";


// Redirect component for /dashboard to /userdashboard
const DashboardRedirect = () => {
  const location = useLocation();
  return <Navigate to={`/userdashboard${location.search}`} replace />;
};

const PremiumComparisonRedirect = () => (
  <>
    <Helmet>
      <title>Smarty Plans | SmartyGym</title>
      <meta name="robots" content="noindex, follow" />
      <link rel="canonical" href="https://smartygym.com/smarty-plans" />
    </Helmet>
    <Navigate to="/smarty-plans" replace />
  </>
);

const queryClient = new QueryClient();

const criticalRoutePreloaders = [
  () => import("./pages/WorkoutFlow"),
  () => import("./pages/WODCategory"),
  () => import("./pages/TrainingProgramFlow"),
  () => import("./pages/Tools"),
  () => import("./pages/ExerciseLibrary"),
];

const secondaryRoutePreloaders = [
  () => import("./pages/WorkoutDetail"),
  () => import("./pages/IndividualWorkout"),
  () => import("./pages/TrainingProgramDetail"),
  () => import("./pages/IndividualTrainingProgram"),
  () => import("./pages/OneRMCalculator"),
  () => import("./pages/BMRCalculator"),
  () => import("./pages/MacroTrackingCalculator"),
  () => import("./pages/WorkoutTimer"),
  () => import("./pages/CalorieCounter"),
  () => import("./pages/AboutSmartyGym"),
  () => import("./pages/SmartyPlans"),
];

const preloadRouteModules = () => {
  void Promise.allSettled(criticalRoutePreloaders.map((preload) => preload()));

  const idleWindow = window as Window &
    typeof globalThis & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
    };

  const preloadSecondary = () => {
    void Promise.allSettled(secondaryRoutePreloaders.map((preload) => preload()));
  };

  if (idleWindow.requestIdleCallback) {
    idleWindow.requestIdleCallback(preloadSecondary, { timeout: 2500 });
    return;
  }

  window.setTimeout(preloadSecondary, 1500);
};

const AppContent = () => {
  const { isAdmin, loading } = useAdminRole();
  const isMobile = useIsMobile();
  useSessionExpiry();

  useEffect(() => {
    // Track page visit on initial load
    trackPageVisit();

    const preloadTimer = window.setTimeout(preloadRouteModules, 150);
    return () => window.clearTimeout(preloadTimer);
  }, []);

  return (
    <>
      <LoadingBar />
      <AccessControlProvider>
        <AnnouncementManager />
        {/* <FreeTrialPopup /> */}
        <SmartyCoachWelcomePopup />
        <ScrollToTop />
        <AnalyticsTracker />
        <BackgroundSEO />
        <div
          data-app-shell
          className={`flex flex-col min-h-screen ${isMobile ? "pb-[calc(3.5rem+env(safe-area-inset-bottom,0px))]" : "pb-0"}`}
        >
          <Navigation />
          <FixedBackButton />
            <main
              id="main-content"
              className="flex-1"
              style={{
                paddingTop: 'var(--app-header-h, 100px)',
              }}
            >
            <PageTransition>
                <Suspense fallback={null}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/start" element={<LandingRouter />} />
                  <Route path="/home" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/joinpremium" element={<JoinPremium />} />
                  <Route path="/join-premium" element={<JoinPremium />} />
                  <Route path="/premiumbenefits" element={<PremiumBenefits />} />
                  <Route path="/premium-comparison" element={<PremiumComparisonRedirect />} />
                  <Route path="/premiumcomparison" element={<PremiumComparisonRedirect />} />
                  <Route path="/smarty-plans" element={<SmartyPlans />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/faq" element={<FAQ />} />
                
                <Route path="/newsletter-thank-you" element={<NewsletterThankYou />} />
                <Route path="/unsubscribe" element={<Unsubscribe />} />
                <Route path="/unsubscribe-help" element={<UnsubscribeHelp />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog.html" element={<Blog />} />
                <Route path="/coach-profile" element={<CoachProfile />} />
                <Route path="/coach-cv" element={<CoachCV />} />
                
                {/* Public workout and plan flows - anyone can browse */}
                <Route path="/workout" element={<WorkoutFlow />} />
                <Route path="/workout/wod" element={<WODCategory />} />
                <Route path="/workout/:type" element={<WorkoutDetail />} />
                <Route path="/workout/:type/:id" element={<IndividualWorkout />} />
                <Route path="/wod-archive" element={<WODArchive />} />
                <Route path="/daily-ritual" element={<DailySmartyRitual />} />
                <Route path="/trainingprogram" element={<TrainingProgramFlow />} />
                <Route path="/trainingprogram/:type" element={<TrainingProgramDetail />} />
                <Route path="/trainingprogram/:type/:id" element={<IndividualTrainingProgram />} />
                
                {/* Corporate page is public */}
                <Route path="/corporate" element={<SmartyCorporate />} />
                <Route path="/corporate-wellness" element={<CorporateWellness />} />
                <Route path="/why-smartygym" element={<Navigate to="/about-smartygym" replace />} />
                <Route path="/human-performance" element={<Navigate to="/about-smartygym" replace />} />
                <Route path="/why-invest-in-smartygym" element={<WhyInvestInSmartyGym />} />
                <Route path="/corporate-admin" element={<ProtectedRoute><CorporateAdmin /></ProtectedRoute>} />
                
                {/* Exercise library is public */}
                <Route path="/exerciselibrary" element={<ExerciseLibrary />} />
                <Route path="/blog/:slug" element={<ArticleDetail />} />
                <Route path="/blog/:slugWithExt" element={<ArticleDetail />} />
                
                {/* Public Smarty Tools - no auth required */}
                <Route path="/1rmcalculator" element={<OneRMCalculator />} />
                <Route path="/bmrcalculator" element={<BMRCalculator />} />
                <Route path="/macrocalculator" element={<MacroTrackingCalculator />} />
                <Route path="/caloriecalculator" element={<MacroTrackingCalculator />} />
                <Route path="/workouttimer" element={<WorkoutTimer />} />

                <Route element={<ProtectedRoute><AuthenticatedLayout /></ProtectedRoute>}>
                  <Route path="/userdashboard" element={<UserDashboard />} />
                  <Route path="/calculator-history" element={<CalculatorHistory />} />
                </Route>
                
                {/* Public calorie counter - no auth required */}
                <Route path="/caloriecounter" element={<CalorieCounter />} />
                
                {/* Redirect /dashboard to /userdashboard */}
                <Route path="/dashboard" element={<DashboardRedirect />} />
                
                {/* Admin Routes with Role Check */}
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminBackoffice />
                  </AdminRoute>
                } />
                <Route path="/admin/process-logo" element={
                  <AdminRoute>
                    <ProcessLogo />
                  </AdminRoute>
                } />
                <Route path="/app-submission" element={
                  <AdminRoute>
                    <AppSubmission />
                  </AdminRoute>
                } />
                <Route path="/app-submission-printable" element={
                  <AdminRoute>
                    <AppSubmissionPrintable />
                  </AdminRoute>
                } />
                <Route path="/admin/brochure-individual" element={
                  <AdminRoute>
                    <BrochureIndividual />
                  </AdminRoute>
                } />
                <Route path="/admin/brochure-corporate" element={
                  <AdminRoute>
                    <BrochureCorporate />
                  </AdminRoute>
                } />
                <Route path="/admin/brochure-cron-jobs" element={
                  <AdminRoute>
                    <BrochureCronJobs />
                  </AdminRoute>
                } />
                <Route path="/admin/export-video" element={
                  <AdminRoute>
                    <ExportVideoPage />
                  </AdminRoute>
                } />
                <Route path="/admin/seo-preview" element={
                  <AdminRoute>
                    <SEOPreview />
                  </AdminRoute>
                } />
                
                
                {/* Public routes */}
                
                <Route path="/community" element={<Community />} />
                <Route path="/about-smartygym" element={<AboutSmartyGym />} />
                <Route path="/takeatour" element={<AboutSmartyGym />} />
                <Route path="/take-a-tour" element={<AboutSmartyGym />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/termsofservice" element={<TermsOfService />} />
                <Route path="/disclaimer" element={<Disclaimer />} />
                <Route path="/tools" element={<Tools />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/best-online-fitness-platform" element={<BestOnlineFitnessPlatform />} />
                <Route path="/the-smarty-method" element={<TheSmartyMethod />} />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              </Suspense>
            </PageTransition>
          </main>
        <Footer />
        <MobileBottomNav />
      </div>
    </AccessControlProvider>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider 
      attribute="class" 
      defaultTheme="dark" 
      storageKey=""
      enableSystem={false}
    >
      <DeviceThemeDefault />
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <NavigationHistoryProvider>
            <AppContent />
          </NavigationHistoryProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
